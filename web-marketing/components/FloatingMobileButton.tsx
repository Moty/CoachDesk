"use client";

export default function FloatingMobileButton() {
  return (
    <a
      href="#concierge"
      className="md:hidden fixed bottom-6 right-6 px-6 py-3 rounded-full bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white font-semibold shadow-lg hover:scale-105 transition-transform z-40"
    >
      Request Help
    </a>
  );
}
