import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantWidget from './AIAssistantWidget';
import { supabase } from '../utils/supabaseClient';
import { Camera, Edit2, Save, X, Instagram, Facebook, Youtube } from 'lucide-react';
import EquipmentSelector from './EquipmentSelector';

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
  
  // Tabs state
  const TABS = ['Resumen', 'Mis Equipos', 'Configuración']; // Removed 'Historial de Servicios'
  const [activeTab, setActiveTab] = useState('Resumen');

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<NotificationPref[]>([
      { category: 'eventos', enabled: true },
      { category: 'mi_equipo', enabled: true },
      { category: 'novedades', enabled: true },
      { category: 'promociones', enabled: true },
      { category: 'carrito', enabled: true }
  ]);

  // Gear state
  const [userEquipment, setUserEquipment] = useState<any[]>([]);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);

  // Profile Edit state
  const [profileData, setProfileData] = useState({
      birthday: '',
      instagram: '',
      facebook: '',
      youtube: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
      if (activeTab === 'Mis Equipos' && user.id) {
          fetchUserEquipment(user.id);
      }
  }, [activeTab, user.id]);

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
        
        setProfileData({
            birthday: profile.birthday || '',
            instagram: profile.instagram || '',
            facebook: profile.facebook || '',
            youtube: profile.youtube || ''
        });
        
        // Load Preferences
        const { data: prefs } = await supabase
            .from('user_notification_preferences')
            .select('category, enabled')
            .eq('user_id', session.user.id);
        
        if (prefs && prefs.length > 0) {
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

  const fetchUserEquipment = async (userId: string) => {
      const { data } = await supabase.from('user_equipment').select('*').eq('user_id', userId);
      if (data) setUserEquipment(data);
  };

  const fetchNotifications = async (_userId: string, userPrefs: any[]) => {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) {
           const validData = data.filter(n => {
               const pref = userPrefs.find((p: any) => p.category === n.category);
               if (pref && pref.enabled === false) return false;
               return true;
           });
           setNotifications(validData);
      }
  };

  const togglePreference = async (category: string) => {
      const newPrefs = preferences.map(p => p.category === category ? { ...p, enabled: !p.enabled } : p);
      setPreferences(newPrefs);
      const targetPref = newPrefs.find(p => p.category === category);
      if (targetPref) {
          await supabase.from('user_notification_preferences').upsert({
              user_id: user.id,
              category: category,
              enabled: targetPref.enabled
          });
      }
      
      // Update notifications list
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) {
           const validData = data.filter(n => {
               const pref = newPrefs.find(p => p.category === n.category);
               return pref ? pref.enabled : true;
           });
           setNotifications(validData);
      }
  };

  const handleUpdateProfile = async () => {
      try {
          const { error } = await supabase.from('profiles').update({
              birthday: profileData.birthday || null,
              instagram: profileData.instagram,
              facebook: profileData.facebook,
              // youtube: profileData.youtube
          }).eq('id', user.id);

          if (error) throw error;
          setIsEditingProfile(false);
          alert('Perfil actualizado correctamente');
      } catch (error) {
          console.error('Error updating profile:', error);
          alert('Error al actualizar el perfil');
      }
  };

  const handleUpdatePassword = async () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
          setPasswordMessage("Las contraseñas no coinciden");
          return;
      }
      if (passwordData.newPassword.length < 6) {
          setPasswordMessage("La contraseña debe tener al menos 6 caracteres");
          return;
      }

      try {
          const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
          if (error) throw error;
          setPasswordMessage("Contraseña actualizada correctamente");
          setPasswordData({ newPassword: '', confirmPassword: '' });
      } catch (error) {
          console.error('Error updating password:', error);
          setPasswordMessage("Error al actualizar contraseña");
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
      case 'carrito': return 'shopping_cart';
      default: return 'notifications';
    }
  };

  // Render Content based on activeTab
  const renderContent = () => {
      switch (activeTab) {
          case 'Resumen':
              return (
                  <div>
                      <div className="mb-8">
                          <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
                          <p className="text-nikon-text">Bienvenido a tu espacio personal Nikon.</p>
                      </div>

                      {/* Notificaciones (Short list) */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-nikon-yellow">notifications_active</span> Notificaciones Recientes
                          </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                          {notifications.length === 0 && <p className="text-gray-400">No tienes notificaciones en tus categorías activas.</p>}
                          {notifications.map(n => (
                            <div key={n.id} className="relative p-4 rounded-xl border bg-nikon-surface border-nikon-border transition-all">
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
              );
          
          case 'Mis Equipos':
              return (
                  <div>
                      <div className="flex justify-between items-center mb-8">
                          <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Mis Equipos</h1>
                            <p className="text-nikon-text">Gestiona tu colección Nikon.</p>
                          </div>
                      </div>

                      {showEquipmentSelector ? (
                          <div className="bg-nikon-surface p-6 rounded-xl border border-nikon-border">
                              <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Agregar Equipo</h3>
                                <button onClick={() => setShowEquipmentSelector(false)} className="text-gray-400 hover:text-white"><X /></button>
                              </div>
                              <EquipmentSelector userId={user.id} onClose={() => {
                                  setShowEquipmentSelector(false);
                                  fetchUserEquipment(user.id); // Refresh list
                              }} />
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {userEquipment.map((item) => (
                                  <div key={item.id} className="bg-nikon-surface border border-nikon-border rounded-xl p-4 flex gap-4 items-center">
                                      <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                                          {item.image_url ? (
                                              <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain" />
                                          ) : (
                                              <Camera size={24} className="text-gray-600" />
                                          )}
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-white">{item.product_name}</h4>
                                          <p className="text-xs text-gray-400">S/N: {item.serial_number || 'N/A'}</p>
                                      </div>
                                  </div>
                              ))}
                              
                              <button 
                                  onClick={() => setShowEquipmentSelector(true)}
                                  className="border border-dashed border-nikon-border hover:border-nikon-yellow/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-nikon-yellow hover:bg-white/5 transition-all min-h-[100px]"
                              >
                                  <span className="text-2xl font-light">+</span>
                                  <span className="text-sm font-medium">Agregar equipo</span>
                              </button>
                          </div>
                      )}
                  </div>
              );

          case 'Configuración':
              return (
                  <div>
                      <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
                        <p className="text-nikon-text">Administra tus preferencias y datos personales.</p>
                      </div>

                      {/* Notificaciones */}
                      <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Notificaciones</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {preferences.filter(p => !['carrito'].includes(p.category)).map(pref => (
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

                      {/* Personal Info */}
                      <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6 mb-6">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-bold text-white">Datos Personales</h2>
                              <button 
                                  onClick={() => isEditingProfile ? handleUpdateProfile() : setIsEditingProfile(true)}
                                  className="text-nikon-yellow text-sm hover:underline flex items-center gap-1"
                              >
                                  {isEditingProfile ? <><Save size={16} /> Guardar</> : <><Edit2 size={16} /> Editar</>}
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                                  <input type="text" value={`${user.firstName} ${user.lastName}`} disabled className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-gray-400 cursor-not-allowed" />
                              </div>
                              <div>
                                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                                  <input type="text" value={user.email} disabled className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-gray-400 cursor-not-allowed" />
                              </div>
                              <div>
                                  <label className="block text-xs text-gray-400 mb-1">Fecha de Nacimiento</label>
                                  <input 
                                      type="date" 
                                      value={profileData.birthday} 
                                      onChange={e => setProfileData({...profileData, birthday: e.target.value})}
                                      disabled={!isEditingProfile}
                                      className={`w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white ${!isEditingProfile && 'text-gray-400'}`} 
                                  />
                              </div>
                              
                              <div className="md:col-span-2">
                                  <label className="block text-xs text-gray-400 mb-2">Redes Sociales</label>
                                  <div className="space-y-3">
                                      <div className="flex gap-2 items-center">
                                          <Instagram size={18} className="text-pink-500" />
                                          <input 
                                              type="text" 
                                              placeholder="Instagram Username" 
                                              value={profileData.instagram}
                                              onChange={e => setProfileData({...profileData, instagram: e.target.value})}
                                              disabled={!isEditingProfile}
                                              className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                          />
                                      </div>
                                      <div className="flex gap-2 items-center">
                                          <Facebook size={18} className="text-blue-500" />
                                          <input 
                                              type="text" 
                                              placeholder="Facebook Username" 
                                              value={profileData.facebook}
                                              onChange={e => setProfileData({...profileData, facebook: e.target.value})}
                                              disabled={!isEditingProfile}
                                              className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm"
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Password Change */}
                      <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
                          <h2 className="text-xl font-bold text-white mb-4">Cambiar Contraseña</h2>
                          <div className="flex flex-col gap-4 max-w-md">
                              <input 
                                  type="password" 
                                  placeholder="Nueva contraseña" 
                                  value={passwordData.newPassword}
                                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                  className="bg-black/30 border border-white/10 rounded px-4 py-2 text-white"
                              />
                              <input 
                                  type="password" 
                                  placeholder="Confirmar contraseña" 
                                  value={passwordData.confirmPassword}
                                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                  className="bg-black/30 border border-white/10 rounded px-4 py-2 text-white"
                              />
                              {passwordMessage && <p className={`text-sm ${passwordMessage.includes('correctamente') ? 'text-green-500' : 'text-red-500'}`}>{passwordMessage}</p>}
                              <button 
                                  onClick={handleUpdatePassword}
                                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors self-start"
                              >
                                  Actualizar Contraseña
                              </button>
                          </div>
                      </div>
                  </div>
              );
          default:
              return null;
      }
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
          </div>

          <nav className="flex flex-col gap-1">
            {TABS.map((item) => (
              <button 
                key={item} 
                onClick={() => setActiveTab(item)}
                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item ? 'bg-nikon-surface text-white border-l-4 border-nikon-yellow' : 'text-nikon-text hover:bg-nikon-surface hover:text-white'}`}
              >
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
            {renderContent()}
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
