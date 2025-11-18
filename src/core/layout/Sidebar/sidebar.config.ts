/**
 * SIDEBAR CONFIGURATION V5.0 - Ortho+
 * 6 Categorias Funcionais | Terminologia Intuitiva | Máximo 2 Níveis
 */

import { 
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Package,
  Settings,
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Megaphone,
  BarChart3,
  Stethoscope,
  Scan,
  Brain,
  ClipboardPlus,
  Wallet,
  FileSpreadsheet,
  Target,
  Mail,
  AlertCircle,
  Lock,
  FileCheck,
  Video,
  Wrench,
  Database,
  HardDrive,
  Terminal,
  Github,
  type LucideIcon
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  moduleKey?: string;
  collapsed?: boolean;
  subItems?: MenuItem[];
  isSubItem?: boolean;
  badge?: {
    count: number | string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
}

export interface MenuGroup {
  label: string;
  boundedContext: string;
  collapsed?: boolean;
  items: MenuItem[];
}

/**
 * NAVEGAÇÃO V5.0: 6 BOUNDED CONTEXTS | 38 ITENS TOTAIS
 */
export const menuGroups: MenuGroup[] = [
  // ========= 1. DASHBOARD UNIFICADO =========
  {
    label: 'VISÃO GERAL',
    boundedContext: 'DASHBOARD',
    items: [
      { 
        title: 'Dashboard Executivo', 
        url: '/', 
        icon: LayoutDashboard,
        badge: { count: 0, variant: 'default' }
      }
    ]
  },

  // ========= 2. ATENDIMENTO CLÍNICO =========
  {
    label: 'ATENDIMENTO CLÍNICO',
    boundedContext: 'CLINICA',
    collapsed: false,
    items: [
      { 
        title: 'Agenda', 
        url: '/agenda', 
        icon: Calendar, 
        moduleKey: 'AGENDA',
        badge: { count: 0, variant: 'default' }
      },
      { 
        title: 'Pacientes', 
        url: '/pacientes', 
        icon: Users, 
        moduleKey: 'PEP'
      },
      { 
        title: 'Prontuário Eletrônico', 
        url: '/pep', 
        icon: FileText, 
        moduleKey: 'PEP'
      },
      { 
        title: 'Odontograma', 
        url: '/odontograma', 
        icon: Scan, 
        moduleKey: 'ODONTOGRAMA'
      },
      { 
        title: 'Planos de Tratamento', 
        url: '/tratamentos', 
        icon: ClipboardPlus, 
        moduleKey: 'PEP'
      },
      {
        title: 'Diagnóstico com IA',
        url: '/ia-radiografia',
        icon: Brain,
        moduleKey: 'IA'
      },
      {
        title: 'Fluxo Digital (CAD/CAM)',
        url: '/fluxo-digital',
        icon: Scan,
        moduleKey: 'FLUXO_DIGITAL'
      },
      {
        title: 'Teleodontologia',
        url: '/teleodonto',
        icon: Video,
        moduleKey: 'TELEODONTO'
      }
    ]
  },

  // ========= 3. FINANCEIRO & FISCAL =========
  {
    label: 'FINANCEIRO & FISCAL',
    boundedContext: 'FINANCEIRO',
    collapsed: false,
    items: [
      { 
        title: 'Fluxo de Caixa', 
        url: '/financeiro', 
        icon: Wallet, 
        moduleKey: 'FINANCEIRO'
      },
      { 
        title: 'Contas a Receber', 
        url: '/financeiro/receber', 
        icon: TrendingUp, 
        moduleKey: 'FINANCEIRO',
        badge: { count: 0, variant: 'destructive' }
      },
      { 
        title: 'Inadimplência', 
        url: '/inadimplencia', 
        icon: AlertCircle, 
        moduleKey: 'INADIMPLENCIA',
        badge: { count: 0, variant: 'destructive' }
      },
      { 
        title: 'Orçamentos', 
        url: '/orcamentos', 
        icon: FileSpreadsheet, 
        moduleKey: 'ORCAMENTOS'
      },
      {
        title: 'Notas Fiscais (NFe/NFCe)',
        url: '/financeiro/fiscal/notas',
        icon: Receipt,
        moduleKey: 'FISCAL'
      },
      {
        title: 'Conciliação Bancária',
        url: '/financeiro/conciliacao',
        icon: FileCheck,
        moduleKey: 'FINANCEIRO'
      },
      {
        title: 'Split de Pagamentos',
        url: '/split-pagamento',
        icon: DollarSign,
        moduleKey: 'SPLIT_PAGAMENTO'
      },
      {
        title: 'Faturamento TISS',
        url: '/faturamento-tiss',
        icon: FileText,
        moduleKey: 'TISS'
      }
    ]
  },

  // ========= 4. OPERAÇÕES =========
  {
    label: 'OPERAÇÕES',
    boundedContext: 'OPERACOES',
    collapsed: false,
    items: [
      { 
        title: 'PDV (Ponto de Venda)', 
        url: '/pdv', 
        icon: ShoppingCart, 
        moduleKey: 'PDV'
      },
      { 
        title: 'Estoque', 
        url: '/estoque', 
        icon: Package, 
        moduleKey: 'ESTOQUE'
      },
      {
        title: 'Scanner Mobile',
        url: '/estoque/scanner',
        icon: Scan,
        moduleKey: 'ESTOQUE'
      }
    ]
  },

  // ========= 5. CAPTAÇÃO & FIDELIZAÇÃO =========
  {
    label: 'CAPTAÇÃO & FIDELIZAÇÃO',
    boundedContext: 'CRESCIMENTO',
    collapsed: false,
    items: [
      { 
        title: 'CRM (Funil de Vendas)', 
        url: '/crm', 
        icon: Target, 
        moduleKey: 'CRM'
      },
      { 
        title: 'Campanhas de Marketing', 
        url: '/marketing-auto', 
        icon: Megaphone, 
        moduleKey: 'MARKETING_AUTO'
      },
      { 
        title: 'Recall Automático', 
        url: '/recall', 
        icon: Mail, 
        moduleKey: 'MARKETING_AUTO',
        badge: { count: 0, variant: 'default' }
      },
      {
        title: 'Comunicação (SMS/WhatsApp)',
        url: '/comunicacao',
        icon: Mail,
        moduleKey: 'AGENDA'
      }
    ]
  },

  // ========= 6. ANÁLISES & RELATÓRIOS =========
  {
    label: 'ANÁLISES & RELATÓRIOS',
    boundedContext: 'BI',
    collapsed: false,
    items: [
      { 
        title: 'Business Intelligence', 
        url: '/bi', 
        icon: BarChart3, 
        moduleKey: 'BI'
      },
      {
        title: 'Dashboard Comercial',
        url: '/dashboards/comercial',
        icon: TrendingUp,
        moduleKey: 'BI'
      }
    ]
  },

  // ========= 7. CONFIGURAÇÕES =========
  {
    label: 'CONFIGURAÇÕES',
    boundedContext: 'CONFIGURACOES',
    collapsed: false,
    items: [
      {
        title: 'Meus Módulos',
        url: '/configuracoes/modulos',
        icon: Settings,
        moduleKey: 'ADMIN_ONLY'
      },
      {
        title: 'Dentistas',
        url: '/dentistas',
        icon: Stethoscope
      },
      {
        title: 'Funcionários',
        url: '/funcionarios',
        icon: Users
      },
      {
        title: 'Procedimentos',
        url: '/procedimentos',
        icon: ClipboardPlus
      },
      {
        title: 'Conformidade LGPD',
        url: '/lgpd',
        icon: Lock,
        moduleKey: 'LGPD'
      },
      {
        title: 'Assinatura Digital',
        url: '/assinatura-icp',
        icon: FileCheck,
        moduleKey: 'ASSINATURA_ICP'
      },
      {
        title: 'Configurações Gerais',
        url: '/configuracoes',
        icon: Settings
      }
    ]
  }
];

/**
 * ADMIN-ONLY MENU ITEMS
 * Exibido apenas para usuários com role ADMIN
 */
export const adminMenuItems: MenuItem[] = [
  {
    title: 'Administração de Banco',
    url: '/admin/database',
    icon: Database,
    moduleKey: 'DATABASE_ADMIN'
  },
  {
    title: 'Backups & Restauração',
    url: '/admin/backups',
    icon: HardDrive,
    moduleKey: 'BACKUPS'
  },
  {
    title: 'Ferramentas DevOps',
    url: '/admin/devops',
    icon: Wrench,
    moduleKey: 'TERMINAL'
  },
  {
    title: 'GitHub Tools',
    url: '/admin/github',
    icon: Github,
    moduleKey: 'GITHUB_TOOLS'
  },
  {
    title: 'Terminal Web',
    url: '/admin/terminal',
    icon: Terminal,
    moduleKey: 'TERMINAL'
  }
];
