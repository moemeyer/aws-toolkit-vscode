import { Metadata } from "next";
import TrackClient from "@/components/TrackClient";
import { generateServiceSchema, renderSchemaScript } from "@/lib/schema";

// Define available services
const SERVICES = {
  "residential-pest-control": {
    title: "Residential Pest Control",
    description: "Comprehensive pest control services for homes and residential properties. Protect your family from unwanted pests.",
    content: `
      Our residential pest control services include:
      - General pest control (ants, roaches, spiders)
      - Termite inspection and treatment
      - Rodent control and exclusion
      - Bed bug treatment
      - Mosquito control
      - Wildlife removal

      We use safe, effective methods to eliminate pests while protecting your family and pets.
    `,
    pricing: "Starting at $99/visit"
  },
  "commercial-pest-control": {
    title: "Commercial Pest Control",
    description: "Professional pest management for businesses, restaurants, and commercial properties.",
    content: `
      Specialized commercial pest control solutions:
      - Restaurant and food service compliance
      - Office building pest management
      - Warehouse and industrial facilities
      - Retail store protection
      - Healthcare facility pest control

      We ensure compliance with health codes and maintain a pest-free environment for your business.
    `,
    pricing: "Custom pricing based on facility size"
  },
  "termite-inspection": {
    title: "Termite Inspection & Treatment",
    description: "Professional termite inspection, treatment, and prevention services.",
    content: `
      Comprehensive termite services:
      - Free termite inspection
      - Termite treatment and extermination
      - Preventive treatments
      - Damage assessment
      - Annual monitoring programs

      Protect your investment with our expert termite services.
    `,
    pricing: "Free inspection, treatment from $299"
  }
} as const;

type ServiceSlug = keyof typeof SERVICES;

export async function generateStaticParams() {
  return Object.keys(SERVICES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = SERVICES[params.slug as ServiceSlug];

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: `${service.title} | Pest Pro Rid All`,
    description: service.description,
    openGraph: {
      title: service.title,
      description: service.description,
      type: "website"
    }
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES[params.slug as ServiceSlug];

  if (!service) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Service Not Found</h1>
        <p>The service you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Generate Schema.org markup
  const schema = generateServiceSchema({
    name: service.title,
    description: service.description,
    provider: {
      name: "Pest Pro Rid All",
      url: process.env.APP_URL || "http://localhost:3000"
    },
    serviceType: "Pest Control Service"
  });

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: renderSchemaScript(schema) }} />
      <TrackClient />

      <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
        <h1>{service.title}</h1>
        <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 24 }}>
          {service.description}
        </p>

        <div style={{ whiteSpace: "pre-line", lineHeight: 1.6, marginBottom: 24 }}>
          {service.content}
        </div>

        <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8, marginBottom: 24 }}>
          <strong>Pricing:</strong> {service.pricing}
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <button
            style={{
              padding: "12px 24px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
            onClick={async () => {
              const sessionId = localStorage.getItem("pp_session_id") || crypto.randomUUID();
              await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: "cta_click",
                  source: "web",
                  sessionId,
                  payload: { cta: "get_quote", service: params.slug }
                })
              });
              alert("Quote request tracked! We'll contact you soon.");
            }}
          >
            Get a Free Quote
          </button>

          <a
            href="tel:+1234567890"
            style={{
              padding: "12px 24px",
              background: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: 4
            }}
            onClick={async () => {
              const sessionId = localStorage.getItem("pp_session_id") || crypto.randomUUID();
              await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: "phone_click",
                  source: "web",
                  sessionId,
                  payload: { service: params.slug }
                })
              });
            }}
          >
            Call Now
          </a>
        </div>
      </main>
    </>
  );
}
