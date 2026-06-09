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
      <body className={`${syne.variable} ${dmSans.variable} font-dm bg-[#050508] text-white antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
