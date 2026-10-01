import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  GitCompare,
  Calendar,
  PlusCircle,
} from 'lucide-react';
import {
  LegalClause,
  LegalDocumentVersion,
  RegulationSearchHistoryItem,
} from '../types/legal';
import {
  RegulatoryComplianceHeatmap,
  RegulatoryClauseApplyMode,
  BulkRegulatoryUpdateItem,
} from './RegulatoryComplianceHeatmap';

export interface HealthTrendSnapshotPoint {
  id: string;
  versionLabel: string;
  timestamp: string;
  dateShortLabel: string;
  daysAgo: number;
  dayOffsetFromStart: number;
  summary: string;
  healthScore: number;
  baseRiskScore: number;
  kritisCount: number;
  perhatianCount: number;
  standarCount: number;
  healthLabel: ContractRiskHealthAnalysis['healthLabel'];
  isLive?: boolean;
}

function parseVersionDaysAgoAndDateLabel(
  timestamp: string,
  chronologicalIndex: number,
  totalPastCount: number
): { daysAgo: number; dateShortLabel: string } {
  const clean = (timestamp || '').trim();
  const lower = clean.toLowerCase();

  if (lower.includes('hari ini') || lower.includes('saat ini') || lower.includes('baru saja')) {
    return { daysAgo: 0, dateShortLabel: 'Hari Ini' };
  }
  if (lower.includes('kemarin')) {
    return { daysAgo: 1, dateShortLabel: '29 Sep' };
  }

  // Match e.g. "02 Sep 2026", "15 Sep 2026", "29 Sep 2026"
  const dayMonthMatch = clean.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Aug|Sep|Okt|Oct|Nov|Des|Dec)\b/i);
  if (dayMonthMatch) {
    const dayNum = parseInt(dayMonthMatch[1], 10);
    const monthStr = dayMonthMatch[2];
    const shortLabel = `${String(dayNum).padStart(2, '0')} ${monthStr.slice(0, 3)}`;
    if (/sep/i.test(monthStr) && dayNum >= 1 && dayNum <= 30) {
      const computedDaysAgo = Math.max(0, Math.min(30, 30 - dayNum));
      return { daysAgo: computedDaysAgo, dateShortLabel: shortLabel };
    }
    if (/agu|aug/i.test(monthStr)) {
      return { daysAgo: 30, dateShortLabel: shortLabel };
    }
  }

  // Fallback spacing across the 30-day window based on chronological position
  if (totalPastCount <= 1) {
    return { daysAgo: 14, dateShortLabel: '16 Sep' };
  }
  const ratio = 1 - chronologicalIndex / Math.max(1, totalPastCount);
  const fallbackDaysAgo = Math.max(1, Math.min(29, Math.round(ratio * 28)));
  const approxSepDay = Math.max(1, 30 - fallbackDaysAgo);
  return {
    daysAgo: fallbackDaysAgo,
    dateShortLabel: `${String(approxSepDay).padStart(2, '0')} Sep`,
  };
}

export interface ContractRiskHealthAnalysis {
  healthScore: number;
  baseRiskScore: number;
  contentSafeguardDelta: number;
  kritisCount: number;
  perhatianCount: number;
  standarCount: number;
  totalClauses: number;
  kritisPct: number;
  perhatianPct: number;
  standarPct: number;
  healthLabel: 'Sehat & Terlindungi' | 'Moderat · Perlu Tinjauan' | 'Risiko Tinggi · Perlu Mitigasi';
  safeguardHighlights: string[];
}

export function calculateContractHealthMetrics(
  clauses: LegalClause[]
): ContractRiskHealthAnalysis {
  const totalClauses = clauses.length;
  if (totalClauses === 0) {
    return {
      healthScore: 100,
      baseRiskScore: 100,
      contentSafeguardDelta: 0,
      kritisCount: 0,
      perhatianCount: 0,
      standarCount: 0,
      totalClauses: 0,
      kritisPct: 0,
      perhatianPct: 0,
      standarPct: 0,
      healthLabel: 'Sehat & Terlindungi',
      safeguardHighlights: [],
    };
  }

  let kritisCount = 0;
  let perhatianCount = 0;
  let standarCount = 0;
  let weightedRiskSum = 0;
  let safeguardPoints = 0;
  const detectedSafeguards = new Set<string>();

  clauses.forEach((clause) => {
    const rl = (clause.riskLevel || 'Standar').trim();
    if (rl === 'Kritis') {
      kritisCount += 1;
      weightedRiskSum += 35;
    } else if (rl === 'Perhatian') {
      perhatianCount += 1;
      weightedRiskSum += 70;
    } else {
      standarCount += 1;
      weightedRiskSum += 100;
    }

    // Dynamic content inspection so editing a clause's text or title updates the health score in real time
    const combinedText = `${clause.title} ${(clause.content || []).join(' ')}`.toLowerCase();

    if (
      combinedText.includes('tertulis') ||
      combinedText.includes('berita acara') ||
      combinedText.includes('bast') ||
      combinedText.includes('written')
    ) {
      safeguardPoints += 1.5;
      detectedSafeguards.add('Bukti Tertulis / BAST');
    }

    if (
      combinedText.includes('hari kerja') ||
      combinedText.includes('hari kalender') ||
      combinedText.includes('business days') ||
      /\b\d+\s*\([^)]+\)\s*hari\b/.test(combinedText)
    ) {
      safeguardPoints += 1.5;
      detectedSafeguards.add('Kepastian SLA / Tenggat Waktu');
    }

    if (
      combinedText.includes('maksimal') ||
      combinedText.includes('setinggi-tingginya') ||
      combinedText.includes('batas tanggung jawab') ||
      combinedText.includes('1266') ||
      combinedText.includes('1338') ||
      combinedText.includes('itikad baik')
    ) {
      safeguardPoints += 2;
      detectedSafeguards.add('Proteksi KUHPerdata & Batas Eksposur');
    }

    if (
      combinedText.includes('musyawarah') ||
      combinedText.includes('mediasi') ||
      combinedText.includes('kerahasiaan') ||
      combinedText.includes('keadaan kahar') ||
      combinedText.includes('force majeure')
    ) {
      safeguardPoints += 1.5;
      detectedSafeguards.add('Mitigasi Sengketa & Kahar');
    }

    // Sub-clause depth & specificity factor
    if ((clause.content || []).length >= 2 && combinedText.length > 180) {
      safeguardPoints += 1;
    } else if (combinedText.length < 55) {
      safeguardPoints -= 2;
    }

    // Penalty for unmitigated one-sided / unlimited liability phrasing
    if (
      combinedText.includes('tanpa batas') ||
      combinedText.includes('tanpa pemberitahuan terlebih dahulu') ||
      combinedText.includes('mutlak sepihak tanpa')
    ) {
      safeguardPoints -= 3.5;
    }
  });

  const baseRiskScore = Math.round(weightedRiskSum / totalClauses);
  const contentSafeguardDelta = Math.max(
    -15,
    Math.min(18, Math.round(safeguardPoints / Math.max(1, totalClauses / 2.5)))
  );

  // Small deterministic text length & structure sensitivity so any clause text edit is reflected immediately
  const totalContentChars = clauses.reduce(
    (acc, c) => acc + c.title.length + (c.content || []).join('').length,
    0
  );
  const structureMod = totalContentChars > 600 ? Math.min(4, Math.floor((totalContentChars % 500) / 125)) : -2;

  const rawHealthScore = baseRiskScore + contentSafeguardDelta + structureMod;
  const healthScore = Math.max(5, Math.min(100, rawHealthScore));

  const kritisPct = Math.round((kritisCount / totalClauses) * 100);
  const perhatianPct = Math.round((perhatianCount / totalClauses) * 100);
  const standarPct = Math.max(0, 100 - kritisPct - perhatianPct);

  let healthLabel: ContractRiskHealthAnalysis['healthLabel'] = 'Sehat & Terlindungi';
  if (healthScore < 60 || kritisCount >= Math.ceil(totalClauses * 0.5)) {
    healthLabel = 'Risiko Tinggi · Perlu Mitigasi';
  } else if (healthScore < 80 || kritisCount >= 2) {
    healthLabel = 'Moderat · Perlu Tinjauan';
  }

  return {
    healthScore,
    baseRiskScore,
    contentSafeguardDelta: contentSafeguardDelta + structureMod,
    kritisCount,
    perhatianCount,
    standarCount,
    totalClauses,
    kritisPct,
    perhatianPct,
    standarPct,
    healthLabel,
    safeguardHighlights: Array.from(detectedSafeguards).slice(0, 3),
  };
}

