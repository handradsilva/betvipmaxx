import { useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { AdminProfile } from "@/hooks/useAdminData";

interface Props {
  profiles: AdminProfile[];
  updateBalance: (userId: string, balance: number) => Promise<{ error: any }>;
  refetch: () => Promise<void>;
}

const AdminBalance = ({ profiles, updateBalance, refetch }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = profiles.filter((p) => search && p.email.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selectedUser || newBalance === "") return;
    const val = parseFloat(newBalance.replace(",", "."));
    if (isNaN(val) || val < 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await updateBalance(selectedUser.user_id, val);
    if (error) {
      toast({ title: "Erro ao atualizar saldo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saldo atualizado com sucesso!" });
      await refetch();
      setSelectedUser((prev) => prev ? { ...prev, balance: val } : null);
      setNewBalance("");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-lg space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <DollarSign size={16} className="text-primary" /> Alterar Saldo de Usuário
        </h3>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário por e-mail..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); }}
            className="pl-9 h-9 text-sm bg-secondary"
          />
        </div>

        {search && !selectedUser && filtered.length > 0 && (
          <div className="rounded-xl border border-border bg-card max-h-48 overflow-y-auto">
            {filtered.slice(0, 10).map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedUser(p); setSearch(p.email); }}
                className="w-full text-left px-4 py-3 text-xs hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <span className="text-foreground">{p.email}</span>
                <span className="text-muted-foreground ml-2">— R$ {p.balance.toFixed(2).replace(".", ",")}</span>
              </button>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Usuário</p>
              <p className="text-sm font-semibold text-foreground">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
              <p className="text-lg font-bold text-primary">R$ {selectedUser.balance.toFixed(2).replace(".", ",")}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Novo Saldo (R$)</label>
              <Input
                type="text"
                placeholder="0,00"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="h-10 text-sm bg-secondary"
              />
            </div>
            <Button onClick={handleSave} disabled={saving || newBalance === ""} className="w-full bg-primary text-primary-foreground font-bold">
              {saving ? "Salvando..." : "Confirmar Alteração"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBalance;
