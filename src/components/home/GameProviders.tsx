import { Link } from "react-router-dom";
import { providers as defaultProviders } from "@/data/homePageMockData";
import type { ProviderShape } from "@/data/homePageMockData";
import { svgToImgSrc } from "@/lib/svg";

interface GameProvidersProps {
  providers?: ProviderShape[] | null;
  sectionTitle?: string;
  sectionSvg?: string;
}

export function GameProviders({ providers: providersProp, sectionTitle, sectionSvg }: GameProvidersProps) {
  const providers = providersProp && providersProp.length > 0 ? providersProp : defaultProviders;

  return (
    <section className="container px-4 py-10">
      <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
        {sectionSvg && <img src={svgToImgSrc(sectionSvg)} alt="" className="h-6 w-6 object-contain" />}
        {sectionTitle ? sectionTitle : <>Trusted <span className="gradient-text-gold">Game Providers</span></>}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Play games from the best providers in the industry</p>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 flex-nowrap -mx-4 px-4">
        {providers.map((p) => (
          <Link
            key={p.id ?? p.name}
            to={p.id != null ? `/providers/${p.id}` : `/games`}
            className="p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-all shrink-0 min-w-[120px] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          >
            {/* Circular irregular shape: organic blob via border-radius */}
            <div
              className="h-14 w-14 flex items-center justify-center text-white font-bold text-sm overflow-hidden"
              style={{
                borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
              }}
            >
              {p.logoImage ? (
                <img
                  src={p.logoImage}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
                />
              ) : (
                <span>{p.logo}</span>
              )}
            </div>
            <span className="font-semibold text-sm text-foreground text-center">{p.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
