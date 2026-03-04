

## Plan: Add 2 Affiliate Metric Cards to Dashboard

### What changes

**1. Pass `referrals` data to AdminDashboard** (`src/pages/Admin.tsx`)
- Add `referrals` to the props passed to `<AdminDashboard>`.

**2. Add affiliate cards in AdminDashboard** (`src/components/admin/AdminDashboard.tsx`)
- Update Props interface to include `referrals: AdminReferral[]`.
- For each of the two hardcoded affiliate emails (`filipeafiliado@gmail.com`, `italoafiliado2@gmail.com`):
  - Find the affiliate profile by email.
  - Get referred users from `referrals` table (filtered by date range like existing cards).
  - Calculate: leads brought (today), leads brought (period), FTDs (users who deposited), total deposit volume from their referrals.
- Render 2 new cards after the existing 6, each showing the affiliate email as label and their key daily/period metrics (e.g., "Leads Hoje: X | Total: Y | Depósitos: R$ Z").
- Cards follow the same visual style and date filter as existing cards.

### Technical details

- The affiliate lookup uses `profiles.find(p => p.email === "filipeafiliado@gmail.com")` to get the `user_id`, then filters `referrals` by `referrer_user_id` within the date range.
- Deposit volume is computed by cross-referencing `referred_user_id` list with `transactions` (type=deposit, status=completed).
- Uses `UserCheck` icon from lucide-react for the affiliate cards.

