import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { backup_id, clinic_id } = await req.json();

    if (!backup_id || !clinic_id) {
      return new Response(
        JSON.stringify({ error: 'backup_id e clinic_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se usuário tem acesso à clínica
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.clinic_id !== clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado a esta clínica' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar informações do backup
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('id', backup_id)
      .eq('clinic_id', clinic_id)
      .single();

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para demonstração, vamos recriar o conteúdo do backup
    // Em produção, você buscaria do storage
    const { data: exportData, error: exportError } = await supabase.functions.invoke('export-clinic-data', {
      body: { format: backup.format || 'json', clinic_id: clinic_id }
    });

    if (exportError) throw exportError;

    console.log(`Download de backup ${backup_id} para clinic_id: ${clinic_id}`);

    return new Response(
      JSON.stringify({ content: exportData.content }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao baixar backup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
