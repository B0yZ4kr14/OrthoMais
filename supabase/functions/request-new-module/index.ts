import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('request-new-module function started')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é ADMIN
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (rolesError || !roles?.some((r) => r.role === 'ADMIN')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar clinic_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Clinic not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinicId = profile.clinic_id

    // Parsear body
    const { module_key } = await req.json()
    if (!module_key) {
      return new Response(
        JSON.stringify({ error: 'module_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Request for module:', module_key, 'clinic:', clinicId)

    // Buscar módulo e clínica
    const { data: catalogModule } = await supabase
      .from('module_catalog')
      .select('id, name')
      .eq('module_key', module_key)
      .single()

    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', clinicId)
      .single()

    if (!catalogModule || !clinic) {
      return new Response(
        JSON.stringify({ error: 'Module or clinic not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // REGISTRAR AUDITORIA
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinicId,
      action: 'MODULE_REQUEST',
      target_module_id: catalogModule.id,
      details: { module_key, module_name: catalogModule.name, clinic_name: clinic.name },
    })

    // TODO: Em produção, enviar e-mail para vendas@orthoplus.com usando Resend
    console.log('Module request logged:', {
      clinic: clinic.name,
      module: catalogModule.name,
      user: user.email,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Solicitação enviada! Entraremos em contato para contratar o módulo "${catalogModule.name}".`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in request-new-module:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})