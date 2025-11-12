import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Plus, Search, Filter, Download, TrendingUp, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  valor: number;
  vencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'parcial';
  formaPagamento?: string;
  dataPagamento?: Date;
  valorPago?: number;
  parcelas?: number;
  parcelaAtual?: number;
  observacoes?: string;
}

export default function ContasReceber() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data
  const contasReceber: ContaReceber[] = [
    {
      id: '1',
      cliente: 'João Silva',
      descricao: 'Tratamento ortodôntico - Parcela 3/12',
      valor: 450.00,
      vencimento: new Date('2024-01-15'),
      status: 'pago',
      formaPagamento: 'Cartão de Crédito',
      dataPagamento: new Date('2024-01-14'),
      valorPago: 450.00,
      parcelas: 12,
      parcelaAtual: 3,
    },
    {
      id: '2',
      cliente: 'Maria Santos',
      descricao: 'Implante dentário',
      valor: 3500.00,
      vencimento: new Date('2024-01-20'),
      status: 'pendente',
      parcelas: 1,
      parcelaAtual: 1,
    },
    {
      id: '3',
      cliente: 'Carlos Oliveira',
      descricao: 'Clareamento dental - Parcela 2/3',
      valor: 800.00,
      vencimento: new Date('2024-01-10'),
      status: 'atrasado',
      parcelas: 3,
      parcelaAtual: 2,
    },
    {
      id: '4',
      cliente: 'Ana Costa',
      descricao: 'Tratamento de canal',
      valor: 1200.00,
      vencimento: new Date('2024-01-18'),
      status: 'parcial',
      formaPagamento: 'PIX',
      dataPagamento: new Date('2024-01-18'),
      valorPago: 600.00,
      parcelas: 1,
      parcelaAtual: 1,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> = {
      pago: { label: 'Pago', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      atrasado: { label: 'Atrasado', variant: 'error' },
      parcial: { label: 'Pagamento Parcial', variant: 'secondary' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalReceber = contasReceber
    .filter(c => c.status !== 'pago')
    .reduce((sum, c) => sum + (c.valor - (c.valorPago || 0)), 0);

  const totalAtrasado = contasReceber
    .filter(c => c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalRecebido = contasReceber
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + (c.valorPago || 0), 0);

  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader
        icon={DollarSign}
        title="Contas a Receber"
        description="Gerencie pagamentos de pacientes e cobranças"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total a Receber
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceber)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasReceber.filter(c => c.status !== 'pago').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Atrasados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAtrasado)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasReceber.filter(c => c.status === 'atrasado').length} contas vencidas
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Recebido (Mês)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecebido)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasReceber.filter(c => c.status === 'pago').length} contas quitadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="atrasado">Atrasadas</SelectItem>
                  <SelectItem value="pago">Pagas</SelectItem>
                  <SelectItem value="parcial">Pagamento Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="elevated" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Conta a Receber
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Receber</DialogTitle>
                    <DialogDescription>
                      Registre um novo recebimento de paciente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Cliente/Paciente</Label>
                      <Input id="cliente" placeholder="Nome do paciente" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor Total</Label>
                      <Input id="valor" type="number" placeholder="0,00" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input id="descricao" placeholder="Descrição do serviço" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vencimento">Data de Vencimento</Label>
                      <Input id="vencimento" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parcelas">Parcelas</Label>
                      <Input id="parcelas" type="number" placeholder="1" defaultValue="1" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Input id="observacoes" placeholder="Informações adicionais" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="elevated" onClick={() => setDialogOpen(false)}>
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Lista */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas ({contasReceber.length})</TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes ({contasReceber.filter(c => c.status === 'pendente').length})
          </TabsTrigger>
          <TabsTrigger value="atrasadas">
            Atrasadas ({contasReceber.filter(c => c.status === 'atrasado').length})
          </TabsTrigger>
          <TabsTrigger value="pagas">
            Pagas ({contasReceber.filter(c => c.status === 'pago').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card variant="elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasReceber.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.cliente}</TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                      {conta.valorPago && conta.valorPago < conta.valor && (
                        <div className="text-xs text-muted-foreground">
                          Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valorPago)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(conta.vencimento, 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
