import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { changePasswordSchema } from '../../schemas/validationSchemas';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const ChangePasswordPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { changePassword } = useAuth();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      success(res.message || 'Password changed successfully!');
      reset();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <KeyRound className="w-6 h-6 text-blue-600" />
          <span>Change Password</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ensure your account stays secure by choosing a strong password.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Current Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                placeholder="Enter current password"
                className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.currentPassword
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="Enter new password"
                className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.newPassword
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              8-16 characters, at least 1 uppercase letter and 1 special character.
            </p>
            {errors.newPassword && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmNewPassword')}
                placeholder="Confirm new password"
                className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm border rounded-xl focus:outline-none transition ${
                  errors.confirmNewPassword
                    ? 'border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Password</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
