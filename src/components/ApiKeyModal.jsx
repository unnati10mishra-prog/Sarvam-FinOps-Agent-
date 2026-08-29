import React, { useState } from 'react';
import { Key, X, Check, Eye, EyeOff, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/sarvamApi';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [key, setKey] = useState(getStoredApiKey());
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const save = (e) => {
    e.preventDefault();
    setStoredApiKey(key.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4 anim-fade-in">
      <div className="modal-box p-6 w-full max-w-md space-y-5 anim-fade-up">
        <div className="flex items-center justify-between pb-4" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#18181b] flex items-center justify-center">
              <Key className="w-3.5 h-3.5 text-[#71717a]" />
            </div>
            <p className="text-[14px] font-bold text-[#fafafa]">Sarvam AI API Key</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost py-1 px-2"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-body text-[12.5px]">
          Enter your <span className="text-[#fafafa] font-semibold">Sarvam AI api-subscription-key</span> to enable live LLM reasoning, Bulbul TTS, Vision OCR, and Speech-to-Text. Without a key the app runs in demo mode.
        </p>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label block mb-1.5">Subscription Key</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} placeholder="5b2f…a9c1"
                value={key} onChange={e => setKey(e.target.value)} className="input pr-10 text-mono" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-lg text-[12px] text-[#71717a] leading-relaxed"
            style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
            <div className="flex items-center gap-1.5 font-semibold text-[#a1a1aa] mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Stored locally
            </div>
            Key is saved in browser localStorage only. Never sent to third-party servers.
          </div>

          <div className="flex items-center justify-between">
            <a href="https://indus.sarvam.ai" target="_blank" rel="noreferrer"
              className="text-[12px] text-[#7c7cfa] hover:text-[#a5b4fc] transition flex items-center gap-1.5 font-medium">
              Get key at Sarvam Indus <ExternalLink className="w-3 h-3" />
            </a>
            <button type="submit" className={`btn ${saved ? 'btn-positive' : 'btn-accent'} text-[12.5px]`}>
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
