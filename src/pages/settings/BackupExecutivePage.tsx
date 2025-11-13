// @ts-nocheck
import { PageHeader } from '@/components/shared/PageHeader'
import BackupExecutiveDashboard from '@/components/settings/BackupExecutiveDashboard'

export default function BackupExecutivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Executivo de Backups"
        description="Visão completa da saúde e confiabilidade do sistema de backups"
      />
      <BackupExecutiveDashboard />
    </div>
  )
}