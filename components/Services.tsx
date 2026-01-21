import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AIAssistantWidget from './AIAssistantWidget';

const Services: React.FC = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialMsg, setAiInitialMsg] = useState('');

  const openProductHelper = (needsCompat: boolean) => {
      const msg = needsCompat 
        ? "Necesito ayuda para buscar productos compatibles con mi equipo." 
        : "Estoy buscando productos nuevos, no necesariamente compatibles con mi equipo actual.";
      setAiInitialMsg(msg);
      setIsAIOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col">
       <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-medium text-white">Servicios</span>
          </nav>

          {/* Product Finder Helper Section */}
          <section className="bg-nikon-black rounded-lg p-8 mb-12 text-white relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-nikon-yellow/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-nikon-yellow">manage_search</span>
                     <h2 className="text-2xl font-bold">Ayuda para buscar productos y accesorios</h2>
                </div>
                <p className="text-gray-300 mb-6 max-w-2xl">
                    Utiliza nuestro asistente inteligente para encontrar exactamente lo que necesitas. Te ayudaremos a verificar compatibilidad.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => openProductHelper(true)}
                        className="bg-nikon-yellow text-black font-bold py-3 px-6 rounded hover:bg-[#ffe14f] transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">check_circle</span>
                        Buscar Compatible con mi Equipo
                    </button>
                     <button 
                        onClick={() => openProductHelper(false)}
                        className="bg-transparent border border-gray-600 text-white font-bold py-3 px-6 rounded hover:border-white transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">photo_camera</span>
                        Búsqueda General
                    </button>
                </div>
             </div>
          </section>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-nikon-yellow fill">verified</span>
                <span className="text-xs font-bold uppercase tracking-wider text-nikon-text">Servicio Oficial Certificado</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-3">Servicios Técnicos</h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">Mantén tu equipo al 100% con nuestros técnicos certificados. Garantía oficial Nikon y repuestos originales.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="group bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:shadow-lg hover:border-nikon-yellow/30 transition-all duration-300 flex flex-col h-full">
              <div className="mb-4 size-12 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-2xl">lens_blur</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Limpieza de Sensor + Chequeo</h3>
              <p className="text-sm text-gray-400 mb-6 flex-grow">Mantenimiento preventivo esencial para asegurar la máxima calidad de imagen en tus tomas.</p>
              <div className="space-y-3 mb-8">
                {['Limpieza profunda de sensor', 'Verificación de firmware', 'Limpieza exterior básica'].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-nikon-yellow text-lg pt-0.5">check_circle</span>
                    <span className="text-sm text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto border-t border-gray-800 pt-4">
                <div className="flex flex-col"><span className="text-xs text-gray-400 font-medium uppercase">Precio base</span><span className="text-2xl font-bold text-white">$25.000</span></div>
                <button className="bg-nikon-yellow hover:bg-[#dcb00b] text-black font-bold py-2 px-6 rounded-md transition-colors text-sm">Agendar</button>
              </div>
            </div>

            <div className="relative group bg-[#1a1a1a] border border-nikon-yellow rounded-lg p-6 shadow-md flex flex-col h-full">
               <div className="absolute top-0 right-0 bg-nikon-yellow text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-md">RECOMENDADO</div>
               <div className="mb-4 size-12 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-2xl">build</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mantención Completa</h3>
              <p className="text-sm text-gray-400 mb-6 flex-grow">Servicio integral para equipos profesionales. Restauramos los estándares de fábrica.</p>
              <div className="space-y-3 mb-8">
                {['Desarme y limpieza interna', 'Ajuste de sistema AF', 'Garantía de 6 meses'].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-nikon-yellow text-lg pt-0.5">check_circle</span>
                    <span className="text-sm text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto border-t border-gray-800 pt-4">
                <div className="flex flex-col"><span className="text-xs text-gray-400 font-medium uppercase">Desde</span><span className="text-2xl font-bold text-white">Cotizar</span></div>
                <button className="bg-nikon-yellow hover:bg-[#dcb00b] text-black font-bold py-2 px-6 rounded-md transition-colors text-sm">Agendar</button>
              </div>
            </div>

            <div className="group bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:shadow-lg hover:border-nikon-yellow/30 transition-all duration-300 flex flex-col h-full">
              <div className="mb-4 size-12 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-2xl">center_focus_strong</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Calibración de Lentes</h3>
              <p className="text-sm text-gray-400 mb-6 flex-grow">Asegura la nitidez perfecta. Ideal para lentes de gran apertura y teleobjetivos.</p>
              <div className="space-y-3 mb-8">
                {['Microajuste de foco', 'Pruebas de carta de resolución', 'Verificación de contactos'].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-nikon-yellow text-lg pt-0.5">check_circle</span>
                    <span className="text-sm text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto border-t border-gray-800 pt-4">
                <div className="flex flex-col"><span className="text-xs text-gray-400 font-medium uppercase">Por lente</span><span className="text-2xl font-bold text-white">$18.000</span></div>
                <button className="bg-nikon-yellow hover:bg-[#dcb00b] text-black font-bold py-2 px-6 rounded-md transition-colors text-sm">Agendar</button>
              </div>
            </div>
          </div>
       </main>

       <AIAssistantWidget 
         isOpen={isAIOpen} 
         onClose={() => setIsAIOpen(false)}
         initialMessage={aiInitialMsg}
         variant="floating"
      />
    </div>
  );
};

export default Services;