import Hero from "@/components/sections/hero";
import ServicesSection from "@/components/sections/services-section";
import BlogsSection from "@/components/sections/blogs-section";
import ContactSection from "@/components/sections/contact-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <ServicesSection />
      <BlogsSection />
      <ContactSection />
    </main>
  );
}
