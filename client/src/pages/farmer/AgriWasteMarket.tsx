import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Recycle,
  Search,
  Plus,
  MapPin,
  Phone,
  CheckCircle,
  Tag,
  DollarSign,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const AgriWasteMarket: React.FC = () => {
  const { language } = useLanguage();
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'mylistings'>('browse');

  // Create Listing Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWaste, setNewWaste] = useState({
    wasteType: 'PADDY_STRAW',
    title: '',
    description: '',
    quantityTons: '10.0',
    pricePerTon: '2200',
    suitableFor: 'MUSHROOM_CULTIVATION, BIO_FUEL, CATTLE_FEED',
    location: 'Kinathukadavu West',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=60',
  });
  const [submitting, setSubmitting] = useState(false);

  // Buyer Offer Modal
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [offerForm, setOfferForm] = useState({
    offeredPricePerTon: '',
    requestedTons: '5.0',
    message: 'Interested in buying for biofuel pellet plant. Can arrange farmgate truck pickup.',
  });
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
    fetchMyListings();
  }, [typeFilter, searchQuery]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'ALL') params.wasteType = typeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/waste/listings', { params });
      if (res.data?.data) {
        setListings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch waste listings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const res = await api.get('/waste/my-listings');
      if (res.data?.data) {
        setMyListings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch my waste listings', err);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/waste/listings', newWaste);
      if (res.data?.data) {
        setListings([res.data.data, ...listings]);
        setShowCreateModal(false);
        setNewWaste({
          wasteType: 'PADDY_STRAW',
          title: '',
          description: '',
          quantityTons: '10.0',
          pricePerTon: '2200',
          suitableFor: 'MUSHROOM_CULTIVATION, BIO_FUEL, CATTLE_FEED',
          location: 'Kinathukadavu West',
          district: 'Coimbatore',
          state: 'Tamil Nadu',
          imageUrl: '',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create waste listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    try {
      const res = await api.post('/waste/offers', {
        listingId: selectedListing.id,
        ...offerForm,
      });
      setOfferSuccess('Offer submitted successfully!');
      setTimeout(() => {
        setShowOfferModal(false);
        setOfferSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit offer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Recycle className="w-3.5 h-3.5" />
              {language === 'ta' ? 'வேளாண் கழிவு & உயிரி எரிபொருள் சந்தை' : 'Agricultural Waste & Biomass Exchange'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {language === 'ta' ? 'பயிர் கழிவு, வைக்கோல் & கொப்பரை சந்தை' : 'Crop Residue, Paddy Straw & Biomass Market'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
              {language === 'ta'
                ? 'வைக்கோல், கரும்பு சக்கை, தென்னை நார் கழிவு ஆகியவற்றை எரிப்பதற்கு பதிலாக விற்று கூடுதல் வருமானம் ஈட்டுங்கள்.'
                : 'Monetize agricultural crop residue, paddy straw bales, and bagasse for bio-pellet plants, mushroom cultivation, and composting.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition ${
                activeTab === 'browse' ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-900/60 text-white'
              }`}
            >
              Browse Waste
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> + Sell Waste
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by residue type or suitability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Residues' },
              { id: 'PADDY_STRAW', label: 'Paddy Straw Bales' },
              { id: 'COIR_PITH', label: 'Coconut Coir Pith' },
              { id: 'SUGARCANE_BAGASSE', label: 'Sugarcane Bagasse' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                  typeFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 col-span-3">Loading agri waste listings...</div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center text-slate-500 col-span-3 bg-white rounded-3xl border border-slate-200">
              No waste listings found. Be the first to list!
            </div>
          ) : (
            listings.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {l.imageUrl && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg uppercase">
                        {l.wasteType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {l.farmer?.name}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{l.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{l.description}</p>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {l.location}, {l.district}
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-700 font-semibold">
                        Suitable For: {l.suitableFor}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 mb-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Available Quantity</span>
                      <strong className="text-slate-900 text-sm font-bold">{l.availableTons} Tons</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Selling Price</span>
                      <strong className="text-emerald-800 text-base font-extrabold">
                        {l.pricePerTon === 0 ? 'FREE PICKUP' : `₹${l.pricePerTon} / Ton`}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedListing(l);
                      setOfferForm({ ...offerForm, offeredPricePerTon: String(l.pricePerTon) });
                      setShowOfferModal(true);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Send Purchase Offer / Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Waste Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">List Agricultural Residue</h3>
                  <p className="text-xs text-slate-500">Sell crop residue to biofuel and composting buyers</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Residue / Waste Type</label>
                  <select
                    value={newWaste.wasteType}
                    onChange={(e) => setNewWaste({ ...newWaste, wasteType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PADDY_STRAW">Paddy Straw Bales</option>
                    <option value="COIR_PITH">Coconut Coir Pith / Cocopeat</option>
                    <option value="SUGARCANE_BAGASSE">Sugarcane Bagasse Biomass</option>
                    <option value="COTTON_STALKS">Cotton Stalks</option>
                    <option value="CORN_COBS">Corn Cobs / Stubble</option>
                    <option value="POULTRY_MANURE">Poultry / Cattle Manure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dry Square Baled Paddy Straw"
                    value={newWaste.title}
                    onChange={(e) => setNewWaste({ ...newWaste, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quantity (Tons)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newWaste.quantityTons}
                      onChange={(e) => setNewWaste({ ...newWaste, quantityTons: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Price (₹ / Ton) - 0 for Free</label>
                    <input
                      type="number"
                      required
                      value={newWaste.pricePerTon}
                      onChange={(e) => setNewWaste({ ...newWaste, pricePerTon: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Suitable End Uses</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bio-fuel pellets, mushroom farming, composting"
                    value={newWaste.suitableFor}
                    onChange={(e) => setNewWaste({ ...newWaste, suitableFor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Farmgate Location</label>
                  <input
                    type="text"
                    required
                    value={newWaste.location}
                    onChange={(e) => setNewWaste({ ...newWaste, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={newWaste.imageUrl}
                    onChange={(e) => setNewWaste({ ...newWaste, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                >
                  {submitting ? 'Publishing...' : 'Publish Residue Listing'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Buyer Offer Modal */}
        {showOfferModal && selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Make Purchase Offer</h3>
                  <p className="text-xs text-slate-500">{selectedListing.title}</p>
                </div>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {offerSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Offer Sent to Farmer!</h4>
                  <p className="text-xs text-emerald-700 font-medium">{offerSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Offered Price (₹ / Ton)</label>
                      <input
                        type="number"
                        required
                        value={offerForm.offeredPricePerTon}
                        onChange={(e) => setOfferForm({ ...offerForm, offeredPricePerTon: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Quantity Needed (Tons)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={offerForm.requestedTons}
                        onChange={(e) => setOfferForm({ ...offerForm, requestedTons: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Message / Logistics Plan</label>
                    <textarea
                      rows={3}
                      value={offerForm.message}
                      onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold text-xs">
                    Total Estimated Offer: ₹
                    {(
                      parseFloat(offerForm.requestedTons || '0') *
                      parseFloat(offerForm.offeredPricePerTon || '0')
                    ).toLocaleString()}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-lg"
                  >
                    Send Offer to Farmer
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
export default AgriWasteMarket;
