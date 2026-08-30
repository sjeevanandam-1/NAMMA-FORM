"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IrrigationController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class IrrigationController {
    /**
     * Calculate Smart Irrigation requirement and schedule
     */
    static async calculateIrrigation(req, res) {
        try {
            const farmerId = req.user?.id || 'anonymous';
            const { cropName = 'Tomato', soilType = 'Red Loam', growthStage = 'Flowering', landAreaAcre = 2.0, waterSource = 'Borewell + Micro-Drip', rainProbability = 20, } = req.body;
            const parsedArea = parseFloat(landAreaAcre) || 1.0;
            const parsedRain = parseFloat(rainProbability) || 0;
            // Crop water coefficients (Kc) by stage
            let cropMultiplier = 1.0;
            if (cropName.toLowerCase().includes('paddy') || cropName.toLowerCase().includes('rice')) {
                cropMultiplier = 2.8;
            }
            else if (cropName.toLowerCase().includes('banana') || cropName.toLowerCase().includes('sugarcane')) {
                cropMultiplier = 2.2;
            }
            else if (cropName.toLowerCase().includes('tomato') || cropName.toLowerCase().includes('chilli')) {
                cropMultiplier = 1.3;
            }
            else if (cropName.toLowerCase().includes('onion') || cropName.toLowerCase().includes('garlic')) {
                cropMultiplier = 0.9;
            }
            let stageMultiplier = 1.0;
            if (growthStage.toLowerCase().includes('flower') || growthStage.toLowerCase().includes('fruit')) {
                stageMultiplier = 1.4;
            }
            else if (growthStage.toLowerCase().includes('sowing') || growthStage.toLowerCase().includes('germination')) {
                stageMultiplier = 0.7;
            }
            else if (growthStage.toLowerCase().includes('maturity')) {
                stageMultiplier = 0.5;
            }
            // Soil retention factor
            let soilFactor = 1.0;
            if (soilType.toLowerCase().includes('sandy')) {
                soilFactor = 1.3; // Drains quickly
            }
            else if (soilType.toLowerCase().includes('clay')) {
                soilFactor = 0.8; // Retains water
            }
            // Base evapotranspiration rate: ~5.0 mm/day = 20,000 Liters / Acre / day
            const baseDailyLitersPerAcre = 5000 * 4.0;
            const dailyWaterReqLiters = Math.round(baseDailyLitersPerAcre * parsedArea * cropMultiplier * stageMultiplier * soilFactor);
            // Rain reduction
            const adjustedWaterReqLiters = parsedRain > 50 ? Math.round(dailyWaterReqLiters * 0.4) : dailyWaterReqLiters;
            const hoursRequired = Math.round((adjustedWaterReqLiters / (parsedArea * 4000)) * 10) / 10;
            const nextDate = parsedRain > 60
                ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
            const waterSavingTips = [
                'Run micro-drip irrigation between 6:00 AM - 9:00 AM to minimize solar evaporation.',
                'Apply 25-micron silver-black plastic mulch to reduce soil moisture evaporation by up to 45%.',
                'Add well-decomposed farmyard manure (FYM) or coir pith to boost soil water retention capacity.',
                'Install a tensiometer to verify soil moisture at 15cm and 30cm root zones before irrigating.',
            ];
            const recommendationText = parsedRain > 60
                ? `Rain forecast of ${parsedRain}% probability detected over the next 48 hours. Postpone irrigation until rain stops to avoid waterlogging and root collar rot.`
                : `Apply ${hoursRequired} hours of micro-drip irrigation (${adjustedWaterReqLiters.toLocaleString()} Liters) tomorrow morning. Soil moisture level is optimal for ${cropName} in ${growthStage} stage.`;
            // Save advisory record
            if (farmerId !== 'anonymous') {
                await prisma_js_1.prisma.irrigationAdvisory.create({
                    data: {
                        farmerId,
                        cropName,
                        soilType,
                        growthStage,
                        landAreaAcre: parsedArea,
                        waterSource,
                        dailyWaterReqLiters: adjustedWaterReqLiters,
                        nextIrrigationDate: nextDate,
                        hoursRequired,
                        recommendationText,
                        waterSavingTips: JSON.stringify(waterSavingTips),
                        rainForecastMm: parsedRain > 50 ? 15.0 : 0.0,
                    },
                });
            }
            (0, response_js_1.sendSuccess)(res, {
                cropName,
                growthStage,
                soilType,
                landAreaAcre: parsedArea,
                dailyWaterReqLiters: adjustedWaterReqLiters,
                hoursRequired,
                nextIrrigationDate: nextDate,
                recommendationText,
                waterSavingTips,
                waterSource,
                evapotranspirationIndex: '4.8 mm/day',
            }, 'Smart irrigation schedule generated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to calculate smart irrigation', 500);
        }
    }
    /**
     * Get past irrigation advisories for the farmer
     */
    static async getMyIrrigationHistory(req, res) {
        try {
            const farmerId = req.user.id;
            const history = await prisma_js_1.prisma.irrigationAdvisory.findMany({
                where: { farmerId },
                orderBy: { createdAt: 'desc' },
                take: 15,
            });
            (0, response_js_1.sendSuccess)(res, history);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.IrrigationController = IrrigationController;
