import { useState } from 'react';
import { HiStar, HiThumbUp, HiThumbDown } from 'react-icons/hi';
import { reviewAPI } from '../../services/api';
import { getAvatarUrl, timeAgo } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function ReviewCard({ review }) {
  const { user } = useSelector((s) => s.auth);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [voted, setVoted] = useState(review.helpfulVotes?.includes(user?._id));

  const handleHelpful = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      const { data } = await reviewAPI.markHelpful(review._id);
      setHelpfulCount(data.helpfulCount);
      setVoted(data.voted);
    } catch {}
  };

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={getAvatarUrl(review.reviewer)}
          alt={review.reviewer?.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.reviewer?.name}</p>
            <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
          </div>
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <HiStar
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">{review.title}</h4>
      )}
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">{review.comment}</p>

      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((img, i) => (
            <img key={i} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <button
        onClick={handleHelpful}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          voted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <HiThumbUp className="w-4 h-4" />
        Helpful ({helpfulCount})
      </button>
    </div>
  );
}
