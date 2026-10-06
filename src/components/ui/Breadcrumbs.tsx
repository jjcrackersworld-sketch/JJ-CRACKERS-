import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * SEO-optimized Breadcrumbs component.
 * Renders visible breadcrumbs + BreadcrumbList JSON-LD schema.
 * 
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: 'Products', href: '/products' },
 *     { label: 'Sparklers' },
 *   ]} />
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jjcrackersworld.com';
  
  // Build full breadcrumb chain: Home + provided items
  const fullItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...items,
  ];

  // JSON-LD BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `${siteUrl}${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      {/* JSON-LD Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visible Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium ${className}`}
      >
        <ol className="flex items-center gap-1.5 flex-wrap">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    size={12}
                    className="text-[var(--text-muted)]/50 shrink-0"
                    aria-hidden="true"
                  />
                )}

                {isLast ? (
                  <span
                    className="text-[var(--color-gold)] font-semibold truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {index === 0 && <Home size={13} className="inline mr-1 -mt-0.5" />}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="text-[var(--text-muted)] hover:text-[var(--color-gold)] transition-colors truncate max-w-[200px]"
                  >
                    {index === 0 && <Home size={13} className="inline mr-1 -mt-0.5" />}
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-muted)] truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
