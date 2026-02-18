import { providers } from "@/data/games";

const ProviderSection = () => {
  return (
    <section className="space-y-3">
      <h2 className="text-base sm:text-lg font-bold text-foreground">Provedores</h2>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center justify-center px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer"
          >
            <img src={provider.image} alt={provider.name} className="h-6 sm:h-8 md:h-10 object-contain max-w-full" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProviderSection;
