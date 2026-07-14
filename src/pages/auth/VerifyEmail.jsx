import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your email has been verified successfully.</p>
            <Link to="/browse" className="btn-primary">Start Browsing Pets</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <HiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">The link is invalid or has expired.</p>
            <Link to="/login" className="btn-primary">Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
