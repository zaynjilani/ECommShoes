export interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  size: string[];
  category: string;
  imageUrl: string;
  images?: string[];
  description: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  createdAt?: string;
}

/** Shape used by the admin create/edit reactive form. */
export interface ProductFormValue {
  id: number | null;
  name: string;
  price: number;
  compareAtPrice: number | null;
  size: string; // comma separated in the form, split into an array on save
  category: string;
  imageUrl: string;
  description: string;
  isNewArrival: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  stock: number;
}
