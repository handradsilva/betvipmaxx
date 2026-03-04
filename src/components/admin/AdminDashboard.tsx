import { useState, useMemo } from "react";
import { Users, DollarSign, QrCode, UserPlus, TrendingUp } from "lucide-react";
import { format, parseISO, isToday, isAfter, isBefore, startOfDay, endOfDay, eachDayOfInterval, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AdminProfile, AdminTransaction, AdminReferral } from "@/hooks/useAdminData";

interface Props {
  profiles: AdminProfile[];
  transactions: AdminTransaction[];
  referrals: AdminReferral[];
}

const AFFILIATE_EMAILS = ["filipeafiliado@gmail.com", "italoafiliado2@gmail.com"];

const AdminDashboard = ({ profiles, transactions, referrals }: Props) => {
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const filtered = useMemo(() => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);
    const tx = transactions.filter((t) => {
      const d = parseISO(t.created_at);
      return isAfter(d, s) && isBefore(d, e);
    });
    const pr = profiles.filter((p) => {
      const d = parseISO(p.created_at);
      return isAfter(d, s) && isBefore(d, e);
    });
    return { tx, pr };
  }, [transactions, profiles, startDate, endDate]);

  const deposits = filtered.tx.filter((t) => t.type === "deposit");
  const paidDeposits = deposits.filter((t) => t.status === "completed");
  const todayDeposits = deposits.filter((t) => isToday(parseISO(t.created_at)));
  const todayPaid = todayDeposits.filter((t) => t.status === "completed");
  const todayUsers = filtered.pr.filter((p) => isToday(parseISO(p.created_at)));

  const totalPixValue = paidDeposits.reduce((s, t) => s + t.amount, 0);
  const todayPixValue = todayPaid.reduce((s, t) => s + t.amount, 0);

  const affiliateCards = useMemo(() => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);
    return AFFILIATE_EMAILS.map((email) => {
      const profile = profiles.find((p) => p.email === email);
      if (!profile) return { email, leads: 0, leadsToday: 0, ftds: 0, volume: 0 };
      const affReferrals = referrals.filter((r) => r.referrer_user_id === profile.user_id);
      const affReferralsFiltered = affReferrals.filter((r) => {
        const d = parseISO(r.created_at);
        return isAfter(d, s) && isBefore(d, e);
      });
      const referredIds = new Set(affReferralsFiltered.map((r) => r.referred_user_id));
      const referredDeposits = filtered.tx.filter(
        (t) => referredIds.has(t.user_id) && t.type === "deposit" && t.status === "completed"
      );
      const ftdUsers = new Set(referredDeposits.map((t) => t.user_id));
      const volume = referredDeposits.reduce((sum, t) => sum + t.amount, 0);
      const leadsToday = affReferrals.filter((r) => isToday(parseISO(r.created_at))).length;
      return { email, leads: affReferralsFiltered.length, leadsToday, ftds: ftdUsers.size, volume };
    });
  }, [profiles, referrals, filtered.tx, startDate, endDate]);

  const metrics = [
    { label: "Total de Usuários", value: profiles.length, icon: Users, color: "text-primary" },
    { label: "Saldo PIX (Hoje)", value: `R$ ${todayPixValue.toFixed(2).replace(".", ",")}`, icon: DollarSign, color: "text-primary" },
    { label: "PIX Gerados (Hoje)", value: `${todayDeposits.length} (${todayPaid.length} Pagos)`, icon: QrCode, color: "text-primary" },
    { label: "Cadastros Hoje", value: todayUsers.length, icon: UserPlus, color: "text-primary" },
    { label: "Total Depósitos", value: `R$ ${totalPixValue.toFixed(2).replace(".", ",")}`, icon: TrendingUp, color: "text-primary" },
    { label: "PIX Gerados (Geral)", value: `${deposits.length} (${paidDeposits.length} Pagos)`, icon: QrCode, color: "text-primary" },
  ];

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(endDate, 30) > startDate ? subDays(endDate, 30) : startDate,
      end: endDate,
    });
    return days.map((day) => {
      const dayStr = format(day, "dd/MM");
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayPaid = paidDeposits.filter((t) => {
        const d = parseISO(t.created_at);
        return isAfter(d, dayStart) && isBefore(d, dayEnd);
      });
      const dayRegs = profiles.filter((p) => {
        const d = parseISO(p.created_at);
        return isAfter(d, dayStart) && isBefore(d, dayEnd);
      });
      return { name: dayStr, pix: dayPaid.reduce((s, t) => s + t.amount, 0), users: dayRegs.length };
    });
  }, [paidDeposits, profiles, startDate, endDate]);

  return (
    <div className="space-y-6">
      <AdminDateFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <m.icon size={14} className={m.color} /> {m.label}
            </p>
            <p className="text-lg font-bold text-foreground mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {affiliateCards.map((aff) => (
          <div key={aff.email} className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              <UserCheck size={14} className="text-primary" /> {aff.email}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Leads (Hoje)</p>
                <p className="font-bold text-foreground">{aff.leadsToday}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leads (Período)</p>
                <p className="font-bold text-foreground">{aff.leads}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">FTDs</p>
                <p className="font-bold text-foreground">{aff.ftds}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume Depósitos</p>
                <p className="font-bold text-foreground">R$ {aff.volume.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">PIX Recebidos (R$)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="pix" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Registros de Usuários</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
