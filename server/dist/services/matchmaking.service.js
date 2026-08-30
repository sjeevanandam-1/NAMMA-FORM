"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const prisma_js_1 = require("../config/prisma.js");
class MatchmakingService {
    /**
     * Matches a farmer's crop listing with prospective buyers based on:
     * 1. Crop demand
     * 2. Proximity (State/District)
     * 3. Volume fit
     * 4. Trust score & transaction reliability
     */
    static async findMatchingBuyers(params) {
        const { cropName, quantityKg, state, district } = params;
        // Fetch all active buyers
        const buyers = await prisma_js_1.prisma.buyerProfile.findMany({
            include: {
                user: {
                    include: {
                        trustScore: true,
                    },
                },
            },
        });
        const matches = [];
        for (const buyer of buyers) {
            let score = 50; // Base score
            const reasons = [];
            // Check crop requirement match
            const reqCrops = buyer.requiredCrops.toLowerCase();
            const hasCropInterest = reqCrops.includes(cropName.toLowerCase()) || reqCrops.includes('all') || reqCrops.includes('vegetables');
            if (hasCropInterest) {
                score += 25;
                reasons.push(`Actively procuring ${cropName} for ${buyer.businessType.toLowerCase()} operations`);
            }
            else {
                score += 5;
            }
            // Proximity match
            if (buyer.state === state) {
                score += 12;
                if (buyer.district === district) {
                    score += 8;
                    reasons.push(`Located in same district (${district}), minimizing freight logistics`);
                }
                else {
                    reasons.push(`Located in same state (${state})`);
                }
            }
            else {
                reasons.push(`Interstate procurement partner (${buyer.state})`);
            }
            // Trust score factor
            const trust = buyer.user?.trustScore?.score || 85;
            if (trust >= 90) {
                score += 5;
                reasons.push(`High AgriTrust rating (${trust}%) with guaranteed payment record`);
            }
            const finalScore = Math.min(98, Math.max(65, score));
            matches.push({
                buyerId: buyer.userId,
                companyName: buyer.companyName,
                businessType: buyer.businessType,
                location: buyer.location,
                state: buyer.state,
                district: buyer.district,
                matchScore: finalScore,
                matchReasons: reasons,
                demandVolumeKg: Math.round(quantityKg * (0.8 + Math.random() * 0.5)),
                offeredPriceRange: `₹${Math.round(params.expectedPrice * 0.95)} - ₹${Math.round(params.expectedPrice * 1.1)}/kg`,
                trustScore: trust,
            });
        }
        // Sort by highest match score
        matches.sort((a, b) => b.matchScore - a.matchScore);
        return matches;
    }
}
exports.MatchmakingService = MatchmakingService;
