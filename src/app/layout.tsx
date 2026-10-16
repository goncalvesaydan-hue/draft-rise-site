import type { Metadata } from "next";
import { Geist, Bricolage_Grotesque, Playfair_Display } from "next/font/google";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const menuSerif = Playfair_Display({
  variable: "--font-menu-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Draft & Rise — Websites, Google Business SEO, WhatsApp Bot & Menus Online",
  description:
    "Produção de websites para empresas, subida no ranking do Google Business com copywriting e SEO local, automação de WhatsApp Bot 24/7 e menus online para restaurantes em Portugal.",
  openGraph: {
    title: "Draft & Rise — Websites, Google Business SEO, WhatsApp Bot & Menus Online",
    description:
      "Quatro frentes para fazer o seu negócio crescer: websites de alta conversão, ranking no Google, WhatsApp Bot e menus digitais.",
    url: SITE_URL,
    type: "website",
    locale: "pt_PT",
    siteName: "Draft & Rise",
    images: [
      {
        url: "/brand/draft-rise-mark.png",
        width: 512,
        height: 512,
        alt: "Draft & Rise",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Draft & Rise — Crescimento digital para empresas e negócios locais",
    description:
      "Websites empresariais, Google Business & SEO, WhatsApp Bot 24/7 e Menus Online para restaurantes.",
    images: ["/brand/draft-rise-mark.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Draft & Rise",
  url: SITE_URL,
  email: CONTACT_EMAIL,
  description:
    "Produção de websites para empresas, Google Business (subida no ranking, copywriting e SEO local), automação de WhatsApp Bot e menus online para restaurantes em Portugal.",
  areaServed: "PT",
  knowsAbout: [
    "Produção de Websites para Empresas",
    "Google Business Profile SEO & Copywriting",
    "Automação de WhatsApp Bot",
    "Menus Online Digitais para Restaurantes",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-PT"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${display.variable} ${menuSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
