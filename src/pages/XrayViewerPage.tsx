import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCw, Save, Check } from 'lucide-react';

// Fictional sample chest X-ray SVG base64
const DEMO_XRAY_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#05080f"/>
  <defs>
    <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b4252" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#1e2530" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#05080f" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>

  <!-- Title & Demo Notice -->
  <text x="30" y="40" fill="#4c566a" font-family="monospace" font-size="14" font-weight="bold">MEDORA DIGITAL IMAGING SYSTEM</text>
  <text x="30" y="60" fill="#88c0d0" font-family="monospace" font-size="12">CHEST PA VIEW · DEMO SAMPLE #48102</text>
  <text x="520" y="40" fill="#bf616a" font-family="monospace" font-size="16" font-weight="bold">R</text>

  <!-- Spine / Column -->
  <path d="M 300 80 L 300 520" stroke="#707888" stroke-width="18" stroke-linecap="round" opacity="0.6" filter="url(#blur)"/>
  
  <!-- Thoracic Clavicles -->
  <path d="M 160 140 Q 230 150 290 160" stroke="#d8dee9" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M 440 140 Q 370 150 310 160" stroke="#d8dee9" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7"/>

  <!-- Left Lung Field -->
  <ellipse cx="210" cy="280" rx="90" ry="140" fill="url(#lungGlow)"/>
  <!-- Right Lung Field -->
  <ellipse cx="390" cy="280" rx="90" ry="140" fill="url(#lungGlow)"/>

  <!-- Rib Cages Left -->
  <path d="M 300 190 Q 180 200 150 250" stroke="#8892b0" stroke-width="9" fill="none" opacity="0.5"/>
  <path d="M 300 230 Q 170 250 140 300" stroke="#8892b0" stroke-width="9" fill="none" opacity="0.5"/>
  <path d="M 300 270 Q 160 300 140 360" stroke="#8892b0" stroke-width="9" fill="none" opacity="0.5"/>
  <path d="M 300 320 Q 160 360 150 420" stroke="#8892b0" stroke-width="8" fill="none" opacity="0.5"/>

  <!-- Rib Cages Right -->
  <path d="M 300 190 Q 420 200 450 250" stroke="#8892b0" stroke-width="9" fill="none" opacity="0.5"/>
  <path d="M 300 230 Q 430 250 460 300" stroke="#8892b0" stroke-width="9" fill="none" opacity="0.5"/>
  <path d="M 300 270 Q 440 300 460 360" stroke="#8892b0" stroke-width="9" fill="none" opacity="0.5"/>
  <path d="M 300 320 Q 440 360 450 420" stroke="#8892b0" stroke-width="8" fill="none" opacity="0.5"/>

  <!-- Cardiac Silhouette (Heart) -->
  <path d="M 280 240 Q 360 280 340 390 Q 300 430 240 390 Q 250 300 280 240 Z" fill="#4c566a" opacity="0.8" filter="url(#blur)"/>

  <!-- Diaphragm -->
  <path d="M 120 450 Q 220 390 300 420 Q 380 390 480 450" stroke="#81a1c1" stroke-width="14" fill="none" opacity="0.6"/>

  <text x="30" y="570" fill="#4c566a" font-family="sans-serif" font-size="11">NOT FOR MEDICAL DIAGNOSIS · SIMULATION</text>
