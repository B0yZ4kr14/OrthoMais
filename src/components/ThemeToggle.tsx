import { Moon, Sun, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/hooks/useFontSize";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, resetSize, min, max } = useFontSize();
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'professional-dark':
        return <Palette className="h-5 w-5" />;
      case 'dark-gold':
        return <Palette className="h-5 w-5 text-yellow-500" />;
      case 'high-contrast':
        return <Sun className="h-5 w-5" />;
      case 'high-contrast-dark':
        return <Moon className="h-5 w-5" />;
      default:
        return <Palette className="h-5 w-5" />;
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Alternar tema e acessibilidade">
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Temas
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('professional-dark')} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4" />
          <span>Professional Dark</span>
          {theme === 'professional-dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark-gold')} className="cursor-pointer">
          <Palette className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Dark Gold</span>
          {theme === 'dark-gold' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('high-contrast')} className="cursor-pointer border-t mt-1 pt-1">
          <Sun className="mr-2 h-4 w-4" />
          <span>High Contrast Light</span>
          {theme === 'high-contrast' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('high-contrast-dark')} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span>High Contrast Dark</span>
          {theme === 'high-contrast-dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-3">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-0">
            Tamanho da Fonte
          </DropdownMenuLabel>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Type className="h-3 w-3" />
                {fontSize}px
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetSize();
                }}
                className="h-7 px-2 text-xs"
              >
                Resetar
              </Button>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={min}
              max={max}
              step={1}
              className="cursor-pointer"
              aria-label="Ajustar tamanho da fonte"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min}px</span>
              <span>{max}px</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}