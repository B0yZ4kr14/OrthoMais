import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Check, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ModuleCardProps {
  module: {
    id: number;
    module_key: string;
    name: string;
    description: string;
    icon: string;
    subscribed: boolean;
    is_active: boolean;
    can_activate: boolean;
    can_deactivate: boolean;
    unmet_dependencies: string[];
    active_dependents: string[];
  };
  onToggle: (moduleKey: string) => void;
  onRequest: (moduleKey: string) => void;
}

export function ModuleCard({ module, onToggle, onRequest }: ModuleCardProps) {
  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[module.icon] || LucideIcons.Package;

  const isDisabled =
    (!module.is_active && !module.can_activate) ||
    (module.is_active && !module.can_deactivate);

  const getTooltipContent = () => {
    if (!module.is_active && !module.can_activate && module.unmet_dependencies.length > 0) {
      return `Requer o(s) módulo(s): ${module.unmet_dependencies.join(', ')}`;
    }
    if (module.is_active && !module.can_deactivate && module.active_dependents.length > 0) {
      return `Este módulo é requerido por: ${module.active_dependents.join(', ')}`;
    }
    return null;
  };

  const tooltipContent = getTooltipContent();

  return (
    <Card className={module.is_active ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${module.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
              <IconComponent className={`h-5 w-5 ${module.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base">{module.name}</CardTitle>
              {module.is_active && (
                <Badge variant="default" className="mt-1">
                  <Check className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm">{module.description}</CardDescription>

        {module.subscribed ? (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">Status</span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={module.is_active}
                        onCheckedChange={() => onToggle(module.module_key)}
                        disabled={isDisabled}
                      />
                      {isDisabled && tooltipContent && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {isDisabled && tooltipContent && (
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">{tooltipContent}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onRequest(module.module_key)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Solicitar Contratação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
