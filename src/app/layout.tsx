import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata: Metadata = {
  title: "Laiza Makeup | Gestão de Estoque",
  description: "Controle de estoque e vendas para maquiagem",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
  },
  appleWebApp: {
    capable: true,
    title: "Laiza Makeup",
    statusBarStyle: "black-translucent"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#BC2A1A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Laiza Makeup" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body suppressHydrationWarning className={outfit.className}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>

        {/* PWA DESABILITADO - Script que remove Service Workers instalados */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                  registration.unregister();
                  console.log('Service Worker removido');
                });
              });
              
              // Limpa todos os caches
              caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                  caches.delete(cacheName);
                  console.log('Cache removido:', cacheName);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
