import React from 'react';

interface MedicalBackgroundProps {
  children: React.ReactNode;
}

/**
 * Global Medora Clinic Medical Background
 * - Clean, modern healthcare clinic & reception atmosphere
 * - Soft teal and deep medical blue hues with warm ambient lighting
 * - Calm, muted, and slightly blurred overlay ensuring maximum text readability across all 6 languages
 * - Fixed position: seamless, zero white flashes during route transitions
 * - Offline-cached local asset (/medora-clinic-bg.jpg)
 */
export const MedicalHospitalBackground: React.FC<MedicalBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#0F172A]">
      {/* 
        Persistent Modern Medical Clinic Background Layer
        - Local asset cached for full offline PWA capability
        - Does not reload on page navigation
        - Covers viewport without distortion
      */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(13, 59, 74, 0.38) 0%, rgba(15, 118, 110, 0.28) 45%, rgba(240, 253, 250, 0.62) 100%),
            url('/medora-clinic-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(1.5px)',
          transform: 'scale(1.02)', // prevents edge blur clipping
        }}
        aria-hidden="true"
      />

      {/* Soft Clinic Ambiance Overlay with subtle medical gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0F766E]/10 via-transparent to-[#0F172A]/15 backdrop-brightness-[0.97]"
        aria-hidden="true"
      />

      {/* Subtle ECG Heartbeat Pulse / Medical Symbol Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <svg 
          viewBox="0 0 1200 300" 
          className="w-full h-auto stroke-[#0F766E] fill-none" 
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M0,150 L350,150 L380,110 L410,190 L440,80 L480,220 L510,130 L530,165 L550,150 L1200,150" />
        </svg>
      </div>

      {/* Main Foreground Content (Scrollable above persistent background) */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

export const MedicalBackground = MedicalHospitalBackground;
export default MedicalHospitalBackground;
