import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Download, UserX, Clock, CheckCircle2, AlertTriangle, FileText, Search, Filter } from "lucide-react";
import { useState } from "react";

// Mock data para consentimentos
const consentsData = [
  {
    id: 1,
    paciente: 'João Silva',
    email: 'joao.silva@email.com',
    tipo: 'Uso de Dados Clínicos',
    status: 'ativo',
    data_consentimento: '2024-01-15',
    data_expiracao: '2025-01-15',
    finalidade: 'Tratamento odontológico e histórico clínico'
  },
  {
    id: 2,
    paciente: 'Maria Santos',
    email: 'maria.santos@email.com',
    tipo: 'Marketing e Comunicação',
    status: 'ativo',
    data_consentimento: '2024-02-20',
    data_expiracao: '2025-02-20',
    finalidade: 'Envio de newsletters e promoções'
  },
  {
    id: 3,
    paciente: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    tipo: 'Uso de Dados Clínicos',
    status: 'revogado',
    data_consentimento: '2024-03-10',
    data_revogacao: '2024-10-15',
    finalidade: 'Tratamento odontológico e histórico clínico'
  },
  {
    id: 4,
    paciente: 'Ana Paula Costa',
    email: 'ana.costa@email.com',
    tipo: 'Compartilhamento com Laboratórios',
    status: 'ativo',
    data_consentimento: '2024-04-05',
    data_expiracao: '2025-04-05',
    finalidade: 'Envio de moldes e especificações para próteses'
  },
  {
    id: 5,
    paciente: 'Pedro Almeida',
    email: 'pedro.almeida@email.com',
    tipo: 'Uso de Dados Clínicos',
    status: 'expirado',
    data_consentimento: '2023-01-10',
    data_expiracao: '2024-01-10',
    finalidade: 'Tratamento odontológico e histórico clínico'
  }
];

// Mock data para políticas de retenção
const retentionPoliciesData = [
  {
    tipo_dado: 'Prontuário Clínico',
    periodo_retencao: '20 anos',
    status: 'ativo',
    anonimizacao_automatica: true,
    ultimo_processo: '2024-11-01'
  },
  {
    tipo_dado: 'Dados de Pagamento',
    periodo_retencao: '5 anos',
    status: 'ativo',
    anonimizacao_automatica: true,
    ultimo_processo: '2024-11-10'
  },
  {
    tipo_dado: 'Histórico de Comunicação',
    periodo_retencao: '2 anos',
    status: 'ativo',
    anonimizacao_automatica: true,
    ultimo_processo: '2024-11-08'
  },
  {
    tipo_dado: 'Logs de Acesso',
    periodo_retencao: '6 meses',
    status: 'ativo',
    anonimizacao_automatica: true,
    ultimo_processo: '2024-11-12'
  }
];

// Mock data para solicitações de dados
const dataRequestsData = [
  {
    id: 1,
    paciente: 'João Silva',
    tipo: 'Exportação de Dados',
    data_solicitacao: '2024-11-10',
    status: 'concluída',
    data_conclusao: '2024-11-11'
  },
  {
    id: 2,
    paciente: 'Maria Santos',
    tipo: 'Exclusão de Dados',
    data_solicitacao: '2024-11-08',
    status: 'em_analise',
    data_conclusao: null
  },
  {
    id: 3,
    paciente: 'Carlos Oliveira',
    tipo: 'Correção de Dados',
    data_solicitacao: '2024-11-12',
    status: 'pendente',
    data_conclusao: null
  }
];

