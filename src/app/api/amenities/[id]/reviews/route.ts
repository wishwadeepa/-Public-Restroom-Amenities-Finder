import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateReviewSchema } from "@/lib/validations/amenity";
import { sanitizeText } from "@/lib/sanitization";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limit: Max 10 reviews per hour per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`review_amenity:${clientIp}`, 10, 3600000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Review submission limit reached. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = CreateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existingAmenity = await db.amenity.findUnique({
      where: { id },
    });

    if (!existingAmenity) {
      return NextResponse.json(
        { error: "Amenity not found" },
        { status: 404 }
      );
    }

    const sanitizedComment = sanitizeText(parsed.data.comment);

    const review = await db.amenityReview.create({
      data: {
        amenityId: id,
        rating: parsed.data.rating,
        cleanlinessRating: parsed.data.cleanlinessRating,
        comment: sanitizedComment,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create review", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}
