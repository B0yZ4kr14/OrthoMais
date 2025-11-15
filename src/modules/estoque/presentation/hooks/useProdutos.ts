import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SupabaseProdutoRepository } from '../../infrastructure/repositories/SupabaseProdutoRepository';
import { SupabaseMovimentacaoEstoqueRepository } from '../../infrastructure/repositories/SupabaseMovimentacaoEstoqueRepository';
import { CreateProdutoUseCase } from '../../application/use-cases/CreateProdutoUseCase';
import { UpdateProdutoUseCase } from '../../application/use-cases/UpdateProdutoUseCase';
import { ListProdutosByClinicUseCase } from '../../application/use-cases/ListProdutosByClinicUseCase';
import { RegistrarEntradaUseCase } from '../../application/use-cases/RegistrarEntradaUseCase';
import { RegistrarSaidaUseCase } from '../../application/use-cases/RegistrarSaidaUseCase';
import { AjustarEstoqueUseCase } from '../../application/use-cases/AjustarEstoqueUseCase';
import type { 
  CreateProdutoInput,
  UpdateProdutoInput,
  ListProdutosByClinicInput,
  RegistrarEntradaInput,
  RegistrarSaidaInput,
  AjustarEstoqueInput
} from '../../application/use-cases';

const produtoRepository = new SupabaseProdutoRepository();
const movimentacaoRepository = new SupabaseMovimentacaoEstoqueRepository();

export const useProdutos = () => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: ['produtos', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const useCase = new ListProdutosByClinicUseCase(produtoRepository);
      const result = await useCase.execute({ clinicId });
      return result.produtos;
    },
    enabled: !!clinicId,
  });

  const createProduto = useMutation({
    mutationFn: async (input: Omit<CreateProdutoInput, 'clinicId'>) => {
      if (!clinicId) throw new Error('Clínica não identificada');
      const useCase = new CreateProdutoUseCase(produtoRepository);
      return useCase.execute({ ...input, clinicId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos', clinicId] });
      toast.success('Produto criado com sucesso');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateProduto = useMutation({
    mutationFn: async (input: UpdateProdutoInput) => {
      const useCase = new UpdateProdutoUseCase(produtoRepository);
      return useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos', clinicId] });
      toast.success('Produto atualizado');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const registrarEntrada = useMutation({
    mutationFn: async (input: RegistrarEntradaInput) => {
      const useCase = new RegistrarEntradaUseCase(produtoRepository, movimentacaoRepository);
      return useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos', clinicId] });
      toast.success('Entrada registrada');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const registrarSaida = useMutation({
    mutationFn: async (input: RegistrarSaidaInput) => {
      const useCase = new RegistrarSaidaUseCase(produtoRepository, movimentacaoRepository);
      return useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos', clinicId] });
      toast.success('Saída registrada');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const ajustarEstoque = useMutation({
    mutationFn: async (input: AjustarEstoqueInput) => {
      const useCase = new AjustarEstoqueUseCase(produtoRepository, movimentacaoRepository);
      return useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos', clinicId] });
      toast.success('Estoque ajustado');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    produtos,
    produtosEstoqueBaixo: produtos.filter(p => p.quantidadeAtual <= p.quantidadeMinima),
    produtosZerados: produtos.filter(p => p.quantidadeAtual === 0),
    valorTotalEstoque: produtos.reduce((acc, p) => acc + (p.quantidadeAtual * p.valorUnitario), 0),
    isLoading,
    error,
    createProduto: createProduto.mutateAsync,
    updateProduto: updateProduto.mutateAsync,
    registrarEntrada: registrarEntrada.mutateAsync,
    registrarSaida: registrarSaida.mutateAsync,
    ajustarEstoque: ajustarEstoque.mutateAsync,
    isCreating: createProduto.isPending,
    isUpdating: updateProduto.isPending,
  };
};
