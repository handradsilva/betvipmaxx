import { Link } from "react-router-dom";
import { X, Gift, Trophy, Gamepad2, Dice5, Video, Flame, ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { useState } from "react";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

const sidebarGames = [
  "Fortune Dragon", "Cash Mania", "Wild Ape", "Fortune Tiger",
  "Fortune Ox", "Fortune Mouse", "Fortune Rabbit", "Crash Games",
  "Lightning Roulette", "Aviador", "Gates of Olympus", "Baccarat",
];

const AppSidebar = ({ open, onClose }: AppSidebarProps) => {
  const [casinoOpen, setCasinoOpen] = useState(true);
  const [sportsOpen, setSportsOpen] = useState(false);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 z-40 w-60 bg-card border-r border-border overflow-y-auto transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 space-y-2">
          {/* CTA Button */}
          <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm neon-glow hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <Gift size={18} />
            Ganhe R$ 10,00 grátis 💥
          </button>

          {/* Sports section */}
          <div>
            <button
              onClick={() => setSportsOpen(!sportsOpen)}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <Trophy size={16} className="text-primary" />
                ESPORTES
              </span>
              {sportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {sportsOpen && (
              <div className="pl-8 space-y-1">
                <Link to="/sports" className="block py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Todos os esportes
                </Link>
              </div>
            )}
          </div>

          {/* Casino section */}
          <div>
            <button
              onClick={() => setCasinoOpen(!casinoOpen)}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <Dice5 size={16} className="text-primary" />
                CASSINO
              </span>
              {casinoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {casinoOpen && (
              <div className="pl-4 space-y-0.5">
                <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Gamepad2 size={14} /> Todos os jogos
                </Link>
                <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Dice5 size={14} /> Jogos Slots
                </Link>
                <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Video size={14} /> Cassino Ao Vivo
                </Link>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="border-t border-border pt-3">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <MessageCircle size={14} className="text-primary" /> Suporte Whatsapp
            </a>
          </div>

          {/* Popular games */}
          <div className="border-t border-border pt-3">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Populares</p>
            <div className="space-y-0.5">
              {sidebarGames.map((game) => (
                <Link
                  key={game}
                  to="/"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Flame size={12} className="text-primary" />
                  {game}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
