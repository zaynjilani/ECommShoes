import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'LUXE — Premium Fashion Store',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then((m) => m.ProductsComponent),
    title: 'Shop All Products — LUXE',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent
      ),
    title: 'Product Details — LUXE',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then((m) => m.CategoriesComponent),
    title: 'Categories — LUXE',
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
    title: 'Your Cart — LUXE',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'Checkout — LUXE',
  },
  {
    path: 'order-success',
    loadComponent: () =>
      import('./pages/order-success/order-success.component').then(
        (m) => m.OrderSuccessComponent
      ),
    title: 'Order Placed — LUXE',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'About Us — LUXE',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact Us — LUXE',
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('./pages/admin-products/admin-products.component').then(
        (m) => m.AdminProductsComponent
      ),
    title: 'Product Management — Admin',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page Not Found — LUXE',
  },
];
