import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateAmenitySchema, QueryAmenitySchema } from "@/lib/validations/amenity";
import { sanitizeText } from "@/lib/sanitization";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateDistanceMeters } from "@/lib/utils";

import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const parsedQuery = QueryAmenitySchema.safeParse(searchParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const { bbox, type, isAccessible, feeRequired, search, limit } = parsedQuery.data;

    // Build database filters with strict Prisma types
    const where: Prisma.AmenityWhereInput = {};

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(Number);
      where.latitude = { gte: minLat, lte: maxLat };
      where.longitude = { gte: minLng, lte: maxLng };
    }

    if (type) {
      const types = type.split(",").map((t) => t.trim().toUpperCase());
      where.type = { in: types };
    }

    if (isAccessible !== undefined) {
      where.isAccessible = isAccessible === "true";
    }

    if (feeRequired !== undefined) {
      where.feeRequired = feeRequired === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const amenities = await db.amenity.findMany({
      where,
      take: limit,
      include: {
        reviews: {
          select: {
            rating: true,
            cleanlinessRating: true,
          },
        },
        verifications: {
          orderBy: { verifiedAt: "desc" },
          take: 1,
          select: {
            status: true,
            verifiedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const userLat = Number(url.searchParams.get("userLat"));
    const userLng = Number(url.searchParams.get("userLng"));
    const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

    // Calculate aggregated metrics (ratings, distance)
    const formattedAmenities = amenities.map((item) => {
      const reviewCount = item.reviews.length;
      const avgRating =
        reviewCount > 0
          ? Number(
              (
                item.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
              ).toFixed(1)
            )
          : null;
      const avgCleanliness =
        reviewCount > 0
          ? Number(
              (
                item.reviews.reduce((acc, r) => acc + r.cleanlinessRating, 0) /
                reviewCount
              ).toFixed(1)
            )
          : null;

      let distanceMeters: number | null = null;
      if (hasUserLocation) {
        distanceMeters = calculateDistanceMeters(
          userLat,
          userLng,
          item.latitude,
          item.longitude
        );
      }

      return {
        id: item.id,
        name: item.name,
        type: item.type,
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
        description: item.description,
        isAccessible: item.isAccessible,
        isGenderNeutral: item.isGenderNeutral,
        hasBabyChanging: item.hasBabyChanging,
        feeRequired: item.feeRequired,
        keyOrCodeRequired: item.keyOrCodeRequired,
        doorCode: item.doorCode,
        hours: item.hours,
        status: item.verifications[0]?.status || item.status,
        lastVerifiedAt: item.verifications[0]?.verifiedAt || null,
        reviewCount,
        avgRating,
        avgCleanliness,
        distanceMeters,
        createdAt: item.createdAt,
      };
    });

    // If user coordinates provided, sort by nearest first
    if (hasUserLocation) {
      formattedAmenities.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    }

    return NextResponse.json({ data: formattedAmenities });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error fetching amenities", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: Max 10 pin creations per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`create_amenity:${clientIp}`, 10, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before creating another amenity." },
        { status: 429, headers: { "Retry-After": `${Math.ceil(rateLimit.reset / 1000)}` } }
      );
    }

    const body = await req.json();
    const parsed = CreateAmenitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      type,
      latitude,
      longitude,
      address,
      description,
      isAccessible,
      isGenderNeutral,
      hasBabyChanging,
      feeRequired,
      keyOrCodeRequired,
      doorCode,
      hours,
    } = parsed.data;

    // Sanitize user-provided text fields to prevent XSS
    const sanitizedName = sanitizeText(name) || "Public Amenity";
    const sanitizedAddress = sanitizeText(address);
    const sanitizedDescription = sanitizeText(description);
    const sanitizedDoorCode = sanitizeText(doorCode);
    const sanitizedHours = sanitizeText(hours);

    const newAmenity = await db.amenity.create({
      data: {
        name: sanitizedName,
        type,
        latitude,
        longitude,
        address: sanitizedAddress,
        description: sanitizedDescription,
        isAccessible,
        isGenderNeutral,
        hasBabyChanging,
        feeRequired,
        keyOrCodeRequired,
        doorCode: sanitizedDoorCode,
        hours: sanitizedHours,
        status: "OPERATIONAL",
      },
    });

    return NextResponse.json({ data: newAmenity }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error creating amenity", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}
