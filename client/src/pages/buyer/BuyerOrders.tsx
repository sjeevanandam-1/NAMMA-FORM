import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import { Order } from '../../types/index.js';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  MessageSquare,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BuyerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Excellent quality produce, timely farmgate delivery!');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Error loading buyer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        orderId: reviewOrder.id,
        rating,
        comment,
      });
      alert('Thank you! Review and rating submitted.');
      setReviewOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStepProgress = (status: string) => {
    const steps = ['PENDING', 'ACCEPTED', 'PACKED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    const idx = steps.indexOf(status);
    return idx >= 0 ? idx + 1 : 1;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Purchase Orders & Logistics Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track live dispatch status, driver details, invoices, and leave farmer reviews
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No purchase orders found</h3>
            <p className="text-xs text-slate-400">
              Browse the marketplace to find verified agricultural listings.
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const step = getStepProgress(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft hover:shadow-hover transition-all space-y-6"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-extrabold text-base text-slate-900">
                          Order #{order.orderNumber}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Grand Total</span>
                      <strong className="text-lg font-extrabold text-emerald-600">
                        ₹{order.grandTotal.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Order Progress Tracker */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span className={step >= 1 ? 'text-emerald-700 font-bold' : ''}>
                        1. Placed
                      </span>
                      <span className={step >= 2 ? 'text-emerald-700 font-bold' : ''}>
                        2. Accepted
                      </span>
                      <span className={step >= 3 ? 'text-emerald-700 font-bold' : ''}>
                        3. Packed
                      </span>
                      <span className={step >= 4 ? 'text-emerald-700 font-bold' : ''}>
                        4. In Transit
                      </span>
                      <span className={step >= 5 ? 'text-emerald-700 font-bold' : ''}>
                        5. Delivered
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(step / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 flex items-center gap-3.5">
                      <img
                        src={
                          order.listing?.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=60'
                        }
                        alt="crop"
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {order.listing?.crop?.name} ({order.listing?.variety})
                        </h4>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {order.quantityKg.toLocaleString()} Kg @ ₹{order.pricePerKg}/kg
                        </p>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          Farmer: {order.farmer?.name} ({order.farmer?.phone})
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-4 text-xs space-y-1">
                      <span className="text-slate-400 font-medium">Delivery Destination:</span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {order.deliveryAddress}
                      </p>
                      {order.delivery?.trackingNumber && (
                        <p className="text-slate-500 font-mono text-[10px]">
                          Tracking: {order.delivery.trackingNumber}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-3 flex flex-col items-stretch sm:items-end gap-2">
                      {order.status === 'DELIVERED' && !order.reviews?.length && (
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" /> Leave Review
                        </button>
                      )}

                      <Link
                        to="/chat"
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat with Farmer
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Leave Review */}
        {reviewOrder && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Review Farmer & Produce</h3>
                <button
                  onClick={() => setReviewOrder(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          rating >= star
                            ? 'bg-amber-50 border-amber-400 text-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewOrder(null)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Rating'}
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
