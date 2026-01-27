"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const navLinks = [
    { href: "#destinations", label: "Destinations" },
    { href: "#tiers", label: "Membership" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#concierge", label: "Request Help" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[rgb(var(--bg-glass)_/_0.8)] border-b border-[rgb(var(--border-glass)_/_0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a 
          href="#" 
          className="text-2xl font-bold bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent"
        >
          CoachDesk
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                activeSection === link.href.slice(1)
                  ? "text-[rgb(var(--accent-primary))]"
                  : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
              }`}
            >
              {link.label}
            </a>
          ))}
          
          <a
            href="#concierge"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white font-medium text-sm transition-transform hover:scale-105"
          >
            Request Itinerary
          </a>
        </div>
      </div>
    </nav>
  );
}
