import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPets, setFilters, setPage } from '../../redux/slices/petSlice';
import PetCard from '../../components/pet/PetCard';
import PetSearch from '../../components/pet/PetSearch';
import Pagination from '../../components/common/Pagination';
import { PetCardSkeleton } from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { HiEmojiSad } from 'react-icons/hi';

export default function BrowsePets() {
  const dispatch = useDispatch();
  const { items: pets, pagination, loading, filters } = useSelector((s) => s.pets);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  // Sync URL params to filters on mount
  useEffect(() => {
    const params = {};
    if (searchParams.get('species')) params.species = searchParams.get('species');
    if (searchParams.get('search')) params.search = searchParams.get('search');
    if (Object.keys(params).length) dispatch(setFilters(params));
  }, []);

  useEffect(() => {
    // Remove empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    dispatch(fetchPets(activeFilters));
  }, [filters, dispatch]);

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="page-title mb-1">Browse Pets</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {pagination ? `${pagination.total} pets available` : 'Find your perfect companion'}
        </p>
      </div>

      <div className="mb-8">
        <PetSearch showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <PetCardSkeleton key={i} />)}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20">
          <HiEmojiSad className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No pets found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {pets.map((pet) => (
              <PetCard key={pet._id} pet={pet} />
            ))}
          </motion.div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
