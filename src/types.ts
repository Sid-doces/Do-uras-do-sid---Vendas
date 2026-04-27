export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Tortas' | 'Kits' | 'Embalagens';
  stock: number;
  imageUrl: string;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: any;
}

export interface City {
  id: string;
  name: string;
  deliveryDays: number[]; // 0-6 (Sun-Sat)
  specificDates?: string[]; // YYYY-MM-DD
  availableHours: string[];
  maxDailyOrders: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  cityId: string;
  items: OrderItem[];
  total: number;
  deliveryDate: string; // YYYY-MM-DD
  deliveryTime: string;
  deliveryType: 'city' | 'local';
  deliveryFee: number;
  distanceKm?: number;
  status: 'pendente' | 'confirmado' | 'entregue' | 'cancelado';
  createdAt: any;
}

export interface Review {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: any;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  isFeatured: boolean;
  createdAt: any;
}

export interface DeliveryRange {
  minKm: number;
  maxKm: number;
  price: number;
}

export interface Settings {
  instagramUrl: string;
  whatsappUrl: string;
  whatsappNumber?: string;
  followerCount: number;
  dailyProductionLimit: number;
  shopAddress?: string;
  shopCoordinates?: { lat: number; lng: number };
  localDeliveryEnabled: boolean;
  deliveryRanges: DeliveryRange[];
  heroImageUrl?: string;
  logoUrl?: string;
}
