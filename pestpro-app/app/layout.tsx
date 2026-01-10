import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pest Pro Rid All - Professional Pest Control Services",
  description: "Professional pest control and extermination services. Licensed, insured, and ready to help you eliminate pests from your home or business.",
  keywords: "pest control, exterminator, termite inspection, rodent control, bed bugs",
  openGraph: {
    title: "Pest Pro Rid All - Professional Pest Control Services",
    description: "Professional pest control and extermination services.",
    type: "website",
    siteName: "Pest Pro Rid All"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
