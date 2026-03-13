/**
 * AI Recommendations Service
 * 
 * Generates personalized product recommendations based on user's gear
 * Uses contextual messaging and dynamic content
 */

import { supabase } from './supabaseClient';

// ==================== TYPES ====================

export interface UserGear {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  is_registered?: boolean;
}

export interface RecommendationContext {
  userGear: UserGear[];
  userName?: string;
  hasCamera: boolean;
  hasLens: boolean;
  cameraModel?: string;
  lensModel?: string;
  missingCategories: string[];
}

export interface ProductRecommendation {
  product_id: string;
  product_name: string;
  category: string;
  price?: string;
  image_url?: string;
  reason: string;
  priority: number;
  contextual_message: string;
}

// ==================== RECOMMENDATION ENGINE ====================

/**
 * Generate personalized recommendations based on user's gear
 */
export async function generateRecommendations(
  userId: string
): Promise<{ recommendations: ProductRecommendation[], context: RecommendationContext }> {
  try {
    // 1. Fetch user's gear
    const userGear = await fetchUserGear(userId);
    
    // 2. Build context
    const context = buildContext(userGear);
    
    // 3. Generate recommendations
    const recommendations = await buildRecommendations(context);
    
    return { recommendations, context };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return { recommendations: [], context: buildContext([]) };
  }
}

/**
 * Fetch user's registered products
 */
async function fetchUserGear(userId: string): Promise<UserGear[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_products')
      .select(`
        id,
        product_id,
        product:products (
          id,
          name,
          category
        )
      `)
      .or(`user_id.eq.${userId},customer_email.eq.${user.email}`);

    if (error) throw error;

    return (data || []).map((item: any) => {
      const prod = Array.isArray(item.product) ? item.product[0] : item.product;
      return {
        id: item.id,
        product_id: prod?.id || '',
        product_name: prod?.name || '',
        category: prod?.category || ''
      };
    });
  } catch (error) {
    console.error('Error fetching user gear:', error);
    return [];
  }
}

/**
 * Build recommendation context from user gear
 */
function buildContext(userGear: UserGear[]): RecommendationContext {
  const hasCamera = userGear.some(g => 
    g.category?.toLowerCase().includes('cámara') || 
    g.category?.toLowerCase().includes('camera') ||
    g.category?.toLowerCase().includes('reflex') ||
    g.category?.toLowerCase().includes('mirrorless')
  );
  
  const hasLens = userGear.some(g => 
    g.category?.toLowerCase().includes('lente') || 
    g.category?.toLowerCase().includes('objetivo')
  );
  
  const cameraGear = userGear.find(g => 
    g.category?.toLowerCase().includes('cámara') || 
    g.category?.toLowerCase().includes('reflex') ||
    g.category?.toLowerCase().includes('mirrorless')
  );
  
  const lensGear = userGear.find(g => 
    g.category?.toLowerCase().includes('lente') || 
    g.category?.toLowerCase().includes('objetivo')
  );
  
  const categories = new Set(userGear.map(g => g.category?.toLowerCase() || ''));
  const missingCategories = [];
  
  if (!hasCamera) missingCategories.push('cámara');
  if (!hasLens) missingCategories.push('lente');
  if (!categories.has('flash')) missingCategories.push('flash');
  if (!categories.has('trípode') && !categories.has('tripode')) missingCategories.push('trípode');
  if (!categories.has('filtro')) missingCategories.push('filtro');
  
  return {
    userGear,
    hasCamera,
    hasLens,
    cameraModel: cameraGear?.product_name,
    lensModel: lensGear?.product_name,
    missingCategories
  };
}

/**
 * Build recommendations based on context
 */
async function buildRecommendations(
  context: RecommendationContext
): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];
  
  // Strategy 1: Complementary products for existing gear
  if (context.hasCamera && context.cameraModel) {
    recommendations.push(...await getComplementaryProducts(context));
  }
  
  // Strategy 2: Fill gaps in gear collection
  if (context.missingCategories.length > 0) {
    recommendations.push(...await getMissingCategoryProducts(context));
  }
  
  // Strategy 3: Upgrade path for existing gear
  if (context.hasCamera || context.hasLens) {
    recommendations.push(...await getUpgradeProducts(context));
  }
  
  // Strategy 4: Trending/popular products
  recommendations.push(...await getTrendingProducts());
  
  // Sort by priority and limit
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
}

/**
 * Get complementary products for user's gear
 */
