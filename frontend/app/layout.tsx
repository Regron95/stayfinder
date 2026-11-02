import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Titeln som syns i webbläsarens flik
export const metadata: Metadata = {
  title: "StayFinder",
  description: "Hitta och boka boenden",
};

// Root layout: omsluter ALLA sidor. children = sidan som visas just nu.
// Menyn ligger här så att den syns på varje sida utan att upprepas.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 p-4">
            <Link href="/" className="text-xl font-bold">StayFinder</Link>
            <Link href="/" className="hover:underline">Boenden</Link>
            {/* G3: i fas 10 visar menyn olika länkar för inloggad och utloggad */}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
