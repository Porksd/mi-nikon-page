import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Menu, X, User, LogOut, Settings, Instagram, Facebook, Youtube } from 'lucide-react';
import AIAssistantWidget from './AIAssistantWidget';
import { TUTORIALS_DATA, SERVICES_DATA, NIKON_CONTACT } from '../utils/appData';

// ⚠️ IMPORTANTE: Añade tu email aquí para ver el botón de Admin
const ADMIN_EMAILS = ['apacheco@nikoncenter.cl', 'admin@nikon.cl'];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [aiContext, setAiContext] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  const fetchAIChatContext = async (userId: string | null) => {
    try {
      let context = `Información del Sitio:\n`;

      if (Array.isArray(TUTORIALS_DATA)) {
        context += `- Tutoriales: ${TUTORIALS_DATA.map(t => t.title).join(', ')}\n`;
      }

      if (Array.isArray(SERVICES_DATA)) {
        context += `- Servicios: ${SERVICES_DATA.map(s => `${s.name} (${s.price})`).join(', ')}\n`;
      }

      if (NIKON_CONTACT) {
        context += `- Contacto: ${NIKON_CONTACT.web}, Instagram: ${NIKON_CONTACT.instagram}\n\n`;
      }

      // 1. Fetch Workshops from DB
      try {
        const { data: workshops } = await supabase.from('workshops').select('title, date, location').limit(5);
        if (workshops && workshops.length > 0) {
          context += `PRÓXIMOS WORKSHOPS:\n${workshops.map(w => `- ${w.title} (${w.date} en ${w.location})`).join('\n')}\n\n`;
        }
      } catch (e) { console.error("Error fetching workshops for context", e); }

      // 2. Fetch Available Products (Catalog)
      try {
        const { data: catalog } = await supabase.from('products').select('name').limit(20);
        if (catalog && catalog.length > 0) {
          const catalogNames = catalog.map(p => p.name).join(', ');
          context += `Catálogo DISPONIBLE: ${catalogNames}\n\n`;
        }
      } catch (e) { console.error("Error fetching catalog for context", e); }

      // 3. User Gear
      if (userId) {
        try {
          const { data: userGear } = await supabase.from('user_products').select('products(name)').eq('user_id', userId);
          if (userGear && userGear.length > 0) {
            const gearNames = userGear.map((item: any) => item.products?.name).filter(Boolean);
            context += `Equipo que YA TIENE: ${gearNames.join(', ')}\n`;
          }
        } catch (e) { console.error("Error fetching user gear for context", e); }
      }

      setAiContext(context);
    } catch (err) {
      console.error("Critical error building AI context:", err);
      setAiContext("Error loading context.");
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchAIChatContext(session.user.id);
      } else {
        fetchAIChatContext(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchAIChatContext(session.user.id);
      } else {
        setUserProfile(null);
        fetchAIChatContext(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Check if current user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  return (
    <div className="min-h-screen bg-nikon-black text-gray-300 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-nikon-black text-white shadow-lg sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold tracking-tighter text-nikon-yellow">
              MY NIKON
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link to="/" className={`${isActive('/') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Inicio</Link>
              <Link to="/workshops" className={`${isActive('/workshops') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Talleres</Link>
              <Link to="/benefits" className={`${isActive('/benefits') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Beneficios</Link>
              <Link to="/gear" className={`${isActive('/gear') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Equipo</Link>
              <Link to="/tutorials" className={`${isActive('/tutorials') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Tutoriales</Link>
              <Link to="/services" className={`${isActive('/services') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Soporte</Link>

              {/* Admin Link - Restricted */}
              {isAdmin && (
                <Link to="/admin" className={`${isActive('/admin') ? 'text-nikon-yellow' : 'text-red-400 hover:text-red-300'} font-semibold flex items-center gap-1 transition-colors`}>
                  <Settings size={16} /> Admin
                </Link>
              )}
            </div>

            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-nikon-yellow text-nikon-black flex items-center justify-center font-bold">
                      {userProfile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span>{userProfile?.first_name || 'Mi Cuenta'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right text-gray-800">
                    <Link to="/account" className="block px-4 py-2 hover:bg-gray-100 flex items-center">
                      <User size={16} className="mr-2" /> Perfil
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center">
                      <LogOut size={16} className="mr-2" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium bg-nikon-yellow text-nikon-black rounded hover:bg-yellow-400 transition-colors">Registrarse</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-nikon-black border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
              <Link to="/workshops" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Talleres</Link>
              <Link to="/benefits" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Beneficios</Link>
              <Link to="/gear" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Equipo</Link>
              <Link to="/tutorials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Tutoriales</Link>
              <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Soporte</Link>

              {isAdmin && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>
              )}

              <div className="border-t border-gray-700 my-2 pt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 flex items-center space-x-2 text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-nikon-yellow text-nikon-black flex items-center justify-center font-bold">
                        {userProfile?.first_name?.[0] || 'U'}
                      </div>
                      <span>{userProfile?.first_name || user.email}</span>
                    </div>
                    <Link to="/account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Mi Cuenta</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-400 hover:bg-gray-800">Cerrar Sesión</button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-3">
                    <Link to="/login" className="block text-center px-3 py-2 rounded-md text-base font-medium bg-gray-800 text-white" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link>
                    <Link to="/register" className="block text-center px-3 py-2 rounded-md text-base font-medium bg-nikon-yellow text-nikon-black" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-nikon-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4 text-nikon-yellow">MY NIKON</h3>
              <p className="text-gray-400 max-w-md">Desbloquea tu potencial creativo con talleres exclusivos, tutoriales y eventos de la comunidad.</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="https://www.instagram.com/nikonchile/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-nikon-yellow transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://www.facebook.com/NikonChileOficial/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-nikon-yellow transition-colors">
                <Facebook size={24} />
              </a>
              <a href="https://www.youtube.com/user/NikonChileOficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-nikon-yellow transition-colors">
                <Youtube size={24} />
              </a>
              <a href="https://www.tiktok.com/@nikonchile" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-nikon-yellow transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide lucide-music"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Udenio.cl. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* AI Assistant Widget */}
      <AIAssistantWidget context={aiContext} />
    </div>
  );
};

export default Layout;
