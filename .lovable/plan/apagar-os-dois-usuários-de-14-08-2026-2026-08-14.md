# Apagar os dois usuários de 14/08/2026

## Usuários a remover

| E-mail | Nome | Cadastro (BRT) | Transações |
|---|---|---|---|
| filipppppe.andrade.10000@gmail.com | FILLIPE ANDRADE DA SILVA | 14/08/2026 06:56 | 1 |
| testez@gmial.com | — | 14/08/2026 06:30 | 0 |

## O que será feito

Exclusão definitiva de ambos: perfil, transações vinculadas, indicações e a conta de login. A ação é irreversível — se um deles for um lead real com depósito, ele desaparece do dashboard e dos relatórios.

Observação: o primeiro usuário tem 1 transação registrada. Ela será apagada junto.

## Detalhes técnicos

- Remover linhas em `referrals` (como indicador ou indicado), `transactions`, `user_roles` e `profiles` para os dois `user_id`.
- Remover as contas em `auth.users` (as FKs de `profiles`/`transactions` são `on delete cascade`, então a exclusão da conta de login já limpa o restante).
- Executado via ferramenta de dados, sem alteração de código do app.
