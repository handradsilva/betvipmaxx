import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { games } from "@/data/games";
import { ArrowLeft, Wallet, Maximize2, Star, Users } from "lucide-react";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = games.find((g) => g.id === id);

  if (!game) {
    navigate("/");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        {/* Back + Game Info */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex items-center gap-4">
          <img src={game.image} alt={game.name} className="w-14 h-14 rounded-xl object-cover" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{game.name}</h1>
            <p className="text-xs text-muted-foreground">{game.provider}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-primary"><Star size={12} /> 4.8</span>
              <span className="flex items-center gap-1"><Users size={12} /> {(Math.random() * 5 + 1).toFixed(1)}k jogando</span>
            </div>
          </div>
        </div>

        {/* Game Screen Area */}
        <div className="relative w-full aspect-video max-h-[60vh] rounded-2xl bg-card border border-border overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <div className="relative z-10 flex flex-col items-center gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Wallet size={32} className="text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Necessário Saldo para Jogar</h2>
            <p className="text-sm text-muted-foreground">
              Faça um depósito{" "}
              <button onClick={() => navigate("/deposit")} className="text-primary underline hover:brightness-110">clicando aqui</button>
              {" "}ou pelo seu perfil
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-xs">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-all"
              >
                <Maximize2 size={16} /> Tela Cheia
              </button>
              <button
                onClick={() => navigate("/deposit")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all neon-glow"
              >
                <Wallet size={16} /> Fazer Depósito
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "RTP", value: `${(95 + Math.random() * 3).toFixed(1)}%` },
            { label: "Volatilidade", value: "Alta" },
            { label: "Aposta Mín.", value: "R$ 0,20" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-bold text-primary mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GameDetail;
