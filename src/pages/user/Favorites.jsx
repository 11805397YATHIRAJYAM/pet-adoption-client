import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiHeart, HiEmojiSad } from 'react-icons/hi';
import { favoriteAPI } from '../../services/api';
import PetCard from '../../components/pet/PetCard';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const { data } = await favoriteAPI.getAll();
      setFavorites(data.favorites || []);
    } catch {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <HiHeart className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="page-title">My Favorites</h1>
          <p className="text-gray-500 dark:text-gray-400">{favorites.length} saved pets</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <HiEmojiSad className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Browse pets and click the heart icon to save them here.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {favorites.map((fav) =>
            fav.pet ? (
              <PetCard
                key={fav._id}
                pet={{ ...fav.pet, isFavorited: true }}
                onFavoriteChange={fetchFavorites}
              />
            ) : null
          )}
        </motion.div>
      )}
    </div>
  );
}
