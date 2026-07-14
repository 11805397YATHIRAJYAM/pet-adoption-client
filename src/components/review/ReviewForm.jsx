import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiStar } from 'react-icons/hi';
import { reviewAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

export default function ReviewForm({ targetType, targetId, onSuccess, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });
  const rating = watch('rating');

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const body = { targetType, rating: values.rating, comment: values.comment };
      if (values.title) body.title = values.title;
      if (targetType === 'shelter') body.shelter = targetId;
      else body.pet = targetId;

      const { data } = await reviewAPI.create(body);
      toast.success('Review submitted!');
      onSuccess(data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="label">Rating *</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredStar(i + 1)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setValue('rating', i + 1, { shouldValidate: true })}
              className="text-3xl transition-transform hover:scale-110"
            >
              <HiStar
                className={`w-8 h-8 transition-colors ${
                  i < (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="error-text">{errors.rating.message}</p>}
      </div>

      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Summary of your experience" />
      </div>

      <div>
        <label className="label">Comment *</label>
        <textarea
          {...register('comment')}
          rows={4}
          className="input resize-none"
          placeholder="Share your experience..."
        />
        {errors.comment && <p className="error-text">{errors.comment.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {submitting ? <><LoadingSpinner size="sm" /> Submitting...</> : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
