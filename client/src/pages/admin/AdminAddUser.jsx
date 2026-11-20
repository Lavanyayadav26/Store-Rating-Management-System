import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, MapPin, Lock, Shield, ArrowLeft, Plus, Eye, EyeOff } from 'lucide-react';
import { adminCreateUserSchema } from '../../schemas/validationSchemas';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';

export const AdminAddUser = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'NORMAL_USER',
    },
  });

  const nameValue = watch('name') || '';
  const addressValue = watch('address') || '';

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await adminService.createUser(data);
      success(res.message || 'User created successfully!');
      navigate('/admin/users');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/users"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users List</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <User className="w-6 h-6 text-indigo-600" />
          <span>Add New User</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Create an administrator, normal user, or store owner account.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Account Role
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Shield className="h-5 w-5" />
              </div>
              <select
                {...register('role')}
                className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition bg-white font-medium"
              >
                <option value="NORMAL_USER">Normal User (Can browse & rate stores)</option>
                <option value="STORE_OWNER">Store Owner (Manages store dashboard)</option>
                <option value="SYSTEM_ADMIN">System Administrator (Full privileges)</option>
              </select>
            </div>
            {errors.role && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.role.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <span className="text-[11px] text-slate-400">
                {nameValue.length}/60 (min 20 chars)
              </span>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Christopher Nolan Alexander"
                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.name
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="user@example.com"
                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.email
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Address
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
                placeholder="Enter user physical address..."
                className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.address
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.address.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Temporary Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.password
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              8-16 characters, at least 1 uppercase letter and 1 special character.
            </p>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating User...' : 'Create User'}</span>
            </button>

            <Link
              to="/admin/users"
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

export default AdminAddUser;
