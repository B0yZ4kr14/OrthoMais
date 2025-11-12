import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Sparkles,
  RefreshCw,
  Calendar,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/date.utils';
import { formatCurrency } from '@/lib/utils/validation.utils';
import type { Produto, Movimentacao } from '../types/estoque.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrevisaoReposicaoProps {
  produtos: Produto[];
  movimentacoes: Movimentacao[];
}

interface Previsao {
  produto: string;
  status: 'CRITICO' | 'ALERTA' | 'NORMAL' | 'EXCESSO';
  diasAteEstoqueMinimo: number;
  diasAteEstoqueZero: number;
  dataEstimadaReposicao: string;
  quantidadeSugerida: number;
  tendencia: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  sazonalidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  confianca: number;
  justificativa: string;
  recomendacao: string;
}

interface PrevisaoResponse {
  previsoes: Previsao[];
  resumo: {
    produtosCriticos: number;
    produtosAlerta: number;
    economiaEstimada: number;
    observacoes: string;
  };
}

export function PrevisaoReposicao({ produtos, movimentacoes }: PrevisaoReposicaoProps) {
  const [previsoes, setPrevisoes] = useState<PrevisaoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const gerarPrevisoes = async () => {
    setLoading(true);
    try {
      // Filtrar produtos com movimentações suficientes para análise
      const produtosComHistorico = produtos
        .filter(p => {
          const movsProduto = movimentacoes.filter(m => m.produtoId === p.id);
          return movsProduto.length >= 5; // Mínimo 5 movimentações
        })
        .slice(0, 20); // Limitar para evitar timeout

      if (produtosComHistorico.length === 0) {
        toast.error('Nenhum produto com histórico suficiente para análise');
        return;
      }

      const dadosAnalise = produtosComHistorico.map(produto => ({
        produtoId: produto.id!,
        produtoNome: produto.nome,
        quantidadeAtual: produto.quantidadeAtual,
        quantidadeMinima: produto.quantidadeMinima,
        movimentacoes: movimentacoes
          .filter(m => m.produtoId === produto.id)
          .map(m => ({
            data: m.createdAt!,
            quantidade: m.quantidade,
            tipo: m.tipo,
          }))
          .slice(-90), // Últimas 90 movimentações
      }));

      console.log(`Gerando previsões para ${dadosAnalise.length} produtos...`);

      const { data, error } = await supabase.functions.invoke('prever-reposicao', {
        body: { produtos: dadosAnalise },
      });

      if (error) {
        console.error('Erro ao chamar função de previsão:', error);
        throw error;
      }

      if (!data || !data.previsoes) {
        throw new Error('Resposta inválida da API de previsão');
      }

      setPrevisoes(data);
      toast.success('Previsões geradas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar previsões:', error);
      toast.error(error.message || 'Erro ao gerar previsões de reposição');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CRITICO':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Crítico' };
      case 'ALERTA':
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Alerta' };
      case 'NORMAL':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Normal' };
      case 'EXCESSO':
        return { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Excesso' };
      default:
        return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Desconhecido' };
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'CRESCENTE':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'DECRESCENTE':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {!previsoes ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Previsão Inteligente de Reposição</h3>
          <p className="text-muted-foreground mb-6">
            Use inteligência artificial para prever quando seus produtos precisarão ser repostos,
            baseado em padrões históricos de consumo e sazonalidade.
          </p>
          <Button onClick={gerarPrevisoes} disabled={loading} size="lg">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Previsões
              </>
            )}
          </Button>
        </Card>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold">{previsoes.resumo.produtosCriticos}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alerta</p>
                  <p className="text-2xl font-bold">{previsoes.resumo.produtosAlerta}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Analisados</p>
                  <p className="text-2xl font-bold">{previsoes.previsoes.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economia Estimada</p>
                  <p className="text-2xl font-bold">{formatCurrency(previsoes.resumo.economiaEstimada)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Observações Gerais */}
          {previsoes.resumo.observacoes && (
            <Card className="p-4 bg-blue-500/5 border-blue-500/20">
              <p className="text-sm">
                <strong className="text-blue-600 dark:text-blue-400">💡 Insights:</strong>{' '}
                {previsoes.resumo.observacoes}
              </p>
            </Card>
          )}

          {/* Lista de Previsões */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Previsões por Produto</h3>
            <Button variant="outline" onClick={gerarPrevisoes} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          <div className="grid gap-4">
            {previsoes.previsoes
              .sort((a, b) => {
                const statusOrder = { CRITICO: 0, ALERTA: 1, NORMAL: 2, EXCESSO: 3 };
                return statusOrder[a.status] - statusOrder[b.status];
              })
              .map((previsao, index) => {
                const statusConfig = getStatusConfig(previsao.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{previsao.produto}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    {getTendenciaIcon(previsao.tendencia)}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Tendência: {previsao.tendencia.toLowerCase()}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Badge variant="secondary" className="text-xs">
                                Confiança: {(previsao.confianca * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Estoque Mínimo</p>
                            <p className="font-semibold">
                              {previsao.diasAteEstoqueMinimo >= 999 
                                ? 'Suficiente' 
                                : `${previsao.diasAteEstoqueMinimo} dias`}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Estoque Zero</p>
                            <p className="font-semibold">
                              {previsao.diasAteEstoqueZero >= 999 
                                ? 'Suficiente' 
                                : `${previsao.diasAteEstoqueZero} dias`}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Repor Até</p>
                            <p className="font-semibold flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(previsao.dataEstimadaReposicao)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Qtd. Sugerida</p>
                            <p className="font-semibold">{previsao.quantidadeSugerida} un</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs">
                              Sazonalidade: {previsao.sazonalidade}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Análise:</strong> {previsao.justificativa}
                          </p>
                          <p className="text-sm">
                            <strong className="text-primary">✓ Recomendação:</strong> {previsao.recomendacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}