export interface Tier {
  id: string;
  name: string;
  tagline: string;
  price: string;
  featured: boolean;
  benefits: string[];
}

export const tiers: Tier[] = [
  {
    id: "silver",
    name: "Silver",
    tagline: "Essential Support",
    price: "Contact for pricing",
    featured: false,
    benefits: [
      "Multi-channel support",
      "Standard SLA monitoring",
      "Knowledge base access",
      "Monthly reporting",
      "Business hours support"
    ]
  },
  {
    id: "black",
    name: "Black",
    tagline: "Premium Experience",
    price: "Contact for pricing",
    featured: true,
    benefits: [
      "Everything in Silver",
      "Priority response times",
      "Advanced automation",
      "24/7 support coverage",
      "Dedicated account manager",
      "Custom integrations"
    ]
  },
  {
    id: "obsidian",
    name: "Obsidian",
    tagline: "White-Glove Luxury",
    price: "Contact for pricing",
    featured: false,
    benefits: [
      "Everything in Black",
      "Instant response guarantee",
      "Bespoke workflow design",
      "Executive concierge services",
      "Quarterly strategy sessions",
      "Priority feature development"
    ]
  }
];
