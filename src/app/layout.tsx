import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Draft & Rise — O seu negócio local, escolhido antes de ser visitado",
  description: "Estratégia digital para negócios locais que querem ser encontrados, escolhidos e lembrados.",
  openGraph: {
    title: "Draft & Rise — Presença digital para negócios locais",
    description: "Da rua ao ecrã, uma experiência digital pensada para o próximo passo.",
    type: "website",
    locale: "pt_PT",
    siteName: "Draft & Rise",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
