import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, Sparkles, Shield, HelpCircle, ChevronRight, CheckCircle2, Heart, Users, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best Crackers to Buy — Complete Selection Guide | JJ Crackers',
  description: 'Looking for the best crackers to buy for Diwali, weddings, and family celebrations? Explore our complete buyer guide covering sparklers, flower pots, aerial multishots, and combo boxes from Jegajothi Crackers (JJ Crackers).',
  keywords: [
    'best crackers to buy',
    'best crackers for Diwali',
    'how to choose crackers',
    'best family crackers',
    'Sivakasi crackers guide',
    'JJ Crackers',
    'Jegajothi Crackers',
  ],
  alternates: { canonical: '/best-crackers-to-buy' },
  openGraph: {
    title: 'Best Crackers to Buy — Buyer Guide | JJ Crackers',
    description: 'Expert tips on choosing the best crackers for kids, families, and grand celebrations directly from Sivakasi manufacturer JJ Crackers (Jegajothi Crackers).',
    url: 'https://jjcrackersworld.com/best-crackers-to-buy',
  },
};

const guideCategories = [
  {
    title: 'Best for Children & Beginners',
    icon: Heart,
    desc: 'Gentle, colorful, and low-noise fireworks designed for safe enjoyment under adult supervision.',
    picks: ['10cm & 15cm Color Sparklers', 'Ground Chakkars Special', 'Mini Flower Pots', 'Color Smoke & Snake Tablets', 'Roll & Ring Caps'],
    link: '/products?category=sparklers',
  },
  {
    title: 'Best for Family Evening Celebrations',
    icon: Users,
    desc: 'The heart of traditional Diwali evenings — bright fountains, spinners, and vibrant ground effects.',
    picks: ['Deluxe Flower Pots (Ashoka & Color Kotti)', 'Deluxe Ground Chakkars', 'Pencil Fountains & Pearl Fountains', 'Whistling Rockets', 'Twinkling Stars'],
    link: '/products?category=flowerpots',
  },
  {
    title: 'Best for Grand Night Sky Shows',
    icon: Zap,
    desc: 'High-altitude aerial fireworks that illuminate the sky with breathtaking colors and sound bursts.',
    picks: ['12 to 240 Shots Multishots', 'Sky Expo Multi Shots (Premium)', '2 Sound Rockets & Lunic Rockets', 'Sky Wala Aerial Fountains', 'Color Rain & Fancy Pipes'],
    link: '/products?category=multishots',
  },
];

const faqs = [
  {
    q: 'What are the best crackers to buy for young children?',
    a: 'For young children, the best options are low-noise, visual fireworks such as sparklers (electric or color), small ground chakkars, flower pots, and novelty items like pop-pops, photo flashes, and color smoke. Always ensure close adult supervision and keep a bucket of water nearby.',
  },
  {
    q: 'Is it better to buy individual items or combo packs?',
    a: 'For families seeking variety with maximum value, combo packs and gift boxes are ideal because they provide a balanced mix of sparklers, chakkars, pots, and aerial novelties at bundled factory prices. If you have specific preferences (such as high-shot aerial displays only), purchasing individual items allows complete customization.',
  },
  {
    q: 'How can I ensure the crackers I buy are authentic Sivakasi products?',
    a: 'Purchase directly from verified Sivakasi manufacturers like Jegajothi Crackers (operating under the brand JJ Crackers since 2015). Direct factory outlets ensure authentic chemicals, fresh manufacturing, and strict quality control without intermediary markups.',
  },
];

export default function BestCrackersToBuyPage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Best Crackers to Buy' }]} />
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Sparkles size={14} /> Comprehensive Selection Guide
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl font-display font-bold leading-tight mb-6 tracking-tighter">
              Best <span className="text-gradient-gold text-glow">Crackers to Buy</span> for Diwali &amp; Celebrations
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              Choosing the right fireworks makes every festival magical and safe. Here is our practical guide to selecting the best crackers for your family, budget, and celebration style.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Editorial Content */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-4">
              How to Choose the Best Crackers
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              When searching for the <strong>best crackers to buy</strong>, the ideal selection depends on who will be celebrating, the space available, and your sound preferences. 
              <strong>Jegajothi Crackers (JJ Crackers)</strong> manufactures over 500 varieties in Sivakasi across 20 distinct categories, ensuring options for every type of gathering.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              A balanced festival order typically features three layers: safe ground novelties for children early in the evening, sparkling fountains and chakkars for the family gathering, and colorful aerial multishots for the night finale.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* Recommended Categories */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tight">
              Recommended Selections by Celebration Type
            </h2>
          </ScrollFadeInUp>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {guideCategories.map((cat, i) => (
              <ScrollFadeInUp key={cat.title} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col h-full border border-[var(--border)]/30 hover:border-[var(--color-gold)]/50 transition-all">
                  <cat.icon size={32} className="text-[var(--color-gold)] mb-4" />
                  <h3 className="text-xl font-bold font-display text-[var(--text)] mb-2">{cat.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-6 leading-relaxed">{cat.desc}</p>
                  
                  <div className="space-y-2 mb-6 flex-1">
                    <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider block mb-2">Top Picks:</span>
                    {cat.picks.map(p => (
                      <div key={p} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text)]">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={cat.link} className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--color-gold)] hover:underline mt-auto">
                    Browse Collection <ArrowRight size={14} />
                  </Link>
                </div>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-[var(--surface-high)] border-t border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-gold)] uppercase tracking-[0.2em] mb-2">
              <HelpCircle size={14} /> Helpful Insights
            </span>
            <h2 className="text-3xl font-display font-bold text-[var(--text)]">Frequently Asked Questions</h2>
          </ScrollFadeInUp>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollFadeInUp key={faq.q} delay={i * 0.05}>
                <details className="glass-card rounded-2xl group p-5 sm:p-6" open={i === 0}>
                  <summary className="font-bold text-sm sm:text-base text-[var(--text)] cursor-pointer list-none flex justify-between items-center">
                    <span>{faq.q}</span>
                    <ChevronRight size={16} className="text-[var(--color-gold)] group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                </details>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-3xl font-display font-bold text-[var(--text)] mb-4">Ready to Order Factory-Direct Fireworks?</h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mb-8">
              Explore 500+ authentic Sivakasi products directly from Jegajothi Crackers (JJ Crackers).
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                View Full Catalog
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
