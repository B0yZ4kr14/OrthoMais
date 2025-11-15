import { SidebarHeader as ShadcnSidebarHeader } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import orthoLogo from '@/assets/ortho-logo-main.png';
import { QuickActionsBar } from '@/components/QuickActionsBar';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <ShadcnSidebarHeader className="border-b border-sidebar-border/50 transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2">
          <img 
            src={orthoLogo} 
            alt="Ortho+" 
            className="h-8 w-auto shrink-0 transition-transform duration-300 hover:scale-110"
          />
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-opacity duration-300">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
                Ortho+
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Sistema Odontológico
              </span>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <div className="mt-3 px-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors duration-200" />
              <Input 
                placeholder="Buscar módulo..." 
                className="pl-9 h-9 bg-sidebar-accent/30 border-sidebar-border/50 focus-visible:ring-primary transition-all duration-200"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
        )}
      </div>
      
      {!collapsed && <QuickActionsBar />}
    </ShadcnSidebarHeader>
  );
}
