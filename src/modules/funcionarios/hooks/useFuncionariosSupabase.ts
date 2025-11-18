import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Funcionario, FuncionarioFilters } from '../types/funcionario.types';
import { toast } from 'sonner';

interface FuncionarioRow {
  id: string;
  clinic_id: string;
  nome: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  celular: string;
  email: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  cargo: string;
  data_admissao: string;
  salario: number;
  permissoes: Record<string, string[]>;
  horario_trabalho: {
    inicio: string;
    fim: string;
  };
  dias_trabalho: number[];
  observacoes: string | null;
  status: string;
  user_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToFuncionario(row: any): Funcionario {
  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    rg: row.rg || undefined,
    dataNascimento: row.data_nascimento,
    sexo: row.sexo as 'M' | 'F' | 'Outro',
    telefone: row.telefone,
    celular: row.celular,
    email: row.email,
    endereco: row.endereco as any,
    cargo: row.cargo as any,
    dataAdmissao: row.data_admissao,
    salario: Number(row.salario),
    permissoes: row.permissoes as any,
    horarioTrabalho: row.horario_trabalho as any,
    diasTrabalho: row.dias_trabalho,
    observacoes: row.observacoes || undefined,
    status: row.status as any,
    senhaAcesso: undefined,
    avatar_url: row.avatar_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFuncionarioToRow(funcionario: Funcionario, clinicId: string): any {
  return {
    clinic_id: clinicId,
    nome: funcionario.nome,
    cpf: funcionario.cpf,
    rg: funcionario.rg || null,
    data_nascimento: funcionario.dataNascimento,
    sexo: funcionario.sexo,
    telefone: funcionario.telefone,
    celular: funcionario.celular,
    email: funcionario.email,
    endereco: funcionario.endereco as any,
    cargo: funcionario.cargo,
    data_admissao: funcionario.dataAdmissao,
    salario: funcionario.salario,
    permissoes: funcionario.permissoes as any,
    horario_trabalho: funcionario.horarioTrabalho as any,
    dias_trabalho: funcionario.diasTrabalho,
    observacoes: funcionario.observacoes || null,
    status: funcionario.status,
    avatar_url: funcionario.avatar_url || null,
  };
}

export function useFuncionariosSupabase() {
  const { clinicId } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFuncionarios = async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('nome', { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map(mapRowToFuncionario);
      setFuncionarios(mapped);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuncionarios();
  }, [clinicId]);

  const addFuncionario = async (funcionario: Funcionario) => {
    if (!clinicId) {
      toast.error('Clínica não identificada');
      return;
    }

    try {
      const rowData = mapFuncionarioToRow(funcionario, clinicId);
      const { data, error } = await supabase
        .from('funcionarios')
        .insert(rowData)
        .select()
        .single();

      if (error) throw error;

      const newFuncionario = mapRowToFuncionario(data);
      setFuncionarios((prev) => [...prev, newFuncionario]);
      toast.success('Funcionário cadastrado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar funcionário:', error);
      if (error.code === '23505') {
        toast.error('CPF já cadastrado para esta clínica');
      } else {
        toast.error('Erro ao cadastrar funcionário');
      }
    }
  };

  const updateFuncionario = async (id: string, funcionario: Funcionario) => {
    if (!clinicId) {
      toast.error('Clínica não identificada');
      return;
    }

    try {
      const rowData = mapFuncionarioToRow(funcionario, clinicId);
      const { data, error } = await supabase
        .from('funcionarios')
        .update(rowData)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw error;

      const updatedFuncionario = mapRowToFuncionario(data);
      setFuncionarios((prev) =>
        prev.map((f) => (f.id === id ? updatedFuncionario : f))
      );
      toast.success('Funcionário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error('Erro ao atualizar funcionário');
    }
  };

  const deleteFuncionario = async (id: string) => {
    if (!clinicId) {
      toast.error('Clínica não identificada');
      return;
    }

    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
      toast.success('Funcionário removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      toast.error('Erro ao remover funcionário');
    }
  };

  const filterFuncionarios = (filters: FuncionarioFilters): Funcionario[] => {
    return funcionarios.filter((funcionario) => {
      const matchesSearch = !filters.search || 
        funcionario.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        funcionario.cpf.includes(filters.search) ||
        funcionario.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || funcionario.status === filters.status;
      const matchesCargo = !filters.cargo || funcionario.cargo === filters.cargo;

      return matchesSearch && matchesStatus && matchesCargo;
    });
  };

  return {
    funcionarios,
    loading,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
    filterFuncionarios,
    reloadFuncionarios: loadFuncionarios,
  };
}
