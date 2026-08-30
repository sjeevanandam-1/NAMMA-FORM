import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Droplets,
  Timer,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

export const SmartIrrigation: React.FC = () => {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    cropName: 'Tomato',
    soilType: 'Red Loam',
    growthStage: 'Flowering to Fruit Formation',
    landAreaAcre: '2.5',
    waterSource: 'Borewell + Micro-Drip',
    rainProbability: '20',
  });
  const [result, setResult] = useState<any | null>(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCalculating(true);
      const res = await api.post('/irrigation/calculate', form);
      if (res.data?.data) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Failed to calculate smart irrigation', err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-200 text-xs font-semibold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5" />
              {language === 'ta' ? 'ஸ்மார்ட் பாசன திட்டமிடல்' : 'Smart Precision Irrigation'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'ஸ்மார்ட் பாசன கால அட்டவணை & நீர் மேலாண்மை' : 'Smart Irrigation Calculator & Water Advisory'}
            </h1>
            <p className="text-cyan-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'பயிர் வகை, மண் தன்மை, வளர்ச்சி பருவம் மற்றும் மழை வாய்ப்பிற்கு ஏற்ப துல்லியமான நீர் தேவையை கணக்கிடுங்கள்.'
                : 'Calculate exact liters required per acre, optimal drip pumping duration, and soil moisture conservation tips.'}
            </p>
          </div>
        </div>

        {/* Two Column Layout: Calculator Form + Result Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              {language === 'ta' ? 'பண்ணை அளவுருக்கள்' : 'Farm & Soil Parameters'}
            </h3>

            <form onSubmit={handleCalculate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Crop</label>
                <select
                  value={form.cropName}
                  onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Tomato">Tomato (Hybrid Shivam)</option>
                  <option value="Green Chilli">Green Chilli (G4)</option>
                  <option value="Red Onion">Red Onion (Bellary)</option>
                  <option value="Banana">Banana (Grand Naine G9)</option>
                  <option value="Paddy (Rice)">Paddy / Rice (BPT 5204)</option>
                  <option value="Cotton">Cotton (Medium Staple)</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Soil Type</label>
                  <select
                    value={form.soilType}
                    onChange={(e) => setForm({ ...form, soilType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Red Loam">Red Loam</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clay">Clay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.landAreaAcre}
                    onChange={(e) => setForm({ ...form, landAreaAcre: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Crop Growth Stage</label>
                <select
                  value={form.growthStage}
                  onChange={(e) => setForm({ ...form, growthStage: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Sowing & Germination">Sowing & Germination</option>
                  <option value="Vegetative Canopy Growth">Vegetative Canopy Growth</option>
                  <option value="Flowering to Fruit Formation">Flowering to Fruit Formation (Peak Water)</option>
                  <option value="Fruit/Grain Maturity & Ripening">Fruit/Grain Maturity & Ripening</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Water Source / System</label>
                  <select
                    value={form.waterSource}
                    onChange={(e) => setForm({ ...form, waterSource: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Borewell + Micro-Drip">Borewell + Micro-Drip</option>
                    <option value="Canal Flood Irrigation">Canal Flood Irrigation</option>
                    <option value="Sprinkler System">Sprinkler System</option>
                    <option value="Rainfed Open Well">Rainfed Open Well</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rain Forecast (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.rainProbability}
                    onChange={(e) => setForm({ ...form, rainProbability: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Droplets className="w-4 h-4" />
                {calculating ? 'Calculating Requirements...' : 'Calculate Precision Irrigation'}
              </button>
            </form>
          </div>

          {/* Results Display (7 Cols) */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-lg uppercase">
                      Precision Advisory
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      Water Requirement for {result.cropName} ({result.landAreaAcre} Acres)
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                    <Droplets className="w-6 h-6" />
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-100">
                    <span className="text-[11px] text-slate-500 block font-semibold">Total Water Volume</span>
                    <div className="text-xl font-extrabold text-cyan-950 mt-1">
                      {result.dailyWaterReqLiters?.toLocaleString()} Liters
                    </div>
                    <span className="text-[10px] text-cyan-700 block">per irrigation cycle</span>
                  </div>

                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block font-semibold">Drip Run Time</span>
                    <div className="text-xl font-extrabold text-emerald-950 mt-1 flex items-center gap-1">
                      <Timer className="w-5 h-5 text-emerald-600" />
                      {result.hoursRequired} Hours
                    </div>
                    <span className="text-[10px] text-emerald-700 block">6:30 AM - 9:00 AM optimal</span>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                    <span className="text-[11px] text-slate-500 block font-semibold">Next Irrigation Date</span>
                    <div className="text-base font-extrabold text-blue-950 mt-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {new Date(result.nextIrrigationDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <span className="text-[10px] text-blue-700 block">Soil moisture: Optimal</span>
                  </div>
                </div>

                {/* Recommendation Advisory Note */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white text-xs space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Recommended Timing & Schedule:
                  </div>
                  <p className="text-slate-300 leading-relaxed">{result.recommendationText}</p>
                </div>

                {/* Water Saving Tips */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    💡 Water Saving & Mulch Guidelines:
                  </h4>
                  <div className="space-y-2">
                    {(result.waterSavingTips || []).map((tip: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
                <Droplets className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No Calculation Performed Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Fill in your crop details on the left and click "Calculate Precision Irrigation" to get your schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SmartIrrigation;
