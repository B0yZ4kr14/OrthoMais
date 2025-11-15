/**
 * SIDEBAR CONFIGURATION V4.0 - Ortho+
 * Categorização Profissional para Clínicas Odontológicas
 */

import { 
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Package,
  Settings,
  Video,
  UserCog,
  AlertCircle,
  Award,
  Building2,
  BookOpen,
  Database,
  HardDrive,
  Wrench,
  GitBranch,
  Code2,
  ScrollText,
  FileCode,
  BookText,
  Github,
  type LucideIcon,
  Sparkles,
  BriefcaseBusiness,
  Receipt,
  ShoppingCart,
  FileSpreadsheet,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  Bell,
  BarChart3,
  TrendingDown,
  TrendingUp,
  PieChart,
  LineChart,
  Target,
  Megaphone,
  Mail,
  Lock,
  FileCheck,
  FileSignature,
  Eye,
  Workflow,
  Stethoscope,
  HeartPulse,
  Pill,
  Activity,
  ClipboardPlus,
  Wallet,
  ArrowLeftRight,
  Boxes,
  PackagePlus,
  Coins,
  BadgeCheck
} from 'lucide-react';

export interface MenuSubItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  moduleKey?: string;
  collapsed?: boolean;
  subItems?: MenuSubItem[];
}

export interface MenuGroup {
  label: string;
  collapsed?: boolean;
  items: MenuItem[];
}

/**
 * NAVEGAÇÃO PRINCIPAL
 */
