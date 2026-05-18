import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AquaBrasil — Plataforma para Aquaristas",
  description:
    "Catálogo de peixes, verificador de compatibilidade, calendário de parâmetros e comunidade para aquaristas brasileiros.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          <div className="pt-14 md:pt-0 md:pl-56">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
