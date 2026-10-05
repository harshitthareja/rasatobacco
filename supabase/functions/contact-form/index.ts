import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c: string) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c))

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { name, business, email, phone, type, message, user_id } = await req.json()

    if (!name || !business || !email || !phone || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!apiKey) return new Response(JSON.stringify({ error: 'Server config error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })

    if (supabaseUrl && supabaseKey) {
      const db = createClient(supabaseUrl, supabaseKey)
      await db.from('enquiries').insert({ name, business, email, phone, type: type || 'Other', message, user_id: user_id || null })
    }

    const rows = [
      ['Name', name], ['Business', business], ['Email', email],
      ['Phone', phone], ['Business Type', type || 'Other'],
    ].map(([k, v]) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">${k}</td><td style="padding:6px 0;color:#111">${esc(v)}</td></tr>`
    ).join('')

    const adminHtml = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
        <h2 style="font-weight:400;border-bottom:1px solid #c9a96b;padding-bottom:12px">New Sales Enquiry — RASA</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">${rows}</table>
        <h3 style="margin-top:24px;font-weight:400;color:#444">Message</h3>
        <p style="white-space:pre-wrap;line-height:1.6">${esc(message)}</p>
      </div>`

    const replyHtml = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
        <h2 style="font-weight:400;color:#c9a96b">Thank you, ${esc(name)}.</h2>
        <p style="line-height:1.7">Your enquiry has reached the RASA sales atelier. A representative will respond within one business day.</p>
        <p style="line-height:1.7;color:#666;font-size:13px">In the meantime, reach us on WhatsApp at <a href="https://wa.me/919090204008" style="color:#c9a96b">+91 90902 04008</a>.</p>
        <p style="margin-top:32px;font-style:italic;color:#888">— The House of RASA</p>
      </div>`

    await Promise.allSettled([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'RASA Sales <noreply@rasatobacco.com>', to: ['admin@rasatobacco.com'], replyTo: email, subject: `New Enquiry — ${business} (${type || 'Other'})`, html: adminHtml }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'RASA Sales <noreply@rasatobacco.com>', to: [email], subject: "We've received your enquiry — RASA", html: replyHtml }),
      }),
    ])

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('contact-form error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
