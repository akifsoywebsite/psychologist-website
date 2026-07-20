export interface Service {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  icon: string;
  order: number;
  imageUrl?: string;
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
}

export interface Category {
  name: string;
  slug: string;
}

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
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
}

export interface AboutContent {
  eyebrow: string;
  heading: string;
  bio: string;
  imageUrl: string;
}
