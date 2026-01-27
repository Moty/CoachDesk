import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import MembershipTiers from "@/components/MembershipTiers";
import Testimonials from "@/components/Testimonials";
import ConciergeForm from "@/components/ConciergeForm";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Destinations />
      <MembershipTiers />
      <Testimonials />
      <ConciergeForm />
    </main>
  );
}
