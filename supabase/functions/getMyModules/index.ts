import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { corsHeaders } from '../_shared/cors.ts';

interface ModuleResponse {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  active_dependents: string[];
}

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

    // Get user's clinic_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.clinic_id) {
      return new Response(JSON.stringify({ error: 'Profile or clinic not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clinicId = profile.clinic_id;

    // Fetch all modules from catalog
    const { data: allModules, error: modulesError } = await supabaseClient
      .from('module_catalog')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (modulesError) {
      throw new Error(`Failed to fetch modules: ${modulesError.message}`);
    }

    if (!allModules || allModules.length === 0) {
      return new Response(JSON.stringify({ modules: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch clinic's subscribed modules
    const { data: clinicModules, error: clinicModulesError } = await supabaseClient
      .from('clinic_modules')
      .select('module_catalog_id, is_active')
      .eq('clinic_id', clinicId);

    if (clinicModulesError) {
      throw new Error(`Failed to fetch clinic modules: ${clinicModulesError.message}`);
    }

    // Fetch all dependencies
    const { data: dependencies, error: depsError } = await supabaseClient
      .from('module_dependencies')
      .select('module_id, depends_on_module_id');

    if (depsError) {
      throw new Error(`Failed to fetch dependencies: ${depsError.message}`);
    }

    // Get list of active module IDs
    const activeModuleIds = clinicModules
      ?.filter((cm) => cm.is_active)
      .map((cm) => cm.module_catalog_id) || [];

    // Build a map of subscribed modules
    const subscribedMap = new Map(
      clinicModules?.map((cm) => [cm.module_catalog_id, cm.is_active]) || []
    );

    // Build dependency maps
    const dependsOnMap = new Map<number, number[]>(); // module_id -> [required_module_ids]
    const requiredByMap = new Map<number, number[]>(); // module_id -> [dependent_module_ids]

    dependencies?.forEach((dep) => {
      if (!dependsOnMap.has(dep.module_id)) {
        dependsOnMap.set(dep.module_id, []);
      }
      dependsOnMap.get(dep.module_id)!.push(dep.depends_on_module_id);

      if (!requiredByMap.has(dep.depends_on_module_id)) {
        requiredByMap.set(dep.depends_on_module_id, []);
      }
      requiredByMap.get(dep.depends_on_module_id)!.push(dep.module_id);
    });

    // Build response with can_activate and can_deactivate flags
    const modulesWithStatus: ModuleResponse[] = allModules.map((module) => {
      const isSubscribed = subscribedMap.has(module.id);
      const isActive = subscribedMap.get(module.id) || false;
      const requiredModuleIds = dependsOnMap.get(module.id) || [];
      const dependentModuleIds = requiredByMap.get(module.id) || [];

      // Can activate if all required modules are active
      const unmetDependencies = requiredModuleIds.filter(
        (reqId) => !activeModuleIds.includes(reqId)
      );
      const canActivate = isSubscribed && !isActive && unmetDependencies.length === 0;

      // Can deactivate if no active module depends on it
      const activeDependents = dependentModuleIds.filter((depId) =>
        activeModuleIds.includes(depId)
      );
      const canDeactivate = isSubscribed && isActive && activeDependents.length === 0;

      // Get names of unmet dependencies
      const unmetDependencyNames = unmetDependencies
        .map((id) => allModules.find((m) => m.id === id)?.name)
        .filter(Boolean) as string[];

      const activeDependentNames = activeDependents
        .map((id) => allModules.find((m) => m.id === id)?.name)
        .filter(Boolean) as string[];

      return {
        id: module.id,
        module_key: module.module_key,
        name: module.name,
        description: module.description || '',
        category: module.category || 'Outros',
        icon: module.icon || 'Package',
        subscribed: isSubscribed,
        is_active: isActive,
        can_activate: canActivate,
        can_deactivate: canDeactivate,
        unmet_dependencies: unmetDependencyNames,
        active_dependents: activeDependentNames,
      };
    });

    return new Response(JSON.stringify({ modules: modulesWithStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in getMyModules:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
