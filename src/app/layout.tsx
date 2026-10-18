import type { Metadata } from "next";
import { Geist, Bricolage_Grotesque, Playfair_Display } from "next/font/google";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, SITE_URL } from "@/lib/constants";
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
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
  logo: `${SITE_URL}/brand/draft-rise-mark.png`,
  image: `${SITE_URL}/brand/draft-rise-mark.png`,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE_DISPLAY,
  description:
    "Produção de websites para empresas, Google Business (subida no ranking, copywriting e SEO local), automação de WhatsApp Bot e menus online para restaurantes em Portugal.",
  areaServed: {
    "@type": "Country",
    name: "Portugal",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: CONTACT_PHONE_DISPLAY,
      email: CONTACT_EMAIL,
      contactType: "sales",
      areaServed: "PT",
      availableLanguage: ["Portuguese", "English"],
    },
    {
      "@type": "ContactPoint",
      telephone: CONTACT_PHONE_DISPLAY,
      email: CONTACT_EMAIL,
      contactType: "customer support",
      areaServed: "PT",
      availableLanguage: ["Portuguese", "English"],
    },
  ],
  knowsAbout: [
    "Produção de Websites para Empresas",
    "Google Business Profile SEO & Copywriting",
    "Automação de WhatsApp Bot",
    "Menus Online Digitais para Restaurantes",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços Digitais Draft & Rise",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Produção de Websites para Empresas",
          description:
            "Desenvolvimento de websites rápidos, mobile-first, com copywriting estratégico e SEO técnico de raiz.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Google Business — Subida no Ranking, Copywriting & SEO Local",
          description:
            "Otimização estratégica do Perfil da Empresa no Google e Google Maps para posicionar empresas nas primeiras pesquisas locais.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Automação de WhatsApp Bot 24/7",
          description:
            "Bots inteligentes no WhatsApp para resposta imediata, qualificação de clientes, orçamentos e marcações 24/7.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Menus Online para Restaurantes",
          description:
            "Menus digitais rápidos com QR Code na mesa, multi-idioma, fotografia e ligação direta ao Google e redes sociais.",
        },
      },
    ],
  },
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
