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
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Patient Profile</h1>
              <p className="text-xs text-slate-500">Stored privately in offline local IndexedDB</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        {/* Primary Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {patient?.name ? patient.name[0] : 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{patient?.name || currentUser?.name || 'Patient'}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                  {currentUser?.role || 'Patient'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ID: #{currentUser?.id || 'P-101'} · {patient?.age || '32'} yrs · {patient?.gender || 'Female'}
              </p>
            </div>
          </div>

          {/* Form & Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 rounded-xl px-3 py-2">
                  {patient?.name || 'Not set'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    <span>{patient?.phone || 'Not set'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Shield size={14} className="text-red-500" />
                    <span>{patient?.emergencyContact || '108'}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Blood Group</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData((p) => ({ ...p, bloodGroup: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <Heart size={14} className="text-rose-500" />
                    <span>{patient?.bloodGroup || 'O+'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Village / Region</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData((p) => ({ ...p, village: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <MapPin size={14} className="text-teal-600" />
                    <span>{patient?.village || 'Kodaikanal'}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <Save size={14} /> Save Profile
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition-colors"
              >
                ✏️ Edit Profile Details
              </button>
            )}
          </div>

          {savedSuccess && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Profile updated successfully in local storage.</span>
            </div>
          )}
        </div>

        {/* Clinical Summary Cards */}
        {patient && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1.5">Known Conditions</div>
              {patient.conditions && patient.conditions.length > 0 ? (
                <ul className="space-y-1">
                  {patient.conditions.map((c, i) => (
                    <li key={i} className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <span>•</span> {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">None recorded</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">Allergies</div>
              {patient.allergies && patient.allergies.length > 0 ? (
                <ul className="space-y-1">
                  {patient.allergies.map((a, i) => (
                    <li key={i} className="text-xs font-medium text-amber-700 flex items-center gap-1">
                      <span>•</span> {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">None recorded</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
