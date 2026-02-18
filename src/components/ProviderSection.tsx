import { providers } from "@/data/games";

const ProviderSection = () => {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Provedores</h2>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center justify-center px-6 py-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer"
          >
            <img src={provider.image} alt={provider.name} className="h-8 md:h-10 object-contain" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProviderSection;
