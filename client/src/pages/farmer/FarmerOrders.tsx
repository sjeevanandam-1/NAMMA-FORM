import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import { Order } from '../../types/index.js';
import {
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  Clock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Error fetching farmer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders =
    filterStatus === 'ALL' ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Farmer Incoming Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage incoming buyer purchase orders, farmgate pickups, and escrow disbursements
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {['ALL', 'PENDING', 'ACCEPTED', 'PACKED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    filterStatus === st
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No orders found</h3>
            <p className="text-xs text-slate-400">
              When buyers purchase your crop listings, they will appear here for your confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-hover transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-slate-900">
                      Order #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : order.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Crop & Quantity */}
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
                        Quantity: {order.quantityKg.toLocaleString()} Kg @ ₹{order.pricePerKg}/kg
                      </p>
                      <span className="text-xs font-extrabold text-emerald-600 mt-1 block">
                        Total Payout: ₹{order.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Buyer Details */}
                  <div className="md:col-span-4 text-xs space-y-1">
                    <span className="text-slate-400 font-medium">Buyer:</span>
                    <p className="font-bold text-slate-900">{order.buyer?.name}</p>
                    <p className="text-slate-500">{order.buyer?.buyerProfile?.companyName}</p>
                    <p className="text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {order.deliveryAddress}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="md:col-span-3 flex flex-col items-stretch sm:items-end gap-2">
                    {order.status === 'PENDING' && (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                          className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Mark as Packed 📦
                      </button>
                    )}

                    {order.status === 'PACKED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch / In Transit
                      </button>
                    )}

                    {order.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Delivery
                      </button>
                    )}

                    <Link
                      to="/chat"
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat with Buyer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
