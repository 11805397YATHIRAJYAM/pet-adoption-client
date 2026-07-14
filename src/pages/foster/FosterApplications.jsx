import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiClipboardList, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { fosterAPI } from '../../services/api';
import { PageLoader } from '../../components/common/LoadingSpinner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStatusColor, getStatusLabel, formatDate, getPetImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

function ProgressReportForm({ appId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await fosterAPI.addProgress(appId, { report: text });
      setText('');
      setOpen(false);
      toast.success('Report added');
      onAdded?.();
    } catch { toast.error('Failed to add report'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)} className="text-sm text-primary-600 flex items-center gap-1">
        Add Progress Report {open ? <HiChevronUp /> : <HiChevronDown />}
      </button>
      {open && (
        <div className="mt-2 flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Progress update..." className="input flex-1 resize-none text-sm" />
          <button onClick={submit} disabled={loading} className="btn-primary px-4 self-start">
            {loading ? <LoadingSpinner size="sm" /> : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FosterApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    fosterAPI.getApplications().then(({ data }) => {
      setApplications(data.data || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Foster Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-20 card">
          <HiClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No foster applications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <motion.div key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
              <div
                className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpanded(expanded === app._id ? null : app._id)}
              >
                {app.pet && (
                  <img src={getPetImageUrl(app.pet)} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://placehold.co/56/f97316/fff?text=🐾'; }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{app.pet?.name || 'General Foster'}</p>
                    <span className={`badge ${getStatusColor(app.status)} text-xs`}>{getStatusLabel(app.status)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {app.shelter?.name} • Applied {formatDate(app.createdAt)}
                  </p>
                </div>
                {expanded === app._id ? <HiChevronUp className="w-5 h-5 text-gray-400" /> : <HiChevronDown className="w-5 h-5 text-gray-400" />}
              </div>

              {expanded === app._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/30"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Foster Type</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{app.fosterType || 'Temporary'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Experience</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{app.petExperience?.previousExperience || 'None listed'}</p>
                    </div>
                    {app.availability?.startDate && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Available From</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(app.availability.startDate)}</p>
                      </div>
                    )}
                    {app.availability?.endDate && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Until</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(app.availability.endDate)}</p>
                      </div>
                    )}
                  </div>

                  {app.progressReports?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Progress Reports</p>
                      <div className="space-y-2">
                        {app.progressReports.map((r, i) => (
                          <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                            {r.report}
                            <span className="text-xs text-gray-400 ml-2">{formatDate(r.addedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.status === 'active' && (
                    <ProgressReportForm appId={app._id} onAdded={load} />
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
