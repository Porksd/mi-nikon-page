import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import AIAssistantWidget from './AIAssistantWidget';

const FEATURED_OFFERS = [
   {
      id: 1,
      name: 'Nikon Z6 III',
      price: '$3.490.900',
      image: 'https://www.nikoncenter.cl/uploads/camaras/large/20240618-051740_1.png',
      link: 'https://www.nikoncenter.cl/camaras/mirrorless/z6-iii'
   },
   {
      id: 2,
      name: 'Nikkor Z 24-120mm f/4 S',
      price: '$1.590.900',
      image: 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-030236_1.png',
      link: 'https://www.nikoncenter.cl/lentes/reflex/nikkor-z-24-120mm-f-40-s'
   },
   {
      id: 3,
      name: 'Nikon Z f',
      price: '$3.290.900',
      image: 'https://www.nikoncenter.cl/uploads/camaras/large/20230922-040634_1.png',
      link: 'https://www.nikoncenter.cl/camaras/mirrorless/zf'
   },
   {
      id: 4,
      name: 'Nikkor Z 180-600mm',
      price: '$2.790.900',
      image: 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-032013_1.png',
      link: 'https://www.nikoncenter.cl/lentes/reflex/nikkor-z-180-600mm-f-56-63-vr'
   },
   {
      id: 5,
      name: 'Nikon Z30 Kit',
      price: '$879.900',
      image: 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-105600_1.png',
      link: 'https://www.nikoncenter.cl/camaras/mirrorless/z30'
   },
   {
      id: 6,
      name: 'Nikon Z50 II Kit',
      price: '$1.560.700',
      image: 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png',
      link: 'https://www.nikoncenter.cl/camaras/mirrorless/z50-ii'
   }
];

