import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Formations Modern Engineering",
    template: "%s — Formations Modern Engineering",
  },
  description:
    "Plateforme d'apprentissage : 13 parcours complets (Frontend, Backend, DevOps, Java, PHP, Go, Python, Réseau, ...) avec cours, QCM et flashcards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-400/10"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s||(d?"dark":"light");var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"#0a0a0a":"#ffffff");}catch(e){}})();`,
          }}
        />
        <Providers>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
