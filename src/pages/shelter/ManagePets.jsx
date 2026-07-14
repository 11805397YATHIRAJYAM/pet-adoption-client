import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import { petAPI, shelterAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, getPetImageUrl, capitalize } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function ManagePets() {
  const [pets, setPets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shelter, setShelter] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await shelterAPI.getMy();
        setShelter(data.shelter);
        return data.shelter._id;
      } catch { return null; }
    };

    init().then((shelterId) => {
      if (!shelterId) { setLoading(false); return; }
      fetchPets(shelterId);
    });
  }, []);

  const fetchPets = async (shelterId, currentPage = 1, status = '') => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 12 };
      if (status) params.status = status;
      const { data } = await petAPI.getShelterPets(shelterId, params);
      setPets(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load pets'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm('Remove this pet?')) return;
    try {
      await petAPI.delete(petId);
      setPets((prev) => prev.filter((p) => p._id !== petId));
      toast.success('Pet removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePageChange = (p) => {
    setPage(p);
    if (shelter) fetchPets(shelter._id, p, statusFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Pets</h1>
        <Link to="/shelter/pets/create" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-4 h-4" /> Add Pet
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'available', 'pending', 'adopted', 'fostered'].map((s) => (
          <button key={s || 'all'}
            onClick={() => { setStatusFilter(s); if (shelter) fetchPets(shelter._id, 1, s); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {s ? getStatusLabel(s) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : pets.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-gray-500 dark:text-gray-400">No pets found.</p>
          <Link to="/shelter/pets/create" className="btn-primary mt-4">Add First Pet</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <motion.div key={pet._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
                <div className="relative h-40">
                  <img src={getPetImageUrl(pet)} alt={pet.name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x160/f97316/fff?text=🐾'; }} />
                  <span className={`absolute top-2 left-2 badge ${getStatusColor(pet.status)}`}>{getStatusLabel(pet.status)}</span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{pet.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{pet.breed || pet.species}</p>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/shelter/pets/${pet._id}/edit`} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm py-2">
                      <HiPencil className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={() => handleDelete(pet._id)} className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-xl border-2 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <HiTrash className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
