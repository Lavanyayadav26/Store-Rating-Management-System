import React, { useState, useEffect, useCallback } from 'react';
import { Star, Search, ArrowUpDown, ArrowUp, ArrowDown, User, RotateCcw } from 'lucide-react';
import { ownerService } from '../../services/ownerService';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export const OwnerRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { error } = useToast();

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      };

      const res = await ownerService.getRatings(params);
      if (res.success && res.data) {
        setRatings(res.data.ratings);
        setStoreInfo(res.data.store);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      error('Failed to load store ratings.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

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
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-600 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-600 ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span>Customer Ratings for {storeInfo?.name || 'Your Store'}</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Showing all {totalCount} verified customer ratings for your store.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </div>

        {search && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear search</span>
          </button>
        )}
      </div>

      {/* Ratings Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching store ratings..." />
        ) : ratings.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No ratings found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your store has not received ratings matching the criteria yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Customer Name
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Customer Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center">
                      <span>Submitted Rating</span>
                      {renderSortIcon('rating')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      <span>Date Submitted</span>
                      {renderSortIcon('createdAt')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                          {r.userName[0].toUpperCase()}
                        </div>
                        <span>{r.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {r.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-xs font-bold text-slate-700">
                          {r.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
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
    </div>
  );
};

export default OwnerRatings;
