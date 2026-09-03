import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateVerificationSchema } from "@/lib/validations/amenity";
import { sanitizeText } from "@/lib/sanitization";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limiting: Max 20 verifications per hour per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`verify_amenity:${clientIp}`, 20, 3600000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Verification rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = CreateVerificationSchema.safeParse(body);

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

    const sanitizedNotes = sanitizeText(parsed.data.notes);

    // Create verification and update amenity status atomically in a transaction
    const [verification] = await db.$transaction([
      db.amenityVerification.create({
        data: {
          amenityId: id,
          status: parsed.data.status,
          notes: sanitizedNotes,
        },
      }),
      db.amenity.update({
        where: { id },
        data: {
          status: parsed.data.status,
        },
      }),
    ]);

    return NextResponse.json({ data: verification }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record verification", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}
