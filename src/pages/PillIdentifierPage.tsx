import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { PillIdentifier } from '../components/PillIdentifier';
import { ArrowLeft, Pill, ShieldCheck, Heart } from 'lucide-react';

export default function PillIdentifierPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0F766E] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span>Medicines</span>
            <span>/</span>
            <span className="text-[#0F766E] font-bold">Pill Identifier</span>
          </div>
        </div>

        {/* Pill Identifier Component */}
        <PillIdentifier />

        {/* Regulatory & Safety Footer */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-slate-800">Local Pharmacopoeia Cross-Reference Standard</h4>
            <p className="leading-relaxed text-slate-600">
              The Pill Identifier operates 100% offline using an embedded medical database based on Indian Pharmacopoeia (IP),
              WHO Essential Medicines, and standard primary health centre clinical guidelines. Always confirm with an accredited
              pharmacist or doctor before consuming unlabelled or unknown medications.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
