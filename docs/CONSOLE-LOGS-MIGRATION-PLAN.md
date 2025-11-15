# Console Logs Migration Plan 📝

## Objetivo

Substituir **todos os 337 `console.*`** por logger estruturado para:
- ✅ Prevenir exposição de dados sensíveis em produção
- ✅ Melhorar observabilidade com contexto estruturado
- ✅ Reduzir overhead de performance
- ✅ Facilitar debugging com níveis de log

---

## Status Atual

**Total**: 337 ocorrências em 129 arquivos  
**Substituídos**: 10 ocorrências (3%)  
**Restantes**: 327 ocorrências (97%)

---

## Estratégia de Migração (3 Fases)

### FASE A: Edge Functions (ALTA PRIORIDADE) 🔥

**Justificativa**: Edge Functions expõem dados sensíveis diretamente para logs do Supabase.

**Arquivos Alvo**: 70 Edge Functions

**Padrão de Substituição**:

```typescript
// ❌ ANTES
console.log('User authenticated:', userId);
console.error('Database error:', error);

// ✅ DEPOIS
import { logger } from '../_shared/logger.ts'

logger.info('User authenticated', { userId });
logger.error('Database error', error, { context: 'query_failed' });
```

**Lista de Funções Prioritárias** (Top 20):

1. `get-my-modules` (autenticação + dados de módulos)
2. `toggle-module-state` (operações críticas)
3. `backup-manager` (dados de backup)
4. `crypto-manager` (transações financeiras)
5. `create-patient` (dados sensíveis LGPD)
6. `update-patient` (dados sensíveis LGPD)
7. `create-prontuario` (dados médicos)
8. `update-prontuario` (dados médicos)
9. `get-crypto-rates` (dados financeiros)
10. `process-webhook` (integrações externas)
11. `send-whatsapp` (comunicação com pacientes)
12. `generate-pdf` (documentos)
13. `backup-integrity` (verificações de segurança)
14. `rate-limiter` (security logs)
15. `audit-trail` (compliance LGPD)
16. `validate-backup-integrity` (security)
17. `check-backup-integrity-alerts` (monitoring)
18. `test-backup-restore` (testes críticos)
19. `create-appointment` (agendamento)
20. `cancel-appointment` (operações críticas)

**Estimativa**: 8 horas (15 min por função em média)

**Script Automatizado**:

```bash
#!/bin/bash
# migrate-edge-functions-logs.sh

FUNCTIONS_DIR="supabase/functions"

for func in $(find $FUNCTIONS_DIR -name "index.ts" | head -20); do
  echo "Processing: $func"
  
  # Adicionar import se não existir
  if ! grep -q "from '../_shared/logger.ts'" "$func"; then
    sed -i "2i import { logger } from '../_shared/logger.ts'" "$func"
  fi
  
  # Substituir console.log
  sed -i "s/console\.log(/logger.info(/g" "$func"
  
  # Substituir console.error
  sed -i "s/console\.error(/logger.error(/g" "$func"
  
  # Substituir console.warn
  sed -i "s/console\.warn(/logger.warn(/g" "$func"
  
  echo "✅ $func migrated"
done
```

---

### FASE B: Use Cases & Application Layer (MÉDIA PRIORIDADE) ⚙️

**Justificativa**: Use Cases contêm lógica de negócio e precisam de logs estruturados para debugging.

**Arquivos Alvo**: ~50 arquivos em `src/application/use-cases/`

**Padrão de Substituição**:

```typescript
// ❌ ANTES
console.log('Creating patient:', patientData);

// ✅ DEPOIS
import { logger } from '@/lib/logger';

logger.info('Creating patient', { 
  patientId: patientData.id,
  clinicId: patientData.clinic_id 
  // NÃO incluir dados sensíveis como CPF, nome completo
});
```

**Atenção Especial**: **NUNCA** logar dados sensíveis:
- ❌ CPF, RG, CNH
- ❌ Nomes completos
- ❌ Endereços
- ❌ Dados médicos
- ❌ Senhas, tokens, API keys

**Lista de Use Cases Prioritários**:

