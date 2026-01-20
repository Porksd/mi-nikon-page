
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
    modelType: ModelType = 'fast'
): Promise<string> => {

    if (!apiKey) {
        console.warn("API Key is missing. Check VITE_GEMINI_API_KEY");
        // Fallback for demo without key
        if (message.toLowerCase().includes('hola')) return "Hola, soy Nikon AI (Modo Demo). Para activarme completamente, configura la API Key.";
        return "Modo Demo: No puedo procesar solicitudes complejas sin API Key.";
    }

    // Model Selection
    // fast -> gemini-2.0-flash (Quick, efficient)
    // think -> gemini-2.0-pro (Reasoning, complex tasks)
    // Nombres actualizados para 2026 (Serie Gemini 2.0)
    // Usamos los alias 'latest' que están presentes en la lista de modelos permitidos
    const modelName = modelType === 'think' ? 'gemini-pro-latest' : 'gemini-flash-latest';

    // v1beta es necesario para system_instruction
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const contents = history.map(h => ({
        role: h.role,
        parts: h.parts.map(p => {
            if (p.inlineData) {
                return { inline_data: { mime_type: p.inlineData.mimeType, data: p.inlineData.data } };
            }
            return { text: p.text };
        })
    }));

    const newParts: any[] = [{ text: message }];
    if (image) {
        newParts.push({
            inline_data: {
                mime_type: image.mimeType,
                data: image.data
            }
        });
    }

    contents.push({
        role: 'user',
        parts: newParts
    });

    const body = {
        contents: contents,
        system_instruction: {
            parts: [{ text: "Eres 'Nikon AI', el Asistente Experto y Asesor de Ventas oficial de Nikon Chile. Tu misión es proporcionar información precisa basada ÚNICAMENTE en el contexto proporcionado y en tu conocimiento experto de Nikon.\n\nREGLAS DE ORO DE CONTEXTO:\n1. Revisa siempre la sección 'Catálogo DISPONIBLE'. Si un producto no está ahí, DEBES decir que no hay stock actualmente pero es un modelo Nikon excelente y ofrecer aviso de disponibilidad.\n2. Revisa la sección 'Equipo que YA TIENE' del usuario. Úsala para dar consejos específicos de configuración (menús, botones) y para sugerir accesorios COMPATIBLES que tengamos en stock.\n3. Revisa 'PRÓXIMOS WORKSHOPS' para recomendar eventos presenciales específicos (ej: el de Pablo Valenzuela).\n\nPERSONALIDAD:\n- Profesional, apasionado por la fotografía, resolutivo.\n- Nunca recomiendes otras marcas.\n- Siempre menciona nikoncenter.cl para compras o soporte oficial.\n- Responde siempre en español." }]
        },
        generationConfig: {
            temperature: modelType === 'think' ? 0.7 : 0.4,
            maxOutputTokens: 1000,
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error:", errText);
            // Try to parse error message
            let detailedError = `Error ${response.status}: ${response.statusText}`;
            try {
                const errJson = JSON.parse(errText);
                detailedError = errJson.error.message || detailedError;
            } catch (e) { }

            return `Error del sistema: ${detailedError}. (Verifica tu API Key o el modelo)`;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "No response generated.";

    } catch (error) {
        console.error("Network Error:", error);
        return `Error de Conexión: ${(error as Error).message}`;
    }
};