import { Star, Flame, Gamepad2, Video, Zap, Dice5 } from "lucide-react";
import BannerCarousel from "@/components/BannerCarousel";
import WinningsTicker from "@/components/WinningsTicker";
import GameSection from "@/components/GameSection";
import ProviderSection from "@/components/ProviderSection";
import Layout from "@/components/Layout";
import { games } from "@/data/games";

const Index = () => {
  const recommended = games.filter((g) => g.category.includes("recomendados"));
  const mostPlayed = games.filter((g) => g.category.includes("mais-jogados"));
  const pgsoft = games.filter((g) => g.category.includes("pgsoft"));
  const pragmaticLive = games.filter((g) => g.category.includes("pragmatic-ao-vivo"));
  const pragmaticPlay = games.filter((g) => g.category.includes("pragmatic-play"));
  const ezugi = games.filter((g) => g.category.includes("ezugi"));
  const crash = games.filter((g) => g.category.includes("crash-games"));

  return (
    <Layout>
      <div className="space-y-6">
        <BannerCarousel />
        <WinningsTicker />

        <GameSection title="Recomendados" games={recommended} icon={<Star size={20} className="text-primary" />} />
        <GameSection title="Mais Jogados" games={mostPlayed} icon={<Flame size={20} className="text-primary" />} />
        <GameSection title="PGSoft" games={pgsoft} icon={<Gamepad2 size={20} className="text-primary" />} />
        <GameSection title="Pragmatic Ao Vivo" games={pragmaticLive} icon={<Video size={20} className="text-primary" />} />
        <GameSection title="Pragmatic Play" games={pragmaticPlay} icon={<Zap size={20} className="text-primary" />} />
        <GameSection title="Ezugi" games={ezugi} icon={<Dice5 size={20} className="text-primary" />} />
        <GameSection title="Crash Games" games={crash} icon={<Flame size={20} className="text-primary" />} />

        <ProviderSection />
      </div>
    </Layout>
  );
};

export default Index;
