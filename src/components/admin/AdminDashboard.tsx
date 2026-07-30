import { useState, useMemo } from "react";
import { Users, DollarSign, QrCode, UserPlus, TrendingUp, UserCheck, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AdminProfile, AdminTransaction, AdminReferral } from "@/hooks/useAdminData";
import AdminDateFilter from "./AdminDateFilter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Props {
  profiles: AdminProfile[];
  transactions: AdminTransaction[];
  referrals: AdminReferral[];
  refetch: () => void | Promise<void>;
}

const AFFILIATE_EMAILS = ["filipeafiliado@gmail.com", "italoafiliado2@gmail.com"];
const TZ = "America/Sao_Paulo";

// Date key (yyyy-MM-dd) of a timestamp as seen in Brazil (BRT), so the dashboard
// buckets match exactly what the payment gateway reports for each calendar day.
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const brDayKey = (iso: string) => dayKeyFmt.format(new Date(iso));
const localDayKey = (d: Date) => format(d, "yyyy-MM-dd");
const todayKey = () => dayKeyFmt.format(new Date());
const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

const AdminDashboard = ({ profiles, transactions, referrals, refetch }: Props) => {
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);

  const startKey = localDayKey(startDate);
  const endKey = localDayKey(endDate);
  const today = todayKey();

  const inRange = (iso: string) => {
    const k = brDayKey(iso);
    return k >= startKey && k <= endKey;
  };

  const filtered = useMemo(() => {
    const tx = transactions.filter((t) => inRange(t.created_at));
    const pr = profiles.filter((p) => inRange(p.created_at));
    return { tx, pr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, profiles, startKey, endKey]);

  const deposits = filtered.tx.filter((t) => t.type === "deposit");
  const paidDeposits = deposits.filter((t) => t.status === "completed");
  const pendingDeposits = deposits.filter((t) => t.status === "pending");
  const todayDeposits = deposits.filter((t) => brDayKey(t.created_at) === today);
  const todayPaid = todayDeposits.filter((t) => t.status === "completed");
  const todayUsers = filtered.pr.filter((p) => brDayKey(p.created_at) === today);

  const totalPixValue = paidDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const todayPixValue = todayPaid.reduce((s, t) => s + Number(t.amount), 0);
  const pendingValue = pendingDeposits.reduce((s, t) => s + Number(t.amount), 0);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("reconcile-deposits", {
        body: { days: 30 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Sincronização concluída",
        description: `${data.checked} PIX verificados · ${data.confirmed} confirmados (${brl(data.confirmed_amount)}) · ${data.expired} expirados · ${data.still_pending} ainda pendentes`,
      });
      await refetch();
    } catch (e) {
      toast({
        title: "Erro ao sincronizar",
        description: e instanceof Error ? e.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const affiliateCards = useMemo(() => {
    return AFFILIATE_EMAILS.map((email) => {
      const profile = profiles.find((p) => p.email === email);
      if (!profile) return { email, leads: 0, leadsToday: 0, ftds: 0, volume: 0 };
      const affReferrals = referrals.filter((r) => r.referrer_user_id === profile.user_id);
      const affReferralsFiltered = affReferrals.filter((r) => inRange(r.created_at));
      const referredIds = new Set(affReferralsFiltered.map((r) => r.referred_user_id));
      const referredDeposits = filtered.tx.filter(
        (t) => referredIds.has(t.user_id) && t.type === "deposit" && t.status === "completed"
      );
      const ftdUsers = new Set(referredDeposits.map((t) => t.user_id));
      const volume = referredDeposits.reduce((sum, t) => sum + Number(t.amount), 0);
      const leadsToday = affReferrals.filter((r) => brDayKey(r.created_at) === today).length;
      return { email, leads: affReferralsFiltered.length, leadsToday, ftds: ftdUsers.size, volume };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, referrals, filtered.tx, startKey, endKey]);

  const metrics = [
    { label: "Total de Usuários", value: profiles.length, icon: Users, color: "text-primary" },
    { label: "Saldo PIX (Hoje)", value: brl(todayPixValue), icon: DollarSign, color: "text-primary" },
    { label: "PIX Gerados (Hoje)", value: `${todayDeposits.length} (${todayPaid.length} Pagos)`, icon: QrCode, color: "text-primary" },
    { label: "Cadastros Hoje", value: todayUsers.length, icon: UserPlus, color: "text-primary" },
    { label: "Total Depósitos", value: brl(totalPixValue), icon: TrendingUp, color: "text-primary" },
    { label: "PIX Gerados (Geral)", value: `${deposits.length} (${paidDeposits.length} Pagos)`, icon: QrCode, color: "text-primary" },
    
  ];

  const chartData = useMemo(() => {
    // Build day buckets in BRT between the selected range (max 30 days shown).
    const keys: string[] = [];
    const cursor = new Date(startDate);
    cursor.setHours(12, 0, 0, 0);
    const last = new Date(endDate);
    last.setHours(12, 0, 0, 0);
    while (cursor <= last) {
      keys.push(localDayKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    const window = keys.slice(-31);

    const paidByDay = new Map<string, number>();
    for (const t of paidDeposits) {
      const k = brDayKey(t.created_at);
      paidByDay.set(k, (paidByDay.get(k) ?? 0) + Number(t.amount));
    }
    const usersByDay = new Map<string, number>();
    for (const p of profiles) {
      const k = brDayKey(p.created_at);
      usersByDay.set(k, (usersByDay.get(k) ?? 0) + 1);
    }

    return window.map((k) => ({
      name: `${k.slice(8, 10)}/${k.slice(5, 7)}`,
      pix: Number((paidByDay.get(k) ?? 0).toFixed(2)),
      users: usersByDay.get(k) ?? 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidDeposits, profiles, startKey, endKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminDateFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
        >
          <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : "Sincronizar com gateway"}
        </button>
      </div>

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
                <p className="font-bold text-foreground">{brl(aff.volume)}</p>
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
