export interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  size: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
}
