import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { createListingSchema, updateListingSchema } from '../validations/listing.validation.js';
import { AuditService } from '../services/audit.service.js';

export class ListingController {
  /**
   * Get farmer's own listings
   */
  static async getMyListings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const listings = await prisma.cropListing.findMany({
        where: { farmerId: req.user!.id },
        include: {
          crop: true,
          farm: true,
          images: true,
          orders: {
            select: { id: true, status: true, grandTotal: true, quantityKg: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, listings);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Create a new crop listing with image attachments
   */
  static async createListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = createListingSchema.parse(req.body);

      const listing = await prisma.cropListing.create({
        data: {
          farmerId: req.user!.id,
          farmId: data.farmId || null,
          cropId: data.cropId,
          variety: data.variety,
          quantityKg: data.quantityKg,
          availableQuantityKg: data.quantityKg,
          unit: data.unit || 'KG',
          expectedPricePerKg: data.expectedPricePerKg,
          minAcceptablePrice: data.minAcceptablePrice,
          harvestDate: new Date(data.harvestDate),
          qualityGrade: data.qualityGrade,
          description: data.description,
          location: data.location,
          district: data.district,
          state: data.state,
          status: 'ACTIVE',
          images: data.images && data.images.length > 0
            ? {
                create: data.images.map((url, idx) => ({
                  url,
                  filename: `img-${idx}`,
                  isPrimary: idx === 0,
                })),
              }
            : undefined,
        },
        include: {
          crop: true,
          images: true,
        },
      });

      await AuditService.log({
        userId: req.user!.id,
        action: 'CREATE_LISTING',
        entityType: 'LISTING',
        entityId: listing.id,
        details: { cropId: data.cropId, quantity: data.quantityKg, price: data.expectedPricePerKg },
      });

      sendSuccess(res, listing, 'Crop listed on marketplace successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Update crop listing (Owner only)
   */
  static async updateListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateListingSchema.parse(req.body);

      const existing = await prisma.cropListing.findUnique({
        where: { id },
      });

      if (!existing) {
        sendError(res, 'Listing not found', 404);
        return;
      }

      if (existing.farmerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        sendError(res, 'Unauthorized - You can only edit your own listings', 403);
        return;
      }

      const updated = await prisma.cropListing.update({
        where: { id },
        data: {
          farmId: data.farmId !== undefined ? data.farmId : existing.farmId,
          variety: data.variety || existing.variety,
          quantityKg: data.quantityKg || existing.quantityKg,
          availableQuantityKg: data.quantityKg || existing.availableQuantityKg,
          unit: data.unit || existing.unit,
          expectedPricePerKg: data.expectedPricePerKg || existing.expectedPricePerKg,
          minAcceptablePrice: data.minAcceptablePrice || existing.minAcceptablePrice,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : existing.harvestDate,
          qualityGrade: data.qualityGrade || existing.qualityGrade,
          description: data.description || existing.description,
          location: data.location || existing.location,
          district: data.district || existing.district,
          state: data.state || existing.state,
          status: data.status || existing.status,
        },
        include: {
          crop: true,
          images: true,
        },
      });

      await AuditService.log({
        userId: req.user!.id,
        action: 'UPDATE_LISTING',
        entityType: 'LISTING',
        entityId: updated.id,
        details: { status: updated.status, price: updated.expectedPricePerKg },
      });

      sendSuccess(res, updated, 'Listing updated successfully');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Delete listing (Owner or Admin)
   */
  static async deleteListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existing = await prisma.cropListing.findUnique({
        where: { id },
      });

      if (!existing) {
        sendError(res, 'Listing not found', 404);
        return;
      }

      if (existing.farmerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        sendError(res, 'Unauthorized to delete this listing', 403);
        return;
      }

      await prisma.cropListing.delete({ where: { id } });
      sendSuccess(res, null, 'Listing deleted successfully');
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
