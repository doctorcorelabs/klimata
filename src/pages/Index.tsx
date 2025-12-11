import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { RiskSection } from "@/components/RiskSection";
import { ActionSection } from "@/components/ActionSection";
import { Footer } from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RiskSection />
        <ActionSection />
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
