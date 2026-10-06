import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Shield, Factory, Package, Leaf, Star, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sivakasi Crackers — Buy Premium Fireworks Direct from Sivakasi Factory',
  description: 'Buy genuine Sivakasi crackers from JJ Crackers at factory direct prices. Sivakasi is India\'s fireworks capital producing over 90% of the country\'s crackers. 500+ products, safety certified, delivered across India.',
  keywords: [
    'Sivakasi crackers', 'Sivakasi crackers online', 'best Sivakasi crackers',
    'Sivakasi crackers factory price', 'crackers from Sivakasi', 'Sivakasi fireworks',
    'buy Sivakasi crackers', 'genuine Sivakasi crackers',
  ],
  alternates: { canonical: '/sivakasi-crackers' },
  openGraph: {
    title: 'Sivakasi Crackers — Factory Direct Prices | JJ Crackers',
    description: 'Buy genuine Sivakasi crackers at factory direct prices. 500+ safety-certified products delivered across India.',
    url: 'https://jjcrackersworld.com/sivakasi-crackers',
  },
};

const categories = [
  { name: 'Sparklers', emoji: '✨', href: '/products' },
  { name: 'Ground Chakkars', emoji: '🌀', href: '/products' },
  { name: 'Flower Pots', emoji: '🌸', href: '/products' },
  { name: 'Multishots', emoji: '🎇', href: '/products' },
  { name: 'Sky Jets', emoji: '🚀', href: '/products' },
  { name: 'Fancy Novelties', emoji: '🎭', href: '/products' },
  { name: 'Pencil Fountains', emoji: '✏️', href: '/products' },
  { name: 'Single Sound', emoji: '💥', href: '/products' },
];

export default function SivakasiCrackersPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Sivakasi Crackers' }]} />
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Factory size={14} /> Direct from India&apos;s Fireworks Capital
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6 tracking-tighter">
              Sivakasi <span className="text-gradient-gold text-glow">Crackers</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              Sivakasi in Tamil Nadu is India&apos;s largest fireworks manufacturing hub, producing over 90% of the country&apos;s crackers. 
              JJ Crackers brings you premium, safety-certified Sivakasi crackers at factory direct prices — no middlemen, no markup.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* What Are Sivakasi Crackers — AI-citable content */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-6 tracking-tight">
              What Are Sivakasi Crackers?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              <strong>Sivakasi crackers</strong> are fireworks manufactured in <strong>Sivakasi</strong>, a city in the Virudhunagar district of Tamil Nadu, India. 
              Known as the &quot;Fireworks Capital of India,&quot; Sivakasi has been a center for pyrotechnic manufacturing for over a century. 
              The city&apos;s fireworks industry employs thousands of skilled artisans and produces a vast range of crackers — from simple sparklers to elaborate multishot aerial displays.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              Sivakasi crackers are known for their quality, variety, and competitive pricing. Because manufacturers sell directly from the production hub, 
              customers can access genuine factory prices without retail markups. This is exactly what <strong>JJ Crackers</strong> offers through <strong>jjcrackersworld.com</strong>.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Modern Sivakasi manufacturers, including JJ Crackers, have also embraced eco-friendly &quot;green crackers&quot; that produce reduced emissions, 
              aligning with environmental regulations while still delivering the festive experience families expect.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter">
              Sivakasi Crackers Categories
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-3 max-w-2xl mx-auto">
              JJ Crackers offers 500+ products across 20 categories, all manufactured in Sivakasi.
            </p>
          </ScrollFadeInUp>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <ScrollFadeInUp key={cat.name} delay={i * 0.05}>
                <Link href={cat.href} className="glass-card rounded-2xl p-5 text-center group hover:border-[var(--color-gold)]/50 block">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{cat.emoji}</span>
                  <h3 className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--color-gold)] transition-colors">{cat.name}</h3>
                </Link>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Why Buy From JJ Crackers */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] tracking-tight">
              Why Buy Sivakasi Crackers from JJ Crackers?
            </h2>
          </ScrollFadeInUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Factory, title: 'Factory Direct', desc: 'We are based in Sivakasi and offer direct factory pricing with no middlemen.' },
              { icon: Shield, title: 'Safety Certified', desc: 'All products are manufactured in our safety-certified facility with strict quality control.' },
              { icon: Package, title: 'Pan-India Delivery', desc: 'We deliver safely packaged crackers to all major cities across India.' },
              { icon: Leaf, title: 'Eco-Friendly Options', desc: 'Green crackers available with reduced emissions for environmentally conscious celebrations.' },
            ].map((item, i) => (
              <ScrollFadeInUp key={item.title} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-6 text-center group hover:border-[var(--color-gold)]/40">
                  <item.icon size={28} className="text-[var(--color-gold)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-[var(--text)] mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links + CTA */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-4 tracking-tight">
              Start Shopping Sivakasi Crackers
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
              Browse our complete catalog, choose from curated combo packs, or explore our festive gift boxes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 active:scale-[0.98] transition-all shadow-lg cursor-pointer">
                  Browse All Products <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/combos">
                <button className="px-8 py-4 rounded-xl border-2 border-[var(--color-gold)]/50 text-[var(--color-gold)] font-bold text-base hover:bg-[var(--color-gold)]/5 hover:scale-105 active:scale-[0.98] transition-all cursor-pointer">
                  View Combo Packs
                </button>
              </Link>
            </div>
          </ScrollFadeInUp>

          {/* Related pages — internal linking */}
          <ScrollFadeInUp delay={0.1} className="mt-12">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Diwali Crackers', href: '/diwali-crackers' },
                { label: 'Sivakasi Fireworks', href: '/sivakasi-fireworks' },
                { label: 'Crackers Online', href: '/crackers-online' },
                { label: 'Cracker Gift Boxes', href: '/cracker-gift-boxes' },
                { label: 'Combo Packs', href: '/cracker-combo-packs' },
                { label: 'About JJ Crackers', href: '/about' },
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
