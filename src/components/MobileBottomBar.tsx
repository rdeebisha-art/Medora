import React from 'react';
import { Home, Heart, Pill, Sparkles, MoreHorizontal, ShieldAlert } from 'lucide-react';

interface MobileBottomBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenEmergency: () => void;
  onOpenMoreMenu: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
  onOpenMoreMenu,
}) => {
  return (
    <>
      {/* Floating Emergency Button for Mobile */}
      <button
        onClick={onOpenEmergency}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce"
        aria-label="Emergency Help"
      >
        <ShieldAlert className="w-6 h-6 text-amber-300" />
        <span className="text-xs font-black tracking-wider uppercase pr-1">Emergency</span>
      </button>

      {/* Fixed Bottom Navigation Bar (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-teal-700 bg-teal-50 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-teal-600' : ''}`} />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'reports' ? 'text-emerald-700 bg-emerald-50 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className={`w-5 h-5 ${activeTab === 'reports' ? 'text-emerald-600' : ''}`} />
          <span>Health</span>
        </button>

        <button
          onClick={() => onSelectTab('medicine')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'medicine' ? 'text-indigo-700 bg-indigo-50 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Pill className={`w-5 h-5 ${activeTab === 'medicine' ? 'text-indigo-600' : ''}`} />
          <span>Medicines</span>
        </button>

        <button
          onClick={() => onSelectTab('ai')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'ai' ? 'text-cyan-700 bg-cyan-50 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'ai' ? 'text-cyan-600 animate-pulse' : ''}`} />
          <span>Medora AI</span>
        </button>

        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-all"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
