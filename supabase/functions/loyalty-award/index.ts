import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIER_THRESHOLDS = [
  { name: 'Platinum', min: 40000 },
  { name: 'Gold', min: 15000 },
  { name: 'Silver', min: 5000 },
  { name: 'Bronze', min: 0 },
]

const getTier = (totalSpent: number) =>
  TIER_THRESHOLDS.find(t => totalSpent >= t.min)?.name ?? 'Bronze'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { member_id, reason, points_override } = await req.json()

    if (!member_id || !reason) {
      return new Response(JSON.stringify({ error: 'member_id and reason are required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const db = createClient(supabaseUrl, supabaseKey)

    const { data: config } = await db
      .from('loyalty_points_config')
      .select('points')
      .eq('id', reason)
      .eq('active', true)
      .single()

    const pointsToAdd = points_override ?? config?.points ?? 0
    if (pointsToAdd <= 0) {
      return new Response(JSON.stringify({ error: 'No points configured for this reason' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const ONE_TIME_REASONS = ['signup', 'profile_complete', 'birthday']
    if (ONE_TIME_REASONS.includes(reason)) {
      if (reason === 'birthday') {
        const thisYear = new Date().getFullYear()
        const { data: thisYearEntry } = await db
          .from('loyalty_points_log')
          .select('id, created_at')
          .eq('member_id', member_id)
          .eq('reason', 'birthday')
          .gte('created_at', `${thisYear}-01-01`)
          .limit(1)
        if (thisYearEntry && thisYearEntry.length > 0) {
          return new Response(JSON.stringify({ error: 'Birthday bonus already awarded this year' }), {
            status: 409, headers: { ...cors, 'Content-Type': 'application/json' }
          })
        }
      } else {
        const { data: existing } = await db
          .from('loyalty_points_log')
          .select('id')
          .eq('member_id', member_id)
          .eq('reason', reason)
          .limit(1)
        if (existing && existing.length > 0) {
          return new Response(JSON.stringify({ error: `${reason} points already awarded` }), {
            status: 409, headers: { ...cors, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    const { data: member, error: memberErr } = await db
      .from('loyalty_members')
      .select('points, total_spent')
      .eq('id', member_id)
      .single()

    if (memberErr || !member) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const newPoints = (member.points ?? 0) + pointsToAdd
    const newTier = getTier(member.total_spent ?? 0)

    const { error: updateErr } = await db
      .from('loyalty_members')
      .update({ points: newPoints, tier: newTier })
      .eq('id', member_id)

    if (updateErr) throw updateErr

    await db.from('loyalty_points_log').insert({
      member_id,
      points: pointsToAdd,
      reason,
    })

    return new Response(JSON.stringify({
      ok: true,
      points_awarded: pointsToAdd,
      new_total: newPoints,
      tier: newTier,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('loyalty-award error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
