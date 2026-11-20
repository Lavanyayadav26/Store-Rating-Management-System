import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must not exceed 16 characters')
  .regex(
    passwordRegex,
    'Must include at least one uppercase letter and one special character'
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(7, 'Name must be at least 7 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: passwordValidation,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmNewPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmNewPassword'],
  });

export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(7, 'Name must be at least 7 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  address: z
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .optional(),
  password: passwordValidation,
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'], {
    required_error: 'Role is required',
  }),
});

export const adminCreateStoreSchema = z.object({
  name: z
    .string()
    .min(3, 'Store name must be at least 3 characters long')
    .max(60, 'Store name must not exceed 60 characters'),
  email: z
    .string()
    .min(1, 'Store email is required')
    .email('Please enter a valid email address'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
  ownerId: z.string().optional().nullable(),
});
