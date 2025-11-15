# FASE 3: MÓDULO FINANCEIRO - STATUS DE IMPLEMENTAÇÃO

## 📊 Status Geral: 🔄 0% (Iniciando)

O módulo **FINANCEIRO** será implementado seguindo Clean Architecture como módulo core do sistema.

---

## 🎯 Escopo do Módulo FINANCEIRO

### Funcionalidades Principais

1. **Fluxo de Caixa**
   - Dashboard com visão de entradas e saídas
   - Abertura e fechamento de caixa
   - Sangrias (retiradas) com sugestão por IA
   - Histórico de movimentações
   - Alertas de risco de assalto

2. **Contas a Pagar**
   - CRUD de contas a pagar
   - Controle de fornecedores
   - Status: Pendente, Pago, Atrasado, Cancelado
   - Categorias (Aluguel, Salários, Materiais, etc)
   - Anexos de notas fiscais
   - Parcelamento e recorrência

3. **Contas a Receber**
   - CRUD de contas a receber (de pacientes/clientes)
   - Integração com orçamentos e tratamentos
   - Status: Pendente, Recebido, Atrasado, Cancelado
   - Formas de pagamento
   - Controle de inadimplência

4. **Categorização**
   - Categorias de receitas
   - Categorias de despesas
   - Centros de custo
   - Tags personalizadas

5. **Relatórios**
   - DRE (Demonstração do Resultado do Exercício)
   - Fluxo de caixa projetado
   - Análise por categoria
   - Análise por período
   - Exportação (PDF, Excel)

---

## 📁 Arquitetura a Implementar

### 1. Domain Layer ⏳
**Localização:** `src/modules/financeiro/domain/`

#### Entidades (0%)
- ⏳ `entities/Transaction.ts` - Transação (entrada/saída)
- ⏳ `entities/Account.ts` - Conta bancária/caixa
- ⏳ `entities/Category.ts` - Categoria financeira
- ⏳ `entities/CashRegister.ts` - Caixa (abertura/fechamento)

#### Value Objects (0%)
- ⏳ `valueObjects/Money.ts` - Valor monetário
- ⏳ `valueObjects/Period.ts` - Período financeiro

#### Repositórios (0%)
- ⏳ `repositories/ITransactionRepository.ts`
- ⏳ `repositories/IAccountRepository.ts`
- ⏳ `repositories/ICategoryRepository.ts`
- ⏳ `repositories/ICashRegisterRepository.ts`

### 2. Infrastructure Layer ⏳
**Localização:** `src/modules/financeiro/infrastructure/`

#### Mappers (0%)
- ⏳ `mappers/TransactionMapper.ts`
- ⏳ `mappers/AccountMapper.ts`
- ⏳ `mappers/CategoryMapper.ts`
- ⏳ `mappers/CashRegisterMapper.ts`

#### Repositórios Supabase (0%)
- ⏳ `repositories/TransactionRepositorySupabase.ts`
- ⏳ `repositories/AccountRepositorySupabase.ts`
- ⏳ `repositories/CategoryRepositorySupabase.ts`
- ⏳ `repositories/CashRegisterRepositorySupabase.ts`

### 3. Application Layer ⏳
**Localização:** `src/modules/financeiro/application/useCases/`

#### Use Cases de Transações (0%)
- ⏳ `CreateTransactionUseCase.ts`
- ⏳ `ListTransactionsUseCase.ts`
- ⏳ `UpdateTransactionUseCase.ts`
- ⏳ `DeleteTransactionUseCase.ts`
- ⏳ `GetTransactionsByPeriodUseCase.ts`

#### Use Cases de Caixa (0%)
- ⏳ `OpenCashRegisterUseCase.ts`
- ⏳ `CloseCashRegisterUseCase.ts`
- ⏳ `CreateSangriaUseCase.ts`
- ⏳ `GetCashFlowUseCase.ts`

#### Use Cases de Categorias (0%)
- ⏳ `CreateCategoryUseCase.ts`
- ⏳ `ListCategoriesUseCase.ts`
- ⏳ `UpdateCategoryUseCase.ts`
- ⏳ `DeleteCategoryUseCase.ts`

#### Use Cases de Relatórios (0%)
- ⏳ `GenerateDREUseCase.ts`
- ⏳ `GenerateCashFlowReportUseCase.ts`
- ⏳ `GetFinancialSummaryUseCase.ts`

**Total Planejado: ~16 Use Cases**

### 4. Presentation Layer ⏳
**Localização:** `src/modules/financeiro/presentation/`

#### Hooks (0%)
- ⏳ `hooks/useTransactions.ts`
- ⏳ `hooks/useCashRegister.ts`
- ⏳ `hooks/useCategories.ts`
- ⏳ `hooks/useFinancialReports.ts`

