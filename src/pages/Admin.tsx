import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Wallet, UserCheck, Settings, DollarSign } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminDeposits from "@/components/admin/AdminDeposits";
import AdminAffiliates from "@/components/admin/AdminAffiliates";
import AdminBalance from "@/components/admin/AdminBalance";
import AdminSettings from "@/components/admin/AdminSettings";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading, profiles, transactions, referrals, updateBalance, toggleAffiliate, refetch } = useAdminData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=login");
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive font-bold text-lg">Acesso negado</p>
          <p className="text-muted-foreground text-sm">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "affiliates", label: "Afiliados", icon: UserCheck },
    { value: "users", label: "Usuários", icon: Users },
    { value: "deposits", label: "Depósitos", icon: Wallet },
    { value: "balance", label: "Saldo", icon: DollarSign },
    { value: "settings", label: "Config", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard size={22} className="text-primary" />
            Painel Admin
          </h1>
          <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar ao site
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="w-full bg-secondary overflow-x-auto flex justify-start gap-1 p-1 rounded-xl">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2 whitespace-nowrap"
              >
                <t.icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard profiles={profiles} transactions={transactions} referrals={referrals} />
          </TabsContent>
          <TabsContent value="affiliates">
            <AdminAffiliates profiles={profiles} referrals={referrals} transactions={transactions} toggleAffiliate={toggleAffiliate} />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsers profiles={profiles} />
          </TabsContent>
          <TabsContent value="deposits">
            <AdminDeposits transactions={transactions} profiles={profiles} />
          </TabsContent>
          <TabsContent value="balance">
            <AdminBalance profiles={profiles} updateBalance={updateBalance} refetch={refetch} />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
