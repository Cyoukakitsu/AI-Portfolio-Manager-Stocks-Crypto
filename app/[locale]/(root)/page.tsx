import { NavBar } from "@/features/hero/components/nav-bar";
import { HeroSection } from "@/features/hero/components/hero-section";
import { FeaturesSection } from "@/features/hero/components/features-section";
import { FooterSection } from "@/features/hero/components/footer-section";

export default function Home() {
  return (
    <main>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <FooterSection />
    </main>
  );
}
