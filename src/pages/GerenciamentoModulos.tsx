import { useState } from 'react';
import { useModules } from '@/contexts/ModulesContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BarChart3, 
  Users, 
  UserCog, 
  Briefcase, 
  Stethoscope, 
  Calendar, 
  ClipboardCheck, 
  Phone, 
  UserCheck, 
  Settings, 
  DollarSign,
  ChevronUp,
  ChevronDown,
  Info,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Map icons to modules
const iconMap: Record<string, any> = {
  'home': Home,
  'resumo': BarChart3,
  'pacientes': Users,
  'dentistas': UserCog,
  'funcionarios': Briefcase,
  'procedimentos': Stethoscope,
  'agenda-clinica': Calendar,
  'agenda-avaliacao': ClipboardCheck,
  'controle-chegada': UserCheck,
  'confirmacao-agenda': Phone,
  'gestao-dentistas': Settings,
  'financeiro': DollarSign,
};

export default function GerenciamentoModulos() {
  const { 
    modules, 
    toggleModule, 
    moveModuleUp, 
    moveModuleDown,
    resetToDefaults,
  } = useModules();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];
  
  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(m => m.category === selectedCategory);

  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  const enabledCount = modules.filter(m => m.enabled).length;
  const totalCount = modules.length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Módulos</h1>
          <p className="text-muted-foreground mt-2">
            Configure quais módulos estão ativos e organize a ordem de exibição
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restaurar Padrões
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurar configuração padrão?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá restaurar todos os módulos para a configuração padrão,
                reativando todos os módulos e restaurando a ordem original.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={resetToDefaults}>
                Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-module-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Módulos</p>
              <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-module-blue/20 flex items-center justify-center">
              <Settings className="h-6 w-6 text-module-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-module-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Módulos Ativos</p>
              <p className="text-2xl font-bold text-foreground">{enabledCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-module-green/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-module-green" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-module-red">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Módulos Inativos</p>
              <p className="text-2xl font-bold text-foreground">{totalCount - enabledCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-module-red/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-module-red" />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'Todos' : category}
          </Button>
        ))}
      </div>

      {/* Info Alert */}
      <Card className="p-4 bg-stat-blue-bg border-l-4 border-l-module-blue">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-module-blue mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Como usar este módulo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use os botões de seta para reordenar módulos dentro de cada categoria.
              O botão de ativação permite habilitar ou desabilitar módulos (alguns módulos essenciais não podem ser desativados).
              As alterações são salvas automaticamente.
            </p>
          </div>
        </div>
      </Card>

      {/* Modules List */}
      <div className="space-y-6">
        {Object.entries(groupedModules).map(([category, categoryModules]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {category}
              <Badge variant="secondary">{categoryModules.length}</Badge>
            </h2>

            <div className="space-y-2">
              {categoryModules.map((module) => {
                const Icon = iconMap[module.id];
                const categoryModulesFiltered = modules.filter(m => m.category === category);
                const isFirst = categoryModulesFiltered[0]?.id === module.id;
                const isLast = categoryModulesFiltered[categoryModulesFiltered.length - 1]?.id === module.id;

                return (
                  <Card 
                    key={module.id} 
                    className={`p-4 transition-all ${
                      module.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        module.enabled ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {Icon && <Icon className={`h-6 w-6 ${
                          module.enabled ? 'text-primary' : 'text-muted-foreground'
                        }`} />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{module.name}</h3>
                          {module.badge && (
                            <Badge variant="destructive" className="text-xs">
                              {module.badge}
                            </Badge>
                          )}
                          {!module.canDisable && (
                            <Badge variant="secondary" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveModuleUp(module.id)}
                            disabled={isFirst}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => moveModuleDown(module.id)}
                            disabled={isLast}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Enable/Disable switch */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={module.enabled}
                            onCheckedChange={() => toggleModule(module.id)}
                            disabled={!module.canDisable}
                          />
                          <span className="text-sm text-muted-foreground w-16">
                            {module.enabled ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
