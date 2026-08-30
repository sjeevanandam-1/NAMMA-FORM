"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceKm = calculateDistanceKm;
exports.estimateTransportCost = estimateTransportCost;
/**
 * Calculates great-circle distance between two geographic points in kilometers (Haversine formula).
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
/**
 * Returns estimated transport cost per kg based on vehicle type and distance.
 */
function estimateTransportCost(distanceKm, quantityKg, vehicleType = 'MINI_TRUCK') {
    let baseRatePerKm = 18; // INR per km for mini-truck
    let maxCapacityKg = 1500;
    if (vehicleType === 'TRUCK_3TON') {
        baseRatePerKm = 32;
        maxCapacityKg = 3500;
    }
    else if (vehicleType === 'REFRIGERATED_VAN') {
        baseRatePerKm = 45;
        maxCapacityKg = 2500;
    }
    const trips = Math.ceil(quantityKg / maxCapacityKg);
    const fixedLoadingCost = 500 * trips;
    const transitCost = distanceKm * baseRatePerKm * trips;
    const totalCost = fixedLoadingCost + transitCost;
    const costPerKg = Math.round((totalCost / quantityKg) * 100) / 100;
    const estimatedHours = Math.max(1, Math.round((distanceKm / 40) * 10) / 10);
    return {
        totalCost: Math.round(totalCost),
        costPerKg,
        estimatedHours,
    };
}