export default function LGPDCompliance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredConsents = consentsData.filter(consent => {
    const matchesSearch = consent.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Shield}
          title="Compliance LGPD"
          description="Gestão de consentimentos, privacidade e proteção de dados pessoais"
        />
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Relatório de Conformidade
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              98% de conformidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos à Expirar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Nos próximos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anonimizações</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="retention">Políticas de Retenção</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Consentimentos */}
        <TabsContent value="consents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rastreamento de Consentimentos</CardTitle>
                  <CardDescription>
                    Gestão completa de consentimentos de pacientes para tratamento de dados
                  </CardDescription>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Consentimentos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="expirado">Expirados</SelectItem>
                    <SelectItem value="revogado">Revogados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Consentimentos */}
              <div className="space-y-4">
                {filteredConsents.map((consent) => (
                  <div
                    key={consent.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{consent.paciente}</h4>
                          <Badge
                            variant={
                              consent.status === 'ativo' ? 'default' :
                              consent.status === 'revogado' ? 'destructive' : 'secondary'
                            }
                          >
                            {consent.status === 'ativo' ? 'Ativo' :
                             consent.status === 'revogado' ? 'Revogado' : 'Expirado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{consent.email}</p>
                        <p className="text-sm mb-2">
                          <span className="font-medium">Tipo:</span> {consent.tipo}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">{consent.finalidade}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Consentimento: {new Date(consent.data_consentimento).toLocaleDateString('pt-BR')}</span>
                          {consent.data_expiracao && (
                            <span>Expira em: {new Date(consent.data_expiracao).toLocaleDateString('pt-BR')}</span>
                          )}
                          {consent.data_revogacao && (
                            <span>Revogado em: {new Date(consent.data_revogacao).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                        {consent.status === 'ativo' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Revogar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revogar Consentimento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja revogar o consentimento de {consent.paciente}?
                                  Esta ação é irreversível e o paciente será notificado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                  Confirmar Revogação
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitações */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Dados Pessoais</CardTitle>
              <CardDescription>
                Exportação, correção e exclusão de dados conforme direitos do titular
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataRequestsData.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{request.paciente}</h4>
                          <Badge
                            variant={
                              request.status === 'concluída' ? 'default' :
                              request.status === 'em_analise' ? 'secondary' : 'outline'
                            }
                          >
                            {request.status === 'concluída' ? 'Concluída' :
                             request.status === 'em_analise' ? 'Em Análise' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">
                          <span className="font-medium">Tipo de Solicitação:</span> {request.tipo}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Solicitado em: {new Date(request.data_solicitacao).toLocaleDateString('pt-BR')}</span>
                          {request.data_conclusao && (
                            <span>Concluído em: {new Date(request.data_conclusao).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'concluída' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Dados
                          </Button>
                        )}
                        {request.status !== 'concluída' && (
                          <Button variant="default" size="sm">
                            Processar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Criar Nova Solicitação</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Registre uma nova solicitação de exportação, correção ou exclusão de dados
                </p>
                <Button>
                  Nova Solicitação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Políticas de Retenção */}
        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Retenção e Anonimização</CardTitle>
              <CardDescription>
                Configuração de períodos de retenção e anonimização automática por tipo de dado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPoliciesData.map((policy, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{policy.tipo_dado}</h4>
                        <p className="text-sm text-muted-foreground">
                          Período de retenção: <span className="font-medium">{policy.periodo_retencao}</span>
                        </p>
                      </div>
                      <Badge variant={policy.status === 'ativo' ? 'default' : 'secondary'}>
                        {policy.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.anonimizacao_automatica}
                            disabled
                          />
                          <Label className="text-sm">Anonimização Automática</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Último processo: {new Date(policy.ultimo_processo).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-2">Executar Anonimização Manual</h4>
                    <p className="text-sm text-muted-foreground">
                      Force a execução do processo de anonimização para dados elegíveis
                    </p>
                  </div>
                  <Button variant="destructive">
                    <UserX className="h-4 w-4 mr-2" />
                    Executar Anonimização
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Compliance</CardTitle>
              <CardDescription>
                Configure políticas gerais de privacidade e proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações de Expiração</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar alertas automáticos quando consentimentos estiverem próximos a expirar
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Renovação Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Solicitar renovação automática de consentimentos antes da expiração
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Log de Auditoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar todas as ações relacionadas a consentimentos e dados pessoais
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Bloqueio de Dados Sem Consentimento</Label>
                    <p className="text-sm text-muted-foreground">
                      Impedir acesso a dados de pacientes sem consentimento ativo
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-2">
                  <Label>DPO (Data Protection Officer)</Label>
                  <Input defaultValue="dpo@clinica.com.br" />
                </div>

                <div className="space-y-2">
                  <Label>Prazo Padrão para Solicitações (dias)</Label>
                  <Input type="number" defaultValue="15" />
                </div>

                <div className="space-y-2">
                  <Label>Dias de Antecedência para Alerta de Expiração</Label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-6">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Conformidade</CardTitle>
              <CardDescription>
                Gere relatórios detalhados para auditorias e demonstração de conformidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Shield className="h-5 w-5 mb-2" />
                  <span className="font-medium">Relatório de Consentimentos</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Lista completa de consentimentos ativos, expirados e revogados
                  </span>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <FileText className="h-5 w-5 mb-2" />
                  <span className="font-medium">Relatório de Anonimizações</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Histórico de processos de anonimização executados
                  </span>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Clock className="h-5 w-5 mb-2" />
                  <span className="font-medium">Relatório de Solicitações</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Todas as solicitações de exportação, correção e exclusão
                  </span>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <CheckCircle2 className="h-5 w-5 mb-2" />
                  <span className="font-medium">Relatório de Conformidade Geral</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Visão completa do status de compliance LGPD da clínica
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
