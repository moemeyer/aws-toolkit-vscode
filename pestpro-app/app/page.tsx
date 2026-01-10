import TrackClient from "@/components/TrackClient";
import { generateWebSiteSchema, renderSchemaScript } from "@/lib/schema";

export default function Home() {
  const siteUrl = process.env.APP_URL || "http://localhost:3000";
  const schema = generateWebSiteSchema(siteUrl, "Pest Pro Rid All");

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: renderSchemaScript(schema) }} />
      <TrackClient />

      <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 48, textAlign: "center" }}>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>Pest Pro Rid All</h1>
          <p style={{ fontSize: 20, opacity: 0.8 }}>
            Professional Pest Control Services You Can Trust
          </p>
        </header>

        <section style={{ marginBottom: 48 }}>
          <h2>Our Services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
              <h3>Residential Pest Control</h3>
              <p>Comprehensive pest protection for your home and family.</p>
              <a href="/services/residential-pest-control">Learn More →</a>
            </div>

            <div style={{ padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
              <h3>Commercial Pest Control</h3>
              <p>Professional pest management for businesses.</p>
              <a href="/services/commercial-pest-control">Learn More →</a>
            </div>

            <div style={{ padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
              <h3>Termite Inspection</h3>
              <p>Expert termite detection and treatment services.</p>
              <a href="/services/termite-inspection">Learn More →</a>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 48, background: "#f9f9f9", padding: 32, borderRadius: 8 }}>
          <h2>Why Choose Us?</h2>
          <ul style={{ fontSize: 18, lineHeight: 1.8 }}>
            <li>Licensed and insured professionals</li>
            <li>Safe, eco-friendly pest control methods</li>
            <li>Same-day service available</li>
            <li>100% satisfaction guarantee</li>
            <li>Free inspections and quotes</li>
          </ul>
        </section>

        <section style={{ textAlign: "center", padding: 48, background: "#007bff", color: "white", borderRadius: 8 }}>
          <h2 style={{ marginBottom: 24 }}>Get a Free Quote Today</h2>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="tel:+1234567890"
              style={{
                padding: "16px 32px",
                background: "white",
                color: "#007bff",
                textDecoration: "none",
                borderRadius: 4,
                fontWeight: "bold",
                fontSize: 18
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
                    payload: { location: "homepage" }
                  })
                });
              }}
            >
              Call: (234) 567-8900
            </a>

            <button
              style={{
                padding: "16px 32px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 18
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
                    payload: { cta: "get_quote", location: "homepage" }
                  })
                });
                alert("Quote request received! We'll contact you soon.");
              }}
            >
              Request Free Quote
            </button>
          </div>
        </section>

        <nav style={{ marginTop: 48, padding: 24, borderTop: "1px solid #ddd" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/media">Media Center</a>
            <a href="/reading">Blog & Resources</a>
            <a href="/admin">Admin Dashboard</a>
          </div>
        </nav>
      </main>
    </>
  );
}
