# Pest Pro Tracking Platform

> **End-to-End Marketing Attribution & Conversion Tracking Platform**

A production-ready, enterprise-grade tracking platform for pest control businesses with first-party event tracking, multi-channel attribution, and automated destination forwarding to major advertising platforms.

## 🎯 Overview

This platform provides:

- **First-Party Event Gateway**: Server-side event collection with ground-truth storage
- **Multi-Channel Attribution**: Track UTM parameters, click IDs (gclid, msclkid, fbclid, ttclid, etc.)
- **Conversion Lifecycle Management**: Lead → Booked → Completed → Revenue
- **Automated Destination Routing**: Forward events to PostHog, GA4, Meta CAPI, Google Ads, Microsoft Ads, TikTok, Snapchat, Pinterest, and more
- **Reliable Delivery**: Background job processing with Redis/BullMQ for guaranteed event forwarding
- **SEO & AI-Search Ready**: Schema.org markup, dynamic location/service pages, structured data
- **Production Security**: Rate limiting, CSRF protection, webhook verification, encrypted secrets, RBAC
- **Developer-Friendly**: TypeScript, Prisma ORM, comprehensive testing, structured logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 7+
- Environment variables configured (see `.env.example`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev

# In a separate terminal, start the worker
npm run worker
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
pestpro-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── track/                # Event tracking endpoint
│   │   ├── conversions/          # Conversion tracking endpoint
│   │   ├── admin/                # Admin endpoints (RBAC protected)
│   │   ├── health/               # Health check
│   │   └── csrf/                 # CSRF token endpoint
│   ├── services/                 # Service landing pages
│   ├── locations/                # Location-based landing pages
│   ├── media/                    # Media content pages
│   └── reading/                  # Article/blog pages
├── lib/                          # Core business logic
│   ├── connectors/               # Ad platform integrations
│   │   ├── googleAdsOffline.ts   # Google Ads Offline Conversions
│   │   ├── microsoftAdsOffline.ts# Microsoft Ads Offline Conversions
│   │   ├── meta.ts               # Meta Conversions API
│   │   ├── ga4.ts                # Google Analytics 4
│   │   ├── posthog.ts            # PostHog
│   │   ├── tiktok.ts             # TikTok Events API
│   │   ├── snapchat.ts           # Snapchat Conversions API
│   │   └── pinterest.ts          # Pinterest Conversions API
│   ├── auth.ts                   # NextAuth + RBAC
│   ├── rateLimit.ts              # Redis-based rate limiting
│   ├── csrf.ts                   # CSRF protection
│   ├── webhookAuth.ts            # Webhook signature verification
│   ├── logger.ts                 # Structured logging
│   ├── crypto.ts                 # Encryption for secrets
│   ├── schema.ts                 # Schema.org JSON-LD generators
│   ├── eventSchema.ts            # Zod validation schemas
│   ├── routing.ts                # Event destination routing
│   └── queue.ts                  # BullMQ queue setup
├── worker/                       # Background job worker
│   └── index.ts                  # Event forwarding worker
├── components/                   # React components
│   └── TrackClient.tsx           # Client-side tracking
├── prisma/                       # Database schema and migrations
│   └── schema.prisma             # Prisma schema
├── __tests__/                    # Test suite
│   └── lib/                      # Unit tests
└── package.json                  # Dependencies and scripts
```

## 🔐 Security Features

### ✅ Implemented

- **Rate Limiting**: Redis-based sliding window rate limiting on all endpoints
- **CSRF Protection**: Double-submit cookie pattern for state-changing operations
- **Webhook Verification**: HMAC-SHA256 signature verification with timestamp validation
- **Encrypted Secrets**: AES encryption for destination API keys stored in database
- **RBAC Authentication**: NextAuth-based role-based access control
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Structured Logging**: Production-ready logging with request/response tracking

### 🔒 Production Recommendations

1. **Use a proper KMS** for encryption keys (AWS KMS, Google Cloud KMS, Azure Key Vault)
2. **Enable HTTPS** in production (automatically handled by most hosting platforms)
3. **Set strong secrets**: Generate cryptographically secure tokens for all secrets
4. **Configure CORS** appropriately for your domain
5. **Enable monitoring**: Set up alerting for error rates, latency, and security events
6. **Regular security audits**: Run `npm audit` regularly and keep dependencies updated

## 📊 API Endpoints

### Public Endpoints

#### `POST /api/track`

Track events (page views, clicks, form submissions, etc.)

**Rate Limit**: 100 requests/minute per IP

**Request:**

```json
{
  "name": "page_view",
  "source": "web",
  "sessionId": "uuid",
  "deviceId": "uuid",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "summer-sale",
  "gclid": "gclid_value",
  "msclkid": "msclkid_value",
  "consent": {
    "analytics_storage": "granted",
    "ad_storage": "granted"
  },
  "payload": {
    "page": "/services/pest-control",
    "title": "Pest Control Services"
  }
}
```

**Response:**

```json
{
  "ok": true,
  "id": "event_id",
  "intended": ["POSTHOG", "GA4"]
}
```

#### `POST /api/conversions`

Record conversion events (leads, bookings, completed jobs, revenue)

**Rate Limit**: 30 requests/minute per IP

**Authentication**: Webhook signature verification (if `WEBHOOK_SECRET` is set)

**Request:**

```json
{
  "status": "job_completed",
  "valueCents": 24900,
  "currency": "USD",
  "leadId": "lead_123",
  "jobId": "job_456",
  "sessionId": "uuid",
  "gclid": "gclid_value",
  "payload": {
    "service": "termite-treatment",
    "technician": "John Doe"
  }
}
```

**Headers (if webhook verification enabled):**

```
X-Webhook-Signature: sha256=...
X-Webhook-Timestamp: 1234567890
```

#### `GET /api/health`

Health check endpoint

**Response:**

```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "version": "0.1.0"
}
```

#### `GET /api/csrf`

Get CSRF token (call on app initialization)

**Response:**

```json
{
  "token": "csrf_token_value"
}
```

**Sets cookie**: `csrf_token` (HttpOnly, Secure in production, SameSite=Strict)

### Admin Endpoints

**Authentication**: Requires `X-Admin-Token` header

**Rate Limit**: 60 requests/minute

#### `GET /api/admin/destinations`

List all configured destinations

**Response:**

```json
{
  "ok": true,
  "destinations": [
    {
      "id": "dest_id",
      "type": "GOOGLE_ADS_OFFLINE",
      "name": "Main Google Ads Account",
      "isEnabled": true,
      "config": {
        "customerId": "1234567890",
        "conversionActionId": "987654321"
      },
      "includeEvents": ["lead_submitted", "job_completed"],
      "excludeEvents": []
    }
  ]
}
```

#### `POST /api/admin/destinations`

Create or update a destination

**Request:**

```json
{
  "type": "META_CAPI",
  "name": "Main Meta Pixel",
  "isEnabled": true,
  "config": {
    "pixelId": "1234567890",
    "accessToken": "secret_token"
  },
  "includeEvents": ["lead_submitted", "booking_confirmed"],
  "excludeEvents": []
}
```

#### `DELETE /api/admin/destinations?id=dest_id`

Delete a destination

## 🎨 Frontend Integration

### Client-Side Tracking

```typescript
// components/TrackClient.tsx handles automatic page view tracking
import TrackClient from "@/components/TrackClient";

