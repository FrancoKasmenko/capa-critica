import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/analytics";
import { CarritoProvider } from "@/components/carrito-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { asset, negocio } from "@/lib/tienda";
import "./globals.css";

const russo = localFont({
  src: [{ path: "./fonts/RussoOne-Regular.ttf", weight: "400" }],
  variable: "--font-russo",
  display: "swap",
});

const grotesk = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-400.ttf", weight: "400" },
    { path: "./fonts/SpaceGrotesk-500.ttf", weight: "500" },
    { path: "./fonts/SpaceGrotesk-700.ttf", weight: "700" },
  ],
  variable: "--font-grotesk",
  display: "swap",
});

const titulo = "Capa Crítica · Impresión 3D friki en Montevideo";
const descripcion =
  "Criaturas articuladas, accesorios gamer, torres de dados, deck boxes y fidgets impresos en 3D. Multicolor sin recargo, desde $190. Retiro en Buceo, Montevideo. Pedí por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(negocio.siteUrl),
  title: { default: titulo, template: "%s · Capa Crítica" },
  description: descripcion,
  keywords: [
    "impresión 3D Montevideo",
    "dragón articulado",
    "torre de dados",
    "deck box",
    "contador de vida",
    "soporte joystick",
    "fidget 3D",
    "regalos frikis Uruguay",
    "Buceo",
  ],
  icons: { icon: asset("/icono.svg"), apple: asset("/apple-touch-icon.png") },
  openGraph: {
    type: "website",
    locale: "es_UY",
    siteName: "Capa Crítica",
    title: titulo,
    description: descripcion,
    images: [{ url: asset("/og.png"), width: 1200, height: 630, alt: "Capa Crítica, impresión 3D friki" }],
  },
  twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: [asset("/og.png")] },
};

export const viewport: Viewport = {
  themeColor: "#14111F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-UY" className={`${russo.variable} ${grotesk.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <CarritoProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CarritoProvider>
        <Analytics />
      </body>
    </html>
  );
}
