import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  GraduationCap,
  Search,
  Star,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Camera,
  ChevronRight,
} from 'lucide-react';

export const DirectExpertAccess: React.FC = () => {
  const { language } = useLanguage();
  const [experts, setExperts] = useState<any[]>([]);
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [specFilter, setSpecFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'experts' | 'consultations'>('experts');

  // Booking Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    topic: 'PEST_DISEASE_DIAGNOSIS',
    cropName: 'Tomato',
    problemSummary: 'Observed yellowing of lower leaves and dark concentric rings. Need bio-fungicide advice.',
    cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledSlot: '10:30 AM - 11:00 AM',
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchExperts();
    fetchMyConsultations();
  }, [specFilter, searchQuery]);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (specFilter !== 'ALL') params.specialization = specFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/experts', { params });
      if (res.data?.data) {
        setExperts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch experts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyConsultations = async () => {
    try {
      const res = await api.get('/experts/my-consultations');
      if (res.data?.data) {
        setMyConsultations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch consultations', err);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;
    try {
      setSubmitting(true);
      const res = await api.post('/experts/book', {
        expertProfileId: selectedExpert.id,
        ...bookForm,
      });
      setBookingSuccess(res.data?.data?.consultationNumber || 'Booked');
      fetchMyConsultations();
      setTimeout(() => {
        setShowBookModal(false);
        setBookingSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book consultation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              {language === 'ta' ? 'விவசாய விஞ்ஞானிகள் நேரடி ஆலோசனை' : 'Certified Agronomists & Scientists'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'விஞ்ஞானிகள் & வேளாண் வல்லுநர்கள் ஆலோசனை' : 'Direct Agricultural Expert Access'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'TNAU மற்றும் ICAR பல்கலைக்கழக விஞ்ஞானிகளிடம் பயிர் நோய், பூச்சி தாக்குதல் மற்றும் மண் வளம் குறித்த உடனடி ஆலோசனை பெறுங்கள்.'
                : 'Connect with certified plant pathologists, entomologists, and soil scientists for 1-on-1 consultations and digital prescriptions.'}
            </p>
          </div>

          <div className="flex gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-700/40">
            <button
              onClick={() => setActiveTab('experts')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === 'experts' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Find Experts
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition relative ${
                activeTab === 'consultations'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              My Appointments
              {myConsultations.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-400 text-slate-900 rounded-full font-bold">
                  {myConsultations.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'experts' ? (
          <>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by expert name, institution, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                {[
                  { id: 'ALL', label: 'All Specializations' },
                  { id: 'PLANT_PATHOLOGY', label: 'Plant Pathology (Diseases)' },
                  { id: 'ENTOMOLOGY', label: 'Entomology (Pest Control)' },
                  { id: 'SOIL_SCIENCE', label: 'Soil Fertility & Nutrients' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSpecFilter(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                      specFilter === tab.id
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="p-12 text-center text-slate-400 col-span-3">Loading agricultural scientists...</div>
              ) : experts.length === 0 ? (
                <div className="p-12 text-center text-slate-500 col-span-3 bg-white rounded-3xl border border-slate-200">
                  No experts found matching your search.
                </div>
              ) : (
                experts.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={exp.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                          alt={exp.user?.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <h3 className="text-base font-bold text-slate-900">{exp.user?.name}</h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          </div>
                          <span className="text-xs text-emerald-800 font-semibold block">{exp.title}</span>
                          <span className="text-[11px] text-slate-500 block">{exp.institution}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {exp.rating}
                        </span>
                        <span className="text-slate-500">{exp.experienceYears} Years Exp</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{exp.languagesSpoken}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{exp.bio}</p>

                      <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-950 flex items-center justify-between font-bold">
                        <span>Extension Advisory Fee</span>
                        <span className="text-emerald-700">FREE (Govt Funded)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExpert(exp);
                        setShowBookModal(true);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow"
                    >
                      Book 1-on-1 Consultation
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Appointments Tab */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'உங்கள் விஞ்ஞானி ஆலோசனைகள்' : 'My Expert Consultation Appointments'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Scheduled video/voice slots, crop diagnosis notes, and scientist written prescriptions.
              </p>
            </div>

            {myConsultations.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No consultations booked yet. Select a scientist to schedule an advisory slot.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myConsultations.map((c) => (
                  <div
                    key={c.id}
                    className="p-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50/20 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-800">Booking: {c.consultationNumber}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {c.expertProfile?.user?.name} ({c.expertProfile?.title})
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {c.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5">
                      <div>
                        <strong>Topic:</strong> {c.topic.replace(/_/g, ' ')} ({c.cropName})
                      </div>
                      <div>
                        <strong>Scheduled Slot:</strong> {new Date(c.scheduledDate).toLocaleDateString()} at{' '}
                        {c.scheduledSlot}
                      </div>
                      <div>
                        <strong>Reported Problem:</strong> {c.problemSummary}
                      </div>
                    </div>

                    {c.prescriptionAdvice && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                        <strong className="text-emerald-950 font-bold block">
                          📝 Scientist Prescription & Treatment Advice:
                        </strong>
                        <p className="text-emerald-900 whitespace-pre-line leading-relaxed">{c.prescriptionAdvice}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookModal && selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Book Scientist Advisory Slot</h3>
                  <p className="text-xs text-slate-500">
                    {selectedExpert.user?.name} • {selectedExpert.institution}
                  </p>
                </div>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {bookingSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Consultation Scheduled!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Appointment ID: {bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Advisory Topic</label>
                    <select
                      value={bookForm.topic}
                      onChange={(e) => setBookForm({ ...bookForm, topic: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PEST_DISEASE_DIAGNOSIS">Crop Disease & Pest Diagnosis</option>
                      <option value="SOIL_FERTILITY">Soil Health & Fertigation Plan</option>
                      <option value="CROP_PLANNING">Varietal Selection & Sowing Advice</option>
                      <option value="ORGANIC_CERTIFICATION">Organic & Bio-Farming Certification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Affected Crop</label>
                    <input
                      type="text"
                      required
                      value={bookForm.cropName}
                      onChange={(e) => setBookForm({ ...bookForm, cropName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Observed Symptoms / Question</label>
                    <textarea
                      rows={3}
                      required
                      value={bookForm.problemSummary}
                      onChange={(e) => setBookForm({ ...bookForm, problemSummary: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Scheduled Date</label>
                      <input
                        type="date"
                        required
                        value={bookForm.scheduledDate}
                        onChange={(e) => setBookForm({ ...bookForm, scheduledDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Time Slot</label>
                      <select
                        value={bookForm.scheduledSlot}
                        onChange={(e) => setBookForm({ ...bookForm, scheduledSlot: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                        <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                        <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                        <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submitting ? 'Booking Slot...' : 'Confirm Advisory Appointment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DirectExpertAccess;
