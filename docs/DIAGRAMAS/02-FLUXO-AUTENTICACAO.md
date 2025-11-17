# 🔐 Fluxo de Autenticação - Ortho+

> Sequence diagram detalhado do processo de login, JWT e Row Level Security

---

## 🎯 Fluxo Completo de Autenticação

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Frontend as React App
    participant Supabase as Supabase Auth
    participant JWT as JWT Token
    participant Postgres as PostgreSQL
    participant RLS as Row Level Security

    User->>Frontend: 1. Digita email/senha
    Frontend->>Supabase: 2. POST /auth/v1/token<br/>{email, password}
    
    Supabase->>Postgres: 3. SELECT * FROM auth.users<br/>WHERE email = ?
    Postgres-->>Supabase: User encontrado
    
    Supabase->>Supabase: 4. Valida senha (bcrypt)
    
    alt Senha incorreta
        Supabase-->>Frontend: ❌ 401 Unauthorized
        Frontend-->>User: "Email ou senha incorretos"
    else Senha correta
        Supabase->>Postgres: 5. SELECT clinic_id, app_role<br/>FROM profiles WHERE id = user.id
        Postgres-->>Supabase: {clinic_id, app_role}
        
        Supabase->>JWT: 6. Gera JWT com custom claims<br/>{user_id, clinic_id, app_role}
        JWT-->>Supabase: access_token + refresh_token
        
        Supabase-->>Frontend: ✅ 200 OK<br/>{access_token, refresh_token, user}
        Frontend->>Frontend: 7. Armazena tokens em localStorage
        
        Frontend->>Supabase: 8. GET /rest/v1/patients<br/>Authorization: Bearer token
        Supabase->>JWT: 9. Valida token
        JWT-->>Supabase: Token válido
        
        Supabase->>Postgres: 10. SELECT * FROM patients<br/>(Com RLS ativo)
        Postgres->>RLS: 11. Extrai clinic_id do JWT
        RLS->>RLS: 12. Aplica policy:<br/>WHERE clinic_id = jwt.clinic_id
        RLS-->>Postgres: Apenas pacientes da clínica
        Postgres-->>Supabase: Dados filtrados
        Supabase-->>Frontend: ✅ Dados seguros
        Frontend-->>User: Exibe dashboard
    end
```

---

## 📝 Detalhamento das Etapas

### **1-2. Submissão de Credenciais**

**Frontend** (`src/contexts/AuthContext.tsx`):
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}
```

**Request HTTP**:
```http
POST https://yxpoqjyfgotkytwtifau.supabase.co/auth/v1/token
Content-Type: application/json

{
  "email": "dentista@clinica.com",
  "password": "SenhaSegura123!"
}
```

---

### **3-4. Validação de Senha**

Supabase usa **bcrypt** com **cost factor 10**:

```sql
-- auth.users (tabela interna do Supabase)
SELECT 
  id,
  email,
  encrypted_password, -- $2a$10$... (bcrypt hash)
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'dentista@clinica.com'
  AND deleted_at IS NULL;
```

**Validação**:
```typescript
const isValid = await bcrypt.compare(
  'SenhaSegura123!',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye...'
)
```

---

### **5. Busca de Metadados (Custom Claims)**

**Trigger automático** que adiciona `clinic_id` e `app_role` ao JWT:

```sql
-- Função executada após login
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  profile_data RECORD;
BEGIN
  -- Busca clinic_id e role do usuário
  SELECT clinic_id, app_role INTO profile_data
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;
  
  -- Adiciona ao JWT
  event := jsonb_set(
    event, 
    '{claims,clinic_id}', 
    to_jsonb(profile_data.clinic_id)
  );
  
  event := jsonb_set(
    event, 
    '{claims,app_role}', 
    to_jsonb(profile_data.app_role)
  );
  
  RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### **6. Geração do JWT**

**JWT Structure**:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "uuid-do-usuario",
    "email": "dentista@clinica.com",
    "aud": "authenticated",
    "role": "authenticated",
    "clinic_id": "uuid-da-clinica",
    "app_role": "ADMIN",
    "iat": 1705320000,
    "exp": 1705323600
  },
  "signature": "..."
}
```

**Decode JWT** (para debug):
```bash
# Instalar jwt-cli
npm install -g jwt-cli

# Decode token
jwt decode eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lifetimes**:
- `access_token`: 1 hora (3600s)
- `refresh_token`: 30 dias (2592000s)

---

### **7. Armazenamento Seguro**

**LocalStorage** (`supabase-auth-token`):
```typescript
// Supabase gerencia automaticamente
localStorage.setItem('supabase.auth.token', JSON.stringify({
  access_token: 'eyJhbGciOiJIUzI1NiIs...',
  refresh_token: 'v1.MRz...',
  expires_at: 1705323600,
  token_type: 'bearer',
  user: {
    id: 'uuid',
    email: 'dentista@clinica.com'
  }
}))
```

**Segurança**:
- ✅ HttpOnly Cookies (mais seguro, mas Supabase usa localStorage por padrão)
- ⚠️ LocalStorage vulnerável a XSS (Cross-Site Scripting)
- 🔒 Solução: Sanitize inputs, CSP headers

---

### **8-10. Request Autenticado**

**Frontend**:
```typescript
const { data: patients } = await supabase
  .from('patients')
  .select('*')
