# 🚀 FASE 3: MÓDULO ORCAMENTOS - STATUS

**Objetivo:** Aplicar o "Golden Pattern" para Orçamentos e Contratos  
**Módulo Atual:** ORCAMENTOS  
**Prioridade:** ALTA  
**Estimativa:** 5-6 horas

---

## 📊 Progresso Geral - Módulo ORCAMENTOS

```
Domain Layer:        ██████████ 100% (2/2) ✅
Application Layer:   ░░░░░░░░░░  0% (0/5)
Infrastructure Layer: ░░░░░░░░░░  0% (0/4)
Presentation Layer:  ░░░░░░░░░░  0% (0/2)

Total: █████░░░░░░░░░░░░░░ 25%
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

## 🔄 Application Layer (0%)

### Use Cases a Implementar
- [ ] CreateOrcamentoUseCase
- [ ] UpdateOrcamentoUseCase
- [ ] AprovarOrcamentoUseCase
- [ ] RejeitarOrcamentoUseCase
- [ ] AddItemOrcamentoUseCase

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
2. 🔄 Implementar Use Cases (PRÓXIMO)
3. Implementar Repositories Supabase
4. Implementar Mappers
5. Criar Hooks customizados
6. Refatorar componentes (opcional)

---

**Última Atualização:** 2025-11-14 22:45  
**Status:** 🟢 25% COMPLETO - Domain Layer ✅
