import type { Metadata } from "next";
import WhatWeOfferClient from "./WhatWeOfferClient";

export const metadata: Metadata = {
  title: "Our Services | Dive Hub & Marine Services",
  description: "Explore our range of professional subsea services: underwater inspections, marine construction, commercial salvage operations, ROV survey support, and certified diving courses in Kerala, India.",
  alternates: {
    canonical: "https://www.divehubmarineservices.com/what-we-offer",
  },
  openGraph: {
    title: "Our Services | Dive Hub & Marine Services",
    description: "Explore our range of professional subsea services: underwater inspections, marine construction, commercial salvage operations, ROV survey support, and certified diving courses in Kerala, India.",
    url: "https://www.divehubmarineservices.com/what-we-offer",
  }
};

export default function WhatWeOfferPage() {
  return <WhatWeOfferClient />;
}