import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Upload,
  Layers,
  DollarSign,
  Activity,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=20'),
        api.get('/admin/audit-logs?limit=20'),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setAuditLogs(logsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`, { isVerified, kycStatus: 'VERIFIED' });
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleImportSampleMarketData = async () => {
    setImportStatus('Importing AGMARKNET verified price batch...');
    try {
      const sampleRecords = [
        {
          cropName: 'Tomato',
          marketName: 'Madurai Central APMC',
          district: 'Madurai',
          state: 'Tamil Nadu',
          modalPrice: 31,
          minPrice: 27,
          maxPrice: 35,
          recordDate: new Date(),
          source: 'AGMARKNET_PORTAL_SYNC',
          isDemoData: false,
        },
        {
          cropName: 'Green Chili',
          marketName: 'Salem Wholesale Mandi',
          district: 'Salem',
          state: 'Tamil Nadu',
          modalPrice: 59,
          minPrice: 53,
          maxPrice: 65,
          recordDate: new Date(),
          source: 'AGMARKNET_PORTAL_SYNC',
          isDemoData: false,
        },
      ];

      const res = await api.post('/market/import', { records: sampleRecords });
      setImportStatus(`Successfully imported ${res.data.data.length} AGMARKNET records!`);
      fetchAdminData();
    } catch (err: any) {
      setImportStatus('Import failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-400">
        Loading Admin Control Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-yellow-400 text-xs font-bold border border-slate-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              SYSTEM ADMIN CONTROL CENTER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Administration & Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify farmer identity/land titles, buyer GST credentials, and review platform audits
            </p>
          </div>

          <button
            onClick={handleImportSampleMarketData}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <Upload className="w-4 h-4" />
            Import AGMARKNET Dataset
          </button>
        </div>

        {importStatus && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold">
            {importStatus}
          </div>
        )}

        {/* System KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 block">Total Registered Users</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 block">Active Listings</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.totalListings}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 block">Orders Processed</span>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.totalOrders}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-semibold text-slate-400 block">Gross Merch Value (GMV)</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{stats.grossMerchandiseValue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* User Verification Queue */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User KYC & Verification Queue</h3>
              <p className="text-xs text-slate-500">
                Approve farmer land registry details and buyer corporate accounts
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Location / State</th>
                  <th className="p-3">Trust Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <span className="text-slate-400 text-[10px]">{u.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.farmerProfile?.district || u.buyerProfile?.district || 'Coimbatore'},{' '}
                      {u.farmerProfile?.state || u.buyerProfile?.state || 'Tamil Nadu'}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {u.trustScore?.score || 90}%
                      </span>
                    </td>
                    <td className="p-3">
                      {u.isVerified ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">Pending KYC</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!u.isVerified ? (
                        <button
                          onClick={() => handleVerifyUser(u.id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Verify Account
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyUser(u.id, false)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs Viewer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Platform Security & Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Immutable logs for logins, listings, orders, and payment transactions
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between gap-4 font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                    {log.action}
                  </span>
                  <span className="text-slate-700 font-sans">
                    {log.user ? `${log.user.name} (${log.user.email})` : 'System'}
                  </span>
                </div>
                <span className="text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
