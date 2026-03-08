import { z } from 'zod';

export const shopDataSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  businessRegistration: z.string().min(1, 'Business registration number is required'),
  shopAddress: z.string().min(1, 'Shop address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),
  tin: z.string().min(1, 'TIN is required'),
  vat: z.string().min(1, 'VAT registration number is required'),
  vatDate: z.string().min(1, 'VAT registration date is required'),
});

export const ownerDataSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const pricingDataSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
});

export type ShopDataForm = z.infer<typeof shopDataSchema>;
export type OwnerDataForm = z.infer<typeof ownerDataSchema>;
export type PricingDataForm = z.infer<typeof pricingDataSchema>;
