import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, CheckCircle2 } from 'lucide-react';

export const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Halo Iik Andriyana! Ada yang bisa dibantu terkait pengelolaan data kegiatan, surat menyurat, atau jadwal Karang Taruna Manis Jaya?',
      time: 'Baru saja',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const nowStr = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date());

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: nowStr }]);
    setInputText('');

    setTimeout(() => {
      let reply = 'Catatan Anda telah dicatat dalam sistem notulensi workspace.';
      const lower = userMsg.toLowerCase();
      if (lower.includes('surat') || lower.includes('nomor')) {
        reply = 'Format penomoran surat keluar aktif adalah: [Nomor]/KT-MJ/EXT/[Bulan Romawi]/[Tahun]. Terdapat 3 surat masuk/keluar terdata di tab Surat Menyurat.';
      } else if (lower.includes('kegiatan') || lower.includes('baksos')) {
        reply = 'Dokumentasi Bakti Sosial dan Pengadaan Alat telah terunggah di Beranda. Anda juga bisa mengunggah kegiatan baru melalui tombol "+ Tambah Berita Pertama".';
      } else if (lower.includes('anggota') || lower.includes('pengurus')) {
        reply = 'Total saat ini terdapat 12 anggota aktif terdaftar pada SK Kepengurusan Kelurahan Manis Jaya.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          time: nowStr,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Button (matches the screenshot: round blue button with white chat bubble) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
          aria-label="Buka Chat Ruang Kolaborasi"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.86 7.07-.15.93-.56 2.45-1.74 3.63 0 0 2.36.14 4.54-1.35.43.08.87.12 1.34.12 5.52 0 10-4.03 10-9s-4.48-9-10-9zm-3 10a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm3 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm3 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn flex flex-col h-[460px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  Ruang Kolaborasi Manis Jaya
                </h4>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Sistem Aktif
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik pesan atau pertanyaan..."
              className="flex-1 px-3 py-2 text-xs bg-slate-100 rounded-full border border-transparent focus:border-blue-400 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
