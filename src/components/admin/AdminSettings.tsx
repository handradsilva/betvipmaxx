import { Settings, Webhook, DollarSign, Shield, Bell } from "lucide-react";

const AdminSettings = () => {
  const sections = [
    { icon: Webhook, label: "Webhooks", desc: "Configurar endpoints de webhook para notificações" },
    { icon: DollarSign, label: "Limites de Depósito", desc: "Definir depósito mínimo e máximo" },
    { icon: Shield, label: "Segurança", desc: "Configurações de autenticação e segurança" },
    { icon: Bell, label: "Notificações", desc: "Gerenciar notificações do sistema" },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Settings size={16} className="text-primary" /> Configurações
      </h3>
      <p className="text-xs text-muted-foreground">Estas funcionalidades estarão disponíveis em breve.</p>

      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 opacity-60 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <s.icon size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">Em breve</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
