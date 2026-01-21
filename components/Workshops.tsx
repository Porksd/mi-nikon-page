import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Bell, Calendar, MapPin, ChevronDown, CheckCircle, Info } from 'lucide-react';

interface DBWorkshop {
  id: string;
  title: string;
  description: string;
  teacher: string;
  date: string;
  time: string;
  location: string;
  total_spots: number;
  image_url: string;
  inscriptions: { count: number }[];
}

interface Notification {
    id: string;
    title: string;
    message: string;
    category: string;
    created_at: string;
}

const Workshops: React.FC = () => {
   const [workshops, setWorkshops] = useState<DBWorkshop[]>([]);
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [expandedId, setExpandedId] = useState<string | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedWorkshop, setSelectedWorkshop] = useState<DBWorkshop | null>(null);
   const [currentUser, setCurrentUser] = useState<any>(null);

   useEffect(() => {
      fetchWorkshops();
      fetchNotifications();
      supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
   }, []);

   const fetchNotifications = async () => {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(3);
        if (data) setNotifications(data);
   };

   const fetchWorkshops = async () => {
      const { data, error } = await supabase
         .from('workshops')
         .select('*, inscriptions:workshop_registrations(count)')
         .order('date', { ascending: true });
      
      if (error) console.error(error);
      else setWorkshops(data || []);
   };

   const toggleExpand = (id: string) => {
      setExpandedId(expandedId === id ? null : id);
   };

   const openRegister = (workshop: DBWorkshop) => {
      if (!currentUser) {
         alert("Debes iniciar sesión para inscribirte.");
         // navigate('/login'); // Assuming navigate is available or handled
         return;
      }
      setSelectedWorkshop(workshop);
      setIsModalOpen(true);
   };

   const handleConfirmRegistration = async () => {
      if (!selectedWorkshop || !currentUser) return;

      const { error } = await supabase
         .from('workshop_registrations')
         .insert({
             workshop_id: selectedWorkshop.id,
             user_id: currentUser.id
         });

      if (error) {
          if (error.code === '23505') { // Unique violation
              alert("Ya estás inscrito en este workshop.");
          } else {
              alert("Error al inscribir: " + error.message);
          }
      } else {
          alert("¡Inscripción exitosa! Te esperamos.");
          setIsModalOpen(false);
          fetchWorkshops(); // Refresh spots
      }
   };

   const getAvailableSpots = (ws: DBWorkshop) => {
       const taken = ws.inscriptions?.[0]?.count || 0;
       return Math.max(0, ws.total_spots - taken);
   };

   // Helper to format date nicely
   const formatDate = (dateString: string) => {
       try {
           const d = new Date(dateString);
           return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
       } catch { return dateString; }
   };

   return (
      <div className="flex-1 w-full max-w-[1000px] mx-auto px-4 md:px-8 py-10">
         <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4">Actividades y Workshops</h1>
            <p className="text-nikon-text text-lg max-w-2xl mx-auto">
               Participa en nuestras experiencias presenciales exclusivas. Cupos limitados para garantizar un aprendizaje personalizado.
            </p>
         </div>

         {/* Creative Notifications Display */}
         {notifications.length > 0 && (
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="text-nikon-yellow w-5 h-5" />
                    <h3 className="text-white font-bold text-lg">Novedades y Lanzamientos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {notifications.map((notif, idx) => (
                        <div key={notif.id} className="relative group bg-nikon-surface/50 border border-nikon-border rounded-xl p-6 hover:bg-nikon-surface transition-colors cursor-default">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-nikon-yellow/5 to-transparent rounded-tr-xl rounded-bl-[100px]"></div>
                             <span className="text-[10px] font-bold text-nikon-yellow uppercase tracking-widest mb-2 block">{notif.category}</span>
                             <h4 className="text-white font-bold mb-2 leading-tight">{notif.title}</h4>
                             <p className="text-sm text-gray-400 line-clamp-3">{notif.message}</p>
                        </div>
                    ))}
                </div>
            </div>
         )}

         {workshops.length === 0 && <p className="text-center text-gray-400">No hay workshops programados por el momento.</p>}

         <div className="flex flex-col gap-4">
            {workshops.map((workshop) => {
               const spots = getAvailableSpots(workshop);
               return (
               <div key={workshop.id} className="bg-nikon-surface border border-nikon-border rounded-xl overflow-hidden transition-all duration-300">
                  {/* Header / Summary */}
                  <div
                     className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#322f22] transition-colors ${expandedId === workshop.id ? 'bg-[#322f22]' : ''}`}
                     onClick={() => toggleExpand(workshop.id)}
                  >
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-nikon-yellow font-bold text-sm uppercase tracking-wider">{formatDate(workshop.date)}</span>
                           <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                           <span className="text-gray-400 text-sm">{workshop.location}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{workshop.title}</h3>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                           <p className="text-sm text-gray-400">Instructor</p>
                           <p className="text-white font-medium">{workshop.teacher}</p>
                        </div>
                        <button className={`w-10 h-10 rounded-full border border-nikon-border flex items-center justify-center transition-transform duration-300 ${expandedId === workshop.id ? 'rotate-180 bg-nikon-yellow text-black' : 'text-white'}`}>
                           <span className="material-symbols-outlined">expand_more</span>
                        </button>
                     </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === workshop.id && (
                     <div className="p-6 border-t border-nikon-border bg-black/20 animate-fadeIn">
                        <div className="flex flex-col md:flex-row gap-8">
                           <div className="w-full md:w-1/3">
                              <img src={workshop.image_url} alt={workshop.title} className="w-full aspect-video object-cover rounded-lg border border-nikon-border" />
                           </div>
                           <div className="flex-1 flex flex-col">
                              <h4 className="text-lg font-bold text-white mb-3">Detalles del Evento</h4>
                              <p className="text-nikon-text leading-relaxed mb-6 whitespace-pre-line">{workshop.description}</p>

                              <div className="grid grid-cols-2 gap-4 mb-6">
                                 <div className="bg-nikon-surface p-3 rounded border border-nikon-border">
                                    <span className="block text-xs text-gray-500 uppercase">Horario</span>
                                    <span className="text-white font-medium">{workshop.time}</span>
                                 </div>
                                 <div className="bg-nikon-surface p-3 rounded border border-nikon-border">
                                    <span className="block text-xs text-gray-500 uppercase">Cupos Disponibles</span>
                                    <span className={`font-bold ${spots < 5 ? 'text-red-400' : 'text-nikon-yellow'}`}>{spots} Lugares</span>
                                 </div>
                              </div>

                              {spots > 0 ? (
                                  <button
                                     onClick={() => openRegister(workshop)}
                                     className="mt-auto w-full md:w-auto px-8 py-3 bg-nikon-yellow text-black font-bold rounded hover:bg-[#d9ad0b] transition-colors self-start"
                                  >
                                     Inscribirme Ahora
                                  </button>
                              ) : (
                                  <button disabled className="mt-auto w-full md:w-auto px-8 py-3 bg-gray-600 text-white font-bold rounded cursor-not-allowed self-start">
                                      Agotado
                                  </button>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
               );
            })}
         </div>

         {/* Registration Modal Confirmation */}
         {isModalOpen && selectedWorkshop && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
               <div className="bg-nikon-surface border border-nikon-border w-full max-w-lg rounded-2xl p-8 relative z-10 shadow-2xl animate-fade-in">
                  <button
                     onClick={() => setIsModalOpen(false)}
                     className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                     <span className="material-symbols-outlined">close</span>
                  </button>

                  <h2 className="text-2xl font-bold text-white mb-4">Confirmar Inscripción</h2>
                  
                  <div className="bg-black/30 p-4 rounded-lg mb-6 border border-white/10">
                      <p className="text-nikon-yellow font-bold text-lg mb-1">{selectedWorkshop.title}</p>
                      <p className="text-gray-300 text-sm mb-2">{formatDate(selectedWorkshop.date)} - {selectedWorkshop.time}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {selectedWorkshop.location}
                      </div>
                  </div>

                  <p className="text-gray-300 mb-6 text-sm">
                      Al confirmar, quedarás inscrito en la lista de asistentes. Recibirás un correo con los detalles del evento.
                      Por favor, asegúrate de asistir ya que los cupos son limitados.
                  </p>

                  <div className="flex gap-4">
                      <button 
                        onClick={handleConfirmRegistration} 
                        className="flex-1 h-12 bg-nikon-yellow text-black font-bold rounded hover:brightness-110 transition-all"
                      >
                         Confirmar Asistencia
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="flex-1 h-12 bg-transparent border border-white/20 text-white font-bold rounded hover:bg-white/5 transition-all"
                      >
                         Cancelar
                      </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Workshops;
