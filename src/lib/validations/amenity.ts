import { z } from "zod";

export const AmenityTypeEnum = z.enum(["RESTROOM", "WATER_FOUNTAIN", "SEATING"]);
export type AmenityType = z.infer<typeof AmenityTypeEnum>;

export const AmenityStatusEnum = z.enum(["OPERATIONAL", "OUT_OF_ORDER", "CLOSED"]);
export type AmenityStatus = z.infer<typeof AmenityStatusEnum>;

export const CreateAmenitySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  type: AmenityTypeEnum,
  latitude: z
    .number({ invalid_type_error: "Latitude must be a valid number" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number({ invalid_type_error: "Longitude must be a valid number" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  address: z.string().max(255).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  isAccessible: z.boolean().default(false),
  isGenderNeutral: z.boolean().default(false),
  hasBabyChanging: z.boolean().default(false),
  feeRequired: z.boolean().default(false),
  keyOrCodeRequired: z.boolean().default(false),
  doorCode: z.string().max(50).optional().nullable(),
  hours: z.string().max(100).optional().nullable(),
});

export type CreateAmenityInput = z.infer<typeof CreateAmenitySchema>;

export const QueryAmenitySchema = z.object({
  bbox: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const parts = val.split(",").map(Number);
        return (
          parts.length === 4 &&
          parts.every((n) => !isNaN(n)) &&
          parts[0] >= -180 &&
          parts[0] <= 180 &&
          parts[1] >= -90 &&
          parts[1] <= 90 &&
          parts[2] >= -180 &&
          parts[2] <= 180 &&
          parts[3] >= -90 &&
          parts[3] <= 90
        );
      },
      { message: "Bounding box must be minLng,minLat,maxLng,maxLat" }
    ),
  type: z.string().optional(),
  isAccessible: z.enum(["true", "false"]).optional(),
  feeRequired: z.enum(["true", "false"]).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(200).default(100),
});

export const CreateVerificationSchema = z.object({
  status: AmenityStatusEnum,
  notes: z.string().max(500).optional().nullable(),
});

export type CreateVerificationInput = z.infer<typeof CreateVerificationSchema>;

export const CreateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5),
  cleanlinessRating: z.coerce.number().int().min(1, "Cleanliness must be between 1 and 5").max(5),
  comment: z.string().max(1000).optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
