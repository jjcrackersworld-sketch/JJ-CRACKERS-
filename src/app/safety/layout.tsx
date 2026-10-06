import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Fireworks Safety Guidelines — Safe Crackers Use Tips',
  description: 'Essential safety guidelines for using crackers and fireworks. Children safety, lighting tips, fire prevention, protective gear, eco-friendly practices, and emergency contacts from JJ Crackers.',
  keywords: [
    'crackers safety tips',
    'fireworks safety guidelines',
    'Diwali crackers safety',
    'safe crackers for children',
    'eco-friendly crackers tips',
  ],
  alternates: {
    canonical: '/safety',
  },
  openGraph: {
    title: 'Fireworks Safety Guidelines — JJ Crackers',
    description: 'Essential safety tips for a safe and joyful celebration with crackers.',
    url: 'https://jjcrackersworld.com/safety',
  }
};

export default function SafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Safety Guidelines' }]} />
      </div>
      {children}
    </>
  );
}
