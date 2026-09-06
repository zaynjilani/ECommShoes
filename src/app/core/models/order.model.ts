import { CartItem } from './cart-item.model';

export interface CustomerInfo {
  name: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  reference: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}
