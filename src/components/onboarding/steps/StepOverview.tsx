import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Blocks, Sparkles, TrendingUp, Database } from 'lucide-react';

export function StepOverview() {
  const features = [
    {
      icon: Blocks,
      title: '22 Módulos Descentralizados',
      description: 'Sistema 100% modular plug-and-play. Ative apenas o que você precisa.',
      badge: 'Modular',
    },
    {
      icon: Sparkles,
      title: 'IA Integrada',
      description: 'Análise de radiografias com Gemini Vision, previsão de estoque com ML.',
      badge: 'IA',
    },
    {
      icon: Zap,
      title: 'Automação Completa',
      description: 'Agendamentos, cobranças, pedidos de estoque automatizados.',
      badge: 'Automação',
    },
    {
      icon: Shield,
      title: 'LGPD Nativo',
      description: 'Compliance total desde o design. Auditoria, consentimentos, anonimização.',
      badge: 'Compliance',
    },
    {
      icon: TrendingUp,
      title: 'Business Intelligence',
      description: 'Dashboards interativos, relatórios customizáveis, análise preditiva.',
      badge: 'Analytics',
    },
    {
      icon: Database,
      title: 'Multi-tenancy Robusto',
      description: 'RLS completo, isolamento total de dados, escalabilidade infinita.',
      badge: 'Enterprise',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <p className="text-lg text-muted-foreground">
          O <strong>Ortho+</strong> é uma plataforma completa de gestão odontológica construída com 
          arquitetura descentralizada de <strong>22 módulos plug-and-play</strong>.
        </p>
        <p className="text-muted-foreground">
          Cada módulo funciona de forma independente e pode ser ativado/desativado conforme a necessidade
          da sua clínica. Você tem controle total sobre quais funcionalidades estarão disponíveis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-3">🎯 Objetivo deste Onboarding</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Apresentar os principais recursos e módulos do sistema</li>
          <li>• Ensinar como ativar/desativar módulos conforme sua necessidade</li>
          <li>• Explicar as dependências entre módulos</li>
          <li>• Configurar usuários e permissões granulares</li>
          <li>• Preparar você para usar o sistema completo com confiança</li>
        </ul>
      </Card>
    </div>
  );
}
