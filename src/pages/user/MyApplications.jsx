import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClipboardList, HiArrowRight } from 'react-icons/hi';
import { applicationAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await applicationAPI.getAll({ page, limit: 10, ...(statusFilter && { status: statusFilter }) });
        setApplications(data.data || []);
        setPagination(data.pagination);
      } catch {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, statusFilter]);

  const statuses = ['', 'pending', 'under_review', 'approved', 'rejected', 'cancelled'];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <HiClipboardList className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="page-title">My Applications</h1>
            <p className="text-gray-500 dark:text-gray-400">{pagination?.total || 0} applications</p>
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {s ? getStatusLabel(s) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <div className="text-center py-20 card">
          <HiClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No applications yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Browse pets and apply to adopt!</p>
          <Link to="/browse" className="btn-primary">Browse Pets</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 flex items-center gap-4"
              >
                <img
                  src={getPetImageUrl(app.pet)}
                  alt={app.pet?.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://placehold.co/64/f97316/fff?text=🐾'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{app.pet?.name}</p>
                    <span className={`badge ${getStatusColor(app.status)}`}>{getStatusLabel(app.status)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{app.shelter?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted {formatDate(app.createdAt)}</p>
                </div>
                <Link
                  to={`/applications/${app._id}`}
                  className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all flex-shrink-0"
                >
                  View <HiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
