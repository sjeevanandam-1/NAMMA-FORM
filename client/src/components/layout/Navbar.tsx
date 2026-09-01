import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  Sprout,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Bot,
  Bell,
  Globe,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Landmark,
  Scale,
  Warehouse,
  PhoneCall,
  CloudSun,
  Droplets,
  Calendar,
  Tractor,
  TrendingUp,
  Truck,
  FileText,
  ShieldCheck,
  Users,
  Calculator,
  Recycle,
  GraduationCap,
  ChevronDown,
  Building,
  Package,
  MessageSquare,
  Home,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Determine logo redirect based on authentication and user role
  const getLogoDestination = () => {
    if (!user) return '/';
    if (role === 'FARMER') return '/farmer/dashboard';
    if (role === 'BUYER') return '/buyer/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'GOVERNMENT_OFFICIAL') return '/government/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to={getLogoDestination()} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Namma<span className="text-emerald-600"> Farm</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Digital Agriculture Platform
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Public Links (when NOT logged in) */}
              {!user && (
                <>
                  <Link
                    to="/"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    Home
                  </Link>
                  <Link
                    to="/register/farmer"
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    Join as Farmer
                  </Link>
                  <Link
                    to="/register/buyer"
                    className="px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    Join as Buyer
                  </Link>
                </>
              )}

              {/* FARMER Role Navigation */}
              {user && role === 'FARMER' && (
                <>
                  <Link
                    to="/farmer/dashboard"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/marketplace"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    Marketplace
                  </Link>

                  {/* Schemes & MSP Dropdown */}
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown('schemes')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 rounded-lg transition flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                      Schemes & MSP
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    {activeDropdown === 'schemes' && (
                      <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50">
                        <Link
                          to="/farmer/schemes"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Landmark className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div>Government Schemes Hub</div>
                            <span className="text-[10px] text-slate-400 font-normal">PM-KISAN, Subsidies & DBT</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/msp"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Scale className="w-4 h-4 text-amber-600" />
                          <div>
                            <div>Assured Price / MSP</div>
                            <span className="text-[10px] text-slate-400 font-normal">FCI Centers & Digital Receipts</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/passport"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>Digital Farmer Passport</div>
                            <span className="text-[10px] text-slate-400 font-normal">KYC & Soil Health Profile</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* AI Decision Tools Dropdown */}
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown('ai')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg transition flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI Farming
                      <ChevronDown className="w-3 h-3 text-emerald-600" />
                    </button>
                    {activeDropdown === 'ai' && (
                      <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50">
                        <Link
                          to="/farmer/crop-doctor"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <div>
                            <div>Crop Health Scanner</div>
                            <span className="text-[10px] text-slate-400 font-normal">AI Disease Diagnosis & Bio-Remedies</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/assistant"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Bot className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div>AI Agriculture Chatbot</div>
                            <span className="text-[10px] text-slate-400 font-normal">Multilingual Voice & Image Advisory</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/price-analysis"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>7-Day Price Analysis</div>
                            <span className="text-[10px] text-slate-400 font-normal">Live Mandi Prices & Forecasts</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/market-comparison"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Scale className="w-4 h-4 text-purple-600" />
                          <div>
                            <div>Market Comparison</div>
                            <span className="text-[10px] text-slate-400 font-normal">Multi-Mandi Net Profit Calculator</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/irrigation"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Droplets className="w-4 h-4 text-cyan-600" />
                          <div>
                            <div>Smart Irrigation</div>
                            <span className="text-[10px] text-slate-400 font-normal">Precision Water Requirement</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/calendar"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div>AI Crop Calendar</div>
                            <span className="text-[10px] text-slate-400 font-normal">Stage-wise Growth Tasks</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/profit-calculator"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Calculator className="w-4 h-4 text-green-600" />
                          <div>
                            <div>AI Profit Calculator</div>
                            <span className="text-[10px] text-slate-400 font-normal">Input Budget & ROI Margin</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Services & Logistics Dropdown */}
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown('services')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 rounded-lg transition flex items-center gap-1">
                      Services
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    {activeDropdown === 'services' && (
                      <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50">
                        <Link
                          to="/farmer/storage"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Warehouse className="w-4 h-4 text-cyan-700" />
                          <div>
                            <div>Storage Finder</div>
                            <span className="text-[10px] text-slate-400 font-normal">CWC & Cold Storages</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/equipment"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Tractor className="w-4 h-4 text-orange-600" />
                          <div>
                            <div>Equipment Rental</div>
                            <span className="text-[10px] text-slate-400 font-normal">Tractors, Drones & Harvesters</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/transport"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Truck className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>Smart Transport</div>
                            <span className="text-[10px] text-slate-400 font-normal">Mini Truck Farmgate Logistics</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/waste-market"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Recycle className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div>Agri Waste Market</div>
                            <span className="text-[10px] text-slate-400 font-normal">Paddy Straw & Biomass</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/weather"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <CloudSun className="w-4 h-4 text-sky-600" />
                          <div>
                            <div>Hyperlocal Weather</div>
                            <span className="text-[10px] text-slate-400 font-normal">7-Day Forecast & Warnings</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Finance & Community Dropdown */}
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown('finance')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 rounded-lg transition flex items-center gap-1">
                      Finance & Network
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    {activeDropdown === 'finance' && (
                      <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50">
                        <Link
                          to="/farmer/finance"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Landmark className="w-4 h-4 text-emerald-700" />
                          <div>
                            <div>KCC Loans & Finance</div>
                            <span className="text-[10px] text-slate-400 font-normal">4% Subvented Agri Credit</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/insurance"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-700" />
                          <div>
                            <div>PMFBY Crop Insurance</div>
                            <span className="text-[10px] text-slate-400 font-normal">Subsidized Claims & Protection</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/community"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Users className="w-4 h-4 text-purple-600" />
                          <div>
                            <div>Community Connect</div>
                            <span className="text-[10px] text-slate-400 font-normal">Farmer Q&A & Advice Forum</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/experts"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <GraduationCap className="w-4 h-4 text-teal-600" />
                          <div>
                            <div>Direct Expert Access</div>
                            <span className="text-[10px] text-slate-400 font-normal">Verified TNAU / ICAR Scientists</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/support"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <PhoneCall className="w-4 h-4 text-rose-600" />
                          <div>
                            <div>Toll-Free Support</div>
                            <span className="text-[10px] text-slate-400 font-normal">1800-180-1551 & Tickets</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* BUYER Role Navigation */}
              {user && role === 'BUYER' && (
                <>
                  <Link
                    to="/buyer/dashboard"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Buyer Dashboard
                  </Link>
                  <Link
                    to="/marketplace"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    Browse Crops
                  </Link>
                  <Link
                    to="/buyer/orders"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    My Orders
                  </Link>
                  <Link
                    to="/farmer/price-analysis"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Price Analysis
                  </Link>
                  <Link
                    to="/farmer/transport"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4 text-cyan-600" />
                    Logistics
                  </Link>
                  <Link
                    to="/farmer/waste-market"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Recycle className="w-4 h-4 text-teal-600" />
                    Biomass Market
                  </Link>
                  <Link
                    to="/chat"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    Negotiate
                  </Link>
                </>
              )}

              {/* ADMIN Role Navigation */}
              {user && role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100 rounded-lg hover:bg-amber-200 transition"
                >
                  Admin Portal
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Icons (Language, Notifications, Profile) */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Notification Bell (Only when logged in) */}
            {user && (
              <Link
                to="/farmer/notifications"
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Session Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <span className="hidden md:inline-block text-xs font-bold text-slate-700">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle (3-Bar ☰ Menu) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Three-bar (☰) Mobile Drawer Menu */}
      {/* ---------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2">
          {/* 1. LOGGED-OUT USERS: ONLY SAFE PUBLIC PAGES */}
          {!user && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Public Navigation
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800 transition"
              >
                <Home className="w-4 h-4 text-emerald-600" /> Home
              </Link>
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  to="/register/farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold transition"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" /> Join as Farmer
                </Link>
                <Link
                  to="/register/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold transition"
                >
                  <Building className="w-4 h-4 text-blue-600" /> Join as Buyer
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow transition"
                >
                  <LogIn className="w-4 h-4" /> Sign In to Account
                </Link>
              </div>
            </div>
          )}

          {/* 2. LOGGED-IN FARMER MENU */}
          {user && role === 'FARMER' && (
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Signed in as Farmer</span>
                  <strong className="text-sm font-bold text-slate-900">{user.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                Farmer Workspace
              </div>
              <Link
                to="/farmer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Sprout className="w-4 h-4 text-emerald-600" /> Farmer Dashboard
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Marketplace
              </Link>
              <Link
                to="/farmer/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Landmark className="w-4 h-4 text-emerald-600" /> Government Schemes
              </Link>
              <Link
                to="/farmer/msp"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Scale className="w-4 h-4 text-amber-600" /> Assured MSP Prices
              </Link>
              <Link
                to="/farmer/passport"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Digital Farmer Passport
              </Link>
              <Link
                to="/farmer/crop-doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" /> AI Crop Doctor
              </Link>
              <Link
                to="/farmer/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Bot className="w-4 h-4 text-indigo-600" /> AI Agriculture Chatbot
              </Link>
              <Link
                to="/farmer/price-analysis"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <TrendingUp className="w-4 h-4 text-blue-600" /> 7-Day Price Analysis
              </Link>
              <Link
                to="/farmer/storage"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Warehouse className="w-4 h-4 text-cyan-600" /> Storage Godowns
              </Link>
              <Link
                to="/farmer/equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Tractor className="w-4 h-4 text-orange-600" /> Equipment Rental
              </Link>
              <Link
                to="/farmer/transport"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Truck className="w-4 h-4 text-blue-600" /> Smart Transport
              </Link>
              <Link
                to="/farmer/finance"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Landmark className="w-4 h-4 text-emerald-700" /> KCC Loans & Finance
              </Link>
              <Link
                to="/farmer/insurance"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShieldCheck className="w-4 h-4 text-blue-700" /> PMFBY Crop Insurance
              </Link>
              <Link
                to="/farmer/community"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Users className="w-4 h-4 text-purple-600" /> Community Connect
              </Link>
              <Link
                to="/farmer/waste-market"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Recycle className="w-4 h-4 text-emerald-600" /> Agri Waste Market
              </Link>
              <Link
                to="/farmer/experts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" /> Direct Expert Access
              </Link>
              <Link
                to="/farmer/support"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" /> Toll-Free Assistance
              </Link>
            </div>
          )}

          {/* 3. LOGGED-IN BUYER MENU */}
          {user && role === 'BUYER' && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Signed in as Buyer</span>
                  <strong className="text-sm font-bold text-slate-900">{user.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                Buyer Procurement Hub
              </div>
              <Link
                to="/buyer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Building className="w-4 h-4 text-blue-600" /> Buyer Dashboard
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" /> Fresh Crop Marketplace
              </Link>
              <Link
                to="/buyer/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Package className="w-4 h-4 text-emerald-600" /> My Purchase Orders
              </Link>
              <Link
                to="/farmer/price-analysis"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Mandi Price Forecasts
              </Link>
              <Link
                to="/farmer/transport"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Truck className="w-4 h-4 text-cyan-600" /> Farmgate Logistics
              </Link>
              <Link
                to="/farmer/waste-market"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Recycle className="w-4 h-4 text-teal-600" /> Biomass & Crop Waste
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <MessageSquare className="w-4 h-4 text-purple-600" /> Direct Farmer Chat
              </Link>
              <Link
                to="/farmer/support"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" /> Helpdesk & Toll-Free
              </Link>
            </div>
          )}

          {/* 4. LOGGED-IN ADMIN MENU */}
          {user && role === 'ADMIN' && (
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Administrator</span>
                  <strong className="text-sm font-bold text-slate-900">{user.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>

              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-100 text-xs font-bold text-amber-950"
              >
                Admin Control Center
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                Marketplace
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
