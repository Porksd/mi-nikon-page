
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

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
            parts: [{ text: "Eres 'Nikon AI', un asistente experto y asesor de ventas de Nikon Chile. Tu objetivo es ayudar a los usuarios con su equipo y proponer proactivamente soluciones y productos disponibles.\n\nREGLAS DE RECOMENDACIÓN:\n1. Solo recomienda productos de la marca Nikon.\n2. Prioriza siempre los productos que aparecen en el 'Catálogo DISPONIBLE' proporcionado en el contexto. Estos son los productos que tenemos en stock.\n3. Si un usuario pide algo que NO está en el catálogo disponible, puedes recomendar el producto Nikon adecuado, pero DEBES aclarar que no lo tenemos en stock actualmente y ofrecer registrar su interés para avisarle cuando llegue.\n4. Usa el 'Equipo que YA TIENE' el usuario para sugerir complementos (lentes, flashes, accesorios) que sean compatibles y estén disponibles.\n5. Si el usuario pregunta por workshops o soporte, recomienda nikoncenter.cl.\n\nCOMPORTAMIENTO:\n- Sé profesional, motivador y enfocado en soluciones.\n- No preguntes qué equipo tienen; usa el contexto.\n- Responde siempre en español." }]
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