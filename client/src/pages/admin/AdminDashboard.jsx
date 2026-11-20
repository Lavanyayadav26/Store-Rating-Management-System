import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Star, ArrowUpRight, Plus, ShieldCheck, ShoppingCart } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [error]);

  if (loading) {
    return <LoadingSpinner text="Loading administrator dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      desc: 'Registered platform users',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      link: '/admin/users',
      actionText: 'View Users',
    },
    {
      title: 'Total Stores',
      value: stats.totalStores,
      desc: 'Active registered stores',
      icon: Store,
      color: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      link: '/admin/stores',
      actionText: 'Manage Stores',
    },
    {
      title: 'Total Ratings Submitted',
      value: stats.totalRatings,
      desc: 'Customer verified ratings',
      icon: Star,
      color: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      link: '/admin/stores',
      actionText: 'Explore Stores',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>System Administrator Overview</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time platform statistics and administrative control center
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/stores/add"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </Link>
          <Link
            to="/admin/users/add"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-xs hover:bg-slate-50 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md ${card.shadow}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <Link
                  to={card.link}
                  className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 flex items-center space-x-1 transition"
                >
                  <span>{card.actionText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-400">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Stores</h3>
              <p className="text-xs text-slate-500">View ratings, assign store owners, and register new locations</p>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Link
              to="/admin/stores"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Browse All Stores
            </Link>
            <Link
              to="/admin/stores/add"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
            >
              + Create Store
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage User Accounts</h3>
              <p className="text-xs text-slate-500">Create and oversee administrators, store owners, and customer users</p>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Link
              to="/admin/users"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Browse All Users
            </Link>
            <Link
              to="/admin/users/add"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
            >
              + Create User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
