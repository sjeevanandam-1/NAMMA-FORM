import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class StorageController {
  /**
   * Get all storage centers / warehouses with filters
   */
  static async getStorageCenters(req: Request, res: Response): Promise<void> {
    try {
      const { type, district, state, search } = req.query;
      const where: any = {};

      if (type && type !== 'ALL') {
        where.type = type as string;
      }

      if (district && district !== 'ALL') {
        where.district = district as string;
      }

      if (state && state !== 'ALL') {
        where.state = state as string;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { agency: { contains: search as string } },
          { address: { contains: search as string } },
        ];
      }

      const centers = await prisma.storageCenter.findMany({
        where,
        orderBy: { availableMT: 'desc' },
      });

      sendSuccess(res, centers, 'Storage centers retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch storage centers', 500);
    }
  }

  /**
   * Get single storage center details
   */
  static async getStorageCenterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const center = await prisma.storageCenter.findUnique({
        where: { id },
      });

      if (!center) {
        sendError(res, 'Storage center not found', 404);
        return;
      }

      sendSuccess(res, center);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Book warehouse space
   */
  static async bookStorage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { storageId, cropName, quantityBags, quantityMT, startDate, endDate, remarks } = req.body;

      const storage = await prisma.storageCenter.findUnique({
        where: { id: storageId },
      });

      if (!storage) {
        sendError(res, 'Storage center not found', 404);
        return;
      }

      const parsedBags = parseInt(quantityBags) || 20;
      const parsedMT = parseFloat(quantityMT) || parsedBags * 0.05;
      const start = new Date(startDate || Date.now());
      const end = new Date(endDate || Date.now() + 30 * 24 * 60 * 60 * 1000);
      const diffMonths = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));

      const estimatedCharges = parsedBags * storage.ratePerBagMonth * diffMonths;
      const bookingRef = `STR-BK-${Date.now().toString().slice(-6)}`;

      const booking = await prisma.storageBooking.create({
        data: {
          farmerId,
          storageId,
          bookingRef,
          cropName: cropName || 'Grain Produce',
          quantityBags: parsedBags,
          quantityMT: parsedMT,
          startDate: start,
          endDate: end,
          estimatedCharges,
          status: 'PENDING',
          remarks,
        },
        include: { storage: true },
      });

      sendSuccess(res, booking, 'Storage booking request submitted successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's storage bookings
   */
  static async getMyStorageBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const bookings = await prisma.storageBooking.findMany({
        where: { farmerId },
        include: { storage: true },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, bookings);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
