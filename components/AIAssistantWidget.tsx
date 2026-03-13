import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FormattedResponse from './FormattedResponse';
import { trackAIQuery } from '../utils/analyticsService';

import { supabase } from '../utils/supabaseClient';

interface AIAssistantWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  initialMessage?: string;
  context?: string;
  variant?: 'floating' | 'embedded';
}

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ 
  isOpen: externalIsOpen, 
  onClose, 
  onToggle,
  initialMessage = "Hola, soy Nikon AI. ¿En qué te ayudo?",
  context = "",
  variant = 'floating'
}) => {
  // Internal state for open/close if not controlled externally
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isVisible = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: initialMessage,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{data:string, mimeType:string} | null>(null);
  
  // Enviar modo fijo "fast" ya que "think" (pro) da error 429 de límite de cuota
  const modelMode = 'fast';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }
  }, [messages, isVisible]);

  useEffect(() => {
    const handleDeepenTip = (event: any) => {
      const { message } = event.detail;
      // Forzar apertura del widget 
      if (!isVisible) {
          if (onToggle) onToggle();
          else setInternalIsOpen(true);
      }
      
      // Delay corto para asegurar que el chat se ha abierto y montado correctamente antes de enviar
      setTimeout(() => {
         sendAutomatedMessage(message);
      }, 100);
    };

    window.addEventListener('deepen-tip', handleDeepenTip);
    return () => window.removeEventListener('deepen-tip', handleDeepenTip);
  }, [isVisible, onToggle, variant]); // removimos isLoading de dependencias para evitar multi-triggers

  const checkAuthAndGearBeforeSend = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { isAuth: false, systemInstructionExtra: '' };
    }
    
    let systemInstructionExtra = '';
    try {
      const { data: userGear } = await supabase
        .from('user_equipment')
        .select('product_name')
        .eq('user_id', session.user.id);
        
      const gearList = userGear ? userGear.map((item: any) => item.product_name).filter(Boolean) : [];
      const hasGear = gearList.length > 0;
      
      if (hasGear) {
        systemInstructionExtra = `DATO DE CONTEXTO: El usuario tiene este equipo registrado en su cuenta: ${gearList.join(', ')}. OBLIGATORIO: Cuando saludes o comiences tu mensaje introductorio, debes mencionar explícitamente y de forma amigable que notas que tiene este equipo. Cuando expliques cómo aplicar los conceptos, hazlo usando funciones o botones específicos de este equipo.`;
      } else {
        systemInstructionExtra = `DATO DE CONTEXTO: El usuario no tiene equipo seleccionado actualmente. OBLIGATORIO: En tu respuesta sugiere brevemente que registre su equipo dentro de su cuenta (Mi Equipo) para que puedas darle consejos más personalizados.`;
      }
    } catch (err) {
      console.error("Error checking user gear:", err);
    }
    
    return { isAuth: true, systemInstructionExtra };
  };

  const sendAutomatedMessage = async (text: string) => {
    if (isLoading) return;
    
    // Si el chat estaba cerrado, abrirlo ya se gestionó en el listener
    // pero asegurémonos de que el estado local de mensajes incluya el nuevo
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const authStatus = await checkAuthAndGearBeforeSend();
      
      if (!authStatus.isAuth) {
        const loginMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "¡Hola! Para que tu experiencia sea mucho mejor y poder ayudarte de forma precisa, **primero debes iniciar sesión para continuar** usando el chat.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, loginMsg]);
        setIsLoading(false);
        return;
      }

      // Formatear historia para el servicio Gemini de forma ROBUSTA
      const apiHistory = messages
        .filter(m => m.id !== 'init') // Omitir el mensaje de bienvenida inicial
        .map(m => ({
          role: (m.role === 'model' ? 'model' : 'user') as 'user' | 'model',
          parts: [{ text: m.text }]
        }));

      // Add context if provided
      const promptWithContext = context 
        ? `Contexto: ${context}\n\nPregunta del usuario: ${text}`
        : text;

      // Llamar al servicio
      const response = await sendMessageToGemini(promptWithContext, apiHistory, undefined, modelMode, authStatus.systemInstructionExtra);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      trackAIQuery(text, true);
    } catch (error) {
       console.error("AI Error:", error);
       const errorMsg: ChatMessage = {
         id: 'error-' + Date.now(),
         role: 'model',
         text: "Lo siento, tuve un problema al procesar tu solicitud. Por favor, reintenta en un momento.",
         timestamp: new Date()
       };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalIsOpen(!internalIsOpen);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({
           data: base64String,
           mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
       const utterance = new SpeechSynthesisUtterance(text);
       utterance.lang = 'es-ES'; // Set Spanish
       window.speechSynthesis.speak(utterance);
    } else {
       alert("Tu navegador no soporta texto a voz.");
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const userText = inputValue;
    const currentImge = selectedImage;
    
    // Reset inputs immediately
    setInputValue('');
    setSelectedImage(null);

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    // Note: We don't display the image in chat history for this demo, 
    // but in a real app you'd want to render a preview in the message bubble.

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const authStatus = await checkAuthAndGearBeforeSend();
      
      if (!authStatus.isAuth) {
        const loginMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "¡Hola! Para que tu experiencia sea mucho mejor y poder ayudarte de forma precisa, **primero debes iniciar sesión para continuar** usando el chat.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, loginMsg]);
        setIsLoading(false);
        return;
      }

      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add context if provided
      const promptWithContext = context 
        ? `Contexto: ${context}\n\nPregunta del usuario: ${userText}`
        : userText;

      const responseText = await sendMessageToGemini(promptWithContext, history, currentImge || undefined, modelMode, authStatus.systemInstructionExtra);

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMsg]);
      
      // Track AI query
      trackAIQuery(userText, responseText.length);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Lo siento, tuve un problema al conectar con el servidor. Intenta nuevamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatContentJsx = (
    <>
       {/* Header */}
       <div className="p-3 border-b border-nikon-border bg-[#221e10] flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
             <h3 className="font-bold text-white text-xs tracking-wide">
                 NIKON IA
             </h3>
          </div>
          <div className="flex items-center gap-2">
             {onClose && (
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
             )}
          </div>
       </div>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex gap-3 max-w-[95%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'model' ? 'bg-nikon-yellow/20 border-nikon-yellow/30' : 'bg-nikon-border border-white/10'}`}>
                   <span className={`material-symbols-outlined text-sm ${msg.role === 'model' ? 'text-nikon-yellow' : 'text-white'}`}>
                      {msg.role === 'model' ? 'smart_toy' : 'person'}
                   </span>
                </div>
                <div className="flex flex-col gap-1 items-start">
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'model' ? 'bg-[#2c281b] border border-nikon-border text-[#ececec] rounded-bl-sm' : 'bg-nikon-yellow text-nikon-dark font-medium rounded-br-sm'}`}>
                         {msg.role === 'model' ? (
                           <div className="whitespace-pre-wrap">{msg.text.replace(/\*\*/g, '')}</div>
                         ) : (
                           msg.text
                         )}
                    </div>
                    {/* TTS Button for Model */}
                    {msg.role === 'model' && (
                        <button onClick={() => handleSpeech(msg.text)} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-xs text-gray-400">volume_up</span>
                        </button>
                    )}
                </div>
             </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[90%]">
               <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-nikon-yellow/20 border-nikon-yellow/30">
                  <span className="material-symbols-outlined text-sm text-nikon-yellow">smart_toy</span>
               </div>
               <div className="bg-[#2c281b] border border-nikon-border p-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input */}
       <div className="p-3 bg-nikon-surface border-t border-nikon-border">
          {/* Image Preview */}
          {selectedImage && (
             <div className="flex items-center gap-2 mb-2 p-2 bg-[#1a170e] rounded border border-nikon-border w-fit">
                 <span className="material-symbols-outlined text-nikon-yellow">image</span>
                 <span className="text-xs text-white">Imagen adjunta</span>
                 <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-white">
                     <span className="material-symbols-outlined text-sm">close</span>
                 </button>
             </div>
          )}

          <div className="relative flex items-center gap-2">
             <button 
                className={`p-2 rounded-full hover:bg-[#393528] transition-colors ${selectedImage ? 'text-nikon-yellow' : 'text-gray-400'}`}
                onClick={() => fileInputRef.current?.click()}
                title="Adjuntar imagen para análisis"
             >
                <span className="material-symbols-outlined">add_photo_alternate</span>
             </button>
             <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
             />

             <input 
                className="w-full bg-[#1a170e] text-white text-sm rounded-lg border border-nikon-border px-4 py-3 focus:outline-none focus:border-nikon-yellow focus:ring-1 focus:ring-nikon-yellow placeholder-[#5c5848]" 
                placeholder="Pregunta o describe tu imagen..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
             />
             <button onClick={handleSendMessage} disabled={isLoading || (!inputValue && !selectedImage)} className="p-3 bg-nikon-yellow text-nikon-dark rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined">send</span>
             </button>
          </div>
       </div>
    </>
  );

  if (variant === 'floating') {
    return (
      <>
        {!externalIsOpen && (
           <button 
             onClick={handleToggle}
             className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-nikon-yellow text-black rounded-full shadow-lg hover:brightness-110 transition-all flex items-center justify-center group"
           >
             <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">smart_toy</span>
           </button>
        )}
        {isVisible && (
          <div className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-[#1a170e] border border-nikon-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
             {chatContentJsx}
          </div>
        )}
      </>
    );
  }

  // Embedded Variant
  return (
    <div className="w-full h-full flex flex-col bg-[#1a170e] border border-nikon-border rounded-xl overflow-hidden">
        {chatContentJsx}
    </div>
  );
};

export default AIAssistantWidget;