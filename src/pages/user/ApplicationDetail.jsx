import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCalendar, HiUser, HiHome, HiClipboardList } from 'react-icons/hi';
import { applicationAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl, capitalize } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await applicationAPI.getById(id);
        setApplication(data.application);
      } catch {
        toast.error('Application not found');
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this application?')) return;
    try {
      setCancelling(true);
      const { data } = await applicationAPI.update(id, { status: 'cancelled' });
      setApplication(data.application);
      toast.success('Application cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!application) return null;

  const { pet, shelter, personalInfo, housingInfo, petExperience, reason, status, shelterNotes } = application;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 group">
        <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Application Detail</h1>
        <span className={`badge ${getStatusColor(status)} text-sm px-4 py-1.5`}>{getStatusLabel(status)}</span>
      </div>

      {/* Pet info */}
      {pet && (
        <div className="card p-4 flex items-center gap-4 mb-6">
          <img src={getPetImageUrl(pet)} alt={pet.name} className="w-20 h-20 rounded-xl object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/80/f97316/fff?text=🐾'; }} />
          <div>
            <p className="font-bold text-xl text-gray-900 dark:text-white">{pet.name}</p>
            <p className="text-gray-500 dark:text-gray-400">{pet.breed || capitalize(pet.species)}</p>
            <Link to={`/pets/${pet._id}`} className="link text-sm">View pet →</Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Status timeline */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HiClipboardList className="w-5 h-5 text-primary-500" /> Application Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Submitted</p>
                <p className="text-xs text-gray-500">{formatDate(application.createdAt, 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
            {application.reviewedAt && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Under Review</p>
                  <p className="text-xs text-gray-500">{formatDate(application.reviewedAt, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            )}
            {application.approvedAt && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Approved! 🎉</p>
                  <p className="text-xs text-gray-500">{formatDate(application.approvedAt, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            )}
            {application.rejectedAt && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Not Approved</p>
                  {application.rejectionReason && <p className="text-xs text-gray-500">Reason: {application.rejectionReason}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shelter notes (non-internal) */}
        {shelterNotes?.filter(n => !n.isInternal).length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Shelter Message</h3>
            {shelterNotes.filter(n => !n.isInternal).map((note, i) => (
              <p key={i} className="text-gray-600 dark:text-gray-400 text-sm bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                {note.note}
              </p>
            ))}
          </div>
        )}

        {/* Personal info */}
        {personalInfo && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HiUser className="w-5 h-5 text-primary-500" /> Personal Information
            </h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.fullName}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.email}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.phone}</dd></div>
              {personalInfo.address?.city && (
                <div><dt className="text-gray-500">Location</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.address.city}, {personalInfo.address.state}</dd></div>
              )}
            </dl>
          </div>
        )}

        {/* Reason */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Why I Want to Adopt</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{reason}</p>
        </div>

        {/* Actions */}
        {['pending', 'under_review', 'info_requested'].includes(status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Application'}
          </button>
        )}
      </div>
    </div>
  );
}
