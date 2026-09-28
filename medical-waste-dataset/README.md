# Medora Biomedical Waste AI Dataset & Training Protocol

**Problem Statement:** SIH 2026 PS26115 — "Design and develop a smart mobile medical waste collection and segregation system."

## 1. Directory Structure

```text
medical-waste-dataset/
├── dataset_manifest.json
├── README.md
├── train/
│   ├── syringe/
│   ├── needle/
│   ├── glove/
│   ├── mask/
│   ├── dressing/
│   ├── medicine_packaging/
│   ├── medicine_bottle/
│   ├── sharps_container/
│   ├── contaminated_waste/
│   ├── general_healthcare_waste/
│   └── unknown/
├── validation/
│   └── [11 classes]
└── test/
    └── [11 classes]
```

## 2. Supported Initial AI Classes

1. **syringe**: Disposable syringes, plungers, barrels.
2. **needle**: Hypodermic needles, butterfly needles, cannulas, scalpel blades.
3. **glove**: Latex, nitrile, and vinyl examination/surgical gloves.
4. **mask**: 3-ply surgical masks, N95 respirators, cloth masks.
5. **dressing**: Cotton gauze, absorbent pads, soiled bandages.
6. **medicine_packaging**: Empty foil blister packs, drug packaging cartons.
7. **medicine_bottle**: Glass vials, plastic ampoules, medicine bottles.
8. **sharps_container**: Dedicated puncture-proof white boxes.
9. **contaminated_waste**: Blood-soaked cotton, suction tubes, biohazard bags.
10. **general_healthcare_waste**: Office stationery, clean packaging, food waste.
11. **unknown**: Ambiguous, occluded, or unclassified items (triggers manual review).

## 3. Strict Dataset Protocol & Zero Data Leakage

- **Zero Leakage**: No image file or variant appears in more than one split (train, validation, or test).
- **Ground Truth Integrity**: Model predictions are never treated as ground truth without human verification.
- **Review Feedback Loop**: Corrected classifications from authorized clinicians are saved exclusively to the `train` split for future supervised training passes.

## 4. Training Pipeline Script

To validate the dataset and run the training pipeline from the terminal:

```bash
# Validate dataset and verify zero leakage:
npx tsx scripts/validate_waste_dataset.ts

# Execute training and evaluate on held-out test split:
npx tsx scripts/train_medical_waste_model.ts
```
