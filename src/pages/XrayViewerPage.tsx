import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function XrayViewerPage() {
  const { t } = useTranslation();
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

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🩻 {t('xrayViewer.title')}</h1>
          <DemoDataBadge />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700">
          ⚠️ {t('xrayViewer.disclaimer')}
        </div>

        {!image ? (
          <button onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center bg-gray-50 border-2 border-gray-300 border-dashed rounded-2xl py-16 hover:bg-gray-100 transition-all">
            <span className="text-5xl mb-3">🩻</span>
            <span className="font-bold text-gray-700 text-lg">{t('xrayViewer.upload')}</span>
            <span className="text-sm text-gray-400 mt-1">Tap to select X-Ray, scan, or medical image</span>
          </button>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {[
                { label: t('xrayViewer.zoomIn'), action: () => setZoom(z => Math.min(z + 0.25, 3)), icon: '🔍+' },
                { label: t('xrayViewer.zoomOut'), action: () => setZoom(z => Math.max(z - 0.25, 0.5)), icon: '🔍-' },
                { label: t('xrayViewer.rotateLeft'), action: () => setRotation(r => r - 90), icon: '↺' },
                { label: t('xrayViewer.rotateRight'), action: () => setRotation(r => r + 90), icon: '↻' },
                { label: t('xrayViewer.reset'), action: () => { setZoom(1); setRotation(0); }, icon: '↺↺' },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  className="bg-gray-800 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-700">
                  {btn.icon}
                </button>
              ))}
              <button onClick={() => fileRef.current?.click()}
                className="bg-sky-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-sky-700">
                📂 Change
              </button>
            </div>

            {/* Image Viewer */}
            <div className="bg-black rounded-2xl overflow-hidden border border-gray-700 flex items-center justify-center min-h-64 mb-4">
              <img
                src={image} alt="Medical image"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s ease' }}
                className="max-w-full max-h-96 object-contain"
              />
            </div>

            {/* Zoom indicator */}
            <div className="flex items-center justify-center gap-3 mb-4 text-sm text-gray-600">
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              <span>Rotation: {rotation}°</span>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">{t('xrayViewer.addNote')}</h3>
              <textarea rows={3} value={note} onChange={e => { setNote(e.target.value); setNoteSaved(false); }}
                placeholder="Add notes about this image (for your reference only)..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none" />
              <button onClick={() => { if (note.trim()) setNoteSaved(true); }}
                className={`mt-2 w-full py-2.5 rounded-xl font-bold text-sm ${noteSaved ? 'bg-green-500 text-white' : 'bg-sky-600 text-white hover:bg-sky-700'}`}>
                {noteSaved ? '✅ Note Saved Locally' : t('xrayViewer.save')}
              </button>
            </div>
          </>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <p className="text-xs text-gray-400 text-center mt-4">{t('xrayViewer.disclaimer')}</p>
      </div>
    </Layout>
  );
}
