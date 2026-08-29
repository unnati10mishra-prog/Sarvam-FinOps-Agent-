import React, { useState } from 'react';
import {
  FileText, Scale, ShieldAlert, CheckCircle2,
  TrendingUp, TrendingDown, ArrowUpRight, Volume2, VolumeX, RotateCcw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { generateSarvamSpeech, querySarvamLLM } from '../services/sarvamApi';

const CHART_DATA = [
  { month: 'Apr', Revenue: 4200000, Expenses: 3100000 },
  { month: 'May', Revenue: 4800000, Expenses: 3400000 },
  { month: 'Jun', Revenue: 5100000, Expenses: 3650000 },
  { month: 'Jul', Revenue: 5900000, Expenses: 3900000 },
  { month: 'Aug', Revenue: 6450000, Expenses: 4120000 },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip px-3.5 py-3">
      <p className="text-[11px] text-[#71717a] font-semibold mb-2">{label} 2026</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 text-[12px]">
          <span className="text-[#a1a1aa]">{p.name}</span>
          <span className="font-bold text-[#fafafa]">₹{(p.value / 100000).toFixed(1)}L</span>
        </div>
      ))}
    </div>
  );
};

const KPI = ({ label, value, sub, icon: Icon, trend, onClick, index }) => (
  <div onClick={onClick}
    className={`card card-interactive p-5 anim-fade-up s${index}`}>
    <div className="flex items-start justify-between mb-4">
      <p className="label">{label}</p>
      <div className="w-8 h-8 rounded-lg bg-[#18181b] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#52525b]" />
      </div>
    </div>
    <p className="stat-num mb-2">{value}</p>
    <div className="flex items-center justify-between">
      <p className="text-[11.5px] text-[#52525b]">{sub}</p>
      {trend != null && (
        <span className={`flex items-center gap-1 text-[11px] font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

export default function Dashboard({ invoices, anomalies, bankFeed, monthEndTasks, setActiveTab, selectedLang }) {
  const [playing, setPlaying] = useState(false);
  const [insight, setInsight] = useState(
    "AP pending stands at ₹12.1L across 5 open invoices. Bank reconciliation is at 80%. One high-priority GST anomaly on Global Metal Supplies requires review before the August books are locked."
  );
  const [loadingInsight, setLoadingInsight] = useState(false);

  const pendingAp   = invoices.filter(i => i.status !== 'Reconciled & Paid').reduce((s, i) => s + i.total, 0);
  const reconPct    = Math.round((bankFeed.filter(b => b.status === 'Auto-Matched').length / bankFeed.length) * 100);
  const openFlags   = anomalies.filter(a => a.status !== 'Resolved').length;
  const closePct    = Math.round((monthEndTasks.filter(t => t.done).length / monthEndTasks.length) * 100);

  const handlePlay = async () => {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(false); return; }
    setPlaying(true);
    const url = await generateSarvamSpeech(insight, selectedLang);
    if (url) {
      const a = new Audio(url);
      a.onended = () => setPlaying(false);
      a.play().catch(() => setPlaying(false));
    } else {
      const u = new SpeechSynthesisUtterance(insight);
      u.onend = () => setPlaying(false);
      window.speechSynthesis?.speak(u);
    }
  };

  const handleRefresh = async () => {
    setLoadingInsight(true);
    const res = await querySarvamLLM(
      `2-sentence CFO briefing: AP ₹${pendingAp.toLocaleString('en-IN')}, reconciliation ${reconPct}%, anomalies ${openFlags}.`,
      'Dashboard', selectedLang
    );
    setInsight(res);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-5">

      {/* ── AI Briefing Bar ────────────────────────── */}
      <div className="card p-5 anim-fade-up" style={{borderColor:'rgba(91,91,214,0.2)', background:'#0e0e14'}}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge status-muted text-[10.5px]">Sarvam AI · August 2026 Briefing</span>
            </div>
            <p className="text-[13.5px] text-[#e4e4e7] leading-relaxed">
              {loadingInsight ? <span className="skeleton inline-block w-72 h-4" /> : `"${insight}"`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleRefresh} disabled={loadingInsight} className="btn btn-ghost text-[11.5px]">
              <RotateCcw className={`w-3.5 h-3.5 ${loadingInsight ? 'spin-anim' : ''}`} />
              Refresh
            </button>
            <button onClick={handlePlay}
              className={`btn text-[11.5px] ${playing ? 'btn-danger' : 'btn-secondary'}`}>
              {playing ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {playing ? 'Stop' : 'Play Briefing'}
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Accounts Payable" value={`₹${(pendingAp/100000).toFixed(1)}L`}
          sub={`${invoices.filter(i => i.status !== 'Reconciled & Paid').length} invoices open`}
          icon={FileText} trend={-3.2} onClick={() => setActiveTab('invoices')} index={1} />
        <KPI label="Reconciled" value={`${reconPct}%`}
          sub={`${bankFeed.filter(b => b.status === 'Auto-Matched').length}/${bankFeed.length} matched`}
          icon={Scale} trend={4.1} onClick={() => setActiveTab('reconciliation')} index={2} />
        <KPI label="Open Flags" value={openFlags}
          sub="Anomalies active"
          icon={ShieldAlert} onClick={() => setActiveTab('anomalies')} index={3} />
        <KPI label="Close Progress" value={`${closePct}%`}
          sub={`${monthEndTasks.filter(t => t.done).length}/${monthEndTasks.length} tasks done`}
          icon={CheckCircle2} trend={2} onClick={() => setActiveTab('month-end')} index={4} />
      </div>

      {/* ── Chart + Activity ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2 anim-fade-up s2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[14px] font-semibold text-[#fafafa]">Revenue vs Expenses</p>
              <p className="text-[12px] text-[#52525b] mt-0.5">Working capital trend · FY 2026</p>
            </div>
            <div className="flex items-center gap-4">
              {[{c:'#5b5bd6', l:'Revenue'},{c:'#3f3f46', l:'Expenses'}].map(({c,l}) => (
                <span key={l} className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                  <span className="w-2 h-2 rounded-full" style={{background:c}} />{l}
                </span>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{top:4,right:4,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b5bd6" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#5b5bd6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3f3f46" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#3f3f46" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="transparent" tick={{fill:'#52525b', fontSize:11}} />
                <YAxis stroke="transparent" tick={{fill:'#52525b', fontSize:11}} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="#5b5bd6" strokeWidth={2} fill="url(#gRev)" />
                <Area type="monotone" dataKey="Expenses" stroke="#3f3f46" strokeWidth={2} fill="url(#gExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity */}
        <div className="card p-5 flex flex-col anim-fade-up s3">
          <p className="text-[13px] font-semibold text-[#fafafa] mb-4">Agent Activity</p>
          <div className="space-y-3 flex-1">
            {[
              { label: 'OCR Completed', desc: 'Vortex Digital — ₹1,71,100 extracted', ok: true },
              { label: 'GST Flag Raised', desc: 'Global Metal Supplies — 18% vs 12%', ok: false },
              { label: '4 of 5 Transactions Matched', desc: 'NEFT/RTGS auto-reconciled', ok: true },
              { label: 'Journal Posted', desc: 'TCS retainer ₹12.5L credited to 4010', ok: true },
            ].map((a, i) => (
              <div key={i} className={`anim-fade-up s${i+1} flex items-start gap-3 p-3 rounded-lg`}
                style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-[12px] font-medium text-[#e4e4e7]">{a.label}</p>
                  <p className="text-[11px] text-[#52525b] mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('invoices')}
            className="btn btn-accent w-full justify-center mt-4 text-[12px]">
            Process Invoices <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
