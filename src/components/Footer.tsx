import { ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border mt-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/images/logo.avif" alt="VIPBetMax" className="h-8 sm:h-10" />
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 sm:gap-4 mb-6 text-xs sm:text-sm text-muted-foreground">
          {["Termos de uso", "Termos de apostas", "Política AML", "Política de privacidade", "Jogo responsável", "Seja um afiliado"].map((link) => (
            <a key={link} href="#" className="hover:text-primary transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Payment method */}
        <div className="flex justify-center mb-6">
          <div className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-bold text-foreground">
            PIX
          </div>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-6">
          {[
            { name: "Instagram", icon: "📸", url: "#" },
            { name: "YouTube", icon: "▶️", url: "#" },
            { name: "Telegram", icon: "✈️", url: "#" },
          ].map(({ name, icon, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center text-base sm:text-lg hover:bg-primary hover:text-primary-foreground transition-all"
              title={name}
            >
              {icon}
            </a>
          ))}
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 text-[10px] sm:text-xs text-muted-foreground">
          <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-secondary border border-border">BeGambleAware</span>
          <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-secondary border border-border">Gordon Moody</span>
          <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-secondary border border-border">🔒 SSL Seguro</span>
          <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-secondary border border-border">18+</span>
        </div>

        {/* Language selector */}
        <div className="flex justify-center mb-6">
          <select className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>

        {/* Copyright */}
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground">
          © 2024 VIPBetMax. Todos os direitos reservados. | Jogue com responsabilidade.
        </p>

        {/* Back to top */}
        <div className="flex justify-center mt-6">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ArrowUp size={14} />
            Voltar ao topo
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
