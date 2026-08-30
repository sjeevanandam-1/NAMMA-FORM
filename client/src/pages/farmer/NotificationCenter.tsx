import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import api from '../../lib/api.js';
import {
  Bell,
  CheckCheck,
  TrendingUp,
  CloudRain,
  Landmark,
  Calendar,
  Truck,
  CheckCircle,
  Filter,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const filtered = filterType === 'ALL' ? notifications : notifications.filter((n) => n.type === filterType);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PRICE_ALERT':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'WEATHER_ALERT':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'SCHEME_ALERT':
        return <Landmark className="w-5 h-5 text-amber-600" />;
      case 'CALENDAR_TASK':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5" />
              {language === 'ta' ? 'அறிவிப்புகள் மையம்' : 'Central Notification Hub'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ta' ? 'ஸ்மார்ட் விவசாய அறிவிப்புகள்' : 'Smart Alerts & Farm Notifications'}
            </h1>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'ALL', label: 'All Notifications' },
            { id: 'PRICE_ALERT', label: '📈 Price Alerts' },
            { id: 'SCHEME_ALERT', label: '🏛️ Schemes & DBT' },
            { id: 'WEATHER_ALERT', label: '🌦️ Weather Warnings' },
            { id: 'CALENDAR_TASK', label: '📅 Crop Tasks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading alerts...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No notifications found in this category.</div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                className={`p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                  n.isRead ? 'bg-white border-slate-100 opacity-75' : 'bg-indigo-50/40 border-indigo-200 shadow-sm'
                }`}
              >
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationCenter;
