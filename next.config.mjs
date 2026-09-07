/** @type {import('next').NextConfig} */

// Content-Security-Policy.
//
// 'unsafe-inline' on styles is required by Tailwind's runtime style injection,
// and 'unsafe-eval' is omitted deliberately. connect-src covers Supabase
// (auth, PostgREST, realtime) since every read and write goes there from the
// browser. Tighten script-src with nonces once there is a reason to.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self'",
  // The dashboard carries destructive controls (archive a member, delete a
  // fund, remove a person). Framing it anywhere would allow those to be
  // clickjacked.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig = {
  typedRoutes: true,
  /**
   * One canonical host.
   *
   * Both getfold.org and www.getfold.org were serving the full site, so
   * every page existed twice as far as a search engine was concerned, with
   * no canonical tag to say which was real. That splits whatever authority
   * the site earns across two copies and is the classic way to make a
   * sitemap submission worthless.
   *
   * www wins because that is what the sitemap, robots.txt and every
   * absolute URL already say. 308 rather than 302, so it is cached and
   * passes the signal on permanently.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "getfold.org" }],
        destination: "https://www.getfold.org/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Error messages travel in the query string, so a full referrer
          // would leak them to any third party the user navigates to.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
