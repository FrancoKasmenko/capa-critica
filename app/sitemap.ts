import type { MetadataRoute } from "next";
import { negocio, productos } from "@/lib/tienda";

export const dynamic = "force-static";

const base = `${negocio.siteUrl}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...productos.filter((p) => !p.placeholder).map((p) => ({ url: `${base}/producto/${p.id}/`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
