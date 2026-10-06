import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { MarketingHead } from '@/components/layout/MarketingHead';
import "./globals.css";

import { ClientEffects } from '@/components/effects/ClientEffects';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjcrackersworld.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JJ Crackers | Buy Sivakasi Crackers Online — Diwali Fireworks at Factory Price",
    template: "%s | JJ Crackers — Sivakasi Crackers Online",
  },
  icons: {
    icon: [
      { url: '/logo/logo.png', type: 'image/png' },
      { url: '/logo/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
  description: "JJ Crackers (Jegajothi Crackers) — Buy premium Sivakasi crackers online at factory direct prices. Wide range of Diwali crackers, fireworks, combo packs & gift boxes. Safety-certified, eco-friendly green crackers with delivery across India. Since 2015.",
  keywords: [
    "JJ Crackers", "Sivakasi Crackers", "Sivakasi Fireworks", "Crackers Online",
    "Diwali Crackers", "Buy Crackers Online", "Best Sivakasi Crackers",
    "Cracker Gift Boxes", "Cracker Combo Packs", "Fireworks Online",
    "Diwali Crackers Online", "Best Crackers to Buy", "Festive Crackers",
    "Jegajothi Crackers", "Tamil Nadu Crackers", "Green Crackers Sivakasi",
    "Family Cracker Packs", "Wedding Crackers", "Crackers Home Delivery",
  ],
  authors: [{ name: "JJ Crackers (Jegajothi Crackers)", url: siteUrl }],
  creator: "JJ Crackers",
  publisher: "JJ Crackers (Jegajothi Crackers)",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  alternates: { canonical: '/' },
  openGraph: {
    title: "JJ Crackers | Buy Sivakasi Crackers Online — Factory Direct Prices",
    description: "JJ Crackers — Premium Sivakasi fireworks & crackers delivered across India at factory direct prices. Diwali crackers, gift boxes, combo packs & more. Since 2015.",
    type: "website",
    locale: "en_IN",
    siteName: "JJ Crackers",
    images: [{ url: "/family-festive.webp", width: 1200, height: 630, alt: "JJ Crackers — Buy Premium Sivakasi Crackers Online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JJ Crackers | Buy Sivakasi Crackers & Fireworks Online",
    description: "Premium Sivakasi crackers at factory direct prices. Diwali fireworks, gift boxes & combo packs delivered across India.",
    images: ["/family-festive.webp"],
  },
  verification: { 
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "", 
    yandex: "" 
  },
  category: "E-commerce",
  other: {
    /* GEO Meta Tags for Local SEO / GEO Optimization */
    'geo.region': 'IN-TN',
    'geo.placename': 'Vembakottai, Sivakasi, Tamil Nadu',
    'geo.position': '9.3639;77.8014',
    'ICBM': '9.3639, 77.8014',
    /* SEM / Advertising */
    'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased overflow-x-hidden transition-colors duration-400`}
      >
        {/* JSON-LD: WebSite schema — enables Google sitelinks search box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${siteUrl}/#website`,
              name: 'JJ Crackers',
              alternateName: 'Jegajothi Crackers',
              url: siteUrl,
              description: 'Buy premium Sivakasi crackers online at factory direct prices. Diwali crackers, fireworks, combo packs & gift boxes delivered across India.',
              publisher: { '@id': `${siteUrl}/#organization` },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/products?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: 'en-IN',
            }),
          }}
        />

        {/* JSON-LD: Organization — core brand entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${siteUrl}/#organization`,
              name: 'JJ Crackers',
              alternateName: ['Jegajothi Crackers', 'JJ Crackers World', 'JJ Crackers Sivakasi', 'Jegajothi Crackers Sivakasi', 'ஜெகஜோதி பட்டாசுகள்'],
              url: siteUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo/logo.png`,
                width: 512,
                height: 512,
              },
              image: `${siteUrl}/family-festive.webp`,
              foundingDate: '2015',
              description: 'JJ Crackers and Jegajothi Crackers are the exact same Sivakasi-based fireworks manufacturing enterprise, offering premium crackers online at factory direct prices since 2015.',
              slogan: 'மகிழ்வித்து மகிழ்வோம்',
              telephone: '+91-70923-00252',
              email: 'jjcrackersworld@gmail.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '1/406, Sivakasi-Vembakottai Main Road, Opp. EB Office',
                addressLocality: 'Vembakottai',
                addressRegion: 'Tamil Nadu',
                postalCode: '626131',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '9.3639',
                longitude: '77.8014',
              },
              areaServed: {
                '@type': 'Country',
                name: 'India',
              },
              sameAs: [
                'https://www.instagram.com/jjcrackers_world/',
                'https://wa.me/917092300252',
                'https://maps.app.goo.gl/pi2T1vsVV5dzjZpv9',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-70923-00252',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['English', 'Tamil'],
              },
            }),
          }}
        />

        {/* JSON-LD: LocalBusiness — local search / Google Maps */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': `${siteUrl}/#localbusiness`,
              name: 'JJ Crackers — Jegajothi Crackers',
              alternateName: ['JJ Crackers', 'Jegajothi Crackers', 'JJ Crackers Sivakasi', 'Jegajothi Crackers Sivakasi', 'ஜெகஜோதி பட்டாசுகள்'],
              description: 'JJ Crackers (also known as Jegajothi Crackers) is a Sivakasi-based fireworks manufacturer offering authentic crackers and fireworks directly at factory prices since 2015.',
              image: `${siteUrl}/family-festive.webp`,
              priceRange: '₹₹',
              telephone: '+91-70923-00252',
              email: 'jjcrackersworld@gmail.com',
              url: siteUrl,
              address: {
                '@type': 'PostalAddress',
                streetAddress: '1/406, Sivakasi-Vembakottai Main Road, Opp. EB Office',
                addressLocality: 'Vembakottai',
                addressRegion: 'Tamil Nadu',
                postalCode: '626131',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '9.3639',
                longitude: '77.8014',
              },
              areaServed: {
                '@type': 'Country',
                name: 'India',
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                  opens: '09:00',
                  closes: '20:00',
                },
              ],
              sameAs: [
                'https://www.instagram.com/jjcrackers_world/',
                'https://wa.me/917092300252',
              ],
            }),
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MarketingHead />
          <ClientEffects />
          <Navbar />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
           <Footer />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
