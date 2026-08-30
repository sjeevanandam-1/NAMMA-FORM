import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import {
  Landmark,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Sprout,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const GovernmentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState<any[]>([]);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const fetchQueries = async () => {
    try {
      const qRes = await api.get('/queries');
      setQueries(qRes.data.data || []);
    } catch (err) {
      console.error('Error fetching government queries:', err);
    }
  };

  const handleReply = async (queryId: string) => {
    const content = replyMap[queryId];
    if (!content || !content.trim()) return;

    setReplyingId(queryId);
    try {
      await api.post(`/queries/${queryId}/reply`, { content: content.trim() });
      setReplyMap((prev) => ({ ...prev, [queryId]: '' }));
      await fetchQueries();
    } catch (err: any) {
      alert('Failed to send advisory: ' + (err.response?.data?.message || err.message));
    } finally {
      setReplyingId(null);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [res, qRes] = await Promise.all([
          api.get('/government/analytics?state=Tamil Nadu'),
          api.get('/queries'),
        ]);
        setData(res.data.data);
        setQueries(qRes.data.data || []);
      } catch (err) {
        console.error('Error loading government analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-400">
        Loading Government Surveillance & Agricultural Analytics...
      </div>
    );
  }

  const { kpis, cropProductionData, diseaseAlerts, aiInsights } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 p-6 sm:p-8 rounded-3xl text-white shadow-card border border-purple-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Landmark className="w-3.5 h-3.5 text-purple-400" />
              STATE AGRICULTURAL SURVEILLANCE & POLICY DASHBOARD
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Department of Agricultural Marketing — Tamil Nadu
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Real-time regional crop yields, supply stability indices, and disease outbreak surveillance
            </p>
          </div>

          <div className="bg-purple-950/60 p-3.5 rounded-2xl border border-purple-700/60 text-xs text-right space-y-1">
            <span className="text-purple-300 font-bold block">Official Jurisdiction:</span>
            <strong className="text-white">Tamil Nadu (All 38 Districts)</strong>
          </div>
        </div>

        {/* Aggregate KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-semibold text-slate-500 block">Registered Farmers</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {kpis.totalRegisteredFarmers}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              100% Land Registry Verified
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-semibold text-slate-500 block">Total Crop Volume</span>
            <p className="text-3xl font-extrabold text-purple-700 mt-1">
              {kpis.totalProductionTons} Tons
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Active Trade Listings
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-semibold text-slate-500 block">Verified Buyers</span>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">
              {kpis.totalVerifiedBuyers}
            </p>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              Retailers & Exporters
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <span className="text-xs font-semibold text-slate-500 block">Active Plant Scans</span>
            <p className="text-3xl font-extrabold text-teal-600 mt-1">
              {kpis.activeSurveillanceScans}
            </p>
            <span className="text-[11px] text-teal-700 font-semibold mt-1 block">
              Crop Doctor AI Scans
            </span>
          </div>
        </div>

        {/* Production Volume Chart & Disease Surveillance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Production Volume Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Regional Crop Yield Volume Breakdown (Tons)
                </h3>
                <p className="text-xs text-slate-500">Aggregated from active farmgate listings</p>
              </div>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                LIVE AGGREGATE
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropProductionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cropName" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="volumeTons" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Volume (Tons)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disease Outbreak Surveillance Map / List */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Disease Outbreak Radar</h3>
                <p className="text-xs text-slate-500">Active Crop Doctor scan clusters</p>
              </div>
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                SURVEILLANCE
              </span>
            </div>

            <div className="space-y-3">
              {diseaseAlerts.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {item.district} • {item.crop}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.severity === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Pathogen: <strong className="text-slate-800">{item.disease}</strong> ({item.reportedCases} cluster scans)
                  </p>
                  <span className="text-[10px] text-purple-700 font-semibold block">
                    KVK Advisory Broadcast: {item.advisorySent ? 'Dispatched' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* GOVERNMENT AI INSIGHTS ENGINE */}
        {/* -------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Government AI Agricultural Intelligence
              </h3>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                AI GENERATED — VERIFIED DATASET BACKED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated econometric and epidemiological alerts computed from real transaction & scan streams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights.map((ins: any) => (
              <div
                key={ins.id}
                className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {ins.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ins.impactLevel === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : ins.impactLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ins.impactLevel} IMPACT
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{ins.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ins.summary}</p>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <strong className="text-slate-900 block mb-0.5">Recommended Policy Action:</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{ins.recommendedAction}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 space-y-0.5">
                  <p>Data Period: {ins.dataPeriod}</p>
                  <p>Source: {ins.dataSource}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* FARMER SUPPORT TICKETS & EXTENSION ADVISORY QUEUE */}
        {/* -------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Regional Farmer Agronomy Queries & Extension Tickets
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Farmers needing expert diagnosis, subsidy guidance, or agricultural department response
              </p>
            </div>
            <button
              onClick={fetchQueries}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-all cursor-pointer self-start sm:self-auto"
            >
              Refresh Queries
            </button>
          </div>

          <div className="space-y-4">
            {queries.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active farmer queries in your regional jurisdiction.
              </div>
            ) : (
              queries.map((q: any) => (
                <div
                  key={q.id}
                  className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                        {q.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">
                        Farmer: <strong>{q.farmer?.name || 'Farmer'}</strong> ({q.farmer?.phone}) • {q.location}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        q.status === 'ANSWERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{q.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{q.description}</p>
                  </div>

                  {/* Messages History */}
                  {q.messages && q.messages.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Thread History:
                      </span>
                      {q.messages.map((m: any) => (
                        <div
                          key={m.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <strong>{m.sender?.name} ({m.sender?.role})</strong>
                            <span className="text-slate-400">
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line">{m.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReply(q.id);
                    }}
                    className="flex gap-2 pt-2"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Write official agricultural advisory response..."
                      value={replyMap[q.id] || ''}
                      onChange={(e) =>
                        setReplyMap({ ...replyMap, [q.id]: e.target.value })
                      }
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={replyingId === q.id || !replyMap[q.id]?.trim()}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {replyingId === q.id ? 'Sending...' : 'Send Advisory'}
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
