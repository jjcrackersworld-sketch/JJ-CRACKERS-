import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { ArrowRight, ShoppingCart, Shield, Truck, CreditCard, MessageCircle, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Buy Crackers Online — Order Sivakasi Fireworks at Factory Price | JJ Crackers',
  description: 'Buy crackers online from JJ Crackers — India\'s direct Sivakasi fireworks store. 500+ products including sparklers, multishots, gift boxes & combo packs. Safety certified, delivered across India.',
  keywords: [
    'crackers online', 'buy crackers online', 'crackers online shopping',
    'order crackers online', 'fireworks online', 'best crackers online',
    'Diwali crackers online', 'crackers home delivery', 'crackers online India',
  ],
  alternates: { canonical: '/crackers-online' },
  openGraph: {
    title: 'Buy Crackers Online — Factory Direct Prices | JJ Crackers',
    description: 'Order premium Sivakasi crackers online. 500+ safety-certified products delivered across India.',
    url: 'https://jjcrackersworld.com/crackers-online',
  },
};

const steps = [
  { step: '01', title: 'Browse Products', desc: 'Explore our catalog of 500+ crackers across 20 categories. Filter by type, price, or browse curated combo packs.', icon: ShoppingCart },
  { step: '02', title: 'Add to Cart', desc: 'Select your favourite crackers and add them to your enquiry cart. No minimum order required for enquiries.', icon: ShoppingCart },
  { step: '03', title: 'Confirm via WhatsApp', desc: 'Submit your order and our team confirms it via WhatsApp or phone call. Discuss customizations or bulk pricing.', icon: MessageCircle },
  { step: '04', title: 'Safe Delivery', desc: 'Your crackers are safely packed and shipped to your doorstep. We deliver across all major cities in India.', icon: Truck },
];

export default function CrackersOnlinePage() {
  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Breadcrumbs items={[{ label: 'Crackers Online' }]} />
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <ShoppingCart size={14} /> Online Crackers Store
            </span>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6 tracking-tighter">
              Buy Crackers <span className="text-gradient-gold text-glow">Online</span>
            </h1>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              Order premium Sivakasi crackers online from JJ Crackers at factory direct prices. 
              No middlemen, no retail markup — just genuine fireworks delivered safely to your doorstep.
            </p>
          </ScrollFadeInUp>
          <ScrollFadeInUp delay={0.3} className="mt-8">
            <Link href="/products">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 active:scale-[0.98] transition-all shadow-lg cursor-pointer mx-auto">
                Shop Now <ArrowRight size={18} />
              </button>
            </Link>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* How to Buy Crackers Online */}
      <section className="py-12 sm:py-16 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] tracking-tight">
              How to Buy Crackers Online from JJ Crackers
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-3 max-w-2xl mx-auto">
              Ordering crackers online is simple, safe, and convenient. Here&apos;s how it works:
            </p>
          </ScrollFadeInUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <ScrollFadeInUp key={s.step} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-6 text-center group hover:border-[var(--color-gold)]/40 h-full">
                  <div className="text-3xl font-display font-bold text-[var(--color-gold)]/30 mb-2">{s.step}</div>
                  <s.icon size={28} className="text-[var(--color-gold)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-[var(--text)] mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                </div>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Why Buy Online */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-6 tracking-tight">
              Why Buy Crackers Online?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              Buying crackers online offers several advantages over visiting a physical shop. You can browse a larger selection 
              at your own pace, compare products and prices easily, and avoid the crowds that are common at local cracker shops during festival season.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
              When you buy from <strong>JJ Crackers</strong> online, you get <strong>factory direct Sivakasi pricing</strong> — the same prices 
              available at the manufacturing source, without retail markups. Our 500+ product catalog is always available online with clear 
              pricing, product details, and category filtering.
            </p>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              All orders are confirmed via WhatsApp for transparency, and crackers are professionally packed for safe shipping across India. 
              Whether you need crackers for <Link href="/diwali-crackers" className="text-[var(--color-gold)] hover:underline font-medium">Diwali</Link>, a wedding, 
              or any celebration, ordering online from JJ Crackers is the most convenient way to get genuine Sivakasi fireworks.
            </p>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* CTA + Related links */}
      <section className="py-12 sm:py-20 bg-[var(--surface-high)] border-t border-[var(--border)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollFadeInUp>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] mb-4">
              Ready to Order?
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Browse our catalog or contact us for bulk orders and custom requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer">
                  Browse Products <ArrowRight size={18} />
                </button>
              </Link>
              <a href="https://wa.me/917092300252" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-xl bg-[#25D366] text-white font-bold text-base flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer">
                  <MessageCircle size={18} /> WhatsApp Us
                </button>
              </a>
            </div>
          </ScrollFadeInUp>

          <ScrollFadeInUp delay={0.1} className="mt-12">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Related Pages</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Sivakasi Crackers', href: '/sivakasi-crackers' },
                { label: 'Diwali Crackers', href: '/diwali-crackers' },
                { label: 'Sivakasi Fireworks', href: '/sivakasi-fireworks' },
                { label: 'Combo Packs', href: '/cracker-combo-packs' },
                { label: 'Gift Boxes', href: '/cracker-gift-boxes' },
                { label: 'Contact', href: '/contact' },
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
