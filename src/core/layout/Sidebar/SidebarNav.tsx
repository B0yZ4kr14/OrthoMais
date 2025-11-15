import { SidebarGroup as ShadcnSidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem as ShadcnSidebarMenuItem } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarGroup } from './SidebarGroup';
import { SidebarMenuItem } from './SidebarMenuItem';
import { menuGroups, adminMenuItems } from './sidebar.config';
import { Separator } from '@/components/ui/separator';

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps = {}) {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const collapsed = state === 'collapsed';

  return (
    <div className="space-y-4 pb-6">
      {menuGroups.map((group, index) => (
        <SidebarGroup key={group.label} group={group} index={index} onNavigate={onNavigate} />
      ))}

      {isAdmin && (
        <>
          <Separator className="my-4 bg-sidebar-border/30" />
          <div 
            className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-xl backdrop-blur-sm border border-primary/30 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl animate-fade-in"
            style={{ animationDelay: `${menuGroups.length * 100}ms` }}
          >
            <ShadcnSidebarGroup>
              <SidebarGroupLabel className="text-sm font-bold text-sidebar-foreground px-3 py-2 drop-shadow-md">
                {!collapsed && (
                  <span className="tracking-wide transition-opacity duration-300">
                    Administração
                  </span>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <ShadcnSidebarMenuItem key={item.title}>
                      <SidebarMenuItem item={item} onNavigate={onNavigate} />
                    </ShadcnSidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </ShadcnSidebarGroup>
          </div>
        </>
      )}
    </div>
  );
}
