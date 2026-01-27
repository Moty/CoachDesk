"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8 },
      };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury concierge background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-primary)_/_0.3)] via-[rgb(var(--bg-primary)_/_0.8)] to-[rgb(var(--accent-secondary)_/_0.3)]" />
      </div>

      {/* Aurora gradient blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-[rgb(var(--glow-purple)_/_0.4)] to-[rgb(var(--glow-blue)_/_0.4)] blur-3xl opacity-50 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.h1
          {...motionProps}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[rgb(var(--text-primary))] to-[rgb(var(--accent-primary))] bg-clip-text text-transparent"
        >
          Luxury Redefined
        </motion.h1>
        
        <motion.p
          {...motionProps}
          className="text-xl md:text-2xl text-[rgb(var(--text-secondary))] mb-12 max-w-3xl mx-auto"
        >
          Experience white-glove concierge services powered by cutting-edge technology. From SLA intelligence to secure automation, we deliver excellence at every touchpoint.
        </motion.p>

        <motion.div
          {...motionProps}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          {/* Primary CTA with gradient border */}
          <a
            href="#concierge"
            className="group relative px-8 py-4 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent-primary))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-primary))] bg-[length:200%_100%] animate-gradient-shift" />
            <div className="absolute inset-[2px] bg-[rgb(var(--bg-primary))] rounded-full" />
            <span className="relative z-10 font-semibold bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all">
              Request Itinerary
            </span>
          </a>

          {/* Secondary CTA */}
          <a
            href="#destinations"
            className="px-8 py-4 rounded-full border border-[rgb(var(--border-glass)_/_0.2)] backdrop-blur-sm hover:bg-[rgb(var(--bg-glass)_/_0.5)] transition-all font-semibold"
          >
            Explore Destinations
          </a>
        </motion.div>
      </div>
    </section>
  );
}
