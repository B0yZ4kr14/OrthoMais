import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { BarChart3, TrendingUp, AlertTriangle, Bell, Download, Plus, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExportDashboardDialog } from '@/components/bi/ExportDashboardDialog';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

// Mock data
const revenueData = [
  { month: 'Jan', receita: 45000, meta: 50000 },
  { month: 'Fev', receita: 52000, meta: 50000 },
  { month: 'Mar', receita: 48000, meta: 50000 },
  { month: 'Abr', receita: 61000, meta: 55000 },
  { month: 'Mai', receita: 58000, meta: 55000 },
  { month: 'Jun', receita: 67000, meta: 60000 },
];

const procedureData = [
  { name: 'Restaurações', value: 145 },
  { name: 'Profilaxia', value: 98 },
  { name: 'Endodontia', value: 52 },
  { name: 'Extrações', value: 34 },
];

const alertsData = [
  { id: 1, type: 'critical', message: 'Taxa de cancelamentos aumentou 15% esta semana', time: '2h atrás' },
  { id: 2, type: 'warning', message: 'Estoque de anestésico abaixo do mínimo', time: '4h atrás' },
  { id: 3, type: 'info', message: 'Meta mensal de receita atingida com 5 dias de antecedência', time: '1d atrás' },
  { id: 4, type: 'warning', message: 'Agendamento para próxima semana em 95% da capacidade', time: '2d atrás' },
];

export default function BusinessIntelligence() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Business Intelligence"
        icon={BarChart3}
        description="Análise avançada e insights estratégicos para tomada de decisão"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <ExportDashboardDialog 
            dashboardName="Dashboard Principal" 
            data={[...revenueData, ...procedureData, ...alertsData]}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Dashboard Customizado
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 67.000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-primary">↑ 12%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-primary">↑ 5%</span> vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Pacientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-primary">↑ 8%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 385</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-destructive">↓ 3%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            <Badge variant="destructive" className="ml-2">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="custom">Dashboards Customizados</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Meta Mensal</CardTitle>
                <CardDescription>Comparativo de receita realizada com meta estabelecida</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" />
                    <Bar dataKey="meta" name="Meta" fill="hsl(var(--muted))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Procedimentos</CardTitle>
                <CardDescription>Tipos de procedimentos mais realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={procedureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {procedureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendência de Receita</CardTitle>
                <CardDescription>Evolução da receita nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="meta" name="Meta" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
                <CardDescription>KPIs essenciais para acompanhamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Conversão</span>
                    <span className="text-sm font-semibold">68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Retorno</span>
                    <span className="text-sm font-semibold">82%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NPS (Net Promoter Score)</span>
                    <span className="text-sm font-semibold">72</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Cancelamento</span>
                    <span className="text-sm font-semibold">8%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas Inteligentes
              </CardTitle>
              <CardDescription>
                Notificações automáticas sobre métricas críticas e oportunidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertsData.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <div className={`p-2 rounded-lg ${
                    alert.type === 'critical' ? 'bg-destructive/10' :
                    alert.type === 'warning' ? 'bg-yellow-500/10' :
                    'bg-primary/10'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.type === 'critical' ? 'text-destructive' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                  <Badge variant={
                    alert.type === 'critical' ? 'destructive' :
                    alert.type === 'warning' ? 'secondary' :
                    'default'
                  }>
                    {alert.type === 'critical' ? 'Crítico' :
                     alert.type === 'warning' ? 'Atenção' :
                     'Info'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurar Alertas</CardTitle>
              <CardDescription>
                Defina limites e condições para receber notificações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Configurações de Alertas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboards Customizados</CardTitle>
              <CardDescription>
                Crie painéis personalizados com os KPIs mais relevantes para seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Nenhum dashboard customizado criado ainda
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
