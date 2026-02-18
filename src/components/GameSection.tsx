import { ChevronRight } from "lucide-react";
import GameCard from "./GameCard";
import type { Game } from "@/data/games";

interface GameSectionProps {
  title: string;
  games: Game[];
  icon?: React.ReactNode;
}

const GameSection = ({ title, games, icon }: GameSectionProps) => {
  if (games.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
          {icon}
          {title}
        </h2>
        <button className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline font-medium whitespace-nowrap">
          Ver todos <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
        {games.slice(0, 6).map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
};

export default GameSection;
