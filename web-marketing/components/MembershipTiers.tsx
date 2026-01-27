"use client";

import { motion } from "framer-motion";
import { tiers } from "@/data/tiers";

export default function MembershipTiers() {
  return (
    <section id="tiers" className="py-24 px-6 bg-[rgb(var(--bg-glass)_/_0.2)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Experience
          </h2>
          <p className="text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto">
            From essential support to white-glove luxury, find the perfect tier for your organization
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative group ${tier.featured ? 'md:scale-105' : ''}`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`relative overflow-hidden rounded-2xl bg-[rgb(var(--bg-glass))] border p-8 transition-all duration-300 ${
                tier.featured
                  ? 'border-[rgb(var(--accent-primary)_/_0.5)] hover:border-[rgb(var(--accent-primary))]'
                  : 'border-[rgb(var(--border-glass)_/_0.1)] hover:border-[rgb(var(--accent-primary)_/_0.3)]'
              }`}>
                {/* Animated gradient border for featured tier */}
                {tier.featured && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl p-[2px] bg-gradient-to-r from-[rgb(var(--accent-primary))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-primary))] bg-[length:200%_100%] animate-gradient-shift">
                    <div className="absolute inset-[2px] bg-[rgb(var(--bg-glass))] rounded-2xl" />
                  </div>
                )}

                {/* Glow effect */}
                {tier.featured && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--glow-purple)_/_0.2)] to-[rgb(var(--glow-blue)_/_0.2)] rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-[rgb(var(--text-secondary))] mb-4">{tier.tagline}</p>
                  <p className="text-3xl font-bold mb-8">{tier.price}</p>

                  <ul className="space-y-4 mb-8">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 text-[rgb(var(--accent-primary))] flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-[rgb(var(--text-secondary))]">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#concierge"
                    className={`block w-full py-3 rounded-full text-center font-semibold transition-all ${
                      tier.featured
                        ? 'bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white hover:scale-105'
                        : 'border border-[rgb(var(--border-glass)_/_0.2)] hover:bg-[rgb(var(--bg-glass)_/_0.5)]'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
