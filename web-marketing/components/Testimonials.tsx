"use client";

import { motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto">
            See what our clients have to say about their CoachDesk experience
          </p>
        </motion.div>

        {/* Desktop: 3 columns, Mobile: horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-[rgb(var(--bg-glass)_/_0.5)] border border-[rgb(var(--border-glass)_/_0.1)] hover:border-[rgb(var(--accent-primary)_/_0.3)] transition-all"
            >
              <p className="text-[rgb(var(--text-secondary))] mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  {testimonial.role}
                </p>
                <p className="text-sm text-[rgb(var(--accent-primary))]">
                  {testimonial.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex gap-6" style={{ width: `${testimonials.length * 320}px` }}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 p-6 rounded-2xl bg-[rgb(var(--bg-glass)_/_0.5)] border border-[rgb(var(--border-glass)_/_0.1)]"
              >
                <p className="text-[rgb(var(--text-secondary))] mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-[rgb(var(--accent-primary))]">
                    {testimonial.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
