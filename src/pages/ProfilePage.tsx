import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { User, Heart, Shield, Phone, MapPin, Globe, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { currentUser, language, setLanguage } = useAppStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    bloodGroup: '',
    village: ''
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      db.patients.get(currentUser.id).then((p) => {
        if (p) {
          setPatient(p);
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            emergencyContact: p.emergencyContact || '',
            bloodGroup: p.bloodGroup || '',
            village: p.village || ''
          });
        }
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.id) return;
    await db.patients.update(currentUser.id, {
      name: formData.name,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact,
      bloodGroup: formData.bloodGroup,
      village: formData.village
    });
    setPatient((prev) => (prev ? { ...prev, ...formData } : null));
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center font-bold shadow-2xs">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0F172A]">Patient Profile</h1>
              <p className="text-xs text-[#64748B]">Stored privately in offline local IndexedDB</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        {/* Primary Profile Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-4 border-b border-[#E2E8F0] pb-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F766E] to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-xs">
              {patient?.name ? patient.name[0] : 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#0F172A]">{patient?.name || currentUser?.name || 'Patient'}</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#0F766E]/30 capitalize">
                  {currentUser?.role || 'Patient'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                ID: #{currentUser?.id || 'P-101'} · {patient?.age || '32'} yrs · {patient?.gender || 'Female'}
              </p>
            </div>
          </div>

          {/* Form & Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2">
                  {patient?.name || 'Not set'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#64748B]" />
                    <span>{patient?.phone || 'Not set'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Shield size={13} className="text-[#DC2626]" />
                    <span>{patient?.emergencyContact || '108'}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Blood Group</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData((p) => ({ ...p, bloodGroup: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Heart size={13} className="text-[#DC2626]" />
                    <span>{patient?.bloodGroup || 'O+'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Village / Region</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData((p) => ({ ...p, village: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                ) : (
                  <p className="text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#0F766E]" />
                    <span>{patient?.village || 'Kodaikanal'}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Save size={14} /> Save Profile
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl bg-[#F0FDFA] hover:bg-teal-100 text-[#0F766E] border border-[#0F766E]/30 text-xs font-bold transition-colors shadow-2xs"
              >
                ✏️ Edit Profile Details
              </button>
            )}
          </div>

          {savedSuccess && (
            <div className="mt-3 bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold">
              <CheckCircle size={14} className="text-[#16A34A]" />
              <span>Profile updated successfully in local storage.</span>
            </div>
          )}
        </div>

        {/* Clinical Summary Cards */}
        {patient && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-extrabold text-[#DC2626] uppercase tracking-wide mb-1.5">Known Conditions</div>
              {patient.conditions && patient.conditions.length > 0 ? (
                <ul className="space-y-1">
                  {patient.conditions.map((c, i) => (
                    <li key={i} className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                      <span className="text-[#DC2626]">•</span> {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#94A3B8]">None recorded</p>
              )}
            </div>

            <div className="bg-[#FFFBEB] border border-[#D97706]/30 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wide mb-1.5">Allergies</div>
              {patient.allergies && patient.allergies.length > 0 ? (
                <ul className="space-y-1">
                  {patient.allergies.map((a, i) => (
                    <li key={i} className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                      <span className="text-[#D97706]">•</span> {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#94A3B8]">None recorded</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
