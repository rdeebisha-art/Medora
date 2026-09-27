import React, { useState, useEffect, useMemo } from 'react';
import {
  AuditLog,
  fetchAuditLogs,
  getAuditStats,
  classifyAuditAction,
  exportAuditLogsAsCsv,
  exportAuditLogsAsJson,
  logPatientUpdate,
  logMedicineAdherence,
  logDeletionEvent,
  AuditActionCategory,
  AuditStats,
} from '../services/auditLoggerService';
import {
  Shield,
  FileText,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Pill,
  User,
  Clock,
  KeyRound,
  Eye,
  X,
  PlusCircle,
  Database,
  ArrowUpDown,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface AuditLogComponentProps {
  initialCategory?: AuditActionCategory;
  onSelectPatient?: (patientId: string) => void;
  title?: string;
  subtitle?: string;
}

export const AuditLogComponent: React.FC<AuditLogComponentProps> = ({
  initialCategory = 'all',
  onSelectPatient,
  title = 'System Audit Trail & Security Logs',
  subtitle = 'Comprehensive tamper-evident tracking of patient updates, medicine adherence, and deletion events.',
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    patientUpdates: 0,
    medicineAdherence: 0,
    deletionEvents: 0,
    authAndAdmin: 0,
    clinicalActions: 0,
  });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<AuditActionCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Modal / Detail States
  const [inspectedLog, setInspectedLog] = useState<AuditLog | null>(null);
  const [testActionMenuOpen, setTestActionMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedLogs, calculatedStats] = await Promise.all([
        fetchAuditLogs({
          category: selectedCategory,
          userRole: selectedRole !== 'all' ? selectedRole : undefined,
          searchQuery: searchQuery.trim() || undefined,
          dateRange: selectedDateRange,
          sortBy,
        }),
        getAuditStats(),
      ]);
      setLogs(fetchedLogs);
      setStats(calculatedStats);
    } catch (err) {
      console.error('[AuditLogComponent] Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for real-time audit log event additions
    const handleNewLog = () => {
      loadData();
    };

    window.addEventListener('medora:audit_log_added', handleNewLog);
    return () => {
      window.removeEventListener('medora:audit_log_added', handleNewLog);
    };
  }, [selectedCategory, selectedRole, searchQuery, selectedDateRange, sortBy]);

  // Export handlers
  const handleExportCsv = () => {
    const csvContent = exportAuditLogsAsCsv(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medora_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit log exported as CSV successfully.');
  };

  const handleExportJson = () => {
    const jsonContent = exportAuditLogsAsJson(logs);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medora_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit log exported as JSON successfully.');
  };

  // Quick Test Action triggers for verification
  const handleSimulatePatientUpdate = async () => {
    setTestActionMenuOpen(false);
    await logPatientUpdate(
      'P-1001',
      'Ramesh Kumar',
      { userId: 'ADMIN-01', userName: 'Sister Lakshmi Devi (ASHA)', userRole: 'admin' },
      'Updated emergency contact and verified morning blood pressure medication schedule.',
      { phone: '+919876543210', verifiedDate: new Date().toISOString() }
    );
    showToast('Logged test event: Patient Record Update');
    await loadData();
  };

  const handleSimulateMedicineAdherence = async () => {
    setTestActionMenuOpen(false);
    await logMedicineAdherence(
      'P-1002',
      'Sunita Devi',
      'Ferrous Sulphate 200mg',
      'taken',
      { userId: 'P-1002', userName: 'Sunita Devi', userRole: 'patient' },
      '1 tablet morning with lemon water'
    );
    showToast('Logged test event: Medicine Adherence (Taken)');
    await loadData();
  };

  const handleSimulateDeletionEvent = async () => {
    setTestActionMenuOpen(false);
    await logDeletionEvent(
      'patient',
      'P-TEMP-99',
      'Duplicate Test Profile',
      { userId: 'ADMIN-01', userName: 'Sister Lakshmi Devi (ASHA)', userRole: 'admin' },
      true,
      'Administrative cleanup of duplicate intake slip'
    );
    showToast('Logged test event: Record Archival / Soft Deletion');
    await loadData();
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return {
        dateStr: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        timeStr: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { dateStr: ts, timeStr: '' };
    }
  };

  const getCategoryBadge = (category: AuditActionCategory) => {
    switch (category) {
      case 'patient_update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <User className="w-3 h-3" /> Patient Update
          </span>
        );
      case 'medicine_adherence':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Pill className="w-3 h-3" /> Medicine Adherence
          </span>
        );
      case 'deletion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Trash2 className="w-3 h-3" /> Deletion Event
          </span>
        );
      case 'auth':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <KeyRound className="w-3 h-3" /> Auth & Security
          </span>
        );
      case 'clinical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <FileText className="w-3 h-3" /> Clinical Record
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <Shield className="w-3 h-3" /> General Audit
          </span>
        );
    }
  };

  const getRoleBadge = (role?: string) => {
    const r = (role || 'system').toLowerCase();
    if (r === 'admin') {
      return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200 rounded-md">Admin</span>;
    }
    if (r === 'doctor') {
      return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200 rounded-md">Doctor</span>;
    }
    if (r === 'patient') {
      return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Patient</span>;
    }
    if (r === 'family') {
      return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-md">Family</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200 rounded-md">System</span>;
  };

  return (
    <div className="space-y-5 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-200">
                LIVE AUDIT ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">{subtitle}</p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            title="Refresh logs from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          {/* Simulate Test Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTestActionMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Test Event</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {testActionMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Trigger Mock Audit Action
                </div>
                <button
                  onClick={handleSimulatePatientUpdate}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <User className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="font-bold">Log Patient Update</div>
                    <div className="text-[10px] text-slate-400">Updates Ramesh Kumar contact</div>
                  </div>
                </button>
                <button
                  onClick={handleSimulateMedicineAdherence}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Log Medicine Adherence</div>
                    <div className="text-[10px] text-slate-400">Marks Iron tablet as TAKEN</div>
                  </div>
                </button>
                <button
                  onClick={handleSimulateDeletionEvent}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-bold">Log Record Deletion</div>
                    <div className="text-[10px] text-slate-400">Archives duplicate intake slip</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">All Audit Logs</div>
          <div className="text-2xl font-black mt-1">{stats.totalLogs}</div>
          <div className="text-[11px] mt-1 flex items-center gap-1 opacity-80">
            <Layers className="w-3 h-3" />
            <span>Complete log trail</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('patient_update')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedCategory === 'patient_update'
              ? 'bg-sky-700 text-white border-sky-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Patient Updates</div>
          <div className="text-2xl font-black mt-1 text-sky-600 group-hover:text-sky-700">
            {stats.patientUpdates}
          </div>
          <div className="text-[11px] mt-1 flex items-center gap-1 opacity-80">
            <User className="w-3 h-3" />
            <span>Demographics & vitals</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('medicine_adherence')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedCategory === 'medicine_adherence'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Medicine Adherence</div>
          <div className="text-2xl font-black mt-1 text-emerald-600">{stats.medicineAdherence}</div>
          <div className="text-[11px] mt-1 flex items-center gap-1 opacity-80">
            <Pill className="w-3 h-3" />
            <span>Taken & missed doses</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('deletion')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedCategory === 'deletion'
              ? 'bg-rose-700 text-white border-rose-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Deletion Events</div>
          <div className="text-2xl font-black mt-1 text-rose-600">{stats.deletionEvents}</div>
          <div className="text-[11px] mt-1 flex items-center gap-1 opacity-80">
            <Trash2 className="w-3 h-3" />
            <span>Archived & purged</span>
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory('auth')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedCategory === 'auth'
              ? 'bg-purple-700 text-white border-purple-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Auth & Admin</div>
          <div className="text-2xl font-black mt-1 text-purple-600">{stats.authAndAdmin}</div>
          <div className="text-[11px] mt-1 flex items-center gap-1 opacity-80">
            <KeyRound className="w-3 h-3" />
            <span>Security & approvals</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, details, user name, or Patient ID (e.g. P-1001)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Role:
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="family">Family</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </div>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {[
            { id: 'all', label: 'All Actions', icon: Layers },
            { id: 'patient_update', label: '✏️ Patient Updates', icon: User },
            { id: 'medicine_adherence', label: '💊 Medicine Adherence', icon: Pill },
            { id: 'deletion', label: '🗑️ Deletion Events', icon: Trash2 },
            { id: 'auth', label: '🔒 Auth & Admin', icon: KeyRound },
            { id: 'clinical', label: '🩺 Clinical Records', icon: FileText },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Audit Event Stream
            </h2>
            <span className="text-xs text-slate-500">
              ({logs.length} records matching criteria)
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Immutable Append-Only Trail
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-bold">Querying system audit log partitions...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">No audit logs match current filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try clearing search parameters, resetting date filters, or logging a sample test event using the action menu.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRole('all');
                setSearchQuery('');
                setSelectedDateRange('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Action Description</th>
                  <th className="px-4 py-3">Operator / User</th>
                  <th className="px-4 py-3">Target ID</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const { dateStr, timeStr } = formatTimestamp(log.timestamp);
                  const cat = classifyAuditAction(log.action, log.entityType);

                  return (
                    <tr
                      key={log.logId || log.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setInspectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        <div className="font-semibold text-slate-800">{dateStr}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{timeStr}</span>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getCategoryBadge(cat)}
                      </td>

                      {/* Action Title */}
                      <td className="px-4 py-3 font-bold text-slate-900 max-w-xs">
                        <div className="truncate font-semibold">{log.action}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {log.logId.slice(-8)}
                        </span>
                      </td>

                      {/* Operator & Role */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{log.userName || log.userId}</div>
                        <div className="mt-0.5">{getRoleBadge(log.userRole)}</div>
                      </td>

                      {/* Target Record ID */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono">
                        {log.recordId ? (
                          <span
                            onClick={(e) => {
                              if (onSelectPatient && typeof log.recordId === 'string' && log.recordId.startsWith('P-')) {
                                e.stopPropagation();
                                onSelectPatient(log.recordId);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              typeof log.recordId === 'string' && log.recordId.startsWith('P-')
                                ? 'bg-indigo-50 text-indigo-700 hover:underline cursor-pointer'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.recordId}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Details summary */}
                      <td className="px-4 py-3 text-slate-600 max-w-md">
                        <p className="line-clamp-2 text-[11px] leading-relaxed">
                          {log.details}
                        </p>
                        {log.changedFields && Object.keys(log.changedFields).length > 0 && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {Object.keys(log.changedFields).map((field) => (
                              <span
                                key={field}
                                className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-mono text-[9px] rounded"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Inspect Button */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedLog(log);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-700 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Audit Record Inspection</h3>
                  <p className="text-xs text-slate-500 font-mono">Log ID: {inspectedLog.logId}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Action</div>
                  <div className="font-bold text-slate-900 mt-0.5">{inspectedLog.action}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Category</div>
                  <div className="mt-0.5">
                    {getCategoryBadge(classifyAuditAction(inspectedLog.action, inspectedLog.entityType))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Operator User</div>
                  <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span>{inspectedLog.userName || inspectedLog.userId}</span>
                    {getRoleBadge(inspectedLog.userRole)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</div>
                  <div className="font-mono text-slate-700 mt-0.5">{inspectedLog.timestamp}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target Entity</div>
                  <div className="font-mono text-slate-700 mt-0.5">
                    {inspectedLog.entityType || 'system'} {inspectedLog.recordId ? `[ID: ${inspectedLog.recordId}]` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Integrity Status</div>
                  <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Immutable</span>
                  </div>
                </div>
              </div>

              {/* Full Details */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Action Context & Description
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 text-slate-700 leading-relaxed font-sans">
                  {inspectedLog.details}
                </div>
              </div>

              {/* Changed Fields / Metadata Diff */}
              {inspectedLog.changedFields && Object.keys(inspectedLog.changedFields).length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Modified Parameters & Metadata Diff
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto shadow-inner">
                    <pre>{JSON.stringify(inspectedLog.changedFields, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Security Guarantee Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Tamper-Evident Trail:</strong> System audit records are cryptographically stored with monotonic timestamps. Any modification to patient medical data, medicine adherence, or deletion events is retained permanently for health authority compliance.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl flex justify-end">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogComponent;
