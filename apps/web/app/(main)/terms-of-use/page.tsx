"use client";

import Link from "next/link";
import {
  FileCheck,
  ShieldCheck,
  User,
  Briefcase,
  Copyright,
  AlertTriangle,
  Scale,
  Ban,
  Gavel,
  RefreshCw,
  Mail,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "Acceptable Use",
    items: [
      "Provide truthful and accurate information.",
      "Maintain the confidentiality of your login credentials.",
      "Use the platform only for lawful purposes.",
      "Respect the rights of other users.",
      "Do not submit false, misleading, fraudulent, or harmful information.",
    ],
  },
  {
    icon: User,
    title: "User Content",
    items: [
      "You are solely responsible for information you upload or submit.",
      "This includes resumes, employment history, certifications, and profile information.",
      "You represent that all submitted information is accurate and that you have the legal right to provide it.",
    ],
  },
  {
    icon: Briefcase,
    title: "Employment Disclaimer",
    items: [
      "TriMergePRO Careers provides a technology platform connecting employers and job seekers.",
      "Submitting an application does not guarantee employment.",
      "Submitting a resume does not guarantee an interview.",
      "Submitting a profile does not guarantee job placement.",
      "Future employment opportunities are not guaranteed.",
      "Employment decisions are made solely by the hiring employer.",
      "Job postings may be modified, suspended, or removed without notice.",
      "TriMerge does not guarantee the accuracy, completeness, or continued availability of job postings.",
    ],
  },
  {
    icon: Copyright,
    title: "Intellectual Property",
    items: [
      "All software, graphics, logos, trademarks, content, and materials remain the property of TriMerge Consulting Group, P.A. or its licensors.",
      "No content may be copied, reproduced, distributed, or reused without prior written permission.",
    ],
  },
];

export default function TermsOfUsePage() {
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
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div style={{ color: "white" }}>
            <div
              className="tp-chip"
              style={{
                display: "inline-flex",
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                borderColor: "rgba(255,255,255,.15)",
              }}
            >
              Terms of Use
            </div>

            <h1
              style={{
                fontSize: "clamp(2.5rem,6vw,4.5rem)",
                lineHeight: 1.05,
                marginTop: "1rem",
                marginBottom: "1rem",
                letterSpacing: "-.04em",
              }}
            >
              Terms governing the use of TriMergePRO Careers.
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,.88)",
                maxWidth: "44rem",
              }}
            >
              By accessing or using the TriMergePRO Careers platform,
              you agree to comply with these Terms of Use. Please read
              them carefully before using our services.
            </p>

            <p
              style={{
                marginTop: "1rem",
                color: "#bfdbfe",
                fontWeight: 600,
              }}
            >
              Effective Date: July 27, 2026
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.95)",
              borderRadius: "1.25rem",
              padding: "2rem",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,.25)",
            }}
          >
            {[
              {
                label: "Lawful Use",
                value: "Required",
                color: "#2563eb",
              },
              {
                label: "User Responsibility",
                value: "Expected",
                color: "#16a34a",
              },
              {
                label: "Terms Updates",
                value: "Possible",
                color: "#9333ea",
              },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: "1.5rem" }}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {item.label}
                  </span>

                  <span
                    style={{
                      color: item.color,
                      fontWeight: 700,
                    }}
                  >
                    {item.value}
                  </span>
                </div>

                <div
                  style={{
                    height: ".55rem",
                    background: "#e5e7eb",
                    borderRadius: 999,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 999,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}

      <section
        style={{
          padding: "4rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "75rem",
            margin: "0 auto",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              style={{
                padding: ".75rem",
                borderRadius: ".75rem",
                background: "#2563eb",
              }}
            >
              <FileCheck color="white" />
            </div>

            <h2 className="text-3xl font-bold">
              Overview
            </h2>
          </div>

          <p className="text-lg leading-8 text-gray-600 max-w-4xl">
            These Terms of Use govern your access to and use of
            TriMergePRO Careers. By continuing to use the platform,
            you acknowledge that you have read, understood, and agree
            to these terms.
          </p>
        </div>
      </section>

      {/* Main Cards */}

      <section
        style={{
          padding: "0 1.5rem 5rem",
        }}
      >
        <div
          className="grid md:grid-cols-2 gap-6"
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
          }}
        >
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "2rem",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  style={{
                    background: "#dbeafe",
                    padding: ".75rem",
                    borderRadius: ".75rem",
                  }}
                >
                  <section.icon color="#2563eb" />
                </div>

                <h3 className="text-xl font-bold">
                  {section.title}
                </h3>
              </div>

              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-gray-600"
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: "#2563eb",
                        marginTop: 8,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Remaining Sections */}

      <section
        style={{
          background: "#f8fafc",
          padding: "5rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
          }}
          className="space-y-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Disclaimer of Warranties
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              The platform is provided on an <strong>"as is"</strong> and{" "}
              <strong>"as available"</strong> basis. TriMerge
              makes no express or implied warranties regarding
              the availability, reliability, accuracy, or
              uninterrupted operation of the platform.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Scale color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Limitation of Liability
              </h3>
            </div>

            <p className="text-gray-600 leading-8 mb-4">
              To the fullest extent permitted by law, TriMerge
              Consulting Group, P.A. shall not be liable for
              indirect, incidental, consequential, special,
              exemplary, or punitive damages arising from:
            </p>

            <ul className="space-y-2 text-gray-600">
              <li>• Use of the platform</li>
              <li>• Inability to use the platform</li>
              <li>• Employment or hiring decisions</li>
              <li>• Loss of employment opportunities</li>
              <li>• Data loss</li>
              <li>• Service interruptions</li>
              <li>• Reliance on platform information</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Indemnification
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              You agree to indemnify and hold harmless
              TriMerge Consulting Group, P.A., its officers,
              employees, affiliates, and partners from claims,
              damages, liabilities, and expenses arising from
              your use of the platform or violation of these
              Terms.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Ban color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Termination
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              TriMerge reserves the right to suspend or
              terminate user accounts that violate these Terms
              or applicable laws.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Gavel color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Governing Law
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              These Terms shall be governed by and interpreted
              under the laws of the State of Florida, without
              regard to its conflict of law principles.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <RefreshCw color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Changes to These Terms
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              TriMerge may update these Terms at any time.
              Continued use of the platform after updates are
              posted constitutes acceptance of the revised
              Terms.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}

      <section
        style={{
          padding: "5rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "70rem",
            margin: "0 auto",
            background:
              "linear-gradient(to right,#2563eb,#4338ca)",
            borderRadius: "24px",
            padding: "3rem",
            textAlign: "center",
            color: "white",
          }}
        >
          <Mail
            size={42}
            style={{
              margin: "0 auto 1rem",
            }}
          />

          <h2 className="text-4xl font-bold mb-4">
            Questions About These Terms?
          </h2>

          <p
            style={{
              opacity: 0.92,
              maxWidth: "650px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            If you have any questions regarding these Terms of
            Use, please contact TriMerge Consulting Group,
            P.A.
          </p>

          <div
            style={{
              marginTop: "2rem",
              fontSize: "1.05rem",
            }}
          >
            <strong>TriMerge Consulting Group, P.A.</strong>

            <br />

            <a
              href="mailto:careers@trimergeconsulting.com"
              style={{
                color: "white",
                textDecoration: "underline",
              }}
            >
              careers@trimergeconsulting.com
            </a>
          </div>

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