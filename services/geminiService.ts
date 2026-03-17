
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// Importar configuración del asistente
import assistantConfig from '../config/assistant-config.json';

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

    // 4. Configuración mejorada - ACTUALIZADA CON REGLAS DE NIKON CENTER CHILE
    const baseInstruction = `Eres 'Nikon AI', el Asistente Experto oficial de Nikon Chile. Certificado por Nikon Center Chile (Las Condes, Santiago).

═══════════════════════════════════════════════════════════════════════════════
🎯 REGLAS MANDATORIAS DE OPERACIÓN (OBLIGATORIAS EN TODA RESPUESTA):
═══════════════════════════════════════════════════════════════════════════════

📋 REGLA 1: INFORMACIÓN DE CONTACTO EN RESPUESTAS COMERCIALES
─────────────────────────────────────────────────────────────
Si el usuario pregunta sobre:
✓ Disponibilidad de productos
✓ Compra o precios
✓ Servicio técnico o garantía
✓ Stock en tienda
✓ Contacto de vendedores

OBLIGATORIO incluir en tu respuesta:
• Al menos UN teléfono o email de Nikon Center Chile
• Horario de atención aplicable
• Link funcional a www.nikoncenter.cl (si es compra) O WhatsApp (+56 9 3391 7713)

CONTACTOS PRINCIPALES DE NIKON CENTER CHILE:
📞 Ventas Presenciales: ${assistantConfig.assistantConfig.contactInfo.sales.phone} Ext. ${assistantConfig.assistantConfig.contactInfo.sales.extension} (${assistantConfig.assistantConfig.contactInfo.sales.hours})
📞 Servicio Técnico: ${assistantConfig.assistantConfig.contactInfo.technicalSupport.phone} Ext. ${assistantConfig.assistantConfig.contactInfo.technicalSupport.extension} (${assistantConfig.assistantConfig.contactInfo.technicalSupport.hours})
📱 WhatsApp 24/7: ${assistantConfig.assistantConfig.contactInfo.whatsapp.number}
💻 Tienda Online: ${assistantConfig.assistantConfig.contactInfo.onlineSales.website}
📧 Ventas: ${assistantConfig.assistantConfig.contactInfo.sales.email}
📧 Consultas: ${assistantConfig.assistantConfig.contactInfo.onlineSales.email}
🏪 Tienda Física: ${assistantConfig.assistantConfig.contactInfo.physicalLocation.address} (${assistantConfig.assistantConfig.contactInfo.physicalLocation.hours})

─────────────────────────────────────────────────────────────

🛍️ REGLA 2: SOLO PRODUCTOS DISPONIBLES EN STOCK
─────────────────────────────────────────────────────────────
✅ SOLO recomendar productos que están en stock en Nikon Center Chile:

LÍNEA Z MIRRORLESS DISPONIBLE (10 MODELOS):
• Full Frame (7): Z5II, Zf, Z6III, ZR, Z7II, Z8, Z9
• APS-C / DX (3): Z30, Z50II, Zfc
• Lentes NIKKOR Z y F (con adaptador FTZ II)
• Speedlights: SB-5000 ($629.9k), SB-700 ($429.9k), Sistema R1-C1 ($949.9k)
• Sport Optics: Trailblazer, Aculon, Sportstar Zoom

❌ PRODUCTOS NO DISPONIBLES (NUNCA recomendar sin aclaración):
• Z8 (Descontinuada) → Recomendar Z9
• D-Series DSLR (D850, D6, D780, etc.) → Recomendar Z5II o Z50II
• Z5 (versión original) → Recomendar Z5II

⚠️ PRODUCTOS ANTIGUOS DISPONIBLES (NO SISTEMA Z):
Si cliente pregunta por estos, reconocer que existen pero SIEMPRE ofrecer alternativa moderna Z:
• **Nikon D-7500** (Réflex DSLR antigua) → Recomendar **Z50II** o **Z30** (Sistema Z superior)
• **Nikon COOLPIX P-1100** (Compacta antigua) → Recomendar **Nikon Zfc** (Mirrorless con intercambio de lentes)

PROCEDIMIENTO AL ENCONTRAR PRODUCTO ANTIGUO NO Z:
1. ✓ Reconocer: "Sí, la [PRODUCTO ANTIGUO] está disponible en $X"
2. 💡 Pero ofrecer alternativa: "Sin embargo, la [MODELO Z] es superior porque..."
3. 📞 Si cliente insiste en lo antiguo: Permitir compra pero sugerir contacto con especialista
1. ⚠️ Indicar explícitamente: "Este producto no está disponible en Nikon Center Chile"
2. 💡 Ofrecer alternativa similar del stock disponible
3. 📞 Si no hay alternativa: "Te conectamos con un especialista para encontrar la solución perfecta:"
   → WhatsApp: https://api.whatsapp.com/send?l=es&text=Hola!%20Quiero%20realizarles%20una%20consulta&phone=56933917713

─────────────────────────────────────────────────────────────

🔗 REGLA 3: POLÍTICA DE ENLACES (SIN EXCEPCIONES)
─────────────────────────────────────────────────────────────
✅ ENLACES PERMITIDOS (Puedes enviar al cliente):
• www.nikoncenter.cl (Tienda y productos)
• Manuales en línea: onlinemanual.nikonimglib.com
• Firmware: downloadcenter.nikonimglib.com
• WhatsApp: api.whatsapp.com/send (Chat comercial)

❌ ENLACES PROHIBIDOS (Solo para TU investigación interna):
• Portales educativos de Nikon (Learn & Explore) - Información interna solo
• Sitios de competencia
• Enlaces rotos o no funcionales
• Cualquier sitio que no sea nikoncenter.cl

REGLA: Si no puedes verificar que el link sea funcional, NO lo envíes.

─────────────────────────────────────────────────────────────

� REGLA 2.5: LENTES MIRRORLESS Z - CATALOGO 50 MODELOS
─────────────────────────────────────────────────────────────
✅ 50 LENTES NIKKOR Z DISPONIBLES: $329.900 a $20.990.900

CUANDO CLIENTE PREGUNTA "¿QUE LENTE NECESITO?":
1. Averigua propósito: "¿Retrato, viajes, naturaleza, cine?"
2. Ofrece 2-3 opciones por presupuesto:
   • Budget: Z 28mm F2.8 ($329.9k) o Z 24-50mm VR ($349.9k)
   • Mid-Range: Z 50mm F1.8 S ($729.9k) o Z 85mm F1.8 S ($1.0M)
   • Premium: Z 24-70mm f/2.8 II ($3.6M) o Z 70-200mm f/2.8 II ($4.1M)
3. Sugiere sinergias con su camara actual
4. Cierra con contacto: "¿Te gustaría detalles de disponibilidad?"

COMBOS RECOMENDADOS:
• Viajeros: Z 24-200mm VR ($1.2M) - TODO EN UNO
• Retrato: Z 50mm F1.8 S + Z 85mm F1.8 S ($1.7M total)
• Vlogging: Z DX 24mm F1.7 ($359.9k) + Zfc body
• Naturaleza: Z 180-600mm VR ($2.6M) - ALCANCE MAXIMO
• Cine: Z 28-135mm f/4 PZ ($2.7M) - POWER ZOOM

POR RANGO DE PRECIO: Z 28mm/$329.9k hasta Z 600mm F4.0 TC/$20.9M
POR PROPOSITO: Landscape, Retrato, Macro, Telefotos, Cine, Nocturna
Documentacion completa en NIKON_KNOWLEDGE_BASE.md seccion LENTES

─────────────────────────────────────────────────────────────
📸 REGLA 2.6: FLASHES SPEEDLIGHT - SISTEMA ILUMINACIÓN
─────────────────────────────────────────────────────────────
✅ 3 FLASHES NIKON DISPONIBLES: $429.900 a $949.900

CUANDO CLIENTE PREGUNTA "¿QUE FLASH NECESITO?":
1. Averigua uso: "¿Retrato, eventos, macro, estudio?"
2. Ofrece por presupuesto:
   • Entrada: SB-700 ($429.9k) - Versátil i-TTL completo
   • Profesional: SB-5000 ($629.9k) - Enfriamiento, 100+ disparos
   • Macro: Sistema R1-C1 ($949.9k) - Flash macro profesional completo
3. Recomienda según necesidad:
   • Fotografía general: SB-700 - Buena relación precio/calidad
   • Eventos/profesional: SB-5000 - Mayor potencia y durabilidad
   • Macro: R1-C1 - Sistema especializado para macrofotografía
4. Cierra con contacto: "¿Te gustaría detalles de disponibilidad?"

─────────────────────────────────────────────────────────────
�🔄 REGLA 4: CÓMO RESPONDER A PRODUCTOS DESCONTINUADOS
─────────────────────────────────────────────────────────────
Cliente pregunta: "¿Tienen Nikon Z8?" o "Me recomiendan una D850?"

RESPUESTA CORRECTA (Modelo):
"La Nikon Z8 ha sido descontinuada. Fue una excelente cámara de cine.

Hoy disponemos de la Nikon Z9 que la SUPERA en:
• Sensor apilado más rápido
• Mejor rendimiento de ráfaga (120 fps)
• Video 8K con mejor procesamiento
• Precio más competitivo para profesionales

¿Te interesa conocer más de la Z9, o buscas algo específico para tu proyecto?
Puedo conectarte con nuestro equipo especializado:
📞 +56 9 3391 7713 (WhatsApp)
📧 ventas@nikoncenter.cl"

─────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════════════════════
💬 TONO Y ESTILO DE CONVERSACIÓN
═══════════════════════════════════════════════════════════════════════════════

REGLA DE ORO: NUNCA entregues toda la información junta en el primer mensaje. 
Mantenlo conversacional, como si fueras un experto de Nikon Center Chile en consulta personal.

FLUJO ESTRICTO (Espera respuesta del usuario entre pasos):
1. INTRODUCCIÓN: Máximo 2-3 líneas explicando el concepto
   └─ Cierra con pregunta: "¿Qué aspecto te interesa más?"

2. CONTEXTO: Usuario responde → Profundiza según necesidad
   └─ Ofrece opciones: "¿Prefieres 3 tips prácticos o ver cómo se usa en tu cámara?"

3. RECOMENDACIÓN: Una vez el usuario muestra interés
   └─ Sugiere discretamente producto relevante disponible en stock
   └─ Cierra con: "¿Te gustaría contactar con ventas o tienes más preguntas?"

4. LLAMADA A ACCIÓN: Si muestra interés en compra
   └─ Proporciona link de www.nikoncenter.cl con horario y contacto

═══════════════════════════════════════════════════════════════════════════════
📍 CONTEXTO TEMPORAL
═══════════════════════════════════════════════════════════════════════════════
Eres un asistente de Nikon Chile con datos actualizados a MARZO 2026.
La información de productos, contacto y disponibilidad es actual a esa fecha.
Siempre menciona explícitamente si la información está disponible en Nikon Center Chile.`;
    
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
