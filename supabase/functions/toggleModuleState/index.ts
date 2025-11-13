import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is ADMIN
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ADMIN');

    if (rolesError || !roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden: ADMIN role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's clinic_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clinicId = profile.clinic_id;

    // Parse request body
    const { module_key } = await req.json();

    if (!module_key) {
      return new Response(JSON.stringify({ error: 'module_key is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find module in catalog
    const { data: module, error: moduleError } = await supabaseClient
      .from('module_catalog')
      .select('id, name')
      .eq('module_key', module_key)
      .single();

    if (moduleError || !module) {
      return new Response(JSON.stringify({ error: 'Module not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find clinic_module record
    const { data: clinicModule, error: clinicModuleError } = await supabaseClient
      .from('clinic_modules')
      .select('id, is_active')
      .eq('clinic_id', clinicId)
      .eq('module_catalog_id', module.id)
      .single();

    if (clinicModuleError || !clinicModule) {
      return new Response(JSON.stringify({ error: 'Module not subscribed to this clinic' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newState = !clinicModule.is_active;

    // PRAXEOLOGICAL LOGIC: Check dependencies before toggling
    if (newState === true) {
      // ACTIVATING: Check if all required modules are active
      const { data: dependencies, error: depsError } = await supabaseClient
        .from('module_dependencies')
        .select('depends_on_module_id')
        .eq('module_id', module.id);

      if (depsError) throw depsError;

      if (dependencies && dependencies.length > 0) {
        const requiredModuleIds = dependencies.map((d) => d.depends_on_module_id);

        // Check if all required modules are active
        const { data: activeModules, error: activeError } = await supabaseClient
          .from('clinic_modules')
          .select('module_catalog_id')
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .in('module_catalog_id', requiredModuleIds);

        if (activeError) throw activeError;

        const activeModuleIds = activeModules?.map((m) => m.module_catalog_id) || [];
        const missingModuleIds = requiredModuleIds.filter((id) => !activeModuleIds.includes(id));

        if (missingModuleIds.length > 0) {
          // Fetch names of missing modules
          const { data: missingModules } = await supabaseClient
            .from('module_catalog')
            .select('name')
            .in('id', missingModuleIds);

          const missingNames = missingModules?.map((m) => m.name).join(', ') || 'unknown';

          return new Response(
            JSON.stringify({
              error: `Falha ao ativar. Requer o(s) módulo(s): ${missingNames}`,
            }),
            {
              status: 412, // Precondition Failed
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    } else {
      // DEACTIVATING: Check if any active module depends on this one
      const { data: dependents, error: depsError } = await supabaseClient
        .from('module_dependencies')
        .select('module_id')
        .eq('depends_on_module_id', module.id);

      if (depsError) throw depsError;

      if (dependents && dependents.length > 0) {
        const dependentModuleIds = dependents.map((d) => d.module_id);

        // Check if any dependent modules are active
        const { data: activeDependents, error: activeError } = await supabaseClient
          .from('clinic_modules')
          .select('module_catalog_id')
          .eq('clinic_id', clinicId)
          .eq('is_active', true)
          .in('module_catalog_id', dependentModuleIds);

        if (activeError) throw activeError;

        if (activeDependents && activeDependents.length > 0) {
          // Fetch names of active dependents
          const { data: activeDepModules } = await supabaseClient
            .from('module_catalog')
            .select('name')
            .in('id', activeDependents.map((m) => m.module_catalog_id));

          const depNames = activeDepModules?.map((m) => m.name).join(', ') || 'unknown';

          return new Response(
            JSON.stringify({
              error: `Falha ao desativar. O(s) módulo(s) ${depNames} deve(m) ser desativado(s) primeiro.`,
            }),
            {
              status: 412, // Precondition Failed
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }

    // All checks passed, perform the toggle
    const { data: updated, error: updateError } = await supabaseClient
      .from('clinic_modules')
      .update({ is_active: newState })
      .eq('id', clinicModule.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log to audit
    await supabaseClient.from('audit_logs').insert({
      clinic_id: clinicId,
      user_id: user.id,
      action: newState ? 'MODULE_ACTIVATED' : 'MODULE_DEACTIVATED',
      target_module_id: module.id,
      details: {
        module_key,
        module_name: module.name,
      },
    });

    const message = newState 
      ? `Módulo "${module.name}" ativado com sucesso!`
      : `Módulo "${module.name}" desativado com sucesso!`;

    return new Response(JSON.stringify({ 
      success: true, 
      message,
      clinic_module: updated 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in toggleModuleState:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
