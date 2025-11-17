# 🛡️ Plano de Remediação de Segurança - Ortho+

**Data de Criação**: 2025-11-17  
**Severidade Máxima Identificada**: CRÍTICA  
**Total de Vulnerabilidades**: 15

---

## 📋 Índice de Correções

1. [Correções CRÍTICAS](#correções-críticas) (Executar Imediatamente)
2. [Correções ALTAS](#correções-altas) (Executar em 24-48h)
3. [Correções MÉDIAS](#correções-médias) (Executar em 1 semana)
4. [Correções BAIXAS](#correções-baixas) (Executar em 2 semanas)
5. [Validação Pós-Implementação](#validação-pós-implementação)

---

## ⚠️ ATENÇÃO: Antes de Executar

```bash
# 1. BACKUP COMPLETO DO BANCO DE DADOS
pg_dump -h your-host -U your-user -d your-database -F c -b -v -f "ortho_plus_backup_$(date +%Y%m%d_%H%M%S).backup"

# 2. VERIFICAR BACKUP
pg_restore --list ortho_plus_backup_*.backup | head -20

# 3. CRIAR PONTO DE RESTAURAÇÃO
BEGIN;
-- Execute os scripts dentro de transações quando possível
-- Use ROLLBACK se algo der errado
-- Use COMMIT apenas após validação
```

---

## 🔴 Correções CRÍTICAS

### C1: Corrigir RLS na Tabela `login_attempts`

**Vulnerabilidade**: Qualquer usuário autenticado pode visualizar/modificar tentativas de login de outros usuários.

**Script SQL**:

```sql
-- ============================================
-- C1: Corrigir RLS - login_attempts
-- ============================================

BEGIN;

-- 1. Remover políticas vulneráveis existentes
DROP POLICY IF EXISTS "Users can view their own login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Users can insert their own login attempts" ON public.login_attempts;

-- 2. Criar função security definer para verificar se usuário é ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'ADMIN'
  );
$$;

-- 3. Criar política: Apenas ADMINs podem visualizar login_attempts
CREATE POLICY "Only admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (public.is_admin());

-- 4. Criar política: Apenas sistema pode inserir (via trigger ou service_role)
CREATE POLICY "Only system can insert login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (false); -- Bloqueia INSERT via client, apenas triggers/service_role

-- 5. Nenhuma política de UPDATE/DELETE (bloqueado por padrão)

COMMIT;

-- Validação:
-- Como usuário MEMBER, tente:
-- SELECT * FROM login_attempts; -- Deve retornar vazio
-- Como usuário ADMIN, tente:
-- SELECT * FROM login_attempts; -- Deve retornar dados
```

---

### C2: Corrigir RLS na Tabela `permission_templates`

**Vulnerabilidade**: Qualquer usuário autenticado pode visualizar/modificar templates de permissões de todas as clínicas.

**Script SQL**:

```sql
-- ============================================
-- C2: Corrigir RLS - permission_templates
-- ============================================

BEGIN;

-- 1. Remover políticas vulneráveis existentes
DROP POLICY IF EXISTS "Users can view templates from their clinic" ON public.permission_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.permission_templates;

-- 2. Política SELECT: Apenas usuários da mesma clínica
CREATE POLICY "Users can view templates from their clinic"
ON public.permission_templates
FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 3. Política INSERT: Apenas ADMINs da mesma clínica
CREATE POLICY "Only admins can create templates"
ON public.permission_templates
FOR INSERT
WITH CHECK (
  public.is_admin() AND
  clinic_id IN (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 4. Política UPDATE: Apenas ADMINs da mesma clínica
CREATE POLICY "Only admins can update templates"
ON public.permission_templates
FOR UPDATE
USING (
  public.is_admin() AND
  clinic_id IN (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 5. Política DELETE: Apenas ADMINs da mesma clínica, e template não é default
CREATE POLICY "Only admins can delete non-default templates"
ON public.permission_templates
FOR DELETE
USING (
  public.is_admin() AND
  clinic_id IN (
    SELECT clinic_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ) AND
  is_default = false
);

COMMIT;

-- Validação:
-- Como MEMBER de clinic_A, tente:
-- SELECT * FROM permission_templates WHERE clinic_id = 'clinic_B'; -- Deve retornar vazio
-- Como ADMIN de clinic_A, tente:
-- INSERT INTO permission_templates (...) VALUES (...); -- Deve funcionar
```

---

## 🟠 Correções ALTAS

### A1: Adicionar `search_path` a Funções Vulneráveis

**Vulnerabilidade**: Funções sem `search_path` definido são vulneráveis a ataques de namespace poisoning.

**Script SQL**:

```sql
-- ============================================
-- A1: Adicionar search_path a Funções
-- ============================================

BEGIN;

-- Identificar funções sem search_path
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth', 'storage')
  AND p.prosecdef = true  -- SECURITY DEFINER
  AND NOT EXISTS (
    SELECT 1 
    FROM pg_proc_config(p.oid) 
    WHERE option_name = 'search_path'
  );

-- Exemplo: Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- ✅ ADICIONADO
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Exemplo: Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- ✅ ADICIONADO
AS $$
BEGIN
  INSERT INTO public.profiles (id, clinic_id, app_role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'clinic_id', 'MEMBER');
  RETURN NEW;
END;
$$;

-- IMPORTANTE: Repita para TODAS as funções identificadas acima
-- Liste todas as funções e aplique o padrão SET search_path = ''

COMMIT;

-- Validação:
SELECT 
  p.proname,
  array_to_string(p.proconfig, ', ') as config
FROM pg_proc p
WHERE p.prosecdef = true
  AND p.proconfig IS NOT NULL;
```

---

### A2: Habilitar "Leaked Password Protection" no Supabase Auth

**Vulnerabilidade**: Sistema não valida se senhas escolhidas estão em listas de senhas vazadas (haveibeenpwned).

**Ação Manual (Supabase Dashboard)**:

```markdown
1. Acesse: Supabase Dashboard > Authentication > Settings
2. Navegue até: Password Requirements
3. Habilite: "Enable Leaked Password Protection"
4. Salve as configurações

OU via SQL (alternativa):

UPDATE auth.config
SET leaked_password_protection_enabled = true
WHERE id = 'auth-config';
```

---

### A3: Implementar Criptografia de API Keys

**Vulnerabilidade**: API keys armazenadas em plaintext na tabela `admin_configurations`.

**Script SQL**:

```sql
-- ============================================
-- A3: Criptografia de API Keys
-- ============================================

BEGIN;

-- 1. Instalar extensão pgcrypto se não existe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar coluna criptografada
ALTER TABLE public.admin_configurations
ADD COLUMN IF NOT EXISTS config_data_encrypted BYTEA;

-- 3. Criar função para criptografar (usa chave do Supabase Vault)
CREATE OR REPLACE FUNCTION public.encrypt_config_data(data JSONB)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Buscar chave do vault (substituir 'config_encryption_key' pelo nome real)
  encryption_key := vault.get_secret('config_encryption_key');
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in vault';
  END IF;
  
  RETURN pgcrypto.encrypt(
    data::TEXT::BYTEA,
    encryption_key::BYTEA,
    'aes'
  );
END;
$$;

-- 4. Criar função para descriptografar
CREATE OR REPLACE FUNCTION public.decrypt_config_data(encrypted_data BYTEA)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_text TEXT;
BEGIN
  encryption_key := vault.get_secret('config_encryption_key');
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in vault';
  END IF;
  
  decrypted_text := convert_from(
    pgcrypto.decrypt(
      encrypted_data,
      encryption_key::BYTEA,
      'aes'
    ),
    'UTF8'
  );
  
  RETURN decrypted_text::JSONB;
END;
$$;

-- 5. Migrar dados existentes para formato criptografado
UPDATE public.admin_configurations
SET config_data_encrypted = public.encrypt_config_data(config_data)
WHERE config_data_encrypted IS NULL;

-- 6. (OPCIONAL) Remover coluna plaintext após validação
-- ALTER TABLE public.admin_configurations DROP COLUMN config_data;

COMMIT;

-- Validação:
SELECT 
  id,
  config_type,
  length(config_data_encrypted) as encrypted_size,
  public.decrypt_config_data(config_data_encrypted) as decrypted_preview
FROM public.admin_configurations
LIMIT 1;
```

---

## 🟡 Correções MÉDIAS

### M1: Mover Extensões para Schema `extensions`

**Script SQL**:

```sql
-- ============================================
-- M1: Mover Extensões para Schema extensions
-- ============================================

BEGIN;

-- 1. Criar schema extensions se não existe
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Listar extensões no schema public
SELECT extname, extversion
FROM pg_extension
WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 3. Mover extensões compatíveis (CUIDADO: algumas extensões Supabase não podem ser movidas)
-- Exemplo: uuid-ossp, pgcrypto são seguras de mover

ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;

-- 4. Atualizar search_path padrão
ALTER DATABASE postgres SET search_path TO public, extensions;

COMMIT;

-- Validação:
SELECT 
  n.nspname as schema,
  e.extname as extension
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY n.nspname, e.extname;
```

---

### M2: Remover Dados Sensíveis do localStorage

**Ação Frontend** (não é SQL, requer code review):

```typescript
// Arquivos a revisar:
// - src/hooks/usePatientsStore.ts (REMOVER - já migrado para Supabase)
// - src/hooks/useFinanceiroStore.ts (REMOVER - já migrado para Supabase)
// - Qualquer outro hook que use localStorage

// Padrão de busca:
// grep -r "localStorage.setItem" src/
// grep -r "localStorage.getItem" src/

// REMOVER todos os hooks antigos baseados em localStorage
// e garantir que APENAS configurações não-sensíveis sejam armazenadas localmente
```

---

### M3: Mover Google OAuth Client Secret para Backend

**Ação**:

1. **Remover do Frontend**:
```typescript
// Em src/components/settings/AuthenticationConfig.tsx
// REMOVER campo de input para client_secret
// Manter apenas client_id (que é público)
```

2. **Armazenar no Supabase Secrets** (via Lovable Cloud):
```bash
# Via interface Lovable Cloud, adicionar secret:
# Nome: GOOGLE_OAUTH_CLIENT_SECRET
# Valor: <seu-client-secret-aqui>
```

3. **Usar em Edge Function**:
```typescript
// supabase/functions/oauth-google/index.ts
const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
```

---

## 🟢 Correções BAIXAS

### L1: Implementar Rate Limiting em Edge Functions

**Exemplo para Edge Function**:

```typescript
// supabase/functions/_shared/rateLimiter.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RATE_LIMIT_WINDOW = 60; // 1 minuto
const MAX_REQUESTS = 10; // 10 requisições por minuto

export async function checkRateLimit(
  supabase: any,
  userId: string,
  endpoint: string
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Contar requisições no último minuto
  const { count, error } = await supabase
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('timestamp', windowStart);

  if (error) throw error;

  if (count >= MAX_REQUESTS) {
    return false; // Rate limit excedido
  }

  // Registrar requisição atual
  await supabase.from('rate_limit_log').insert({
    user_id: userId,
    endpoint,
    timestamp: now,
  });

  return true; // OK para prosseguir
}

// Criar tabela rate_limit_log:
/*
CREATE TABLE public.rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_user_endpoint ON public.rate_limit_log(user_id, endpoint, timestamp);
*/
```

---

### L2: Sanitizar Logs de Aplicação

**Ação Frontend**:

```typescript
// Criar utilitário de logging seguro
// src/lib/secureLogger.ts

const SENSITIVE_KEYS = ['password', 'token', 'api_key', 'secret', 'credit_card'];

export function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}

// Uso:
console.log('User data:', sanitizeLogData(userData));
```

---

## ✅ Validação Pós-Implementação

### 1. Executar Supabase Linter Novamente

```bash
# Via Lovable Cloud ou Supabase CLI
supabase db lint
```

### 2. Testes de Penetração Básicos

```sql
-- Teste 1: Tentar acessar login_attempts como MEMBER
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "member-user-id"}';
SELECT * FROM public.login_attempts; -- Deve retornar vazio

-- Teste 2: Tentar modificar permission_templates de outra clínica
INSERT INTO public.permission_templates (clinic_id, name, permissions)
VALUES ('another-clinic-id', 'Hacker Template', '{}'); -- Deve FALHAR

-- Teste 3: Verificar search_path em funções
SELECT 
  p.proname,
  array_to_string(p.proconfig, ', ') as config
FROM pg_proc p
WHERE p.prosecdef = true
  AND (p.proconfig IS NULL OR NOT 'search_path' = ANY(p.proconfig));
-- Deve retornar vazio
```

### 3. Validar Criptografia

```sql
-- Verificar que config_data_encrypted está populado
SELECT 
  COUNT(*) as total,
  COUNT(config_data_encrypted) as encrypted_count
FROM public.admin_configurations;
-- encrypted_count deve ser igual a total
```

### 4. Executar Security Scan Automatizado

```bash
# Usar ferramentas como:
# - OWASP ZAP
# - Snyk
# - npm audit
# - Trivy

npm audit --audit-level=high
```

---

## 📊 Checklist de Execução

```markdown
### CRÍTICO (Executar Hoje)
- [ ] C1: Corrigir RLS - login_attempts
- [ ] C2: Corrigir RLS - permission_templates
- [ ] Validar com testes de penetração básicos

### ALTO (Executar em 24-48h)
- [ ] A1: Adicionar search_path a todas as funções SECURITY DEFINER
- [ ] A2: Habilitar Leaked Password Protection
- [ ] A3: Implementar criptografia de API keys
- [ ] Validar criptografia

### MÉDIO (Executar em 1 semana)
- [ ] M1: Mover extensões para schema extensions
- [ ] M2: Remover dados sensíveis do localStorage
- [ ] M3: Mover Google OAuth secret para backend
- [ ] Code review completo

### BAIXO (Executar em 2 semanas)
- [ ] L1: Implementar rate limiting
- [ ] L2: Sanitizar logs
- [ ] Documentar políticas de segurança
- [ ] Treinamento de equipe

### VALIDAÇÃO FINAL
- [ ] Executar Supabase Linter
- [ ] Testes de penetração
- [ ] Security scan automatizado
- [ ] Atualizar SECURITY.md
```

---

## 🆘 Rollback Plan

Se algo der errado durante a implementação:

```sql
-- 1. Restaurar backup completo
pg_restore -h your-host -U your-user -d your-database -c ortho_plus_backup_YYYYMMDD_HHMMSS.backup

-- 2. Ou fazer rollback de transação específica
ROLLBACK; -- Se ainda estiver em transação aberta

-- 3. Reverter função específica
DROP FUNCTION IF EXISTS public.is_admin();
-- Recriar versão antiga
```

---

## 📞 Contatos de Emergência

**Security Lead**: security@orthoplus.com.br  
**DevSecOps**: devsecops@orthoplus.com.br  
**On-Call**: +55 (11) 99999-9999

---

## 📚 Referências

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-security-label.html)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

**Última Atualização**: 2025-11-17  
**Versão**: 1.0  
**Status**: Aguardando Implementação
