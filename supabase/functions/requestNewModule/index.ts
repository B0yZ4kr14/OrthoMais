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

    // Get user's clinic_id and profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('clinic_id, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get clinic info
    const { data: clinic, error: clinicError } = await supabaseClient
      .from('clinics')
      .select('name')
      .eq('id', profile.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return new Response(JSON.stringify({ error: 'Clinic not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      .select('id, name, description, category')
      .eq('module_key', module_key)
      .single();

    if (moduleError || !module) {
      return new Response(JSON.stringify({ error: 'Module not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email using Resend (if configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      const emailBody = {
        from: 'Ortho+ <noreply@orthoplus.app>',
        to: ['vendas@orthoplus.app'], // Replace with actual sales email
        subject: `Nova Solicitação de Módulo - ${clinic.name}`,
        html: `
          <h2>Nova Solicitação de Contratação de Módulo</h2>
          <p><strong>Clínica:</strong> ${clinic.name}</p>
          <p><strong>Clinic ID:</strong> ${profile.clinic_id}</p>
          <p><strong>Solicitante:</strong> ${profile.full_name} (${user.email})</p>
          <hr>
          <p><strong>Módulo Solicitado:</strong> ${module.name}</p>
          <p><strong>Chave do Módulo:</strong> ${module_key}</p>
          <p><strong>Categoria:</strong> ${module.category}</p>
          <p><strong>Descrição:</strong> ${module.description}</p>
        `,
      };

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(emailBody),
      });

      if (!resendResponse.ok) {
        console.error('Failed to send email via Resend:', await resendResponse.text());
      }
    }

    // Log to audit
    await supabaseClient.from('audit_logs').insert({
      clinic_id: profile.clinic_id,
      user_id: user.id,
      action: 'MODULE_REQUEST',
      target_module_id: module.id,
      details: {
        module_key,
        module_name: module.name,
        clinic_name: clinic.name,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Solicitação de "${module.name}" enviada com sucesso! Nossa equipe de vendas entrará em contato em breve.`,
        module: {
          key: module_key,
          name: module.name,
          category: module.category,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in requestNewModule:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
