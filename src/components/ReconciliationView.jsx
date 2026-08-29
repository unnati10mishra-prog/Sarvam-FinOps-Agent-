import React, { useState } from 'react';
import { Scale, Sparkles, Check } from 'lucide-react';
import { querySarvamLLM } from '../services/sarvamApi';

export default function ReconciliationView({ bankFeed, setBankFeed, invoices, setInvoices, selectedLang }) {
  const [processingId, setProcessingId] = useState(null);
  const [auditLog, setAuditLog] = useState(null);

  const reconcile = async (txn) => {
    setProcessingId(txn.id);
    setBankFeed(bankFeed.map(b => b.id === txn.id ? { ...b, status: 'Auto-Matched' } : b));
    if (txn.suggestedMatch?.startsWith('INV')) {
      setInvoices(invoices.map(i => i.id === txn.suggestedMatch ? { ...i, status: 'Reconciled & Paid' } : i));
    }
    const res = await querySarvamLLM(
      `One sentence audit trail: reconciled bank txn ${txn.id} (₹${Math.abs(txn.amount).toLocaleString('en-IN')}) matched to ${txn.suggestedMatch}.`,
      'Reconciliation', selectedLang
    );
    setAuditLog({ id: txn.id, text: res });
    setProcessingId(null);
  };

  const matched  = bankFeed.filter(b => b.status === 'Auto-Matched').length;
  const matchPct = Math.round((matched / bankFeed.length) * 100);
  const circ     = matchPct * 0.879;

  return (
    <div className="space-y-4 anim-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-heading flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#52525b]" /> Bank Reconciliation Engine
          </h1>
          <p className="text-body mt-1">AI-powered matching of bank statement transactions against your general ledger vouchers.</p>
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-4 shrink-0 card px-5 py-3.5">
          <svg width="52" height="52" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#5b5bd6" strokeWidth="3"
              strokeDasharray={`${circ} 100`} strokeLinecap="round"
              style={{transition:'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)'}}/>
          </svg>
          <div>
            <p className="label">Reconciliation rate</p>
            <p className="stat-num mt-0.5">{matchPct}%</p>
            <p className="text-[11.5px] text-[#52525b] mt-1">{matched} of {bankFeed.length} matched</p>
          </div>
        </div>
      </div>

      {/* Audit log */}
      {auditLog && (
        <div className="card p-4 anim-fade-up" style={{borderColor:'rgba(91,91,214,0.2)', background:'#0e0e14'}}>
          <p className="text-[12px] text-[#71717a] mb-1 font-semibold">Sarvam AI — Audit Trail</p>
          <p className="text-[13px] text-[#e4e4e7]">{auditLog.text}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="px-4 py-3 flex items-center justify-between"
          style={{background:'#0c0c0f', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <p className="text-[13px] font-semibold text-[#fafafa]">Bank Statement vs. General Ledger</p>
          <p className="text-[12px] text-[#52525b]"><span className="text-[#a1a1aa] font-semibold">{matched}</span> of {bankFeed.length} reconciled</p>
        </div>
        <div className="overflow-x-auto" style={{background:'#09090b'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>UTR / Ref</th>
                <th className="text-right">Amount</th>
                <th>Matched to</th>
                <th className="text-center">Confidence</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {bankFeed.map(txn => (
                <tr key={txn.id}>
                  <td>
                    <p className="text-[13px] font-medium text-[#e4e4e7]">{txn.description}</p>
                    <p className="text-mono text-[10.5px] text-[#52525b] mt-0.5">{txn.date} · {txn.type}</p>
                  </td>
                  <td className="text-mono text-[11.5px] text-[#71717a]">{txn.referenceNo}</td>
                  <td className={`text-right font-bold text-[13px] ${txn.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {txn.amount < 0 ? '−' : '+'} ₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <p className="text-mono text-[12px] font-semibold text-[#a1a1aa]">{txn.suggestedMatch}</p>
                    {txn.note && <p className="text-[10.5px] text-amber-400 mt-0.5">{txn.note}</p>}
                  </td>
                  <td className="text-center">
                    <div className="inline-flex flex-col items-center gap-1.5">
                      <span className={`text-[11px] font-semibold ${txn.matchConfidence > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {txn.matchConfidence}%
                      </span>
                      <div className="w-16 h-1 rounded-full bg-[#27272a] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${txn.matchConfidence}%`,
                            background: txn.matchConfidence > 90 ? '#22c55e' : '#f59e0b'
                          }}/>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    {txn.status === 'Auto-Matched' ? (
                      <span className="badge status-green text-[11px]">
                        <Check className="w-3 h-3" /> Matched
                      </span>
                    ) : (
                      <button onClick={() => reconcile(txn)} disabled={processingId === txn.id}
                        className="btn btn-secondary text-[11.5px] py-1.5">
                        {processingId === txn.id ? 'Matching…' : 'Confirm'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
