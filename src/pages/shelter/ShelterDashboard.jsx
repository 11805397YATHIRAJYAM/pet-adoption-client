import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUsers, HiClipboardList, HiCalendar, HiStar, HiPlus, HiArrowRight } from 'react-icons/hi';
import { MdPets } from 'react-icons/md';
import { shelterAPI, petAPI, applicationAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, link }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="card p-5"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {link && <Link to={link} className="text-xs text-primary-600 mt-3 block hover:underline">View all →</Link>}
  </motion.div>
);

export default function ShelterDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [shelter, setShelter] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: shelterData } = await shelterAPI.getMy();
        setShelter(shelterData.shelter);

        const [analyticsRes, appsRes] = await Promise.all([
          shelterAPI.getAnalytics(shelterData.shelter._id),
          applicationAPI.getAll({ limit: 5 }),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setRecentApps(appsRes.data.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          // Shelter not created yet
        } else {
          toast.error('Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <PageLoader />;

  if (!shelter) {
    return (
      <div className="text-center py-20">
        <MdPets className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No shelter yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your shelter to start adding pets.</p>
        <Link to="/shelter/create-shelter" className="btn-primary">Create Shelter</Link>
      </div>
    );
  }

  if (!shelter.isApproved) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <HiClipboardList className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pending Approval</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your shelter <strong>{shelter.name}</strong> is awaiting admin approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{shelter.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Shelter Dashboard</p>
        </div>
        <Link to="/shelter/pets/create" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-4 h-4" /> Add Pet
        </Link>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MdPets} label="Total Pets" value={analytics.pets.total} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600" link="/shelter/pets" />
          <StatCard icon={HiClipboardList} label="Applications" value={analytics.applications.pending} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" link="/shelter/applications" />
          <StatCard icon={HiUsers} label="Adopted" value={analytics.pets.adopted} color="bg-green-100 dark:bg-green-900/30 text-green-600" />
          <StatCard icon={HiCalendar} label="Upcoming Appts" value={analytics.appointments.upcoming} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600" link="/shelter/appointments" />
        </div>
      )}

      {/* Recent applications */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link to="/shelter/applications" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            View all <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">No applications yet</p>
        ) : (
          <div className="space-y-3">
            {recentApps.map((app) => (
              <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <img src={getPetImageUrl(app.pet)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://placehold.co/40/f97316/fff?text=🐾'; }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{app.pet?.name}</p>
                    <span className={`badge ${getStatusColor(app.status)} text-xs`}>{getStatusLabel(app.status)}</span>
                  </div>
                  <p className="text-xs text-gray-400">by {app.applicant?.name} • {formatDate(app.createdAt)}</p>
                </div>
                <Link to={`/shelter/applications/${app._id}`} className="text-xs text-primary-600 hover:underline flex-shrink-0">View →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
