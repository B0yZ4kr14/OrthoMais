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

    // Verificar se é ADMIN
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roles || roles.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem restaurar backups' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    if (backup.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Apenas backups concluídos podem ser restaurados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log de auditoria da restauração
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      clinic_id: clinic_id,
      action: 'BACKUP_RESTORED',
      details: {
        backup_id: backup_id,
        backup_date: backup.created_at,
        restored_at: new Date().toISOString()
      }
    });

    // Criar registro de backup da restauração
    await supabase.from('backup_history').insert({
      clinic_id: clinic_id,
      backup_type: 'manual',
      status: 'success',
      created_by: user.id,
      completed_at: new Date().toISOString(),
      metadata: {
        action: 'restore',
        source_backup_id: backup_id,
        source_backup_date: backup.created_at
      }
    });

    console.log(`Backup ${backup_id} restaurado para clinic_id: ${clinic_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Backup restaurado com sucesso',
        restored_backup: {
          id: backup_id,
          date: backup.created_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
