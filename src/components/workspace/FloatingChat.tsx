import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';
import { UserAccount } from '../../types/auth';
import { WorkspaceTab } from './Sidebar';
import { generateLogicalAnswer } from '../../utils/aiReasoningEngine';

export interface FloatingChatProps {
  activities?: ActivityItem[];
  currentUser?: UserAccount;
  isLoggedIn?: boolean;
  onNavigateToTab?: (tab: WorkspaceTab) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionTab?: WorkspaceTab;
  actionLabel?: string;
  isTyping?: boolean;
}

const QUICK_TOPICS = [
  { id: 'bebas_refleksi', label: '💡 Mengatasi Malas', query: 'Gimana ya cara mengatasi rasa malas dan menunda pekerjaan secara masuk akal?' },
  { id: 'bebas_sains', label: '🔬 Kenapa Langit Biru?', query: 'Kenapa ya langit warnanya biru pas siang hari, bukan ungu atau hijau?' },
  { id: 'program', label: '📋 Program Kerja Pemuda', query: 'Apa saja 5 pilar program kerja Karang Taruna Manis Jaya dan kegiatannya?' },
  { id: 'tatacara_kta', label: '💳 Cara Buat KTA Digital', query: 'Bagaimana cara mendaftar dan mencetak KTA digital Karang Taruna Manis Jaya?' },
  { id: 'tatacara_surat', label: '✉️ Buat Surat Dinas Resmi', query: 'Bagaimana cara membuat surat dinas resmi dengan barcode dan tanda tangan digital?' },
  { id: 'jadwal', label: '📅 Jadwal & Agenda', query: 'Kapan jadwal kegiatan dan agenda pemuda terdekat di Manis Jaya?' },
  { id: 'bebas_tidur', label: '😴 Kenapa Kita Mengantuk?', query: 'Secara sains, kenapa manusia bisa mengantuk dan wajib tidur?' },
  { id: 'aset', label: '📦 Pinjam Sound / Aset', query: 'Bagaimana prosedur meminjam sound system dan perlengkapan organisasi?' },
  { id: 'bebas_pemimpin', label: '🤝 Pemimpin vs Bos', query: 'Menurutmu, apa perbedaan mendasar antara seorang pemimpin sejati dan bos?' },
];

