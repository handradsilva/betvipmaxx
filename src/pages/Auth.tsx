import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const ref = searchParams.get("ref") || "";
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await signUp(email, password, phone, cpf, ref);
        if (error) {
          toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Conta criada com sucesso!", duration: 1000 });
          navigate("/deposit");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Login realizado!", duration: 1000 });
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border">
          <div className="text-center mb-6">
            <img src="/images/logo.avif" alt="VIPBetMax" className="h-10 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">
              {isRegister ? "Criar conta" : "Entrar na conta"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRegister ? "Preencha os dados para criar sua conta" : "Entre com suas credenciais para continuar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                required
                minLength={6}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Chave PIX para saques (CPF)</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm neon-glow hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "Aguarde..." : isRegister ? "Cadastrar" : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isRegister ? (
              <>
                Já tem conta?{" "}
                <Link to="/auth?mode=login" className="text-primary hover:underline font-medium">
                  Entrar
                </Link>
              </>
            ) : (
              <>
                Não tem conta?{" "}
                <Link to="/auth?mode=register" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
