import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import { Farm } from '../../types/index.js';
import { Sprout, Plus, MapPin, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

export const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    landAreaAcre: 2.5,
    soilType: 'Red Loamy',
    irrigation: 'Drip Irrigation',
    crops: 'Tomato, Green Chili',
  });
  const [error, setError] = useState<string | null>(null);

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms/my-farms');
      setFarms(res.data.data || []);
    } catch (err) {
      console.error('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/farms', {
        ...formData,
        crops: formData.crops.split(',').map((s) => s.trim()),
      });
      setShowModal(false);
      setFormData({
        farmName: '',
        location: '',
        landAreaAcre: 2.5,
        soilType: 'Red Loamy',
        irrigation: 'Drip Irrigation',
        crops: 'Tomato, Green Chili',
      });
      fetchFarms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create farm');
    }
  };

  const handleDeleteFarm = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this farm?')) {
      try {
        await api.delete(`/farms/${id}`);
        fetchFarms();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete farm');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Registered Farms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your agricultural holdings, soil types, and irrigation sources
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Farm
          </button>
        </div>

        {farms.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No registered farms found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your farm plots to link listings, track crop health, and get localized weather
              alerts.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Add First Farm Plot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {farm.landAreaAcre} Acres
                    </span>
                    <button
                      onClick={() => handleDeleteFarm(farm.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Delete Farm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{farm.farmName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {farm.location}
                  </p>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Soil Type:</span>
                      <span className="font-semibold text-slate-700">{farm.soilType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Irrigation:</span>
                      <span className="font-semibold text-slate-700">{farm.irrigation}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-400 block mb-1">Crops Cultivated:</span>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          try {
                            const parsed = JSON.parse(farm.crops);
                            return Array.isArray(parsed) ? parsed : [farm.crops];
                          } catch {
                            return farm.crops.split(',');
                          }
                        })().map((c: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Farm */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Add New Farm Plot</h3>
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

              <form onSubmit={handleCreateFarm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Acre Orchard"
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location Reference / Village
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anaimalai Road, Pollachi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Land Area (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.landAreaAcre}
                      onChange={(e) =>
                        setFormData({ ...formData, landAreaAcre: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Soil Type</label>
                    <select
                      value={formData.soilType}
                      onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Red Loamy">Red Loamy</option>
                      <option value="Black Soil">Black Cotton Soil</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Clayey Soil">Clayey Soil</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Irrigation Method</label>
                  <select
                    value={formData.irrigation}
                    onChange={(e) => setFormData({ ...formData, irrigation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Borewell / Well">Borewell / Well</option>
                    <option value="Canal">Canal</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Crops (Comma Separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato, Chili, Banana"
                    value={formData.crops}
                    onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
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
                    Save Farm
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
