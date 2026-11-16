import type { Metadata, Viewport } from "next";
import { Figtree, Urbanist } from "next/font/google";
import Providers from "@/app/providers";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import BackToTop from "@/components/site/back-to-top";
import PwaRegistrar from "@/components/site/pwa-registrar";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bloodworks.health"),
  title: {
    default: "BloodWorks Health – Decode your blood report in under a minute",
    template: "%s · BloodWorks Health",
  },
  description:
    "Upload a blood report photo. BloodWorks matches every value to its reference range, scores each body system and builds a care plan with Sai, your AI assistant. Private: analysis runs in your browser.",
  openGraph: {
    title: "BloodWorks Health – Decode your blood report in under a minute",
    description:
      "60+ biomarkers decoded, per-system scores, a concrete care plan and an AI assistant that knows your numbers. Runs entirely in your browser.",
    url: "https://bloodworks.health",
    siteName: "BloodWorks Health",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BloodWorks Health dashboard" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloodWorks Health – Decode your blood report in under a minute",
    description:
      "60+ biomarkers decoded, per-system scores, a concrete care plan and an AI assistant that knows your numbers.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://bloodworks.health",
  },
  manifest: "/manifest.json",
  applicationName: "BloodWorks Health",
  icons: [
    { url: "/icon-180.png", sizes: "180x180", type: "image/png" },
    { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1512" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable} ${figtree.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <BackToTop />
          <PwaRegistrar />
        </Providers>
      </body>
    </html>
  );
}
