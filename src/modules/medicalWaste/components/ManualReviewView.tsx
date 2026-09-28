import React, { useState, useEffect } from 'react';
import { db } from '../../../db/db';
import {
  MedicalWasteItemRecord,
  WasteAIPredictionRecord,
  WasteScanRecord,
  ReviewDecision,
  SegregationStream
} from '../types/wasteTypes';
import { INITIAL_AI_CLASSES } from '../ai/model/classes';
import { medicalWasteDbService } from '../services/medicalWasteDbService';

export const ManualReviewView: React.FC<{
  currentUserId: string;
  currentUserName: string;
}> = ({ currentUserId, currentUserName }) => {
  const [pendingItems, setPendingItems] = useState<MedicalWasteItemRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<MedicalWasteItemRecord | null>(null);
  const [prediction, setPrediction] = useState<WasteAIPredictionRecord | null>(null);
  const [scan, setScan] = useState<WasteScanRecord | null>(null);
  const [decision, setDecision] = useState<ReviewDecision>('CORRECT');
  const [correctedCategory, setCorrectedCategory] = useState<string>('');
  const [correctedStream, setCorrectedStream] = useState<SegregationStream>('SHARPS');
  const [correctedObjects, setCorrectedObjects] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    const items = await db.medicalWasteItems
      .filter((i) => i.reviewRequired === true || i.status === 'CLASSIFY')
      .reverse()
      .toArray();
    setPendingItems(items);
    if (items.length > 0) {
      selectItemForReview(items[0]);
    } else {
      setSelectedItem(null);
    }
  };

  const selectItemForReview = async (item: MedicalWasteItemRecord) => {
    setSelectedItem(item);
    setSuccessMessage(null);
    const [pred, sc] = await Promise.all([
      db.wasteAIPredictions.where({ scanId: item.scanId }).first(),
      db.wasteScans.where({ scanId: item.scanId }).first()
    ]);
    setPrediction(pred || null);
    setScan(sc || null);

    setCorrectedCategory(item.category);
    setCorrectedStream(item.currentStream);
    setCorrectedObjects(pred?.detectedObjects?.join(', ') || item.category);
    setDecision('CORRECT');
    setReason('');
  };

  const handleSubmitReview = async () => {
    if (!selectedItem || !prediction) return;
    setSubmitting(true);
    try {
      const reviewId = `REV-${Date.now().toString().slice(-6)}`;
      const objectsList = correctedObjects
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await medicalWasteDbService.submitManualReview({
        reviewId,
        scanId: selectedItem.scanId,
        wasteItemId: selectedItem.wasteItemId,
        reviewerId: currentUserId,
        reviewerName: currentUserName,
        originalPrediction: {
          category: prediction.wasteCategory,
          detectedObjects: prediction.detectedObjects,
          recommendedStream: prediction.recommendedStream,
          confidence: prediction.confidence
        },
        correctedPrediction: {
          category: correctedCategory,
          detectedObjects: objectsList,
          recommendedStream: correctedStream
        },
        decision,
        reason: reason || `Manual clinical verification by ${currentUserName}`,
        timestamp: new Date().toISOString(),
        modelVersion: prediction.modelVersion,
        isTrainingEligible: true
      });

      setSuccessMessage(`✓ Review ${reviewId} successfully recorded and added to labeled training corpus.`);
      await loadPendingReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Medical Waste Manual Review &amp; Data Auditing
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Healthcare staff verify AI predictions, correct misclassifications, and approve quarantine items.
          <strong className="text-teal-900 ml-1">
            Note: Corrections do not instantly modify the production model; they become verified ground truth for future controlled training passes.
          </strong>
        </p>
      </div>

      {pendingItems.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
          <span className="text-3xl">🎉</span>
          <h3 className="text-sm font-black text-slate-800">No Pending Reviews</h3>
          <p className="text-xs text-slate-500">
            All medical waste scans are either clinically verified or have high confidence scores (&ge; 85%).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Queue of Items */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-500">
                Pending Queue ({pendingItems.length})
              </h3>
              <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-full">
                Review Required
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {pendingItems.map((item) => {
                const isSelected = selectedItem?.wasteItemId === item.wasteItemId;
                return (
                  <button
                    key={item.wasteItemId}
                    type="button"
                    onClick={() => selectItemForReview(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {item.wasteItemId}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {item.currentStream}
                      </span>
                    </div>
                    <div className="text-xs font-bold capitalize text-slate-700 mt-1">
                      {item.category.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      📍 {item.locationId} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Review & Correction Form */}
          {selectedItem && (
            <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Reviewing: {selectedItem.wasteItemId}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Scan ID: {selectedItem.scanId} • Location: {selectedItem.locationId}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-xl">
                  Model: {prediction?.modelVersion || 'Unknown'}
                </span>
              </div>

              {/* Original Image and Prediction Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-2xl p-2 flex items-center justify-center min-h-[160px]">
                  {scan?.imageUri ? (
                    <img
                      src={scan.imageUri}
                      alt="Waste capture"
                      className="max-h-48 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs font-bold">No image available</div>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Original AI Prediction</div>
                  <div>
                    <span className="text-slate-500">Category: </span>
                    <strong className="text-slate-900 capitalize">{prediction?.wasteCategory.replace(/_/g, ' ') || 'None'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence: </span>
                    <strong
                      className={
                        (prediction?.confidence || 0) >= 0.85
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }
                    >
                      {Math.round((prediction?.confidence || 0) * 100)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Detected Features: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prediction?.detectedObjects && prediction.detectedObjects.length > 0 ? (
                        prediction.detectedObjects.map((o, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                            {o}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Recommended Stream: </span>
                    <strong className="text-teal-800 font-bold">[{prediction?.recommendedStream || 'UNKNOWN'}]</strong>
                  </div>
                </div>
              </div>

              {/* Reviewer Decision Radio Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  Reviewer Decision:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'CORRECT', label: '✓ Correct', color: 'hover:bg-emerald-50' },
                    { id: 'INCORRECT', label: '✕ Incorrect', color: 'hover:bg-red-50' },
                    { id: 'UNKNOWN', label: '❓ Unknown', color: 'hover:bg-slate-50' },
                    { id: 'SPECIALIST_REQUIRED', label: '⚠️ Specialist Req.', color: 'hover:bg-amber-50' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDecision(opt.id as ReviewDecision)}
                      className={`p-2.5 rounded-2xl border font-bold text-center transition-all ${
                        decision === opt.id
                          ? 'bg-[#0F766E] text-white border-teal-800 shadow-xs'
                          : `bg-white text-slate-700 border-slate-200 ${opt.color}`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Correction Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="font-black text-slate-800">
                  Clinical Classification Corrections (Training Ground Truth):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Corrected Waste Category:
                    </label>
                    <select
                      value={correctedCategory}
                      onChange={(e) => setCorrectedCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    >
                      {INITIAL_AI_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Corrected Segregation Stream:
                    </label>
                    <select
                      value={correctedStream}
                      onChange={(e) => setCorrectedStream(e.target.value as SegregationStream)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                    >
                      <option value="SHARPS">SHARPS (White Puncture-Proof)</option>
                      <option value="INFECTIOUS">INFECTIOUS (Yellow / Red Bag)</option>
                      <option value="PHARMACEUTICAL">PHARMACEUTICAL (Brown / Box)</option>
                      <option value="GENERAL">GENERAL (Black Municipal)</option>
                      <option value="MANUAL_INSPECTION">MANUAL INSPECTION (Quarantine)</option>
                      <option value="UNKNOWN">UNKNOWN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Detected Objects (Comma-separated):
                  </label>
                  <input
                    type="text"
                    value={correctedObjects}
                    onChange={(e) => setCorrectedObjects(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    placeholder="e.g. syringe, needle, glass_vial"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Clinical Notes / Justification:
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    placeholder="e.g. Plastic barrel identified; needle was detached; belongs in yellow plastic stream."
                  />
                </div>
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold">
                  {successMessage}
                </div>
              )}

              {/* Submit Review */}
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full bg-[#0F766E] hover:bg-teal-600 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing Review &amp; Auditing Labeled Data...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Submit Verification &amp; Save Labeled Sample</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
