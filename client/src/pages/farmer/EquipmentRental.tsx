import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Tractor,
  Search,
  Star,
  MapPin,
  Phone,
  CheckCircle,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const EquipmentRental: React.FC = () => {
  const { language } = useLanguage();
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'bookings'>('browse');

  // Booking modal
  const [showModal, setShowModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    rentalType: 'PER_ACRE',
    unitsBooked: '3.0',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    farmAddress: 'SF No. 142/2, Kinathukadavu West',
    notes: 'Need rotavator tilling for second season vegetable beds',
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
    fetchMyBookings();
  }, [categoryFilter, searchQuery]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/equipment', { params });
      if (res.data?.data) {
        setEquipmentList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch equipment', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/equipment/my-bookings');
      if (res.data?.data) {
        setMyBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch equipment bookings', err);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquip) return;
    try {
      setSubmitting(true);
      const res = await api.post('/equipment/book', {
        equipmentId: selectedEquip.id,
        ...bookForm,
      });
      setBookingSuccess(res.data?.data?.bookingNumber || 'Booked');
      fetchMyBookings();
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book equipment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-900 via-amber-900 to-yellow-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-orange-200 text-xs font-semibold uppercase tracking-wider">
              <Tractor className="w-3.5 h-3.5" />
              {language === 'ta' ? 'விவசாய இயந்திரங்கள் வாடகை மையம்' : 'Farm Equipment & Machinery Rental'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'டிராக்டர், அறுவடை & ட்ரோன் வாடகை' : 'Tractor, Harvester & Agri Drone Rental'}
            </h1>
            <p className="text-orange-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'அருகில் உள்ள வாடகை மையங்களிலிருந்து டிராக்டர்கள், ட்ரோன் தெளிப்பான்கள் மற்றும் அறுவடை இயந்திரங்களை மணிக்கு அல்லது ஏக்கர் வாரியாக முன்பதிவு செய்யுங்கள்.'
                : 'Rent verified tractors, drone sprayers, harvesters, and rotavators with certified operators at affordable hourly/acre rates.'}
            </p>
          </div>

          <div className="flex gap-2 bg-orange-950/40 p-1.5 rounded-2xl border border-orange-600/40">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === 'browse' ? 'bg-orange-500 text-slate-950 font-bold shadow' : 'text-orange-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'இயந்திரங்கள் உலாவு' : 'Browse Machinery'}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition relative ${
                activeTab === 'bookings'
                  ? 'bg-orange-500 text-slate-950 font-bold shadow'
                  : 'text-orange-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'என் வாடகை பதிவுகள்' : 'My Rentals'}
              {myBookings.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-400 text-slate-900 rounded-full font-bold">
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
                  placeholder="Search by equipment model or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                {[
                  { id: 'ALL', label: 'All Equipment' },
                  { id: 'TRACTOR', label: 'Tractors' },
                  { id: 'SPRAYER_DRONE', label: 'Drone Sprayers' },
                  { id: 'HARVESTER', label: 'Harvesters' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                      categoryFilter === tab.id
                        ? 'bg-orange-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="p-12 text-center text-slate-400 col-span-3">Loading machinery directory...</div>
              ) : equipmentList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 col-span-3 bg-white rounded-3xl border border-slate-200">
                  No equipment found matching criteria.
                </div>
              ) : (
                equipmentList.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="h-48 relative overflow-hidden bg-slate-100">
                        <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg uppercase">
                          {eq.category}
                        </span>
                        <span className="absolute top-3 right-3 px-2 py-1 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow">
                          <Star className="w-3.5 h-3.5 fill-slate-950" /> {eq.rating}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">{eq.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{eq.specifications}</p>

                        <div className="text-xs text-slate-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {eq.location}, {eq.district}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{eq.ownerPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rates & Action */}
                    <div className="p-5 pt-0">
                      <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 mb-4 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Rental Rate</span>
                          <strong className="text-orange-950 text-base font-extrabold">
                            ₹{eq.acreRate || eq.hourlyRate}
                          </strong>
                          <span className="text-[10px] text-slate-500"> {eq.acreRate ? '/ acre' : '/ hour'}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          Operator Included
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEquip(eq);
                          setShowModal(true);
                        }}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow"
                      >
                        Book Machinery
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Bookings Tab */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'உங்கள் இயந்திர முன்பதிவுகள்' : 'My Farm Equipment Bookings'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Scheduled tractor tillage, combine harvesting, and drone spray bookings.
              </p>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No machinery bookings recorded yet. Browse the catalog to book equipment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-orange-50/20 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-orange-800">Booking: {b.bookingNumber}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{b.equipment?.name}</h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>Rental Type:</strong> {b.unitsBooked} {b.rentalType === 'PER_ACRE' ? 'Acres' : 'Hours'}
                      </div>
                      <div>
                        <strong>Scheduled Date:</strong> {new Date(b.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Location:</strong> {b.farmAddress}
                      </div>
                      <div className="text-sm font-bold text-orange-950">Total Amount: ₹{b.totalAmount}</div>
                    </div>

                    {b.notes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200">
                        {b.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showModal && selectedEquip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-orange-700 uppercase">{selectedEquip.category}</span>
                  <h3 className="text-lg font-bold text-slate-900">Book Equipment</h3>
                  <p className="text-xs text-slate-500">{selectedEquip.name}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {bookingSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Equipment Booked!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Booking ID: {bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Rental Billing Basis</label>
                      <select
                        value={bookForm.rentalType}
                        onChange={(e) => setBookForm({ ...bookForm, rentalType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="PER_ACRE">Per Acre Rate (₹{selectedEquip.acreRate || 1100})</option>
                        <option value="HOURLY">Hourly Rate (₹{selectedEquip.hourlyRate || 850})</option>
                        <option value="DAILY">Daily Rate (₹{selectedEquip.dailyRate || 6000})</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Units (Acres or Hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={bookForm.unitsBooked}
                        onChange={(e) => setBookForm({ ...bookForm, unitsBooked: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date Needed</label>
                    <input
                      type="date"
                      required
                      value={bookForm.startDate}
                      onChange={(e) => setBookForm({ ...bookForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Farm Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={bookForm.farmAddress}
                      onChange={(e) => setBookForm({ ...bookForm, farmAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Special Notes for Operator</label>
                    <textarea
                      rows={2}
                      value={bookForm.notes}
                      onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-950 font-bold text-xs">
                    Estimated Total: ₹
                    {(
                      parseFloat(bookForm.unitsBooked || '1') *
                      (bookForm.rentalType === 'PER_ACRE'
                        ? selectedEquip.acreRate || 1100
                        : selectedEquip.hourlyRate || 850)
                    ).toLocaleString()}{' '}
                    (Payable on completion)
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submitting ? 'Confirming Booking...' : 'Confirm Equipment Rental'}
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
export default EquipmentRental;
