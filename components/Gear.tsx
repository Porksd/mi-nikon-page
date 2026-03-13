import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import AIAssistantWidget from './AIAssistantWidget';
import { X, CheckCircle, AlertCircle, Download, BookOpen, Settings } from 'lucide-react';
import { trackPageView, trackProductView } from '../utils/analyticsService';
import EquipmentSelector from './EquipmentSelector';

interface Product {
  id: string; // SKU
  name: string;
  image_url: string;
  category: string;
}

const Gear: React.FC = () => {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [userEquipment, setUserEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de IDs de productos para el Download Center
  const DOWNLOAD_CENTER_MAP: Record<string, string> = {
    // Z Series
    'Z 30': '603/Z_30',
    'Z30': '603/Z_30',
    'Z 5': '552/Z_5',
    'Z 50': '526/Z_50',
    'Z 6': '493/Z_6',
    'Z 6II': '556/Z_6II',
    'Z 7': '492/Z_7',
    'Z 7II': '558/Z_7II',
    'Z 8': '616/Z_8',
    'Z 9': '589/Z_9',
    'Z f': '624/Z_f',
    'Z fc': '574/Z_fc',
    'Z50II': '637/Z50II',
    'Z5II': '648/Z5II',
    'Z6III': '629/Z6III',
    // Reflex
    'D850': '359/D850',
    'D810': '176/D810',
    'D810A': '198/D810A',
    'D800': '16/D800',
    'D800E': '17/D800E',
    'D780': '539/D780',
    'D750': '175/D750',
    'D7500': '352/D7500',
    'D7200': '197/D7200',
    'D7100': '27/D7100',
    'D7000': '26/D7000',
    'D5600': '351/D5600',
    'D5500': '196/D5500',
    'D5300': '25/D5300',
    'D5200': '24/D5200',
    'D5100': '23/D5100',
    'D5000': '22/D5000',
    'D500': '323/D500',
    'D3500': '471/D3500',
    'D3400': '330/D3400',
    'D3300': '21/D3300',
    'D3200': '20/D3200',
    'D3100': '19/D3100',
    'D3000': '18/D3000',
    'D6': '545/D6',
    'D5': '320/D5',
    'D4S': '5/D4S',
    'D4': '4/D4',
    'D3X': '3/D3X',
    'D3S': '2/D3S',
    'D3': '1/D3',
    'Df': '28/Df',
    'ZR': '659/ZR'
  };

  const getDownloadUrl = (productName: string) => {
    const nameUpper = productName.toUpperCase().replace(/\s/g, '');
    
    // Si es Z30, mantenemos el link base del producto que ya tenemos mapeado
    const modelKey = Object.keys(DOWNLOAD_CENTER_MAP).find(key => {
      const keyUpper = key.toUpperCase().replace(/\s/g, '');
      return nameUpper.includes(keyUpper);
    });
    
    if (modelKey) {
      const path = DOWNLOAD_CENTER_MAP[modelKey];
      return `https://downloadcenter.nikonimglib.com/es/products/${path}.html`;
    }
    return null;
  };

  const handleRemoveEquipment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto de tu equipo?')) return;
    
    const { error } = await supabase.from('user_equipment').delete().eq('id', id);
    if (!error && sessionUser) {
      fetchUserEquipment(sessionUser.id);
    }
  };

  useEffect(() => {
    trackPageView('/gear', 'Mi Equipo');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
       setSessionUser(session?.user);
       if (session?.user) {
         fetchUserEquipment(session.user.id);
       } else {
         setLoading(false);
       }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSessionUser(session?.user);
        if (session?.user) {
            fetchUserEquipment(session.user.id);
        } else {
            setUserEquipment([]);
        }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserEquipment = async (userId: string) => {
      setLoading(true);
      const { data } = await supabase.from('user_equipment').select('*').eq('user_id', userId);
      if (data) {
          // Ordenar: Cámara Z, Cámara Reflex, Lente Z, Lente Reflex
          const sortedData = [...data].sort((a, b) => {
              const isZ = (name: string) => {
                  const n = name.toUpperCase();
                  // Caso especial para cámaras Z (Z7 II, Z 30, Z6, etc.)
                  const isZCamera = (n.startsWith('Z') && (n.includes(' ') || n.length < 8)) || n.startsWith('NIKON Z');
                  // Caso para lentes Z (Nikkor Z...)
                  const isZLens = n.includes('NIKKOR Z');
                  return isZCamera || isZLens;
              };

              const getPriority = (item: any) => {
                  const isCamera = item.product_type === 'camera' || (item.category && item.category.toLowerCase().includes('camara'));
                  const isZSeries = isZ(item.product_name);

                  if (isCamera && isZSeries) return 1; // Cámara Z
                  if (isCamera && !isZSeries) return 2; // Cámara Reflex
                  if (!isCamera && isZSeries) return 3; // Lente Z
                  return 4; // Lente Reflex
              };

              const priorityA = getPriority(a);
              const priorityB = getPriority(b);

              if (priorityA !== priorityB) {
                  return priorityA - priorityB;
              }
              // Si tienen la misma prioridad, ordenar alfabéticamente
              return a.product_name.localeCompare(b.product_name);
          });
          setUserEquipment(sortedData);
      }
      setLoading(false);
  };

  const handleSelectorClose = () => {
      setShowSelector(false);
      if (sessionUser) fetchUserEquipment(sessionUser.id);
  };

  if (loading) return <div className="min-h-screen bg-nikon-black text-white flex justify-center items-center">Cargando...</div>;

  if (!sessionUser) {
    return (
        <div className="pt-24 min-h-screen bg-nikon-black flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={64} className="text-nikon-yellow mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Acceso Restringido</h1>
            <p className="text-gray-400 mb-8 max-w-md">Para gestionar tu equipo y recibir recomendaciones personalizadas, necesitas iniciar sesión en tu cuenta Nikon ID.</p>
            <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-nikon-yellow text-black font-bold py-3 px-8 rounded hover:brightness-110 transition-all"
                >
                  Iniciar Sesión
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-nikon-black text-white pb-20">
      {/* Header */}
      <div className="bg-nikon-surface border-b border-nikon-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-black font-display mb-2">Mi Equipo <span className="text-nikon-yellow">Nikon</span></h1>
              <p className="text-gray-400 max-w-xl">
                Administra tu colección. Selecciona los productos que posees para recibir tutoriales y beneficios personalizados.
              </p>
            </div>
            
            <button 
              onClick={() => setShowSelector(true)}
              className="bg-nikon-yellow text-black font-bold py-3 px-6 rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-nikon-yellow/20"
            >
              <Settings size={20} />
              Administrar Equipo
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
          {showSelector ? (
              <EquipmentSelector userId={sessionUser?.id} onClose={handleSelectorClose} />
          ) : (
              <div>
                  {userEquipment.length === 0 ? (
                      <div className="text-center py-20 bg-nikon-surface border border-dashed border-nikon-border rounded-xl">
                          <div className="bg-nikon-yellow/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Settings size={40} className="text-nikon-yellow" />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">Aún no has seleccionado tu equipo</h2>
                          <p className="text-gray-400 mb-8 max-w-md mx-auto">
                              Para brindarte la mejor experiencia, necesitamos saber qué cámaras y lentes utilizas.
                          </p>
                          <button 
                              onClick={() => setShowSelector(true)}
                              className="bg-nikon-yellow text-black font-bold py-3 px-8 rounded-lg hover:brightness-110 transition-all"
                          >
                              Seleccionar Equipo Ahora
                          </button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userEquipment.map((eq) => {
                              return (
                                <div key={eq.id} className="bg-nikon-surface border border-nikon-border rounded-xl p-6 group hover:border-nikon-yellow transition-all relative">
                                  {/* Botón eliminar */}
                                  <button 
                                      onClick={() => handleRemoveEquipment(eq.id)}
                                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Eliminar de mi equipo"
                                  >
                                      <X size={20} />
                                  </button>

                                  <div className="flex items-start justify-between mb-4">
                                      <div className="p-3 bg-white/5 rounded-lg group-hover:bg-nikon-yellow/20 transition-colors">
                                          {eq.product_type === 'camera' ? (
                                              <span className="material-symbols-outlined text-nikon-yellow">photo_camera</span>
                                          ) : (
                                              <span className="material-symbols-outlined text-nikon-yellow">shutter_speed</span>
                                          )}
                                      </div>
                                      <span className="text-xs uppercase font-bold text-gray-500 border border-gray-700 px-2 py-1 rounded">
                                          {eq.product_type === 'camera' ? 'Cámara' : 'Lente'}
                                      </span>
                                  </div>
                                  <h3 className="text-xl font-bold mb-1 pr-8">{eq.product_name}</h3>
                                  <p className="text-sm text-green-500 flex items-center gap-1 mb-4">
                                      <CheckCircle size={14} /> Seleccionado
                                  </p>
                                  
                                  {eq.product_type === 'camera' && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                        <a 
                                            href={getDownloadUrl(eq.product_name) || '#'} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`flex-1 text-xs font-bold py-2 rounded text-center transition-colors ${
                                                getDownloadUrl(eq.product_name) ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                            }`}
                                            onClick={e => !getDownloadUrl(eq.product_name) && e.preventDefault()}
                                        >
                                            <Download className="inline-block w-3.5 h-3.5 mr-1.5" />
                                            Manuales y Firmware
                                        </a>
                                    </div>
                                  )}
                                </div>
                              );
                          })}
                          
                          {/* Add more button card */}
                          <div 
                              onClick={() => setShowSelector(true)}
                              className="border border-dashed border-nikon-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all min-h-[200px]"
                          >
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-nikon-yellow group-hover:text-black transition-colors">
                                  <span className="text-2xl font-bold">+</span>
                              </div>
                              <span className="font-bold text-gray-400">Agregar más equipo</span>
                          </div>
                      </div>
                  )}
              </div>
          )}
      </div>

      <AIAssistantWidget context="" />
    </div>
  );
};

export default Gear;
