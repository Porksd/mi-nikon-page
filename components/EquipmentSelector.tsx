import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Search, Monitor, Camera, Aperture, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  image_url?: string;
  publish?: number;
}

interface EquipmentSelectorProps {
  userId: string;
  onClose?: () => void; // Optional if used in modal
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({ userId, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'camera' | 'lens'>('all');
  const [subFilter, setSubFilter] = useState<'all' | 'zseries' | 'reflex'>('all');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all published products
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, category, subcategory, image_url, publish')
        .eq('publish', 1) // Only show published items
        .order('name');
      
      if (allProducts) {
          // Strict filtering based on Beta requirements:
          // Show: (Cameras or Lenses) which are (Réflex or ZSeries)
          // OR Flash
          // Explicitly EXCLUDE Coolpix and General Subcategories (except for Flash which might be General)
          const allowed = allProducts.filter(p => {
              const cat = (p.category || '').toLowerCase();
              const sub = (p.subcategory || '').toLowerCase();

              if (cat === 'flash') return true;

              if (cat === 'cámaras' || cat === 'lentes') {
                  const s = sub.trim();
                  return s === 'réflex' || s === 'reflex' || s === 'zseries';
              }
              return false;
          });
          setProducts(allowed);
      }

      // 2. Fetch user's current equipment
      const { data: userEq } = await supabase
        .from('user_equipment')
        .select('product_name')
        .eq('user_id', userId);
      
      if (userEq) {
        const selectedSet = new Set(userEq.map(item => item.product_name));
        setSelectedProducts(selectedSet);
      }
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = async (product: Product) => {
    const isSelected = selectedProducts.has(product.name);
    const newSelected = new Set(selectedProducts);
    const pdType = determineType(product);
    const finalType = pdType === 'accessory' ? 'other' : pdType;

    if (isSelected) {
      newSelected.delete(product.name);
      // Remove from DB
      await supabase
        .from('user_equipment')
        .delete()
        .eq('user_id', userId)
        .eq('product_name', product.name);
    } else {
      newSelected.add(product.name);
      // Add to DB
      await supabase
        .from('user_equipment')
        .insert([{
          user_id: userId,
          product_name: product.name,
          product_type: finalType
        }]);
    }
    
    setSelectedProducts(newSelected);
  };

  const determineType = (product: Product): string => {
    const cat = (product.category || '').toLowerCase();
    const name = product.name.toLowerCase();

    // 1. Exclude explicitly
    if (name.includes('coolpix') || cat.includes('coolpix')) return 'other';
    if (name.includes('teleconverter') || name.includes('teleconvertidor')) return 'other';

    // Exclude accessories
    const exclusions = ['batería', 'battery', 'cargador', 'charger', 'tapa', 'cap', 'correa', 'strap', 'estuche', 'case', 'bolso', 'bag', 'mochila', 'backpack', 'grip', 'empuñadura', 'control', 'remote', 'cable', 'ocular', 'eyepiece', 'filtro', 'filter', 'parasol', 'hood', 'anillo', 'ring', 'adaptador', 'adapter', 'flash', 'speedlight', 'microfono', 'microphone', 'trípode', 'tripod', 'memory', 'memoria'];
    
    if (exclusions.some(ex => name.includes(ex) || cat.includes(ex))) {
        return 'accessory';
    }

    // Determine by DB Category
    if (cat === 'cámaras' || cat === 'camaras' || cat === 'camera' || cat === 'dslr' || cat === 'mirrorless') return 'camera';
    if (cat === 'lentes' || cat === 'lens' || cat === 'lente' || cat === 'objetivo') return 'lens';
    if (cat === 'flash' || cat.includes('speaklight') || cat.includes('iluminación')) return 'flash';

    return 'other';
  };

  const determineSubCategory = (product: Product): 'zseries' | 'reflex' | 'other' => {
      const sub = (product.subcategory || '').toLowerCase();
      
      if (sub === 'zseries') return 'zseries';
      if (sub === 'reflex' || sub === 'réflex') return 'reflex';
      
      // Fallback for Lenses if subcategory logic in DB wasn't perfect (though migration covers it)
      const name = product.name.toLowerCase();
      if (name.includes('nikkor z') || name.includes(' z ')) return 'zseries';
      
      return 'other';
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const type = determineType(p);
    
    // Main category filter
    let matchesCategory = false;
    if (activeCategory === 'all') {
        // Only show cameras and lenses AND Flash by default
        matchesCategory = (type === 'camera' || type === 'lens' || type === 'flash');
    }
    else if (activeCategory === 'camera') matchesCategory = type === 'camera';
    else if (activeCategory === 'lens') matchesCategory = type === 'lens';
    else matchesCategory = type === activeCategory;

    // Strict sub-category requirement (But allow Flash which might be 'other' subcat)
    const sub = determineSubCategory(p);
    if (type !== 'flash' && sub === 'other') return false;

    // Sub-filter for Z vs Reflex (toggle)
    let matchesSubFilter = true;
    if (subFilter !== 'all') {
        // If filtering by subcategory, strictly match.
        // Assuming Flash doesn't participate in Z/Reflex filters usually, 
        // unless valid. If Flash is 'other', it won't match 'zseries'.
        // So strict filtering hides Flash if user selects 'ZSeries'. This is acceptable behavior.
        matchesSubFilter = sub === subFilter;
    }
    
    return matchesSearch && matchesCategory && matchesSubFilter;
  });

  return (
    <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6 w-full max-w-4xl mx-auto shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Selecciona tu Equipo</h2>
          <p className="text-gray-400 text-sm">Marca los productos que posees para personalizar tu experiencia.</p>
        </div>
        
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
                <button 
                    onClick={() => { setActiveCategory('all'); setSubFilter('all'); }}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeCategory === 'all' ? 'bg-nikon-yellow text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Todo
                </button>
                <button 
                    onClick={() => { setActiveCategory('camera'); setSubFilter('all'); }}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                    activeCategory === 'camera' ? 'bg-nikon-yellow text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Camera size={16} /> Cámaras
                </button>
                <button 
                    onClick={() => { setActiveCategory('lens'); setSubFilter('all'); }}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                    activeCategory === 'lens' ? 'bg-nikon-yellow text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Aperture size={16} /> Lentes
                </button>
            </div>
            
            {(activeCategory === 'all' || activeCategory === 'camera' || activeCategory === 'lens') && (
                <div className="flex gap-2 self-start md:self-end">
                    <button
                        onClick={() => setSubFilter('all')}
                        className={`text-xs px-2 py-1 rounded transition-colors ${subFilter === 'all' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setSubFilter('zseries')}
                        className={`text-xs px-2 py-1 rounded transition-colors ${subFilter === 'zseries' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        ZSeries
                    </button>
                    <button
                        onClick={() => setSubFilter('reflex')}
                        className={`text-xs px-2 py-1 rounded transition-colors ${subFilter === 'reflex' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Réflex
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar modelo (ej: Z8, 24-70mm...)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-nikon-border rounded-lg pl-10 pr-4 py-3 text-white focus:border-nikon-yellow outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
           <div className="col-span-full text-center py-10 text-gray-500">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
           <div className="col-span-full text-center py-10 text-gray-500">No se encontraron productos.</div>
        ) : (
           filteredProducts.map(product => {
             const isSelected = selectedProducts.has(product.name);
             return (
               <div 
                 key={product.id}
                 onClick={() => handleToggleProduct(product)}
                 className={`cursor-pointer rounded-lg border p-4 flex items-center justify-between transition-all hover:bg-white/5 ${
                   isSelected 
                     ? 'bg-nikon-yellow/10 border-nikon-yellow' 
                     : 'bg-black/20 border-white/5 hover:border-white/20'
                 }`}
               >
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-nikon-yellow text-black' : 'bg-white/10 text-gray-400'}`}>
                        {determineType(product) === 'camera' ? <Camera size={20} /> : <Aperture size={20} />}
                    </div>
                    <div>
                        <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>{product.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                    </div>
                 </div>
                 {isSelected && (
                    <div className="bg-nikon-yellow text-black rounded-full p-1">
                        <Check size={14} strokeWidth={3} />
                    </div>
                 )}
               </div>
             );
           })
        )}
      </div>
      
      {onClose && (
          <div className="mt-6 flex justify-end">
              <button 
                onClick={onClose}
                className="bg-nikon-yellow text-black font-bold py-3 px-8 rounded hover:brightness-110 transition-all"
              >
                  Listo
              </button>
          </div>
      )}
    </div>
  );
};

export default EquipmentSelector;
