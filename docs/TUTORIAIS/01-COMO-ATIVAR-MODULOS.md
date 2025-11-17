# 🎓 Tutorial: Como Ativar/Desativar Módulos - Ortho+

> Guia passo-a-passo para administradores gerenciarem módulos da clínica

---

## 🎯 O que você vai aprender

✅ Como acessar a página de Gestão de Módulos  
✅ Como ativar um novo módulo  
✅ Como desativar um módulo que não usa mais  
✅ Como entender dependências entre módulos  
✅ Como solicitar novos módulos (contratação)

---

## ⚠️ Pré-requisitos

- ✅ Você deve ter **role ADMIN** na clínica
- ✅ Estar logado no sistema Ortho+

> 💡 **Nota**: Apenas usuários ADMIN veem a opção "Gestão de Módulos" nas configurações.

---

## 📋 Passo 1: Acessar Gestão de Módulos

### 1.1. Ir para Configurações

1. No menu lateral esquerdo, clique em **"Configurações"** (ícone de engrenagem ⚙️)
2. A página de Configurações abrirá com várias abas

### 1.2. Selecionar aba "Gestão de Módulos"

1. Clique na aba **"Gestão de Módulos"**
2. Você verá a lista completa de módulos disponíveis

**Screenshot**:
```
┌─────────────────────────────────────────────┐
│ Configurações                               │
├─────────────────────────────────────────────┤
│ [Perfil] [Clínica] [→ Gestão de Módulos]   │
│                                             │
│  🎯 Gestão de Módulos                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                             │
│  📊 Core                                    │
│  ┌─────────────────────────────────────┐   │
│  │ 📊 Dashboard                       │   │
│  │ ✅ Ativo  [Toggle ON]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💰 Financeiro                              │
│  ┌─────────────────────────────────────┐   │
│  │ 💵 Gestão Financeira               │   │
│  │ ✅ Ativo  [Toggle ON]               │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 💳 Split de Pagamento              │   │
│  │ ⚪ Inativo [Toggle OFF]             │   │
│  │ ⚠️ Requer: Gestão Financeira         │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## ✅ Passo 2: Ativar um Módulo

### 2.1. Escolher o Módulo

Exemplo: Vamos ativar o módulo **"Split de Pagamento"**.

1. Localize o card do módulo na lista
2. Verifique se há **dependências não atendidas**

**Exemplo de dependência**:
```
┌─────────────────────────────────────┐
│ 💳 Split de Pagamento              │
│ ⚪ Inativo                          │
│                                     │
│ ⚠️ Requer módulo:                   │
│ • Gestão Financeira (ATIVO ✅)      │
│                                     │
│ [Toggle OFF]                        │
└─────────────────────────────────────┘
```

### 2.2. Clicar no Toggle

1. Clique no **toggle** (botão ON/OFF)
2. O toggle ficará azul (ligado)
3. Se houver dependências não atendidas, você verá um erro

**Mensagem de erro**:
```
❌ Falha ao ativar módulo
Você precisa ativar primeiro: Gestão Financeira
```

### 2.3. Ativar Dependências (se necessário)

1. Clique no módulo "Gestão Financeira"
2. Ative-o primeiro
3. Volte e ative "Split de Pagamento"

**Ou use ativação em cascata**:

O sistema detecta automaticamente e oferece:
```
┌────────────────────────────────────────┐
│ ⚠️ Ativação em Cascata                 │
│                                        │
│ Para ativar "Split de Pagamento",     │
│ os seguintes módulos também serão     │
│ ativados:                              │
│                                        │
│ • Gestão Financeira                   │
│                                        │
│ [Cancelar] [Ativar Todos]             │
└────────────────────────────────────────┘
```

Clique em **"Ativar Todos"**.

### 2.4. Confirmação

Após ativação bem-sucedida:

```
✅ Módulo ativado com sucesso!

Split de Pagamento agora está disponível no menu lateral.
```

---

## ❌ Passo 3: Desativar um Módulo

### 3.1. Verificar se Pode Desativar

Antes de desativar, o sistema verifica se **outros módulos dependem dele**.

**Exemplo: Tentando desativar "Gestão Financeira"**:

```
┌─────────────────────────────────────┐
│ 💵 Gestão Financeira               │
│ ✅ Ativo                            │
│                                     │
│ ⚠️ Este módulo é requerido por:     │
│ • Split de Pagamento (ATIVO ✅)     │
│ • Inadimplência (ATIVO ✅)          │
│                                     │
│ [Toggle ON] ← Desabilitado          │
└─────────────────────────────────────┘
```

**Toggle fica desabilitado** (cinza, não clicável).

### 3.2. Desativar Dependentes Primeiro

Para desativar "Gestão Financeira":

1. Desative primeiro "Split de Pagamento"
2. Desative "Inadimplência"
3. Agora você pode desativar "Gestão Financeira"

### 3.3. Confirmar Desativação

Ao clicar no toggle para desativar:

```
┌────────────────────────────────────────┐
│ ⚠️ Confirmar Desativação               │
│                                        │
│ Tem certeza que deseja desativar      │
│ "Split de Pagamento"?                 │
│                                        │
│ Esta ação não deleta dados, mas o     │
│ módulo não ficará mais acessível.     │
│                                        │
│ [Cancelar] [Sim, Desativar]           │
└────────────────────────────────────────┘
```

Clique em **"Sim, Desativar"**.

### 3.4. Resultado

```
✅ Módulo desativado com sucesso!

