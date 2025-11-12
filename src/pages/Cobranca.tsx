import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send,
  FileText,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function Cobranca() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={CreditCard}
        title="Cobrança e Inadimplência"
        description="Gestão de cobranças, controle de inadimplência e automação de comunicação"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 15.840,00</div>
            <p className="text-xs text-muted-foreground">
              32 faturas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ 8.240,00</div>
            <p className="text-xs text-muted-foreground">
              18 faturas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Vencer</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ 7.600,00</div>
            <p className="text-xs text-muted-foreground">
              14 faturas próximas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Recuperação</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs. mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inadimplentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inadimplentes">Inadimplentes</TabsTrigger>
          <TabsTrigger value="comunicacao">Comunicação Automática</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Cobranças</TabsTrigger>
        </TabsList>

        <TabsContent value="inadimplentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Inadimplentes</CardTitle>
              <CardDescription>
                Lista de clientes com faturas vencidas e ações de cobrança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="Buscar por paciente ou CPF..." className="max-w-sm" />
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Cobrança em Lote
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="space-y-4">
                      {[
                        { name: 'Maria Silva', cpf: '123.456.789-00', amount: 'R$ 1.200,00', days: 15, status: 'crítico' },
                        { name: 'João Santos', cpf: '987.654.321-00', amount: 'R$ 850,00', days: 8, status: 'alerta' },
                        { name: 'Ana Costa', cpf: '456.789.123-00', amount: 'R$ 2.400,00', days: 30, status: 'crítico' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{item.name}</p>
                              <Badge variant={item.status === 'crítico' ? 'destructive' : 'secondary'}>
                                {item.days} dias
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.cpf}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-destructive">{item.amount}</p>
                              <p className="text-xs text-muted-foreground">em aberto</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                WhatsApp
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Boleto
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automação de Cobranças</CardTitle>
              <CardDescription>
                Configure mensagens automáticas e regras de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Funcionalidade de automação de cobranças em desenvolvimento
                </p>
                <Button variant="outline" disabled>
                  Configurar Automação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cobranças</CardTitle>
              <CardDescription>
                Registro de todas as ações de cobrança realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Histórico de cobranças será exibido aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
