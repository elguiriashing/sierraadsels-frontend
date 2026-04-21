export interface JewelryItem {
  id: string;
  src: string;
  title?: string;
  description?: string;
  category: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  topText?: string;
  bottomText?: string;
}

export interface SiteContent {
  title: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  // Landing page content
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  quoteText: string;
  ctaText: string;
  // Maker section
  makerImage: string;
  makerTitle: string;
  makerName: string;
  makerDescription: string;
}
