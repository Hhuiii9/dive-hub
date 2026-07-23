// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.divehubmarineservices.com"),

  title: {
    default: "Dive Hub & Marine Services",
    template: "%s | Dive Hub & Marine Services",
  },

  description:
    "Dive Hub & Marine Services provides professional scuba diving courses, commercial diving training, underwater services, marine solutions, ROV survey support, and diving certifications in Kerala.",

  keywords: [
    "Dive Hub",
    "Dive Hub & Marine Services",
    "Scuba Diving Kerala",
    "Commercial Diving Training",
    "Marine Services Kerala",
    "Underwater Services",
    "Diving Institute Kerala",
    "Scuba Diving Course",
    "Commercial Diver Training India",
    "ROV Survey",
    "Underwater Welding",
    "Rescue Diving",
    "Deep Diving Course",
    "Night Diving",
    "Marine Inspection",
    "Professional Diving Training",
    "Diving Certification",
    "Ocean Diving",
    "Scuba Training India",
    "Dive Academy Kerala",
  ],

  authors: [
    {
      name: "Dive Hub & Marine Services",
    },
  ],

  creator: "Dive Hub & Marine Services",

  publisher: "Dive Hub & Marine Services",

  openGraph: {
    title: "Dive Hub & Marine Services",
    description:
      "Professional diving training, underwater services, commercial diving, scuba diving certifications and marine solutions.",

    url: "https://www.divehubmarineservices.com",

    siteName: "Dive Hub & Marine Services",

    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dive Hub & Marine Services",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Dive Hub & Marine Services",
    description:
      "Professional scuba diving training and marine underwater services.",

    images: ["/images/og-image.jpg"],
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

  alternates: {
    canonical: "https://www.divehubmarineservices.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Dive Hub & Marine Services",
  "image": "https://www.divehubmarineservices.com/logo.png",
  "@id": "https://www.divehubmarineservices.com/#localbusiness",
  "url": "https://www.divehubmarineservices.com",
  "telephone": "+916235107072",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Angamaly",
    "addressLocality": "Ernakulam",
    "addressRegion": "Kerala",
    "postalCode": "683572",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.1926394,
    "longitude": 76.3869289
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "09:00",
    "closes": "19:00"
  },
  "sameAs": [
    "https://www.facebook.com/divehubmarineservices",
    "https://www.instagram.com/divehubmarineservices"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#03131d] text-white antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0MZ3T0BNER"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0MZ3T0BNER');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}