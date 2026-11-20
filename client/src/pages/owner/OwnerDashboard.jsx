import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Star, Users, ArrowUpRight, Award, MapPin, Mail } from 'lucide-react';
import { ownerService } from '../../services/ownerService';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await ownerService.getDashboard();
        if (res.success && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        error('Failed to load store owner dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [error]);

  if (loading) {
    return <LoadingSpinner text="Loading your store dashboard..." />;
  }

  if (!dashboardData?.store) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto my-12">
        <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">No Store Associated Yet</h3>
        <p className="text-sm text-slate-500 mt-2">
          Your account does not have a registered store linked to it. Please contact the System Administrator to assign your store location.
        </p>
      </div>
    );
  }

  const { store, averageRating, totalRatings, distribution } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Store className="w-6 h-6 text-amber-600" />
          <span>Store Owner Dashboard</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your customer satisfaction and store performance ratings
        </p>
      </div>

      {/* Store Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-2">
            Store Profile
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900">{store.name}</h3>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{store.email}</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{store.address}</span>
            </span>
          </div>
        </div>

        <Link
          to="/owner/ratings"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm shadow-sm hover:bg-amber-700 transition self-start md:self-auto"
        >
          <span>View Customer Reviews</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Rating Metrics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric 1: Average Rating */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Average Store Rating
          </p>
          <div className="text-5xl font-black text-slate-900 tracking-tight">
            {averageRating.toFixed(1)}
          </div>
          <div className="mt-3">
            <StarRating rating={averageRating} size="lg" />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Calculated dynamically from {totalRatings} customer rating{totalRatings !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Metric 2: Total Customers Rated */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Users className="w-7 h-7" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Verified Customers
          </p>
          <p className="text-4xl font-extrabold text-slate-900 mt-1">{totalRatings}</p>
          <p className="mt-2 text-xs text-slate-400">Distinct customer ratings recorded</p>
        </div>

        {/* Metric 3: Star Rating Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Rating Distribution
          </p>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution ? distribution[star] || 0 : 0;
              const percent = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

              return (
                <div key={star} className="flex items-center text-xs space-x-2">
                  <span className="w-10 font-bold text-slate-600 flex items-center space-x-0.5">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
