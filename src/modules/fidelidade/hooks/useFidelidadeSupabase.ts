import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FidelidadeConfig,
  FidelidadePontos,
  FidelidadeTransacao,
  FidelidadeRecompensa,
  FidelidadeBadge,
  FidelidadeIndicacao,
  FidelidadePontosComplete,
} from '../types/fidelidade.types';
import { toast } from 'sonner';

export function useFidelidadeSupabase() {
  const { user, selectedClinic } = useAuth();
  const clinic_id = selectedClinic?.id;

  const [config, setConfig] = useState<FidelidadeConfig | null>(null);
  const [pontos, setPontos] = useState<FidelidadePontosComplete[]>([]);
  const [recompensas, setRecompensas] = useState<FidelidadeRecompensa[]>([]);
  const [badges, setBadges] = useState<FidelidadeBadge[]>([]);
  const [indicacoes, setIndicacoes] = useState<FidelidadeIndicacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = async () => {
    if (!clinic_id) return;

    try {
      setLoading(true);

      // Load config
      const { data: configData, error: configError } = await supabase
        .from('fidelidade_config')
        .select('*')
        .eq('clinic_id', clinic_id)
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;
      setConfig(configData || null);

      // Load pontos with patient names
      const { data: pontosData, error: pontosError } = await supabase
        .from('fidelidade_pontos')
        .select(`
          *,
          profiles!fidelidade_pontos_patient_id_fkey (
            id,
            full_name
          )
        `)
        .eq('clinic_id', clinic_id)
        .order('pontos_disponiveis', { ascending: false });

      if (pontosError) throw pontosError;

      const pontosComplete = (pontosData || []).map((ponto: any) => ({
        ...ponto,
        patient_name: ponto.profiles?.full_name || 'Paciente',
      }));

      setPontos(pontosComplete);

      // Load recompensas
      const { data: recompensasData, error: recompensasError } = await supabase
        .from('fidelidade_recompensas')
        .select('*')
        .eq('clinic_id', clinic_id)
        .order('pontos_necessarios', { ascending: true });

      if (recompensasError) throw recompensasError;
      setRecompensas(recompensasData || []);

      // Load badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('fidelidade_badges')
        .select('*')
        .eq('clinic_id', clinic_id);

      if (badgesError) throw badgesError;
      setBadges(badgesData || []);

      // Load indicacoes
      const { data: indicacoesData, error: indicacoesError } = await supabase
        .from('fidelidade_indicacoes')
        .select(`
          *,
          profiles!fidelidade_indicacoes_indicador_id_fkey (
            id,
            full_name
          )
        `)
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (indicacoesError) throw indicacoesError;

      const indicacoesComplete = (indicacoesData || []).map((indicacao: any) => ({
        ...indicacao,
        indicador_nome: indicacao.profiles?.full_name || 'Paciente',
      }));

      setIndicacoes(indicacoesComplete);
    } catch (error: any) {
      console.error('Erro ao carregar dados de fidelidade:', error);
      toast.error('Erro ao carregar dados de fidelidade');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('fidelidade-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_config', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_pontos', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_recompensas', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_badges', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_indicacoes', filter: `clinic_id=eq.${clinic_id}` }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic_id]);

  // CRUD for config
  const updateConfig = async (updates: Partial<FidelidadeConfig>) => {
    if (!clinic_id) return;

    try {
      if (config?.id) {
        const { error } = await supabase
          .from('fidelidade_config')
          .update(updates)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fidelidade_config')
          .insert({ ...updates, clinic_id });

        if (error) throw error;
      }

      toast.success('Configuração atualizada');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar config:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  // CRUD for recompensas
  const createRecompensa = async (recompensa: Omit<FidelidadeRecompensa, 'id' | 'clinic_id'>) => {
    if (!clinic_id) return;

    try {
      const { error } = await supabase
        .from('fidelidade_recompensas')
        .insert({ ...recompensa, clinic_id });

      if (error) throw error;
      toast.success('Recompensa criada com sucesso');
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar recompensa:', error);
      toast.error('Erro ao criar recompensa');
    }
  };

  const updateRecompensa = async (id: string, updates: Partial<FidelidadeRecompensa>) => {
    try {
      const { error } = await supabase
        .from('fidelidade_recompensas')
        .update(updates)
        .eq('id', id)
        .eq('clinic_id', clinic_id);

      if (error) throw error;
      toast.success('Recompensa atualizada');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar recompensa:', error);
      toast.error('Erro ao atualizar recompensa');
    }
  };

  const deleteRecompensa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fidelidade_recompensas')
        .delete()
        .eq('id', id)
        .eq('clinic_id', clinic_id);

      if (error) throw error;
      toast.success('Recompensa removida');
      loadData();
    } catch (error: any) {
      console.error('Erro ao deletar recompensa:', error);
      toast.error('Erro ao remover recompensa');
    }
  };

  // Process loyalty points
  const processarPontos = async (patientId: string, tipo: string, valor?: number) => {
    if (!clinic_id) return;

    try {
      const { data, error } = await supabase.functions.invoke('processar-fidelidade-pontos', {
        body: { patient_id: patientId, tipo, valor },
      });

      if (error) throw error;
      toast.success('Pontos processados com sucesso');
      loadData();
      return data;
    } catch (error: any) {
      console.error('Erro ao processar pontos:', error);
      toast.error('Erro ao processar pontos de fidelidade');
    }
  };

  return {
    config,
    pontos,
    recompensas,
    badges,
    indicacoes,
    loading,
    updateConfig,
    createRecompensa,
    updateRecompensa,
    deleteRecompensa,
    processarPontos,
    loadData,
  };
}
