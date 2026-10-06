import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Package, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cracker Combo Packs — Best Value Sivakasi Fireworks Bundles | JJ Crackers',
  description: 'Buy cracker combo packs from JJ Crackers. Curated bundles of Sivakasi fireworks at the best value — family packs, kids combos, and premium collections at factory direct prices.',
  keywords: [
    'cracker combo packs', 'crackers combo', 'Diwali combo packs',
    'family cracker packs', 'best crackers combo', 'value crackers bundle',
    'kids crackers combo', 'premium fireworks combo',
  ],
  alternates: { canonical: '/cracker-combo-packs' },
  openGraph: {
    title: 'Cracker Combo Packs — Best Value Bundles | JJ Crackers',
    description: 'Curated Sivakasi cracker combo packs at factory direct prices. Family, kids, and premium combos.',
    url: 'https://jjcrackersworld.com/cracker-combo-packs',
  },
};

const comboTypes = [
  { name: 'Budget Combos', price: 'Starting from ₹500', desc: 'Affordable crackers combos with essential items — sparklers, chakkars, and flower pots for small celebrations.', emoji: '💰' },
  { name: 'Family Combos', price: 'Starting from ₹1,500', desc: 'Well-balanced mix of crackers for the whole family. Includes sparklers, sound crackers, fountains, and small aerial items.', emoji: '👨‍👩‍👧‍👦' },
  { name: 'Kids Special Combos', price: 'Starting from ₹750', desc: 'Low-noise, colourful crackers designed for children. Safe sparklers, gentle flower pots, and fun novelties.', emoji: '🧒' },
  { name: 'Premium Combos', price: 'Starting from ₹3,000', desc: 'Our best-selling premium range with multishots, fancy fountains, sky jets, and a complete mix of crackers.', emoji: '⭐' },
  { name: 'Grand Celebration', price: 'Starting from ₹5,000', desc: 'Large combo packs for grand celebrations, weddings, and events. Includes premium multishots and aerial displays.', emoji: '🎆' },
  { name: 'Custom Combos', price: 'Contact for pricing', desc: 'Build your own combo pack — choose the products and quantities you want. Contact us on WhatsApp for a quote.', emoji: '✨' },
];

export default function CrackerComboPacksPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Cracker Combo Packs' }]} />
      </div>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Package size={14} /> Maximum Value
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6 tracking-tighter">
              Cracker <span className="text-gradient-gold text-glow">Combo Packs</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              Get the best value with our curated cracker combo packs. Each pack is thoughtfully assembled with a 
              mix of crackers suited for different celebrations and budgets.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* About Combo Packs */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-6 tracking-tight">
              What Are Cracker Combo Packs?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>Cracker combo packs</strong> are curated bundles of fireworks that offer a complete celebration experience in a single purchase. 
              Instead of buying individual items, combo packs provide a balanced mix of different cracker types at a better overall price.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              JJ Crackers curates combo packs for different occasions and budgets. Whether you&apos;re planning a small family 
              <Link href="/diwali-crackers" className="text-[var(--color-gold)] hover:underline font-medium"> Diwali celebration</Link> or 
              a grand wedding event, there&apos;s a combo pack that fits your needs. All products in our combos are genuine 
              <Link href="/sivakasi-crackers" className="text-[var(--color-gold)] hover:underline font-medium"> Sivakasi crackers</Link>, safety certified, and priced at factory rates.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Combo Types */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter">
              Our Combo Pack Range
            </h2>
          </ScrollFadeInUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboTypes.map((ct, i) => (
              <ScrollFadeInUp key={ct.name} delay={i * 0.06}>
                <div className="glass-card rounded-2xl p-6 group hover:border-[var(--color-gold)]/40 h-full">
                  <span className="text-3xl mb-3 block">{ct.emoji}</span>
                  <h3 className="font-bold text-[var(--text)] mb-1 text-lg">{ct.name}</h3>
                  <p className="text-xs text-[var(--color-gold)] font-bold mb-3">{ct.price}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{ct.desc}</p>
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
              Order Your Combo Pack
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              View our currently available combo packs with live pricing and product details.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/combos">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer">
                  View Combo Packs <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/cracker-gift-boxes">
                <button className="px-8 py-4 rounded-xl border-2 border-[var(--color-gold)]/50 text-[var(--color-gold)] font-bold text-base hover:bg-[var(--color-gold)]/5 hover:scale-105 transition-all cursor-pointer">
                  Browse Gift Boxes
                </button>
              </Link>
            </div>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1} className="mt-12">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Gift Boxes', href: '/cracker-gift-boxes' },
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
