import { NextRequest, NextResponse } from "next/server";
import { createConsultationBooking } from "@/lib/agents/schedulingEngine";
import { analyzeLimiter, getRateLimitToken } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting
    const token = getRateLimitToken(req);
    const { success: withinLimit } = analyzeLimiter.check(5, token);
    if (!withinLimit) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { clientName, clientEmail, company, meetingType, preferredDate, preferredTime, timeZone, notes } = body;

    if (!clientName || !clientEmail || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (name, email, date, time)." },
        { status: 400 }
      );
    }

    const confirmation = await createConsultationBooking({
      clientName,
      clientEmail,
      company: company || "Enterprise Partner",
      meetingType: meetingType || "30-min Architecture Review",
      preferredDate,
      preferredTime,
      timeZone: timeZone || "UTC",
      notes: notes || "Portfolio inquiry",
    });

    return NextResponse.json({
      success: true,
      bookingId: confirmation.bookingId,
      confirmedAt: confirmation.confirmedAt,
      googleCalendarUrl: confirmation.googleCalendarUrl,
      details: confirmation.details,
    });
  } catch (err: any) {
    console.error("[Schedule API Error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to process consultation booking." },
      { status: 500 }
    );
  }
}
