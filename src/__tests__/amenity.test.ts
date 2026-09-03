import { describe, it, expect } from "vitest";
import {
  CreateAmenitySchema,
  QueryAmenitySchema,
  CreateReviewSchema,
} from "@/lib/validations/amenity";
import { sanitizeText } from "@/lib/sanitization";
import { calculateDistanceMeters, formatDistance } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

describe("Geospatial & Distance Utilities", () => {
  it("calculates distance between two coordinates correctly", () => {
    // San Francisco Union Square to Yerba Buena Gardens (~500m)
    const lat1 = 37.7879;
    const lon1 = -122.4075;
    const lat2 = 37.7861;
    const lon2 = -122.4024;

    const distance = calculateDistanceMeters(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(400);
    expect(distance).toBeLessThan(600);
  });

  it("formats distances properly in meters and kilometers", () => {
    expect(formatDistance(350)).toBe("350m");
    expect(formatDistance(1250)).toBe("1.3km");
    expect(formatDistance(5000)).toBe("5.0km");
  });
});

describe("Input Validation & Zod Schemas", () => {
  it("validates a valid amenity payload", () => {
    const valid = {
      name: "Downtown Public Restroom",
      type: "RESTROOM",
      latitude: 37.7749,
      longitude: -122.4194,
      isAccessible: true,
      hours: "24/7",
    };

    const result = CreateAmenitySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid latitude and longitude ranges", () => {
    const invalidCoords = {
      name: "Invalid Location",
      type: "RESTROOM",
      latitude: 105.0, // Out of -90 to 90 range
      longitude: -190.0, // Out of -180 to 180 range
    };

    const result = CreateAmenitySchema.safeParse(invalidCoords);
    expect(result.success).toBe(false);
  });

  it("validates bounding box query format", () => {
    const validBbox = {
      bbox: "-122.42,37.77,-122.40,37.79",
    };
    expect(QueryAmenitySchema.safeParse(validBbox).success).toBe(true);

    const malformedBbox = {
      bbox: "invalid,coords,here",
    };
    expect(QueryAmenitySchema.safeParse(malformedBbox).success).toBe(false);
  });

  it("validates reviews with rating bounds 1 to 5", () => {
    const validReview = {
      rating: 5,
      cleanlinessRating: 4,
      comment: "Very clean facility.",
    };
    expect(CreateReviewSchema.safeParse(validReview).success).toBe(true);

    const invalidReview = {
      rating: 6, // Exceeds max 5
      cleanlinessRating: 0, // Below min 1
    };
    expect(CreateReviewSchema.safeParse(invalidReview).success).toBe(false);
  });
});

describe("DOMPurify XSS Sanitization", () => {
  it("strips malicious script tags from user inputs", () => {
    const malicious = '<script>alert("hack")</script>Public Fountain';
    const cleaned = sanitizeText(malicious);
    expect(cleaned).toBe("Public Fountain");
    expect(cleaned).not.toContain("<script>");
  });

  it("strips malicious inline onerror attributes", () => {
    const malicious = '<img src=x onerror="alert(1)">Clean bench';
    const cleaned = sanitizeText(malicious);
    expect(cleaned).toBe("Clean bench");
  });
});

describe("Rate Limiting Guard", () => {
  it("enforces request threshold within window", () => {
    const testId = "test_user_rate_limit";
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(testId, 5, 10000);
      expect(result.success).toBe(true);
    }
    // 6th request should fail
    const blocked = checkRateLimit(testId, 5, 10000);
    expect(blocked.success).toBe(false);
  });
});
