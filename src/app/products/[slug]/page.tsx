import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetailActions } from '@/components/products/ProductDetailActions';
import { getProductBySlug, getRelatedProducts } from '@/lib/db';
import { Shield, Sparkles, Factory, ArrowRight, Truck, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | JJ Crackers',
      description: 'The requested cracker product could not be found. Browse our complete catalog of 500+ Sivakasi fireworks at JJ Crackers (Jegajothi Crackers).',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjcrackersworld.com';
  const title = `${product.name_en} | JJ Crackers — Jegajothi Crackers Sivakasi`;
  const description = `Buy authentic ${product.name_en} at factory direct price ₹${product.price} (MRP ₹${product.mrp}) from JJ Crackers (Jegajothi Crackers) Sivakasi. 100% genuine pyrotechnic manufacturing delivered across India.`;

  return {
    title,
    description,
    keywords: [
      product.name_en,
      `${product.name_en} Sivakasi`,
      `${product.category} crackers`,
      'JJ Crackers',
      'Jegajothi Crackers',
      'Sivakasi fireworks online',
    ],
    alternates: {
      canonical: `/products/${product.slug || product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${product.slug || product.id}`,
      images: [
        {
          url: product.image_url || '/logo/logo.png',
          alt: `${product.name_en} — JJ Crackers (Jegajothi Crackers)`,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjcrackersworld.com';
  const related = await getRelatedProducts(product.category, product.id, 4);

  const savings = (product.mrp || product.price) - product.price;
  const discountPercent = product.discount_percent || (product.mrp > product.price ? Math.round((savings / product.mrp) * 100) : 0);

  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` },
    { label: product.name_en },
  ];

  return (
    <div className="flex flex-col bg-[var(--bg)] min-h-screen">
      {/* Schema.org Product & BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name_en,
            image: product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${siteUrl}${product.image_url}`) : `${siteUrl}/logo/logo.png`,
            description: `${product.name_en} manufactured by Jegajothi Crackers (JJ Crackers) in Sivakasi, Tamil Nadu. Factory direct pricing.`,
            sku: product.id,
            category: product.category,
            brand: {
              '@type': 'Brand',
              name: 'JJ Crackers (Jegajothi Crackers)',
            },
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'INR',
              availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              priceValidUntil: '2027-12-31',
              url: `${siteUrl}/products/${product.slug || product.id}`,
              seller: {
                '@type': 'Organization',
                name: 'Jegajothi Crackers',
              },
            },
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 w-full">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Main Product Showcase Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Column: Image */}
          <div className="relative w-full aspect-square rounded-3xl bg-[var(--surface-high)] overflow-hidden border border-[var(--border)]/40 shadow-2xl">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={`${product.name_en} — JJ Crackers (Jegajothi Crackers Sivakasi)`}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-30">🎇</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              {product.badge_text && (
                <span className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {product.badge_text}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-gold)] uppercase tracking-[0.2em] mb-2">
                <Factory size={14} /> JJ Crackers · Jegajothi Crackers Sivakasi
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--text)] tracking-tight leading-tight">
                {product.name_en}
              </h1>
              {product.name_ta && (
                <p className="text-base sm:text-lg text-[var(--color-gold)] font-medium mt-1">
                  {product.name_ta}
                </p>
              )}
              <span className="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--surface-high)] text-[var(--text-muted)] border border-[var(--border)]/30">
                Category: {product.category.replace(/-/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-[var(--surface-high)] border border-[var(--border)]/40 flex flex-wrap items-baseline gap-4">
              <span className="text-4xl sm:text-5xl font-extrabold text-[var(--color-gold)] font-display">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-lg sm:text-xl text-[var(--text-muted)] line-through">
                  ₹{product.mrp}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Save ₹{savings} ({discountPercent}% Discount)
                </span>
              )}
            </div>

            {/* Dispatch & Authentic Guarantee */}
            <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]/20">
                <Shield size={16} className="text-[var(--color-gold)] shrink-0" />
                <span>100% Authentic Sivakasi Made</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]/20">
                <Truck size={16} className="text-[var(--color-gold)] shrink-0" />
                <span>Pan-India Transport Delivery</span>
              </div>
            </div>

            {/* Action Buttons */}
            <ProductDetailActions product={product} />

            {/* Specifications Table */}
            <div className="pt-4 border-t border-[var(--border)]/30">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text)] mb-3">Product Specifications</h3>
              <div className="divide-y divide-[var(--border)]/20 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-[var(--text-muted)]">Manufacturer</span>
                  <span className="font-semibold text-[var(--text)]">Jegajothi Crackers (JJ Crackers)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[var(--text-muted)]">Manufacturing Hub</span>
                  <span className="font-semibold text-[var(--text)]">Vembakottai, Sivakasi, Tamil Nadu</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[var(--text-muted)]">Packaging</span>
                  <span className="font-semibold text-[var(--text)]">Standard Factory Sealed Unit</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[var(--text-muted)]">Availability</span>
                  <span className="font-semibold text-emerald-400">In Stock for Direct Order</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Instructions */}
        <section className="mt-16 p-6 sm:p-8 rounded-3xl bg-[var(--surface-high)] border border-[var(--border)]/40">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--text)] mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[var(--color-gold)]" /> Safety Guidelines for Lighting
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm text-[var(--text-muted)]">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Always light outdoors in a clear, open space away from flammable items.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Use an incense stick (agarbatti) to light fuses at arm&apos;s length.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Keep a bucket of water and sand nearby for emergency disposal.</span>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider block mb-1">More from this Category</span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)]">Related Sivakasi Fireworks</h2>
              </div>
              <Link href="/products" className="text-xs sm:text-sm font-bold text-[var(--color-gold)] hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
