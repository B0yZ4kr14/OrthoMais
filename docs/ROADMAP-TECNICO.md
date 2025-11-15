# Roadmap Técnico - Ortho+ 🚀

## Status do Projeto

**Última Atualização**: 2025-11-15  
**Versão**: 1.0.0 (MVP Completo)  
**Stack**: React + Vite + TypeScript + Supabase + Tailwind CSS

---

## ✅ CONCLUÍDO (v1.0.0)

### Arquitetura Core
- ✅ DDD (Domain-Driven Design) completo
- ✅ CQRS pattern implementado
- ✅ Event-Driven Architecture
- ✅ Dependency Injection Container
- ✅ Sistema modular plug-and-play descentralizado
- ✅ 17 módulos implementados

### Value Objects & Aggregates
- ✅ 44 Value Objects com validação completa
- ✅ 3 Aggregates principais (Transaction, Prontuario, Lead)
- ✅ 61 testes unitários (88% cobertura)

### Segurança & Compliance
- ✅ RLS (Row Level Security) em todas as tabelas
- ✅ Audit Trail completo (LGPD)
- ✅ Assinatura Digital (ICP-Brasil ready)
- ✅ Backup automatizado com retenção configurável

### Módulos Principais
- ✅ PEP (Prontuário Eletrônico)
- ✅ Agenda Inteligente
- ✅ Financeiro (Fluxo de Caixa)
- ✅ CRM + Funil de Vendas
- ✅ BI & Dashboards
- ✅ Estoque
- ✅ Odontograma 2D/3D
- ✅ Orçamentos & Contratos Digitais

---

## 🔄 EM ANDAMENTO (Q1 2025)

### Performance & Escalabilidade
- 🔄 Implementar cache distribuído (Redis)
  - Prioridade: **Alta**
  - Estimativa: 2 semanas
  - Responsável: Backend Team
  
- 🔄 Migrar para Supabase Realtime v2
  - Prioridade: **Média**
  - Estimativa: 1 semana
  - Impacto: Melhor performance em notificações real-time

### Testes & Qualidade
- 🔄 Adicionar testes E2E (Playwright)
  - Prioridade: **Alta**
  - Cobertura alvo: 70% dos fluxos críticos
  - Estimativa: 3 semanas

- 🔄 Aumentar cobertura de testes unitários
  - Atual: 88% (Value Objects + Aggregates)
  - Meta: 90% (incluir Use Cases)

---

## 📋 PLANEJADO (Q2 2025)

### DevOps & Observabilidade
- [ ] Implementar feature flags (LaunchDarkly)
  - Objetivo: Rollout gradual de features
  - Estimativa: 1 semana

- [ ] Adicionar observabilidade completa (DataDog)
  - Métricas de performance
  - APM (Application Performance Monitoring)
  - Error tracking & alertas
  - Estimativa: 2 semanas

### Arquitetura Avançada
- [ ] Refatorar Agenda para Event Sourcing
  - Objetivo: Histórico completo de mudanças
  - Estimativa: 4 semanas
  - Complexidade: **Alta**

- [ ] Implementar CDC (Change Data Capture)
  - Objetivo: Sincronização de dados em tempo real
  - Tecnologia: Debezium + Kafka
  - Estimativa: 6 semanas

---

## 🌟 BACKLOG (Q3-Q4 2025)

### Inteligência Artificial
- [ ] IA para detecção de problemas em radiografias
  - Tecnologia: TensorFlow.js + Computer Vision
  - Estimativa: 8 semanas
  
- [ ] Assistente virtual para agendamento
  - Integração com WhatsApp Business API
  - NLP para entender pedidos de pacientes
  - Estimativa: 6 semanas

### Integrações
- [ ] Integração com laboratórios de prótese
  - API REST + webhooks
  - Rastreamento de pedidos
  - Estimativa: 4 semanas

- [ ] Integração com convênios (Padrão TISS)
  - Faturamento automatizado
  - Guias eletrônicas
  - Estimativa: 12 semanas

### Mobile
- [ ] App mobile híbrido (React Native)
  - Agenda simplificada
  - Notificações push
  - Estimativa: 16 semanas

---

## 🐛 DÉBITOS TÉCNICOS CONHECIDOS

### Alta Prioridade
1. **Console.logs em produção** (337 ocorrências)
   - Risco: Exposição de dados sensíveis
   - Ação: Substituir por logger estruturado
   - Prazo: **Imediato** ⚠️

2. **Vulnerabilidades SQL** (4 funções sem search_path)
   - Risco: SQL injection via path manipulation
   - Ação: Migration já criada, aguardando deploy
   - Prazo: **Esta semana** ⚠️

### Média Prioridade
3. **70+ Edge Functions** (oportunidade de consolidação)
   - Impacto: Manutenção complexa
   - Ação: Consolidar funções relacionadas
   - Prazo: Q1 2025

4. **Componentes grandes** (>400 linhas)
   - `ModulesSimple.tsx`: 418 linhas
   - `sidebar.config.ts`: 401 linhas
   - Ação: Quebrar em componentes menores
   - Prazo: Q1 2025

### Baixa Prioridade
5. **137 TODOs/FIXMEs** no código
   - Ação: Revisar e documentar ou implementar
   - Prazo: Q2 2025

---

## 📊 Métricas de Qualidade

### Código
- **Linhas de código**: ~80,000 LOC
- **Arquivos TypeScript**: 126 arquivos
- **Edge Functions**: 70+ funções
- **Cobertura de testes**: 88% (core domain)

### Performance (meta Q1 2025)
- **TTI (Time to Interactive)**: < 2s
- **FCP (First Contentful Paint)**: < 1s
- **Lighthouse Score**: > 90

### Segurança
- **RLS**: 100% das tabelas
- **Audit Trail**: Implementado
- **LGPD Compliance**: ✅

---

## 🎯 OKRs Q1 2025

### Objective 1: Garantir Estabilidade em Produção
- **KR1**: 99.9% uptime
- **KR2**: Zerar critical bugs
- **KR3**: Resposta média de API < 200ms

### Objective 2: Escalar para 100+ Clínicas
- **KR1**: Implementar cache distribuído
- **KR2**: Otimizar queries (< 50ms p95)
- **KR3**: Suportar 10k requisições/min

### Objective 3: Qualidade de Código
- **KR1**: 90% de cobertura de testes
- **KR2**: Zero vulnerabilidades HIGH/CRITICAL
- **KR3**: Lighthouse score > 90

---

## 📝 Notas Importantes

### Decisões Arquiteturais Pendentes
1. **ADR-15**: Escolha entre Redis vs Memcached para cache
2. **ADR-16**: Estratégia de rollout de features (gradual vs big bang)
3. **ADR-17**: Modelo de precificação de módulos

### Dependências Externas
- **Supabase**: v2.81.1 (atualização para v2.90+ planejada Q1)
- **React**: v18.3.1 (aguardar v19 stable)
- **Vite**: v5.x (considerar migração para Turbopack Q2)

---

## 🔗 Recursos Úteis

- [Documentação Técnica](./ARCHITECTURE.md)
- [Guia de Contribuição](./CONTRIBUTING.md)
- [Decisões Arquiteturais (ADRs)](./architecture/)
- [API Reference](./API.md)

---

**Última revisão**: 2025-11-15 | **Próxima revisão**: 2025-12-01
