import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | Dive Hub & Marine Services",
  description: "Learn about the journey of Dive Hub & Marine Services. Founded with a vision to deliver world-class safety-centric scuba training, commercial diving education, ROV surveys, and subsea engineering solutions in Kerala, India.",
  alternates: {
    canonical: "https://www.divehubmarineservices.com/about",
  },
  openGraph: {
    title: "About Us | Dive Hub & Marine Services",
    description: "Learn about the journey of Dive Hub & Marine Services. Founded with a vision to deliver world-class safety-centric scuba training, commercial diving education, ROV surveys, and subsea engineering solutions in Kerala, India.",
    url: "https://www.divehubmarineservices.com/about",
  }
};

export default function AboutPage() {
  return <AboutClient />;
}