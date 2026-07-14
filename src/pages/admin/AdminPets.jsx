import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiTrash, HiSearch, HiHeart } from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDate, getPetImageUrl, getStatusColor, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPets() {
  const [pets, setPets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async (p = 1, q = '') => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (q) params.search = q;
      const { data } = await adminAPI.getPets(params);
      setPets(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deletePet = async (id) => {
    if (!confirm('Delete this pet listing? This action cannot be undone.')) return;
    try {
      await adminAPI.deletePet(id);
      setPets((prev) => prev.filter((p) => p._id !== id));
      toast.success('Pet deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, search);
  };

  return (
    <div className="space-y-6">
      <h1 className="page-title">Manage Pets</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pets..."
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? <PageLoader /> : pets.length === 0 ? (
        <div className="text-center py-20 card">
          <HiHeart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pets found.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Pet</th>
                    <th className="px-6 py-3 text-left">Species</th>
                    <th className="px-6 py-3 text-left">Shelter</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Listed</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pets.map((pet) => (
                    <motion.tr key={pet._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={getPetImageUrl(pet)} alt=""
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://placehold.co/40/f97316/fff?text=🐾'; }} />
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{pet.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{pet.species}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pet.shelter?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`badge text-xs ${getStatusColor(pet.status)}`}>{getStatusLabel(pet.status)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(pet.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deletePet(pet._id)}
                          className="flex items-center gap-1 ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors">
                          <HiTrash className="w-4 h-4" /> Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); load(p, search); }} />
        </>
      )}
    </div>
  );
}
