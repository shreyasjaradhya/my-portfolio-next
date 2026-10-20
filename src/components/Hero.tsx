import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";
import type { Profile } from "@/lib/supabase/types";

export default function Hero({ profile }: { profile: Profile | null }) {
  return <PerspectiveTunnelHero profile={profile} />;
}
