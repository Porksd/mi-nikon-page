import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Bell, Calendar, MapPin, ChevronDown, CheckCircle, Info, Users, Clock, X, CalendarX } from 'lucide-react';
import { trackPageView } from '../utils/analyticsService';
import { 
  registerForWorkshop, 
  getUserWorkshopRegistration, 
  getWorkshopAvailability,
  cancelRegistration,
  formatRegistrationStatus,
  getStatusColor,
  formatAvailabilityMessage,
  calculateOccupancy,
  type WorkshopAvailability,
  type WorkshopRegistration
} from '../utils/workshopService';

// Helper para verificar si un workshop ya caducó
const isWorkshopExpired = (dateStr: string): boolean => {
  const workshopDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return workshopDate < today;
};

interface DBWorkshop {
  id: string;
  title: string;
  description: string;
  teacher: string;
  date: string;
  time: string;
  location: string;
  total_spots: number;
  max_participants: number;
  available_spots: number;
  image_url: string;
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
   const [userRegistrations, setUserRegistrations] = useState<Map<string, WorkshopRegistration>>(new Map());
   const [workshopAvailability, setWorkshopAvailability] = useState<Map<string, WorkshopAvailability>>(new Map());
   const [isRegistering, setIsRegistering] = useState(false);

   useEffect(() => {
      // Track page view
      trackPageView('/workshops', 'Workshops');
      
      initializeData();
   }, []);

   const initializeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      await fetchWorkshops();
      await fetchNotifications();
      
