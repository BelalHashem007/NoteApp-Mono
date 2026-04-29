import NavComponent from "./components/NavComponent";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import TechnicalHighlightsSection from "./components/TechnicalHighlightsSection";
import FooterSection from "./components/FooterSection";

export default function LandingPageView() {
  return (
    <main className="min-h-screen bg-neutral text-foreground dark:bg-background">
      <NavComponent />
      <HeroSection />
      <FeaturesSection />
      <TechnicalHighlightsSection />
      <FooterSection />
    </main>
  );
}
