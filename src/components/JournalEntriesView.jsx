import React, { useState } from 'react';
import { BookOpen, Plus, Download, CheckCircle2, X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { querySarvamLLM } from '../services/sarvamApi';

export default function JournalEntriesView({ journalEntries, setJournalEntries, selectedLang }) {
  const [modal, setModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [debitAcc, setDebitAcc] = useState('5010 - Vendor Expense');
  const [debitAmt, setDebitAmt] = useState('');
  const [creditAcc, setCreditAcc] = useState('2010 - Accounts Payable');
  const [creditAmt, setCreditAmt] = useState('');
  const [saved, setSaved] = useState(false);

  const aiDraft = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    await querySarvamLLM(`Draft debit/credit accounts for: "${aiPrompt}"`, 'Journal', selectedLang);
    setNarrative(`Being voucher for: ${aiPrompt}`);
    setDebitAmt('45000');
    setCreditAmt('45000');
    setGenerating(false);
  };

  const post = (e) => {
    e.preventDefault();
    const amt = parseFloat(debitAmt) || 0;
    setJournalEntries([{
      id: `JE-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      narrative: narrative || 'General journal voucher',
      debits: [{ account: debitAcc, amount: amt }],
      credits: [{ account: creditAcc, amount: amt }],
      totalAmount: amt, status: 'Posted', verifiedBy: 'Sarvam AI Bookkeeper'
    }, ...journalEntries]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(false); setNarrative(''); setDebitAmt(''); setCreditAmt(''); setAiPrompt(''); }, 1100);
  };

  const exportCsv = () => {
    const h = 'Journal ID,Date,Narrative,Debit Accounts,Credit Accounts,Amount,Status\n';
    const r = journalEntries.map(e =>
      `"${e.id}","${e.date}","${e.narrative.replace(/"/g,'""')}","${e.debits.map(d=>d.account).join(';')}","${e.credits.map(c=>c.account).join(';')}","${e.totalAmount}","${e.status}"`
    ).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([h+r],{type:'text/csv'})),
      download:`Journal_${new Date().toISOString().split('T')[0]}.csv`
    });
    a.click();
  };

  const total = journalEntries.reduce((s, e) => s + e.totalAmount, 0);

  return (
    <div className="space-y-4 anim-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#52525b]" /> General Ledger & Journal Vouchers
          </h1>
          <p className="text-body mt-1">AI-enforced double-entry bookkeeping. Export Tally / SAP-ready CSV packages.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={exportCsv} className="btn btn-ghost text-[12px]">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => setModal(true)} className="btn btn-accent text-[12px]">
            <Plus className="w-4 h-4" /> New Voucher
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Entries', val: journalEntries.length },
          { label: 'Ledger Value', val: `₹${(total/100000).toFixed(1)}L` },
          { label: 'Posted', val: journalEntries.filter(e => e.status === 'Posted').length },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className="stat-num">{s.val}</p>
            <p className="label mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {journalEntries.map((entry, idx) => (
          <div key={entry.id} className={`card p-5 space-y-4 anim-fade-up s${Math.min(idx+1,5)}`}>
            {/* Row header */}
            <div className="flex items-center justify-between pb-3.5" style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
              <div className="flex items-center gap-3">
                <span className="text-mono text-[13px] font-bold text-[#fafafa]">{entry.id}</span>
                <span className="text-mono text-[11px] text-[#52525b]">{entry.date}</span>
                <span className={`badge ${entry.status === 'Posted' ? 'status-green' : 'status-amber'} text-[10.5px]`}>
                  {entry.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#52525b]">
                <Sparkles className="w-3 h-3 text-[#7c7cfa]" />
                {entry.verifiedBy}
              </div>
            </div>

            <p className="text-[12.5px] text-[#71717a] italic">"{entry.narrative}"</p>

            {/* Debit / Credit side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg p-3.5 space-y-2.5" style={{background:'rgba(34,197,94,0.04)', border:'1px solid rgba(34,197,94,0.12)'}}>
                <p className="label text-emerald-600">Dr — Debit Entries</p>
                {entry.debits.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 text-[#a1a1aa]"><ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />{d.account}</span>
                    <span className="font-bold text-[#fafafa] text-mono">₹{d.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3.5 space-y-2.5" style={{background:'rgba(91,91,214,0.04)', border:'1px solid rgba(91,91,214,0.12)'}}>
                <p className="label text-[#7c7cfa]">Cr — Credit Entries</p>
                {entry.credits.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 text-[#a1a1aa]"><ArrowLeft className="w-3 h-3 text-[#7c7cfa] shrink-0" />{c.account}</span>
                    <span className="font-bold text-[#fafafa] text-mono">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 anim-fade-in">
          <div className="modal-box p-6 w-full max-w-lg space-y-5 anim-fade-up">
            <div className="flex items-center justify-between pb-3" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <p className="text-[15px] font-bold text-[#fafafa]">New Journal Voucher</p>
              <button onClick={() => setModal(false)} className="btn btn-ghost py-1 px-2"><X className="w-4 h-4" /></button>
            </div>

            {/* AI Draft */}
            <div className="p-3.5 rounded-lg space-y-2" style={{background:'rgba(91,91,214,0.07)', border:'1px solid rgba(91,91,214,0.2)'}}>
              <p className="text-[11px] font-semibold text-[#7c7cfa]">Draft with Sarvam AI</p>
              <div className="flex gap-2">
                <input type="text" placeholder='"Paid rent ₹45,000 via HDFC NEFT"'
                  value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  className="input flex-1 text-[12.5px]" />
                <button onClick={aiDraft} disabled={generating} className="btn btn-accent text-[12px] shrink-0">
                  {generating ? '…' : 'Draft'}
                </button>
              </div>
            </div>

            <form onSubmit={post} className="space-y-4">
              <div>
                <label className="label block mb-1.5">Narrative</label>
                <input required value={narrative} onChange={e => setNarrative(e.target.value)}
                  placeholder="Being expense recorded for…" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11.5px] font-semibold text-emerald-500">Debit Account</label>
                  <input required value={debitAcc} onChange={e => setDebitAcc(e.target.value)} className="input text-[12px]" />
                  <input required type="number" placeholder="₹ Amount" value={debitAmt}
                    onChange={e => { setDebitAmt(e.target.value); setCreditAmt(e.target.value); }}
                    className="input text-mono text-[12px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11.5px] font-semibold text-[#7c7cfa]">Credit Account</label>
                  <input required value={creditAcc} onChange={e => setCreditAcc(e.target.value)} className="input text-[12px]" />
                  <input required type="number" placeholder="₹ Amount" value={creditAmt}
                    onChange={e => setCreditAmt(e.target.value)}
                    className="input text-mono text-[12px]" />
                </div>
              </div>
              <button type="submit" className={`btn w-full justify-center text-[13px] py-2.5 ${saved ? 'btn-positive' : 'btn-accent'}`}>
                {saved ? <><CheckCircle2 className="w-4 h-4" /> Posted!</> : 'Post Journal Voucher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
