import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Truck,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  Star,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const SmartTransport: React.FC = () => {
  const { language } = useLanguage();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'bookings'>('vehicles');

  // Freight Estimator & Booking modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    pickupLocation: 'Ramesh Green Meadows Farm, Kinathukadavu',
    dropLocation: 'FreshMart Distribution Terminal, Ukkadam, Coimbatore',
    distanceKm: '28.5',
    cargoDescription: '1500 kg Fresh Harvest Tomatoes in 60 crates',
    weightTons: '1.5',
    pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchMyBookings();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transport/vehicles');
      if (res.data?.data) {
        setVehicles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transport vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/transport/my-bookings');
      if (res.data?.data) {
        setMyBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transport bookings', err);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      setSubmitting(true);
      const res = await api.post('/transport/book', {
        vehicleId: selectedVehicle.id,
        ...bookForm,
      });
      setBookingSuccess(res.data?.data?.bookingNumber || 'Booked');
      fetchMyBookings();
      setTimeout(() => {
        setShowBookModal(false);
        setBookingSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book transport');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" />
              {language === 'ta' ? 'ஸ்மார்ட் சரக்கு போக்குவரத்து' : 'Smart Farmgate Logistics'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'பண்ணை சரக்கு போக்குவரத்து & மினி லாரி முன்பதிவு' : 'Farmgate Transport & Mini Truck Booking'}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'அறுவடை செய்த பயிர்களை சந்தை அல்லது வாங்குபவருக்கு நேரடியாக கொண்டு சேர்க்க மினி லாரி மற்றும் டிராக்டர் முன்பதிவு.'
                : 'Direct farmgate pickup with transparent per-km rates, GPS location tracking, and zero hidden charges.'}
            </p>
          </div>

          <div className="flex gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-700/40">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === 'vehicles' ? 'bg-blue-600 text-white font-bold shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'வாகனங்கள் உலாவு' : 'Available Vehicles'}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition relative ${
                activeTab === 'bookings' ? 'bg-blue-600 text-white font-bold shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              {language === 'ta' ? 'என் முன்பதிவுகள்' : 'My Bookings'}
              {myBookings.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-400 text-slate-900 rounded-full font-bold">
                  {myBookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'vehicles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="p-12 text-center text-slate-400 col-span-3">Loading available vehicles...</div>
            ) : (
              vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg uppercase">
                          {v.vehicleType.replace(/_/g, ' ')}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{v.vehicleNumber}</h3>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {v.rating}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 mt-3">
                      <div>
                        <strong>Driver:</strong> {v.driverName} ({v.driverPhone})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {v.currentLocation}, {v.district}
                        </span>
                      </div>
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs mt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Payload Capacity</span>
                        <strong className="text-slate-900 text-sm">{v.capacityTons} Tons</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Freight Rate</span>
                        <strong className="text-blue-700 text-sm">₹{v.perKmRate} / km</strong>
                        <span className="text-[10px] text-slate-400 block">Base fare: ₹{v.basePrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVehicle(v);
                      setShowBookModal(true);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Book This Vehicle
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Bookings Tab */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {language === 'ta' ? 'உங்கள் சரக்கு முன்பதிவுகள்' : 'My Farmgate Transport Bookings'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time transit tracking, driver contact, and verified delivery receipts.
              </p>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                No transport bookings recorded yet. Select a vehicle to book farmgate pickup.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-blue-50/20 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-blue-800">Booking: {b.bookingNumber}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {b.vehicle?.driverName} ({b.vehicle?.vehicleNumber})
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>Pickup:</strong> {b.pickupLocation}
                      </div>
                      <div>
                        <strong>Drop:</strong> {b.dropLocation}
                      </div>
                      <div>
                        <strong>Cargo:</strong> {b.cargoDescription} ({b.weightTons} Tons, {b.distanceKm} km)
                      </div>
                      <div className="text-sm font-bold text-blue-950">
                        Estimated Freight: ₹{b.estimatedCost?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookModal && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase">
                    {selectedVehicle.vehicleType.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Book Farmgate Transport</h3>
                  <p className="text-xs text-slate-500">
                    Driver: {selectedVehicle.driverName} ({selectedVehicle.vehicleNumber})
                  </p>
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
                  <h4 className="text-base font-bold text-emerald-900">Vehicle Booked!</h4>
                  <p className="text-xs text-emerald-700 font-medium">Booking No: {bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pickup Farm Address</label>
                    <input
                      type="text"
                      required
                      value={bookForm.pickupLocation}
                      onChange={(e) => setBookForm({ ...bookForm, pickupLocation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Drop / Delivery Destination</label>
                    <input
                      type="text"
                      required
                      value={bookForm.dropLocation}
                      onChange={(e) => setBookForm({ ...bookForm, dropLocation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Distance (Km)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={bookForm.distanceKm}
                        onChange={(e) => setBookForm({ ...bookForm, distanceKm: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Cargo Weight (Tons)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={bookForm.weightTons}
                        onChange={(e) => setBookForm({ ...bookForm, weightTons: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cargo Description</label>
                    <input
                      type="text"
                      required
                      value={bookForm.cargoDescription}
                      onChange={(e) => setBookForm({ ...bookForm, cargoDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 font-bold text-xs">
                    Estimated Freight Fare: ₹
                    {(
                      selectedVehicle.basePrice +
                      parseFloat(bookForm.distanceKm || '0') * selectedVehicle.perKmRate
                    ).toLocaleString()}{' '}
                    (Payable to driver upon delivery)
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    {submitting ? 'Confirming Transport...' : 'Confirm Transport Booking'}
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
export default SmartTransport;
