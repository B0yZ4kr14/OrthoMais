import { useState } from 'react';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/validation.utils';
import { useSplitSupabase } from '@/modules/split-pagamento/hooks/useSplitSupabase';
import { SplitConfigForm } from '@/components/split-pagamento/SplitConfigForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function SplitPagamento() {
  const { configs, transacoes, comissoes, loading } = useSplitSupabase();
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  const totalVendas = comissoes.reduce((acc, c) => acc + c.total_vendas, 0);
  const totalComissoes = comissoes.reduce((acc, c) => acc + c.total_comissao, 0);
  const totalPago = comissoes.reduce((acc, c) => acc + c.total_pago, 0);
  const totalPendente = comissoes.reduce((acc, c) => acc + c.total_pendente, 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'default';
      case 'PENDENTE': return 'warning';
      case 'PROCESSANDO': return 'info';
      case 'FALHA': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'Concluído';
      case 'PENDENTE': return 'Pendente';
      case 'PROCESSANDO': return 'Processando';
      case 'FALHA': return 'Falha';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        icon={DollarSign}
        title="Split de Pagamento"
        description="Gestão automática de comissões e repasses para dentistas parceiros"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVendas)}</div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalComissoes)}</div>
            <p className="text-xs text-muted-foreground">A repassar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Já Pago</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
            <p className="text-xs text-muted-foreground">Via PIX</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-muted-foreground">A processar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comissoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comissoes">Dashboard de Comissões</TabsTrigger>
          <TabsTrigger value="transacoes">Transações de Split</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="comissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comissões por Dentista - Mês Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comissoes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma comissão registrada este mês
                  </p>
                ) : (
                  comissoes.map((comissao) => (
                    <Card key={comissao.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{comissao.dentist_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Split médio: {((comissao.total_comissao / comissao.total_vendas) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <Button size="sm">Processar Repasse PIX</Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Vendas</p>
                          <p className="font-semibold">{formatCurrency(comissao.total_vendas)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Comissão</p>
                          <p className="font-semibold">{formatCurrency(comissao.total_comissao)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pago</p>
                          <p className="font-semibold text-green-600">{formatCurrency(comissao.total_pago)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pendente</p>
                          <p className="font-semibold text-amber-600">{formatCurrency(comissao.total_pendente)}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações de Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transacoes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transação registrada ainda
                  </p>
                ) : (
                  transacoes.map((transacao) => (
                    <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">Dentista ID: {transacao.dentist_id}</div>
                        <div className="text-sm text-muted-foreground">
                          Transação Origem: {transacao.transacao_origem_id}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-medium">
                          {formatCurrency(transacao.valor_split)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transacao.percentual_split}% de {formatCurrency(transacao.valor_original)}
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(transacao.status)}>
                        {getStatusLabel(transacao.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Configuração de Split por Dentista</CardTitle>
              <Button onClick={() => setConfigFormOpen(true)}>Nova Configuração</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure o percentual de split e chave PIX para cada dentista parceiro
              </p>
              {configs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma configuração de split cadastrada ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{config.dentist_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.percentual_dentista}% dentista / {config.percentual_clinica}% clínica
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingConfig(config);
                          setConfigFormOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SplitConfigForm
        open={configFormOpen}
        onOpenChange={(open) => {
          setConfigFormOpen(open);
          if (!open) setEditingConfig(null);
        }}
        dentistas={[]}
        procedimentos={[]}
        editingConfig={editingConfig}
      />
    </div>
  );
}
