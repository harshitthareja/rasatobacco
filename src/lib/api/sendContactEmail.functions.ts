import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  business: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  type: z.string().min(1),
  message: z.string().min(1),
});

const TO_ADDRESS = "admin@rasatobacco.com";
const FROM_ADDRESS = "RASA Sales <noreply@rasatobacco.com>";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export const sendContactEmail = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    const resend = new Resend(apiKey);

    const rows = [
      ["Name", data.name],
      ["Business", data.business],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Business Type", data.type],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">${k}</td><td style="padding:6px 0;color:#111">${esc(v)}</td></tr>`,
      )
      .join("");

    const adminHtml = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
        <h2 style="font-weight:400;border-bottom:1px solid #c9a96b;padding-bottom:12px">New Sales Enquiry</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">${rows}</table>
        <h3 style="margin-top:24px;font-weight:400;color:#444">Message</h3>
        <p style="white-space:pre-wrap;line-height:1.6">${esc(data.message)}</p>
      </div>`;

    const replyHtml = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
        <h2 style="font-weight:400;color:#c9a96b">Thank you, ${esc(data.name)}.</h2>
        <p style="line-height:1.7">Your enquiry has reached the RASA sales atelier. A representative will respond within one business day.</p>
        <p style="line-height:1.7;color:#666;font-size:13px">In the meantime, you may reach us on WhatsApp at <a href="https://wa.me/919090204008" style="color:#c9a96b">+91 90902 04008</a>.</p>
        <p style="margin-top:32px;font-style:italic;color:#888">— The House of RASA</p>
      </div>`;

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: TO_ADDRESS,
        replyTo: data.email,
        subject: `New Enquiry — ${data.business} (${data.type})`,
        html: adminHtml,
      });
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: data.email,
        subject: "We've received your enquiry — RASA",
        html: replyHtml,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send email";
      throw new Error(msg);
    }

    return { ok: true as const };
  });
