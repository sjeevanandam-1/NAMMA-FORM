import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  DollarSign,
  Users,
  Sprout,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const AIIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'forecast' | 'bestMarket' | 'profit' | 'strategy' | 'matchmaker' | 'cropRec' | 'futureScope'
  >('forecast');

  // 1. Price Forecast State
  const [forecastCrop, setForecastCrop] = useState('Tomato');
  const [forecastData, setForecastData] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // 2. Best Market State
  const [bestMarketCrop, setBestMarketCrop] = useState('Tomato');
  const [bestMarketQty, setBestMarketQty] = useState(3000);
  const [bestMarketData, setBestMarketData] = useState<any>(null);

  // 3. Profit Advisor State
  const [profitInputs, setProfitInputs] = useState({
    cropName: 'Tomato',
    landAreaAcre: 3.5,
    expectedYieldKg: 15000,
    productionCost: 45000,
    transportCost: 3500,
    sellingPricePerKg: 32,
    buyerPricePerKg: 35,
  });
  const [profitResult, setProfitResult] = useState<any>(null);

  // 4. Selling Strategy State
  const [strategyCrop, setStrategyCrop] = useState('Tomato');
  const [strategyQty, setStrategyQty] = useState(3500);
  const [strategyDate, setStrategyDate] = useState(
    new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]
  );
  const [strategyData, setStrategyData] = useState<any>(null);

  // 5. Buyer Matchmaker State
  const [matches, setMatches] = useState<any[]>([]);

  // 6. Crop Recommendation State
  const [cropRecData, setCropRecData] = useState<any>(null);

  // Fetch forecast data
  const loadForecast = async (crop: string) => {
    setLoadingForecast(true);
    try {
      const res = await api.get(`/ai/price-forecast?crop=${crop}&state=Tamil Nadu`);
      setForecastData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingForecast(false);
    }
  };

  // Fetch best market data
  const loadBestMarket = async (crop: string, qty: number) => {
    try {
      const res = await api.post('/ai/best-market', {
        cropName: crop,
        quantityKg: qty,
        district: 'Coimbatore',
        state: 'Tamil Nadu',
      });
      setBestMarketData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Run profit advisor
  const runProfitAdvisor = async () => {
    try {
      const res = await api.post('/ai/profit-advisor', profitInputs);
      setProfitResult(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Run selling strategy
  const runSellingStrategy = async () => {
    try {
      const res = await api.post('/ai/selling-strategy', {
        cropName: strategyCrop,
        quantityKg: strategyQty,
        expectedHarvestDate: strategyDate,
      });
      setStrategyData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Run matchmaker
  const loadMatches = async () => {
    try {
      const res = await api.get('/ai/matchmaking?crop=Tomato&quantity=3000&price=32');
      setMatches(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Run crop recommendation
  const loadCropRec = async () => {
    try {
      const res = await api.post('/ai/crop-recommendation', {
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        soilType: 'Red Loamy',
        landAreaAcre: 3.5,
        season: 'KHARIF',
        waterAvailability: 'Drip Irrigation Available',
      });
      setCropRecData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadForecast(forecastCrop);
    loadBestMarket(bestMarketCrop, bestMarketQty);
    runProfitAdvisor();
    runSellingStrategy();
    loadMatches();
    loadCropRec();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-card border border-emerald-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI FARM INTELLIGENCE SUITE
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                AI Agricultural Decision Engines
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Comprehensive predictive models for price trajectories, net realization, logistics,
                and farmgate buyer matchmaking.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs space-y-1">
              <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block">
                Standard Disclaimer
              </span>
              <p className="text-slate-300">
                All projections are <strong className="text-white">AI ESTIMATES — NOT GUARANTEED</strong>.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'forecast', label: '1. Price Forecast (7/14/30d)', icon: TrendingUp },
              { id: 'bestMarket', label: '2. Where to Sell (Best Market)', icon: MapPin },
              { id: 'profit', label: '3. Profit Advisor (Net Return)', icon: DollarSign },
              { id: 'strategy', label: '4. Selling Strategy', icon: Calendar },
              { id: 'matchmaker', label: '5. AI Buyer Matchmaker', icon: Users },
              { id: 'cropRec', label: '6. What to Grow (Crop Rec)', icon: Sprout },
              { id: 'futureScope', label: '7. Future Scope & IoT (SIH 2026)', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* TAB 1: AI PRICE FORECAST */}
        {/* -------------------------------------------------- */}
        {activeTab === 'forecast' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    AI Price Forecast & Seasonality Curves
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    AI ESTIMATE — NOT GUARANTEED
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Historical APMC arrival volume and supply-demand price trajectory analysis
                </p>
              </div>

              {/* Crop Selector */}
              <div className="flex items-center gap-2">
                {['Tomato', 'Green Chili', 'Red Onion', 'Banana'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setForecastCrop(c);
                      loadForecast(c);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      forecastCrop === c
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {forecastData && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Chart Card */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastData.historicalChartData}>
                        <defs>
                          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#priceGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Historical prices verified via AGMARKNET & APMC daily bulletins • Projected
                    curves computed with confidence index {forecastData.confidenceScore}%.
                  </p>
                </div>

                {/* Advisory Panel */}
                <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Current Benchmark Price
                      </span>
                      <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                        ₹{forecastData.currentPrice.toFixed(2)} / Kg
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400">7-Day Est:</span>
                        <strong className="block text-slate-900 font-bold text-sm mt-0.5">
                          ₹{forecastData.predictedPrice7d.toFixed(2)}
                        </strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400">14-Day Est:</span>
                        <strong className="block text-emerald-600 font-bold text-sm mt-0.5">
                          ₹{forecastData.predictedPrice14d.toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-emerald-100/60 p-3.5 rounded-xl border border-emerald-200 text-xs">
                      <strong className="text-emerald-900 font-bold block mb-1">
                        AI Recommendation:
                      </strong>
                      <p className="text-emerald-800 leading-relaxed">{forecastData.advisoryNote}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Favorable Window: <strong className="text-slate-800">{forecastData.sellingPeriodRecommendation}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 2: AI BEST MARKET ("Where Should I Sell?") */}
        {/* -------------------------------------------------- */}
        {activeTab === 'bestMarket' && bestMarketData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    WHERE SHOULD I SELL? (AI Net Realization Analyzer)
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NET RETURN OPTIMIZED
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates Raw Price minus Freight Logistics minus APMC Cess to identify true profit
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Volume:</span>
                <select
                  value={bestMarketQty}
                  onChange={(e) => {
                    setBestMarketQty(Number(e.target.value));
                    loadBestMarket(bestMarketCrop, Number(e.target.value));
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value={1500}>1,500 Kg</option>
                  <option value={3000}>3,000 Kg</option>
                  <option value={5000}>5,000 Kg</option>
                  <option value={8000}>8,000 Kg</option>
                </select>
              </div>
            </div>

            {/* Verdict Banner */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Recommended Best Option: {bestMarketData.bestMarketRecommendation}
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{bestMarketData.verdict}</p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Market / Terminal</th>
                    <th className="p-3.5">Distance</th>
                    <th className="p-3.5">Mandi Price</th>
                    <th className="p-3.5">Gross Revenue</th>
                    <th className="p-3.5">Transport Cost</th>
                    <th className="p-3.5">Mandi Cess</th>
                    <th className="p-3.5 text-right font-bold text-slate-900">Estimated NET Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bestMarketData.markets.map((m: any, idx: number) => {
                    const isWinner = m.marketName === bestMarketData.bestMarketRecommendation;
                    return (
                      <tr
                        key={idx}
                        className={isWinner ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50'}
                      >
                        <td className="p-3.5 flex items-center gap-2">
                          {isWinner && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          <span className={isWinner ? 'text-emerald-900 font-bold' : 'text-slate-800'}>
                            {m.marketName}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">{m.distanceKm} km</td>
                        <td className="p-3.5 text-slate-900">₹{m.modalPricePerKg}/kg</td>
                        <td className="p-3.5 text-slate-600">₹{m.grossRevenue.toLocaleString()}</td>
                        <td className="p-3.5 text-red-600">-₹{m.transportCost.toLocaleString()}</td>
                        <td className="p-3.5 text-red-500">-₹{m.mandiCess.toLocaleString()}</td>
                        <td className="p-3.5 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-lg ${
                              isWinner
                                ? 'bg-emerald-600 text-white font-extrabold'
                                : 'bg-slate-100 text-slate-900 font-bold'
                            }`}
                          >
                            ₹{m.netReturn.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 3: AI PROFIT ADVISOR */}
        {/* -------------------------------------------------- */}
        {activeTab === 'profit' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-xl font-bold text-slate-900">
                AI Profit Advisor (Net Channel Comparison)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your farm production parameters to evaluate direct buyers vs Mandis
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Inputs Form */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Input Farm Parameters:</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Land Area (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={profitInputs.landAreaAcre}
                      onChange={(e) =>
                        setProfitInputs({
                          ...profitInputs,
                          landAreaAcre: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expected Yield (Kg)</label>
                    <input
                      type="number"
                      value={profitInputs.expectedYieldKg}
                      onChange={(e) =>
                        setProfitInputs({
                          ...profitInputs,
                          expectedYieldKg: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Total Production Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={profitInputs.productionCost}
                      onChange={(e) =>
                        setProfitInputs({
                          ...profitInputs,
                          productionCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mandi Benchmark Price (₹/Kg)
                    </label>
                    <input
                      type="number"
                      value={profitInputs.sellingPricePerKg}
                      onChange={(e) =>
                        setProfitInputs({
                          ...profitInputs,
                          sellingPricePerKg: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <button
                  onClick={runProfitAdvisor}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Recalculate Profit Projections
                </button>
              </div>

              {/* Outputs & Comparisons */}
              <div className="lg:col-span-7 space-y-4">
                {profitResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          Estimated Revenue
                        </span>
                        <p className="text-xl font-bold text-slate-900 mt-1">
                          ₹{profitResult.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          Total Input Costs
                        </span>
                        <p className="text-xl font-bold text-slate-700 mt-1">
                          ₹{profitResult.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 uppercase font-bold">
                          Estimated Net Profit
                        </span>
                        <p className="text-xl font-extrabold text-emerald-600 mt-1">
                          ₹{profitResult.estimatedProfit.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        Channel Net Realization Comparison:
                      </h4>
                      {profitResult.comparisonData?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            item.isRecommended
                              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.isRecommended && (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  HIGHEST NET RETURN
                                </span>
                              )}
                              <h5 className="font-bold text-sm text-slate-900">{item.channel}</h5>
                            </div>
                            <span className="font-extrabold text-base text-slate-900">
                              ₹{item.netReturn.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 4: SELLING STRATEGY */}
        {/* -------------------------------------------------- */}
        {activeTab === 'strategy' && strategyData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-xl font-bold text-slate-900">
                AI Selling Strategy & Timeline Plan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customized market timing, volume tiered distribution, and harvest risk mitigation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400">Market Situation:</span>
                <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">
                  {strategyData.marketSituation}
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400">Optimal Sell Window:</span>
                <p className="text-sm font-bold text-emerald-600 mt-1">
                  {strategyData.favorableSellingWindow}
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400">Estimated Net Realization:</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  ₹{strategyData.estimatedNetReturn.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                  Recommended Action Steps:
                </h4>
                <ul className="space-y-2 text-xs text-emerald-900">
                  {strategyData.actionItems.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 space-y-2">
                <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                  Identified Risk Factors:
                </h4>
                <ul className="space-y-2 text-xs text-amber-900">
                  {strategyData.riskFactors.map((risk: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 5: AI BUYER MATCHMAKER */}
        {/* -------------------------------------------------- */}
        {activeTab === 'matchmaker' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-xl font-bold text-slate-900">
                AI Farmer-Buyer Matchmaking Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified commercial buyers actively purchasing crops matching your farm profile
              </p>
            </div>

            <div className="space-y-4">
              {matches.map((b: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold text-slate-900">{b.companyName}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                        {b.matchScore}% AI Match
                      </span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {b.businessType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.location} ({b.district}, {b.state}) • AgriTrust: {b.trustScore}%
                    </p>

                    <div className="space-y-1 pt-1">
                      {b.matchReasons.map((r: string, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="flex items-center gap-1.5 text-xs text-slate-700 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Offered Farmgate Range:
                      </span>
                      <strong className="text-base text-emerald-600 font-extrabold">
                        {b.offeredPriceRange}
                      </strong>
                    </div>

                    <button
                      onClick={() => (window.location.href = `/chat`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Contact Buyer Directly →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 6: WHAT TO GROW (CROP RECOMMENDATION) */}
        {/* -------------------------------------------------- */}
        {activeTab === 'cropRec' && cropRecData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-xl font-bold text-slate-900">
                WHAT SHOULD I GROW? (AI Crop Recommendation)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Evaluates soil chemistry, seasonal rainfall, gestation period, and demand indices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cropRecData.recommendations.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {rec.suitabilityScore}% Match
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {rec.gestationDays} Days
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{rec.cropName}</h4>
                    <p className="text-xs text-slate-600">{rec.marketOpportunity}</p>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Cost / Acre:</span>
                        <strong className="text-slate-700">₹{rec.estimatedCostPerAcre.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Yield / Acre:</span>
                        <strong className="text-slate-900">
                          {rec.expectedYieldPerAcreKg.toLocaleString()} Kg
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700 font-bold">Est. Net Profit:</span>
                        <strong className="text-emerald-600 font-extrabold text-sm">
                          ₹{rec.estimatedNetProfit.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block">{rec.soilSuitability}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TAB 7: FUTURE SCOPE & IOT (SIH 2026 INNOVATION ROADMAP) */}
        {/* -------------------------------------------------- */}
        {activeTab === 'futureScope' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-8 animate-in fade-in">
            <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Smart India Hackathon 2026 • Future Scope Architecture
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Precision Agritech & IoT Sensor Roadmap
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                  Next-generation smart agriculture modules under active research and telemetry integration.
                  These features are architectural extensions designed for hardware sensors, satellite APIs, and aerial drone fleets.
                </p>
              </div>
              <span className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl whitespace-nowrap self-start sm:self-auto">
                🚧 Future Scope / Coming Soon
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Drone-Based Crop Monitoring */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-3xl p-6 border border-slate-200 hover:border-purple-400 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                    🚁
                  </div>
                  <span className="px-3 py-1 bg-purple-100/80 text-purple-800 rounded-full text-[11px] font-bold">
                    Hardware / Fleet API
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Drone-Based Crop Monitoring</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Automated aerial drone surveys providing centimeter-level NDVI multispectral vegetation indices,
                    pest infestation hotspot maps, and targeted micro-spraying payload route planning.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Survey Resolution:</span>
                    <strong className="text-slate-900">2.5 cm/pixel (RGB + NIR)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Flight Autonomy:</span>
                    <strong className="text-purple-700">Waypoints via DGCA DigitalSky</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Integration Status:</span>
                    <span className="text-amber-600 font-semibold">Protocols Defined (Future Scope)</span>
                  </div>
                </div>
              </div>

              {/* 2. IoT Soil Sensors Integration */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-3xl p-6 border border-slate-200 hover:border-emerald-400 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    📡
                  </div>
                  <span className="px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-[11px] font-bold">
                    LoRaWAN / Zigbee Telemetry
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">IoT Soil Sensor Integration</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Field-deployed soil probes capturing continuous NPK (Nitrogen, Phosphorus, Potassium), pH levels,
                    volumetric water content, and electrical conductivity to trigger precision fertigation.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Sensors Supported:</span>
                    <strong className="text-slate-900">NPK 7-in-1, Soil Moisture, pH, Temp</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Gateway Communication:</span>
                    <strong className="text-emerald-700">MQTT over LoRaWAN 865 MHz</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Integration Status:</span>
                    <span className="text-amber-600 font-semibold">Schema Ready (Future Scope)</span>
                  </div>
                </div>
              </div>

              {/* 3. Satellite-Based Crop Analysis */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-3xl p-6 border border-slate-200 hover:border-blue-400 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                    🛰️
                  </div>
                  <span className="px-3 py-1 bg-blue-100/80 text-blue-800 rounded-full text-[11px] font-bold">
                    ISRO / ESA Sentinel-2
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Satellite-Based Crop Analysis</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Optical and Synthetic Aperture Radar (SAR) remote sensing from Sentinel-2 & ISRO VEDAS for regional
                    canopy moisture indexing, drought severity grading, and district-level crop masking.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Data Feeds:</span>
                    <strong className="text-slate-900">Sentinel-2 (10m) + Landsat 9 (30m)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Indices Calculated:</span>
                    <strong className="text-blue-700">NDVI, NDWI, EVI, SAVI</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Integration Status:</span>
                    <span className="text-amber-600 font-semibold">API Pipeline Drafted (Future Scope)</span>
                  </div>
                </div>
              </div>

              {/* 4. AI-Based Yield Prediction */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-3xl p-6 border border-slate-200 hover:border-amber-400 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                    📊
                  </div>
                  <span className="px-3 py-1 bg-amber-100/80 text-amber-800 rounded-full text-[11px] font-bold">
                    Deep Learning / XGBoost
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">AI-Based Yield Prediction</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Ensemble Machine Learning models fusing multi-year harvest records, weather degree days (GDD),
                    soil organic carbon, and sowing dates to predict final crop tonnage per acre with 90%+ confidence.
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Model Architecture:</span>
                    <strong className="text-slate-900">Spatial-Temporal LSTM + XGBoost</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Input Parameters:</span>
                    <strong className="text-amber-700">GDD, Soil NPK, Cumulative Rain</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Integration Status:</span>
                    <span className="text-amber-600 font-semibold">Training Pipeline (Future Scope)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
