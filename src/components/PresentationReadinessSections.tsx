import React, { useState } from 'react';
import { Accessibility, AlertTriangle, ArrowDown, ArrowRight, CheckCircle2, ClipboardList, Globe2, HeartPulse, LockKeyhole, MapPin, Megaphone, MessageSquare, Network, Phone, Plus, ShieldCheck, Smartphone, Users, UserRound, Workflow } from 'lucide-react';

const flowSteps = (items: string[]) => (
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
    {items.map((item, index) => (
      <React.Fragment key={item}>
        <div className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-700 shadow-sm">{item}</div>
        {index < items.length - 1 && <ArrowRight className="hidden md:block w-5 h-5 mx-1 text-emerald-500 shrink-0" />}
        {index < items.length - 1 && <ArrowDown className="md:hidden w-4 h-4 mx-auto text-emerald-500 shrink-0" />}
      </React.Fragment>
    ))}
  </div>
);

const SectionHeading: React.FC<{ icon: React.ReactNode; title: string; description?: string }> = ({ icon, title, description }) => (
  <div className="border-b border-slate-200 pb-3">
    <div className="flex items-center gap-2 text-emerald-700">
      {icon}
      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h2>
    </div>
    {description && <p className="mt-1 text-sm text-slate-600 max-w-3xl">{description}</p>}
  </div>
);

const safetyCards = [
  ['AI-Assisted, Not AI-Only', 'Medora uses AI to support risk assessment and healthcare decisions. It does not replace a qualified doctor or provide a guaranteed diagnosis.'],
  ['Emergency Escalation', 'Patients with severe or emergency symptoms are advised to seek immediate professional medical care.'],
  ['Human-in-the-Loop', 'Low-confidence, complex, or high-risk cases can be escalated to healthcare professionals for further evaluation.'],
  ['Responsible AI', 'AI recommendations should be clinically validated before real-world deployment. Medora is designed as a healthcare support system, not a replacement for medical professionals.'],
];

const awarenessCards = [
  ['📱 New Phone / SIM Awareness', 'Future partnerships with telecom operators, smartphone manufacturers, or government digital-health programs could introduce users to trusted healthcare resources such as Medora during device or SIM onboarding.'],
  ['📩 Local-Language SMS', 'Healthcare awareness messages with a Medora link or QR code can help reach users in their preferred local language.'],
  ['🏥 PHCs & Health Centres', 'QR codes and informational materials at Primary Health Centres can provide direct access to Medora.'],
  ['👩‍⚕️ Community Health Workers', 'ASHA workers and other community health workers can introduce Medora and help villagers understand how to use it.'],
  ['🏛️ Panchayat & Community Awareness', 'Local awareness campaigns through Panchayats, community centres and village programs can increase adoption.'],
];

