import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log('toggle-module-state function started')

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

    console.log('Toggle request for module:', module_key, 'clinic:', clinicId)

    // Buscar módulo no catálogo
    const { data: catalogModule, error: catalogError } = await supabase
      .from('module_catalog')
      .select('id')
      .eq('module_key', module_key)
      .single()

    if (catalogError || !catalogModule) {
      return new Response(
        JSON.stringify({ error: 'Module not found in catalog' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar registro em clinic_modules
    const { data: clinicModule, error: clinicModuleError } = await supabase
      .from('clinic_modules')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('module_catalog_id', catalogModule.id)
      .single()

    if (clinicModuleError || !clinicModule) {
      return new Response(
        JSON.stringify({ error: 'Module not subscribed by clinic' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newState = !clinicModule.is_active
    console.log('Current state:', clinicModule.is_active, 'New state:', newState)

    // VERIFICAÇÕES DE DEPENDÊNCIAS (Lógica Praxeológica)
    if (newState === true) {
      // Tentando ATIVAR - verificar dependências
      const { data: dependencies } = await supabase
        .from('module_dependencies')
        .select('depends_on_module_id')
        .eq('module_id', catalogModule.id)

      if (dependencies && dependencies.length > 0) {
        const requiredIds = dependencies.map((d) => d.depends_on_module_id)

        const { data: activeModules } = await supabase
          .from('clinic_modules')
          .select('module_catalog_id')
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .in('module_catalog_id', requiredIds)

        const activeIds = new Set(activeModules?.map((m) => m.module_catalog_id) || [])
        const missingDeps = requiredIds.filter((id) => !activeIds.has(id))

        if (missingDeps.length > 0) {
          const { data: missingModules } = await supabase
            .from('module_catalog')
            .select('name')
            .in('id', missingDeps)

          const missingNames = missingModules?.map((m) => m.name).join(', ') || 'unknown'

          return new Response(
            JSON.stringify({
              error: `Falha ao ativar. Requer o(s) módulo(s): ${missingNames}`,
              code: 'UNMET_DEPENDENCIES',
            }),
            { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    } else {
      // Tentando DESATIVAR - verificar dependências reversas
      const { data: reverseDeps } = await supabase
        .from('module_dependencies')
        .select('module_id')
        .eq('depends_on_module_id', catalogModule.id)

      if (reverseDeps && reverseDeps.length > 0) {
        const dependentIds = reverseDeps.map((d) => d.module_id)

        const { data: activeDependents } = await supabase
          .from('clinic_modules')
          .select('module_catalog_id')
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .in('module_catalog_id', dependentIds)

        if (activeDependents && activeDependents.length > 0) {
          const { data: dependentModules } = await supabase
            .from('module_catalog')
            .select('name')
            .in('id', activeDependents.map((m) => m.module_catalog_id))

          const dependentNames = dependentModules?.map((m) => m.name).join(', ') || 'unknown'

          return new Response(
            JSON.stringify({
              error: `Falha ao desativar. O(s) módulo(s) ${dependentNames} deve(m) ser desativado(s) primeiro.`,
              code: 'BLOCKING_DEPENDENCIES',
            }),
            { status: 412, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // EXECUTAR TOGGLE
    const { data: updatedModule, error: updateError } = await supabase
      .from('clinic_modules')
      .update({ is_active: newState })
      .eq('id', clinicModule.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // REGISTRAR AUDITORIA
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinicId,
      action: newState ? 'MODULE_ACTIVATED' : 'MODULE_DEACTIVATED',
      target_module_id: catalogModule.id,
      details: { module_key, previous_state: clinicModule.is_active, new_state: newState },
    })

    console.log('Module toggled successfully:', module_key, 'new state:', newState)

    return new Response(
      JSON.stringify({ success: true, module: updatedModule }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in toggle-module-state:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})