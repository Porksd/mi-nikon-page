import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { RESOURCES_DB } from '../data/resources';
import { Loader2, Upload, Sparkles, Camera, Aperture, AlertCircle, GraduationCap } from 'lucide-react';
import { trackPageView } from '../utils/analyticsService';
import { getRandomTip, PhotoTip } from '../utils/tipsService';

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

const Benefits: React.FC = () => {
    const navigate = useNavigate();
    const [sessionUser, setSessionUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [userGear, setUserGear] = useState<any[]>([]);
    const [recommendedResources, setRecommendedResources] = useState<Resource[]>([]);
    const [activeFilter, setActiveFilter] = useState('Todo');
    const [showAllResources, setShowAllResources] = useState(false);
    const [dailyTip, setDailyTip] = useState<PhotoTip | null>(null);

    const FILTERS = ['Todo', 'Cámaras Réflex', 'Lentes', 'Flash', 'Mirrorless'];

    useEffect(() => {
        trackPageView('/benefits', 'Mi Espacio Creativo');

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSessionUser(session?.user);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_OUT') {
                setSessionUser(null);
                setUserGear([]); // Clear gear on logout
                setRecommendedResources([]);
            } else if (session?.user) {
                setSessionUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (sessionUser) {
            trackPageView('/benefits', 'Tu Espacio Creativo');
            setDailyTip(getRandomTip());
            fetchUserGearAndResources();

            // Lógica para detectar si venimos del Home con un tip para profundizar
            const navState = window.history.state?.usr;
            if (navState?.autoStartTip && navState?.tipMessage) {
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('deepen-tip', { 
                        detail: { message: navState.tipMessage } 
                    }));
                    // Limpia el estado para evitar re-ejecución al navegar atrás/adelante
                    window.history.replaceState({}, document.title);
                }, 800);
            }
        }
    }, [sessionUser]);

    const fetchUserGearAndResources = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                setLoading(false);
                return;
            }

            // 1. Fetch User Products (CRM / Registered)
            const { data: products, error } = await supabase
                .from('user_products')
                .select(`
                id,
                product:products (
                    name,
                    category
                )
            `)
                .eq('user_id', session.user.id);

            if (error) throw error;

            let gear = products?.map((p: any) => {
                const prod = Array.isArray(p.product) ? p.product[0] : p.product;
                return {
                    name: prod?.name || '',
                    category: prod?.category || ''
                };
            }) || [];

            // 2. Fetch User Equipment (Manually added via Mi Equipo)
            const { data: manualGear, error: manualError } = await supabase
                .from('user_equipment')
                .select('product_name, product_type');

            if (!manualError && manualGear) {
                const manual = manualGear.map((m: any) => ({
                    name: m.product_name,
                    category: m.product_type,
                    isManual: true
                }));
                // Merge and deduplicate by name
                const allGear = [...gear, ...manual];
                const uniqueGear = Array.from(new Map(allGear.map(item => [item.name, item])).values());
                
                // Ordenar: Cámara Z, Cámara Reflex, Lente Z, Lente Reflex
                const sortedGear = [...uniqueGear].sort((a, b) => {
                    const isZ = (name: string) => {
                        const n = name.toUpperCase();
                        return (n.startsWith('Z') && (n.includes(' ') || n.length < 8)) || n.startsWith('NIKON Z') || n.includes('NIKKOR Z');
                    };

                    const getPriority = (item: any) => {
                        const isCamera = item.category === 'camera' || (item.category && item.category.toLowerCase().includes('camara')) || (item.product_type === 'camera');
                        const isZSeries = isZ(item.name);

                        if (isCamera && isZSeries) return 1; // Cámara Z
                        if (isCamera && !isZSeries) return 2; // Cámara Reflex
                        if (!isCamera && isZSeries) return 3; // Lente Z
                        return 4; // Lente Reflex
                    };

                    return getPriority(a) - getPriority(b);
                });
                
                gear = sortedGear;
            }

            console.log('DEBUG - ALL GEAR AFTER SORT:', gear);
            
            // ELIMINADO EL FILTRO FORZADO DE D7200 PARA PERMITIR COEXISTENCIA CON Z
            // Si el usuario tiene una Z7 II y una D7200, ahora verá la Z7 II como principal
            
            setUserGear(gear);

            // =====================================================================
            // FILOSOFÍA DE NEGOCIO: Incluir TODO el equipo Nikon del usuario
            // =====================================================================
            // - Si no hay equipo, mostramos sugerencia de agregar.
            // =====================================================================

            if (gear.length === 0) {
                setRecommendedResources([]); // Clear to show the "Add Gear" CTA
                return;
            }

            // 2. Filter Resources based on ALL user gear (registered or not)
            const relevantResources: Resource[] = [];
            const addedTitles = new Set();

            // Helper function to detect equipment type (same logic as Gear.tsx isRegistrable)
            const detectEquipmentType = (name: string, category: string): { type: string, subCategory: string } | null => {
                const search = (category + ' ' + name).toLowerCase();

                // Detect Z Series (Mirrorless)
                const isZSeries = (/\bz\s?[0-9a-z]+\b/.test(search) || search.includes('nikkor z')) && !search.includes('zoom');
                if (isZSeries) return { type: 'camera', subCategory: 'mirrorless' };

                // Detect DSLR (D followed by number)
                const isDSLR = (/\bd[0-9]/.test(search) || search.includes('reflex') || search.includes('dslr')) && !search.includes('nikkor z');
                if (isDSLR) return { type: 'camera', subCategory: 'dslr' };

                // Detect Lenses
                if (search.includes('lente') || search.includes('objetivo') || search.includes('nikkor') || /\d+-\d+mm/.test(search)) {
                    // Check if it's a Z lens
                    if (search.includes('nikkor z') || search.includes('lente z') || search.includes(' z ')) {
                        return { type: 'lens', subCategory: 'mirrorless' };
                    }
                    return { type: 'lens', subCategory: 'lens' };
                }

                // Detect Flash
                if (search.includes('flash') || search.includes('speedlight') || search.includes('sb-')) {
                    return { type: 'flash', subCategory: 'flash' };
                }

                // Coolpix - still include but as compact camera
                if (search.includes('coolpix')) {
                    return { type: 'camera', subCategory: 'coolpix' };
                }

                // Sport Optics, Accessories - include for community but may not have specific resources
                if (search.includes('binocular') || search.includes('monarch') || search.includes('prostaff')) {
                    return { type: 'optics', subCategory: 'sport_optics' };
                }

                return null; // Accessories like bags, straps, batteries - not excluded, just no specific learning resources
            };

            gear.forEach(item => {
                const itemNameLower = item.name.toLowerCase();
                const itemCategoryLower = item.category?.toLowerCase() || '';

                const equipmentInfo = detectEquipmentType(itemNameLower, itemCategoryLower);

                console.log('DEBUG - Processing gear item:', item.name, 'Detected info:', equipmentInfo);

                if (!equipmentInfo) return;

                RESOURCES_DB.forEach(resource => {
                    const resourceCategory = resource.category;
                    const equipmentCategory = equipmentInfo.subCategory;

                    // Match by equipment type (camera, lens, flash)
                    const matchesType = resource.type === equipmentInfo.type;
                    if (!matchesType) return;

                    // Match by specific keyword IN the name (e.g., 'd7200' in name matches 'd7200' in keywords)
                    const matchesKeyword = resource.keywords.some(k => itemNameLower.includes(k.toLowerCase()));

                    // Match by broad category (e.g., 'dslr' matches 'dslr')
                    const matchesCategory = resource.category === equipmentInfo.subCategory;

                    // CRITICAL BLOCK: PREVENT CROSS-GENERATION RECOMMENDATIONS
                    // If the resource specifies a category (mirrorless/dslr), it MUST match the equipment category.
                    if (resourceCategory && equipmentCategory && resourceCategory !== equipmentCategory) {
                        return;
                    }

                    // If it's a camera-typed resource but equipment is a lens, it should have been caught by matchesType
                    // but we verify that either a specific keyword matched or the general category matched.
                    if ((matchesKeyword || matchesCategory) && !addedTitles.has(resource.title)) {
                        console.log('DEBUG - Adding resource:', resource.title, 'for equipment:', item.name);
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
        }
    };

    if (loading) return <div className="min-h-screen bg-nikon-black text-white flex justify-center items-center">Cargando...</div>;

    if (!sessionUser) {
        return (
            <div className="pt-24 min-h-screen bg-nikon-black flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={64} className="text-nikon-yellow mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Acceso Restringido</h1>
                <p className="text-gray-400 mb-8 max-w-md">Para acceder a tu Espacio Creativo y recursos exclusivos, necesitas iniciar sesión en tu cuenta Nikon ID.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-nikon-yellow text-black font-bold py-3 px-8 rounded hover:brightness-110 transition-all"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

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
        <div className="flex flex-col gap-10">
        
            {/* AI Image Recognition Feature - DESTACADO */}
            <section className="bg-gradient-to-r from-nikon-surface to-nikon-dark rounded-2xl border border-nikon-border overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-nikon-yellow/20 text-nikon-yellow text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={12} /> NUEVA FUNCIÓN BETA
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Descubre los secretos detrás de tu foto
                        </h2>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Sube tu imagen y deja que nuestro Asistente Virtual analice la información de la toma para ayudarte a mejorar tu técnica.
                        </p>
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2 bg-nikon-yellow text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors w-fit"
                        >
                            <Upload size={18} />
                            Probar AI Image Rec
                        </Link>
                    </div>
                    {/* Visual de fondo para la sección AI y componente Tips */}
                    <div className="w-full md:w-2/5 aspect-video md:aspect-auto relative bg-nikon-dark flex items-center justify-center p-4">
                        <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA41ACoh1gSPPMc6tIGgjc4q9xjtpMDTRB1ZkaxvdR40U1RMQnE64YIPid8cnQ76VErUExsE-cp958yU2SaX4cWZN9J_xhu-8nolzpkaiHCLJKtKN2mVVtBt5vhybNzFkJ_87w8-l4c2TYdoBOMfD78yXohL5FxJjkicqrRUpQkleAhoRzBaEuqE4AKxz0djgMCD0smAuWolNC5X6g7cAsK720GI__-29hY9-tANSfTn31td9R9eLVl92SeRkdv89WIv_HN_P8nZE8"
                            alt="AI Image Recognition"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
                        />
                        
                        <div className="w-full h-fit bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl z-10">
                            {dailyTip ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-nikon-yellow flex items-center justify-center shrink-0 shadow-lg shadow-nikon-yellow/20">
                                                <span className="material-symbols-outlined text-black font-bold text-xl">tips_and_updates</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-nikon-yellow tracking-widest leading-none mb-1">
                                                    SABÍAS QUE: {dailyTip.category}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm md:text-base font-black text-white leading-tight uppercase font-display">{dailyTip.title}</h4>
                                                    <button 
                                                        onClick={() => setDailyTip(getRandomTip())}
                                                        className="text-white/40 hover:text-nikon-yellow transition-colors flex items-center justify-center"
                                                        title="Siguiente Tip"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('deepen-tip', { 
                                                        detail: { message: `Hola, me gustaría profundizar más sobre este concepto de fotografía: ${dailyTip.title}. Explícame de qué trata de forma sencilla y dame 3 consejos prácticos.` } 
                                                    }));
                                                }}
                                                className="bg-nikon-yellow text-black text-[9px] font-black px-3 py-2 rounded uppercase tracking-tighter hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0"
                                            >
                                                <GraduationCap size={12} />
                                                Aprender más
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-[11px] leading-relaxed font-medium italic pr-4 mt-1">
                                        "{dailyTip.content}"
                                    </p>
                                </div>
                            ) : (
                                <div className="animate-pulse flex flex-col gap-4">
                                    <div className="h-4 bg-white/20 rounded w-1/4"></div>
                                    <div className="h-8 bg-white/20 rounded w-3/4"></div>
                                    <div className="h-20 bg-white/20 rounded w-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-400 font-medium">FILTRAR POR:</span>
                {FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            activeFilter === filter 
                                ? 'bg-nikon-yellow text-black' 
                                : 'bg-nikon-surface border border-nikon-border text-gray-300 hover:border-nikon-yellow/50'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            
            {/* Dynamic Resources Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-nikon-yellow" size={20} />
                    <h2 className="text-2xl font-bold text-white">Recomendado para Ti</h2>
                </div>
                
                {recommendedResources.length > 0 ? (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedResources
                            .filter(r => {
                                if (activeFilter === 'Todo') return true;
                                if (activeFilter === 'Cámaras Réflex') return r.type === 'camera' && r.category === 'dslr';
                                if (activeFilter === 'Mirrorless') return r.type === 'camera' && r.category === 'mirrorless';
                                if (activeFilter === 'Lentes') return r.type === 'lens';
                                if (activeFilter === 'Flash') return r.type === 'flash';
                                return true;
                            })
                            .slice(0, showAllResources ? undefined : 6)
                            .map((resource, idx) => (
                            <a 
                                key={idx} 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group bg-nikon-surface rounded-xl border border-nikon-border overflow-hidden hover:border-nikon-yellow/50 transition-all flex flex-col h-full"
                            >
                                {/* Icon Badge */}
                                <div className="p-6 pb-4">
                                    <div className="bg-nikon-dark w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-nikon-border">
                                        {resource.type === 'camera' ? (
                                            <Camera className="text-gray-400" size={24} />
                                        ) : resource.type === 'lens' ? (
                                            <Aperture className="text-gray-400" size={24} />
                                        ) : (
                                            <Sparkles className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {resource.type === 'camera' ? 'CAMERA' : resource.type === 'lens' ? 'LENS' : resource.type?.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div className="px-6 pb-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-nikon-yellow transition-colors">
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
                    
                    {/* Ver más recursos button */}
                    {recommendedResources.length > 6 && !showAllResources && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setShowAllResources(true)}
                                className="flex items-center gap-2 text-gray-300 hover:text-white font-medium transition-colors"
                            >
                                Ver más recursos
                                <span className="material-symbols-outlined">expand_more</span>
                            </button>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="bg-nikon-surface border border-nikon-border rounded-xl p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500 mb-4">photo_camera</span>
                        <h3 className="text-xl font-bold text-white mb-2">¡Bienvenido a la familia Nikon!</h3>
                        <p className="text-gray-400 mb-6">
                            Agrega tu equipo Nikon para recibir tutoriales, tips y recursos personalizados. 
                            No importa dónde lo hayas comprado - si eres Nikon, eres familia.
                        </p>
                        <Link to="/gear" className="bg-nikon-yellow text-black font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors">
                            Agregar Mi Equipo
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