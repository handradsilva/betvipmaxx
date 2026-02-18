import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, Wallet, Download, Upload, Users, Key, LogOut } from "lucide-react";

interface HeaderProps {
  isLoggedIn: boolean;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ isLoggedIn, onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-3 md:px-6 bg-background border-b border-border">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/">
          <img src="/images/logo.avif" alt="VIPBetMax" className="h-8 md:h-9" />
        </Link>
      </div>

      {/* Center - Nav tabs */}
      <nav className="hidden md:flex items-center gap-1 ml-6">
        <Link to="/" className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">
          CASSINO
        </Link>
        <Link to="/sports" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          ESPORTES
        </Link>
      </nav>

      {/* Search */}
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
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/deposit")}
              className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground neon-glow hover:brightness-110 transition-all"
            >
              Depositar
            </button>
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-surface-hover transition-colors"
              >
                <User size={18} className="text-primary" />
                <span className="hidden md:inline text-sm font-semibold text-primary">R$ 0,00</span>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">usuario@email.com</p>
                          <p className="text-sm font-bold text-primary">Saldo: R$ 0,00</p>
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
                      <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-secondary transition-colors w-full">
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
          <div className="flex items-center gap-2">
            <Link
              to="/auth?mode=login"
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Entrar
            </Link>
            <Link
              to="/auth?mode=register"
              className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground neon-glow hover:brightness-110 transition-all"
            >
              Cadastrar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
