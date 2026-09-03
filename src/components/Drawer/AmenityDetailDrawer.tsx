"use client";

import React, { useState } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  Accessibility,
  Baby,
  Sparkles,
  KeyRound,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { formatDistance } from "@/lib/utils";

export interface AmenityDetail {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  isAccessible: boolean;
  isGenderNeutral: boolean;
  hasBabyChanging: boolean;
  feeRequired: boolean;
  keyOrCodeRequired: boolean;
  doorCode?: string | null;
  hours?: string | null;
  status: string;
  lastVerifiedAt?: string | null;
  reviewCount: number;
  avgRating: number | null;
  avgCleanliness: number | null;
  distanceMeters?: number | null;
  reviews?: Array<{
    id: string;
    rating: number;
    cleanlinessRating: number;
    comment: string | null;
    createdAt: string;
  }>;
}

interface AmenityDetailDrawerProps {
  amenity: AmenityDetail | null;
  onClose: () => void;
  onVerificationSubmitted: () => void;
  onReviewSubmitted: () => void;
}

export const AmenityDetailDrawer: React.FC<AmenityDetailDrawerProps> = ({
  amenity,
  onClose,
  onVerificationSubmitted,
  onReviewSubmitted,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!amenity) return null;

  const handleVerifyStatus = async (status: "OPERATIONAL" | "OUT_OF_ORDER" | "CLOSED") => {
    setIsVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await fetch(`/api/amenities/${amenity.id}/verifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify status. Please try again.");
      }

      setVerificationFeedback(`Thank you! Status updated to ${status.replace(/_/g, " ").toLowerCase()}.`);
      onVerificationSubmitted();
    } catch (err) {
      setVerificationFeedback(err instanceof Error ? err.message : "Error verifying status");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/amenities/${amenity.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          cleanlinessRating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setComment("");
      setShowReviewForm(false);
      onReviewSubmitted();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Operational
          </span>
        );
      case "OUT_OF_ORDER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Needs Maintenance
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "RESTROOM":
        return "🚻 Public Restroom";
      case "WATER_FOUNTAIN":
        return "💧 Water Refill Station";
      case "SEATING":
        return "🪑 Seating / Rest Area";
      default:
        return type;
    }
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform transform duration-300 ease-in-out"
      aria-label="Amenity Details"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {getTypeLabel(amenity.type)}
            </span>
            {getStatusBadge(amenity.status)}
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {amenity.name}
          </h2>
          {amenity.distanceMeters !== undefined && amenity.distanceMeters !== null && (
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              📍 {formatDistance(amenity.distanceMeters)} away
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick Info Grid */}
        <div className="space-y-2 text-sm text-slate-600">
          {amenity.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{amenity.address}</span>
            </div>
          )}
          {amenity.hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{amenity.hours}</span>
            </div>
          )}
          {amenity.doorCode && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200">
              <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-mono font-bold text-xs">
                Access Code: {amenity.doorCode}
              </span>
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-1.5">
          {amenity.isAccessible && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Accessibility className="w-3.5 h-3.5" /> Wheelchair Accessible
            </span>
          )}
          {amenity.hasBabyChanging && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <Baby className="w-3.5 h-3.5" /> Baby Changing Table
            </span>
          )}
          {amenity.isGenderNeutral && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> Gender-Neutral
            </span>
          )}
          {amenity.feeRequired ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <DollarSign className="w-3.5 h-3.5" /> Fee Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              Free Access
            </span>
          )}
        </div>

        {/* Description */}
        {amenity.description && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            {amenity.description}
          </div>
        )}

        {/* Community Verification Box */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">
              Is this operational right now?
            </span>
            {amenity.lastVerifiedAt && (
              <span className="text-[11px] text-slate-400">
                Verified {new Date(amenity.lastVerifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleVerifyStatus("OPERATIONAL")}
              disabled={isVerifying}
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all text-center flex items-center justify-center gap-1"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Open</span>
            </button>
            <button
              onClick={() => handleVerifyStatus("OUT_OF_ORDER")}
              disabled={isVerifying}
              className="py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium shadow-sm transition-all text-center flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Issues</span>
            </button>
            <button
              onClick={() => handleVerifyStatus("CLOSED")}
              disabled={isVerifying}
              className="py-1.5 px-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all text-center flex items-center justify-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              <span>Closed</span>
            </button>
          </div>
          {verificationFeedback && (
            <p className="text-xs font-medium text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200">
              {verificationFeedback}
            </p>
          )}
        </div>

        {/* Cleanliness & Ratings summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-base font-bold text-slate-900">
                {amenity.avgRating ? `${amenity.avgRating} / 5` : "No ratings yet"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {amenity.reviewCount} community rating{amenity.reviewCount === 1 ? "" : "s"}
            </p>
          </div>
          {amenity.avgCleanliness && (
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                ✨ Cleanliness: {amenity.avgCleanliness} / 5
              </span>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              Reviews & Feedback
            </h3>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {showReviewForm ? "Cancel" : "+ Add Rating"}
            </button>
          </div>

          {/* Add Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Overall Rating: {rating} / 5
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cleanliness Score: {cleanlinessRating} / 5
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setCleanlinessRating(score)}
                      className={`px-2 py-1 rounded border text-xs font-semibold transition-all ${
                        score === cleanlinessRating
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes / Observations (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Clean soap dispensers, water pressure is great..."
                  rows={2}
                  maxLength={500}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {reviewError && (
                <p className="text-rose-600 font-semibold">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                {isSubmittingReview ? "Submitting..." : "Post Review"}
              </button>
            </form>
          )}

          {/* Review List */}
          {amenity.reviews && amenity.reviews.length > 0 ? (
            <div className="space-y-2.5">
              {amenity.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500" />
                      ))}
                      <span className="text-[11px] font-semibold text-slate-600 ml-1">
                        Cleanliness: {rev.cleanlinessRating}/5
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rev.comment && (
                    <p className="text-slate-700 leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">
              No reviews yet. Be the first to rate!
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
