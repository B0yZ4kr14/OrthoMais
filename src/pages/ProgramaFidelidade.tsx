import { useState } from 'react';
import { Award, Gift, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ProgramaFidelidade() {
  // Mock data
  const pacientes = [
    {
      id: '1',
      nome: 'Ana Silva',
      pontos_disponiveis: 450,
      pontos_totais: 1200,
      nivel: 'OURO',
      badges: ['Paciente VIP', 'Fiel 1 Ano', 'Indicador Top'],
    },
    {
      id: '2',
      nome: 'Carlos Santos',
      pontos_disponiveis: 180,
      pontos_totais: 350,
      nivel: 'BRONZE',
      badges: ['Novo Membro'],
    },
  ];

  const recompensas = [
    {
      id: '1',
      nome: 'Limpeza Grátis',
      descricao: 'Uma sessão de limpeza completa',
      pontos_necessarios: 300,
      tipo: 'PROCEDIMENTO_GRATIS',
      ativo: true,
    },
    {
      id: '2',
      nome: '20% Desconto',
      descricao: 'Desconto em qualquer procedimento',
      pontos_necessarios: 500,
      tipo: 'DESCONTO_PERCENTUAL',
      ativo: true,
    },
    {
      id: '3',
      nome: 'Kit Dental Premium',
      descricao: 'Kit com escova elétrica e fio dental',
      pontos_necessarios: 200,
      tipo: 'BRINDE',
      ativo: true,
    },
  ];

  const indicacoes = [
    {
      id: '1',
      indicador_nome: 'Ana Silva',
      indicado_nome: 'Pedro Costa',
      indicado_telefone: '(11) 99999-8888',
      status: 'COMPARECEU',
      pontos_concedidos: 50,
      created_at: '2024-01-10',
    },
    {
      id: '2',
      indicador_nome: 'Carlos Santos',
      indicado_nome: 'Mariana Oliveira',
      indicado_telefone: '(11) 98888-7777',
      status: 'AGENDADO',
      pontos_concedidos: null,
      created_at: '2024-01-15',
    },
  ];

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'DIAMANTE': return 'text-cyan-500';
      case 'PLATINA': return 'text-slate-400';
      case 'OURO': return 'text-yellow-500';
      case 'PRATA': return 'text-gray-400';
      case 'BRONZE': return 'text-amber-700';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIndicacaoVariant = (status: string) => {
    switch (status) {
      case 'COMPARECEU': return 'default';
      case 'AGENDADO': return 'info';
      case 'PENDENTE': return 'warning';
      case 'NAO_COMPARECEU': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        icon={Award}
        title="Programa de Fidelidade"
        description="Sistema de pontos, recompensas e gamificação para engajamento de pacientes"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Ativos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.8K</div>
            <p className="text-xs text-muted-foreground">Em circulação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resgates</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Novos pacientes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pacientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pacientes">Pacientes & Pontos</TabsTrigger>
          <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pacientes.map((paciente, index) => (
                  <Card key={paciente.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-muted-foreground">#{index + 1}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{paciente.nome}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getNivelColor(paciente.nivel)}>
                              {paciente.nivel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {paciente.pontos_totais} pontos totais
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {paciente.pontos_disponiveis}
                        </div>
                        <p className="text-sm text-muted-foreground">pontos disponíveis</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso para próximo nível</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <Progress value={75} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {paciente.badges.map((badge, i) => (
                        <Badge key={i} variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recompensas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Catálogo de Recompensas</CardTitle>
              <Button>Adicionar Recompensa</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recompensas.map((recompensa) => (
                  <Card key={recompensa.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Gift className="h-8 w-8 text-primary" />
                      <Badge variant={recompensa.ativo ? 'default' : 'secondary'}>
                        {recompensa.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{recompensa.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{recompensa.descricao}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{recompensa.pontos_necessarios}</span>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Indicação Premiada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {indicacoes.map((indicacao) => (
                  <div key={indicacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{indicacao.indicador_nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Indicou: {indicacao.indicado_nome} • {indicacao.indicado_telefone}
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(indicacao.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {indicacao.pontos_concedidos && (
                        <div className="font-medium text-green-600">
                          +{indicacao.pontos_concedidos} pontos
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusIndicacaoVariant(indicacao.status)}>
                      {indicacao.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Badges Compartilháveis</CardTitle>
              <Button>Criar Badge</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure badges que pacientes podem conquistar e compartilhar nas redes sociais
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Programa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pontos por Consulta</label>
                  <input type="number" className="w-full mt-1 p-2 border rounded" defaultValue={10} />
                </div>
                <div>
                  <label className="text-sm font-medium">Pontos por R$ Gasto</label>
                  <input type="number" step="0.1" className="w-full mt-1 p-2 border rounded" defaultValue={1} />
                </div>
                <div>
                  <label className="text-sm font-medium">Pontos por Indicação</label>
                  <input type="number" className="w-full mt-1 p-2 border rounded" defaultValue={50} />
                </div>
                <div>
                  <label className="text-sm font-medium">Validade dos Pontos (dias)</label>
                  <input type="number" className="w-full mt-1 p-2 border rounded" defaultValue={365} />
                </div>
              </div>
              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
