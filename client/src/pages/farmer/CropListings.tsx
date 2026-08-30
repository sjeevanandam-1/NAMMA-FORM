import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import { CropListing, Crop, Farm } from '../../types/index.js';
import {
  Sprout,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const CropListings: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cropId: '',
    farmId: '',
    variety: 'Hybrid Grade A',
    quantityKg: 3000,
    unit: 'KG',
    expectedPricePerKg: 32,
    minAcceptablePrice: 28,
    harvestDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    qualityGrade: 'GRADE_A' as const,
    description: 'Freshly harvested, uniformly graded, sorted produce ready for direct transport.',
    location: 'Pollachi North, Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
  });

  const fetchData = async () => {
    try {
      const [listingsRes, cropsRes, farmsRes] = await Promise.all([
        api.get('/listings/my-listings'),
        api.get('/crops'),
        api.get('/farms/my-farms'),
      ]);
      setListings(listingsRes.data.data || []);
      setCrops(cropsRes.data.data || []);
      setFarms(farmsRes.data.data || []);

      if (cropsRes.data.data?.length > 0 && !formData.cropId) {
        setFormData((prev) => ({ ...prev, cropId: cropsRes.data.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const data = new FormData();
        data.append('image', file);
        const res = await api.post('/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFormData((prev) => ({ ...prev, imageUrl: res.data.data.url }));
      } catch (err: any) {
        alert('File upload failed: ' + (err.response?.data?.message || err.message));
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post('/listings', {
        cropId: formData.cropId,
        farmId: formData.farmId || undefined,
        variety: formData.variety,
        quantityKg: Number(formData.quantityKg),
        unit: formData.unit,
        expectedPricePerKg: Number(formData.expectedPricePerKg),
        minAcceptablePrice: Number(formData.minAcceptablePrice),
        harvestDate: formData.harvestDate,
        qualityGrade: formData.qualityGrade,
        description: formData.description,
        location: formData.location,
        district: formData.district,
        state: formData.state,
        images: formData.imageUrl ? [formData.imageUrl] : [],
      });

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this marketplace listing?')) {
      try {
        await api.delete(`/listings/${id}`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete listing');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Marketplace Crop Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              List your harvest directly to verified wholesalers, supermarkets, and food processors
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Marketplace Listing
          </button>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No active marketplace listings</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first listing to receive offers directly from verified commercial buyers.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              List Produce Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft hover:shadow-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        item.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={item.crop?.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                      {item.qualityGrade.replace('_', ' ')}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      ₹{item.expectedPricePerKg} / {item.unit}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{item.crop?.name}</h3>
                        <p className="text-xs text-slate-500">{item.variety}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Available Stock:</span>
                        <strong className="text-slate-900">
                          {item.availableQuantityKg.toLocaleString()} {item.unit}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Floor Price:</span>
                        <strong className="text-slate-700">₹{item.minAcceptablePrice}/kg</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Harvest Date:</span>
                        <span className="text-slate-700">
                          {new Date(item.harvestDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{item.district}, {item.state}</span>
                  <button
                    onClick={() => handleDeleteListing(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Listing */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Create New Crop Listing</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Crop Type</label>
                    <select
                      value={formData.cropId}
                      onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Farm Plot (Optional)</label>
                    <select
                      value={formData.farmId}
                      onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Select Farm Plot --</option>
                      {farms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.farmName} ({f.landAreaAcre} Acres)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Variety / Subtype</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hybrid Shivam"
                      value={formData.variety}
                      onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quality Grade</label>
                    <select
                      value={formData.qualityGrade}
                      onChange={(e) =>
                        setFormData({ ...formData, qualityGrade: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="GRADE_A">Grade A (Supermarket Premium)</option>
                      <option value="GRADE_B">Grade B (Standard Commercial)</option>
                      <option value="GRADE_C">Grade C (Processing / Juice)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity (Kg)</label>
                    <input
                      type="number"
                      required
                      value={formData.quantityKg}
                      onChange={(e) =>
                        setFormData({ ...formData, quantityKg: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expected Price (₹/Kg)</label>
                    <input
                      type="number"
                      required
                      value={formData.expectedPricePerKg}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedPricePerKg: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min Price (₹/Kg)</label>
                    <input
                      type="number"
                      required
                      value={formData.minAcceptablePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, minAcceptablePrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      required
                      value={formData.harvestDate}
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Produce Image (Upload File or URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://... or upload"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer flex items-center shrink-0">
                        {uploadingImage ? 'Uploading...' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Produce Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    Publish to Marketplace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
