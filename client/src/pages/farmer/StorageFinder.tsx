import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Warehouse,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const StorageFinder: React.FC = () => {
  const { language } = useLanguage();
  const [centers, setCenters] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'bookings'>('browse');

  // Booking Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    cropName: 'Red Onion',
    quantityBags: '50',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: 'Need temperature controlled storage for 30 days',
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStorageCenters();
    fetchMyBookings();
  }, [typeFilter, searchQuery]);

  const fetchStorageCenters = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/storage', { params });
      if (res.data?.data) {
        setCenters(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch storage centers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/storage/my-bookings');
      if (res.data?.data) {
        setMyBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch my storage bookings', err);
    }
  };

  const handleBookStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStorage) return;
    try {
      setSubmitting(true);
      const res = await api.post('/storage/book', {
        storageId: selectedStorage.id,
        ...bookForm,
      });
      setBookingSuccess(res.data?.data?.bookingRef || 'Booking Submitted');
      fetchMyBookings();
      setTimeout(() => {
        setShowBookModal(false);
        setBookingSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit storage booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-200 text-xs font-semibold uppercase tracking-wider">
              <Warehouse className="w-3.5 h-3.5" />
              {language === 'ta' ? 'அரசு கிடங்குகள் & குளிர்பதன கிடங்குகள்' : 'Government Storage & Cold Warehouses'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'அரசு தானிய கிடங்கு & குளிர்பதன தேடல்' : 'Government Storage & Warehouse Finder'}
            </h1>
            <p className="text-cyan-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'அருகில் உள்ள CWC / SWC தானிய கிடங்குகள், குளிர்பதன கிடங்குகள் மற்றும் WDRA அங்கீகரிக்கப்பட்ட ரசீதுகளை கண்டறிந்து முன்பதிவு செய்யுங்கள்.'
                : 'Locate nearby Central & State warehousing godowns, check live capacity in MT, view storage rates, and book space online.'}
            </p>
          </div>

          <div className="flex gap-2 bg-cyan-950/40 p-1.5 rounded-2xl border border-cyan-600/40">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === 'browse' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-cyan-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'கிடங்குகள் உலாவு' : 'Find Warehouses'}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition relative ${
                activeTab === 'bookings'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'என் முன்பதிவுகள்' : 'My Bookings'}
              {myBookings.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-400 text-slate-900 rounded-full font-bold">
                  {myBookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'browse' ? (
          <>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'கிடங்கின் பெயர் அல்லது இடத்தை தேடுக...' : 'Search by name, agency, or address...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                {[
                  { id: 'ALL', label: 'All Warehouses' },
                  { id: 'DRY_GRAIN_GODOWN', label: 'Dry Grain Godown (CWC)' },
                  { id: 'COLD_STORAGE', label: 'Cold Storage (SWC)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                      typeFilter === tab.id
                        ? 'bg-cyan-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="p-12 text-center text-slate-400 col-span-2">Loading warehousing centers...</div>
              ) : centers.length === 0 ? (
                <div className="p-12 text-center text-slate-500 col-span-2 bg-white rounded-3xl border border-slate-200">
                  No storage centers found matching your criteria.
                </div>
              ) : (
                centers.map((center) => (
                  <div
                    key={center.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 text-[11px] font-bold rounded-lg uppercase">
                          {center.agency}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{center.name}</h3>
                      </div>
                      {center.isWDRARegistered && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> WDRA Certified
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5">
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
                    </div>

                    {/* Capacity & Charges */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Available Capacity</span>
                        <strong className="text-slate-900 text-sm">{center.availableMT.toLocaleString()} MT</strong>
                        <span className="text-slate-500 block text-[10px]">
                          of {center.totalCapacityMT.toLocaleString()} MT Total
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Storage Charges</span>
                        <strong className="text-emerald-700 text-sm">₹{center.ratePerBagMonth} / bag / month</strong>
                        <span className="text-slate-500 block text-[10px]">₹{center.ratePerTonMonth} / Ton / month</span>
                      </div>
                    </div>

                    {/* Facilities Tags */}
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-1.5">Facilities:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {JSON.parse(center.facilities || '[]').map((fac: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-cyan-50 border border-cyan-100 text-cyan-900 text-[11px] rounded-md font-medium"
                          >
                            ✓ {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Booking Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Negotiable Warehouse Receipts (e-NWR) available</span>
                      <button
                        onClick={() => {
                          setSelectedStorage(center);
                          setShowBookModal(true);
                        }}
                        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl transition shadow"
                      >
                        Book Warehouse Space
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* My Bookings Tab */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'உங்கள் கிடங்கு முன்பதிவுகள்' : 'My Warehouse Storage Bookings'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Active storage receipts, chamber numbers, and e-NWR pledges for bank loans.
              </p>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No storage bookings found. Find a warehouse to reserve storage space.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-cyan-50/20 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-cyan-800">Booking Ref: {b.bookingRef}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{b.storage?.name}</h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>Stored Crop:</strong> {b.cropName} ({b.quantityBags} bags / {b.quantityMT} MT)
                      </div>
                      <div>
                        <strong>Duration:</strong> {new Date(b.startDate).toLocaleDateString()} to{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-bold text-cyan-900">
                        Estimated Charges: ₹{b.estimatedCharges?.toLocaleString()}
                      </div>
                      {b.receiptNumber && (
                        <div>
                          <strong>NWR Receipt No:</strong> {b.receiptNumber}
                        </div>
                      )}
                    </div>

                    {b.remarks && (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200">
                        {b.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Storage Space Booking Modal */}
        {showBookModal && selectedStorage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-cyan-700 uppercase">{selectedStorage.agency}</span>
                  <h3 className="text-lg font-bold text-slate-900">Book Warehouse Storage</h3>
                  <p className="text-xs text-slate-500">{selectedStorage.name}</p>
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
                  <h4 className="text-base font-bold text-emerald-900">Storage Space Booked!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Booking Ref: {bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBookStorage} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Crop to Store</label>
                    <input
                      type="text"
                      required
                      value={bookForm.cropName}
                      onChange={(e) => setBookForm({ ...bookForm, cropName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quantity (Number of 50kg Bags)</label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={bookForm.quantityBags}
                      onChange={(e) => setBookForm({ ...bookForm, quantityBags: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Storage Start Date</label>
                      <input
                        type="date"
                        required
                        value={bookForm.startDate}
                        onChange={(e) => setBookForm({ ...bookForm, startDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Expected Release Date</label>
                      <input
                        type="date"
                        required
                        value={bookForm.endDate}
                        onChange={(e) => setBookForm({ ...bookForm, endDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Special Handling Instructions / Notes</label>
                    <textarea
                      rows={2}
                      value={bookForm.remarks}
                      onChange={(e) => setBookForm({ ...bookForm, remarks: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-900 text-[11px]">
                    Estimated Charges: ₹
                    {(
                      parseInt(bookForm.quantityBags || '0') *
                      selectedStorage.ratePerBagMonth
                    ).toLocaleString()}{' '}
                    / month. Includes pest control and 24x7 security.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submitting ? 'Submitting Request...' : 'Confirm Warehouse Space Request'}
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
export default StorageFinder;
