import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Truck,
  MessageSquare,
  PhoneCall,
  Recycle,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Building,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, listingsRes] = await Promise.all([
          api.get('/orders/my-orders').catch(() => ({ data: { data: [] } })),
          api.get('/marketplace?limit=4').catch(() => ({ data: { data: { listings: [] } } })),
        ]);

        setOrders(ordersRes.data?.data || []);
        const fetchedListings = listingsRes.data?.data?.listings || listingsRes.data?.data || [];
        setFeaturedListings(Array.isArray(fetchedListings) ? fetchedListings.slice(0, 4) : []);
      } catch (err) {
        console.error('Error loading buyer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5" />
              Namma Farm • Commercial Buyer Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'ta'
                ? `வணக்கம், ${user?.name || 'கொள்முதலாளர்'}!`
                : `Welcome back, ${user?.name || 'Buyer'}!`}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
              {language === 'ta'
                ? 'நேரடி விவசாயிகளிடம் இருந்து தரமான விளைபொருட்களை இடைத்தரகர்களின்றி மொத்தமாக கொள்முதல் செய்யுங்கள்.'
                : 'Direct farmgate procurement platform. Track wholesale shipments, verify produce quality grades, and source directly from certified farmers.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/marketplace"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Marketplace
            </Link>
            <Link
              to="/buyer/orders"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-blue-300" />
              My Orders
            </Link>
          </div>
        </div>

        {/* 4 Metric Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Active Shipments</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {activeOrders.length}
            </div>
            <Link
              to="/buyer/orders"
              className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 block"
            >
              Track in transit →
            </Link>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Completed Orders</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {completedOrders.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Verified Deliveries</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Total Procurement</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              ₹{totalSpent.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              100% Escrow Protected
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block">Direct Support</span>
            <div className="text-lg font-bold text-slate-900 mt-1">1800-889-FARM</div>
            <Link
              to="/farmer/support"
              className="text-[11px] text-rose-600 font-semibold hover:underline mt-1 block"
            >
              Helpdesk & Inquiries →
            </Link>
          </div>
        </div>

        {/* Quick Access Modules Grid for Buyer */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Buyer Services & Commercial Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/marketplace"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 group-hover:scale-110 transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                Direct Crop Marketplace
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by crop type, grade (A/B/C), harvested date, and district. Direct farmgate pricing with 0% brokerage cuts.
              </p>
            </Link>

            <Link
              to="/buyer/orders"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 group-hover:scale-110 transition">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Order Tracking & Receipts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live dispatch timeline (Pending → Packed → In Transit → Delivered), digital GST invoices, and farmer quality ratings.
              </p>
            </Link>

            <Link
              to="/farmer/price-analysis"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 group-hover:scale-110 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition">
                7-Day Mandi Price Analysis
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live mandi benchmark rates across Koyambedu, Azadpur, and local APMCs with 7d/14d/30d price trend forecasting.
              </p>
            </Link>

            <Link
              to="/farmer/transport"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-cyan-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-700 group-hover:scale-110 transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition">
                Farmgate Transport & Logistics
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Book verified mini trucks (Tata Ace) and 3-ton haulage vehicles directly from the farmer's plot to your warehouse.
              </p>
            </Link>

            <Link
              to="/farmer/waste-market"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 group-hover:scale-110 transition">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                Agricultural Biomass & Residue
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Procure bulk paddy straw bales, sugarcane bagasse, and coir pith for industrial biofuel, packaging, and composting.
              </p>
            </Link>

            <Link
              to="/chat"
              className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-md transition group space-y-2"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 group-hover:scale-110 transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                Direct Farmer Negotiation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure real-time chat with farmers to negotiate volume discounts, arrange sample inspections, and lock procurement deals.
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-500">Live fulfillment status of your recent procurements</p>
            </div>
            <Link
              to="/buyer/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No purchase orders placed yet.{' '}
              <Link to="/marketplace" className="text-blue-600 font-bold hover:underline">
                Explore Fresh Marketplace
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs">
                      #{order.id.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {order.listing?.cropName || 'Farm Produce'} ({order.quantityKg} kg)
                      </h4>
                      <span className="text-xs text-slate-500">
                        Farmer: {order.listing?.farmer?.name || 'Verified Farmer'} • {order.deliveryAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{order.totalPrice?.toLocaleString()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BuyerDashboard;
