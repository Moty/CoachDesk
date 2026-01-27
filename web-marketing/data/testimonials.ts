export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Chen",
    role: "VP of Customer Success",
    company: "TechVenture Inc.",
    quote: "CoachDesk transformed our support operations. The SLA intelligence alone has saved us countless hours and prevented dozens of potential breaches."
  },
  {
    id: "t2",
    name: "Marcus Williams",
    role: "Head of Operations",
    company: "Global Solutions Ltd.",
    quote: "The white-glove service is unmatched. Our dedicated account manager feels like an extension of our team, not just a vendor."
  },
  {
    id: "t3",
    name: "Elena Rodriguez",
    role: "CTO",
    company: "InnovateCorp",
    quote: "Security and automation working in harmony - exactly what enterprise needs. The audit trails give us complete peace of mind."
  },
  {
    id: "t4",
    name: "James Peterson",
    role: "Customer Experience Director",
    company: "Apex Enterprises",
    quote: "Switching to CoachDesk was seamless. The knowledge nexus has become our single source of truth, and our team couldn't be happier."
  },
  {
    id: "t5",
    name: "Priya Sharma",
    role: "Support Manager",
    company: "CloudScale Systems",
    quote: "The incident command center is a game-changer. We've reduced our mean time to resolution by 40% in just three months."
  },
  {
    id: "t6",
    name: "David Kim",
    role: "CEO",
    company: "Nexus Innovations",
    quote: "From Silver to Obsidian, every tier delivers exceptional value. The ROI is clear - our customer satisfaction scores have never been higher."
  }
];
