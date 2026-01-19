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