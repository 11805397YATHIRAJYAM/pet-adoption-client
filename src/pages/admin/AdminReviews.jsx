import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiCheck, HiTrash } from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <HiStar key={s} className={`w-4 h-4 ${s <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const load = async (p = 1, f = '') => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (f === 'flagged') params.isModerated = false;
      const { data } = await adminAPI.getReviews(params);
      setReviews(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const moderate = async (id, approved) => {
    try {
      await adminAPI.moderateReview(id, { approved });
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isModerated: true } : r));
      toast.success(approved ? 'Review approved' : 'Review removed');
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Manage Reviews</h1>

      <div className="flex gap-2">
        {['', 'flagged'].map((f) => (
          <button key={f || 'all'}
            onClick={() => { setFilter(f); load(1, f); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {f === '' ? 'All Reviews' : 'Needs Moderation'}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : reviews.length === 0 ? (
        <div className="text-center py-20 card">
          <HiStar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No reviews found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((r) => (
              <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`card p-5 ${!r.isModerated ? 'border-l-4 border-l-orange-400' : ''}`}>
                <div className="flex items-start gap-3">
                  <img src={getAvatarUrl(r.reviewer)} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.reviewer?.name}</p>
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                      {!r.isModerated && <span className="badge badge-orange text-xs">Needs Review</span>}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{r.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {r.targetType}: {r.targetType === 'shelter' ? r.shelter?.name : r.pet?.name}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!r.isModerated && (
                      <button onClick={() => moderate(r._id, true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                        <HiCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button onClick={() => moderate(r._id, false)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors">
                      <HiTrash className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); load(p, filter); }} />
        </>
      )}
    </div>
  );
}