      if (user) {
         await loadUserRegistrations(user.id);
      }
   };

   const fetchNotifications = async () => {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(3);
        if (data) setNotifications(data);
   };

   const fetchWorkshops = async () => {
      const { data, error } = await supabase
         .from('workshops')
         .select('*')
         .order('date', { ascending: true });
      
      if (error) {
         console.error(error);
         return;
      }
      
      setWorkshops(data || []);
      
      // Cargar disponibilidad para cada workshop
      const availabilityMap = new Map<string, WorkshopAvailability>();
      for (const workshop of data || []) {
         const availability = await getWorkshopAvailability(workshop.id);
         if (availability) {
            availabilityMap.set(workshop.id, availability);
         }
      }
      setWorkshopAvailability(availabilityMap);
   };

   const loadUserRegistrations = async (userId: string) => {
      const registrationsMap = new Map<string, WorkshopRegistration>();
      
      for (const workshop of workshops) {
         const registration = await getUserWorkshopRegistration(workshop.id, userId);
         if (registration) {
            registrationsMap.set(workshop.id, registration);
         }
      }
      
      setUserRegistrations(registrationsMap);
   };

   const toggleExpand = (id: string) => {
      setExpandedId(expandedId === id ? null : id);
   };

   const openRegister = (workshop: DBWorkshop) => {
      if (!currentUser) {
         alert("Debes iniciar sesión para inscribirte.");
         return;
      }
      
      // Verificar si ya está registrado
      const existingRegistration = userRegistrations.get(workshop.id);
      if (existingRegistration) {
         alert(`Ya estás registrado con estado: ${formatRegistrationStatus(existingRegistration.status)}`);
         return;
      }
      
      setSelectedWorkshop(workshop);
      setIsModalOpen(true);
   };

   const handleConfirmRegistration = async () => {
      if (!selectedWorkshop || !currentUser || isRegistering) return;

      setIsRegistering(true);
      
      const result = await registerForWorkshop(selectedWorkshop.id, currentUser.id);
      
      setIsRegistering(false);
      
      if (result.success) {
         setIsModalOpen(false);
         
         if (result.status === 'confirmed') {
            alert(`¡Inscripción confirmada! Te esperamos en el workshop.`);
         } else if (result.status === 'waitlist') {
            alert(`Has sido agregado a la lista de espera (Posición: ${result.waitlist_position}). Te notificaremos si se libera un cupo.`);
         }
         
         // Refrescar datos
         await fetchWorkshops();
         if (currentUser) {
            await loadUserRegistrations(currentUser.id);
         }
      } else {
         alert(`Error: ${result.error}`);
      }
   };

   const handleCancelRegistration = async (workshopId: string) => {
      if (!currentUser) return;
      
      const registration = userRegistrations.get(workshopId);
      if (!registration) return;
      
      if (!confirm('¿Estás seguro de cancelar tu inscripción?')) return;
      
      const result = await cancelRegistration(registration.id);
      
      if (result.success) {
         alert('Inscripción cancelada exitosamente.');
         
         // Refrescar datos
         await fetchWorkshops();
         if (currentUser) {
            await loadUserRegistrations(currentUser.id);
         }
      } else {
         alert(`Error: ${result.error}`);
      }
   };

   const getRegistrationBadge = (workshopId: string) => {
      const registration = userRegistrations.get(workshopId);
      if (!registration) return null;
      
      const statusColors = {
         confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
         waitlist: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
         cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      };
      
      const colorClass = statusColors[registration.status] || statusColors.cancelled;
      
      return (
         <div className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass} flex items-center gap-1`}>
            <CheckCircle className="w-3 h-3" />
            {formatRegistrationStatus(registration.status)}
            {registration.status === 'waitlist' && registration.waitlist_position && (
               <span className="ml-1">(#{registration.waitlist_position})</span>
            )}
         </div>
      );
   };

   const getAvailabilityInfo = (workshopId: string) => {
      const availability = workshopAvailability.get(workshopId);
      if (!availability) return null;
      
      const occupancy = calculateOccupancy(availability);
      const message = formatAvailabilityMessage(availability);
      
      return (
         <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className={availability.is_full ? 'text-red-400 font-bold' : 'text-gray-300'}>
               {message}
            </span>
            {availability.waitlist_count > 0 && !availability.is_full && (
               <span className="text-yellow-400 text-xs">({availability.waitlist_count} en espera)</span>
            )}
         </div>
      );
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
               const registration = userRegistrations.get(workshop.id);
               const availability = workshopAvailability.get(workshop.id);
               const isFull = availability?.is_full || false;
               const isExpired = isWorkshopExpired(workshop.date);
               
               return (
               <div key={workshop.id} className={`bg-nikon-surface border rounded-xl overflow-hidden transition-all duration-300 ${isExpired ? 'border-gray-700 opacity-60' : 'border-nikon-border'}`}>
                  {/* Header / Summary */}
                  <div
                     className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#322f22] transition-colors ${expandedId === workshop.id ? 'bg-[#322f22]' : ''}`}
                     onClick={() => toggleExpand(workshop.id)}
                  >
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                           {isExpired ? (
                              <span className="text-gray-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1">
                                 <CalendarX className="w-4 h-4" /> FINALIZADO - {formatDate(workshop.date)}
                              </span>
                           ) : (
                              <span className="text-nikon-yellow font-bold text-sm uppercase tracking-wider">{formatDate(workshop.date)}</span>
                           )}
                           <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                           <span className="text-gray-400 text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {workshop.location}
                           </span>
                           <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                           <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {workshop.time}
                           </span>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isExpired ? 'text-gray-400' : 'text-white'}`}>{workshop.title}</h3>
                        
                        <div className="flex items-center gap-3 flex-wrap">
                           {!isExpired && getAvailabilityInfo(workshop.id)}
                           {registration && getRegistrationBadge(workshop.id)}
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                           <p className="text-sm text-gray-400">Instructor</p>
                           <p className="text-white font-medium">{workshop.teacher}</p>
                        </div>
                        <button className={`w-10 h-10 rounded-full border border-nikon-border flex items-center justify-center transition-transform duration-300 ${expandedId === workshop.id ? 'rotate-180 bg-nikon-yellow text-black' : 'text-white'}`}>
                           <ChevronDown className="w-5 h-5" />
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
                                    <span className="block text-xs text-gray-500 uppercase">Instructor</span>
                                    <span className="text-white font-medium">{workshop.teacher}</span>
                                 </div>
                                 <div className="bg-nikon-surface p-3 rounded border border-nikon-border">
                                    <span className="block text-xs text-gray-500 uppercase">Capacidad</span>
                                    <span className={`font-bold ${isFull ? 'text-red-400' : 'text-nikon-yellow'}`}>
                                       {availability?.confirmed_count || 0} / {availability?.max_participants || workshop.max_participants}
                                    </span>
                                 </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-auto flex gap-3">
                                 {isExpired ? (
                                    // Workshop caducado
                                    <div className="px-6 py-3 bg-gray-700 text-gray-400 font-bold rounded flex items-center gap-2 cursor-not-allowed">
                                       <CalendarX className="w-5 h-5" />
                                       Este evento ya finalizó
                                    </div>
                                 ) : registration ? (
                                    // Ya está registrado
                                    <button
                                       onClick={() => handleCancelRegistration(workshop.id)}
                                       className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
                                    >
                                       Cancelar Inscripción
                                    </button>
                                 ) : isFull ? (
                                    // Workshop lleno, unirse a waitlist
                                    <button
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          openRegister(workshop);
                                       }}
                                       className="px-6 py-3 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-700 transition-colors"
                                    >
                                       Unirse a Lista de Espera
                                    </button>
                                 ) : (
                                    // Hay cupos disponibles
                                    <button
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          openRegister(workshop);
                                       }}
                                       className="px-6 py-3 bg-nikon-yellow text-black font-bold rounded hover:bg-[#d9ad0b] transition-colors"
                                    >
                                       Inscribirme Ahora
                                    </button>
                                 )}
                              </div>
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
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isRegistering && setIsModalOpen(false)}></div>
               <div className="bg-nikon-surface border border-nikon-border w-full max-w-lg rounded-2xl p-8 relative z-10 shadow-2xl animate-fade-in">
                  <button
                     onClick={() => !isRegistering && setIsModalOpen(false)}
                     className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:opacity-50"
                     disabled={isRegistering}
                  >
                     <X className="w-6 h-6" />
                  </button>

                  <h2 className="text-2xl font-bold text-white mb-4">Confirmar Inscripción</h2>
                  
                  <div className="bg-black/30 p-4 rounded-lg mb-6 border border-white/10">
                      <p className="text-nikon-yellow font-bold text-lg mb-1">{selectedWorkshop.title}</p>
                      <p className="text-gray-300 text-sm mb-2">{formatDate(selectedWorkshop.date)} - {selectedWorkshop.time}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          {selectedWorkshop.location}
                      </div>
                      
                      {/* Availability Info */}
                      {(() => {
                         const availability = workshopAvailability.get(selectedWorkshop.id);
                         if (!availability) return null;
                         
                         return (
                            <div className={`p-3 rounded-lg mt-3 ${availability.is_full ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                               <div className="flex items-center gap-2 mb-1">
                                  <Users className="w-4 h-4" />
                                  <span className="font-bold text-sm">
                                     {availability.is_full ? '⏳ Lista de Espera' : '✅ Cupo Disponible'}
                                  </span>
                               </div>
                               <p className="text-xs text-gray-400">
                                  {availability.is_full 
                                     ? `El workshop está lleno. Serás agregado a lista de espera (${availability.waitlist_count} personas esperando).`
                                     : `${availability.available_spots} ${availability.available_spots === 1 ? 'cupo disponible' : 'cupos disponibles'} de ${availability.max_participants} totales.`
                                  }
                               </p>
                            </div>
                         );
                      })()}
                  </div>

                  <p className="text-gray-300 mb-6 text-sm">
                      Al confirmar, quedarás {workshopAvailability.get(selectedWorkshop.id)?.is_full ? 'en la lista de espera' : 'inscrito en la lista de asistentes'}. 
                      Recibirás un correo con los detalles del evento.
                      {!workshopAvailability.get(selectedWorkshop.id)?.is_full && ' Por favor, asegúrate de asistir ya que los cupos son limitados.'}
                  </p>

                  <div className="flex gap-4">
                      <button 
                        onClick={handleConfirmRegistration} 
                        disabled={isRegistering}
                        className="flex-1 h-12 bg-nikon-yellow text-black font-bold rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isRegistering ? 'Procesando...' : 'Confirmar'}
                      </button>
                      <button 
                        onClick={() => setIsModalOpen(false)} 
                        disabled={isRegistering}
                        className="flex-1 h-12 bg-transparent border border-white/20 text-white font-bold rounded hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
