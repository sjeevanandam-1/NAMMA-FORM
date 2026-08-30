"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class LogisticsController {
    /**
     * Request transport logistics for an order or listing
     */
    static async requestTransport(req, res) {
        try {
            const { orderId, vehicleType, pickupLocation, deliveryLocation, estimatedCost } = req.body;
            const trackingNumber = `TRK-LOG-${Date.now().toString().slice(-6)}`;
            const delivery = await prisma_js_1.prisma.delivery.create({
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
            (0, response_js_1.sendSuccess)(res, delivery, 'Transport vehicle requested successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
    /**
     * Get transport delivery status by tracking number or order ID
     */
    static async getDeliveryStatus(req, res) {
        try {
            const { trackingNumber } = req.params;
            const delivery = await prisma_js_1.prisma.delivery.findUnique({
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
                (0, response_js_1.sendError)(res, 'Delivery tracking record not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, delivery);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.LogisticsController = LogisticsController;
