import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface Workshop {
  id: string;
  title: string;
  description: string;
  teacher: string;
  date: string;
  time: string;
  location: string;
  total_spots: number;
  image_url: string;
}

interface Notification {
    title: string;
    message: string;
    category: string;
    created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'workshops' | 'notifications'>('activity');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [productRegistrations, setProductRegistrations] = useState<any[]>([]);

  // Workshop Form State
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState<Partial<Workshop>>({});

  // Notification Form State
  const [newNotification, setNewNotification] = useState({ title: '', message: '', category: 'novedades' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'workshops') {
            const { data } = await supabase.from('workshops').select('*').order('date', { ascending: true });
            if (data) setWorkshops(data);
        } else if (activeTab === 'activity') {
             // Workshop Inscriptions
             const { data: inscriptions } = await supabase
                .from('workshop_registrations')
                .select('created_at, workshop:workshops(title), profile:profiles(first_name, last_name, id)')
                .order('created_at', { ascending: false })
                .limit(20);
             if (inscriptions) setRecentRegistrations(inscriptions);

             // Product Registrations
             const { data: products } = await supabase
                .from('user_products')
                .select('serial_number, purchase_date, product:products(name)')
                .order('purchase_date', { ascending: false })
                .limit(20);
             if (products) setProductRegistrations(products);

        } else if (activeTab === 'notifications') {
            const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
            if (data) setNotifications(data);
        }
    } catch (error) {
        console.error("Error fetching data", error);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateWorkshop = async () => {
      const { error } = await supabase.from('workshops').insert([newWorkshop]);
      if (!error) {
          setShowWorkshopForm(false);
          setNewWorkshop({});
          fetchData();
      } else {
          alert('Error creating workshop: ' + error.message);
      }
  };

  const handleSendNotification = async () => {
      const { error } = await supabase.from('notifications').insert([newNotification]);
      if (!error) {
          setNewNotification({ title: '', message: '', category: 'novedades' });
          fetchData();
          alert('Notificación enviada');
      } else {
          alert('Error: ' + error.message);
      }
  };

  const deleteWorkshop = async (id: string) => {
      if(!confirm('¿Estás seguro de eliminar este workshop?')) return;
      await supabase.from('workshops').delete().eq('id', id);
      fetchData();
  };

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black font-display">Panel de Administración</h1>
        <div className="flex gap-2">
            {['activity', 'workshops', 'notifications'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${
                        activeTab === tab ? 'bg-nikon-yellow text-black' : 'bg-nikon-surface hover:bg-white/10'
                    }`}
                >
                    {tab === 'activity' ? 'Actividad' : tab === 'workshops' ? 'Workshops' : 'Notificaciones'}
                </button>
            ))}
        </div>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-nikon-surface p-6 rounded-xl border border-nikon-border">
                  <h2 className="text-xl font-bold mb-4 text-nikon-yellow">Últimas Inscripciones a Workshops</h2>
                  <div className="flex flex-col gap-3">
                      {recentRegistrations.length === 0 && <p className="text-gray-400">No hay inscripciones recientes.</p>}
                      {recentRegistrations.map((reg: any, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                              <div>
                                  <p className="font-bold">{reg.workshop?.title}</p>
                                  <p className="text-sm text-gray-400">{reg.profile ? `${reg.profile.first_name} ${reg.profile.last_name}` : 'Usuario'}</p>
                              </div>
                              <span className="text-xs text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-nikon-surface p-6 rounded-xl border border-nikon-border">
                  <h2 className="text-xl font-bold mb-4 text-nikon-yellow">Registro de Productos Recientes</h2>
                   <div className="flex flex-col gap-3">
                      {productRegistrations.length === 0 && <p className="text-gray-400">No hay registros recientes.</p>}
                      {productRegistrations.map((prod: any, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                              <div>
                                  <p className="font-bold">{prod.product?.name || 'Producto Desconocido'}</p>
                                  <p className="text-sm text-gray-400 block font-mono">SN: {prod.serial_number}</p>
                              </div>
                              <span className="text-xs text-gray-500">{new Date(prod.purchase_date).toLocaleDateString()}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {!loading && activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-nikon-surface p-6 rounded-xl border border-nikon-border h-fit">
                  <h2 className="text-xl font-bold mb-4">Nueva Notificación</h2>
                  <div className="flex flex-col gap-4">
                      <input 
                        type="text" 
                        placeholder="Título" 
                        value={newNotification.title}
                        onChange={e => setNewNotification({...newNotification, title: e.target.value})}
                        className="bg-black/50 border border-nikon-border rounded p-3 text-white"
                      />
                      <textarea 
                        placeholder="Mensaje" 
                        value={newNotification.message}
                        onChange={e => setNewNotification({...newNotification, message: e.target.value})}
                        className="bg-black/50 border border-nikon-border rounded p-3 text-white h-32"
                      />
                      <select 
                        value={newNotification.category}
                        onChange={e => setNewNotification({...newNotification, category: e.target.value})}
                        className="bg-black/50 border border-nikon-border rounded p-3 text-white"
                      >
                          <option value="novedades">Novedades</option>
                          <option value="eventos">Eventos</option>
                          <option value="promociones">Promociones</option>
                          <option value="mi_equipo">Mi Equipo</option>
                      </select>
                      <button 
                        onClick={handleSendNotification}
                        className="bg-nikon-yellow text-black font-bold py-3 rounded hover:brightness-110 transition-all"
                      >
                          Enviar Notificación
                      </button>
                  </div>
              </div>
              <div className="lg:col-span-2 bg-nikon-surface p-6 rounded-xl border border-nikon-border">
                  <h2 className="text-xl font-bold mb-4">Historial de Notificaciones</h2>
                  <div className="space-y-4">
                      {notifications.map((notif, i) => (
                          <div key={i} className="p-4 border border-white/10 rounded bg-black/20">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-lg">{notif.title}</h3>
                                  <span className="text-xs uppercase bg-white/10 px-2 py-1 rounded text-nikon-yellow">{notif.category}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-2 text-right">{new Date(notif.created_at).toLocaleString()}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {!loading && activeTab === 'workshops' && (
          <div className="flex flex-col gap-8">
              {!showWorkshopForm ? (
                  <button 
                    onClick={() => setShowWorkshopForm(true)}
                    className="w-full sm:w-auto bg-nikon-yellow text-black font-bold py-3 px-6 rounded hover:brightness-110 transition-all self-end"
                  >
                      + Nuevo Workshop
                  </button>
              ) : (
                  <div className="bg-nikon-surface p-6 rounded-xl border border-nikon-border animate-fade-in">
                      <h2 className="text-2xl font-bold mb-6">Crear Nuevo Workshop</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <input type="text" placeholder="Título" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             onChange={e => setNewWorkshop({...newWorkshop, title: e.target.value})} />
                          <input type="text" placeholder="Profesor" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             onChange={e => setNewWorkshop({...newWorkshop, teacher: e.target.value})} />
                          <input type="date" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             onChange={e => setNewWorkshop({...newWorkshop, date: e.target.value})} />
                          <input type="time" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             onChange={e => setNewWorkshop({...newWorkshop, time: e.target.value})} />
                          <input type="text" placeholder="Ubicación" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             onChange={e => setNewWorkshop({...newWorkshop, location: e.target.value})} />
                          <input type="number" placeholder="Cupos Totales" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             onChange={e => setNewWorkshop({...newWorkshop, total_spots: parseInt(e.target.value)})} />
                          <input type="text" placeholder="URL Imagen" className="bg-black/50 border border-nikon-border rounded p-3 text-white md:col-span-2" 
                             onChange={e => setNewWorkshop({...newWorkshop, image_url: e.target.value})} />
                          <textarea placeholder="Reseña / Descripción" className="bg-black/50 border border-nikon-border rounded p-3 text-white md:col-span-2 h-32"
                             onChange={e => setNewWorkshop({...newWorkshop, description: e.target.value})}></textarea>
                      </div>
                      <div className="flex gap-4">
                          <button onClick={handleCreateWorkshop} className="bg-nikon-yellow text-black font-bold py-3 px-6 rounded">Guardar</button>
                          <button onClick={() => setShowWorkshopForm(false)} className="bg-transparent border border-white/20 text-white font-bold py-3 px-6 rounded">Cancelar</button>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workshops.map(ws => (
                      <div key={ws.id} className="bg-nikon-surface border border-nikon-border rounded-xl overflow-hidden group">
                          <div className="h-48 overflow-hidden relative">
                              <img src={ws.image_url} alt={ws.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <button 
                                onClick={() => deleteWorkshop(ws.id)}
                                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                          </div>
                          <div className="p-6">
                              <h3 className="font-bold text-xl mb-2">{ws.title}</h3>
                              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{ws.description}</p>
                              <div className="flex flex-col gap-2 text-sm text-gray-300">
                                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-nikon-yellow text-base">person</span> {ws.teacher}</div>
                                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-nikon-yellow text-base">calendar_month</span> {ws.date} {ws.time}</div>
                                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-nikon-yellow text-base">location_on</span> {ws.location}</div>
                                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-nikon-yellow text-base">group</span> {ws.total_spots} Cupos</div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
