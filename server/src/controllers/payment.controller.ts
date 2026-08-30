import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { PaymentService } from '../services/payment.service.js';
import { PAYMENT_STATUS } from '../constants/status.js';

export class PaymentController {
  /**
   * Process payment for an order
   */
  static async processPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId, paymentMethod = 'UPI', amount } = req.body;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }

      const result = await PaymentService.process({
        orderId,
        amount: amount || order.grandTotal,
        paymentMethod,
      });

      sendSuccess(res, result, 'Payment processed successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          transactions: true,
          order: true,
        },
      });

      if (!payment) {
        sendError(res, 'Payment record not found', 404);
        return;
      }

      sendSuccess(res, payment);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const result = await PaymentService.refund(id, amount);
      sendSuccess(res, result, 'Payment refunded successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
