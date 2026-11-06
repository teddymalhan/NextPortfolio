import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Manrope } from "next/font/google"
import { Suspense, lazy } from "react"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion-provider"
import { PageTransitionProvider } from "@/components/page-transition"
import { PortfolioSoundProvider } from "@/components/sound-effects"
import { ScrollBounceGuard } from "@/components/scroll-bounce-guard"
import { site } from "@/lib/site"
import "./globals.css"

const DeferredAnalytics = lazy(() => import("@/components/deferred-analytics"))

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Teddy Malhan",
    "Software Engineer",
    "Full Stack Developer",
    "Computer Science",
    "Simon Fraser University",
    "EA",
    "Electronic Arts",
    "Dialpad",
    "Portfolio",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  generator: "Next.js",
  applicationName: "Teddy Malhan Portfolio",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL(site.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Teddy Malhan Portfolio",
    title: site.title,
    description: site.description,
    images: [
      {
        url: site.portrait,
        width: 1200,
        height: 630,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [site.portrait],
    creator: "@teddymalhan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧸</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧸</text></svg>",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = site.url

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Software Engineer",
    description: site.description,
    url: siteUrl,
    image: `${siteUrl}${site.portrait}`,
    sameAs: [site.links.github, site.links.linkedin],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Simon Fraser University",
    },
    worksFor: [
      {
        "@type": "Organization",
        name: "Electronic Arts",
      },
      {
        "@type": "Organization",
        name: "Dialpad",
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${manrope.variable} font-sans`}>
        <ScrollBounceGuard />
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>
        <Suspense fallback={null}>
        <ThemeProvider>
          <MotionProvider>
            <PortfolioSoundProvider>
              <PageTransitionProvider>
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </PageTransitionProvider>
            </PortfolioSoundProvider>
            <Suspense fallback={null}>
              <DeferredAnalytics />
            </Suspense>
          </MotionProvider>
        </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
