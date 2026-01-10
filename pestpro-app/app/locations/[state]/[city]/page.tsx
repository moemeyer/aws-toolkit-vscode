import { Metadata } from "next";
import { prisma } from "@/lib/db";
import TrackClient from "@/components/TrackClient";
import {
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  renderSchemaScript,
  generateMultipleSchemas
} from "@/lib/schema";

export async function generateMetadata({
  params
}: {
  params: { state: string; city: string };
}): Promise<Metadata> {
  const cityName = params.city.replace(/-/g, " ");
  const stateName = params.state.toUpperCase();

  return {
    title: `Pest Control Services in ${cityName}, ${stateName} | Pest Pro Rid All`,
    description: `Professional pest control services in ${cityName}, ${stateName}. Licensed and insured pest management. Call for a free quote!`,
    openGraph: {
      title: `Pest Control in ${cityName}, ${stateName}`,
      description: `Professional pest control services in ${cityName}, ${stateName}. Licensed and insured.`,
      type: "website"
    }
  };
}

export default async function LocationPage({
  params
}: {
  params: { state: string; city: string };
}) {
  const cityName = params.city.replace(/-/g, " ");
  const stateName = params.state.toUpperCase();

  // Try to find market data from database
  const market = await prisma.market.findFirst({
    where: {
      state: stateName,
      city: cityName
    },
    include: {
      directoryChecks: true
    }
  });

  // Generate Schema.org markup
  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  const businessSchema = generateLocalBusinessSchema({
    name: `Pest Pro Rid All - ${cityName}`,
    url: `${baseUrl}/locations/${params.state}/${params.city}`,
    description: `Professional pest control services in ${cityName}, ${stateName}`,
    telephone: "+1-234-567-8900",
    address: {
      streetAddress: "123 Main St",
      addressLocality: cityName,
      addressRegion: stateName,
      postalCode: market?.zip || "00000",
      addressCountry: "US"
    },
    priceRange: "$$",
    areaServed: [cityName]
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Locations", url: `${baseUrl}/locations` },
    { name: stateName, url: `${baseUrl}/locations/${params.state}` },
    { name: cityName, url: `${baseUrl}/locations/${params.state}/${params.city}` }
  ]);

  const schemas = generateMultipleSchemas([businessSchema, breadcrumbSchema]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: schemas }} />
      <TrackClient />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <nav style={{ marginBottom: 24, fontSize: 14, opacity: 0.7 }}>
          <a href="/">Home</a> » <a href="/locations">Locations</a> »{" "}
          <a href={`/locations/${params.state}`}>{stateName}</a> » {cityName}
        </nav>

        <h1>
          Pest Control Services in {cityName}, {stateName}
        </h1>

        <p style={{ fontSize: 18, marginBottom: 32 }}>
          Professional pest control and extermination services in {cityName},{" "}
          {stateName}. Licensed, insured, and ready to help you eliminate pests
          from your home or business.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div>
            <h2>Our Services in {cityName}</h2>
            <ul>
              <li>
                <a href="/services/residential-pest-control">Residential Pest Control</a>
              </li>
              <li>
                <a href="/services/commercial-pest-control">Commercial Pest Control</a>
              </li>
              <li>
                <a href="/services/termite-inspection">Termite Inspection & Treatment</a>
              </li>
              <li>Rodent Control</li>
              <li>Bed Bug Treatment</li>
              <li>Wildlife Removal</li>
            </ul>
          </div>

          <div>
            <h2>Why Choose Us?</h2>
            <ul>
              <li>Licensed and insured professionals</li>
              <li>Safe, eco-friendly pest control methods</li>
              <li>Same-day service available</li>
              <li>100% satisfaction guarantee</li>
              <li>Free inspections and quotes</li>
              <li>Emergency pest control services</li>
            </ul>
          </div>
        </div>

        <div style={{ background: "#f9f9f9", padding: 24, borderRadius: 8, marginBottom: 32 }}>
          <h2>About {cityName}, {stateName}</h2>
          <p>
            {cityName} is served by our experienced pest control professionals.
            We understand the unique pest challenges in {stateName} and provide
            tailored solutions for local residents and businesses.
          </p>

          {market && (
            <div style={{ marginTop: 16 }}>
              <h3>Service Coverage</h3>
              <p>
                Active Market: {market.isActive ? "Yes" : "No"}
                <br />
                {market.county && `County: ${market.county}`}
                <br />
                {market.zip && `Zip Code: ${market.zip}`}
              </p>

              {market.directoryChecks.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4>Verified Directory Listings</h4>
                  <ul>
                    {market.directoryChecks.map(check => (
                      <li key={check.id}>
                        {check.target}: {check.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", padding: 32, background: "#007bff", color: "white", borderRadius: 8 }}>
          <h2>Get a Free Quote Today</h2>
          <p style={{ marginBottom: 24 }}>
            Call us now or request a quote online. Same-day service available!
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <a
              href="tel:+1234567890"
              style={{
                padding: "12px 32px",
                background: "white",
                color: "#007bff",
                textDecoration: "none",
                borderRadius: 4,
                fontWeight: "bold"
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
                    payload: { location: `${cityName}, ${stateName}` }
                  })
                });
              }}
            >
              Call: (234) 567-8900
            </a>

            <button
              style={{
                padding: "12px 32px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold"
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
                    payload: { cta: "request_quote", location: `${cityName}, ${stateName}` }
                  })
                });
                alert("Quote request tracked! We'll contact you soon.");
              }}
            >
              Request Free Quote
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
