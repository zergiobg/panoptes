import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panoptes - Búsqueda Comunitaria",
  description: "Red social y aplicación de crowdsourcing para encontrar personas, mascotas y objetos perdidos.",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
