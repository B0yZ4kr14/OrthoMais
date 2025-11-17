# 🔄 Estratégia de Migração REST API

## Visão Geral

Este documento descreve a estratégia de migração **gradual e sem downtime** do frontend Ortho+ de Supabase para REST API Node.js.

## 🎯 Objetivos

1. **Zero Downtime**: Sistema continua funcionando durante toda a migração
2. **Migração Incremental**: Módulo por módulo, testando cada etapa
3. **Rollback Fácil**: Possibilidade de reverter mudanças a qualquer momento
4. **Compatibilidade Total**: Mantém interfaces existentes inalteradas

## 🏗️ Arquitetura da Solução

### DataSourceProvider

O `DataSourceProvider` permite alternar entre Supabase (legacy) e REST API de forma transparente:

```typescript
<DataSourceProvider source="supabase"> {/* ou "rest-api" */}
  <App />
</DataSourceProvider>
```

### Hooks Unificados

Cada módulo possui um **hook unificado** que delega para a implementação correta:

```typescript
// usePatientsUnified.ts
export function usePatientsUnified() {
  const { useRESTAPI } = useDataSource();
  return useRESTAPI ? usePatientsAPI() : usePatientsSupabase();
}
```

**Benefícios:**
- ✅ **Troca transparente** entre implementações
- ✅ **Sem alteração nos componentes** que consomem o hook
- ✅ **Testes A/B** fáceis entre versões
- ✅ **Rollback instantâneo** mudando `source`

## 📋 Plano de Migração

### Fase 1: Infraestrutura (✅ COMPLETA)
- [x] Criar `DataSourceProvider`
- [x] Criar hooks unificados (`usePatientsUnified`, etc)
- [x] Criar hooks REST API (`usePatientsAPI`, etc)
- [x] Criar adapters de dados (DTOs)

### Fase 2: Migração por Módulo (EM PROGRESSO)

#### 2.1 Pacientes (Próximo)
```typescript
// ANTES
import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';

// DEPOIS  
import { usePatients } from '@/modules/pacientes/hooks/usePatientsUnified';
// Hook unificado se adapta automaticamente ao DataSource configurado
```

**Passos:**
1. Atualizar imports nos componentes
2. Testar com `source="supabase"` (deve funcionar igual)
3. Alternar para `source="rest-api"`
4. Validar funcionalidade completa
5. Monitorar erros por 24h
6. Confirmar migração bem-sucedida

#### 2.2 Inventário
- Seguir mesmo padrão de Pacientes
- Usar `useInventoryUnified`

#### 2.3 Financeiro
- Seguir mesmo padrão
- Usar `useTransactionsUnified`

#### 2.4 Orçamentos
- Criar hook unificado quando migrar
- Usar `OrcamentoAdapter` existente

### Fase 3: Validação e Limpeza

Após todos os módulos migrados:

1. **Monitoramento**: 1 semana com `source="rest-api"` em produção
2. **Análise de Logs**: Verificar erros e performance
3. **Feedback de Usuários**: Coletar experiências
4. **Limpeza de Código**: Remover hooks Supabase obsoletos
5. **Documentação**: Atualizar docs técnicos

## 🚀 Como Usar

### Para Desenvolvedores

#### Testar REST API Localmente

```typescript
// src/main.tsx
import { DataSourceProvider } from '@/lib/providers/DataSourceProvider';

root.render(
  <DataSourceProvider source="rest-api"> {/* Testar nova API */}
    <App />
  </DataSourceProvider>
);
```

#### Rollback para Supabase

```typescript
// Basta trocar o source
<DataSourceProvider source="supabase"> {/* Voltar para Supabase */}
  <App />
</DataSourceProvider>
```

### Feature Flags (Futuro)

Para produção, usar feature flag:

```typescript
const dataSource = featureFlags.useRESTAPI ? 'rest-api' : 'supabase';

<DataSourceProvider source={dataSource}>
  <App />
</DataSourceProvider>
```

## 📊 Progresso da Migração

| Módulo | Hook Unificado | Componentes Migrados | Status |
|--------|---------------|---------------------|---------|
| **Pacientes** | ✅ `usePatientsUnified` | 0/15 | 🔄 Próximo |
| **Inventário** | ✅ `useInventoryUnified` | 0/8 | ⏳ Aguardando |
| **Financeiro** | ✅ `useTransactionsUnified` | 0/12 | ⏳ Aguardando |
| **Orçamentos** | ⏳ Pendente | 0/6 | ⏳ Aguardando |
| **PEP** | ⏳ Pendente | 0/20 | ⏳ Aguardando |
| **PDV** | ⏳ Pendente | 0/5 | ⏳ Aguardando |
| **Faturamento** | ⏳ Pendente | 0/7 | ⏳ Aguardando |

**Total: 5% Migrado (Infraestrutura pronta)**

## 🛡️ Testes e Validação

### Checklist por Módulo

Para cada módulo migrado, validar:

- [ ] CRUD completo funciona
- [ ] Filtros e buscas corretos
- [ ] Validações de formulário mantidas
- [ ] Mensagens de erro apropriadas
- [ ] Loading states corretos
- [ ] Realtime updates (se aplicável)
- [ ] Performance igual ou melhor
- [ ] Sem erros no console

### Testes E2E

Executar suíte E2E Playwright após cada migração:

```bash
npm run test:e2e
```

## 📞 Suporte

**Dúvidas sobre migração?**
- Consultar `docs/FRONTEND_MIGRATION_GUIDE.md`
- Revisar exemplos em `src/modules/*/hooks/*Unified.ts`

---

**Última Atualização**: Fase 1 completa. Iniciando Fase 2.1 (Pacientes).
