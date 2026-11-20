import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Star, Award, ArrowUpRight, Search, ThumbsUp } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { ratingService } from '../../services/ratingService';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalStores, setTotalStores] = useState(0);
  const [myRatingsCount, setMyRatingsCount] = useState(0);
  const [featuredStores, setFeaturedStores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, ratingsRes] = await Promise.all([
          storeService.getStores({ limit: 4, sortBy: 'rating', sortOrder: 'desc' }),
          ratingService.getMyRatings({ limit: 1 }),
        ]);

        if (storesRes.success && storesRes.data) {
          setTotalStores(storesRes.data.pagination.total);
          setFeaturedStores(storesRes.data.stores);
        }

        if (ratingsRes.success && ratingsRes.data) {
          setMyRatingsCount(ratingsRes.data.pagination.total);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading customer dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
            Welcome back
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, {user?.name}!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Discover registered businesses, share your shopping experiences, and submit authentic ratings to help the community.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/user/stores"
              className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm shadow-md hover:bg-blue-50 transition"
            >
              Browse & Rate Stores
            </Link>
            <Link
              to="/user/my-ratings"
              className="px-5 py-2.5 rounded-xl bg-blue-500/30 text-white font-semibold text-sm border border-white/20 hover:bg-blue-500/40 backdrop-blur-md transition"
            >
              View My Submitted Ratings
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stores Available
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalStores}</p>
            <p className="text-xs text-slate-400">Stores ready for your feedback</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-7 h-7 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Submitted Ratings
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{myRatingsCount}</p>
            <p className="text-xs text-slate-400">Stores you have rated so far</p>
          </div>
        </div>
      </div>

      {/* Top-Rated Stores Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Top Rated Stores
            </h3>
            <p className="text-xs text-slate-500">Highest customer-rated stores on RateSphere</p>
          </div>
          <Link
            to="/user/stores"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All Stores</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{store.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{store.address}</p>
                </div>
                <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="text-xs font-bold text-amber-900">{store.overallRating.toFixed(1)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {store.userRating ? (
                    <span className="text-emerald-600 font-semibold">
                      Your rating: {store.userRating} ★
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">You haven't rated this yet</span>
                  )}
                </div>
                <Link
                  to="/user/stores"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {store.userRating ? 'Modify Rating' : 'Rate Store'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
