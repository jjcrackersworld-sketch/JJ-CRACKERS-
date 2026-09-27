import { getCategories, getProducts } from '@/lib/db';
import { ProductCatalogClient } from '@/components/products/ProductCatalogClient';

// Dynamic server rendering ensures real-time catalog updates and avoids oversized ISR static HTML payload
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // Fetch initial data directly on the server to optimize FCP, LCP and SEO
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductCatalogClient 
      initialProducts={products} 
      initialCategories={categories} 
    />
  );
}
