import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

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
  
  // New State for Advanced Features
  const [modelMode, setModelMode] = useState<'fast' | 'think'>('fast');
  const [selectedImage, setSelectedImage] = useState<{data:string, mimeType:string} | null>(null);
  
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
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add context if provided
      const promptWithContext = context 
        ? `Contexto: ${context}\n\nPregunta del usuario: ${userText}`
        : userText;

      const responseText = await sendMessageToGemini(promptWithContext, history, currentImge || undefined, modelMode);

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMsg]);
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
       {/* Header with Mode Toggle */}
       <div className="p-3 border-b border-nikon-border bg-[#221e10] flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full animate-pulse ${modelMode === 'think' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
             <h3 className="font-bold text-white text-xs tracking-wide">
                 NIKON IA ({modelMode === 'fast' ? 'RÁPIDO' : 'PENSADOR'})
             </h3>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setModelMode(prev => prev === 'fast' ? 'think' : 'fast')}
                className="text-xs px-2 py-1 rounded bg-[#393528] text-gray-300 hover:text-white border border-gray-600 transition-colors"
                title={modelMode === 'fast' ? "Activar Gemini Pro (Más inteligente)" : "Activar Gemini Flash (Más rápido)"}
             >
                {modelMode === 'fast' ? '🧠 Pensar' : '⚡ Rápido'}
             </button>
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
                         {msg.text}
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