# ❓ FAQ DevOps/TI - Ortho+ SaaS

> Perguntas frequentes técnicas sobre infraestrutura, deploy, segurança e troubleshooting

---

## 📋 Índice

1. [Infraestrutura e Backend](#infraestrutura-e-backend)
2. [Segurança e Autenticação](#segurança-e-autenticação)
3. [Performance e Otimização](#performance-e-otimização)
4. [Docker e Deploy](#docker-e-deploy)
5. [Monitoramento e Logs](#monitoramento-e-logs)
6. [Edge Functions](#edge-functions)
7. [Backup e Disaster Recovery](#backup-e-disaster-recovery)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Infraestrutura e Backend

### **P: Qual versão do PostgreSQL é requerida?**
**R:** PostgreSQL **15.x ou superior**. O sistema depende de features específicas:
- `SECURITY DEFINER` functions
- `SET search_path TO 'public'`
- Row Level Security (RLS)
- JSONB operators avançados
- `pg_stat_statements` para métricas

```sql
-- Verificar versão
SELECT version();
-- Deve retornar: PostgreSQL 15.x ou 16.x
```

---

### **P: Supabase self-hosted ou cloud?**
**R:** **Ambos são suportados**, mas recomendamos:

| Ambiente | Recomendação | Motivo |
|----------|--------------|--------|
| **Produção** | Supabase Cloud | Auto-scaling, backups gerenciados, SLA 99.9% |
| **Desenvolvimento** | Self-hosted | Controle total, sem custos |
| **Staging** | Supabase Cloud | Paridade com produção |

**Self-hosted setup**:
```bash
# Clone Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Configure .env
cp .env.example .env
# Edite POSTGRES_PASSWORD, JWT_SECRET, etc.

# Inicie
docker compose up -d

# Acesse: http://localhost:3000 (dashboard)
```

---

### **P: Posso usar outro banco que não PostgreSQL?**
**R:** **Não**. O sistema é **fortemente acoplado** ao PostgreSQL devido a:
- Row Level Security (RLS) — feature exclusiva do Postgres
- Triggers e functions em PL/pgSQL
- Tipo de dado JSONB (queries complexas)
- `pg_stat_statements` para performance tuning
- PostgREST para API REST automática

**Alternativas NÃO suportadas**: MySQL, MariaDB, MongoDB, SQLite.

---

### **P: Qual é a estrutura de multi-tenancy?**
**R:** **Row-level multi-tenancy** via `clinic_id`:

```sql
-- Todas as tabelas têm clinic_id
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  -- ...
);

-- RLS garante isolamento
CREATE POLICY "Isolamento por clínica"
  ON patients FOR ALL
  USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
```

**Vantagens**:
- ✅ Simples de gerenciar
- ✅ Custo-efetivo (um banco para todos)
- ✅ Backups centralizados

**Desvantagens**:
- ❌ Risco de data leak se RLS mal configurado
- ❌ Noisy neighbor problem (uma clínica pode afetar outras)

---

## 🔐 Segurança e Autenticação

### **P: RLS está ativado em TODAS as tabelas?**
**R:** **Sim, 100% das tabelas têm RLS**. Validação:

```sql
-- Lista tabelas SEM RLS (deve retornar vazio)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- Resultado esperado: 0 rows
```

Se retornar tabelas, **CORRIJA IMEDIATAMENTE**:
```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
```

---

### **P: Como funciona o audit trail?**
**R:** Trigger `log_audit_trail()` em tabelas sensíveis:

```sql
-- Trigger automático em prontuarios, pep_tratamentos, budgets
CREATE TRIGGER audit_prontuarios
  AFTER INSERT OR UPDATE OR DELETE ON prontuarios
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
```

**Dados registrados**:
- `user_id`: Quem fez a ação
- `action`: INSERT / UPDATE / DELETE
- `old_values`: Estado anterior (JSON)
- `new_values`: Estado novo (JSON)
- `ip_address`: IP do usuário
- `timestamp`: Data/hora exata

**Retenção**: 7 anos (exigência LGPD).

**Consultar logs**:
```sql
SELECT 
  user_id,
  action,
  entity_type,
  old_values,
  new_values,
  timestamp
FROM audit_trail
WHERE clinic_id = 'uuid-da-clinica'
  AND entity_type = 'prontuarios'
ORDER BY timestamp DESC
LIMIT 100;
```

---

### **P: JWT expiration? Como funcionam os tokens?**
**R:** Configurado em `supabase/config.toml`:

```toml
[auth]
access_token_ttl = 3600        # 1 hora
refresh_token_ttl = 2592000    # 30 dias
```

**Fluxo de refresh**:
```typescript
// Frontend detecta token expirado
const { data, error } = await supabase.auth.getSession()

if (error?.message === 'Token expired') {
  // Refresh automático
  const { data: refreshed } = await supabase.auth.refreshSession()
  // Retry request original
}
```

**Custom claims** (RBAC):
```sql
-- Adicionar clinic_id e app_role ao JWT
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  profile_data RECORD;
BEGIN
  SELECT clinic_id, app_role INTO profile_data
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;
  
  event := jsonb_set(event, '{claims,clinic_id}', to_jsonb(profile_data.clinic_id));
  event := jsonb_set(event, '{claims,app_role}', to_jsonb(profile_data.app_role));
  
  RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### **P: Como proteger contra SQL Injection?**
**R:** O Supabase **protege automaticamente** via parameterized queries:

```typescript
// ✅ SEGURO (parameterized)
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('full_name', userInput) // Escapado automaticamente

// ❌ PERIGOSO (se usar SQL raw)
const { data } = await supabase.rpc('unsafe_query', {
  sql: `SELECT * FROM patients WHERE full_name = '${userInput}'`
})
// NÃO FAÇA ISSO!
```

**Regra de ouro**: Use sempre query builder do Supabase, nunca concatene SQL.

---

## 🚀 Performance e Otimização

### **P: Como otimizar queries N+1?**
**R:** Use `select('*, relacionamento(*)')`:

```typescript
// ❌ RUIM (N+1 queries)
const patients = await supabase.from('patients').select('*')
for (const p of patients.data) {
  const { data: prontuarios } = await supabase
    .from('prontuarios')
    .select('*')
    .eq('patient_id', p.id)
}

// ✅ BOM (1 query)
const { data: patients } = await supabase
  .from('patients')
  .select(`
    *,
    prontuarios (
      id,
      queixa_principal,
      created_at
    )
  `)
```

**Ganho**: De **N+1 queries** para **1 query** = **10-100x mais rápido**.

---

### **P: Web Vitals targets? Como medir performance?**
**R:** Targets de produção:

| Métrica | Target | Crítico |
|---------|--------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s |
| **FID** (First Input Delay) | < 100ms | < 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| **Lighthouse Score** | > 90 | > 70 |

**Medir localmente**:
```bash
npm run test:performance
# Usa Lighthouse CLI
```

**Monitorar produção**:
```typescript
// RUM (Real User Monitoring) implementado
import { getCLS, getFID, getLCP } from 'web-vitals'

getCLS(metric => sendToAnalytics(metric))
getFID(metric => sendToAnalytics(metric))
getLCP(metric => sendToAnalytics(metric))

function sendToAnalytics(metric) {
  supabase.from('rum_metrics').insert({
    metric_type: metric.name,
    value: metric.value,
    page_url: window.location.pathname
  })
}
```

---

### **P: Cache strategy? Quando usar React Query?**
**R:** Configuração padrão do React Query:

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5min (dados "frescos")
      cacheTime: 10 * 60 * 1000,     // 10min (cache em memória)
      refetchOnWindowFocus: false,   // Não refetch ao focar janela
      retry: 1,                       // 1 retry em caso de erro
    }
  }
})
```

**Quando usar React Query**:
- ✅ Listagens (pacientes, consultas, financeiro)
- ✅ Detalhes de entidades (prontuário, orçamento)
- ✅ Dados que mudam pouco (configurações, módulos)

**Quando NÃO usar**:
- ❌ Formulários (use `useState`)
- ❌ UI state (use Zustand)
- ❌ WebSockets/Realtime (use `supabase.channel()`)

---

### **P: Índices criados no banco? Como otimizar queries lentas?**
**R:** Principais índices:

```sql
-- Índices por clinic_id (multi-tenancy)
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_prontuarios_clinic_id ON prontuarios(clinic_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);

-- Índices por foreign keys
CREATE INDEX idx_prontuarios_patient_id ON prontuarios(patient_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist_id ON appointments(dentist_id);

-- Índices compostos para queries frequentes
CREATE INDEX idx_appointments_clinic_date 
  ON appointments(clinic_id, start_time);

CREATE INDEX idx_patients_clinic_name 
  ON patients(clinic_id, full_name);
```

**Identificar queries lentas**:
```sql
-- Ativar pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 queries mais lentas
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Analisar query específica**:
```sql
EXPLAIN ANALYZE
SELECT * FROM patients 
WHERE clinic_id = 'uuid' 
  AND full_name ILIKE '%silva%';

-- Se "Seq Scan" aparecer, adicione índice!
```

---

## 🐳 Docker e Deploy

### **P: Qual a diferença entre `docker-compose.yml` e `Dockerfile`?**
**R:**

| Arquivo | Propósito | Uso |
|---------|-----------|-----|
| **Dockerfile** | Build da imagem React | `docker build -t ortho-frontend .` |
| **docker-compose.yml** | Orquestração de múltiplos serviços | `docker compose up -d` |

**Stack completa** (`docker-compose.yml`):
```yaml
services:
  postgres:
    image: supabase/postgres:15
    
  frontend:
    build: .
    ports:
      - "5173:5173"
      
  nginx:
    image: nginx:alpine
    
  prometheus:
    image: prom/prometheus
    
  grafana:
    image: grafana/grafana
```

**Para produção**: Use `docker compose up -d` (stack completa).

---

### **P: Como configurar SSL/TLS com Let's Encrypt?**
**R:** Via Nginx reverse proxy + Certbot:

**1. Instalar Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

**2. Gerar certificado**:
```bash
sudo certbot --nginx -d orthoplus.suaempresa.com
```

**3. Nginx conf** (`/etc/nginx/sites-available/ortho`):
```nginx
server {
    listen 443 ssl http2;
    server_name orthoplus.suaempresa.com;

    ssl_certificate /etc/letsencrypt/live/orthoplus.suaempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orthoplus.suaempresa.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name orthoplus.suaempresa.com;
    return 301 https://$host$request_uri;
}
```

**4. Auto-renewal**:
```bash
sudo certbot renew --dry-run
# Certbot adiciona cronjob automático
```

---

### **P: Como fazer deploy zero-downtime?**
**R:** Blue-Green deployment:

```bash
# 1. Build nova versão (green)
docker build -t ortho-frontend:v2 .

# 2. Start container green
docker run -d --name ortho-green -p 5174:5173 ortho-frontend:v2

# 3. Health check
curl http://localhost:5174/health
# Deve retornar 200 OK

# 4. Switch Nginx para green
sudo vim /etc/nginx/sites-available/ortho
# proxy_pass http://localhost:5174; # Era 5173

sudo nginx -s reload

# 5. Parar blue (versão antiga)
docker stop ortho-blue
docker rm ortho-blue

# 6. Renomear green para blue
docker rename ortho-green ortho-blue
```

**Rollback**:
```bash
# Se algo der errado, volte para versão anterior
docker start ortho-blue-backup
sudo nginx -s reload
```

---

## 📊 Monitoramento e Logs

### **P: Como visualizar métricas RUM (Real User Monitoring)?**
**R:** Três formas:

**1. Tabela `rum_metrics` (SQL)**:
```sql
SELECT 
  metric_type,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  COUNT(*) as sample_size
FROM rum_metrics
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY metric_type;
```

**2. Dashboard Grafana** (pré-configurado):
- Acesse: `http://localhost:3000`
- Login: `admin` / `admin`
- Dashboard: "Ortho+ Web Vitals"

**3. API endpoint**:
```typescript
GET /api/metrics/rum?period=24h

Response:
{
  "lcp": { "p50": 1.8, "p95": 3.2, "p99": 5.1 },
  "fid": { "p50": 45, "p95": 120, "p99": 280 },
  "cls": { "p50": 0.05, "p95": 0.15, "p99": 0.25 }
}
```

---

### **P: Prometheus targets? Como adicionar custom metrics?**
**R:** Configurado em `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
  
  - job_name: 'ortho-app'
    static_configs:
      - targets: ['frontend:5173']
    metrics_path: '/metrics'
```

**Expor custom metrics** (`src/lib/metrics.ts`):
```typescript
import { Registry, Counter, Histogram } from 'prom-client'

const register = new Registry()

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

export const appointmentsCreated = new Counter({
  name: 'appointments_created_total',
  help: 'Total de consultas agendadas',
  registers: [register]
})

// Endpoint /metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
```

---

## ⚡ Edge Functions

### **P: Como fazer deploy manual de edge function?**
**R:**

```bash
# Deploy de uma function específica
npx supabase functions deploy get-my-modules

# Deploy de todas as functions
npx supabase functions deploy

# Deploy com secrets
npx supabase secrets set GOOGLE_API_KEY=your_key_here
npx supabase functions deploy analyze-radiografia
```

---

### **P: Como ver logs de edge functions em tempo real?**
**R:**

```bash
# Logs de uma function específica
npx supabase functions logs get-my-modules --tail

# Logs de todas as functions
npx supabase functions logs --tail

# Filtrar por erro
npx supabase functions logs get-my-modules --level error

# Salvar logs em arquivo
npx supabase functions logs > functions.log
```

---

### **P: Edge functions têm timeout? Como aumentar?**
**R:** Sim, **60 segundos por padrão**. Max: **300s** (5min).

```typescript
// supabase/functions/analyze-radiografia/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve({ 
  handler: async (req) => {
    // Sua lógica...
  },
  timeoutMs: 120000 // 120 segundos (2min)
})
```

**Quando aumentar**:
- Processamento de IA (análise de radiografias)
- Integração com APIs lentas (SEFAZ, bancos)
- Geração de PDFs complexos

---

## 💾 Backup e Disaster Recovery

### **P: Backup automático está configurado?**
**R:** Sim, **diariamente às 3h AM (UTC-3)**.

**Verificar último backup**:
```sql
SELECT 
  backup_type,
  status,
  file_size_bytes,
  created_at,
  completed_at
FROM backup_history
WHERE clinic_id = 'uuid-da-clinica'
ORDER BY created_at DESC
LIMIT 10;
```

**Trigger manual**:
```typescript
POST /functions/v1/trigger-backup
{
  "clinic_id": "uuid",
  "backup_type": "full" // ou "incremental"
}
```

---

### **P: Como testar restauração de backup?**
**R:** Edge function `test-backup-restore`:

```bash
# Trigger teste de restore em sandbox
curl -X POST \
  https://yxpoqjyfgotkytwtifau.supabase.co/functions/v1/test-backup-restore \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"backup_id": "uuid-do-backup"}'

Response:
{
  "test_passed": true,
  "duration_seconds": 45,
  "records_restored": 12453,
  "integrity_check": "ok"
}
```

**Automação** (cron semanal):
```toml
[[ cron ]]
function = "test-backup-restore"
schedule = "0 2 * * 0"  # Todo domingo 2h AM
```

---

### **P: RPO e RTO do sistema?**
**R:**

| Métrica | Target | Atual |
|---------|--------|-------|
| **RPO** (Recovery Point Objective) | < 24h | ~1h (backups incrementais) |
| **RTO** (Recovery Time Objective) | < 4h | ~2h (restore + validação) |

**Melhorar RPO** para < 1h:
- Habilitar Point-in-Time Recovery (PITR)
- Backups incrementais a cada hora

```sql
-- Habilitar PITR (Supabase Pro)
ALTER DATABASE postgres SET wal_level = logical;
SELECT pg_create_restore_point('before_migration');
```

---

## 🐛 Troubleshooting

### **P: Erro: "RLS policy violated"**
**Causa**: Usuário tentando acessar dados de outra clínica.

**Debug**:
```sql
-- Verificar clinic_id do usuário
SELECT clinic_id FROM profiles WHERE id = auth.uid();

-- Verificar se dados existem para essa clínica
SELECT COUNT(*) FROM patients WHERE clinic_id = 'uuid-da-clinica';

-- Testar RLS policy
SET ROLE authenticated;
SET request.jwt.claims.user_id = 'uuid-do-usuario';

SELECT * FROM patients; -- Deve retornar apenas dados da clínica do usuário
```

**Solução**:
- Garantir que `clinic_id` está sendo passado corretamente
- Verificar se RLS policy usa `auth.uid()` corretamente

---

### **P: Erro: "Foreign key constraint violation"**
**Causa**: Tentando inserir/deletar com referências quebradas.

**Debug**:
```sql
-- Exemplo: deletar paciente com consultas
SELECT * FROM appointments WHERE patient_id = 'uuid-do-paciente';
-- Se retornar algo, deve deletar consultas primeiro
```

**Soluções**:
```sql
-- Opção 1: Cascata (deleta tudo relacionado)
ALTER TABLE appointments
DROP CONSTRAINT appointments_patient_id_fkey,
ADD CONSTRAINT appointments_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES patients(id)
  ON DELETE CASCADE;

-- Opção 2: Soft delete (marca como inativo)
ALTER TABLE patients ADD COLUMN deleted_at TIMESTAMPTZ;
UPDATE patients SET deleted_at = NOW() WHERE id = 'uuid';
```

---

### **P: Erro: "Too many connections"**
**Causa**: Pool de conexões PostgreSQL esgotado.

**Verificar**:
```sql
SELECT COUNT(*) FROM pg_stat_activity;
-- Se > 90% de max_connections, há problema
```

**Soluções**:
```sql
-- Aumentar max_connections (requer restart)
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();

-- Usar PgBouncer (connection pooling)
# docker-compose.yml
pgbouncer:
  image: pgbouncer/pgbouncer
  environment:
    - POOL_MODE=transaction
    - MAX_CLIENT_CONN=1000
    - DEFAULT_POOL_SIZE=20
```

**Frontend** (limitar conexões):
```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
    },
    global: {
      headers: { 'x-my-custom-header': 'ortho-plus' },
    },
    // Limitar pool de conexões
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  }
)
```

---

### **P: Frontend não conecta ao backend (CORS error)**
**Causa**: Configuração CORS incorreta no Supabase.

**Solução** (`supabase/config.toml`):
```toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public"]
max_rows = 1000

[api.cors]
allowed_origins = [
  "http://localhost:5173",
  "https://orthoplus.suaempresa.com"
]
allowed_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
allowed_headers = ["authorization", "content-type", "x-client-info"]
```

**Restart**:
```bash
npx supabase stop
npx supabase start
```

---

## 📚 Recursos Adicionais

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Deno Manual](https://deno.land/manual)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Não encontrou sua pergunta?**  
📧 Email: devops@orthoplus.com.br  
💬 Slack: #ortho-devops  
🆘 Emergência 24/7: (11) 91234-5678