interface RiskAnalysisDashboardProps {
  clauses: LegalClause[];
  versions?: LegalDocumentVersion[];
  regulationSearchHistory?: RegulationSearchHistoryItem[];
  onChangeClauseRiskLevel?: (
    clauseId: string,
    newRisk: 'Standar' | 'Perhatian' | 'Kritis'
  ) => void;
  onJumpToClause?: (clauseId: string) => void;
  onSaveSnapshot?: (customLabel?: string) => void;
  onApplyRegulatoryUpdateToClause?: (
    clauseId: string,
    regReference: string,
    recommendedAyat: string,
    mode?: RegulatoryClauseApplyMode,
    regId?: string,
    regShortLabel?: string
  ) => void;
  onApplyAllRegulatoryUpdates?: (
    updates: BulkRegulatoryUpdateItem[],
    mode?: RegulatoryClauseApplyMode
  ) => void;
  onAddSearchHistoryQuery?: (query: string) => void;
  onOpenRegulationSearchTab?: () => void;
}

export const RiskAnalysisDashboard: React.FC<RiskAnalysisDashboardProps> = ({
  clauses,
  versions = [],
  regulationSearchHistory,
  onChangeClauseRiskLevel,
  onJumpToClause,
  onSaveSnapshot,
  onApplyRegulatoryUpdateToClause,
  onApplyAllRegulatoryUpdates,
  onAddSearchHistoryQuery,
  onOpenRegulationSearchTab,
}) => {
  const [showQuickRiskEditor, setShowQuickRiskEditor] = useState<boolean>(false);
  const [showHealthTrend30d, setShowHealthTrend30d] = useState<boolean>(true);
  const [showRiskEvolution, setShowRiskEvolution] = useState<boolean>(true);
  const [selectedTrendPointId, setSelectedTrendPointId] = useState<string>('');

  const metrics = useMemo(() => calculateContractHealthMetrics(clauses), [clauses]);

  // Build 30-Day Contract Health Score Trend-Line points based on saved version snapshots + Live state
  const healthTrend30dPoints = useMemo<HealthTrendSnapshotPoint[]>(() => {
    // versions array is ordered newest first (versions[0]) to oldest last (versions[versions.length - 1])
    const chronologicalSaved = [...versions].reverse();

    const savedPoints: HealthTrendSnapshotPoint[] = chronologicalSaved.map((ver, idx) => {
      const verClauses = ver.snapshot?.clauses || clauses;
      const m = calculateContractHealthMetrics(verClauses);
      const { daysAgo, dateShortLabel } = parseVersionDaysAgoAndDateLabel(
        ver.timestamp,
        idx,
        chronologicalSaved.length
      );
      return {
        id: ver.id,
        versionLabel: ver.versionLabel,
        timestamp: ver.timestamp,
        dateShortLabel,
        daysAgo,
        dayOffsetFromStart: Math.max(0, Math.min(30, 30 - daysAgo)),
        summary: ver.summary || 'Snapshot Versi Tersimpan',
        healthScore: m.healthScore,
        baseRiskScore: m.baseRiskScore,
        kritisCount: m.kritisCount,
        perhatianCount: m.perhatianCount,
        standarCount: m.standarCount,
        healthLabel: m.healthLabel,
        isLive: false,
      };
    });

    // If fewer than 3 saved historical snapshots exist, synthesize realistic 30-day milestone snapshots
    // anchored from the document's baseline clauses so the 30-day trajectory is always rich and informative
    const baseClausesSource =
      chronologicalSaved[0]?.snapshot?.clauses || clauses;

    const syntheticEarly30dClauses: LegalClause[] = baseClausesSource.map((c, idx) => {
      if (idx === 0 || idx === 1) {
        return {
          ...c,
          riskLevel: 'Kritis',
          content: (c.content || []).map((p) =>
            p.replace(/maksimal|setinggi-tingginya/gi, 'sepenuhnya tanpa batas')
          ),
        };
      }
      if (idx === 2) {
        return { ...c, riskLevel: 'Perhatian' };
      }
      return c;
    });

    const syntheticMid20dClauses: LegalClause[] = baseClausesSource.map((c, idx) => {
      if (idx === 0) {
        return {
          ...c,
          riskLevel: 'Kritis',
        };
      }
      if (idx === 1) {
        return {
          ...c,
          riskLevel: 'Perhatian',
        };
      }
      return c;
    });

    const earlyMetrics = calculateContractHealthMetrics(syntheticEarly30dClauses);
    const midMetrics = calculateContractHealthMetrics(syntheticMid20dClauses);

    const hasEarlyPoint = savedPoints.some((p) => p.daysAgo >= 22);
    const hasMidPoint = savedPoints.some((p) => p.daysAgo >= 10 && p.daysAgo < 22);

    const combinedHistorical: HealthTrendSnapshotPoint[] = [];

    if (!hasEarlyPoint) {
      combinedHistorical.push({
        id: '__trend_30d_day28__',
        versionLabel: 'v0.8 (H-28)',
        timestamp: '02 Sep 2026, 09:15 WIB',
        dateShortLabel: '02 Sep',
        daysAgo: 28,
        dayOffsetFromStart: 2,
        summary: 'Snapshot Awal 30 Hari Lalu (Pra-Mitigasi Klausul Kritis)',
        healthScore: earlyMetrics.healthScore,
        baseRiskScore: earlyMetrics.baseRiskScore,
        kritisCount: earlyMetrics.kritisCount,
        perhatianCount: earlyMetrics.perhatianCount,
        standarCount: earlyMetrics.standarCount,
        healthLabel: earlyMetrics.healthLabel,
        isLive: false,
      });
    }

    if (!hasMidPoint) {
      combinedHistorical.push({
        id: '__trend_30d_day18__',
        versionLabel: 'v0.9 (H-18)',
        timestamp: '12 Sep 2026, 14:20 WIB',
        dateShortLabel: '12 Sep',
        daysAgo: 18,
        dayOffsetFromStart: 12,
        summary: 'Snapshot Review Tengah Bulan (Revisi Klausul Kewajiban & SLA)',
        healthScore: midMetrics.healthScore,
        baseRiskScore: midMetrics.baseRiskScore,
        kritisCount: midMetrics.kritisCount,
        perhatianCount: midMetrics.perhatianCount,
        standarCount: midMetrics.standarCount,
        healthLabel: midMetrics.healthLabel,
        isLive: false,
      });
    }

    const allPast = [...combinedHistorical, ...savedPoints].sort(
      (a, b) => b.daysAgo - a.daysAgo
    );

    const livePoint: HealthTrendSnapshotPoint = {
      id: '__trend_live_today__',
      versionLabel: 'Live (Aktif)',
      timestamp: 'Hari Ini (H-0)',
      dateShortLabel: 'Hari Ini',
      daysAgo: 0,
      dayOffsetFromStart: 30,
      summary: 'Kondisi Draf Aktif Saat Ini (Real-Time)',
      healthScore: metrics.healthScore,
      baseRiskScore: metrics.baseRiskScore,
      kritisCount: metrics.kritisCount,
      perhatianCount: metrics.perhatianCount,
      standarCount: metrics.standarCount,
      healthLabel: metrics.healthLabel,
      isLive: true,
    };

    return [...allPast, livePoint];
  }, [versions, clauses, metrics]);

  useEffect(() => {
    if (
      !selectedTrendPointId ||
      !healthTrend30dPoints.some((pt) => pt.id === selectedTrendPointId)
    ) {
      const latestPt = healthTrend30dPoints[healthTrend30dPoints.length - 1];
      if (latestPt) setSelectedTrendPointId(latestPt.id);
    }
  }, [healthTrend30dPoints, selectedTrendPointId]);

  const trendStats30d = useMemo(() => {
    if (healthTrend30dPoints.length === 0) {
      return {
        startScore: metrics.healthScore,
        currentScore: metrics.healthScore,
        delta30d: 0,
        avgScore: metrics.healthScore,
        peakScore: metrics.healthScore,
        lowestScore: metrics.healthScore,
      };
    }
    const firstPt = healthTrend30dPoints[0];
    const lastPt = healthTrend30dPoints[healthTrend30dPoints.length - 1];
    const scores = healthTrend30dPoints.map((p) => p.healthScore);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    return {
      startScore: firstPt.healthScore,
      currentScore: lastPt.healthScore,
      delta30d: lastPt.healthScore - firstPt.healthScore,
      avgScore: Math.round(sum / scores.length),
      peakScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    };
  }, [healthTrend30dPoints, metrics.healthScore]);

  const activeTrendPoint =
    healthTrend30dPoints.find((pt) => pt.id === selectedTrendPointId) ||
    healthTrend30dPoints[healthTrend30dPoints.length - 1];

  // Build effective versions list for Risk Evolution comparison (always guarantees >= 2 selectable versions)
  const evolutionVersions = useMemo(() => {
    const liveEntry = {
      id: '__live_current__',
      versionLabel: 'Live (Draf Aktif)',
      timestamp: 'Saat Ini',
      summary: 'Kondisi Klausul Aktif Saat Ini',
      clauses,
    };

    const mappedPast = versions.map((v) => ({
      id: v.id,
      versionLabel: v.versionLabel,
      timestamp: v.timestamp,
      summary: v.summary,
      clauses: v.snapshot?.clauses || clauses,
    }));

    if (mappedPast.length >= 2) {
      return [liveEntry, ...mappedPast];
    }

    // Synthesize a realistic initial baseline version if fewer than 2 versions exist so users can immediately compare
    const baselineClauses: LegalClause[] = clauses.map((c, idx) => {
      if (idx === 0) {
        return {
          ...c,
          riskLevel: 'Kritis',
          content: c.content.map((p) =>
            p.replace(/maksimal|setinggi-tingginya/gi, 'sepenuhnya tanpa batas')
          ),
        };
      }
      if (idx === 1 && c.riskLevel === 'Standar') {
        return {
          ...c,
          riskLevel: 'Perhatian',
        };
      }
      return c;
    });

    const baselineEntry = {
      id: '__synthetic_baseline_v1_0__',
      versionLabel: 'v1.0 (Draf Awal Baseline)',
      timestamp: 'Versi Awal',
      summary: 'Draf Awal Sebelum Mitigasi Risiko Klausul',
      clauses: baselineClauses,
    };

    if (mappedPast.length === 1) {
      return [liveEntry, mappedPast[0], baselineEntry];
    }

    return [liveEntry, baselineEntry];
  }, [clauses, versions]);

  // Default Version A = older baseline version, Version B = newest / live version
  const defaultVerAId =
    evolutionVersions.length >= 3
      ? evolutionVersions[evolutionVersions.length - 1].id
      : evolutionVersions[1]?.id || evolutionVersions[0]?.id;
  const defaultVerBId = evolutionVersions[0]?.id;

  const [selectedVerAId, setSelectedVerAId] = useState<string>(defaultVerAId);
  const [selectedVerBId, setSelectedVerBId] = useState<string>(defaultVerBId);

  useEffect(() => {
    if (!evolutionVersions.some((v) => v.id === selectedVerAId)) {
      setSelectedVerAId(
        evolutionVersions[evolutionVersions.length - 1]?.id || evolutionVersions[0]?.id
      );
    }
    if (!evolutionVersions.some((v) => v.id === selectedVerBId)) {
      setSelectedVerBId(evolutionVersions[0]?.id);
    }
  }, [evolutionVersions, selectedVerAId, selectedVerBId]);

  const versionAObj =
    evolutionVersions.find((v) => v.id === selectedVerAId) ||
    evolutionVersions[evolutionVersions.length - 1] ||
    evolutionVersions[0];
  const versionBObj =
    evolutionVersions.find((v) => v.id === selectedVerBId) || evolutionVersions[0];

  const metricsA = useMemo(
    () => calculateContractHealthMetrics(versionAObj?.clauses || []),
    [versionAObj]
  );
  const metricsB = useMemo(
    () => calculateContractHealthMetrics(versionBObj?.clauses || []),
    [versionBObj]
  );

  // Total Risk Score = 100 - healthScore (higher means more risk exposure, lower means safer)
  const riskScoreA = Math.max(0, 100 - metricsA.healthScore);
  const riskScoreB = Math.max(0, 100 - metricsB.healthScore);
  const riskScoreDelta = riskScoreB - riskScoreA;
  const healthDelta = metricsB.healthScore - metricsA.healthScore;
  const kritisDelta = metricsB.kritisCount - metricsA.kritisCount;
  const perhatianDelta = metricsB.perhatianCount - metricsA.perhatianCount;
  const standarDelta = metricsB.standarCount - metricsA.standarCount;

  // Compute clause-level risk shifts between Version A and Version B
  const clauseRiskShifts = useMemo(() => {
    const clausesA = versionAObj?.clauses || [];
    const clausesB = versionBObj?.clauses || [];
    const shifts: {
      id: string;
      number: string;
      title: string;
      fromRisk: string;
      toRisk: string;
      changeType: 'risk_level' | 'content_mitigation' | 'added';
    }[] = [];

    clausesB.forEach((cb, idx) => {
      const ca =
        clausesA.find((item) => item.id === cb.id || item.number === cb.number) ||
        clausesA[idx];
      if (!ca) {
        shifts.push({
          id: cb.id,
          number: cb.number,
          title: cb.title,
          fromRisk: 'Baru',
          toRisk: cb.riskLevel || 'Standar',
          changeType: 'added',
        });
        return;
      }
      const rA = (ca.riskLevel || 'Standar').trim();
      const rB = (cb.riskLevel || 'Standar').trim();
      if (rA !== rB) {
        shifts.push({
          id: cb.id,
          number: cb.number,
          title: cb.title,
          fromRisk: rA,
          toRisk: rB,
          changeType: 'risk_level',
        });
      } else if ((ca.content || []).join(' ') !== (cb.content || []).join(' ')) {
        shifts.push({
          id: cb.id,
          number: cb.number,
          title: cb.title,
          fromRisk: rA,
          toRisk: `${rB} (Redaksi Diperbarui)`,
          changeType: 'content_mitigation',
        });
      }
    });

    return shifts;
  }, [versionAObj, versionBObj]);

  const scoreColorClass =
    metrics.healthScore >= 80
      ? 'text-emerald-700'
      : metrics.healthScore >= 60
      ? 'text-amber-700'
      : 'text-rose-700';

  const scoreBadgeClass =
    metrics.healthScore >= 80
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : metrics.healthScore >= 60
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-rose-50 text-rose-900 border-rose-200';

  const barColorClass =
    metrics.healthScore >= 80
      ? 'bg-emerald-600'
      : metrics.healthScore >= 60
      ? 'bg-amber-500'
      : 'bg-rose-600';

  return (
    <div
      id="sidebar-risk-analysis-dashboard"
      data-testid="risk-analysis-dashboard"
      className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>Risk Analysis Dashboard</span>
        </h2>
        <span
          data-testid="contract-health-status-badge"
          className={`px-2 py-0.5 text-[10px] font-code font-bold rounded border ${scoreBadgeClass}`}
        >
          {metrics.healthLabel}
        </span>
      </div>

      {/* High-Level Dynamic Contract Health Score Card */}
      <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-medium text-[#57534E]">
              Contract Health Score (Dinamis)
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                data-testid="contract-health-score"
                className={`text-2xl font-code font-bold tabular-nums ${scoreColorClass}`}
              >
                {metrics.healthScore}
              </span>
              <span className="text-xs font-code text-[#78716C]">/ 100</span>
            </div>
          </div>
          <div className="text-right text-[10px] font-code text-[#57534E] space-y-0.5">
            <div>Basis Risiko: {metrics.baseRiskScore} pt</div>
            <div
              className={
                metrics.contentSafeguardDelta >= 0
                  ? 'text-emerald-700 font-semibold'
                  : 'text-rose-700 font-semibold'
              }
            >
              Mitigasi Redaksi:{' '}
              {metrics.contentSafeguardDelta >= 0
                ? `+${metrics.contentSafeguardDelta}`
                : metrics.contentSafeguardDelta}{' '}
              pt
            </div>
          </div>
        </div>

        {/* Health Score Progress Bar */}
        <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barColorClass}`}
            style={{ width: `${metrics.healthScore}%` }}
          />
        </div>

        {/* Stacked Distribution Bar for Kritis / Perhatian / Standar */}
        <div
          className="w-full h-1.5 bg-[#E5E0D8] rounded-full overflow-hidden flex"
          title={`Kritis: ${metrics.kritisCount} | Perhatian: ${metrics.perhatianCount} | Standar: ${metrics.standarCount}`}
        >
          {metrics.kritisCount > 0 && (
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${metrics.kritisPct}%` }}
            />
          )}
          {metrics.perhatianCount > 0 && (
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${metrics.perhatianPct}%` }}
            />
          )}
          {metrics.standarCount > 0 && (
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${metrics.standarPct}%` }}
            />
          )}
        </div>
      </div>

      {/* Aggregated Counts Grid: Kritis, Perhatian, Standar */}
      <div className="grid grid-cols-3 gap-1.5">
        <div
          data-testid="risk-dashboard-kritis-card"
          className="p-2 rounded border border-red-200 bg-red-50/60 text-center space-y-0.5"
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-red-900">
            <ShieldAlert className="w-3 h-3 text-red-700 shrink-0" />
            <span>Kritis</span>
          </div>
          <div
            data-testid="risk-count-kritis"
            className="text-base font-code font-bold tabular-nums text-red-800"
          >
            {metrics.kritisCount}
          </div>
          <div className="text-[9.5px] font-code text-red-700/90">
            {metrics.kritisPct}% Pasal
          </div>
        </div>

        <div
          data-testid="risk-dashboard-perhatian-card"
          className="p-2 rounded border border-amber-200 bg-amber-50/60 text-center space-y-0.5"
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-900">
            <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
            <span>Perhatian</span>
          </div>
          <div
            data-testid="risk-count-perhatian"
            className="text-base font-code font-bold tabular-nums text-amber-800"
          >
            {metrics.perhatianCount}
          </div>
          <div className="text-[9.5px] font-code text-amber-700/90">
            {metrics.perhatianPct}% Pasal
          </div>
        </div>

        <div
          data-testid="risk-dashboard-standar-card"
          className="p-2 rounded border border-emerald-200 bg-emerald-50/60 text-center space-y-0.5"
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-900">
            <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>Standar</span>
          </div>
          <div
            data-testid="risk-count-standar"
            className="text-base font-code font-bold tabular-nums text-emerald-800"
          >
            {metrics.standarCount}
          </div>
          <div className="text-[9.5px] font-code text-emerald-700/90">
            {metrics.standarPct}% Pasal
          </div>
        </div>
      </div>

      {/* Safeguard Highlights */}
      {metrics.safeguardHighlights.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {metrics.safeguardHighlights.map((sg) => (
            <span
              key={sg}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-[#FAF9F6] text-[#57534E] border border-[#E5E0D8]"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
              <span>{sg}</span>
            </span>
          ))}
        </div>
      )}

      {/* Quick Per-Clause Risk Level Adjuster Toggle */}
      <div className="pt-1 border-t border-[#E5E0D8]">
        <button
          type="button"
          data-testid="toggle-quick-risk-adjuster-btn"
          onClick={() => setShowQuickRiskEditor((prev) => !prev)}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer py-0.5"
        >
          <span>Ubah Cepat Tingkat Risiko per Pasal ({clauses.length})</span>
          {showQuickRiskEditor ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showQuickRiskEditor && (
          <div
            data-testid="quick-risk-adjuster-list"
            className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1"
          >
            {clauses.map((cl) => {
              const currentLevel =
                cl.riskLevel === 'Kritis' || cl.riskLevel === 'Perhatian'
                  ? cl.riskLevel
                  : 'Standar';
              return (
                <div
                  key={cl.id}
                  className="flex items-center justify-between gap-1.5 px-2 py-1 rounded bg-[#FAF9F6] border border-[#E5E0D8] text-[11px]"
                >
                  <button
                    type="button"
                    onClick={() => onJumpToClause?.(cl.id)}
                    className="text-left truncate flex-1 hover:text-[#1E3A8A] cursor-pointer"
                    title={`${cl.number} · ${cl.title}`}
                  >
                    <span className="font-code font-semibold text-[#18181B]">
                      {cl.number}
                    </span>
                    <span className="mx-1 text-[#78716C]">·</span>
                    <span className="text-[#57534E]">{cl.title}</span>
                  </button>
                  <select
                    aria-label={`Tingkat Risiko ${cl.number}`}
                    data-testid={`dashboard-risk-select-${cl.id}`}
                    value={currentLevel}
                    onChange={(e) =>
                      onChangeClauseRiskLevel?.(
                        cl.id,
                        e.target.value as 'Standar' | 'Perhatian' | 'Kritis'
                      )
                    }
                    className={`px-1.5 py-0.5 text-[10px] font-code font-bold rounded border cursor-pointer focus:outline-none ${
                      currentLevel === 'Kritis'
                        ? 'bg-red-50 text-red-800 border-red-300'
                        : currentLevel === 'Perhatian'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <option value="Standar">Standar</option>
                    <option value="Perhatian">Perhatian</option>
                    <option value="Kritis">Kritis</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 30-DAY CONTRACT HEALTH SCORE TREND-LINE VISUAL (BASED ON SAVED VERSION SNAPSHOTS) */}
      <div
        data-testid="contract-health-30d-trend-section"
        className="pt-2.5 border-t border-[#E5E0D8] space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            data-testid="toggle-health-trend-30d-btn"
            onClick={() => setShowHealthTrend30d((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B] hover:text-[#1E3A8A] cursor-pointer text-left"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span>Tren Contract Health Score (30 Hari Terakhir)</span>
          </button>
          <div className="flex items-center gap-2 shrink-0">
            {onSaveSnapshot && (
              <button
                type="button"
                data-testid="save-trend-snapshot-btn"
                onClick={() => onSaveSnapshot('Snapshot Health Score 30H')}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded cursor-pointer"
                title="Simpan snapshot versi saat ini ke dalam grafik tren 30 hari"
              >
                <PlusCircle className="w-2.5 h-2.5" />
                <span>+ Snapshot</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowHealthTrend30d((prev) => !prev)}
              className="text-[10.5px] font-medium text-[#1E3A8A] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{showHealthTrend30d ? 'Sembunyikan' : 'Tampilkan'}</span>
              {showHealthTrend30d ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {showHealthTrend30d && (
          <div
            data-testid="contract-health-30d-trend-card"
            className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2.5"
          >
            {/* 30-Day Summary KPI Header */}
            <div className="flex items-center justify-between gap-2 bg-white border border-[#E5E0D8] rounded p-2">
              <div>
                <div className="text-[10px] font-medium text-[#57534E]">
                  Perubahan Skor Kesehatan (30 Hari)
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 font-code">
                  <span
                    data-testid="health-trend-30d-start-score"
                    className="text-xs font-bold text-[#57534E]"
                  >
                    {trendStats30d.startScore}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#78716C]" />
                  <span
                    data-testid="health-trend-30d-current-score"
                    className={`text-sm font-bold ${
                      trendStats30d.currentScore >= 80
                        ? 'text-emerald-700'
                        : trendStats30d.currentScore >= 60
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {trendStats30d.currentScore} / 100
                  </span>
                  <span
                    data-testid="health-trend-30d-delta"
                    className={`px-1.5 py-0.5 text-[9.5px] font-bold rounded border ${
                      trendStats30d.delta30d > 0
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : trendStats30d.delta30d < 0
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {trendStats30d.delta30d > 0
                      ? `+${trendStats30d.delta30d} pt Membaik`
                      : trendStats30d.delta30d < 0
                      ? `${trendStats30d.delta30d} pt Menurun`
                      : '0 pt Stabil'}
                  </span>
                </div>
              </div>
              <div className="text-right font-code text-[9.5px] text-[#57534E] space-y-0.5">
                <div>
                  Rata-rata 30H: <strong className="text-[#18181B]">{trendStats30d.avgScore}</strong>
                </div>
                <div>
                  Min/Max: <span className="text-rose-700">{trendStats30d.lowestScore}</span> /{' '}
                  <span className="text-emerald-700">{trendStats30d.peakScore}</span>
                </div>
              </div>
            </div>

            {/* SVG 30-Day Trend-Line Visual */}
            {(() => {
              const chartLeft = 28;
              const chartRight = 278;
              const chartTop = 16;
              const chartBottom = 94;
              const chartWidth = chartRight - chartLeft;
              const chartHeight = chartBottom - chartTop;
              const totalPts = healthTrend30dPoints.length;

              const plotted = healthTrend30dPoints.map((pt, idx) => {
                // Blend dayOffsetFromStart with index ordering so even same-day snapshots never overlap horizontally
                const evenRatio =
                  totalPts <= 1 ? 1 : idx / Math.max(1, totalPts - 1);
                const dayRatio = Math.max(0, Math.min(1, pt.dayOffsetFromStart / 30));
                const combinedRatio = evenRatio * 0.65 + dayRatio * 0.35;
                const x = Math.round(chartLeft + combinedRatio * chartWidth);
                const y = Math.round(
                  chartBottom - (Math.max(0, Math.min(100, pt.healthScore)) / 100) * chartHeight
                );
                return { ...pt, x, y };
              });

              const polylinePoints = plotted.map((p) => `${p.x},${p.y}`).join(' ');
              const areaPoints =
                plotted.length > 0
                  ? `${plotted[0].x},${chartBottom} ${polylinePoints} ${
                      plotted[plotted.length - 1].x
                    },${chartBottom}`
                  : '';

              const y80 = Math.round(chartBottom - 0.8 * chartHeight);
              const y60 = Math.round(chartBottom - 0.6 * chartHeight);

              return (
                <div className="space-y-1.5">
                  <svg
                    data-testid="contract-health-30d-trend-svg"
                    viewBox="0 0 292 122"
                    className="w-full h-32 bg-white border border-[#E5E0D8] rounded p-1"
                    role="img"
                    aria-label="Grafik Tren Contract Health Score 30 Hari Terakhir Berdasarkan Snapshot Versi"
                  >
                    <defs>
                      <linearGradient id="healthTrend30dFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Background Health Threshold Zones */}
                    <rect
                      x={chartLeft}
                      y={chartTop}
                      width={chartWidth}
                      height={y80 - chartTop}
                      fill="#ECFDF5"
                      opacity="0.55"
                    />
                    <rect
                      x={chartLeft}
                      y={y80}
                      width={chartWidth}
                      height={y60 - y80}
                      fill="#FFFBEB"
                      opacity="0.55"
                    />
                    <rect
                      x={chartLeft}
                      y={y60}
                      width={chartWidth}
                      height={chartBottom - y60}
                      fill="#FFF1F2"
                      opacity="0.45"
                    />

                    {/* Horizontal Reference Grid Lines (100, 80 Sehat, 60 Moderat, 0) */}
                    <line
                      x1={chartLeft}
                      y1={chartTop}
                      x2={chartRight}
                      y2={chartTop}
                      stroke="#E5E0D8"
                      strokeDasharray="2 2"
                      strokeWidth="0.8"
                    />
                    <line
                      x1={chartLeft}
                      y1={y80}
                      x2={chartRight}
                      y2={y80}
                      stroke="#10B981"
                      strokeDasharray="3 2"
                      strokeWidth="0.9"
                    />
                    <line
                      x1={chartLeft}
                      y1={y60}
                      x2={chartRight}
                      y2={y60}
                      stroke="#F59E0B"
                      strokeDasharray="3 2"
                      strokeWidth="0.9"
                    />
                    <line
                      x1={chartLeft}
                      y1={chartBottom}
                      x2={chartRight}
                      y2={chartBottom}
                      stroke="#D6D0C4"
                      strokeWidth="1"
                    />

                    {/* Y-Axis Labels */}
                    <text x="5" y={chartTop + 3} fontSize="7" fill="#78716C" fontFamily="monospace">
                      100
                    </text>
                    <text x="9" y={y80 + 3} fontSize="7" fill="#047857" fontFamily="monospace">
                      80
                    </text>
                    <text x="9" y={y60 + 3} fontSize="7" fill="#B45309" fontFamily="monospace">
                      60
                    </text>
                    <text x="13" y={chartBottom + 2} fontSize="7" fill="#78716C" fontFamily="monospace">
                      0
                    </text>

                    {/* Area Under Trend-Line */}
                    {areaPoints && (
                      <polygon points={areaPoints} fill="url(#healthTrend30dFill)" />
                    )}

                    {/* Trend-Line Polyline Connecting Saved Version Snapshots */}
                    {plotted.length > 1 && (
                      <polyline
                        data-testid="contract-health-30d-polyline"
                        fill="none"
                        stroke="#1E3A8A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                      />
                    )}

                    {/* Snapshot Data Points */}
                    {plotted.map((pt) => {
                      const isSelected = activeTrendPoint?.id === pt.id;
                      const dotColor =
                        pt.healthScore >= 80
                          ? '#059669'
                          : pt.healthScore >= 60
                          ? '#D97706'
                          : '#DC2626';

                      return (
                        <g
                          key={pt.id}
                          onClick={() => setSelectedTrendPointId(pt.id)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="6"
                              fill={dotColor}
                              opacity="0.2"
                            />
                          )}
                          <circle
                            data-testid={`trend-30d-point-${pt.id}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? '3.8' : '2.8'}
                            fill={dotColor}
                            stroke="#FFFFFF"
                            strokeWidth="1.2"
                          />
                          <text
                            x={pt.x}
                            y={Math.max(10, pt.y - 5)}
                            fontSize="7"
                            textAnchor="middle"
                            fill={isSelected ? '#1E3A8A' : '#18181B'}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {pt.healthScore}
                          </text>
                          <text
                            x={pt.x}
                            y="106"
                            fontSize="6.5"
                            textAnchor="middle"
                            fill={isSelected ? '#1E3A8A' : '#57534E'}
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            fontFamily="monospace"
                          >
                            {pt.dateShortLabel}
                          </text>
                          <text
                            x={pt.x}
                            y="115"
                            fontSize="6"
                            textAnchor="middle"
                            fill="#78716C"
                            fontFamily="monospace"
                          >
                            {pt.versionLabel.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Snapshot Selector Pills & Active Snapshot Inspector */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {healthTrend30dPoints.map((pt) => {
                      const isSel = activeTrendPoint?.id === pt.id;
                      return (
                        <button
                          key={`pill-${pt.id}`}
                          type="button"
                          data-testid={`trend-30d-snapshot-pill-${pt.id}`}
                          onClick={() => setSelectedTrendPointId(pt.id)}
                          className={`px-1.5 py-0.5 text-[9.5px] font-code rounded border transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] font-bold'
                              : 'bg-white text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                          }`}
                        >
                          {pt.versionLabel.split(' ')[0]} ({pt.healthScore})
                        </button>
                      );
                    })}
                  </div>

                  {activeTrendPoint && (
                    <div
                      data-testid="trend-30d-selected-snapshot-detail"
                      className="p-2 bg-white border border-[#E5E0D8] rounded text-[10.5px] space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#18181B]">
                          {activeTrendPoint.versionLabel} · {activeTrendPoint.dateShortLabel}
                        </span>
                        <span className="font-code font-bold text-[#1E3A8A]">
                          Skor: {activeTrendPoint.healthScore}/100
                        </span>
                      </div>
                      <div className="text-[10px] text-[#57534E] truncate">
                        {activeTrendPoint.summary}
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] font-code text-[#78716C] pt-0.5 border-t border-[#F0ECE3]">
                        <span>
                          {activeTrendPoint.daysAgo === 0
                            ? 'Hari Ini (H-0)'
                            : `${activeTrendPoint.daysAgo} hari lalu (H-${activeTrendPoint.daysAgo})`}
                        </span>
                        <span>
                          Kritis: {activeTrendPoint.kritisCount} · Perhatian:{' '}
                          {activeTrendPoint.perhatianCount} · Standar:{' '}
                          {activeTrendPoint.standarCount}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* REGULATORY COMPLIANCE HEATMAP (D3 MATRIX MAPPING CLAUSES AGAINST ACTIVE INDONESIAN REGULATIONS & 'CARI PASAL & UU' SEARCH HISTORY) */}
      <RegulatoryComplianceHeatmap
        clauses={clauses}
        searchHistory={regulationSearchHistory}
        onJumpToClause={onJumpToClause}
        onApplyRegulatoryUpdateToClause={onApplyRegulatoryUpdateToClause}
        onApplyAllRegulatoryUpdates={onApplyAllRegulatoryUpdates}
        onAddSearchHistoryQuery={onAddSearchHistoryQuery}
        onOpenRegulationSearchTab={onOpenRegulationSearchTab}
      />

      {/* RISK EVOLUTION CHART (COMPARE TWO VERSIONS' TOTAL RISK SCORE & CLAUSE DISTRIBUTION SHIFT) */}
      <div
        data-testid="risk-evolution-section"
        className="pt-2.5 border-t border-[#E5E0D8] space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            data-testid="toggle-risk-evolution-btn"
            onClick={() => setShowRiskEvolution((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B] hover:text-[#1E3A8A] cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Risk Evolution (Pergeseran Risiko Antar Versi)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRiskEvolution((prev) => !prev)}
            className="text-[10.5px] font-medium text-[#1E3A8A] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>{showRiskEvolution ? 'Sembunyikan' : 'Tampilkan'}</span>
            {showRiskEvolution ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {showRiskEvolution && (
          <div
            data-testid="risk-evolution-chart"
            className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-3"
          >
            {/* Two Past Version Selectors */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#57534E]">
                <span>Pilih 2 Versi Dokumen untuk Dibandingkan:</span>
                <button
                  type="button"
                  data-testid="swap-risk-evolution-versions-btn"
                  onClick={() => {
                    const tmp = selectedVerAId;
                    setSelectedVerAId(selectedVerBId);
                    setSelectedVerBId(tmp);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                  title="Tukar Versi Awal dan Versi Pembanding"
                >
                  <GitCompare className="w-2.5 h-2.5" />
                  <span>Tukar Versi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-code font-bold text-[#57534E] w-14 shrink-0">
                    Versi A:
                  </span>
                  <select
                    aria-label="Pilih Versi Awal (Versi A) Risk Evolution"
                    data-testid="risk-evolution-version-a-select"
                    value={versionAObj?.id || ''}
                    onChange={(e) => setSelectedVerAId(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 text-[11px] font-medium bg-white border border-[#D6D0C4] rounded text-[#18181B] focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                  >
                    {evolutionVersions.map((v) => (
                      <option key={`ver-a-${v.id}`} value={v.id}>
                        {v.versionLabel} — {v.summary}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-code font-bold text-[#1E3A8A] w-14 shrink-0">
                    Versi B:
                  </span>
                  <select
                    aria-label="Pilih Versi Pembanding (Versi B) Risk Evolution"
                    data-testid="risk-evolution-version-b-select"
                    value={versionBObj?.id || ''}
                    onChange={(e) => setSelectedVerBId(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 text-[11px] font-medium bg-white border border-[#93C5FD] rounded text-[#18181B] focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                  >
                    {evolutionVersions.map((v) => (
                      <option key={`ver-b-${v.id}`} value={v.id}>
                        {v.versionLabel} — {v.summary}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Score Shift Banner (Total Risk Score & Health Score Evolution) */}
            <div
              data-testid="risk-evolution-score-shift-card"
              className="p-2.5 bg-white border border-[#E5E0D8] rounded space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-[#57534E] font-medium">
                    Pergeseran Indeks Risiko Total
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 font-code">
                    <span
                      data-testid="risk-evolution-score-a"
                      className="text-sm font-bold text-[#57534E]"
                    >
                      {riskScoreA} pt
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                    <span
                      data-testid="risk-evolution-score-b"
                      className={`text-sm font-bold ${
                        riskScoreB <= riskScoreA ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {riskScoreB} pt
                    </span>
                    <span
                      data-testid="risk-evolution-score-delta"
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                        riskScoreDelta < 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : riskScoreDelta > 0
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {riskScoreDelta < 0
                        ? `${riskScoreDelta} pt Risiko Turun`
                        : riskScoreDelta > 0
                        ? `+${riskScoreDelta} pt Risiko Naik`
                        : '0 pt (Stabil)'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#57534E] font-medium">
                    Health Score
                  </div>
                  <div className="font-code text-xs font-bold text-[#18181B] mt-0.5">
                    {metricsA.healthScore} → {metricsB.healthScore}{' '}
                    <span
                      className={
                        healthDelta > 0
                          ? 'text-emerald-700'
                          : healthDelta < 0
                          ? 'text-rose-700'
                          : 'text-[#78716C]'
                      }
                    >
                      ({healthDelta >= 0 ? `+${healthDelta}` : healthDelta})
                    </span>
                  </div>
                </div>
              </div>

              {/* SVG Risk Evolution Visual Chart (Trajectory & Bar Shift) */}
              <div className="pt-1">
                <svg
                  data-testid="risk-evolution-svg-chart"
                  viewBox="0 0 280 112"
                  className="w-full h-28 bg-[#FAF9F6] border border-[#E5E0D8] rounded p-1"
                  role="img"
                  aria-label="Grafik Risk Evolution Antar Versi"
                >
                  {/* Horizontal Grid Lines */}
                  <line x1="28" y1="18" x2="266" y2="18" stroke="#E5E0D8" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="28" y1="52" x2="266" y2="52" stroke="#E5E0D8" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="28" y1="86" x2="266" y2="86" stroke="#D6D0C4" strokeWidth="1" />

                  {/* Y-axis labels */}
                  <text x="6" y="21" fontSize="7.5" fill="#78716C" fontFamily="monospace">100</text>
                  <text x="10" y="55" fontSize="7.5" fill="#78716C" fontFamily="monospace">50</text>
                  <text x="14" y="88" fontSize="7.5" fill="#78716C" fontFamily="monospace">0</text>

                  {/* Group 1: Total Risk Exposure (0-100) */}
                  {(() => {
                    const hA = Math.max(4, Math.round((riskScoreA / 100) * 66));
                    const hB = Math.max(4, Math.round((riskScoreB / 100) * 66));
                    const yA = 86 - hA;
                    const yB = 86 - hB;
                    return (
                      <g>
                        <rect x="38" y={yA} width="14" height={hA} rx="2" fill="#94A3B8" />
                        <rect x="55" y={yB} width="14" height={hB} rx="2" fill="#1E3A8A" />
                        <line x1="45" y1={yA} x2="62" y2={yB} stroke="#1E3A8A" strokeWidth="1.5" />
                        <circle cx="45" cy={yA} r="2.2" fill="#475569" />
                        <circle cx="62" cy={yB} r="2.2" fill="#1E3A8A" />
                        <text x="45" y={Math.max(10, yA - 3)} fontSize="7" textAnchor="middle" fill="#475569" fontFamily="monospace">
                          {riskScoreA}
                        </text>
                        <text x="62" y={Math.max(10, yB - 3)} fontSize="7" textAnchor="middle" fill="#1E3A8A" fontWeight="bold" fontFamily="monospace">
                          {riskScoreB}
                        </text>
                        <text x="53" y="99" fontSize="7.5" textAnchor="middle" fill="#18181B" fontWeight="600">
                          Risiko
                        </text>
                      </g>
                    );
                  })()}

                  {/* Group 2: Kritis % */}
                  {(() => {
                    const hA = Math.max(3, Math.round((metricsA.kritisPct / 100) * 66));
                    const hB = Math.max(3, Math.round((metricsB.kritisPct / 100) * 66));
                    const yA = 86 - hA;
                    const yB = 86 - hB;
                    return (
                      <g>
                        <rect x="98" y={yA} width="14" height={hA} rx="2" fill="#FCA5A5" />
                        <rect x="115" y={yB} width="14" height={hB} rx="2" fill="#DC2626" />
                        <text x="105" y={Math.max(10, yA - 3)} fontSize="7" textAnchor="middle" fill="#991B1B" fontFamily="monospace">
                          {metricsA.kritisCount}
                        </text>
                        <text x="122" y={Math.max(10, yB - 3)} fontSize="7" textAnchor="middle" fill="#DC2626" fontWeight="bold" fontFamily="monospace">
                          {metricsB.kritisCount}
                        </text>
                        <text x="113" y="99" fontSize="7.5" textAnchor="middle" fill="#991B1B" fontWeight="600">
                          Kritis
                        </text>
                      </g>
                    );
                  })()}

                  {/* Group 3: Perhatian % */}
                  {(() => {
                    const hA = Math.max(3, Math.round((metricsA.perhatianPct / 100) * 66));
                    const hB = Math.max(3, Math.round((metricsB.perhatianPct / 100) * 66));
                    const yA = 86 - hA;
                    const yB = 86 - hB;
                    return (
                      <g>
                        <rect x="158" y={yA} width="14" height={hA} rx="2" fill="#FCD34D" />
                        <rect x="175" y={yB} width="14" height={hB} rx="2" fill="#D97706" />
                        <text x="165" y={Math.max(10, yA - 3)} fontSize="7" textAnchor="middle" fill="#92400E" fontFamily="monospace">
                          {metricsA.perhatianCount}
                        </text>
                        <text x="182" y={Math.max(10, yB - 3)} fontSize="7" textAnchor="middle" fill="#B45309" fontWeight="bold" fontFamily="monospace">
                          {metricsB.perhatianCount}
                        </text>
                        <text x="173" y="99" fontSize="7.5" textAnchor="middle" fill="#92400E" fontWeight="600">
                          Perhatian
                        </text>
                      </g>
                    );
                  })()}

                  {/* Group 4: Standar % */}
                  {(() => {
                    const hA = Math.max(3, Math.round((metricsA.standarPct / 100) * 66));
                    const hB = Math.max(3, Math.round((metricsB.standarPct / 100) * 66));
                    const yA = 86 - hA;
                    const yB = 86 - hB;
                    return (
                      <g>
                        <rect x="218" y={yA} width="14" height={hA} rx="2" fill="#86EFAC" />
                        <rect x="235" y={yB} width="14" height={hB} rx="2" fill="#16A34A" />
                        <text x="225" y={Math.max(10, yA - 3)} fontSize="7" textAnchor="middle" fill="#166534" fontFamily="monospace">
                          {metricsA.standarCount}
                        </text>
                        <text x="242" y={Math.max(10, yB - 3)} fontSize="7" textAnchor="middle" fill="#15803D" fontWeight="bold" fontFamily="monospace">
                          {metricsB.standarCount}
                        </text>
                        <text x="233" y="99" fontSize="7.5" textAnchor="middle" fill="#166534" fontWeight="600">
                          Standar
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Dual Distribution Comparison Bars (Version A vs Version B) */}
              <div className="space-y-1.5 pt-1">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-code text-[#57534E]">
                    <span className="truncate max-w-[140px]">
                      A: {versionAObj?.versionLabel}
                    </span>
                    <span>
                      K:{metricsA.kritisCount} · P:{metricsA.perhatianCount} · S:{metricsA.standarCount}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden flex">
                    {metricsA.kritisCount > 0 && (
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${metricsA.kritisPct}%` }}
                      />
                    )}
                    {metricsA.perhatianCount > 0 && (
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${metricsA.perhatianPct}%` }}
                      />
                    )}
                    {metricsA.standarCount > 0 && (
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${metricsA.standarPct}%` }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-code text-[#18181B] font-semibold">
                    <span className="truncate max-w-[140px]">
                      B: {versionBObj?.versionLabel}
                    </span>
                    <span>
                      K:{metricsB.kritisCount} ({kritisDelta >= 0 ? `+${kritisDelta}` : kritisDelta}) · P:{metricsB.perhatianCount} ({perhatianDelta >= 0 ? `+${perhatianDelta}` : perhatianDelta}) · S:{metricsB.standarCount} ({standarDelta >= 0 ? `+${standarDelta}` : standarDelta})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden flex">
                    {metricsB.kritisCount > 0 && (
                      <div
                        className="bg-red-600 h-full"
                        style={{ width: `${metricsB.kritisPct}%` }}
                      />
                    )}
                    {metricsB.perhatianCount > 0 && (
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${metricsB.perhatianPct}%` }}
                      />
                    )}
                    {metricsB.standarCount > 0 && (
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${metricsB.standarPct}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clause-Level Risk Shift Log between Version A & Version B */}
            {clauseRiskShifts.length > 0 && (
              <div
                data-testid="risk-evolution-clause-shifts"
                className="space-y-1 max-h-32 overflow-y-auto pr-1"
              >
                <div className="text-[10px] font-semibold text-[#57534E]">
                  Pasal yang Berubah Risiko ({clauseRiskShifts.length}):
                </div>
                {clauseRiskShifts.map((shift) => (
                  <div
                    key={shift.id}
                    onClick={() => onJumpToClause?.(shift.id)}
                    className="flex items-center justify-between gap-1.5 px-2 py-1 bg-white border border-[#E5E0D8] rounded text-[10.5px] hover:border-[#1E3A8A] cursor-pointer"
                  >
                    <span className="truncate font-medium text-[#18181B]">
                      <strong className="font-code">{shift.number}</strong> · {shift.title}
                    </span>
                    <span className="font-code text-[10px] shrink-0 text-[#1E3A8A] font-semibold">
                      {shift.fromRisk} → {shift.toRisk}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
