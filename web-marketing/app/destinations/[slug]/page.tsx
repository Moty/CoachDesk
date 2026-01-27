import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations } from "@/data/destinations";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = destinations.find((d) => d.slug === slug);

  if (!destination) {
    notFound();
  }

  return (
    <main className="min-h-screen py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/#destinations"
          className="inline-flex items-center gap-2 text-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-secondary))] transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Destinations
        </Link>

        <div className="relative h-96 rounded-2xl overflow-hidden mb-12">
          <Image
            src={destination.image}
            alt={destination.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg-primary))] via-transparent to-transparent" />
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-[rgb(var(--accent-primary))] bg-clip-text text-transparent">
          {destination.title}
        </h1>

        <p className="text-xl text-[rgb(var(--text-secondary))] mb-12">
          {destination.description}
        </p>

        <div className="bg-[rgb(var(--bg-glass)_/_0.5)] border border-[rgb(var(--border-glass)_/_0.1)] rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <ul className="space-y-4">
            {destination.quickFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent-primary))] mt-2 flex-shrink-0" />
                <span className="text-lg text-[rgb(var(--text-secondary))]">{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/#concierge"
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white font-semibold hover:scale-105 transition-transform"
          >
            Request More Information
          </Link>
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return destinations.map((destination) => ({
    slug: destination.slug,
  }));
}
