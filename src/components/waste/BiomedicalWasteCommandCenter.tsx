import React, { useState } from 'react';
import { useWasteStore } from '../../store/useWasteStore';
import {
  SmartWasteBin,
  WasteCategory,
  CollectionFleetType,
  PriorityLevel
} from '../../types/waste';
import {
  Trash2,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Truck,
  Activity,
  Zap,
  Flame,
  Thermometer,
  Radio,
  Wifi,
  WifiOff,
  Navigation,
  FileCheck,
  ArrowRight,
  Eye,
  Camera,
  Play,
  Share2,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const BiomedicalWasteCommandCenter: React.FC = () => {
  const {
    bins,
    classifications,
    verificationQueue,
    collectionRequests,
    passports,
    selectedBinId,
    selectedPassportId,
    setSelectedBin,
    setSelectedPassport,
    simulateWasteDrop,
    simulateOverflow,
    simulateAbnormalGas,
    simulateOfflineMode,
    syncBinNow,
    classifyWasteItem,
    verifyQueueItem,
    isolateQueueItem,
    createCollectionRequest,
    advancePassportStage,
    generatePassport,
    lastSimulatedAction
  } = useWasteStore();

  const [activeTab, setActiveTab] = useState<
    'BINS' | 'AI_CLASSIFIER' | 'VERIFICATION' | 'PREDICTION_FLEET' | 'REGIONAL_NETWORK' | 'PASSPORT'
  >('BINS');

  // AI Classification demo inputs
  const [selectedDemoWaste, setSelectedDemoWaste] = useState<{
    name: string;
    category: WasteCategory;
    confidence: number;
    facility: string;
    binAssigned: string;
    icon: string;
  }>({
    name: 'Contaminated Blood Tubing & Gauze',
    category: 'INFECTIOUS',
    confidence: 0.94,
    facility: 'Medora PHC Kodaikanal',
    binAssigned: 'BIN-PHC01-02',
    icon: '🩸'
  });

  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);

  // New Collection Form State
  const [newCollectionFacility, setNewCollectionFacility] = useState('Medora PHC Kodaikanal');
  const [newCollectionCategory, setNewCollectionCategory] = useState<WasteCategory>('INFECTIOUS');
  const [newCollectionWeight, setNewCollectionWeight] = useState(8.4);
  const [newCollectionPriority, setNewCollectionPriority] = useState<PriorityLevel>('P1_CRITICAL');
  const [newCollectionFleet, setNewCollectionFleet] = useState<CollectionFleetType>('SMART_CART');

  const selectedBin = bins.find((b) => b.binId === selectedBinId) || bins[0];
  const selectedPassport = passports.find((p) => p.passportId === selectedPassportId) || passports[0];

  const totalWasteTodayKg = bins.reduce((sum, b) => sum + b.weightKg, 0).toFixed(1);
  const binsNeedingAttention = bins.filter((b) => b.status !== 'NORMAL').length;

  const handleRunAIClassification = async () => {
    setIsClassifying(true);
    setClassificationResult(null);

    setTimeout(async () => {
      const res = await classifyWasteItem(
        selectedDemoWaste.name,
        selectedDemoWaste.category,
        selectedDemoWaste.confidence,
        selectedDemoWaste.facility,
        selectedDemoWaste.binAssigned
      );
      setClassificationResult(res);
      setIsClassifying(false);
    }, 900);
  };

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCollectionRequest(
      newCollectionFacility,
      newCollectionCategory,
      Number(newCollectionWeight),
      newCollectionPriority,
      newCollectionFleet
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-blue-950 border border-teal-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-teal-500/20 text-teal-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-teal-500/30 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5 text-teal-400" />
                Hospital Operational Command
              </span>
              <span className="bg-blue-500/20 text-blue-300 font-bold px-2.5 py-0.5 rounded-full text-xs border border-blue-500/30">
                CPCB & MoHFW Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Biomedical Waste Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time IoT smart bin monitoring, AI optical classification, human safety isolation, predictive collection fleet, and end-to-end digital waste passport chain-of-custody.
            </p>
          </div>

          {/* Action Log Pill */}
          {lastSimulatedAction && (
            <div className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-xl text-xs flex items-center gap-2 max-w-md">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Last System Event</p>
                <p className="text-slate-200 font-medium truncate">{lastSimulatedAction}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Command Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Smart Bins</span>
            <Trash2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white">{bins.length}</span>
            <span className="text-[10px] text-teal-400 ml-1.5 font-semibold">100% Online/2G</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Waste Today</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white">{totalWasteTodayKg}</span>
            <span className="text-xs text-slate-400 ml-1">kg</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Attention Flag</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-black ${binsNeedingAttention > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {binsNeedingAttention}
            </span>
            <span className="text-[10px] text-slate-400 ml-1.5">bins near limit</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Fleet</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white">{collectionRequests.length}</span>
            <span className="text-[10px] text-purple-300 ml-1.5 font-semibold">1 Robot En Route</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verification Queue</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-400">
              {verificationQueue.filter((v) => v.status === 'PENDING').length}
            </span>
            <span className="text-[10px] text-slate-400 ml-1.5">Uncertain Items</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Digital Passports</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400">{passports.length}</span>
            <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">QR Tracked</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { key: 'BINS', label: 'IoT Smart Bins & Telemetry', icon: Trash2 },
          { key: 'AI_CLASSIFIER', label: 'AI Waste Classifier & Safety', icon: Cpu },
          { key: 'VERIFICATION', label: 'Human Verification Queue', icon: ShieldCheck, badge: verificationQueue.filter(v => v.status === 'PENDING').length },
          { key: 'PREDICTION_FLEET', label: 'Predictive Collection & Fleet', icon: Bot },
          { key: 'REGIONAL_NETWORK', label: 'Multi-PHC Route Network', icon: Navigation },
          { key: 'PASSPORT', label: 'Digital Waste Passport (QR)', icon: QrCode }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-teal-700' : 'bg-rose-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: IOT SMART BINS & TELEMETRY */}
      {activeTab === 'BINS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Smart Bins Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-teal-400" />
                Active Smart Biomedical Bins (Digital Twin Grid)
              </h3>
              <span className="text-xs text-slate-400">Click a bin to view telemetry & controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {bins.map((bin) => {
                const isSelected = bin.binId === selectedBinId;
                const fillPercent = bin.fillLevelPercent;
                const isOverflow = fillPercent >= 90 || bin.status === 'OVERFLOW_ALERT';
                const isWarning = fillPercent >= 75 || bin.status === 'COLLECTION_RECOMMENDED';

                // Category color coding
                const catBadge =
                  bin.wasteCategory === 'SHARPS'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : bin.wasteCategory === 'INFECTIOUS'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : bin.wasteCategory === 'PLASTIC'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                return (
                  <div
                    key={bin.binId}
                    onClick={() => setSelectedBin(bin.binId)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                      isSelected
                        ? 'bg-slate-800/95 border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{bin.binId}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${catBadge}`}>
                            {bin.wasteCategory}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{bin.facility}</p>
                        <p className="text-[11px] text-slate-500">{bin.ward}</p>
                      </div>

                      {/* Connectivity Badge */}
                      <div className="flex items-center gap-1 text-[10px]">
                        {bin.connectivity === 'ONLINE' ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                            <Wifi className="w-3 h-3" /> Online
                          </span>
                        ) : bin.connectivity === '2G_LOW_BANDWIDTH' ? (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                            <Radio className="w-3 h-3" /> 2G Sync
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">
                            <WifiOff className="w-3 h-3" /> Offline
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fill Level Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                        <span className="text-slate-300">Fill Level: {bin.fillLevelPercent}%</span>
                        <span className="text-slate-400">{bin.weightKg} / {bin.maxWeightCapacityKg} kg</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverflow
                              ? 'bg-rose-500 animate-pulse'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-teal-500'
                          }`}
                          style={{ width: `${bin.fillLevelPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Sensor Pills */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                        {bin.temperatureC}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Gas: {bin.gasStatus}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                        Bat: {bin.batteryPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Selected Bin Simulator & Telemetry Chart */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-teal-400" />
                    {selectedBin.binId} Telemetry
                  </h3>
                  <p className="text-xs text-slate-400">{selectedBin.facility} — {selectedBin.ward}</p>
                </div>
                <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2 py-0.5 rounded border border-teal-500/30">
                  {selectedBin.wasteCategory}
                </span>
              </div>

              {/* Real-time Telemetry Trend Chart */}
              <div className="space-y-2 mb-5">
                <p className="text-xs font-semibold text-slate-300">Fill Level & Weight Trend (Today)</p>
                <div className="h-40 w-full bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedBin.historicalFill}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="fillPercent" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.2} name="Fill %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interactive Simulation Controls */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Interactive Sensor Simulation
                </p>
                <p className="text-[11px] text-slate-400">
                  Trigger hardware events to test automated A2A reactive workflows.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => simulateWasteDrop(selectedBin.binId, 0.8)}
                    className="p-2.5 bg-slate-800 hover:bg-teal-600/30 hover:border-teal-500/50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-teal-400" />
                    Drop Waste (+0.8kg)
                  </button>

                  <button
                    onClick={() => simulateOverflow(selectedBin.binId)}
                    className="p-2.5 bg-slate-800 hover:bg-rose-600/30 hover:border-rose-500/50 text-rose-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Simulate Overflow (96%)
                  </button>

                  <button
                    onClick={() => simulateAbnormalGas(selectedBin.binId)}
                    className="p-2.5 bg-slate-800 hover:bg-amber-600/30 hover:border-amber-500/50 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Hazard Gas Alert
                  </button>

                  <button
                    onClick={() =>
                      selectedBin.connectivity === 'OFFLINE'
                        ? syncBinNow(selectedBin.binId)
                        : simulateOfflineMode(selectedBin.binId)
                    }
                    className="p-2.5 bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/50 text-blue-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {selectedBin.connectivity === 'OFFLINE' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        Sync Bin Now
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                        Simulate Offline
                      </>
                    )}
                  </button>
                </div>

                {/* Generate Passport Direct Action */}
                <button
                  onClick={() => {
                    const pass = generatePassport(
                      selectedBin.facility,
                      selectedBin.wasteCategory,
                      selectedBin.weightKg,
                      selectedBin.binId
                    );
                    setActiveTab('PASSPORT');
                  }}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  Generate Digital Passport for Batch ({selectedBin.weightKg} kg)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI WASTE CLASSIFIER & SAFETY BOUNDARY */}
      {activeTab === 'AI_CLASSIFIER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Classification Chamber */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-teal-400" />
                    Optical AI Waste Classification & Safety Decision
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Multi-spectral camera frame input → Deep Learning Classifier → Safety Verification Agent
                  </p>
                </div>
                <span className="bg-teal-500/20 text-teal-300 font-bold px-2.5 py-1 rounded text-xs border border-teal-500/30">
                  AI Edge Model v4.2
                </span>
              </div>

              {/* Sample Waste Items Selector */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Demo Clinical Waste Sample:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      name: 'Contaminated Blood Tubing & Gauze',
                      category: 'INFECTIOUS' as const,
                      confidence: 0.94,
                      facility: 'Medora PHC Kodaikanal',
                      binAssigned: 'BIN-PHC01-02',
                      icon: '🩸',
                      desc: 'High confidence (94%) -> Auto Segregate'
                    },
                    {
                      name: 'Used Disposable Syringe with Fixed Needle',
                      category: 'SHARPS' as const,
                      confidence: 0.98,
                      facility: 'Medora PHC Kodaikanal',
                      binAssigned: 'BIN-PHC01-01',
                      icon: '💉',
                      desc: 'High confidence (98%) -> Auto Sharps Lock'
                    },
                    {
                      name: 'Complex Multi-layer Pouch & Glass Ampoule mix',
                      category: 'INFECTIOUS' as const,
                      confidence: 0.54,
                      facility: 'Medora Sub-Center Vilpatti',
                      binAssigned: 'ISOLATION_CHAMBER_01',
                      icon: '⚠️',
                      desc: 'Low confidence (54%) -> ISOLATE & Human Verification'
                    },
                    {
                      name: 'Rigid Normal Saline Bottle (Polypropylene)',
                      category: 'PLASTIC' as const,
                      confidence: 0.96,
                      facility: 'Medora PHC Poombarai',
                      binAssigned: 'BIN-PHC03-05',
                      icon: '🧴',
                      desc: 'High confidence (96%) -> Recyclable Blue Bin'
                    }
                  ].map((sample, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDemoWaste(sample)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDemoWaste.name === sample.name
                          ? 'bg-teal-950/50 border-teal-500 shadow-md'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sample.icon}</span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{sample.name}</p>
                          <p className="text-[10px] text-slate-400">{sample.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Classification Trigger */}
              <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-2xl">
                    {selectedDemoWaste.icon}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ready for Optical Scan</p>
                    <p className="text-sm font-bold text-white">{selectedDemoWaste.name}</p>
                    <p className="text-[11px] text-teal-400">Source: {selectedDemoWaste.facility}</p>
                  </div>
                </div>

                <button
                  disabled={isClassifying}
                  onClick={handleRunAIClassification}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                >
                  {isClassifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Optical Frame...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run AI Waste Classification
                    </>
                  )}
                </button>
              </div>

              {/* Result Presentation */}
              {classificationResult && (
                <div className="mt-5 p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      AI Decision Generated
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {classificationResult.wasteId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Detected Class</p>
                      <p className="font-black text-sm text-white mt-0.5">{classificationResult.predictedCategory}</p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">AI Confidence</p>
                      <p className="font-black text-sm text-teal-300 mt-0.5">
                        {Math.round(classificationResult.confidenceScore * 100)}%
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Safety Decision</p>
                      <p className={`font-black text-xs mt-0.5 ${
                        classificationResult.decision === 'AUTOMATIC_SEGREGATION'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}>
                        {classificationResult.decision.replace('_', ' ')}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Assigned Chamber</p>
                      <p className="font-black text-xs text-white mt-0.5">{classificationResult.binAssigned}</p>
                    </div>
                  </div>

                  {classificationResult.decision === 'ISOLATE_HUMAN_VERIFY' ? (
                    <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Confidence below threshold (75%). Item routed to Isolation & Human Verification Queue.</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('VERIFICATION')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Open Queue →
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Autonomous high confidence verified. Bin lid unlocked for touchless deposition.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Recent AI Classification Log */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Live Classification Stream
              </h3>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                {classifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-teal-400 font-bold">{item.wasteId}</span>
                      <span className="text-[10px] text-slate-400">{item.detectedAt}</span>
                    </div>
                    <p className="font-semibold text-slate-200">{item.itemName}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700 text-[10px]">
                      <span className="text-slate-400">Class: <strong className="text-white">{item.predictedCategory}</strong></span>
                      <span className="text-teal-300 font-bold">{Math.round(item.confidenceScore * 100)}% Conf.</span>
                      <span className={item.safetyStatus === 'VERIFIED_AUTO' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {item.safetyStatus === 'VERIFIED_AUTO' ? 'Auto Verified' : 'Needs Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HUMAN VERIFICATION QUEUE */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Waste Human Verification Queue (Safety Isolation)
              </h3>
              <p className="text-xs text-slate-400">
                AI safety boundaries isolate uncertain / high-risk items here for medical officer validation.
              </p>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              {verificationQueue.filter((v) => v.status === 'PENDING').length} Items Pending Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verificationQueue.map((item) => (
              <div
                key={item.verificationId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-bold">{item.verificationId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        item.riskLevel === 'HIGH' || item.riskLevel === 'BIOHAZARD'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.riskLevel} Risk
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">{item.itemName}</h4>
                    <p className="text-xs text-slate-400">{item.facility} • {item.timestamp}</p>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300'
                      : item.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>AI Predicted Category: <strong className="text-slate-200">{item.predictedCategory}</strong></span>
                    <span>Confidence: <strong className="text-amber-400">{Math.round(item.confidenceScore * 100)}%</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">"{item.operatorNotes}"</p>
                </div>

                {item.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => verifyQueueItem(item.verificationId, item.predictedCategory, 'Verified as Predicted')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify ({item.predictedCategory})
                    </button>

                    <button
                      onClick={() => verifyQueueItem(item.verificationId, 'SHARPS', 'Reclassified to Puncture Sharps')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Reclassify Sharps
                    </button>

                    <button
                      onClick={() => isolateQueueItem(item.verificationId, 'High risk chemical hazard locked')}
                      className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 rounded-xl text-xs font-semibold"
                    >
                      Isolate Hazard
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PREDICTIVE COLLECTION & FLEET (ROBOT / SMART CART) */}
      {activeTab === 'PREDICTION_FLEET' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Predictive Engine & Fleet Requests */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-teal-400" />
                    Predictive Collection & Autonomous Fleet Dispatch
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Forecast capacity limits using telemetry surge models to prevent hazardous hospital overflows.
                  </p>
                </div>
                <span className="bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded text-xs border border-teal-500/30">
                  Level 3 Autonomous Ready
                </span>
              </div>

              {/* 3 Operational Levels Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                    <Truck className="w-4 h-4 text-blue-400" />
                    LEVEL 1: Manual Fleet
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Regional transit van with scheduled milk-run pickups across distant rural sub-centers.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                    <Zap className="w-4 h-4 text-teal-400" />
                    LEVEL 2: Smart Cart / Trolley
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Motorized sensor-guided trolley with tare-weight digital scale and automated manifest signing.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Bot className="w-4 h-4 text-purple-400" />
                    LEVEL 3: Autonomous Robot
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Self-navigating AGV rover (Medora-Robo 01) for touchless hospital OT and ICU biohazard retrieval.
                  </p>
                </div>
              </div>

              {/* Active Collection Requests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Active Collection Work Orders & Fleet Status:
                </h4>

                <div className="space-y-2.5">
                  {collectionRequests.map((req) => (
                    <div
                      key={req.requestId}
                      className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-teal-400 font-bold">{req.requestId}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            req.priority === 'P0_EMERGENCY'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {req.priority.replace('_', ' ')}
                          </span>
                          <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
                            {req.assignedFleet.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-bold text-white text-sm">{req.batchId} ({req.wasteCategory})</p>
                        <p className="text-slate-400 text-[11px]">{req.sourceFacility} → {req.destinationFacility}</p>
                        <p className="text-[11px] text-teal-300">Assigned: {req.collectorName} (ETA: {req.etaMinutes} mins)</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'IN_TRANSIT'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                            : req.status === 'ASSIGNED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">{req.estimatedWeightKg} kg tare</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Create Work Order Form */}
          <div className="space-y-4">
            <form onSubmit={handleCreateCollectionSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" />
                Dispatch Collection Request
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pickup Facility / Ward</label>
                  <select
                    value={newCollectionFacility}
                    onChange={(e) => setNewCollectionFacility(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Medora PHC Kodaikanal (Labor Room)">Medora PHC Kodaikanal (Labor Room)</option>
                    <option value="Medora Sub-Center Vilpatti (OPD)">Medora Sub-Center Vilpatti (OPD)</option>
                    <option value="Medora PHC Poombarai (Dental)">Medora PHC Poombarai (Dental)</option>
                    <option value="District Hospital Dindigul Central (ICU)">District Hospital Dindigul (ICU)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Waste Category</label>
                    <select
                      value={newCollectionCategory}
                      onChange={(e) => setNewCollectionCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="INFECTIOUS">Infectious</option>
                      <option value="SHARPS">Sharps</option>
                      <option value="PLASTIC">Plastic</option>
                      <option value="GLASS">Glass</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Est. Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCollectionWeight}
                      onChange={(e) => setNewCollectionWeight(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                    <select
                      value={newCollectionPriority}
                      onChange={(e) => setNewCollectionPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="P0_EMERGENCY">P0 - Emergency</option>
                      <option value="P1_CRITICAL">P1 - Critical</option>
                      <option value="P2_NORMAL">P2 - Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Assigned Fleet</label>
                    <select
                      value={newCollectionFleet}
                      onChange={(e) => setNewCollectionFleet(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="AUTONOMOUS_ROBOT">Level 3: Robot Rover</option>
                      <option value="SMART_CART">Level 2: Smart Cart</option>
                      <option value="MANUAL">Level 1: Manual Transit</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  Dispatch Fleet Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-PHC REGIONAL ROUTE NETWORK */}
      {activeTab === 'REGIONAL_NETWORK' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-teal-400" />
                Regional Multi-PHC Biomedical Waste Coordination
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Shared regional transit van and CBWTF incinerator logistics routing for hilly / rural districts.
              </p>
            </div>
            <span className="bg-teal-500/20 text-teal-300 font-bold px-3 py-1 rounded text-xs border border-teal-500/30">
              4 Facilities Linked
            </span>
          </div>

          {/* Route Schematic Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              {
                id: 'PHC-01',
                name: 'Medora PHC Kodaikanal',
                waste: '13.0 kg',
                bins: '2 Active',
                status: 'Collection En Route',
                color: 'teal'
              },
              {
                id: 'PHC-02',
                name: 'Sub-Center Vilpatti',
                waste: '6.0 kg',
                bins: '2 Active',
                status: 'Scheduled 08:30',
                color: 'blue'
              },
              {
                id: 'PHC-03',
                name: 'PHC Poombarai',
                waste: '3.8 kg',
                bins: '1 Active',
                status: 'Normal',
                color: 'emerald'
              },
              {
                id: 'CBWTF-DH',
                name: 'Central CBWTF Dindigul',
                waste: '14.0 kg Disposed',
                bins: 'Incinerator & Autoclave',
                status: 'Destination Hub',
                color: 'purple'
              }
            ].map((node, idx) => (
              <div
                key={node.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-teal-400 font-bold">{node.id}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold">
                    {node.bins}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{node.name}</h4>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Waste: <strong className="text-white">{node.waste}</strong></span>
                  <span className="text-teal-300 font-semibold">{node.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DIGITAL WASTE PASSPORT (QR & CHAIN OF CUSTODY) */}
      {activeTab === 'PASSPORT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Passports List */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-400" />
                Tracked Waste Passports
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                {passports.map((pass) => (
                  <div
                    key={pass.passportId}
                    onClick={() => setSelectedPassport(pass.passportId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                      pass.passportId === selectedPassport.passportId
                        ? 'bg-slate-800 border-teal-500 shadow-md ring-1 ring-teal-500'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-400">{pass.passportId}</span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30 uppercase">
                        {pass.wasteCategory}
                      </span>
                    </div>
                    <p className="font-bold text-white">{pass.sourceFacility}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>Weight: <strong className="text-slate-200">{pass.weightKg} kg</strong></span>
                      <span className="text-emerald-400 font-semibold">{pass.complianceStatus.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 2 Cols: Digital Passport Manifest & Chain of Custody */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-teal-400">
                      {selectedPassport.passportId}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Digital Chain of Custody Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Origin: {selectedPassport.sourceFacility} ({selectedPassport.binOrigin})
                  </p>
                </div>

                {/* QR Code Graphic */}
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
                  <div className="w-16 h-16 bg-white rounded-lg p-1 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-950" />
                  </div>
                  <div className="text-[10px] space-y-0.5">
                    <p className="font-bold text-white">QR Code Passport</p>
                    <p className="text-slate-400 font-mono">CPCB Barcode Verified</p>
                    <p className="text-teal-400 font-bold">{selectedPassport.weightKg} kg {selectedPassport.wasteCategory}</p>
                  </div>
                </div>
              </div>

              {/* 6-Step Chain of Custody Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    End-to-End Traceability Lifecycle:
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => advancePassportStage(selectedPassport.passportId, 'COLLECTION')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700"
                    >
                      Advance Collection
                    </button>
                    <button
                      onClick={() => advancePassportStage(selectedPassport.passportId, 'TRANSPORT')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-700"
                    >
                      Advance Transport
                    </button>
                    <button
                      onClick={() => advancePassportStage(selectedPassport.passportId, 'DISPOSAL')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg"
                    >
                      Complete Disposal
                    </button>
                  </div>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                  {selectedPassport.chainOfCustody.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-slate-900'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-slate-900 animate-pulse'
                          : 'bg-slate-800 text-slate-500 ring-4 ring-slate-900'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{step.step}</span>
                          <span className="text-[11px] text-teal-400 font-semibold">{step.timestamp}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">Actor: <strong className="text-slate-200">{step.actor}</strong> ({step.facility})</p>
                        <p className="text-slate-300 text-xs">{step.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
