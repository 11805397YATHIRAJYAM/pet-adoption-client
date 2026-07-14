import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiBell, HiCheck } from 'react-icons/hi';
import { notificationAPI } from '../../services/api';
import { setNotifications, markRead, markAllRead } from '../../redux/slices/notificationSlice';
import { timeAgo } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Notifications() {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount, loading } = useSelector((s) => s.notifications);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await notificationAPI.getAll({ limit: 50 });
        dispatch(setNotifications({ data: data.data, unreadCount: data.unreadCount }));
      } catch {}
      setFetching(false);
    };
    fetch();
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    dispatch(markRead(id));
    try { await notificationAPI.markRead(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllRead());
    try { await notificationAPI.markAllRead(); toast.success('All marked as read'); } catch {}
  };

  if (fetching) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <HiBell className="w-6 h-6 text-primary-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
          <h1 className="page-title">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
            <HiCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 card">
          <HiBell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No notifications</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`card p-4 flex items-start gap-4 cursor-pointer transition-colors ${
                !n.isRead ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10' : ''
              }`}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-primary-500'}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {n.link && (
                <Link to={n.link} className="text-xs text-primary-600 flex-shrink-0 hover:underline" onClick={(e) => e.stopPropagation()}>
                  View →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
