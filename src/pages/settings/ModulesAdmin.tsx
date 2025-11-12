import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ModuleData {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  blocking_dependencies: string[];
}

export default function ModulesAdmin() {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-my-modules');
      if (error) throw error;
      setModules(data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleToggle = async (moduleKey: string) => {
    setToggling(moduleKey);
    try {
      const { data, error } = await supabase.functions.invoke('toggle-module-state', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;

      toast.success(data.module.is_active ? 'Módulo ativado!' : 'Módulo desativado!');
      fetchModules();
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error(error.message || 'Erro ao alterar estado do módulo');
    } finally {
      setToggling(null);
    }
  };

  const handleRequest = async (moduleKey: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('request-new-module', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;
      toast.success(data.message);
    } catch (error: any) {
      console.error('Request error:', error);
      toast.error(error.message || 'Erro ao solicitar módulo');
    }
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleData[]>);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        icon={Settings}
        title="Administração de Módulos"
        description="Gerencie os módulos ativos da sua clínica"
      />

      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryModules.map((module) => {
              const isDisabled =
                (module.is_active && !module.can_deactivate) ||
                (!module.is_active && !module.can_activate);

              return (
                <Card key={module.module_key} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{module.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>
                    {module.is_subscribed && (
                      <Badge variant={module.is_active ? 'default' : 'secondary'}>
                        {module.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    )}
                  </div>

                  {module.is_subscribed ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {module.is_active ? 'Desativar' : 'Ativar'}
                            </span>
                            <Switch
                              checked={module.is_active}
                              disabled={isDisabled || toggling === module.module_key}
                              onCheckedChange={() => handleToggle(module.module_key)}
                            />
                          </div>
                        </TooltipTrigger>
                        {isDisabled && (
                          <TooltipContent>
                            <div className="flex items-start gap-2 max-w-xs">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div>
                                {module.unmet_dependencies.length > 0 && (
                                  <p>Requer: {module.unmet_dependencies.join(', ')}</p>
                                )}
                                {module.blocking_dependencies.length > 0 && (
                                  <p>
                                    Usado por: {module.blocking_dependencies.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRequest(module.module_key)}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Solicitar Contratação
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
