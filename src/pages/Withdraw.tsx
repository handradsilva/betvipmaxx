import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const presetValues = [
  { label: "R$ 50", value: 50, border: "2px" },
  { label: "🔥 R$ 100", value: 100, border: "2.5px" },
  { label: "R$ 200", value: 200, border: "3px" },
  { label: "R$ 500", value: 500, border: "4px" },
];

const FEE_AMOUNT = 19.90;
const POLL_INTERVAL = 5000;
const MAX_POLLS = 120;

const Withdraw = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState(profile?.pix_key || "");
  const [loading, setLoading] = useState(false);

  // Fee modal state
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState(0);

  // PIX payment state
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [brcode, setBrcode] = useState<string | null>(null);
  const [gatewayRef, setGatewayRef] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "confirmed" | "expired" | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const balance = profile?.balance ?? 0;
  const formattedBalance = `R$ ${balance.toFixed(2).replace(".", ",")}`;

  const handleWithdraw = () => {
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

    setRequestedAmount(val);
    setShowFeeModal(true);
  };

  const startPolling = (ref: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPaymentStatus("waiting");
    setPollCount(0);
    let count = 0;

    pollRef.current = setInterval(async () => {
      count++;
      setPollCount(count);

      if (count >= MAX_POLLS) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setPaymentStatus("expired");
        toast({ title: "Tempo expirado", description: "O tempo para pagamento expirou. Tente novamente.", variant: "destructive" });
        return;
      }

      try {
        const { data } = await supabase.functions.invoke("check-payment-status", {
          body: { gateway_ref: ref },
        });

        if (data?.status === "completed") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPaymentStatus("confirmed");
          setShowPixPayment(false);
          setShowSuccess(true);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL);
  };

  const handlePayFee = async () => {
    setShowFeeModal(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-pix", {
        body: { amount: FEE_AMOUNT, wantBonus: false },
      });

      if (error) throw error;

      const txId = data?.transaction_id || "";
      const pixBrcode = data?.brcode || "";

      setBrcode(pixBrcode || "pix-code-placeholder");
      setGatewayRef(txId);
      setShowPixPayment(true);

      if (txId) startPolling(txId);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao gerar QR Code da taxa", variant: "destructive" });
      setBrcode("pix-code-placeholder");
      setShowPixPayment(true);
    } finally {
      setLoading(false);
    }
  };

  const copyBrcode = () => {
    if (brcode) {
      navigator.clipboard.writeText(brcode);
      toast({ title: "Copiado!" });
    }
  };

  const remainingMinutes = Math.max(0, Math.ceil((MAX_POLLS - pollCount) * POLL_INTERVAL / 60000));

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
                R$ {requestedAmount.toFixed(2).replace(".", ",")}
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

  if (showPixPayment) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border">
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Taxa de Liberação</h1>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Pague a taxa de <span className="text-primary font-bold">R$ {FEE_AMOUNT.toFixed(2).replace(".", ",")}</span> para liberar seu saque
            </p>

            <div className="space-y-4 text-center">
              <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center p-2">
                {brcode && brcode !== "pix-code-placeholder" ? (
                  <QRCodeSVG value={brcode} size={176} />
                ) : (
                  <p className="text-background text-xs">QR Code PIX</p>
                )}
              </div>

              {paymentStatus === "waiting" && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Aguardando pagamento... ({remainingMinutes} min restantes)
                  </p>
                </div>
              )}

              {paymentStatus === "expired" && (
                <p className="text-sm text-destructive font-medium">
                  Tempo expirado. Tente novamente.
                </p>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">PIX Copia e Cola:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={brcode || ""}
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs"
                  />
                  <button
                    onClick={copyBrcode}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (pollRef.current) clearInterval(pollRef.current);
                  setShowPixPayment(false);
                  setBrcode(null);
                  setGatewayRef(null);
                  setPaymentStatus(null);
                  setPollCount(0);
                }}
                className="text-sm text-muted-foreground hover:underline"
              >
                Cancelar
              </button>
            </div>
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

      {/* Fee Modal */}
      <Dialog open={showFeeModal} onOpenChange={setShowFeeModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-foreground">
              Taxa de Liberação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Withdrawal amount display */}
            <div
              className="w-full py-4 rounded-xl text-center"
              style={{
                background: "linear-gradient(135deg, hsl(120, 100%, 35%), hsl(120, 100%, 25%))",
              }}
            >
              <p className="text-2xl font-bold text-white">
                R$ {requestedAmount.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm text-white/70">Valor do saque</p>
            </div>

            {/* Fee explanation */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Para liberar o saque imediato para sua chave PIX, há uma taxa de{" "}
                <span className="text-primary font-bold">R$ {FEE_AMOUNT.toFixed(2).replace(".", ",")}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Assim que efetuado, seu dinheiro cairá <strong className="text-foreground">imediatamente</strong> na sua conta.
              </p>
            </div>

            {/* Action buttons */}
            <button
              onClick={handlePayFee}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white hover:brightness-110 transition-all"
              style={{
                background: "linear-gradient(135deg, hsl(120, 100%, 35%), hsl(120, 100%, 25%))",
              }}
            >
              Liberar meu saque - R$ {FEE_AMOUNT.toFixed(2).replace(".", ",")}
            </button>

            <button
              onClick={() => setShowFeeModal(false)}
              className="w-full py-3 rounded-xl font-bold text-sm text-foreground bg-secondary border border-border hover:bg-secondary/80 transition-all"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Withdraw;
