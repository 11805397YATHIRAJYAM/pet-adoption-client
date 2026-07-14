import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-black text-primary-500 mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          Looks like this page wandered off. Let's get you back to finding your perfect pet.
        </p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </motion.div>
    </div>
  );
}
