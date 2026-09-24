import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Family } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

export default function FamilyPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [members, setMembers] = useState<Patient[]>([]);
  const [family, setFamily] = useState<Family | null>(null);

  useEffect(() => {
    const load = async () => {
      let familyId: number | undefined;
      if (currentUser?.role === 'family') familyId = currentUser.id;
      else if (currentUser?.role === 'patient') familyId = (currentUser as any).familyId;
      if (!familyId) {
        // Show all patients for demo if no family
        const all = await db.patients.limit(8).toArray();
        setMembers(all);
        return;
      }
      const fam = await db.families.get(familyId);
      setFamily(fam || null);
      if (fam?.memberIds?.length) {
        const mems = await db.patients.bulkGet(fam.memberIds);
        setMembers(mems.filter(Boolean) as Patient[]);
      }
    };
    load();
  }, [currentUser]);

  const getBadge = (p: Patient) => {
    if (p.isPregnant) return '🤰 Pregnant';
    if (p.isNewborn) return '🍼 Newborn';
    if (p.isChild) return '👶 Child';
    if (p.isElderly) return '👴 Elderly';
    if (p.isNewMother) return '👩 New Mother';
    return '';
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('family.title')}</h1>
            {family && <p className="text-sm text-gray-500">{family.familyName} · {family.village}</p>}
          </div>
          <DemoDataBadge />
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">👪</div>
            <p>{t('family.noFamily')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white rounded-full w-11 h-11 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">
                      {member.age} {member.age === 0 ? t('common.months') : t('common.years')} · {member.gender}
                    </div>
                    {getBadge(member) && (
                      <span className="inline-block bg-pink-100 text-pink-700 text-xs font-medium px-2 py-0.5 rounded-full mt-1">
                        {getBadge(member)}
                      </span>
                    )}
                    {member.conditions && member.conditions.length > 0 && (
                      <div className="text-xs text-red-600 mt-1">{member.conditions.join(', ')}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {member.isPregnant && (
                      <Link to="/maternity" className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-lg font-medium">Maternity</Link>
                    )}
                    {member.isNewborn && (
                      <Link to="/newborn" className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-lg font-medium">Newborn</Link>
                    )}
                    {member.isElderly && (
                      <Link to="/elderly" className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium">Elderly</Link>
                    )}
                    {member.isChild && (
                      <Link to="/childcare" className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-medium">Child Care</Link>
                    )}
                  </div>
                </div>

                {/* Quick health stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Link to="/medicines" className="bg-green-50 rounded-xl p-2 text-center text-xs">
                    <div className="text-green-700 font-bold">💊</div>
                    <div className="text-gray-600">{t('family.medicines')}</div>
                  </Link>
                  <Link to="/vaccination" className="bg-purple-50 rounded-xl p-2 text-center text-xs">
                    <div className="text-purple-700 font-bold">💉</div>
                    <div className="text-gray-600">{t('family.vaccinations')}</div>
                  </Link>
                  <Link to="/records" className="bg-blue-50 rounded-xl p-2 text-center text-xs">
                    <div className="text-blue-700 font-bold">📋</div>
                    <div className="text-gray-600">{t('family.health')}</div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          ℹ️ {t('common.demoData')} · Family data is fictional. Log in as different patients to see their records.
        </div>
      </div>
    </Layout>
  );
}
