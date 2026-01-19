import React, { useState } from 'react';
import { Tutorial } from '../types';
import { TUTORIALS_DATA } from '../utils/appData';

const CATEGORIES = ['Todos', 'Ideas e Inspiración', 'Productos e Innovación', 'Tips y Técnicas'];

const Tutorials: React.FC = () => {
   const [activeTab, setActiveTab] = useState('Todos');

   const filteredTutorials = activeTab === 'Todos'
      ? TUTORIALS_DATA
      : TUTORIALS_DATA.filter(t => t.category === activeTab);

   return (
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10">
         <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
               <h1 className="text-4xl font-black font-display text-white mb-2">Learn & Explore</h1>
               <p className="text-nikon-text max-w-xl">
                  Mejora tus habilidades con tutoriales seleccionados por expertos de Nikon Center.
               </p>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex flex-wrap gap-2 mb-8 border-b border-nikon-border pb-4">
            {CATEGORIES.map(cat => (
               <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === cat ? 'bg-nikon-yellow text-black' : 'bg-nikon-surface text-nikon-text hover:text-white'}`}
               >
                  {cat}
               </button>
            ))}
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map(tutorial => (
               <article key={tutorial.id} className="bg-nikon-surface border border-nikon-border rounded-xl overflow-hidden hover:border-nikon-yellow transition-all group flex flex-col h-full">
                  <div className="relative aspect-video overflow-hidden">
                     <img src={tutorial.thumbnail} alt={tutorial.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute top-3 left-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {tutorial.category}
                     </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                     <h3 className="text-xl font-bold text-white mb-3 leading-tight">{tutorial.title}</h3>
                     <p className="text-nikon-text text-sm mb-6 line-clamp-3 flex-1">{tutorial.summary}</p>
                     <a
                        href={tutorial.link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 border border-nikon-border rounded text-center text-sm font-bold text-white hover:bg-nikon-yellow hover:text-black hover:border-nikon-yellow transition-colors"
                     >
                        Ver Tutorial Completo
                     </a>
                  </div>
               </article>
            ))}
         </div>
      </div>
   );
};

export default Tutorials;