export const PresentationReadinessSections: React.FC = () => {
  const [population, setPopulation] = useState(5240);
  const [records, setRecords] = useState([
    { id: 'VH-001', name: 'Demo Resident A', age: 68, gender: 'Male', household: 'HH-104', village: 'Rampur', need: 'BP follow-up', status: 'Follow-up required' },
    { id: 'VH-002', name: 'Demo Resident B', age: 27, gender: 'Female', household: 'HH-118', village: 'Rampur', need: 'Maternal care', status: 'Active follow-up' },
  ]);

  const registerBirth = () => {
    setPopulation((value) => value + 1);
    setRecords((value) => [{ id: `VH-${String(value.length + 3).padStart(3, '0')}`, name: 'Demo Newborn', age: 0, gender: 'Not recorded', household: 'HH-DEMO', village: 'Rampur', need: 'New birth follow-up', status: 'New record' }, ...value]);
  };

  const addResident = () => setPopulation((value) => value + 1);
  const removeResident = () => setPopulation((value) => Math.max(0, value - 1));

  return (
    <section className="space-y-8" aria-label="SIH 2026 presentation concepts">
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-950"><strong>Emergency?</strong> Medora is not a replacement for emergency medical care. If you are experiencing severe or life-threatening symptoms, contact emergency services or visit the nearest healthcare facility immediately.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <SectionHeading icon={<ShieldCheck className="w-6 h-6" />} title="How Medora Keeps Patients Safe" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyCards.map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p></article>)}
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-950"><strong>AI Risk Assessment</strong> · <strong>Risk Level</strong> · <strong>Confidence Level</strong> · <strong>Recommended Next Step</strong><br />For low-confidence or high-risk results: <strong>Professional medical evaluation recommended.</strong></div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <SectionHeading icon={<Network className="w-6 h-6" />} title="Designed for Rural & Low-Connectivity Healthcare" />
        <p className="text-sm text-slate-700 leading-relaxed">Medora is designed with rural healthcare challenges in mind. The future offline-first architecture can allow essential patient information to be stored locally and synchronized when connectivity becomes available.</p>
        <span className="inline-flex rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-black">Planned / Future Implementation · Not currently offline</span>
        <h3 className="font-black text-slate-900">Healthcare Facility Fallback</h3>
        {flowSteps(['Patient', 'Nearby Healthcare Facility', 'Availability Verification', 'Alternative Facility', 'Emergency Escalation'])}
        <p className="text-sm text-slate-600">The current prototype focuses on identifying nearby healthcare facilities. Real-time hospital bed and facility availability integration can be added through authorized healthcare systems or APIs.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <SectionHeading icon={<HeartPulse className="w-6 h-6" />} title="Why Medora?" />
        <p className="text-base text-slate-700 leading-relaxed">Medora aims to reduce delays in rural healthcare by connecting patients with appropriate healthcare resources, supporting preliminary risk assessment, helping identify nearby healthcare facilities, and enabling faster escalation of potentially serious cases.</p>
        <p className="font-black text-emerald-800">Medora is an AI-assisted rural healthcare support and connectivity platform.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <SectionHeading icon={<Megaphone className="w-6 h-6" />} title="How Medora Reaches Rural Communities" />
        {flowSteps(['Community Awareness', 'ASHA / Community Health Worker', 'Easy Access', 'Local Language & Voice', 'Continued Support'])}
        <p className="text-sm text-slate-700 leading-relaxed">Medora is not intended to depend on villagers discovering a website on their own. Community health workers, PHCs, Panchayats and local awareness campaigns can act as trusted channels for introducing Medora to rural communities.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{awarenessCards.map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-black text-slate-900 text-sm">{title}</h3><p className="mt-2 text-xs text-slate-600 leading-relaxed">{text}</p></article>)}</div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-cyan-800">Future Expansion</p><p className="mt-1 text-sm text-cyan-950">Telecom, smartphone and government partnerships could enable broader healthcare awareness and easier access to Medora at scale.</p></div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <SectionHeading icon={<Accessibility className="w-6 h-6" />} title="Designed for Accessibility" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">{['Simple and intuitive interface', 'Local-language support (Planned)', 'Voice interaction (Planned)', 'QR-code based access', 'Low-connectivity considerations', 'Clear emergency guidance'].map((item) => <div key={item} className="rounded-xl bg-slate-50 border border-slate-200 p-3 font-bold text-slate-700">{item}</div>)}</div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <SectionHeading icon={<ClipboardList className="w-6 h-6" />} title="Prototype Limitations & Future Validation" />
        <ul className="grid gap-2 text-sm text-slate-700">{['AI recommendations require clinical validation before real-world deployment.', 'Real-time hospital/bed availability is not currently integrated unless supported by the existing system.', 'Full offline-first functionality is planned for future implementation.', 'Large-scale clinical dataset validation is required before deployment.', 'Medora is designed to assist healthcare access and decision support, not replace doctors.'].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />{item}</li>)}</ul>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><SectionHeading icon={<Users className="w-6 h-6" />} title="Proposed Village Health Registry" description="Prototype / Demonstration Data. This is not a government population database and does not expose complete medical records publicly." /><span className="shrink-0 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-black">Prototype / Demonstration Data</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[['Total Registered Population', population], ['Households', 1240], ['Children', 812], ['Elderly', 438], ['Maternal-care cases', 27], ['People requiring follow-up', 116], ['Special assistance', 34], ['Recent updates', 'Today']].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-bold text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value}</p></div>)}</div>
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4"><h3 className="font-black text-blue-950">New Birth Registration</h3>{flowSteps(['New Birth', 'Authorized Health Worker Enters Basic Details', 'Verification', 'Child Record Created', 'Population Updated'])}<div className="mt-4 flex flex-wrap gap-2"><button onClick={registerBirth} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white"><Plus className="w-4 h-4" /> Register New Birth</button><button onClick={addResident} className="rounded-xl border border-blue-300 px-3 py-2 text-xs font-bold text-blue-900">Register New Resident</button><button onClick={removeResident} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Report Migration / Resident Change</button></div><p className="mt-3 text-xs text-blue-900">Current Population: 5,240 · Demo update: <strong>{population}</strong></p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-2">Patient ID</th><th className="p-2">Name</th><th className="p-2">Age</th><th className="p-2">Gender</th><th className="p-2">Household</th><th className="p-2">Basic need</th><th className="p-2">Follow-up</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-slate-100"><td className="p-2 font-bold">{record.id}</td><td className="p-2">{record.name}</td><td className="p-2">{record.age}</td><td className="p-2">{record.gender}</td><td className="p-2">{record.household}</td><td className="p-2">{record.need}</td><td className="p-2">{record.status}</td></tr>)}</tbody></table></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="flex items-center gap-2 font-black text-slate-900"><LockKeyhole className="w-4 h-4 text-emerald-600" /> Privacy & Responsible Data Management</h3><p className="mt-2 text-sm text-slate-600">Consent-based data collection · Minimal data collection · Role-based access · Secure authentication · Audit logs · Only authorized healthcare personnel can access sensitive health information · Users should be able to request correction of incorrect information.</p></div>
        <div><h3 className="font-black text-slate-900 mb-3">Healthcare Planning with Aggregated Data</h3>{flowSteps(['Village Health Data', 'Identify Healthcare Needs', 'Predict Resource Requirements', 'Plan Health Camps / Medicine Supply / Outreach', 'Improve Healthcare Coverage'])}<p className="mt-3 text-xs text-slate-600">Aggregated information can support planning without exposing individual medical records.</p></div>
        <p className="text-xs text-slate-600"><strong>Responsible scope:</strong> With appropriate authorization and integration with existing public-health systems, Medora could help maintain an up-to-date picture of village healthcare needs.</p>
      </div>
    </section>
  );
};
