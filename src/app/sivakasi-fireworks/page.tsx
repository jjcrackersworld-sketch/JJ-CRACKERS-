import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Zap, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sivakasi Fireworks — Premium Multishots, Sky Jets & Aerial Displays | JJ Crackers',
  description: 'Buy premium Sivakasi fireworks from JJ Crackers. Multishots, sky jets, aerial displays, fancy novelties & ground fireworks at factory direct prices. Safety certified, delivered across India.',
  keywords: [
    'Sivakasi fireworks', 'fireworks online', 'multishots fireworks',
    'sky jets Sivakasi', 'aerial fireworks India', 'premium fireworks',
    'buy fireworks online', 'Sivakasi fireworks factory',
  ],
  alternates: { canonical: '/sivakasi-fireworks' },
  openGraph: {
    title: 'Sivakasi Fireworks — Premium Displays | JJ Crackers',
    description: 'Premium multishots, sky jets & aerial fireworks from Sivakasi at factory direct prices.',
    url: 'https://jjcrackersworld.com/sivakasi-fireworks',
  },
};

const fireworkTypes = [
  { name: 'Multishots', desc: 'Multiple shots fired in rapid succession creating stunning aerial displays. Available from 5-shot to 200-shot varieties.', emoji: '🎇' },
  { name: 'Sky Expo Premium', desc: 'Our premium multishot range with professional-grade effects — colours, crackling, whistling, and palm effects.', emoji: '🏆' },
  { name: 'Sky Jets', desc: 'Rocket-style fireworks that shoot colourful balls and effects high into the sky.', emoji: '🚀' },
  { name: 'Fancy Novelties', desc: 'Creative shaped fireworks including characters, wheels, and novelty items with surprising effects.', emoji: '🎭' },
  { name: 'Fountains', desc: 'Ground-based fireworks producing tall showers of sparks — nano, joy, pearl, amazing, and royal varieties.', emoji: '⛲' },
  { name: 'Ground Chakkars', desc: 'Spinning ground fireworks creating mesmerizing circular patterns of coloured sparks.', emoji: '🌀' },
];

export default function SivakasiFireworksPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Sivakasi Fireworks' }]} />
      </div>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Zap size={14} /> Premium Aerial Displays
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6 tracking-tighter">
              Sivakasi <span className="text-gradient-gold text-glow">Fireworks</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              From spectacular multishot aerial displays to ground-level fountains and novelty items — 
              JJ Crackers offers Sivakasi&apos;s finest fireworks at factory direct prices.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* About Sivakasi Fireworks */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-6 tracking-tight">
              About Sivakasi Fireworks
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>Sivakasi fireworks</strong> encompass the broader range of pyrotechnic displays manufactured in Sivakasi, Tamil Nadu. 
              While crackers refer to sound-producing items, fireworks include all visual display products — multishots that paint the sky with colours, 
              fountains that create cascading spark showers, and novelty items with creative effects.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              JJ Crackers manufactures and supplies premium fireworks across all categories. Our multishot and sky expo premium ranges 
              are among our most popular products, offering professional-grade aerial effects at consumer prices. All fireworks are safety 
              tested and come with clear usage instructions.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Firework Types */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter">
              Types of Fireworks We Offer
            </h2>
          </ScrollFadeInUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fireworkTypes.map((fw, i) => (
              <ScrollFadeInUp key={fw.name} delay={i * 0.06}>
                <div className="glass-card rounded-2xl p-6 group hover:border-[var(--color-gold)]/40 h-full">
                  <span className="text-3xl mb-3 block">{fw.emoji}</span>
                  <h3 className="font-bold text-[var(--text)] mb-2 text-lg">{fw.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{fw.desc}</p>
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
              Shop Sivakasi Fireworks
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Browse our complete fireworks collection at factory direct prices.
            </p>
            <Link href="/products">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer mx-auto">
                Browse All Fireworks <ArrowRight size={18} />
              </button>
            </Link>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1} className="mt-12">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Sivakasi Crackers', href: '/sivakasi-crackers' },
                { label: 'Diwali Crackers', href: '/diwali-crackers' },
                { label: 'Crackers Online', href: '/crackers-online' },
                { label: 'Combo Packs', href: '/cracker-combo-packs' },
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
