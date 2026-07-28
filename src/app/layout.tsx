import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import SiteChrome from "@/components/layout/site-chrome";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
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

export const metadata: Metadata = {
  title: "Murad Akifsoy | Uşaq və Yeniyetmə Psixoloqu",
  description: "Uşaq və yeniyetmə psixoloqu Murad Akifsoy - xidmətlər, bloglar və əlaqə.",
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
      <body className="flex min-h-screen flex-col font-sans">
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}