async function getComplementaryProducts(
  context: RecommendationContext
): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];
  
  try {
    // Get lenses compatible with user's camera
    if (context.cameraModel) {
      const cameraType = extractCameraType(context.cameraModel);
      
      const { data: lenses } = await supabase
        .from('products')
        .select('*')
        .ilike('category', '%lente%')
        .or(`name.ilike.%${cameraType}%,description.ilike.%${cameraType}%`)
        .limit(2);
      
      (lenses || []).forEach((lens: any) => {
        const message = generateContextualMessage(lens, context);
        recommendations.push({
          product_id: lens.id,
          product_name: lens.name,
          category: lens.category,
          price: lens.price,
          image_url: lens.image_url,
          reason: `Compatible con tu ${context.cameraModel}`,
          priority: 10,
          contextual_message: message
        });
      });
    }
    
    // Get accessories for existing lenses
    if (context.hasLens && context.lensModel) {
      const { data: filters } = await supabase
        .from('products')
        .select('*')
        .ilike('category', '%filtro%')
        .limit(1);
      
      (filters || []).forEach((filter: any) => {
        recommendations.push({
          product_id: filter.id,
          product_name: filter.name,
          category: filter.category,
          price: filter.price,
          image_url: filter.image_url,
          reason: `Protege y mejora tu ${context.lensModel}`,
          priority: 8,
          contextual_message: `💡 Para sacarle partido a tu ${context.lensModel}`
        });
      });
    }
  } catch (error) {
    console.error('Error fetching complementary products:', error);
  }
  
  return recommendations;
}

/**
 * Get products for missing categories
 */
async function getMissingCategoryProducts(
  context: RecommendationContext
): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];
  
  try {
    // Flash for users without one
    if (context.missingCategories.includes('flash') && context.hasCamera) {
      const { data: flashes } = await supabase
        .from('products')
        .select('*')
        .ilike('category', '%flash%')
        .limit(1);
      
      (flashes || []).forEach((flash: any) => {
        recommendations.push({
          product_id: flash.id,
          product_name: flash.name,
          category: flash.category,
          price: flash.price,
          image_url: flash.image_url,
          reason: 'Esencial para fotografía con poca luz',
          priority: 7,
          contextual_message: '🌟 Hoy tenemos para ti: iluminación profesional'
        });
      });
    }
    
    // Tripod for stability
    if (context.missingCategories.includes('trípode')) {
      const { data: tripods } = await supabase
        .from('products')
        .select('*')
        .or('category.ilike.%trípode%,category.ilike.%tripode%')
        .limit(1);
      
      (tripods || []).forEach((tripod: any) => {
        recommendations.push({
          product_id: tripod.id,
          product_name: tripod.name,
          category: tripod.category,
          price: tripod.price,
          image_url: tripod.image_url,
          reason: 'Estabilidad para tus mejores tomas',
          priority: 6,
          contextual_message: '📸 Lleva tu fotografía al siguiente nivel'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching missing category products:', error);
  }
  
  return recommendations;
}

/**
 * Get upgrade suggestions
 */
async function getUpgradeProducts(
  context: RecommendationContext
): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];
  
  try {
    // Suggest premium lenses
    if (context.hasCamera) {
      const { data: premiumLenses } = await supabase
        .from('products')
        .select('*')
        .ilike('category', '%lente%')
        .or('name.ilike.%f/1.4%,name.ilike.%f/1.8%,name.ilike.%f/2.8%')
        .limit(1);
      
      (premiumLenses || []).forEach((lens: any) => {
        recommendations.push({
          product_id: lens.id,
          product_name: lens.name,
          category: lens.category,
          price: lens.price,
          image_url: lens.image_url,
          reason: 'Mayor calidad óptica y luminosidad',
          priority: 5,
          contextual_message: '⭐ Mejora recomendada para tu equipo'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching upgrade products:', error);
  }
  
  return recommendations;
}

/**
 * Get trending/popular products
 */
async function getTrendingProducts(): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];
  
  try {
    // Get recent or popular products
    const { data: trending } = await supabase
      .from('products')
      .select('*')
      .limit(2)
      .order('created_at', { ascending: false });
    
    (trending || []).forEach((product: any, index: number) => {
      recommendations.push({
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: product.price,
        image_url: product.image_url,
        reason: 'Tendencia en la comunidad',
        priority: 3 - index,
        contextual_message: '🔥 Lo más buscado esta semana'
      });
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
  }
  
  return recommendations;
}

// ==================== HELPERS ====================

/**
 * Extract camera type/mount from model name
 */
function extractCameraType(modelName: string): string {
  if (modelName.toLowerCase().includes('z')) return 'Z';
  if (modelName.toLowerCase().includes('d')) return 'F';
  return '';
}

/**
 * Generate contextual message based on product and user context
 */
function generateContextualMessage(product: any, context: RecommendationContext): string {
  const messages = [
    `✨ Pensando en tu ${context.cameraModel}`,
    `💡 Ideal para complementar tu equipo`,
    `🎯 Perfecto para tu ${context.cameraModel}`,
    `🌟 Para sacarle partido a tu equipo`,
    `📸 Recomendado para tu setup`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get product link to nikoncenter.cl
 */
export function getProductLink(productName: string): string {
  const slug = productName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove duplicate hyphens
  
  return `https://www.nikoncenter.cl/buscar?q=${encodeURIComponent(productName)}`;
}
