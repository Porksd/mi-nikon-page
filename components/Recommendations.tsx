import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import AIAssistantWidget from './AIAssistantWidget';

const FEATURED_OFFERS = [
   {
      id: 1,
      name: 'Nikon Z6 III',
      price: '$2.899.990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmvPUMLSREbBVAj_Ypw0elWA4C4cPKBcCfg2HlhCwknU_A6lZ2aiHhRooFdVWQa0Yn0wBL8BLFH3_5m8ADnnkbyA5xjv5wIwJG1RUxf3kCRPlok9LWTGnMvvXFNVLvBFaS1jKcwz9Q9My0F4yrC3xKfVNzLOA76y6VQIsqg05h_HC48kPc-4cvKPmVqMF-b4uPzUmfisobOkSCWnnTZeRjOObxn78_QEcdXk7d-tnLWu7pYl6I1xzNH_M1LkFBNEJsGBpqsLVCZKg',
      link: 'https://www.nikoncenter.cl/landing/ofertas'
   },
   {
      id: 2,
      name: 'Nikkor Z 24-120mm f/4 S',
      price: '$1.099.990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkw3SQG3n21Qud73PkXrpZH90EEcOoHXf4fZqaDMq61ABq0SruvVvXSLouY97EB3ZvXee_kA0u1fsTnLbmJes5cTtZ_h0nIAXWx0P0dEmUXNL2L7RIKFTkWF1TuX3Lau_USNU6aS4VB2XexVP0bMR0rEkKsCz4curV2QnBp-cPwTbO6jd1GOrfv6vgOevZ3nFHVGu1-cka29kIZjxc3ttCq82Icz8gG2yONCtw9WikbiCfteWeIhFsW4lsDLt7vbTsUXlKQUFJM2k',
      link: 'https://www.nikoncenter.cl/landing/ofertas'
   },
   {
      id: 3,
      name: 'Nikon Z f',
      price: '$2.299.990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw1jtIaJ92Ub-UuEx9T9O-AlzHEIf1GvuC36bY5fTAyXub_KZKo12p3QH_21W7IfnSQEsOEvvRw4Kws350qWi7Pjbgksn_ujyLYxM9L1lsSk-nHrEUz5mEsQ4rzQ18lHLxC9-qVIFOOHYfY1Li1ayVdb4vPxPGAQRDzFf2qJA9CYVClJ1WM42nAYYWmGRPCotd9jmo9Vi5YkAinBiz05dn7NWXZbgDpXGT4_GjMnToIftsC91RFaIBhiAkLHHs12f43OTnr6q9LhQ',
      link: 'https://www.nikoncenter.cl/landing/ofertas'
   },
   {
      id: 4,
      name: 'Nikkor Z 180-600mm',
      price: '$1.899.990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf0PisIBJvAEtUvRU_tSaE3AHp-sZq_40QP-Bb6x2AfdPf1cH6eoJID2UMujBW7q8LFaFmqT-E4NeqXJqMVTYmE73PVSv8qk-5GmoGg_NK0FoQMdpPA8ciCCqeYiRBS55ObCJ-Z4L73MUfD1-Po8YHB_j5Vo30pUspnev3Yx8KLxE6LtTof7kmbo2v1hEYvgMJGFs_aOL6lGoWg5V46_UtQWqKeSDdRtlyJUTaew9Xc-Mi8ulOj3Uopcf1h1CeqmicryIlPP-Tr-A',
      link: 'https://www.nikoncenter.cl/landing/ofertas'
   },
   {
      id: 5,
      name: 'Nikon Z30 Kit',
      price: '$799.990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBweK7fm0rO6oLh9SodMBCe0rOiGrZoS_dh_BXKujTb3zoJuE6sYPuAmwRZMEfq82mq8JHtGPHQKSkCRclbfB4wE49sVrWGldgLQLtC6Cd8bn7dnsrp3o5LAQ36VLsgH-l0F66OzdqFK-UfZUhQ2xxqDSnTfWCKBzkiLhB3AjTGIda4g0Ehl8j4i-V7YBRx_kbrrICHVLwbrjd_yaFzLpog9J-Z7mB6zObuU2XeqLFI5T410LSrvbX6oNY8GXGaww1g3U8wwWmqJrM',
      link: 'https://www.nikoncenter.cl/landing/ofertas'
   },
   {
      id: 6,
      name: 'Binoculares Monarch M5',
      price: '$349.990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA41ACoh1gSPPMc6tIGgjc4q9xjtpMDTRB1ZkaxvdR40U1RMQnE64YIPid8cnQ76VErUExsE-cp958yU2SaX4cWZN9J_xhu-8nolzpkaiHCLJKtKN2mVVtBt5vhybNzFkJ_87w8-l4c2TYdoBOMfD78yXohL5FxJjkicqrRUpQkleAhoRzBaEuqE4AKxz0djgMCD0smAuWolNC5X6g7cAsK720GI__-29hY9-tANSfTn31td9R9eLVl92SeRkdv89WIv_HN_P8nZE8',
      link: 'https://www.nikoncenter.cl/landing/ofertas'
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
       <main className="flex-grow flex-col w-full max-w-[1040px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <div className="flex flex-col gap-4 mb-8">
             <h1 className="text-white text-5xl md:text-6xl font-serif font-medium leading-tight tracking-[-0.02em] italic">Tu selección curada</h1>
             <div className="flex items-center gap-2 text-nikon-text text-lg max-w-2xl">
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
                      <div className="w-full h-64 md:h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAkw3SQG3n21Qud73PkXrpZH90EEcOoHXf4fZqaDMq61ABq0SruvVvXSLouY97EB3ZvXee_kA0u1fsTnLbmJes5cTtZ_h0nIAXWx0P0dEmUXNL2L7RIKFTkWF1TuX3Lau_USNU6aS4VB2XexVP0bMR0rEkKsCz4curV2QnBp-cPwTbO6jd1GOrfv6vgOevZ3nFHVGu1-cka29kIZjxc3ttCq82Icz8gG2yONCtw9WikbiCfteWeIhFsW4lsDLt7vbTsUXlKQUFJM2k")'}}></div>
                   </div>
                   <div className="flex flex-1 flex-col justify-center p-6 md:p-8 gap-4">
                      <div className="flex justify-between items-start">
                         <div><span className="text-nikon-yellow text-xs font-bold tracking-widest uppercase mb-2 block">Lentes S-Line</span><h3 className="text-white text-3xl font-serif font-medium leading-tight">Nikkor Z 85mm f/1.8 S</h3></div>
                         <button className="text-nikon-text hover:text-white"><span className="material-symbols-outlined">bookmark_border</span></button>
                      </div>
                      <p className="text-nikon-text text-base leading-relaxed border-l-2 border-[#393528] pl-4">El rey del retrato para tu sistema Z. Su apertura de f/1.8 ofrece un desenfoque suave y una nitidez extrema incluso en los bordes.</p>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2 pt-4 border-t border-[#393528]">
                         <a href="https://www.nikoncenter.cl" target="_blank" rel="noreferrer" className="h-10 px-6 bg-nikon-yellow hover:bg-[#d9ad0b] text-black rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><span>Comprar en Nikon Center</span><span className="material-symbols-outlined text-[18px]">shopping_cart</span></a>
                         <button className="h-10 px-6 bg-transparent border border-[#504b3a] hover:border-white text-white rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><span className="material-symbols-outlined text-[18px]">chat</span><span>Consultar al Asistente IA</span></button>
                      </div>
                   </div>
                </div>
             </article>
             
             {/* Card 2 (Replaced Sennheiser with Nikon Z30) */}
             <article className="bg-nikon-surface rounded-xl overflow-hidden border border-[#393528] shadow-lg hover:border-[#504b3a] transition-all duration-300">
                <div className="flex flex-col md:flex-row items-stretch">
                   <div className="w-full md:w-2/5 lg:w-1/3 bg-black relative group order-1 md:order-2">
                      <div className="absolute top-3 right-3 z-10 bg-[#393528]/90 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">Vlogging</div>
                      <div className="w-full h-64 md:h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBweK7fm0rO6oLh9SodMBCe0rOiGrZoS_dh_BXKujTb3zoJuE6sYPuAmwRZMEfq82mq8JHtGPHQKSkCRclbfB4wE49sVrWGldgLQLtC6Cd8bn7dnsrp3o5LAQ36VLsgH-l0F66OzdqFK-UfZUhQ2xxqDSnTfWCKBzkiLhB3AjTGIda4g0Ehl8j4i-V7YBRx_kbrrICHVLwbrjd_yaFzLpog9J-Z7mB6zObuU2XeqLFI5T410LSrvbX6oNY8GXGaww1g3U8wwWmqJrM")'}}></div>
                   </div>
                   <div className="flex flex-1 flex-col justify-center p-6 md:p-8 gap-4 order-2 md:order-1">
                      <div className="flex justify-between items-start">
                         <div><span className="text-nikon-yellow text-xs font-bold tracking-widest uppercase mb-2 block">Cámara DX</span><h3 className="text-white text-3xl font-serif font-medium leading-tight">Nikon Z30 Kit</h3></div>
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
             <p className="text-nikon-text mb-6 font-serif text-xl italic">¿Buscas algo más específico?</p>
             
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