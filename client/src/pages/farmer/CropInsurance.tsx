import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FileText,
  CheckCircle,
  Plus,
  Camera,
  Layers,
} from 'lucide-react';

export const CropInsurance: React.FC = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [myPolicies, setMyPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schemes' | 'calculator' | 'policies'>('schemes');

  // Premium calculator
  const [calcForm, setCalcForm] = useState({
    cropCategory: 'VEGETABLES',
    landAreaAcre: '3.0',
    scaleOfFinancePerAcre: '40000',
  });
  const [calcResult, setCalcResult] = useState<any | null>(null);

  // Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [claimForm, setClaimForm] = useState({
    lossCause: 'UNSEASONAL_RAINFALL',
    lossDate: new Date().toISOString().split('T')[0],
    estimatedLossPct: '60',
    claimedAmount: '35000',
    lossDescription: 'Heavy unseasonal rains inundated 3 acres tomato crop during flowering stage.',
  });
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchInsuranceData();
    calculatePrem();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      const [prodRes, polRes] = await Promise.all([
        api.get('/insurance/products'),
        api.get('/insurance/my-policies').catch(() => ({ data: { data: [] } })),
      ]);

      if (prodRes.data?.data) setProducts(prodRes.data.data);
      if (polRes.data?.data) setMyPolicies(polRes.data.data);
    } catch (err) {
      console.error('Failed to fetch insurance data', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrem = async () => {
    try {
      const res = await api.post('/insurance/calculate-premium', calcForm);
      if (res.data?.data) setCalcResult(res.data.data);
    } catch (err) {
      console.error('Failed to calculate premium', err);
    }
  };

  const handleFileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    try {
      setSubmittingClaim(true);
      const res = await api.post('/insurance/claims', {
        policyId: selectedPolicy.id,
        ...claimForm,
      });
      setClaimSuccess(res.data?.data?.claimNumber || 'Claim Filed');
      fetchInsuranceData();
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to file insurance claim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              {language === 'ta' ? 'பயிர் காப்பீட்டு உதவி & இழப்பீடு' : 'Crop Insurance & Claim Settlement'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'பிரதமர் பயிர் காப்பீட்டுத் திட்டம் (PMFBY)' : 'Pradhan Mantri Fasal Bima Yojana (PMFBY)'}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'இயற்கை சீற்றங்கள் மற்றும் எதிர்பாராத பயிர் இழப்புகளுக்கு குறைந்த கட்டணத்தில் முழுமையான காப்பீட்டு பாதுகாப்பு.'
                : '1.5% to 2% subsidized premium coverage for drought, flood, hailstorms, and unseasonal rainfall.'}
            </p>
          </div>

          <div className="flex gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-700/40">
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'schemes' ? 'bg-blue-600 text-white font-bold shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              Schemes & Coverage
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'calculator' ? 'bg-blue-600 text-white font-bold shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              Premium Calculator
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition relative ${
                activeTab === 'policies' ? 'bg-blue-600 text-white font-bold shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              My Policies & Claims
              {myPolicies.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-emerald-400 text-slate-950 rounded-full font-bold">
                  {myPolicies.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Schemes Catalog */}
        {activeTab === 'schemes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg uppercase">
                      {p.providerName}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{p.schemeName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Farmer Premium</span>
                    <span className="text-2xl font-extrabold text-blue-700">{p.premiumRatePct}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Enrolment Cut-Off</span>
                    <strong className="text-slate-900 text-xs">{new Date(p.cutOffDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Claim Settlement Rate</span>
                    <strong className="text-emerald-700 text-xs">{p.claimSettlementAvg}% Settled</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-bold block mb-1.5">Covered Calamities:</span>
                  <div className="space-y-1">
                    {JSON.parse(p.coveredRisks || '[]').map((r: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Premium Calculator */}
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-slate-900">PMFBY Crop Insurance Premium Estimator</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Government pays 80-85% of total actuarial premium. Farmers pay only 1.5% to 2%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop Category</label>
                <select
                  value={calcForm.cropCategory}
                  onChange={(e) => {
                    setCalcForm({ ...calcForm, cropCategory: e.target.value });
                    calculatePrem();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VEGETABLES">Kharif Crops / Vegetables (2% Premium)</option>
                  <option value="GRAINS">Rabi Food Grains / Oilseeds (1.5% Premium)</option>
                  <option value="COMMERCIAL">Annual Commercial / Horticulture (5% Premium)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cultivated Land (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcForm.landAreaAcre}
                  onChange={(e) => {
                    setCalcForm({ ...calcForm, landAreaAcre: e.target.value });
                    calculatePrem();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scale of Finance (₹/Acre)</label>
                <input
                  type="number"
                  step="5000"
                  value={calcForm.scaleOfFinancePerAcre}
                  onChange={(e) => {
                    setCalcForm({ ...calcForm, scaleOfFinancePerAcre: e.target.value });
                    calculatePrem();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {calcResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50 p-6 rounded-3xl border border-blue-200 text-center">
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">Total Insured Sum</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    ₹{calcResult.sumInsured?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-blue-700 block font-bold">Farmer Share to Pay</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">
                    ₹{calcResult.farmerPremiumToPay?.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-blue-600 block">Only {calcResult.farmerSharePct}%</span>
                </div>
                <div>
                  <span className="text-xs text-emerald-700 block font-bold">Govt Subsidy Covered</span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">
                    ₹{calcResult.govtSubsidyAmount?.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Policies & Claim Filing */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Your Active Policies & Crop Loss Claims</h3>
            </div>

            {myPolicies.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No active insurance policies registered.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myPolicies.map((pol) => (
                  <div
                    key={pol.id}
                    className="p-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-blue-50/20 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-blue-800">Policy: {pol.policyNumber}</span>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">{pol.cropName}</h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {pol.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5">
                      <div>
                        <strong>Total Coverage:</strong> ₹{pol.sumInsured?.toLocaleString()} ({pol.landAreaAcre} Acres)
                      </div>
                      <div>
                        <strong>Premium Paid by You:</strong> ₹{pol.farmerPremiumPaid?.toLocaleString()} (Govt Subsidy:
                        ₹{pol.govtSubsidyAmount?.toLocaleString()})
                      </div>
                      <div>
                        <strong>Survey Number:</strong> {pol.surveyNumber}, {pol.village}
                      </div>
                    </div>

                    {/* Claims list inside policy */}
                    {(pol.claims || []).length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                        <div className="font-bold text-amber-900">Active Crop Loss Claim:</div>
                        {pol.claims.map((c: any) => (
                          <div key={c.id} className="text-slate-700">
                            Claim #{c.claimNumber} • Cause: {c.lossCause} • Claimed: ₹{c.claimedAmount?.toLocaleString()} (
                            <strong className="text-amber-800">{c.status}</strong>)
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedPolicy(pol);
                          setShowClaimModal(true);
                        }}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow"
                      >
                        File Crop Damage Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Claim Filing Modal */}
        {showClaimModal && selectedPolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-rose-700 uppercase">Policy: {selectedPolicy.policyNumber}</span>
                  <h3 className="text-lg font-bold text-slate-900">File Crop Loss Claim</h3>
                  <p className="text-xs text-slate-500">{selectedPolicy.cropName} ({selectedPolicy.landAreaAcre} Acres)</p>
                </div>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {claimSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Claim Registered!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Claim ID: {claimSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleFileClaim} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cause of Crop Loss</label>
                    <select
                      value={claimForm.lossCause}
                      onChange={(e) => setClaimForm({ ...claimForm, lossCause: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="UNSEASONAL_RAINFALL">Unseasonal Rainfall / Flooding</option>
                      <option value="HAILSTORM">Hailstorm / High Velocity Winds</option>
                      <option value="DROUGHT">Severe Drought / Water Shortage</option>
                      <option value="PEST_EPIDEMIC">Severe Pest / Fungal Epidemic</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Date of Calamity</label>
                      <input
                        type="date"
                        required
                        value={claimForm.lossDate}
                        onChange={(e) => setClaimForm({ ...claimForm, lossDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Estimated Loss (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={claimForm.estimatedLossPct}
                        onChange={(e) => setClaimForm({ ...claimForm, estimatedLossPct: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Claim Amount Requested (₹)</label>
                    <input
                      type="number"
                      required
                      value={claimForm.claimedAmount}
                      onChange={(e) => setClaimForm({ ...claimForm, claimedAmount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Damage Description</label>
                    <textarea
                      rows={3}
                      required
                      value={claimForm.lossDescription}
                      onChange={(e) => setClaimForm({ ...claimForm, lossDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submittingClaim ? 'Registering Claim...' : 'Confirm & Submit Claim for Assessment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CropInsurance;
