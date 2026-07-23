import type { Metadata } from "next";
import LocationClient from "./LocationClient";

export const metadata: Metadata = {
  title: "Our Location | Dive Hub & Marine Services",
  description: "Find the exact location and directions to Dive Hub & Marine Services headquarters based in Angamaly, Ernakulam, Kerala, India. Plan your visit to our diving academy.",
  alternates: {
    canonical: "https://www.divehubmarineservices.com/location",
  },
  openGraph: {
    title: "Our Location | Dive Hub & Marine Services",
    description: "Find the exact location and directions to Dive Hub & Marine Services headquarters based in Angamaly, Ernakulam, Kerala, India. Plan your visit to our diving academy.",
    url: "https://www.divehubmarineservices.com/location",
  }
};

export default function LocationPage() {
  return <LocationClient />;
}
