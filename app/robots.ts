import type { MetadataRoute } from "next";
import { negocio } from "@/lib/tienda";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = `${negocio.siteUrl}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/tablero/", "/carrito/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
