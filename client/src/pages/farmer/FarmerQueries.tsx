import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Upload,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface QueryMessage {
  id: string;
  senderId: string;
  sender: { id: string; name: string; role: string };
  content: string;
  createdAt: string;
}

interface QueryAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
}

interface FarmerQuery {
  id: string;
  category: string;
  crop?: string;
  title: string;
  description: string;
  location: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  attachments: QueryAttachment[];
  messages: QueryMessage[];
}

export const FarmerQueries: React.FC = () => {
  const [queries, setQueries] = useState<FarmerQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<FarmerQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  // New Query Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('PEST_DISEASE');
  const [newCrop, setNewCrop] = useState('Tomato');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('Coimbatore, Tamil Nadu');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchQueries = async () => {
    try {
      const res = await api.get('/queries/my-queries');
      const data = res.data.data || [];
      setQueries(data);
      if (data.length > 0) {
        if (selectedQuery) {
          const updated = data.find((q: FarmerQuery) => q.id === selectedQuery.id);
          setSelectedQuery(updated || data[0]);
        } else {
          setSelectedQuery(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      let attachments: any[] = [];
      if (attachedFile) {
        const formData = new FormData();
        formData.append('image', attachedFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        attachments.push({
          fileUrl: uploadRes.data.data.url,
          fileType: 'IMAGE',
        });
      }

      await api.post('/queries', {
        title: newTitle,
        category: newCategory,
        crop: newCrop,
        description: newDescription,
        location: newLocation,
        attachments,
      });

      setShowModal(false);
      setNewTitle('');
      setNewDescription('');
      setAttachedFile(null);
      await fetchQueries();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit query.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    setIsReplying(true);
    try {
      await api.post(`/queries/${selectedQuery.id}/reply`, {
        content: replyText.trim(),
      });
      setReplyText('');
      await fetchQueries();
    } catch (err: any) {
      alert('Failed to send reply: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsReplying(false);
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (filter === 'ALL') return true;
    return q.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 sm:p-8 rounded-3xl text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              AGRICULTURAL EXTENSION & EXPERT SUPPORT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Farmer Agronomy Query Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Connect directly with regional agricultural officers, Krishi Vigyan Kendra (KVK)
              scientists, and government agronomists.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            Submit New Agronomy Query
          </button>
        </div>

        {/* Query Management Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Query Tickets List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>
              <div className="flex gap-1.5">
                {['ALL', 'OPEN', 'IN_PROGRESS', 'ANSWERED', 'CLOSED'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      filter === tab
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
                  Loading your agronomy queries...
                </div>
              ) : filteredQueries.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 space-y-3">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No queries in this category.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    + Submit your first question
                  </button>
                </div>
              ) : (
                filteredQueries.map((q) => {
                  const isSelected = selectedQuery?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuery(q)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-soft'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {q.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            q.status === 'ANSWERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : q.status === 'CLOSED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">{q.title}</h4>
                      <p className="text-slate-500 line-clamp-2 text-[11px]">{q.description}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Crop: {q.crop || 'General'}</span>
                        <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Conversation Thread */}
          <div className="lg:col-span-7">
            {selectedQuery ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 flex flex-col h-full min-h-[500px]">
                {/* Query Header */}
                <div className="border-b border-slate-100 pb-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ticket #{selectedQuery.id.slice(0, 8)} • {selectedQuery.location}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        selectedQuery.status === 'ANSWERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedQuery.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedQuery.status === 'CLOSED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {selectedQuery.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-slate-900">{selectedQuery.title}</h2>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {selectedQuery.description}
                  </div>

                  {selectedQuery.attachments && selectedQuery.attachments.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                        Uploaded Reference Media:
                      </span>
                      <div className="flex gap-2">
                        {selectedQuery.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block h-20 w-20 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90"
                          >
                            <img
                              src={att.fileUrl}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Conversation Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
                  {selectedQuery.messages && selectedQuery.messages.length > 0 ? (
                    selectedQuery.messages.map((m) => {
                      const isOfficial =
                        m.sender.role === 'GOVERNMENT_OFFICIAL' || m.sender.role === 'ADMIN';
                      return (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl text-xs space-y-1 ${
                            isOfficial
                              ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950 ml-4'
                              : 'bg-slate-100 border border-slate-200 text-slate-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              {isOfficial ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              {m.sender.name} ({m.sender.role.replace('_', ' ')})
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line text-xs">{m.content}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No responses yet. An agricultural officer will review your query shortly.
                    </div>
                  )}
                </div>

                {/* Reply Box */}
                {selectedQuery.status !== 'CLOSED' && (
                  <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Write a follow-up message or clarification..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isReplying || !replyText.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isReplying ? 'Sending...' : 'Reply'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-extrabold text-slate-700 text-base">Select a Query Ticket</h3>
                <p className="text-xs max-w-sm mx-auto">
                  Click on any query from the list to view its complete advisory thread and official
                  responses.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create New Query */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  Submit Agronomy Query
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateQuery} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Query Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PEST_DISEASE">Pest & Crop Disease</option>
                      <option value="SCHEME_SUBSIDY">Government Subsidy / PM-KISAN</option>
                      <option value="SOIL_NUTRIENT">Soil Health & Fertilization</option>
                      <option value="CROP_ADVICE">Sowing & Variety Advisory</option>
                      <option value="GENERAL">General Agricultural Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Associated Crop</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tomato, Rice, Cotton"
                      value={newCrop}
                      onChange={(e) => setNewCrop(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Query Title / Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yellow leaf curl spreading rapidly across 2 acres"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Detailed Problem Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe symptoms, duration, fertilizers applied, and field conditions..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Farm Location Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Optional Photo Attachment */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Optional Photo Attachment
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit to Agricultural Officers'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
