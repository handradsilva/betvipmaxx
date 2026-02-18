import { winningEntries, games } from "@/data/games";
import { Trophy } from "lucide-react";

const getGameImage = (gameName: string): string | null => {
  const game = games.find(
    (g) => g.name.toLowerCase() === gameName.toLowerCase() ||
           gameName.toLowerCase().includes(g.name.toLowerCase())
  );
  return game?.image ?? null;
};

const WinningsTicker = () => {
  return (
    <div className="w-full overflow-hidden bg-secondary/50 rounded-lg sm:rounded-xl py-3 sm:py-4">
      <div className="flex items-center gap-2 px-3 sm:px-4 mb-2.5">
        <Trophy size={16} className="text-primary sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base font-bold text-foreground">Top Ganhos</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-3 sm:gap-4 animate-marquee whitespace-nowrap">
          {[...winningEntries, ...winningEntries].map((entry, i) => {
            const img = getGameImage(entry.game);
            return (
              <div
                key={i}
                className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-card border border-border"
              >
                {img && (
                  <img
                    src={img}
                    alt={entry.game}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <span className="text-xs sm:text-sm text-muted-foreground">{entry.user}</span>
                <span className="text-xs sm:text-sm text-foreground font-medium">{entry.game}</span>
                <span className="text-xs sm:text-sm font-bold text-primary">{entry.amount}</span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WinningsTicker;
