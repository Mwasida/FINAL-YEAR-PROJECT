import { createFileRoute } from '@tanstack/react-router'

const DEFAULTS = [
  { email: 'admin@agrisage.local', password: 'Admin@12345', full_name: 'Default Admin', role: 'admin' as const },
  { email: 'farmer@agrisage.local', password: 'Farmer@12345', full_name: 'Default Farmer', role: 'farmer' as const },
]

async function ensureUser(supabaseAdmin: any, u: typeof DEFAULTS[number]) {
  // Try to find existing user by listing (small dataset for local dev)
  const { data: list } = await supabaseAdmin.auth.admin.listUsers()
  let user = list?.users?.find((x: any) => x.email === u.email)
  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    })
    if (error) throw error
    user = data.user
  }
  if (!user) throw new Error(`Failed to ensure user ${u.email}`)

  // Upsert role
  await supabaseAdmin.from('user_roles').upsert(
    { user_id: user.id, role: u.role },
    { onConflict: 'user_id,role' },
  )

  return { email: u.email, role: u.role, password: u.password }
}

export const Route = createFileRoute('/api/public/seed-defaults')({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
        const results = []
        for (const u of DEFAULTS) {
          results.push(await ensureUser(supabaseAdmin, u))
        }
        return new Response(JSON.stringify({ ok: true, users: results }, null, 2), {
          headers: { 'content-type': 'application/json' },
        })
      },
      GET: async () => {
        return new Response(
          JSON.stringify({
            message: 'POST to this endpoint to create default admin and farmer accounts.',
            defaults: DEFAULTS.map((d) => ({ email: d.email, role: d.role })),
          }, null, 2),
          { headers: { 'content-type': 'application/json' } },
        )
      },
    },
  },
})
