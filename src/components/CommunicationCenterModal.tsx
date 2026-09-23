import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Inbox,
  SendHorizontal,
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Lock,
  WifiOff,
  ChevronRight,
  RotateCw,
  Phone,
  Users,
  AlertCircle,
  Check,
  Smartphone
} from 'lucide-react';
import {
  Contact,
  DEMO_CONTACTS,
  Message,
  RecipientPermission,
  SharedHealthData,
  getInboxMessages,
  getOutboxMessages,
  getConversationThread,
  sendMessageToContacts,
  replyToConversation,
  retryFailedRecipient,
  getStoredMessages,
  validateIndianPhoneNumber,
  maskPhoneNumber
} from '../services/communicationService';
import { CommunicationChannel } from '../services/channels/channelTypes';
import { MultiContactShareConsentModal } from './MultiContactShareConsentModal';

interface CommunicationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  patientName?: string;
  initialSelectedData?: SharedHealthData;
  isOffline?: boolean;
}

export const CommunicationCenterModal: React.FC<CommunicationCenterModalProps> = ({
  isOpen,
  onClose,
  patientId = 'P-1001',
  patientName = 'Ramesh Kumar',
  initialSelectedData,
  isOffline = false,
}) => {
  const [activeTab, setActiveTab] = useState<'INBOX' | 'OUTBOX' | 'COMPOSE' | 'THREAD'>('COMPOSE');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Entry Mode Switcher: Manual Phone Entry vs Saved Contacts
  const [composeRecipientMode, setComposeRecipientMode] = useState<'MANUAL_PHONE' | 'SAVED_CONTACTS'>('MANUAL_PHONE');

  // Manual Mobile Number Input
  const [manualPhoneInput, setManualPhoneInput] = useState<string>('9876543210');
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  // Saved Contact Selection
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(['c-doc-anitha']);

  // Health Data Items Checklist
  const [selectedDataKeys, setSelectedDataKeys] = useState<string[]>([
    'symptoms',
    'report',
    'ai_summary',
  ]);

  const [channel, setChannel] = useState<CommunicationChannel>('sms');
  const [customNote, setCustomNote] = useState<string>('');
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  // Thread Reply State
  const [replyText, setReplyText] = useState<string>('');

  // Messages list state
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (isOpen) {
      refreshMessages();
    }
  }, [isOpen]);

  const refreshMessages = () => {
    setMessages(getStoredMessages());
  };

  if (!isOpen) return null;

  const inboxList = messages.filter((m) => m.senderId !== patientId);
  const outboxList = messages.filter(
    (m) => m.senderId === patientId || m.senderId === 'P-1001' || m.senderId === 'ID100'
  );

  const availableDataItems = [
    { key: 'symptoms', label: 'Symptoms' },
    { key: 'report', label: 'Medical Report' },
    { key: 'ai_summary', label: 'AI Health Summary' },
    { key: 'medicines', label: 'Medicine Information' },
    { key: 'handoff', label: 'Doctor Handoff Summary' },
    { key: 'basic_summary', label: 'Basic Health Summary' },
    { key: 'custom', label: 'Custom Message' },
  ];

  const handleToggleContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      if (selectedContactIds.length > 1) {
        setSelectedContactIds(selectedContactIds.filter((c) => c !== id));
      }
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleToggleDataItem = (key: string) => {
    if (selectedDataKeys.includes(key)) {
      setSelectedDataKeys(selectedDataKeys.filter((k) => k !== key));
    } else {
      setSelectedDataKeys([...selectedDataKeys, key]);
    }
  };

  const handlePhoneInputChange = (val: string) => {
    setManualPhoneInput(val);
    if (val.trim()) {
      const res = validateIndianPhoneNumber(val);
      setPhoneError(res.isValid ? undefined : res.error);
    } else {
      setPhoneError('Mobile number is required');
    }
  };

  const prepareSharedData = (): SharedHealthData => {
    const data: SharedHealthData = {};
    if (selectedDataKeys.includes('symptoms')) {
      data.symptoms = initialSelectedData?.symptoms || [
        'High BP (158/96 mmHg)',
        'Dizziness / Fatigue',
        'Blurred vision',
      ];
    }
    if (selectedDataKeys.includes('report')) {
      data.reportTitle = initialSelectedData?.reportTitle || 'Blood Test & Vitals Report';
      data.reportSummary = initialSelectedData?.reportSummary || 'Hb: 10.2 g/dL, Glucose: Elevated';
    }
    if (selectedDataKeys.includes('ai_summary')) {
      data.aiSummary =
        initialSelectedData?.aiSummary ||
        'Patient exhibits Stage 2 Hypertension signs. Recommended doctor evaluation.';
    }
    if (selectedDataKeys.includes('medicines')) {
      data.medicines = initialSelectedData?.medicines || ['Amlodipine 5mg OD', 'Paracetamol 500mg PRN'];
    }
    if (selectedDataKeys.includes('handoff')) {
      data.handoffSummary =
        initialSelectedData?.handoffSummary ||
        'Clinical triage summary prepared for rural telemedicine handoff.';
    }
    if (selectedDataKeys.includes('basic_summary')) {
      data.handoffSummary =
        initialSelectedData?.handoffSummary ||
        'Basic health summary: Male, 54, BP 158/96, Hb 10.2.';
    }
    if (selectedDataKeys.includes('custom') && customNote) {
      data.customText = customNote;
    }
    return data;
  };

  const handleOpenConsentModal = () => {
    if (composeRecipientMode === 'MANUAL_PHONE') {
      const validation = validateIndianPhoneNumber(manualPhoneInput);
      if (!validation.isValid) {
        setPhoneError(validation.error);
        return;
      }
      setPhoneError(undefined);
    }
    setShowConsentModal(true);
  };

  const handleConfirmSend = async () => {
    let finalRecipientIds: string[] = [];
    let customContactsList: Contact[] = [];

    if (composeRecipientMode === 'MANUAL_PHONE') {
      const val = validateIndianPhoneNumber(manualPhoneInput);
      const formattedPhone = val.formatted || manualPhoneInput;
      const customId = `num-${manualPhoneInput.replace(/\D/g, '')}`;
      finalRecipientIds = [customId];
      customContactsList = [
        {
          id: customId,
          name: formattedPhone,
          role: 'Mobile Recipient',
          phone: formattedPhone,
          isAvailable: true,
          isDemo: false,
          avatarBg: 'bg-slate-700 text-white',
        },
      ];
    } else {
      finalRecipientIds = selectedContactIds;
    }

    const permissions: RecipientPermission[] = finalRecipientIds.map((rid) => ({
      recipientId: rid,
      allowedData: selectedDataKeys as any,
    }));

    const contentText = `Medora Health Share: Shared ${selectedDataKeys.length} health items with selected recipient(s). ${
      customNote ? `Note: "${customNote}"` : ''
    }`;

    await sendMessageToContacts({
      senderId: patientId,
      senderName: patientName,
      patientId,
      recipientIds: finalRecipientIds,
      customContacts: customContactsList,
      channel,
      content: contentText,
      sharedData: prepareSharedData(),
      permissions,
      isOffline,
    });

    setShowConsentModal(false);
    refreshMessages();
    setActiveTab('OUTBOX');
  };

  const handleSingleRetry = (messageId: string, recipientId: string) => {
    retryFailedRecipient(messageId, recipientId);
    refreshMessages();
  };

  const handleSendReply = () => {
    if (!selectedConversationId || !replyText.trim()) return;
    replyToConversation(selectedConversationId, patientId, patientName, patientId, replyText.trim());
    setReplyText('');
    refreshMessages();
  };

  const activeThreadMessages = selectedConversationId
    ? getConversationThread(selectedConversationId)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 md:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base md:text-lg tracking-tight">Medora Communication Center</h2>
              <p className="text-xs text-slate-400">
                Manual phone entry, multi-contact sharing, permissions & delivery tracking
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('COMPOSE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'COMPOSE'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-teal-100 text-teal-900 hover:bg-teal-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>+ Send Health Details</span>
            </button>

            <button
              onClick={() => setActiveTab('INBOX')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'INBOX'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Inbox className="w-4 h-4 text-blue-600" />
              <span>Inbox</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                {inboxList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('OUTBOX')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'OUTBOX'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <SendHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Outbox & Sent</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                {outboxList.length}
              </span>
            </button>
          </div>

          <button
            onClick={refreshMessages}
            title="Refresh Messages"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          
          {/* TAB 1: COMPOSE (Manual Phone Entry + Saved Contacts option) */}
          {activeTab === 'COMPOSE' && (
            <div className="space-y-6 max-w-3xl mx-auto bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Send className="w-5 h-5 text-teal-600" />
                    Send Health Details & Reports
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manually enter a mobile number or choose saved contacts
                  </p>
                </div>
                {isOffline && (
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline Mode — Will Queue for Auto-Sync
                  </span>
                )}
              </div>

              {/* Recipient Mode Switcher */}
              <div className="space-y-3">
                <label className="font-black text-xs text-slate-700 uppercase tracking-wider">
                  1. Recipient Selection Method:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setComposeRecipientMode('MANUAL_PHONE')}
                    className={`p-3.5 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      composeRecipientMode === 'MANUAL_PHONE'
                        ? 'border-teal-600 bg-teal-50 text-teal-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-teal-600" />
                    <span>Enter Mobile Number</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposeRecipientMode('SAVED_CONTACTS')}
                    className={`p-3.5 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      composeRecipientMode === 'SAVED_CONTACTS'
                        ? 'border-teal-600 bg-teal-50 text-teal-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Select Saved Contact</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Manual Mobile Number Entry */}
              {composeRecipientMode === 'MANUAL_PHONE' && (
                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
                  <label className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span>Recipient Mobile Number (+91 Indian Standard):</span>
                  </label>

                  <div className="relative">
                    <div className="flex items-center bg-white border border-slate-300 rounded-2xl px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
                      <span className="text-slate-500 font-extrabold text-sm mr-2 border-r border-slate-200 pr-2.5">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={manualPhoneInput}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                        placeholder="9876543210"
                        maxLength={12}
                        className="w-full bg-transparent font-extrabold text-slate-900 text-sm tracking-widest focus:outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                      />
                      {manualPhoneInput && validateIndianPhoneNumber(manualPhoneInput).isValid && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                      )}
                    </div>
                  </div>

                  {phoneError ? (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{phoneError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Enter any valid 10-digit mobile number. Saved contact is not required.
                    </p>
                  )}
                </div>
              )}

              {/* Mode B: Saved Contacts (Multi-Select) */}
              {composeRecipientMode === 'SAVED_CONTACTS' && (
                <div className="space-y-3">
                  <label className="font-black text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Select Saved Contacts ({selectedContactIds.length} selected):</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {DEMO_CONTACTS.map((c) => {
                      const isChecked = selectedContactIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isChecked
                              ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleContact(c.id)}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div>
                              <p className="font-black text-slate-900 text-xs">{c.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {c.role} • {c.phone ? maskPhoneNumber(c.phone) : ''}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {c.isAvailable ? 'Available' : 'Offline'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Select Shared Health Data */}
              <div className="space-y-3">
                <label className="font-black text-xs text-slate-700 uppercase tracking-wider">
                  2. Select Information to Share:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {availableDataItems.map((item) => {
                    const isChecked = selectedDataKeys.includes(item.key);
                    return (
                      <label
                        key={item.key}
                        className={`p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all flex items-center gap-2.5 ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/60 text-blue-950'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDataItem(item.key)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>☐ {item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Note */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-700">
                  Custom Message (Optional):
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Type any additional note or instructions for the recipient..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Step 3: Select Channel */}
              <div className="space-y-2">
                <label className="font-black text-xs text-slate-700 uppercase tracking-wider">
                  3. Select Channel:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      channel === 'sms'
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    📱 SMS Gateway
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('web')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      channel === 'web'
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    🌐 Web Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('ussd')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      channel === 'ussd'
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    📞 USSD / Voice Channel
                  </button>
                </div>
              </div>

              {/* Action Button: Review & Send */}
              <div className="pt-2">
                <button
                  onClick={handleOpenConsentModal}
                  disabled={
                    (composeRecipientMode === 'SAVED_CONTACTS' && selectedContactIds.length === 0) ||
                    selectedDataKeys.length === 0
                  }
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Review & Send</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INBOX */}
          {activeTab === 'INBOX' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-600" />
                  Inbox Messages
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {inboxList.length} message(s)
                </span>
              </div>

              {inboxList.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600 text-sm">No inbox messages yet</p>
                  <p className="text-xs text-slate-400">
                    Incoming messages and replies will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inboxList.map((msg) => (
                    <div
                      key={msg.messageId}
                      className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow">
                            {msg.senderName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{msg.senderName}</h4>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span className="uppercase text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {msg.channel}
                              </span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedConversationId(msg.conversationId);
                            setActiveTab('THREAD');
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200 flex items-center gap-1 transition-colors"
                        >
                          <span>View Thread & Reply</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-medium">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OUTBOX & SENT */}
          {activeTab === 'OUTBOX' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <SendHorizontal className="w-4 h-4 text-emerald-600" />
                  Sent & Shared Health Data (Outbox)
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {outboxList.length} shared message(s)
                </span>
              </div>

              {outboxList.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                  <SendHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600 text-sm">No outbox messages yet</p>
                  <p className="text-xs text-slate-400">
                    Use "+ Send Health Details" to send symptoms, reports, and AI summaries.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outboxList.map((msg) => (
                    <div
                      key={msg.messageId}
                      className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm">Health Details Package</h4>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                              ID: {msg.messageId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Sent at {new Date(msg.createdAt).toLocaleString()} via{' '}
                            <span className="uppercase font-extrabold text-slate-700">{msg.channel}</span>
                          </p>
                        </div>
                      </div>

                      {/* Content summary */}
                      <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {msg.content}
                      </p>

                      {/* Included Shared Items */}
                      {msg.sharedData && (
                        <div className="space-y-1.5 text-xs">
                          <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                            Shared Information:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sharedData.symptoms && (
                              <span className="bg-rose-50 text-rose-800 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-rose-200">
                                🩸 Symptoms
                              </span>
                            )}
                            {msg.sharedData.reportSummary && (
                              <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-blue-200">
                                📋 Medical Report
                              </span>
                            )}
                            {msg.sharedData.aiSummary && (
                              <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-purple-200">
                                🤖 AI Health Summary
                              </span>
                            )}
                            {msg.sharedData.medicines && (
                              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-emerald-200">
                                💊 Medicines Information
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recipient-Level Delivery Status Tracking */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-700 text-xs flex items-center justify-between">
                          <span>Recipient Delivery Statuses ({msg.recipientStatuses.length})</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Delivery tracking active
                          </span>
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {msg.recipientStatuses.map((rs) => {
                            const contactInfo = DEMO_CONTACTS.find((c) => c.id === rs.recipientId) || {
                              name: maskPhoneNumber(rs.recipientId),
                              role: 'Mobile Recipient',
                            };

                            return (
                              <div
                                key={rs.recipientId}
                                className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-slate-800 text-xs">
                                    {contactInfo.name.startsWith('num-')
                                      ? maskPhoneNumber(contactInfo.name.replace('num-', ''))
                                      : contactInfo.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium">{contactInfo.role}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {rs.status === 'DELIVERED' && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      DELIVERED
                                    </span>
                                  )}

                                  {rs.status === 'QUEUED' && (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                                      <WifiOff className="w-3 h-3 text-amber-600" />
                                      QUEUED
                                    </span>
                                  )}

                                  {rs.status === 'FAILED' && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-200">
                                        FAILED
                                      </span>
                                      <button
                                        onClick={() => handleSingleRetry(msg.messageId, rs.recipientId)}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95"
                                      >
                                        <RotateCw className="w-3 h-3" />
                                        <span>Retry</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: THREAD CONVERSATION VIEW */}
          {activeTab === 'THREAD' && (
            <div className="space-y-4 max-w-3xl mx-auto flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 bg-white p-4 rounded-2xl border">
                <button
                  onClick={() => setActiveTab('INBOX')}
                  className="text-xs font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  ← Back to Inbox
                </button>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900 text-xs">Conversation Thread</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ID: {selectedConversationId || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-3xl p-4 md:p-6 border border-slate-200 space-y-4 overflow-y-auto min-h-[300px]">
                {activeThreadMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">Select a message thread to view history.</p>
                ) : (
                  activeThreadMessages.map((m) => {
                    const isMe = m.senderId === patientId || m.senderId === 'P-1001' || m.senderId === 'ID100';
                    return (
                      <div
                        key={m.messageId}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-medium">
                          <span className="font-extrabold text-slate-700">{m.senderName}</span>
                          <span>•</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-tr-none shadow-md'
                              : 'bg-blue-50 text-slate-900 border border-blue-100 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Form */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type reply message..."
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consent Review Modal */}
      <MultiContactShareConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        selectedContacts={
          composeRecipientMode === 'SAVED_CONTACTS'
            ? DEMO_CONTACTS.filter((c) => selectedContactIds.includes(c.id))
            : []
        }
        manualPhoneNumber={
          composeRecipientMode === 'MANUAL_PHONE'
            ? validateIndianPhoneNumber(manualPhoneInput).formatted || manualPhoneInput
            : undefined
        }
        sharedDataItems={availableDataItems.filter((i) => selectedDataKeys.includes(i.key))}
        onConfirmSend={handleConfirmSend}
      />
    </div>
  );
};
