import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const url = new URL(req.url)
    const member_id = url.searchParams.get('member_id')

    if (!member_id) {
      return new Response(JSON.stringify({ error: 'member_id is required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const db = createClient(supabaseUrl, supabaseKey)

    const [memberRes, logRes] = await Promise.all([
      db.from('loyalty_members').select('*').eq('id', member_id).single(),
      db.from('loyalty_points_log').select('*').eq('member_id', member_id).order('created_at', { ascending: false }).limit(20),
    ])

    if (memberRes.error || !memberRes.data) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      member: memberRes.data,
      history: logRes.data ?? [],
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('loyalty-profile error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
