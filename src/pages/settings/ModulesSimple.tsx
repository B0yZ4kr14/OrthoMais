import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Module {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  is_subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
}

export default function ModulesSimple() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-my-modules');
      if (error) throw error;
      setModules(data?.modules || []);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
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
      const { error } = await supabase.functions.invoke('toggle-module-state', {
        body: { module_key: moduleKey },
      });

      if (error) throw error;
      
      toast.success('Módulo atualizado com sucesso!');
      await fetchModules();
    } catch (error: any) {
      console.error('Erro ao alterar módulo:', error);
      toast.error(error.message || 'Erro ao alterar módulo');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando módulos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        icon={Settings}
        title="Gestão de Módulos"
        description="Ative ou desative módulos do sistema"
      />

      <div className="grid gap-3">
        {modules.map((module) => {
          const isToggling = toggling === module.module_key;
          const canToggle = module.is_subscribed && 
            (module.is_active ? module.can_deactivate : module.can_activate);

          return (
            <Card
              key={module.module_key}
              className={cn(
                "p-4 transition-all",
                module.is_active && "border-primary/50 bg-primary/5",
                isToggling && "opacity-60"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    module.is_active ? "bg-success/20" : "bg-muted"
                  )}>
                    {module.is_active ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{module.name}</h3>
                      <Badge variant={module.is_active ? 'success' : 'secondary'} className="text-xs">
                        {module.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {!module.is_subscribed && (
                        <Badge variant="outline" className="text-xs">Não contratado</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>

                {module.is_subscribed ? (
                  <Switch
                    checked={module.is_active}
                    disabled={!canToggle || isToggling}
                    onCheckedChange={() => handleToggle(module.module_key)}
                  />
                ) : (
                  <Button variant="outline" size="sm">
                    Solicitar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
