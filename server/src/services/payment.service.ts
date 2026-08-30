import { prisma } from '../config/prisma.js';
import { PAYMENT_STATUS } from '../constants/status.js';

export interface PaymentProcessInput {
  orderId: string;
  amount: number;
  paymentMethod: string;
  currency?: string;
  cardLastFour?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId: string;
  status: string;
  message: string;
  paidAt?: Date;
}

export interface IPaymentProvider {
  processPayment(input: PaymentProcessInput): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResult>;
}

/**
 * Development Mock Payment Provider
 * Simulates real banking, UPI, Escrow, and Razorpay/Stripe authorization.
 */
export class DevMockPaymentProvider implements IPaymentProvider {
  async processPayment(input: PaymentProcessInput): Promise<PaymentResult> {
    // Generate secure mock transaction reference
    const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const isSuccess = true; // In development mock, default to success
    const status = isSuccess ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;

    const payment = await prisma.payment.create({
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
      await prisma.transaction.create({
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

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    const refundAmount = amount || payment.amount;

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PAYMENT_STATUS.REFUNDED },
    });

    await prisma.transaction.create({
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
      status: PAYMENT_STATUS.REFUNDED,
      message: `Refund of ₹${refundAmount} processed successfully.`,
    };
  }
}

export class PaymentService {
  private static provider: IPaymentProvider = new DevMockPaymentProvider();

  static async process(input: PaymentProcessInput): Promise<PaymentResult> {
    return this.provider.processPayment(input);
  }

  static async refund(paymentId: string, amount?: number): Promise<PaymentResult> {
    return this.provider.refundPayment(paymentId, amount);
  }
}
