export interface Service {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  icon: string;
  order: number;
  imageUrl?: string;
  status: "draft" | "published";
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  createdAt: Date;
  status: "draft" | "published";
}

export interface Category {
  name: string;
  slug: string;
}

// News items share the exact shape of blog posts but live in the
// separate "news" collection.
export type NewsItem = Blog;

// News categories share the Category shape but live in the separate
// "newsCategories" collection.
export type NewsCategory = Category;

export interface HeroContent {
  eyebrow: string;
  fullName: string;
  bio: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  marqueeItems: string[];
  imageUrl: string;
}

export interface ContactContent {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  whatsappUrl?: string;
  youtubeUrl?: string;
  mapQuery?: string;
  homeCtaHeading?: string;
  homeCtaText?: string;
  homeCtaButtonText?: string;
}

export interface AboutContent {
  eyebrow: string;
  heading: string;
  bio: string; // rich HTML content from the editor
  imageUrl: string;
  skills: string[];
}
