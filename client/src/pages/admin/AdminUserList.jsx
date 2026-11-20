import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  RotateCcw,
  Eye,
  Shield,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import { useToast } from '../../hooks/useToast';

export const AdminUserList = () => {
  const [users, setUsers] = useState([]);
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
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // User Details Modal state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { error } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        name: nameFilter,
        email: emailFilter,
        address: addressFilter,
        role: roleFilter,
        sortBy,
        sortOrder,
      };

      const res = await adminService.getUsers(params);
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      error('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, nameFilter, emailFilter, addressFilter, roleFilter, sortBy, sortOrder, error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    setRoleFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleViewDetails = async (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await adminService.getUserById(userId);
      if (res.success && res.data?.user) {
        setUserDetails(res.data.user);
      }
    } catch (err) {
      error('Failed to fetch user details.');
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 ml-1" />
    );
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Administrator
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Store Owner
          </span>
        );
      case 'NORMAL_USER':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Normal User
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Platform Users</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Total of {totalCount} registered users across all roles
          </p>
        </div>

        <Link
          to="/admin/users/add"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </Link>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              <option value="">All Roles</option>
              <option value="NORMAL_USER">Normal Users</option>
              <option value="STORE_OWNER">Store Owners</option>
              <option value="SYSTEM_ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(search || nameFilter || emailFilter || addressFilter || roleFilter || sortBy !== 'createdAt') && (
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching users..." />
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No users found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or add a new user.
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
                      <span>Name</span>
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
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      <span>Role</span>
                      {renderSortIcon('role')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Store Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={user.address}>
                      {user.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'STORE_OWNER' ? (
                        user.storeRating !== null ? (
                          <div className="flex items-center space-x-1.5">
                            <StarRating rating={user.storeRating} size="sm" />
                            <span className="text-xs font-semibold text-slate-700">
                              ({user.storeName})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No store assigned</span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(user.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
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

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Account Details"
        maxWidth="max-w-lg"
      >
        {loadingDetails ? (
          <LoadingSpinner text="Loading details..." size="sm" />
        ) : userDetails ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{userDetails.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm text-slate-700 mt-0.5">{userDetails.email}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Physical Address
              </p>
              <p className="text-sm text-slate-700 mt-0.5">{userDetails.address}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Platform Role
              </p>
              <div className="mt-1">{renderRoleBadge(userDetails.role)}</div>
            </div>

            {/* If Store Owner, show their store rating & details */}
            {userDetails.role === 'STORE_OWNER' && (
              <div className="mt-4 pt-4 border-t border-slate-100 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/50">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Associated Store & Rating
                </p>
                {userDetails.store ? (
                  <div className="mt-2 space-y-1.5 text-xs text-amber-900">
                    <p>
                      <strong className="font-semibold">Store Name:</strong> {userDetails.store.name}
                    </p>
                    <p>
                      <strong className="font-semibold">Store Address:</strong> {userDetails.store.address}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <strong className="font-semibold">Average Rating:</strong>
                      <StarRating rating={userDetails.store.averageRating} size="sm" />
                      <span className="text-slate-500 font-medium">
                        ({userDetails.store.totalRatings} total reviews)
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 italic mt-1">
                    No store is currently associated with this store owner.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminUserList;
