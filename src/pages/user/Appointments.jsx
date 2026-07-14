import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiLocationMarker } from 'react-icons/hi';
import { appointmentAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getAll().then(({ data }) => {
      setAppointments(data.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <HiCalendar className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="page-title">My Appointments</h1>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 card">
          <HiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No appointments</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <motion.div key={appt._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
              <div className="flex items-start gap-4">
                {appt.pet && (
                  <img src={getPetImageUrl(appt.pet)} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://placehold.co/64/f97316/fff?text=🐾'; }} />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-900 dark:text-white">{appt.pet?.name} — {appt.type?.replace(/_/g, ' ')}</p>
                    <span className={`badge ${getStatusColor(appt.status)}`}>{getStatusLabel(appt.status)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <HiCalendar className="w-4 h-4 text-primary-500" />
                      {formatDate(appt.scheduledDate, 'EEEE, MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HiClock className="w-4 h-4 text-primary-500" />
                      {appt.scheduledTime}
                    </span>
                    {appt.location && (
                      <span className="flex items-center gap-1.5">
                        <HiLocationMarker className="w-4 h-4 text-primary-500" />
                        {appt.location}
                      </span>
                    )}
                  </div>
                  {appt.shelter && (
                    <p className="text-sm text-gray-400 mt-1">@ {appt.shelter.name}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
