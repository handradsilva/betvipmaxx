import type { Game } from "@/data/games";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <div className="group relative rounded-xl overflow-hidden game-card-hover cursor-pointer bg-card">
      <div className="aspect-square overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-foreground font-bold text-sm mb-2 text-center px-2">{game.name}</p>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold neon-glow hover:brightness-110 transition-all">
          JOGAR AGORA!
        </button>
      </div>
      {/* Name below */}
      <div className="p-2">
        <p className="text-xs text-muted-foreground truncate">{game.name}</p>
      </div>
    </div>
  );
};

export default GameCard;
