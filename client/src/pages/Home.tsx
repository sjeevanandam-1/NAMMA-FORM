import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Sprout,
  TrendingUp,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Bot,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Truck,
  Activity,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();

  // Interactive ROI calculator state for landing page
  const [calcCrop, setCalcCrop] = useState('Tomato');
  const [calcQuantity, setCalcQuantity] = useState(3000);
  const [calcPrice, setCalcPrice] = useState(32);

  const traditionalMandiNet = Math.round(calcQuantity * calcPrice * 0.78);
  const nammaFarmNet = Math.round(calcQuantity * (calcPrice * 1.05) * 0.95);
  const netGain = nammaFarmNet - traditionalMandiNet;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* -------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* -------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Next-Gen Agricultural Commerce & AI Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight mb-6">
              From Farm to Buyer.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Powered by AI.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Connect directly. Discover fair transparent prices. Make smarter farming decisions
              with real-time price forecasting, crop disease scans, and farmgate buyer matchmaking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register/farmer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
              >
                <Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Join as Farmer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register/buyer"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-2xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                Join as Buyer
              </Link>
              <Link
                to="/marketplace"
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-slate-200 font-semibold text-base rounded-2xl border border-white/20 transition-all"
              >
                Explore Marketplace
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-slate-800/80 text-left">
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">22% - 28%</p>
                <p className="text-xs text-slate-400 mt-1">Higher Net Farmer Returns</p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <p className="text-2xl sm:text-3xl font-extrabold text-yellow-400">0%</p>
                <p className="text-xs text-slate-400 mt-1">Middleman Brokerage Cuts</p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">91%+</p>
                <p className="text-xs text-slate-400 mt-1">AI Crop Disease Vision Accuracy</p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">English + தமிழ்</p>
                <p className="text-xs text-slate-400 mt-1">Bilingual Voice Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 2. THE 4 CORE AI PILLARS (USP) */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              The Namma Farm Advantage
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              4 Critical Decisions Powered by Artificial Intelligence
            </h3>
            <p className="text-base text-slate-600 mt-3">
              Eliminating uncertainty from sowing to harvest and final realization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: WHAT to grow */}
            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100/80 hover:shadow-hover transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Pillar 1
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">WHAT to grow?</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Soil, season, water table, and historical demand analysis to recommend high-yield,
                high-margin crops.
              </p>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                AI Crop Recommender <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pillar 2: WHEN to sell */}
            <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/80 hover:shadow-hover transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Pillar 2
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">WHEN to sell?</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                7-day, 14-day, and 30-day Mandi price projections indicating optimal selling windows
                before market saturations.
              </p>
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                AI Price Forecast <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pillar 3: WHERE to sell */}
            <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/80 hover:shadow-hover transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Pillar 3
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">WHERE to sell?</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Compares nearby APMC Mandis vs private buyer pickup, deducting freight and cess to
                find highest NET profit.
              </p>
              <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                Best Market Locator <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pillar 4: WHO to sell to */}
            <div className="bg-purple-50/50 rounded-3xl p-6 border border-purple-100/80 hover:shadow-hover transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Pillar 4
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">WHO to sell to?</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                AI buyer matchmaking matching quantity, variety, proximity, and AgriTrust reliability
                scores (94% match).
              </p>
              <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                AI Buyer Matchmaker <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 3. INTERACTIVE NET PROFIT CALCULATOR */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                Interactive Profit Simulator
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                See How Much More You Earn on Namma Farm
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional commission agents and auction middlemen take up to 22% in unrecorded
                deductions, transit costs, and weighing charges. Namma Farm connects you directly
                with farmgate buyers.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Crop: <strong className="text-white">{calcCrop}</strong>
                  </label>
                  <div className="flex gap-2">
                    {['Tomato', 'Green Chili', 'Red Onion', 'Banana'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCalcCrop(c);
                          if (c === 'Tomato') setCalcPrice(32);
                          if (c === 'Green Chili') setCalcPrice(58);
                          if (c === 'Red Onion') setCalcPrice(35);
                          if (c === 'Banana') setCalcPrice(22);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          calcCrop === c
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Harvest Volume (Kg)</span>
                    <span className="text-white">{calcQuantity.toLocaleString()} Kg</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="lg:col-span-6">
              <div className="bg-slate-800/90 rounded-3xl p-8 border border-slate-700 shadow-2xl relative">
                <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                  <div>
                    <p className="text-xs text-slate-400">Estimated Additional Earnings</p>
                    <h4 className="text-4xl font-extrabold text-emerald-400 mt-1">
                      +₹{netGain.toLocaleString()}
                    </h4>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                    +24% Net Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">Traditional Mandi</p>
                    <p className="text-xl font-bold text-slate-300 mt-1">
                      ₹{traditionalMandiNet.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-red-400 mt-1 block">
                      -22% Transport & Middleman Cut
                    </span>
                  </div>

                  <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/60">
                    <p className="text-xs text-emerald-300 font-medium">Namma Farm Direct</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      ₹{nammaFarmNet.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      0% Commission + Farmgate Pickup
                    </span>
                  </div>
                </div>

                <Link
                  to="/register/farmer"
                  className="w-full block text-center py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md text-sm"
                >
                  Start Listing Your Produce Free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 4. AI CROP DOCTOR & TAMIL VOICE SHOWCASE */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* AI Crop Doctor Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">
                  <span>AI Crop Doctor Vision</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Instant Leaf Diagnosis & Verified Treatments
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Snap or upload a photo of infected leaves. Our AI vision model diagnoses pathogens
                  (Blight, Mildew, Curl Virus) and retrieves verified, university-certified organic
                  and bio-remedies with safety guidelines.
                </p>

                <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 mb-6 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900">Tomato Early Blight</span>
                    <span className="bg-teal-200/80 text-teal-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      91.5% Confidence
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Remedy: Trichoderma harzianum bio-spray & 0.5% neem oil emulsion.
                  </p>
                  <span className="text-[10px] text-teal-700 font-semibold block">
                    Source: ICAR-IIHR & TNAU Agritech Portal
                  </span>
                </div>
              </div>

              <Link
                to="/farmer/crop-doctor"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800"
              >
                Try AI Crop Doctor Scanner →
              </Link>
            </div>

            {/* AgriAI Bilingual Voice Assistant Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
                  <span>Tamil & English Voice Assistant</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  AgriAI — Your Smart Conversational Companion
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Speak directly in Tamil or English to check mandi rates, best selling periods,
                  profit calculations, and pest advisories hands-free in the field.
                </p>

                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 mb-6 text-xs space-y-2">
                  <p className="text-slate-700 italic font-medium">
                    🎙️ "என் தக்காளியை எப்போது விற்றால் நல்ல விலை கிடைக்கும்?"
                  </p>
                  <p className="text-indigo-900 font-semibold">
                    🔊 "இன்றைய நிலவரப்படி ₹28–₹32/கிலோ. அடுத்த 10 நாட்களில் ₹34–₹38 ஆக உயர வாய்ப்புள்ளது."
                  </p>
                </div>
              </div>

              <Link
                to="/farmer/assistant"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-800"
              >
                Open AgriAI Voice Assistant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 5. FAQ SECTION */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Everything you need to know about Namma Farm.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h5 className="text-sm font-bold text-slate-900 mb-1">
                How does Namma Farm prevent price exploitation by middlemen?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                By publishing live, verified APMC Mandi benchmark prices and connecting farmers directly
                with certified corporate retailers, wholesalers, and exporters who purchase directly at
                farmgate rates.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h5 className="text-sm font-bold text-slate-900 mb-1">
                Where do the AI Crop Doctor disease treatments come from?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                All treatment recommendations come strictly from certified agricultural databases
                (ICAR, TNAU, State Agricultural Extension Portals). The AI is strictly constrained from
                inventing unverified chemicals or off-label dosages.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h5 className="text-sm font-bold text-slate-900 mb-1">
                How are payments protected between Farmers and Buyers?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buyers authorize payments into an automated Escrow pool upon order placement. Funds
                are disbursed directly to the farmer's registered bank account once delivery and grade
                inspection are confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
