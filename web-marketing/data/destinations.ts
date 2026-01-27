export interface Destination {
  id: string;
  title: string;
  description: string;
  image: string;
  quickFacts: string[];
  slug: string;
}

export const destinations: Destination[] = [
  {
    id: "omni-channel",
    title: "Omni-Channel Concierge",
    description: "Seamless support across every touchpoint - email, chat, voice, and social. Your customers choose how they connect, we ensure excellence everywhere.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    quickFacts: [
      "Unified inbox across all channels",
      "Real-time channel switching",
      "Context preservation"
    ],
    slug: "omni-channel-concierge"
  },
  {
    id: "sla-intelligence",
    title: "SLA Intelligence",
    description: "Proactive monitoring and predictive analytics keep you ahead of SLA breaches. Smart escalations ensure critical issues get immediate attention.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    quickFacts: [
      "Real-time SLA tracking",
      "Predictive breach alerts",
      "Automated escalations"
    ],
    slug: "sla-intelligence"
  },
  {
    id: "incident-command",
    title: "Incident Command",
    description: "Orchestrate critical incidents with military precision. Automated workflows, stakeholder coordination, and post-incident analysis built for enterprise resilience.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
    quickFacts: [
      "War room automation",
      "Stakeholder notifications",
      "Post-mortem templates"
    ],
    slug: "incident-command"
  },
  {
    id: "knowledge-nexus",
    title: "Knowledge Nexus",
    description: "AI-powered knowledge base that learns from every interaction. Surface the right answer instantly with semantic search and intelligent suggestions.",
    image: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=800&q=80",
    quickFacts: [
      "AI-powered search",
      "Auto-categorization",
      "Version control"
    ],
    slug: "knowledge-nexus"
  },
  {
    id: "secure-automation",
    title: "Secure Automation",
    description: "Enterprise-grade automation without compromise. Audit trails, role-based access, and compliance-ready workflows protect your data at every step.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
    quickFacts: [
      "SOC 2 compliant workflows",
      "Complete audit trails",
      "Granular permissions"
    ],
    slug: "secure-automation"
  },
  {
    id: "client-insights",
    title: "Client Insights",
    description: "Transform data into actionable intelligence. Real-time dashboards, sentiment analysis, and custom reports reveal what matters most to your business.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    quickFacts: [
      "Custom dashboards",
      "Sentiment analysis",
      "Trend identification"
    ],
    slug: "client-insights"
  }
];
