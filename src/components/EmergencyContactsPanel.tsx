import React, { useState } from 'react';
import { Phone, Plus, Edit2, Trash2, Star, User, Shield } from 'lucide-react';
import { EmergencyContact, LanguageCode } from '../types';
import { useMedora } from '../context/MedoraContext';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';

interface EmergencyContactsPanelProps {
  currentLang?: LanguageCode;
  patientId: string;
  onOpenCommunicationCenter?: () => void;
}

export const EmergencyContactsPanel: React.FC<EmergencyContactsPanelProps> = ({
  patientId,
  onOpenCommunicationCenter,
}) => {
  const { patients } = useMedora();
  const patient = patients.find(p => p.patientId === patientId);
  const contacts: EmergencyContact[] = patient?.emergencyContacts || [];

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      return `+91 ${last10.slice(0, 5)} *****`;
    }
    return phone;
  };

  const handleCall = (phone: string, name?: string) => {
    callPhoneNumber(phone, name || 'Emergency Family Contact', 'FAMILY');
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
        <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-semibold">No emergency contacts added yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add emergency contacts to quickly reach family during emergencies.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-red-600" />
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">Emergency Contacts</h3>
        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">DEMO DATA</span>
      </div>
      {contacts.sort((a, b) => a.priority - b.priority).map((contact) => (
        <div key={contact.emergencyContactId} className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
          contact.isPrimary ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
              contact.isPrimary ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {contact.isPrimary ? <Star className="w-5 h-5" /> : contact.priority}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{contact.name}</span>
                {contact.isPrimary && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">PRIMARY</span>}
              </div>
              <div className="text-xs text-slate-500">{contact.relationship}</div>
              <div className="text-xs font-mono text-slate-600 mt-0.5">{maskPhone(contact.phoneNumber)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${contact.phoneNumber}`}
              onClick={() => handleCall(contact.phoneNumber)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all"
              title={`Call ${contact.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
            {onOpenCommunicationCenter && (
              <button
                onClick={onOpenCommunicationCenter}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded-xl transition-all"
                title="Send message"
              >
                SMS
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