export const FloatingChat: React.FC<FloatingChatProps> = ({
  activities = [],
  currentUser,
  isLoggedIn = false,
  onNavigateToTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Human thinking stages: 'idle' | 'reading' | 'thinking' | 'typing'
  const [thinkingState, setThinkingState] = useState<'idle' | 'reading' | 'thinking' | 'typing'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Store full texts for fast-forward / skip
  const fullTextMapRef = useRef<Record<string, string>>({});
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialBotWelcome: ChatMessage = {
    id: 'welcome-1',
    sender: 'bot',
    text: `Halo ${currentUser?.name ? currentUser.name : 'Warga'}! 👋\n\nSaya asisten AI resmi Karang Taruna Kelurahan Manis Jaya. Saya siap memberikan jawaban yang **cepat, lugas, dan logis** sesuai pertanyaan Anda.\n\nAnda dapat menanyakan topik apa pun:\n• **Karang Taruna Manis Jaya:** 5 pilar program kerja di 8 RW, tata cara surat dinas resmi & barcode TTD digital, pendaftaran KTA digital, peminjaman aset (sound/tenda), hingga jadwal kegiatan pemuda.\n• **Topik Umum & Logika:** Sains, teknologi, psikologi/cara mengatasi malas, manajemen waktu, hingga penalaran logis sehari-hari.\n\nSilakan sampaikan pertanyaan Anda di bawah!`,
    time: 'Baru saja',
    isTyping: false,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('kt_ai_chat_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({ ...m, isTyping: false }));
        }
      }
    } catch {}
    return [initialBotWelcome];
  });

  // Auto-scroll as text types out or new message arrives
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, thinkingState]);

  // Persist chat history without temporary typing states
  useEffect(() => {
    try {
      const cleanMessages = messages.map((m) => ({ ...m, isTyping: false }));
      localStorage.setItem('kt_ai_chat_history_v1', JSON.stringify(cleanMessages));
    } catch {}
  }, [messages]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Listen to open-ai-chat event from other parts of the app
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.query) {
        handleSendMessage(e.detail.query);
      }
    };
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, [messages, activities, currentUser, isLoggedIn]);

  // Detect relevant workspace tab from response text
  const detectActionTab = (text: string): { actionTab?: WorkspaceTab; actionLabel?: string } => {
    const lower = text.toLowerCase();
    if (lower.includes('surat') || lower.includes('surat menyurat')) {
      return { actionTab: 'surat', actionLabel: 'Buka Menu Surat Menyurat' };
    }
    if (lower.includes('kta') || lower.includes('data anggota') || lower.includes('cetak kta')) {
      return { actionTab: 'anggota', actionLabel: 'Buka Data Anggota & KTA' };
    }
    if (lower.includes('jadwal') || lower.includes('kalender') || lower.includes('agenda')) {
      return { actionTab: 'jadwal', actionLabel: 'Buka Jadwal Kegiatan' };
    }
    if (lower.includes('proposal') || lower.includes('anggaran') || lower.includes('rab')) {
      return { actionTab: 'proposal', actionLabel: 'Buka Proposal & Anggaran' };
    }
    if (lower.includes('aset') || lower.includes('inventaris') || lower.includes('pinjam')) {
      return { actionTab: 'aset', actionLabel: 'Buka Aset Organisasi' };
    }
    if (lower.includes('berita') || lower.includes('warta') || lower.includes('dokumentasi')) {
      return { actionTab: 'berita', actionLabel: 'Buka Berita Kegiatan' };
    }
    if (lower.includes('program kerja') || lower.includes('kegiatan')) {
      return { actionTab: 'ringkasan', actionLabel: 'Buka Katalog Program Kerja' };
    }
    if (lower.includes('voling') || lower.includes('voting') || lower.includes('suara')) {
      return { actionTab: 'voting', actionLabel: 'Buka Voling Anggota' };
    }
    return {};
  };

  /**
   * Fast & Responsive Typing Engine:
   * Streams text quickly so answers appear rapidly, crisply, and without tedious delay.
   */
  const startSlowHumanTyping = (
    botMsgId: string,
    fullText: string,
    actionTab?: WorkspaceTab,
    actionLabel?: string
  ) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    fullTextMapRef.current[botMsgId] = fullText;
    setThinkingState('typing');

    const timeStr = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    // Insert bot message placeholder with empty string
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: 'bot',
        text: '',
        time: timeStr,
        isTyping: true,
        actionTab,
        actionLabel,
      },
    ]);

    let charIndex = 0;
    const totalLength = fullText.length;

    const typeNextKeystroke = () => {
      if (charIndex >= totalLength) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId ? { ...m, text: fullText, isTyping: false } : m
          )
        );
        setThinkingState('idle');
        typingTimeoutRef.current = null;
        return;
      }

      // Fast streaming step (3 to 6 characters per tick)
      const step = Math.min(Math.floor(Math.random() * 3) + 3, totalLength - charIndex);
      charIndex += step;

      const partial = fullText.slice(0, charIndex);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId ? { ...m, text: partial } : m
        )
      );

      // Fast cadence: 8-12ms delay per tick
      const lastChar = fullText[charIndex - 1] || '';
      let delay = 10;
      if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
        delay = 35; // tiny micro-pause at end of sentence
      } else if (lastChar === '\n') {
        delay = 25; // micro-pause at newline
      }

      typingTimeoutRef.current = setTimeout(typeNextKeystroke, delay);
    };

    // Quick start
    typingTimeoutRef.current = setTimeout(typeNextKeystroke, 30);
  };

  // Instant skip / complete typing button
  const handleSkipTyping = (msgId: string) => {
    const full = fullTextMapRef.current[msgId];
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (full) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, text: full, isTyping: false } : m
        )
      );
    }
    setThinkingState('idle');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || thinkingState !== 'idle') return;

    // If currently typing previous message, complete it first
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      setMessages((prev) =>
        prev.map((m) =>
          m.isTyping && fullTextMapRef.current[m.id]
            ? { ...m, text: fullTextMapRef.current[m.id], isTyping: false }
            : m
        )
      );
    }

    const nowStr = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      time: nowStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Quick cognitive transition
    setThinkingState('thinking');

    // Retrieve real agenda items
    const upcomingAgendas = (() => {
      try {
        const saved = localStorage.getItem('kt_agendas_v1');
        if (saved) return JSON.parse(saved);
      } catch {}
      return [];
    })();

    const contextPayload = {
      userName: currentUser?.name || 'Tamu Pengunjung',
      userRole: currentUser?.role || 'Pengunjung Publik',
      isLoggedIn,
      currentNews: activities.slice(0, 5).map((a) => ({
        title: a.title,
        date: a.date,
        category: a.category,
      })),
      upcomingAgendas: upcomingAgendas.slice(0, 5).map((ag: any) => ({
        title: ag.namaKegiatan,
        date: ag.tanggalMulai,
        lokasi: ag.lokasi,
        kategori: ag.kategori,
      })),
      stats: {
        totalNews: activities.length,
        totalAgenda: upcomingAgendas.length,
      },
    };

    const botMsgId = 'bot-' + Date.now();

    try {
      const response = await fetch('/api/ai-chat-karang-taruna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          context: contextPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const resData = await response.json();
      const reply = resData.reply || 'Mohon maaf, silakan ulangi kembali pertanyaan Anda.';
      const { actionTab, actionLabel } = detectActionTab(reply);

      startSlowHumanTyping(botMsgId, reply, actionTab, actionLabel);
    } catch (err) {
      console.warn('AI Chat API fallback activated:', err);
      const reply = generateLocalKarangTarunaReply(query, contextPayload);
      const { actionTab, actionLabel } = detectActionTab(reply);

      startSlowHumanTyping(botMsgId, reply, actionTab, actionLabel);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat percakapan AI?')) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(null);
      setThinkingState('idle');
      fullTextMapRef.current = {};
      setMessages([initialBotWelcome]);
      localStorage.removeItem('kt_ai_chat_history_v1');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    const full = fullTextMapRef.current[id] || text;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const full = fullTextMapRef.current[id] || text;
    const cleanText = full.replace(/[*_#`•]/g, ' ').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to render markdown formatting cleanly even while partially typed
  const renderFormattedText = (raw: string, isTyping?: boolean) => {
    const lines = raw.split('\n');
    return lines.map((line, lIdx) => {
      let cleanLine = line;
      // If typing and an odd number of '**' exists in a line, append temporary '**' so formatting looks clean
      const asterisks = (cleanLine.match(/\*\*/g) || []).length;
      if (isTyping && asterisks % 2 !== 0) {
        cleanLine += '**';
      }

      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lIdx} className="block min-h-[1.3em]">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**') && p.length >= 4) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            if (p.startsWith('`') && p.endsWith('`') && p.length >= 2) {
              return (
                <code key={pIdx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-mono border border-blue-200">
                  {p.slice(1, -1)}
                </code>
              );
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-900/30 border border-blue-400/40 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tanya AI Karang Taruna</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ${
            isOpen
              ? 'bg-slate-800 text-white shadow-slate-900/40 rotate-90'
              : 'bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 text-white shadow-blue-600/40 hover:shadow-blue-600/60 ring-4 ring-blue-500/20'
          }`}
          aria-label="Buka Asisten AI Karang Taruna Manis Jaya"
          title="Tanya AI Karang Taruna (Program, Tatacara & Berita)"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 text-white animate-bounce-subtle" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full" />
            </div>
          )}
        </button>
      </div>

      {/* Interactive AI Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-fadeIn flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'bottom-4 right-4 sm:right-6 left-4 sm:left-auto sm:w-[620px] h-[85vh] max-h-[780px]'
              : 'bottom-22 right-4 sm:right-6 left-4 sm:left-auto sm:w-[440px] h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-4.5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                {thinkingState === 'thinking' ? (
                  <BrainCircuit className="w-5 h-5 text-amber-300 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black tracking-tight leading-tight truncate">
                    Teman Ngobrol (Seperti ChatGPT)
                  </h4>

                  {/* Status Indicator showing human reading/thinking/typing progression */}
                  {thinkingState === 'reading' && (
                    <div className="flex items-center gap-1.5 bg-blue-500/25 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                      <span>Mencerna...</span>
                    </div>
                  )}

                  {thinkingState === 'thinking' && (
                    <div className="flex items-center gap-1.5 bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-ping" />
                      <span>Berpikir...</span>
                    </div>
                  )}

                  {thinkingState === 'typing' && (
                    <div className="flex items-center gap-1.5 bg-amber-400/25 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                      <span>Mengetik santai...</span>
                    </div>
                  )}

                  {thinkingState === 'idle' && (
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Siap Ngobrol
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-blue-200 truncate mt-0.5">
                  {thinkingState === 'typing'
                    ? 'Sedang mengetik jawaban perlahan...'
                    : thinkingState === 'thinking'
                    ? 'Menyusun tanggapan yang hangat & logis...'
                    : thinkingState === 'reading'
                    ? 'Membaca dan memahami pesanmu...'
                    : 'Bisa ngobrol apa saja: sains, kehidupan, teknologi & Karang Taruna'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-white/80">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Hapus Riwayat Percakapan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-colors hidden sm:block cursor-pointer"
                title={isExpanded ? 'Perkecil Jendela' : 'Perbesar Jendela'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Tutup Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Topic Chips Slider */}
          <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSendMessage(topic.query)}
                disabled={thinkingState !== 'idle'}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[85%]">
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className={`w-4 h-4 ${m.isTyping ? 'animate-bounce' : ''}`} />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl space-y-2 leading-relaxed transition-all ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="text-xs sm:text-[13px] leading-relaxed break-words">
                      {renderFormattedText(m.text, m.isTyping)}
                      {/* Blinking Blue Typing Caret */}
                      {m.isTyping && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-600 rounded-xs animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Human typing status bar with fast-forward skip option */}
                    {m.isTyping && (
                      <div className="pt-2 mt-1 flex items-center justify-between border-t border-slate-100/90 gap-2">
                        <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Mengetik perlahan...
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSkipTyping(m.id)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1 border border-blue-200/60"
                          title="Tampilkan teks lengkap tanpa menunggu animasi ketikan"
                        >
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>Langsung Tampilkan Semua</span>
                        </button>
                      </div>
                    )}

                    {/* Interactive Tab Navigation Shortcut (Fades in once typing completes) */}
                    {!m.isTyping && m.actionTab && onNavigateToTab && (
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            onNavigateToTab(m.actionTab!);
                            setIsOpen(false);
                          }}
                          className="w-full px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200/80 cursor-pointer"
                        >
                          <span>{m.actionLabel || 'Buka Menu'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Meta & Action Tools */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400 font-medium">{m.time}</span>
                  {m.sender === 'bot' && !m.isTyping && (
                    <>
                      <button
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Salin Teks Jawaban"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {'speechSynthesis' in window && (
                        <button
                          onClick={() => handleSpeak(m.id, m.text)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title={isSpeaking === m.id ? 'Hentikan Suara' : 'Dengarkan Jawaban'}
                        >
                          {isSpeaking === m.id ? (
                            <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Cognitive Stage Indicator */}
            {(thinkingState === 'reading' || thinkingState === 'thinking') && (
              <div className="flex items-start gap-2 animate-fadeIn">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  {thinkingState === 'thinking' ? (
                    <BrainCircuit className="w-4 h-4 animate-pulse text-amber-300" />
                  ) : (
                    <Bot className="w-4 h-4 animate-bounce" />
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2 text-slate-600">
                  <span className="text-xs font-semibold text-slate-700">
                    {thinkingState === 'reading'
                      ? 'Asisten AI sedang membaca pertanyaan...'
                      : 'Asisten AI sedang memikirkan solusi secara logis...'}
                  </span>
                  <div className="flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-inner"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                thinkingState === 'typing'
                  ? 'Sedang mengetik balasan perlahan...'
                  : thinkingState === 'thinking'
                  ? 'Sedang menimbang dan memikirkan logika...'
                  : thinkingState === 'reading'
                  ? 'Sedang membaca pesan Anda...'
                  : 'Tanyakan apa saja (sains, logika, nasihat hidup, Karang Taruna)...'
              }
              disabled={thinkingState !== 'idle'}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-100 rounded-2xl border border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 disabled:opacity-75"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || thinkingState !== 'idle'}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95 shrink-0"
              title="Kirim Pertanyaan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// Fallback logic in case of network issue - backed by comprehensive reasoning engine
function generateLocalKarangTarunaReply(query: string, context: any): string {
  return generateLogicalAnswer(query, context);
}