Split de Pagamento foi removido do menu lateral.
Dados permanecem no banco para auditoria.
```

---

## 🔗 Passo 4: Entender Dependências

### Exemplo de Cadeia de Dependências:

```
Gestão Financeira (Base)
    ↓ depende
Split de Pagamento
    ↓ depende
Inadimplência
```

**Regras**:
1. **Para ativar "Inadimplência"**: Deve ativar "Gestão Financeira" primeiro
2. **Para desativar "Gestão Financeira"**: Deve desativar "Inadimplência" e "Split de Pagamento" primeiro

### Visualização na Interface:

```
┌─────────────────────────────────────┐
│ 🚨 Controle de Inadimplência       │
│ ⚪ Inativo                          │
│                                     │
│ 📦 Dependências:                    │
│ ✅ Gestão Financeira (ATIVO)        │
│                                     │
│ [Toggle OFF] ← Pode ativar          │
└─────────────────────────────────────┘
```

---

## 🛒 Passo 5: Solicitar Novos Módulos (Contratação)

### 5.1. Módulos Não Contratados

Alguns módulos exibem botão **"Solicitar Contratação"** ao invés de toggle:

```
┌─────────────────────────────────────┐
│ 🤖 Inteligência Artificial         │
│ 🔒 Não Contratado                   │
│                                     │
│ Análise automática de radiografias │
│ com Google Gemini Vision.           │
│                                     │
│ [📧 Solicitar Contratação]          │
└─────────────────────────────────────┘
```

### 5.2. Fazer Solicitação

1. Clique em **"Solicitar Contratação"**
2. Um email é enviado automaticamente para `vendas@orthoplus.com.br`

**Conteúdo do email**:
```
De: sistema@orthoplus.com.br
Para: vendas@orthoplus.com.br
Assunto: Solicitação de Módulo - Clínica XYZ

Olá equipe de vendas,

A clínica "Odonto Plus" (ID: uuid-da-clinica) 
solicitou a contratação do módulo:

Módulo: Inteligência Artificial (IA)
Solicitante: Dr. João Silva (joao@clinica.com)
Data: 15/01/2025 14:30

Por favor, entrar em contato.
```

### 5.3. Confirmação

```
✅ Solicitação enviada!

Nossa equipe comercial entrará em contato 
em até 24 horas úteis para apresentar proposta.
```

---

## 🎓 Exercício Prático

### Desafio: Ativar o Módulo "Crypto Pagamentos"

**Objetivo**: Ativar o módulo de Pagamentos em Criptomoedas.

**Passos**:

1. ✅ Acesse Configurações → Gestão de Módulos
2. ✅ Localize "Crypto Pagamentos"
3. ✅ Verifique dependências:
   - Requer: "Gestão Financeira"
4. ✅ Se "Gestão Financeira" estiver inativo:
   - Ative "Gestão Financeira" primeiro
5. ✅ Ative "Crypto Pagamentos"
6. ✅ Verifique se apareceu no menu lateral: Financeiro → Crypto Pagamentos

**Resultado esperado**:
```
Menu Lateral:
└── 💰 Financeiro
    ├── Contas a Receber
    ├── Contas a Pagar
    └── 🆕 Crypto Pagamentos ← Novo!
```

---

## ❓ Perguntas Frequentes

### **P: Desativar um módulo apaga os dados?**
**R:** Não! Dados permanecem no banco. Você só não consegue acessar a funcionalidade. Se reativar, os dados voltam a ficar acessíveis.

### **P: Quanto tempo leva para um módulo ativado aparecer?**
**R:** Instantâneo! Assim que ativar, o link aparece no menu lateral. Pode ser necessário recarregar a página (F5).

### **P: Posso ativar todos os módulos de uma vez?**
**R:** Sim! Use o botão "Ativar Todos" no topo da página de Gestão de Módulos.

### **P: Quem mais pode ativar/desativar módulos?**
**R:** Apenas usuários com **role ADMIN**. Usuários MEMBER não veem essa opção.

### **P: Como saber qual módulo ativar?**
**R:** Leia as descrições nos cards. Cada módulo explica brevemente para que serve. Ou consulte o [Guia de Módulos](../GUIAS-TECNICO/05-MODULOS-DEPENDENCIAS.md).

---

## 📚 Recursos Relacionados

- [Documentação de Módulos](../GUIAS-TECNICO/05-MODULOS-DEPENDENCIAS.md)
- [Diagrama de Dependências](../DIAGRAMAS/03-SISTEMA-MODULAR.md)
- [Edge Function: toggle-module-state](../API-REFERENCE/02-EDGE-FUNCTIONS-API.md#toggle-module-state)

---

## 📞 Precisa de Ajuda?

**Suporte Técnico:**  
📧 Email: suporte@orthoplus.com.br  
📱 WhatsApp: (11) 98765-4321  
🕐 Horário: Seg-Sex 8h-18h

**Comercial (contratação de módulos):**  
📧 Email: vendas@orthoplus.com.br  
📱 WhatsApp: (11) 91234-5678
