import React, { useState, useEffect } from 'react';
import { PatientProfile, VillageFamily } from '../types';
import { X, Save, UserCheck, Shield, AlertCircle } from 'lucide-react';

interface AdminEditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile | null;
  families: VillageFamily[];
  onSave: (patientId: string, updatedData: Partial<{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    relationship: string;
    familyId: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    contactPhone: string;
    emergencyContact: string;
    address: string;
  }>) => boolean;
  onShowToast?: (msg: string) => void;
}

export const AdminEditPatientModal: React.FC<AdminEditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  families,
  onSave,
  onShowToast,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    relationship: '',
    familyId: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    contactPhone: '',
    emergencyContact: '',
    address: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        age: String(patient.age || ''),
        gender: patient.gender || 'Male',
        relationship: patient.relationship || '',
        familyId: patient.familyId || families[0]?.familyId || 'FAM-01',
        bloodGroup: patient.bloodGroup || '',
        allergies: (patient.allergies || []).join(', '),
        chronicConditions: (patient.chronicConditions || []).join(', '),
        contactPhone: patient.contactPhone || '',
        emergencyContact: patient.emergencyContact || '',
        address: patient.address || '',
      });
      setError(null);
    }
  }, [patient, families]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Patient name is required.');
      return;
    }
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 125) {
      setError('Please enter a valid age between 0 and 125.');
      return;
    }

    const success = onSave(patient.patientId, {
      name: formData.name.trim(),
      age: ageNum,
      gender: formData.gender,
      relationship: formData.relationship.trim() || 'Family Member',
      familyId: formData.familyId,
      bloodGroup: formData.bloodGroup.trim(),
      allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
      contactPhone: formData.contactPhone.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      address: formData.address.trim(),
    });

    if (success) {
      onShowToast?.(`Demographic details for ${formData.name.trim()} (${patient.patientId}) updated successfully.`);
      onClose();
    } else {
      setError('Failed to update patient records. Administrator authorization required.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Edit Patient Demographics</h3>
                <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  {patient.patientId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gram Panchayat Registry Demographic Correction & Family Assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Disclaimer Notice */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
            <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Clinical Integrity Guard:</strong> Administrator edit access is strictly limited to demographic, identity, contact, and household fields. Laboratory values and doctor progress notes remain attributable to clinical staff.
            </span>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Age (Years) *</label>
              <input
                type="number"
                required
                min="0"
                max="125"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Household *</label>
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
              >
                {families.map((f) => (
                  <option key={f.familyId} value={f.familyId}>
                    {f.familyName} ({f.familyId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Family Relationship</label>
              <input
                type="text"
                placeholder="e.g. Senior / Head, Mother, Son"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 94481 00000"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                placeholder="+91 94481 99999 (Neighbor / Kin)"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Village Street Address</label>
            <input
              type="text"
              placeholder="e.g. House #24, Near Gram Panchayat Office"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="A Positive (A+)">A Positive (A+)</option>
                <option value="A Negative (A-)">A Negative (A-)</option>
                <option value="B Positive (B+)">B Positive (B+)</option>
                <option value="B Negative (B-)">B Negative (B-)</option>
                <option value="O Positive (O+)">O Positive (O+)</option>
                <option value="O Negative (O-)">O Negative (O-)</option>
                <option value="AB Positive (AB+)">AB Positive (AB+)</option>
                <option value="AB Negative (AB-)">AB Negative (AB-)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Known Allergies (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Dust, Peanuts"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Chronic Conditions (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Hypertension, Type 2 Diabetes, Knee Osteoarthritis"
              value={formData.chronicConditions}
              onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
