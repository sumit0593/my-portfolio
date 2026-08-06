/**
 * Consultation Scheduling & Calendar Engine
 * Manages 1-on-1 architecture review bookings, Google Calendar URLs,
 * .ics calendar invite generation, and confirmation email notifications.
 */

import nodemailer from "nodemailer";

export interface BookingDetails {
  clientName: string;
  clientEmail: string;
  company?: string;
  meetingType: "30-min Architecture Review" | "60-min Discovery & Strategy Session" | "Project Scoping Call";
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // e.g. "14:00"
  timeZone?: string; // e.g. "EST", "PST", "IST"
  notes?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  details: BookingDetails;
  googleCalendarUrl: string;
  icsContent: string;
  confirmedAt: string;
}

/**
 * Generates Google Calendar event link.
 */
function createGoogleCalendarUrl(details: BookingDetails): string {
  const title = encodeURIComponent(`1-on-1 AI Architecture Call: ${details.clientName} & Sumit Kumar`);
  const description = encodeURIComponent(`Consultation Meeting: ${details.meetingType}\nClient: ${details.clientName} (${details.company || "N/A"})\nEmail: ${details.clientEmail}\nNotes: ${details.notes || "None"}`);
  const location = encodeURIComponent("Google Meet / Video Consultation (Link provided upon confirmation)");
  
  // Format start/end date (assume 45 min duration)
  const dateParts = details.preferredDate.split("-");
  const timeParts = details.preferredTime.split(":");
  const start = new Date(Date.UTC(
    parseInt(dateParts[0], 10),
    parseInt(dateParts[1], 10) - 1,
    parseInt(dateParts[2], 10),
    parseInt(timeParts[0] || "14", 10),
    parseInt(timeParts[1] || "00", 10)
  ));
  const end = new Date(start.getTime() + 45 * 60 * 1000);

  const startIso = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endIso = end.toISOString().replace(/-|:|\.\d\d\d/g, "");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${description}&location=${location}`;
}

/**
 * Generates iCalendar (.ics) invite payload.
 */
function createIcsPayload(details: BookingDetails, bookingId: string): string {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sumit Kumar Portfolio AI//Scheduling Engine//EN
BEGIN:VEVENT
UID:${bookingId}@portfolio-ai
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, "")}
SUMMARY:AI Architecture Call: ${details.clientName} & Sumit Kumar
DESCRIPTION:${details.meetingType} - Notes: ${details.notes || "None"}
LOCATION:Google Meet / Video Call
END:VEVENT
END:VCALENDAR`;
}

/**
 * Creates and confirms a consultation booking.
 */
export async function createConsultationBooking(details: BookingDetails): Promise<BookingConfirmation> {
  const bookingId = `BOOK-${Date.now().toString(36).toUpperCase()}`;
  const confirmedAt = new Date().toISOString();
  const googleCalendarUrl = createGoogleCalendarUrl(details);
  const icsContent = createIcsPayload(details, bookingId);

  // Send confirmation email via Nodemailer
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Sumit Kumar Scheduling" <${process.env.SMTP_EMAIL}>`,
        to: `${details.clientEmail}, ${process.env.CONTACT_EMAIL || process.env.SMTP_EMAIL}`,
        subject: `Consultation Confirmed: ${details.meetingType} with Sumit Kumar`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background: #ffffff;">
            <h2 style="color: #4338ca; margin-top: 0;">Consultation Booking Confirmed! 📅</h2>
            <p>Hi <strong>${details.clientName}</strong>,</p>
            <p>Your 1-on-1 architecture session has been scheduled successfully.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <div><strong>Session:</strong> ${details.meetingType}</div>
              <div><strong>Date:</strong> ${details.preferredDate}</div>
              <div><strong>Time:</strong> ${details.preferredTime} (${details.timeZone || "UTC"})</div>
              <div><strong>Ref ID:</strong> ${bookingId}</div>
            </div>

            <div style="margin-top: 24px;">
              <a href="${googleCalendarUrl}" target="_blank" style="background: #4338ca; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; inline-block;">Add to Google Calendar</a>
            </div>

            <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Looking forward to discussing your AI & full-stack roadmap!</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[Booking Email Warning]", emailErr);
    }
  }

  return {
    bookingId,
    details,
    googleCalendarUrl,
    icsContent,
    confirmedAt,
  };
}
