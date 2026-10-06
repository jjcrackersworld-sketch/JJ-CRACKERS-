import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Order Enquiry & Quick Checkout — JJ Crackers Sivakasi',
  description: 'Submit your festive crackers enquiry, calculate estimate with factory discounts, and get instant PDF estimate and WhatsApp confirmation from JJ Crackers Sivakasi.',
  keywords: [
    'JJ Crackers enquiry',
    'buy crackers estimate',
    'Sivakasi crackers price quotation',
    'crackers bulk order enquiry',
    'Diwali crackers order checkout',
  ],
  alternates: {
    canonical: '/enquiry',
  },
  openGraph: {
    title: 'Order Enquiry & Checkout — JJ Crackers Sivakasi',
    description: 'Instant PDF estimate and fast checkout for authentic Sivakasi fireworks at factory-direct prices.',
    url: 'https://jjcrackersworld.com/enquiry',
  },
};

export default function EnquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Order Enquiry' }]} />
      </div>
      {children}
    </>
  );
}
