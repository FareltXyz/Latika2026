import { CtaSection } from "@/components/cta-section";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/navbar";
import { Stats } from "@/components/stats";
import { getCurrentUserId } from "@/lib/auth";

export default async function Home() {
  const userId = await getCurrentUserId();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Navbar isAuthenticated={Boolean(userId)} />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
