import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bgColor: string;
  route: string;
}

export function ActionCard({ title, subtitle, icon: Icon, bgColor, route }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
      onClick={() => navigate(route)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div 
            className={`p-4 rounded-2xl ${bgColor}`}
            style={{ width: 'fit-content' }}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
