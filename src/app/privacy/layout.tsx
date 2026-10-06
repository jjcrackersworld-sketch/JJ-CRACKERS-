import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy — JJ Crackers Sivakasi',
  description: 'Privacy policy and data protection practices for JJ Crackers (Jegajothi Crackers) online store and customer services.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      </div>
      {children}
    </>
  );
}
