// @ts-nocheck
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Database, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, HardDrive } from 'lucide-react'

export default function BackupExecutiveDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['backup-executive-stats'],
    queryFn: async () => {
      const { data: backups, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const now = new Date()
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const recent = backups.filter(b => new Date(b.created_at) >= last30Days)
      const lastWeek = backups.filter(b => new Date(b.created_at) >= last7Days)

      // Calculate success rate
      const totalBackups = recent.length
      const successfulBackups = recent.filter(b => b.status === 'success').length
      const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0

      // Calculate average size
      const totalSize = recent.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0)
      const avgSize = totalBackups > 0 ? totalSize / totalBackups : 0

      // Calculate completion time
      const completedBackups = recent.filter(b => b.completed_at && b.created_at)
      const totalTime = completedBackups.reduce((sum, b) => {
        const start = new Date(b.created_at).getTime()
        const end = new Date(b.completed_at).getTime()
        return sum + (end - start)
      }, 0)
      const avgCompletionTime = completedBackups.length > 0 
        ? totalTime / completedBackups.length / 1000 / 60 // Convert to minutes
        : 0

      // Trend data for last 30 days
      const trendData = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const dayBackups = recent.filter(b => 
          b.created_at.split('T')[0] === dateStr
        )
        const daySuccess = dayBackups.filter(b => b.status === 'success').length
        const dayFailed = dayBackups.filter(b => b.status === 'failed').length
        const daySize = dayBackups.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0) / (1024 * 1024) // MB

        trendData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          success: daySuccess,
          failed: dayFailed,
          size: Math.round(daySize * 10) / 10
        })
      }

      // Type distribution
      const typeDistribution = recent.reduce((acc, b) => {
        const type = b.backup_type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
        name: name === 'full' ? 'Completo' : name === 'incremental' ? 'Incremental' : 'Outro',
        value
      }))

      // Recent failures
      const recentFailures = recent
        .filter(b => b.status === 'failed')
        .slice(0, 5)
        .map(b => ({
          date: new Date(b.created_at).toLocaleString('pt-BR'),
          error: b.error_message || 'Erro desconhecido'
        }))

      // Storage usage trend
      const storageUsed = recent.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0)

      return {
        totalBackups,
        successfulBackups,
        failedBackups: totalBackups - successfulBackups,
        successRate,
        avgSize,
        avgCompletionTime,
        storageUsed,
        trendData,
        typeData,
        recentFailures,
        lastWeekBackups: lastWeek.length
      }
    }
  })

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))']

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getHealthStatus = () => {
    if (!stats) return { status: 'unknown', color: 'secondary', message: 'Sem dados' }
    
    if (stats.successRate >= 95) {
      return { status: 'healthy', color: 'success', message: 'Sistema Saudável' }
    } else if (stats.successRate >= 80) {
      return { status: 'warning', color: 'warning', message: 'Atenção Necessária' }
    } else {
      return { status: 'critical', color: 'error', message: 'Crítico - Ação Imediata' }
    }
  }

  const health = getHealthStatus()

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6" depth="normal">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-3xl font-bold">
                {stats?.successRate.toFixed(1)}%
              </p>
              <Badge variant={health.color}>
                {health.message}
              </Badge>
            </div>
            <div className={`p-3 rounded-lg ${
              stats?.successRate >= 95 ? 'bg-green-100 dark:bg-green-900/20' :
              stats?.successRate >= 80 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-red-100 dark:bg-red-900/20'
            }`}>
              <CheckCircle className={`h-6 w-6 ${
                stats?.successRate >= 95 ? 'text-green-600 dark:text-green-400' :
                stats?.successRate >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Backups (30d)</p>
              <p className="text-3xl font-bold">{stats?.totalBackups}</p>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">
                  {stats?.lastWeekBackups} esta semana
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tamanho Médio</p>
              <p className="text-3xl font-bold">
                {formatBytes(stats?.avgSize || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {formatBytes(stats?.storageUsed || 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <HardDrive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <p className="text-3xl font-bold">
                {stats?.avgCompletionTime.toFixed(1)}min
              </p>
              <p className="text-sm text-muted-foreground">
                Por backup
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4">Tendência de Sucesso (30 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="success" fill="hsl(var(--success))" name="Sucesso" />
              <Bar dataKey="failed" fill="hsl(var(--error))" name="Falha" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4">Tamanho dos Backups (MB)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="size" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Tamanho (MB)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats?.typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats?.typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 lg:col-span-2" depth="normal">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Falhas Recentes
          </h3>
          {stats?.recentFailures && stats.recentFailures.length > 0 ? (
            <div className="space-y-3">
              {stats.recentFailures.map((failure, i) => (
                <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      Backup Falhou
                    </span>
                    <span className="text-xs text-red-700 dark:text-red-300">
                      {failure.date}
                    </span>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {failure.error}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p>Nenhuma falha recente</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      {stats && stats.successRate < 90 && (
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800" depth="normal">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Recomendações de Melhoria
              </h4>
              <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                {stats.successRate < 80 && (
                  <li>• Taxa de sucesso crítica. Verifique logs e configurações imediatamente.</li>
                )}
                {stats.failedBackups > 5 && (
                  <li>• Múltiplas falhas detectadas. Considere revisar estratégia de backup.</li>
                )}
                {stats.avgCompletionTime > 30 && (
                  <li>• Backups estão demorando. Considere otimizar dados ou infraestrutura.</li>
                )}
                <li>• Configure alertas automáticos para monitoramento proativo.</li>
                <li>• Teste regularmente a restauração dos backups.</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}