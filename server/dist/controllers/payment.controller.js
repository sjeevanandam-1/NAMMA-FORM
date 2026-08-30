"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const payment_service_js_1 = require("../services/payment.service.js");
class PaymentController {
    /**
     * Process payment for an order
     */
    static async processPayment(req, res) {
        try {
            const { orderId, paymentMethod = 'UPI', amount } = req.body;
            const order = await prisma_js_1.prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                (0, response_js_1.sendError)(res, 'Order not found', 404);
                return;
            }
            const result = await payment_service_js_1.PaymentService.process({
                orderId,
                amount: amount || order.grandTotal,
                paymentMethod,
            });
            (0, response_js_1.sendSuccess)(res, result, 'Payment processed successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get payment details
     */
    static async getPaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const payment = await prisma_js_1.prisma.payment.findUnique({
                where: { id },
                include: {
                    transactions: true,
                    order: true,
                },
            });
            if (!payment) {
                (0, response_js_1.sendError)(res, 'Payment record not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, payment);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Refund payment
     */
    static async refundPayment(req, res) {
        try {
            const { id } = req.params;
            const { amount } = req.body;
            const result = await payment_service_js_1.PaymentService.refund(id, amount);
            (0, response_js_1.sendSuccess)(res, result, 'Payment refunded successfully');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.PaymentController = PaymentController;
