import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Edit2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { storeService } from '../../services/storeService';
import { ratingService } from '../../services/ratingService';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';

export const BrowseStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Rating Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { success, error } = useToast();

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        name: nameFilter,
        address: addressFilter,
        sortBy,
        sortOrder,
      };

      const res = await storeService.getStores(params);
      if (res.success && res.data) {
        setStores(res.data.stores);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      error('Failed to load stores list.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, nameFilter, addressFilter, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setNameFilter('');
    setAddressFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setSelectedRating(store.userRating || 5);
    setIsModalOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedStore) return;
    setIsSubmittingRating(true);

    try {
      const res = await ratingService.submitRating({
        storeId: selectedStore.id,
        rating: selectedRating,
      });

      success(res.message || 'Rating submitted successfully!');
      setIsModalOpen(false);
      // Refresh list to show updated overall rating & user rating
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit rating.';
      error(msg);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Store className="w-6 h-6 text-blue-600" />
          <span>Browse & Rate Stores</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Find registered stores, view overall customer ratings, and submit or update your ratings.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* General Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Store Name Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by Store Name..."
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Store Address Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by Store Address..."
              value={addressFilter}
              onChange={(e) => {
                setAddressFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(search || nameFilter || addressFilter || sortBy !== 'createdAt') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Searching stores..." />
        ) : stores.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No stores found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try modifying your search query or address filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Store Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center">
                      <span>Store Address</span>
                      {renderSortIcon('address')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center">
                      <span>Overall Rating</span>
                      {renderSortIcon('rating')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Your Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm truncate" title={store.address}>
                      {store.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={store.overallRating} size="sm" />
                        <span className="text-xs text-slate-400">
                          ({store.totalRatings || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {store.userRating ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-xs">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                          <span>{store.userRating} / 5</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {store.userRating ? (
                        <button
                          onClick={() => openRatingModal(store)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Modify Rating</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openRatingModal(store)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Submit Rating</span>
                        </button>
                      )}
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

      {/* Interactive Rating Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStore?.userRating ? 'Modify Your Rating' : 'Submit Store Rating'}
        maxWidth="max-w-md"
      >
        {selectedStore && (
          <div className="space-y-5 text-center">
            <div>
              <h4 className="text-base font-bold text-slate-900">{selectedStore.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedStore.address}</p>
            </div>

            <div className="py-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select your rating (1 to 5 stars)
              </p>
              <div className="py-2">
                <StarRating
                  rating={selectedRating}
                  size="xl"
                  interactive={true}
                  onChange={(val) => setSelectedRating(val)}
                />
              </div>
              <p className="text-sm font-extrabold text-blue-600">
                {selectedRating} out of 5 Stars
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmittingRating
                    ? 'Saving...'
                    : selectedStore.userRating
                    ? 'Update Rating'
                    : 'Submit Rating'}
                </span>
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

export default BrowseStores;
