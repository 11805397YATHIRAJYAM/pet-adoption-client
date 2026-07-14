import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiUsers, HiOfficeBuilding, HiHeart, HiClipboardList } from 'react-icons/hi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

function StatCard({ icon: Icon, label, value, color = 'text-primary-500', bg = 'bg-primary-50 dark:bg-primary-900/20' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${bg}`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(({ data }) => {
      setStats(data);
    }).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiUsers} label="Total Users" value={stats?.counts?.users}
          color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={HiOfficeBuilding} label="Shelters" value={stats?.counts?.shelters}
          color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard icon={HiHeart} label="Pets Listed" value={stats?.counts?.pets}
          color="text-primary-600" bg="bg-primary-50 dark:bg-primary-900/20" />
        <StatCard icon={HiClipboardList} label="Applications" value={stats?.counts?.applications}
          color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth chart */}
        {stats?.charts?.userTrend?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">User Growth (12 months)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.charts.userTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#uGrad)" strokeWidth={2} name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Adoption trend */}
        {stats?.charts?.adoptionTrend?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Adoptions (12 months)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.charts.adoptionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Adoptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species distribution */}
        {stats?.charts?.speciesDistribution?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Pets by Species</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.charts.speciesDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                  {stats.charts.speciesDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} formatter={(v) => <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent signups */}
        {stats?.recent?.users?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Recent Users</h2>
            <div className="space-y-3">
              {stats.recent.users.slice(0, 5).map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="badge badge-blue text-xs capitalize">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
