import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class TransportController {
  /**
   * Get all available transport vehicles
   */
  static async getVehicles(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleType, district, state } = req.query;
      const where: any = { isAvailable: true };

      if (vehicleType && vehicleType !== 'ALL') {
        where.vehicleType = vehicleType as string;
      }

      if (district && district !== 'ALL') {
        where.district = district as string;
      }

      if (state && state !== 'ALL') {
        where.state = state as string;
      }

      const vehicles = await prisma.transportVehicle.findMany({
        where,
        orderBy: { rating: 'desc' },
      });

      sendSuccess(res, vehicles, 'Transport vehicles retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch transport vehicles', 500);
    }
  }

  /**
   * Estimate freight trip cost
   */
  static async estimateFreight(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleId, distanceKm, weightTons } = req.body;
      const dist = parseFloat(distanceKm) || 25.0;
      const weight = parseFloat(weightTons) || 1.0;

      let basePrice = 400.0;
      let perKmRate = 18.0;

      if (vehicleId) {
        const vehicle = await prisma.transportVehicle.findUnique({
          where: { id: vehicleId },
        });
        if (vehicle) {
          basePrice = vehicle.basePrice;
          perKmRate = vehicle.perKmRate;
        }
      }

      const transportCost = basePrice + dist * perKmRate;
      const costPerKg = Math.round((transportCost / (weight * 1000)) * 100) / 100;

      sendSuccess(res, {
        distanceKm: dist,
        weightTons: weight,
        basePrice,
        perKmRate,
        totalEstimatedCost: Math.round(transportCost),
        costPerKg,
        estimatedTransitTime: `${Math.round(dist * 2.2)} minutes`,
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Book transport
   */
  static async bookTransport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { vehicleId, pickupLocation, dropLocation, distanceKm, cargoDescription, weightTons, pickupDate } = req.body;

      const vehicle = await prisma.transportVehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        sendError(res, 'Vehicle not found', 404);
        return;
      }

      const dist = parseFloat(distanceKm) || 20.0;
      const weight = parseFloat(weightTons) || 1.0;
      const estimatedCost = vehicle.basePrice + dist * vehicle.perKmRate;
      const bookingNumber = `TRP-BK-${Date.now().toString().slice(-6)}`;

      const booking = await prisma.transportBooking.create({
        data: {
          bookingNumber,
          vehicleId,
          farmerId,
          pickupLocation,
          dropLocation,
          distanceKm: dist,
          cargoDescription: cargoDescription || 'Fresh Agricultural Produce',
          weightTons: weight,
          pickupDate: new Date(pickupDate || Date.now()),
          estimatedCost,
          status: 'REQUESTED',
        },
        include: { vehicle: true },
      });

      sendSuccess(res, booking, 'Transport booking created successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's transport bookings
   */
  static async getMyTransportBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const bookings = await prisma.transportBooking.findMany({
        where: { farmerId },
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, bookings);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
