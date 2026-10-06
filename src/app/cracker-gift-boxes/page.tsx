import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Gift, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cracker Gift Boxes — Premium Festive Fireworks Gifts | JJ Crackers',
  description: 'Buy cracker gift boxes from JJ Crackers. Premium curated fireworks gift boxes perfect for Diwali, weddings, corporate gifting & family celebrations. Direct from Sivakasi at factory prices.',
  keywords: [
    'cracker gift boxes', 'Diwali gift box crackers', 'fireworks gift box',
    'premium cracker gift', 'crackers gifting', 'festive gift box',
    'corporate crackers gift', 'wedding crackers gift box',
  ],
  alternates: { canonical: '/cracker-gift-boxes' },
  openGraph: {
    title: 'Cracker Gift Boxes — Premium Festive Gifts | JJ Crackers',
    description: 'Premium curated fireworks gift boxes for Diwali, weddings & celebrations. Direct from Sivakasi.',
    url: 'https://jjcrackersworld.com/cracker-gift-boxes',
  },
};

const giftTypes = [
  { name: 'Family Gift Boxes', desc: 'A balanced mix of crackers for the whole family — sparklers, flower pots, chakkars, and small aerial items.', emoji: '👨‍👩‍👧‍👦' },
  { name: 'Kids Special Boxes', desc: 'Low-noise, low-smoke crackers curated for young children. Safe, colourful, and fun.', emoji: '👦' },
  { name: 'Premium Gift Hampers', desc: 'Our top-tier gift boxes with multishots, premium fountains, and a luxurious selection of fireworks.', emoji: '🏆' },
  { name: 'Corporate Gift Boxes', desc: 'Professional presentation boxes perfect for corporate gifting during festival season.', emoji: '🏢' },
  { name: 'Wedding Gift Boxes', desc: 'Celebratory cracker collections designed for wedding events and marriage functions.', emoji: '💍' },
  { name: 'Custom Gift Boxes', desc: 'Build your own gift box — choose the products and quantities you want, and we\'ll curate it for you.', emoji: '✨' },
];

export default function CrackerGiftBoxesPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Cracker Gift Boxes' }]} />
      </div>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Gift size={14} /> Premium Gifting
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6 tracking-tighter">
              Cracker <span className="text-gradient-gold text-glow">Gift Boxes</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              Give the gift of celebration. Our curated cracker gift boxes make perfect presents for 
              Diwali, weddings, corporate events, and family gatherings.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* About Gift Boxes */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-6 tracking-tight">
              What Are Cracker Gift Boxes?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>Cracker gift boxes</strong> are pre-assembled or custom-curated collections of fireworks and crackers, presented 
              in attractive packaging for gifting purposes. They are a popular way to share the joy of celebrations — especially during Diwali — 
              with family, friends, employees, and business partners.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              JJ Crackers offers a range of ready-made gift boxes at various price points, as well as custom box options where you choose the products. 
              All gift boxes contain only safety-certified <Link href="/sivakasi-crackers" className="text-[var(--color-gold)] hover:underline font-medium">Sivakasi crackers</Link> and 
              come with clear safety instructions. Contact us on WhatsApp at 
              <a href="https://wa.me/917092300252" className="text-[var(--color-gold)] hover:underline font-medium" target="_blank" rel="noopener noreferrer"> +91 70923 00252</a> for 
              bulk corporate gift box enquiries.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Gift Box Types */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter">
              Our Gift Box Collection
            </h2>
          </ScrollFadeInUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftTypes.map((gt, i) => (
              <ScrollFadeInUp key={gt.name} delay={i * 0.06}>
                <div className="glass-card rounded-2xl p-6 group hover:border-[var(--color-gold)]/40 h-full">
                  <span className="text-3xl mb-3 block">{gt.emoji}</span>
                  <h3 className="font-bold text-[var(--text)] mb-2 text-lg">{gt.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{gt.desc}</p>
                </div>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 bg-[var(--surface-high)] border-t border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-4">
              Order Cracker Gift Boxes
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Browse our ready-made gift boxes or contact us for custom corporate gift requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/combos">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer">
                  View Gift Boxes <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 rounded-xl border-2 border-[var(--color-gold)]/50 text-[var(--color-gold)] font-bold text-base hover:bg-[var(--color-gold)]/5 hover:scale-105 transition-all cursor-pointer">
                  Custom Gift Enquiry
                </button>
              </Link>
            </div>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1} className="mt-12">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Combo Packs', href: '/cracker-combo-packs' },
                { label: 'Diwali Crackers', href: '/diwali-crackers' },
                { label: 'Sivakasi Crackers', href: '/sivakasi-crackers' },
                { label: 'All Products', href: '/products' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-xs sm:text-sm text-[var(--color-gold)] hover:underline font-medium flex items-center gap-1">
                  {link.label} <ChevronRight size={12} />
                </Link>
              ))}
            </div>
          </ScrollFadeInUp>
        </div>
      </section>
    </div>
  );
}
