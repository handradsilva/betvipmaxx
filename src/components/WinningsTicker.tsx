import { winningEntries } from "@/data/games";
import { Trophy } from "lucide-react";

const WinningsTicker = () => {
  return (
    <div className="w-full overflow-hidden bg-secondary/50 rounded-lg sm:rounded-xl py-2 sm:py-3">
      <div className="flex items-center gap-2 px-3 sm:px-4 mb-2">
        <Trophy size={14} className="text-primary sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-bold text-foreground">Top Ganhos</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-3 sm:gap-4 animate-marquee whitespace-nowrap">
          {[...winningEntries, ...winningEntries].map((entry, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-card border border-border"
            >
              <span className="text-[10px] sm:text-xs text-muted-foreground">{entry.user}</span>
              <span className="text-[10px] sm:text-xs text-foreground font-medium">{entry.game}</span>
              <span className="text-[10px] sm:text-xs font-bold text-primary">{entry.amount}</span>
            </div>
          ))}
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
