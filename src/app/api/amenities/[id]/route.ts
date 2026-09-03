import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const amenity = await db.amenity.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        verifications: {
          orderBy: { verifiedAt: "desc" },
          take: 20,
        },
      },
    });

    if (!amenity) {
      return NextResponse.json(
        { error: "Amenity not found" },
        { status: 404 }
      );
    }

    const reviewCount = amenity.reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number(
            (
              amenity.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
            ).toFixed(1)
          )
        : null;

    const avgCleanliness =
      reviewCount > 0
        ? Number(
            (
              amenity.reviews.reduce(
                (acc, r) => acc + r.cleanlinessRating,
                0
              ) / reviewCount
            ).toFixed(1)
          )
        : null;

    return NextResponse.json({
      data: {
        ...amenity,
        reviewCount,
        avgRating,
        avgCleanliness,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error fetching amenity", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}
