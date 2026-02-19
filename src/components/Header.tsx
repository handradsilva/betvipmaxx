import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, Wallet, Download, Upload, Users, Key, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const isLoggedIn = !!user;
  const balance = profile?.balance ?? 0;
  const formattedBalance = `R$ ${balance.toFixed(2).replace(".", ",")}`;

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-14 px-2 sm:px-3 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button onClick={onToggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/">
            <img src="/images/logo.avif" alt="VIPBetMax" className="h-7 sm:h-8 md:h-9" />
          </Link>
        </div>

        {/* Center - Nav tabs (desktop) */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          <Link to="/" className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">
            CASSINO
          </Link>
          <Link to="/sports" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            ESPORTES
          </Link>
        </nav>

        {/* Search (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por um jogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search size={18} />
          </button>

          {isLoggedIn ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                {formattedBalance}
              </span>
              <button
                onClick={() => navigate("/deposit")}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg bg-primary text-primary-foreground neon-glow hover:brightness-110 transition-all whitespace-nowrap"
              >
                Depositar
              </button>
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-secondary hover:bg-surface-hover transition-colors"
                >
                  <User size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm font-semibold text-primary hidden xs:inline">{formattedBalance}</span>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] sm:w-64 max-w-[280px] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 sm:p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <User size={18} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            <p className="text-sm font-bold text-primary">Saldo: {formattedBalance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {[
                          { icon: User, label: "Minha conta", to: "/my-account" },
                          { icon: Wallet, label: "Carteira", to: "/wallet" },
                          { icon: Download, label: "Depositar", to: "/deposit" },
                          { icon: Upload, label: "Sacar", to: "/withdraw" },
                          { icon: Users, label: "Painel de Afiliado", to: "/affiliate" },
                          { icon: Key, label: "Alterar senha", to: "/change-password" },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            <Icon size={16} className="text-muted-foreground" />
                            {label}
                          </Link>
                        ))}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-secondary transition-colors w-full"
                        >
                          <LogOut size={16} />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/auth?mode=login"
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
              >
                Entrar
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg bg-primary text-primary-foreground neon-glow hover:brightness-110 transition-all whitespace-nowrap"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-2 pb-2">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por um jogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Mobile nav tabs */}
      <div className="md:hidden flex border-t border-border">
        <Link to="/" className="flex-1 text-center py-2 text-xs font-semibold bg-primary text-primary-foreground">
          CASSINO
        </Link>
        <Link to="/sports" className="flex-1 text-center py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          ESPORTES
        </Link>
      </div>
    </header>
  );
};

export default Header;
