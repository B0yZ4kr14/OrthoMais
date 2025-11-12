import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SplitConfig, SplitTransacao, SplitComissao, SplitComissaoComplete } from '../types/split.types';
import { toast } from 'sonner';

export function useSplitSupabase() {
  const { user, selectedClinic } = useAuth();
  const clinic_id = selectedClinic?.id;

  const [configs, setConfigs] = useState<SplitConfig[]>([]);
  const [transacoes, setTransacoes] = useState<SplitTransacao[]>([]);
  const [comissoes, setComissoes] = useState<SplitComissaoComplete[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = async () => {
    if (!clinic_id) return;

    try {
      setLoading(true);

      // Load configs
      const { data: configsData, error: configsError } = await supabase
        .from('split_config')
        .select('*')
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (configsError) throw configsError;
      setConfigs(configsData || []);

      // Load transacoes
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('split_transacoes')
        .select('*')
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (transacoesError) throw transacoesError;
      setTransacoes(transacoesData || []);

      // Load comissoes with dentist names
      const mesReferencia = new Date().toISOString().slice(0, 7) + '-01';
      const { data: comissoesData, error: comissoesError } = await supabase
        .from('split_comissoes')
        .select(`
          *,
          profiles!split_comissoes_dentist_id_fkey (
            id,
            full_name
          )
        `)
        .eq('clinic_id', clinic_id)
        .eq('mes_referencia', mesReferencia)
        .order('total_comissao', { ascending: false });

      if (comissoesError) throw comissoesError;

      const comissoesComplete = (comissoesData || []).map((comissao: any) => ({
        ...comissao,
        dentist_name: comissao.profiles?.full_name || 'Dentista',
      }));

      setComissoes(comissoesComplete);
    } catch (error: any) {
      console.error('Erro ao carregar dados de split:', error);
      toast.error('Erro ao carregar dados de split');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('split-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_config', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_transacoes', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_comissoes', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic_id]);

  // CRUD for split configs
  const createConfig = async (config: Omit<SplitConfig, 'id' | 'clinic_id'>) => {
    if (!clinic_id || !user) return;

    try {
      const { error } = await supabase
        .from('split_config')
        .insert({ ...config, clinic_id });

      if (error) throw error;
      toast.success('Configuração de split criada com sucesso');
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar config:', error);
      toast.error('Erro ao criar configuração de split');
    }
  };

  const updateConfig = async (id: string, updates: Partial<SplitConfig>) => {
    try {
      const { error } = await supabase
        .from('split_config')
        .update(updates)
        .eq('id', id)
        .eq('clinic_id', clinic_id);

      if (error) throw error;
      toast.success('Configuração atualizada');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar config:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('split_config')
        .delete()
        .eq('id', id)
        .eq('clinic_id', clinic_id);

      if (error) throw error;
      toast.success('Configuração removida');
      loadData();
    } catch (error: any) {
      console.error('Erro ao deletar config:', error);
      toast.error('Erro ao remover configuração');
    }
  };

  // Process split payment
  const processarSplit = async (transacaoOrigemId: string, valorOriginal: number) => {
    if (!clinic_id) return;

    try {
      const { data, error } = await supabase.functions.invoke('processar-split-pagamento', {
        body: { transacao_origem_id: transacaoOrigemId, valor_original: valorOriginal },
      });

      if (error) throw error;
      toast.success('Split processado com sucesso');
      loadData();
      return data;
    } catch (error: any) {
      console.error('Erro ao processar split:', error);
      toast.error('Erro ao processar split de pagamento');
    }
  };

  return {
    configs,
    transacoes,
    comissoes,
    loading,
    createConfig,
    updateConfig,
    deleteConfig,
    processarSplit,
    loadData,
  };
}
