import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import SiteChrome from "@/components/layout/site-chrome";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const title = "Murad Akifsoy | Uşaq və Yeniyetmə Psixoloqu";
const description =
  "Uşaq və yeniyetmə psixoloqu Murad Akifsoy - xidmətlər, bloglar və əlaqə.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "az_AZ",
    type: "website",
    images: [{ url: "/murad-a.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/murad-a.png"],
  },
  verification: {
    google: "xT3pR8ejF9DYWx4QKQUtk18TRPbekadC1YvGx0QkWyE",
  },
};

// TODO: populate sameAs with the psychologist's social media URLs once
// there's a stable, non-editable source for them (the dashboard-managed
// links in ContactContent can change at any time).
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Person", "ProfessionalService"],
  name: "Murad Akif oğlu Heydərov (Akifsoy)",
  jobTitle: "Uşaq və Yeniyetmə Psixoloqu",
  url: SITE_URL,
  image: `${SITE_URL}/murad-a.png`,
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      className={`${montserrat.variable} ${lora.variable} min-h-screen antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
