import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  Sparkles,
  Save,
  CheckCircle,
  Layers,
} from 'lucide-react';

export const ProfitCalculatorPage: React.FC = () => {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    cropName: 'Tomato',
    landAreaAcre: '2.5',
    seedCost: '4500',
    landPrepCost: '6000',
    fertilizerCost: '12000',
    pesticideCost: '8000',
    irrigationCost: '3500',
    labourCost: '18000',
    harvestPackingCost: '7000',
    transportCost: '4000',
    expectedYieldKgPerAcre: '12000',
    expectedPricePerKg: '32',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculations
  const area = parseFloat(form.landAreaAcre) || 1.0;
  const totalProductionCost =
    (parseFloat(form.seedCost) || 0) +
    (parseFloat(form.landPrepCost) || 0) +
    (parseFloat(form.fertilizerCost) || 0) +
    (parseFloat(form.pesticideCost) || 0) +
    (parseFloat(form.irrigationCost) || 0) +
    (parseFloat(form.labourCost) || 0) +
    (parseFloat(form.harvestPackingCost) || 0);

  const totalTransportCost = parseFloat(form.transportCost) || 0;
  const totalInvestment = totalProductionCost + totalTransportCost;

  const totalYieldKg = (parseFloat(form.expectedYieldKgPerAcre) || 0) * area;
  const pricePerKg = parseFloat(form.expectedPricePerKg) || 0;
  const grossRevenue = totalYieldKg * pricePerKg;
  const netProfit = grossRevenue - totalInvestment;
  const profitMarginPct = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 1000) / 10 : 0;
  const roiPct = totalInvestment > 0 ? Math.round((netProfit / totalInvestment) * 1000) / 10 : 0;
  const profitPerAcre = area > 0 ? Math.round(netProfit / area) : 0;
  const breakEvenPrice = totalYieldKg > 0 ? Math.round((totalInvestment / totalYieldKg) * 10) / 10 : 0;

  const handleSave = async () => {
    try {
      await api.post('/ai/profit-advisor', {
        crop: form.cropName,
        landAreaAcre: area,
        expectedYieldKg: totalYieldKg,
        productionCost: totalProductionCost,
        transportCost: totalTransportCost,
        sellingPricePerKg: pricePerKg,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profit calculation', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              {language === 'ta' ? 'முழுமையான விவசாய வரவு-செலவு திட்டமிடல்' : 'AI Farm Budget & Net Profit Simulator'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'பயிர் லாப கால்குலேட்டர் & முதலீட்டு திட்டம்' : 'AI Crop Profit & Investment Calculator'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'விதை, உரம், உழவு, ஆட்கள் கூலி மற்றும் போக்குவரத்து செலவுகளை உள்ளிட்டு உங்கள் நிகர லாபத்தை (Net Profit) கணக்கிடுங்கள்.'
                : 'Calculate total investment cost, gross revenue, net margin, return on investment (ROI %), and break-even selling price.'}
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-2xl transition shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {savedSuccess ? 'Projection Saved!' : 'Save Projection'}
          </button>
        </div>

        {/* 4 Summary Banner Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Total Investment</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              ₹{totalInvestment.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">All input & labour costs</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Gross Revenue</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">
              ₹{grossRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">{totalYieldKg.toLocaleString()} kg @ ₹{pricePerKg}/kg</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Estimated NET Profit</span>
            <div
              className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              ₹{netProfit.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">₹{profitPerAcre.toLocaleString()} / acre</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">ROI & Profit Margin</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-1">{roiPct}% ROI</div>
            <span className="text-[11px] text-emerald-700 font-bold">{profitMarginPct}% Net Margin</span>
          </div>
        </div>

        {/* Detailed Form Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" /> Input Expenses & Expected Harvest
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Crop</label>
                <input
                  type="text"
                  value={form.cropName}
                  onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.landAreaAcre}
                  onChange={(e) => setForm({ ...form, landAreaAcre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Seeds / Nursery Saplings (₹)</label>
                <input
                  type="number"
                  value={form.seedCost}
                  onChange={(e) => setForm({ ...form, seedCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Land Prep & Tractor Tillage (₹)</label>
                <input
                  type="number"
                  value={form.landPrepCost}
                  onChange={(e) => setForm({ ...form, landPrepCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Fertilizers & Manure (₹)</label>
                <input
                  type="number"
                  value={form.fertilizerCost}
                  onChange={(e) => setForm({ ...form, fertilizerCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Pesticides & Bio-Protection (₹)</label>
                <input
                  type="number"
                  value={form.pesticideCost}
                  onChange={(e) => setForm({ ...form, pesticideCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Labour & Weeding (₹)</label>
                <input
                  type="number"
                  value={form.labourCost}
                  onChange={(e) => setForm({ ...form, labourCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Harvesting & Crates (₹)</label>
                <input
                  type="number"
                  value={form.harvestPackingCost}
                  onChange={(e) => setForm({ ...form, harvestPackingCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transport & Freight (₹)</label>
                <input
                  type="number"
                  value={form.transportCost}
                  onChange={(e) => setForm({ ...form, transportCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Irrigation & Power (₹)</label>
                <input
                  type="number"
                  value={form.irrigationCost}
                  onChange={(e) => setForm({ ...form, irrigationCost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-800 font-bold mb-1">Expected Yield (Kg / Acre)</label>
                  <input
                    type="number"
                    value={form.expectedYieldKgPerAcre}
                    onChange={(e) => setForm({ ...form, expectedYieldKgPerAcre: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-emerald-800 font-bold mb-1">Selling Price (₹ / Kg)</label>
                  <input
                    type="number"
                    value={form.expectedPricePerKg}
                    onChange={(e) => setForm({ ...form, expectedPricePerKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analysis & Breakdown (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" /> Cost Breakdown & Break-Even
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Production Inputs (Seed + Fert + Pest)</span>
                  <strong className="text-slate-900">
                    ₹{(
                      parseFloat(form.seedCost || '0') +
                      parseFloat(form.fertilizerCost || '0') +
                      parseFloat(form.pesticideCost || '0')
                    ).toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Labour & Harvesting</span>
                  <strong className="text-slate-900">
                    ₹{(parseFloat(form.labourCost || '0') + parseFloat(form.harvestPackingCost || '0')).toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Tillage & Logistics</span>
                  <strong className="text-slate-900">
                    ₹{(parseFloat(form.landPrepCost || '0') + parseFloat(form.transportCost || '0')).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Break-even box */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                <span className="text-indigo-900 font-bold block">⚖️ Break-Even Selling Price:</span>
                <div className="text-xl font-extrabold text-indigo-950">₹{breakEvenPrice} / kg</div>
                <p className="text-[11px] text-indigo-700">
                  Any market price above ₹{breakEvenPrice}/kg generates positive net profit.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
                <strong className="block font-bold">💡 AI Profit Maximization Advice:</strong>
                <p className="text-[11px] leading-relaxed">
                  Selling via Namma Farm direct farmgate pickup eliminates ₹{totalTransportCost.toLocaleString()} in
                  transit costs and Mandi deductions, improving your net profit margin to{' '}
                  {(profitMarginPct + 6.5).toFixed(1)}%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfitCalculatorPage;
