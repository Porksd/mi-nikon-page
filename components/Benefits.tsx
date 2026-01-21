import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { RESOURCES_DB } from '../data/resources';
import { Loader2, Camera, Zap, Aperture, Image as ImageIcon, CheckCircle2, CircleDollarSign, Wrench } from 'lucide-react';
import AIAssistantWidget from './AIAssistantWidget';

interface Resource {
    type: string;
    icon?: string;
    category?: string;
    keywords: string[];
    title: string;
    description: string;
    url: string;
    image: string;
}

// Sample Data for "Productos Recomendados" (Mirrors Recommendations.tsx logic)
const FEATURED_PRODUCTS = [
   {
      id: 1,
      name: 'Nikkor Z 24-120mm f/4 S',
      category: 'Lente',
      price: '$1.099.990',
      image: 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-030236_1.png',
      url: 'https://www.nikoncenter.cl/lentes/reflex/nikkor-z-24-120mm-f-40-s'
   },
   {
      id: 2,
      name: 'Nikon Z8',
      category: 'Cámara',
      price: '$3.599.990',
      image: 'https://www.nikoncenter.cl/uploads/camaras/large/20230511-014029_1.png',
      url: 'https://www.nikoncenter.cl/camaras/mirrorless/z8'
   },
   {
      id: 3,
      name: 'Flash SB-5000',
      category: 'Iluminación',
      price: '$549.990',
      image: 'https://www.nikoncenter.cl/uploads/flashes/large/20180427-074252.png',
      url: 'https://www.nikoncenter.cl/flashes/flash-sb-5000'
   }
];

