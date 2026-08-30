"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class TransportController {
    /**
     * Get all available transport vehicles
     */
    static async getVehicles(req, res) {
        try {
            const { vehicleType, district, state } = req.query;
            const where = { isAvailable: true };
            if (vehicleType && vehicleType !== 'ALL') {
                where.vehicleType = vehicleType;
            }
            if (district && district !== 'ALL') {
                where.district = district;
            }
            if (state && state !== 'ALL') {
                where.state = state;
            }
            const vehicles = await prisma_js_1.prisma.transportVehicle.findMany({
                where,
                orderBy: { rating: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, vehicles, 'Transport vehicles retrieved');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch transport vehicles', 500);
        }
    }
    /**
     * Estimate freight trip cost
     */
    static async estimateFreight(req, res) {
        try {
            const { vehicleId, distanceKm, weightTons } = req.body;
            const dist = parseFloat(distanceKm) || 25.0;
            const weight = parseFloat(weightTons) || 1.0;
            let basePrice = 400.0;
            let perKmRate = 18.0;
            if (vehicleId) {
                const vehicle = await prisma_js_1.prisma.transportVehicle.findUnique({
                    where: { id: vehicleId },
                });
                if (vehicle) {
                    basePrice = vehicle.basePrice;
                    perKmRate = vehicle.perKmRate;
                }
            }
            const transportCost = basePrice + dist * perKmRate;
            const costPerKg = Math.round((transportCost / (weight * 1000)) * 100) / 100;
            (0, response_js_1.sendSuccess)(res, {
                distanceKm: dist,
                weightTons: weight,
                basePrice,
                perKmRate,
                totalEstimatedCost: Math.round(transportCost),
                costPerKg,
                estimatedTransitTime: `${Math.round(dist * 2.2)} minutes`,
            });
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Book transport
     */
    static async bookTransport(req, res) {
        try {
            const farmerId = req.user.id;
            const { vehicleId, pickupLocation, dropLocation, distanceKm, cargoDescription, weightTons, pickupDate } = req.body;
            const vehicle = await prisma_js_1.prisma.transportVehicle.findUnique({
                where: { id: vehicleId },
            });
            if (!vehicle) {
                (0, response_js_1.sendError)(res, 'Vehicle not found', 404);
                return;
            }
            const dist = parseFloat(distanceKm) || 20.0;
            const weight = parseFloat(weightTons) || 1.0;
            const estimatedCost = vehicle.basePrice + dist * vehicle.perKmRate;
            const bookingNumber = `TRP-BK-${Date.now().toString().slice(-6)}`;
            const booking = await prisma_js_1.prisma.transportBooking.create({
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
            (0, response_js_1.sendSuccess)(res, booking, 'Transport booking created successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get farmer's transport bookings
     */
    static async getMyTransportBookings(req, res) {
        try {
            const farmerId = req.user.id;
            const bookings = await prisma_js_1.prisma.transportBooking.findMany({
                where: { farmerId },
                include: { vehicle: true },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, bookings);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.TransportController = TransportController;
