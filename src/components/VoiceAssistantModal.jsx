import React, { useState } from 'react';
import { Mic, MicOff, X, Send, Bot } from 'lucide-react';
import { querySarvamLLM, generateSarvamSpeech } from '../services/sarvamApi';
import { INDIAN_LANGUAGES } from '../data/initialData';

const QUICK = [
  'What is total AP pending?',
  'Any GST anomalies active?',
  'Summarize reconciliation status',
  'Draft journal entry for rent ₹50,000',
];

export default function VoiceAssistantModal({ isOpen, onClose, selectedLang, setSelectedLang }) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your Sarvam Finance Assistant. Ask me anything about invoices, GST, reconciliation, or journal entries — in any Indian language.' }
  ]);
  const [thinking, setThinking] = useState(false);

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice capture not supported. Please type your query.'); return; }
    const rec = new SR();
    rec.lang = selectedLang || 'en-IN';
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onresult = e => setText(Array.from(e.results).map(r => r[0].transcript).join(''));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  const send = async (q) => {
    const query = q || text;
    if (!query?.trim()) return;
    setMessages(m => [...m, { role: 'user', content: query }]);
    setText('');
    setThinking(true);
    const res = await querySarvamLLM(query, 'Voice assistant', selectedLang);
    setThinking(false);
    setMessages(m => [...m, { role: 'ai', content: res }]);
    const url = await generateSarvamSpeech(res, selectedLang);
    if (url) new Audio(url).play().catch(() => {});
    else { const u = new SpeechSynthesisUtterance(res); window.speechSynthesis?.speak(u); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-end md:items-center justify-center md:p-4 anim-fade-in">
      <div className="modal-box rounded-t-2xl md:rounded-2xl w-full md:w-[500px] flex flex-col anim-fade-up" style={{height:'560px'}}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 shrink-0" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5b5bd6] flex items-center justify-center relative">
              <Bot className="w-4.5 h-4.5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111115]" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-[#fafafa]">Sarvam Finance Assistant</p>
              <p className="text-[11px] text-[#52525b]">Multilingual STT + Bulbul TTS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
              className="input text-[11px] py-1.5 px-2.5 w-28">
              {INDIAN_LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#111115]">{l.name}</option>)}
            </select>
            <button onClick={onClose} className="btn btn-ghost py-1 px-2"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} anim-fade-up`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-xl text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#5b5bd6] text-white rounded-br-sm'
                  : 'text-[#d4d4d8] rounded-bl-sm'
              }`}
                style={m.role !== 'user' ? {background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'} : {}}>
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start anim-fade-in">
              <div className="px-4 py-3 rounded-xl rounded-bl-sm text-[13px] text-[#71717a]"
                style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
                Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="px-4 pb-2 shrink-0 flex gap-2 overflow-x-auto">
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => send(q)} className="btn btn-ghost py-1.5 px-3 text-[11px] whitespace-nowrap shrink-0">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 pt-2 shrink-0" style={{borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          {listening && (
            <div className="wave-container justify-center mb-3">
              {[1,2,3,4,5].map(n => <div key={n} className={`wave-bar wave-${n}`} />)}
              <span className="text-[11px] text-[#7c7cfa] ml-2">Listening…</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={startListen}
              className={`btn shrink-0 p-2.5 ${listening ? 'btn-danger' : 'btn-secondary'}`}>
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input type="text" placeholder="Type your financial query…"
              value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(text)}
              className="input flex-1" />
            <button onClick={() => send(text)} className="btn btn-accent shrink-0 p-2.5">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
