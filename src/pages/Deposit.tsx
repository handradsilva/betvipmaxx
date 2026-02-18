import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const presetValues = [
  { label: "R$ 30", value: 30 },
  { label: "Popular🔥 R$ 50", value: 50 },
  { label: "R$ 100", value: 100 },
];

const Deposit = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [wantBonus, setWantBonus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [brcode, setBrcode] = useState<string | null>(null);

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const handleGenerate = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);

    try {
      // Call edge function for BS Pay integration
      const { data, error } = await supabase.functions.invoke("generate-pix", {
        body: { amount: val, wantBonus },
      });

      if (error) throw error;

      if (data?.qrcode_image) {
        setQrCode(data.qrcode_image);
        setBrcode(data.brcode || "");
      } else {
        // Fallback placeholder for now
        setQrCode("placeholder");
        setBrcode("pix-code-placeholder");
        toast({ title: "QR Code gerado", description: "Integração BS Pay será configurada em breve." });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao gerar QR Code", variant: "destructive" });
      // Show placeholder anyway for demo
      setQrCode("placeholder");
      setBrcode("pix-code-placeholder");
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

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
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
                    min="1"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {presetValues.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setAmount(String(value))}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                      amount === String(value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-foreground border-border hover:border-primary"
                    }`}
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
                disabled={loading || !amount}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm neon-glow hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Gerando..." : "Gerar QR Code"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-48 h-48 mx-auto bg-foreground rounded-lg flex items-center justify-center">
                {qrCode === "placeholder" ? (
                  <p className="text-background text-xs">QR Code PIX</p>
                ) : (
                  <img src={qrCode} alt="QR Code PIX" className="w-full h-full object-contain p-2" />
                )}
              </div>
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
                onClick={() => { setQrCode(null); setBrcode(null); setAmount(""); }}
                className="text-sm text-primary hover:underline"
              >
                Fazer outro depósito
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Deposit;
