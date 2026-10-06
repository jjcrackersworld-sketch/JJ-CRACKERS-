import Link from 'next/link';
import Image from 'next/image';
import { InteractiveHeroWrapper } from '@/components/effects/InteractiveHeroWrapper';
import { SlideInLeft, SlideInRight, ScrollFadeInUp } from '@/components/ui/ClientAnimation';
import { AnimatedKolam } from '@/components/ui/AnimatedKolam';
import { getSiteSettings } from '@/lib/settings';
import { Shield, Leaf, Factory, Package, Sparkles, Gift, Star, Zap, Heart, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';
import { CinematicHero25D } from '@/components/effects/CinematicHero25D';
import { HeroButtonsClient } from '@/components/ui/HeroButtonsClient';
import type { Metadata } from 'next';

/* ──────────────────────────────────────────────
   HOMEPAGE FAQ DATA — visible FAQs + schema
   ────────────────────────────────────────────── */
const homepageFAQs = [
  {
    question: 'Is JJ Crackers and Jegajothi Crackers the same?',
    answer: 'Yes! JJ Crackers and Jegajothi Crackers are the exact same company. JJ Crackers is our primary consumer brand and online store (jjcrackersworld.com), while Jegajothi Crackers is our registered manufacturing enterprise in Sivakasi, operating with pride since 2015.',
  },
  {
    question: 'What are Sivakasi crackers?',
    answer: 'Sivakasi crackers are fireworks and firecrackers manufactured in Sivakasi, Tamil Nadu — India\'s largest fireworks production hub. Sivakasi produces over 90% of India\'s fireworks. JJ Crackers (Jegajothi Crackers) is a Sivakasi-based manufacturer offering premium crackers directly at factory prices.',
  },
  {
    question: 'How can I buy crackers online from JJ Crackers?',
    answer: 'You can browse our full product catalog at jjcrackersworld.com, add items to your enquiry cart, and submit your order. Our team confirms orders via WhatsApp or phone call. We deliver safety-certified crackers across India at factory direct prices.',
  },
  {
    question: 'What types of crackers does JJ Crackers offer?',
    answer: 'JJ Crackers offers 500+ products across 20 categories including sparklers, ground chakkars, flower pots, pencil fountains, multishots, sky jets, single sound crackers, fancy novelties, combo packs, and cracker gift boxes — all safety-certified.',
  },
  {
    question: 'Does JJ Crackers deliver crackers across India?',
    answer: 'Yes, JJ Crackers delivers to all major cities across India including Chennai, Bangalore, Hyderabad, Mumbai, Delhi, Kolkata, and more. Tamil Nadu customers enjoy faster delivery directly from our Sivakasi factory.',
  },
  {
    question: 'Are JJ Crackers products safety certified?',
    answer: 'Yes, all JJ Crackers products are manufactured in our safety-certified Sivakasi facility following strict quality control measures. We also offer eco-friendly green crackers with reduced emissions.',
  },
];

/* ──────────────────────────────────────────────
   CATEGORY LINKS — for internal linking + SEO
   ────────────────────────────────────────────── */
const categoryShowcase = [
  { label: 'Sivakasi Crackers', href: '/sivakasi-crackers', emoji: '🎆', desc: 'Premium crackers direct from Sivakasi' },
  { label: 'Diwali Crackers', href: '/diwali-crackers', emoji: '🪔', desc: 'Complete Diwali fireworks collection' },
  { label: 'Crackers Online', href: '/crackers-online', emoji: '🛒', desc: 'Shop crackers online at factory price' },
  { label: 'Fireworks', href: '/sivakasi-fireworks', emoji: '🎇', desc: 'Multishots, sky jets & aerial fireworks' },
  { label: 'Gift Boxes', href: '/cracker-gift-boxes', emoji: '🎁', desc: 'Curated festive cracker gift boxes' },
  { label: 'Combo Packs', href: '/cracker-combo-packs', emoji: '📦', desc: 'Value combo packs for families' },
];


export default async function HomePage() {
  const settings = await getSiteSettings();
  const globalDiscount = settings.global_discount || '60';
  const marqueeText = settings.marquee || 'Welcome to JJ Crackers — Premium Sivakasi Crackers at Direct Factory Price! We Give Special Festive Discounts!';

  const displayMarquee = marqueeText.includes('[discount]')
    ? marqueeText.replace(/\[discount\]/g, `${globalDiscount}%`)
    : `${marqueeText} — 🔥 FLAT ${globalDiscount}% DISCOUNT ON ALL ITEMS! 🔥`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjcrackersworld.com';

  return (
    <div className="flex flex-col bg-[var(--bg)] -mt-20">

      {/* Homepage-specific JSON-LD: FAQPage (visible FAQs below) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: homepageFAQs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* Homepage HowTo schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Order Crackers Online from JJ Crackers',
            description: 'Step-by-step guide to order premium Sivakasi crackers online at factory direct prices from JJ Crackers.',
            step: [
              { '@type': 'HowToStep', name: 'Browse Products', text: 'Visit the JJ Crackers products page and browse through our catalog of 500+ safety-certified crackers.', position: 1 },
              { '@type': 'HowToStep', name: 'Add to Cart', text: 'Select your favorite crackers and add them to your enquiry cart. Choose from individual items, combo packs, or gift boxes.', position: 2 },
              { '@type': 'HowToStep', name: 'Submit Order', text: 'Fill in your delivery details and submit your order. Our team will confirm via WhatsApp at +91 70923 00252.', position: 3 },
              { '@type': 'HowToStep', name: 'Receive Delivery', text: 'Your crackers will be safely packed and delivered to your doorstep across India.', position: 4 },
            ],
          }),
        }}
      />

      {/* 3D HERO (RSC-friendly Client Wrapper handles interactive layers) */}
      <InteractiveHeroWrapper>
        {/* Dynamic Announcement Marquee Bar — at the top of hero, below fixed navbar */}
        <div className="relative w-full bg-[rgba(212,175,55,0.15)] border-t border-b border-[rgba(212,175,55,0.25)] py-2 sm:py-2.5 overflow-hidden flex select-none z-30 mt-16 sm:mt-20 lg:mt-24">
          <div className="animate-marquee-horizontal flex gap-6 sm:gap-8 whitespace-nowrap uppercase tracking-[0.12em] sm:tracking-[0.15em] font-black text-[10px] sm:text-xs text-[var(--color-gold)]">
            <span>{displayMarquee}</span>
            <span>🎆</span>
            <span>{displayMarquee}</span>
            <span>🎆</span>
            {/* Duplicate for seamless looping */}
            <span>{displayMarquee}</span>
            <span>🎆</span>
            <span>{displayMarquee}</span>
            <span>🎆</span>
          </div>
        </div>

        {/* Cinematic 2.5D Background Artwork covering 100% */}
        <div className="relative md:absolute md:inset-0 w-full aspect-[2752/1536] md:aspect-auto h-auto md:h-full z-0 overflow-hidden pointer-events-none">
          <CinematicHero25D />
          {/* Mobile bottom fade to blend image into the page background */}
          <div 
            className="block md:hidden absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none" 
            style={{ 
              background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)' 
            }} 
          />
        </div>

        {/* Luxury Cinematic Gradient Overlay (Deep Navy blended) */}
        <div 
          className="hidden md:block absolute inset-0 z-10 pointer-events-none" 
          style={{ 
            background: 'linear-gradient(90deg, rgba(6,9,19,0.88) 0%, rgba(6,9,19,0.72) 28%, rgba(6,9,19,0.42) 52%, rgba(6,9,19,0.15) 75%, rgba(6,9,19,0) 100%)' 
          }}
        />

        {/* Ambient Top & Bottom fade overlays for seamless blending */}
        <div 
          className="hidden md:block absolute inset-0 z-10 pointer-events-none" 
          style={{ 
            background: 'linear-gradient(to top, var(--bg) 0%, transparent 20%, transparent 80%, rgba(6,9,19,0.45) 100%)' 
          }} 
        />

        {/* Hero Content — Floating over background */}
        <div className="relative z-20 w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-center lg:justify-start py-6 pb-10 sm:py-20 lg:py-24 mt-[-24px] md:mt-0">
          
          {/* Upgraded High-Fidelity Glassmorphic Text Content Panel */}
          <div className="max-w-[600px] w-full glass-card hover:-translate-y-1.5 hover:scale-[1.01] hover:bg-white/55 dark:hover:bg-[rgba(39,18,18,0.55)] hover:border-[var(--color-gold)]/50 hover:shadow-[var(--shadow-gold-lg)] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 mx-auto lg:mx-0 transition-all duration-500 ease-out">
            <SlideInLeft className="w-full">
              {/* JJ Crackers Logo + Branding */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                <div className="relative w-11 h-11 sm:w-16 sm:h-16 lg:w-20 lg:h-20 overflow-hidden flex-shrink-0">
                  <Image 
                    src="/logo/logo.png" 
                    alt="JJ Crackers Logo — Sivakasi Crackers Manufacturer Since 2015" 
                    fill 
                    className="object-contain" 
                    sizes="(max-width: 640px) 44px, 80px"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-base sm:text-xl lg:text-2xl font-extrabold text-[var(--color-gold)] tracking-tight leading-none">JJ Crackers</span>
                  <span className="font-display text-xs sm:text-base lg:text-lg font-semibold text-[var(--text)]/90 transition-colors duration-400 leading-tight">Jegajothi Crackers</span>
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]/70 font-bold mt-0.5">Since 2015 · Sivakasi</span>
                </div>
              </div>

              {/* Pill Badge */}
              <div 
                className="inline-block text-[10px] sm:text-[0.7rem] uppercase tracking-[0.1em] sm:tracking-[0.15em] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-3 sm:mb-5 font-semibold"
                style={{
                  color: '#D4AF37',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  backgroundColor: 'rgba(212, 175, 55, 0.08)'
                }}
              >
                Premium Sivakasi Crackers · Factory Direct Prices
              </div>

              {/* SEO-Optimized H1 — includes primary target keywords naturally */}
              <h1 className="font-display leading-[1.1] mb-3 sm:mb-5 flex flex-col tracking-tight text-left">
                <span className="text-[var(--text)] font-light text-[1.5rem] sm:text-[3rem] lg:text-[4rem] transition-colors duration-400">Buy Sivakasi Crackers</span>
                <span className="text-[var(--color-gold)] font-extrabold text-[1.75rem] sm:text-[4rem] lg:text-[5rem] drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">Online at Factory Price</span>
              </h1>

              {/* Entity description — AI-citable, concise factual text */}
              <p className="text-[var(--text-muted)] text-xs sm:text-[1.05rem] leading-[1.5] sm:leading-[1.7] w-full mb-4 sm:mb-6 font-sans transition-colors duration-400">
                JJ Crackers (Jegajothi Crackers) is a Sivakasi-based fireworks manufacturer offering 500+ premium crackers, 
                Diwali fireworks, combo packs &amp; gift boxes at factory direct prices since 2015. Delivered across India.
              </p>

              <HeroButtonsClient />
            </SlideInLeft>
          </div>
        </div>
      </InteractiveHeroWrapper>

      {/* TRUST BADGES - Ultra Premium */}
      <section className="py-8 sm:py-12 border-y border-[var(--border)]/10 bg-[var(--surface-high)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12">
          {[
            { icon: Shield, title: 'Safety Certified', desc: 'All Products Fully Tested' },
            { icon: Leaf, title: 'Eco-Friendly Options', desc: 'Green Crackers Available' },
            { icon: Factory, title: 'Factory Direct', desc: 'Genuine Sivakasi Pricing' },
            { icon: Package, title: 'India-Wide Delivery', desc: 'Safe Packaging & Shipping' }
          ].map((b, i) => (
            <ScrollFadeInUp key={i} delay={i * 0.1} className="flex flex-col items-center text-center gap-2 sm:gap-4 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-[var(--surface)] text-[var(--color-gold)] flex items-center justify-center border border-[var(--border)]/10 group-hover:border-[var(--color-gold)]/50 group-hover:bg-[var(--color-gold)]/5 transition-all duration-500">
                <b.icon size={24} className="sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <h3 className="font-bold text-[var(--text)] text-xs sm:text-base tracking-tight">{b.title}</h3>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium">{b.desc}</p>
              </div>
            </ScrollFadeInUp>
          ))}
        </div>
      </section>

      {/* CATEGORY SHOWCASE — Internal linking + keyword pages */}
      <section className="py-12 sm:py-20 bg-[var(--bg)]" id="categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-black text-[var(--color-gold)] uppercase tracking-[0.3em] mb-4">
              <Sparkles size={14} /> Shop by Category
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text)] tracking-tighter">
              Explore Our <span className="text-gradient-gold">Crackers Collection</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mt-3 max-w-2xl mx-auto">
              Browse Sivakasi&apos;s finest crackers and fireworks — from sparklers to premium multishots, 
              curated gift boxes to family combo packs.
            </p>
          </ScrollFadeInUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {categoryShowcase.map((cat, i) => (
              <ScrollFadeInUp key={cat.href} delay={i * 0.08}>
                <Link
                  href={cat.href}
                  className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col items-center text-center group hover:border-[var(--color-gold)]/50 transition-all"
                >
                  <span className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                  <h3 className="font-display font-bold text-sm sm:text-lg text-[var(--text)] mb-1 group-hover:text-[var(--color-gold)] transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-relaxed">{cat.desc}</p>
                  <span className="mt-3 text-[var(--color-gold)] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ChevronRight size={12} />
                  </span>
                </Link>
              </ScrollFadeInUp>
            ))}
          </div>

          {/* Direct link to all products */}
          <ScrollFadeInUp className="text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold text-sm hover:scale-105 active:scale-[0.98] transition-transform shadow-lg"
            >
              View All 500+ Products <ArrowRight size={16} />
            </Link>
          </ScrollFadeInUp>
        </div>
      </section>

      {/* WHO IS JJ CRACKERS — AI-citable entity description section */}
      <section className="py-12 sm:py-20 bg-[var(--surface-high)] border-y border-[var(--border)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <ScrollFadeInUp>
              <span className="inline-flex items-center gap-2 text-xs font-black text-[var(--color-gold)] uppercase tracking-[0.3em] mb-4">
                <Star size={14} /> About JJ Crackers
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter mb-5">
                Who is <span className="text-gradient-gold">JJ Crackers?</span>
              </h2>

              {/* AI-citable paragraph: WHO + WHAT + WHERE */}
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
                <strong>JJ Crackers</strong> (Jegajothi Crackers) is a fireworks manufacturer based in <strong>Sivakasi, Tamil Nadu, India</strong> — 
                the country&apos;s largest fireworks production center. Operating since <strong>2015</strong>, JJ Crackers offers over 500 
                safety-certified crackers and fireworks products directly at factory prices through their website <strong>jjcrackersworld.com</strong>.
              </p>

              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
                The product range includes sparklers, ground chakkars, flower pots, multishots, sky jets, pencil fountains, 
                fancy novelties, single sound crackers, and curated <Link href="/cracker-combo-packs" className="text-[var(--color-gold)] hover:underline font-medium">combo packs</Link> and 
                {' '}<Link href="/cracker-gift-boxes" className="text-[var(--color-gold)] hover:underline font-medium">gift boxes</Link> for 
                {' '}<Link href="/diwali-crackers" className="text-[var(--color-gold)] hover:underline font-medium">Diwali</Link>, weddings, and family celebrations.
              </p>

              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-6">
                JJ Crackers delivers across India and offers eco-friendly green crackers alongside their premium range. 
                Customers can order via the website or contact the team on WhatsApp at <a href="https://wa.me/917092300252" className="text-[var(--color-gold)] hover:underline font-medium" target="_blank" rel="noopener noreferrer">+91 70923 00252</a>.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-gold)] hover:underline">
                  Read Our Story <ArrowRight size={14} />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-gold)] hover:underline">
                  Contact Us <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollFadeInUp>

            <ScrollFadeInUp delay={0.2} className="grid grid-cols-2 gap-4">
              {[
                { icon: Factory, value: 'Since 2015', label: 'Sivakasi Manufacturer' },
                { icon: Package, value: '500+', label: 'Products Available' },
                { icon: Heart, value: '20+', label: 'Cracker Categories' },
                { icon: Shield, value: '100%', label: 'Factory Direct' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-5 text-center group hover:border-[var(--color-gold)]/40">
                  <stat.icon size={24} className="text-[var(--color-gold)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xl sm:text-2xl font-display font-bold text-[var(--text)]">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </ScrollFadeInUp>
          </div>
        </div>
      </section>

      {/* VISIBLE FAQs — matches FAQPage schema above */}
      <section className="py-12 sm:py-20 bg-[var(--bg)]" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollFadeInUp className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-black text-[var(--color-gold)] uppercase tracking-[0.3em] mb-4">
              <HelpCircle size={14} /> Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text)] tracking-tighter">
              Frequently Asked Questions
            </h2>
          </ScrollFadeInUp>

          <div className="space-y-4">
            {homepageFAQs.map((faq, i) => (
              <ScrollFadeInUp key={i} delay={i * 0.05}>
                <details className="glass-card rounded-2xl group" open={i === 0}>
                  <summary className="p-5 sm:p-6 cursor-pointer text-sm sm:text-base font-bold text-[var(--text)] flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronRight size={16} className="text-[var(--color-gold)] shrink-0 ml-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 -mt-1">
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </ScrollFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER - Glassmorphism Edition */}
      <section className="py-10 sm:py-20 relative overflow-hidden bg-[var(--bg)] transition-colors duration-400" id="cta">
        <div className="w-full relative z-10 px-4 sm:px-6 md:px-8">
          <ScrollFadeInUp className="relative overflow-hidden w-full glass-premium border border-[var(--color-gold)]/30 shadow-[var(--shadow-gold-lg)]" style={{ borderRadius: '24px' }}>
            {/* Ambient gold glow underlay */}
            <div className="absolute inset-0 bg-radial from-[var(--color-gold)]/10 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-5 mix-blend-overlay scale-125" />
            <div className="absolute -top-20 -left-20 opacity-10"><AnimatedKolam size={400} color="var(--color-gold)" /></div>
            
            <div className="relative z-10 py-12 sm:py-20 text-center flex flex-col items-center justify-center px-6 sm:px-12 lg:px-20">
              <div className="text-[24px] sm:text-[28px] mx-auto mb-4 sm:mb-6 text-center select-none">🎆</div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-[var(--text)] mb-4 sm:mb-6 leading-[1.1] tracking-tighter drop-shadow-[0_0_20px_rgba(208,160,48,0.2)]">
                Ready to Light Up <br />Your Celebration?
              </h2>
              <p 
                className="mx-auto mb-8 sm:mb-10 text-center font-medium text-[var(--text-muted)]"
                style={{ 
                  fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', 
                  maxWidth: '520px', 
                  lineHeight: '1.7' 
                }}
              >
                Browse our collection of 500+ premium Sivakasi crackers or contact our team for custom wedding and corporate orders.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Link href="/products">
                  <button 
                    className="px-8 py-4 bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)] hover:shadow-[0_0_25px_rgba(208,160,48,0.3)] text-black font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-[0.98] cursor-pointer"
                    style={{ borderRadius: '8px' }}
                  >
                    Shop Now <span className="text-xl">→</span>
                  </button>
                </Link>
                <Link href="/contact">
                  <button 
                    className="px-8 py-4 font-bold text-base sm:text-lg transition-all border-2 border-[var(--color-gold)]/60 text-[var(--color-gold)] hover:text-[var(--color-gold-light)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 hover:scale-105 active:scale-[0.98] cursor-pointer"
                    style={{ 
                      borderRadius: '8px' 
                    }}
                  >
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
          </ScrollFadeInUp>
        </div>
        <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
          <AnimatedKolam size={600} color="#D4AF37" />
        </div>
      </section>
    </div>
  );
}
