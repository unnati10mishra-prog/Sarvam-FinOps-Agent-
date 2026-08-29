export const INITIAL_INVOICES = [
  {
    id: "INV-2026-0891",
    vendor: "Vortex Digital Systems Pvt Ltd",
    gstin: "27AAACV1234F1Z9",
    category: "IT & Cloud Services",
    date: "2026-08-15",
    dueDate: "2026-08-30",
    amount: 145000,
    cgst: 13050,
    sgst: 13050,
    igst: 0,
    total: 171100,
    status: "Pending Approval",
    riskLevel: "Low",
    confidenceScore: 98,
    matchedPo: "PO-8821",
    lineItems: [
      { description: "AWS Cloud Infrastructure - August 2026", qty: 1, rate: 120000, amount: 120000 },
      { description: "Managed Database Backup Node", qty: 1, rate: 25000, amount: 25000 }
    ]
  },
  {
    id: "INV-2026-0892",
    vendor: "Apex Logistics India Enterprise",
    gstin: "07AABCA5678E1ZM",
    category: "Logistics & Freight",
    date: "2026-08-18",
    dueDate: "2026-09-02",
    amount: 88000,
    cgst: 0,
    sgst: 0,
    igst: 15840,
    total: 103840,
    status: "Approved",
    riskLevel: "Low",
    confidenceScore: 96,
    matchedPo: "PO-8829",
    lineItems: [
      { description: "Interstate Cold Chain Freight (Mumbai - Delhi)", qty: 2, rate: 44000, amount: 88000 }
    ]
  },
  {
    id: "INV-2026-0893",
    vendor: "Global Metal Supplies & Alloys",
    gstin: "24AAACG9999K1ZP",
    category: "Raw Materials",
    date: "2026-08-20",
    dueDate: "2026-08-27",
    amount: 540000,
    cgst: 48600,
    sgst: 48600,
    igst: 0,
    total: 637200,
    status: "Flagged Anomaly",
    riskLevel: "High",
    anomalyReason: "GST rate discrepancy detected: Expected 12%, charged 18%. Potential ₹32,400 overcharge.",
    confidenceScore: 89,
    matchedPo: "PO-8790",
    lineItems: [
      { description: "Aluminum Ingot Grade 1 (5 Metric Tons)", qty: 5, rate: 108000, amount: 540000 }
    ]
  },
  {
    id: "INV-2026-0894",
    vendor: "Nexus Marketing Solutions",
    gstin: "27AABCN4421P1Z3",
    category: "Marketing & Media",
    date: "2026-08-22",
    dueDate: "2026-09-10",
    amount: 220000,
    cgst: 19800,
    sgst: 19800,
    igst: 0,
    total: 259600,
    status: "Pending Approval",
    riskLevel: "Medium",
    anomalyReason: "Vendor bank account changed 2 days ago. Verification required before payout.",
    confidenceScore: 91,
    matchedPo: "PO-8901",
    lineItems: [
      { description: "Q3 Digital Performance Campaign Retainer", qty: 1, rate: 220000, amount: 220000 }
    ]
  },
  {
    id: "INV-2026-0895",
    vendor: "Supreme Facilities & Security",
    gstin: "27AAACS1122H1Z1",
    category: "Facility Management",
    date: "2026-08-01",
    dueDate: "2026-08-15",
    amount: 65000,
    cgst: 5850,
    sgst: 5850,
    igst: 0,
    total: 76700,
    status: "Reconciled & Paid",
    riskLevel: "Low",
    confidenceScore: 99,
    matchedPo: "PO-8700",
    lineItems: [
      { description: "Security Guards & Housekeeping Services", qty: 1, rate: 65000, amount: 65000 }
    ]
  }
];

export const INITIAL_BANK_FEED = [
  {
    id: "TXN-77101",
    date: "2026-08-15",
    description: "UPI/NEFT IN/VORTEX DIGITAL SYSTEMS PVT",
    referenceNo: "NEFT-3991829910",
    amount: -171100,
    type: "Debit",
    suggestedMatch: "INV-2026-0891",
    matchConfidence: 99,
    status: "Auto-Matched"
  },
  {
    id: "TXN-77102",
    date: "2026-08-16",
    description: "CMS CR/RELIANCE RETAIL CONSUMER PAYMENT",
    referenceNo: "CMS-8839210491",
    amount: 450000,
    type: "Credit",
    suggestedMatch: "SO-4410",
    matchConfidence: 95,
    status: "Auto-Matched"
  },
  {
    id: "TXN-77103",
    date: "2026-08-18",
    description: "RTGS OUT/GLOBAL METAL SUPPLIES",
    referenceNo: "RTGS-9928104411",
    amount: -637200,
    type: "Debit",
    suggestedMatch: "INV-2026-0893",
    matchConfidence: 85,
    status: "Flagged",
    note: "Payment initiated but invoice has open GST anomaly flag!"
  },
  {
    id: "TXN-77104",
    date: "2026-08-21",
    description: "NEFT IN/TATA CONSULTANCY RETAINER",
    referenceNo: "NEFT-119283749",
    amount: 1250000,
    type: "Credit",
    suggestedMatch: "AR-9901",
    matchConfidence: 98,
    status: "Auto-Matched"
  },
  {
    id: "TXN-77105",
    date: "2026-08-24",
    description: "POS / PETTY CASH REIMBURSEMENT HDFC",
    referenceNo: "POS-449102",
    amount: -14500,
    type: "Debit",
    suggestedMatch: "VOUCHER-081",
    matchConfidence: 72,
    status: "Unmatched",
    note: "Missing tax receipt. Receipt scan recommended."
  }
];

