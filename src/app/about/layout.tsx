import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About JJ Crackers — Sivakasi Crackers Manufacturer Since 2015',
  description: 'JJ Crackers (Jegajothi Crackers) is a Sivakasi-based fireworks manufacturer operating since 2015. Learn about our journey, values, safety standards, and commitment to eco-friendly crackers.',
  keywords: [
    'JJ Crackers about',
    'Jegajothi Crackers Sivakasi',
    'Sivakasi crackers manufacturer',
    'fireworks factory Sivakasi',
    'eco-friendly crackers manufacturer',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About JJ Crackers — Sivakasi Fireworks Since 2015',
    description: 'Our decade-long journey of manufacturing safe, premium fireworks from Sivakasi.',
    url: 'https://jjcrackersworld.com/about',
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'About Us' }]} />
      </div>
      {children}
    </>
  );
}
