import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getAbandonedCartsSummary, getCartAnalytics, formatPrice } from '../utils/cartService';
import { getDashboardKPIs, getDailySummary, getActiveUsers, getTopProducts, getTopRegisteredProducts, getTopPages, getUserEngagement } from '../utils/analyticsService';
import { getWorkshopStats, processWaitlist, type WorkshopRegistrationDetailed } from '../utils/workshopService';
import { uploadImage } from '../utils/storageService';
import { ShoppingCart, TrendingUp, DollarSign, AlertCircle, Users, Activity, BarChart3, TrendingDown, Eye, Package, Clock, CheckCircle, XCircle, Pencil, Calendar, Image as ImageIcon, Link, Trash2, Edit } from 'lucide-react';
// Temporalmente comentado hasta resolver problema con recharts
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface WorkshopWithStats extends Workshop {
  stats?: {
    confirmed_count: number;
    waitlist_count: number;
    cancelled_count: number;
    fill_percentage: number;
    confirmed_users: WorkshopRegistrationDetailed[];
    waitlist_users: WorkshopRegistrationDetailed[];
  };
}

interface Notification {
    title: string;
    message: string;
    category: string;
    created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'activity' | 'workshops' | 'notifications' | 'carts' | 'banners' | 'feedback'>('analytics');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [workshops, setWorkshops] = useState<WorkshopWithStats[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [productRegistrations, setProductRegistrations] = useState<any[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [isProcessingWaitlist, setIsProcessingWaitlist] = useState(false);

  // Cart Analytics States
  const [cartAnalytics, setCartAnalytics] = useState<any>(null);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  
  // Analytics States
  const [dashboardKPIs, setDashboardKPIs] = useState<any>(null);
  const [dailySummary, setDailySummary] = useState<any[]>([]);
  const [activeUsersData, setActiveUsersData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topRegisteredProducts, setTopRegisteredProducts] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [userEngagement, setUserEngagement] = useState<any[]>([]);

  // Workshop Form State
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState<Partial<Workshop>>({});
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);

  // Banner Form State
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({});
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  
  // Helper para verificar si un workshop ya caducó
  const isWorkshopExpired = (dateStr: string): boolean => {
    const workshopDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workshopDate < today;
  };

  // Notification Form State
  const [newNotification, setNewNotification] = useState({ title: '', message: '', category: 'general' });
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'analytics') {
            // Load all analytics data
            const kpis = await getDashboardKPIs();
            setDashboardKPIs(kpis);
            
            const summary = await getDailySummary(30);
            setDailySummary(summary);
            
            const activeUsers = await getActiveUsers('daily');
            setActiveUsersData(activeUsers);
            
            const products = await getTopProducts();
            setTopProducts(products);
            
            const registeredProds = await getTopRegisteredProducts();
            setTopRegisteredProducts(registeredProds);
            
            const pages = await getTopPages();
            setTopPages(pages);
            
            const engagement = await getUserEngagement(20);
            setUserEngagement(engagement);
        } else if (activeTab === 'workshops') {
            const { data } = await supabase.from('workshops').select('*').order('date', { ascending: true });
            if (data) {
               // Load stats for each workshop
               const workshopsWithStats = await Promise.all(
                  data.map(async (workshop) => {
                     const stats = await getWorkshopStats(workshop.id);
                     return {
                        ...workshop,
                        stats: stats || undefined
                     };
                  })
               );
               setWorkshops(workshopsWithStats);
            }
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
        } else if (activeTab === 'banners') {
            const { data } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
            if (data) setBanners(data as Banner[]);
        } else if (activeTab === 'carts') {
            const analytics = await getCartAnalytics();
            setCartAnalytics(analytics);
            
            const carts = await getAbandonedCartsSummary();
            setAbandonedCarts(carts);
        } else if (activeTab === 'feedback') {
            const { data } = await supabase
                .from('user_feedback')
                .select('*, profile:profiles(first_name, last_name, email)')
                .order('created_at', { ascending: false });
            if (data) setFeedbacks(data);
        }
    } catch (error) {
        console.error("Error fetching data", error);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateWorkshop = async () => {
      // Solo incluir campos que existen en la tabla workshops
      const workshopData: any = {
         title: newWorkshop.title,
         description: newWorkshop.description,
         image_url: newWorkshop.image_url,
         teacher: newWorkshop.teacher,
         date: newWorkshop.date,
         time: newWorkshop.time,
         location: newWorkshop.location,
         total_spots: newWorkshop.total_spots || 30
      };
      
      // Eliminar campos undefined
      Object.keys(workshopData).forEach(key => {
         if (workshopData[key] === undefined || workshopData[key] === '') {
            delete workshopData[key];
         }
      });
      
      if (editingWorkshopId) {
         // Actualizar workshop existente
         const { error } = await supabase.from('workshops').update(workshopData).eq('id', editingWorkshopId);
         if (!error) {
            setShowWorkshopForm(false);
            setNewWorkshop({});
            setEditingWorkshopId(null);
            fetchData();
            alert('Workshop actualizado exitosamente');
         } else {
            alert('Error updating workshop: ' + error.message);
         }
      } else {
         // Crear nuevo workshop
         const { error } = await supabase.from('workshops').insert([workshopData]);
         if (!error) {
            setShowWorkshopForm(false);
            setNewWorkshop({});
            fetchData();
            alert('Workshop creado exitosamente');
         } else {
            alert('Error creating workshop: ' + error.message);
         }
      }
  };
  
  const handleEditWorkshop = (workshop: WorkshopWithStats) => {
      setEditingWorkshopId(workshop.id);
      setNewWorkshop({
         title: workshop.title,
         teacher: workshop.teacher,
         date: workshop.date,
         time: workshop.time,
         location: workshop.location,
         total_spots: workshop.total_spots,
         image_url: workshop.image_url,
         description: workshop.description
      });
      setShowWorkshopForm(true);
  };
  
  const handleCancelForm = () => {
      setShowWorkshopForm(false);
      setNewWorkshop({});
      setEditingWorkshopId(null);
  };
  
  const handleProcessWaitlist = async (workshopId: string) => {
      if (!confirm('¿Procesar lista de espera? Esto confirmará usuarios según cupos disponibles.')) return;
      
      setIsProcessingWaitlist(true);
      const result = await processWaitlist(workshopId);
      setIsProcessingWaitlist(false);
      
      if (result.success) {
         alert(`✅ ${result.processed} usuarios confirmados de la lista de espera.`);
         fetchData();
      } else {
         alert(`Error: ${result.message}`);
      }
  };

  const handleWorkshopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);
    const url = await uploadImage(file, 'workshop-images');
    setLoading(false);
    if (url) {
        setNewWorkshop({...newWorkshop, image_url: url});
    } else {
        alert('Error al subir imagen');
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);
    const url = await uploadImage(file, 'banner-images');
    setLoading(false);
    if (url) {
        setNewBanner({...newBanner, image_url: url});
    } else {
        alert('Error al subir imagen');
    }
  };

  const handleCreateBanner = async () => {
    const bannerData = {
        title: newBanner.title,
        tagline: newBanner.tagline,
        link: newBanner.link,
        image_url: newBanner.image_url,
        button_text: newBanner.button_text || 'VER MÁS',
        sort_order: newBanner.sort_order || 0,
        is_active: newBanner.is_active !== undefined ? newBanner.is_active : true
    };
    
    if (editingBannerId) {
        const { error } = await supabase.from('banners').update(bannerData).eq('id', editingBannerId);
        if (!error) {
            setShowBannerForm(false);
            setNewBanner({});
            setEditingBannerId(null);
            fetchData();
            alert('Banner actualizado exitosamente');
        } else {
            alert('Error updating banner: ' + error.message);
        }
    } else {
        const { error } = await supabase.from('banners').insert([bannerData]);
        if (!error) {
            setShowBannerForm(false);
            setNewBanner({});
            fetchData();
            alert('Banner creado exitosamente');
        } else {
            alert('Error creating banner: ' + error.message);
        }
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setNewBanner(banner);
    setShowBannerForm(true);
  };

  const deleteBanner = async (id: string) => {
    if(!confirm('¿Estás seguro de eliminar este banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    fetchData();
  };

  const handleSendNotification = async () => {
      // 1. Enviar notificación a todos los usuarios (crea registros individuales)
      // Solo si es una notificación NUEVA, no una edición del historial
      if (!editingNotificationId) {
          const { error: rpcError } = await supabase.rpc('create_notification_for_all', {
              p_title: newNotification.title,
              p_message: newNotification.message,
              p_category: newNotification.category,
              p_link: null
          });

          if (rpcError) {
              alert('Error al distribuir notificaciones: ' + rpcError.message);
              return;
          }
      }

      // 2. Guardar en historial de notificaciones (tabla notifications)
      let error;
      if (editingNotificationId) {
          const { error: updateError } = await supabase
              .from('notifications')
              .update(newNotification)
              .eq('id', editingNotificationId);
          error = updateError;
      } else {
          const { error: insertError } = await supabase.from('notifications').insert([newNotification]);
          error = insertError;
      }
      
      if (!error) {
          setNewNotification({ title: '', message: '', category: 'general' });
          setEditingNotificationId(null);
          fetchData();
          alert(editingNotificationId ? 'Historial actualizado exitosamente' : 'Notificación enviada a todos los usuarios exitosamente');
      } else {
          alert('Error al procesar notificación: ' + error.message);
      }
  };

  const handleEditNotification = (notif: Notification) => {
      setEditingNotificationId(notif.id);
      setNewNotification({
          title: notif.title,
          message: notif.message,
          category: notif.category
      });
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNotification = async (id: string) => {
      if (!confirm('¿Estás seguro de eliminar esta notificación del historial? (Esto no eliminará la notificación ya enviada a los buzones de los usuarios)')) return;
      
      const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
      
      if (!error) {
          fetchData();
      } else {
          alert('Error al eliminar: ' + error.message);
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
        <div className="flex gap-2 flex-wrap">
            {/* Carts tab OCULTO PARA FASE 1.0 */}
            {['analytics', 'activity', 'workshops', 'banners', 'notifications', 'feedback'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${
                        activeTab === tab ? 'bg-nikon-yellow text-black' : 'bg-nikon-surface hover:bg-white/10'
                    }`}
                >
                    {tab === 'analytics' ? '📊 Analytics' :
                     tab === 'activity' ? 'Actividad' : 
                     tab === 'workshops' ? 'Workshops' :
                     tab === 'banners' ? 'Banners' :
                     tab === 'feedback' ? 'Feedbacks' : 'Notificaciones'}
                </button>
            ))}
        </div>
      </div>

      {loading && <p>Cargando...</p>}

      {/* ANALYTICS TAB */}
      {!loading && activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          {dashboardKPIs && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Usuarios Activos</h3>
                </div>
                <p className="text-3xl font-black text-blue-500">{dashboardKPIs.active_users_today}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Semana: {dashboardKPIs.active_users_week} | Mes: {dashboardKPIs.active_users_month}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Package className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Productos Registrados</h3>
                </div>
                <p className="text-3xl font-black text-green-500">{dashboardKPIs.total_products_registered}</p>
                <p className="text-sm text-gray-400 mt-1">Total en la plataforma</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Consultas IA</h3>
                </div>
                <p className="text-3xl font-black text-purple-500">{dashboardKPIs.total_ai_queries}</p>
                <p className="text-sm text-gray-400 mt-1">Total de interacciones</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Tiempo Promedio</h3>
                </div>
                <p className="text-3xl font-black text-orange-500">{dashboardKPIs.avg_session_duration_minutes}m</p>
                <p className="text-sm text-gray-400 mt-1">Por sesión de usuario</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Eye className="w-6 h-6 text-pink-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Vistas Totales</h3>
                </div>
                <p className="text-3xl font-black text-pink-500">{dashboardKPIs.total_page_views}</p>
                <p className="text-sm text-gray-400 mt-1">Páginas vistas</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Productos Vistos</h3>
                </div>
                <p className="text-3xl font-black text-yellow-500">{dashboardKPIs.total_product_views}</p>
                <p className="text-sm text-gray-400 mt-1">Visualizaciones de productos</p>
              </div>

              <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-teal-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Tutoriales Vistos</h3>
                </div>
                <p className="text-3xl font-black text-teal-500">{dashboardKPIs.total_tutorial_views}</p>
                <p className="text-sm text-gray-400 mt-1">Contenido educativo</p>
              </div>

              <div className="bg-gradient-to-br from-nikon-yellow/20 to-yellow-600/10 border border-nikon-yellow/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-nikon-yellow/20 rounded-lg">
                    <Activity className="w-6 h-6 text-nikon-yellow" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Total Eventos</h3>
                </div>
                <p className="text-3xl font-black text-nikon-yellow">{dashboardKPIs.total_events}</p>
                <p className="text-sm text-gray-400 mt-1">Todas las interacciones</p>
              </div>
            </div>
          )}

          {/* Daily Activity Chart - TEMPORALMENTE DESHABILITADO */}
          {/* {dailySummary && dailySummary.length > 0 && (
            <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Actividad Diaria (Últimos 30 Días)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="event_date" 
                    stroke="#888"
                    tick={{ fill: '#888' }}
                  />
                  <YAxis stroke="#888" tick={{ fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="page_views" stroke="#3b82f6" name="Vistas Página" strokeWidth={2} />
                  <Line type="monotone" dataKey="product_views" stroke="#10b981" name="Vistas Producto" strokeWidth={2} />
                  <Line type="monotone" dataKey="ai_queries" stroke="#a855f7" name="Consultas IA" strokeWidth={2} />
                  <Line type="monotone" dataKey="tutorial_views" stroke="#f59e0b" name="Tutoriales" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )} */}

          {/* Top Products Comparison - TEMPORALMENTE DESHABILITADO */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topProducts && topProducts.length > 0 && (
              <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Top 10 Productos Más Vistos</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" tick={{ fill: '#888' }} />
                    <YAxis 
                      type="category" 
                      dataKey="product_name" 
                      stroke="#888" 
                      tick={{ fill: '#888' }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="view_count" fill="#10b981" name="Vistas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {topRegisteredProducts && topRegisteredProducts.length > 0 && (
              <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Top 10 Productos Más Registrados</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topRegisteredProducts.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" tick={{ fill: '#888' }} />
                    <YAxis 
                      type="category" 
                      dataKey="product_name" 
                      stroke="#888" 
                      tick={{ fill: '#888' }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="registration_count" fill="#f59e0b" name="Registros" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div> */}

          {/* Top Pages */}
          {topPages && topPages.length > 0 && (
            <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Páginas Más Visitadas</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Página</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Vistas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuarios Únicos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topPages.map((page, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {page.page_name || page.page_path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {page.view_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {page.unique_users}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Engagement */}
          {userEngagement && userEngagement.length > 0 && (
            <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Engagement de Usuarios (Top 20)</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Eventos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Última Actividad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userEngagement.map((user, idx) => {
                      const totalInteractions = (user.ai_queries_count || 0) + (user.tutorials_viewed_count || 0) + (user.workshops_registered_count || 0);
                      return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {user.email || user.full_name || 'Usuario'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-bold ${
                            user.engagement_score >= 100 ? 'text-green-500' :
                            user.engagement_score >= 50 ? 'text-yellow-500' :
                            'text-orange-500'
                          }`}>
                            {user.engagement_score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {totalInteractions > 0 ? totalInteractions : user.total_sessions || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.last_active ? new Date(user.last_active).toLocaleDateString('es-CL') : 'Sin actividad'}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CARTS TAB - OCULTO PARA FASE 1.0 */}
      {false && !loading && activeTab === 'carts' && (
        <div className="space-y-8">
          {/* Analytics Cards */}
          {cartAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Carritos Activos</h3>
                </div>
                <p className="text-3xl font-black text-green-500">{cartAnalytics.activeCarts}</p>
                <p className="text-sm text-gray-400 mt-1">{formatPrice(cartAnalytics.totalActiveValue)} en total</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Abandonados</h3>
                </div>
                <p className="text-3xl font-black text-orange-500">{cartAnalytics.abandonedCarts}</p>
                <p className="text-sm text-gray-400 mt-1">{formatPrice(cartAnalytics.totalAbandonedValue)} en riesgo</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Completados</h3>
                </div>
                <p className="text-3xl font-black text-blue-500">{cartAnalytics.completedCarts}</p>
                <p className="text-sm text-gray-400 mt-1">Tasa: {cartAnalytics.conversionRate}%</p>
              </div>

              <div className="bg-gradient-to-br from-nikon-yellow/20 to-yellow-600/10 border border-nikon-yellow/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-nikon-yellow/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-nikon-yellow" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Recuperación</h3>
                </div>
                <p className="text-3xl font-black text-nikon-yellow">{formatPrice(cartAnalytics.recoveryPotential)}</p>
                <p className="text-sm text-gray-400 mt-1">Potencial de ventas</p>
              </div>
            </div>
          )}

          {/* Abandoned Carts Table */}
          <div className="bg-nikon-surface border border-nikon-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-nikon-border">
              <h2 className="text-xl font-bold text-white">Carritos Abandonados</h2>
              <p className="text-sm text-gray-400 mt-1">Monitoreo en tiempo real de carritos que necesitan atención</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Abandonado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notif.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {abandonedCarts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No hay carritos abandonados actualmente
                      </td>
                    </tr>
                  )}
                  {abandonedCarts.map((cart: any, idx: number) => {
                    const urgency = 
                      cart.hours_abandoned > 168 ? 'critical' :
                      cart.hours_abandoned > 72 ? 'high' :
                      cart.hours_abandoned > 24 ? 'medium' : 'low';
                    
                    const urgencyColors = {
                      critical: 'text-red-500 bg-red-500/10 border-red-500/30',
                      high: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
                      medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
                      low: 'text-green-500 bg-green-500/10 border-green-500/30'
                    };

                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{cart.customer_email}</div>
                          <div className="text-xs text-gray-400">{new Date(cart.created_at).toLocaleDateString('es-CL')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{cart.items_count} producto{cart.items_count !== 1 ? 's' : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-nikon-yellow">{formatPrice(cart.total_value)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{Math.floor(cart.hours_abandoned)}h</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${urgencyColors[urgency]}`}>
                            {cart.notification_stage.replace('reminder_', '').replace('h', 'h').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{cart.notifications_sent} enviadas</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

      {!loading && activeTab === 'banners' && (
          <div className="flex flex-col gap-8">
              {!showBannerForm ? (
                  <button 
                    onClick={() => setShowBannerForm(true)}
                    className="w-full sm:w-auto bg-nikon-yellow text-black font-bold py-3 px-6 rounded hover:brightness-110 transition-all self-end"
                  >
                      + Nuevo Banner
                  </button>
              ) : (
                  <div className="bg-nikon-surface p-6 rounded-xl border border-nikon-border animate-fade-in">
                      <h2 className="text-2xl font-bold mb-6">{editingBannerId ? 'Editar Banner' : 'Crear Nuevo Banner'}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <input type="text" placeholder="Título" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newBanner.title || ''}
                             onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                          <input type="text" placeholder="Tagline / Texto" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newBanner.tagline || ''}
                             onChange={e => setNewBanner({...newBanner, tagline: e.target.value})} />
                          <input type="text" placeholder="Enlace (URL)" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newBanner.link || ''}
                             onChange={e => setNewBanner({...newBanner, link: e.target.value})} />
                          <input type="text" placeholder="Texto Botón" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newBanner.button_text || 'VER MÁS'}
                             onChange={e => setNewBanner({...newBanner, button_text: e.target.value})} />
                          <input type="number" placeholder="Orden" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newBanner.sort_order || 0}
                             onChange={e => setNewBanner({...newBanner, sort_order: parseInt(e.target.value)})} />
                          
                          <div className="md:col-span-2 space-y-2">
                             <label className="text-sm text-gray-400">Imagen del Banner</label>
                             <div className="flex gap-2">
                                <input type="text" placeholder="URL Imagen" className="bg-black/50 border border-nikon-border rounded p-3 text-white flex-1" 
                                   value={newBanner.image_url || ''}
                                   onChange={e => setNewBanner({...newBanner, image_url: e.target.value})} />
                                <div className="relative">
                                    <input type="file" id="banner-image" accept="image/*" className="hidden" onChange={handleBannerImageUpload} />
                                    <label htmlFor="banner-image" className="bg-nikon-surface border border-nikon-border rounded p-3 text-white cursor-pointer hover:bg-white/10 block">
                                        <ImageIcon className="w-6 h-6" />
                                    </label>
                                </div>
                             </div>
                             {newBanner.image_url && <img src={newBanner.image_url} alt="Preview" className="h-40 object-cover rounded" />}
                          </div>

                          <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_active" 
                                    checked={newBanner.is_active !== undefined ? newBanner.is_active : true}
                                    onChange={e => setNewBanner({...newBanner, is_active: e.target.checked})}
                                />
                                <label htmlFor="is_active">Activo</label>
                          </div>

                      </div>
                      <div className="flex gap-4">
                          <button onClick={handleCreateBanner} className="bg-nikon-yellow text-black font-bold py-3 px-6 rounded">
                             {editingBannerId ? 'Actualizar' : 'Guardar'}
                          </button>
                          <button onClick={() => { setShowBannerForm(false); setNewBanner({}); setEditingBannerId(null); }} className="bg-transparent border border-white/20 text-white font-bold py-3 px-6 rounded hover:bg-white/10">
                             Cancelar
                          </button>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banners.map(banner => (
                      <div key={banner.id} className="bg-nikon-surface rounded-xl overflow-hidden border border-nikon-border group relative">
                          <div className="relative h-48">
                              <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                              <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                                  Orden: {banner.sort_order}
                              </div>
                              {!banner.is_active && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                      <span className="text-red-500 font-bold border border-red-500 px-3 py-1 rounded">INACTIVO</span>
                                  </div>
                              )}
                          </div>
                          <div className="p-6">
                              <h3 className="font-bold text-xl mb-1 text-white">{banner.title}</h3>
                              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{banner.tagline}</p>
                              
                              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                  <button onClick={() => handleEditBanner(banner)} className="text-nikon-yellow hover:text-white flex items-center gap-1 font-bold text-sm">
                                      <Pencil size={16} /> Editar
                                  </button>
                                  <button onClick={() => deleteBanner(banner.id)} className="text-red-500 hover:text-red-400 flex items-center gap-1 font-bold text-sm">
                                      <XCircle size={16} /> Eliminar
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {!loading && activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-nikon-surface p-6 rounded-xl border border-nikon-border h-fit">
                  <h2 className="text-xl font-bold mb-4">{editingNotificationId ? 'Editar en Historial' : 'Nueva Notificación'}</h2>
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
                          <option value="general">Mensaje General</option>
                          <option value="workshop">Workshops/Eventos</option>
                          <option value="promocion">Promociones</option>
                          <option value="product">Mi Equipo</option>
                          <option value="firmware">Firmware</option>
                          <option value="novedades">Novedades</option>
                      </select>
                      <div className="flex flex-col gap-2">
                        <button 
                            onClick={handleSendNotification}
                            className={`${editingNotificationId ? 'bg-blue-600' : 'bg-nikon-yellow'} text-black font-bold py-3 rounded hover:brightness-110 transition-all flex items-center justify-center gap-2`}
                        >
                            {editingNotificationId ? <><Edit size={18} /> Actualizar Historial</> : 'Enviar Notificación'}
                        </button>
                        {editingNotificationId && (
                            <button 
                                onClick={() => {
                                    setEditingNotificationId(null);
                                    setNewNotification({ title: '', message: '', category: 'general' });
                                }}
                                className="bg-gray-600 text-white font-bold py-2 rounded hover:brightness-110 transition-all"
                            >
                                Cancelar Edición
                            </button>
                        )}
                      </div>
                  </div>
              </div>
              <div className="lg:col-span-2 bg-nikon-surface p-6 rounded-xl border border-nikon-border">
                  <h2 className="text-xl font-bold mb-4">Historial de Notificaciones</h2>
                  <div className="space-y-4">
                      {notifications.map((notif, i) => (
                          <div key={i} className="p-4 border border-white/10 rounded bg-black/20 group relative">
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                      <h3 className="font-bold text-lg">{notif.title}</h3>
                                      <span className="text-xs uppercase bg-white/10 px-2 py-1 rounded text-nikon-yellow">{notif.category}</span>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleEditNotification(notif)}
                                        className="p-1 hover:text-blue-400 transition-colors"
                                        title="Editar contenido en historial"
                                      >
                                          <Edit size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteNotification(notif.id)}
                                        className="p-1 hover:text-red-500 transition-colors"
                                        title="Eliminar del historial"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              </div>
                              <p className="text-gray-300 text-sm">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-2 text-right">{new Date(notif.created_at).toLocaleString()}</p>
                          </div>
                      ))}
                      {notifications.length === 0 && (
                          <div className="text-center py-10 text-gray-500 italic">
                              No hay notificaciones enviadas recientemente.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* FEEDBACK TAB */}
      {!loading && activeTab === 'feedback' && (
          <div className="bg-nikon-surface p-6 rounded-xl border border-nikon-border">
              <h2 className="text-xl font-bold mb-4">Comentarios de Clientes (Feedback)</h2>
              <div className="space-y-4">
                  {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
                      <div key={i} className="p-4 border border-white/10 rounded bg-black/20 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                              <div>
                                  <span className="font-bold text-lg text-nikon-yellow">
                                      {fb.profile ? `${fb.profile.first_name} ${fb.profile.last_name || ''}`.trim() : 'Usuario Anónimo'}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">{fb.profile?.email || ''}</span>
                              </div>
                              <span className="text-xs text-white bg-white/10 px-2 py-1 rounded capitalize">{fb.category || 'General'}</span>
                          </div>
                          
                          {fb.rating && (
                              <div className="flex text-nikon-yellow text-sm">
                                  {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                              </div>
                          )}

                          <p className="text-gray-300 text-sm mt-1 bg-black/40 p-3 rounded">{fb.message}</p>
                          <p className="text-xs text-gray-500 text-right">{new Date(fb.created_at).toLocaleString()}</p>
                      </div>
                  )) : (
                      <div className="text-center py-10 text-gray-500 italic">
                          No hay feedbacks registrados aún.
                      </div>
                  )}
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
                      <h2 className="text-2xl font-bold mb-6">{editingWorkshopId ? 'Editar Workshop' : 'Crear Nuevo Workshop'}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <input type="text" placeholder="Título" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newWorkshop.title || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, title: e.target.value})} />
                          <input type="text" placeholder="Profesor" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newWorkshop.teacher || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, teacher: e.target.value})} />
                          <input type="date" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newWorkshop.date || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, date: e.target.value})} />
                          <input type="time" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newWorkshop.time || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, time: e.target.value})} />
                          <input type="text" placeholder="Ubicación" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newWorkshop.location || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, location: e.target.value})} />
                          <input type="number" placeholder="Cupos Totales" className="bg-black/50 border border-nikon-border rounded p-3 text-white" 
                             value={newWorkshop.total_spots || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, total_spots: parseInt(e.target.value)})} />
                          <div className="md:col-span-2 space-y-2">
                             <label className="text-sm text-gray-400">Imagen del Workshop</label>
                             <div className="flex gap-2">
                                <input type="text" placeholder="URL Imagen" className="bg-black/50 border border-nikon-border rounded p-3 text-white flex-1" 
                                   value={newWorkshop.image_url || ''}
                                   onChange={e => setNewWorkshop({...newWorkshop, image_url: e.target.value})} />
                                <div className="relative">
                                    <input type="file" id="workshop-image" accept="image/*" className="hidden" onChange={handleWorkshopImageUpload} />
                                    <label htmlFor="workshop-image" className="bg-nikon-surface border border-nikon-border rounded p-3 text-white cursor-pointer hover:bg-white/10 block">
                                        <ImageIcon className="w-6 h-6" />
                                    </label>
                                </div>
                             </div>
                             {newWorkshop.image_url && <img src={newWorkshop.image_url} alt="Preview" className="h-20 object-cover rounded" />}
                          </div>
                          <textarea placeholder="Reseña / Descripción" className="bg-black/50 border border-nikon-border rounded p-3 text-white md:col-span-2 h-32"
                             value={newWorkshop.description || ''}
                             onChange={e => setNewWorkshop({...newWorkshop, description: e.target.value})}></textarea>
                      </div>
                      <div className="flex gap-4">
                          <button onClick={handleCreateWorkshop} className="bg-nikon-yellow text-black font-bold py-3 px-6 rounded">
                             {editingWorkshopId ? 'Actualizar' : 'Guardar'}
                          </button>
                          <button onClick={handleCancelForm} className="bg-transparent border border-white/20 text-white font-bold py-3 px-6 rounded">Cancelar</button>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                  {workshops.map(ws => {
                     const stats = ws.stats;
                     const fillPercentage = stats?.fill_percentage || 0;
                     const availableSpots = stats?.available_spots ?? (ws.total_spots - (stats?.confirmed_count || 0));
                     const isFull = availableSpots === 0;
                     const isExpired = isWorkshopExpired(ws.date);
                     
                     return (
                      <div key={ws.id} className={`bg-nikon-surface border rounded-xl overflow-hidden ${isExpired ? 'border-gray-700 opacity-75' : 'border-nikon-border'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                              {/* Image and basic info */}
                              <div className="relative group">
                                 <div className="h-48 overflow-hidden rounded-lg relative">
                                    <img src={ws.image_url} alt={ws.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isExpired ? 'grayscale' : ''}`} />
                                    {isExpired && (
                                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                          <span className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                             <Calendar className="w-4 h-4" /> CADUCADO
                                          </span>
                                       </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                          onClick={() => handleEditWorkshop(ws)}
                                          className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700"
                                          title="Editar workshop"
                                       >
                                          <Pencil className="w-4 h-4" />
                                       </button>
                                       <button 
                                          onClick={() => deleteWorkshop(ws.id)}
                                          className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700"
                                          title="Eliminar workshop"
                                       >
                                          <XCircle className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                              
                              {/* Workshop details */}
                              <div className="md:col-span-2">
                                 <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                                    <h3 className="font-bold text-xl text-white">{ws.title}</h3>
                                    <div className="flex gap-2">
                                       {isExpired ? (
                                          <div className="px-3 py-1 rounded-full text-xs font-bold bg-gray-600/20 text-gray-400">
                                             FINALIZADO
                                          </div>
                                       ) : (
                                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${isFull ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                             {isFull ? 'LLENO' : 'CUPOS DISPONIBLES'}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 
                                 <p className="text-gray-400 text-sm mb-4 line-clamp-2">{ws.description}</p>
                                 
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    <div className="bg-black/30 p-3 rounded-lg">
                                       <p className="text-xs text-gray-500 uppercase mb-1">Confirmados</p>
                                       <p className="text-lg font-bold text-green-400">{stats?.confirmed_count || 0}</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                       <p className="text-xs text-gray-500 uppercase mb-1">En Espera</p>
                                       <p className="text-lg font-bold text-yellow-400">{stats?.waitlist_count || 0}</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                       <p className="text-xs text-gray-500 uppercase mb-1">Disponibles</p>
                                       <p className="text-lg font-bold text-blue-400">{availableSpots}</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                       <p className="text-xs text-gray-500 uppercase mb-1">Ocupación</p>
                                       <p className="text-lg font-bold text-nikon-yellow">{Math.round(fillPercentage)}%</p>
                                    </div>
                                 </div>
                                 
                                 {/* Progress bar */}
                                 <div className="mb-4">
                                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                       <div 
                                          className="h-full bg-gradient-to-r from-green-500 to-nikon-yellow transition-all duration-500"
                                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                                       />
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 text-sm text-gray-300 flex-wrap">
                                    <div className="flex items-center gap-1">
                                       <Users className="w-4 h-4 text-nikon-yellow" />
                                       {ws.teacher}
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Activity className="w-4 h-4 text-nikon-yellow" />
                                       {ws.date} - {ws.time}
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Package className="w-4 h-4 text-nikon-yellow" />
                                       {ws.location}
                                    </div>
                                 </div>
                                 
                                 {/* Action buttons */}
                                 <div className="mt-4 flex gap-3">
                                    {stats && stats.waitlist_count > 0 && availableSpots > 0 && (
                                       <button
                                          onClick={() => handleProcessWaitlist(ws.id)}
                                          disabled={isProcessingWaitlist}
                                          className="px-4 py-2 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                       >
                                          {isProcessingWaitlist ? 'Procesando...' : `Procesar Espera (${stats.waitlist_count})`}
                                       </button>
                                    )}
                                    <button
                                       onClick={() => setSelectedWorkshopId(selectedWorkshopId === ws.id ? null : ws.id)}
                                       className="px-4 py-2 bg-nikon-yellow text-black font-bold rounded hover:brightness-110 transition-colors text-sm"
                                    >
                                       {selectedWorkshopId === ws.id ? 'Ocultar Detalles' : 'Ver Inscritos'}
                                    </button>
                                 </div>
                              </div>
                          </div>
                          
                          {/* Registrations list (expandable) */}
                          {selectedWorkshopId === ws.id && stats && (
                             <div className="border-t border-nikon-border p-6 bg-black/20 animate-fadeIn">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                   {/* Confirmed users */}
                                   <div>
                                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                         <CheckCircle className="w-5 h-5 text-green-400" />
                                         Confirmados ({stats.confirmed_count})
                                      </h4>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                         {stats.confirmed_users.length === 0 && (
                                            <p className="text-gray-500 text-sm">No hay confirmados aún</p>
                                         )}
                                         {stats.confirmed_users.map((reg, idx) => (
                                            <div key={reg.id} className="bg-nikon-surface p-3 rounded-lg border border-green-500/20">
                                               <p className="text-white font-medium text-sm">{reg.first_name} {reg.last_name}</p>
                                               <p className="text-gray-400 text-xs">{reg.email}</p>
                                               <p className="text-gray-500 text-xs mt-1">{new Date(reg.created_at).toLocaleString('es-CL')}</p>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                   
                                   {/* Waitlist users */}
                                   <div>
                                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                         <Clock className="w-5 h-5 text-yellow-400" />
                                         Lista de Espera ({stats.waitlist_count})
                                      </h4>
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                         {stats.waitlist_users.length === 0 && (
                                            <p className="text-gray-500 text-sm">No hay usuarios en espera</p>
                                         )}
                                         {stats.waitlist_users.map((reg, idx) => (
                                            <div key={reg.id} className="bg-nikon-surface p-3 rounded-lg border border-yellow-500/20">
                                               <div className="flex items-center gap-2">
                                                  <span className="bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                     #{reg.waitlist_position}
                                                  </span>
                                                  <div className="flex-1">
                                                     <p className="text-white font-medium text-sm">{reg.first_name} {reg.last_name}</p>
                                                     <p className="text-gray-400 text-xs">{reg.email}</p>
                                                  </div>
                                               </div>
                                               <p className="text-gray-500 text-xs mt-2">{new Date(reg.created_at).toLocaleString('es-CL')}</p>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             </div>
                          )}
                      </div>
                     );
                  })}
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
