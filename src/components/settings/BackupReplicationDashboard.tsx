import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { Globe, CheckCircle, XCircle, Clock, Database, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export const BackupReplicationDashboard = () => {
  const { clinicId } = useAuth();

  const { data: replications, isLoading } = useQuery({
    queryKey: ['backup-replications', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_replications')
        .select(`
          *,
          backup:backup_history(
            backup_type,
            file_size_bytes,
            created_at
          ),
          source_clinic:source_clinic_id(name),
          target_clinic:target_clinic_id(name)
        `)
        .or(`source_clinic_id.eq.${clinicId},target_clinic_id.eq.${clinicId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const stats = {
    total: replications?.length || 0,
    completed: replications?.filter(r => r.replication_status === 'COMPLETED').length || 0,
    failed: replications?.filter(r => r.replication_status === 'FAILED').length || 0,
    pending: replications?.filter(r => r.replication_status === 'PENDING').length || 0,
  };

  const regionData = replications?.reduce((acc, rep) => {
    const existing = acc.find(r => r.region === rep.region);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ region: rep.region, count: 1 });
    }
    return acc;
  }, [] as { region: string; count: number }[]) || [];

  const statusData = [
    { name: 'Completo', value: stats.completed },
    { name: 'Pendente', value: stats.pending },
    { name: 'Falhou', value: stats.failed },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'COMPLETED': { variant: 'success', icon: CheckCircle, label: 'Completo' },
      'FAILED': { variant: 'destructive', icon: XCircle, label: 'Falhou' },
      'PENDING': { variant: 'warning', icon: Clock, label: 'Pendente' },
      'IN_PROGRESS': { variant: 'default', icon: TrendingUp, label: 'Em Progresso' },
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Replicações</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completos</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Falhas</p>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Região</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Replicações" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status das Replicações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Lista de Replicações */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Histórico de Replicações Geo-Distribuídas
          </h3>
          <Button size="sm" variant="outline">
            Nova Replicação
          </Button>
        </div>

        <div className="space-y-3">
          {replications?.map((replication) => (
            <div
              key={replication.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {replication.region.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {replication.storage_provider}
                    </p>
                  </div>
                </div>
                {getStatusBadge(replication.replication_status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tamanho</p>
                  <p className="font-medium">
                    {replication.file_size_bytes
                      ? `${(replication.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Iniciado</p>
                  <p className="font-medium">
                    {new Date(replication.started_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completado</p>
                  <p className="font-medium">
                    {replication.completed_at
                      ? new Date(replication.completed_at).toLocaleString('pt-BR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Checksum</p>
                  <p className="font-medium text-xs truncate">
                    {replication.checksum_md5?.slice(0, 8) || '-'}
                  </p>
                </div>
              </div>

              {replication.error_message && (
                <div className="mt-3 p-2 rounded bg-destructive/10 text-destructive text-sm">
                  <p className="font-medium">Erro:</p>
                  <p>{replication.error_message}</p>
                </div>
              )}
            </div>
          ))}

          {(!replications || replications.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma replicação encontrada</p>
              <p className="text-sm mt-1">
                Configure replicações geo-distribuídas para disaster recovery
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
