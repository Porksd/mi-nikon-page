import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AIAssistantWidget from './AIAssistantWidget';

interface Product {
  id: string; // SKU
  name: string;
  image_url: string;
  category: string;
}

interface UserProduct {
  id: string;
  product: Product;
  serial_number: string;
  purchase_date: string;
  warranty_status: string;
}

const Gear: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [myGear, setMyGear] = useState<UserProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Helper to determine if product is "main/registrable" (Reflex, Mirrorless, Lenses)
  const isRegistrable = (product: Product) => {
      const search = (product.category + ' ' + product.name).toLowerCase();
      const terms = ['reflex', 'mirrorless', 'z series', 'dslr', 'lente', 'objetivo', 'nikkor'];
      // Exclude Coolpix even if it matches something else (though unlikely)
      if (search.includes('coolpix')) return false;
      return terms.some(t => search.includes(t));
  };

  const getCategoryIcon = (product: Product) => {
      const search = (product.category + ' ' + product.name).toLowerCase();
      
      if (search.includes('coolpix') || search.includes('camera') || search.includes('compacta')) return '/icon-line-cameras.svg';
      if (search.includes('flash') || search.includes('speedlight')) return '/icon-line-flash.svg';
      if (search.includes('lente') || search.includes('objetivo')) return '/icon-line-lenses.svg';
      if (search.includes('bateria') || search.includes('battery')) return '/icon-line-battery-recycling.svg'; // Or maintenance?
      
      return '/icon-line-maintenance.svg'; // Fallback generic
  };

  const registrableGear = myGear.filter(g => isRegistrable(g.product));
  const otherGear = myGear.filter(g => !isRegistrable(g.product));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
       setSessionUser(session?.user);
       if (session?.user) {
         fetchMyGear(session.user);
       } else {
         setLoading(false);
       }
    });

    fetchAvailableProducts();
  }, []);

  const fetchMyGear = async (user: any) => {
    try {
        // Query matching either user_id (if registered via app) or email (if seeded)
        const { data, error } = await supabase
        .from('user_products')
        .select(`
            id,
            serial_number,
            purchase_date,
            warranty_status,
            product:products (
                id,
                name,
                image_url,
                category
            )
        `)
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
        
        if (error) {
            console.error('Error fetching gear:', error);
        } else {
            // Create a safe mapping handling if product is missing or array
             const formatted: UserProduct[] = (data || []).map((item: any) => {
                const prod = Array.isArray(item.product) ? item.product[0] : item.product;
                return {
                    id: item.id,
                    serial_number: item.serial_number,
                    purchase_date: item.purchase_date,
                    warranty_status: item.warranty_status,
                    product: prod || { name: 'Unknown Product', image_url: '', category: 'Unknown', id: '0' }
                };
            });
            setMyGear(formatted);
        }
    } catch(e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(20); // Limit for demo
      if (data) setAvailableProducts(data);
  };

  const addToGear = async (product: Product) => {
    if (!sessionUser) return;
    
    const newRegistration = {
        user_id: sessionUser.id,
        customer_email: sessionUser.email,
        product_id: product.id,
        serial_number: `WEB-${Math.floor(Math.random() * 1000000)}`,
        purchase_date: new Date().toISOString(),
        warranty_status: 'Active'
    };

    const { error } = await supabase.from('user_products').insert(newRegistration);

    if (!error) {
        setViewMode('list');
        fetchMyGear(sessionUser);
    } else {
        alert("Error al registrar: " + error.message);
    }
  };

  if (!sessionUser && !loading) {
      return (
          <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-20 text-center text-white">
              <h1 className="text-3xl font-bold mb-4">Inicia sesión para ver tu equipo</h1>
              <button 
                  onClick={() => navigate('/login')} 
                  className="px-6 py-3 bg-nikon-yellow text-black font-bold rounded mb-4"
              >
                  Ir al Login
              </button>
              <p className="text-gray-400">Debes tener una cuenta para registrar productos.</p>
          </div>
      );
  }

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-sm font-medium">
            <span className="text-gray-400">Home</span>
            <span className="text-gray-600">/</span>
            <span className="text-white">Mi Equipo</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight text-white">
            {viewMode === 'list' ? 'Mis Cámaras' : 'Seleccionar Modelo'}
          </h1>
          <p className="text-gray-400 mt-1">
            {viewMode === 'list' 
              ? 'Gestiona tu equipo registrado para recibir soporte y actualizaciones.' 
              : 'Selecciona tu modelo de la lista para agregarlo a tu perfil.'}
          </p>
        </div>
        
        {viewMode === 'list' && (
          <button 
            onClick={() => setViewMode('gallery')}
            className="h-12 px-6 bg-nikon-yellow text-black font-bold rounded-lg hover:bg-[#d9ad0b] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="hidden sm:inline">Agregar Nuevo</span>
          </button>
        )}
        {viewMode === 'gallery' && (
           <button 
             onClick={() => setViewMode('list')}
             className="h-12 px-6 bg-nikon-surface border border-nikon-border text-white font-bold rounded-lg hover:bg-[#393528] transition-colors"
           >
             Cancelar
           </button>
        )}
      </div>

      {loading && <div className="text-white text-center py-10">Cargando...</div>}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div className="flex flex-col gap-12">
            
            {/* Sección 1: Productos Registrables (Cards) */}
            <div>
                <h2 className="text-xl font-bold text-nikon-yellow mb-6 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined">camera_enhance</span>
                    Productos Registrables
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registrableGear.map((gear) => (
                        <div key={gear.id} className="bg-nikon-surface border border-nikon-border rounded-2xl overflow-hidden group hover:border-nikon-yellow transition-all">
                            <div className="relative aspect-[4/3] bg-black">
                            <img src={gear.product.image_url || 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-120434_1.png'} alt={gear.product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-3 left-3 bg-nikon-yellow text-black text-xs font-bold px-2 py-1 rounded uppercase">Registrado</div>
                            </div>
                            <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{gear.product.name}</h3>
                            <p className="text-sm text-nikon-text mb-4">{gear.product.category || 'Equipo Nikon'}</p>
                            <div className="flex flex-col gap-2 mb-4 text-xs text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Serial:</span>
                                        <span className="text-white font-mono">{gear.serial_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Compra:</span>
                                        <span className="text-white">{new Date(gear.purchase_date).toLocaleDateString()}</span>
                                    </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 py-2 bg-nikon-border/50 hover:bg-nikon-border text-white rounded text-sm font-medium transition-colors">Soporte</button>
                                <button className="flex-1 py-2 bg-nikon-border/50 hover:bg-nikon-border text-white rounded text-sm font-medium transition-colors">Manual</button>
                            </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Empty State / Add CTA */}
                    <div 
                        onClick={() => setViewMode('gallery')}
                        className="border-2 border-dashed border-nikon-border rounded-2xl flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:border-nikon-yellow hover:bg-nikon-surface/50 transition-all group"
                    >
                        <div className="w-16 h-16 rounded-full bg-nikon-surface flex items-center justify-center text-nikon-text group-hover:bg-nikon-yellow group-hover:text-black transition-colors mb-4">
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Registrar nuevo equipo</h3>
                        <p className="text-sm text-nikon-text">Cámaras, Lentes o Flashes</p>
                    </div>
                </div>
            </div>

            {/* Sección 2: Otros Productos (Lista Compacta) */}
            {otherGear.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2 border-t border-gray-800 pt-8">
                        <span className="material-symbols-outlined">inventory_2</span>
                        Mis Otros Productos
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherGear.map((gear) => (
                            <div key={gear.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-gray-600 transition-colors">
                                {/* Icon Container - Using the SVGs */}
                                <div className="w-12 h-12 flex-shrink-0 bg-black rounded-lg flex items-center justify-center p-2 border border-gray-800">
                                    <img 
                                        src={getCategoryIcon(gear.product)} 
                                        alt="" 
                                        className="w-full h-full opacity-80 invert"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium text-sm truncate" title={gear.product.name}>{gear.product.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{gear.product.category || 'Accesorio'}</p>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <span className="text-xs text-gray-600 block">Serial</span>
                                    <span className="text-xs font-mono text-gray-400">{gear.serial_number}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      )}

      {/* Gallery View (Add Gear) - Now fetched from DB */}
      {!loading && viewMode === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map((prod) => (
            <div key={prod.id} className="bg-nikon-surface border border-nikon-border rounded-xl p-4 flex flex-col items-center text-center hover:border-nikon-yellow transition-all group">
               <div className="w-full aspect-square bg-black rounded-lg mb-4 overflow-hidden relative">
                  <img src={prod.image_url || 'https://via.placeholder.com/300?text=No+Image'} alt={prod.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
               </div>
               <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 h-10">{prod.name}</h3>
               <p className="text-xs text-nikon-text mb-4">{prod.category}</p>
               <button 
                 onClick={() => addToGear(prod)}
                 className="w-full py-2 bg-white text-black font-bold rounded hover:bg-nikon-yellow transition-colors"
               >
                 Seleccionar
               </button>
            </div>
          ))}
        </div>
      )}

      <AIAssistantWidget 
        context={viewMode === 'list' 
          ? `El usuario está en su sección "Mi Equipo". Tiene registrado: ${myGear.map(g => g.product.name).join(', ')}. Ayúdalo con configuraciones o manuales.`
          : `El usuario está registrando equipo. Ayúdalo a elegir.`
        }
        initialMessage={viewMode === 'list'
          ? "Hola. ¿Tienes alguna duda sobre tu equipo registrado?"
          : "Hola. ¿Necesitas ayuda para encontrar tu modelo?"
        }
      />
    </div>
  );
};

export default Gear;
