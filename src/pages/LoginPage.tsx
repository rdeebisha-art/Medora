import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';

type Role = 'patient' | 'family' | 'doctor' | 'admin';

const ROLES = [
  { role: 'patient' as Role, emoji: '🧑‍⚕️', demoPhone: '9876543210', demoPin: '1234' },
  { role: 'family' as Role, emoji: '👪', demoPhone: 'Kumar Family (ID:2)', demoPin: '1234' },
  { role: 'doctor' as Role, emoji: '👨‍⚕️', demoPhone: '9800001111', demoPin: 'doc123' },
  { role: 'admin' as Role, emoji: '🔑', demoPhone: '9900000001', demoPin: 'admin123' },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, setLanguage } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !pin) { setError('Please enter phone and PIN'); return; }
    setLoading(true);
    setError('');
    try {
      if (selectedRole === 'patient') {
        const patient = await db.patients.where({ phone }).first();
        if (patient && patient.pin === pin) {
          login({ id: patient.id!, name: patient.name, role: 'patient', phone: patient.phone, village: patient.village, language: patient.language, familyId: patient.familyId, ...patient });
          navigate('/dashboard');
          return;
        }
      } else if (selectedRole === 'family') {
        // Try matching by family name id or phone
        const families = await db.families.toArray();
        const family = families.find(f => (String(f.id) === phone || f.familyName.toLowerCase().includes(phone.toLowerCase())) && f.pin === pin);
        if (family) {
          login({ id: family.id!, name: family.familyName, role: 'family', village: family.village, familyId: family.id });
          navigate('/dashboard');
          return;
        }
      } else if (selectedRole === 'doctor') {
        const doctor = await db.doctors.where({ phone }).first();
        if (doctor && doctor.pin === pin) {
          login({ id: doctor.id!, name: doctor.name, role: 'doctor', phone: doctor.phone, village: doctor.village });
          navigate('/dashboard');
          return;
        }
      } else if (selectedRole === 'admin') {
        const admin = await db.admins.where({ phone }).first();
        if (admin && admin.pin === pin) {
          login({ id: admin.id!, name: admin.name, role: 'admin', phone: admin.phone });
          navigate('/dashboard');
          return;
        }
      }
      setError(t('auth.loginError'));
    } catch (e) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between py-6 px-4 overflow-x-hidden">
      <div className="flex items-center justify-center pt-4 pb-3 px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-md border border-[#0F766E]/30 text-3xl flex items-center justify-center mx-auto mb-2 shadow-lg">
            🏥
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-[#0F766E] drop-shadow-xs">MEDORA</h1>
          <p className="text-xs sm:text-sm text-[#0F172A] font-semibold bg-white/70 backdrop-blur-xs px-3 py-0.5 rounded-full inline-block mt-0.5">{t('app.tagline')}</p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E2E8F0] px-5 sm:px-8 py-6 sm:py-8 shadow-2xl max-w-lg mx-auto w-full min-w-0 break-words my-2">
        {!selectedRole ? (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-1 text-center">{t('auth.login')}</h2>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-5">{t('auth.selectRole')}</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className="flex flex-col items-center bg-slate-50 border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/60 rounded-2xl p-4 sm:p-5 transition-all min-h-[110px] justify-center active:scale-95"
                >
                  <span className="text-3xl sm:text-4xl mb-2">{r.emoji}</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 capitalize">{t(`auth.${r.role}Login`)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">Demo: {r.demoPin}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setSelectedRole(null); setError(''); setPhone(''); setPin(''); }}
              className="inline-flex items-center gap-2 text-[#0F766E] font-bold text-xs sm:text-sm mb-4 min-h-11 py-1"
            >
              ← {t('common.back')}
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
              {ROLES.find(r => r.role === selectedRole)?.emoji} {t(`auth.${selectedRole}Login`)}
            </h2>

            {/* Demo credentials hint */}
            {(() => {
              const roleData = ROLES.find(r => r.role === selectedRole)!;
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-amber-700 font-medium">🧪 Demo credentials:</p>
                    <p className="text-xs text-amber-600">
                      {selectedRole === 'family' ? 'Name/ID' : 'Phone'}: <strong>{selectedRole === 'family' ? '2 (Kumar Family)' : roleData.demoPhone}</strong>
                    </p>
                    <p className="text-xs text-amber-600">PIN: <strong>{roleData.demoPin}</strong></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhone(selectedRole === 'family' ? '2' : roleData.demoPhone);
                      setPin(roleData.demoPin);
                      setError('');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-2xs transition-colors flex-shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  {selectedRole === 'family' ? 'Family Name / ID' : t('auth.phone')}
                </label>
                <input
                  type={selectedRole === 'family' ? 'text' : 'tel'}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={selectedRole === 'family' ? 'e.g. Kumar Family or 2' : '10-digit phone number'}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-[#0F766E] focus:outline-none min-h-12"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">{t('auth.pin')}</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder={t('auth.enterPin')}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm sm:text-base focus:border-[#0F766E] focus:outline-none min-h-12"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none min-h-10 min-w-10 flex items-center justify-center"
                    title={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showPin ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
              
              {/* Validation Feedback */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-red-200">
                  <span className="font-bold">✕</span> {error === t('auth.loginError') ? 'Incorrect password or phone' : error}
                </div>
              )}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg disabled:opacity-50 transition-all shadow-md min-h-12 active:scale-98"
              >
                {loading ? t('common.loading') : t('auth.login')}
              </button>
            </div>
          </>
        )}
        <p className="text-xs text-slate-400 text-center mt-6">{t('common.demoData')} · {t('common.disclaimer')}</p>
      </div>
    </div>
  );
}
