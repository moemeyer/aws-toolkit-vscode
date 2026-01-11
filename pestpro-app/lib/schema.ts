/**
 * Schema.org JSON-LD generator for SEO and AI search readiness
 * Provides structured data markup for better search engine understanding
 */

export interface Organization {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[]; // Social media profiles
  areaServed?: string[];
}

export interface LocalBusiness extends Organization {
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface Article {
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    "@type": "Person" | "Organization";
    name: string;
  };
  publisher: Organization;
  articleBody?: string;
}

export interface FAQPage {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Service {
  name: string;
  description: string;
  provider: Organization;
  areaServed?: string[];
  serviceType?: string;
  offers?: {
    "@type": "Offer";
    priceSpecification?: {
      "@type": "PriceSpecification";
      priceCurrency: string;
      price?: number;
      minPrice?: number;
      maxPrice?: number;
    };
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(org: Organization) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.url
  };

  if (org.logo) schema.logo = org.logo;
  if (org.description) schema.description = org.description;
  if (org.telephone) schema.telephone = org.telephone;
  if (org.email) schema.email = org.email;

  if (org.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry
    };
  }

  if (org.sameAs && org.sameAs.length > 0) {
    schema.sameAs = org.sameAs;
  }

  if (org.areaServed && org.areaServed.length > 0) {
    schema.areaServed = org.areaServed.map(area => ({
      "@type": "City",
      name: area
    }));
  }

  return schema;
}

/**
 * Generate LocalBusiness schema (for location pages)
 */
export function generateLocalBusinessSchema(business: LocalBusiness) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    ...generateOrganizationSchema(business)
  };

  if (business.priceRange) schema.priceRange = business.priceRange;

  if (business.openingHours && business.openingHours.length > 0) {
    schema.openingHours = business.openingHours;
  }

  if (business.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude
    };
  }

  if (business.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: business.aggregateRating.ratingValue,
      reviewCount: business.aggregateRating.reviewCount
    };
  }

  return schema;
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(article: Article) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    datePublished: article.datePublished,
    author: {
      "@type": article.author["@type"],
      name: article.author.name
    },
    publisher: {
      "@type": "Organization",
      name: article.publisher.name,
      url: article.publisher.url,
      ...(article.publisher.logo && { logo: article.publisher.logo })
    }
  };

  if (article.description) schema.description = article.description;
  if (article.image) schema.image = article.image;
  if (article.dateModified) schema.dateModified = article.dateModified;
  if (article.articleBody) schema.articleBody = article.articleBody;

  return schema;
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faq: FAQPage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.questions.map(q => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer
      }
    }))
  };
}

/**
 * Generate Service schema
 */
export function generateServiceSchema(service: Service) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: service.provider.name,
      url: service.provider.url
    }
  };

  if (service.areaServed && service.areaServed.length > 0) {
    schema.areaServed = service.areaServed.map(area => ({
      "@type": "City",
      name: area
    }));
  }

  if (service.serviceType) schema.serviceType = service.serviceType;

  if (service.offers) {
    schema.offers = service.offers;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generate WebSite schema with search functionality
 */
export function generateWebSiteSchema(siteUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Render schema as JSON-LD script tag
 */
export function renderSchemaScript(schema: any): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate multiple schemas for a page
 */
export function generateMultipleSchemas(schemas: any[]) {
  return schemas.map(schema => renderSchemaScript(schema)).join("\n");
}

/**
 * Pest control specific schemas
 */
export function generatePestControlServiceSchema(city: string, state: string) {
  return generateServiceSchema({
    name: `Pest Control Services in ${city}, ${state}`,
    description: `Professional pest control and extermination services in ${city}, ${state}. Licensed and insured pest management solutions.`,
    provider: {
      name: "Pest Pro Rid All",
      url: process.env.APP_URL || "http://localhost:3000"
    },
    areaServed: [`${city}, ${state}`],
    serviceType: "Pest Control Service",
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: 99,
        maxPrice: 499
      }
    }
  });
}
