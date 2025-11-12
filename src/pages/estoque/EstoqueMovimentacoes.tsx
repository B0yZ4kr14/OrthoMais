import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';

export default function EstoqueMovimentacoes() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={Package}
        title="Movimentações de Estoque"
        description="Histórico de entradas, saídas e ajustes de estoque"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas (Mês)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">142</div>
            <p className="text-xs text-muted-foreground">
              +18% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas (Mês)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">218</div>
            <p className="text-xs text-muted-foreground">
              +12% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giro de Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <p className="text-xs text-muted-foreground">
              Rotação média mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 48.200</div>
            <p className="text-xs text-muted-foreground">
              Inventário total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Registro completo de todas as movimentações de estoque
              </CardDescription>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar movimentações..." className="pl-10" />
              </div>
            </div>

            <div className="rounded-md border">
              <div className="p-4">
                <div className="space-y-4">
                  {[
                    { 
                      type: 'entrada', 
                      date: '25/09/2025 10:30', 
                      product: 'Luvas Cirúrgicas (Caixa)', 
                      quantity: 10, 
                      user: 'Maria Silva',
                      reason: 'Compra - NF 12345'
                    },
                    { 
                      type: 'saida', 
                      date: '25/09/2025 09:15', 
                      product: 'Anestésico Local', 
                      quantity: 5, 
                      user: 'Dr. Carlos Santos',
                      reason: 'Uso em procedimento'
                    },
                    { 
                      type: 'entrada', 
                      date: '24/09/2025 16:45', 
                      product: 'Resina Composta', 
                      quantity: 15, 
                      user: 'João Costa',
                      reason: 'Compra - NF 12344'
                    },
                    { 
                      type: 'saida', 
                      date: '24/09/2025 14:20', 
                      product: 'Fio de Sutura', 
                      quantity: 3, 
                      user: 'Dra. Ana Pereira',
                      reason: 'Uso em procedimento'
                    },
                  ].map((mov, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          mov.type === 'entrada' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {mov.type === 'entrada' ? (
                            <ArrowUpCircle className="h-5 w-5" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{mov.product}</p>
                            <Badge variant={mov.type === 'entrada' ? 'default' : 'secondary'}>
                              {mov.type === 'entrada' ? 'Entrada' : 'Saída'}: {mov.quantity} un.
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {mov.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mov.user} • {mov.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
