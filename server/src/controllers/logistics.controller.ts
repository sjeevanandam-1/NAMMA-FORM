import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class LogisticsController {
  /**
   * Request transport logistics for an order or listing
   */
  static async requestTransport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId, vehicleType, pickupLocation, deliveryLocation, estimatedCost } = req.body;

      const trackingNumber = `TRK-LOG-${Date.now().toString().slice(-6)}`;
      const delivery = await prisma.delivery.create({
        data: {
          orderId,
          vehicleType: vehicleType || 'MINI_TRUCK',
          trackingNumber,
          estimatedCost: estimatedCost || 1500,
          pickupLocation,
          deliveryLocation,
          status: 'REQUESTED',
        },
      });

      sendSuccess(res, delivery, 'Transport vehicle requested successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get transport delivery status by tracking number or order ID
   */
  static async getDeliveryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;
      const delivery = await prisma.delivery.findUnique({
        where: { trackingNumber },
        include: {
          order: {
            include: {
              listing: { include: { crop: true } },
              farmer: { select: { name: true, phone: true } },
              buyer: { select: { name: true, phone: true } },
            },
          },
        },
      });

      if (!delivery) {
        sendError(res, 'Delivery tracking record not found', 404);
        return;
      }

      sendSuccess(res, delivery);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
