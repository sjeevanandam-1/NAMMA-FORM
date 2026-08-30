import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Scale,
  TrendingUp,
  MapPin,
  Truck,
  DollarSign,
  Award,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export const MarketComparisonPage: React.FC = () => {
  const { language } = useLanguage();
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState('3000');
  const [markets, setMarkets] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setCalculating(true);
      const res = await api.post('/ai/best-market', {
        crop,
        quantityKg: parseFloat(quantityKg) || 1000,
        location: 'Coimbatore, Tamil Nadu',
      });
      if (res.data?.data?.rankedMarkets) {
        setMarkets(res.data.data.rankedMarkets);
      }
    } catch (err) {
      console.error('Failed to compare markets', err);
    } finally {
      setCalculating(false);
    }
  };

  React.useEffect(() => {
    handleCompare();
  }, [crop]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-xs font-semibold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              {language === 'ta' ? 'சந்தைகள் லாப ஒப்பீடு' : 'Multi-Market Net Realization Engine'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'சந்தை லாப ஒப்பீடு & சிறந்த விற்பனை தளம்' : 'Market Comparison & Net Profit Calculator'}
            </h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'போக்குவரத்து செலவு மற்றும் மண்டி கமிஷனை கழித்து, உங்களுக்கு அதிக நிகர லாபம் (Net Profit) தரும் சந்தையை தானாக கண்டறியுங்கள்.'
                : 'Formula: Net Profit = Gross Revenue - Transport Freight - Mandi Brokerage Cess - Handling Losses.'}
            </p>
          </div>
        </div>

        {/* Inputs Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
              >
                <option value="Tomato">Tomato (Hybrid)</option>
                <option value="Red Onion">Red Onion</option>
                <option value="Green Chilli">Green Chilli</option>
                <option value="Banana">Banana</option>
                <option value="Paddy (Rice)">Paddy (Rice)</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Quantity (Kg)</label>
              <input
                type="number"
                step="100"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            onClick={() => handleCompare()}
            disabled={calculating}
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition shadow"
          >
            {calculating ? 'Analyzing Markets...' : 'Recalculate Net Profit'}
          </button>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((m, idx) => {
            const isTopRank = idx === 0;
            return (
              <div
                key={idx}
                className={`rounded-3xl p-6 border transition flex flex-col justify-between space-y-4 ${
                  isTopRank
                    ? 'bg-gradient-to-b from-purple-50 to-white border-purple-500 shadow-lg ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      {isTopRank && (
                        <span className="px-3 py-1 bg-purple-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 mb-2">
                          <Award className="w-3.5 h-3.5" /> #1 Highest Net Profit
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-slate-900">{m.marketName}</h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {m.distanceKm === 0 ? 'Farmgate Direct Pickup (0 km)' : `${m.distanceKm} km away from farm`}
                      </span>
                    </div>
                  </div>

                  {/* Net Profit Big Banner */}
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold block">Estimated NET Realization:</span>
                    <div className="text-2xl font-extrabold text-purple-950">₹{m.estimatedNetProfit?.toLocaleString()}</div>
                    <span className="text-xs font-semibold text-emerald-700 block">
                      Effective: ₹{(m.estimatedNetProfit / (parseFloat(quantityKg) || 1000)).toFixed(1)} / kg in hand
                    </span>
                  </div>

                  {/* Formula Deductions Breakdown */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>Gross Selling Price</span>
                      <strong className="text-slate-900">₹{m.pricePerKg}/kg</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>Total Gross Revenue</span>
                      <span className="font-semibold text-slate-800">₹{m.grossRevenue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                      <span>Transport Freight Cost</span>
                      <span>-₹{m.transportCost?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-rose-600">
                      <span>Mandi Cess & Handling Deductions</span>
                      <span>-₹{m.mandiFee?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-relaxed">{m.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default MarketComparisonPage;