function MyPage() {
  return (
    <>
      <TrackClient />
      {/* Your page content */}
    </>
  );
}
```

### Manual Event Tracking

```typescript
async function trackCustomEvent() {
  const sessionId = localStorage.getItem("pp_session_id");
  const deviceId = localStorage.getItem("pp_device_id");

  await fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "cta_click",
      source: "web",
      sessionId,
      deviceId,
      payload: {
        cta: "get_quote",
        section: "hero"
      }
    })
  });
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Core
NODE_ENV=production
APP_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/pestpro
REDIS_URL=redis://host:6379

# Security
ADMIN_TOKEN=generate_a_strong_random_token
ENCRYPTION_KEY=minimum_32_characters_for_aes_encryption
NEXTAUTH_SECRET=generate_a_strong_random_token
NEXTAUTH_URL=https://yourdomain.com
WEBHOOK_SECRET=generate_a_strong_random_token_for_webhooks

# Analytics (optional)
POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=your_posthog_key

GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_ga4_secret

# Meta CAPI
META_PIXEL_ID=your_pixel_id
META_ACCESS_TOKEN=your_access_token

# Google Ads Offline Conversions
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_DEVELOPER_TOKEN=your_dev_token
GOOGLE_ADS_CLIENT_ID=your_oauth_client_id
GOOGLE_ADS_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token

