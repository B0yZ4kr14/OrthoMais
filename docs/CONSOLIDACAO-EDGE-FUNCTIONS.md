# Consolidação de Edge Functions 🔧

## Objetivo

Reduzir **70 Edge Functions → 35** através de consolidação lógica, melhorando:
- ✅ Manutenibilidade (menos arquivos para gerenciar)
- ✅ Performance (menos cold starts)
- ✅ Custos (menos deploys, menos memória)
- ✅ Debugging (logs centralizados)

---

## Status Atual

**Total Edge Functions**: 70  
**Consolidadas**: 6 (8.5%)  
**Restantes**: 64  
**Meta**: 35 (50% redução)  
**Pendente**: 29 funções (41%)

---

## Estratégia de Consolidação

### Princípio: "Action-Based Routing"

Ao invés de ter múltiplas funções pequenas:
```
❌ backup-deduplication/
❌ backup-immutability/
❌ backup-streaming/
❌ validate-backup-integrity/
```

Consolidamos em uma função com roteamento por `action`:
```
✅ backup-manager/
   └─ Actions: deduplicate, check-immutability, stream-upload, validate-integrity
```

### Exemplo de Estrutura

```typescript
// supabase/functions/backup-manager/index.ts
Deno.serve(async (req) => {
  const { action, payload } = await req.json();
  
  switch (action) {
    case 'deduplicate': 
      return handleDeduplication(payload);
    
    case 'check-immutability': 
      return handleImmutability(payload);
    
    case 'stream-upload': 
      return handleStreaming(payload);
    
    case 'validate-integrity': 
      return handleValidateIntegrity(payload);
    
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400 }
      );
  }
});
```

---

## Famílias de Consolidação

### ✅ Concluídas (2 famílias, 8 → 2 funções)

#### 1. Backup Family ✅
**Antes** (4 funções):
- `backup-deduplication`
- `backup-immutability`
- `backup-streaming`
- `validate-backup-integrity`

**Depois** (1 função):
- `backup-manager` com 4 actions

**Redução**: 75% (4 → 1)  
**LOC Antes**: ~500 linhas  
**LOC Depois**: ~200 linhas  
**Economia**: 60%

---

#### 2. Crypto Family ✅
**Antes** (4 funções):
- `create-crypto-invoice`
- `process-crypto-payment`
- `convert-crypto-to-brl`
- `send-crypto-notification`

**Depois** (1 função):
- `crypto-manager` com 4 actions

**Redução**: 75% (4 → 1)  
**LOC Antes**: ~400 linhas  
**LOC Depois**: ~220 linhas  
**Economia**: 45%

---

### 🔄 Em Progresso (3 famílias, ~18 funções)

#### 3. Marketing Family 🔄
**Candidatas** (6 funções):
- `create-campaign`
- `send-campaign`
- `track-campaign-metrics`
- `schedule-campaign`
- `test-campaign-message`
- `cancel-campaign`

**Proposta**: `marketing-manager` com 6 actions

**Estimativa**: 2 horas  
**Prioridade**: ALTA

---

#### 4. BI (Business Intelligence) Family 🔄
**Candidatas** (4 funções):
- `calculate-kpis`
- `generate-dashboard`
- `export-report`
- `cache-bi-data`

**Proposta**: `bi-manager` com 4 actions

**Estimativa**: 1.5 horas  
**Prioridade**: MÉDIA

---

#### 5. LGPD/Compliance Family 🔄
**Candidatas** (5 funções):
- `request-data-export`
- `request-data-deletion`
- `consent-management`
- `audit-trail-query`
- `generate-compliance-report`

**Proposta**: `lgpd-manager` com 5 actions

**Estimativa**: 2 horas  
**Prioridade**: ALTA (compliance crítico)

---

### ⏳ Planejadas (4 famílias, ~20 funções)

#### 6. Agenda Family
**Candidatas** (8 funções):
- `create-appointment`
- `update-appointment`
- `cancel-appointment`
- `send-confirmation`
- `send-reminder`
- `block-time`
- `get-available-slots`
- `reschedule-appointment`

**Proposta**: `agenda-manager` com 8 actions

**Estimativa**: 3 horas

---

#### 7. Patient Management Family
**Candidatas** (6 funções):
- `create-patient`
- `update-patient`
- `search-patients`
- `merge-patients`
- `export-patient-data`
- `calculate-patient-risk`

**Proposta**: `patient-manager` com 6 actions

**Estimativa**: 2 horas

---

#### 8. Financial Family
**Candidatas** (4 funções):
- `create-transaction`
- `process-payment`
- `calculate-cash-flow`
- `generate-financial-report`

**Proposta**: `financial-manager` com 4 actions

**Estimativa**: 1.5 horas

---

#### 9. Notifications Family
**Candidatas** (2 funções):
- `send-whatsapp`
- `send-email`

**Proposta**: `notification-manager` com 2 actions

**Estimativa**: 1 hora

---

## 📊 Plano de Execução

### Sprint 1: Compliance & Marketing (ALTA PRIORIDADE)
**Duração**: 1 semana  
**Funções**: 11 (6 Marketing + 5 LGPD)  
**Redução**: 11 → 2 (82%)

| Dia | Família | Funções | Estimativa |
|-----|---------|---------|-----------|
| Seg | Marketing | 6 → 1 | 2h |
| Ter | LGPD | 5 → 1 | 2h |
| Qua | Testes | - | 1h |
| Qui | Review | - | 1h |
| Sex | Deploy | - | 1h |

