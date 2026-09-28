import { create } from 'zustand';
import {
  SmartWasteBin,
  WasteClassificationItem,
  WasteVerificationQueueItem,
  WasteCollectionRequest,
  DigitalWastePassport,
  A2AMessage,
  WasteCategory,
  CollectionFleetType,
  PriorityLevel
} from '../types/waste';
import {
  initialSmartBins,
  initialWasteClassifications,
  initialVerificationQueue,
  initialCollectionRequests,
  initialWastePassports,
  initialA2AMessages
} from '../data/wasteDemoData';

interface WasteStoreState {
  bins: SmartWasteBin[];
  classifications: WasteClassificationItem[];
  verificationQueue: WasteVerificationQueueItem[];
  collectionRequests: WasteCollectionRequest[];
  passports: DigitalWastePassport[];
  a2aMessages: A2AMessage[];
  selectedBinId: string | null;
  selectedPassportId: string | null;
  activeFleetFilter: 'ALL' | CollectionFleetType;
  isSimulatingDetection: boolean;
  lastSimulatedAction: string | null;

  // Actions
  setSelectedBin: (binId: string | null) => void;
  setSelectedPassport: (passportId: string | null) => void;
  setFleetFilter: (filter: 'ALL' | CollectionFleetType) => void;

  // Bin Simulation Actions
  simulateWasteDrop: (binId: string, addedWeightKg?: number) => void;
  simulateOverflow: (binId: string) => void;
  simulateAbnormalGas: (binId: string) => void;
  simulateOfflineMode: (binId: string) => void;
  syncBinNow: (binId: string) => void;

  // AI Classification Actions
  classifyWasteItem: (
    itemName: string,
    category: WasteCategory,
    confidence: number,
    facility: string,
    binAssigned: string
  ) => Promise<WasteClassificationItem>;

  // Human Verification Queue Actions
  verifyQueueItem: (verificationId: string, approvedCategory: WasteCategory, notes?: string) => void;
  isolateQueueItem: (verificationId: string, notes?: string) => void;

  // Collection Actions
  createCollectionRequest: (
    sourceFacility: string,
    category: WasteCategory,
    weightKg: number,
    priority: PriorityLevel,
    fleetType: CollectionFleetType
  ) => WasteCollectionRequest;
  updateCollectionStatus: (
    requestId: string,
    newStatus: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'COLLECTED' | 'DISPOSED'
  ) => void;

  // Waste Passport Actions
  generatePassport: (
    facility: string,
    category: WasteCategory,
    weightKg: number,
    binId: string
  ) => DigitalWastePassport;
  advancePassportStage: (passportId: string, nextStage: 'COLLECTION' | 'TRANSPORT' | 'HANDOVER' | 'DISPOSAL') => void;

  // A2A Messaging Actions
  dispatchA2AMessage: (
    sender: string,
    recipient: string,
    action: string,
    category: 'HEALTHCARE' | 'BIOMEDICAL_WASTE' | 'EMERGENCY' | 'SYNC',
    input: Record<string, any>,
    output: Record<string, any>,
    confidence?: number
  ) => void;

  // Reset to initial
  resetWasteData: () => void;
}

