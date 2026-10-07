import { supabase } from "@/integrations/supabase/client";

export type NewsletterSource = "footer" | "popup";

export async function subscribeToNewsletter(email: string, source: NewsletterSource) {
  const normalizedEmail = email.trim().toLowerCase();

  const { error: insertError } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: normalizedEmail, source });

  if (insertError && insertError.code !== "23505") throw insertError;

  // Confirmation email delivery is best-effort. The subscription remains saved
  // even if the mail provider is temporarily unavailable.
  const { error: emailError } = await supabase.functions.invoke("newsletter", {
    body: { email: normalizedEmail, source },
  });

  if (emailError) {
    console.warn("Newsletter confirmation email could not be sent", emailError);
  }

  return { confirmationSent: !emailError };
}
