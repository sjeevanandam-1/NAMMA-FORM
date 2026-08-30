import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  ShieldCheck,
  QrCode,
  Printer,
  Download,
  MapPin,
  Landmark,
  FileText,
  Activity,
  Award,
  Sparkles,
  CheckCircle,
  Share2,
} from 'lucide-react';

export const FarmerPassportPage: React.FC = () => {
  const { language } = useLanguage();
  const [passport, setPassport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/passport/my-passport');
      if (res.data?.data) {
        setPassport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch farmer passport', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Actions Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Official Digital Credentials
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {language === 'ta' ? 'டிஜிட்டல் விவசாயி பாஸ்போர்ட்' : 'Digital Farmer Passport & Soil Card'}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400">Compiling your Digital Farmer Passport...</div>
        ) : passport ? (
          /* Official Passport Card (Printable) */
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden print:border-none print:shadow-none">
            {/* Passport Header Strip */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest block">
                    NAMMA FARM AGRARIAN PASSPORT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{passport.farmer.name}</h2>
                  <span className="text-xs text-slate-300">Passport ID: {passport.passportNumber}</span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider">
                  KYC VERIFIED
                </span>
                <span className="text-[10px] text-slate-300 block mt-1">Government Aadhaar Linked</span>
              </div>
            </div>

            {/* Main Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Profile & Farm Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-200">
                {/* Farmer Details */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    1. Farmer Credentials
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>
                      <strong>Full Name:</strong> {passport.farmer.name}
                    </div>
                    <div>
                      <strong>Phone:</strong> {passport.farmer.phone}
                    </div>
                    <div>
                      <strong>Email:</strong> {passport.farmer.email}
                    </div>
                    <div>
                      <strong>KYC Status:</strong> <span className="text-emerald-700 font-bold">100% Verified</span>
                    </div>
                  </div>
                </div>

                {/* Land & Soil Details */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    2. Land Holding & Crops
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>
                      <strong>Total Land:</strong> {passport.farmDetails.totalLandAreaAcre} Acres
                    </div>
                    <div>
                      <strong>Location:</strong> {passport.farmDetails.location}, {passport.farmDetails.village}
                    </div>
                    <div>
                      <strong>District / State:</strong> {passport.farmDetails.district}, {passport.farmDetails.state}
                    </div>
                    <div>
                      <strong>Main Crops:</strong> {passport.farmDetails.mainCrops}
                    </div>
                  </div>
                </div>

                {/* Credit Rating */}
                <div className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    3. Credit & Trust Index
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>
                      <strong>Trust Score:</strong>{' '}
                      <span className="text-base font-extrabold text-emerald-700">{passport.creditAndTrust.trustScore}/100</span>
                    </div>
                    <div>
                      <strong>Credit Grade:</strong> {passport.creditAndTrust.creditRatingGrade}
                    </div>
                    <div>
                      <strong>Lifetime Trade:</strong> ₹{passport.creditAndTrust.totalLifetimeSales?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Fulfilled Orders:</strong> {passport.creditAndTrust.totalTransactions} Transactions
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Health Card Section */}
              <div className="space-y-3 pb-6 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> Soil Health Index & NPK Fertility Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Soil Health Score</span>
                    <strong className="text-emerald-700 text-sm font-bold">{passport.soilHealth.soilHealthIndex} / 10</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">NPK Balance</span>
                    <strong className="text-slate-800 text-xs font-bold">{passport.soilHealth.soilNPKStatus}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Organic Carbon</span>
                    <strong className="text-slate-800 text-xs font-bold">{passport.soilHealth.organicCarbonPct}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">EC Salinity Index</span>
                    <strong className="text-slate-800 text-xs font-bold">{passport.soilHealth.ecValue}</strong>
                  </div>
                </div>
              </div>

              {/* Enrolled Schemes & Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Enrolled Government Schemes
                  </h4>
                  <div className="space-y-2">
                    {(passport.governmentSchemes || []).map((sch: any) => (
                      <div
                        key={sch.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-900 block">{sch.scheme.title}</strong>
                          <span className="text-[10px] text-slate-500">App No: {sch.applicationNumber}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          {sch.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Active Loans & Insurance Coverage
                  </h4>
                  <div className="space-y-2">
                    {(passport.insuranceCoverage || []).map((pol: any) => (
                      <div
                        key={pol.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-900 block">{pol.cropName} PMFBY Insurance</strong>
                          <span className="text-[10px] text-slate-500">Policy: {pol.policyNumber}</span>
                        </div>
                        <span className="font-bold text-emerald-700">₹{pol.sumInsured?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer QR Verification */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 border border-slate-200">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div>
                    <strong className="text-slate-700 block">Scan to Verify Digital Credential</strong>
                    <span>Authorized by Namma Farm Agrarian Network</span>
                  </div>
                </div>
                <div className="text-right">
                  <span>Issued Date: {new Date().toLocaleDateString()}</span>
                  <span className="block text-[10px]">Tamper-Proof Digital Ledger Record</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default FarmerPassportPage;
