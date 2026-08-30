"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../config/prisma.js");
const token_js_1 = require("../utils/token.js");
class OTPService {
    /**
     * Send 6-digit OTP to mobile number
     */
    static async sendOTP(phone) {
        const cleanPhone = phone.trim();
        // Check rate limit: Max 3 OTP requests in last 15 minutes
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentRequests = await prisma_js_1.prisma.oTPVerification.count({
            where: {
                phone: cleanPhone,
                createdAt: { gte: fifteenMinsAgo },
            },
        });
        if (recentRequests >= 5) {
            return {
                success: false,
                configured: true,
                message: 'Too many OTP requests. Please wait 15 minutes before trying again.',
            };
        }
        // Generate secure 6-digit numeric OTP
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const otpHash = await bcryptjs_1.default.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
        // Invalidate prior active OTPs for this phone
        await prisma_js_1.prisma.oTPVerification.deleteMany({
            where: { phone: cleanPhone },
        });
        // Save hashed OTP in database
        await prisma_js_1.prisma.oTPVerification.create({
            data: {
                phone: cleanPhone,
                otpHash,
                expiresAt,
            },
        });
        // Check if real SMS gateway is configured
        const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER);
        const fast2smsConfigured = !!process.env.FAST2SMS_API_KEY;
        if (!twilioConfigured && !fast2smsConfigured) {
            // In development when no SMS API key is entered, log delivery to server audit log
            if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_OTP === 'true') {
                console.log(`[SMS Gateway Simulated Delivery to ${cleanPhone}]: OTP is ${otp}`);
                return {
                    success: true,
                    configured: false,
                    message: 'Phone verification code sent. (SMS Service running in sandbox mode).',
                    expiresInSeconds: 300,
                };
            }
            return {
                success: false,
                configured: false,
                message: 'Phone verification service is not configured. Please set SMS provider credentials in the server environment.',
            };
        }
        // Send via Twilio
        if (twilioConfigured) {
            try {
                const sid = process.env.TWILIO_ACCOUNT_SID;
                const token = process.env.TWILIO_AUTH_TOKEN;
                const from = process.env.TWILIO_PHONE_NUMBER;
                const authHeader = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');
                const params = new URLSearchParams({
                    To: cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`,
                    From: from,
                    Body: `Your Namma Farm verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
                });
                const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                        Authorization: authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                });
                if (!res.ok) {
                    throw new Error('Twilio SMS delivery failed');
                }
                return {
                    success: true,
                    configured: true,
                    message: 'Verification code sent to your mobile phone via SMS.',
                    expiresInSeconds: 300,
                };
            }
            catch (err) {
                console.error('[Twilio Error]:', err);
                return {
                    success: false,
                    configured: true,
                    message: 'Failed to deliver SMS. Please check mobile number format.',
                };
            }
        }
        // Send via Fast2SMS
        if (fast2smsConfigured) {
            try {
                const apiKey = process.env.FAST2SMS_API_KEY;
                const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                    method: 'POST',
                    headers: {
                        authorization: apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        route: 'otp',
                        variables_values: otp,
                        numbers: cleanPhone.replace(/\D/g, '').slice(-10),
                    }),
                });
                if (!res.ok) {
                    throw new Error('Fast2SMS gateway error');
                }
                return {
                    success: true,
                    configured: true,
                    message: 'Verification code sent to your mobile phone via SMS.',
                    expiresInSeconds: 300,
                };
            }
            catch (err) {
                console.error('[Fast2SMS Error]:', err);
                return {
                    success: false,
                    configured: true,
                    message: 'Failed to deliver SMS via provider.',
                };
            }
        }
        return {
            success: false,
            configured: false,
            message: 'Phone verification service is not configured.',
        };
    }
    /**
     * Verify entered 6-digit OTP
     */
    static async verifyOTP(phone, otp) {
        const cleanPhone = phone.trim();
        const cleanOTP = otp.trim();
        const record = await prisma_js_1.prisma.oTPVerification.findFirst({
            where: {
                phone: cleanPhone,
                isVerified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!record) {
            return {
                success: false,
                message: 'No active OTP found or code has expired. Please request a new OTP.',
            };
        }
        if (record.attempts >= 3) {
            await prisma_js_1.prisma.oTPVerification.delete({ where: { id: record.id } });
            return {
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new OTP.',
            };
        }
        // Increment attempt count
        await prisma_js_1.prisma.oTPVerification.update({
            where: { id: record.id },
            data: { attempts: record.attempts + 1 },
        });
        const isMatch = await bcryptjs_1.default.compare(cleanOTP, record.otpHash);
        if (!isMatch) {
            return {
                success: false,
                message: 'Incorrect verification code. Please try again.',
            };
        }
        // Mark as verified
        await prisma_js_1.prisma.oTPVerification.update({
            where: { id: record.id },
            data: { isVerified: true },
        });
        // Generate signed temporary verificationToken valid for 15 mins
        const verificationToken = (0, token_js_1.generateAccessToken)({
            userId: `phone_${cleanPhone}`,
            role: 'PHONE_VERIFIED',
            email: cleanPhone,
        });
        return {
            success: true,
            message: 'Mobile number verified successfully.',
            verificationToken,
        };
    }
}
exports.OTPService = OTPService;
