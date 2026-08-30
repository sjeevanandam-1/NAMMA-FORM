import { z } from 'zod';
import { ROLES, BUYER_TYPES } from '../constants/roles.js';

export const registerFarmerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  village: z.string().min(2, 'Village is required'),
  farmLocation: z.string().min(2, 'Farm location is required'),
  landAreaAcre: z.number().positive('Land area must be greater than 0'),
  soilType: z.string().min(2, 'Soil type is required'),
  irrigationType: z.string().min(2, 'Irrigation type is required'),
  mainCrops: z.union([z.array(z.string()), z.string()]),
});

export const registerBuyerSchema = z.object({
  name: z.string().min(2, 'Contact person name is required'),
  companyName: z.string().min(2, 'Company or Business name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessType: z.enum([
    BUYER_TYPES.WHOLESALER,
    BUYER_TYPES.RETAILER,
    BUYER_TYPES.EXPORTER,
    BUYER_TYPES.PROCESSOR,
    BUYER_TYPES.AGGREGATOR,
  ]),
  gstNumber: z.string().optional(),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  location: z.string().min(2, 'Business location is required'),
  requiredCrops: z.union([z.array(z.string()), z.string()]),
});

export const registerGovernmentSchema = z.object({
  name: z.string().min(2, 'Official name is required'),
  officialId: z.string().min(3, 'Official Government ID is required'),
  department: z.string().min(2, 'Department name is required'),
  designation: z.string().min(2, 'Designation is required'),
  email: z.string().email('Official email address is required'),
  phone: z.string().min(10, 'Mobile number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  state: z.string().min(2, 'State jurisdiction is required'),
  district: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => !!(data.identifier || data.email), {
  message: 'Email or mobile number is required',
  path: ['email'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
