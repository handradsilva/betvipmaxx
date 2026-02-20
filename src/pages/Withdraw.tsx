import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const presetValues = [
  { label: "R$ 50", value: 50, border: "2px" },
  { label: "🔥 R$ 100", value: 100, border: "2.5px" },
  { label: "R$ 200", value: 200, border: "3px" },
  { label: "R$ 500", value: 500, border: "4px" },
];

const Withdraw = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState(profile?.pix_key || "");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const balance = profile?.balance ?? 0;
  const formattedBalance = `R$ ${balance.toFixed(2).replace(".", ",")}`;

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val < 20) {
      toast({ title: "Valor mínimo", description: "O saque mínimo é R$ 20,00", variant: "destructive" });
      return;
    }
    if (val > balance) {
      toast({ title: "Saldo insuficiente", description: "Você não possui saldo suficiente", variant: "destructive" });
      return;
    }
    if (!pixKey.trim()) {
      toast({ title: "Chave PIX", description: "Informe sua chave PIX para receber o saque", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Simulate processing delay
    setTimeout(() => {
      setWithdrawnAmount(val);
      setShowSuccess(true);
      setAmount("");
      setLoading(false);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Parabéns!</h1>
            <p className="text-sm text-muted-foreground">
              Seu saque foi liberado! Em alguns segundos irá cair o valor de{" "}
              <span className="text-primary font-bold">
                R$ {withdrawnAmount.toFixed(2).replace(".", ",")}
              </span>{" "}
              que você solicitou na sua chave PIX.
            </p>
            <button
              onClick={() => { setShowSuccess(false); navigate("/"); }}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all neon-glow"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Sacar</h1>
          <p className="text-center text-sm mb-6">
            <span className="text-muted-foreground">Saldo: </span>
            <span className="font-bold text-primary">{formattedBalance}</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Chave PIX:</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Valor do saque:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                min="20"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {presetValues.map(({ label, value, border }) => (
                <button
                  key={value}
                  onClick={() => setAmount(String(value))}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    amount === String(value)
                      ? "bg-[hsl(30,90%,40%)]/20 text-[hsl(30,90%,50%)]"
                      : "bg-secondary text-foreground hover:bg-[hsl(30,90%,40%)]/10"
                  }`}
                  style={{
                    border: `${border} solid hsl(30, 90%, 40%)`,
                    boxShadow: amount === String(value)
                      ? "0 0 12px hsla(30, 90%, 40%, 0.5)"
                      : "0 0 6px hsla(30, 90%, 40%, 0.15)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Saque mínimo: R$ 20,00</p>
              <p>• O valor será enviado para a chave PIX informada.</p>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm text-foreground hover:brightness-110 transition-all disabled:opacity-50"
              style={{ backgroundColor: "hsl(30, 90%, 40%)" }}
            >
              {loading ? "Processando..." : "Solicitar Saque"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Withdraw;
