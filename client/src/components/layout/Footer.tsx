import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Award, Heart, CheckCircle2, FileText, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Namma<span className="text-emerald-400"> Farm</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering farmers with AI decision intelligence: WHAT to grow, WHEN to sell, WHERE
              to sell, and WHO to sell to.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ICAR & AGMARKNET Verified Data Hub</span>
            </div>
          </div>

          {/* AI Decision Engines */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              AI Decision Engines
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/farmer/ai-intelligence" className="hover:text-emerald-400 transition-colors">
                  AI Price Forecasting (7/14/30 Days)
                </Link>
              </li>
              <li>
                <Link to="/farmer/ai-intelligence" className="hover:text-emerald-400 transition-colors">
                  Where Should I Sell (Best Market)
                </Link>
              </li>
              <li>
                <Link to="/farmer/ai-intelligence" className="hover:text-emerald-400 transition-colors">
                  AI Profit Advisor & Net Realization
                </Link>
              </li>
              <li>
                <Link to="/farmer/crop-doctor" className="hover:text-emerald-400 transition-colors">
                  AI Crop Doctor (Leaf Vision & Verified Remedies)
                </Link>
              </li>
              <li>
                <Link to="/farmer/assistant" className="hover:text-emerald-400 transition-colors">
                  AgriAI Voice Assistant (English + தமிழ்)
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace & Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Direct Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">
                  Browse Active Crop Listings
                </Link>
              </li>
              <li>
                <Link to="/register/farmer" className="hover:text-emerald-400 transition-colors">
                  Farmer Registration & Free Farm KYC
                </Link>
              </li>
              <li>
                <Link to="/register/buyer" className="hover:text-emerald-400 transition-colors">
                  Verified Buyer Trade Onboarding
                </Link>
              </li>
              <li>
                <Link to="/government/dashboard" className="hover:text-emerald-400 transition-colors">
                  Government Agricultural Surveillance
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-emerald-400 transition-colors">
                  Admin Control & Audit Logs
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Trust & Transparency
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Every transaction is protected with Escrow guarantees, transparent Mandi pricing, and
              verified ICAR/TNAU disease advisories.
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400">
                <ShieldCheck className="w-4 h-4" />
                AgriTrust Score Protection
              </div>
              <p className="text-[11px] text-slate-400">
                Zero middleman commissions. 100% direct farmer payout.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Namma Farm Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Agricultural Advisory Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
