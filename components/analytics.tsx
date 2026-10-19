import Script from "next/script";

/**
 * Cloudflare Web Analytics: gratis, sin cookies y sin datos personales.
 * Solo se activa si en el build existe NEXT_PUBLIC_CF_ANALYTICS_TOKEN.
 */
export function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;
  if (!token) return null;
  return (
    <Script
      defer
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
