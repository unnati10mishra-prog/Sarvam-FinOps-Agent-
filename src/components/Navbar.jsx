import React from 'react';
import { Bot, Key, Globe, Mic, AlertTriangle, Activity } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../data/initialData';
import { getStoredApiKey } from '../services/sarvamApi';

export default function Navbar({ selectedLang, setSelectedLang, onOpenApiKeyModal, onOpenVoiceModal, anomalyCount }) {
  const hasKey = !!getStoredApiKey();

  return (
    <header className="topbar h-14 px-5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-[#5b5bd6] flex items-center justify-center shadow-sm">
          <Bot className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#fafafa] leading-none tracking-tight">Sarvam FinOps</p>
          <p className="text-[10.5px] text-[#52525b] mt-0.5 leading-none font-medium">Finance Operations Agent</p>
        </div>
      </div>

      {/* Centre live indicator */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
        <Activity className="w-3.5 h-3.5 text-[#52525b]" />
        <span className="text-[11.5px] text-[#71717a] font-medium">Financial Intelligence</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-live" />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* API key */}
        <button onClick={onOpenApiKeyModal}
          className={`btn btn-ghost text-[11.5px] ${hasKey ? 'text-emerald-400' : ''}`}>
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{hasKey ? 'API Connected' : 'Add API Key'}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-[#3f3f46]'}`} />
        </button>

        {/* Language */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] text-[#71717a] font-medium cursor-pointer hover:bg-white/[0.04] transition border border-transparent hover:border-white/[0.08]">
          <Globe className="w-3.5 h-3.5 text-[#52525b] shrink-0" />
          <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer w-24">
            {INDIAN_LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#111115]">{l.name}</option>)}
          </select>
        </div>

        {/* Voice */}
        <button onClick={onOpenVoiceModal} className="btn btn-accent text-[11.5px]">
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voice Agent</span>
        </button>

        {/* Anomaly count */}
        {anomalyCount > 0 && (
          <div className="relative">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>
              <AlertTriangle className="w-3.5 h-3.5 text-[#f87171]" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
              {anomalyCount}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
