/**
 * WhatsApp Business Cloud API Service
 * Integrates with Meta Graph API to send automated AI messages,
 * proposals, audio notes, and media attachments to client WhatsApp numbers.
 */

import axios from "axios";

const GRAPH_API_VERSION = "v19.0";

interface SendTextMessageParams {
  toPhone: string;
  text: string;
  phoneId?: string;
}

interface SendMediaMessageParams {
  toPhone: string;
  mediaType: "image" | "document" | "audio";
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

/**
 * Sends a text message to a client's WhatsApp number.
 */
export async function sendWhatsAppMessage({ toPhone, text, phoneId: overridePhoneId }: SendTextMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = overridePhoneId || process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    const errorMsg = "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID in process.env.";
    console.error(`[WhatsApp Service Error] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const cleanPhone = toPhone.replace(/[^\d]/g, "");
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const messageId = response.data?.messages?.[0]?.id;
    console.log(`[WhatsApp Send Success] Message ID: ${messageId} to ${cleanPhone}`);
    return { success: true, messageId };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.error?.message || err?.message || "WhatsApp Graph API Request failed.";
    console.error("[WhatsApp Send Error]", errorMsg, "Response Data:", JSON.stringify(err?.response?.data || {}));
    return { success: false, error: errorMsg };
  }
}

/**
 * Sends media attachments (Images, Proposal PDFs, Audio Notes) to client WhatsApp.
 */
export async function sendWhatsAppMedia({ toPhone, mediaType, mediaUrl, caption, filename }: SendMediaMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    const errorMsg = "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID in process.env.";
    console.error(`[WhatsApp Media Error] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const cleanPhone = toPhone.replace(/[^\d]/g, "");
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;

  const payload: Record<string, any> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: mediaType,
  };

  payload[mediaType] = {
    link: mediaUrl,
    caption: caption || undefined,
    filename: filename || undefined,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const messageId = response.data?.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.error?.message || err?.message || "WhatsApp Media Request failed.";
    console.error("[WhatsApp Media Send Error]", errorMsg);
    return { success: false, error: errorMsg };
  }
}