export const menuGroups: MenuGroup[] = [
  // ========= 1. INÍCIO =========
  {
    label: 'INÍCIO',
    items: [
      { 
        title: 'Dashboard', 
        url: '/', 
        icon: LayoutDashboard 
      }
    ]
  },

  // ========= 2. GESTÃO E OPERAÇÃO =========
  {
    label: 'GESTÃO E OPERAÇÃO',
    collapsed: false,
    items: [
      { 
        title: 'Agenda', 
        url: '/agenda', 
        icon: Calendar, 
        moduleKey: 'AGENDA' 
      },
      { 
        title: 'Pacientes', 
        url: '/pacientes', 
        icon: Users, 
        moduleKey: 'PEP' 
      },
      { 
        title: 'Prontuário (PEP)', 
        url: '/pep', 
        icon: ClipboardPlus, 
        moduleKey: 'PEP' 
      },
      { 
        title: 'Odontograma', 
        url: '/odontograma', 
        icon: Activity, 
        moduleKey: 'ODONTOGRAMA' 
      },
      { 
        title: 'Tratamentos', 
        url: '/tratamentos', 
        icon: HeartPulse, 
        moduleKey: 'PEP' 
      },
      { 
        title: 'Recall', 
        url: '/recall', 
        icon: Bell, 
        moduleKey: 'AGENDA' 
      },
      { 
        title: 'Equipe',
        icon: Users,
        moduleKey: 'PEP',
        collapsed: true,
        subItems: [
          { title: 'Dentistas', url: '/dentistas', icon: Stethoscope },
          { title: 'Funcionários', url: '/funcionarios', icon: UserCog }
        ]
      },
      { 
        title: 'Procedimentos', 
        url: '/procedimentos', 
        icon: Pill, 
        moduleKey: 'PEP' 
      },
      { 
        title: 'Estoque',
        icon: Boxes,
        moduleKey: 'ESTOQUE',
        collapsed: true,
        subItems: [
          { title: 'Visão Geral', url: '/estoque', icon: BarChart3 },
          { title: 'Produtos', url: '/estoque/cadastros', icon: PackagePlus },
          { title: 'Requisições', url: '/estoque/requisicoes', icon: Clipboard },
          { title: 'Inventário', url: '/estoque/inventario', icon: ClipboardCheck }
        ]
      }
    ]
  },

  // ========= 3. FINANCEIRO =========
  {
    label: 'FINANCEIRO',
    collapsed: true,
    items: [
      { 
        title: 'Dashboard',
        url: '/financeiro',
        icon: PieChart,
        moduleKey: 'FINANCEIRO'
      },
      { 
        title: 'Movimentações',
        icon: ArrowLeftRight,
        moduleKey: 'FINANCEIRO',
        collapsed: true,
        subItems: [
          { title: 'Contas a Receber', url: '/financeiro/contas-receber', icon: TrendingUp },
          { title: 'Contas a Pagar', url: '/financeiro/contas-pagar', icon: TrendingDown },
          { title: 'Transações', url: '/financeiro/transacoes', icon: Activity },
          { title: 'Conciliação', url: '/financeiro/conciliacao', icon: BadgeCheck }
        ]
      },
      { 
        title: 'Fluxo de Caixa', 
        url: '/fluxo-caixa', 
        icon: LineChart, 
        moduleKey: 'FINANCEIRO' 
      },
      { 
        title: 'Orçamentos', 
        url: '/orcamentos', 
        icon: FileSpreadsheet, 
        moduleKey: 'ORCAMENTOS' 
      },
      { 
        title: 'Contratos', 
        url: '/contratos', 
        icon: FileCheck, 
        moduleKey: 'ORCAMENTOS' 
      },
      { 
        title: 'PDV', 
        url: '/pdv', 
        icon: ShoppingCart, 
        moduleKey: 'FINANCEIRO' 
      },
      { 
        title: 'Notas Fiscais', 
        url: '/notas-fiscais', 
        icon: Receipt, 
        moduleKey: 'TISS' 
      },
      { 
        title: 'Pagamentos Avançados',
        icon: Wallet,
        moduleKey: 'SPLIT_PAGAMENTO',
        collapsed: true,
        subItems: [
          { title: 'Split de Pagamento', url: '/split-pagamento', icon: Coins },
          { title: 'Inadimplência', url: '/inadimplencia', icon: AlertCircle }
        ]
      }
    ]
  },

  // ========= 4. CRESCIMENTO =========
  {
    label: 'CRESCIMENTO',
    collapsed: true,
    items: [
      { 
        title: 'CRM', 
        url: '/crm', 
        icon: BriefcaseBusiness, 
        moduleKey: 'CRM' 
      },
      { 
        title: 'Funil de Vendas', 
        url: '/crm/funil', 
        icon: Target, 
        moduleKey: 'CRM' 
      },
      { 
        title: 'Campanhas', 
        url: '/marketing-auto', 
        icon: Megaphone, 
        moduleKey: 'MARKETING_AUTO' 
      },
      { 
        title: 'E-mail Marketing', 
        url: '/email-marketing', 
        icon: Mail, 
        moduleKey: 'MARKETING_AUTO' 
      },
      { 
        title: 'Programa Fidelidade', 
        url: '/programa-fidelidade', 
        icon: Award, 
        moduleKey: 'CRM' 
      },
      { 
        title: 'Analytics', 
        url: '/bi', 
        icon: BarChart3, 
        moduleKey: 'BI' 
      }
    ]
  },

  // ========= 5. COMPLIANCE =========
  {
    label: 'COMPLIANCE',
    collapsed: true,
    items: [
      { 
        title: 'LGPD', 
        url: '/lgpd', 
        icon: Lock, 
        moduleKey: 'LGPD' 
      },
      { 
        title: 'Assinatura Digital', 
        url: '/assinatura-digital', 
        icon: FileSignature, 
        moduleKey: 'ASSINATURA_ICP' 
      },
      { 
        title: 'TISS', 
        url: '/tiss', 
        icon: FileText, 
        moduleKey: 'TISS' 
      },
      { 
        title: 'Auditoria', 
        url: '/auditoria', 
        icon: Eye, 
        moduleKey: 'LGPD' 
      },
      { 
        title: 'Teleodontologia', 
        url: '/teleodonto', 
        icon: Video, 
        moduleKey: 'TELEODONTO' 
      }
    ]
  },

  // ========= 6. INOVAÇÃO =========
  {
    label: 'INOVAÇÃO',
    collapsed: true,
    items: [
      { 
        title: 'IA Diagnóstico', 
        url: '/ia-radiografia', 
        icon: Sparkles, 
        moduleKey: 'IA' 
      },
      { 
        title: 'Fluxo Digital', 
        url: '/fluxo-digital', 
        icon: Workflow, 
        moduleKey: 'FLUXO_DIGITAL' 
      }
    ]
  },

  // ========= 7. SUPORTE =========
  {
    label: 'SUPORTE',
    items: [
      { 
        title: 'Central de Ajuda', 
        url: '/ajuda', 
        icon: BookOpen 
      }
    ]
  }
];

/**
 * MENU ADMINISTRAÇÃO (ADMIN ONLY)
 */
export const adminMenuItems: MenuItem[] = [
  {
    title: "Clínicas",
    url: "/clinicas",
    icon: Building2,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Módulos",
    url: "/configuracoes/modulos",
    icon: Package,
  },
  {
    title: "Database",
    icon: Database,
    collapsed: false,
    subItems: [
      { title: "Backups", url: "/admin/backups", icon: HardDrive },
      { title: "Manutenção DB", url: "/admin/database-maintenance", icon: Wrench },
      { title: "Migrations", url: "/admin/migrations", icon: GitBranch },
      { title: "SQL Query", url: "/admin/sql-query", icon: Code2 }
    ]
  },
  {
    title: "Documentação",
    icon: BookText,
    collapsed: false,
    subItems: [
      { title: "Decisões (ADR)", url: "/admin/adrs", icon: ScrollText },
      { title: "Código Fonte", url: "/admin/codebase", icon: FileCode },
      { title: "GitHub", url: "/admin/github", icon: Github }
    ]
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  }
];
