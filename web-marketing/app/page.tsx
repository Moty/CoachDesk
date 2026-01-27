import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Destinations />
      <section id="tiers" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-bold">Membership Tiers</h2>
      </section>
      <section id="testimonials" className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-glass)_/_0.3)]">
        <h2 className="text-3xl font-bold">Testimonials</h2>
      </section>
      <section id="concierge" className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-bold">Request Help</h2>
      </section>
    </main>
  );
}