#### Contextos (0%)
- ⏳ `contexts/FinanceiroContext.tsx`

### 5. UI Layer ⏳
**Localização:** `src/modules/financeiro/ui/`

#### Componentes (0%)
- ⏳ `components/TransactionCard.tsx`
- ⏳ `components/TransactionForm.tsx`
- ⏳ `components/CashFlowChart.tsx`
- ⏳ `components/CashRegisterCard.tsx`
- ⏳ `components/CategorySelector.tsx`
- ⏳ `components/FinancialSummary.tsx`
- ⏳ `components/DREReport.tsx`

#### Páginas (0%)
- ⏳ `pages/FinanceiroPage.tsx` - Dashboard financeiro
- ⏳ `pages/ContasPagarPage.tsx` - Gestão de contas a pagar
- ⏳ `pages/ContasReceberPage.tsx` - Gestão de contas a receber
- ⏳ `pages/FluxoCaixaPage.tsx` - Fluxo de caixa

---

## 🗄️ Banco de Dados

### Tabelas Existentes ✅
1. ✅ `contas_pagar` - Já existe
2. ✅ `caixa_movimentos` - Já existe
3. ✅ `caixa_incidentes` - Já existe

### Tabelas a Criar ⏳
1. ⏳ `financial_categories` - Categorias financeiras
2. ⏳ `financial_accounts` - Contas bancárias/caixas
3. ⏳ `contas_receber` - Contas a receber (se não existir)

### Políticas RLS ⏳
- ⏳ Todas as tabelas terão RLS habilitado
- ⏳ Políticas baseadas em `clinic_id`
- ⏳ Validação de permissões por operação

---

## 🔗 Integração com Sistema

### Rotas ⏳
- ⏳ Rota principal: `/financeiro`
- ⏳ Rota contas a pagar: `/financeiro/contas-pagar`
- ⏳ Rota contas a receber: `/financeiro/contas-receber`
- ⏳ Rota fluxo de caixa: `/financeiro/fluxo-caixa`

### Sidebar ✅
- ✅ Link "Financeiro" no grupo "Financeiro"
- ✅ ModuleKey: `'FINANCEIRO'`
- ✅ Ícone: `DollarSign`
- ✅ Já existe no sidebar.config.ts

---

## 📋 Checklist de Implementação

### Preparação
- [ ] Criar documento de status
- [ ] Analisar tabelas existentes
- [ ] Definir entidades do domínio
- [ ] Definir use cases principais

### Domain Layer
- [ ] Criar entidades (Transaction, Account, Category, CashRegister)
- [ ] Criar value objects (Money, Period)
- [ ] Criar interfaces de repositórios
- [ ] Implementar regras de negócio nas entidades

### Infrastructure Layer
- [ ] Criar mappers para cada entidade
- [ ] Implementar repositórios Supabase
- [ ] Configurar conexões com banco
- [ ] Criar migrations se necessário

### Application Layer
- [ ] Implementar use cases de transações
- [ ] Implementar use cases de caixa
- [ ] Implementar use cases de categorias
- [ ] Implementar use cases de relatórios
- [ ] Adicionar validações de negócio

### Presentation Layer
- [ ] Criar hooks customizados
- [ ] Criar contexto de financeiro
- [ ] Integrar com React Query
- [ ] Implementar loading states

### UI Layer
- [ ] Criar componentes visuais
- [ ] Criar formulários
- [ ] Criar páginas
- [ ] Implementar gráficos e relatórios
- [ ] Adicionar responsividade

### Integração
- [ ] Configurar rotas
- [ ] Testar controle de acesso por módulo
- [ ] Validar RLS policies
- [ ] Testar fluxo completo

---

## 🎯 Prioridades de Implementação

### FASE 1: Core (Essencial)
1. Transaction entity + CRUD
2. CashRegister entity + abertura/fechamento
3. Dashboard básico de fluxo de caixa

### FASE 2: Gestão (Importante)
4. Category entity + CRUD
5. Contas a pagar
6. Contas a receber

### FASE 3: Análise (Desejável)
7. Relatórios (DRE, Fluxo projetado)
8. Gráficos e visualizações
9. Exportação de dados

---

## 📝 Observações

- **Prioridade:** ALTA - Core do negócio
- **Complexidade:** ALTA
- **Dependências:** Nenhuma
- **Integra com:** PEP (tratamentos), ORCAMENTOS (orçamentos)
- **Módulos dependentes:** SPLIT_PAGAMENTO, INADIMPLENCIA

---

**Status:** 📋 PLANEJAMENTO COMPLETO
**Próximo Passo:** Implementar Domain Layer
