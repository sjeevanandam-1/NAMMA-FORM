import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  PhoneCall,
  Headphones,
  LifeBuoy,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Mic,
  Volume2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const TollFreeSupport: React.FC = () => {
  const { language } = useLanguage();
  const [helplines, setHelplines] = useState<any | null>(null);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // New Ticket Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'SCHEME_SUPPORT',
    priority: 'MEDIUM',
    subject: '',
    description: '',
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    fetchHelplineAndTickets();
  }, []);

  const fetchHelplineAndTickets = async () => {
    try {
      setLoading(true);
      const [helpRes, ticketRes] = await Promise.all([
        api.get('/support/helplines'),
        api.get('/support/my-tickets').catch(() => ({ data: { data: [] } })),
      ]);

      if (helpRes.data?.data) setHelplines(helpRes.data.data);
      if (ticketRes.data?.data) {
        setMyTickets(ticketRes.data.data);
        if (ticketRes.data.data.length > 0) {
          setSelectedTicket(ticketRes.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingTicket(true);
      const res = await api.post('/support/tickets', ticketForm);
      if (res.data?.data) {
        setMyTickets([res.data.data, ...myTickets]);
        setSelectedTicket(res.data.data);
        setShowCreateModal(false);
        setTicketForm({ category: 'SCHEME_SUPPORT', priority: 'MEDIUM', subject: '', description: '' });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create support ticket');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      const res = await api.post(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim(),
      });
      if (res.data?.data) {
        setSelectedTicket({
          ...selectedTicket,
          messages: [...(selectedTicket.messages || []), res.data.data],
        });
        setReplyMessage('');
        fetchHelplineAndTickets();
      }
    } catch (err) {
      console.error('Failed to reply to ticket', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-pink-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-200 text-xs font-semibold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5" />
              {language === 'ta' ? 'இலவச உதவி எண் & AI உதவி' : 'Toll-Free AI Assistance & Helpline'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'விவசாயி உதவி மையம் & ஆதரவு சீட்டுகள்' : 'Farmer Support Desk & Toll-Free Assistance'}
            </h1>
            <p className="text-red-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'கிசான் கால் சென்டர் 1800-180-1551, நம்ம பார்ம் AI குரல் உதவி மற்றும் தொழில்நுட்ப ஆதரவு கோரிக்கைகள்.'
                : 'Direct 24x7 toll-free agricultural support, voice guidance in Tamil/English, and support ticket tracking.'}
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-red-950 font-bold text-sm rounded-2xl transition shadow-lg flex items-center gap-2"
          >
            <LifeBuoy className="w-4 h-4 text-red-600" />
            {language === 'ta' ? '+ புதிய உதவி சீட்டு' : '+ Create Support Ticket'}
          </button>
        </div>

        {/* 4 Toll-Free Helpline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Toll-Free Kisan Call Centre</span>
              <h4 className="text-lg font-bold text-slate-900">1800-180-1551</h4>
            </div>
            <p className="text-xs text-slate-500">6:00 AM - 10:00 PM (All 7 Days) • Tamil, English & Regional</p>
            <a
              href="tel:18001801551"
              className="block w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-center font-bold text-xs rounded-xl transition"
            >
              Call Helpline
            </a>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Namma Farm AI Desk</span>
              <h4 className="text-lg font-bold text-slate-900">1800-889-FARM</h4>
            </div>
            <p className="text-xs text-slate-500">24x7 Instant Voice & Dispute Resolution • Tamil & English</p>
            <a
              href="tel:18008893276"
              className="block w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-center font-bold text-xs rounded-xl transition"
            >
              Call Namma Farm
            </a>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">PM-KISAN DBT Desk</span>
              <h4 className="text-lg font-bold text-slate-900">155261</h4>
            </div>
            <p className="text-xs text-slate-500">9:00 AM - 6:00 PM • Direct Beneficiary Transfer Assistance</p>
            <a
              href="tel:155261"
              className="block w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-center font-bold text-xs rounded-xl transition"
            >
              Call PM-KISAN
            </a>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Disaster & Crop Loss</span>
              <h4 className="text-lg font-bold text-slate-900">1070 / 1077</h4>
            </div>
            <p className="text-xs text-slate-500">24x7 State Emergency Flood & Weather Calamity Control</p>
            <a
              href="tel:1070"
              className="block w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-center font-bold text-xs rounded-xl transition"
            >
              Emergency Control
            </a>
          </div>
        </div>

        {/* Support Tickets System */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          {/* Ticket List (Left 5 Cols) */}
          <div className="lg:col-span-5 border-r border-slate-200 p-5 space-y-3 overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-600" />
              {language === 'ta' ? 'உங்கள் ஆதரவு சீட்டுகள்' : 'Your Support Tickets'}
            </h3>

            {myTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tickets opened yet. Click "+ Create Support Ticket" to get assistance.
              </div>
            ) : (
              myTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-left space-y-2 ${
                    selectedTicket?.id === t.id
                      ? 'bg-rose-50/70 border-rose-400 shadow-sm ring-1 ring-rose-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-rose-700">{t.ticketNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Ticket Conversation Detail (Right 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6">
            {selectedTicket ? (
              <>
                <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-rose-700 uppercase">{selectedTicket.category}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                    <span className="text-xs text-slate-500">Assigned: {selectedTicket.assignedTo}</span>
                  </div>

                  {/* Messages Bubble Stream */}
                  <div className="space-y-3">
                    {(selectedTicket.messages || []).map((msg: any) => {
                      const isUser = msg.senderType === 'USER';
                      return (
                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                              isUser
                                ? 'bg-rose-600 text-white rounded-br-none shadow'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                            }`}
                          >
                            <span className={`text-[10px] font-bold block ${isUser ? 'text-rose-200' : 'text-slate-500'}`}>
                              {isUser ? 'You' : 'Extension Specialist'}
                            </span>
                            <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply to the extension specialist..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select a ticket from the left to view messages.
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Support Ticket</h3>
                  <p className="text-xs text-slate-500">Escalate directly to certified agricultural scientists</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issue Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="SCHEME_SUPPORT">Government Scheme & DBT Support</option>
                    <option value="MSP_PROCUREMENT">MSP Procurement & Center Booking</option>
                    <option value="CROP_DOCTOR_HELP">Crop Disease & Pest Diagnosis Escalation</option>
                    <option value="MARKETPLACE_DISPUTE">Marketplace Order & Payment Issue</option>
                    <option value="GENERAL_ADVISORY">General Agricultural Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subsidy inspection schedule needed"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or issue in detail..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                >
                  {creatingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TollFreeSupport;
