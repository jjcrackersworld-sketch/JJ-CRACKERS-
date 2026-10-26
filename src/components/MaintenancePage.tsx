'use client';

import { useEffect, useState } from 'react';

export function MaintenancePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="maintenance-wrapper">
      <style jsx global>{`
        /* Hide everything else when maintenance is active */
        nav, footer, .toast-container {
          display: none !important;
        }
        main {
          padding-top: 0 !important;
          min-height: 100vh !important;
        }

        .maintenance-wrapper {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }

        /* Animated gradient background */
        .maintenance-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 140, 0, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255, 69, 0, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255, 200, 0, 0.08) 0%, transparent 50%);
          animation: bgPulse 6s ease-in-out infinite;
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* Sparkle particles */
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ffb347;
          animation: sparkleFloat linear infinite;
          opacity: 0;
        }

        .sparkle:nth-child(1) { left: 10%; animation-duration: 4s; animation-delay: 0s; background: #ff8c00; }
        .sparkle:nth-child(2) { left: 20%; animation-duration: 5s; animation-delay: 0.5s; background: #ffd700; }
        .sparkle:nth-child(3) { left: 30%; animation-duration: 3.5s; animation-delay: 1s; background: #ff6347; }
        .sparkle:nth-child(4) { left: 40%; animation-duration: 4.5s; animation-delay: 1.5s; background: #ffb347; }
        .sparkle:nth-child(5) { left: 50%; animation-duration: 3s; animation-delay: 0.3s; background: #ffd700; }
        .sparkle:nth-child(6) { left: 60%; animation-duration: 5.5s; animation-delay: 0.8s; background: #ff8c00; }
        .sparkle:nth-child(7) { left: 70%; animation-duration: 4s; animation-delay: 2s; background: #ff6347; }
        .sparkle:nth-child(8) { left: 80%; animation-duration: 3.5s; animation-delay: 1.2s; background: #ffb347; }
        .sparkle:nth-child(9) { left: 90%; animation-duration: 4.5s; animation-delay: 0.6s; background: #ffd700; }
        .sparkle:nth-child(10) { left: 15%; animation-duration: 5s; animation-delay: 1.8s; background: #ff4500; }
        .sparkle:nth-child(11) { left: 45%; animation-duration: 3.8s; animation-delay: 2.3s; background: #ffa500; }
        .sparkle:nth-child(12) { left: 75%; animation-duration: 4.2s; animation-delay: 0.2s; background: #ffd700; }

        @keyframes sparkleFloat {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
        }

        /* Content */
        .maintenance-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 2rem;
          max-width: 640px;
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? '0' : '30px'});
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Logo */
        .maintenance-logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 2rem;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(135deg, #ff8c00, #ffd700, #ff4500);
          animation: logoGlow 3s ease-in-out infinite;
          box-shadow: 0 0 40px rgba(255, 140, 0, 0.3);
        }

        .maintenance-logo img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: #0a0a0f;
        }

        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(255, 140, 0, 0.3); }
          50% { box-shadow: 0 0 60px rgba(255, 140, 0, 0.5), 0 0 80px rgba(255, 200, 0, 0.2); }
        }

        /* Heading */
        .maintenance-heading {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffd700, #ff8c00, #ff6347, #ffd700);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite;
          line-height: 1.3;
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Subheading */
        .maintenance-sub {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2.5rem;
          line-height: 1.7;
          font-weight: 400;
        }

        .maintenance-sub strong {
          color: #ffd700;
          font-weight: 600;
        }

        /* Divider */
        .maintenance-divider {
          width: 80px;
          height: 3px;
          margin: 0 auto 2.5rem;
          background: linear-gradient(90deg, transparent, #ff8c00, #ffd700, #ff8c00, transparent);
          border-radius: 2px;
        }

        /* Time badge */
        .maintenance-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 140, 0, 0.1);
          border: 1px solid rgba(255, 140, 0, 0.25);
          border-radius: 100px;
          color: #ffb347;
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 2rem;
          animation: badgePulse 2s ease-in-out infinite;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff8c00;
          animation: dotBlink 1.5s ease-in-out infinite;
        }

        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes badgePulse {
          0%, 100% { border-color: rgba(255, 140, 0, 0.25); }
          50% { border-color: rgba(255, 140, 0, 0.5); }
        }

        /* Contact info */
        .maintenance-contact {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .maintenance-contact a {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .maintenance-contact a:hover {
          color: #ffd700;
        }

        .maintenance-contact svg {
          width: 18px;
          height: 18px;
        }

        /* Footer text */
        .maintenance-footer {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.8rem;
          white-space: nowrap;
        }

        /* Cracker burst decoration */
        .cracker-burst {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          opacity: 0.04;
        }

        .cracker-burst-1 {
          top: 10%;
          left: 5%;
          background: radial-gradient(circle, #ff8c00, transparent);
          animation: burstFloat 8s ease-in-out infinite;
        }

        .cracker-burst-2 {
          bottom: 15%;
          right: 8%;
          background: radial-gradient(circle, #ffd700, transparent);
          animation: burstFloat 10s ease-in-out infinite reverse;
        }

        @keyframes burstFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.2); }
        }

        /* Tamil text styling */
        .tamil-text {
          font-size: 0.95rem;
          color: rgba(255, 200, 0, 0.5);
          margin-top: 0.5rem;
          font-style: italic;
        }
      `}</style>

      {/* Background effects */}
      <div className="maintenance-bg" />
      <div className="cracker-burst cracker-burst-1" />
      <div className="cracker-burst-2 cracker-burst" />

      {/* Sparkle particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="sparkle" />
      ))}

      {/* Content */}
      <div className="maintenance-content">
        {/* Logo */}
        <div className="maintenance-logo">
          <img src="/logo/logo.png" alt="JJ Crackers Logo" />
        </div>

        {/* Badge */}
        <div className="maintenance-badge">
          <span className="badge-dot" />
          Under Maintenance
        </div>

        {/* Heading */}
        <h1 className="maintenance-heading">
          We&apos;ll Be Back Soon!
        </h1>

        {/* Divider */}
        <div className="maintenance-divider" />

        {/* Message */}
        <p className="maintenance-sub">
          We&apos;re currently making some improvements to bring you a better
          experience. Our website will be back up and running by{' '}
          <strong>this afternoon</strong>.
          <br />
          Thank you for your patience! 🎆
        </p>

        <p className="tamil-text">
          நாங்கள் விரைவில் திரும்புவோம் — மதியத்திற்குள் இணையதளம் இயங்கும்!
        </p>

        {/* Contact */}
        <div className="maintenance-contact">
          <a href="tel:+917092300252">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +91 70923 00252
          </a>
          <a href="https://wa.me/917092300252" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="maintenance-footer">
        © 2015–2026 JJ Crackers (Jegajothi Crackers) • Sivakasi
      </div>
    </div>
  );
}
