import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Scale,
  Building2,
  TrendingUp,
  Receipt,
  Calendar,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';

export const GovernmentMSP: React.FC = () => {
  const { language } = useLanguage();
  const [mspPrices, setMspPrices] = useState<any[]>([]);
  const [procCenters, setProcCenters] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'msp' | 'centers' | 'comparison' | 'bookings'>('msp');

  // Booking modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    cropName: 'Paddy (Common)',
    quantityQuintals: '30',
    slotDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pricesRes, centersRes, compRes, bookingsRes] = await Promise.all([
        api.get('/msp/prices'),
        api.get('/msp/centers'),
        api.get('/msp/comparison'),
        api.get('/msp/my-bookings').catch(() => ({ data: { data: [] } })),
      ]);

      if (pricesRes.data?.data) setMspPrices(pricesRes.data.data);
      if (centersRes.data?.data) setProcCenters(centersRes.data.data);
      if (compRes.data?.data) setComparison(compRes.data.data);
      if (bookingsRes.data?.data) setMyBookings(bookingsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch MSP data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;
    try {
      setBookingInProgress(true);
      const res = await api.post('/msp/book-slot', {
        centerId: selectedCenter.id,
        ...bookForm,
      });
      setBookingSuccess(res.data?.data?.receiptNumber || 'Slot Booked');
      fetchData();
      setTimeout(() => {
        setShowBookModal(false);
        setBookingSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book procurement slot');
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-200 text-xs font-semibold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              {language === 'ta' ? 'அரசு குறைந்தபட்ச ஆதரவு விலை (MSP)' : 'Government Assured Price (MSP)'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'அரசு MSP & நேரடி கொள்முதல் மையங்கள்' : 'MSP Rates & Direct Procurement Centers'}
            </h1>
            <p className="text-amber-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'அரசு அறிவித்த அதிகாரப்பூர்வ MSP விலைகள், அருகில் உள்ள FCI/TNCSC கொள்முதல் மையங்கள் மற்றும் டிஜிட்டல் ரசீதுகள்.'
                : 'Official crop-wise MSP benchmark rates, nearby FCI/TNCSC godowns, market price comparison, and digital receipts.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-amber-950/40 p-1.5 rounded-2xl border border-amber-600/40">
            <button
              onClick={() => setActiveTab('msp')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'msp' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-amber-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'MSP விலைப் பட்டியல்' : 'Crop MSP Rates'}
            </button>
            <button
              onClick={() => setActiveTab('centers')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'centers' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-amber-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'கொள்முதல் மையங்கள்' : 'Procurement Centers'}
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'comparison'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-amber-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'சந்தை vs MSP ஒப்பீடு' : 'Market vs MSP'}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition relative ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-amber-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'என் ரசீதுகள்' : 'Digital Receipts'}
              {myBookings.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-emerald-500 text-white rounded-full font-bold">
                  {myBookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: MSP Crop Rates Table */}
        {activeTab === 'msp' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {language === 'ta' ? 'அதிகாரப்பூர்வ பயிர் MSP விலைகள் (2025-26)' : 'Official Crop-wise MSP Benchmark Rates (2025-26)'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Fixed by Commission for Agricultural Costs and Prices (CACP) ensuring minimum 50% profit margin over A2+FL cost.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% Price Assurance Guarantee
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Crop Name</th>
                    <th className="py-3 px-4">Season / Variety</th>
                    <th className="py-3 px-4 text-right">MSP per Quintal (100 kg)</th>
                    <th className="py-3 px-4 text-right">MSP per Kg</th>
                    <th className="py-3 px-4 text-right">Prev Year MSP</th>
                    <th className="py-3 px-4 text-right">Increase</th>
                    <th className="py-3 px-4">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mspPrices.map((msp) => {
                    const inc = msp.prevYearMsp ? msp.mspPerQuintal - msp.prevYearMsp : 0;
                    return (
                      <tr key={msp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{msp.cropName}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium mr-2">
                            {msp.season}
                          </span>
                          {msp.variety || 'Standard'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-700 text-base">
                          ₹{msp.mspPerQuintal.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                          ₹{msp.mspPerKg}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          ₹{msp.prevYearMsp?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          +{inc > 0 ? `₹${inc}` : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">{msp.procurementAgency}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Procurement Centers */}
        {activeTab === 'centers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {procCenters.map((center) => (
                <div
                  key={center.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg uppercase">
                        {center.agency}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{center.centerName}</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Open for Procurement
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{center.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>
                        {center.contactPerson} ({center.contactPhone})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{center.operatingHours}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="text-slate-500 font-bold">Accepted Crops:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {JSON.parse(center.acceptedCrops || '[]').map((crop: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-500">
                      Daily Quota: <strong className="text-slate-800">{center.currentBookedMT} / {center.dailyQuotaMT} MT</strong>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCenter(center);
                        setShowBookModal(true);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow"
                    >
                      Book Delivery Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Market vs MSP Comparison */}
        {activeTab === 'comparison' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'நேரடி சந்தை விலை vs அரசு MSP ஒப்பீடு' : 'Live Mandi Price vs MSP Realization Comparison'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                AI decision engine comparing today's open market modal price against government assured minimum price to maximize your net profit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparison.map((item, idx) => {
                const isPremium = item.differencePerQuintal >= 0;
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition shadow-sm space-y-3 ${
                      isPremium ? 'bg-emerald-50/40 border-emerald-300' : 'bg-amber-50/40 border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-bold text-slate-900">{item.cropName}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-0.5 ${
                          isPremium ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isPremium ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {item.diffPercentage > 0 ? `+${item.diffPercentage}%` : `${item.diffPercentage}%`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Government MSP</span>
                        <strong className="text-slate-800 text-sm">₹{item.mspPerQuintal}/Qtl</strong>
                        <span className="text-slate-500 block text-[10px]">₹{item.mspPerKg}/kg</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Mandi Market Price</span>
                        <strong className={`text-sm ${isPremium ? 'text-emerald-700' : 'text-amber-700'}`}>
                          ₹{item.marketPricePerQuintal}/Qtl
                        </strong>
                        <span className="text-slate-500 block text-[10px]">₹{item.marketPricePerKg}/kg</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
                      {item.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Digital Receipts & Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'அரசு கொள்முதல் டிஜிட்டல் ரசீதுகள்' : 'Government Procurement Digital Receipts'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Official receipts issued by FCI/TNCSC for direct bank transfer settlement within 48 hours.
              </p>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No procurement bookings recorded yet. Select a procurement center to book a slot.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-amber-50/20 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-amber-800">Receipt: {b.receiptNumber}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{b.cropName}</h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5">
                      <div>
                        <strong>Center:</strong> {b.center?.centerName}
                      </div>
                      <div>
                        <strong>Quantity:</strong> {b.quantityQuintals} Quintals @ ₹{b.mspRatePerQuintal}/Qtl
                      </div>
                      <div className="text-sm font-bold text-emerald-700">
                        Total Payout: ₹{b.totalMspPayout.toLocaleString()}
                      </div>
                      <div>
                        <strong>Slot Date:</strong> {new Date(b.slotDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Quality Grade:</strong> {b.qualityGrade || 'FAQ Quality Checked'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Direct Benefit Transfer via PFMS</span>
                      <button className="text-amber-700 font-bold hover:underline">Download Receipt</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Procurement Slot Booking Modal */}
        {showBookModal && selectedCenter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase">{selectedCenter.agency}</span>
                  <h3 className="text-lg font-bold text-slate-900">Book Procurement Slot</h3>
                  <p className="text-xs text-slate-500">{selectedCenter.centerName}</p>
                </div>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {bookingSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Slot Booked Successfully!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Digital Receipt No: {bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBookSlot} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Crop</label>
                    <select
                      value={bookForm.cropName}
                      onChange={(e) => setBookForm({ ...bookForm, cropName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    >
                      {JSON.parse(selectedCenter.acceptedCrops || '[]').map((crop: string, idx: number) => (
                        <option key={idx} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quantity (Quintals / 100 kg bags)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={bookForm.quantityQuintals}
                      onChange={(e) => setBookForm({ ...bookForm, quantityQuintals: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Preferred Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={bookForm.slotDate}
                      onChange={(e) => setBookForm({ ...bookForm, slotDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                    Note: Bring Aadhaar Card, Bank Passbook, and Adangal copy on your scheduled slot. Payout will be credited within 48h.
                  </div>

                  <button
                    type="submit"
                    disabled={bookingInProgress}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {bookingInProgress ? 'Booking Slot...' : 'Confirm & Generate Digital Receipt'}
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
export default GovernmentMSP;
