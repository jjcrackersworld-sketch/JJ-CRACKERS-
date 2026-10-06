import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Factory, Shield, Sparkles, ChevronRight, Award, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Sivakasi Crackers — Authentic Fireworks Direct from Factory | JJ Crackers',
  description: 'Discover the best Sivakasi crackers directly from authentic manufacturers. Learn what makes Sivakasi fireworks renowned for quality, color vibrancy, and safety. Shop factory-direct from Jegajothi Crackers (JJ Crackers).',
  keywords: [
    'best Sivakasi crackers',
    'authentic Sivakasi fireworks',
    'Sivakasi crackers factory direct',
    'top Sivakasi crackers',
    'JJ Crackers',
    'Jegajothi Crackers',
  ],
  alternates: { canonical: '/best-sivakasi-crackers' },
  openGraph: {
    title: 'Best Sivakasi Crackers — Authentic Quality & Factory Direct | JJ Crackers',
    description: 'Explore the highest quality fireworks crafted in Sivakasi. Direct factory supply from Jegajothi Crackers (JJ Crackers).',
    url: 'https://jjcrackersworld.com/best-sivakasi-crackers',
  },
};

export default function BestSivakasiCrackersPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Best Sivakasi Crackers' }]} />
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Factory size={14} /> Sivakasi Pyrotechnic Heritage
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl font-display font-bold leading-tight mb-6 tracking-tighter">
              Best <span className="text-gradient-gold text-glow">Sivakasi Crackers</span> — Factory Craftsmanship
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              Sivakasi produces over 90% of India&apos;s fireworks. Learn what distinguishes genuine Sivakasi crackers in brightness, duration, and safety from Jegajothi Crackers (JJ Crackers).
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Why Sivakasi Fireworks are Renowned */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-4">
              What Makes Sivakasi Crackers the Best in India?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              For over a century, the artisans of <strong>Sivakasi, Tamil Nadu</strong> have perfected pyrotechnic formulas that deliver vibrant chromatic stars, steady fountain heights, and balanced acoustic performance.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              At <strong>Jegajothi Crackers (known as JJ Crackers)</strong>, every cracker is produced under strict quality control. From premium aluminum-coated sparklers that burn steadily with minimal smoke to synchronized multishot sky displays, authentic Sivakasi manufacturing ensures consistency you can trust.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                { title: 'Pure Chemical Formulas', desc: 'No substandard fillers, providing clean colors and predictable burns.' },
                { title: 'Strict Safety Standards', desc: 'Compliant with national safety norms and eco-friendly green cracker guidelines.' },
                { title: 'Direct Factory Value', desc: 'Fresh inventory directly shipped from Sivakasi without retail price inflation.' },
                { title: 'Decade of Experience', desc: 'Manufacturing with pride since 2015 from our Vembakottai facility.' },
              ].map(item => (
                <div key={item.title} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]/20">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--color-gold)] mb-1">
                    <CheckCircle2 size={16} /> {item.title}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Iconic Sivakasi Specialties */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tight">
              Iconic Sivakasi Cracker Specialties
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-2">The signature fireworks that defined Sivakasi&apos;s global reputation.</p>
          </ScrollFadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Ground Chakkars', desc: 'Precision balanced spinners that deliver hypnotic golden and tri-color circular rings.' },
              { name: 'Flower Pots (Anar)', desc: 'High-rising fountain cones erupting in dense glittering showers of silver, gold, and colors.' },
              { name: 'Sky Multishots', desc: 'Sequenced battery cakes firing 12 to 240 aerial bursts with synchronized breaks and crackles.' },
              { name: 'Long Sparklers', desc: '30cm and 50cm extended-duration sparklers that glow brightly with zero hot dripping.' },
            ].map(item => (
              <div key={item.name} className="glass-card rounded-2xl p-6 border border-[var(--border)]/30 hover:border-[var(--color-gold)]/50 transition-all flex flex-col">
                <h3 className="text-lg font-bold font-display text-[var(--color-gold)] mb-2">{item.name}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4 flex-1">{item.desc}</p>
                <Link href="/products" className="text-xs font-bold text-[var(--text)] hover:text-[var(--color-gold)] inline-flex items-center gap-1 transition-colors">
                  Shop Category <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links & CTA */}
      <section className="py-16 bg-[var(--surface-high)] border-t border-[var(--border)]/10 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-4">
              Order Authentic Sivakasi Crackers Direct from the Source
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Buy directly from Jegajothi Crackers (JJ Crackers) in Sivakasi and enjoy factory prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                Explore 500+ Products
              </Link>
              <Link href="/best-crackers-to-buy" className="px-8 py-3.5 rounded-xl border border-[var(--color-gold)]/40 text-[var(--color-gold)] font-bold text-sm hover:bg-[var(--color-gold)]/10 transition-colors">
                Read Buyer Guide
              </Link>
            </div>
          </ScrollFadeInUp>
        </div>
      </section>
    </div>
  );
}
