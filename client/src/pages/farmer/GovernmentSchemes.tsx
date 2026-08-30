import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Landmark,
  Search,
  Filter,
  CheckCircle,
  FileText,
  AlertCircle,
  Bookmark,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const GovernmentSchemes: React.FC = () => {
  const { language } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');

  // Eligibility modal & application form states
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [landArea, setLandArea] = useState('3.0');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    applicantName: 'Ramesh Kumar',
    applicantPhone: '9876543210',
    landAreaAcre: '3.0',
    aadhaarLast4: '3210',
    bankAccountNumber: '123456789012',
    ifscCode: 'SBIN0001234',
    village: 'Kinathukadavu',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
  });
  const [submittingApp, setSubmittingApp] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes();
    fetchMyApplications();
  }, [categoryFilter, searchQuery]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/schemes', { params });
      if (res.data?.data) {
        setSchemes(res.data.data);
        if (!selectedScheme && res.data.data.length > 0) {
          setSelectedScheme(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch schemes', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await api.get('/schemes/my-applications');
      if (res.data?.data) {
        setMyApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch my applications', err);
    }
  };

  const handleCheckEligibility = async (schemeId: string) => {
    try {
      setCheckingEligibility(true);
      const res = await api.post('/schemes/check-eligibility', {
        schemeId,
        landAreaAcre: parseFloat(landArea) || 1.0,
      });
      setEligibilityResult(res.data.data);
    } catch (err) {
      console.error('Eligibility check failed', err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;
    try {
      setSubmittingApp(true);
      const res = await api.post('/schemes/apply', {
        schemeId: selectedScheme.id,
        ...applyForm,
      });
      setApplySuccess(res.data?.data?.applicationNumber || 'Application Submitted!');
      fetchMyApplications();
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" />
              {language === 'ta' ? 'அரசு திட்டங்கள் தளம்' : 'Central & State Government Schemes'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'அரசு மானியங்கள் & உதவி திட்டங்கள்' : 'Government Schemes & Subsidies Hub'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'PM-KISAN, PMFBY, சொட்டு நீர் பாசனம், டிராக்டர் மானியம் போன்ற அனைத்து அரசு சலுகைகளையும் ஒரே இடத்தில் சரிபார்த்து விண்ணப்பியுங்கள்.'
                : 'Directly check eligibility, calculate subsidies, view required documents, and submit DBT applications.'}
            </p>
          </div>

          <div className="flex gap-2 bg-emerald-950/40 p-1.5 rounded-2xl border border-emerald-600/40">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === 'browse' ? 'bg-emerald-500 text-white shadow' : 'text-emerald-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'திட்டங்கள் உலாவு' : 'Browse Schemes'}
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition relative ${
                activeTab === 'applications' ? 'bg-emerald-500 text-white shadow' : 'text-emerald-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'என் விண்ணப்பங்கள்' : 'My Applications'}
              {myApplications.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-400 text-slate-900 rounded-full font-bold">
                  {myApplications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'browse' ? (
          <>
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'திட்டத்தின் பெயரை தேடுக...' : 'Search by scheme name or keywords...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
                {[
                  { id: 'ALL', label: language === 'ta' ? 'அனைத்தும்' : 'All Categories' },
                  { id: 'FINANCIAL_SUPPORT', label: language === 'ta' ? 'நேரடி நிதி' : 'Direct Income (PM-KISAN)' },
                  { id: 'CROP_INSURANCE', label: language === 'ta' ? 'பயிர் காப்பீடு' : 'Insurance (PMFBY)' },
                  { id: 'IRRIGATION', label: language === 'ta' ? 'சொட்டு நீர் பாசனம்' : 'Micro-Irrigation' },
                  { id: 'FARM_MACHINERY', label: language === 'ta' ? 'இயந்திர மானியம்' : 'Farm Machinery' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                      categoryFilter === tab.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme List & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Scheme Cards (Left Column) */}
              <div className="lg:col-span-5 space-y-4">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Loading government schemes...</div>
                ) : schemes.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                    No schemes found matching your criteria.
                  </div>
                ) : (
                  schemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      onClick={() => {
                        setSelectedScheme(scheme);
                        setEligibilityResult(null);
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition text-left ${
                        selectedScheme?.id === scheme.id
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase">
                            {scheme.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {scheme.level === 'CENTRAL' ? 'Central Govt' : `${scheme.state} State`}
                          </span>
                        </div>
                        {scheme.subsidyPct && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            {scheme.subsidyPct}% Subsidy
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                        {language === 'ta' && scheme.titleTamil ? scheme.titleTamil : scheme.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {language === 'ta' && scheme.descriptionTamil ? scheme.descriptionTamil : scheme.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          Max Benefit: ₹{scheme.maxAmount ? scheme.maxAmount.toLocaleString() : 'N/A'}
                        </span>
                        <span className="flex items-center text-slate-400 font-medium">
                          View details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Scheme Detail View (Right Column) */}
              <div className="lg:col-span-7">
                {selectedScheme ? (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase">
                          {selectedScheme.code}
                        </span>
                        <div className="flex items-center gap-3">
                          {selectedScheme.deadline && (
                            <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Deadline: {new Date(selectedScheme.deadline).toLocaleDateString()}
                            </span>
                          )}
                          <button className="text-slate-400 hover:text-emerald-600 p-1">
                            <Bookmark className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3">
                        {language === 'ta' && selectedScheme.titleTamil
                          ? selectedScheme.titleTamil
                          : selectedScheme.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-2">
                        {language === 'ta' && selectedScheme.descriptionTamil
                          ? selectedScheme.descriptionTamil
                          : selectedScheme.description}
                      </p>
                    </div>

                    {/* Key Benefits */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        {language === 'ta' ? 'முக்கிய பலன்கள்' : 'Key Scheme Benefits'}
                      </h4>
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                        {selectedScheme.benefits}
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        {language === 'ta' ? 'தேவையான ஆவணங்கள்' : 'Required Documents Checklist'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {JSON.parse(selectedScheme.requiredDocuments || '[]').map((doc: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eligibility Checker Widget */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          {language === 'ta' ? 'உடனடி தகுதி சரிபார்ப்பு' : 'Instant Eligibility & Subsidy Estimator'}
                        </h4>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                          <label className="text-xs text-slate-300 block mb-1">
                            {language === 'ta' ? 'நிலப்பரப்பு (ஏக்கர்)' : 'Your Land Area (in Acres)'}
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={landArea}
                            onChange={(e) => setLandArea(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                        </div>

                        <button
                          onClick={() => handleCheckEligibility(selectedScheme.id)}
                          disabled={checkingEligibility}
                          className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow"
                        >
                          {checkingEligibility ? 'Checking...' : language === 'ta' ? 'தகுதியை பார்' : 'Check Eligibility'}
                        </button>
                      </div>

                      {eligibilityResult && (
                        <div className="mt-3 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            {eligibilityResult.isEligible ? 'You are Eligible!' : 'Ineligible based on input'}
                          </div>
                          {eligibilityResult.reasons.map((r: string, idx: number) => (
                            <p key={idx} className="text-slate-300">
                              • {r}
                            </p>
                          ))}
                          <div className="pt-2 text-amber-300 font-semibold">
                            Estimated Subsidy Value: ₹{eligibilityResult.estimatedSubsidy.toLocaleString()} (
                            {eligibilityResult.subsidyPct}% coverage)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                      >
                        {language === 'ta' ? 'இப்போதே விண்ணப்பிக்கவும்' : 'Apply for this Scheme'}
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {selectedScheme.officialPortalUrl && (
                        <a
                          href={selectedScheme.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
                        >
                          {language === 'ta' ? 'அரசு தளம்' : 'Official Portal'}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
                    Select a scheme from the left to view complete details.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* My Applications Tab */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'உங்கள் சமர்ப்பிக்கப்பட்ட விண்ணப்பங்கள்' : 'My Government Scheme Applications'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Track real-time DBT approval status, VAO verification, and disbursement dates.
              </p>
            </div>

            {myApplications.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                You have not submitted any scheme applications yet. Browse the schemes catalog to apply!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-500">App No: {app.applicationNumber}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{app.scheme.title}</h4>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'UNDER_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>Applicant:</strong> {app.applicantName} ({app.applicantPhone})
                      </div>
                      <div>
                        <strong>Land Holding:</strong> {app.landAreaAcre} Acres ({app.village}, {app.district})
                      </div>
                      <div>
                        <strong>Bank Details:</strong> {app.bankAccountNumber} (IFSC: {app.ifscCode})
                      </div>
                      {app.disbursedAmount && (
                        <div className="text-emerald-700 font-bold">
                          <strong>DBT Credited:</strong> ₹{app.disbursedAmount.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {app.officialRemarks && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                        <strong>Official Remarks:</strong> {app.officialRemarks}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      Submitted on: {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Application Modal */}
        {showApplyModal && selectedScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase">{selectedScheme.code}</span>
                  <h3 className="text-lg font-bold text-slate-900">Direct Scheme Application</h3>
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
                  <p className="text-xs text-emerald-700 font-medium">Application ID: {applySuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Applicant Name</label>
                    <input
                      type="text"
                      required
                      value={applyForm.applicantName}
                      onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={applyForm.applicantPhone}
                        onChange={(e) => setApplyForm({ ...applyForm, applicantPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Land Area (Acres)</label>
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Aadhaar Last 4 Digits</label>
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={applyForm.aadhaarLast4}
                        onChange={(e) => setApplyForm({ ...applyForm, aadhaarLast4: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Bank IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={applyForm.ifscCode}
                        onChange={(e) => setApplyForm({ ...applyForm, ifscCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      required
                      value={applyForm.bankAccountNumber}
                      onChange={(e) => setApplyForm({ ...applyForm, bankAccountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    By submitting, your Patta/Chitta and KYC records will be digitally verified by the Village Officer.
                  </div>

                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submittingApp ? 'Submitting Application...' : 'Confirm & Submit Application'}
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
export default GovernmentSchemes;
