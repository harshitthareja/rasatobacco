import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { z } from "zod";

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  from: z.string().email().optional(),
});

export const sendEmail = createServerFn({ method: "POST" })
  .inputValidator(sendEmailSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(apiKey);

    return resend.emails.send({
      from: data.from ?? "onboarding@resend.dev",
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  });
