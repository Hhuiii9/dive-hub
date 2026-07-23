import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
  title: "Professional Diving Courses & Certifications | Dive Hub & Marine Services",
  description: "Get certified with our beginner-to-advanced scuba diving programs or kickstart your career with professional commercial diving courses and marine inspection training in Kerala.",
  alternates: {
    canonical: "https://www.divehubmarineservices.com/courses",
  },
  openGraph: {
    title: "Professional Diving Courses & Certifications | Dive Hub & Marine Services",
    description: "Get certified with our beginner-to-advanced scuba diving programs or kickstart your career with professional commercial diving courses and marine inspection training in Kerala.",
    url: "https://www.divehubmarineservices.com/courses",
  }
};

export default function CoursesPage() {
  return <CoursesClient />;
}