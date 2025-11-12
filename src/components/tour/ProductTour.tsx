import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '@/contexts/AuthContext';

const TOUR_COMPLETED_KEY = 'ortho_plus_tour_completed';

export function ProductTour() {
  const [run, setRun] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Verificar se o tour já foi completado
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    
    // Iniciar tour automaticamente para novos usuários após 2 segundos
    if (!tourCompleted && user) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao Ortho+ 🦷</h2>
          <p className="text-muted-foreground">
            Vamos fazer um tour rápido pelas principais funcionalidades do sistema!
          </p>
          <p className="text-sm text-muted-foreground">
            Desenvolvido por <strong>TSI Telecom</strong>
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">Menu de Navegação</h3>
          <p className="text-sm text-muted-foreground">
            Aqui você encontra todos os módulos do sistema organizados por categoria. 
            Clique para navegar entre as diferentes seções.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="dashboard-stats"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">KPIs em Tempo Real</h3>
          <p className="text-sm text-muted-foreground">
            Visualize os principais indicadores da sua clínica: pacientes ativos, 
            consultas do dia, receita mensal e taxa de ocupação.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="action-cards"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">Ações Rápidas</h3>
          <p className="text-sm text-muted-foreground">
            Acesse rapidamente as funcionalidades mais utilizadas: cadastrar paciente, 
            agendar consulta, abrir prontuário e muito mais!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="search-bar"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">Busca Global</h3>
          <p className="text-sm text-muted-foreground">
            Encontre rapidamente pacientes, procedimentos e informações usando a busca global.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="theme-toggle"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">Temas Visuais</h3>
          <p className="text-sm text-muted-foreground">
            Personalize a aparência do sistema escolhendo entre tema claro, escuro profissional 
            ou dark-gold premium.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="user-menu"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">Menu do Usuário</h3>
          <p className="text-sm text-muted-foreground">
            Acesse suas configurações de perfil e faça logout do sistema.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Tour Completo! ✨</h2>
          <p className="text-muted-foreground">
            Você está pronto para usar o Ortho+! Explore as funcionalidades e aproveite 
            todo o poder do sistema modular mais completo para clínicas odontológicas.
          </p>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Desenvolvido com 💙 por <strong>TSI Telecom</strong>
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    }
  };

  // Função para reiniciar o tour (pode ser chamada externamente)
  const restartTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setRun(true);
  };

  // Expor função globalmente para reiniciar tour
  useEffect(() => {
    (window as any).startOrthoTour = restartTour;
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--card))',
          textColor: 'hsl(var(--card-foreground))',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          arrowColor: 'hsl(var(--card))',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '0.5rem',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
        tooltip: {
          borderRadius: '0.75rem',
          padding: '1.5rem',
          fontSize: '0.875rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        tooltipContent: {
          padding: '0.5rem 0',
        },
        spotlight: {
          borderRadius: '0.5rem',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
    />
  );
}
