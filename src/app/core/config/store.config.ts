/**
 * Centralized store configuration.
 *
 * Everything that marketing/business may want to change without touching
 * component logic lives here: branding, contact details, WhatsApp ordering
 * number, currency symbol, delivery charges and homepage banner content.
 *
 * IMPORTANT: The WhatsApp number below must be in full international
 * format WITHOUT a leading "+" or spaces, e.g. "923001234567".
 */
export interface NavLink {
  label: string;
  path: string;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'whatsapp' | 'youtube';
}

export interface BannerSlide {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
}

export interface StoreConfig {
  companyName: string;
  tagline: string;
  logoText: string;
  whatsappNumber: string; // international format, digits only
  supportEmail: string;
  supportPhoneDisplay: string;
  currency: string;
  currencyCode: string;
  deliveryCharges: number;
  freeDeliveryThreshold: number;
  address: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  banners: BannerSlide[];
  newsletterHeading: string;
  newsletterSubheading: string;
}

export const STORE_CONFIG: StoreConfig = {
  companyName: 'LUXE',
  tagline: 'Wear your confidence',
  logoText: 'LUXE',
  whatsappNumber: '923001234567',
  supportEmail: 'hello@luxestore.com',
  supportPhoneDisplay: '+92 300 1234567',
  currency: 'Rs.',
  currencyCode: 'PKR',
  deliveryCharges: 300,
  freeDeliveryThreshold: 10000,
  address: 'Shop 12, Zamzama Boulevard, Karachi, Pakistan',
  navLinks: [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Products', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ],
  socialLinks: [
    { label: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
    { label: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
    { label: 'TikTok', url: 'https://tiktok.com', icon: 'tiktok' },
    { label: 'WhatsApp', url: 'https://wa.me/923001234567', icon: 'whatsapp' },
  ],
  banners: [
    {
      id: 'banner-1',
      eyebrow: 'New Season',
      heading: 'Autumn Edit\n2026',
      description:
        'Discover premium essentials crafted for everyday luxury — curated pieces for men, women and kids.',
      ctaLabel: 'Shop Now',
      ctaLink: '/products',
      secondaryCtaLabel: 'Explore Categories',
      secondaryCtaLink: '/categories',
      imageUrl:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
    },
    {
      id: 'banner-2',
      eyebrow: 'Limited Time',
      heading: 'Up to 40% Off\nSelected Styles',
      description: 'Refresh your wardrobe with our best-selling silhouettes at unbeatable prices.',
      ctaLabel: 'Shop Sale',
      ctaLink: '/products?category=Sale',
      secondaryCtaLabel: 'View Lookbook',
      secondaryCtaLink: '/products',
      imageUrl:
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1600&auto=format&fit=crop',
    },
    {
      id: 'banner-3',
      eyebrow: 'Just Landed',
      heading: 'New Arrivals\nEvery Week',
      description: 'Be the first to shop fresh drops — hand-picked fabrics, modern cuts.',
      ctaLabel: 'Discover',
      ctaLink: '/products?category=New Arrivals',
      imageUrl:
        'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1600&auto=format&fit=crop',
    },
  ],
  newsletterHeading: 'Join the LUXE Club',
  newsletterSubheading: 'Get 10% off your first order plus early access to new drops and private sales.',
};
