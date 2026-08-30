"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class EquipmentController {
    /**
     * Get all farm equipment available for rent
     */
    static async getEquipment(req, res) {
        try {
            const { category, district, state, search } = req.query;
            const where = { isAvailable: true };
            if (category && category !== 'ALL') {
                where.category = category;
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
                    { specifications: { contains: search } },
                    { location: { contains: search } },
                ];
            }
            const equipment = await prisma_js_1.prisma.equipment.findMany({
                where,
                orderBy: { rating: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, equipment, 'Equipment listings retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch equipment listings', 500);
        }
    }
    /**
     * Book machinery rental
     */
    static async bookEquipment(req, res) {
        try {
            const farmerId = req.user.id;
            const { equipmentId, rentalType, unitsBooked, startDate, endDate, farmAddress, notes } = req.body;
            const equipment = await prisma_js_1.prisma.equipment.findUnique({
                where: { id: equipmentId },
            });
            if (!equipment) {
                (0, response_js_1.sendError)(res, 'Equipment not found', 404);
                return;
            }
            const units = parseFloat(unitsBooked) || 1.0;
            let unitPrice = equipment.hourlyRate || 800;
            if (rentalType === 'DAILY')
                unitPrice = equipment.dailyRate || 6000;
            else if (rentalType === 'PER_ACRE')
                unitPrice = equipment.acreRate || 1100;
            const totalAmount = units * unitPrice;
            const bookingNumber = `EQ-BK-${Date.now().toString().slice(-6)}`;
            const booking = await prisma_js_1.prisma.equipmentBooking.create({
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
            await prisma_js_1.prisma.equipment.update({
                where: { id: equipmentId },
                data: { totalBookingsCount: equipment.totalBookingsCount + 1 },
            });
            (0, response_js_1.sendSuccess)(res, booking, 'Equipment booked successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's equipment bookings
     */
    static async getMyBookings(req, res) {
        try {
            const farmerId = req.user.id;
            const bookings = await prisma_js_1.prisma.equipmentBooking.findMany({
                where: { farmerId },
                include: { equipment: true },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, bookings);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.EquipmentController = EquipmentController;
