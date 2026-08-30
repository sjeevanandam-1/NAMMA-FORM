import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api.js';
import { CropListing } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import confetti from 'canvas-confetti';
import {
  Sprout,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  Package,
  Calendar,
  Layers,
  MessageSquare,
  Truck,
  DollarSign,
  AlertCircle,
  CreditCard,
  Building,
} from 'lucide-react';

export const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<CropListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Order form state
  const [orderQty, setOrderQty] = useState(1000);
  const [deliveryAddress, setDeliveryAddress] = useState(
    'FreshFarm Retail Central Hub, Koyambedu Wholesale Market, Chennai, Tamil Nadu'
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/marketplace/${id}`);
        setListing(res.data.data);
        if (res.data.data?.availableQuantityKg) {
          setOrderQty(Math.min(1000, res.data.data.availableQuantityKg));
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setError(null);
    setIsSubmittingOrder(true);

    try {
      const res = await api.post('/orders', {
        listingId: listing!.id,
        quantityKg: Number(orderQty),
        deliveryAddress,
        paymentMethod,
      });

      setOrderSuccess(res.data.data);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loading || !listing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-400">
        Loading crop listing details...
      </div>
    );
  }

  const subtotal = orderQty * listing.expectedPricePerKg;
  const transportCost = 1200;
  const taxAmount = Math.round(subtotal * 0.025);
  const grandTotal = subtotal + transportCost + taxAmount;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Link to="/marketplace" className="hover:text-emerald-600">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{listing.crop?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Photos & Farmer Info Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main High-Res Photo */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-3">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={
                    listing.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&auto=format&fit=crop&q=80'
                  }
                  alt={listing.crop?.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                  {listing.qualityGrade.replace('_', ' ')}
                </span>
                <span className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-xs text-white text-sm font-extrabold px-4 py-2 rounded-xl">
                  ₹{listing.expectedPricePerKg} / {listing.unit}
                </span>
              </div>
            </div>

            {/* Farmer Profile & AgriTrust Score Breakdown Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      listing.farmer?.avatarUrl ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60'
                    }
                    alt={listing.farmer?.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900">
                        {listing.farmer?.name}
                      </h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        KYC Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {listing.farmer?.farmerProfile?.village || 'Pollachi'}, {listing.district},{' '}
                      {listing.state}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                    AgriTrust {listing.farmer?.trustScore?.score || 94}%
                  </span>
                </div>
              </div>

              {/* Trust Score Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <p className="font-bold text-slate-800 text-xs">AgriTrust Score Breakdown:</p>
                <div className="grid grid-cols-3 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Identity & Land KYC:</span>
                    <strong className="text-emerald-700">25 / 25 Pts</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Order Fulfillment:</span>
                    <strong className="text-emerald-700">35 / 35 Pts</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Buyer Reviews:</span>
                    <strong className="text-emerald-700">34 / 40 Pts</strong>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              {listing.farmer?.reviewsReceived && listing.farmer.reviewsReceived.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-slate-900">Verified Buyer Reviews:</h5>
                  {listing.farmer.reviewsReceived.map((r, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{r.reviewer?.name}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Order Action Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {listing.crop?.category} • DIRECT FARMGATE OFFER
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {listing.crop?.name}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">{listing.variety}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Available Batch:</span>
                  <strong className="text-slate-900 font-extrabold text-sm">
                    {listing.availableQuantityKg.toLocaleString()} {listing.unit}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Unit Price:</span>
                  <strong className="text-emerald-600 font-extrabold text-base">
                    ₹{listing.expectedPricePerKg} / {listing.unit}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Harvest Date:</span>
                  <span className="text-slate-700 font-semibold">
                    {new Date(listing.harvestDate).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-700 font-semibold">
                    {listing.district}, {listing.state}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">Produce Description:</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{listing.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-5 h-5" />
                  Buy Now / Place Purchase Order
                </button>

                <Link
                  to="/chat"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Farmer Directly
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* CHECKOUT & ORDER MODAL */}
        {/* -------------------------------------------------- */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              {!orderSuccess ? (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Confirm Purchase Order
                      </h3>
                      <p className="text-xs text-slate-500">
                        {listing.crop?.name} ({listing.variety})
                      </p>
                    </div>
                    <button
                      onClick={() => setShowOrderModal(false)}
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

                  <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Order Quantity (Kg):</span>
                        <strong className="text-emerald-700">{orderQty.toLocaleString()} Kg</strong>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max={listing.availableQuantityKg}
                        step="100"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Delivery Destination Address
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Payment & Escrow Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['UPI', 'CARD', 'NET_BANKING', 'ESCROW', 'CASH_ON_DELIVERY'].map((pm) => (
                          <button
                            key={pm}
                            type="button"
                            onClick={() => setPaymentMethod(pm)}
                            className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                              paymentMethod === pm
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pm.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Subtotal ({orderQty} Kg × ₹{listing.expectedPricePerKg}):
                        </span>
                        <strong className="text-slate-900">₹{subtotal.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Freight Transport (Est):</span>
                        <strong className="text-slate-900">₹{transportCost.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">APMC Trade Tax (2.5%):</span>
                        <strong className="text-slate-900">₹{taxAmount.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-emerald-600">
                        <span>Grand Total:</span>
                        <span>₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingOrder
                        ? 'Authorizing Payment...'
                        : `Authorize ₹${grandTotal.toLocaleString()} & Confirm Order`}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Order Placed Successfully! 🎉
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Order <strong className="text-slate-800">#{orderSuccess.newOrder?.orderNumber}</strong> has
                    been authorized and sent to the farmer for harvest dispatch.
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Link
                      to="/buyer/orders"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      View in My Orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
