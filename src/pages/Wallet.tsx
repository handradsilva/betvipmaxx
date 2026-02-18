import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

const Wallet = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setTransactions(data as Transaction[]);
    };
    fetchTransactions();
  }, [user, navigate]);

  if (!user) return null;

  const balance = profile?.balance ?? 0;
  const formattedBalance = `R$ ${balance.toFixed(2).replace(".", ",")}`;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Minha Carteira</h1>

        <div className="p-6 rounded-2xl bg-card border border-border mb-6">
          <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
          <p className="text-3xl font-bold text-primary">{formattedBalance}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Histórico de Transações</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {tx.type === "deposit" ? "Depósito" : "Saque"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === "deposit" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "deposit" ? "+" : "-"}R$ {tx.amount.toFixed(2).replace(".", ",")}
                    </p>
                    <p className={`text-xs ${tx.status === "completed" ? "text-primary" : tx.status === "failed" ? "text-destructive" : "text-muted-foreground"}`}>
                      {tx.status === "completed" ? "Concluído" : tx.status === "failed" ? "Falhou" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
