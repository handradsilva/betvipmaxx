

## Corrigir URLs e autenticacao da API BS Pay em todas as Edge Functions

O erro de DNS acontece porque a URL da API estava errada em todas as edge functions. A documentacao oficial da BS Pay confirma:

- URL errada: `https://api.bfrpagamentos.com.br/api/`
- URL correta: `https://api.bspay.co/v2/`

Alem disso, o metodo de autenticacao tambem esta errado. A BS Pay usa **Basic Auth** (base64 de `client_id:client_secret` no header), nao JSON body com `grant_type: client_credentials`.

---

### Alteracoes necessarias

**4 Edge Functions precisam ser corrigidas:**

**1. `generate-pix/index.ts`**
- Trocar URL de token: `https://api.bfrpagamentos.com.br/api/oauth/token` -> `https://api.bspay.co/v2/oauth/token`
- Trocar metodo de auth: de JSON body para Basic Auth header (base64)
- Trocar URL de QR Code: `https://api.bfrpagamentos.com.br/api/pix/qrcode` -> `https://api.bspay.co/v2/pix/qrcode`

**2. `check-payment-status/index.ts`**
- Trocar URL de token: `https://api.bfrpagamentos.com.br/api/oauth/token` -> `https://api.bspay.co/v2/oauth/token`
- Trocar metodo de auth: de JSON body para Basic Auth header (base64)
- Trocar URL de consulta: `https://api.bfrpagamentos.com.br/api/pix/qrcode/{id}` -> `https://api.bspay.co/v2/pix/transaction/{id}` (ou endpoint correto de consulta)

**3. `process-withdraw/index.ts`**
- Trocar URL de token: `https://api.bfrpagamentos.com.br/api/oauth/token` -> `https://api.bspay.co/v2/oauth/token`
- Trocar metodo de auth: de JSON body para Basic Auth header (base64)
- Trocar URL de transfer: `https://api.bfrpagamentos.com.br/api/pix/transfer` -> `https://api.bspay.co/v2/pix/payment`

**4. `bspay-webhook/index.ts`**
- Este nao faz chamadas externas, nao precisa de alteracao

---

### Detalhes tecnicos

**Novo metodo de autenticacao (Basic Auth):**

Antes (errado):
```text
fetch("https://api.bfrpagamentos.com.br/api/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }),
})
```

Depois (correto conforme docs BS Pay):
```text
const credentials = btoa(`${clientId}:${clientSecret}`);
fetch("https://api.bspay.co/v2/oauth/token", {
  method: "POST",
  headers: {
    "Authorization": `Basic ${credentials}`,
    "accept": "application/json",
  },
})
```

**Mapeamento de endpoints:**

| Funcao | URL antiga (errada) | URL nova (correta) |
|--------|--------------------|--------------------|
| Token | api.bfrpagamentos.com.br/api/oauth/token | api.bspay.co/v2/oauth/token |
| QR Code | api.bfrpagamentos.com.br/api/pix/qrcode | api.bspay.co/v2/pix/qrcode |
| Consulta | api.bfrpagamentos.com.br/api/pix/qrcode/{id} | api.bspay.co/v2/pix/qrcode/{id} |
| Pagamento | api.bfrpagamentos.com.br/api/pix/transfer | api.bspay.co/v2/pix/payment |

Apos as alteracoes, as 3 functions serao redeployadas automaticamente.
