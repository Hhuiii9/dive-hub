import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Dive Hub & Marine Services",
  description: "Get in touch with Dive Hub & Marine Services at Angamaly, Ernakulam, Kerala. Contact us for professional scuba diving courses, commercial diver training, marine construction support, and underwater salvage services.",
  alternates: {
    canonical: "https://www.divehubmarineservices.com/contact",
  },
  openGraph: {
    title: "Contact Us | Dive Hub & Marine Services",
    description: "Get in touch with Dive Hub & Marine Services at Angamaly, Ernakulam, Kerala. Contact us for professional scuba diving courses, commercial diver training, marine construction support, and underwater salvage services.",
    url: "https://www.divehubmarineservices.com/contact",
  }
};

export default function ContactPage() {
  return <ContactClient />;
}