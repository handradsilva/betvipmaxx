import { useState } from "react";
import Layout from "@/components/Layout";

const presetValues = [
  { label: "R$ 50", value: 50 },
  { label: "POPULAR R$ 100", value: 100 },
  { label: "R$ 200", value: 200 },
  { label: "R$ 500", value: 500 },
];

const Withdraw = () => {
  const [amount, setAmount] = useState("");
  const balance = 0; // TODO: real balance

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (val < 20) return;
    if (val > balance) return;
    // TODO: process withdrawal
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Sacar</h1>
          <p className="text-center text-sm mb-6">
            <span className="text-muted-foreground">Saldo: </span>
            <span className="font-bold text-primary">R$ {balance.toFixed(2).replace(".", ",")}</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Valor do saque:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                min="20"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {presetValues.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setAmount(String(value))}
                  className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${
                    amount === String(value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Saque mínimo: R$ 20,00</p>
              <p>• O valor será enviado para sua chave PIX cadastrada.</p>
            </div>

            <button
              onClick={handleWithdraw}
              className="w-full py-3 rounded-lg bg-orange-accent text-foreground font-bold text-sm hover:brightness-110 transition-all"
              style={{ backgroundColor: "hsl(30, 90%, 50%)" }}
            >
              Solicitar Saque
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Withdraw;