export const useWasteStore = create<WasteStoreState>((set, get) => ({
  bins: initialSmartBins,
  classifications: initialWasteClassifications,
  verificationQueue: initialVerificationQueue,
  collectionRequests: initialCollectionRequests,
  passports: initialWastePassports,
  a2aMessages: initialA2AMessages,
  selectedBinId: initialSmartBins[0]?.binId || null,
  selectedPassportId: initialWastePassports[0]?.passportId || null,
  activeFleetFilter: 'ALL',
  isSimulatingDetection: false,
  lastSimulatedAction: null,

  setSelectedBin: (binId) => set({ selectedBinId: binId }),
  setSelectedPassport: (passportId) => set({ selectedPassportId: passportId }),
  setFleetFilter: (filter) => set({ activeFleetFilter: filter }),

  simulateWasteDrop: (binId, addedWeightKg = 0.8) => {
    set((state) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedBins = state.bins.map((bin) => {
        if (bin.binId !== binId) return bin;
        const newWeight = Math.min(bin.maxWeightCapacityKg, +(bin.weightKg + addedWeightKg).toFixed(1));
        const newFill = Math.min(100, Math.round((newWeight / bin.maxWeightCapacityKg) * 100));
        const status: SmartWasteBin['status'] = newFill >= 90 ? 'OVERFLOW_ALERT' : newFill >= 75 ? 'COLLECTION_RECOMMENDED' : 'NORMAL';

        return {
          ...bin,
          weightKg: newWeight,
          fillLevelPercent: newFill,
          status,
          lastSyncTime: 'Just now',
          historicalFill: [...bin.historicalFill.slice(-3), { timestamp: now, fillPercent: newFill, weightKg: newWeight }]
        };
      });

      const targetBin = updatedBins.find((b) => b.binId === binId);
      if (targetBin && targetBin.fillLevelPercent >= 75) {
        // Automatically dispatch A2A prediction message
        setTimeout(() => {
          get().dispatchA2AMessage(
            'IoT Monitoring Agent',
            'Prediction Agent',
            'CAPACITY_THRESHOLD_ALERT',
            'BIOMEDICAL_WASTE',
            { binId, fillLevel: targetBin.fillLevelPercent, weightKg: targetBin.weightKg },
            { status: 'COLLECTION_TRIGGERED', estimatedHoursRemaining: 2.5 }
          );
        }, 600);
      }

      return {
        bins: updatedBins,
        lastSimulatedAction: `Waste deposited into ${binId} (+${addedWeightKg}kg)`
      };
    });
  },

  simulateOverflow: (binId) => {
    set((state) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedBins = state.bins.map((bin) => {
        if (bin.binId !== binId) return bin;
        return {
          ...bin,
          fillLevelPercent: 96,
          weightKg: +(bin.maxWeightCapacityKg * 0.96).toFixed(1),
          status: 'OVERFLOW_ALERT' as const,
          lastSyncTime: 'Just now',
          historicalFill: [...bin.historicalFill.slice(-3), { timestamp: now, fillPercent: 96, weightKg: +(bin.maxWeightCapacityKg * 0.96).toFixed(1) }]
        };
      });

      setTimeout(() => {
        get().dispatchA2AMessage(
          'IoT Monitoring Agent',
          'Emergency Agent',
          'CRITICAL_OVERFLOW_DETECTED',
          'BIOMEDICAL_WASTE',
          { binId, fillLevel: 96 },
          { priority: 'P0_EMERGENCY', alertBroadcast: true }
        );
      }, 500);

      return {
        bins: updatedBins,
        lastSimulatedAction: `Critical Overflow simulated for ${binId}`
      };
    });
  },

  simulateAbnormalGas: (binId) => {
    set((state) => {
      const updatedBins = state.bins.map((bin) => {
        if (bin.binId !== binId) return bin;
        return {
          ...bin,
          gasStatus: 'HAZARDOUS_ALERT' as const,
          temperatureC: 28.5,
          status: 'HAZARD_ISOLATED' as const,
          lastSyncTime: 'Just now'
        };
      });

      setTimeout(() => {
        get().dispatchA2AMessage(
          'IoT Monitoring Agent',
          'Safety Verification Agent',
          'HAZARDOUS_GAS_ALERT',
          'BIOMEDICAL_WASTE',
          { binId, gasLevel: 'HAZARDOUS_VOC_ELEVATED', temperature: 28.5 },
          { action: 'LOCK_BIN_LID', notifyInfectionControl: true }
        );
      }, 400);

      return {
        bins: updatedBins,
        lastSimulatedAction: `Hazardous VOC Gas condition simulated for ${binId}`
      };
    });
  },

  simulateOfflineMode: (binId) => {
    set((state) => ({
      bins: state.bins.map((b) =>
        b.binId === binId ? { ...b, connectivity: 'OFFLINE', lastSyncTime: 'Saved Locally (Active)' } : b
      ),
      lastSimulatedAction: `Bin ${binId} switched to Offline Mode`
    }));
  },

  syncBinNow: (binId) => {
    set((state) => ({
      bins: state.bins.map((b) =>
        b.binId === binId ? { ...b, connectivity: 'ONLINE', lastSyncTime: 'Just now (Synced)' } : b
      ),
      lastSimulatedAction: `Bin ${binId} synchronized with Medora Central Node`
    }));
  },

  classifyWasteItem: async (itemName, category, confidence, facility, binAssigned) => {
    const isAuto = confidence >= 0.75;
    const wasteId = `MWP-2026-00${Math.floor(100 + Math.random() * 900)}`;

    const newItem: WasteClassificationItem = {
      id: Date.now(),
      wasteId,
      itemName,
      predictedCategory: category,
      confidenceScore: confidence,
      decision: isAuto ? 'AUTOMATIC_SEGREGATION' : 'ISOLATE_HUMAN_VERIFY',
      safetyStatus: isAuto ? 'VERIFIED_AUTO' : 'REQUIRES_HUMAN_VERIFICATION',
      detectedAt: 'Just now',
      facility,
      binAssigned: isAuto ? binAssigned : 'ISOLATION_CHAMBER_01',
      verifiedBy: isAuto ? 'AI Safety Agent (Autonomous)' : undefined,
      notes: isAuto ? 'Autonomous high-confidence segregation' : `Confidence (${Math.round(confidence * 100)}%) below auto-threshold. Isolated for verification.`
    };

    set((state) => {
      const updatedClassifications = [newItem, ...state.classifications];
      let updatedQueue = state.verificationQueue;

      if (!isAuto) {
        const queueItem: WasteVerificationQueueItem = {
          id: Date.now(),
          verificationId: `VER-2026-${Math.floor(100 + Math.random() * 900)}`,
          wasteId,
          itemName,
          predictedCategory: category,
          confidenceScore: confidence,
          riskLevel: category === 'SHARPS' || category === 'INFECTIOUS' ? 'HIGH' : 'MEDIUM',
          facility,
          timestamp: 'Just now',
          status: 'PENDING',
          operatorNotes: 'AI safety boundary flagged low confidence. Human verification required before disposal.'
        };
        updatedQueue = [queueItem, ...updatedQueue];
      }

      return {
        classifications: updatedClassifications,
        verificationQueue: updatedQueue,
        lastSimulatedAction: `AI classified ${itemName} -> ${category} (${Math.round(confidence * 100)}%)`
      };
    });

    // A2A Agent communication
    get().dispatchA2AMessage(
      'Waste Classification Agent',
      'Safety Verification Agent',
      'NEW_CLASSIFICATION_INSPECT',
      'BIOMEDICAL_WASTE',
      { itemName, category, confidence },
      { decision: isAuto ? 'AUTO_SEGREGATE' : 'ISOLATE_FOR_HUMAN', safetyScore: confidence },
      confidence
    );

    return newItem;
  },

  verifyQueueItem: (verificationId, approvedCategory, notes) => {
    set((state) => {
      const target = state.verificationQueue.find((v) => v.verificationId === verificationId);
      const updatedQueue = state.verificationQueue.map((v) =>
        v.verificationId === verificationId
          ? {
              ...v,
              status: 'VERIFIED' as const,
              verifiedCategory: approvedCategory,
              operatorNotes: notes || 'Verified by Chief Infection Officer'
            }
          : v
      );

      const updatedClassifications = state.classifications.map((c) =>
        c.wasteId === target?.wasteId
          ? {
              ...c,
              safetyStatus: 'VERIFIED_AUTO' as const,
              decision: 'AUTOMATIC_SEGREGATION' as const,
              verifiedBy: 'Human Officer Verified',
              predictedCategory: approvedCategory
            }
          : c
      );

      return {
        verificationQueue: updatedQueue,
        classifications: updatedClassifications,
        lastSimulatedAction: `Waste ${target?.wasteId} verified as ${approvedCategory}`
      };
    });

    get().dispatchA2AMessage(
      'Safety Verification Agent',
      'IoT Monitoring Agent',
      'HUMAN_VERIFICATION_COMPLETE',
      'BIOMEDICAL_WASTE',
      { verificationId, approvedCategory },
      { status: 'ROUTE_TO_CORRECT_BIN', safetyConfirmed: true }
    );
  },

  isolateQueueItem: (verificationId, notes) => {
    set((state) => ({
      verificationQueue: state.verificationQueue.map((v) =>
        v.verificationId === verificationId
          ? { ...v, status: 'ISOLATED' as const, operatorNotes: notes || 'Item segregated into hazardous isolation chamber.' }
          : v
      ),
      lastSimulatedAction: `Verification ${verificationId} flagged as ISOLATED`
    }));
  },

  createCollectionRequest: (sourceFacility, category, weightKg, priority, fleetType) => {
    const newReq: WasteCollectionRequest = {
      id: Date.now(),
      requestId: `REQ-COL-00${Math.floor(100 + Math.random() * 900)}`,
      batchId: `BATCH-2026-${category.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      sourceFacility,
      destinationFacility: 'Central CBWTF Dindigul',
      wasteCategory: category,
      estimatedWeightKg: weightKg,
      priority,
      status: 'ASSIGNED',
      assignedFleet: fleetType,
      collectorName:
        fleetType === 'AUTONOMOUS_ROBOT'
          ? 'Autonomous AGV Rover Medora-Robo 01'
          : fleetType === 'SMART_CART'
          ? 'Smart Cart Unit Alpha-02'
          : 'Regional Waste Transit Van #4',
      etaMinutes: fleetType === 'AUTONOMOUS_ROBOT' ? 8 : fleetType === 'SMART_CART' ? 20 : 60,
      scheduledAt: 'Just now'
    };

    set((state) => ({
      collectionRequests: [newReq, ...state.collectionRequests],
      lastSimulatedAction: `Collection scheduled: ${newReq.batchId} (${fleetType})`
    }));

    get().dispatchA2AMessage(
      'Prediction Agent',
      'Collection Agent',
      'DISPATCH_COLLECTION_FLEET',
      'BIOMEDICAL_WASTE',
      { batchId: newReq.batchId, weightKg, fleetType, priority },
      { requestId: newReq.requestId, etaMinutes: newReq.etaMinutes, status: 'DISPATCHED' }
    );

    return newReq;
  },

  updateCollectionStatus: (requestId, newStatus) => {
    set((state) => ({
      collectionRequests: state.collectionRequests.map((r) =>
        r.requestId === requestId ? { ...r, status: newStatus } : r
      ),
      lastSimulatedAction: `Collection request ${requestId} status updated to ${newStatus}`
    }));
  },

  generatePassport: (facility, category, weightKg, binId) => {
    const passportId = `MWP-2026-00${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPassport: DigitalWastePassport = {
      id: Date.now(),
      passportId,
      sourceFacility: facility,
      wasteCategory: category,
      weightKg,
      binOrigin: binId,
      generatedAt: new Date().toISOString(),
      segregatedAt: new Date().toISOString(),
      disposalFacility: 'Central CBWTF Facility Dindigul',
      disposalMethod: category === 'SHARPS' ? 'AUTOCLAVE_SHRED' : 'HIGH_TEMP_INCINERATION',
      complianceStatus: 'COMPLIANT_CPCB_MOHFW',
      qrCodeData: `MEDORA-PASSPORT|${passportId}|${category}|${weightKg}KG|${facility}|HASH:${Math.random().toString(36).substring(2, 10)}`,
      chainOfCustody: [
        {
          step: 'GENERATION',
          timestamp: `${now} Today`,
          facility,
          actor: 'On-Duty Clinical Staff',
          status: 'COMPLETED',
          notes: 'Barcoded digital seal applied to medical waste container.'
        },
        {
          step: 'SEGREGATION',
          timestamp: `${now} Today`,
          facility,
          actor: 'AI Classification + Smart Bin Sensor',
          status: 'COMPLETED',
          notes: 'Autonomous visual validation & optical bin sorting.'
        },
        {
          step: 'COLLECTION',
          timestamp: 'Scheduled',
          facility: `${facility} Loading Bay`,
          actor: 'Smart Cart Alpha / Medora Robot',
          status: 'PENDING',
          notes: 'Awaiting pickup dispatch.'
        },
        {
          step: 'TRANSPORT',
          timestamp: 'Pending',
          facility: 'Regional Transit Route',
          actor: 'GPS-Monitored Fleet',
          status: 'PENDING',
          notes: 'Live temperature & route logging.'
        },
        {
          step: 'HANDOVER',
          timestamp: 'Pending',
          facility: 'Central CBWTF Weighbridge',
          actor: 'CBWTF Receiving Officer',
          status: 'PENDING',
          notes: 'Digital barcode manifest check.'
        },
        {
          step: 'DISPOSAL',
          timestamp: 'Pending',
          facility: 'Incinerator / Autoclave Chamber',
          actor: 'Licensed Disposal Operator',
          status: 'PENDING',
          notes: 'Emission compliant MOHFW/CPCB destruction.'
        }
      ]
    };

    set((state) => ({
      passports: [newPassport, ...state.passports],
      selectedPassportId: passportId,
      lastSimulatedAction: `Digital Waste Passport ${passportId} generated!`
    }));

    get().dispatchA2AMessage(
      'Collection Agent',
      'Traceability Agent',
      'CREATE_DIGITAL_PASSPORT',
      'BIOMEDICAL_WASTE',
      { passportId, category, weightKg, facility },
      { qrGenerated: true, chainOfCustodyLocked: true }
    );

    return newPassport;
  },

  advancePassportStage: (passportId, nextStage) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      passports: state.passports.map((p) => {
        if (p.passportId !== passportId) return p;
        const updatedChain = p.chainOfCustody.map((entry) => {
          if (entry.step === nextStage) {
            return { ...entry, status: 'COMPLETED' as const, timestamp: `${now} Today` };
          }
          return entry;
        });
        return { ...p, chainOfCustody: updatedChain };
      }),
      lastSimulatedAction: `Passport ${passportId} progressed to ${nextStage}`
    }));
  },

  dispatchA2AMessage: (sender, recipient, action, category, input, output, confidence) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const msg: A2AMessage = {
      id: Date.now(),
      messageId: `A2A-MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: now,
      senderAgent: sender,
      recipientAgent: recipient,
      category,
      action,
      inputPayload: input,
      outputPayload: output,
      confidence,
      status: 'ACTIVE'
    };

    set((state) => ({
      a2aMessages: [msg, ...state.a2aMessages.slice(0, 19)]
    }));
  },

  resetWasteData: () => {
    set({
      bins: initialSmartBins,
      classifications: initialWasteClassifications,
      verificationQueue: initialVerificationQueue,
      collectionRequests: initialCollectionRequests,
      passports: initialWastePassports,
      a2aMessages: initialA2AMessages,
      selectedBinId: initialSmartBins[0]?.binId || null,
      selectedPassportId: initialWastePassports[0]?.passportId || null,
      lastSimulatedAction: 'Biomedical Waste system reset to factory demo state'
    });
  }
}));
