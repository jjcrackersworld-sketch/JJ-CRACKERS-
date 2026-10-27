import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/supabase/types';

export interface EnquiryItem {
  product: Product;
  quantity: number;
}

interface EnquiryState {
  items: EnquiryItem[];
  lastActive: number | null;
  addItem: (payload: { product: Product; quantity: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSavings: () => number;
  getItemCount: () => number;
  setLastActive: (timestamp: number) => void;
  checkCartExpiry: () => void;
  syncWithLiveProducts: (liveProducts: Product[]) => void;
  removeOutOfStockItems: () => void;
}

export const useEnquiryStore = create<EnquiryState>()(
  persist(
    (set, get) => ({
      items: [],
      lastActive: null,

      addItem: ({ product, quantity }) => {
        // Enforce inventory availability rule: out of stock products cannot be added
        if (product.in_stock === false) {
          console.warn(`Cannot add out-of-stock product "${product.name_en}" to cart`);
          return;
        }

        set((state) => {
          const existing = state.items.find((i) => String(i.product.id) === String(product.id));
          const updatedItems = existing
            ? state.items.map((i) =>
                String(i.product.id) === String(product.id) ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { product, quantity }];
          return { 
            items: updatedItems,
            lastActive: Date.now()
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== id),
          lastActive: Date.now()
        }));
      },

      removeOutOfStockItems: () => {
        set((state) => ({
          items: state.items.filter((i) => i.product.in_stock !== false),
          lastActive: Date.now()
        }));
      },

      syncWithLiveProducts: (liveProducts: Product[]) => {
        if (!liveProducts || liveProducts.length === 0) return;
        set((state) => {
          let changed = false;
          const updatedItems = state.items.map((item) => {
            const live = liveProducts.find(
              (p) => String(p.id) === String(item.product.id) || p.slug === item.product.slug
            );
            if (!live) return item;

            if (
              live.in_stock !== item.product.in_stock ||
              live.price !== item.product.price ||
              live.mrp !== item.product.mrp ||
              live.name_en !== item.product.name_en
            ) {
              changed = true;
              return {
                ...item,
                product: {
                  ...item.product,
                  ...live,
                },
              };
            }
            return item;
          });

          return changed ? { items: updatedItems } : state;
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === id ? { ...i, quantity: Math.min(Math.max(1, Math.floor(quantity)), 9999) } : i
          ),
          lastActive: Date.now()
        }));
      },

      clearCart: () => {
        set({ items: [], lastActive: null });
      },

      setLastActive: (timestamp) => {
        set({ lastActive: timestamp });
      },

      checkCartExpiry: () => {
        const { lastActive, items } = get();
        if (lastActive && items.length > 0) {
          const diff = Date.now() - lastActive;
          if (diff > 24 * 60 * 60 * 1000) { // 24 hours in ms
            set({ items: [], lastActive: null });
          }
        }
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getSavings: () => {
        return get().items.reduce((sum, item) => sum + ((item.product.mrp || item.product.price) - item.product.price) * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'jegajothi-enquiry-cart',
    }
  )
);
