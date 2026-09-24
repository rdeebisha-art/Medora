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
            <h1 className="text-xl font-black text-[#2563EB]">{t('family.title')}</h1>
            {family && <p className="text-xs text-[#64748B] font-medium">{family.familyName} · {family.village}</p>}
          </div>
          <DemoDataBadge />
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <div className="text-5xl mb-3">👪</div>
            <p>{t('family.noFamily')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2563EB] text-white rounded-full w-11 h-11 flex items-center justify-center font-black text-lg flex-shrink-0 shadow-2xs">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-[#0F172A]">{member.name}</div>
                    <div className="text-xs text-[#475569]">
                      {member.age} {member.age === 0 ? t('common.months') : t('common.years')} · {member.gender}
                    </div>
                    {getBadge(member) && (
                      <span className="inline-block bg-[#FDF2F8] text-[#DB2777] border border-[#DB2777]/30 text-[11px] font-bold px-2 py-0.5 rounded-full mt-1">
                        {getBadge(member)}
                      </span>
                    )}
                    {member.conditions && member.conditions.length > 0 && (
                      <div className="text-xs text-[#DC2626] font-medium mt-1">{member.conditions.join(', ')}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {member.isPregnant && (
                      <Link to="/maternity" className="text-xs bg-[#FDF2F8] text-[#DB2777] border border-[#DB2777]/30 px-2 py-1 rounded-xl font-bold hover:bg-pink-100 transition-colors">Maternity</Link>
                    )}
                    {member.isNewborn && (
                      <Link to="/newborn" className="text-xs bg-[#F0FDFA] text-[#14B8A6] border border-[#14B8A6]/30 px-2 py-1 rounded-xl font-bold hover:bg-teal-100 transition-colors">Newborn</Link>
                    )}
                    {member.isElderly && (
                      <Link to="/elderly" className="text-xs bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/30 px-2 py-1 rounded-xl font-bold hover:bg-indigo-100 transition-colors">Elderly</Link>
                    )}
                    {member.isChild && (
                      <Link to="/childcare" className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/30 px-2 py-1 rounded-xl font-bold hover:bg-blue-100 transition-colors">Child Care</Link>
                    )}
                  </div>
                </div>

                {/* Quick health stats */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#E2E8F0]">
                  <Link to="/medicines" className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-2 text-center text-xs hover:border-[#16A34A]/40 transition-colors">
                    <div className="text-base">💊</div>
                    <div className="text-[#16A34A] font-bold text-[11px] mt-0.5">{t('family.medicines')}</div>
                  </Link>
                  <Link to="/vaccination" className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl p-2 text-center text-xs hover:border-[#16A34A]/40 transition-colors">
                    <div className="text-base">💉</div>
                    <div className="text-[#16A34A] font-bold text-[11px] mt-0.5">{t('family.vaccinations')}</div>
                  </Link>
                  <Link to="/records" className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl p-2 text-center text-xs hover:border-[#2563EB]/40 transition-colors">
                    <div className="text-base">📋</div>
                    <div className="text-[#2563EB] font-bold text-[11px] mt-0.5">{t('family.health')}</div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 bg-[#FFFBEB] border border-[#D97706]/30 rounded-xl p-3 text-xs text-[#D97706]">
          ℹ️ {t('common.demoData')} · Family data is fictional. Log in as different patients to see their records.
        </div>
      </div>
    </Layout>
  );
}
