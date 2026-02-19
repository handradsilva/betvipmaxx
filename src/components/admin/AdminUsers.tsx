import { useState, useMemo } from "react";
import { format, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AdminProfile } from "@/hooks/useAdminData";
import AdminDateFilter from "./AdminDateFilter";

interface Props {
  profiles: AdminProfile[];
}

const AdminUsers = ({ profiles }: Props) => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const filtered = useMemo(() => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);
    return profiles
      .filter((p) => {
        const d = parseISO(p.created_at);
        return isAfter(d, s) && isBefore(d, e);
      })
      .filter((p) => !search || p.email.toLowerCase().includes(search.toLowerCase()));
  }, [profiles, search, startDate, endDate]);

  return (
    <div className="space-y-4">
      <AdminDateFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm bg-secondary"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data Registro</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Afiliado</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Indicado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const referrer = p.referred_by ? profiles.find((pr) => pr.referral_code === p.referred_by) : null;
                return (
                  <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-foreground">{p.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{format(parseISO(p.created_at), "dd/MM/yyyy HH:mm")}</td>
                    <td className="px-4 py-3">
                      {p.affiliate_approved ? (
                        <span className="text-primary font-semibold">Sim</span>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{referrer ? referrer.email : "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} usuários encontrados</p>
    </div>
  );
};

export default AdminUsers;
