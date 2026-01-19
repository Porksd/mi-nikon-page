import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantWidget from './AIAssistantWidget';
import { supabase } from '../utils/supabaseClient';

interface NotificationPref {
    category: string;
    enabled: boolean;
}

const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ id: '', firstName: '', lastName: '', email: '' });

  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiContext, setAiContext] = useState('');
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<NotificationPref[]>([
      { category: 'eventos', enabled: true },
      { category: 'mi_equipo', enabled: true },
      { category: 'novedades', enabled: true },
      { category: 'promociones', enabled: true }
  ]);

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Fetch Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        setUser({
          id: session.user.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: session.user.email || ''
        });
        
        // Load Preferences
        const { data: prefs } = await supabase
            .from('user_notification_preferences')
            .select('category, enabled')
            .eq('user_id', session.user.id);
        
        if (prefs && prefs.length > 0) {
            // Merge with defaults
            setPreferences(prev => prev.map(p => {
                const found = prefs.find((dbP: any) => dbP.category === p.category);
                return found ? found : p;
            }));
        }

        // Fetch Notifications
        fetchNotifications(session.user.id, prefs || []);
      }
      setLoading(false);
  };

  const fetchNotifications = async (_userId: string, userPrefs: any[]) => {
      // Get all notifications
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      
      if (data) {
          // Client-side filter based on categories
          // Build a map of disabled categories
          const disabledCats = new Set();
           // Note: userPrefs might be partial
           // If we have local state aligned, we can use that, but here we passed db prefs.
           // Let's use the local state 'preferences' logic which effectively defaults to true.
           
           // Actually, easiest is to filter based on the *current* state we just loaded or default to true?
           // We will re-filter when preferences change.
           
           // For initial load, we do this:
           const validData = data.filter(n => {
               // Check if user explicitly disabled this category
               const pref = userPrefs.find((p: any) => p.category === n.category);
               if (pref && pref.enabled === false) return false;
               return true; // Default enabled
           });
           setNotifications(validData);
      }
  };

  const togglePreference = async (category: string) => {
      const newPrefs = preferences.map(p => p.category === category ? { ...p, enabled: !p.enabled } : p);
      setPreferences(newPrefs);

      const targetPref = newPrefs.find(p => p.category === category);
      
      // Upsert to DB
      if (targetPref) {
          await supabase.from('user_notification_preferences').upsert({
              user_id: user.id,
              category: category,
              enabled: targetPref.enabled
          });
      }

      // Refresh notifications list based on new filter
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) {
           const validData = data.filter(n => {
               const pref = newPrefs.find(p => p.category === n.category);
               return pref ? pref.enabled : true; 
           });
           setNotifications(validData);
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'mi_equipo': return 'system_update';
      case 'eventos': return 'event';
      case 'promociones': return 'local_offer';
      default: return 'notifications';
    }
  };

  const openAIWithContext = (context: string) => {
    setAiContext(context);
    setIsAIOpen(true);
  };

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 relative">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex flex-col gap-2">
          <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6 mb-4 text-center">
             <div className="w-20 h-20 mx-auto rounded-full bg-cover border-2 border-nikon-yellow mb-3 bg-gray-700 flex items-center justify-center">
                 <span className="material-symbols-outlined text-4xl text-white">person</span>
             </div>
            <h2 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h2>
            <p className="text-xs text-nikon-text">{user.email}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-nikon-yellow/20 text-nikon-yellow text-xs font-bold rounded-full">Nikon Pro</div>
          </div>

          <nav className="flex flex-col gap-1">
            {['Resumen', 'Mis Equipos', 'Historial de Servicios', 'Configuración'].map((item, i) => (
              <button key={i} className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-nikon-surface text-white border-l-4 border-nikon-yellow' : 'text-nikon-text hover:bg-nikon-surface hover:text-white'}`}>
                {item}
              </button>
            ))}
            <button onClick={handleLogout} className="text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-nikon-surface hover:text-red-300 transition-colors mt-4">
              Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* Main Dashboard */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
            <p className="text-nikon-text">Bienvenido a tu espacio personal Nikon.</p>
          </div>

          {/* Settings Section */}
           <div className="mb-8 bg-nikon-surface border border-nikon-border rounded-xl p-6">
              <h2 className="text-xl font-serif text-white mb-4">Configuración de Notificaciones</h2>
              <p className="text-sm text-gray-400 mb-4">Selecciona qué tipo de novedades te gustaría recibir.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {preferences.map(pref => (
                      <div key={pref.category} className="flex items-center justify-between bg-black/30 p-4 rounded-lg border border-white/5">
                          <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-nikon-yellow">{getIcon(pref.category)}</span>
                              <span className="capitalize text-white font-medium">{pref.category.replace('_', ' ')}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={pref.enabled} onChange={() => togglePreference(pref.category)} />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nikon-yellow"></div>
                          </label>
                      </div>
                  ))}
              </div>
          </div>

          {/* Notifications List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-nikon-yellow">notifications_active</span> Notificaciones Recientes
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {notifications.length === 0 && <p className="text-gray-400">No tienes notificaciones en tus categorías activas.</p>}
              {notifications.map(n => (
                <div key={n.id}
                  className="relative p-4 rounded-xl border bg-nikon-surface border-nikon-border transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-nikon-yellow/10 text-nikon-yellow">
                      <span className="material-symbols-outlined">{getIcon(n.category)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-white">{n.title}</h4>
                        <span className="text-xs text-nikon-text">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-nikon-text mt-1">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AIAssistantWidget
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onToggle={() => setIsAIOpen(!isAIOpen)}
        context={aiContext}
        variant="floating"
      />
    </div>
  );
};

export default MyAccount;