1. `CreatePatientUseCase` (dados LGPD)
2. `UpdatePatientUseCase` (dados LGPD)
3. `CreateProntuarioUseCase` (dados médicos)
4. `CreateTransactionUseCase` (financeiro)
5. `ProcessPaymentUseCase` (financeiro)
6. `CreateLeadUseCase` (CRM)
7. `ConvertLeadUseCase` (CRM)
8. `SendWhatsAppUseCase` (comunicação)
9. `GeneratePDFUseCase` (documentos)
10. `CreateBackupUseCase` (operações críticas)

**Estimativa**: 5 horas (6 min por arquivo em média)

---

### FASE C: Components & UI (BAIXA PRIORIDADE) 🎨

**Justificativa**: Componentes UI têm menor risco de exposição, mas ainda precisam de logs estruturados para debugging.

**Arquivos Alvo**: ~80 arquivos

**Estratégia**: Substituição gradual durante refatorações normais.

**Padrão de Substituição**:

```typescript
// ❌ ANTES
console.error('Failed to fetch data:', error);

// ✅ DEPOIS
import { logger } from '@/lib/logger';

logger.error('Failed to fetch data', error, { 
  component: 'PatientList',
  action: 'fetch'
});
```

**Estimativa**: 4 horas (3 min por arquivo em média)

---

## Cronograma

| Fase | Prioridade | Arquivos | Estimativa | Prazo |
|------|-----------|----------|-----------|-------|
| **A - Edge Functions** | 🔥 ALTA | 70 | 8h | 2025-11-18 |
| **B - Use Cases** | ⚙️ MÉDIA | 50 | 5h | 2025-11-22 |
| **C - Components** | 🎨 BAIXA | 80 | 4h | 2025-12-06 |
| **TOTAL** | | **200** | **17h** | **3 semanas** |

---

## Checklist de Validação

### Por Arquivo Migrado

- [ ] Import do logger adicionado
- [ ] Todos `console.log` substituídos por `logger.info`
- [ ] Todos `console.error` substituídos por `logger.error`
- [ ] Todos `console.warn` substituídos por `logger.warn`
- [ ] **NENHUM dado sensível** sendo logado
- [ ] Contexto relevante adicionado aos logs
- [ ] Build TypeScript sem erros
- [ ] ESLint sem warnings
- [ ] Funcionalidade testada manualmente

### Por Fase Completa

**Fase A (Edge Functions)**:
- [ ] 70 funções migradas
- [ ] Logs verificados no Supabase Dashboard
- [ ] Nenhum dado sensível exposto
- [ ] Performance não degradada

**Fase B (Use Cases)**:
- [ ] 50 use cases migrados
- [ ] Logs de desenvolvimento funcionando
- [ ] Contexto estruturado presente
- [ ] Compliance LGPD mantido

**Fase C (Components)**:
- [ ] 80 componentes migrados
- [ ] Logs de UI apropriados
- [ ] Experiência de debugging melhorada
- [ ] Zero console.* remanescentes

---

## Monitoramento Pós-Migração

### Métricas a Acompanhar

1. **Volume de Logs**:
   - Baseline (console.*): ~10GB/mês
   - Meta (logger): ~5GB/mês (50% redução)

2. **Performance**:
   - Overhead de logging: < 5ms por request
   - CPU usage: < 1% adicional

3. **Segurança**:
   - Dados sensíveis expostos: **0**
   - Conformidade LGPD: **100%**

### Ferramentas de Observabilidade (Futuro)

- [ ] Integrar com Sentry (error tracking)
- [ ] Integrar com DataDog (logs estruturados)
- [ ] Integrar com LogRocket (session replay)
- [ ] Dashboard customizado de logs

---

## Comandos Úteis

```bash
# Contar console.* restantes
grep -r "console\." src/ supabase/functions/ | wc -l

# Listar arquivos com console.*
grep -rl "console\." src/ supabase/functions/

# Encontrar console.* com dados potencialmente sensíveis
grep -rn "console.*cpf\|console.*email\|console.*password" src/

# Validar que logger foi importado
grep -rl "from '@/lib/logger'" src/

# Executar script de migração (Fase A)
./scripts/migrate-edge-functions-logs.sh
```

---

## Responsáveis

- **Tech Lead**: Responsável pela FASE A (Edge Functions)
- **Backend Team**: Responsável pela FASE B (Use Cases)
- **Frontend Team**: Responsável pela FASE C (Components)
- **Security Team**: Review de todos os logs para dados sensíveis

---

**Última revisão**: 2025-11-15 | **Próxima revisão**: 2025-11-18
