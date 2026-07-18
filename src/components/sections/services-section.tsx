import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Service } from "@/lib/types";
import ServicesCarousel from "./services-carousel";

async function getServices(): Promise<Service[]> {
  const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"));
  const snapshot = await getDocs(servicesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Service, "id">),
  }));
}

export default async function ServicesSection() {
  const services = await getServices();

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-serif text-2xl text-foreground md:text-3xl">
            Xidmətlər
          </h2>

          <Link
            href="/xidmetler"
            className="inline-flex items-center gap-2 text-primary transition-colors hover:text-foreground"
          >
            Hamısına bax
            <ArrowRight size={18} />
          </Link>
        </div>

        <ServicesCarousel services={services} />
      </div>
    </section>
  );
}
