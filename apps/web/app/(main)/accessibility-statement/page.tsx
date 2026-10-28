"use client";

import Link from "next/link";
import {
  Accessibility,
  Keyboard,
  FileText,
 Image,
 FormInput,
 Palette,
 MonitorSmartphone,
 Link2,
 RefreshCw,
 Mail,
 ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description:
      "Our platform is designed to support keyboard-accessible navigation wherever reasonably possible.",
  },
  {
    icon: FileText,
    title: "Clear Structure",
    description:
      "We use proper page headings and semantic structure to improve navigation and usability.",
  },
  {
    icon: Image,
    title: "Alternative Text",
    description:
      "Meaningful images include alternative text to improve accessibility for assistive technologies.",
  },
  {
    icon: FormInput,
    title: "Accessible Forms",
    description:
      "Forms are designed to be usable with assistive technologies and accessible input methods.",
  },
  {
    icon: Palette,
    title: "Color Contrast",
    description:
      "We strive to maintain sufficient color contrast for improved readability.",
  },
  {
    icon: MonitorSmartphone,
    title: "Responsive Design",
    description:
      "TriMergePRO Careers is designed to provide an accessible experience across devices and screen sizes.",
  },
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Hero */}

      <section
        style={{
          paddingTop: "5rem",
          paddingBottom: "4rem",
          paddingInline: "1.5rem",
          background:
            "linear-gradient(to bottom right,#07172e,#2563eb)",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div className="tp-chip"
            style={{
              display: "inline-flex",
              background: "rgba(255,255,255,.12)",
              color: "white",
              borderColor: "rgba(255,255,255,.15)",
            }}>
            Accessibility Statement
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem,6vw,4.5rem)",
              color: "white",
              marginTop: "1rem",
              lineHeight: 1.05,
            }}
          >
            Building an accessible experience for everyone.
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,.88)",
              maxWidth: "48rem",
              lineHeight: 1.8,
              marginTop: "1rem",
            }}
          >
            TriMerge Consulting Group, P.A. is committed to making
            TriMergePRO Careers accessible to as many users as reasonably
            possible, including individuals with disabilities.
          </p>

          <p className="mt-4 text-blue-200 font-semibold">
            Effective Date: July 27, 2026
          </p>
        </div>
      </section>

      {/* Intro */}

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Accessibility className="text-blue-600" size={32} />
            <h2 className="text-3xl font-bold">
              Our Commitment
            </h2>
          </div>

          <p className="text-gray-600 text-lg leading-8">
            We strive to incorporate recognized accessibility best
            practices into the design, development, and ongoing
            improvement of the TriMergePRO Careers platform so that
            more users can successfully access our services.
          </p>
        </div>
      </section>

      {/* Features */}

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((item) => (
            <div
              key={item.title}
              className="border rounded-2xl p-8 bg-white"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <item.icon className="text-blue-600" />
              </div>

              <h3 className="font-bold text-xl mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-7">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ongoing */}

      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-10">

          <div>
            <div className="flex gap-3 items-center mb-3">
              <RefreshCw className="text-blue-600" />
              <h3 className="text-2xl font-bold">
                Continuous Improvement
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              Accessibility is an ongoing effort. We continue to evaluate,
              test, and improve our platform over time as technologies,
              standards, and user needs evolve.
            </p>
          </div>

          <div>
            <div className="flex gap-3 items-center mb-3">
              <Link2 className="text-blue-600" />
              <h3 className="text-2xl font-bold">
                Feedback
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              If you experience difficulty accessing any portion of the
              website or require assistance, we encourage you to contact
              us. We welcome accessibility feedback and will make
              reasonable efforts to address reported issues.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}

      <section className="py-20 px-6">
        <div
          style={{
            maxWidth: "70rem",
            margin: "0 auto",
            background:
              "linear-gradient(to right,#2563eb,#4338ca)",
            borderRadius: "24px",
            padding: "3rem",
            color: "white",
            textAlign: "center",
          }}
        >
          <Mail size={42} className="mx-auto mb-4" />

          <h2 className="text-4xl font-bold mb-4">
            Need Accessibility Assistance?
          </h2>

          <p className="opacity-90 max-w-2xl mx-auto leading-8">
            If you experience accessibility issues or have suggestions
            for improving the platform, please contact us.
          </p>

          <a
            href="mailto:careers@trimergeconsulting.com"
            className="underline text-white block mt-8"
          >
            careers@trimergeconsulting.com
          </a>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".5rem",
              marginTop: "2rem",
              background: "#fff",
              color: "#2563eb",
              padding: "1rem 2rem",
              borderRadius: "12px",
              fontWeight: 700,
            }}
          >
            Return Home
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}