'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEnquiryStore } from '@/lib/store/enquiryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, PackageOpen, Sparkles, ShoppingCart, CheckCircle2, Mail, Phone, MapPin, User, FileText, Download, AlertCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RealisticFirework } from '@/components/effects/RealisticFirework';
import { formatOrderDate } from '@/lib/utils';

export default function EnquiryPage() {
  const items = useEnquiryStore((state) => state.items);
  const { removeItem, updateQuantity, getTotal, getSavings, clearCart } = useEnquiryStore.getState();
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', address: '', city: '', pincode: '', state: '', district: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'skipped' | 'failed'>('idle');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<'idle' | 'generating' | 'downloaded' | 'failed'>('idle');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfDocRef, setPdfDocRef] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number; type: 'burst' | 'fountain' | 'spin' | 'sparkle' }>>([]);

  const [settings, setSettings] = useState<any>({
    min_order_value: '2000',
  });
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(err => console.error('Failed to load settings:', err));

    fetch('/api/bank-accounts')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBankAccounts(data); })
      .catch(err => console.error('Failed to load bank accounts:', err));
  }, []);

  // Scroll to top of the page on step transitions (essential for mobile usability)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [step]);

  // Festive fireworks celebration on successful order (Section 5 & 22)
  // Short, smooth, and stops after ~1.8s so after ~2s the animation is calm and static.
  useEffect(() => {
    if (step === 4 && orderResult) {
      // 1. Celebratory confetti shower
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F4E296', '#F43F5E', '#10B981', '#FF9F1C']
        });
      });

      // 2. Setup short bursts sequence (between 0.4s and 1.8s) then calm/static
      const fireworkTypes = ['burst', 'fountain', 'sparkle'] as const;
      const burstDelays = [400, 800, 1200, 1600];
      const timers: NodeJS.Timeout[] = [];

      burstDelays.forEach((delay) => {
        const t = setTimeout(() => {
          const id = Date.now() + Math.random();
          const x = Math.random() * (typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800) + (typeof window !== 'undefined' ? window.innerWidth * 0.1 : 50);
          const y = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 0.45 : 300) + 50;
          const type = fireworkTypes[Math.floor(Math.random() * fireworkTypes.length)];
          setBursts(prev => [...prev.slice(-6), { id, x, y, type }]);
        }, delay);
        timers.push(t);
      });

      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [step, orderResult]);

  const removeBurst = (id: number) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  };

  const minOrderValue = parseInt(settings.min_order_value) || 2000;

  // Monitor order total - if it drops below minOrderValue, force return to Step 1
  useEffect(() => {
    if (getTotal() < minOrderValue && step > 1 && step < 4) {
      setStep(1);
    }
  }, [items, getTotal, step, minOrderValue]);

  const goToStep = (nextStep: number) => {
    setSubmitError(null);
    setStep(nextStep);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const generateEstimateInBackground = async (
    orderData: any,
    orderItems: any[],
    grandTotal: number,
    packingCharges: number
  ) => {
    setReceiptStatus('generating');
    setIsGeneratingPdf(true);

    let pdfBase64Data: string | null = null;
    try {
      const { generateReceipt, downloadReceipt } = await import('@/lib/pdf/receiptGenerator');
      const doc = await generateReceipt({
        orderNumber: orderData.order_number,
        date: formatOrderDate(orderData.created_at),
        customerName: customerInfo.name || orderData.customer_name,
        customerEmail: customerInfo.email || orderData.customer_email,
        customerPhone: customerInfo.phone || orderData.customer_phone,
        customerAddress: customerInfo.address || orderData.customer_address,
        customerCity: customerInfo.city || orderData.customer_city,
        customerPincode: customerInfo.pincode || orderData.customer_pincode,
        customerState: customerInfo.state || orderData.customer_state,
        customerDistrict: customerInfo.district || orderData.customer_district,
        items: orderItems,
        subtotal: orderData.subtotal || (getTotal() + getSavings()),
        discountTotal: orderData.discount_total || getSavings(),
        totalAmount: grandTotal,
        packingCharges: packingCharges,
      });

      setPdfDocRef(doc);

      // Create blob & object URL for viewing
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(blobUrl);

      // 1. Automatic PDF download with exact filename format: JJ-{ORDER_ID}-{CUSTOMER_NAME}-Order-Estimate.pdf
      downloadReceipt(doc, orderData.order_number, customerInfo.name || orderData.customer_name);
      setReceiptStatus('downloaded');

      // 2. Automatic PDF opening in a new tab/window
      try {
        const opened = window.open(blobUrl, '_blank');
        if (!opened) {
          console.log('Popup was blocked by browser. User can click OPEN ORDER ESTIMATE.');
        }
      } catch (openErr) {
        console.warn('Could not auto-open PDF in new tab:', openErr);
      }

      // Convert to data URI for email & WhatsApp attachment
      const dataUri = doc.output('datauristring');
      pdfBase64Data = dataUri.split(',')[1];
    } catch (pdfErr: any) {
      console.error('PDF generation error:', pdfErr);
      setReceiptStatus('failed');
      try {
        const { logError } = await import('@/lib/tracking');
        await logError('PDFGenerationError', pdfErr.message || String(pdfErr), pdfErr.stack, { orderNumber: orderData.order_number });
      } catch (trackErr) {}
    } finally {
      setIsGeneratingPdf(false);
    }

    // 3. Dispatch Email in background (with Base64 PDF attachment)
    const rawCustomerEmail = (customerInfo.email || orderData?.customer_email || '').trim();
    const hasValidCustomerEmail = Boolean(
      rawCustomerEmail &&
      rawCustomerEmail.includes('@') &&
      rawCustomerEmail.toLowerCase() !== 'n/a'
    );

    if (hasValidCustomerEmail) {
      setEmailStatus('sending');
      fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: rawCustomerEmail,
          orderNumber: orderData.order_number,
          customerName: customerInfo.name || orderData.customer_name,
          items: orderItems,
          totalAmount: grandTotal,
          subtotal: orderData.subtotal || (getTotal() + getSavings()),
          discountTotal: orderData.discount_total || getSavings(),
          packingCharges: packingCharges,
          pdfBase64: pdfBase64Data,
          customerPhone: customerInfo.phone || orderData.customer_phone,
          customerAddress: customerInfo.address || orderData.customer_address,
          customerCity: customerInfo.city || orderData.customer_city,
          customerPincode: customerInfo.pincode || orderData.customer_pincode,
          customerState: customerInfo.state || orderData.customer_state,
          customerDistrict: customerInfo.district || orderData.customer_district,
          notifyAdmin: true,
        }),
      })
      .then(async (emailRes) => {
        const emailData = await emailRes.json();
        if (emailRes.ok) {
          setEmailStatus(emailData.skipped ? 'skipped' : 'sent');
        } else {
          setEmailStatus('failed');
          setEmailErrorMessage(emailData.error || 'Mail delivery failed.');
        }
      })
      .catch(err => {
        console.error('Email receipt dispatch error:', err);
        setEmailStatus('failed');
        setEmailErrorMessage(err instanceof Error ? err.message : String(err));
      });
    } else {
      setEmailStatus('idle');
      fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '',
          orderNumber: orderData.order_number,
          customerName: customerInfo.name || orderData.customer_name,
          items: orderItems,
          totalAmount: grandTotal,
          subtotal: orderData.subtotal || (getTotal() + getSavings()),
          discountTotal: orderData.discount_total || getSavings(),
          packingCharges: packingCharges,
          pdfBase64: pdfBase64Data,
          customerPhone: customerInfo.phone || orderData.customer_phone,
          customerAddress: customerInfo.address || orderData.customer_address,
          customerCity: customerInfo.city || orderData.customer_city,
          customerPincode: customerInfo.pincode || orderData.customer_pincode,
          customerState: customerInfo.state || orderData.customer_state,
          customerDistrict: customerInfo.district || orderData.customer_district,
          notifyAdmin: true,
        }),
      }).catch(() => {});
    }

    // 4. Trigger WhatsApp notification in background
    fetch('/api/notify-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: customerInfo.phone || orderData.customer_phone,
        orderNumber: orderData.order_number,
        customerName: customerInfo.name || orderData.customer_name,
        pdfBase64: pdfBase64Data,
      })
    }).catch(err => {
      console.error('WhatsApp notification dispatch error:', err);
    });

    // 5. Track order placement analytics event
    try {
      const { trackEvent } = await import('@/lib/tracking');
      await trackEvent('order_placed', 'checkout', { orderNumber: orderData.order_number, totalAmount: grandTotal });
    } catch (trackErr) {}
  };

  const handlePlaceOrder = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setSubmitError(null);
    setEmailStatus('idle');
    setEmailErrorMessage(null);

    try {
      const orderItems = items.map(item => ({
        name: item.product.name_en,
        quantity: item.quantity,
        price: item.product.price,
        mrp: item.product.mrp,
        category: item.product.category,
      }));
      
      const orderValue = getTotal();
      const packingCharges = Math.round(orderValue * 0.03);
      const grandTotal = orderValue + packingCharges;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          customer_city: customerInfo.city,
          customer_pincode: customerInfo.pincode,
          customer_state: customerInfo.state,
          customer_district: customerInfo.district,
          items: orderItems,
          subtotal: getTotal() + getSavings(),
          discount_total: getSavings(),
          total_amount: grandTotal,
          payment_method: 'bank_transfer',
          notes: `Includes 3% packing charges (₹${packingCharges.toLocaleString('en-IN')}) on order value (₹${orderValue.toLocaleString('en-IN')})`,
        }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error('Failed to parse server response. The server might be unreachable.');
      }
      
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to place order. Please try again.');
      }
      
      // IMMEDIATE SUCCESS EXPERIENCE:
      // Show success modal immediately without waiting for PDF or animations
      const orderData = { ...data, items: orderItems };
      setOrderResult(orderData);
      setStep(4);
      clearCart();
      setIsSubmitting(false);

      // Start PDF generation and notifications in background
      generateEstimateInBackground(orderData, orderItems, grandTotal, packingCharges);

    } catch (error: any) {
      console.error('Order error:', error instanceof Error ? error.message : String(error));
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred while placing your order. Please try again.');
      setIsSubmitting(false);

      // Log order creation failure
      try {
        const { logError } = await import('@/lib/tracking');
        await logError('OrderPlacementError', error.message || String(error), error.stack, { customerEmail: customerInfo.email });
      } catch (trackErr) {}
    }
  };

  const handleOpenReceipt = async () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
      return;
    }
    await handleDownloadReceipt(true);
  };

  const handleDownloadAgain = async () => {
    if (pdfDocRef && orderResult) {
      const { downloadReceipt } = await import('@/lib/pdf/receiptGenerator');
      downloadReceipt(pdfDocRef, orderResult.order_number, orderResult.customer_name || customerInfo.name);
      return;
    }
    await handleDownloadReceipt(false);
  };

  const handleShareOnWhatsApp = () => {
    if (!orderResult) return;
    const orderItems = orderResult.items || [];
    const itemLines = orderItems.map((item: any) =>
      `• ${item.quantity} x ${item.name || item.product_name} — ₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}`
    ).join('\n');

    const msg = [
      `Hello Jegajothi Crackers! 🙏`,
      '',
      `I have placed a cracker order on your website.`,
      '',
      `📄 *Order Reference:* ${orderResult.order_number}`,
      `👤 *Customer Name:* ${orderResult.customer_name || customerInfo.name}`,
      `📞 *Phone:* ${orderResult.customer_phone || customerInfo.phone}`,
      `📍 *Location:* ${[orderResult.customer_city || customerInfo.city, orderResult.customer_pincode || customerInfo.pincode].filter(Boolean).join(' - ')}`,
      '',
      `🛒 *Items List:*`,
      itemLines,
      '',
      `💰 *Grand Total (incl. packing):* ₹${orderResult.total_amount?.toLocaleString('en-IN')}`,
      '',
      `Please confirm receipt and final shipment tracking. Thank you! 🎆`
    ].join('\n');

    const url = `https://wa.me/917092300252?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = async (openInNewTab = false) => {
    if (!orderResult) return;
    setReceiptStatus('generating');
    setIsGeneratingPdf(true);

    const orderItems = items.length > 0 ? items.map(i => ({ name: i.product.name_en, quantity: i.quantity, price: i.product.price, mrp: i.product.mrp })) : (orderResult.items || []);
    const itemsTotal = orderItems.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const calculatedPacking = Math.round(itemsTotal * 0.03);
    const grandTotal = itemsTotal + calculatedPacking;
    
    try {
      const { generateReceipt, downloadReceipt } = await import('@/lib/pdf/receiptGenerator');
      const doc = await generateReceipt({
        orderNumber: orderResult.order_number,
        date: formatOrderDate(orderResult.created_at),
        customerName: orderResult.customer_name || customerInfo.name,
        customerEmail: orderResult.customer_email || customerInfo.email,
        customerPhone: orderResult.customer_phone || customerInfo.phone, 
        customerAddress: orderResult.customer_address || customerInfo.address,
        customerCity: orderResult.customer_city || customerInfo.city,
        customerPincode: orderResult.customer_pincode || customerInfo.pincode,
        customerState: orderResult.customer_state || customerInfo.state,
        customerDistrict: orderResult.customer_district || customerInfo.district,
        items: orderItems,
        subtotal: orderResult.subtotal || (itemsTotal + (orderResult.discount_total || 0)), 
        discountTotal: orderResult.discount_total || 0,
        totalAmount: grandTotal,
        packingCharges: calculatedPacking,
      });

      setPdfDocRef(doc);

      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(blobUrl);

      if (openInNewTab) {
        window.open(blobUrl, '_blank');
      } else {
        downloadReceipt(doc, orderResult.order_number, orderResult.customer_name || customerInfo.name);
      }
      setReceiptStatus('downloaded');
    } catch (err) {
      console.error('Failed to generate estimate:', err);
      setReceiptStatus('failed');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Step 4: Premium Success Celebration
  if (step === 4 && orderResult) {
    return (
      <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center w-full z-10 overflow-hidden py-10 px-4" style={{ background: 'linear-gradient(135deg, #0B1220 0%, #101827 40%, #1a1c2e 70%, #0B1220 100%)' }}>

        {/* Animated Golden Particle Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle golden floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: `radial-gradient(circle, rgba(212,167,44,${0.3 + Math.random() * 0.4}) 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -(30 + Math.random() * 60), 0],
                x: [0, (Math.random() - 0.5) * 40, 0],
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Background Bursting Fireworks */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          <AnimatePresence>
            {bursts.map(b => (
              <RealisticFirework key={b.id} x={b.x} y={b.y} type={b.type} onComplete={() => removeBurst(b.id)} />
            ))}
          </AnimatePresence>
        </div>

        {/* Centered Success Card (Section 4 & 20) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.05 }}
          className="relative z-10 w-full max-w-[580px] mx-4 sm:mx-6 rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(16,24,39,0.95) 0%, rgba(30,41,59,0.97) 100%)',
            border: '1.5px solid rgba(212,167,44,0.3)',
            boxShadow: '0 0 60px rgba(212,167,44,0.08), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Gold accent top border */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #D4AF37, #F97316, #C2410C, #D4AF37)' }} />

          <div className="p-6 sm:p-10 flex flex-col items-center text-center">
            {/* Success Check Animation (0.15s) */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.55, delay: 0.15 }}
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
                border: '2px solid rgba(16,185,129,0.4)',
                boxShadow: '0 0 30px rgba(16,185,129,0.12)',
              }}
            >
              <CheckCircle2 size={36} className="text-emerald-400" />
            </motion.div>

            {/* ORDER CONFIRMED Title (0.25s) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] mb-1"
              style={{ color: '#4ADE80' }}
            >
              ✓ ORDER CONFIRMED
            </motion.div>

            {/* Thank You Title (0.35s) */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-xl sm:text-2xl font-bold font-display mb-1"
              style={{ color: '#F2C14E', letterSpacing: '0.5px' }}
            >
              THANK YOU FOR CHOOSING JJ CRACKERS!
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs sm:text-sm mb-6"
              style={{ color: 'rgba(148,163,184,0.9)' }}
            >
              Your order has been successfully placed.
            </motion.p>

            {/* Order Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="w-full rounded-2xl p-5 mb-5 space-y-4"
              style={{
                background: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(148,163,184,0.15)',
              }}
            >
              {/* Order ID */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'rgba(148,163,184,0.7)' }}>ORDER ID</div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display tracking-wide" style={{ color: '#F2C14E' }}>
                  {orderResult.order_number}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(148,163,184,0.12)', width: '60%', margin: '0 auto' }} />

              {/* Net Payable */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'rgba(148,163,184,0.7)' }}>NET PAYABLE</div>
                <div className="text-xl sm:text-2xl font-black" style={{ color: '#FFFFFF' }}>
                  ₹{orderResult.total_amount?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(148,163,184,0.12)', width: '60%', margin: '0 auto' }} />

              {/* CONFIRMED Badge — Perfectly Centered (Section 21) */}
              <div className="flex items-center justify-center pt-1">
                <span
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wider"
                  style={{
                    lineHeight: 1,
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#4ADE80',
                  }}
                >
                  <span
                    className="shrink-0"
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#4ADE80',
                      boxShadow: '0 0 6px rgba(74,222,128,0.8)',
                      verticalAlign: 'middle',
                    }}
                  />
                  <span style={{ display: 'inline-block', verticalAlign: 'middle', lineHeight: 1 }}>CONFIRMED</span>
                </span>
              </div>
            </motion.div>

            {/* Subtle Non-Blocking Estimate Status (Section 12) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full mb-5 flex flex-col items-center gap-1.5"
            >
              {receiptStatus === 'generating' && (
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(212,167,44,0.25)', color: '#F2C14E' }}>
                  <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Estimate preparing...</span>
                </div>
              )}
              {receiptStatus === 'downloaded' && (
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#4ADE80' }}>
                  <CheckCircle2 size={14} className="shrink-0" style={{ color: '#10B981' }} />
                  <span>Estimate Ready ✓</span>
                </div>
              )}
              {receiptStatus === 'failed' && (
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#FB7185' }}>
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Estimate could not be opened automatically. Click below.</span>
                </div>
              )}

              {(() => {
                const confirmedEmail = (customerInfo.email || orderResult?.customer_email || '').trim();
                const hasCustomerEmail = Boolean(
                  confirmedEmail &&
                  confirmedEmail.includes('@') &&
                  confirmedEmail.toLowerCase() !== 'n/a'
                );

                if (!hasCustomerEmail) return null;

                if (emailStatus === 'sending') {
                  return (
                    <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.7)' }}>
                      Emailing estimate in background...
                    </span>
                  );
                }

                if (emailStatus === 'sent') {
                  return (
                    <span className="text-[11px]" style={{ color: 'rgba(74,222,128,0.9)' }}>
                      Estimate emailed to <strong>{confirmedEmail}</strong> ✓
                    </span>
                  );
                }

                return null;
              })()}
            </motion.div>

            {/* Action Buttons (Section 17 & 20) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full flex flex-col items-center gap-3 mb-6"
            >
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={handleOpenReceipt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #D4AF37, #C8981F)',
                    color: '#1a1400',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.25)',
                  }}
                >
                  <FileText size={16} /> OPEN ORDER ESTIMATE
                </motion.button>

                <Link href="/products" className="block w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{
                      background: 'rgba(30,41,59,0.8)',
                      border: '1px solid rgba(148,163,184,0.25)',
                      color: '#FFFFFF',
                    }}
                  >
                    Continue Shopping <ArrowRight size={16} />
                  </motion.button>
                </Link>
              </div>

              {receiptStatus === 'downloaded' && (
                <button
                  onClick={handleDownloadAgain}
                  className="mt-1 text-xs text-amber-300/80 hover:text-amber-200 underline flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} /> Download Again (PDF)
                </button>
              )}
            </motion.div>

            {/* Diya Row — Lower part of success window (Section 6 & 22) */}
            <div className="flex justify-center items-end gap-6 sm:gap-12 my-3 pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`diya-${i}`}
                  className="relative flex flex-col items-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
                >
                  {/* Diya flame */}
                  <motion.div
                    className="relative w-5 h-7 mb-[-2px]"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.2, duration: 0.35, type: 'spring' }}
                  >
                    {/* Flame glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, rgba(255,200,50,0.6) 0%, rgba(255,140,0,0.3) 40%, transparent 70%)',
                        filter: 'blur(6px)',
                        width: '24px',
                        height: '28px',
                        left: '-2px',
                        top: '-4px',
                      }}
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.6, 0.9, 0.6],
                      }}
                      transition={{ duration: 1.2 + Math.random() * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Flame shape (teardrop) */}
                    <motion.div
                      className="absolute left-1/2 bottom-0"
                      style={{
                        width: '10px',
                        height: '16px',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(to top, #FF6B00 0%, #FFAA00 40%, #FFE066 80%, #FFF8DC 100%)',
                        borderRadius: '50% 50% 40% 40% / 70% 70% 30% 30%',
                        boxShadow: '0 0 8px rgba(255,170,0,0.8), 0 0 20px rgba(255,140,0,0.4)',
                      }}
                      animate={{
                        scaleX: [1, 0.85, 1.1, 1],
                        scaleY: [1, 1.08, 0.95, 1],
                      }}
                      transition={{ duration: 0.8 + Math.random() * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                  {/* Diya body (cup shape via SVG) */}
                  <svg width="34" height="18" viewBox="0 0 36 20" fill="none">
                    <path d="M4 4 C4 4 6 0 18 0 C30 0 32 4 32 4 L30 16 C30 18 26 20 18 20 C10 20 6 18 6 16 L4 4Z" fill="url(#diyaGrad)" stroke="#B8860B" strokeWidth="0.8"/>
                    <ellipse cx="18" cy="4" rx="14" ry="3.5" fill="#DAA520" opacity="0.5"/>
                    <defs>
                      <linearGradient id="diyaGrad" x1="18" y1="0" x2="18" y2="20">
                        <stop offset="0%" stopColor="#DAA520"/>
                        <stop offset="50%" stopColor="#CD853F"/>
                        <stop offset="100%" stopColor="#8B4513"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Warm glow beneath diya */}
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    style={{
                      width: '46px',
                      height: '14px',
                      background: 'radial-gradient(ellipse, rgba(255,170,0,0.25) 0%, transparent 70%)',
                      filter: 'blur(4px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ delay: 0.8 + i * 0.2, duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bottom Brand / Support */}
            <div className="pt-3 w-full text-center" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
              <p className="text-[11px] font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>
                JJ CRACKERS · Sivakasi Direct Factory Outlet · <a href="tel:+917092300252" className="hover:underline font-bold" style={{ color: '#D4AF37' }}>+91 70923 00252</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0 && step < 4) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-28 h-28 bg-[var(--surface-high)] rounded-full flex items-center justify-center mb-6 text-[var(--color-gold)] border border-[var(--border)]">
          <PackageOpen size={56} />
        </motion.div>
        <h2 className="text-3xl font-bold font-display mb-4">Your Cart is Empty</h2>
        <p className="text-[var(--text-muted)] max-w-md mb-8">Explore our premium collection and add products to your cart!</p>
        <Link href="/products"><motion.button whileHover={{ scale: 1.05 }} className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold flex items-center gap-2 shadow-lg">Browse Products <ArrowRight size={16} /></motion.button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {['Review Cart', 'Your Details', 'Confirm Order'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400]' : 'bg-[var(--surface-high)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
              {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === i + 1 ? 'text-[var(--color-gold)]' : 'text-[var(--text-muted)]'}`}>{label}</span>
            {i < 2 && <div className={`w-12 h-px ${step > i + 1 ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Cart Review */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-gold)]" />
              <h1 className="text-3xl font-bold font-display">Review Your Cart</h1>
            </div>
            <Link href="/products">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2 rounded-full border border-[var(--border)] hover:border-[var(--color-gold)] text-xs text-[var(--text-muted)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-2 w-fit bg-[var(--surface-high)]/50 backdrop-blur-md font-bold"
              >
                <span>Add More Products / Keep Shopping</span>
                <ArrowRight size={12} className="text-[var(--color-gold)]" />
              </motion.button>
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:flex-1 glass-card rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--surface-high)] font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-[0.15em]">
                <div className="col-span-5">Product</div><div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div><div className="col-span-2 text-right">Total</div>
                <div className="col-span-1 text-center">Remove</div>
              </div>
              <div className="divide-y divide-[var(--border)]">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      exit={{ opacity: 0, x: -100, height: 0 }}
                      className="p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4"
                    >
                      {/* Left: Image & Details */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-[var(--surface-high)] overflow-hidden flex-shrink-0 border border-[var(--border)] flex items-center justify-center relative">
                          {item.product.image_url ? (
                            <Image src={item.product.image_url} alt={item.product.name_en} fill className="object-cover" sizes="56px" />
                          ) : (
                            <span className="text-lg opacity-30">🎇</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-[var(--color-gold)] font-bold uppercase tracking-[0.15em] block mb-0.5">
                            {item.product.category}
                          </span>
                          <h3 className="font-bold text-sm text-[var(--text)] truncate">
                            {item.product.name_en}
                          </h3>
                          {/* Price - Mobile Only */}
                          <div className="flex items-baseline gap-2 mt-1 md:hidden">
                            <span className="font-bold text-sm text-[var(--text)]">₹{item.product.price}</span>
                            <span className="text-[10px] text-[var(--text-muted)] line-through">₹{item.product.mrp}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price, Qty, Total, Remove */}
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t border-[var(--border)]/30 md:border-t-0 pt-3 md:pt-0">
                        {/* Price - Desktop Only */}
                        <div className="hidden md:block text-center w-20">
                          <span className="font-bold text-sm">₹{item.product.price}</span>
                          <div className="text-[10px] text-[var(--text-muted)] line-through">₹{item.product.mrp}</div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center bg-[var(--surface-high)] rounded-lg border border-[var(--border)] overflow-hidden h-8">
                          <button
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-7 flex justify-center items-center h-full hover:bg-[var(--surface-highest)] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) updateQuantity(item.product.id, val);
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) updateQuantity(item.product.id, 1);
                            }}
                            className="w-12 text-center text-xs font-bold border-x border-[var(--border)] h-full flex items-center justify-center bg-transparent focus:outline-none focus:bg-[var(--surface-highest)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 flex justify-center items-center h-full hover:bg-[var(--surface-highest)] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Total Price & Delete Button */}
                        <div className="flex items-center gap-4 md:w-32 justify-end">
                          <div className="text-right">
                            <span className="font-bold text-lg text-[var(--color-gold)]">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="w-full lg:w-[380px] sticky top-28">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold font-display mb-5 border-b border-[var(--border)] pb-3 flex items-center gap-2"><ShoppingCart size={16} className="text-[var(--color-gold)]" /> Order Summary</h3>
                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Gross Total</span><span className="font-bold">₹{(getTotal() + getSavings()).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-emerald-500 font-bold"><span>Discount</span><span>- ₹{getSavings().toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-[var(--text-muted)] border-t border-[var(--border)]/30 pt-2"><span>Total Value (Net)</span><span className="font-bold">₹{getTotal().toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-[var(--text-muted)]"><span>Packing Charges (3%)</span><span className="font-bold">₹{Math.round(getTotal() * 0.03).toLocaleString('en-IN')}</span></div>
                </div>
                <div className="flex justify-between items-end border-t border-[var(--border)] pt-4 mb-6">
                  <span className="font-bold">Net Payable</span><span className="text-2xl font-bold text-[var(--color-gold)]">₹{(getTotal() + Math.round(getTotal() * 0.03)).toLocaleString('en-IN')}</span>
                </div>

                {getTotal() < minOrderValue && (
                  <div className="flex items-start gap-2.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-5 text-xs text-left">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Minimum Order Required</span>
                      <p className="mt-0.5 text-rose-300/80">Minimum order amount is ₹{minOrderValue.toLocaleString('en-IN')}. Please add ₹{(minOrderValue - getTotal()).toLocaleString('en-IN')} more to proceed.</p>
                    </div>
                  </div>
                )}

                <motion.button 
                  onClick={() => getTotal() >= minOrderValue && goToStep(2)} 
                  disabled={getTotal() < minOrderValue}
                  whileHover={getTotal() >= minOrderValue ? { scale: 1.02 } : {}} 
                  whileTap={getTotal() >= minOrderValue ? { scale: 0.98 } : {}}
                  className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold rounded-xl py-3.5 text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-3">
                  Proceed to Details <ArrowRight size={16} />
                </motion.button>

                <Link href="/products" className="block text-center text-xs text-[var(--text-muted)] hover:text-[var(--color-gold)] transition-colors mt-2 font-bold py-1 border-t border-[var(--border)]/20 pt-3">
                  ← Add More Products
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Customer Details */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
          <button onClick={() => goToStep(1)} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--color-gold)] mb-6"><ArrowLeft size={16} /> Back to Cart</button>
          <h1 className="text-3xl font-bold font-display mb-8">Your Details</h1>
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const trimmedName = (customerInfo.name || '').trim();
            if (!trimmedName) {
              setSubmitError('Customer Name is required.');
              return;
            }
            const cleanPhone = (customerInfo.phone || '').replace(/\D/g, '');
            if (!cleanPhone) {
              setSubmitError('Phone Number is required.');
              return;
            }
            if (cleanPhone.length !== 10) {
              setSubmitError('Phone Number must be exactly 10 digits.');
              return;
            }
            const trimmedAddress = (customerInfo.address || '').trim();
            if (!trimmedAddress) {
              setSubmitError('Delivery Address is required.');
              return;
            }
            if (trimmedAddress.length < 5) {
              setSubmitError('Address must be at least 5 characters.');
              return;
            }
            const trimmedEmail = (customerInfo.email || '').trim();
            if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
              setSubmitError('Please enter a valid email address.');
              return;
            }
            const cleanPincode = (customerInfo.pincode || '').replace(/\D/g, '');
            if (cleanPincode && cleanPincode.length !== 6) {
              setSubmitError('Pincode must be exactly 6 digits.');
              return;
            }
            setSubmitError(null);
            goToStep(3); 
          }} className="glass-card rounded-2xl p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Full Name <span className="text-rose-400 font-bold ml-0.5">*</span>
                </label>
                <input required value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all" placeholder="Your Full Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-400 font-bold ml-0.5">*</span>
                </label>
                <input required type="tel" pattern="[0-9]{10}" maxLength={10} value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all" placeholder="10-digit Mobile Number" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Email Address <span className="text-[10px] text-[var(--text-muted)] font-normal normal-case">(Optional)</span>
                </label>
                <input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all" placeholder="you@email.com (Optional)" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  State
                </label>
                <select value={customerInfo.state} onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all appearance-none cursor-pointer">
                  <option value="">Select State</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  District
                </label>
                <input value={customerInfo.district} onChange={(e) => setCustomerInfo({...customerInfo, district: e.target.value})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all" placeholder="e.g. Theni, Madurai" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  City / Town
                </label>
                <input value={customerInfo.city} onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all" placeholder="Your City" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Full Delivery Address <span className="text-rose-400 font-bold ml-0.5">*</span>
              </label>
              <textarea required rows={3} value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all resize-none" placeholder="House No, Street, Area, Landmark" />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Pincode
              </label>
              <input type="tel" pattern="[0-9]{6}" maxLength={6} value={customerInfo.pincode} onChange={(e) => setCustomerInfo({...customerInfo, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} className="w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-all" placeholder="6-digit Pincode" />
            </div>
            
            {submitError && (
              <div className="flex items-start gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-left">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm">Validation Error</span>
                  <p className="text-xs text-rose-300/80 mt-1">{submitError}</p>
                </div>
              </div>
            )}

            <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold rounded-xl py-3.5 text-sm shadow-lg flex items-center justify-center gap-2">
              Review Order <ArrowRight size={16} />
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
          <button onClick={() => goToStep(2)} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--color-gold)] mb-6"><ArrowLeft size={16} /> Edit Details</button>
          <h1 className="text-3xl font-bold font-display mb-8">Confirm Your Order</h1>
          
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Customer Details */}
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-gold)] uppercase tracking-wider mb-4">Customer Details</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2"><User size={14} className="text-[var(--color-gold)]" /> <span className="font-bold">{customerInfo.name}</span></div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-[var(--color-gold)]" /> {customerInfo.phone}</div>
                    {customerInfo.email && <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--color-gold)]" /> {customerInfo.email}</div>}
                    <div className="flex items-start gap-2 text-[var(--text-muted)] text-xs pt-1">
                      <MapPin size={14} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                      <span>{[customerInfo.address, customerInfo.city, customerInfo.pincode].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Place of Supply & Transport */}
                <div className="border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
                  <h3 className="font-bold text-sm text-[var(--color-gold)] uppercase tracking-wider mb-4">Place of Supply & Transport</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">State:</span><span className="font-bold">{customerInfo.state}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">District:</span><span className="font-bold">{customerInfo.district}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Destination:</span><span>{customerInfo.city}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Postal Code:</span><span>{customerInfo.pincode}</span></div>
                    <div className="pt-2 border-t border-[var(--border)] mt-2 text-xs text-[var(--color-gold)] font-bold">
                      📦 Pickup: Nearest Transport Office Hub
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-sm text-[var(--color-gold)] uppercase tracking-wider mb-4">Order Items ({items.length})</h3>
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between items-center py-2 border-b border-[var(--border)]/50 last:border-0 text-sm">
                  <span>{item.quantity}x {item.product.name_en}</span>
                  <span className="font-bold">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Gross Total</span><span>₹{(getTotal() + getSavings()).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-emerald-500"><span>Discount</span><span>-₹{getSavings().toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between pt-1 border-t border-[var(--border)]/30"><span className="text-[var(--text-muted)]">Total Value (Net)</span><span className="font-bold">₹{getTotal().toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Packing Charges (3%)</span><span className="font-bold">₹{Math.round(getTotal() * 0.03).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-[var(--border)]"><span>Net Payable</span><span className="text-[var(--color-gold)]">₹{(getTotal() + Math.round(getTotal() * 0.03)).toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                <div><p className="font-bold text-sm text-[var(--text)] mb-1">Please verify all details before confirming</p>
                  <p className="text-xs text-[var(--text-muted)]">Once confirmed, a PDF order estimate will be auto-downloaded.{customerInfo.email ? ` An email confirmation will be sent to ${customerInfo.email}.` : ''}</p></div>
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-left">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-450" />
                <div>
                  <span className="font-bold text-sm">Order Submission Failed</span>
                  <p className="text-xs text-rose-300/80 mt-1">{submitError}</p>
                </div>
              </div>
            )}

            <motion.button onClick={handlePlaceOrder} disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-[#1a1400] font-bold rounded-xl py-4 text-lg shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
              {isSubmitting ? 'Placing Order...' : <><CheckCircle2 size={20} /> Confirm & Place Order</>}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

