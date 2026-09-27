import React, { useState, useEffect } from 'react';
import {
  RecurringSmsTemplate,
  TemplateCategory,
  RecurrenceType,
  smsTemplateService,
} from '../services/sms/smsTemplateService';
import {
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Send,
  X,
} from 'lucide-react';

interface SmsTemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: RecurringSmsTemplate, populatedText: string) => void;
  currentUserContext?: {
    patientName?: string;
    village?: string;
  };
}

const CATEGORIES: { id: TemplateCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Templates' },
  { id: 'MEDICATION', label: 'Medication' },
  { id: 'APPOINTMENT', label: 'Appointments' },
  { id: 'EMERGENCY', label: 'Emergency (108)' },
  { id: 'MATERNAL', label: 'Maternal (102)' },
  { id: 'VACCINATION', label: 'Vaccination' },
  { id: 'DOCTOR_SUMMARY', label: 'Doctor Handoff' },
];

const PLACEHOLDERS = [
  { tag: '{patientName}', label: 'Patient Name' },
  { tag: '{medName}', label: 'Medicine' },
  { tag: '{dose}', label: 'Dose' },
  { tag: '{time}', label: 'Time' },
  { tag: '{date}', label: 'Date' },
  { tag: '{doctorName}', label: 'Doctor' },
  { tag: '{location}', label: 'Clinic/Hospital' },
  { tag: '{village}', label: 'Village' },
  { tag: '{symptom}', label: 'Symptom' },
  { tag: '{vaccineName}', label: 'Vaccine' },
];

