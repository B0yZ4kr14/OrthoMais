import { useQuery } from '@tanstack/react-query';
import { SupabaseMovimentacaoEstoqueRepository } from '../../infrastructure/repositories/SupabaseMovimentacaoEstoqueRepository';
import { GetMovimentacoesByProdutoUseCase } from '../../application/use-cases/GetMovimentacoesByProdutoUseCase';

const movimentacaoRepository = new SupabaseMovimentacaoEstoqueRepository();

export const useMovimentacoes = (produtoId?: string) => {
  const { data: movimentacoes = [], isLoading, error } = useQuery({
    queryKey: ['movimentacoes', produtoId],
    queryFn: async () => {
      if (!produtoId) return [];
      const useCase = new GetMovimentacoesByProdutoUseCase(movimentacaoRepository);
      const result = await useCase.execute({ produtoId });
      return result.movimentacoes;
    },
    enabled: !!produtoId,
  });

  return { movimentacoes, isLoading, error };
};
