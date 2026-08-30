"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerGovernmentSchema = exports.registerBuyerSchema = exports.registerFarmerSchema = void 0;
const zod_1 = require("zod");
const roles_js_1 = require("../constants/roles.js");
exports.registerFarmerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    state: zod_1.z.string().min(2, 'State is required'),
    district: zod_1.z.string().min(2, 'District is required'),
    village: zod_1.z.string().min(2, 'Village is required'),
    farmLocation: zod_1.z.string().min(2, 'Farm location is required'),
    landAreaAcre: zod_1.z.number().positive('Land area must be greater than 0'),
    soilType: zod_1.z.string().min(2, 'Soil type is required'),
    irrigationType: zod_1.z.string().min(2, 'Irrigation type is required'),
    mainCrops: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]),
});
exports.registerBuyerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Contact person name is required'),
    companyName: zod_1.z.string().min(2, 'Company or Business name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    businessType: zod_1.z.enum([
        roles_js_1.BUYER_TYPES.WHOLESALER,
        roles_js_1.BUYER_TYPES.RETAILER,
        roles_js_1.BUYER_TYPES.EXPORTER,
        roles_js_1.BUYER_TYPES.PROCESSOR,
        roles_js_1.BUYER_TYPES.AGGREGATOR,
    ]),
    gstNumber: zod_1.z.string().optional(),
    state: zod_1.z.string().min(2, 'State is required'),
    district: zod_1.z.string().min(2, 'District is required'),
    location: zod_1.z.string().min(2, 'Business location is required'),
    requiredCrops: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]),
});
exports.registerGovernmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Official name is required'),
    officialId: zod_1.z.string().min(3, 'Official Government ID is required'),
    department: zod_1.z.string().min(2, 'Department name is required'),
    designation: zod_1.z.string().min(2, 'Designation is required'),
    email: zod_1.z.string().email('Official email address is required'),
    phone: zod_1.z.string().min(10, 'Mobile number is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    state: zod_1.z.string().min(2, 'State jurisdiction is required'),
    district: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, 'Password is required'),
}).refine((data) => !!(data.identifier || data.email), {
    message: 'Email or mobile number is required',
    path: ['email'],
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
