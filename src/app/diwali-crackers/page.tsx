import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Sparkles, Gift, Heart, Star, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Diwali Crackers — Buy Diwali Fireworks Online at Factory Price | JJ Crackers',
  description: 'Buy Diwali crackers online from JJ Crackers. Premium Sivakasi fireworks for Diwali celebrations — sparklers, flower pots, multishots, combo packs & gift boxes at factory direct prices.',
  keywords: [
    'Diwali crackers', 'Diwali crackers online', 'Diwali fireworks',
    'buy Diwali crackers', 'best Diwali crackers', 'Diwali crackers 2026',
    'Diwali cracker combo packs', 'Diwali gift boxes',
    'festive crackers', 'Deepavali crackers',
  ],
  alternates: { canonical: '/diwali-crackers' },
  openGraph: {
    title: 'Diwali Crackers — Buy Online at Factory Price | JJ Crackers',
    description: 'Premium Diwali crackers from Sivakasi at factory direct prices. Sparklers, multishots, combo packs & gift boxes.',
    url: 'https://jjcrackersworld.com/diwali-crackers',
  },
};

const diwaliCategories = [
  { name: 'Family Sparklers', desc: 'Classic sparklers in various colours and sizes — safe and beautiful for all ages.', emoji: '✨' },
  { name: 'Flower Pots', desc: 'Colourful fountain effects that create shower-like sparks from ground level.', emoji: '🌸' },
  { name: 'Ground Chakkars', desc: 'Spinning ground fireworks that create mesmerizing circular light patterns.', emoji: '🌀' },
  { name: 'Multishots', desc: 'Aerial fireworks with multiple shots for dramatic sky displays.', emoji: '🎇' },
  { name: 'Combo Packs', desc: 'Curated bundles with a mix of crackers for complete Diwali celebration.', emoji: '📦' },
  { name: 'Gift Boxes', desc: 'Premium cracker gift boxes perfect for gifting to family and friends.', emoji: '🎁' },
];

export default function DiwaliCrackersPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Diwali Crackers' }]} />
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Sparkles size={14} /> Celebrate with Light
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6 tracking-tighter">
              Diwali <span className="text-gradient-gold text-glow">Crackers</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              Make your Diwali celebration memorable with premium Sivakasi crackers from JJ Crackers. 
              From family-friendly sparklers to grand aerial displays, we have everything you need for the festival of lights.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* What is Diwali — AI-citable */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-6 tracking-tight">
              Crackers for Diwali — The Festival of Lights
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>Diwali</strong> (also known as Deepavali) is India&apos;s most widely celebrated festival, symbolizing the triumph of light over darkness. 
              Fireworks and crackers are an integral part of Diwali celebrations across the country, with families gathering to light sparklers, 
              burst crackers, and watch aerial fireworks together.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>JJ Crackers</strong> offers a comprehensive range of Diwali crackers suitable for all ages and preferences — from gentle sparklers 
              for children to premium multishot aerial displays for grand celebrations. All products are sourced directly from our 
              <Link href="/sivakasi-crackers" className="text-[var(--color-gold)] hover:underline font-medium"> Sivakasi manufacturing facility</Link> and 
              are safety-certified.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              For an eco-conscious Diwali, we also offer green crackers with reduced noise and emissions. Whether you prefer a quiet family celebration 
              or a grand neighbourhood display, JJ Crackers has the right Diwali crackers for you.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Diwali Categories */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter">
              Popular Diwali Cracker Types
            </h2>
          </ScrollFadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diwaliCategories.map((cat, i) => (
              <ScrollFadeInUp key={cat.name} delay={i * 0.06}>
                <div className="glass-card rounded-2xl p-6 group hover:border-[var(--color-gold)]/40 h-full">
                  <span className="text-3xl mb-3 block">{cat.emoji}</span>
                  <h3 className="font-bold text-[var(--text)] mb-2 text-lg">{cat.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{cat.desc}</p>
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
              Order Your Diwali Crackers Today
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
              Browse our complete Diwali collection or check out our specially curated combo packs for the best value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer">
                  Browse All Crackers <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/cracker-combo-packs">
                <button className="px-8 py-4 rounded-xl border-2 border-[var(--color-gold)]/50 text-[var(--color-gold)] font-bold text-base hover:bg-[var(--color-gold)]/5 hover:scale-105 transition-all cursor-pointer">
                  Diwali Combo Packs
                </button>
              </Link>
            </div>
          </ScrollFadeInUp>

          <ScrollFadeInUp delay={0.1} className="mt-12">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Sivakasi Crackers', href: '/sivakasi-crackers' },
                { label: 'Crackers Online', href: '/crackers-online' },
                { label: 'Gift Boxes', href: '/cracker-gift-boxes' },
                { label: 'Sivakasi Fireworks', href: '/sivakasi-fireworks' },
                { label: 'Safety Guidelines', href: '/safety' },
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
