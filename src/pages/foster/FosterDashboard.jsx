import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClipboardList, HiPlus } from 'react-icons/hi';
import { fosterAPI } from '../../services/api';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FosterDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fosterAPI.getApplications({ limit: 10 }).then(({ data }) => {
      setApplications(data.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Foster Dashboard</h1>
        <Link to="/browse" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-4 h-4" /> Browse Pets to Foster
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Applications</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'active').length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Currently Fostering</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{applications.filter(a => a.status === 'completed').length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Completed</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link to="/foster/applications" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>
        {applications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">No foster applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {app.pet && <img src={getPetImageUrl(app.pet)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://placehold.co/40/f97316/fff?text=🐾'; }} />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{app.pet?.name || 'General Foster'}</p>
                  <p className="text-xs text-gray-400">{app.shelter?.name} • {formatDate(app.createdAt)}</p>
                </div>
                <span className={`badge ${getStatusColor(app.status)} text-xs`}>{getStatusLabel(app.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
