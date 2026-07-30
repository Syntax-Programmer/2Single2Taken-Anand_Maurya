import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { ServiceCards } from "@/components/landing/service-cards";
import { TrustStrip } from "@/components/landing/trust-strip";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServiceCards />
        <TrustStrip />
      </main>
      <Footer />
    </>
  );
}
