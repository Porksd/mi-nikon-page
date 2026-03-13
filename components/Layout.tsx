import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Menu, X, User, LogOut, Settings, Instagram, Facebook, Youtube, ShoppingCart as ShoppingCartIcon, Bell, MessageSquare, Download } from 'lucide-react';
import AIAssistantWidget from './AIAssistantWidget';
import ProfileCompletionModal from './ProfileCompletionModal';
import FeedbackModal from './FeedbackModal';
import { TUTORIALS_DATA, SERVICES_DATA, NIKON_CONTACT } from '../utils/appData';
import { getOrCreateActiveCart } from '../utils/cartService';

// ⚠️ IMPORTANTE: Añade tu email aquí para ver el botón de Admin
const ADMIN_EMAILS = [
  'apacheco@nikoncenter.cl', 
  'admin@nikon.cl',
  'efuentes@nikoncenter.cl',
  'andres.comastri@udenio.com',
  'gabriel.taito@udenio.com'
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [aiContext, setAiContext] = useState<string>("");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Profile completion modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  
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

      // 3. User Gear - Include ALL gear (registered or not, by user_id OR email)
      // Philosophy: If you're Nikon, you're family - regardless of where you bought
      if (userId) {
        try {
          // Get user's email for matching
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const userEmail = authUser?.email;
          
          // Query matching either user_id or email (same as Gear.tsx and Benefits.tsx)
          // FASE 2: Usar nueva tabla user_equipment
          const { data: userGear } = await supabase
            .from('user_equipment')
            .select('product_name')
            .eq('user_id', userId);
            
          if (userGear && userGear.length > 0) {
            const gearNames = userGear.map((item: any) => item.product_name).filter(Boolean);
            context += `Equipo que YA TIENE (Seleccionado por usuario): ${gearNames.join(', ')}\n`;
          }

          // Legacy check for user_products (optional, keep for backward compatibility or merged)
          /*
          let query = supabase.from('user_products').select('products(name)');
          if (userEmail) {
            query = query.or(`user_id.eq.${userId},customer_email.eq.${userEmail}`);
          } else {
            query = query.eq('user_id', userId);
          }
          const { data: legacyGear } = await query;
          */

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
        loadCartCount(session.user.id, session.user.email || '');
        loadNotifications(session.user.id);
      } else {
        fetchAIChatContext(null);
        setCartItemsCount(0);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchAIChatContext(session.user.id);
        loadCartCount(session.user.id, session.user.email || '');
        loadNotifications(session.user.id);
      } else {
        setUserProfile(null);
        fetchAIChatContext(null);
        setCartItemsCount(0);
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // PWA Install Prompt Logic
  useEffect(() => {
    // Check if app was previously installed or running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (localStorage.getItem('isAppInstalled') === 'true' || isStandalone) {
      if (isStandalone) {
        localStorage.setItem('isAppInstalled', 'true');
      }
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Prevent standard mini-infobar
      setDeferredPrompt(e);
      setShowInstallButton(true);
      setIsAppInstalled(false); // If prompt shows, it is not installed
      localStorage.removeItem('isAppInstalled');
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      localStorage.setItem('isAppInstalled', 'true');
      console.log('App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Update App Badge (PWA) when unread count changes
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch((e) => console.error("Error setting badge:", e));
      } else {
        navigator.clearAppBadge().catch((e) => console.error("Error clearing badge:", e));
      }
    }
  }, [unreadCount]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };
  
  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.relative')) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
      
      // Check profile completion and show modal if incomplete
      checkProfileCompletion(userId);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  // Check if profile is complete and show modal if needed
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_profile_completion_status', {
        p_user_id: userId
      });
      
      if (error) throw error;
      
      // Show modal if profile is not complete and there are missing fields
      if (!data.completed && data.missing_fields && data.missing_fields.length > 0) {
        setMissingFields(data.missing_fields);
        // Show modal after a short delay for better UX
        setTimeout(() => {
          setShowProfileModal(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const loadCartCount = async (userId: string, email: string) => {
    const cart = await getOrCreateActiveCart(userId, email);
    setCartItemsCount(cart?.items_count || 0);
  };
  
  // Load user notifications
  const loadNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      
      if (error) throw error;
      
      setNotifications(data || []);
      const unread = (data || []).filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
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
              MI NIKON
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link to="/" className={`${isActive('/') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Inicio</Link>
              <Link to="/gear" className={`${isActive('/gear') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Mi Equipo</Link>
              <Link to="/benefits" className={`${isActive('/benefits') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Mi Espacio</Link>
              <Link to="/workshops" className={`${isActive('/workshops') ? 'text-nikon-yellow' : 'text-gray-300 hover:text-white'} transition-colors`}>Actividades</Link>
              
              {/* Admin Link - Restricted */}
              {isAdmin && (
                <Link to="/admin" className={`${isActive('/admin') ? 'text-nikon-yellow' : 'text-red-400 hover:text-red-300'} font-semibold flex items-center gap-1 transition-colors`}>
                  <Settings size={16} /> Admin
                </Link>
              )}
              
              {/* Cart Icon - OCULTO PARA FASE 1.0 */}
              {false && user && (
                <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white transition-colors">
                  <ShoppingCartIcon size={24} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-nikon-yellow text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {/* PWA Install Button (Desktop) */}
              {showInstallButton && (
                 <div className="relative group">
                    {showInstallButton ? (
                      <>
                        <button
                          onClick={handleInstallClick}
                          className="p-2 text-nikon-yellow hover:text-white transition-colors focus:outline-none animate-pulse flex flex-col items-center"
                        >
                          <Download size={24} />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute right-0 top-full mt-2 w-40 bg-nikon-surface border border-nikon-yellow/30 text-white text-xs font-bold rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none z-50">
                            <span className="text-nikon-yellow block mb-1">¡Mejor experiencia!</span>
                            Instala nuestra App
                            <div className="absolute -top-1 right-3 w-2 h-2 bg-nikon-surface border-t border-l border-nikon-yellow/30 transform rotate-45"></div>
                        </div>
                      </>
                    ) : (
                        <div className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-default select-none shadow-md">
                            <div className="w-5 h-5 bg-nikon-yellow flex items-center justify-center text-[10px] font-bold text-black rounded-sm shadow-sm flex-shrink-0">N</div>
                            <span className="text-xs font-bold whitespace-nowrap">Abrir en la app</span>
                        </div>
                    )}
                 </div>
              )}
              {/* Notifications Bell */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                  >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-nikon-surface border border-nikon-border rounded-xl shadow-2xl overflow-hidden z-50">
                      {/* Header */}
                      <div className="bg-nikon-black border-b border-nikon-border p-4 flex justify-between items-center">
                        <h3 className="text-white font-bold">Notificaciones</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-nikon-yellow hover:text-yellow-400 transition-colors"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                      
                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell size={48} className="mx-auto mb-3 opacity-30" />
                            <p>No tienes notificaciones</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                if (!notification.read) {
                                  markAsRead(notification.id);
                                }
                                if (notification.link) {
                                  navigate(notification.link);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-4 border-b border-nikon-border cursor-pointer transition-colors ${
                                notification.read
                                  ? 'bg-nikon-surface hover:bg-nikon-border/30'
                                  : 'bg-nikon-yellow/10 hover:bg-nikon-yellow/20'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-nikon-yellow rounded-full flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className={`text-xs ${notification.read ? 'text-gray-500' : 'text-gray-300'}`}>
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-600 mt-1 block">
                                {new Date(notification.created_at).toLocaleDateString('es-CL', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Button (moved outside dropdown) */}
              {user && (
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
                  title="Danos tu opinión"
                >
                  <MessageSquare size={24} />
                </button>
              )}
              
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
              <Link to="/gear" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Mi Equipo</Link>
              <Link to="/benefits" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Mi Espacio</Link>
              <Link to="/workshops" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Actividades</Link>
              
              {/* PWA Install Button (Mobile) */}
              {showInstallButton && (
                <button 
                  onClick={() => {
                    if (showInstallButton) {
                        handleInstallClick();
                    }
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-bold flex items-center gap-2 
                    ${showInstallButton ? 'text-nikon-yellow hover:text-white hover:bg-gray-800 animate-pulse' : 'text-gray-300 hover:text-white'}`}
                >
                  {showInstallButton ? (
                    <>
                      <Download size={20} />
                      Instalar App
                    </>
                  ) : (
                    <>
                        <div className="w-5 h-5 bg-nikon-yellow flex items-center justify-center text-[10px] font-bold text-black rounded-sm shadow-sm flex-shrink-0">N</div>
                        Abrir en la app
                    </>
                  )}
                </button>
              )}
              {/* Services - OCULTO PARA FASE 1.0 */}
              {/* <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Servicios</Link> */}
              
              {/* Cart - OCULTO PARA FASE 1.0 */}
              {false && user && (
                <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-nikon-yellow hover:text-yellow-400 hover:bg-gray-800 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCartIcon size={20} /> 
                  Mi Carrito {cartItemsCount > 0 && `(${cartItemsCount})`}
                </Link>
              )}

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
                    <button onClick={() => { setIsFeedbackOpen(true); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2">
                        <MessageSquare size={16} /> Danos tu opinión
                    </button>
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
              <h3 className="text-xl font-bold mb-4 text-nikon-yellow">MI NIKON</h3>
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
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} userId={user?.id} />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={() => {
          // Reload profile after completion
          if (user) {
            fetchUserProfile(user.id);
          }
        }}
        missingFields={missingFields}
      />
    </div>
  );
};

export default Layout;
