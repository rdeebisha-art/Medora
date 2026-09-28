import React from 'react';
import { BiomedicalWasteCommandCenter } from '../components/waste/BiomedicalWasteCommandCenter';
import { MedoraGlobalHeader } from '../components/layout/MedoraGlobalHeader';

export default function BiomedicalWastePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <MedoraGlobalHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <BiomedicalWasteCommandCenter />
      </main>
    </div>
  );
}
