/**
 * Analytics Service
 * 
 * Tracks user interactions and retrieves analytics data
 */

import { supabase } from './supabaseClient';

// ==================== TYPES ====================

export interface AnalyticsEvent {
  event_type: string;
  event_category?: string;
  event_data?: Record<string, any>;
}

export interface DashboardKPIs {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  total_products_registered: number;
  total_serial_numbers: number;
  total_workshops: number;
  upcoming_workshops: number;
  total_ai_queries: number;
  ai_queries_today: number;
  avg_session_duration_minutes: number;
  total_notifications_sent: number;
}

export interface DailySummary {
  activity_date: string;
  page_views: number;
  product_views: number;
  ai_queries: number;
  tutorial_views: number;
  unique_users: number;
  total_events: number;
}

export interface ActiveUsersData {
  period: 'daily' | 'weekly' | 'monthly';
  user_count: number;
  date: string;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  category: string;
  view_count?: number;
  registration_count?: number;
  unique_users: number;
}

export interface TopPage {
  page_path: string;
  page_name: string;
  view_count: number;
  unique_users: number;
  last_viewed: string;
}

export interface UserEngagement {
  user_id: string;
  full_name: string;
  email: string;
  total_time_minutes: number;
  total_sessions: number;
  registered_products_count: number;
  ai_queries_count: number;
  tutorials_viewed_count: number;
  workshops_registered_count: number;
  engagement_score: number;
  last_active: string | null;
  engagement_level: 'active' | 'moderate' | 'inactive';
}

// ==================== EVENT TRACKING ====================

/**
 * Log an analytics event
 */
export async function logEvent(
  eventType: string,
  eventCategory?: string,
  eventData?: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('log_analytics_event', {
      p_event_type: eventType,
      p_event_category: eventCategory || null,
      p_event_data: eventData || null
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging analytics event:', error);
    return false;
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageName: string) {
  return logEvent('page_view', 'navigation', {
    page: pagePath,
    page_name: pageName
  });
}

/**
 * Track product view
 */
export function trackProductView(productId: string, productName: string, category: string) {
  return logEvent('product_view', 'content', {
    product_id: productId,
    product_name: productName,
    category
  });
}

/**
 * Track AI query
 */
export function trackAIQuery(query: string, responseLength?: number) {
  return logEvent('ai_query', 'interaction', {
    query,
    query_length: query.length,
    response_length: responseLength
  });
}

/**
 * Track tutorial view
 */
export function trackTutorialView(tutorialId: string, tutorialTitle: string, durationSeconds?: number) {
  return logEvent('tutorial_view', 'content', {
    tutorial_id: tutorialId,
    tutorial_title: tutorialTitle,
    duration_seconds: durationSeconds
  });
}

/**
 * Track product search
 */
export function trackProductSearch(searchQuery: string, resultsCount: number) {
  return logEvent('product_search', 'search', {
    query: searchQuery,
    results_count: resultsCount
  });
}

// ==================== ANALYTICS RETRIEVAL ====================

/**
 * Get dashboard KPIs
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs | null> {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_kpis');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    return null;
  }
}

/**
 * Get daily activity summary
 */
export async function getDailySummary(days: number = 30): Promise<DailySummary[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_daily_summary')
      .select('*')
      .order('activity_date', { ascending: false })
      .limit(days);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return [];
  }
}

/**
 * Get active users data
 */
export async function getActiveUsers(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ActiveUsersData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_active_users')
      .select('*')
      .eq('period', period)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active users:', error);
    return [];
  }
}

/**
 * Get top viewed products
 */
export async function getTopProducts(): Promise<TopProduct[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_top_products')
      .select('*')
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}

/**
 * Get top registered products
 */
export async function getTopRegisteredProducts(): Promise<TopProduct[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_top_registered_products')
      .select('*')
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top registered products:', error);
    return [];
  }
}

/**
 * Get top pages
 */
export async function getTopPages(): Promise<TopPage[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_top_pages')
      .select('*')
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top pages:', error);
    return [];
  }
}

/**
 * Get user engagement data
 */
export async function getUserEngagement(limit: number = 20): Promise<UserEngagement[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_user_engagement')
      .select('*')
      .order('engagement_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user engagement:', error);
    return [];
  }
}

/**
 * Get AI queries analytics
 */
export async function getAIQueriesAnalytics(days: number = 30) {
  try {
    const { data, error } = await supabase
      .from('analytics_ai_queries')
      .select('*')
      .limit(days);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching AI queries analytics:', error);
    return [];
  }
}

/**
 * Get top tutorials
 */
export async function getTopTutorials() {
  try {
    const { data, error } = await supabase
      .from('analytics_top_tutorials')
      .select('*')
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top tutorials:', error);
    return [];
  }
}

/**
 * Get workshop stats
 */
export async function getWorkshopStats() {
  try {
    const { data, error } = await supabase
      .from('analytics_workshop_stats')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching workshop stats:', error);
    return [];
  }
}

// ==================== HELPERS ====================

/**
 * Format engagement level with emoji
 */
export function formatEngagementLevel(level: string): string {
  switch (level) {
    case 'active':
      return '🟢 Activo';
    case 'moderate':
      return '🟡 Moderado';
    case 'inactive':
      return '🔴 Inactivo';
    default:
      return level;
  }
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
