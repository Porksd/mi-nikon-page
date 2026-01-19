import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Camera, TrendingUp, GraduationCap } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const products = [
    {
      name: "Z8 Body",
      tagline: "La cámara híbrida definitiva",
      link: "https://www.nikoncenter.cl/productos/zseries_cam.php?sec=zseries&cam=16&kit=56&name=Z8",
      image: "/images/z8_body_destacada.jpg"
    },
    {
      name: "Z6 III Body",
      tagline: "Rendimiento y Versatilidad increíbles",
      link: "https://www.nikoncenter.cl/productos/zseries_cam.php?sec=zseries&cam=18&kit=70&name=Z6+III+",
      image: "/images/z6_III_destacada.jpg"
    },
    {
      name: "ZR Body",
      tagline: "Calidad cinematográfica",
      link: "https://www.nikoncenter.cl/productos/zseries_cam.php?sec=zseries&cam=21&kit=88&name=ZR",
      image: "/images/zr_body_destacada.jpg"
    },
    {
      name: "Lente Z 180-600mm",
      tagline: "Alcance y Versatilidad",
      link: "https://www.nikoncenter.cl/productos/objetivos_detail.php?sec=objetivos&obj=1111&kit=165&name=NIKKOR+Z+180-600mm+F+5.6-6.3+VR+",
      image: "/images/lente_180-600_destacada.jpg"
    },
    {
      name: "Lente Z 70-180mm",
      tagline: "Más luz. Más alcance.",
      link: "https://www.nikoncenter.cl/productos/objetivos_detail.php?sec=objetivos&obj=1110&kit=164&name=NIKKOR+Z+70-180mm+F+2.8",
      image: "/images/lente_70-180_destacada.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  return (
    // Header and Footer are now handled by Layout in App.tsx
    <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-10 lg:px-20 w-full font-sans">
      <div className="flex flex-col max-w-[1200px] w-full gap-16">
        
        {/* Hero Section */}
        <section className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          {/* Left: Text & Form */}
          <div className="flex flex-col gap-8 flex-1 w-full lg:max-w-[600px]">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-tight tracking-tight">
                {user ? (
                    <>
                        Hola <span className="text-nikon-yellow">{profile?.first_name || 'Nikonista'}</span>, has iniciado sesión.
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
                {!user && (
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

          {/* Right: Carousel */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <div className="relative w-full aspect-[4/3] max-w-[600px] overflow-hidden rounded-2xl border border-nikon-border group shadow-2xl shadow-nikon-yellow/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"></div>
              
              {products.map((product, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-30 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="bg-nikon-black/90 backdrop-blur-sm border border-nikon-border px-4 py-3 rounded-lg flex items-center gap-3 flex-1">
                      <span className="material-symbols-outlined text-nikon-yellow">photo_camera</span>
                      <div>
                        <p className="text-white text-xs font-bold uppercase tracking-wider">{product.name}</p>
                        <p className="text-nikon-text text-xs">{product.tagline}</p>
                      </div>
                    </div>
                    <a 
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="bg-nikon-yellow text-black font-bold text-xs uppercase px-4 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-1 shrink-0 shadow-lg"
                    >
                      Ver más
                      <span className="material-symbols-outlined text-sm">arrow_outward</span>
                    </a>
                  </div>
                </div>
              ))}
              
              {/* Carousel Indicators */}
              <div className="absolute top-4 right-4 z-30 flex gap-2">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all shadow-sm ${
                      index === currentSlide ? 'bg-nikon-yellow w-6' : 'bg-white/30 hover:bg-white/80 w-3'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Actions Section - Full Width */}
        {user && (
          <section className="flex flex-col gap-6 w-full">
            <div>
              <h3 className="text-2xl font-bold font-display text-white">¿Qué te gustaría hacer hoy?</h3>
              <p className="text-nikon-text">Selecciona una actividad para comenzar</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
               <button onClick={() => navigate('/tutorials')} className="flex flex-col p-8 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow rounded-xl group transition-all text-left relative overflow-hidden h-full">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Camera size={120} className="text-nikon-yellow" />
                 </div>
                 <div className="w-16 h-16 bg-nikon-black rounded-full flex items-center justify-center mb-6 group-hover:bg-nikon-yellow/20 transition-colors z-10">
                   <Camera className="text-nikon-yellow" size={32} />
                 </div>
                 <div className="z-10 mt-auto">
                   <h4 className="text-xl font-bold text-white mb-2">Tomar una buena fotografía</h4>
                   <p className="text-gray-400 text-sm">Explora nuestra biblioteca de tutoriales y consejos de expertos.</p>
                 </div>
               </button>

               <button onClick={() => navigate('/gear')} className="flex flex-col p-8 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow rounded-xl group transition-all text-left relative overflow-hidden h-full">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={120} className="text-nikon-yellow" />
                 </div>
                 <div className="w-16 h-16 bg-nikon-black rounded-full flex items-center justify-center mb-6 group-hover:bg-nikon-yellow/20 transition-colors z-10">
                    <TrendingUp className="text-nikon-yellow" size={32} />
                 </div>
                 <div className="z-10 mt-auto">
                   <h4 className="text-xl font-bold text-white mb-2">Mejorar mi equipo</h4>
                   <p className="text-gray-400 text-sm">Recibe recomendaciones personalizadas basadas en tu estilo.</p>
                 </div>
               </button>

               <button onClick={() => navigate('/workshops')} className="flex flex-col p-8 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow rounded-xl group transition-all text-left relative overflow-hidden h-full">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <GraduationCap size={120} className="text-nikon-yellow" />
                 </div>
                 <div className="w-16 h-16 bg-nikon-black rounded-full flex items-center justify-center mb-6 group-hover:bg-nikon-yellow/20 transition-colors z-10">
                   <GraduationCap className="text-nikon-yellow" size={32} />
                 </div>
                 <div className="z-10 mt-auto">
                   <h4 className="text-xl font-bold text-white mb-2">Aprender algo nuevo</h4>
                   <p className="text-gray-400 text-sm">Inscríbete en workshops exclusivos y eventos de la comunidad.</p>
                 </div>
               </button>
            </div>
          </section>
        )}

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
