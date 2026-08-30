import { z } from 'zod';

export const createFarmSchema = z.object({
  farmName: z.string().min(2, 'Farm name is required'),
  location: z.string().min(2, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  landAreaAcre: z.number().positive('Land area must be greater than 0'),
  soilType: z.string().min(2, 'Soil type is required'),
  irrigation: z.string().min(2, 'Irrigation type is required'),
  crops: z.union([z.array(z.string()), z.string()]),
});

export const updateFarmSchema = createFarmSchema.partial();
