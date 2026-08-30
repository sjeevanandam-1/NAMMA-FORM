import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api.js';
import { CropListing } from '../../types/index.js';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Layers,
} from 'lucide-react';

export const BuyerMarketplace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [searchCrop, setSearchCrop] = useState(searchParams.get('crop') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [quality, setQuality] = useState(searchParams.get('quality') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCrop) params.append('crop', searchCrop);
      if (category) params.append('category', category);
      if (quality) params.append('quality', quality);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', String(page));
      params.append('limit', '9');

      const res = await api.get(`/marketplace?${params.toString()}`);
      setListings(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error loading marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchCrop, category, quality, sortBy, page]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Search & Title Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-card border border-emerald-800/50">
          <div className="max-w-3xl space-y-3">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              COMMERCIAL AGRI-TRADE MARKETPLACE
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Source Directly from Verified Farms
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Farmgate prices, zero broker commissions, transparent quality grades, and guaranteed
              Escrow payments.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search by crop name (e.g. Tomato, Chili, Onion, Banana)..."
                value={searchCrop}
                onChange={(e) => {
                  setSearchCrop(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-slate-800 text-white rounded-2xl text-xs font-semibold border border-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="VEGETABLES">Vegetables</option>
              <option value="FRUITS">Fruits</option>
              <option value="GRAINS">Grains / Cereals</option>
              <option value="SPICES">Spices</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-slate-800 text-white rounded-2xl text-xs font-semibold border border-slate-700 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quantity_desc">Quantity: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quality Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <span className="text-slate-400">Quality Filter:</span>
          {['', 'GRADE_A', 'GRADE_B', 'GRADE_C'].map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuality(q);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                quality === q
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {q === '' ? 'All Grades' : q.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No crop listings match your filter</h3>
            <p className="text-xs text-slate-400">
              Try resetting your search query or choosing another crop category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft hover:shadow-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        item.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={item.crop?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                        {item.qualityGrade.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                      ₹{item.expectedPricePerKg} / {item.unit}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          {item.crop?.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{item.variety}</p>
                      </div>

                      {/* Farmer Trust Score Badge */}
                      <div className="text-right">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Trust {item.farmer?.trustScore?.score || 94}%
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.farmer?.name}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Available Quantity:</span>
                        <strong className="text-slate-900 font-bold">
                          {item.availableQuantityKg.toLocaleString()} {item.unit}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.district}, {item.state}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Harvest Date:</span>
                        <span className="text-slate-700">
                          {new Date(item.harvestDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <Link
                    to={`/marketplace/${item.id}`}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    View Details & Buy Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {totalPages} ({total} Total Listings)
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
