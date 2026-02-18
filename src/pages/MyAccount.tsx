import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone, Mail, CreditCard, Calendar } from "lucide-react";

const MyAccount = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const items = [
    { icon: Mail, label: "E-mail", value: user.email || "—" },
    { icon: Phone, label: "Telefone", value: profile?.phone || "Não informado" },
    { icon: CreditCard, label: "CPF", value: profile?.cpf || "Não informado" },
    { icon: CreditCard, label: "Chave PIX", value: profile?.pix_key || "Não informada" },
    { icon: Calendar, label: "Data de registro", value: createdAt },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
              <User size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Minha Conta</h1>
          </div>

          <div className="space-y-3">
            {items.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <Icon size={18} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground break-all">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
