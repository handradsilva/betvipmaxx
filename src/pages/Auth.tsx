import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend
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
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
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
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm neon-glow hover:brightness-110 transition-all"
            >
              {isRegister ? "Cadastrar" : "Entrar"}
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