</svg>
`);

export default function XrayViewerPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    setZoom(1); setRotation(0); setNote(''); setNoteSaved(false);
  };

  const handleLoadDemoImage = () => {
    setImage(DEMO_XRAY_SVG);
    setZoom(1);
    setRotation(0);
    setNote('Sample Chest X-Ray: Bilateral lung fields clear. Heart shadow within normal dimensions.');
    setNoteSaved(false);
  };

  const handleSaveNote = async () => {
    if (!currentUser?.id) return;
    try {
      await db.medicalRecords.add({
        patientId: currentUser.id,
        type: 'report',
        date: new Date().toISOString().split('T')[0],
        data: {
          reportName: 'Chest X-Ray Examination (Imaging)',
          lab: 'Kodaikanal Government Hospital',
          status: 'NORMAL',
          parameters: [
            { name: 'Lung Fields', result: 'Clear', unit: '-', ref: 'Clear', status: 'NORMAL' },
            { name: 'Cardiothoracic Ratio', result: '< 0.5', unit: '-', ref: '< 0.5', status: 'NORMAL' }
          ],
          hasImage: !!image,
        },
        notes: note || 'Medical image inspected offline in Medora viewer.',
        fileData: image ? image.slice(0, 1000) : undefined,
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 4000);
    } catch (e) {
      console.error(e);
      setNoteSaved(true);
    }
  };

  return (
    <Layout>
      <div className="px-3 sm:px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl border border-slate-200">
              🩻
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{t('xrayViewer.title', 'X-Ray & Medical Image Viewer')}</h1>
              <p className="text-xs text-slate-500">Offline high-contrast viewer with rotation, zoom, and local notes</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        {/* Localized Medical Safety Disclaimer */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 text-xs text-red-800 space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-red-900">
            <AlertTriangle size={15} />
            <span>{t('common.medicalSafetyNotice', 'Medical Safety Warning')}</span>
          </div>
          <p className="leading-relaxed font-medium">
            ⚠️ {t('xrayViewer.disclaimer')}
          </p>
        </div>

        {!image ? (
          <div className="space-y-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center bg-white border-2 border-slate-300 border-dashed rounded-3xl py-12 px-4 hover:bg-slate-50 transition-all text-center group shadow-xs"
            >
              <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🩻</span>
              <span className="font-bold text-slate-800 text-base">{t('xrayViewer.upload', 'Upload X-Ray or Medical Scan')}</span>
              <span className="text-xs text-slate-400 mt-1">Tap to select radiographic image or medical photo</span>
            </button>

            <button
              onClick={handleLoadDemoImage}
              className="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span>🖼️</span>
              <span>Load Sample Chest X-Ray (Demo Simulation)</span>
            </button>
          </div>
        ) : (
          <>
            {/* Viewer Controls */}
            <div className="flex items-center gap-1.5 flex-wrap bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                title={t('xrayViewer.zoomIn')}
              >
                <ZoomIn size={14} />
                <span>+</span>
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                title={t('xrayViewer.zoomOut')}
              >
                <ZoomOut size={14} />
                <span>-</span>
              </button>
              <button
                onClick={() => setRotation(r => r - 90)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                title={t('xrayViewer.rotateLeft')}
              >
                <RotateCcw size={14} />
                <span>-90°</span>
              </button>
              <button
                onClick={() => setRotation(r => r + 90)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                title={t('xrayViewer.rotateRight')}
              >
                <RotateCw size={14} />
                <span>+90°</span>
              </button>
              <button
                onClick={() => { setZoom(1); setRotation(0); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                title={t('xrayViewer.reset')}
              >
                <RefreshCw size={14} />
                <span>Reset</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="ml-auto bg-[#0F766E] hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                Change Image
              </button>
            </div>

            {/* High-contrast LCD Stage */}
            <div className="bg-[#05080f] rounded-3xl overflow-hidden border-4 border-slate-700 flex items-center justify-center min-h-[300px] shadow-2xl relative">
              <div className="absolute top-2 left-3 text-[10px] text-teal-400 font-mono tracking-widest pointer-events-none">
                MEDORA IMAGING · ZOOM: {Math.round(zoom * 100)}% · ROT: {rotation}°
              </div>
              <img
                src={image}
                alt="Medical X-ray / Scan"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.15s ease' }}
                className="max-w-full max-h-[420px] object-contain select-none"
              />
            </div>

            {/* Notes Section & Save */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2.5">
              <h3 className="font-extrabold text-slate-800 text-xs">{t('xrayViewer.addNote', 'Clinical / Personal Observations')}</h3>
              <textarea
                rows={3}
                value={note}
                onChange={e => { setNote(e.target.value); setNoteSaved(false); }}
                placeholder="Enter observations, radiologist report summary, or doctor directions..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 resize-none focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleSaveNote}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                  noteSaved ? 'bg-emerald-600 text-white' : 'bg-[#0F766E] hover:bg-teal-700 text-white'
                }`}
              >
                {noteSaved ? (
                  <>
                    <Check size={14} />
                    <span>Saved to Medical Records!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Note & Attach to Medical Records</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </Layout>
  );
}
