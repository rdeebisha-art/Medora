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
          setLanguage(patient.language || 'en');
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
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-800 flex flex-col">
      <div className="flex items-center justify-center pt-8 pb-4 text-white">
        <div className="text-center">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-black">MEDORA</h1>
          <p className="text-sm opacity-80">{t('app.tagline')}</p>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl flex-1 px-6 pt-6 pb-8">
        {!selectedRole ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">{t('auth.login')}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">{t('auth.selectRole')}</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className="flex flex-col items-center bg-gray-50 border-2 border-gray-200 hover:border-sky-400 hover:bg-sky-50 rounded-2xl p-5 transition-all"
                >
                  <span className="text-4xl mb-2">{r.emoji}</span>
                  <span className="font-bold text-gray-800 capitalize">{t(`auth.${r.role}Login`)}</span>
                  <span className="text-xs text-gray-400 mt-1">Demo: {r.demoPin}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setSelectedRole(null); setError(''); setPhone(''); setPin(''); }} className="flex items-center gap-2 text-sky-600 font-medium mb-4">
              ← {t('common.back')}
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {ROLES.find(r => r.role === selectedRole)?.emoji} {t(`auth.${selectedRole}Login`)}
            </h2>

            {/* Demo credentials hint */}
            {(() => {
              const roleData = ROLES.find(r => r.role === selectedRole)!;
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-700 font-medium">🧪 Demo credentials:</p>
                  <p className="text-xs text-amber-600">
                    {selectedRole === 'family' ? 'Name/ID' : 'Phone'}: <strong>{roleData.demoPhone}</strong>
                  </p>
                  <p className="text-xs text-amber-600">PIN: <strong>{roleData.demoPin}</strong></p>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedRole === 'family' ? 'Family Name / ID' : t('auth.phone')}
                </label>
                <input
                  type={selectedRole === 'family' ? 'text' : 'tel'}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={selectedRole === 'family' ? 'e.g. Kumar Family or 2' : '10-digit phone number'}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.pin')}</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder={t('auth.enterPin')}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-base focus:border-sky-400 focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPin ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
              
              {/* Validation Feedback */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-xl text-sm font-medium border border-red-200">
                  <span className="font-bold">✕</span> {error === t('auth.loginError') ? 'Incorrect password or phone' : error}
                </div>
              )}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl text-lg hover:bg-sky-700 disabled:opacity-50 transition-all shadow-md"
              >
                {loading ? t('common.loading') : t('auth.login')}
              </button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center mt-6">{t('common.demoData')} · {t('common.disclaimer')}</p>
      </div>
    </div>
  );
}
