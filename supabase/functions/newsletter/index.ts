import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, source = 'popup' } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const db = createClient(supabaseUrl, supabaseKey)
      await db.from('newsletter_subscribers').upsert({ email, source: source === 'footer' ? 'footer' : 'popup' }, { onConflict: 'email' })
    }

    const confirmationHtml = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;background:#0d0d0d;color:#e8e0d4;">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="https://rasatobacco.com/rasa-logo.png" alt="RASA" style="height:80px;width:auto;display:inline-block;" />
          <p style="font-family:'Cinzel',Georgia,serif;color:#888;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;margin:8px 0 0;">SMOKE, PERFECTED</p>
        </div>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 32px;" />
        <p style="color:#b0a898;line-height:1.9;font-size:1rem;margin:0 0 20px;">Every great experience begins somewhere.</p>
        <p style="color:#b0a898;line-height:1.9;font-size:1rem;margin:0 0 20px;">Thank you for choosing to stay connected with RASA.</p>
        <p style="color:#b0a898;line-height:1.9;font-size:1rem;margin:0 0 20px;">You'll be among the first to discover new collections, product launches, exclusive updates, and special announcements.</p>
        <p style="color:#b0a898;line-height:1.9;font-size:1rem;margin:0 0 32px;">We look forward to sharing what's next.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 24px;" />
        <p style="font-family:'Cinzel',Georgia,serif;color:#c9a96e;font-size:0.95rem;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">SMOKE, PERFECTED</p>
        <p style="color:#888;font-size:0.85rem;margin:0;">— Team RASA</p>
        <p style="color:#444;font-size:0.72rem;text-align:center;margin:32px 0 0;">RASA Tobacco Partners Pvt. Ltd. · Gurugram, Haryana<br />You received this because you subscribed at rasatobacco.com</p>
      </div>
    `

    const subscriberRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'RASA <noreply@rasatobacco.com>',
        to: [email],
        subject: 'You are subscribed to the House of RASA',
        html: confirmationHtml,
      }),
    })

    const subscriberData = await subscriberRes.json()
    if (!subscriberRes.ok || subscriberData.statusCode >= 400) {
      console.error('Resend API error:', subscriberData)
      return new Response(
        JSON.stringify({ error: subscriberData.message || 'Email send failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
