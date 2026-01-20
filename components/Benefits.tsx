import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { RESOURCES_DB } from '../data/resources';
import { Loader2 } from 'lucide-react';

interface Resource {
    type: string;
    category?: string;
    keywords: string[];
    title: string;
    description: string;
    url: string;
    image: string;
}

const Benefits: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userGear, setUserGear] = useState<any[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetchUserGearAndResources();
  }, []);

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

        gear.forEach(item => {
            const itemNameLower = item.name.toLowerCase();
            const itemCategoryLower = item.category?.toLowerCase() || '';

            // Filter out accessories if necessary (though the DB should ideally define categories)
            if (itemCategoryLower.includes('accesorio') || itemCategoryLower.includes('batería') || itemCategoryLower.includes('correa')) {
                return; 
            }

            RESOURCES_DB.forEach(resource => {
                // Check if resource matches product type/category
                const matchesType = 
                    (itemCategoryLower.includes('cámara') || itemCategoryLower.includes('body') || itemCategoryLower.includes('kit')) ? resource.type === 'camera' :
                    (itemCategoryLower.includes('lente') || itemCategoryLower.includes('objetivo')) ? resource.type === 'lens' :
                    (itemCategoryLower.includes('flash') || itemCategoryLower.includes('speedlight')) ? resource.type === 'flash' : false;

                if (!matchesType) return;

                // Check specific keywords
                const matchesKeyword = resource.keywords.some(k => itemNameLower.includes(k));
                
                // Also include general category matches (e.g. 'dslr' resource for 'D7500')
                // This logic is simplistic, in a real app we'd map "D7500" -> "dslr" property in DB
                const isMirrorless = itemNameLower.includes('z') && !itemNameLower.includes('zoom'); // Rustic check
                const isDSLR = itemNameLower.startsWith('d') && !isNaN(parseInt(itemNameLower[1]));

                const matchesCategory = 
                    (resource.category === 'mirrorless' && isMirrorless) ||
                    (resource.category === 'dslr' && isDSLR);

                if ((matchesKeyword || matchesCategory) && !addedTitles.has(resource.title)) {
                    relevantResources.push(resource);
                    addedTitles.add(resource.title);
                }
            });
        });

        // If no specific resources found (or no gear), show some defaults
        if (relevantResources.length === 0) {
             // Fallback: Show general photography tips
             const fallback = RESOURCES_DB.filter(r => r.title.includes('Depth') || r.title.includes('Light'));
             setRecommendedResources(fallback);
        } else {
            setRecommendedResources(relevantResources);
        }

    } catch (error) {
        console.error("Error loading benefits:", error);
    } finally {
        setLoading(false);
    }
  };

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
        
        {userGear.length > 0 && (
            <div className="bg-nikon-surface border border-nikon-border rounded-lg p-3 flex items-center gap-3">
                <div className="bg-nikon-yellow text-black p-2 rounded-full">
                    <span className="material-symbols-outlined text-xl">camera_alt</span>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Tu Equipo Detectado</p>
                    <p className="text-white text-sm font-medium truncate max-w-[200px]">
                        {userGear.map(g => g.name).join(', ')}
                    </p>
                </div>
            </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-nikon-yellow w-12 h-12" />
        </div>
      ) : (
        <div className="flex flex-col gap-12">
            
            {/* Dynamic Resources Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-nikon-yellow">auto_awesome</span>
                    <h2 className="text-2xl font-bold text-white">Recomendado para Ti</h2>
                </div>
                
                {recommendedResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedResources.map((resource, idx) => (
                            <a 
                                key={idx} 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group bg-nikon-surface rounded-xl border border-nikon-border overflow-hidden hover:border-nikon-yellow/50 transition-all flex flex-col h-full"
                            >
                                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                    <img 
                                        src={resource.image} 
                                        alt={resource.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
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
                                        <span className="text-xs text-gray-500">Nikon Learn & Explore</span>
                                        <span className="text-nikon-yellow text-sm font-bold flex items-center gap-1">
                                            Ver Recurso <span className="material-symbols-outlined text-base">open_in_new</span>
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="bg-nikon-surface border border-nikon-border rounded-xl p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500 mb-4">inbox</span>
                        <h3 className="text-xl font-bold text-white mb-2">Aún no tienes equipo registrado</h3>
                        <p className="text-gray-400 mb-6">Registra tus cámaras y lentes para recibir contenido de aprendizaje personalizado.</p>
                        <Link to="/gear" className="bg-nikon-yellow text-black font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors">
                            Registrar Equipo
                        </Link>
                    </div>
                )}
            </section>

            {/* General Categories (Static Fallback) */}
            <section className="pt-8 border-t border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6">Explorar por Categoría</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['Retrato', 'Paisaje', 'Deportes', 'Macro'].map((cat) => (
                         <div key={cat} className="bg-nikon-dark border border-nikon-border rounded-lg p-4 hover:bg-nikon-surface transition-colors cursor-pointer text-center group">
                             <h4 className="font-bold text-gray-300 group-hover:text-white">{cat}</h4>
                         </div>
                     ))}
                </div>
            </section>
        </div>
      )}
    </div>
  );
};

export default Benefits;