// Supabase adiciona automaticamente header Authorization
```

**Request HTTP Real**:
```http
GET https://yxpoqjyfgotkytwtifau.supabase.co/rest/v1/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
```

---

### **11-12. Row Level Security (RLS)**

**Policy na tabela `patients`**:
```sql
CREATE POLICY "Isolamento por clínica"
  ON patients FOR ALL
  USING (
    clinic_id = (
      SELECT clinic_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

**Como funciona**:
1. PostgreSQL extrai `auth.uid()` do JWT (função mágica do Supabase)
2. Busca `clinic_id` do usuário na tabela `profiles`
3. Filtra query automaticamente: `WHERE clinic_id = 'uuid-da-clinica'`

**Query Real Executada**:
```sql
-- O que o dev escreve:
SELECT * FROM patients;

-- O que PostgreSQL executa (com RLS):
SELECT * FROM patients
WHERE clinic_id = (
  SELECT clinic_id FROM profiles WHERE id = 'uuid-do-usuario'
);
```

**Vantagem**: Segurança no banco, não no código! 🎯

---

## 🔄 Fluxo de Refresh Token

```mermaid
sequenceDiagram
    participant Frontend as React App
    participant Supabase as Supabase Auth
    participant JWT as JWT

    Frontend->>Frontend: 1. Detecta access_token expirado<br/>(após 1 hora)
    Frontend->>Supabase: 2. POST /auth/v1/token<br/>{refresh_token}
    Supabase->>JWT: 3. Valida refresh_token
    
    alt Refresh token válido
        JWT-->>Supabase: ✅ Token válido
        Supabase->>Supabase: 4. Gera novo access_token
        Supabase-->>Frontend: ✅ {new_access_token}
        Frontend->>Frontend: 5. Atualiza localStorage
        Frontend->>Supabase: 6. Retry request original
    else Refresh token expirado/inválido
        JWT-->>Supabase: ❌ Token inválido
        Supabase-->>Frontend: ❌ 401 Unauthorized
        Frontend->>Frontend: 7. Redireciona para /login
    end
```

**Implementação Automática**:
```typescript
// Supabase gerencia refresh automaticamente
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token renovado automaticamente')
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('Sessão expirada, redirecionando...')
    navigate('/login')
  }
})
```

---

## 🛡️ Fluxo de Proteção de Rotas

```mermaid
graph TD
    A[Usuário acessa /pacientes] --> B{Authenticated?}
    B -->|Não| C[Redirect /login]
    B -->|Sim| D{Token válido?}
    D -->|Não| E[Refresh token]
    E --> F{Refresh OK?}
    F -->|Não| C
    F -->|Sim| G{Tem permissão?}
    D -->|Sim| G
    G -->|Não hasModuleAccess| H[403 Forbidden]
    G -->|Sim| I[Renderiza /pacientes]
    
    style C fill:#ff6b6b,color:#fff
    style H fill:#ff6b6b,color:#fff
    style I fill:#4caf50,color:#fff
```

**Implementação** (`src/App.tsx`):
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

<Route
  path="/pacientes"
  element={
    <ProtectedRoute requiredModule="PACIENTES">
      <PatientsPage />
    </ProtectedRoute>
  }
/>

// ProtectedRoute.tsx
const ProtectedRoute = ({ children, requiredModule }) => {
  const { user, hasModuleAccess } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (!hasModuleAccess(requiredModule)) {
    return <Navigate to="/403" /> // Forbidden
  }
  
  return children
}
```

---

## 🔍 Debug de Autenticação

### Ver JWT decodificado:
```typescript
const session = await supabase.auth.getSession()
console.log('JWT Payload:', JSON.parse(atob(session.data.session.access_token.split('.')[1])))
```

### Ver clinic_id do usuário:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('clinic_id, app_role')
  .eq('id', user.id)
  .single()

console.log('Clinic ID:', profile.clinic_id)
console.log('Role:', profile.app_role)
```

### Testar RLS manualmente:
```sql
-- Logar como usuário específico
SET request.jwt.claims.user_id = 'uuid-do-usuario';

-- Testar query com RLS
SELECT * FROM patients;
-- Deve retornar apenas dados da clínica do usuário
```

---

## 📚 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [JWT.io](https://jwt.io/) - Decoder de tokens
- [PostgreSQL RLS](https://www.postgresql.org/docs/15/ddl-rowsecurity.html)

---

**Próximos Diagramas:**  
→ [03-SISTEMA-MODULAR](./03-SISTEMA-MODULAR.md) - Grafo de módulos e dependências  
→ [04-BANCO-DE-DADOS](./04-BANCO-DE-DADOS.md) - ERD completo do PostgreSQL
