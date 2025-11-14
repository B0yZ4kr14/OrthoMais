# FASE 3 - Módulo ODONTOGRAMA (Status)

## 📊 Progresso Geral

```
[▓▓▓▓▓░░░░░] 50% - Camada de Aplicação (Completa)
```

---

## 🎯 Objetivo

Refatorar o módulo **ODONTOGRAMA** seguindo o "Golden Pattern" estabelecido nos módulos AGENDA e ORCAMENTOS, implementando arquitetura limpa em 4 camadas:

1. **Domain** (Entities + Repository Interfaces)
2. **Application** (Use Cases)
3. **Infrastructure** (Repositories + Mappers)
4. **Presentation** (Custom Hooks)

---

## 📋 Camadas

### 1. Domain Layer ✅ (100%)

#### Entidades
- ✅ `Odontograma` - Entidade principal que representa o odontograma completo do paciente
  - Factory methods: `create()`, `restore()`
  - Propriedades: id, prontuarioId, teeth, lastUpdated, history, timestamps
  - Métodos de domínio:
    - `atualizarStatusDente()` - Atualiza status geral de um dente
    - `atualizarSuperficie()` - Atualiza superfície específica
    - `atualizarNotas()` - Atualiza notas do dente
    - `buscarDente()` - Busca dente por número
    - `buscarDentesPorStatus()` - Filtra dentes por status
    - `contarDentesPorStatus()` - Estatísticas por status
  - Validações: número de dente válido (FDI), status válido
  - Histórico automático de alterações

#### Repository Interfaces
- ✅ `IOdontogramaRepository` - Interface do repositório
  - `findById()` - Buscar por ID
  - `findByProntuarioId()` - Buscar por prontuário
  - `findByClinicId()` - Buscar por clínica
  - `save()` - Salvar novo
  - `update()` - Atualizar existente
  - `delete()` - Remover

---

### 2. Application Layer ✅ (100%)

#### Use Cases
- ✅ `GetOdontogramaUseCase` - Buscar odontograma por prontuário
  - Busca odontograma existente
  - Cria novo se não existir (auto-inicialização)
  - Validações de input
- ✅ `UpdateToothStatusUseCase` - Atualizar status de um dente
  - Atualiza status geral do dente
  - Adiciona entrada no histórico automaticamente
  - Validações de input e domínio
- ✅ `UpdateToothSurfaceUseCase` - Atualizar superfície de um dente
  - Atualiza superfície específica (mesial, distal, etc.)
  - Adiciona entrada no histórico automaticamente
  - Validações de input e domínio
- ✅ `UpdateToothNotesUseCase` - Atualizar notas de um dente
  - Atualiza observações do dente
  - Validações de input

---

### 3. Infrastructure Layer (0%)

#### Repositories
- [ ] `SupabaseOdontogramaRepository`

#### Mappers
- [ ] `OdontogramaMapper`
- [ ] `HistoricoOdontogramaMapper`

#### DI Container
- [ ] Registrar repositórios
- [ ] Registrar Use Cases

---

### 4. Presentation Layer (0%)

#### Custom Hooks
- [ ] `useOdontograma` - Hook principal para gerenciar odontograma
  - Buscar odontograma
  - Atualizar status de dentes
  - Atualizar superfícies
  - Gerenciar histórico

---

## 📝 Notas

- Seguindo arquitetura limpa (Domain → Application → Infrastructure → Presentation)
- Validações de domínio centralizadas nas entidades
- Use Cases orquestram lógica de negócio
- Hooks abstraem complexidade para UI
- DI Container gerencia dependências
