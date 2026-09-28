import { GroundTruthSample } from '../ai/types';

export const INITIAL_GROUND_TRUTH_DATASET: GroundTruthSample[] = [
  // --- TEST SPLIT (Held-out evaluation samples) ---
  {
    sampleId: 'TEST-001',
    sampleName: '2ml_disposable_syringe_with_needle_01',
    trueClass: 'syringe',
    trueFeatures: ['syringe', 'needle', 'sharp_object'],
    expectedStream: 'SHARPS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-002',
    sampleName: '5ml_plunger_assembly_no_needle_02',
    trueClass: 'syringe',
    trueFeatures: ['syringe'],
    expectedStream: 'SHARPS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-003',
    sampleName: 'hypodermic_needle_bevel_01',
    trueClass: 'needle',
    trueFeatures: ['needle', 'sharp_object'],
    expectedStream: 'SHARPS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-004',
    sampleName: 'scalpel_blade_disposable_01',
    trueClass: 'needle',
    trueFeatures: ['sharp_object'],
    expectedStream: 'SHARPS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-005',
    sampleName: 'used_nitrile_exam_glove_blue_01',
    trueClass: 'glove',
    trueFeatures: ['used_glove'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-006',
    sampleName: 'latex_surgical_glove_powder_free_02',
    trueClass: 'glove',
    trueFeatures: ['used_glove'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-007',
    sampleName: '3ply_surgical_mask_pleated_01',
    trueClass: 'mask',
    trueFeatures: ['used_mask'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-008',
    sampleName: 'n95_respirator_used_clinic_02',
    trueClass: 'mask',
    trueFeatures: ['used_mask'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-009',
    sampleName: 'blood_soiled_cotton_gauze_swab_01',
    trueClass: 'dressing',
    trueFeatures: ['dressing', 'visible_leakage_indicator'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-010',
    sampleName: 'elastic_crepe_bandage_used_02',
    trueClass: 'dressing',
    trueFeatures: ['dressing'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-011',
    sampleName: 'paracetamol_blister_packaging_foil_01',
    trueClass: 'medicine_packaging',
    trueFeatures: ['medicine_packaging', 'warning_label'],
    expectedStream: 'PHARMACEUTICAL',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-012',
    sampleName: 'antibiotic_cardboard_carton_empty_02',
    trueClass: 'medicine_packaging',
    trueFeatures: ['medicine_packaging'],
    expectedStream: 'PHARMACEUTICAL',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-013',
    sampleName: 'insulin_glass_vial_10ml_01',
    trueClass: 'medicine_bottle',
    trueFeatures: ['medicine_bottle', 'warning_label'],
    expectedStream: 'PHARMACEUTICAL',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-014',
    sampleName: 'cough_syrup_amber_pet_bottle_02',
    trueClass: 'medicine_bottle',
    trueFeatures: ['medicine_bottle'],
    expectedStream: 'PHARMACEUTICAL',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-015',
    sampleName: 'translucent_sharps_box_white_lid_01',
    trueClass: 'sharps_container',
    trueFeatures: ['sharps_container', 'biohazard_symbol'],
    expectedStream: 'SHARPS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-016',
    sampleName: 'puncture_proof_canister_with_needle_cutter_02',
    trueClass: 'sharps_container',
    trueFeatures: ['sharps_container', 'biohazard_symbol', 'warning_label'],
    expectedStream: 'SHARPS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-017',
    sampleName: 'yellow_biohazard_waste_bag_tied_01',
    trueClass: 'contaminated_waste',
    trueFeatures: ['waste_bag', 'biohazard_symbol'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-018',
    sampleName: 'suction_tubing_soiled_02',
    trueClass: 'contaminated_waste',
    trueFeatures: ['visible_leakage_indicator'],
    expectedStream: 'INFECTIOUS',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-019',
    sampleName: 'tea_cup_paper_administrative_office_01',
    trueClass: 'general_healthcare_waste',
    trueFeatures: [],
    expectedStream: 'GENERAL',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-020',
    sampleName: 'newspaper_wrapping_clean_canteen_02',
    trueClass: 'general_healthcare_waste',
    trueFeatures: [],
    expectedStream: 'GENERAL',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },
  {
    sampleId: 'TEST-021',
    sampleName: 'unidentifiable_fragment_corroded_01',
    trueClass: 'unknown',
    trueFeatures: ['damaged_container'],
    expectedStream: 'MANUAL_INSPECTION',
    split: 'test',
    source: 'BENCHMARK_LABELED'
  },

  // --- TRAIN SPLIT (Disjoint from test split) ---
  {
    sampleId: 'TRN-101',
    sampleName: 'training_syringe_sterile_pack_01',
    trueClass: 'syringe',
    trueFeatures: ['syringe'],
    expectedStream: 'SHARPS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-102',
    sampleName: 'training_needle_hub_plastic_01',
    trueClass: 'needle',
    trueFeatures: ['needle', 'sharp_object'],
    expectedStream: 'SHARPS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-103',
    sampleName: 'training_glove_soiled_pair_01',
    trueClass: 'glove',
    trueFeatures: ['used_glove'],
    expectedStream: 'INFECTIOUS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-104',
    sampleName: 'training_mask_kn95_01',
    trueClass: 'mask',
    trueFeatures: ['used_mask'],
    expectedStream: 'INFECTIOUS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-105',
    sampleName: 'training_bandage_pad_sterile_01',
    trueClass: 'dressing',
    trueFeatures: ['dressing'],
    expectedStream: 'INFECTIOUS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-106',
    sampleName: 'training_blister_foil_tablet_01',
    trueClass: 'medicine_packaging',
    trueFeatures: ['medicine_packaging'],
    expectedStream: 'PHARMACEUTICAL',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-107',
    sampleName: 'training_saline_bottle_empty_01',
    trueClass: 'medicine_bottle',
    trueFeatures: ['medicine_bottle'],
    expectedStream: 'PHARMACEUTICAL',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-108',
    sampleName: 'training_sharps_bin_red_01',
    trueClass: 'sharps_container',
    trueFeatures: ['sharps_container'],
    expectedStream: 'SHARPS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-109',
    sampleName: 'training_specimen_swab_01',
    trueClass: 'contaminated_waste',
    trueFeatures: ['biohazard_symbol'],
    expectedStream: 'INFECTIOUS',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-110',
    sampleName: 'training_office_paper_shred_01',
    trueClass: 'general_healthcare_waste',
    trueFeatures: [],
    expectedStream: 'GENERAL',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  },
  {
    sampleId: 'TRN-111',
    sampleName: 'training_obscure_shadow_artifact_01',
    trueClass: 'unknown',
    trueFeatures: [],
    expectedStream: 'MANUAL_INSPECTION',
    split: 'train',
    source: 'MANUAL_ANNOTATION'
  }
];
