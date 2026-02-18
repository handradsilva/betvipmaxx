

## Plano: Confirmacao de Pagamento por Polling (sem webhook)

Como pode nao ser possivel cadastrar a URL do webhook no gateway BS Pay, vamos implementar um sistema de polling que consulta o status do pagamento diretamente na API da BS Pay ate receber a confirmacao.

---

### Como vai funcionar

1. Usuario gera o QR Code PIX na tela de deposito
2. O frontend inicia um polling automatico a cada 5 segundos
3. A cada ciclo, chama uma Edge Function que consulta o status do pagamento na API da BS Pay
4. Quando a BS Pay confirmar o pagamento, a Edge Function atualiza a transacao para `completed`
5. O trigger do banco atualiza o saldo automaticamente
6. O frontend detecta a mudanca e mostra o saldo atualizado na tela

---

### O que sera criado/alterado

**1. Nova Edge Function: `check-payment-status`**
- Recebe o `transaction_id` (gateway_ref)
- Autentica com BS Pay (client_credentials)
- Consulta o endpoint de status do pagamento na API da BS Pay
- Se pago: atualiza a transacao para `completed` (trigger credita saldo)
- Retorna o status atual para o frontend

**2. Atualizar pagina de Deposito (`src/pages/Deposit.tsx`)**
- Apos gerar o QR Code, iniciar polling a cada 5 segundos
- Chamar a Edge Function `check-payment-status`
- Quando status mudar para `completed`:
  - Parar o polling
  - Mostrar mensagem de sucesso "Pagamento confirmado!"
  - Atualizar o saldo na tela (chamar `refreshProfile`)
- Timeout de 10 minutos (parar polling se nao confirmar)
- Mostrar indicador visual de "Aguardando pagamento..." com animacao

**3. Atualizar `supabase/config.toml`**
- Registrar a nova function `check-payment-status`

---

### Detalhes Tecnicos

**Edge Function `check-payment-status`:**
- Autenticacao do usuario via JWT (getClaims)
- Valida que a transacao pertence ao usuario
- Autentica com BS Pay usando BSPAY_CLIENT_ID e BSPAY_CLIENT_SECRET
- Consulta status via GET/POST na API BS Pay (endpoint de consulta de transacao)
- Atualiza no banco usando service role key (bypass RLS)

**Polling no frontend:**
- `setInterval` de 5 segundos apos gerar QR Code
- Limpa o interval ao desmontar o componente ou ao confirmar pagamento
- Maximo de 120 tentativas (10 minutos)
- Feedback visual com spinner e texto "Aguardando pagamento..."

**Fluxo visual na tela:**
- QR Code exibido com contador regressivo
- Texto "Aguardando pagamento..." pulsando
- Ao confirmar: animacao de sucesso + saldo atualizado
- Se expirar: mensagem para tentar novamente

---

### Nota sobre o webhook

O webhook (`bspay-webhook`) que ja foi criado continua funcionando. Se no futuro o dono da BS Pay cadastrar a URL, o sistema aceita as duas formas (polling + webhook). O que confirmar primeiro ganha.

