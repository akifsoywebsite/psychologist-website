import type { MetadataRoute } from "next";
import { collection, getDocs, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Blog, Service } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

async function getPublishedServices(): Promise<Service[]> {
  const snapshot = await getDocs(collection(db, "services"));

  const services = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Service, "id">),
  }));

  return services.filter((service) => service.status !== "draft");
}

async function getPublishedBlogs(): Promise<Blog[]> {
  const snapshot = await getDocs(collection(db, "blogs"));

  const blogs = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Blog, "id" | "createdAt"> & {
      createdAt: Timestamp;
    };

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });

  return blogs.filter((blog) => blog.status !== "draft");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, blogs] = await Promise.all([
    getPublishedServices(),
    getPublishedBlogs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/haqqimda`, priority: 0.8 },
    { url: `${SITE_URL}/xidmetler`, priority: 0.8 },
    { url: `${SITE_URL}/bloq`, priority: 0.8 },
    { url: `${SITE_URL}/elaqe`, priority: 0.8 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${SITE_URL}/xidmetler/${service.slug}`,
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${SITE_URL}/bloq/${blog.slug}`,
    lastModified: blog.createdAt,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
