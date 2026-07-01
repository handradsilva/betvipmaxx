import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const presetValues = [
  { label: "R$ 30", value: 30, border: "2px" },
  { label: "🔥 R$ 50", value: 50, border: "3px" },
  { label: "R$ 100", value: 100, border: "4px" },
];

const POLL_INTERVAL = 5000;
const MAX_POLLS = 120; // 10 minutes

const sanitizeCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const formatCpf = (value: string) => {
  const digits = sanitizeCpf(value);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const Deposit = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [cpf, setCpf] = useState(profile?.cpf ?? "");
  const [wantBonus, setWantBonus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [brcode, setBrcode] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [_gatewayRef, setGatewayRef] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "confirmed" | "expired" | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (profile?.cpf && !cpf) {
      setCpf(profile.cpf);
    }
  }, [profile?.cpf, cpf]);

  // Stop polling if user logs out
  useEffect(() => {
    if (!user && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [user]);

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const profileCpf = sanitizeCpf(profile?.cpf ?? "");
  const inputCpf = sanitizeCpf(cpf);
  const effectiveCpf = inputCpf.length === 11 ? inputCpf : profileCpf;
  const needsCpf = profileCpf.length !== 11;

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
          await refreshProfile();
          toast({ title: "✅ Pagamento confirmado!", description: "Seu saldo foi atualizado." });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL);
  };

  const handleGenerate = async () => {
    const val = parseFloat(amount);
    if (!val || val < 20) {
      toast({ title: "Valor mínimo", description: "O depósito mínimo é de R$ 20,00.", variant: "destructive" });
      return;
    }

    if (effectiveCpf.length !== 11) {
      toast({
        title: "CPF obrigatório",
        description: "Informe um CPF válido para gerar o PIX do depósito.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      if (inputCpf.length === 11 && inputCpf !== profileCpf) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ cpf: inputCpf })
          .eq("user_id", user.id);

        if (profileError) {
          throw new Error("Não foi possível salvar seu CPF para o depósito.");
        }

        await refreshProfile();
      }

      const { data, error } = await supabase.functions.invoke("generate-pix", {
        body: { amount: val, wantBonus, cpf: effectiveCpf },
      });

      if (error) {
        let errorMessage = "Erro ao gerar QR Code";

        try {
          const errorData = await error.context.json();
          errorMessage = errorData?.error || errorMessage;
        } catch {
          errorMessage = error.message || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const txId = data?.transaction_id || "";
      const pixBrcode = data?.brcode || "";

      if (data?.provider_unavailable) {
        setPaymentError(data?.error || "O provedor de pagamento está temporariamente indisponível. Tente novamente em instantes.");
        return;
      }

      if (!pixBrcode) {
        throw new Error("O gateway não retornou o PIX copia e cola.");
      }

      setQrCode(data?.qrcode_image || "generated");
      setBrcode(pixBrcode);
      setGatewayRef(txId);
      if (txId) startPolling(txId);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao gerar QR Code", variant: "destructive" });
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

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setQrCode(null);
    setBrcode(null);
    setPaymentError(null);
    setGatewayRef(null);
    setPaymentStatus(null);
    setPollCount(0);
    setAmount("");
  };

  const remainingMinutes = Math.max(0, Math.ceil((MAX_POLLS - pollCount) * POLL_INTERVAL / 60000));

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <img
          src="/images/deposit-banner.webp"
          alt="Área de depósito - 100% de bônus no primeiro depósito"
          className="w-full max-w-md rounded-2xl object-cover"
        />
        <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Depositar</h1>

          {!qrCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Valor do depósito: *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    min="20"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              {needsCpf && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">CPF do pagador: *</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    O gateway PIX exige um CPF válido do titular para gerar o QR Code e o copia e cola.
                  </p>
                </div>
              )}

              {paymentError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {paymentError}
                </div>
              )}

              <div className="flex gap-2">
                {presetValues.map(({ label, value, border }) => (
                  <button
                    key={value}
                    onClick={() => setAmount(String(value))}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      amount === String(value)
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-foreground hover:bg-primary/10"
                    }`}
                    style={{
                      border: `${border} solid hsl(var(--primary))`,
                      boxShadow: amount === String(value)
                        ? "0 0 12px hsl(var(--primary) / 0.5)"
                        : "0 0 6px hsl(var(--primary) / 0.2)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantBonus}
                  onChange={(e) => setWantBonus(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground">Quero receber o bônus de depósito</span>
              </label>

              <button
                onClick={handleGenerate}
                disabled={loading || !amount || effectiveCpf.length !== 11}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm neon-glow hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Gerando..." : "Gerar QR Code"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              {paymentStatus === "confirmed" ? (
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-xl font-bold text-green-400">Pagamento Confirmado!</h2>
                  <p className="text-sm text-muted-foreground">
                    Seu saldo foi atualizado: <span className="font-bold text-foreground">R$ {profile?.balance?.toFixed(2)}</span>
                  </p>
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all"
                  >
                    Fazer outro depósito
                  </button>
                </div>
              ) : (
                <>
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
                      Tempo expirado. Gere um novo QR Code.
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
                    onClick={handleReset}
                    className="text-sm text-primary hover:underline"
                  >
                    Fazer outro depósito
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Deposit;
