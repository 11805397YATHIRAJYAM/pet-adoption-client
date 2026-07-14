import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { applicationAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl, getAvatarUrl } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function ShelterApplications() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async (p = 1, status = '') => {
    try {
      setLoading(true);
      const params = { page: p, limit: 15 };
      if (status) params.status = status;
      const { data } = await applicationAPI.getAll(params);
      setApplications(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="page-title">Applications</h1>

      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'under_review', 'approved', 'rejected', 'cancelled'].map((s) => (
          <button key={s || 'all'}
            onClick={() => { setStatusFilter(s); fetch(1, s); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {s ? getStatusLabel(s) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : applications.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-gray-500 dark:text-gray-400">No applications found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {applications.map((app) => (
              <motion.div key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex items-center gap-4">
                <img src={getPetImageUrl(app.pet)} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://placehold.co/56/f97316/fff?text=🐾'; }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white">{app.pet?.name}</p>
                    <span className={`badge ${getStatusColor(app.status)} text-xs`}>{getStatusLabel(app.status)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <img src={getAvatarUrl(app.applicant)} alt="" className="w-5 h-5 rounded-full" />
                    {app.applicant?.name} • {formatDate(app.createdAt)}
                  </div>
                </div>
                <Link to={`/shelter/applications/${app._id}`} className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all flex-shrink-0">
                  Review <HiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); fetch(p, statusFilter); }} />
        </>
      )}
    </div>
  );
}
