/**
 * Activity Tracking Service
 * 
 * Manages user session tracking and activity metrics.
 * Automatically tracks time spent in the app with session-based accumulation.
 */

import { supabase } from './supabaseClient';

// ==================== TYPES ====================

export interface ActivitySession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string | null;
  duration_minutes: number | null;
  page_path: string | null;
  device_info: string | null;
  created_at: string;
}

export interface ActivitySummary {
  total_minutes: number;
  total_hours: number;
  total_sessions: number;
  avg_session_minutes: number;
  last_active: string | null;
  first_active: string | null;
  total_active_days: number;
  is_inactive: boolean;
}

export interface DailyStats {
  activity_date: string;
  session_count: number;
  total_minutes: number;
  avg_session_minutes: number;
  first_session: string;
  last_session: string;
}

export interface WeeklyStats {
  week_start: string;
  session_count: number;
  total_minutes: number;
  avg_session_minutes: number;
  active_days: number;
}

export interface MonthlyStats {
  month_start: string;
  session_count: number;
  total_minutes: number;
  avg_session_minutes: number;
  active_days: number;
}

export interface InactiveUser {
  user_id: string;
  full_name: string;
  email: string;
  last_active: string | null;
  days_inactive: number;
}

// ==================== SESSION TRACKING ====================

let currentSessionId: string | null = null;
let sessionStartTime: Date | null = null;

/**
 * Start a new tracking session
 * @param pagePath Current page/route
 * @returns Session ID
 */
export async function startSession(pagePath?: string): Promise<string | null> {
  try {
    const deviceInfo = getDeviceInfo();
    
    const { data, error } = await supabase.rpc('start_user_session', {
      p_page_path: pagePath || window.location.hash.slice(1),
      p_device_info: deviceInfo
    });

    if (error) {
      console.error('Error starting session:', error);
      return null;
    }

    currentSessionId = data;
    sessionStartTime = new Date();
    
    console.log('Session started:', currentSessionId);
    return data;
  } catch (error) {
    console.error('Error starting session:', error);
    return null;
  }
}

/**
 * End the current tracking session
 * @param sessionId Optional session ID (uses current if not provided)
 * @returns Duration in minutes
 */
export async function endSession(sessionId?: string): Promise<number | null> {
  const targetSessionId = sessionId || currentSessionId;
  
  if (!targetSessionId) {
    console.warn('No active session to end');
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('end_user_session', {
      p_session_id: targetSessionId
    });

    if (error) {
      console.error('Error ending session:', error);
      return null;
    }

    if (data?.success) {
      console.log('Session ended:', data.duration_minutes, 'minutes');
      currentSessionId = null;
      sessionStartTime = null;
      return data.duration_minutes;
    }

    return null;
  } catch (error) {
    console.error('Error ending session:', error);
    return null;
  }
}

/**
 * Get current session ID
 */
export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

/**
 * Get current session duration (without ending it)
 * @returns Duration in minutes
 */
export function getCurrentSessionDuration(): number {
  if (!sessionStartTime) return 0;
  const now = new Date();
  const diffMs = now.getTime() - sessionStartTime.getTime();
  return Math.floor(diffMs / 60000);
}

// ==================== USER ACTIVITY STATS ====================

/**
 * Get complete activity summary for current user
 */
export async function getActivitySummary(userId?: string): Promise<ActivitySummary | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_activity_summary', {
      p_user_id: userId || null
    });

    if (error) {
      console.error('Error fetching activity summary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    return null;
  }
}

/**
 * Get daily activity stats for current user
 * @param days Number of days to retrieve (default: 7)
 */
export async function getDailyStats(days: number = 7): Promise<DailyStats[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data, error } = await supabase
      .from('daily_activity_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .order('activity_date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('Error fetching daily stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return [];
  }
}

/**
 * Get weekly activity stats for current user
 * @param weeks Number of weeks to retrieve (default: 4)
 */
export async function getWeeklyStats(weeks: number = 4): Promise<WeeklyStats[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data, error } = await supabase
      .from('weekly_activity_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .order('week_start', { ascending: false })
      .limit(weeks);

    if (error) {
      console.error('Error fetching weekly stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return [];
  }
}

/**
 * Get monthly activity stats for current user
 * @param months Number of months to retrieve (default: 6)
 */
export async function getMonthlyStats(months: number = 6): Promise<MonthlyStats[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data, error } = await supabase
      .from('monthly_activity_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .order('month_start', { ascending: false })
      .limit(months);

    if (error) {
      console.error('Error fetching monthly stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return [];
  }
}

/**
 * Get all user sessions
 * @param limit Number of sessions to retrieve
 */
export async function getUserSessions(limit: number = 20): Promise<ActivitySession[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('session_start', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
}

// ==================== ADMIN FUNCTIONS ====================

/**
 * Get inactive users (admin only)
 * @param daysThreshold Number of days of inactivity (default: 7)
 */
export async function getInactiveUsers(daysThreshold: number = 7): Promise<InactiveUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_inactive_users', {
      p_days_threshold: daysThreshold
    });

    if (error) {
      console.error('Error fetching inactive users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    return [];
  }
}

/**
 * Get all users' total activity (admin dashboard)
 */
export async function getAllUsersActivity(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_total_activity')
      .select('*')
      .order('total_minutes', { ascending: false });

    if (error) {
      console.error('Error fetching all users activity:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all users activity:', error);
    return [];
  }
}

// ==================== HELPERS ====================

/**
 * Get device and browser information
 */
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const screen = `${window.screen.width}x${window.screen.height}`;
  
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return `${platform} - ${browser} - ${screen}`;
}

/**
 * Format duration minutes to human-readable string
 * @param minutes Duration in minutes
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
 * Format date for display
 */
export function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-CL', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// ==================== AUTO SESSION MANAGEMENT ====================

/**
 * Initialize automatic session tracking
 * Call this when app loads and user is authenticated
 */
export function initializeSessionTracking() {
  // Start session on load
  startSession();
  
  // End session on page unload/close
  window.addEventListener('beforeunload', () => {
    if (currentSessionId) {
      // Use sendBeacon for reliable tracking on page close
      navigator.sendBeacon(
        `${supabase.supabaseUrl}/rest/v1/rpc/end_user_session`,
        JSON.stringify({ p_session_id: currentSessionId })
      );
    }
  });
  
  // Handle visibility changes (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User switched away - could end session here
      // Or just let it continue until they close the tab
    } else {
      // User came back - session continues
    }
  });
  
  // Heartbeat to keep session alive (optional)
  setInterval(() => {
    if (currentSessionId && sessionStartTime) {
      const duration = getCurrentSessionDuration();
      console.log(`Session active: ${duration} minutes`);
    }
  }, 60000); // Check every minute
}

/**
 * Cleanup session tracking
 * Call this on logout
 */
export async function cleanupSessionTracking() {
  if (currentSessionId) {
    await endSession();
  }
  currentSessionId = null;
  sessionStartTime = null;
}
