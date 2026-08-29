import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, Check, X } from 'lucide-react';

const SMAP = { High: 'status-red', Medium: 'status-amber', Low: 'status-green' };

export default function AnomalyDetectionView({ anomalies, setAnomalies }) {
  const [toast, setToast] = useState(null);

  const resolve = (id, msg) => {
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const open = anomalies.filter(a => a.status !== 'Resolved');

  return (
    <div className="space-y-4 anim-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-heading flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#52525b]" /> Anomaly & Compliance Detection
          </h1>
          <p className="text-body mt-1">Real-time scanning for GST violations, duplicate invoices, and vendor payment fraud.</p>
        </div>
        {open.length > 0 && (
          <span className="badge status-red text-[12px] px-3 py-1.5 shrink-0">
            {open.length} active flag{open.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="card p-4 anim-fade-up" style={{borderColor:'rgba(34,197,94,0.25)', background:'rgba(34,197,94,0.05)'}}>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-[13px] text-[#e4e4e7]">{toast}</p>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tax Violations', count: anomalies.filter(a => a.type === 'Tax Violation').length },
          { label: 'Fraud Alerts',   count: anomalies.filter(a => a.type === 'Fraud Prevention').length },
          { label: 'Resolved',       count: anomalies.filter(a => a.status === 'Resolved').length },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <p className="stat-num">{s.count}</p>
            <p className="label mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Anomaly cards */}
      <div className="space-y-3">
        {anomalies.map((item, idx) => {
          const resolved = item.status === 'Resolved';
          return (
            <div key={item.id} className={`card p-5 space-y-4 anim-fade-up s${Math.min(idx+1,5)} ${resolved ? 'opacity-50' : ''}`}
              style={!resolved && item.severity === 'High' ? {borderColor:'rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.025)'} : {}}>

              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${SMAP[item.severity]}`}>{item.severity}</span>
                    <span className="text-mono text-[10.5px] text-[#52525b]">{item.detectedAt}</span>
                  </div>
                  <p className="text-[14px] font-semibold text-[#fafafa]">{item.title}</p>
                  <p className="text-[12px] text-[#71717a]">{item.vendor}</p>
                </div>
                {resolved && (
                  <span className="badge status-green shrink-0"><Check className="w-3 h-3" /> Resolved</span>
                )}
              </div>

              {/* Details */}
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">{item.details}</p>

              {/* AI Recommendation */}
              <div className="p-3.5 rounded-lg text-[12.5px] text-[#a1a1aa] leading-relaxed"
                style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                <span className="text-[#7c7cfa] font-semibold">AI: </span>{item.recommendation}
              </div>

              {/* Actions */}
              {!resolved && (
                <div className="flex items-center gap-2">
                  {item.type === 'Tax Violation' && (
                    <button onClick={() => resolve(item.id, `Debit Note issued for ${item.vendor}. Tax overcharge adjusted.`)}
                      className="btn btn-danger text-[12px]">
                      Issue Debit Note
                    </button>
                  )}
                  {item.type === 'Fraud Prevention' && (
                    <button onClick={() => resolve(item.id, `Vendor verified via OTP. Bank account change approved.`)}
                      className="btn btn-secondary text-[12px]">
                      <PhoneCall className="w-3.5 h-3.5" /> Verify Vendor
                    </button>
                  )}
                  <button onClick={() => resolve(item.id, `Anomaly ${item.id} dismissed.`)}
                    className="btn btn-ghost text-[12px]">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
