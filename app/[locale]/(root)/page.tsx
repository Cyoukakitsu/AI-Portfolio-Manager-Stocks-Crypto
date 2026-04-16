import { NavBar } from "@/features/hero/components/nav-bar";
import { HeroSection } from "@/features/hero/components/hero-section";
import { StatsBar } from "@/features/hero/components/stats-bar";
import { AgentAvatars } from "@/features/hero/components/agent-avatars";
import { FeaturesSection } from "@/features/hero/components/features-section";
import { CTASection } from "@/features/hero/components/cta-section";
import { FooterSection } from "@/features/hero/components/footer-section";

export default function Home() {
  return (
    <main>
      <NavBar />
      <HeroSection />
      <StatsBar />
      <AgentAvatars />
      <FeaturesSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
