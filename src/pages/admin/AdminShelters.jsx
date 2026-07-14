import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiCheck, HiOfficeBuilding } from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminShelters() {
  const [shelters, setShelters] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const load = async (p = 1, f = '') => {
    try {
      setLoading(true);
      const params = { page: p, limit: 15 };
      if (f === 'pending') params.isApproved = false;
      if (f === 'approved') params.isApproved = true;
      const { data } = await adminAPI.getShelters(params);
      setShelters(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await adminAPI.approveShelter(id);
      setShelters((prev) => prev.map((s) => s._id === id ? { ...s, isApproved: true } : s));
      toast.success('Shelter approved!');
    } catch { toast.error('Approval failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Manage Shelters</h1>

      <div className="flex gap-2">
        {['', 'pending', 'approved'].map((f) => (
          <button key={f || 'all'}
            onClick={() => { setFilter(f); load(1, f); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {f === '' ? 'All' : f === 'pending' ? 'Pending' : 'Approved'}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : shelters.length === 0 ? (
        <div className="text-center py-20 card">
          <HiOfficeBuilding className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No shelters found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {shelters.map((s) => (
              <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 flex items-center gap-4">
                {s.logo?.url ? (
                  <img src={s.logo.url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <HiOfficeBuilding className="w-7 h-7 text-primary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                    <span className={`badge text-xs ${s.isApproved ? 'badge-green' : 'badge-orange'}`}>
                      {s.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {s.address?.city}, {s.address?.state} • {s.email} • {formatDate(s.createdAt)}
                  </p>
                  {s.owner && (
                    <p className="text-xs text-gray-400 mt-0.5">Owner: {s.owner.name} ({s.owner.email})</p>
                  )}
                </div>
                {!s.isApproved && (
                  <button onClick={() => approve(s._id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors flex-shrink-0">
                    <HiCheck className="w-4 h-4" /> Approve
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); load(p, filter); }} />
        </>
      )}
    </div>
  );
}
