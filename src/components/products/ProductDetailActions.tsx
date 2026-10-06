'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, MessageCircle } from 'lucide-react';
import { useEnquiryStore } from '@/lib/store/enquiryStore';
import type { Product } from '@/lib/supabase/types';

interface ProductDetailActionsProps {
  product: Product;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const items = useEnquiryStore((state) => state.items);
  const { addItem, updateQuantity } = useEnquiryStore.getState();
  const [isAdded, setIsAdded] = useState(false);

  const cartItem = items.find((i) => String(i.product.id) === String(product.id));
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addItem({ product, quantity: 1 });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello Jegajothi Crackers (JJ Crackers)!\nI would like to order:\n• Product: ${product.name_en}\n• Price: ₹${product.price} (MRP: ₹${product.mrp})\n• Category: ${product.category}\nPlease confirm availability and delivery details. Thank you!`
    );
    window.open(`https://wa.me/917092300252?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Add / Qty Controls */}
      {!product.in_stock ? (
        <div className="w-full py-4 rounded-2xl bg-[var(--surface-high)] text-[var(--text-muted)] border border-[var(--border)] text-center font-bold text-sm opacity-60">
          Currently Out of Stock
        </div>
      ) : inCartQty > 0 ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-between bg-[var(--surface-high)] border border-[var(--color-gold)]/40 rounded-2xl p-2 w-48">
            <button
              onClick={() => updateQuantity(product.id, inCartQty - 1)}
              className="w-10 h-10 rounded-xl bg-[var(--surface)] text-[var(--text)] hover:text-[var(--color-gold)] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-base text-[var(--text)]">{inCartQty} in cart</span>
            <button
              onClick={() => updateQuantity(product.id, inCartQty + 1)}
              className="w-10 h-10 rounded-xl bg-[var(--surface)] text-[var(--text)] hover:text-[var(--color-gold)] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <span className="text-xs font-semibold text-emerald-400">Added to enquiry cart</span>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 active:scale-98 cursor-pointer shadow-lg ${
            isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] hover:shadow-[var(--color-gold)]/30 hover:scale-[1.02]'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> Add to Order Enquiry
            </>
          )}
        </button>
      )}

      {/* WhatsApp Direct Order Button */}
      <button
        onClick={handleWhatsApp}
        className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 border-2 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
      >
        <MessageCircle size={18} /> Order Directly via WhatsApp
      </button>
    </div>
  );
}
