"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFarmSchema = exports.createFarmSchema = void 0;
const zod_1 = require("zod");
exports.createFarmSchema = zod_1.z.object({
    farmName: zod_1.z.string().min(2, 'Farm name is required'),
    location: zod_1.z.string().min(2, 'Location is required'),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    landAreaAcre: zod_1.z.number().positive('Land area must be greater than 0'),
    soilType: zod_1.z.string().min(2, 'Soil type is required'),
    irrigation: zod_1.z.string().min(2, 'Irrigation type is required'),
    crops: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]),
});
exports.updateFarmSchema = exports.createFarmSchema.partial();
