import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../../context/LanguageContext.js';
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
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t, currentLanguageOption, supportedLanguages } = useLanguage();
  const { notifications, unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine logo redirect based on authentication and user role
  const getLogoDestination = () => {
    if (!user) return '/';
    if (role === 'FARMER') return '/farmer/dashboard';
    if (role === 'BUYER') return '/buyer/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'GOVERNMENT_OFFICIAL') return '/government/dashboard';
    return '/';
  };

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    setLanguageMenuOpen(false);
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
                    {language === 'en' ? 'Namma' : t('app_title').split(' ')[0]}
                    <span className="text-emerald-600"> {language === 'en' ? 'Farm' : t('app_title').split(' ').slice(1).join(' ')}</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  {t('app_tagline')}
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
                    {t('home')}
                  </Link>
                  <Link
                    to="/register/farmer"
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    {t('join_as_farmer')}
                  </Link>
                  <Link
                    to="/register/buyer"
                    className="px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    {t('join_as_buyer')}
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
                    {t('dashboard')}
                  </Link>

                  <Link
                    to="/marketplace"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    {t('marketplace')}
                  </Link>

                  {/* Schemes & MSP Dropdown */}
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown('schemes')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 rounded-lg transition flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                      {t('schemes_msp')}
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
                            <div>{t('gov_schemes_hub')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('gov_schemes_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/msp"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Scale className="w-4 h-4 text-amber-600" />
                          <div>
                            <div>{t('assured_price_msp')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('assured_price_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/passport"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>{t('farmer_passport')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('farmer_passport_sub')}</span>
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
                      {t('ai_farming')}
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
                            <div>{t('crop_doctor')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('crop_doctor_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/assistant"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Bot className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div>{t('ai_assistant')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('ai_assistant_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/price-analysis"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>{t('price_analysis')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('price_analysis_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/market-comparison"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Scale className="w-4 h-4 text-purple-600" />
                          <div>
                            <div>{t('market_comparison')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('market_comparison_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/irrigation"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Droplets className="w-4 h-4 text-cyan-600" />
                          <div>
                            <div>{t('smart_irrigation')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('smart_irrigation_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/calendar"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div>{t('crop_calendar')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('crop_calendar_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/profit-calculator"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Calculator className="w-4 h-4 text-green-600" />
                          <div>
                            <div>{t('profit_calculator')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('profit_calculator_sub')}</span>
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
                      {t('farm_services')}
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
                            <div>{t('storage_finder')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('storage_finder_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/equipment"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Tractor className="w-4 h-4 text-orange-600" />
                          <div>
                            <div>{t('equipment_rental')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('equipment_rental_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/transport"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Truck className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>{t('smart_transport')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('smart_transport_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/waste-market"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Recycle className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div>{t('agri_waste_market')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('agri_waste_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/weather"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <CloudSun className="w-4 h-4 text-sky-600" />
                          <div>
                            <div>{t('weather')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('weather_sub')}</span>
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
                      {t('finance_network')}
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
                            <div>{t('kcc_loans')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('kcc_loans_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/insurance"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-700" />
                          <div>
                            <div>{t('pmfby_insurance')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('pmfby_insurance_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/community"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <Users className="w-4 h-4 text-purple-600" />
                          <div>
                            <div>{t('community_connect')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('community_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/experts"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <GraduationCap className="w-4 h-4 text-teal-600" />
                          <div>
                            <div>{t('direct_experts')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('direct_experts_sub')}</span>
                          </div>
                        </Link>
                        <Link
                          to="/farmer/support"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                        >
                          <PhoneCall className="w-4 h-4 text-rose-600" />
                          <div>
                            <div>{t('toll_free_support')}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{t('toll_free_sub')}</span>
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
                    {t('buyer_dashboard')}
                  </Link>
                  <Link
                    to="/marketplace"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    {t('browse_crops')}
                  </Link>
                  <Link
                    to="/buyer/orders"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    {t('my_orders')}
                  </Link>
                  <Link
                    to="/farmer/price-analysis"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    {t('price_analysis')}
                  </Link>
                  <Link
                    to="/farmer/transport"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4 text-cyan-600" />
                    {t('smart_transport')}
                  </Link>
                  <Link
                    to="/farmer/waste-market"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Recycle className="w-4 h-4 text-teal-600" />
                    {t('agri_waste_market')}
                  </Link>
                  <Link
                    to="/chat"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    {t('direct_chat')}
                  </Link>
                </>
              )}

              {/* ADMIN Role Navigation */}
              {user && role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100 rounded-lg hover:bg-amber-200 transition"
                >
                  {t('admin_portal')}
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Icons (Language, Notifications, Profile) */}
          <div className="flex items-center gap-3">
            {/* Interactive 6-Language Dropdown Selector */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-slate-200 shadow-2xs"
                title={t('change_language')}
                aria-expanded={languageMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLanguageOption.nativeName}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {t('change_language')}
                  </div>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                        language === lang.code
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lang.flag}</span>
                        <div>
                          <span className="block">{lang.nativeName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{lang.name}</span>
                        </div>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell (Only when logged in) */}
            {user && (
              <Link
                to="/farmer/notifications"
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition relative"
                title={t('notifications')}
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
                  title={t('logout')}
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
                {t('sign_in')}
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
          {/* Mobile Language Selector Grid */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              {t('change_language')}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 1. LOGGED-OUT USERS: ONLY SAFE PUBLIC PAGES */}
          {!user && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {t('home')}
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800 transition"
              >
                <Home className="w-4 h-4 text-emerald-600" /> {t('home')}
              </Link>
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  to="/register/farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold transition"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" /> {t('join_as_farmer')}
                </Link>
                <Link
                  to="/register/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold transition"
                >
                  <Building className="w-4 h-4 text-blue-600" /> {t('join_as_buyer')}
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow transition"
                >
                  <LogIn className="w-4 h-4" /> {t('sign_in_account')}
                </Link>
              </div>
            </div>
          )}

          {/* 2. LOGGED-IN FARMER MENU */}
          {user && role === 'FARMER' && (
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">{t('account_type_farmer')}</span>
                  <strong className="text-sm font-bold text-slate-900">{user.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('logout')}
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                {t('farmer_dashboard')}
              </div>
              <Link
                to="/farmer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Sprout className="w-4 h-4 text-emerald-600" /> {t('farmer_dashboard')}
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> {t('marketplace')}
              </Link>
              <Link
                to="/farmer/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Landmark className="w-4 h-4 text-emerald-600" /> {t('gov_schemes_hub')}
              </Link>
              <Link
                to="/farmer/msp"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Scale className="w-4 h-4 text-amber-600" /> {t('assured_price_msp')}
              </Link>
              <Link
                to="/farmer/passport"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" /> {t('farmer_passport')}
              </Link>
              <Link
                to="/farmer/crop-doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" /> {t('crop_doctor')}
              </Link>
              <Link
                to="/farmer/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Bot className="w-4 h-4 text-indigo-600" /> {t('ai_assistant')}
              </Link>
              <Link
                to="/farmer/price-analysis"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <TrendingUp className="w-4 h-4 text-blue-600" /> {t('price_analysis')}
              </Link>
              <Link
                to="/farmer/storage"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Warehouse className="w-4 h-4 text-cyan-600" /> {t('storage_finder')}
              </Link>
              <Link
                to="/farmer/equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Tractor className="w-4 h-4 text-orange-600" /> {t('equipment_rental')}
              </Link>
              <Link
                to="/farmer/transport"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Truck className="w-4 h-4 text-blue-600" /> {t('smart_transport')}
              </Link>
              <Link
                to="/farmer/finance"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Landmark className="w-4 h-4 text-emerald-700" /> {t('kcc_loans')}
              </Link>
              <Link
                to="/farmer/insurance"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShieldCheck className="w-4 h-4 text-blue-700" /> {t('pmfby_insurance')}
              </Link>
              <Link
                to="/farmer/community"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Users className="w-4 h-4 text-purple-600" /> {t('community_connect')}
              </Link>
              <Link
                to="/farmer/waste-market"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Recycle className="w-4 h-4 text-emerald-600" /> {t('agri_waste_market')}
              </Link>
              <Link
                to="/farmer/experts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" /> {t('direct_experts')}
              </Link>
              <Link
                to="/farmer/support"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" /> {t('toll_free_support')}
              </Link>
            </div>
          )}

          {/* 3. LOGGED-IN BUYER MENU */}
          {user && role === 'BUYER' && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">{t('account_type_buyer')}</span>
                  <strong className="text-sm font-bold text-slate-900">{user.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('logout')}
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                {t('buyer_hub')}
              </div>
              <Link
                to="/buyer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Building className="w-4 h-4 text-blue-600" /> {t('buyer_dashboard')}
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" /> {t('browse_crops')}
              </Link>
              <Link
                to="/buyer/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Package className="w-4 h-4 text-emerald-600" /> {t('my_orders')}
              </Link>
              <Link
                to="/farmer/price-analysis"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" /> {t('mandi_forecasts')}
              </Link>
              <Link
                to="/farmer/transport"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Truck className="w-4 h-4 text-cyan-600" /> {t('farmgate_logistics')}
              </Link>
              <Link
                to="/farmer/waste-market"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <Recycle className="w-4 h-4 text-teal-600" /> {t('biomass_market')}
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <MessageSquare className="w-4 h-4 text-purple-600" /> {t('direct_chat')}
              </Link>
              <Link
                to="/farmer/support"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" /> {t('toll_free_support')}
              </Link>
            </div>
          )}

          {/* 4. LOGGED-IN ADMIN MENU */}
          {user && role === 'ADMIN' && (
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">{t('admin_portal')}</span>
                  <strong className="text-sm font-bold text-slate-900">{user.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('logout')}
                </button>
              </div>

              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-100 text-xs font-bold text-amber-950"
              >
                {t('admin_portal')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
