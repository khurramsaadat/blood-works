import type { MetadataRoute } from "next";

const BASE = "https://bloodworks.health";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { url: "/", priority: 1 },
    { url: "/analyze", priority: 0.9 },
    { url: "/symptoms", priority: 0.8 },
    { url: "/how-it-works", priority: 0.7 },
    { url: "/faq", priority: 0.7 },
    { url: "/careers", priority: 0.5 },
    { url: "/privacy", priority: 0.3 },
    { url: "/terms", priority: 0.3 },
    { url: "/sitemap", priority: 0.3 },
  ];
  return pages.map((p) => ({
    url: `${BASE}${p.url}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.priority,
  }));
}
