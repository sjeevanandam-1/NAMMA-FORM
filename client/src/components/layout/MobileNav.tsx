import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, Stethoscope, Package, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const MobileNav: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
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
          <span>Market</span>
        </NavLink>

        <NavLink
          to={role === 'FARMER' ? '/farmer/ai-intelligence' : '/farmer/assistant'}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 mb-0.5 text-emerald-600" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span>AI Intel</span>
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
          <span>Doctor</span>
        </NavLink>

        <NavLink
          to={role === 'BUYER' ? '/buyer/orders' : '/farmer/orders'}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
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
          <span>AgriAI</span>
        </NavLink>
      </div>
    </div>
  );
};
