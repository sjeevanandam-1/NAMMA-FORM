import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import {
  Sprout,
  Sparkles,
  TrendingUp,
  Package,
  Stethoscope,
  Bot,
  Plus,
  CloudSun,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Landmark,
  Scale,
  Warehouse,
  PhoneCall,
  Droplets,
  Tractor,
  Truck,
  FileText,
  Users,
  Calculator,
  Recycle,
  GraduationCap,
  Bell,
  ChevronRight,
  DollarSign,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [priceForecast, setPriceForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, ordersRes, weatherRes, forecastRes] = await Promise.all([
          api.get('/listings/my-listings').catch(() => ({ data: { data: [] } })),
          api.get('/orders/my-orders').catch(() => ({ data: { data: [] } })),
          api.get('/weather?district=Coimbatore&state=Tamil Nadu').catch(() => ({ data: { data: null } })),
          api.get('/ai/price-forecast?crop=Tomato&state=Tamil Nadu').catch(() => ({ data: { data: null } })),
        ]);

        setListings(listingsRes.data?.data || []);
        setOrders(ordersRes.data?.data || []);
        setWeather(weatherRes.data?.data);
        setPriceForecast(forecastRes.data?.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" />
              Namma Farm • 22 Integrated Features
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'ta' ? `வணக்கம், ${user?.name || 'விவசாயி'}!` : `Welcome back, ${user?.name || 'Farmer'}!`}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
              {language === 'ta'
                ? 'உங்கள் பண்ணை மேலாண்மை, அரசு மானியங்கள், AI பயிர் மருத்துவர் மற்றும் நேரடி சந்தை வர்த்தக மையம்.'
                : 'Manage your crops, access government subsidies, check AI price forecasts, and sell directly to buyers.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/farmer/passport"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Farmer Passport
            </Link>
            <Link
              to="/farmer/listings"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Create Crop Listing
            </Link>
          </div>
        </div>

        {/* 4 Primary Metric Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Active Crop Listings</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{listings.length}</div>
            <Link to="/farmer/listings" className="text-[11px] text-emerald-600 font-semibold hover:underline mt-1 block">
              Manage listings →
            </Link>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Active Buyer Orders</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{activeOrders.length}</div>
            <Link to="/farmer/orders" className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 block">
              Track deliveries →
            </Link>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Tomato Mandi Price</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">₹34/kg</div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% This Week
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Kisan Support Desk</span>
            <div className="text-lg font-bold text-slate-900 mt-1">1800-180-1551</div>
            <Link to="/farmer/support" className="text-[11px] text-rose-600 font-semibold hover:underline mt-1 block">
              Open Support Ticket →
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 22 FEATURES TILES ORGANIZED BY AGRICULTURAL DOMAINS */}
        {/* ---------------------------------------------------- */}

        {/* Section 1: Government Policy & Assured Prices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              1. Government Schemes, Policy & MSP Assured Prices
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/farmer/schemes"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Government Schemes Hub
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Central & State schemes (PM-KISAN, PMKSY, Subsidies). Check eligibility, required documents & apply DBT.
              </p>
            </Link>

            <Link
              to="/farmer/msp"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 group-hover:scale-110 transition">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition">
                Government Assured Price / MSP
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kharif & Rabi MSP rates, nearby FCI/TNCSC procurement centres, digital receipts & price comparison.
              </p>
            </Link>

            <Link
              to="/farmer/passport"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                Digital Farmer Passport
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified farmer profile, land records, soil health card, sales history, and printable QR credentials.
              </p>
            </Link>
          </div>
        </div>

        {/* Section 2: AI Agriculture Intelligence & Decision Engines */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            2. AI Farming Intelligence & Advisory Engines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/farmer/crop-doctor"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 group-hover:scale-110 transition">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Crop Health Scanner</h3>
              <p className="text-xs text-slate-500">
                AI leaf disease diagnosis, severity score, bio & organic remedies.
              </p>
            </Link>

            <Link
              to="/farmer/assistant"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 group-hover:scale-110 transition">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Agriculture Chatbot</h3>
              <p className="text-xs text-slate-500">
                Tamil & English voice I/O, multimodal image diagnostics, and farming Q&A.
              </p>
            </Link>

            <Link
              to="/farmer/price-analysis"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 group-hover:scale-110 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Price Analysis (7 Days)</h3>
              <p className="text-xs text-slate-500">
                Live Mandi trends, 7-day history graph, and 7d/14d/30d forecasts.
              </p>
            </Link>

            <Link
              to="/farmer/market-comparison"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 group-hover:scale-110 transition">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Market Comparison</h3>
              <p className="text-xs text-slate-500">
                Formula: Net Profit = Revenue - Freight - Mandi Cess - Deductions.
              </p>
            </Link>

            <Link
              to="/farmer/irrigation"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-cyan-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-700 group-hover:scale-110 transition">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Smart Irrigation</h3>
              <p className="text-xs text-slate-500">
                Crop & rain-aware daily water requirements (liters/acre) and drip schedules.
              </p>
            </Link>

            <Link
              to="/farmer/calendar"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Crop Calendar</h3>
              <p className="text-xs text-slate-500">
                Sowing-to-harvest stage-wise fertigation, spraying, and harvest countdown.
              </p>
            </Link>

            <Link
              to="/farmer/profit-calculator"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-green-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 group-hover:scale-110 transition">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Profit Calculator</h3>
              <p className="text-xs text-slate-500">
                Comprehensive budget planner: Seeds, fert, labour, yield & net margins.
              </p>
            </Link>

            <Link
              to="/farmer/weather"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-sky-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-700 group-hover:scale-110 transition">
                <CloudSun className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Hyperlocal Weather</h3>
              <p className="text-xs text-slate-500">
                Live temperature, rainfall probability, and agro-meteorological advisories.
              </p>
            </Link>
          </div>
        </div>

        {/* Section 3: Farmgate Logistics, Equipment & Agricultural Residue */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-orange-600" />
            3. Farm Machinery, Storage Godowns & Logistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/farmer/storage"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-cyan-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-700 group-hover:scale-110 transition">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Government Storage Finder</h3>
              <p className="text-xs text-slate-500">
                CWC & SWC grain godowns, cold storages, capacity in MT & online booking.
              </p>
            </Link>

            <Link
              to="/farmer/equipment"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-700 group-hover:scale-110 transition">
                <Tractor className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Farm Equipment Rental</h3>
              <p className="text-xs text-slate-500">
                Tractors, combine harvesters, rotavators, and spray drones with operators.
              </p>
            </Link>

            <Link
              to="/farmer/transport"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 group-hover:scale-110 transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Smart Transport</h3>
              <p className="text-xs text-slate-500">
                Mini trucks (Tata Ace), 3-ton haulage, distance calculator & freight booking.
              </p>
            </Link>

            <Link
              to="/farmer/waste-market"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Agricultural Waste Market</h3>
              <p className="text-xs text-slate-500">
                Monetize paddy straw, sugarcane bagasse & coir pith for biofuel plants.
              </p>
            </Link>
          </div>
        </div>

        {/* Section 4: Credit, Crop Insurance, Community & Expert Access */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            4. Credit, Crop Insurance, Community & Expert Advisory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/farmer/finance"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Finance & KCC Loans</h3>
              <p className="text-xs text-slate-500">
                Kisan Credit Card at 4% subvented interest, EMI calculator & fast application.
              </p>
            </Link>

            <Link
              to="/farmer/insurance"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">PMFBY Crop Insurance</h3>
              <p className="text-xs text-slate-500">
                Subsidized 1.5%-2% premium coverage, cut-off dates & digital loss claims.
              </p>
            </Link>

            <Link
              to="/farmer/community"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Community Connect</h3>
              <p className="text-xs text-slate-500">
                Interactive farmer forum: organic farming recipes, pest warnings & discussions.
              </p>
            </Link>

            <Link
              to="/farmer/experts"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 group-hover:scale-110 transition">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct Expert Access</h3>
              <p className="text-xs text-slate-500">
                1-on-1 consultations with verified TNAU / ICAR scientists & prescriptions.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FarmerDashboard;
