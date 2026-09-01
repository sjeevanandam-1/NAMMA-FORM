import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Stethoscope,
  Package,
  Bot,
  Sprout,
  Building,
  LogIn,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const MobileNav: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Public Bottom Nav (Logged Out) */}
        {!user && (
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>{t('home')}</span>
            </NavLink>

            <NavLink
              to="/register/farmer"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-emerald-700'
                }`
              }
            >
              <Sprout className="w-5 h-5 mb-0.5 text-emerald-600" />
              <span>{t('join_as_farmer')}</span>
            </NavLink>

            <NavLink
              to="/register/buyer"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-blue-700'
                }`
              }
            >
              <Building className="w-5 h-5 mb-0.5 text-blue-600" />
              <span>{t('join_as_buyer')}</span>
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <LogIn className="w-5 h-5 mb-0.5" />
              <span>{t('sign_in')}</span>
            </NavLink>
          </>
        )}

        {/* Authenticated Farmer Bottom Nav */}
        {user && role === 'FARMER' && (
          <>
            <NavLink
              to="/farmer/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Sprout className="w-5 h-5 mb-0.5" />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span>{t('marketplace')}</span>
            </NavLink>

            <NavLink
              to="/farmer/crop-doctor"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Stethoscope className="w-5 h-5 mb-0.5" />
              <span>{t('crop_doctor')}</span>
            </NavLink>

            <NavLink
              to="/farmer/orders"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Package className="w-5 h-5 mb-0.5" />
              <span>{t('my_orders')}</span>
            </NavLink>

            <NavLink
              to="/farmer/assistant"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Bot className="w-5 h-5 mb-0.5" />
              <span>{t('ai_assistant')}</span>
            </NavLink>
          </>
        )}

        {/* Authenticated Buyer Bottom Nav */}
        {user && role === 'BUYER' && (
          <>
            <NavLink
              to="/buyer/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Building className="w-5 h-5 mb-0.5" />
              <span>{t('buyer_dashboard')}</span>
            </NavLink>

            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span>{t('browse_crops')}</span>
            </NavLink>

            <NavLink
              to="/buyer/orders"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Package className="w-5 h-5 mb-0.5" />
              <span>{t('my_orders')}</span>
            </NavLink>

            <NavLink
              to="/farmer/price-analysis"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span>{t('price_analysis')}</span>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
export default MobileNav;
