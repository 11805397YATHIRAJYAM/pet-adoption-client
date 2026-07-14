import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiCheck, HiX } from 'react-icons/hi';
import { appointmentAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl, getAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ShelterAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getAll().then(({ data }) => {
      setAppointments(data.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await appointmentAPI.update(id, { status });
      setAppointments((prev) => prev.map((a) => a._id === id ? data.appointment : a));
      toast.success(`Appointment ${status}`);
    } catch (err) { toast.error('Update failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-20 card">
          <HiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No appointments scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <motion.div key={appt._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {appt.user && (
                      <div className="flex items-center gap-2">
                        <img src={getAvatarUrl(appt.user)} alt="" className="w-8 h-8 rounded-full" />
                        <p className="font-semibold text-gray-900 dark:text-white">{appt.user.name}</p>
                      </div>
                    )}
                    <span className="text-gray-400">→</span>
                    <p className="text-gray-600 dark:text-gray-400">{appt.pet?.name}</p>
                    <span className={`badge ${getStatusColor(appt.status)}`}>{getStatusLabel(appt.status)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <HiCalendar className="w-4 h-4 text-primary-500" />
                      {formatDate(appt.scheduledDate, 'EEE, MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HiClock className="w-4 h-4 text-primary-500" />
                      {appt.scheduledTime}
                    </span>
                    <span className="capitalize">{appt.type?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {appt.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(appt._id, 'confirmed')} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                      <HiCheck className="w-4 h-4" /> Confirm
                    </button>
                    <button onClick={() => updateStatus(appt._id, 'cancelled')} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
                      <HiX className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                )}
                {appt.status === 'confirmed' && (
                  <button onClick={() => updateStatus(appt._id, 'completed')} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                    Mark Complete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
