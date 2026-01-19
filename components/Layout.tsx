import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import AIAssistantWidget from './AIAssistantWidget';

// ⚠️ IMPORTANTE: Añade tu email aquí para ver el botón de Admin
const ADMIN_EMAILS = ['apacheco@nikoncenter.cl', 'admin@nikon.cl']; 

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-nikon-yellow">MY NIKON</h3>
              <p className="text-gray-400">Desbloquea tu potencial creativo con talleres exclusivos, tutoriales y eventos de la comunidad.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Explorar</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/workshops" className="hover:text-nikon-yellow transition-colors">Talleres</Link></li>
                <li><Link to="/benefits" className="hover:text-nikon-yellow transition-colors">Beneficios</Link></li>
                <li><Link to="/gear" className="hover:text-nikon-yellow transition-colors">Recomendaciones</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Comunidad</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/tutorials" className="hover:text-nikon-yellow transition-colors">Tutoriales</Link></li>
                <li><a href="#" className="hover:text-nikon-yellow transition-colors">Foro</a></li>
                <li><a href="#" className="hover:text-nikon-yellow transition-colors">Eventos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/services" className="hover:text-nikon-yellow transition-colors">Servicio Técnico</Link></li>
                <li><a href="#" className="hover:text-nikon-yellow transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-nikon-yellow transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Nikon Corp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* AI Assistant Widget */}
      <AIAssistantWidget />
    </div>
  );
};

export default Layout;
