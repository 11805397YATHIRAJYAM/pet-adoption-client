import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCheck, HiX, HiChat } from 'react-icons/hi';
import { applicationAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ShelterAppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    applicationAPI.getById(id).then(({ data }) => {
      setApplication(data.application);
    }).catch(() => navigate('/shelter/applications')).finally(() => setLoading(false));
  }, [id, navigate]);

  const updateStatus = async (status, extra = {}) => {
    try {
      setUpdating(true);
      const { data } = await applicationAPI.update(id, { status, ...extra });
      setApplication(data.application);
      toast.success(`Application ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      setUpdating(true);
      const { data } = await applicationAPI.update(id, { shelterNote: note, noteIsInternal: false });
      setApplication(data.application);
      setNote('');
      toast.success('Note added');
    } catch {}
    finally { setUpdating(false); }
  };

  if (loading) return <PageLoader />;
  if (!application) return null;

  const { pet, applicant, personalInfo, housingInfo, petExperience, reason, status } = application;
  const canReview = ['pending', 'under_review'].includes(status);

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 group">
        <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Application Review</h1>
        <span className={`badge ${getStatusColor(status)} text-sm px-4 py-1.5`}>{getStatusLabel(status)}</span>
      </div>

      {/* Pet & Applicant */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {pet && (
          <div className="card p-4 flex items-center gap-3">
            <img src={getPetImageUrl(pet)} alt="" className="w-16 h-16 rounded-xl object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/64/f97316/fff?text=🐾'; }} />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{pet.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{pet.species}</p>
            </div>
          </div>
        )}
        {applicant && (
          <div className="card p-4 flex items-center gap-3">
            <img src={getAvatarUrl(applicant)} alt="" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{applicant.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{applicant.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {canReview && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Take Action</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => updateStatus('approved')}
              disabled={updating}
              className="flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
            >
              <HiCheck className="w-5 h-5" /> Approve
            </button>
            <button
              onClick={() => updateStatus('under_review')}
              disabled={updating}
              className="flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              Under Review
            </button>
            <button
              onClick={() => {
                if (!rejectionReason) { toast.error('Enter rejection reason'); return; }
                updateStatus('rejected', { rejectionReason });
              }}
              disabled={updating}
              className="flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
            >
              <HiX className="w-5 h-5" /> Reject
            </button>
          </div>
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason (required to reject)..."
            className="input text-sm"
          />
        </div>
      )}

      {/* Application details */}
      <div className="space-y-4">
        {personalInfo && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">Full Name</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.fullName}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.phone}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.email}</dd></div>
              {personalInfo.address?.city && (
                <div><dt className="text-gray-500">Location</dt><dd className="font-medium text-gray-900 dark:text-white">{personalInfo.address.city}, {personalInfo.address.state}</dd></div>
              )}
            </dl>
          </div>
        )}

        {housingInfo && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Housing</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">Type</dt><dd className="font-medium text-gray-900 dark:text-white capitalize">{housingInfo.type}</dd></div>
              <div><dt className="text-gray-500">Ownership</dt><dd className="font-medium text-gray-900 dark:text-white capitalize">{housingInfo.ownership}</dd></div>
              <div><dt className="text-gray-500">Has Yard</dt><dd className="font-medium text-gray-900 dark:text-white">{housingInfo.hasYard ? 'Yes' : 'No'}</dd></div>
              <div><dt className="text-gray-500">Pets Allowed</dt><dd className="font-medium text-gray-900 dark:text-white">{housingInfo.allowsPets ? 'Yes' : 'No'}</dd></div>
              <div><dt className="text-gray-500">Residents</dt><dd className="font-medium text-gray-900 dark:text-white">{housingInfo.numberOfResidents}</dd></div>
            </dl>
          </div>
        )}

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Reason for Adoption</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{reason}</p>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HiChat className="w-5 h-5 text-primary-500" /> Send Message to Applicant
          </h3>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a message to the applicant..."
              className="input flex-1"
            />
            <button onClick={addNote} disabled={updating || !note.trim()} className="btn-primary px-4">
              {updating ? <LoadingSpinner size="sm" /> : 'Send'}
            </button>
          </div>
          {application.shelterNotes?.filter(n => !n.isInternal).map((n, i) => (
            <div key={i} className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              {n.note}
              <span className="text-xs text-gray-400 ml-2">{formatDate(n.addedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
