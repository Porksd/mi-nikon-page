import React from 'react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  return (
    <div className="bg-[#f8f8f5] text-nikon-black font-display antialiased flex-1 flex flex-col">
       <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-nikon-text mb-8">
            <Link to="/" className="hover:text-nikon-yellow transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-medium text-nikon-black">Servicios</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-nikon-yellow fill">verified</span>
                <span className="text-xs font-bold uppercase tracking-wider text-nikon-text">Servicio Oficial Certificado</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-nikon-black mb-3">Servicios Técnicos</h2>
              <p className="text-lg text-nikon-text leading-relaxed max-w-xl">Mantén tu equipo al 100% con nuestros técnicos certificados. Garantía oficial Nikon y repuestos originales.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="group bg-white border border-[#e6e4db] rounded-lg p-6 hover:shadow-lg hover:border-nikon-yellow/30 transition-all duration-300 flex flex-col h-full">
              <div className="mb-4 size-12 bg-[#f8f8f5] rounded-full flex items-center justify-center text-nikon-black group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-2xl">lens_blur</span>
              </div>
              <h3 className="text-xl font-bold text-nikon-black mb-2">Limpieza de Sensor + Chequeo</h3>
              <p className="text-sm text-nikon-text mb-6 flex-grow">Mantenimiento preventivo esencial para asegurar la máxima calidad de imagen en tus tomas.</p>
              <div className="space-y-3 mb-8">
                {['Limpieza profunda de sensor', 'Verificación de firmware', 'Limpieza exterior básica'].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-nikon-yellow text-lg pt-0.5">check_circle</span>
                    <span className="text-sm text-nikon-black font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto border-t border-gray-100 pt-4">
                <div className="flex flex-col"><span className="text-xs text-nikon-text font-medium uppercase">Precio base</span><span className="text-2xl font-bold text-nikon-black">$25.000</span></div>
                <button className="bg-nikon-yellow hover:bg-[#dcb00b] text-black font-bold py-2 px-6 rounded-md transition-colors text-sm">Agendar</button>
              </div>
            </div>

            <div className="relative group bg-white border border-nikon-yellow rounded-lg p-6 shadow-md flex flex-col h-full">
               <div className="absolute top-0 right-0 bg-nikon-yellow text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-md">RECOMENDADO</div>
               <div className="mb-4 size-12 bg-[#f8f8f5] rounded-full flex items-center justify-center text-nikon-black group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-2xl">build</span>
              </div>
              <h3 className="text-xl font-bold text-nikon-black mb-2">Mantención Completa</h3>
              <p className="text-sm text-nikon-text mb-6 flex-grow">Servicio integral para equipos profesionales. Restauramos los estándares de fábrica.</p>
              <div className="space-y-3 mb-8">
                {['Desarme y limpieza interna', 'Ajuste de sistema AF', 'Garantía de 6 meses'].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-nikon-yellow text-lg pt-0.5">check_circle</span>
                    <span className="text-sm text-nikon-black font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto border-t border-gray-100 pt-4">
                <div className="flex flex-col"><span className="text-xs text-nikon-text font-medium uppercase">Desde</span><span className="text-2xl font-bold text-nikon-black">Cotizar</span></div>
                <button className="bg-nikon-yellow hover:bg-[#dcb00b] text-black font-bold py-2 px-6 rounded-md transition-colors text-sm">Agendar</button>
              </div>
            </div>

            <div className="group bg-white border border-[#e6e4db] rounded-lg p-6 hover:shadow-lg hover:border-nikon-yellow/30 transition-all duration-300 flex flex-col h-full">
              <div className="mb-4 size-12 bg-[#f8f8f5] rounded-full flex items-center justify-center text-nikon-black group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-2xl">center_focus_strong</span>
              </div>
              <h3 className="text-xl font-bold text-nikon-black mb-2">Calibración de Lentes</h3>
              <p className="text-sm text-nikon-text mb-6 flex-grow">Asegura la nitidez perfecta. Ideal para lentes de gran apertura y teleobjetivos.</p>
              <div className="space-y-3 mb-8">
                {['Microajuste de foco', 'Pruebas de carta de resolución', 'Verificación de contactos'].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-nikon-yellow text-lg pt-0.5">check_circle</span>
                    <span className="text-sm text-nikon-black font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto border-t border-gray-100 pt-4">
                <div className="flex flex-col"><span className="text-xs text-nikon-text font-medium uppercase">Por lente</span><span className="text-2xl font-bold text-nikon-black">$18.000</span></div>
                <button className="bg-nikon-yellow hover:bg-[#dcb00b] text-black font-bold py-2 px-6 rounded-md transition-colors text-sm">Agendar</button>
              </div>
            </div>
          </div>
       </main>
    </div>
  );
};

export default Services;