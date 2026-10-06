import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Buy Sivakasi Crackers Online — 500+ Fireworks at Factory Price',
  description: 'Browse our complete Sivakasi crackers catalog: sparklers, chakkars, flower pots, rockets, multishots, and more at factory-direct prices. Safety-certified fireworks from JJ Crackers with up to 60% discount.',
  keywords: [
    'Sivakasi crackers online',
    'buy crackers online',
    'Sivakasi fireworks price list',
    'crackers online shopping',
    'Diwali crackers online',
    'sparklers price',
    'multishots Sivakasi',
    'flower pots crackers',
    'green crackers online',
    'JJ Crackers products',
  ],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Buy Sivakasi Crackers Online — JJ Crackers Catalog',
    description: 'Factory direct prices on 500+ premium, safety-certified Sivakasi crackers. Browse our full catalog and order online.',
    url: 'https://jjcrackersworld.com/products',
  }
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Products' }]} />
      </div>
      {children}
    </>
  );
}
