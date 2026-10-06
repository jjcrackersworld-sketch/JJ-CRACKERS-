import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Calendar, PackageCheck, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Diwali Crackers Buying Guide — Tips, Budgeting & Early Booking | JJ Crackers',
  description: 'Complete Diwali crackers buying guide. Learn the best time to order, how to budget for family celebrations, eco-friendly green crackers, and safe storage tips from Jegajothi Crackers (JJ Crackers Sivakasi).',
  keywords: [
    'Diwali crackers buying guide',
    'how to buy Diwali crackers online',
    'early booking Diwali crackers',
    'Diwali fireworks shopping guide',
    'JJ Crackers',
    'Jegajothi Crackers',
  ],
  alternates: { canonical: '/diwali-crackers-buying-guide' },
  openGraph: {
    title: 'Diwali Crackers Buying Guide | JJ Crackers — Jegajothi Crackers',
    description: 'Expert tips for planning your Diwali fireworks: discounts, family packs, safe handling, and direct Sivakasi booking.',
    url: 'https://jjcrackersworld.com/diwali-crackers-buying-guide',
  },
};

export default function DiwaliCrackersBuyingGuidePage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Diwali Crackers Buying Guide' }]} />
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Sparkles size={14} /> Festival Planning Guide
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl font-display font-bold leading-tight mb-6 tracking-tighter">
              Diwali Crackers <span className="text-gradient-gold text-glow">Buying Guide</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              Step-by-step advice on planning your Diwali cracker shopping — from budgeting and early booking discounts to safe delivery from Jegajothi Crackers (JJ Crackers).
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* 4 Essential Steps */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)]">
              4 Steps to Smart Diwali Cracker Shopping
            </h2>
          </ScrollFadeInUp>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Book Early for Maximum Discounts',
                desc: 'Ordering your crackers 3 to 6 weeks before Diwali ensures you get fresh factory stock, full availability of popular multishots, and maximum seasonal discounts (up to 60% off MRP) from Jegajothi Crackers.',
              },
              {
                step: '02',
                title: 'Calculate Family Proportions',
                desc: 'Allocate your order into roughly 40% visual sparklers and ground chakkars for kids, 30% flower pots and fountains for family gatherings, and 30% aerial rockets and multishot cakes for the festive night.',
              },
              {
                step: '03',
                title: 'Consider Combo Packs for Balanced Variety',
                desc: 'Curated combo boxes (like the Children Pack, Family Pack, and Youngster Pack) offer structured assortments that save time and ensure you have all essential Diwali items without overspending.',
              },
              {
                step: '04',
                title: 'Safe Storage Until Diwali Night',
                desc: 'Always store delivered crackers in a cool, dry, and ventilated place away from direct sunlight, electrical wiring, and children’s reach. Keep products sealed in their protective packaging until use.',
              },
            ].map(item => (
              <div key={item.step} className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]/30 flex gap-4 items-start">
                <span className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-gold)] opacity-70 shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[var(--text)] mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-3xl font-display font-bold text-[var(--text)] mb-4">
              Explore Our Diwali 2026 Collection
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mb-8">
              Order directly from JJ Crackers (Jegajothi Crackers) and enjoy authentic factory pricing delivered safely to your location.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/diwali-crackers" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                Diwali Specials
              </Link>
              <Link href="/combos" className="px-8 py-3.5 rounded-xl border border-[var(--color-gold)]/40 text-[var(--color-gold)] font-bold text-sm hover:bg-[var(--color-gold)]/10 transition-colors">
                View Combo Packs
              </Link>
            </div>
          </ScrollFadeInUp>
        </div>
      </section>
    </div>
  );
}
