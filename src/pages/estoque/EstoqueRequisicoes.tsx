import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search
} from 'lucide-react';

export default function EstoqueRequisicoes() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Requisições de Estoque"
        description="Controle de solicitações e requisições de produtos"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">
              Todas requisições
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Requisições</CardTitle>
              <CardDescription>
                Lista de todas as requisições de produtos
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Requisição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar requisições..." className="pl-10" />
              </div>
            </div>

            <div className="rounded-md border">
              <div className="p-4">
                <div className="space-y-4">
                  {[
                    { id: 'REQ-001', date: '25/09/2025', requester: 'Dr. Carlos Silva', items: 5, status: 'pendente' },
                    { id: 'REQ-002', date: '24/09/2025', requester: 'Dra. Ana Santos', items: 3, status: 'aprovada' },
                    { id: 'REQ-003', date: '23/09/2025', requester: 'Dr. João Costa', items: 8, status: 'pendente' },
                  ].map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{req.id}</p>
                          <Badge 
                            variant={
                              req.status === 'pendente' 
                                ? 'secondary' 
                                : req.status === 'aprovada' 
                                ? 'default' 
                                : 'destructive'
                            }
                          >
                            {req.status === 'pendente' ? 'Pendente' : req.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Solicitante: {req.requester}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.items} itens • {req.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Visualizar
                        </Button>
                        {req.status === 'pendente' && (
                          <>
                            <Button variant="default" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
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
