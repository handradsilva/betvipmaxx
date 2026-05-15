## Objetivo
Expandir a busca da aba "Usuários" no painel admin para também encontrar leads pelo **nome completo** (`full_name`), além de e-mail e CPF.

## Alterações

**`src/components/admin/AdminUsers.tsx`**
- Atualizar o placeholder do input para: `"Buscar por nome, e-mail ou CPF..."`
- No filtro `useMemo`, adicionar match por nome:
  - `nameMatch = (p.full_name || "").toLowerCase().includes(q)`
  - Retornar `emailMatch || cpfMatch || nameMatch`
- Manter a normalização de CPF (com/sem pontos e hífen) já existente.
- Busca case-insensitive e por substring (ex: digitar "joão" encontra "João da Silva").

## Observações
- `full_name` já existe em `AdminProfile` e é populado para cadastros a partir de 14/05/2026.
- Leads antigos sem nome simplesmente não casam pelo nome, mas continuam encontráveis por e-mail/CPF.
- Nenhuma alteração de backend, schema ou lógica de negócio.
