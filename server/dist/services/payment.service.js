"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = exports.DevMockPaymentProvider = void 0;
const prisma_js_1 = require("../config/prisma.js");
const status_js_1 = require("../constants/status.js");
/**
 * Development Mock Payment Provider
 * Simulates real banking, UPI, Escrow, and Razorpay/Stripe authorization.
 */
class DevMockPaymentProvider {
    async processPayment(input) {
        // Generate secure mock transaction reference
        const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const isSuccess = true; // In development mock, default to success
        const status = isSuccess ? status_js_1.PAYMENT_STATUS.PAID : status_js_1.PAYMENT_STATUS.FAILED;
        const payment = await prisma_js_1.prisma.payment.create({
            data: {
                orderId: input.orderId,
                transactionId,
                amount: input.amount,
                currency: input.currency || 'INR',
                paymentMethod: input.paymentMethod,
                status,
                provider: 'MOCK_DEV_PAYMENT_GATEWAY',
                providerRef: `MOCK_REF_${Math.random().toString(36).substring(7).toUpperCase()}`,
                paidAt: isSuccess ? new Date() : null,
            },
        });
        if (isSuccess) {
            await prisma_js_1.prisma.transaction.create({
                data: {
                    paymentId: payment.id,
                    type: 'PAYMENT',
                    amount: input.amount,
                    fee: 0,
                    netAmount: input.amount,
                    status: 'SUCCESS',
                    referenceId: transactionId,
                    notes: `Payment completed successfully via ${input.paymentMethod}`,
                },
            });
        }
        return {
            success: isSuccess,
            paymentId: payment.id,
            transactionId,
            status,
            message: 'Payment processed and verified successfully.',
            paidAt: payment.paidAt || undefined,
        };
    }
    async refundPayment(paymentId, amount) {
        const payment = await prisma_js_1.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new Error('Payment record not found');
        }
        const refundAmount = amount || payment.amount;
        await prisma_js_1.prisma.payment.update({
            where: { id: paymentId },
            data: { status: status_js_1.PAYMENT_STATUS.REFUNDED },
        });
        await prisma_js_1.prisma.transaction.create({
            data: {
                paymentId,
                type: 'REFUND',
                amount: refundAmount,
                netAmount: -refundAmount,
                status: 'SUCCESS',
                notes: 'Full/Partial refund credited back to buyer account',
            },
        });
        return {
            success: true,
            paymentId,
            transactionId: payment.transactionId,
            status: status_js_1.PAYMENT_STATUS.REFUNDED,
            message: `Refund of ₹${refundAmount} processed successfully.`,
        };
    }
}
exports.DevMockPaymentProvider = DevMockPaymentProvider;
class PaymentService {
    static provider = new DevMockPaymentProvider();
    static async process(input) {
        return this.provider.processPayment(input);
    }
    static async refund(paymentId, amount) {
        return this.provider.refundPayment(paymentId, amount);
    }
}
exports.PaymentService = PaymentService;