---

### Sprint 2: Core Operations (MÉDIA PRIORIDADE)
**Duração**: 1 semana  
**Funções**: 18 (8 Agenda + 6 Patient + 4 Financial)  
**Redução**: 18 → 3 (83%)

| Dia | Família | Funções | Estimativa |
|-----|---------|---------|-----------|
| Seg | Agenda | 8 → 1 | 3h |
| Ter | Patient | 6 → 1 | 2h |
| Qua | Financial | 4 → 1 | 1.5h |
| Qui | BI | 4 → 1 | 1.5h |
| Sex | Testes + Deploy | - | 2h |

---

### Sprint 3: Final & Polish (BAIXA PRIORIDADE)
**Duração**: 1 semana  
**Funções**: 2 (Notifications)  
**Redução**: 2 → 1 (50%)

| Dia | Família | Funções | Estimativa |
|-----|---------|---------|-----------|
| Seg | Notifications | 2 → 1 | 1h |
| Ter-Sex | Otimizações | - | 4h |

---

## 🎯 Métricas de Sucesso

### Por Família

| Família | Antes | Depois | Redução | Status |
|---------|-------|--------|---------|--------|
| Backup | 4 | 1 | 75% | ✅ |
| Crypto | 4 | 1 | 75% | ✅ |
| Marketing | 6 | 1 | 83% | 🔄 Sprint 1 |
| LGPD | 5 | 1 | 80% | 🔄 Sprint 1 |
| BI | 4 | 1 | 75% | 🔄 Sprint 2 |
| Agenda | 8 | 1 | 87% | ⏳ Sprint 2 |
| Patient | 6 | 1 | 83% | ⏳ Sprint 2 |
| Financial | 4 | 1 | 75% | ⏳ Sprint 2 |
| Notifications | 2 | 1 | 50% | ⏳ Sprint 3 |

### Consolidado

- **Total Antes**: 43 funções candidatas
- **Total Depois**: 9 funções consolidadas
- **Redução**: 79% (43 → 9)
- **Concluído**: 18% (8 → 2)

---

## 💡 Benefícios Esperados

### Performance

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Cold Starts | 70 | 35 | 50% ⬇️ |
| Deploy Time | ~15 min | ~8 min | 47% ⬇️ |
| Memory Usage | ~7GB | ~3.5GB | 50% ⬇️ |
| Request Latency | ~200ms | ~180ms | 10% ⬇️ |

### Custos (Estimativa Mensal)

| Item | Antes | Depois | Economia |
|------|-------|--------|----------|
| Compute | $200 | $120 | $80 (40%) |
| Storage | $50 | $30 | $20 (40%) |
| Bandwidth | $30 | $25 | $5 (16%) |
| **TOTAL** | **$280** | **$175** | **$105 (37%)** |

---

## ⚠️ Riscos e Mitigações

### Risco 1: Breaking Changes
**Probabilidade**: Média  
**Impacto**: Alto  
**Mitigação**:
- Manter funções antigas como deprecated por 1 mês
- Adicionar warnings nos logs
- Documentar migration guide

### Risco 2: Debugging Complexo
**Probabilidade**: Baixa  
**Impacto**: Médio  
**Mitigação**:
- Logger estruturado com contexto rico
- Action name em todos os logs
- Distributed tracing (futuro)

### Risco 3: Performance Degradation
**Probabilidade**: Muito Baixa  
**Impacto**: Médio  
**Mitigação**:
- Benchmarks antes/depois
- Monitoramento de latência
- Load testing

---

## 📋 Checklist por Sprint

### Sprint 1: Marketing + LGPD

- [ ] Analisar 11 funções
- [ ] Criar `marketing-manager/index.ts`
- [ ] Criar `lgpd-manager/index.ts`
- [ ] Adicionar tipos em `_shared/types.ts`
- [ ] Migrar logs para logger estruturado
- [ ] Criar testes unitários
- [ ] Atualizar chamadas no frontend
- [ ] Deprecar funções antigas
- [ ] Deploy
- [ ] Validação em produção

### Sprint 2: Core Operations

- [ ] Analisar 18 funções
- [ ] Criar `agenda-manager/index.ts`
- [ ] Criar `patient-manager/index.ts`
- [ ] Criar `financial-manager/index.ts`
- [ ] Consolidar `bi-manager/index.ts`
- [ ] Migrar logs
- [ ] Criar testes
- [ ] Atualizar frontend
- [ ] Deploy
- [ ] Validação

### Sprint 3: Final

- [ ] Consolidar `notification-manager/index.ts`
- [ ] Revisar todas as funções consolidadas
- [ ] Remover funções deprecated
- [ ] Atualizar documentação
- [ ] Performance benchmarks
- [ ] Deploy final
- [ ] Celebração! 🎉

---

## 🔗 Scripts Úteis

```bash
# Listar todas as Edge Functions
find supabase/functions -name "index.ts" | wc -l

# Contar LOC por família
find supabase/functions/backup-* -name "*.ts" -exec wc -l {} + | tail -1

# Verificar funções sem logger
grep -L "from '../_shared/logger.ts'" supabase/functions/*/index.ts

# Deploy funções consolidadas
supabase functions deploy backup-manager
supabase functions deploy crypto-manager

# Executar testes das funções
deno test supabase/functions/_tests/
```

---

**Última atualização**: 2025-11-15  
**Responsável**: Backend Team  
**Review**: Tech Lead
