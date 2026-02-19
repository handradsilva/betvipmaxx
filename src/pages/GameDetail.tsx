import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { games } from "@/data/games";
import { ArrowLeft, Wallet, Maximize2, Star, Users } from "lucide-react";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = games.find((g) => g.id === id);

  const players = useMemo(() => (Math.random() * 5 + 1).toFixed(1), []);
  const rtp = useMemo(() => (95 + Math.random() * 3).toFixed(1), []);

  if (!game) {
    navigate("/");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Voltar
        </button>

        {/* Game Info */}
        <div className="flex items-center gap-3">
          <img src={game.image} alt={game.name} className="w-12 h-12 rounded-xl object-cover" />
          <div>
            <h1 className="text-base font-bold text-foreground">{game.name}</h1>
            <p className="text-xs text-muted-foreground">{game.provider}</p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-primary"><Star size={11} /> 4.8</span>
              <span className="flex items-center gap-1"><Users size={11} /> {players}k jogando</span>
            </div>
          </div>
        </div>

        {/* Game Screen - Balance Required */}
        <div className="w-full rounded-2xl bg-card border border-border p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Wallet size={28} className="text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Necessário Saldo para Jogar</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Faça um depósito{" "}
            <button onClick={() => navigate("/deposit")} className="text-primary underline hover:brightness-110">clicando aqui</button>
            {" "}ou pelo seu perfil
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs pt-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-all">
              <Maximize2 size={16} /> Tela Cheia
            </button>
            <button
              onClick={() => navigate("/deposit")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all neon-glow"
            >
              <Wallet size={16} /> Fazer Depósito
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "RTP", value: `${rtp}%` },
            { label: "Volatilidade", value: "Alta" },
            { label: "Aposta Mín.", value: "R$ 0,20" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 sm:p-4 rounded-xl bg-card border border-border text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xs sm:text-sm font-bold text-primary mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GameDetail;
