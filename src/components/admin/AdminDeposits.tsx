import { useState, useMemo } from "react";
import { format, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AdminProfile, AdminTransaction } from "@/hooks/useAdminData";
import AdminDateFilter from "./AdminDateFilter";

interface Props {
  transactions: AdminTransaction[];
  profiles: AdminProfile[];
}

const AdminDeposits = ({ transactions, profiles }: Props) => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const deposits = useMemo(() => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);
    return transactions
      .filter((t) => t.type === "deposit")
      .filter((t) => {
        const d = parseISO(t.created_at);
        return isAfter(d, s) && isBefore(d, e);
      })
      .filter((t) => {
        if (!search) return true;
        const p = profiles.find((p) => p.user_id === t.user_id);
        return p?.email.toLowerCase().includes(search.toLowerCase());
      });
  }, [transactions, profiles, search, startDate, endDate]);

  const getEmail = (userId: string) => profiles.find((p) => p.user_id === userId)?.email || "—";

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
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deposits.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    {t.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">Pago</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-accent/20 text-orange-accent text-[10px] font-bold">Pendente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground font-semibold">R$ {t.amount.toFixed(2).replace(".", ",")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{getEmail(t.user_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(parseISO(t.created_at), "dd/MM/yyyy HH:mm")}</td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nenhum depósito encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{deposits.length} depósitos encontrados</p>
    </div>
  );
};

export default AdminDeposits;