export const INITIAL_ANOMALIES = [
  {
    id: "ANO-101",
    title: "GST Rate Discrepancy",
    invoiceId: "INV-2026-0893",
    vendor: "Global Metal Supplies & Alloys",
    type: "Tax Violation",
    severity: "High",
    detectedAt: "2026-08-20 14:32",
    details: "Vendor applied 18% CGST+SGST (₹97,200) instead of standard HSN 7204 raw metal rate of 12% (₹64,800). Overbilling variance: ₹32,400.",
    recommendation: "Issue debit note for ₹32,400 or request revised invoice prior to payout release.",
    status: "Open"
  },
  {
    id: "ANO-102",
    title: "Vendor Bank Account Modification Alert",
    invoiceId: "INV-2026-0894",
    vendor: "Nexus Marketing Solutions",
    type: "Fraud Prevention",
    severity: "Medium",
    detectedAt: "2026-08-22 09:15",
    details: "Remittance bank account details changed from ICICI (A/C ...4412) to HDFC (A/C ...9901) without verified vendor confirmation call.",
    recommendation: "Trigger Automated Sarvam AI Call Verification / Vendor OTP confirmation before clearing ₹259,600.",
    status: "Investigating"
  },
  {
    id: "ANO-103",
    title: "Potential Duplicate Payment Voucher",
    invoiceId: "INV-2026-0801",
    vendor: "FastTrack Office Supplies",
    type: "Duplicate Risk",
    severity: "Low",
    detectedAt: "2026-08-25 11:40",
    details: "Transaction of ₹18,500 matches invoice INV-771 earlier processed on 10th August with identical line item descriptions.",
    recommendation: "Block duplicate journal entry and archive voucher.",
    status: "Resolved"
  }
];

export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: "JE-2026-041",
    date: "2026-08-15",
    narrative: "Being AWS Cloud infrastructure expenses recorded for August 2026 per INV-2026-0891",
    debits: [
      { account: "5010 - IT & Software License Expenses", amount: 145000 },
      { account: "1310 - Input CGST Receivable", amount: 13050 },
      { account: "1320 - Input SGST Receivable", amount: 13050 }
    ],
    credits: [
      { account: "2010 - Accounts Payable (Vortex Digital)", amount: 171100 }
    ],
    totalAmount: 171100,
    status: "Posted",
    verifiedBy: "Sarvam AI Finance Agent"
  },
  {
    id: "JE-2026-042",
    date: "2026-08-18",
    narrative: "Being freight and interstate cold chain logistics services booked per INV-2026-0892",
    debits: [
      { account: "5040 - Freight & Carriage Inward", amount: 88000 },
      { account: "1330 - Input IGST Receivable", amount: 15840 }
    ],
    credits: [
      { account: "2010 - Accounts Payable (Apex Logistics)", amount: 103840 }
    ],
    totalAmount: 103840,
    status: "Posted",
    verifiedBy: "Sarvam AI Finance Agent"
  },
  {
    id: "JE-2026-043",
    date: "2026-08-21",
    narrative: "Being retainer income received from TATA Consultancy Services against AR-9901",
    debits: [
      { account: "1010 - HDFC Operating Bank Account", amount: 1250000 }
    ],
    credits: [
      { account: "4010 - Consulting Revenue - IT Solutions", amount: 1250000 }
    ],
    totalAmount: 1250000,
    status: "Draft",
    verifiedBy: "Pending Controller Sign-off"
  }
];

export const INITIAL_MONTH_END_TASKS = [
  { id: 1, task: "Accounts Payable (AP) Invoice Ingestion & GST Validation", category: "AP", done: true, automated: true },
  { id: 2, task: "Bank Statement Feed & Automated Reconciliation", category: "Reconciliation", done: true, automated: true },
  { id: 3, task: "Anomaly Scan & High-Risk Payment Block Check", category: "Compliance", done: true, automated: true },
  { id: 4, task: "Depreciation & Amortization Schedule Journal Posting", category: "Ledger", done: false, automated: false },
  { id: 5, task: "GST Output vs Input Tax Credit (ITC) Offsetting", category: "Taxation", done: false, automated: false },
  { id: 6, task: "Financial Close Audit Pack Generation & Management Briefing", category: "Close Report", done: false, automated: true }
];

export const INDIAN_LANGUAGES = [
  { code: "hi-IN", name: "Hindi (हिंदी)" },
  { code: "en-IN", name: "English (India)" },
  { code: "ta-IN", name: "Tamil (தமிழ்)" },
  { code: "te-IN", name: "Telugu (తెలుగు)" },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
  { code: "mr-IN", name: "Marathi (मराठी)" },
  { code: "gu-IN", name: "Gujarati (ગુજરાતી)" },
  { code: "bn-IN", name: "Bengali (বাংলা)" }
];
