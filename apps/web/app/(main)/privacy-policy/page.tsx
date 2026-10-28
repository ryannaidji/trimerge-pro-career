"use client";

import Link from "next/link";
import {
  Shield,
  Database,
  Lock,
  Globe,
  UserCheck,
  Cookie,
  FileText,
  Mail,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    items: [
      "Name",
      "Email address",
      "Telephone number",
      "Mailing address",
      "Resume or CV",
      "Employment history",
      "Education",
      "Certifications and licenses",
      "Skills and qualifications",
      "Professional references",
      "Employer profile information",
      "Username and password",
    ],
  },
  {
    icon: Globe,
    title: "Automatically Collected Information",
    items: [
      "IP address",
      "Browser type",
      "Device information",
      "Operating system",
      "Cookies",
      "Website usage analytics",
    ],
  },
  {
    icon: UserCheck,
    title: "How We Use Your Information",
    items: [
      "Create and manage user accounts",
      "Match candidates with employment opportunities",
      "Process employment applications",
      "Allow employers to review applicant information",
      "Communicate regarding employment opportunities",
      "Improve platform functionality",
      "Monitor security and prevent fraud",
      "Comply with legal obligations",
    ],
  },
  {
    icon: Shield,
    title: "Sharing Your Information",
    items: [
      "Employers using TriMergePRO Careers",
      "Service providers supporting our operations",
      "Technology vendors providing hosting or analytics",
      "Government agencies when required by law",
      "We do not sell your personal information.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                borderColor: "rgba(255,255,255,.15)",
                display: "inline-flex",
              }}
            >
              Privacy Policy
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
              Your privacy matters to us.
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,.88)",
                maxWidth: "44rem",
              }}
            >
              TriMerge Consulting Group, P.A. ("TriMerge,"
              "TriMergePRO Careers," "we," "our," or "us")
              respects your privacy and is committed to protecting
              the personal information you provide while using the
              TriMergePRO Careers platform.
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
            <div className="space-y-5">

              {[
                {
                  label: "Personal Information",
                  value: "Protected",
                  color: "#2563eb",
                },
                {
                  label: "Information Sales",
                  value: "Never Sold",
                  color: "#16a34a",
                },
                {
                  label: "Security",
                  value: "Safeguarded",
                  color: "#9333ea",
                },
              ].map((item) => (
                <div key={item.label}>
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
                      borderRadius: "999px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "999px",
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
                background: "#2563eb",
                borderRadius: ".75rem",
              }}
            >
              <FileText color="white" />
            </div>

            <h2 className="text-3xl font-bold">
              Privacy Overview
            </h2>
          </div>

          <p className="text-gray-600 leading-8 text-lg max-w-4xl">
            This Privacy Policy explains what information
            TriMergePRO Careers collects, how it is used,
            how it may be shared, and the choices available
            to you regarding your personal information.
          </p>
        </div>
      </section>

      {/* Cards */}

      <section
        style={{
          padding: "0 1.5rem 5rem",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
          }}
          className="grid md:grid-cols-2 gap-6"
        >
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "2rem",
                background: "#fff",
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
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        background: "#2563eb",
                        borderRadius: "999px",
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

      {/* Remaining Policy */}

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
              <Cookie color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Cookies
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              TriMergePRO Careers uses cookies and similar
              technologies to improve website functionality,
              remember user preferences, analyze website
              traffic, and enhance the user experience. You
              may disable cookies through your browser,
              although certain features may not function
              properly.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Lock color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Data Security
              </h3>
            </div>

            <p className="text-gray-600 leading-8">
              We implement reasonable administrative,
              technical, and physical safeguards designed to
              protect personal information. However, no
              method of electronic transmission or storage
              can be guaranteed to be completely secure.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <UserCheck color="#2563eb" />
              <h3 className="text-2xl font-bold">
                Your Rights
              </h3>
            </div>

            <ul className="space-y-2 text-gray-600">
              <li>• Access your personal information</li>
              <li>• Correct inaccurate information</li>
              <li>• Update your profile</li>
              <li>• Delete your account</li>
              <li>
                • Request removal of personal information
                where permitted by law
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">
              Third-Party Websites
            </h3>

            <p className="text-gray-600 leading-8">
              Our platform may contain links to third-party
              websites. We are not responsible for the
              privacy practices or content of those
              websites.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">
              Changes to this Policy
            </h3>

            <p className="text-gray-600 leading-8">
              We may update this Privacy Policy from time to
              time. Any updates become effective immediately
              upon posting on this website.
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
            color: "white",
            textAlign: "center",
          }}
        >
          <Mail
            size={42}
            style={{
              margin: "0 auto 1rem",
            }}
          />

          <h2 className="text-4xl font-bold mb-4">
            Questions About Your Privacy?
          </h2>

          <p
            style={{
              opacity: ".92",
              maxWidth: "650px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            If you have questions regarding this Privacy
            Policy or the handling of your personal
            information, please contact us.
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
              background: "white",
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