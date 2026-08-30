import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Droplets,
  Sprout,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const CropCalendarPage: React.FC = () => {
  const { language } = useLanguage();
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // New Calendar Form Modal
  const [showModal, setShowModal] = useState(false);
  const [calForm, setCalForm] = useState({
    cropName: 'Tomato',
    variety: 'Hybrid Shivam',
    sowingDate: new Date().toISOString().split('T')[0],
    landAreaAcre: '2.5',
    fieldLocation: 'Plot A (North Field)',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const res = await api.get('/calendar/my-calendars');
      if (res.data?.data) {
        setCalendars(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedCalendar(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch crop calendars', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/calendar/create', calForm);
      if (res.data?.data) {
        setCalendars([res.data.data, ...calendars]);
        setSelectedCalendar(res.data.data);
        setShowModal(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create calendar');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await api.patch(`/calendar/tasks/${taskId}/toggle`);
      if (res.data?.data) {
        const updatedTasks = selectedCalendar.tasks.map((t: any) =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setSelectedCalendar({ ...selectedCalendar, tasks: updatedTasks });
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              {language === 'ta' ? 'AI பயிர் கால அட்டவணை' : 'AI Stage-Wise Crop Calendar'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'விதைப்பு முதல் அறுவடை வரை AI வழிகாட்டி' : 'AI Sowing-to-Harvest Task Planner'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'விதைத்த தேதிக்கு ஏற்ப வளர்ச்சி நிலைகள், பாசனம், உரமிடல் மற்றும் பூச்சி தடுப்பு பணிகளை தானாகவே திட்டமிடுங்கள்.'
                : 'Personalized growth timeline, automated fertilizer fertigation dates, prophylactic spray alerts, and harvest countdown.'}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl transition shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {language === 'ta' ? '+ புதிய பயிர் காலண்டர்' : '+ New Crop Calendar'}
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">Loading your crop schedules...</div>
        ) : calendars.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
            <Sprout className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Crop Calendars Active</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create a calendar by specifying your crop and sowing date to get an automated day-by-day agricultural action plan.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
            >
              Create First Crop Calendar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Selector (Left 4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Your Active Crops</h3>
              {calendars.map((cal) => (
                <div
                  key={cal.id}
                  onClick={() => setSelectedCalendar(cal)}
                  className={`p-5 rounded-2xl border cursor-pointer transition text-left space-y-2 ${
                    selectedCalendar?.id === cal.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-slate-900">{cal.cropName}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                      {cal.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {cal.variety} • {cal.landAreaAcre} Acres ({cal.fieldLocation})
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sown: {new Date(cal.sowingDate).toLocaleDateString()}</span>
                    <span>Harvest: {new Date(cal.expectedHarvest).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stage Tasks Timeline (Right 8 Cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {selectedCalendar && (
                <>
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg uppercase">
                        AI Timeline
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {selectedCalendar.cropName} Growth & Farm Operations Plan
                      </h3>
                      <span className="text-xs text-slate-500">
                        Expected Harvest Date:{' '}
                        <strong className="text-slate-800">
                          {new Date(selectedCalendar.expectedHarvest).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Task Timeline List */}
                  <div className="space-y-4">
                    {(selectedCalendar.tasks || []).map((t: any) => {
                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-2xl border transition flex items-start gap-4 ${
                            t.isCompleted
                              ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <button
                            onClick={() => handleToggleTask(t.id)}
                            className="mt-0.5 text-emerald-600 hover:text-emerald-700 transition flex-shrink-0"
                          >
                            {t.isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300" />
                            )}
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                                {t.stageName} • {t.taskType}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Due: {new Date(t.dueDate).toLocaleDateString()}
                              </span>
                            </div>

                            <h4
                              className={`text-sm font-bold text-slate-900 ${
                                t.isCompleted ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {language === 'ta' && t.titleTamil ? t.titleTamil : t.title}
                            </h4>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {language === 'ta' && t.descriptionTamil ? t.descriptionTamil : t.description}
                            </p>

                            {t.dosageOrGuidance && (
                              <div className="text-[11px] font-semibold text-indigo-700 pt-1">
                                📌 Guidance / Dosage: {t.dosageOrGuidance}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Create Calendar Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create AI Crop Calendar</h3>
                  <p className="text-xs text-slate-500">Automatically generates stage-wise reminders</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCalendar} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Crop</label>
                  <select
                    value={calForm.cropName}
                    onChange={(e) => setCalForm({ ...calForm, cropName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Green Chilli">Green Chilli</option>
                    <option value="Red Onion">Red Onion</option>
                    <option value="Banana">Banana</option>
                    <option value="Paddy (Rice)">Paddy (Rice)</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Crop Variety</label>
                  <input
                    type="text"
                    required
                    value={calForm.variety}
                    onChange={(e) => setCalForm({ ...calForm, variety: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sowing Date</label>
                    <input
                      type="date"
                      required
                      value={calForm.sowingDate}
                      onChange={(e) => setCalForm({ ...calForm, sowingDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Land Area (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={calForm.landAreaAcre}
                      onChange={(e) => setCalForm({ ...calForm, landAreaAcre: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Field Plot Location</label>
                  <input
                    type="text"
                    required
                    value={calForm.fieldLocation}
                    onChange={(e) => setCalForm({ ...calForm, fieldLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                >
                  {creating ? 'Generating Timeline...' : 'Generate AI Crop Calendar'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CropCalendarPage;
