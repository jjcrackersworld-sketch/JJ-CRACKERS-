import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact JJ Crackers — Sivakasi Factory & Wholesale Enquiry',
  description: 'Contact JJ Crackers (Jegajothi Crackers) at +91 70923 00252. Visit our factory at Sivakasi-Vembakottai Main Road or order online. Wholesale, wedding, and corporate cracker orders welcome.',
  keywords: [
    'JJ Crackers contact',
    'Sivakasi crackers phone number',
    'buy crackers from Sivakasi factory',
    'wholesale crackers contact',
    'Jegajothi Crackers address',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact JJ Crackers — Sivakasi Office & Online Orders',
    description: 'Get in touch with JJ Crackers for orders, bulk enquiries, and wholesale bookings. Call +91 70923 00252.',
    url: 'https://jjcrackersworld.com/contact',
  }
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
      </div>
      {children}
    </>
  );
}
