import React from 'react';
import { Link } from 'react-router-dom';
import AIAssistantWidget from './AIAssistantWidget';

const Benefits: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header matching other pages */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-sm font-medium">
            <span className="text-gray-400">Home</span>
            <span className="text-gray-600">/</span>
            <span className="text-white">Comunidad</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight text-white">Comunidad y Beneficios</h1>
          <p className="text-gray-400 mt-1">
             Contenido exclusivo, tutoriales y herramientas de IA para creadores.
          </p>
        </div>
        <Link to="/tutorials" className="hidden md:flex items-center gap-2 text-nikon-yellow font-bold hover:underline">
           Ver todos los tutoriales <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Panel */}
          <div className="flex-1 space-y-6">
               
               {/* Hero Card linking to Tutorials */}
               <div className="rounded-xl bg-nikon-surface border border-nikon-border overflow-hidden shadow-lg group hover:border-nikon-yellow/30 transition-all relative">
                 <div className="flex flex-col md:flex-row">
                   <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-cover bg-center relative" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA41ACoh1gSPPMc6tIGgjc4q9xjtpMDTRB1ZkaxvdR40U1RMQnE64YIPid8cnQ76VErUExsE-cp958yU2SaX4cWZN9J_xhu-8nolzpkaiHCLJKtKN2mVVtBt5vhybNzFkJ_87w8-l4c2TYdoBOMfD78yXohL5FxJjkicqrRUpQkleAhoRzBaEuqE4AKxz0djgMCD0smAuWolNC5X6g7cAsK720GI__-29hY9-tANSfTn31td9R9eLVl92SeRkdv89WIv_HN_P8nZE8")'}}></div>
                   <div className="flex-1 p-6 flex flex-col justify-center">
                     <div className="flex justify-between items-start mb-2">
                       <span className="bg-nikon-yellow/20 text-nikon-yellow text-xs font-bold px-2 py-1 rounded">DESTACADO</span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">Aprende con Nikon Center</h3>
                     <p className="text-nikon-text text-sm mb-6 line-clamp-2">Explora nuestra biblioteca de tutoriales categorizados: Ideas, Productos y Técnicas avanzadas.</p>
                     <div className="flex gap-4 mt-auto">
                       <Link to="/tutorials" className="flex-1 bg-nikon-yellow hover:bg-yellow-400 text-nikon-dark font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                         <span className="material-symbols-outlined">school</span> Ir a Tutoriales
                       </Link>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Grid Cards (Existing) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-nikon-surface rounded-xl border border-nikon-border p-4 flex flex-col gap-4 hover:border-nikon-yellow/30 transition-all">
                    <div className="flex justify-between items-start">
                       <div className="w-12 h-12 rounded-lg bg-nikon-border flex items-center justify-center text-nikon-yellow"><span className="material-symbols-outlined text-2xl">visibility</span></div>
                       <span className="bg-nikon-border text-white text-xs font-medium px-2 py-1 rounded">Artículo</span>
                    </div>
                    <div>
                       <h4 className="text-white text-lg font-bold mb-1">Dominando el Eye-AF</h4>
                       <p className="text-nikon-text text-sm">Optimiza el seguimiento de ojos para retratos y fauna en movimiento rápido.</p>
                    </div>
                    <div className="mt-auto pt-2">
                       <button className="text-sm font-bold text-nikon-yellow hover:underline">Leer más</button>
                    </div>
                 </div>
                 
                 <div className="bg-nikon-surface rounded-xl border border-nikon-border p-4 flex flex-col gap-4 hover:border-nikon-yellow/30 transition-all">
                    <div className="flex justify-between items-start">
                       <div className="w-12 h-12 rounded-lg bg-nikon-border flex items-center justify-center text-nikon-yellow"><span className="material-symbols-outlined text-2xl">lens_blur</span></div>
                       <span className="bg-nikon-border text-white text-xs font-medium px-2 py-1 rounded">Técnica</span>
                    </div>
                    <div>
                       <h4 className="text-white text-lg font-bold mb-1">Teoría de Profundidad</h4>
                       <p className="text-nikon-text text-sm">Cómo utilizar la apertura f/1.2 de tu lente 50mm para aislar sujetos artísticamente.</p>
                    </div>
                    <button className="mt-auto w-full py-2 rounded-lg border border-nikon-border text-white text-sm hover:bg-nikon-border transition-colors">Leer Artículo</button>
                 </div>
               </div>
          </div>
          
          {/* Removed AI Widget Sidebar to use Global Chat */}
      </div>
    </div>
  );
};

export default Benefits;