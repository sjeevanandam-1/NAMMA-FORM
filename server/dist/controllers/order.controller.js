"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const order_validation_js_1 = require("../validations/order.validation.js");
const status_js_1 = require("../constants/status.js");
const socket_service_js_1 = require("../services/socket.service.js");
const audit_service_js_1 = require("../services/audit.service.js");
const payment_service_js_1 = require("../services/payment.service.js");
class OrderController {
    /**
     * Buyer: Place order with atomic transaction to prevent overselling
     */
    static async createOrder(req, res) {
        try {
            const data = order_validation_js_1.createOrderSchema.parse(req.body);
            const buyerId = req.user.id;
            // Execute in strict atomic database transaction
            const newOrder = await prisma_js_1.prisma.$transaction(async (tx) => {
                const listing = await tx.cropListing.findUnique({
                    where: { id: data.listingId },
                    include: { crop: true, farmer: true },
                });
                if (!listing) {
                    throw new Error('Crop listing not found');
                }
                if (listing.status !== 'ACTIVE') {
                    throw new Error('Listing is no longer active for purchase');
                }
                if (listing.availableQuantityKg < data.quantityKg) {
                    throw new Error(`Requested quantity (${data.quantityKg} kg) exceeds available stock (${listing.availableQuantityKg} kg)`);
                }
                if (listing.farmerId === buyerId) {
                    throw new Error('You cannot buy your own crop listing');
                }
                const pricePerKg = listing.expectedPricePerKg;
                const totalAmount = data.quantityKg * pricePerKg;
                const transportCost = 1200; // Estimated freight logistics
                const taxAmount = Math.round(totalAmount * 0.025); // 2.5% trade cess/tax
                const grandTotal = totalAmount + transportCost + taxAmount;
                const orderNumber = `AGC-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
                // Deduct inventory
                const newAvailable = listing.availableQuantityKg - data.quantityKg;
                await tx.cropListing.update({
                    where: { id: listing.id },
                    data: {
                        availableQuantityKg: newAvailable,
                        status: newAvailable <= 0 ? 'RESERVED' : 'ACTIVE',
                    },
                });
                // Create Order
                const newOrder = await tx.order.create({
                    data: {
                        orderNumber,
                        buyerId,
                        farmerId: listing.farmerId,
                        listingId: listing.id,
                        quantityKg: data.quantityKg,
                        pricePerKg,
                        totalAmount,
                        transportCost,
                        taxAmount,
                        grandTotal,
                        status: status_js_1.ORDER_STATUS.PENDING,
                        deliveryAddress: data.deliveryAddress,
                        notes: data.notes || null,
                    },
                    include: {
                        listing: { include: { crop: true } },
                        farmer: { select: { id: true, name: true, phone: true } },
                        buyer: { select: { id: true, name: true, phone: true } },
                    },
                });
                // Create Order Item
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        listingId: listing.id,
                        quantityKg: data.quantityKg,
                        unitPrice: pricePerKg,
                        subtotal: totalAmount,
                    },
                });
                // Create Delivery record
                await tx.delivery.create({
                    data: {
                        orderId: newOrder.id,
                        vehicleType: data.quantityKg > 2000 ? 'TRUCK_3TON' : 'MINI_TRUCK',
                        trackingNumber: `TRK-${Date.now().toString().slice(-8)}`,
                        estimatedCost: transportCost,
                        pickupLocation: listing.location,
                        deliveryLocation: data.deliveryAddress,
                        status: 'REQUESTED',
                    },
                });
                return newOrder;
            });
            // Process Payment after atomic order creation is committed
            const paymentResult = await payment_service_js_1.PaymentService.process({
                orderId: newOrder.id,
                amount: newOrder.grandTotal,
                paymentMethod: data.paymentMethod,
            });
            // Send real-time notification to farmer
            await (0, socket_service_js_1.sendNotificationToUser)({
                userId: newOrder.farmerId,
                title: 'New Order Received! 🌾',
                message: `Buyer placed an order for ${data.quantityKg} kg of ${newOrder.listing.crop.name} (Total: ₹${newOrder.grandTotal.toLocaleString()}).`,
                type: 'ORDER_CREATED',
                metadata: { orderId: newOrder.id, orderNumber: newOrder.orderNumber },
            });
            await audit_service_js_1.AuditService.log({
                userId: buyerId,
                action: 'ORDER_CREATE',
                entityType: 'ORDER',
                entityId: newOrder.id,
                details: {
                    orderNumber: newOrder.orderNumber,
                    grandTotal: newOrder.grandTotal,
                    quantity: data.quantityKg,
                },
            });
            (0, response_js_1.sendSuccess)(res, { newOrder, paymentResult }, 'Order placed successfully and payment authorized', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Order creation failed', 400);
        }
    }
    /**
     * Farmer or Buyer: Get list of orders
     */
    static async getMyOrders(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const where = role === 'FARMER' ? { farmerId: userId } : { buyerId: userId };
            const orders = await prisma_js_1.prisma.order.findMany({
                where,
                include: {
                    listing: {
                        include: {
                            crop: true,
                            images: true,
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            buyerProfile: true,
                        },
                    },
                    farmer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            farmerProfile: true,
                        },
                    },
                    payment: true,
                    delivery: true,
                    reviews: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, orders);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Get single order detail
     */
    static async getOrderDetail(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const order = await prisma_js_1.prisma.order.findUnique({
                where: { id },
                include: {
                    listing: { include: { crop: true, images: true } },
                    buyer: { select: { id: true, name: true, phone: true, buyerProfile: true } },
                    farmer: { select: { id: true, name: true, phone: true, farmerProfile: true } },
                    payment: true,
                    delivery: true,
                    reviews: true,
                },
            });
            if (!order) {
                (0, response_js_1.sendError)(res, 'Order not found', 404);
                return;
            }
            if (order.buyerId !== userId &&
                order.farmerId !== userId &&
                req.user.role !== 'ADMIN' &&
                req.user.role !== 'GOVERNMENT_OFFICIAL') {
                (0, response_js_1.sendError)(res, 'Unauthorized to view this order', 403);
                return;
            }
            (0, response_js_1.sendSuccess)(res, order);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
    /**
     * Update order status (Farmer accept/reject/pack/deliver or Buyer complete)
     */
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const data = order_validation_js_1.updateOrderStatusSchema.parse(req.body);
            const userId = req.user.id;
            const order = await prisma_js_1.prisma.order.findUnique({
                where: { id },
                include: { listing: true },
            });
            if (!order) {
                (0, response_js_1.sendError)(res, 'Order not found', 404);
                return;
            }
            // If farmer rejects, restore listing inventory
            if (data.status === status_js_1.ORDER_STATUS.REJECTED && order.status !== status_js_1.ORDER_STATUS.REJECTED) {
                await prisma_js_1.prisma.cropListing.update({
                    where: { id: order.listingId },
                    data: {
                        availableQuantityKg: { increment: order.quantityKg },
                        status: 'ACTIVE',
                    },
                });
            }
            const updated = await prisma_js_1.prisma.order.update({
                where: { id },
                data: {
                    status: data.status,
                    rejectionReason: data.rejectionReason || null,
                },
                include: {
                    buyer: { select: { id: true, name: true } },
                    farmer: { select: { id: true, name: true } },
                },
            });
            // Notify the other party
            const recipientId = userId === order.farmerId ? order.buyerId : order.farmerId;
            await (0, socket_service_js_1.sendNotificationToUser)({
                userId: recipientId,
                title: `Order Status Updated: ${data.status}`,
                message: `Order #${order.orderNumber} status changed to ${data.status.replace(/_/g, ' ')}.`,
                type: data.status === 'ACCEPTED' ? 'ORDER_ACCEPTED' : 'ORDER_REJECTED',
                metadata: { orderId: order.id, status: data.status },
            });
            await audit_service_js_1.AuditService.log({
                userId,
                action: 'ORDER_STATUS_UPDATE',
                entityType: 'ORDER',
                entityId: order.id,
                details: { status: data.status, orderNumber: order.orderNumber },
            });
            (0, response_js_1.sendSuccess)(res, updated, `Order status updated to ${data.status}`);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 400);
        }
    }
}
exports.OrderController = OrderController;
