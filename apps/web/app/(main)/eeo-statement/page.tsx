import type { Metadata } from "next";
import Link from "next/link";

// Draft EEO statement (#10). Wording follows common U.S. EEO language for federal
// and state contractors; it must be reviewed by TriMerge before launch.
export const metadata: Metadata = {
  title: "Equal Employment Opportunity Statement",
  description:
    "TriMerge Consulting Group, P.A. is an Equal Opportunity Employer. Read our EEO and reasonable accommodation statement.",
};

const sectionStyle = { display: "grid", gap: "0.75rem" } as const;
const textStyle = { color: "var(--tp-muted)", lineHeight: 1.75 } as const;

export default function EeoStatementPage() {
  return (
    <div className="tp-container" style={{ padding: "4rem 0", maxWidth: "52rem", display: "grid", gap: "2rem" }}>
      <header style={sectionStyle}>
        <div className="tp-kicker">Legal</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Equal Employment Opportunity Statement
        </h1>
      </header>

      <section style={sectionStyle} aria-labelledby="eeo-policy">
        <h2 id="eeo-policy" style={{ fontSize: "1.35rem" }}>Our policy</h2>
        <p style={textStyle}>
          TriMerge Consulting Group, P.A. is an Equal Opportunity Employer. All qualified applicants
          will receive consideration for employment without regard to race, color, religion, sex,
          sexual orientation, gender identity, national origin, age, disability, genetic information,
          protected veteran status, or any other characteristic protected by applicable federal, state
          or local law.
        </p>
        <p style={textStyle}>
          This policy applies to all employment practices, including recruiting, hiring, placement,
          promotion, compensation, training and termination, for positions posted on TriMergePRO Careers
          by TriMerge Consulting Group, P.A.
        </p>
      </section>

      <section style={sectionStyle} aria-labelledby="eeo-accommodation">
        <h2 id="eeo-accommodation" style={{ fontSize: "1.35rem" }}>Reasonable accommodation</h2>
        <p style={textStyle}>
          If you need a reasonable accommodation to search for jobs, complete an application or take
          part in the interview process because of a disability, please contact us at{" "}
          <a href="mailto:careers@trimergeconsulting.com">careers@trimergeconsulting.com</a> or
          (305) 940-5344. Requests are handled confidentially.
        </p>
      </section>

      <section style={sectionStyle} aria-labelledby="eeo-employers">
        <h2 id="eeo-employers" style={{ fontSize: "1.35rem" }}>Employers using the platform</h2>
        <p style={textStyle}>
          Employers that post opportunities on TriMergePRO Careers are responsible for complying with
          equal employment opportunity laws that apply to them. Job postings must not express a
          preference or limitation based on any protected characteristic.
        </p>
      </section>

      <section style={sectionStyle} aria-labelledby="eeo-related">
        <h2 id="eeo-related" style={{ fontSize: "1.35rem" }}>Related information</h2>
        <ul style={{ ...textStyle, paddingLeft: "1.25rem", listStyle: "disc" }}>
          <li>
            <a href="https://www.eeoc.gov/poster" target="_blank" rel="noopener noreferrer">
              &ldquo;Know Your Rights: Workplace Discrimination is Illegal&rdquo; poster (EEOC)
            </a>
          </li>
          <li><Link href="/accessibility-statement">Accessibility Statement</Link></li>
          <li><Link href="/privacy-policy">Privacy Policy</Link></li>
        </ul>
      </section>
    </div>
  );
}
