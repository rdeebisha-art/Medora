import React, { useState, useEffect } from 'react';
import { db } from '../../../db/db';
import {
  MedicalWasteItemRecord,
  WasteContainerRecord,
  CollectionStatus
} from '../types/wasteTypes';
import {
  WORKFLOW_STAGES_ORDER,
  WORKFLOW_STAGE_LABELS,
  getNextWorkflowStatus
} from '../services/collectionWorkflowService';
import { medicalWasteDbService } from '../services/medicalWasteDbService';

export const CollectionWorkflowView: React.FC<{
  currentRole: string;
  onOpenScan: () => void;
}> = ({ currentRole, onOpenScan }) => {
  const [items, setItems] = useState<MedicalWasteItemRecord[]>([]);
  const [containers, setContainers] = useState<WasteContainerRecord[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [qrModalItemId, setQrModalItemId] = useState<string | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [all, conts] = await Promise.all([
      db.medicalWasteItems.reverse().toArray(),
      db.wasteContainers.toArray()
    ]);
    setItems(all);
    setContainers(conts);
    if (conts.length > 0) setSelectedContainerId(conts[0].containerId);
  };

  const handleAdvanceStatus = async (item: MedicalWasteItemRecord) => {
    const nextStatus = getNextWorkflowStatus(item.status);
    if (!nextStatus) return;

    setUpdatingItemId(item.wasteItemId);
    try {
      await medicalWasteDbService.updateItemStatus(
        item.wasteItemId,
        nextStatus,
        { id: 'WORKER-01', name: 'R. Velan (Sanitation Officer)', role: currentRole },
        item.containerId,
        `Workflow transitioned to ${nextStatus}`
      );
      await loadData();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleLinkContainer = async (wasteItemId: string) => {
    if (!selectedContainerId) return;
    await db.medicalWasteItems.where({ wasteItemId }).modify({
      containerId: selectedContainerId,
      updatedAt: new Date().toISOString()
    });
    setQrModalItemId(null);
    await loadData();
  };

  const filteredItems = items.filter((item) => {
    if (selectedStatusFilter === 'ALL') return true;
    return item.status === selectedStatusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Workflow Header & Step Pipeline Summary */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Medical Waste Collection Pipeline
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict 9-stage sequential tracking: SCAN → CLASSIFY → VERIFY → SEGREGATE → COLLECT → PICKUP → IN TRANSIT → RECEIVED → COMPLETED
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenScan}
            className="bg-[#0F766E] hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>📷</span>
            <span>New Waste Scan</span>
          </button>
        </div>

        {/* 9-step Visual Breadcrumbs */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 pt-2">
          {WORKFLOW_STAGES_ORDER.map((stage, idx) => {
            const count = items.filter((i) => i.status === stage).length;
            const isSelected = selectedStatusFilter === stage;
            const info = WORKFLOW_STAGE_LABELS[stage];
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setSelectedStatusFilter(isSelected ? 'ALL' : stage)}
                className={`p-2 rounded-2xl text-center border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-800 text-white border-teal-900 shadow-xs'
                    : count > 0
                    ? 'bg-teal-50/70 border-teal-200 text-teal-950 hover:bg-teal-100'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="text-base mb-0.5">{info.icon}</div>
                <div className="text-[10px] font-black uppercase truncate">{stage}</div>
                <div className="text-[11px] font-black mt-0.5">{count}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Active Medical Waste Consignments ({filteredItems.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              {selectedStatusFilter === 'ALL'
                ? 'Showing all active and completed records'
                : `Filtered by status: ${selectedStatusFilter}`}
            </p>
          </div>

          {selectedStatusFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('ALL')}
              className="text-xs text-teal-700 font-bold hover:underline"
            >
              Clear filter (Show all)
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No medical waste items currently in this workflow status.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const nextStatus = getNextWorkflowStatus(item.status);
              const isUpdating = updatingItemId === item.wasteItemId;
              const stageInfo = WORKFLOW_STAGE_LABELS[item.status];
              const linkedContainer = containers.find((c) => c.containerId === item.containerId);

              return (
                <div key={item.wasteItemId} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  {/* Left: Item Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {item.wasteItemId}
                      </span>
                      <span className="text-xs font-bold capitalize text-slate-800">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: item.currentStream === 'SHARPS' ? '#e0f2fe' : item.currentStream === 'INFECTIOUS' ? '#fef9c3' : item.currentStream === 'PHARMACEUTICAL' ? '#fef3c7' : '#f1f5f9',
                          color: item.currentStream === 'SHARPS' ? '#0369a1' : item.currentStream === 'INFECTIOUS' ? '#854d0e' : item.currentStream === 'PHARMACEUTICAL' ? '#92400e' : '#334155'
                        }}
                      >
                        [{item.currentStream}]
                      </span>
                      {item.syncStatus === 'PENDING_SYNC' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          Pending Sync
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-3 flex-wrap">
                      <span>📍 {item.locationId}</span>
                      <span>⚖️ {item.estimatedWeightKg} kg</span>
                      <span>🕒 {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {item.containerId ? (
                        <span className="text-teal-700 font-bold">
                          📦 Container: {item.containerId} {linkedContainer ? `(${linkedContainer.qrCode})` : ''}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setQrModalItemId(item.wasteItemId)}
                          className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>🔗 Link Barcoded Container</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span className="text-base">{stageInfo.icon}</span>
                      <span className="font-bold">{stageInfo.label}</span>
                      <span className="text-slate-400">—</span>
                      <span className="text-[11px] text-slate-500">{stageInfo.description}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
                    {!item.containerId && (
                      <button
                        type="button"
                        onClick={() => setQrModalItemId(item.wasteItemId)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Link Container
                      </button>
                    )}

                    {nextStatus ? (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleAdvanceStatus(item)}
                        className="px-4 py-2 bg-[#0F766E] hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                      >
                        {isUpdating ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Advancing...</span>
                          </>
                        ) : (
                          <>
                            <span>Advance to {nextStatus}</span>
                            <span>&rarr;</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200">
                        ✓ Completed &amp; Disposed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR / Barcode Container Linking Modal */}
      {qrModalItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Link Container by QR / Barcode
              </h3>
              <button
                type="button"
                onClick={() => setQrModalItemId(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select or scan an authorized bio-container to bind item <strong>{qrModalItemId}</strong> for chain-of-custody tracking.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Authorized Containers:
              </label>
              <select
                value={selectedContainerId}
                onChange={(e) => setSelectedContainerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
              >
                {containers.map((c) => (
                  <option key={c.containerId} value={c.containerId}>
                    [{c.stream}] {c.containerId} (QR: {c.qrCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="font-mono text-xs font-bold text-teal-800">
                Scanned Code: {containers.find((c) => c.containerId === selectedContainerId)?.qrCode}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Ready to link with item metadata and audit log
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQrModalItemId(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLinkContainer(qrModalItemId)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
