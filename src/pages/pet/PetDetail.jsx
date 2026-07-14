import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiHeart, HiLocationMarker, HiPhone, HiMail, HiShieldCheck,
  HiStar, HiArrowLeft, HiClock, HiEye,
} from 'react-icons/hi';
import { MdMale, MdFemale, MdPets } from 'react-icons/md';
import { petAPI, favoriteAPI, reviewAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  getPetImageUrl, formatCurrency, formatPetAge, getStatusColor,
  getStatusLabel, capitalize, timeAgo, getAvatarUrl,
} from '../../utils/helpers';
import ReviewCard from '../../components/review/ReviewCard';
import ReviewForm from '../../components/review/ReviewForm';
import ApplicationForm from '../../components/pet/ApplicationForm';
import Modal from '../../components/common/Modal';

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [pet, setPet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await petAPI.getById(id);
        setPet(data.pet);
        setIsFavorited(data.pet.isFavorited || false);

        const revData = await reviewAPI.getAll({ pet: id });
        setReviews(revData.data.data || []);
      } catch (err) {
        toast.error('Pet not found');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleFavorite = async () => {
    if (!user) { toast.error('Please login to save favorites'); return; }
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!pet) return null;

  const images = pet.images?.length > 0 ? pet.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 group"
      >
        <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.url || getPetImageUrl(pet)}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <MdPets className="w-24 h-24 text-gray-300 dark:text-gray-600" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`badge ${getStatusColor(pet.status)}`}>
                {getStatusLabel(pet.status)}
              </span>
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
              <HiEye className="w-4 h-4" /> {pet.views || 0} views
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{pet.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {pet.breed || capitalize(pet.species)} •{' '}
                  {formatPetAge(pet.age)} •{' '}
                  {pet.gender === 'male' ? (
                    <span className="text-blue-500 inline-flex items-center gap-1">
                      <MdMale className="w-4 h-4" /> Male
                    </span>
                  ) : pet.gender === 'female' ? (
                    <span className="text-pink-500 inline-flex items-center gap-1">
                      <MdFemale className="w-4 h-4" /> Female
                    </span>
                  ) : 'Unknown gender'}
                </p>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(pet.adoptionFee?.amount || 0)}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {pet.size && <span className="badge badge-gray">Size: {capitalize(pet.size)}</span>}
              {pet.color?.map((c) => <span key={c} className="badge badge-gray capitalize">{c}</span>)}
              {pet.medicalHistory?.vaccinated && <span className="badge badge-green">✓ Vaccinated</span>}
              {pet.medicalHistory?.neutered && <span className="badge badge-blue">✓ Neutered</span>}
              {pet.medicalHistory?.microchipped && <span className="badge badge-blue">✓ Microchipped</span>}
              {pet.medicalHistory?.specialNeeds && <span className="badge badge-orange">Special Needs</span>}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About {pet.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{pet.description}</p>
            </div>

            {/* Temperament */}
            {pet.temperament?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personality</h3>
                <div className="flex flex-wrap gap-2">
                  {pet.temperament.map((t) => (
                    <span key={t} className="badge badge-orange capitalize">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Good with */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Good With</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Children', val: pet.goodWith?.children },
                  { label: 'Dogs', val: pet.goodWith?.dogs },
                  { label: 'Cats', val: pet.goodWith?.cats },
                  { label: 'Seniors', val: pet.goodWith?.seniors },
                ].map(({ label, val }) => (
                  <div key={label} className={`text-center p-3 rounded-xl text-sm font-medium ${
                    val === true ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    val === false ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                    'bg-gray-50 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {val === true ? '✓' : val === false ? '✗' : '?'} {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            {pet.location?.city && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <HiLocationMarker className="w-4 h-4 text-primary-500" />
                {pet.location.city}{pet.location.state ? `, ${pet.location.state}` : ''}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Reviews ({reviews.length})
              </h3>
              {user && (
                <button onClick={() => setShowReviewForm(true)} className="btn-primary text-sm py-2">
                  Write Review
                </button>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => <ReviewCard key={rev._id} review={rev} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Adoption actions */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Interested in {pet.name}?</h3>

            {pet.status === 'available' ? (
              <div className="space-y-3">
                <button
                  onClick={() => user ? setShowApplicationModal(true) : navigate('/login')}
                  className="btn-primary w-full py-3 text-base"
                >
                  Apply to Adopt
                </button>
                <button
                  onClick={handleFavorite}
                  disabled={favLoading}
                  className={`w-full py-3 rounded-xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isFavorited
                      ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                  }`}
                >
                  <HiHeart className="w-5 h-5" />
                  {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
                </button>
              </div>
            ) : (
              <div className={`badge ${getStatusColor(pet.status)} text-sm px-4 py-2 w-full justify-center`}>
                {getStatusLabel(pet.status)} — Not available
              </div>
            )}
          </div>

          {/* Shelter info */}
          {pet.shelter && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About the Shelter</h3>
              <div className="flex items-center gap-3 mb-4">
                {pet.shelter.logo?.url ? (
                  <img src={pet.shelter.logo.url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <MdPets className="w-6 h-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{pet.shelter.name}</p>
                  {pet.shelter.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <HiStar className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {pet.shelter.rating} ({pet.shelter.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {pet.shelter.address && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <HiLocationMarker className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {pet.shelter.address.city}, {pet.shelter.address.state}
                </div>
              )}
              {pet.shelter.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <HiPhone className="w-4 h-4 text-primary-500" />
                  {pet.shelter.phone}
                </div>
              )}
              {pet.shelter.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <HiMail className="w-4 h-4 text-primary-500" />
                  {pet.shelter.email}
                </div>
              )}
            </div>
          )}

          {/* Posted info */}
          <div className="card p-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <HiClock className="w-4 h-4" />
              Listed {timeAgo(pet.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={`Apply to Adopt ${pet.name}`}
        size="xl"
      >
        <ApplicationForm
          pet={pet}
          onSuccess={() => {
            setShowApplicationModal(false);
            toast.success('Application submitted!');
          }}
          onCancel={() => setShowApplicationModal(false)}
        />
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        title="Write a Review"
        size="md"
      >
        <ReviewForm
          targetType="pet"
          targetId={pet._id}
          onSuccess={(rev) => {
            setReviews([rev, ...reviews]);
            setShowReviewForm(false);
          }}
          onCancel={() => setShowReviewForm(false)}
        />
      </Modal>
    </div>
  );
}
