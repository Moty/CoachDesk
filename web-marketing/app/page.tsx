export default function HomePage() {
  return (
    <main>
      <section id="hero" className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold">CoachDesk Marketing</h1>
      </section>
      <section id="destinations" className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-glass)_/_0.3)]">
        <h2 className="text-3xl font-bold">Destinations</h2>
      </section>
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
