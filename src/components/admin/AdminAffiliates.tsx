import { useState, useMemo } from "react";
import { format, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { Search, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { AdminProfile, AdminTransaction, AdminReferral } from "@/hooks/useAdminData";
import AdminDateFilter from "./AdminDateFilter";

interface Props {
  profiles: AdminProfile[];
  referrals: AdminReferral[];
  transactions: AdminTransaction[];
  toggleAffiliate: (userId: string, approved: boolean) => Promise<{ error: any }>;
}

const AdminAffiliates = ({ profiles, referrals, transactions, toggleAffiliate }: Props) => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return profiles.filter((p) => !search || p.email.toLowerCase().includes(search.toLowerCase()));
  }, [profiles, search]);

  const getAffiliateStats = (profile: AdminProfile) => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);

    const refs = referrals.filter((r) => {
      const d = parseISO(r.created_at);
      return r.referrer_user_id === profile.user_id && isAfter(d, s) && isBefore(d, e);
    });

    const referredUserIds = refs.map((r) => r.referred_user_id);
    const usersDeposited = referredUserIds.filter((uid) =>
      transactions.some((t) => t.user_id === uid && t.type === "deposit" && t.status === "completed")
    );
    const totalDeposit = transactions
      .filter((t) => referredUserIds.includes(t.user_id) && t.type === "deposit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0);

    return { brought: refs.length, deposited: usersDeposited.length, totalDeposit };
  };

  const handleToggle = async (userId: string, approved: boolean) => {
    setToggling(userId);
    const { error } = await toggleAffiliate(userId, approved);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: approved ? "Afiliado aprovado" : "Afiliado removido" });
    setToggling(null);
  };

  return (
    <div className="space-y-4">
      <AdminDateFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-secondary" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Trazidos</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Depositaram</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Depósito Total</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const stats = getAffiliateStats(p);
                return (
                  <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-foreground">{p.email}</td>
                    <td className="px-4 py-3">
                      {p.affiliate_approved ? (
                        <span className="text-primary font-semibold">Aprovado</span>
                      ) : (
                        <span className="text-muted-foreground">Pendente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">{stats.brought}</td>
                    <td className="px-4 py-3 text-foreground">{stats.deposited}</td>
                    <td className="px-4 py-3 text-primary font-semibold">R$ {stats.totalDeposit.toFixed(2).replace(".", ",")}</td>
                    <td className="px-4 py-3">
                      {p.affiliate_approved ? (
                        <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => handleToggle(p.user_id, false)} disabled={toggling === p.user_id}>
                          <X size={14} />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 text-primary hover:text-primary" onClick={() => handleToggle(p.user_id, true)} disabled={toggling === p.user_id}>
                          <Check size={14} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAffiliates;
