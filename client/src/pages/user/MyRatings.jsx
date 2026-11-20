import React, { useState, useEffect, useCallback } from 'react';
import { Star, Edit2, CheckCircle2, RotateCcw } from 'lucide-react';
import { ratingService } from '../../services/ratingService';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';

export const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Edit Rating Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRatingObj, setSelectedRatingObj] = useState(null);
  const [newRatingValue, setNewRatingValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchMyRatings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ratingService.getMyRatings({ page, limit });
      if (res.success && res.data) {
        setRatings(res.data.ratings);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      error('Failed to load your submitted ratings.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, error]);

  useEffect(() => {
    fetchMyRatings();
  }, [fetchMyRatings]);

  const openEditModal = (r) => {
    setSelectedRatingObj(r);
    setNewRatingValue(r.rating);
    setIsModalOpen(true);
  };

  const handleUpdateRating = async () => {
    if (!selectedRatingObj) return;
    setIsSubmitting(true);
    try {
      const res = await ratingService.updateRating(selectedRatingObj.id, {
        rating: newRatingValue,
      });

      success(res.message || 'Rating modified successfully!');
      setIsModalOpen(false);
      fetchMyRatings();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update rating.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span>My Submitted Ratings</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          You have submitted ratings for {totalCount} stores. You can modify any of your ratings anytime.
        </p>
      </div>

      {/* Ratings Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching your ratings..." />
        ) : ratings.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No ratings submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse registered stores and share your feedback by rating them!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Store Name
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Overall Store Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Your Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {r.store.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm truncate" title={r.store.address}>
                      {r.store.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={r.store.overallRating} size="sm" />
                        <span className="text-xs text-slate-400">
                          ({r.store.totalRatings || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{r.rating} / 5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(r)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modify</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Edit Rating Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modify Your Submitted Rating"
        maxWidth="max-w-md"
      >
        {selectedRatingObj && (
          <div className="space-y-5 text-center">
            <div>
              <h4 className="text-base font-bold text-slate-900">{selectedRatingObj.store.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedRatingObj.store.address}</p>
            </div>

            <div className="py-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select new rating
              </p>
              <div className="py-2">
                <StarRating
                  rating={newRatingValue}
                  size="xl"
                  interactive={true}
                  onChange={(val) => setNewRatingValue(val)}
                />
              </div>
              <p className="text-sm font-extrabold text-blue-600">
                {newRatingValue} out of 5 Stars
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleUpdateRating}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Updating...' : 'Update Rating'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-1/3 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyRatings;
