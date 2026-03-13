import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Camera, TrendingUp, GraduationCap, ShoppingCart, X } from 'lucide-react';
import { getOrCreateActiveCart, formatPrice, getHoursSinceUpdate } from '../utils/cartService';
import { ShoppingCart as Cart } from '../types';
import { trackPageView } from '../utils/analyticsService';
import { getRandomTip, PhotoTip } from '../utils/tipsService';

interface Banner {
  id: string;
  title: string;
  tagline: string;
  link: string;
  image_url: string;
  button_text: string;
  sort_order: number;
  is_active: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartBannerDismissed, setCartBannerDismissed] = useState(false);
  const [dailyTip, setDailyTip] = useState<PhotoTip | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    // Track page view
    trackPageView('/', 'Home');
    
    setDailyTip(getRandomTip());
    fetchBanners();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        loadUserCart(session.user.id, session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        loadUserCart(session.user.id, session.user.email || '');
      } else {
        setProfile(null);
        setCart(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (data) setBanners(data);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const loadUserCart = async (userId: string, email: string) => {
    const activeCart = await getOrCreateActiveCart(userId, email);
    
    // Only show banner if cart has items and was updated more than 1 hour ago
    if (activeCart && activeCart.items_count > 0) {
      const hoursAbandoned = getHoursSinceUpdate(activeCart.updated_at);
      if (hoursAbandoned >= 1) {
        setCart(activeCart);
      }
    }
  };

  const handleDismissBanner = () => {
    setCartBannerDismissed(true);
    // Store in localStorage to persist dismissal
    if (cart) {
      localStorage.setItem(`cart-banner-dismissed-${cart.id}`, 'true');
    }
  };

  const shouldShowCartBanner = () => {
    if (!cart || cartBannerDismissed || !cart.items_count) return false;
    
    // Check if already dismissed in this session
    const isDismissed = localStorage.getItem(`cart-banner-dismissed-${cart.id}`);
    if (isDismissed) return false;
    
    const hoursAbandoned = getHoursSinceUpdate(cart.updated_at);
    return hoursAbandoned >= 1;
  };

  return (
    // Header and Footer are now handled by Layout in App.tsx
    <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-10 lg:px-20 w-full font-sans">
      <div className="flex flex-col max-w-[1200px] w-full gap-16">
        
        {/* Abandoned Cart Banner - OCULTO PARA FASE 1.0 */}
        {false && shouldShowCartBanner() && (
          <div className="bg-gradient-to-r from-nikon-yellow/20 to-orange-500/20 border border-nikon-yellow/30 rounded-xl p-5 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-nikon-yellow/20 rounded-full">
                <ShoppingCart className="w-6 h-6 text-nikon-yellow" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">
                  🛒 ¡Tienes productos esperándote en tu carrito!
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {cart.items_count} producto{cart.items_count > 1 ? 's' : ''} por {formatPrice(cart.total_value)} · 
                  Hace {Math.floor(getHoursSinceUpdate(cart.updated_at))} hora{Math.floor(getHoursSinceUpdate(cart.updated_at)) !== 1 ? 's' : ''}
                  {getHoursSinceUpdate(cart.updated_at) > 72 && (
                    <span className="ml-2 text-nikon-yellow font-medium">
                      · ¡5% descuento si compras hoy! 🎁
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/cart')}
                    className="px-5 py-2 bg-nikon-yellow hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors text-sm"
                  >
                    Ver mi carrito
                  </button>
                  <button
                    onClick={handleDismissBanner}
                    className="px-5 py-2 bg-nikon-surface border border-gray-700 hover:border-white text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Más tarde
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismissBanner}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <section className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          {/* Left: Text & Form */}
          <div className="flex flex-col gap-8 flex-1 w-full lg:max-w-[600px]">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-tight tracking-tight">
                {user ? (
                    <>
                        Hola <span className="text-nikon-yellow">{profile?.first_name || 'Nikonista'}</span>, bienvenido.
                    </>
                ) : (
                    <>
                        Bienvenido a <span className="text-nikon-yellow">Mi Nikon</span>
                    </>
                )}
              </h1>
              <h2 className="text-lg text-nikon-text w-full">
                {user 
                  ? "Accede a tips, soporte y beneficios exclusivos diseñados específicamente para tu equipo y estilo fotográfico." 
                  : "Accede a tips, soporte y beneficios exclusivos diseñados específicamente para tu equipo y estilo fotográfico."}
              </h2>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                   <div className="w-full space-y-3">
                     <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">¿Qué te gustaría hacer hoy?</p>
                     
                     <button onClick={() => navigate('/tutorials')} className="w-full flex items-center p-4 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow rounded-lg group transition-all text-left">
                       <div className="p-3 bg-nikon-black rounded-full mr-4 group-hover:bg-nikon-yellow/20 transition-colors">
                         <Camera className="text-nikon-yellow" size={24} />
                       </div>
                       <div>
                         <div className="text-white font-bold text-lg">Tomar una buena fotografía</div>
                         <div className="text-gray-400 text-xs">Explora tutoriales y consejos</div>
                       </div>
                     </button>

                     <button onClick={() => navigate('/gear')} className="w-full flex items-center p-4 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow rounded-lg group transition-all text-left">
                       <div className="p-3 bg-nikon-black rounded-full mr-4 group-hover:bg-nikon-yellow/20 transition-colors">
                          <TrendingUp className="text-nikon-yellow" size={24} />
                       </div>
                       <div>
                         <div className="text-white font-bold text-lg">Mejorar mi equipo</div>
                         <div className="text-gray-400 text-xs">Recomendaciones personalizadas</div>
                       </div>
                     </button>

                     <button onClick={() => navigate('/workshops')} className="w-full flex items-center p-4 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow rounded-lg group transition-all text-left">
                       <div className="p-3 bg-nikon-black rounded-full mr-4 group-hover:bg-nikon-yellow/20 transition-colors">
                         <GraduationCap className="text-nikon-yellow" size={24} />
                       </div>
                       <div>
                         <div className="text-white font-bold text-lg">Aprender algo nuevo</div>
                         <div className="text-gray-400 text-xs">Workshops y eventos</div>
                       </div>
                     </button>
                   </div>
                ) : (
                   <>
                     <button 
                       onClick={() => navigate('/register')}
                       className="h-14 px-8 bg-nikon-yellow text-black font-bold rounded-lg hover:brightness-110 transition-all text-lg shadow-lg shadow-nikon-yellow/20"
                     >
                       Crear Cuenta Gratis
                     </button>
                     <button 
                       onClick={() => navigate('/login')}
                       className="h-14 px-8 bg-nikon-surface border border-nikon-border text-white font-bold rounded-lg hover:bg-[#393528] transition-all text-lg"
                     >
                       Iniciar Sesión
                     </button>
                   </>
                )}
              </div>
              {!user && <p className="text-xs text-nikon-text/70">Únete a la comunidad oficial de Nikon Chile.</p>}
            </div>
          </div>

          {/* Right: Banners display from Admin */}
          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             {banners.length === 0 && (
                <div className="col-span-2 bg-nikon-surface border border-nikon-border rounded-xl p-8 text-center text-gray-400">
                   Cargando novedades...
                </div>
             )}
             {banners.map((banner) => (
               <div key={banner.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-nikon-border group">
                   <img src={banner.image_url} alt={banner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                   
                   <div className="absolute bottom-0 left-0 right-0 p-4">
                       <h3 className="text-white font-bold text-lg leading-tight mb-1">{banner.title}</h3>
                       <p className="text-gray-300 text-xs mb-3 line-clamp-2">{banner.tagline}</p>
                       <a href={banner.link} target="_blank" rel="noopener noreferrer" className="inline-block bg-nikon-yellow text-black text-xs font-bold px-3 py-2 rounded hover:brightness-110 transition-all">
                           {banner.button_text}
                       </a>
                   </div>
               </div>
             ))}
          </div>
        </section>

        {/* Daily Tip Section - From Nikon School PDF */}
        {dailyTip && (
          <section className="w-full">
            <div className="bg-nikon-surface border border-nikon-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <span className="material-symbols-outlined text-[120px] text-white">lightbulb</span>
              </div>
              
              <div className="bg-nikon-yellow w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shrink-0 shadow-lg border-4 border-nikon-yellow/20">
                 <span className="material-symbols-outlined text-4xl md:text-5xl text-black">tips_and_updates</span>
              </div>
              
              <div className="flex-1 text-center md:text-left z-10">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <div className="bg-nikon-yellow/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-nikon-yellow">
                     SABÍAS QUE: {dailyTip.category}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg md:text-xl font-black text-white font-display uppercase">{dailyTip.title}</h3>
                  <button 
                    onClick={() => setDailyTip(getRandomTip())}
                    className="text-white/40 hover:text-nikon-yellow transition-colors flex items-center justify-center"
                    title="Siguiente Tip"
                  >
                    <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                  </button>
                </div>
                <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed max-w-2xl">
                  "{dailyTip.content}"
                </p>
              </div>

              <div className="flex items-center gap-4 z-10">
                <button 
                  onClick={() => navigate('/benefits', { 
                    state: { 
                      autoStartTip: true, 
                      tipMessage: `Hola, me gustaría profundizar más sobre este concepto de fotografía: ${dailyTip.title}. Explícame de qué trata de forma sencilla y dame 3 consejos prácticos.` 
                    } 
                  })}
                  className="bg-nikon-yellow text-black font-black py-3 px-6 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 text-xs uppercase tracking-tighter shrink-0"
                >
                  <GraduationCap size={16} />
                  Aprender más
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ction>

        {/* Quick Access */}
        <section className="flex flex-col gap-8 py-6">
          <div>
            <h3 className="text-2xl font-bold font-display text-white">Acceso Rápido</h3>
            <p className="text-nikon-text">Explora los beneficios de ser parte de nuestra comunidad</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: 'star', title: 'Promociones', desc: 'Recomendaciones exclusivas', link: '/recommendations' },
               { icon: 'event', title: 'Workshops', desc: 'Actividades presenciales', link: '/workshops' },
               { icon: 'school', title: 'Tutoriales', desc: 'Aprende con expertos', link: '/tutorials' },
               { icon: 'smart_toy', title: 'Asesoría IA', desc: 'Chat de soporte 24/7', link: '/benefits' },
             ].map((item, i) => (
               <div key={i} onClick={() => navigate(item.link)} className="group cursor-pointer bg-nikon-surface border border-nikon-border p-6 rounded-xl hover:border-nikon-yellow transition-colors relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-nikon-yellow">{item.icon}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-nikon-yellow/10 flex items-center justify-center text-nikon-yellow group-hover:bg-nikon-yellow group-hover:text-black transition-colors mb-4">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-nikon-text">{item.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Social Wall Section Removed as per strict user instruction to not include non-real or competitor content */}
      </div>
    </main>
  );
};

export default Home;
