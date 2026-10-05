import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get members with birthday this month
    const { data: members } = await db
      .from('loyalty_members')
      .select('id, name, email, birthday')
      .not('birthday', 'is', null)

    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ ok: true, awarded: 0 }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    let awarded = 0
    for (const member of members) {
      const bday = new Date(member.birthday)
      if (bday.getMonth() + 1 !== currentMonth) continue

      // Check if already awarded this year
      const { data: existing } = await db
        .from('loyalty_points_log')
        .select('id')
        .eq('member_id', member.id)
        .eq('reason', 'birthday')
        .gte('created_at', `${currentYear}-01-01`)
        .limit(1)

      if (existing && existing.length > 0) continue

      // Award birthday bonus
      const { data: current } = await db.from('loyalty_members').select('points').eq('id', member.id).single()
      if (!current) continue

      await db.from('loyalty_members').update({ points: (current.points ?? 0) + 200 }).eq('id', member.id)
      await db.from('loyalty_points_log').insert({ member_id: member.id, points: 200, reason: 'birthday' })
      awarded++
    }

    return new Response(JSON.stringify({ ok: true, awarded }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('birthday-check error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