const Benefits: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userGear, setUserGear] = useState<any[]>([]);
  // Use a ref to hold the full list of resources after filtering by gear initially
  const [matchingResources, setMatchingResources] = useState<Resource[]>([]);
  const [displayedResources, setDisplayedResources] = useState<Resource[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);

  // AI Assistant State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialMsg, setAiInitialMsg] = useState('');
  const [aiContext, setAiContext] = useState('');

  const openAI = (msg: string, context: string = '') => {
      setAiInitialMsg(msg);
      setAiContext(context);
      setIsAIOpen(true);
  };

  useEffect(() => {
    fetchUserGearAndResources();
  }, []);

  // Icon mapping helper
  interface Resource {
    type: string;
    icon?: string;
    category?: string;
    keywords: string[];
    title: string;
    description: string;
    url: string;
    image: string;
  } 

  const renderIcon = (resource: Resource) => {
      // First try based on explicit icon name
      if (resource.icon) {
        switch (resource.icon) {
            case 'Camera': return <Camera className="w-5 h-5" />;
            case 'Zap': return <Zap className="w-5 h-5" />;
            case 'Aperture': return <Aperture className="w-5 h-5" />;
        }
      }
      // Fallback based on type
      switch (resource.type) {
          case 'camera': return <Camera className="w-5 h-5" />;
          case 'lens': return <Aperture className="w-5 h-5" />;
          case 'flash': return <Zap className="w-5 h-5" />;
          default: return <ImageIcon className="w-5 h-5" />;
      }
  };

  const fetchUserGearAndResources = async () => {
    try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            setLoading(false);
            return;
        }

        // 1. Fetch User Products (using same logic as Gear.tsx to include email matches)
        const { data: products, error } = await supabase
            .from('user_products')
            .select(`
                id,
                product:products (
                    name,
                    category
                )
            `)
            .or(`user_id.eq.${session.user.id},customer_email.eq.${session.user.email}`);

        if (error) throw error;
        
        const gear = products?.map((p: any) => {
             const prod = Array.isArray(p.product) ? p.product[0] : p.product;
             return {
                name: prod?.name || '',
                category: prod?.category || ''
             };
        }) || [];
        
        setUserGear(gear);

        // 2. Filter Resources based on Gear
        const relevantResources: Resource[] = [];
        const addedTitles = new Set();
        
        // Initial Fetch: Get ALL resources that are from nikoncenter.cl (or relax if needed)
        // AND match the user gear types.
        
        // Let's populate 'matchingResources' with everything initially relevant
        // The user says "En Mi espacio creativo... ahora sólo aparecen los filtros, pero ningún tutorial/articulo."
        // This implies my previous logic was too strict or the 'nikoncenter.cl' filter killed everything.
        // Let's relax the domain filter for now OR check if the data actually has those URLs.
        // Looking at data/resources.ts, most are 'nikonamericalatina.com'. user specified "sólo desde Learn & Explore Chile".
        // If data is from .com, I should probably ALLOW them if they are the only ones, OR filtering strictly leads to empty.
        // User said: "Tutoriales personalizados sólo desde Learn & Explore Chile con filtros".
        // Assuming 'nikonamericalatina.com' IS what they mean by Learn & Explore (as it's often shared), 
        // OR I need to look for 'nikoncenter.cl' specifically. 
        // Let's include both for now to ensure content appears, but prioritize local.
        
        gear.forEach(item => {
             // ... logic ...
             RESOURCES_DB.forEach(resource => {
                 // ... matching logic ...
                 // Copy existing logic but fix the push
                 const itemCategoryLower = item.category?.toLowerCase() || '';
                 const itemNameLower = item.name.toLowerCase();
                 
                 const matchesType = 
                    (itemCategoryLower.includes('cámara') || itemCategoryLower.includes('body') || itemCategoryLower.includes('kit')) ? resource.type === 'camera' :
                    (itemCategoryLower.includes('lente') || itemCategoryLower.includes('objetivo')) ? resource.type === 'lens' :
                    (itemCategoryLower.includes('flash') || itemCategoryLower.includes('speedlight')) ? resource.type === 'flash' : true;
                
                 if (!matchesType) return;
                 
                 const matchesKeyword = resource.keywords.some(k => itemNameLower.includes(k));
                 const isMirrorless = itemNameLower.includes('z') && !itemNameLower.includes('zoom');
                 const isDSLR = itemNameLower.startsWith('d') && !isNaN(parseInt(itemNameLower.substring(1,2)));
                 const matchesCategory = (resource.category === 'mirrorless' && isMirrorless) || (resource.category === 'dslr' && isDSLR);
                 const matchesGenericLens = resource.type === 'lens' && (itemCategoryLower.includes('lente') || itemCategoryLower.includes('objetivo'));

                 if (matchesKeyword || matchesCategory || matchesGenericLens) {
                     if (!resource.url.includes('nikoncenter.cl')) return;
                     if (!addedTitles.has(resource.title)) {
                         relevantResources.push(resource);
                         addedTitles.add(resource.title);
                     }
                 }
             });
        });

        if (relevantResources.length === 0 && gear.length === 0) {
             // Fallback
             setMatchingResources(RESOURCES_DB);
             setDisplayedResources(RESOURCES_DB);
        } else {
            setMatchingResources(relevantResources);
            setDisplayedResources(relevantResources);
        }

    } catch (error) {
        console.error("Error loading benefits:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleFilter = (category: string | null) => {
      setActiveFilter(category);
      setVisibleCount(3);
      if (!category) {
          setDisplayedResources(matchingResources);
          return;
      }

      // Filter based on the selected category chip
      const filtered = matchingResources.filter(resource => {
          if (category === 'Cámaras ZSeries' || category === 'Cámaras Réflex') return resource.type === 'camera';
          if (category === 'Lentes') return resource.type === 'lens';
          if (category === 'Flash') return resource.type === 'flash';
          return true;
      });
      setDisplayedResources(filtered);
  };
    
  // Helper to extract unique main gear names for chips
    const mainGearNames = ['Cámaras ZSeries', 'Cámaras Réflex', 'Lentes', 'Flash'];

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-sm font-medium">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">Comunidad y Beneficios</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight text-white">Tu Espacio Creativo</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
             Recursos seleccionados específicamente para tu equipo Nikon. Saca el máximo provecho a tus herramientas.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-nikon-yellow w-12 h-12" />
        </div>
      ) : (
        <div className="flex flex-col gap-12">
            
            {/* AI Image Recognition Promo */}
            <section className="bg-gradient-to-r from-[#2a2a2a] to-nikon-black border border-nikon-border rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-nikon-yellow/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nikon-yellow/20 text-nikon-yellow text-xs font-bold uppercase tracking-wider mb-4 border border-nikon-yellow/20">
                         <span className="material-symbols-outlined text-sm">auto_awesome</span>
                         Nueva Función Beta
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Descubre los secretos detrás de tu foto</h2>
                    <p className="text-gray-400 mb-6 text-lg">
                        Sube tu imagen y deja que nuestro Asistente Virtual analice la información de la toma para ayudarte a mejorar tu técnica.
                    </p>
                    <button onClick={() => openAI('Quiero analizar una foto.', 'El usuario quiere usar la herramienta de análisis de imagen.')} className="px-8 py-3 bg-nikon-yellow text-black font-bold rounded hover:bg-[#d9ad0b] transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">upload_file</span>
                        Probar AI Image Rec
                    </button>
                </div>
                <div className="w-full md:w-1/3 relative z-10">
                   <div className="aspect-square bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                       <img src="/images/espacio/foto_referencia.jpg" alt="AI Analysis" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
            </section>

            {/* Gear Filters */}
            {userGear.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-gray-400 mr-2 uppercase tracking-wider">Filtrar por:</span>
                    
                    <button 
                        onClick={() => handleFilter(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                            activeFilter === null 
                            ? 'bg-nikon-yellow text-black border-nikon-yellow' 
                            : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                        }`}
                    >
                        Todo
                    </button>

                    {mainGearNames.map((name, idx) => {
                         // Simplify Filter Logic for UI: Check if user has gear in this bucket
                         const hasGear = userGear.some(g => {
                            const cat = (g.category || '').toLowerCase();
                            const n = (g.name || '').toLowerCase();
                            
                            if (name === 'Cámaras ZSeries') {
                                return (n.includes('nikon z') || /\bz\s?[0-9a-z]+\b/.test(n)) && 
                                       !n.includes('nikkor') && !n.includes('ftz') && !n.includes('mount');
                            }
                            if (name === 'Cámaras Réflex') {
                                return /\bd\s?[0-9]{1,4}\b/.test(n) || n.includes('d6') || n.includes('d850');
                            }
                            if (name === 'Lentes') {
                                return n.includes('nikkor') || cat.includes('lente') || cat.includes('objetivo');
                            }
                            if (name === 'Flash') {
                                return n.includes('sb-') || n.includes('speedlight') || cat.includes('flash') || cat.includes('iluminación');
                            }
                            return false;
                         });
                         
                         if (!hasGear) return null;

                         return (
                            <button 
                                key={idx}
                                onClick={() => handleFilter(name)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                                    activeFilter === name
                                    ? 'bg-nikon-yellow text-black border-nikon-yellow' 
                                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                                }`}
                            >
                                {name}
                                {activeFilter === name && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Dynamic Resources Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-nikon-yellow">school</span>
                    <h2 className="text-2xl font-bold text-white">
                        {activeFilter ? `Recomendado para ${activeFilter}` : 'Recomendado para Ti'}
                    </h2>
                </div>
                {displayedResources.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedResources.slice(0, visibleCount).map((resource, idx) => (
                                <a 
                                    key={idx} 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group bg-nikon-surface rounded-xl border border-nikon-border overflow-hidden hover:border-nikon-yellow/50 transition-all flex flex-col h-full"
                                >
                                    <div className="aspect-video bg-gray-800 relative overflow-hidden flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                        {/* Icon-based Image Replacement */}
                                        <div className="text-gray-500 group-hover:text-nikon-yellow transition-colors transform scale-150 group-hover:scale-175 duration-500">
                                            {React.cloneElement(renderIcon(resource) as React.ReactElement, { className: 'w-24 h-24 opacity-20' })}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Center Main Icon */}
                                            <div className="bg-nikon-dark/80 p-4 rounded-full border border-gray-700 backdrop-blur-sm group-hover:border-nikon-yellow/50 transition-colors">
                                                {React.cloneElement(renderIcon(resource) as React.ReactElement, { className: 'w-8 h-8 text-white' })}
                                            </div>
                                        </div>

                                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded border border-white/10 uppercase">
                                            {resource.type}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-nikon-yellow transition-colors line-clamp-2">
                                            {resource.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                                            {resource.description}
                                        </p>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                                            <span className="text-xs text-gray-500">Nikon Center</span>
                                            <span className="text-nikon-yellow text-sm font-bold flex items-center gap-1">
                                                Ver Recurso <span className="material-symbols-outlined text-base">open_in_new</span>
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                        {displayedResources.length > visibleCount && (
                             <div className="flex justify-center mt-8">
                                 <button 
                                    onClick={() => setVisibleCount(prev => prev + 3)}
                                    className="px-6 py-2 bg-nikon-surface border border-nikon-border text-white font-bold rounded-full hover:bg-nikon-yellow hover:text-black hover:border-nikon-yellow transition-all flex items-center gap-2"
                                 >
                                     Ver más recursos
                                     <span className="material-symbols-outlined">expand_more</span>
                                 </button>
                             </div>
                        )}
                    </>
                ) : (
                    <div className="bg-nikon-surface border border-nikon-border rounded-xl p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500 mb-4">inbox</span>
                        <h3 className="text-xl font-bold text-white mb-2">No encontramos recursos específicos</h3>
                        <p className="text-gray-400 mb-6">Prueba seleccionando otro equipo o explora las categorías generales.</p>
                        <button onClick={() => handleFilter(null)} className="text-nikon-yellow font-bold hover:underline">
                            Ver todo
                        </button>
                    </div>
                )}
            </section>

            {/* Replacement for Static Categories: AI Helper Buttons */}
            <section className="pt-8 border-t border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6">¿Necesitas Ayuda?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <button 
                        onClick={() => openAI('Quiero consejos para tomar una buena fotografía.', 'El usuario busca tips generales de fotografía.')}
                        className="bg-nikon-surface hover:bg-nikon-surface/80 border border-nikon-border rounded-xl p-6 text-left transition-all group"
                     >
                         <div className="w-10 h-10 rounded-full bg-nikon-black flex items-center justify-center mb-4 group-hover:text-nikon-yellow transition-colors">
                             <Camera className="w-5 h-5 text-gray-300 group-hover:text-nikon-yellow" />
                         </div>
                         <h4 className="font-bold text-white mb-1 group-hover:text-nikon-yellow">Tomar una buena fotografía</h4>
                         <p className="text-sm text-gray-400">Consejos de composición y más.</p>
                     </button>

                     <button 
                        onClick={() => openAI('Quiero mejorar mi equipo actual.', `Mi equipo actual: ${userGear.map(g=>g.name).join(', ')}`)}
                        className="bg-nikon-surface hover:bg-nikon-surface/80 border border-nikon-border rounded-xl p-6 text-left transition-all group"
                     >
                         <div className="w-10 h-10 rounded-full bg-nikon-black flex items-center justify-center mb-4 group-hover:text-nikon-yellow transition-colors">
                             <CircleDollarSign className="w-5 h-5 text-gray-300 group-hover:text-nikon-yellow" />
                         </div>
                         <h4 className="font-bold text-white mb-1 group-hover:text-nikon-yellow">Mejorar mi equipo</h4>
                         <p className="text-sm text-gray-400">Recomendaciones personalizadas.</p>
                     </button>

                     <button 
                         onClick={() => openAI('Tengo una consulta técnica sobre mi equipo.', `Mi equipo: ${userGear.map(g=>g.name).join(', ')}`)}
                         className="bg-nikon-surface hover:bg-nikon-surface/80 border border-nikon-border rounded-xl p-6 text-left transition-all group"
                     >
                         <div className="w-10 h-10 rounded-full bg-nikon-black flex items-center justify-center mb-4 group-hover:text-nikon-yellow transition-colors">
                             <Wrench className="w-5 h-5 text-gray-300 group-hover:text-nikon-yellow" />
                         </div>
                         <h4 className="font-bold text-white mb-1 group-hover:text-nikon-yellow">Consulta técnica</h4>
                         <p className="text-sm text-gray-400">Resuelve dudas de configuración.</p>
                     </button>
                </div>
            </section>

             {/* Recommended Products */}
             <section className="pt-8 border-t border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Seleccionados para ti</h2>
                    <span className="text-xs font-bold text-nikon-yellow uppercase tracking-wider">Nikon Center Chile</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {FEATURED_PRODUCTS.map((product) => (
                        <a 
                           key={product.id} 
                           href={product.url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="bg-nikon-black border border-nikon-border rounded-lg overflow-hidden hover:border-nikon-yellow transition-colors flex flex-col"
                        >
                            <div className="aspect-[4/3] bg-white relative p-4 flex items-center justify-center">
                                <span className="absolute top-2 left-2 bg-nikon-yellow text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">{product.category}</span>
                                <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-sm font-bold text-white mb-1">{product.name}</h3>
                                <p className="text-gray-400 text-xs mb-3 flex-1">Compatible con tu equipo</p>
                                <div className="text-nikon-yellow font-bold text-sm">{product.price}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </div>
      )}
      
      <AIAssistantWidget 
         isOpen={isAIOpen} 
         onClose={() => setIsAIOpen(false)}
         initialMessage={aiInitialMsg}
         context={aiContext}
      />
    </div>
  );
};

export default Benefits;