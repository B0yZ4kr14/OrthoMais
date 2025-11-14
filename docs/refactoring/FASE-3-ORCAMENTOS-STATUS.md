# 🚀 FASE 3: MÓDULO ORCAMENTOS - STATUS

**Objetivo:** Aplicar o "Golden Pattern" para Orçamentos e Contratos  
**Módulo Atual:** ORCAMENTOS  
**Prioridade:** ALTA  
**Estimativa:** 5-6 horas

---

## 📊 Progresso Geral - Módulo ORCAMENTOS

```
Domain Layer:        ██████████ 100% (2/2) ✅
Application Layer:   ██████████ 100% (5/5) ✅
Infrastructure Layer: ░░░░░░░░░░  0% (0/4)
Presentation Layer:  ░░░░░░░░░░  0% (0/2)

Total: ██████████░░░░░░░░░░ 50%
```

---

## ✅ Domain Layer (100% - 2/2)

### Entidades
- ✅ **Orcamento** (Aggregate Root)
  - Props interface definida
  - Factory methods (create, restore)
  - Getters para todas as props
  - Domain methods: enviarParaAprovacao(), aprovar(), rejeitar(), marcarExpirado()
  - Validações de transições de estado
  - Métodos de consulta: podeSerEnviado(), isExpirado(), isPresteAExpirar()
  - Cálculos: getDiasAteExpiracao(), atualizarValores()

- ✅ **ItemOrcamento**
  - Props interface definida
  - Factory methods (create, restore)
  - Getters para todas as props
  - Domain methods: atualizarQuantidade(), aplicarDescontoPercentual(), aplicarDescontoValor()
  - Recálculo automático de valores
  - Método getSubtotal()

### Repository Interfaces
- ✅ **IOrcamentoRepository**
  - findById, findByNumero, findByPatientId
  - findByClinicId, findByStatus
  - findPendentes, findExpirados
  - save, update, delete

- ✅ **IItemOrcamentoRepository**
  - findById, findByOrcamentoId
  - save, update, delete, deleteByOrcamentoId

---

## ✅ Application Layer (100% - 5/5)

### Use Cases Implementados
- ✅ **CreateOrcamentoUseCase**
  - Cria novo orçamento em estado RASCUNHO
  - Aplica validações de domínio via entidade
  - Gera número único automaticamente
  - Calcula data de expiração

- ✅ **UpdateOrcamentoUseCase**
  - Atualiza valores de orçamento em RASCUNHO
  - Valida estado editável
  - Recalcula valores totais
  - Atualiza tipo de pagamento

- ✅ **AprovarOrcamentoUseCase**
  - Aprova orçamento PENDENTE
  - Verifica se não está expirado
  - Registra usuário aprovador
  - Atualiza timestamp de aprovação

- ✅ **RejeitarOrcamentoUseCase**
  - Rejeita orçamento PENDENTE
  - Requer motivo obrigatório
  - Registra usuário rejeitador
  - Atualiza timestamp de rejeição

- ✅ **AddItemOrcamentoUseCase**
  - Adiciona item a orçamento em RASCUNHO
  - Valida estado editável do orçamento
  - Recalcula totais automaticamente
  - Mantém ordem dos itens

---

## 🔄 Infrastructure Layer (0%)

### Repositories a Implementar
- [ ] SupabaseOrcamentoRepository
- [ ] SupabaseItemOrcamentoRepository

### Mappers a Implementar
- [ ] OrcamentoMapper
- [ ] ItemOrcamentoMapper

### DI Container
- [ ] Registrar repositories
- [ ] Registrar use cases
- [ ] Atualizar ServiceKeys

---

## 🔄 Presentation Layer (0%)

### Hooks a Implementar
- [ ] useOrcamentos
- [ ] useItensOrcamento

---

## 📝 Próximos Passos

1. ✅ Criar entidades Orcamento e ItemOrcamento + interfaces
2. ✅ Implementar Use Cases
3. 🔄 Implementar Repositories Supabase (PRÓXIMO)
4. Implementar Mappers
5. Criar Hooks customizados
6. Refatorar componentes (opcional)

---

**Última Atualização:** 2025-11-14 23:15  
**Status:** 🟡 50% COMPLETO - Domain + Application Layers ✅
