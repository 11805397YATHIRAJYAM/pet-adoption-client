import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiLocationMarker, HiEye } from 'react-icons/hi';
import { MdMale, MdFemale } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { favoriteAPI } from '../../services/api';
import {
  getPetImageUrl,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  formatPetAge,
  capitalize,
} from '../../utils/helpers';

export default function PetCard({ pet, onFavoriteChange }) {
  const { user } = useSelector((s) => s.auth);
  const [isFavorited, setIsFavorited] = useState(pet.isFavorited || false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }
    try {
      setFavLoading(true);
      if (isFavorited) {
        await favoriteAPI.remove(pet._id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteAPI.add(pet._id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
      onFavoriteChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  const imageUrl = getPetImageUrl(pet);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card group cursor-pointer"
    >
      <Link to={`/pets/${pet._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://placehold.co/400x300/f97316/fff?text=🐾'; }}
          />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={getStatusColor(pet.status) + ' badge text-xs'}>
              {getStatusLabel(pet.status)}
            </span>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <HiHeart className="w-4 h-4" />
          </button>

          {/* Views */}
          {pet.views > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
              <HiEye className="w-3 h-3" />
              {pet.views}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{pet.name}</h3>
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">
              {formatCurrency(pet.adoptionFee?.amount || 0)}
            </span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            {pet.breed || capitalize(pet.species)} • {formatPetAge(pet.age)}
            {pet.gender && (
              <span className="ml-1 inline-flex items-center">
                {pet.gender === 'male' ? (
                  <MdMale className="w-4 h-4 text-blue-500" />
                ) : pet.gender === 'female' ? (
                  <MdFemale className="w-4 h-4 text-pink-500" />
                ) : null}
              </span>
            )}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pet.size && (
              <span className="badge badge-gray">{capitalize(pet.size)}</span>
            )}
            {pet.medicalHistory?.vaccinated && (
              <span className="badge badge-green">Vaccinated</span>
            )}
            {pet.medicalHistory?.neutered && (
              <span className="badge badge-blue">Neutered</span>
            )}
            {pet.medicalHistory?.specialNeeds && (
              <span className="badge badge-orange">Special Needs</span>
            )}
          </div>

          {/* Location */}
          {pet.location?.city && (
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
              <HiLocationMarker className="w-3 h-3" />
              {pet.location.city}{pet.location.state ? `, ${pet.location.state}` : ''}
            </div>
          )}

          <button className="btn-primary w-full text-sm py-2">
            View Details
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
