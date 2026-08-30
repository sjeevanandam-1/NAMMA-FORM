import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant.js';
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Trash2,
  User,
  ShieldCheck,
  Languages,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioInput?: boolean;
  createdAt?: string;
}

export const AgriAssistant: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const {
    isListening,
    transcript,
    isSpeaking,
    isSupported,
    voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    clearVoiceError,
  } = useVoiceAssistant();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch persistent conversation history on mount
  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/assistant/history');
      if (res.data.data && res.data.data.length > 0) {
        setMessages(
          res.data.data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            audioInput: m.audioInput,
            createdAt: m.createdAt,
          }))
        );
      } else {
        // Initial welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content:
              language === 'ta'
                ? 'வணக்கம்! நான் நம்ம பார்ம் AI உதவியாளர் (Namma Farm AI Assistant). உரம், பாசனம், நோய் கட்டுப்பாடு, அறுவடை நேரம் அல்லது சந்தை விலை குறித்து உங்கள் கேள்விகளை கேட்கலாம்.'
                : "Hi! I'm Namma Farm AI Assistant. How can I help you with farming today?",
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to load conversation history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Sync speech recognition transcript with input box
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    setError(null);
    clearVoiceError();

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query.trim(),
      audioInput: isListening,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant/chat', {
        message: query.trim(),
        language,
        audioInput: isListening,
      });

      const aiMsg: ChatMessage = {
        id: res.data.data?.message?.id || String(Date.now() + 1),
        role: 'assistant',
        content: res.data.data.response,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak the response if browser supports TTS
      if (isSupported) {
        speakText(res.data.data.response);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'AI Assistant is currently unavailable. Please try again later.'
      );
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: 'AI Assistant is currently unavailable. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    try {
      await api.delete('/ai/assistant/clear');
      setMessages([
        {
          id: 'welcome_reset',
          role: 'assistant',
          content:
            language === 'ta'
              ? 'உரையாடல் வரலாறு அழிக்கப்பட்டது. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?'
              : 'Conversation history cleared. How can I assist your farming today?',
        },
      ]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sampleTamilPills = [
    'என் பயிருக்கு ஏற்ற உரம் மற்றும் அளவு என்ன?',
    'தக்காளி செடியில் இலைகள் மஞ்சளாகிறது. என்ன செய்ய வேண்டும்?',
    'அக்ரிகனெக்ட் மூலம் நேரடி வாங்குபவர்களை எவ்வாறு கண்டறிவது?',
  ];

  const sampleEnglishPills = [
    'What fertilizer schedule is best for my soil and crop?',
    'My tomato leaves have yellow spots. What could be the reason?',
    'When is the optimal time to harvest and sell for highest profit?',
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-card border border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  AI Agricultural Assistant
                </h1>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  TAMIL + ENGLISH VOICE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time conversational crop intelligence & agronomy guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === 'en' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  language === 'ta' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Clear History Button */}
            <button
              onClick={handleClearHistory}
              title="Clear conversation history"
              className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice or General Error Alert */}
        {(voiceError || error) && (
          <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{voiceError || error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                clearVoiceError();
              }}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft flex flex-col h-[560px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Speaker icon for assistant message */}
                  {msg.role === 'assistant' && isSupported && (
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => (isSpeaking ? stopSpeaking() : speakText(msg.content))}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" /> Stop Speaking
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" /> Listen Audio
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing agronomic context and preparing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Pills */}
          <div className="px-6 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="font-bold text-slate-400 shrink-0">Suggestions:</span>
            {(language === 'ta' ? sampleTamilPills : sampleEnglishPills).map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(pill)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg shrink-0 transition-all cursor-pointer font-medium"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Voice & Text Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start microphone speech input'}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Field */}
            <input
              type="text"
              placeholder={
                isListening
                  ? '🎤 Listening to your voice...'
                  : language === 'ta'
                  ? 'உங்கள் விவசாயக் கேள்வியை இங்கே கேட்கவும்...'
                  : 'Ask your agricultural question...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className={`flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 ${
                isListening ? 'focus:ring-red-500 bg-red-50/30' : 'focus:ring-indigo-500'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
