import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import {
  registerFarmerSchema,
  registerBuyerSchema,
  registerGovernmentSchema,
  loginSchema,
} from '../validations/auth.validation.js';
import { ROLES } from '../constants/roles.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { AuditService } from '../services/audit.service.js';
import { OTPService } from '../services/otp.service.js';

export class AuthController {
  /**
   * Register as Farmer
   */
  static async registerFarmer(req: Request, res: Response): Promise<void> {
    try {
      const data = registerFarmerSchema.parse(req.body);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { phone: data.phone }],
        },
      });

      if (existingUser) {
        sendError(res, 'User with this email or mobile number already exists', 400);
        return;
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const mainCropsString = Array.isArray(data.mainCrops)
        ? JSON.stringify(data.mainCrops)
        : data.mainCrops;

      const user = await prisma.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          name: data.name,
          passwordHash,
          role: ROLES.FARMER,
          isVerified: true, // Mark verified for demo / dev ease
          farmerProfile: {
            create: {
              state: data.state,
              district: data.district,
              village: data.village,
              farmLocation: data.farmLocation,
              landAreaAcre: data.landAreaAcre,
              soilType: data.soilType,
              irrigationType: data.irrigationType,
              mainCrops: mainCropsString,
            },
          },
          trustScore: {
            create: {
              score: 85,
              verifiedIdentityScore: 25,
              completedOrdersScore: 30,
              ratingScore: 30,
              explanation: 'Account verified with agricultural land registry details.',
            },
          },
        },
        include: {
          farmerProfile: true,
          trustScore: true,
        },
      });

      // Create first default Farm record
      if (user.farmerProfile) {
        await prisma.farm.create({
          data: {
            farmerProfileId: user.farmerProfile.id,
            farmName: `${data.name}'s Main Farm`,
            location: data.farmLocation,
            landAreaAcre: data.landAreaAcre,
            soilType: data.soilType,
            irrigation: data.irrigationType,
            crops: mainCropsString,
          },
        });
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      await AuditService.log({
        userId: user.id,
        action: 'REGISTER_FARMER',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email, name: user.name, state: data.state },
      });

      // Never return passwordHash
      const { passwordHash: _, ...safeUser } = user;

      sendSuccess(
        res,
        { user: safeUser, accessToken, refreshToken },
        'Farmer account registered successfully',
        201
      );
    } catch (err: any) {
      sendError(res, err.message || 'Registration failed', 400, err);
    }
  }

  /**
   * Register as Buyer
   */
  static async registerBuyer(req: Request, res: Response): Promise<void> {
    try {
      const data = registerBuyerSchema.parse(req.body);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { phone: data.phone }],
        },
      });

      if (existingUser) {
        sendError(res, 'User with this email or mobile number already exists', 400);
        return;
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const reqCropsString = Array.isArray(data.requiredCrops)
        ? JSON.stringify(data.requiredCrops)
        : data.requiredCrops;

      const user = await prisma.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          name: data.name,
          passwordHash,
          role: ROLES.BUYER,
          isVerified: true,
          buyerProfile: {
            create: {
              companyName: data.companyName,
              businessType: data.businessType,
              gstNumber: data.gstNumber || null,
              state: data.state,
              district: data.district,
              location: data.location,
              requiredCrops: reqCropsString,
            },
          },
          trustScore: {
            create: {
              score: 88,
              verifiedIdentityScore: 25,
              completedOrdersScore: 33,
              ratingScore: 30,
              explanation: 'Verified business profile with registered trade credentials.',
            },
          },
        },
        include: {
          buyerProfile: true,
          trustScore: true,
        },
      });

      const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      await AuditService.log({
        userId: user.id,
        action: 'REGISTER_BUYER',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email, companyName: data.companyName },
      });

      const { passwordHash: _, ...safeUser } = user;

      sendSuccess(
        res,
        { user: safeUser, accessToken, refreshToken },
        'Buyer account registered successfully',
        201
      );
    } catch (err: any) {
      sendError(res, err.message || 'Registration failed', 400, err);
    }
  }

  /**
   * Register as Government Official
   */
  static async registerGovernment(req: Request, res: Response): Promise<void> {
    try {
      const data = registerGovernmentSchema.parse(req.body);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { phone: data.phone }],
        },
      });

      if (existingUser) {
        sendError(res, 'Official with this email or mobile number already exists', 400);
        return;
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          name: data.name,
          passwordHash,
          role: ROLES.GOVERNMENT_OFFICIAL,
          isVerified: true,
          govProfile: {
            create: {
              officialId: data.officialId,
              department: data.department,
              designation: data.designation,
              state: data.state,
              district: data.district || null,
            },
          },
        },
        include: {
          govProfile: true,
        },
      });

      const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      const { passwordHash: _, ...safeUser } = user;

      sendSuccess(
        res,
        { user: safeUser, accessToken, refreshToken },
        'Government Official account registered successfully',
        201
      );
    } catch (err: any) {
      sendError(res, err.message || 'Government registration failed', 400, err);
    }
  }

  /**
   * Login (Farmer, Buyer, Gov, Admin)
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const identifier = (data.identifier || data.email || '').trim();

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
        include: {
          farmerProfile: true,
          buyerProfile: true,
          govProfile: true,
          trustScore: true,
        },
      });

      if (!user) {
        sendError(res, 'Invalid email/mobile number or password', 401);
        return;
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isPasswordValid) {
        sendError(res, 'Invalid email/mobile number or password', 401);
        return;
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      await AuditService.log({
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email, role: user.role },
      });

      const { passwordHash: _, refreshToken: __, ...safeUser } = user;

      sendSuccess(
        res,
        { user: safeUser, accessToken, refreshToken },
        'Logged in successfully'
      );
    } catch (err: any) {
      sendError(res, err.message || 'Login failed', 400, err);
    }
  }

  /**
   * Forgot Password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, 'Email is required', 400);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        sendSuccess(res, {
          message: 'If your account exists, a password reset token has been generated.',
        });
        return;
      }

      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(24).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      await AuditService.log({
        userId: user.id,
        action: 'FORGOT_PASSWORD_REQUEST',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email },
      });

      sendSuccess(res, {
        message: 'Password reset token generated successfully.',
        resetToken,
      });
    } catch (err: any) {
      sendError(res, err.message || 'Forgot password request failed', 400);
    }
  }

  /**
   * Reset Password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword || newPassword.length < 6) {
        sendError(res, 'Valid reset token and password of min 6 characters are required', 400);
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        sendError(res, 'Invalid or expired password reset token', 400);
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      await AuditService.log({
        userId: user.id,
        action: 'PASSWORD_RESET_SUCCESS',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email },
      });

      sendSuccess(res, null, 'Password reset successfully. You can now login with your new password.');
    } catch (err: any) {
      sendError(res, err.message || 'Password reset failed', 400);
    }
  }

  /**
   * Refresh Token
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendError(res, 'Refresh token is required', 400);
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        sendError(res, 'Invalid refresh token', 401);
        return;
      }

      const newAccessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      sendSuccess(
        res,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        'Token refreshed'
      );
    } catch (err) {
      sendError(res, 'Expired or invalid refresh token', 401, err);
    }
  }

  /**
   * Get Current User Profile
   */
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          farmerProfile: {
            include: {
              farms: true,
            },
          },
          buyerProfile: true,
          govProfile: true,
          trustScore: true,
        },
      });

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      const { passwordHash: _, refreshToken: __, ...safeUser } = user;
      sendSuccess(res, safeUser);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch user', 500);
    }
  }

  /**
   * Send Phone OTP
   */
  static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body;
      if (!phone || phone.trim().length < 10) {
        sendError(res, 'Valid 10-digit mobile number is required', 400);
        return;
      }

      const result = await OTPService.sendOTP(phone);
      if (!result.success && result.configured) {
        sendError(res, result.message, 400);
        return;
      }
      if (!result.success && !result.configured) {
        sendError(res, result.message, 503);
        return;
      }

      sendSuccess(res, result, result.message);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to send verification OTP', 500);
    }
  }

  /**
   * Verify Phone OTP
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        sendError(res, 'Mobile number and 6-digit verification code are required', 400);
        return;
      }

      const result = await OTPService.verifyOTP(phone, otp);
      if (!result.success) {
        sendError(res, result.message, 400);
        return;
      }

      sendSuccess(res, result, result.message);
    } catch (err: any) {
      sendError(res, err.message || 'OTP verification failed', 400);
    }
  }

  /**
   * Logout
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user?.id) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { refreshToken: null },
        });
      }
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err: any) {
      sendError(res, err.message || 'Logout failed', 500);
    }
  }
}
