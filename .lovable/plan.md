

## Plano Completo: Webhook BS Pay + Saque PIX

Vou criar tudo de uma vez. Depois, voce so precisa cadastrar a URL do webhook no painel da BS Pay.

---

### 1. Edge Function: Webhook BS Pay (`bspay-webhook`)

Recebe notificacoes da BS Pay quando um pagamento PIX e confirmado ou falha.

**O que faz:**
- Recebe o callback POST da BS Pay
- Localiza a transacao pelo `gateway_ref`
- Atualiza o status para `completed` ou `failed`
- O trigger que ja existe no banco atualiza o saldo do usuario automaticamente

**Endpoint publico (sem autenticacao)** - webhooks nao enviam JWT.

---

### 2. Edge Function: Saque PIX (`process-withdraw`)

Permite que o usuario solicite um saque via PIX.

**O que faz:**
- Verifica autenticacao do usuario
- Valida saldo suficiente e valor minimo (R$ 20)
- Autentica com BS Pay (mesmo fluxo de token)
- Envia a transferencia PIX usando o CPF do usuario como chave
- Registra a transacao como `pending`

---

### 3. Atualizar pagina de Saque

Conectar o botao "Solicitar Saque" a Edge Function `process-withdraw`, com feedback de loading e mensagens de erro/sucesso.

---

### 4. Adicionar campo de chave PIX no perfil

Permitir que o usuario informe sua chave PIX (CPF, telefone, email ou aleatoria) para receber saques, ja que nem todos usam CPF.

---

### O que voce precisa fazer no painel da BS Pay

Cadastrar esta URL como webhook de callback:

```text
https://mxscgyghoqhrannpmllw.supabase.co/functions/v1/bspay-webhook
```

O dono da BS Pay precisa configurar para enviar notificacoes POST para essa URL quando o status de um pagamento mudar.

---

### Detalhes Tecnicos

**Arquivos criados:**
- `supabase/functions/bspay-webhook/index.ts` - Webhook publico
- `supabase/functions/process-withdraw/index.ts` - Saque PIX autenticado

**Arquivos editados:**
- `supabase/config.toml` - Registrar as 2 novas functions com `verify_jwt = false`
- `src/pages/Withdraw.tsx` - Conectar ao backend, adicionar campo de chave PIX e loading state
- `src/contexts/AuthContext.tsx` - Expor campo `pix_key` do perfil (se adicionarmos ao banco)

**Migracao de banco:**
- Adicionar coluna `pix_key` na tabela `profiles` para armazenar a chave PIX do usuario

**Webhook (`bspay-webhook`):**
- Metodo POST, sem autenticacao (publico)
- Busca transacao por `gateway_ref`
- Atualiza status via service role key (bypass RLS)
- O trigger `handle_transaction_status_change` ja cuida de atualizar o saldo

**Saque (`process-withdraw`):**
- Autenticacao via `getClaims()`
- Valida saldo consultando `profiles`
- Chama BS Pay API para transferencia PIX
- Insere transacao tipo `withdrawal` com status `pending`
- Webhook recebera callback quando a transferencia for processada

