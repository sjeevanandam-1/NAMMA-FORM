import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class EquipmentController {
  /**
   * Get all farm equipment available for rent
   */
  static async getEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { category, district, state, search } = req.query;
      const where: any = { isAvailable: true };

      if (category && category !== 'ALL') {
        where.category = category as string;
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
          { specifications: { contains: search as string } },
          { location: { contains: search as string } },
        ];
      }

      const equipment = await prisma.equipment.findMany({
        where,
        orderBy: { rating: 'desc' },
      });

      sendSuccess(res, equipment, 'Equipment listings retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch equipment listings', 500);
    }
  }

  /**
   * Book machinery rental
   */
  static async bookEquipment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { equipmentId, rentalType, unitsBooked, startDate, endDate, farmAddress, notes } = req.body;

      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!equipment) {
        sendError(res, 'Equipment not found', 404);
        return;
      }

      const units = parseFloat(unitsBooked) || 1.0;
      let unitPrice = equipment.hourlyRate || 800;

      if (rentalType === 'DAILY') unitPrice = equipment.dailyRate || 6000;
      else if (rentalType === 'PER_ACRE') unitPrice = equipment.acreRate || 1100;

      const totalAmount = units * unitPrice;
      const bookingNumber = `EQ-BK-${Date.now().toString().slice(-6)}`;

      const booking = await prisma.equipmentBooking.create({
        data: {
          bookingNumber,
          equipmentId,
          farmerId,
          rentalType: rentalType || 'PER_ACRE',
          unitsBooked: units,
          startDate: new Date(startDate || Date.now()),
          endDate: new Date(endDate || Date.now() + 24 * 60 * 60 * 1000),
          totalAmount,
          farmAddress: farmAddress || 'Registered Farm Location',
          status: 'BOOKED',
          operatorIncluded: true,
          notes,
        },
        include: { equipment: true },
      });

      // Update booking count
      await prisma.equipment.update({
        where: { id: equipmentId },
        data: { totalBookingsCount: equipment.totalBookingsCount + 1 },
      });

      sendSuccess(res, booking, 'Equipment booked successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's equipment bookings
   */
  static async getMyBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const bookings = await prisma.equipmentBooking.findMany({
        where: { farmerId },
        include: { equipment: true },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, bookings);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
