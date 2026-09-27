import React, { useState } from 'react';
import { api } from '../services/api';
import { Star, X, ThumbsUp, ShieldCheck } from 'lucide-react';

interface ReviewModalProps {
  tripId: string;
  toUserId: string;
  recipientName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  tripId,
  toUserId,
  recipientName,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.submitReview({
        tripId,
        toUserId,
        rating,
        comment: comment.trim() || 'Great student carpool commute!',
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143D32]/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#143D32] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald-300 flex items-center justify-center">
              <Star className="w-4 h-4 fill-emerald-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-none text-white">Rate Your Commute</h3>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">Build campus carpool trust</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              How was your trip with <span className="font-bold text-slate-900">{recipientName}</span>?
            </p>
            <div className="flex justify-center gap-2 mt-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="inline-block mt-1 text-xs font-semibold text-amber-600">
              {rating === 5 && '🌟 Excellent experience'}
              {rating === 4 && '👍 Great ride'}
              {rating === 3 && '👌 Good ride'}
              {rating === 2 && '😐 Needs improvement'}
              {rating === 1 && '⚠️ Poor experience'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Feedback & Comments
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. On-time pickup, polite driver, great conversation about CS classes!"
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ratings update verified campus trust scores immediately.</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ThumbsUp className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

