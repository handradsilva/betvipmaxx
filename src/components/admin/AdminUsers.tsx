import { useState, useMemo } from "react";
import { format, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { Search, User as UserIcon, Wallet as WalletIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { AdminProfile, AdminTransaction } from "@/hooks/useAdminData";
import AdminDateFilter from "./AdminDateFilter";

interface Props {
  profiles: AdminProfile[];
  transactions: AdminTransaction[];
}

const formatBRL = (n: number) =>
  `R$ ${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const AdminUsers = ({ profiles, transactions }: Props) => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<AdminProfile | null>(null);

  const filtered = useMemo(() => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);
    return profiles
      .filter((p) => {
        const d = parseISO(p.created_at);
        return isAfter(d, s) && isBefore(d, e);
      })
      .filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const cpfDigits = (p.cpf || "").replace(/\D/g, "");
        const queryDigits = search.replace(/\D/g, "");
        return (
          p.email.toLowerCase().includes(q) ||
          (queryDigits.length > 0 && cpfDigits.includes(queryDigits))
        );
      });
  }, [profiles, search, startDate, endDate]);

  const userTx = useMemo(() => {
    if (!selected) return [];
    return transactions.filter((t) => t.user_id === selected.user_id);
  }, [selected, transactions]);

  const userDeposits = userTx.filter((t) => t.type === "deposit");
  const completedDeposits = userDeposits.filter((t) => t.status === "completed");
  const totalDeposited = completedDeposits.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdrawn = userTx
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const hasDeposited = completedDeposits.length > 0;
  const referrer = selected?.referred_by
    ? profiles.find((pr) => pr.referral_code === selected.referred_by)
    : null;

  return (
    <div className="space-y-4">
      <AdminDateFilter startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por e-mail ou CPF..."
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
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Depositou</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Afiliado</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Indicado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const ref = p.referred_by ? profiles.find((pr) => pr.referral_code === p.referred_by) : null;
                const userHasDeposit = transactions.some(
                  (t) => t.user_id === p.user_id && t.type === "deposit" && t.status === "completed"
                );
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-foreground font-medium">{p.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{format(parseISO(p.created_at), "dd/MM/yyyy HH:mm")}</td>
                    <td className="px-4 py-3">
                      {userHasDeposit ? (
                        <span className="text-primary font-semibold">Sim</span>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.affiliate_approved ? (
                        <span className="text-primary font-semibold">Sim</span>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ref ? ref.email : "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} usuários encontrados • Clique em um usuário para ver detalhes</p>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{selected?.email}</DialogTitle>
          </DialogHeader>

          {selected && (
            <Tabs defaultValue="perfil" className="space-y-4">
              <TabsList className="bg-secondary">
                <TabsTrigger value="perfil" className="gap-1.5"><UserIcon size={14} /> Perfil</TabsTrigger>
                <TabsTrigger value="financeiro" className="gap-1.5"><WalletIcon size={14} /> Financeiro</TabsTrigger>
              </TabsList>

              <TabsContent value="perfil" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parseISO(selected.created_at) >= new Date(2026, 4, 14) && (
                    <Field label="Nome completo" value={selected.full_name || "—"} />
                  )}
                  <Field label="E-mail" value={selected.email} />
                  <Field label="Telefone" value={selected.phone || "—"} />
                  <Field label="CPF" value={selected.cpf || "—"} />
                  <Field label="Chave PIX" value={selected.pix_key || "—"} />
                  <Field label="Cargo" value="Usuário" />
                  <Field label="Status" value="Ativo" />
                  <Field label="Código de Afiliado" value={selected.referral_code || "—"} />
                  <Field label="Indicado por" value={referrer ? referrer.email : "—"} />
                  <Field label="Data de Cadastro" value={format(parseISO(selected.created_at), "dd/MM/yyyy HH:mm")} />
                  <Field label="Afiliado Aprovado" value={selected.affiliate_approved ? "Sim" : "Não"} />
                </div>
              </TabsContent>

              <TabsContent value="financeiro" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <StatCard title="Saldo Atual" value={formatBRL(totalDeposited)} />
                  <StatCard title="Total Depositado" value={formatBRL(totalDeposited)} subtitle={`${completedDeposits.length} depósito(s)`} />
                  <StatCard title="Total Retirado" value={formatBRL(totalWithdrawn)} />
                </div>

                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 bg-secondary text-sm font-semibold text-foreground flex items-center justify-between">
                    <span>Histórico de Depósitos</span>
                    <span className={`text-xs ${hasDeposited ? "text-primary" : "text-muted-foreground"}`}>
                      {hasDeposited ? "Já depositou" : "Nunca depositou"}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Data</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Valor</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {userDeposits.length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">Nenhum depósito realizado</td></tr>
                        )}
                        {userDeposits
                          .slice()
                          .sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
                          .map((t) => (
                            <tr key={t.id}>
                              <td className="px-4 py-2 text-foreground">{format(parseISO(t.created_at), "dd/MM/yyyy HH:mm")}</td>
                              <td className="px-4 py-2 text-foreground font-semibold">{formatBRL(Number(t.amount))}</td>
                              <td className="px-4 py-2">
                                <span className={
                                  t.status === "completed" ? "text-primary font-semibold" :
                                  t.status === "failed" ? "text-destructive" :
                                  "text-muted-foreground"
                                }>
                                  {t.status === "completed" ? "Pago" : t.status === "failed" ? "Falhou" : "Pendente"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground break-all">
      {value}
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <p className="text-xs text-muted-foreground mb-1">{title}</p>
    <p className="text-xl font-bold text-foreground">{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

export default AdminUsers;
