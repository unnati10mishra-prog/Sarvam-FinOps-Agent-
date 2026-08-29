import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Eye, Search, X, Sparkles } from 'lucide-react';
import { extractInvoiceWithSarvam, querySarvamLLM } from '../services/sarvamApi';

const STATUS = {
  'Approved':           'status-green',
  'Flagged Anomaly':    'status-red',
  'Reconciled & Paid':  'status-blue',
  'Pending Approval':   'status-amber',
};

const Badge = ({ status }) => (
  <span className={`badge ${STATUS[status] || 'status-muted'}`}>{status}</span>
);

export default function InvoiceProcessingView({ invoices, setInvoices, onAddJournalEntry, selectedLang }) {
  const [uploading, setUploading] = useState(false);
  const [scan, setScan] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setScan(null); setAnalysis(null);
    const res = await extractInvoiceWithSarvam(file);
    setScan(res);
    setUploading(false);
    const ai = await querySarvamLLM(
      `Validate GST on invoice from ${res.vendor}, total ₹${res.total}. Verify tax rate under Indian GST law. One sentence.`,
      'Invoice audit', selectedLang
    );
    setAnalysis(ai);
  };

  const approve = (inv) => {
    const src = inv || scan;
    if (!src) return;
    if (src === scan) {
      setInvoices([{
        id: scan.invoiceNumber, vendor: scan.vendor, gstin: scan.gstin,
        category: 'Vendor Supply', date: scan.date, dueDate: scan.dueDate,
        amount: scan.amount, cgst: scan.cgst, sgst: scan.sgst, igst: scan.igst,
        total: scan.total, status: 'Approved', riskLevel: scan.riskLevel,
        confidenceScore: scan.confidenceScore, lineItems: scan.lineItems
      }, ...invoices]);
      setScan(null);
    } else {
      setInvoices(invoices.map(i => i.id === src.id ? { ...i, status: 'Approved' } : i));
    }
    onAddJournalEntry({
      id: `JE-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: src.date || new Date().toISOString().split('T')[0],
      narrative: `AP voucher for ${src.vendor}`,
      debits: [
        { account: '5010 - Vendor Services Expense', amount: src.amount },
        ...(src.cgst > 0 ? [{ account: '1310 - Input CGST', amount: src.cgst }] : []),
        ...(src.sgst > 0 ? [{ account: '1320 - Input SGST', amount: src.sgst }] : []),
        ...(src.igst > 0 ? [{ account: '1330 - Input IGST', amount: src.igst }] : []),
      ],
      credits: [{ account: `2010 - Accounts Payable (${src.vendor})`, amount: src.total }],
      totalAmount: src.total, status: 'Posted', verifiedBy: 'Sarvam Vision OCR + LLM'
    });
  };

  const filtered = invoices.filter(i =>
    i.vendor.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.gstin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 anim-fade-in">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#52525b]" /> AP / AR Invoice Processing
          </h1>
          <p className="text-body mt-1">
            Upload vendor invoices — Sarvam Vision OCR extracts GSTIN, line items, and tax breakdown automatically.
          </p>
        </div>
        <label className="btn btn-accent cursor-pointer shrink-0">
          <UploadCloud className="w-4 h-4" />
          Scan Invoice
          <input type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Uploading state */}
      {uploading && (
        <div className="card p-8 text-center space-y-3 anim-fade-up">
          <div className="w-10 h-10 rounded-xl bg-[#18181b] mx-auto flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#7c7cfa] spin-anim" />
          </div>
          <p className="text-[14px] font-semibold text-[#fafafa]">Sarvam Vision OCR is parsing your document</p>
          <p className="text-body text-[12px]">Extracting vendor GSTIN, HSN codes, line items & tax breakdown…</p>
          <div className="w-48 mx-auto h-1 rounded-full bg-[#18181b] overflow-hidden">
            <div className="h-full w-3/5 bg-[#5b5bd6] rounded-full" style={{animation:'shimmer 1.6s ease infinite'}} />
          </div>
        </div>
      )}

      {/* OCR Result */}
      {scan && !uploading && (
        <div className="card p-5 space-y-4 anim-fade-up" style={{borderColor:'rgba(91,91,214,0.25)', background:'#0e0e14'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[13px] font-semibold text-[#fafafa]">Extracted Invoice Data</span>
              <span className="badge status-green text-[10.5px]">Confidence {scan.confidenceScore}%</span>
            </div>
            <button onClick={() => setScan(null)} className="text-[#52525b] hover:text-[#a1a1aa] transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Vendor', val: scan.vendor, sub: scan.gstin, mono: true },
              { label: 'Invoice #', val: scan.invoiceNumber, sub: scan.date },
              { label: 'Taxable Amount', val: `₹${scan.amount.toLocaleString('en-IN')}` },
              { label: 'Total Payable', val: `₹${scan.total.toLocaleString('en-IN')}`, highlight: true },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-lg" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                <p className="label mb-1">{f.label}</p>
                <p className={`font-bold text-[13px] ${f.highlight ? 'text-[#7c7cfa]' : 'text-[#fafafa]'}`}>{f.val}</p>
                {f.sub && <p className={`text-[10.5px] mt-0.5 ${f.mono ? 'text-[#7c7cfa] text-mono' : 'text-[#52525b]'}`}>{f.sub}</p>}
              </div>
            ))}
          </div>

          {analysis && (
            <div className="p-3.5 rounded-lg text-[12px] text-[#a1a1aa] leading-relaxed"
              style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
              <span className="font-semibold text-[#7c7cfa]">AI Tax Audit: </span>{analysis}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => approve(scan)} className="btn btn-positive">
              <CheckCircle2 className="w-4 h-4" /> Approve & Post to Ledger
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.08)'}}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{background:'#0c0c0f', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#3f3f46] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search vendor, GSTIN, invoice #"
              value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 py-2 w-72 text-[12.5px]" />
          </div>
          <p className="text-[12px] text-[#52525b]"><span className="text-[#a1a1aa] font-semibold">{filtered.length}</span> vouchers</p>
        </div>

        <div className="overflow-x-auto" style={{background:'#09090b'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Vendor</th>
                <th>GSTIN</th>
                <th>Category</th>
                <th>Due Date</th>
                <th className="text-right">Taxable</th>
                <th className="text-right">Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td className="text-mono text-[12px] text-[#a1a1aa]">{inv.id}</td>
                  <td className="text-[13px] font-medium text-[#e4e4e7]">{inv.vendor}</td>
                  <td className="text-mono text-[11px] text-[#71717a]">{inv.gstin}</td>
                  <td className="text-[12px] text-[#71717a]">{inv.category}</td>
                  <td className="text-mono text-[11.5px] text-[#71717a]">{inv.dueDate}</td>
                  <td className="text-right text-[12.5px] text-[#a1a1aa]">₹{inv.amount.toLocaleString('en-IN')}</td>
                  <td className="text-right text-[13px] font-bold text-[#fafafa]">₹{inv.total.toLocaleString('en-IN')}</td>
                  <td><Badge status={inv.status} /></td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {inv.status === 'Pending Approval' && (
                        <button onClick={() => approve(inv)}
                          className="btn btn-accent text-[11px] py-1 px-3">Approve</button>
                      )}
                      <button onClick={() => setDetail(inv)}
                        className="btn btn-ghost py-1 px-2 text-[11px]">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 anim-fade-in">
          <div className="modal-box p-6 w-full max-w-lg space-y-4 anim-fade-up">
            <div className="flex items-start justify-between pb-3" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <div>
                <p className="text-mono text-[15px] font-bold text-[#fafafa]">{detail.id}</p>
                <p className="text-[12px] text-[#71717a] mt-0.5">{detail.vendor}</p>
              </div>
              <button onClick={() => setDetail(null)} className="btn btn-ghost py-1.5 px-2"><X className="w-3.5 h-3.5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['GSTIN', detail.gstin, 'mono'],
                ['PO Reference', detail.matchedPo || 'Direct Voucher', null],
                ['Due Date', detail.dueDate, null],
                ['Risk Level', detail.riskLevel || 'Low', null],
              ].map(([l, v, t], i) => (
                <div key={i} className="p-3 rounded-lg" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                  <p className="label mb-1">{l}</p>
                  <p className={`text-[13px] font-semibold text-[#e4e4e7] ${t === 'mono' ? 'text-mono text-[11.5px]' : ''}`}>{v}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="label">Line Items</p>
              {detail.lineItems?.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg text-[12px]"
                  style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div>
                    <p className="font-medium text-[#e4e4e7]">{item.description}</p>
                    <p className="text-[#52525b] mt-0.5">Qty {item.qty} × ₹{item.rate.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="font-bold text-[#fafafa]">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {detail.anomalyReason && (
              <div className="badge status-red p-3 rounded-lg w-full text-[11.5px] block">
                ⚠ {detail.anomalyReason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
