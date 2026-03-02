import { Link } from "react-router-dom";
import { providers as defaultProviders } from "@/data/homePageMockData";
import type { ProviderShape } from "@/data/homePageMockData";
import { getMediaUrl } from "@/lib/api";
import { Building2 } from "lucide-react";

function sectionIconSrc(value: string): string {
  return value.trim().startsWith("http") ? value.trim() : getMediaUrl(value.trim());
}

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
        {sectionSvg?.trim()
          ? <img src={sectionIconSrc(sectionSvg)} alt="" className="h-6 w-6 object-contain" />
          : <Building2 className="h-6 w-6 text-primary" />
        }
        {sectionTitle ? sectionTitle : <>Trusted <span className="gradient-text-gold">Game Providers</span></>}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Play games from the best providers in the industry</p>
      <div className="grid grid-cols-3 gap-2 pb-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {providers.map((p) => (
          <Link
            key={p.id ?? p.name}
            to={p.single_game_id != null && p.single_game_id > 0 ? `/games/${p.single_game_id}/play` : (p.id != null ? `/providers/${p.id}` : `/games`)}
            className="p-2 md:p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-all min-w-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
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
