import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import MembershipTiers from "@/components/MembershipTiers";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Destinations />
      <MembershipTiers />
      <Testimonials />
      <section id="concierge" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-bold">Request Help</h2>
      </section>
    </main>
  );
}
