import React from 'react';
import { LayoutDashboard, Receipt, Scale, ShieldAlert, BookOpen, CheckSquare, Cpu } from 'lucide-react';

const MENU = [
  { id: 'dashboard',      label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'invoices',       label: 'AP / AR Invoices',   icon: Receipt },
  { id: 'reconciliation', label: 'Bank Reconciliation', icon: Scale },
  { id: 'anomalies',      label: 'Anomaly Detection',  icon: ShieldAlert, danger: true },
  { id: 'journal',        label: 'Journal Entries',    icon: BookOpen },
  { id: 'month-end',      label: 'Month-End Close',    icon: CheckSquare },
];

export default function Sidebar({ activeTab, setActiveTab, anomalyCount }) {
  return (
    <aside className="sidebar w-56 shrink-0 hidden md:flex flex-col py-4 px-2.5 justify-between">
      {/* Navigation */}
      <nav className="space-y-0.5">
        <p className="label px-2 mb-2.5">Menu</p>
        {MENU.map(({ id, label, icon: Icon, danger }) => {
          const active = activeTab === id;
          const count  = danger ? anomalyCount : 0;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`nav-item ${active ? (danger ? 'active-danger' : 'active') : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {count > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600/80 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Engine Status */}
      <div className="space-y-3">
        <div className="divider" />
        <div className="px-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#5b5bd6]/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-[#7c7cfa]" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#d4d4d8]">Sarvam AI 2.0</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-live" />
                <span className="text-[10px] text-[#52525b]">Engine live</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {['LLM Reasoning', 'Bulbul TTS', 'Vision OCR', 'Speech-to-Text'].map(cap => (
              <div key={cap} className="flex items-center justify-between text-[11px]">
                <span className="text-[#52525b]">{cap}</span>
                <span className="text-emerald-500 font-semibold text-[10px]">Online</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
