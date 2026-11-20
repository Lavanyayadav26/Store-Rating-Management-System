import { z } from 'zod';

// Password rule: 8-16 characters, at least 1 uppercase letter, at least 1 special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(16, 'Password must be at most 16 characters long')
  .regex(
    passwordRegex,
    'Password must include at least one uppercase letter and one special character'
  );

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(7, 'Name must be at least 7 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format'),
  address: z
    .string()
    .trim()
    .max(400, 'Address must not exceed 400 characters')
    .optional()
    .nullable()
    .default(''),
  password: passwordValidation,
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: passwordValidation,
  confirmNewPassword: z
    .string({ required_error: 'Confirm new password is required' })
    .min(1, 'Confirm new password is required'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New password and confirm password do not match',
  path: ['confirmNewPassword'],
});

export const adminCreateUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(7, 'Name must be at least 7 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format'),
  address: z
    .string()
    .trim()
    .max(400, 'Address must not exceed 400 characters')
    .optional()
    .nullable()
    .default(''),
  password: passwordValidation,
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'], {
    required_error: 'Role is required and must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER',
  }),
});

export const adminCreateStoreSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .trim()
    .min(3, 'Store name must be at least 3 characters long')
    .max(60, 'Store name must not exceed 60 characters'),
  email: z
    .string({ required_error: 'Store email is required' })
    .trim()
    .email('Invalid email address format'),
  address: z
    .string({ required_error: 'Store address is required' })
    .trim()
    .min(1, 'Address is required')
    .max(400, 'Store address must not exceed 400 characters'),
  ownerId: z
    .string()
    .uuid('Invalid owner ID format')
    .optional()
    .nullable(),
});

export const ratingSchema = z.object({
  storeId: z.string({ required_error: 'Store ID is required' }).uuid('Invalid store ID format'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

export const updateRatingSchema = z.object({
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});
