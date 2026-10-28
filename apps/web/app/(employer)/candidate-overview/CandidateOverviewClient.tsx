"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from 'next/navigation';
import useGetApplicationsForJob from '../../../hooks/useGetApplicationsForJob';
import { Search, ChevronDown, ExternalLink, AlertTriangle, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import useApplicationAIMatch from '../../../hooks/useApplicationAIMatch';

type AIStatus = "completed" | "pending" | "failed" | "skipped";
type Recommendation = "strong" | "good" | "partial" | "low";
type Confidence = "high" | "medium" | "low";

interface Applicant {
  id: string;
  name: string;
  email: string;
  appliedDate: string;
  resumeUrl: string;
  aiStatus: AIStatus;
  aiScore: number;
  recommendation: Recommendation;
  confidence: Confidence;
  isStale: boolean;
  staleReason?: string;
  skills: {
    matched: string[];
    missing: string[];
    required: string[];
    preferred: string[];
  };
  recruiterSummary: string;
  detailedAnalysis: string;
  evidenceLog: string[];
  coverLetter?: string;
}

export default function CandidateOverviewClient({ jobId: jobIdOverride }: { jobId?: string } = {}) {
  const searchParams = useSearchParams();
  const jobId = jobIdOverride ?? searchParams.get('jobId') ?? undefined;

  const appsParams = useMemo(() => ({ page: 1, limit: 50 }), []);
  const { data: appsResponse, loading: appsLoading, error: appsError } = useGetApplicationsForJob(jobId ?? undefined, appsParams);

  const fetchedApplicants: Applicant[] = useMemo(() => {
    const apps = appsResponse as unknown;
    if (!apps || typeof apps !== 'object') return [];
    const asObj = apps as { applications?: unknown[] };
    if (!Array.isArray(asObj.applications)) return [];

    const mapAIStatus = (v: unknown): AIStatus => {
      const s = String(v ?? '').toLowerCase();
      if (s.includes('completed')) return 'completed';
      if (s.includes('pending')) return 'pending';
      if (s.includes('failed')) return 'failed';
      return 'skipped';
    };

    const mapRecommendation = (v: unknown): Recommendation => {
      const s = String(v ?? '').toLowerCase();
      if (s.includes('strong')) return 'strong';
      if (s.includes('good')) return 'good';
      if (s.includes('partial')) return 'partial';
      return 'low';
    };

    const mapConfidence = (v: unknown): Confidence => {
      const s = String(v ?? '').toLowerCase();
      if (s.includes('high')) return 'high';
      if (s.includes('medium')) return 'medium';
      return 'low';
    };

    return asObj.applications.map((item) => {
      const a = item as Record<string, unknown>;
      const candidate = (a['candidate'] as Record<string, unknown> | undefined) ?? {};
      const user = (candidate['user'] as Record<string, unknown> | undefined) ?? {};
      const profile = (candidate['profile'] as Record<string, unknown> | undefined) ?? {};
      const aiMatch = (a['aiMatch'] as Record<string, unknown> | undefined) ?? {};
      const createdAt = typeof a['createdAt'] === 'string' ? (a['createdAt'] as string) : (typeof a['updatedAt'] === 'string' ? (a['updatedAt'] as string) : new Date().toISOString());

      const evidenceArr = Array.isArray(aiMatch['evidence']) ? (aiMatch['evidence'] as unknown[]) : [];
      const evidenceLog = evidenceArr.map((e) => {
        const rec = e as Record<string, unknown>;
        return `${String(rec['criterion'] ?? '')}: ${String(rec['evidence'] ?? '')}`;
      });

      return {
        id: String(a['_id'] ?? a['id'] ?? ''),
        applicationId: String(a['_id'] ?? a['id'] ?? ''),
        name: String(user['email'] ?? '').split('@')?.[0] || 'Unknown',
        email: String(user['email'] ?? 'unknown@example.com'),
        appliedDate: createdAt,
        resumeUrl: String(profile['resumeUrl'] ?? '#'),
        aiStatus: mapAIStatus(a['aiMatchStatus'] ?? aiMatch['status']),
        aiScore: Number(aiMatch['overallScore'] ?? a['aiOverallScore'] ?? 0),
        recommendation: mapRecommendation(aiMatch['recommendation'] ?? a['aiRecommendation']),
        confidence: mapConfidence(aiMatch['confidenceLevel'] ?? 'medium'),
        isStale: !(aiMatch['freshness'] && (aiMatch['freshness'] as Record<string, unknown>)['isCurrent'] === true),
        staleReason: Array.isArray((aiMatch['freshness'] as Record<string, unknown> | undefined)?.['staleReasons']) ? ((aiMatch['freshness'] as Record<string, unknown>)['staleReasons'] as string[]).join(', ') : undefined,
        skills: {
          matched: Array.isArray(aiMatch['matchedSkills']) ? (aiMatch['matchedSkills'] as string[]) : [],
          missing: Array.isArray(aiMatch['missingSkills']) ? (aiMatch['missingSkills'] as string[]) : [],
          required: Array.isArray(aiMatch['requiredSkillsMatched']) ? (aiMatch['requiredSkillsMatched'] as string[]) : [],
          preferred: Array.isArray(aiMatch['preferredSkillsMatched']) ? (aiMatch['preferredSkillsMatched'] as string[]) : [],
        },
        recruiterSummary: String(aiMatch['recruiterSummary'] ?? aiMatch['detailedRecruiterAnalysis'] ?? ''),
        detailedAnalysis: String(aiMatch['detailedRecruiterAnalysis'] ?? aiMatch['confidenceReason'] ?? ''),
        evidenceLog,
        coverLetter: typeof a['coverLetter'] === 'string' ? (a['coverLetter'] as string) : undefined,
      } as Applicant;
    });
  }, [appsResponse]);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const { runMatch, loading: aiReRunning } = useApplicationAIMatch();

  useEffect(() => {
    if (!selectedApplicant && fetchedApplicants.length > 0) {
      const id = setTimeout(() => setSelectedApplicant(fetchedApplicants[0]), 0);
      return () => clearTimeout(id);
    }
    return;
  }, [fetchedApplicants, selectedApplicant]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRecommendation, setFilterRecommendation] = useState<string>("all");
  const [filterConfidence, setFilterConfidence] = useState<string>("all");
  const [filterAIStatus, setFilterAIStatus] = useState<string>("all");
  const [filterStaleOnly, setFilterStaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  const getRecommendationStyles = (rec: Recommendation) => {
    switch (rec) {
      case "strong":
        return { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" };
      case "good":
        return { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#bfdbfe" };
      case "partial":
        return { backgroundColor: "#fef9c3", color: "#854d0e", borderColor: "#fef08a" };
      case "low":
        return { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" };
    }
  };

  const getConfidenceStyles = (conf: Confidence) => {
    switch (conf) {
      case "high":
        return { backgroundColor: "#e0e7ff", color: "#3730a3" };
      case "medium":
        return { backgroundColor: "#f3e8ff", color: "#6b21a8" };
      case "low":
        return { backgroundColor: "#f1f5f9", color: "#334155" };
    }
  };

  const getStatusIcon = (status: AIStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle style={{ width: "16px", height: "16px", color: "#16a34a" }} />;
      case "pending":
        return <AlertCircle style={{ width: "16px", height: "16px", color: "#ca8a04" }} />;
      case "failed":
        return <XCircle style={{ width: "16px", height: "16px", color: "#dc2626" }} />;
      case "skipped":
        return <AlertCircle style={{ width: "16px", height: "16px", color: "#475569" }} />;
    }
  };

  const sourceApplicants = fetchedApplicants;

  const filteredApplicants = sourceApplicants
    .filter((app) => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRecommendation = filterRecommendation === "all" || app.recommendation === filterRecommendation;
      const matchesConfidence = filterConfidence === "all" || app.confidence === filterConfidence;
      const matchesAIStatus = filterAIStatus === "all" || app.aiStatus === filterAIStatus;
      const matchesStale = !filterStaleOnly || app.isStale;

      return matchesSearch && matchesRecommendation && matchesConfidence && matchesAIStatus && matchesStale;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case "oldest": return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        case "score-high": return b.aiScore - a.aiScore;
        case "score-low": return a.aiScore - b.aiScore;
        default: return 0;
      }
    });

  const handleRetry = () => {
    alert("Re-running AI evaluation...");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
      {/* Top Header */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Applicant Dashboard</h1>
            <p style={{ fontSize: "14px", color: "#475569", margin: "4px 0 0 0" }}>AI-powered talent matching and evaluation</p>
          </div>
        </div>
      </div>

      {/* Main Content: Split Screen */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Column: Applicant List */}
        <div style={{ width: "420px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
          {/* Filters */}
          <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  fontSize: "14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Filter Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ position: "relative" }}>
                <select
                  value={filterRecommendation}
                  onChange={(e) => setFilterRecommendation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 24px 6px 12px",
                    fontSize: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    appearance: "none",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <option value="all">All Recommendations</option>
                  <option value="strong">Strong</option>
                  <option value="good">Good</option>
                  <option value="partial">Partial</option>
                  <option value="low">Low Match</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#94a3b8", pointerEvents: "none" }} />
              </div>

              <div style={{ position: "relative" }}>
                <select
                  value={filterConfidence}
                  onChange={(e) => setFilterConfidence(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 24px 6px 12px",
                    fontSize: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    appearance: "none",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <option value="all">All Confidence</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#94a3b8", pointerEvents: "none" }} />
              </div>

              <div style={{ position: "relative" }}>
                <select
                  value={filterAIStatus}
                  onChange={(e) => setFilterAIStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 24px 6px 12px",
                    fontSize: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    appearance: "none",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="skipped">Skipped</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#94a3b8", pointerEvents: "none" }} />
              </div>

              <div style={{ position: "relative" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 24px 6px 12px",
                    fontSize: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    appearance: "none",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score-high">Score: High to Low</option>
                  <option value="score-low">Score: Low to High</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Stale Checkbox */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={filterStaleOnly}
                onChange={(e) => setFilterStaleOnly(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "12px", color: "#334155" }}>Stale Only</span>
            </label>
          </div>

          {/* Applicant List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredApplicants.map((applicant) => {
              const isSelected = selectedApplicant?.id === applicant.id;
              return (
                <button
                  key={applicant.id}
                  onClick={() => setSelectedApplicant(applicant)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderBottom: "1px solid #e2e8f0",
                    textAlign: "left",
                    backgroundColor: isSelected ? "#e0e7ff" : "#ffffff",
                    borderLeft: isSelected ? "4px solid #4f46e5" : "none",
                    cursor: "pointer",
                    display: "block",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{applicant.name}</h3>
                      <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{applicant.email}</p>
                    </div>
                    <div style={{ marginLeft: "8px", flexShrink: 0 }}>
                      {getStatusIcon(applicant.aiStatus)}
                    </div>
                  </div>

                  {applicant.aiStatus === "completed" && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                          border: "1px solid",
                          ...getRecommendationStyles(applicant.recommendation)
                        }}>
                          {applicant.recommendation}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#4f46e5" }}>{applicant.aiScore}%</span>
                      </div>
                      {applicant.isStale && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#b45309" }}>
                          <AlertTriangle style={{ width: "12px", height: "12px" }} />
                          <span>Stale</span>
                        </div>
                      )}
                    </>
                  )}

                  {applicant.aiStatus === "pending" && (
                    <p style={{ margin: 0, fontSize: "12px", color: "#ca8a04" }}>AI evaluation in progress...</p>
                  )}

                  {applicant.aiStatus === "failed" && (
                    <p style={{ margin: 0, fontSize: "12px", color: "#dc2626" }}>Evaluation failed</p>
                  )}

                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Applied {new Date(applicant.appliedDate).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' })}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#f8fafc", padding: "24px" }}>
          {appsLoading ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "48px", textAlign: "center" }}>
              <AlertCircle style={{ width: "64px", height: "64px", color: "#eab308", margin: "0 auto 16px auto" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>Loading applicants...</h3>
              <p style={{ color: "#475569", margin: 0 }}>Fetching applications for job {jobId ?? '(no job specified)'}</p>
            </div>
          ) : appsError ? (
            <div style={{ backgroundColor: "#fff7f5", borderRadius: "8px", border: "1px solid #fee2e2", padding: "24px", textAlign: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#991b1b" }}>Failed to load applications</h3>
              <p style={{ color: "#7f1d1d" }}>{String(appsError)}</p>
            </div>
          ) : !selectedApplicant ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "48px", textAlign: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>No applicants yet</h3>
              <p style={{ color: "#475569", margin: 0 }}>No applications were found for job {jobId ?? '(no job specified)'}</p>
            </div>
          ) : selectedApplicant!.aiStatus === "pending" ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "48px", textAlign: "center" }}>
              <AlertCircle style={{ width: "64px", height: "64px", color: "#eab308", margin: "0 auto 16px auto" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>AI Evaluation In Progress</h3>
              <p style={{ color: "#475569", margin: 0 }}>The AI is currently analyzing this applicant&apos;s resume and qualifications.</p>
            </div>
          ) : selectedApplicant!.aiStatus === "failed" ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "48px", textAlign: "center" }}>
              <XCircle style={{ width: "64px", height: "64px", color: "#ef4444", margin: "0 auto 16px auto" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>Evaluation Failed</h3>
              <p style={{ color: "#475569", marginBottom: "16px", marginTop: 0 }}>The AI evaluation encountered an error and could not complete.</p>
              <button
                onClick={handleRetry}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px"
                }}
              >
                <RefreshCw style={{ width: "16px", height: "16px" }} />
                Retry AI Evaluation
              </button>
            </div>
          ) : appsError ? (
            <div style={{ backgroundColor: "#fff7f5", borderRadius: "8px", border: "1px solid #fee2e2", padding: "24px", textAlign: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#991b1b" }}>Failed to load applications</h3>
              <p style={{ color: "#7f1d1d" }}>{String(appsError)}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a", margin: "0 0 4px 0" }}>{selectedApplicant!.name}</h2>
                    <p style={{ color: "#475569", margin: 0 }}>{selectedApplicant!.email}</p>
                  </div>
                  <a
                    href={selectedApplicant!.resumeUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "14px"
                    }}
                  >
                    <ExternalLink style={{ width: "16px", height: "16px" }} />
                    Open Resume
                  </a>
                  {/* <a
                    href={selectedApplicant!.resumeUrl ?? '#'}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "14px"
                    }}
                  >
                    <ExternalLink style={{ width: "16px", height: "16px" }} />
                    View Resume
                  </a> */}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "6px", fontSize: "14px" }}>
                  Under Review
                </div>
              </div>

              {/* Stale Warning */}
              {selectedApplicant!.isStale && (
                <div style={{ backgroundColor: "#fffbeb", borderLeft: "4px solid #f59e0b", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                      <AlertTriangle style={{ width: "20px", height: "20px", color: "#d97706", marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontWeight: 500, color: "#78350f" }}>This AI evaluation may be outdated</h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#92400e" }}>Reason: {selectedApplicant!.staleReason}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!selectedApplicant || !(selectedApplicant as unknown && (selectedApplicant as unknown as Record<string, unknown>)['applicationId'])) return;
                        const id = String((selectedApplicant as unknown as Record<string, unknown>)['applicationId']);
                        const payload = await runMatch(id);
                        if (payload && payload.application) {
                          const app = (payload.application as Record<string, unknown> | undefined) ?? {};
                          const aiEval = (payload.aiEvaluation as Record<string, unknown> | undefined) ?? undefined;
                          setSelectedApplicant((prev) => {
                            if (!prev) return prev;
                            const aiMatchStatus = String(app['aiMatchStatus'] ?? ((app['aiMatch'] as Record<string, unknown> | undefined)?.['status']) ?? 'completed').toLowerCase();
                            const aiScore = Number(app['aiOverallScore'] ?? ((app['aiMatch'] as Record<string, unknown> | undefined)?.['overallScore']) ?? prev.aiScore);
                            const recommendation = String((app['aiRecommendation'] ?? ((app['aiMatch'] as Record<string, unknown> | undefined)?.['recommendation']) ?? prev.recommendation)).toLowerCase() as Recommendation;
                            const confidence = String((aiEval?.['confidenceLevel'] ?? ((app['aiMatch'] as Record<string, unknown> | undefined)?.['confidenceLevel']) ?? prev.confidence)).toLowerCase() as Confidence;
                            const recruiterSummaryNew = String(aiEval?.['recruiterSummary'] ?? ((app['aiMatch'] as Record<string, unknown> | undefined)?.['recruiterSummary']) ?? prev.recruiterSummary);
                            const detailedAnalysisNew = String(aiEval?.['detailedRecruiterAnalysis'] ?? ((app['aiMatch'] as Record<string, unknown> | undefined)?.['detailedRecruiterAnalysis']) ?? prev.detailedAnalysis);
                            const newEvidence = Array.isArray(aiEval?.['evidence']) ? (aiEval!['evidence'] as unknown[]).map((e) => {
                              const rec = e as Record<string, unknown>;
                              return `${String(rec['criterion'] ?? '')}: ${String(rec['evidence'] ?? '')}`;
                            }) : prev.evidenceLog;

                            return {
                              ...prev,
                              aiStatus: aiMatchStatus as AIStatus,
                              aiScore,
                              recommendation,
                              confidence,
                              recruiterSummary: recruiterSummaryNew,
                              detailedAnalysis: detailedAnalysisNew,
                              evidenceLog: newEvidence,
                            } as Applicant;
                          });
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#d97706",
                        color: "#ffffff",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        flexShrink: 0
                      }}
                    >
                      <RefreshCw style={{ width: "14px", height: "14px" }} />
                      {aiReRunning ? 'Re-running...' : 'Re-run AI Evaluation'}
                    </button>
                  </div>
                </div>
              )}

              {/* AI Match Overview */}
              <div style={{ background: "linear-gradient(to bottom right, #eef2ff, #f3e8ff)", borderRadius: "8px", border: "1px solid #c7d2fe", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 500, color: "#334155" }}>AI Match Overview</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", fontWeight: 700, color: "#4f46e5", marginBottom: "4px" }}>{selectedApplicant!.aiScore}%</div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>AI Match Score</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px" }}>AI Recommendation</span>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 500,
                        border: "1px solid",
                        ...getRecommendationStyles(selectedApplicant!.recommendation)
                      }}>
                        {selectedApplicant!.recommendation.charAt(0).toUpperCase() + selectedApplicant!.recommendation.slice(1)} Match
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px" }}>AI Confidence Level</span>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 500,
                        ...getConfidenceStyles(selectedApplicant!.confidence)
                      }}>
                        {selectedApplicant!.confidence.charAt(0).toUpperCase() + selectedApplicant!.confidence.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Skills Breakdown Matrix</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500, color: "#15803d" }}>Matched Skills</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {selectedApplicant!.skills.matched.map((skill, idx) => (
                        <span key={idx} style={{ padding: "4px 10px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "4px", fontSize: "12px", fontWeight: 500 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500, color: "#b91c1c" }}>Missing Skills</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {selectedApplicant!.skills.missing.map((skill, idx) => (
                        <span key={idx} style={{ padding: "4px 10px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "4px", fontSize: "12px", fontWeight: 500 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 500, color: "#334155" }}>Required vs Preferred Breakdown</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#475569" }}>Required Skills</span>
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {selectedApplicant!.skills.matched.filter(s => selectedApplicant!.skills.required.includes(s)).length}/{selectedApplicant!.skills.required.length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {selectedApplicant!.skills.required.map((skill, idx) => {
                          const isMatched = selectedApplicant!.skills.matched.includes(skill);
                          return (
                            <span
                              key={idx}
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                backgroundColor: isMatched ? "#dcfce7" : "#f1f5f9",
                                color: isMatched ? "#166534" : "#475569",
                                textDecoration: isMatched ? "none" : "line-through"
                              }}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#475569" }}>Preferred Skills</span>
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {selectedApplicant!.skills.matched.filter(s => selectedApplicant!.skills.preferred.includes(s)).length}/{selectedApplicant!.skills.preferred.length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {selectedApplicant!.skills.preferred.map((skill, idx) => {
                          const isMatched = selectedApplicant!.skills.matched.includes(skill);
                          return (
                            <span
                              key={idx}
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                backgroundColor: isMatched ? "#dbeafe" : "#f1f5f9",
                                color: isMatched ? "#1e40af" : "#475569",
                                textDecoration: isMatched ? "none" : "line-through"
                              }}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis Workspace */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>AI Analysis Workspace</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500, color: "#4338ca" }}>Recruiter Summary</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>{selectedApplicant!.recruiterSummary}</p>
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500, color: "#4338ca" }}>Detailed AI Analysis</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>{selectedApplicant!.detailedAnalysis}</p>
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 500, color: "#4338ca" }}>Evidence / Justification Log</h4>
                    <ul style={{ margin: 0, padding: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedApplicant!.evidenceLog.map((evidence, idx) => (
                        <li key={idx} style={{ display: "flex", alignItems: "start", gap: "8px", fontSize: "14px", color: "#334155" }}>
                          <span style={{ width: "6px", height: "6px", backgroundColor: "#6366f1", borderRadius: "50%", marginTop: "6px", flexShrink: 0 }} />
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplicant!.coverLetter && (
                <details style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "24px" }}>
                  <summary style={{ fontWeight: 600, color: "#0f172a", cursor: "pointer", outline: "none" }}>Cover Letter</summary>
                  <div style={{ marginTop: "16px", fontSize: "14px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {selectedApplicant!.coverLetter}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
