# J's Kics & Co — Premium Angular E-Commerce Storefront

A production-quality, fully responsive e-commerce storefront built with **Angular 18** (standalone components), TypeScript, SCSS, Reactive Forms and RxJS. Product data is served from a static JSON file, the shopping cart and admin edits persist via **LocalStorage**, and checkout completes by handing a formatted order straight to **WhatsApp**.

## ✨ Features

- Modern, editorial-style UI (Playfair Display + Manrope, warm ivory/brass palette)
- Sticky responsive header with search, hamburger menu, live cart badge
- Homepage: hero carousel, categories, new arrivals, featured products, promo banner, "why us", newsletter
- Full product listing with search, category/size/price filters and sorting
- Product details page with gallery, size/quantity selection, related products
- Persistent cart (LocalStorage) that survives navigation and page refresh
- Checkout with Reactive Forms validation, numbered order review, automatic totals
- **"Place Order on WhatsApp"** button — builds a formatted message and opens `wa.me`
- Order success page with a generated reference number (e.g. `ORD-20260904-482`)
- Admin Product Management (`/admin/products`) — full CRUD backed by LocalStorage, with a "Reset to Defaults" action
- Toasts, confirm dialogs, skeleton loaders and empty states throughout
- Centralized `STORE_CONFIG` for company name, WhatsApp number, currency, delivery charges, banners, nav and socials

## 🚀 Getting Started

```bash
npm install
ng serve
```

Then open **http://localhost:4200**.

> Requires Node.js 18+ and Angular CLI 18 (`npm install -g @angular/cli` if you don't have it).

To create a production build:

```bash
ng build
```

Output is written to `dist/ecommerce-store`.

## ⚙️ Configuration

All business-facing settings live in one file:

```
src/app/core/config/store.config.ts
```

Change here to update, without touching any component:

- `companyName`, `logoText`, `tagline`
- `whatsappNumber` — **international format, digits only** (e.g. `923001234567`)
- `currency`, `currencyCode`
- `deliveryCharges`, `freeDeliveryThreshold`
- `navLinks`, `socialLinks`, `banners` (hero slides), newsletter copy

## 🗂️ Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── config/store.config.ts        # Centralized store configuration
│   │   ├── models/                       # Product, CartItem, Category, Order interfaces
│   │   └── services/
│   │       ├── product.service.ts        # JSON + LocalStorage CRUD abstraction
│   │       ├── category.service.ts
│   │       ├── cart.service.ts           # Persistent, reactive cart (BehaviorSubject + LocalStorage)
│   │       ├── whatsapp.service.ts       # Order message + wa.me URL builder
│   │       ├── wishlist.service.ts
│   │       ├── toast.service.ts
│   │       └── confirm.service.ts        # Promise-based confirm dialog
│   ├── shared/components/                # Header, Footer, ProductCard, CategoryCard,
│   │                                      # QuantitySelector, Toast, ConfirmDialog, Loading, EmptyState
│   ├── pages/
│   │   ├── home/
│   │   ├── products/                     # Listing + search/filter/sort
│   │   ├── product-details/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── checkout/                     # Reactive form + WhatsApp order placement
│   │   ├── order-success/
│   │   ├── admin-products/               # Full CRUD admin UI
│   │   ├── about/
│   │   ├── contact/
│   │   └── not-found/
│   ├── app.routes.ts                     # Lazy-loaded standalone routes
│   └── app.config.ts                     # Router, HttpClient, animations providers
└── assets/
    └── data/
        ├── products.json                 # Initial product catalog (20 sample products)
        └── categories.json               # Configurable category list
```

## 🧠 How data persistence works (prototype-realistic)

A browser app cannot write to a JSON file on disk, so this project follows a
pattern that's easy to swap for a real backend later:

1. **`ProductService`** loads the base catalog from `assets/data/products.json`.
2. Any create/update/delete from the **Admin Products** page is merged on top
   and saved to `localStorage` (`J's Kics & Co_products_v1`).
3. On every app load, the service merges LocalStorage over the JSON baseline,
   so your admin edits "stick" between sessions.
4. **"Reset to Defaults"** in the admin page clears LocalStorage and reloads
   the original JSON — handy for demos.
5. Because every public method on `ProductService` returns an `Observable`,
   swapping the internals for real `HttpClient` calls to a REST API later
   requires **no changes** in any component that consumes the service.

The shopping cart (`CartService`) works the same way but is always
LocalStorage-backed (`J's Kics & Co_cart_v1`) since it's genuinely user/session data —
this is what makes the cart survive route navigation and page refreshes.

## 💬 WhatsApp Ordering

On checkout, `WhatsappService`:

1. Generates an order reference like `ORD-20260904-482`.
2. Builds a plain-text message listing the customer's details and a numbered
   product list with per-item and grand totals.
3. URL-encodes the message and opens `https://wa.me/<number>?text=<message>`
   in a new tab.
4. The cart is cleared **after** WhatsApp has been opened, and the order is
   also cached in `localStorage` (`J's Kics & Co_last_order`) so the success page
   still renders correctly even after a refresh.

The WhatsApp number is read from `STORE_CONFIG.whatsappNumber` everywhere —
it is never hardcoded in a component or template.

## 🛠️ Admin — Product Management

Navigate to **`/admin/products`** to:

- Add a new product (name, price, compare-at price, category, sizes,
  image URL with live preview, description, stock, and New/Featured/Sale flags)
- Edit or delete existing products (delete requires confirmation)
- Search/filter the admin table by name or category
- Reset the whole catalog back to the shipped `products.json`

> This is a frontend-only prototype: there's no authentication guard on the
> admin route by design, since there's no backend to authenticate against
> yet. Add an `AuthGuard` in `core/guards` once a real login/API exists.

## 📱 Responsiveness

- **Desktop:** 4-column product grid, full nav, large hero
- **Tablet:** 2–3 column grids, condensed nav
- **Mobile:** hamburger nav, 1–2 column grids, off-canvas filters on the
  products page, sticky add-to-cart actions on product details, and a
  single-column checkout optimized for ordering on a phone

## 🧩 Tech Stack

Angular 18 (standalone components, lazy-loaded routes), TypeScript, SCSS,
Angular Router, Reactive Forms, RxJS, LocalStorage — no React/Vue/Next.js,
no UI framework (Bootstrap etc.) — all styling is custom SCSS using a design
token system in `src/styles.scss`.
