"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class StorageController {
    /**
     * Get all storage centers / warehouses with filters
     */
    static async getStorageCenters(req, res) {
        try {
            const { type, district, state, search } = req.query;
            const where = {};
            if (type && type !== 'ALL') {
                where.type = type;
            }
            if (district && district !== 'ALL') {
                where.district = district;
            }
            if (state && state !== 'ALL') {
                where.state = state;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { agency: { contains: search } },
                    { address: { contains: search } },
                ];
            }
            const centers = await prisma_js_1.prisma.storageCenter.findMany({
                where,
                orderBy: { availableMT: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, centers, 'Storage centers retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch storage centers', 500);
        }
    }
    /**
     * Get single storage center details
     */
    static async getStorageCenterById(req, res) {
        try {
            const { id } = req.params;
            const center = await prisma_js_1.prisma.storageCenter.findUnique({
                where: { id },
            });
            if (!center) {
                (0, response_js_1.sendError)(res, 'Storage center not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, center);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Book warehouse space
     */
    static async bookStorage(req, res) {
        try {
            const farmerId = req.user.id;
            const { storageId, cropName, quantityBags, quantityMT, startDate, endDate, remarks } = req.body;
            const storage = await prisma_js_1.prisma.storageCenter.findUnique({
                where: { id: storageId },
            });
            if (!storage) {
                (0, response_js_1.sendError)(res, 'Storage center not found', 404);
                return;
            }
            const parsedBags = parseInt(quantityBags) || 20;
            const parsedMT = parseFloat(quantityMT) || parsedBags * 0.05;
            const start = new Date(startDate || Date.now());
            const end = new Date(endDate || Date.now() + 30 * 24 * 60 * 60 * 1000);
            const diffMonths = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));
            const estimatedCharges = parsedBags * storage.ratePerBagMonth * diffMonths;
            const bookingRef = `STR-BK-${Date.now().toString().slice(-6)}`;
            const booking = await prisma_js_1.prisma.storageBooking.create({
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
            (0, response_js_1.sendSuccess)(res, booking, 'Storage booking request submitted successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's storage bookings
     */
    static async getMyStorageBookings(req, res) {
        try {
            const farmerId = req.user.id;
            const bookings = await prisma_js_1.prisma.storageBooking.findMany({
                where: { farmerId },
                include: { storage: true },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, bookings);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.StorageController = StorageController;
