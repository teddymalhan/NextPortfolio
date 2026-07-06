import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Manrope } from "next/font/google"
import { Suspense, lazy } from "react"
import Script from "next/script"
import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion-provider"
import { PageTransitionProvider } from "@/components/page-transition"
import { PortfolioSoundProvider } from "@/components/sound-effects"
import { ScrollBounceGuard } from "@/components/scroll-bounce-guard"
import "./globals.css"

// Lazy load analytics to defer non-critical scripts
const DeferredAnalytics = lazy(() => import("@/components/deferred-analytics"))

// Display font for headings - bold, distinctive
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
})

// Body font for text - clean, readable
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
    default: "Teddy Malhan",
    template: "%s | Teddy Malhan",
  },
  description:
    "Software Engineer with experience at EA and Dialpad. Computer Science student at Simon Fraser University.",
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
  authors: [{ name: "Teddy Malhan" }],
  creator: "Teddy Malhan",
  generator: "Next.js",
  applicationName: "Teddy Malhan Portfolio",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://malhan.ca"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Teddy Malhan Portfolio",
    title: "Teddy Malhan - Software Engineer",
    description:
      "Software Engineer with experience at EA and Dialpad. Computer Science student at Simon Fraser University.",
    images: [
      {
        url: "/ted-aboutme.jpg",
        width: 1200,
        height: 630,
        alt: "Teddy Malhan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teddy Malhan - Software Engineer",
    description:
      "Software Engineer with experience at EA and Dialpad. Computer Science student at Simon Fraser University.",
    images: ["/ted-aboutme.jpg"],
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://malhan.ca"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Teddy Malhan",
    jobTitle: "Software Engineer",
    description:
      "Software Engineer with experience at EA and Dialpad. Computer Science student at Simon Fraser University.",
    url: siteUrl,
    image: `${siteUrl}/ted-aboutme.jpg`,
    sameAs: [
      "https://github.com/teddymalhan",
      "https://linkedin.com/in/teddymalhan",
    ],
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
      <head>
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//github.com" />
        <link rel="dns-prefetch" href="//linkedin.com" />
        <link rel="dns-prefetch" href="//devpost.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/sfu-logo.jpg"
          as="image"
          type="image/jpeg"
        />
        <link
          rel="preload"
          href="/ea-logo.jpg"
          as="image"
          type="image/jpeg"
        />
        <link
          rel="preload"
          href="/dialpad-logo.jpg"
          as="image"
          type="image/jpeg"
        />
      </head>
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
          <ClerkProviderWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
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
          </ClerkProviderWrapper>
        </Suspense>
      </body>
    </html>
  )
}
