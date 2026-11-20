import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, MapPin, User, ArrowLeft, Plus } from 'lucide-react';
import { adminCreateStoreSchema } from '../../schemas/validationSchemas';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';

export const AdminAddStore = () => {
  const [storeOwners, setStoreOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminCreateStoreSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      ownerId: '',
    },
  });

  const addressValue = watch('address') || '';

  // Fetch store owners so admin can optionally associate an owner
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await adminService.getUsers({ role: 'STORE_OWNER', limit: 100 });
        if (res.success && res.data?.users) {
          setStoreOwners(res.data.users);
        }
      } catch (err) {
        // Soft fail
      } finally {
        setLoadingOwners(false);
      }
    };

    fetchOwners();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId ? data.ownerId : null,
      };

      const res = await adminService.createStore(payload);
      success(res.message || 'Store created successfully!');
      navigate('/admin/stores');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create store.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div>
        <Link
          to="/admin/stores"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stores List</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Store className="w-6 h-6 text-blue-600" />
          <span>Add New Store</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Register a new business store on the platform and optionally link a store owner.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Store Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Store Name
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Store className="h-5 w-5" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Apex Super Tech Store"
                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.name
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Store Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Store Contact Email
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="contact@storename.com"
                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.email
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Store Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Store Physical Address
              </label>
              <span className="text-[11px] text-slate-400">{addressValue.length}/400 max</span>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute top-3 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-5 w-5" />
              </div>
              <textarea
                rows={3}
                {...register('address')}
                placeholder="Enter complete street address of the store..."
                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.address
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.address.message}</p>
            )}
          </div>

          {/* Assign Store Owner (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Associate Store Owner (Optional)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <select
                {...register('ownerId')}
                className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white"
              >
                <option value="">-- No Owner Assigned (Unclaimed Store) --</option>
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Selecting a store owner enables them to view their store ratings dashboard.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Store...' : 'Create Store'}</span>
            </button>

            <Link
              to="/admin/stores"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddStore;
