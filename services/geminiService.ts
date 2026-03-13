
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

export type ModelType = 'fast' | 'think';

interface ChatPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

interface ChatHistoryItem {
    role: 'user' | 'model';
    parts: ChatPart[];
}

export const sendMessageToGemini = async (
    message: string,
    history: ChatHistoryItem[],
    image?: { mimeType: string; data: string },
    modelType: ModelType = 'fast',
    systemInstructionExtra?: string
): Promise<string> => {

    if (!apiKey) {
        console.warn("API Key is missing. Check VITE_GEMINI_API_KEY");
        if (message.toLowerCase().includes('hola')) return "Hola, soy Nikon AI (Modo Demo). No tengo API Key configurada.";
        return "Modo Demo: Sin API Key.";
    }

    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // FORZAR LOG EN CONSOLA PARA VER QUÉ LLAVE SE ENVÍA
    console.log("🔥 USANDO API KEY:", apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4));

    // 1. Google Gemini FALLA (Error 400) si el historial no alterna estrictamente entre user y model, 
    // o si empieza con model. Vamos a forzar un historial limpio.
    const contents: any[] = [];
    
    // Solo incluimos el historial si es válido y alterna roles
    if (history && history.length > 0) {
        let lastRole = '';
        history.forEach(h => {
            const currentRole = h.role === 'model' ? 'model' : 'user';
            // Solo añadir si el rol es diferente al anterior (alternancia)
            if (currentRole !== lastRole && h.parts?.[0]?.text) {
                contents.push({
                    role: currentRole,
                    parts: [{ text: h.parts[0].text }]
                });
                lastRole = currentRole;
            }
        });
    }

    // Asegurarnos de que el ÚLTIMO mensaje antes del actual sea de 'model' 
    // para que el actual sea de 'user'. Si no lo es, eliminamos el último del historial.
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.pop();
    }

    // 2. Añadir el mensaje actual del usuario
    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    // 3. Si hay imagen, añadirla al ÚLTIMO mensaje (que ahora sabemos que es 'user')
    if (image && contents.length > 0) {
        contents[contents.length - 1].parts.push({
            inline_data: { mime_type: image.mimeType, data: image.data }
        } as any);
    }

    // 4. Configuración mejorada
    const baseInstruction = `Eres 'Nikon AI', el Asistente Experto oficial de Nikon Chile. 
    REGLA DE ORO DE CONVERSACIÓN: NUNCA entregues toda la información junta en el primer mensaje. Tienes prohibido dar respuestas largas. Mantenlo conversacional.
    
    FLUJO ESTRICTO A SEGUIR (Espera respuesta del usuario entre cada paso):
    1. INTRODUCCIÓN: Explica el concepto pedido en máximo 2 o 3 líneas. Nada más. Termina este mensaje ofreciendo las siguientes dos opciones textuales: "¿Te gustaría que te dé 3 consejos prácticos sobre este tema, o prefieres saber cómo aplicar estos conceptos directamente con tu cámara?". (Detente aquí y espera respuesta).
    2. INTERACCIÓN 1 (Tras elegir consejos o cámara): Entrega lo que el usuario pidió de forma breve. Al terminar, cierra con: "¿Quieres seguir aprendiendo y que te recomiende equipos complementarios que pueden ayudar a mejorar tu kit fotográfico?". (Detente y espera respuesta).
    3. INTERACCIÓN 2 (Equipos): Si dice que sí, recomiéndale equipos o accesorios relacionados al tema que estén en stock de forma natural y SUTILMENTE recomiéndale cómo una cámara de la nueva línea Mirrorless Nikon Z mejoraría aún más esta experiencia. (Espera).
    4. INTERACCIÓN 3 (Compra): Si responde bien o muestra interés, entrégale un link ficticio pero realista de compra (ej. https://store.nikoncenter.cl/productos). Si no muestra interés, pregunta de qué otra forma puedes ayudar.`;
    
    // Anexar instrucciones extra basadas en la autenticación/equipo del usuario
    const finalInstruction = systemInstructionExtra 
        ? `${baseInstruction}\n\n${systemInstructionExtra}`
        : baseInstruction;

    const body: any = {
        contents: contents,
        systemInstruction: {
            parts: [{ text: finalInstruction }]
        },
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // LOG DE DEPURACIÓN CRÍTICO PARA EL USUARIO
        if (!response.ok) {
            console.error("DEBUG - Gemini API Error Detail:", data);
            
            // Si el error es de expiración
            const errMsg = data.error?.message || "";
            if (errMsg.toLowerCase().includes("expired") || errMsg.toLowerCase().includes("api key not valid")) {
                return "La API Key de Google ha expirado o no es válida. Por favor verifica que copiaste la llave correcta de Google AI Studio (aistudio.google.com) y reemplázala en el archivo .env";
            }
            
            return `Error de Nikon AI (${response.status}): ${errMsg || 'Error desconocido'}`;
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return "Recibí tu mensaje pero no pude generar una respuesta clara.";
    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error de red al conectar con Nikon AI.";
    }
};
