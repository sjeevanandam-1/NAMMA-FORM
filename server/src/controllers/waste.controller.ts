import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class WasteController {
  /**
   * Get all active crop residue and agricultural waste listings
   */
  static async getWasteListings(req: Request, res: Response): Promise<void> {
    try {
      const { wasteType, district, state, search } = req.query;
      const where: any = { status: 'ACTIVE' };

      if (wasteType && wasteType !== 'ALL') {
        where.wasteType = wasteType as string;
      }

      if (district && district !== 'ALL') {
        where.district = district as string;
      }

      if (state && state !== 'ALL') {
        where.state = state as string;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { suitableFor: { contains: search as string } },
        ];
      }

      const listings = await prisma.agriWasteListing.findMany({
        where,
        include: {
          farmer: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, listings, 'Agri waste listings retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch waste listings', 500);
    }
  }

  /**
   * Create agri waste / crop residue listing
   */
  static async createWasteListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { wasteType, title, description, quantityTons, pricePerTon, suitableFor, location, district, state, imageUrl } = req.body;

      const listing = await prisma.agriWasteListing.create({
        data: {
          farmerId,
          wasteType: wasteType || 'CROP_RESIDUE',
          title,
          description,
          quantityTons: parseFloat(quantityTons) || 5.0,
          availableTons: parseFloat(quantityTons) || 5.0,
          pricePerTon: parseFloat(pricePerTon) || 0.0,
          suitableFor: suitableFor || 'COMPOSTING, MULCHING',
          location: location || 'Farmgate Location',
          district: district || 'Coimbatore',
          state: state || 'Tamil Nadu',
          imageUrl,
          status: 'ACTIVE',
        },
      });

      sendSuccess(res, listing, 'Agri waste listing published', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Buyer creates offer/request for agri waste
   */
  static async createOffer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const buyerId = req.user!.id;
      const { listingId, offeredPricePerTon, requestedTons, message } = req.body;

      const listing = await prisma.agriWasteListing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        sendError(res, 'Listing not found', 404);
        return;
      }

      const tons = parseFloat(requestedTons) || 1.0;
      const price = parseFloat(offeredPricePerTon) || listing.pricePerTon;
      const totalAmount = tons * price;

      const offer = await prisma.wasteOffer.create({
        data: {
          listingId,
          buyerId,
          offeredPricePerTon: price,
          requestedTons: tons,
          totalAmount,
          message,
          status: 'PENDING',
        },
        include: { listing: true },
      });

      sendSuccess(res, offer, 'Offer submitted to farmer', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's waste listings
   */
  static async getMyWasteListings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const listings = await prisma.agriWasteListing.findMany({
        where: { farmerId },
        include: { offers: { include: { buyer: { select: { id: true, name: true, phone: true } } } } },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, listings);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
