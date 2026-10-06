import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service — JJ Crackers Sivakasi',
  description: 'Terms and conditions for placing orders, delivery, cancellation, and purchasing fireworks from JJ Crackers Sivakasi.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      </div>
      {children}
    </>
  );
}
