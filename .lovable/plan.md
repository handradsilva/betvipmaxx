

## Corrigir erro "supabaseKey is required" na funcao check-payment-status

### Problema
A funcao `check-payment-status` esta usando `SUPABASE_PUBLISHABLE_KEY` como nome de variavel de ambiente, mas o nome correto no ambiente das Edge Functions e `SUPABASE_ANON_KEY`. Isso faz com que o valor retorne `undefined`, causando o erro `supabaseKey is required` a cada chamada de polling.

### Impacto
- O QR Code PIX e o copia e cola funcionam normalmente (generate-pix esta OK)
- O polling de status do pagamento falha repetidamente (a cada 5 segundos)
- O pagamento nunca sera confirmado automaticamente na tela, mesmo que o usuario pague

### Correcao
Alterar uma unica linha no arquivo `supabase/functions/check-payment-status/index.ts`:

**Linha 25 - de:**
```text
Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
```

**Para:**
```text
Deno.env.get("SUPABASE_ANON_KEY")
```

### Detalhes tecnicos
- A variavel `SUPABASE_ANON_KEY` e fornecida automaticamente pelo Lovable Cloud em todas as Edge Functions
- A variavel `SUPABASE_PUBLISHABLE_KEY` nao existe no ambiente das Edge Functions (e usada apenas no frontend como `VITE_SUPABASE_PUBLISHABLE_KEY`)
- A funcao `generate-pix` ja usa `SUPABASE_ANON_KEY` corretamente, por isso funciona sem problemas
- Apos a correcao, a funcao sera redeployada automaticamente

