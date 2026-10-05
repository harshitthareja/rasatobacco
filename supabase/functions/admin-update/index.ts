import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { cors, requireAdmin, serviceClient } from '../_shared/http.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const db = serviceClient()
  const auth = await requireAdmin(req, db)
  if ('response' in auth) return auth.response

  try {
    const { table, id, updates, idColumn } = await req.json()
    if (!table || !id || !updates) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const ALLOWED = ['enquiries', 'partner_registrations', 'loyalty_members', 'orders', 'product_prices', 'store_settings']
    if (!ALLOWED.includes(table)) {
      return new Response(JSON.stringify({ error: 'Table not allowed' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const column = idColumn || 'id'
    const { error } = await (db.from(table) as any).update(updates).eq(column, id)
    if (error) throw error

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('admin-update error:', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