# Microsoft Ads Offline Conversions
MICROSOFT_ADS_DEVELOPER_TOKEN=your_dev_token
MICROSOFT_ADS_CLIENT_ID=your_oauth_client_id
MICROSOFT_ADS_CLIENT_SECRET=your_oauth_client_secret
MICROSOFT_ADS_REFRESH_TOKEN=your_refresh_token
MICROSOFT_ADS_CUSTOMER_ID=your_customer_id
MICROSOFT_ADS_ACCOUNT_ID=your_account_id
```

### Destination Configuration

Destinations are configured via the Admin API. Each destination requires:

1. **Type**: One of the supported destination types (e.g., `GOOGLE_ADS_OFFLINE`, `META_CAPI`)
2. **Name**: Friendly name for identification
3. **Config**: Platform-specific configuration (API keys, account IDs, etc.) - **encrypted at rest**
4. **Include/Exclude Events**: Optional event routing rules

## 📈 Supported Destinations

- ✅ **PostHog**: Product analytics
- ✅ **Google Analytics 4**: Web analytics
- ✅ **Meta Conversions API**: Facebook/Instagram ads
- ✅ **Google Ads Offline Conversions**: Enhanced conversions with gclid
- ✅ **Microsoft Ads Offline Conversions**: Bing ads with msclkid
- ✅ **TikTok Events API**: TikTok ads
- ✅ **Snapchat Conversions API**: Snapchat ads
- ✅ **Pinterest Conversions API**: Pinterest ads

### Adding New Destinations

1. Add destination type to `prisma/schema.prisma`
2. Create connector in `lib/connectors/yourplatform.ts`
3. Update worker in `worker/index.ts` to handle new destination type
4. Update routing rules in `lib/routing.ts` (optional)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- ✅ Event schema validation
- ✅ Encryption/decryption
- ✅ Webhook signature verification
- ✅ Rate limiting logic
- ✅ CSRF token generation and validation

## 🚢 Deployment

### Replit

1. Create new Next.js project on Replit
2. Add Postgres and Redis add-ons
3. Set environment variables in Replit Secrets
4. Deploy

### Vercel + Supabase + Upstash

```bash
# Deploy to Vercel
vercel

# Set up database (Supabase)
# Set up Redis (Upstash)

# Configure environment variables in Vercel dashboard
# Deploy worker separately (e.g., Railway, Render)
```

### Docker

```bash
# Build
docker build -t pestpro-app .

# Run
docker-compose up
```

## 📊 Monitoring & Logging

### Structured Logging

All logs are output in JSON format (production) or human-readable format (development).

```typescript
import { logger } from "@/lib/logger";

logger.info("User action", { userId: "123", action: "clicked_cta" });
logger.error("API call failed", error, { endpoint: "/api/track" });
```

### Health Checks

Monitor `/api/health` for:

- Database connectivity
- Application uptime
- Version information

### Metrics to Monitor

- Event ingestion rate
- Conversion rate
- Destination forwarding success rate
- API latency (p50, p95, p99)
- Error rates by endpoint
- Rate limit rejections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm test` and `npm run lint`
5. Submit a pull request

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

For support, email support@pestproridall.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Real-time dashboard for admin UI
- [ ] GraphQL API for advanced querying
- [ ] A/B testing framework
- [ ] Multi-touch attribution models
- [ ] Predictive analytics with ML
- [ ] Mobile SDK for native apps
- [ ] Additional destination connectors (LinkedIn, Nextdoor, Yelp, etc.)
- [ ] Data warehouse export (BigQuery, Snowflake)

---

**Built with ❤️ for pest control businesses seeking data-driven growth**
