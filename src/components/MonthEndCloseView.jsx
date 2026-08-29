import React, { useState } from 'react';
import { CheckSquare, Volume2, VolumeX, RotateCcw, Lock, CheckCircle2 } from 'lucide-react';
import { generateSarvamSpeech, querySarvamLLM } from '../services/sarvamApi';

const CAT_COLORS = {
  AP:           '#71717a',
  Reconciliation:'#71717a',
  Compliance:   '#f87171',
  Ledger:       '#71717a',
  Taxation:     '#fbbf24',
  'Close Report':'#7c7cfa',
};

export default function MonthEndCloseView({ monthEndTasks, setMonthEndTasks, selectedLang }) {
  const [playing, setPlaying] = useState(false);
  const [brief, setBrief] = useState(
    "August 2026 close is 80% complete. Accounts payable postings and bank reconciliation are finalized. GST input credit reconciliation and depreciation schedules are pending final sign-off before books are locked."
  );
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [locked, setLocked] = useState(false);

  const done  = monthEndTasks.filter(t => t.done).length;
  const total = monthEndTasks.length;
  const pct   = Math.round((done / total) * 100);
  const circ  = pct * 0.879;

  const toggle = id => setMonthEndTasks(monthEndTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const playBrief = async () => {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(false); return; }
    setPlaying(true);
    const url = await generateSarvamSpeech(brief, selectedLang);
    if (url) { const a = new Audio(url); a.onended = () => setPlaying(false); a.play().catch(() => setPlaying(false)); }
    else { const u = new SpeechSynthesisUtterance(brief); u.onend = () => setPlaying(false); window.speechSynthesis?.speak(u); }
  };

  const regenBrief = async () => {
    setLoadingBrief(true);
    const res = await querySarvamLLM(
      `2-sentence CFO briefing for August 2026 close. ${done} of ${total} tasks done. Mention GST and audit readiness.`,
      'Month-End', selectedLang
    );
    setBrief(res);
    setLoadingBrief(false);
  };

  const lockBooks = () => {
    setLocked(true);
    try {
      const confetti = require('canvas-confetti');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#5b5bd6','#22c55e','#a1a1aa'] });
    } catch {}
  };

  return (
    <div className="space-y-4 anim-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-heading flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#52525b]" /> Month-End Close
          </h1>
          <p className="text-body mt-1">Automated 6-step financial close checklist with Sarvam AI voice briefings and digital audit trail.</p>
        </div>
        <button onClick={lockBooks} disabled={locked}
          className={`btn shrink-0 text-[12.5px] py-2 px-5 ${locked ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-positive'}`}>
          <Lock className="w-4 h-4" />
          {locked ? 'Books Locked ✓' : 'Lock August Books'}
        </button>
      </div>

      {/* Progress + Voice card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ring progress */}
        <div className="card p-5 flex items-center gap-5">
          <svg width="72" height="72" viewBox="0 0 36 36" className="-rotate-90 shrink-0">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#5b5bd6" strokeWidth="3"
              strokeDasharray={`${circ} 100`} strokeLinecap="round"
              style={{transition:'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)'}}/>
          </svg>
          <div>
            <p className="stat-num">{pct}%</p>
            <p className="text-body text-[12px] mt-1">{done} of {total} done</p>
            <p className="label mt-1.5">Close Progress</p>
          </div>
        </div>

        {/* Voice briefing */}
        <div className="card p-5 md:col-span-2 space-y-3" style={{borderColor:'rgba(91,91,214,0.2)', background:'#0e0e14'}}>
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-[#fafafa]">Sarvam Bulbul — CFO Voice Briefing</p>
            <button onClick={regenBrief} disabled={loadingBrief} className="btn btn-ghost py-1 px-2 text-[11px]">
              <RotateCcw className={`w-3 h-3 ${loadingBrief ? 'spin-anim' : ''}`} />
              Refresh
            </button>
          </div>
          <blockquote className="text-[13px] text-[#a1a1aa] leading-relaxed border-l-2 border-[#27272a] pl-3">
            {loadingBrief ? <span className="skeleton inline-block w-full h-4" /> : `"${brief}"`}
          </blockquote>
          <button onClick={playBrief}
            className={`btn text-[12px] ${playing ? 'btn-ghost' : 'btn-secondary'}`}>
            {playing ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {playing ? 'Stop Playback' : 'Play Voice Summary'}
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="px-4 py-3" style={{background:'#0c0c0f', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <p className="text-[13px] font-semibold text-[#fafafa]">Financial Close Checklist</p>
        </div>
        <div style={{background:'#09090b'}}>
          {monthEndTasks.map((task, idx) => {
            const col = CAT_COLORS[task.category] || '#71717a';
            return (
              <div key={task.id} onClick={() => toggle(task.id)}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.025] anim-fade-up s${Math.min(idx+1,5)} ${
                  idx !== monthEndTasks.length - 1 ? 'border-b border-white/[0.05]' : ''
                }`}>
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  task.done ? 'border-emerald-500 bg-emerald-500' : 'border-[#3f3f46]'
                }`}>
                  {task.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                {/* Label */}
                <p className={`flex-1 text-[13px] font-medium transition-all ${
                  task.done ? 'line-through text-[#52525b]' : 'text-[#e4e4e7]'
                }`}>{task.task}</p>
                {/* Category */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.automated && (
                    <span className="text-[10px] font-semibold text-[#7c7cfa] bg-[#5b5bd6]/10 border border-[#5b5bd6]/20 px-2 py-0.5 rounded">Auto</span>
                  )}
                  <span className="text-[11px] font-medium" style={{color: col}}>{task.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
