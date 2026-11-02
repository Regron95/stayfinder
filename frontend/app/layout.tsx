import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/lib/auth";
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
        {/* AuthProvider omsluter allt, så att menyn och alla sidor kan använda useAuth() */}
        <AuthProvider>
          {/* sticky = menyn stannar kvar överst när man scrollar */}
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
            <Nav />
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
