import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Users, TrendingUp, DollarSign, Clock } from "lucide-react";

interface ReferralStats {
  total_referred: number;
  total_ftds: number;
  total_earned: number;
  pending: number;
}

const Affiliate = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReferralStats>({
    total_referred: 0,
    total_ftds: 0,
    total_earned: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", user.id);

      if (error) throw error;

      const referrals = data || [];
      setStats({
        total_referred: referrals.length,
        total_ftds: referrals.filter((r) => r.status === "completed").length,
        total_earned: referrals
          .filter((r) => r.status === "completed")
          .reduce((sum, r) => sum + Number(r.commission_amount || 0), 0),
        pending: referrals
          .filter((r) => r.status === "pending")
          .reduce((sum, r) => sum + Number(r.commission_amount || 0), 0),
      });
    } catch (err) {
      console.error("Error fetching referral stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = (profile as any)?.referral_code || "...";
  const referralLink = `https://www.betvipmaxx.com/?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Link copiado!", description: "Compartilhe com seus amigos." });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-lg p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Users size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel de Afiliado</h1>
              <p className="text-sm text-muted-foreground">
                Ganhe R$ 5,00 por cada amigo convidado
              </p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              🔗 Seu link de afiliado
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-xs truncate"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all"
              >
                <Copy size={14} />
                Copiar
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Código: <span className="text-primary font-bold">{referralCode}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users size={14} /> Indicados
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {loading ? "..." : stats.total_referred}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TrendingUp size={14} /> FTDs
              </p>
              <p className="text-2xl font-bold text-primary mt-1">
                {loading ? "..." : stats.total_ftds}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <DollarSign size={14} /> Total ganho
              </p>
              <p className="text-2xl font-bold text-primary mt-1">
                R$ {loading ? "..." : stats.total_earned.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock size={14} /> Pendente
              </p>
              <p className="text-2xl font-bold text-primary mt-1">
                R$ {loading ? "..." : stats.pending.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Tutorial */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="text-base font-bold text-foreground">Como funciona?</h2>
            <div className="space-y-3">
              {[
                "Compartilhe seu link de afiliado com seus amigos",
                "Seu amigo se cadastra usando seu link",
                "Você ganha R$ 5,00 de comissão após o primeiro depósito dele",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Affiliate;
