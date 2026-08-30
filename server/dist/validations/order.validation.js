"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    listingId: zod_1.z.string().uuid('Valid listing ID is required'),
    quantityKg: zod_1.z.number().positive('Quantity must be greater than 0'),
    deliveryAddress: zod_1.z.string().min(5, 'Delivery address is required'),
    paymentMethod: zod_1.z.enum(['UPI', 'CARD', 'NET_BANKING', 'CASH_ON_DELIVERY', 'ESCROW']).default('UPI'),
    notes: zod_1.z.string().optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'CONFIRMED',
        'PACKED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
    ]),
    rejectionReason: zod_1.z.string().optional(),
});