const Recommendations: React.FC = () => {
   const carouselRef = useRef<HTMLDivElement>(null);

   const scrollLeft = () => {
      carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
   };

   const scrollRight = () => {
      carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
   };

  return (
    <div className="bg-nikon-black text-white flex-1 flex flex-col overflow-x-hidden font-sans relative">
       <main className="flex-grow flex-col w-full max-w-[1200px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <div className="flex flex-col gap-4 mb-8">
             <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight tracking-tighter ">Seleccionados para ti</h1>
             <div className="flex items-center gap-2 text-gray-400 text-lg max-w-2xl">
                <span className="material-symbols-outlined text-nikon-yellow text-xl">auto_awesome</span>
                <p>Basado en tu <span className="text-white font-medium">Equipo Registrado</span>. Productos oficiales de <a href="https://www.nikoncenter.cl" target="_blank" rel="noreferrer" className="text-nikon-yellow hover:underline">Nikon Center Chile</a>.</p>
             </div>
          </div>
          
          <div className="flex gap-3 pb-8 overflow-x-auto">
             <button className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-nikon-yellow text-nikon-black transition-transform hover:scale-105"><span className="text-sm font-bold">Para ti</span></button>
             {['Lentes', 'Cuerpos', 'Accesorios', 'Iluminación'].map((tab, i) => (
                <button key={i} className="flex h-9 shrink-0 items-center justify-center px-5 rounded-full bg-nikon-surface border border-[#393528] text-white hover:bg-[#393528] transition-colors"><span className="text-sm font-medium">{tab}</span></button>
             ))}
          </div>

          <div className="flex flex-col gap-6">
             {/* Card 1 */}
             <article className="bg-nikon-surface rounded-xl overflow-hidden border border-[#393528] shadow-lg hover:border-[#504b3a] transition-all duration-300">
                <div className="flex flex-col md:flex-row items-stretch">
                   <div className="w-full md:w-2/5 lg:w-1/3 bg-black relative group">
                      <div className="absolute top-3 left-3 z-10 bg-nikon-yellow/90 text-nikon-dark text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Recomendado</div>
                      <div className="w-full h-64 md:h-full bg-center bg-no-repeat bg-contain transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: 'url("https://www.nikoncenter.cl/uploads/objetivos/large/20250508-095429_1.png")'}}></div>
                   </div>
                   <div className="flex flex-1 flex-col justify-center p-6 md:p-8 gap-4">
                      <div className="flex justify-between items-start">
                         <div><span className="text-nikon-yellow text-xs font-bold tracking-widest uppercase mb-2 block">Lentes S-Line</span><h3 className="text-white text-3xl font-bold font-sans leading-tight">Nikkor Z 85mm f/1.8 S</h3></div>
                         <button className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">bookmark_border</span></button>
                      </div>
                      <p className="text-gray-300 text-base leading-relaxed border-l-2 border-nikon-yellow pl-4">El rey del retrato para tu sistema Z. Su apertura de f/1.8 ofrece un desenfoque suave y una nitidez extrema incluso en los bordes.</p>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2 pt-4 border-t border-gray-800">
                         <a href="https://www.nikoncenter.cl" target="_blank" rel="noreferrer" className="h-10 px-6 bg-nikon-yellow hover:bg-[#d9ad0b] text-black rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><span>Comprar en Nikon Center</span><span className="material-symbols-outlined text-[18px]">shopping_cart</span></a>
                         <button className="h-10 px-6 bg-transparent border border-gray-600 hover:border-white text-white rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><span className="material-symbols-outlined text-[18px]">chat</span><span>Consultar al Asistente IA</span></button>
                      </div>
                   </div>
                </div>
             </article>
             
             {/* Card 2 (Replaced Sennheiser with Nikon Z30) */}
             <article className="bg-nikon-surface rounded-xl overflow-hidden border border-[#393528] shadow-lg hover:border-[#504b3a] transition-all duration-300">
                <div className="flex flex-col md:flex-row items-stretch">
                   <div className="w-full md:w-2/5 lg:w-1/3 bg-black relative group order-1 md:order-2">
                      <div className="absolute top-3 right-3 z-10 bg-[#393528]/90 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">Vlogging</div>
                      <div className="w-full h-64 md:h-full bg-center bg-no-repeat bg-contain transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: 'url("https://www.nikoncenter.cl/uploads/camaras/large/20241121-105600_1.png")'}}></div>
                   </div>
                   <div className="flex flex-1 flex-col justify-center p-6 md:p-8 gap-4 order-2 md:order-1">
                      <div className="flex justify-between items-start">
                         <div><span className="text-nikon-yellow text-xs font-bold tracking-widest uppercase mb-2 block">Cámara DX</span><h3 className="text-white text-3xl font-sans font-medium leading-tight">Nikon Z30 Kit</h3></div>
                         <button className="text-nikon-text hover:text-white"><span className="material-symbols-outlined">bookmark_border</span></button>
                      </div>
                      <p className="text-nikon-text text-base leading-relaxed border-l-2 border-[#393528] pl-4">La cámara mirrorless DX compacta y ligera, optimizada para creadores de contenido, vloggers y streamers. Video 4K sin recorte.</p>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2 pt-4 border-t border-[#393528]">
                         <a href="https://www.nikoncenter.cl" target="_blank" rel="noreferrer" className="h-10 px-6 bg-nikon-yellow hover:bg-[#d9ad0b] text-black rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><span>Comprar en Nikon Center</span><span className="material-symbols-outlined text-[18px]">shopping_cart</span></a>
                         <button className="h-10 px-6 bg-transparent border border-[#504b3a] hover:border-white text-white rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><span className="material-symbols-outlined text-[18px]">chat</span><span>Consultar al Asistente IA</span></button>
                      </div>
                   </div>
                </div>
             </article>
          </div>
          
          <div className="mt-12 py-8 border-t border-[#393528] flex flex-col items-center text-center">
             <p className="text-nikon-text mb-6 font-sans text-xl ">¿Buscas algo más específico?</p>
             
             {/* Featured Products Carousel */}
             <div className="w-full relative mb-8">
               <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-white font-bold text-lg">Productos destacados de esta semana</h3>
                  <div className="flex gap-2">
                     <button onClick={scrollLeft} className="w-8 h-8 rounded-full border border-nikon-border flex items-center justify-center hover:bg-white hover:text-black transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                     <button onClick={scrollRight} className="w-8 h-8 rounded-full border border-nikon-border flex items-center justify-center hover:bg-white hover:text-black transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                  </div>
               </div>
               
               <div 
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-4" 
                  style={{scrollBehavior: 'smooth', scrollbarWidth: 'none'}}
               >
                  {FEATURED_OFFERS.map((product) => (
                     <a 
                        key={product.id}
                        href={product.link}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-[280px] w-[calc(33.333%-11px)] snap-start bg-nikon-surface border border-nikon-border rounded-xl p-4 flex flex-col hover:border-nikon-yellow transition-all group"
                     >
                        <div className="w-full aspect-square bg-black rounded-lg mb-3 overflow-hidden relative">
                           <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">OFERTA</div>
                           <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h4 className="text-white font-bold text-base mb-1 line-clamp-1">{product.name}</h4>
                        <p className="text-nikon-yellow font-bold text-lg">{product.price}</p>
                        <div className="mt-3 w-full py-2 bg-white/5 text-white text-xs font-bold uppercase rounded text-center group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                           Ver Oferta
                        </div>
                     </a>
                  ))}
               </div>
             </div>

             <a href="https://www.nikoncenter.cl" target="_blank" rel="noreferrer" className="text-nikon-yellow hover:text-white transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-widest"><span>Ver catálogo completo</span><span className="material-symbols-outlined">arrow_forward</span></a>
          </div>
       </main>

       <AIAssistantWidget 
          context="El usuario está viendo ofertas y recomendaciones de productos. Ayúdalo a decidir qué lente o cámara comprar según sus necesidades. Usa la información de productos de Nikon Center."
          initialMessage="Hola, veo que estás interesado en mejorar tu equipo. ¿Te puedo ayudar a elegir el lente o cámara perfecto para ti?"
       />
    </div>
  );
};

export default Recommendations;
