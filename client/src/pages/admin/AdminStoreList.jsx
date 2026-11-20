import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  RotateCcw,
  User,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export const AdminStoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { error } = useToast();

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        name: nameFilter,
        email: emailFilter,
        address: addressFilter,
        sortBy,
        sortOrder,
      };

      const res = await adminService.getStores(params);
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
  }, [page, limit, search, nameFilter, emailFilter, addressFilter, sortBy, sortOrder, error]);

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
    setEmailFilter('');
    setAddressFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Store className="w-6 h-6 text-blue-600" />
            <span>Registered Stores</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Total of {totalCount} registered stores across all regions
          </p>
        </div>

        <Link
          to="/admin/stores/add"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </Link>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* General Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Name Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Email Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Address Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by address..."
              value={addressFilter}
              onChange={(e) => {
                setAddressFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(search || nameFilter || emailFilter || addressFilter || sortBy !== 'createdAt') && (
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

      {/* Stores Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching stores..." />
        ) : stores.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No stores found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or add a new store.
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
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      {renderSortIcon('email')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center">
                      <span>Address</span>
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
                    Store Owner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {store.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={store.address}>
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
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {store.owner ? (
                        <div className="flex items-center space-x-1.5 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800">{store.owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Unassigned</span>
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
    </div>
  );
};

export default AdminStoreList;
