import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'CreceCon — Más crecimiento, Más clientes. Más ventas',
  description: 'Sistema de crecimiento y fidelización de clientes. Desarrollamos soluciones digitales que consiguen clientes mientras duermes.',
  keywords: 'agencia digital, desarrollo web, PWA, SEO, marketing digital, automatización, Venezuela',
  openGraph: {
    title: 'CreceCon',
    description: 'Más crecimiento, Más clientes. Más ventas — CRECECON nosotros',
    url: 'https://crececon.com',
    siteName: 'CreceCon',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A3A8F" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CreceCon" />
        <script dangerouslySetInnerHTML={{__html: `
          document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
          document.addEventListener('keydown', function(e) {
            if (e.key === 'F12') { e.preventDefault(); }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); }
            if (e.ctrlKey && e.key === 'u') { e.preventDefault(); }
            if (e.ctrlKey && e.key === 's') { e.preventDefault(); }
          });
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} font-dm bg-[#050508] text-white antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}