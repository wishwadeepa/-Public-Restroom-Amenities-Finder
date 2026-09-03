import { describe, it, expect } from "vitest";
import {
  CreateAmenitySchema,
  QueryAmenitySchema,
  CreateReviewSchema,
  CreateVerificationSchema,
} from "@/lib/validations/amenity";
import { sanitizeText } from "@/lib/sanitization";
import { calculateDistanceMeters } from "@/lib/utils";

describe("Geographic & Coordinate Boundary Edge Cases", () => {
  it("calculates exact 0 meters distance for identical coordinates", () => {
    const lat = 37.7749;
    const lng = -122.4194;
    const distance = calculateDistanceMeters(lat, lng, lat, lng);
    expect(distance).toBe(0);
  });

  it("calculates accurate distance across antipodal points (half circumference)", () => {
    // North pole to South pole
    const distance = calculateDistanceMeters(90, 0, -90, 0);
    // Earth circumference is ~40,075km, half is ~20,037km
    expect(distance).toBeGreaterThan(19900000);
    expect(distance).toBeLessThan(20100000);
  });

  it("accepts exact boundary coordinates: North Pole, South Pole, and Antimeridian", () => {
    const northPole = {
      name: "Arctic Research Outpost Restroom",
      type: "RESTROOM",
      latitude: 90,
      longitude: 0,
    };
    expect(CreateAmenitySchema.safeParse(northPole).success).toBe(true);

    const southPole = {
      name: "Amundsen-Scott Seating Area",
      type: "SEATING",
      latitude: -90,
      longitude: 0,
    };
    expect(CreateAmenitySchema.safeParse(southPole).success).toBe(true);

    const antimeridian = {
      name: "Fiji Water Station",
      type: "WATER_FOUNTAIN",
      latitude: 0,
      longitude: 180,
    };
    expect(CreateAmenitySchema.safeParse(antimeridian).success).toBe(true);
  });

  it("strictly rejects coordinates that exceed maximum bounds", () => {
    expect(
      CreateAmenitySchema.safeParse({
        name: "Out of Bounds Lat",
        type: "RESTROOM",
        latitude: 90.0001,
        longitude: 0,
      }).success
    ).toBe(false);

    expect(
      CreateAmenitySchema.safeParse({
        name: "Out of Bounds Lng",
        type: "RESTROOM",
        latitude: 0,
        longitude: 180.0001,
      }).success
    ).toBe(false);
  });
});

describe("Query Filter & Bounding Box Stress Testing", () => {
  it("handles valid bounding boxes around prime meridian and equator", () => {
    const query = {
      bbox: "-1.0,-1.0,1.0,1.0",
      type: "RESTROOM,WATER_FOUNTAIN",
      isAccessible: "true",
    };
    expect(QueryAmenitySchema.safeParse(query).success).toBe(true);
  });

  it("rejects non-numeric and incomplete bounding box parameters", () => {
    expect(QueryAmenitySchema.safeParse({ bbox: "10,20,30" }).success).toBe(false);
    expect(
      QueryAmenitySchema.safeParse({ bbox: "abc,def,ghi,jkl" }).success
    ).toBe(false);
    expect(QueryAmenitySchema.safeParse({ bbox: "100,200,300,400" }).success).toBe(
      false
    );
  });

  it("validates search query lengths and sanitizes parameters", () => {
    expect(
      QueryAmenitySchema.safeParse({
        search: "a".repeat(100),
      }).success
    ).toBe(true);

    expect(
      QueryAmenitySchema.safeParse({
        search: "a".repeat(101),
      }).success
    ).toBe(false);
  });
});

describe("Internationalization, Emojis & Security Sanitization", () => {
  it("preserves valid multi-lingual text in descriptions (Japanese, Arabic, Hindi, Spanish)", () => {
    const multiLingual = "清潔なトイレ • دورة مياه عامة • सार्वजनिक शौचालय • Baño público";
    const cleaned = sanitizeText(multiLingual);
    expect(cleaned).toBe(multiLingual);
  });

  it("safely handles emojis in reviews and comments without corruption", () => {
    const emojiText = "Very clean! 🚻✨ Great cold water 💧 10/10";
    const cleaned = sanitizeText(emojiText);
    expect(cleaned).toBe(emojiText);
  });

  it("strips obfuscated script and event payloads in notes", () => {
    const payload = `<svg onload=alert(1)></svg>Drinking fountain`;
    const cleaned = sanitizeText(payload);
    expect(cleaned).toBe("Drinking fountain");
    expect(cleaned).not.toContain("<svg");
    expect(cleaned).not.toContain("alert");
  });
});

describe("Verification & Review Boundary Validations", () => {
  it("validates all operational statuses", () => {
    const statuses = ["OPERATIONAL", "OUT_OF_ORDER", "CLOSED"] as const;
    statuses.forEach((status) => {
      expect(
        CreateVerificationSchema.safeParse({
          status,
          notes: "Checked and verified",
        }).success
      ).toBe(true);
    });
  });

  it("rejects unrecognized status values", () => {
    expect(
      CreateVerificationSchema.safeParse({
        status: "BROKEN",
      }).success
    ).toBe(false);
  });

  it("accepts boundary review scores (1 and 5)", () => {
    expect(
      CreateReviewSchema.safeParse({ rating: 1, cleanlinessRating: 1 }).success
    ).toBe(true);
    expect(
      CreateReviewSchema.safeParse({ rating: 5, cleanlinessRating: 5 }).success
    ).toBe(true);
  });
});
