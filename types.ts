export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  isRecommended?: boolean;
  tag?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  icon: string;
  isRecommended?: boolean;
}

export interface Workshop {
  id: string;
  topic: string;
  instructor: string;
  location: string;
  date: string;
  time: string;
  spots: number;
  description: string;
  image: string;
}

export interface Tutorial {
  id: string;
  title: string;
  category: 'Ideas e Inspiración' | 'Productos e Innovación' | 'Tips y Técnicas';
  summary: string;
  link: string;
  thumbnail: string;
}

export interface Notification {
  id: string;
  type: 'firmware' | 'workshop' | 'promo';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

// Shopping Cart Interfaces
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  product_category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  added_at: string;
  updated_at: string;
}

export interface ShoppingCart {
  id: string;
  user_id: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
  last_viewed_at: string;
  status: 'active' | 'completed' | 'abandoned' | 'expired';
  total_value: number;
  items_count: number;
  abandoned_at?: string;
  completed_at?: string;
  notes?: string;
  items?: CartItem[];
}

export interface CartNotification {
  id: string;
  cart_id: string;
  user_id: string;
  notification_type: 'reminder_1h' | 'reminder_24h' | 'reminder_3d' | 'reminder_7d' | 'discount_offer' | 'expiring_soon';
  title: string;
  message: string;
  created_at: string;
  sent_at?: string;
  viewed_at?: string;
  clicked_at?: string;
  status: 'pending' | 'sent' | 'viewed' | 'clicked' | 'dismissed';
}

export interface AbandonedCartSummary {
  id: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
  total_value: number;
  items_count: number;
  hours_abandoned: number;
  notification_stage: 'recent' | 'reminder_1h' | 'reminder_24h' | 'reminder_3d' | 'reminder_7d';
  notifications_sent: number;
}