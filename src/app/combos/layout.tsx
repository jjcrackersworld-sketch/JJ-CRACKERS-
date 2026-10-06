import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Diwali Cracker Combo Packs & Gift Boxes — Curated Sivakasi Collections',
  description: 'Order curated Diwali cracker combo packs and gift boxes from JJ Crackers. Family-friendly crackers, kids-safe combos, and premium gift hampers at factory direct prices from Sivakasi.',
  keywords: [
    'cracker combo packs',
    'Diwali cracker gift boxes',
    'Sivakasi combo packs online',
    'kids safe crackers combo',
    'family cracker pack',
    'wedding crackers package',
    'JJ Crackers combos',
    'festive fireworks gift box',
  ],
  alternates: {
    canonical: '/combos',
  },
  openGraph: {
    title: 'Diwali Cracker Combo Packs & Gift Boxes — JJ Crackers',
    description: 'Curated Sivakasi cracker combo packs and gift boxes for Diwali, weddings & celebrations. Factory direct prices.',
    url: 'https://jjcrackersworld.com/combos',
  }
};

export default function CombosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Combo Packs' }]} />
      </div>
      {children}
    </>
  );
}
