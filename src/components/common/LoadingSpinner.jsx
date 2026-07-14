import { motion } from 'framer-motion';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-primary-200 border-t-primary-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="skeleton h-48 w-full mb-4 rounded-xl" />
      <div className="skeleton h-4 w-3/4 mb-2 rounded" />
      <div className="skeleton h-4 w-1/2 mb-2 rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  );
}

export function PetCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="skeleton h-52 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
