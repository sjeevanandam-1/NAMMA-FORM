import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Landmark,
  Calculator,
  Percent,
  CheckCircle,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const FinanceLoans: React.FC = () => {
  const { language } = useLanguage();
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'calculator' | 'applications'>('products');

  // EMI Calculator state
  const [emiPrincipal, setEmiPrincipal] = useState('200000');
  const [emiRate, setEmiRate] = useState('4.0');
  const [emiTenure, setEmiTenure] = useState('36');
  const [emiResult, setEmiResult] = useState<any | null>(null);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [applyForm, setApplyForm] = useState({
    requestedAmount: '200000',
    tenureMonths: '36',
    purpose: 'CROP_PRODUCTION',
    annualIncome: '350000',
    landAreaAcre: '3.0',
    pattaNumber: 'PATTA-142/2',
    aadhaarLast4: '3210',
    bankAccount: '123456789012',
    ifscCode: 'SBIN0001234',
  });
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLoanData();
    calculateEMI();
  }, []);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      const [prodRes, appRes] = await Promise.all([
        api.get('/finance/products'),
        api.get('/finance/my-applications').catch(() => ({ data: { data: [] } })),
      ]);

      if (prodRes.data?.data) setLoanProducts(prodRes.data.data);
      if (appRes.data?.data) setMyApplications(appRes.data.data);
    } catch (err) {
      console.error('Failed to fetch loan data', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = async () => {
    try {
      const res = await api.post('/finance/calculate-emi', {
        principal: parseFloat(emiPrincipal) || 100000,
        interestRatePct: parseFloat(emiRate) || 4.0,
        tenureMonths: parseInt(emiTenure) || 36,
      });
      if (res.data?.data) setEmiResult(res.data.data);
    } catch (err) {
      console.error('Failed to calculate EMI', err);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      const res = await api.post('/finance/apply', {
        loanProductId: selectedProduct.id,
        ...applyForm,
      });
      setApplySuccess(res.data?.data?.applicationNumber || 'Submitted');
      fetchLoanData();
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-green-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-200 text-xs font-semibold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" />
              {language === 'ta' ? 'விவசாய கடன் உதவி & KCC' : 'Agricultural Finance & Credit Support'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'கிசான் கிரெடிட் கார்டு & விவசாய கடன் உதவி' : 'Kisan Credit Card (KCC) & Agri Loans'}
            </h1>
            <p className="text-green-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'அரசு 3% வட்டி மானியத்துடன் 4% வட்டியில் கிசான் கடன் மற்றும் டிராக்டர் வாங்க எளிய கடன்கள்.'
                : 'Direct digital application for 4% subvented KCC loans, tractor credit, and NABARD agri-infrastructure funding.'}
            </p>
          </div>

          <div className="flex gap-2 bg-green-950/40 p-1.5 rounded-2xl border border-green-600/40">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'products' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Loan Schemes
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'calculator' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-emerald-200 hover:text-white'
              }`}
            >
              EMI Calculator
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition relative ${
                activeTab === 'applications' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-emerald-200 hover:text-white'
              }`}
            >
              My Loans
              {myApplications.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 rounded-full font-bold">
                  {myApplications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Loan Products */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loanProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg uppercase">
                        {p.bankName}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{p.loanName}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Effective Interest</span>
                      <span className="text-2xl font-extrabold text-emerald-700">{p.subventedRatePct || p.interestRatePct}% p.a.</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{p.eligibility}</p>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Max Sanction Limit</span>
                      <strong className="text-slate-900 text-sm">₹{p.maxAmount?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Processing Fees</span>
                      <strong className="text-slate-800 text-xs">{p.processingFee}</strong>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-bold block">Key Highlights:</span>
                    {JSON.parse(p.features || '[]').map((f: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowApplyModal(true);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Apply for this Loan
                  </button>
                  {p.officialApplyUrl && (
                    <a
                      href={p.officialApplyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
                    >
                      Bank Portal
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: EMI Calculator */}
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                Agricultural Loan EMI & Repayment Calculator
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Calculate monthly installment and prompt repayment subsidy savings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loan Principal (₹)</label>
                <input
                  type="number"
                  step="10000"
                  value={emiPrincipal}
                  onChange={(e) => {
                    setEmiPrincipal(e.target.value);
                    calculateEMI();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.5"
                  value={emiRate}
                  onChange={(e) => {
                    setEmiRate(e.target.value);
                    calculateEMI();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={emiTenure}
                  onChange={(e) => {
                    setEmiTenure(e.target.value);
                    calculateEMI();
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {emiResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50 p-6 rounded-3xl border border-emerald-200 text-center">
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">Monthly EMI</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1">
                    ₹{emiResult.monthlyEMI?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">Total Interest</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    ₹{emiResult.totalInterest?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">Total Repayable</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    ₹{emiResult.totalPayable?.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Applications */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Your Agricultural Loan Applications</h3>
            {myApplications.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No loan applications submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50/20 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-800">App No: {app.applicationNumber}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{app.loanProduct?.loanName}</h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>Requested:</strong> ₹{app.requestedAmount?.toLocaleString()} ({app.tenureMonths} Months)
                      </div>
                      {app.approvedAmount && (
                        <div className="text-emerald-700 font-bold">
                          <strong>Sanctioned:</strong> ₹{app.approvedAmount?.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <strong>Bank:</strong> {app.loanProduct?.bankName}
                      </div>
                      <div>
                        <strong>Patta No:</strong> {app.pattaNumber}
                      </div>
                    </div>

                    {app.bankOfficerRemarks && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 border border-emerald-200">
                        <strong>Bank Officer Remarks:</strong> {app.bankOfficerRemarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loan Apply Modal */}
        {showApplyModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase">{selectedProduct.bankName}</span>
                  <h3 className="text-lg font-bold text-slate-900">Apply for {selectedProduct.loanName}</h3>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {applySuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Application Submitted!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Application No: {applySuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Loan Amount (₹)</label>
                      <input
                        type="number"
                        step="10000"
                        required
                        value={applyForm.requestedAmount}
                        onChange={(e) => setApplyForm({ ...applyForm, requestedAmount: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Tenure (Months)</label>
                      <input
                        type="number"
                        required
                        value={applyForm.tenureMonths}
                        onChange={(e) => setApplyForm({ ...applyForm, tenureMonths: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Annual Farm Income (₹)</label>
                      <input
                        type="number"
                        step="10000"
                        required
                        value={applyForm.annualIncome}
                        onChange={(e) => setApplyForm({ ...applyForm, annualIncome: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Land Holding (Acres)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={applyForm.landAreaAcre}
                        onChange={(e) => setApplyForm({ ...applyForm, landAreaAcre: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Patta / Land Survey Number</label>
                    <input
                      type="text"
                      required
                      value={applyForm.pattaNumber}
                      onChange={(e) => setApplyForm({ ...applyForm, pattaNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Loan Application'}
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
export default FinanceLoans;
