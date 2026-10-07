import React, { useState } from 'react';
import { api } from '../services/api';
import { Star, X, ThumbsUp, ShieldCheck, Check, Sparkles, Car, UserCheck } from 'lucide-react';
import reviewsTrustImg from '../assets/illustrations/campus-reviews-trust.webp';

interface ReviewModalProps {
  tripId: string;
  toUserId: string;
  recipientName: string;
  role?: 'driver' | 'passenger';
  college?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const DRIVER_TAGS = [
  'Safe & Smooth Driving 🚗',
  'Punctual Arrival ⏱️',
  'Clean Vehicle ✨',
  'Great Conversation 💬',
  'Careful Hill Driving 🏔️',
  'Good Music Vibes 🎵',
  'Courteous & Friendly 😊',
  'Fair Cost Split 💳',
];

const PASSENGER_TAGS = [
  'Ready at Pickup Bay ⏱️',
  'Respectful & Polite 🙌',
  'Clean & Tidy 🧼',
  'Followed Campus Commute Rules 📜',
  'Easy Communication 📱',
  'Prompt Payment Split ⚡',
  'Great Classmate 👍',
  'Pleasant Commute 😊',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  tripId,
  toUserId,
  recipientName,
  role: initialRole = 'driver',
  college,
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState<'driver' | 'passenger'>(initialRole);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRoleChange = (newRole: 'driver' | 'passenger') => {
    setRole(newRole);
    setSelectedTags([]);
  };

  const availableTags = role === 'driver' ? DRIVER_TAGS : PASSENGER_TAGS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.submitReview({
        tripId,
        toUserId,
        rating,
        role,
        tags: selectedTags,
        comment: comment.trim() || (role === 'driver' ? 'Smooth driving and punctual campus commute!' : 'Punctual, polite and great passenger!'),
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2820]/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Visual Hero Banner */}
        <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-[#143D32] to-[#1E5B4B]">
          <img
            src={reviewsTrustImg}
            alt="Campus Peer Reviews & Trust"
            className="w-full h-full object-cover object-center opacity-75 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#143D32] via-[#143D32]/60 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Verified Campus Reputation
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-200/90 font-medium">Uttarakhand Peer Trust</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Review Submitted!</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Thank you for strengthening campus commute safety. {recipientName}’s verified trust rating has been updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Recipient Details & Role Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Reviewing Commuter</p>
                <h3 className="text-base font-bold text-slate-900">{recipientName}</h3>
                {college && (
                  <p className="text-xs text-slate-500 font-medium">{college}</p>
                )}
              </div>

              {/* Role Toggle Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleChange('driver')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    role === 'driver'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  As Driver
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('passenger')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    role === 'passenger'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  As Passenger
                </button>
              </div>
            </div>

            {/* Star Rating Section */}
            <div className="text-center py-1">
              <p className="text-xs text-slate-600 font-medium mb-2">
                {role === 'driver' ? 'How was their driving, route, and punctuality?' : 'How courteous and ready was this passenger?'}
              </p>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1.5 text-slate-300 hover:scale-125 transition-transform duration-150 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active
                            ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]'
                            : 'text-slate-200 hover:text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 min-h-[22px]">
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80">
                  {rating === 5 && '🌟 5.0 - Exemplary Commute Experience'}
                  {rating === 4 && '👍 4.0 - Great & Reliable Ride'}
                  {rating === 3 && '👌 3.0 - Good Standard Commute'}
                  {rating === 2 && '😐 2.0 - Room for Improvement'}
                  {rating === 1 && '⚠️ 1.0 - Needs Attention'}
                </span>
              </div>
            </div>

            {/* Compliment Badges */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Verified Compliments
                </label>
                <span className="text-[11px] text-slate-400">Tap to tag</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all font-medium flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Personal Student Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  role === 'driver'
                    ? 'e.g., On-time pickup at UU Gate, drove safely in hill curves, very polite!'
                    : 'e.g., Waited at the pickup point on time, followed campus commute guidelines, great classmate!'
                }
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Reviews are verified and permanently tied to university credentials.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Post Verified Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
