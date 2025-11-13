import { SidebarFooter as ShadcnSidebarFooter } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

export function SidebarFooter() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <ShadcnSidebarFooter className="p-4 border-t border-sidebar-border/50">
      {!collapsed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-sidebar-foreground/60">Versão</span>
            <Badge variant="secondary" className="text-xs">
              2.0.0
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-sidebar-foreground/40">
              © 2025 Ortho+
            </p>
          </div>
        </div>
      )}
    </ShadcnSidebarFooter>
  );
}
