"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { destinations } from "@/data/destinations";

export default function Destinations() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section id="destinations" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Journey Awaits
          </h2>
          <p className="text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto">
            Explore our suite of premium capabilities designed to elevate your support operations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(destination.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group"
            >
              <Link href={`/destinations/${destination.slug}`}>
                <div className="relative overflow-hidden rounded-2xl bg-[rgb(var(--bg-glass))] border border-[rgb(var(--border-glass)_/_0.1)] transition-all duration-300 hover:border-[rgb(var(--accent-primary)_/_0.5)]">
                  {/* Animated gradient border and glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl p-[2px] bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))]">
                    <div className="absolute inset-[2px] bg-[rgb(var(--bg-glass))] rounded-2xl" />
                  </div>
                  
                  {/* Glow ring */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--glow-purple)_/_0.3)] to-[rgb(var(--glow-blue)_/_0.3)] rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-6 z-10">
                    {/* Image */}
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={destination.image}
                        alt={destination.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {/* Shimmer effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${hoveredCard === destination.id ? 'animate-shimmer' : ''}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-2 transition-colors group-hover:text-[rgb(var(--accent-primary))]">
                      {destination.title}
                    </h3>
                    <p className="text-[rgb(var(--text-secondary))] mb-4">
                      {destination.description}
                    </p>

                    {/* Quick facts - reveal on hover */}
                    <div className={`overflow-hidden transition-all duration-300 ${hoveredCard === destination.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pt-4 border-t border-[rgb(var(--border-glass)_/_0.1)]">
                        <ul className="space-y-2">
                          {destination.quickFacts.map((fact, i) => (
                            <li key={i} className="text-sm text-[rgb(var(--text-secondary))] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-primary))]" />
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