export const SmsTemplateManagerModal: React.FC<SmsTemplateManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentUserContext,
}) => {
  const [templates, setTemplates] = useState<RecurringSmsTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State for creating/editing template
  const [form, setForm] = useState<{
    name: string;
    category: TemplateCategory;
    recurrence: RecurrenceType;
    templateText: string;
    description: string;
  }>({
    name: '',
    category: 'MEDICATION',
    recurrence: 'daily',
    templateText: '',
    description: '',
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setIsEditing(false);
      setEditingId(null);
    }
  }, [isOpen]);

  const loadTemplates = () => {
    const list = smsTemplateService.getTemplates();
    setTemplates(list);
  };

  const handleStartCreate = () => {
    setForm({
      name: '',
      category: 'MEDICATION',
      recurrence: 'daily',
      templateText: 'Medora Health: {patientName}, your medicine {medName} is due at {time}. Please take with water.',
      description: '',
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleStartEdit = (t: RecurringSmsTemplate) => {
    setForm({
      name: t.name,
      category: t.category,
      recurrence: t.recurrence,
      templateText: t.templateText,
      description: t.description || '',
    });
    setEditingId(t.id);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.templateText.trim()) {
      alert('Please provide both template name and message template text.');
      return;
    }

    if (editingId) {
      smsTemplateService.updateTemplate(editingId, {
        name: form.name.trim(),
        category: form.category,
        recurrence: form.recurrence,
        templateText: form.templateText.trim(),
        description: form.description.trim(),
      });
      setNotification('Template updated successfully!');
    } else {
      smsTemplateService.saveTemplate({
        name: form.name.trim(),
        category: form.category,
        recurrence: form.recurrence,
        templateText: form.templateText.trim(),
        description: form.description.trim(),
      });
      setNotification('New template saved successfully!');
    }

    loadTemplates();
    setIsEditing(false);
    setEditingId(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this custom template?')) {
      smsTemplateService.deleteTemplate(id);
      loadTemplates();
      setNotification('Template deleted.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleInsertPlaceholder = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      templateText: prev.templateText + (prev.templateText.endsWith(' ') ? '' : ' ') + tag,
    }));
  };

  const handleSelect = (tmpl: RecurringSmsTemplate) => {
    const filled = smsTemplateService.fillPlaceholders(tmpl.templateText, {
      patientName: currentUserContext?.patientName || 'Patient',
      village: currentUserContext?.village || 'Rampur',
    });
    onSelectTemplate(tmpl, filled);
    onClose();
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = activeCategory === 'ALL' || t.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.templateText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Bookmark size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>Manage Recurring SMS Templates</span>
                <span className="text-[10px] bg-slate-800 text-teal-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  {templates.length} Available
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Save and organize recurring clinical messages for rapid 1-click dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New Template</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="bg-teal-950/80 border-b border-teal-800/80 px-4 py-2 text-xs text-teal-300 font-bold flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-teal-400">✕</button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isEditing ? (
            /* Template Creation / Edit Form */
            <div className="space-y-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Edit2 size={15} className="text-teal-400" />
                  <span>{editingId ? 'Edit Recurring Template' : 'Create New Recurring Template'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Template Name <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Daily Metformin Reminder"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TemplateCategory })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="MEDICATION">Medication Adherence</option>
                    <option value="APPOINTMENT">Clinical Appointment</option>
                    <option value="EMERGENCY">Emergency Medical Alert (108)</option>
                    <option value="MATERNAL">Maternal Care (102)</option>
                    <option value="VACCINATION">Immunization Schedule</option>
                    <option value="DOCTOR_SUMMARY">Doctor Clinical Handoff</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Recurrence Schedule</label>
                  <select
                    value={form.recurrence}
                    onChange={(e) => setForm({ ...form, recurrence: e.target.value as RecurrenceType })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="daily">Daily Schedule</option>
                    <option value="weekly">Weekly Schedule</option>
                    <option value="monthly">Monthly Checkup</option>
                    <option value="as_needed">As Needed / Ad-hoc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Purpose / Clinical Note</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of when this SMS is used"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Placeholders */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Insert Dynamic Health Placeholders:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PLACEHOLDERS.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => handleInsertPlaceholder(p.tag)}
                      className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold cursor-pointer transition-all active:scale-95"
                      title={`Insert ${p.label}`}
                    >
                      + {p.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Template Text */}
              <div>
                <label className="block text-slate-400 font-bold mb-1 text-xs">
                  SMS Message Body Template <span className="text-teal-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.templateText}
                  onChange={(e) => setForm({ ...form, templateText: e.target.value })}
                  placeholder="Enter message text with placeholders..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-teal-500 font-sans"
                />
              </div>

              {/* Live Preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Live Populated Preview:
                </span>
                <p className="text-slate-300 text-xs italic">
                  "{smsTemplateService.fillPlaceholders(form.templateText, {
                    patientName: currentUserContext?.patientName || 'Patient',
                  })}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{editingId ? 'Save Changes' : 'Save Template'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Templates List View */
            <div className="space-y-4">
              {/* Category Pills & Search */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates by name, keyword, or medication..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`text-[11px] px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Items */}
              {filteredTemplates.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                  <Bookmark size={28} className="mx-auto text-slate-600" />
                  <p className="text-xs font-bold text-slate-300">No templates found</p>
                  <p className="text-[11px] text-slate-500">
                    Try adjusting your search query or create a new custom template.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTemplates.map((t) => {
                    const filled = smsTemplateService.fillPlaceholders(t.templateText, {
                      patientName: currentUserContext?.patientName || 'Patient',
                      village: currentUserContext?.village || 'Rampur',
                    });

                    return (
                      <div
                        key={t.id}
                        className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 transition-all shadow-xs space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{t.name}</span>
                            {t.isCustom ? (
                              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.2 rounded-full font-bold">
                                Custom
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.2 rounded-full font-medium">
                                Standard
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Clock size={10} />
                              <span className="capitalize">{t.recurrence.replace('_', ' ')}</span>
                            </span>

                            {t.isCustom && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(t)}
                                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                  title="Edit Template"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(t.id, e)}
                                  className="p-1 rounded-lg hover:bg-red-950/60 text-slate-400 hover:text-red-300 cursor-pointer"
                                  title="Delete Template"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {t.description && (
                          <p className="text-[11px] text-slate-400 italic">{t.description}</p>
                        )}

                        <div className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 font-sans leading-relaxed">
                          {filled}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500 font-mono">
                            Category: {t.category}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSelect(t)}
                            className="bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <Send size={12} />
                            <span>Select &amp; Send</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all templates to system defaults?')) {
                smsTemplateService.resetToDefaults();
                loadTemplates();
              }
            }}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Reset to Standard Templates</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
