import { z } from 'zod';

export const createOrderSchema = z.object({
  listingId: z.string().uuid('Valid listing ID is required'),
  quantityKg: z.number().positive('Quantity must be greater than 0'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'CASH_ON_DELIVERY', 'ESCROW']).default('UPI'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
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
  rejectionReason: z.string().optional(),
});
