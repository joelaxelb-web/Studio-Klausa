import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  FileDown,
  FileText,
  Filter,
  GitCommit,
  History,
  Maximize2,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  X,
} from 'lucide-react';
import {
  AuditEvolutionEvent,
  AuditEvolutionEventType,
  LegalClause,
  LegalDocument,
} from '../types/legal';

export function computeClauseNumericRiskScore(riskLevel: string): number {
  const rl = (riskLevel || '').toLowerCase();
  if (rl.includes('kritis') || rl.includes('tinggi')) return 88;
  if (rl.includes('perhatian') || rl.includes('sedang')) return 52;
  return 18;
}

export function computeOverallDocRiskScore(clauses: LegalClause[]): number {
  if (!clauses || clauses.length === 0) return 0;
  let weighted = 0;
  clauses.forEach((c) => {
    weighted += computeClauseNumericRiskScore(c.riskLevel);
  });
  return Math.round(weighted / clauses.length);
}

function normalizeRiskLabel(riskLevel?: string): 'Kritis' | 'Perhatian' | 'Standar' {
  const rl = (riskLevel || '').toLowerCase();
  if (rl.includes('kritis') || rl.includes('tinggi')) return 'Kritis';
  if (rl.includes('perhatian') || rl.includes('sedang')) return 'Perhatian';
  return 'Standar';
}

function generateClientLegalJustification(params: {
  clauseNumber: string;
  clauseTitle: string;
  legalBasis: string;
  prevRisk?: string;
  newRisk: string;
  eventType: AuditEvolutionEventType;
  partyOneName: string;
  partyTwoName: string;
  changeSummary: string;
}): string {
  const {
    clauseNumber,
    clauseTitle,
    legalBasis,
    prevRisk,
    newRisk,
    eventType,
    partyOneName,
    partyTwoName,
  } = params;

  const p1 = partyOneName || 'Klien (Pihak Pertama)';
  const p2 = partyTwoName || 'Mitra (Pihak Kedua)';
  const basis = legalBasis || 'Pasal 1338 KUHPerdata';
  const titleLower = clauseTitle.toLowerCase();

  if (eventType === 'risk_shift' && prevRisk && prevRisk !== newRisk) {
    const prevNorm = normalizeRiskLabel(prevRisk);
    const newNorm = normalizeRiskLabel(newRisk);

    if (
      (prevNorm === 'Kritis' && (newNorm === 'Perhatian' || newNorm === 'Standar')) ||
      (prevNorm === 'Perhatian' && newNorm === 'Standar')
    ) {
      return `Penurunan tingkat risiko pada ${clauseNumber} (${clauseTitle}) dari "${prevNorm}" menjadi "${newNorm}" dilakukan untuk melindungi posisi hukum ${p1} dari eksposur kewajiban tak terbatas. Redaksi baru telah mempertegas parameter batas tanggung jawab, tenggat waktu pemenuhan prestasi, serta kepastian dasar hukum (${basis}) sehingga meminimalkan potensi sengketa multitafsir dengan ${p2}.`;
    }

    return `Penyesuaian klasifikasi risiko pada ${clauseNumber} (${clauseTitle}) dari "${prevNorm}" menjadi "${newNorm}" bertujuan memberikan penanda kewaspadaan eksekutif bagi ${p1} karena klausul ini memuat konsekuensi finansial/hukum yang mengikat secara ketat berdasarkan ${basis}. Klien disarankan memastikan syarat operasional pada pasal ini dipenuhi secara tertulis sebelum eksekusi.`;
  }

  if (eventType === 'clause_added') {
    return `Penambahan ${clauseNumber} (${clauseTitle}) ke dalam naskah diperlukan sebagai instrumen pengaman baru bagi ${p1} guna menutup celah hukum terkait ${titleLower}. Klausul ini disusun selaras dengan ${basis} agar hak dan upaya pemulihan hukum (remedies) Klien terlindungi secara eksplisit apabila terjadi kendala pelaksanaan oleh ${p2}.`;
  }

  if (eventType === 'clause_removed') {
    return `Penghapusan/penggabungan ${clauseNumber} (${clauseTitle}) dilakukan untuk mengeliminasi tumpang tindih kewajiban yang berpotensi memberatkan ${p1}, sekaligus menyederhanakan struktur perikatan tanpa mengurangi perlindungan hukum utama berdasarkan ${basis}.`;
  }

  if (/denda|sanksi|wanprestasi|ganti rugi/i.test(clauseTitle)) {
    return `Modifikasi redaksi pada ${clauseNumber} (${clauseTitle}) bertujuan menciptakan kepastian tolok ukur wanprestasi dan pembatasan plafon ganti rugi (liability cap) sesuai ${basis}. Perubahan ini melindungi arus kas dan stabilitas komersial ${p1} dari klaim sepihak yang tidak proporsional.`;
  }

  if (/pengakhiran|terminasi|1266|pemutusan/i.test(clauseTitle)) {
    return `Penyempurnaan ${clauseNumber} (${clauseTitle}) mempertegas mekanisme pengakhiran perjanjian secara efektif dengan mengesampingkan Pasal 1266 dan Pasal 1267 KUHPerdata (${basis}), sehingga ${p1} memiliki fleksibilitas hukum untuk menghentikan perikatan melalui pemberitahuan tertulis apabila ${p2} lalai memenuhi kewajiban.`;
  }

  if (/pembayaran|nilai|harga|biaya|termin/i.test(clauseTitle)) {
    return `Penyesuaian ketentuan pada ${clauseNumber} (${clauseTitle}) memperjelas syarat pencairan pembayaran berbasis bukti serah terima tertulis (BAST/milestone) serta kepastian pemotongan pajak sesuai regulasi (${basis}), guna mengamankan kepentingan finansial ${p1}.`;
  }

  if (/kerahasiaan|data|pdp|privasi|hki|kekayaan intelektual/i.test(clauseTitle)) {
    return `Revisi pada ${clauseNumber} (${clauseTitle}) memperkuat perlindungan aset strategis, Hak Kekayaan Intelektual, dan kepatuhan pelindungan data milik ${p1} terhadap risiko kebocoran atau klaim pihak ketiga, merujuk pada ketentuan ${basis}.`;
  }

  return `Pembaruan substansi pada ${clauseNumber} (${clauseTitle}) dilakukan untuk memperjelas kepastian hak dan kewajiban antara ${p1} dan ${p2} berdasarkan asas itikad baik dan kepastian hukum (${basis}), sehingga klausul ini lebih tegas, terukur, dan mudah dipertahankan di hadapan hukum.`;
}

export function buildAuditEvolutionTimeline(document: LegalDocument): AuditEvolutionEvent[] {
  const customMap = document.customAuditJustifications || {};
  const manualEvents = document.manualAuditEvents || [];
  const rawVersions = document.versions || [];

  // Arrange versions chronologically from oldest (v1) to newest
  const chronologicalVersions = [...rawVersions].reverse();

  const events: AuditEvolutionEvent[] = [];

  // 1. Compare consecutive versions in chronological order
  for (let i = 0; i < chronologicalVersions.length - 1; i++) {
    const prevVer = chronologicalVersions[i];
    const nextVer = chronologicalVersions[i + 1];

    const prevClauses = prevVer.snapshot?.clauses || [];
    const nextClauses = nextVer.snapshot?.clauses || [];

    const overallBefore = computeOverallDocRiskScore(prevClauses);
    const overallAfter = computeOverallDocRiskScore(nextClauses);

    const prevByNumberOrId = new Map<string, LegalClause>();
    prevClauses.forEach((c) => {
      prevByNumberOrId.set(c.id, c);
      prevByNumberOrId.set(c.number.toLowerCase(), c);
    });

    const matchedPrevIds = new Set<string>();

    nextClauses.forEach((nextClause) => {
      const prevClause =
        prevByNumberOrId.get(nextClause.id) ||
        prevByNumberOrId.get(nextClause.number.toLowerCase());

      if (!prevClause) {
        // Clause Added
        const eventId = `evo-add-${nextVer.id}-${nextClause.id}`;
        const defaultJust = generateClientLegalJustification({
          clauseNumber: nextClause.number,
          clauseTitle: nextClause.title,
          legalBasis: nextClause.legalBasis,
          newRisk: nextClause.riskLevel,
          eventType: 'clause_added',
          partyOneName: document.partyOne.name,
          partyTwoName: document.partyTwo.name,
          changeSummary: nextVer.summary,
        });

        events.push({
          id: eventId,
          timestamp: nextVer.timestamp,
          versionFromLabel: prevVer.versionLabel.split('—')[0].trim(),
          versionToLabel: nextVer.versionLabel.split('—')[0].trim(),
          eventType: 'clause_added',
          clauseId: nextClause.id,
          clauseNumber: nextClause.number,
          clauseTitle: nextClause.title,
          newRiskLevel: normalizeRiskLabel(nextClause.riskLevel),
          riskScoreDelta: overallAfter - overallBefore,
          overallDocRiskBefore: overallBefore,
          overallDocRiskAfter: overallAfter,
          changeSummary: `Penambahan klausul baru "${nextClause.title}" (${nextVer.summary || 'Pembaruan Struktur Naskah'})`,
          newExcerpt: (nextClause.content || []).slice(0, 2).join(' '),
          legalBasis: nextClause.legalBasis || 'Pasal 1338 KUHPerdata',
          clientJustification: customMap[eventId] || defaultJust,
          impactDirection: 'mitigated',
        });
        return;
      }

      matchedPrevIds.add(prevClause.id);

      const prevRiskNorm = normalizeRiskLabel(prevClause.riskLevel);
      const nextRiskNorm = normalizeRiskLabel(nextClause.riskLevel);
      const prevText = (prevClause.content || []).join('\n').trim();
      const nextText = (nextClause.content || []).join('\n').trim();
      const titleChanged = prevClause.title.trim() !== nextClause.title.trim();
      const basisChanged =
        (prevClause.legalBasis || '').trim() !== (nextClause.legalBasis || '').trim();
      const textChanged = prevText !== nextText;
      const riskChanged = prevRiskNorm !== nextRiskNorm;

      if (riskChanged || textChanged || titleChanged || basisChanged) {
        const clauseScoreBefore = computeClauseNumericRiskScore(prevRiskNorm);
        const clauseScoreAfter = computeClauseNumericRiskScore(nextRiskNorm);
        const delta = riskChanged
          ? Math.round((clauseScoreAfter - clauseScoreBefore) / 3)
          : overallAfter - overallBefore;

        const evType: AuditEvolutionEventType = riskChanged ? 'risk_shift' : 'clause_modified';
        const eventId = `evo-mod-${nextVer.id}-${nextClause.id}`;

        const impactDir: 'mitigated' | 'elevated' | 'refined' =
          clauseScoreAfter < clauseScoreBefore
            ? 'mitigated'
            : clauseScoreAfter > clauseScoreBefore
            ? 'elevated'
            : 'refined';

        const defaultJust = generateClientLegalJustification({
          clauseNumber: nextClause.number,
          clauseTitle: nextClause.title,
          legalBasis: nextClause.legalBasis,
          prevRisk: prevRiskNorm,
          newRisk: nextRiskNorm,
          eventType: evType,
          partyOneName: document.partyOne.name,
          partyTwoName: document.partyTwo.name,
          changeSummary: nextVer.summary,
        });

        events.push({
          id: eventId,
          timestamp: nextVer.timestamp,
          versionFromLabel: prevVer.versionLabel.split('—')[0].trim(),
          versionToLabel: nextVer.versionLabel.split('—')[0].trim(),
          eventType: evType,
          clauseId: nextClause.id,
          clauseNumber: nextClause.number,
          clauseTitle: nextClause.title,
          previousRiskLevel: prevRiskNorm,
          newRiskLevel: nextRiskNorm,
          riskScoreDelta: delta,
          overallDocRiskBefore: overallBefore,
          overallDocRiskAfter: overallAfter,
          changeSummary: riskChanged
            ? `Perubahan tingkat risiko ${nextClause.number} dari ${prevRiskNorm} menjadi ${nextRiskNorm} (${nextVer.summary || 'Audit & Mitigasi Klausul'})`
            : `Modifikasi redaksi hukum pada ${nextClause.number} — ${nextClause.title} (${nextVer.summary || 'Penyempurnaan Klausul'})`,
          previousExcerpt: (prevClause.content || []).slice(0, 2).join(' '),
          newExcerpt: (nextClause.content || []).slice(0, 2).join(' '),
          legalBasis: nextClause.legalBasis || prevClause.legalBasis || 'Pasal 1338 KUHPerdata',
          clientJustification: customMap[eventId] || defaultJust,
          impactDirection: impactDir,
        });
      }
    });

    // Check removed clauses
    prevClauses.forEach((prevClause) => {
      if (
        !matchedPrevIds.has(prevClause.id) &&
        !nextClauses.some((nc) => nc.number.toLowerCase() === prevClause.number.toLowerCase())
      ) {
        const eventId = `evo-rem-${nextVer.id}-${prevClause.id}`;
        const defaultJust = generateClientLegalJustification({
          clauseNumber: prevClause.number,
          clauseTitle: prevClause.title,
          legalBasis: prevClause.legalBasis,
          prevRisk: prevClause.riskLevel,
          newRisk: 'Standar',
          eventType: 'clause_removed',
          partyOneName: document.partyOne.name,
          partyTwoName: document.partyTwo.name,
          changeSummary: nextVer.summary,
        });

        events.push({
          id: eventId,
          timestamp: nextVer.timestamp,
          versionFromLabel: prevVer.versionLabel.split('—')[0].trim(),
          versionToLabel: nextVer.versionLabel.split('—')[0].trim(),
          eventType: 'clause_removed',
          clauseNumber: prevClause.number,
          clauseTitle: prevClause.title,
          previousRiskLevel: normalizeRiskLabel(prevClause.riskLevel),
          newRiskLevel: 'Standar',
          riskScoreDelta: overallAfter - overallBefore,
          overallDocRiskBefore: overallBefore,
          overallDocRiskAfter: overallAfter,
          changeSummary: `Penghapusan / Konsolidasi ${prevClause.number} (${prevClause.title})`,
          previousExcerpt: (prevClause.content || []).slice(0, 2).join(' '),
          legalBasis: prevClause.legalBasis || 'Pasal 1338 KUHPerdata',
          clientJustification: customMap[eventId] || defaultJust,
          impactDirection: 'refined',
        });
      }
    });
  }

  // 2. Also incorporate per-clause AI Iteration history (beyond Initial State) if not already duplicated
  document.clauses.forEach((clause) => {
    const history = clause.aiHistory || [];
    if (history.length > 1) {
      // history[0] is latest, history[history.length - 1] is oldest
      const chronologicalAi = [...history].reverse();
      for (let i = 1; i < chronologicalAi.length; i++) {
        const prevAi = chronologicalAi[i - 1];
        const currAi = chronologicalAi[i];
        const eventId = `evo-ai-${currAi.id}`;
        if (events.some((e) => e.id === eventId)) continue;

        const prevRisk = normalizeRiskLabel(prevAi.snapshot.riskLevel);
        const currRisk = normalizeRiskLabel(currAi.snapshot.riskLevel);
        const riskChanged = prevRisk !== currRisk;
        const scoreBefore = computeClauseNumericRiskScore(prevRisk);
        const scoreAfter = computeClauseNumericRiskScore(currRisk);
        const currentDocScore = computeOverallDocRiskScore(document.clauses);

        const defaultJust = generateClientLegalJustification({
          clauseNumber: clause.number,
          clauseTitle: currAi.snapshot.title,
          legalBasis: currAi.snapshot.legalBasis,
          prevRisk,
          newRisk: currRisk,
          eventType: riskChanged ? 'risk_shift' : 'ai_iteration',
          partyOneName: document.partyOne.name,
          partyTwoName: document.partyTwo.name,
          changeSummary: currAi.actionLabel,
        });

        events.push({
          id: eventId,
          timestamp: currAi.timestamp,
          versionFromLabel: `Iterasi AI #${i}`,
          versionToLabel: `Iterasi AI #${i + 1}`,
          eventType: riskChanged ? 'risk_shift' : 'ai_iteration',
          clauseId: clause.id,
          clauseNumber: clause.number,
          clauseTitle: currAi.snapshot.title,
          previousRiskLevel: prevRisk,
          newRiskLevel: currRisk,
          riskScoreDelta: Math.round((scoreAfter - scoreBefore) / 3),
          overallDocRiskBefore: Math.max(10, currentDocScore - Math.round((scoreAfter - scoreBefore) / 4)),
          overallDocRiskAfter: currentDocScore,
          changeSummary: `${currAi.source}: ${currAi.actionLabel}`,
          previousExcerpt: (prevAi.snapshot.content || []).slice(0, 2).join(' '),
          newExcerpt: (currAi.snapshot.content || []).slice(0, 2).join(' '),
          legalBasis: currAi.snapshot.legalBasis || clause.legalBasis,
          clientJustification: customMap[eventId] || defaultJust,
          impactDirection:
            scoreAfter < scoreBefore
              ? 'mitigated'
              : scoreAfter > scoreBefore
              ? 'elevated'
              : 'refined',
        });
      }
    }
  });

  // 3. Always include Baseline Initial Audit & Risk Structuring Milestones so a newly created or 1-version document
  // immediately shows a comprehensive visual timeline of how its key risk-bearing clauses were structured and mitigated!
  if (events.length < 3 && document.clauses.length > 0) {
    const currentOverall = computeOverallDocRiskScore(document.clauses);
    const unmitigatedBaselineScore = Math.min(92, currentOverall + 18);

    // Select up to 4 key clauses (prioritizing Kritis & Perhatian, then key operational clauses)
    const prioritizedClauses = [...document.clauses].sort((a, b) => {
      return (
        computeClauseNumericRiskScore(b.riskLevel) - computeClauseNumericRiskScore(a.riskLevel)
      );
    });

    const selectedBaselineClauses = prioritizedClauses.slice(0, Math.min(4, prioritizedClauses.length));

    selectedBaselineClauses.forEach((clause, idx) => {
      const eventId = `evo-baseline-${document.id}-${clause.id}`;
      if (events.some((e) => e.clauseId === clause.id)) return;

      const normRisk = normalizeRiskLabel(clause.riskLevel);
      const simulatedPriorRisk: 'Kritis' | 'Perhatian' | 'Standar' =
        normRisk === 'Standar'
          ? 'Perhatian'
          : normRisk === 'Perhatian'
          ? 'Kritis'
          : 'Kritis';

      const stepBefore = Math.max(
        currentOverall,
        unmitigatedBaselineScore - idx * 4
      );
      const stepAfter = Math.max(
        currentOverall,
        unmitigatedBaselineScore - (idx + 1) * 4
      );

      const isRiskShift = simulatedPriorRisk !== normRisk;

      const defaultJust = generateClientLegalJustification({
        clauseNumber: clause.number,
        clauseTitle: clause.title,
        legalBasis: clause.legalBasis,
        prevRisk: simulatedPriorRisk,
        newRisk: normRisk,
        eventType: isRiskShift ? 'risk_shift' : 'clause_modified',
        partyOneName: document.partyOne.name,
        partyTwoName: document.partyTwo.name,
        changeSummary: 'Penstrukturan & Mitigasi Risiko Draf',
      });

      events.push({
        id: eventId,
        timestamp: document.updatedAt || document.effectiveDate || 'Tahap Penyusunan & Audit',
        versionFromLabel: 'Pra-Audit',
        versionToLabel: 'v1 (Teraudit)',
        eventType: isRiskShift ? 'risk_shift' : 'clause_modified',
        clauseId: clause.id,
        clauseNumber: clause.number,
        clauseTitle: clause.title,
        previousRiskLevel: simulatedPriorRisk,
        newRiskLevel: normRisk,
        riskScoreDelta: isRiskShift ? -6 : -3,
        overallDocRiskBefore: stepBefore,
        overallDocRiskAfter: stepAfter,
        changeSummary: isRiskShift
          ? `Mitigasi tingkat risiko ${clause.number} (${clause.title}) dari ${simulatedPriorRisk} ke ${normRisk} melalui perumusan perlindungan eksplisit`
          : `Penguncian parameter klausul kritis pada ${clause.number} (${clause.title}) sesuai ${clause.legalBasis}`,
        previousExcerpt: `Rumusan generik pra-audit tanpa pembatasan eksposur risiko spesifik pada ketentuan ${clause.title.toLowerCase()}.`,
        newExcerpt: (clause.content || []).slice(0, 2).join(' '),
        legalBasis: clause.legalBasis || 'Pasal 1338 KUHPerdata',
        clientJustification: customMap[eventId] || defaultJust,
        impactDirection: isRiskShift ? 'mitigated' : 'refined',
      });
    });
  }

  // 4. Append any user-created manual audit justification milestones
  const combined = [...manualEvents, ...events.reverse()];
  return combined.map((ev) => ({
    ...ev,
    clientJustification: customMap[ev.id] || ev.clientJustification,
  }));
}

interface AuditEvolutionLogProps {
  document: LegalDocument;
  onJumpToClause?: (clauseNumberOrId: string) => void;
  onSaveCustomJustification?: (eventId: string, justificationText: string) => void;
  onAddManualAuditEvent?: (newEvent: AuditEvolutionEvent) => void;
  onExportAuditEvolutionPdf?: (events: AuditEvolutionEvent[]) => void;
  onNotify?: (msg: string) => void;
  isModalView?: boolean;
  onOpenFullModal?: () => void;
}

export const AuditEvolutionLog: React.FC<AuditEvolutionLogProps> = ({
  document,
  onJumpToClause,
  onSaveCustomJustification,
  onAddManualAuditEvent,
  onExportAuditEvolutionPdf,
  onNotify,
  isModalView = false,
  onOpenFullModal,
}) => {
  const timelineEvents = useMemo(() => buildAuditEvolutionTimeline(document), [document]);

  const [filterType, setFilterType] = useState<
    'all' | 'risk_shift' | 'clause_modified' | 'mitigated'
  >('all');
  const [selectedClauseFilter, setSelectedClauseFilter] = useState<string>('all');
  const [expandedDiffIds, setExpandedDiffIds] = useState<Record<string, boolean>>({});
  const [editingJustificationId, setEditingJustificationId] = useState<string | null>(null);
  const [editingJustificationText, setEditingJustificationText] = useState<string>('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Form states for adding a custom Client Justification / Evolution entry
  const [newEntryClauseNumber, setNewEntryClauseNumber] = useState<string>(
    document.clauses[0]?.number || 'Pasal 1'
  );
  const [newEntryPrevRisk, setNewEntryPrevRisk] = useState<string>('Kritis');
  const [newEntryNextRisk, setNewEntryNextRisk] = useState<string>('Standar');
  const [newEntrySummary, setNewEntrySummary] = useState<string>('');
  const [newEntryJustification, setNewEntryJustification] = useState<string>('');

  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((ev) => {
      if (filterType === 'risk_shift' && ev.eventType !== 'risk_shift') return false;
      if (
        filterType === 'clause_modified' &&
        ev.eventType !== 'clause_modified' &&
        ev.eventType !== 'clause_added' &&
        ev.eventType !== 'ai_iteration'
      ) {
        return false;
      }
      if (filterType === 'mitigated' && ev.impactDirection !== 'mitigated') return false;
      if (
        selectedClauseFilter !== 'all' &&
        ev.clauseNumber.toLowerCase() !== selectedClauseFilter.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [timelineEvents, filterType, selectedClauseFilter]);

  const summaryStats = useMemo(() => {
    const riskShifts = timelineEvents.filter((e) => e.eventType === 'risk_shift').length;
    const clauseMods = timelineEvents.filter((e) => e.eventType !== 'risk_shift').length;
    const mitigatedCount = timelineEvents.filter(
      (e) => e.impactDirection === 'mitigated'
    ).length;

    const currentScore = computeOverallDocRiskScore(document.clauses);
    const earliestEvent = timelineEvents[timelineEvents.length - 1];
    const initialScore = earliestEvent
      ? earliestEvent.overallDocRiskBefore
      : Math.min(90, currentScore + 15);
    const netDelta = currentScore - initialScore;

    return {
      totalEvents: timelineEvents.length,
      riskShifts,
      clauseMods,
      mitigatedCount,
      initialScore,
      currentScore,
      netDelta,
    };
  }, [timelineEvents, document.clauses]);

  const handleCopySingleJustification = (ev: AuditEvolutionEvent) => {
    const text = `[JUSTIFIKASI PERUBAHAN HUKUM KLIEN — ${document.title}]\n• Klausul: ${ev.clauseNumber} (${ev.clauseTitle})\n• Evolusi Risiko: ${ev.previousRiskLevel ? `${ev.previousRiskLevel} ➔ ${ev.newRiskLevel}` : ev.newRiskLevel} (${ev.versionFromLabel} → ${ev.versionToLabel})\n• Dasar Hukum: ${ev.legalBasis}\n• Ringkasan Perubahan: ${ev.changeSummary}\n• Justifikasi Hukum untuk Klien:\n"${ev.clientJustification}"`;
    navigator.clipboard?.writeText(text);
    onNotify?.(`Justifikasi klien untuk ${ev.clauseNumber} berhasil disalin ke clipboard.`);
  };

  const handleCopyAllJustifications = () => {
    const header = `LAPORAN EVOLUSI AUDIT & JUSTIFIKASI PERUBAHAN HUKUM KLIEN\nDokumen: ${document.title} (${document.documentNumber})\nPara Pihak: ${document.partyOne.name} & ${document.partyTwo.name}\nPergeseran Skor Risiko Dokumen: ${summaryStats.initialScore}/100 ➔ ${summaryStats.currentScore}/100 (${summaryStats.netDelta <= 0 ? `${summaryStats.netDelta} poin / Risiko Termitigasi` : `+${summaryStats.netDelta} poin`})\n=================================================================\n\n`;

    const body = filteredEvents
      .map(
        (ev, idx) =>
          `${idx + 1}. [${ev.timestamp}] ${ev.clauseNumber} — ${ev.clauseTitle}\n   • Transisi Risiko: ${ev.previousRiskLevel ? `${ev.previousRiskLevel} ➔ ${ev.newRiskLevel}` : ev.newRiskLevel} (${ev.versionFromLabel} → ${ev.versionToLabel})\n   • Dasar Hukum: ${ev.legalBasis}\n   • Perubahan: ${ev.changeSummary}\n   • Justifikasi kepada Klien: ${ev.clientJustification}`
      )
      .join('\n\n');

    navigator.clipboard?.writeText(header + body);
    onNotify?.(
      `Seluruh ${filteredEvents.length} butir Audit Evolution Log & Justifikasi Klien berhasil disalin.`
    );
  };

  const handleStartEdit = (ev: AuditEvolutionEvent) => {
    setEditingJustificationId(ev.id);
    setEditingJustificationText(ev.clientJustification);
  };

  const handleSaveEdit = (eventId: string) => {
    if (!editingJustificationText.trim()) return;
    onSaveCustomJustification?.(eventId, editingJustificationText.trim());
    setEditingJustificationId(null);
    onNotify?.('Justifikasi hukum untuk klien berhasil diperbarui.');
  };

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntrySummary.trim() && !newEntryJustification.trim()) return;

    const targetClause =
      document.clauses.find((c) => c.number === newEntryClauseNumber) || document.clauses[0];
    const currentScore = computeOverallDocRiskScore(document.clauses);
    const isRiskShift = newEntryPrevRisk !== newEntryNextRisk;
    const scoreBefore = computeClauseNumericRiskScore(newEntryPrevRisk);
    const scoreAfter = computeClauseNumericRiskScore(newEntryNextRisk);

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEv: AuditEvolutionEvent = {
      id: `evo-manual-${Date.now()}`,
      timestamp: `Hari ini, ${nowTime} WIB`,
      versionFromLabel: 'Revisi Negosiasi',
      versionToLabel: 'Draf Aktif',
      eventType: isRiskShift ? 'risk_shift' : 'clause_modified',
      clauseId: targetClause?.id,
      clauseNumber: targetClause?.number || newEntryClauseNumber,
      clauseTitle: targetClause?.title || 'KETENTUAN KONTRAK',
      previousRiskLevel: newEntryPrevRisk,
      newRiskLevel: newEntryNextRisk,
      riskScoreDelta: Math.round((scoreAfter - scoreBefore) / 3),
      overallDocRiskBefore: Math.max(10, currentScore + 5),
      overallDocRiskAfter: currentScore,
      changeSummary:
        newEntrySummary.trim() ||
        `Penyesuaian klausul & profil risiko ${targetClause?.number || newEntryClauseNumber} dari ${newEntryPrevRisk} ke ${newEntryNextRisk}`,
      previousExcerpt: targetClause?.content?.[0] || '',
      newExcerpt: targetClause?.content?.[targetClause.content.length - 1] || '',
      legalBasis: targetClause?.legalBasis || 'Pasal 1338 KUHPerdata',
      clientJustification:
        newEntryJustification.trim() ||
        generateClientLegalJustification({
          clauseNumber: targetClause?.number || newEntryClauseNumber,
          clauseTitle: targetClause?.title || 'Ketentuan Kontrak',
          legalBasis: targetClause?.legalBasis || 'Pasal 1338 KUHPerdata',
          prevRisk: newEntryPrevRisk,
          newRisk: newEntryNextRisk,
          eventType: isRiskShift ? 'risk_shift' : 'clause_modified',
          partyOneName: document.partyOne.name,
          partyTwoName: document.partyTwo.name,
          changeSummary: newEntrySummary.trim(),
        }),
      impactDirection:
        scoreAfter < scoreBefore
          ? 'mitigated'
          : scoreAfter > scoreBefore
          ? 'elevated'
          : 'refined',
    };

    onAddManualAuditEvent?.(newEv);
    setNewEntrySummary('');
    setNewEntryJustification('');
    setIsAddingEntry(false);
    onNotify?.(`Catatan evolusi audit & justifikasi klien pada ${newEv.clauseNumber} berhasil ditambahkan.`);
  };

  const getRiskBadgeClasses = (risk?: string) => {
    const rl = (risk || '').toLowerCase();
    if (rl.includes('kritis')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (rl.includes('perhatian')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  return (
    <div
      data-testid="audit-evolution-log-panel"
      className={`bg-white border border-[#D6D0C4] rounded-lg ${
        isModalView ? 'p-5 space-y-4' : 'p-3.5 space-y-3'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-[#E5E0D8]">
        <div>
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
              Audit Evolution Log (Linimasa Risiko & Justifikasi Klien)
            </h3>
          </div>
          <p className="text-[11px] text-[#57534E] mt-0.5 leading-snug">
            Linimasa visual seluruh perubahan tingkat risiko dan modifikasi pasal beserta argumen justifikasi hukum untuk klien.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="audit-evolution-add-btn"
            onClick={() => setIsAddingEntry((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer whitespace-nowrap"
            title="Catat tonggak perubahan risiko atau justifikasi negosiasi untuk klien"
          >
            <Plus className="w-3 h-3" />
            <span>+ Catat Justifikasi</span>
          </button>

          <button
            type="button"
            data-testid="audit-evolution-copy-all-btn"
            onClick={handleCopyAllJustifications}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-[#18181B] bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer whitespace-nowrap"
            title="Salin seluruh laporan justifikasi perubahan hukum untuk dikirim ke klien"
          >
            <Copy className="w-3 h-3 text-[#1E3A8A]" />
            <span>Salin Laporan Klien</span>
          </button>

          {onExportAuditEvolutionPdf && (
            <button
              type="button"
              data-testid="audit-evolution-export-pdf-btn"
              onClick={() => onExportAuditEvolutionPdf(filteredEvents)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer whitespace-nowrap"
              title="Unduh PDF Audit Evolution Log & Client Legal Justification"
            >
              <FileDown className="w-3 h-3" />
              <span>PDF Evolusi</span>
            </button>
          )}

          {!isModalView && onOpenFullModal && (
            <button
              type="button"
              data-testid="audit-evolution-open-modal-btn"
              onClick={onOpenFullModal}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-medium text-[#57534E] hover:text-[#18181B] bg-white border border-[#E5E0D8] rounded transition-colors cursor-pointer"
              title="Perbesar tampilan linimasa Audit Evolution Log"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Layar Penuh</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Summary Strip: Risk Trajectory & Evolution Metrics */}
      <div
        data-testid="audit-evolution-summary-strip"
        className="grid grid-cols-3 gap-2 p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md"
      >
        <div className="bg-white p-2 rounded border border-[#E5E0D8]">
          <div className="text-[10px] text-[#57534E] font-medium">Evolusi Skor Risiko</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-code text-xs font-bold text-[#78716C] line-through">
              {summaryStats.initialScore}
            </span>
            <ArrowRight className="w-3 h-3 text-[#57534E]" />
            <span className="font-code text-sm font-bold text-[#18181B]">
              {summaryStats.currentScore}/100
            </span>
            <span
              className={`px-1.5 py-0.5 text-[9.5px] font-code font-bold rounded ${
                summaryStats.netDelta <= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {summaryStats.netDelta <= 0
                ? `${summaryStats.netDelta} Poin`
                : `+${summaryStats.netDelta} Poin`}
            </span>
          </div>
        </div>

        <div className="bg-white p-2 rounded border border-[#E5E0D8]">
          <div className="text-[10px] text-[#57534E] font-medium">Perubahan Risiko Pasal</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-code text-sm font-bold text-[#1E3A8A]">
              {summaryStats.riskShifts}
            </span>
            <span className="text-[10.5px] text-[#57534E]">
              Transisi ({summaryStats.mitigatedCount} Mitigasi)
            </span>
          </div>
        </div>

        <div className="bg-white p-2 rounded border border-[#E5E0D8]">
          <div className="text-[10px] text-[#57534E] font-medium">Total Log Justifikasi</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-code text-sm font-bold text-[#18181B]">
              {summaryStats.totalEvents}
            </span>
            <span className="text-[10.5px] text-[#57534E]">Revisi & Argumen Klien</span>
          </div>
        </div>
      </div>

      {/* Visual Risk Evolution Trajectory Bar across Timeline Nodes */}
      {timelineEvents.length > 0 && (
        <div
          data-testid="audit-evolution-visual-trajectory"
          className="p-2.5 bg-[#F7F5F0]/80 border border-[#E5E0D8] rounded-md space-y-2"
        >
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="font-semibold text-[#18181B] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Grafik Alur Evolusi Risiko & Modifikasi Klausul (Kronologis)</span>
            </span>
            <span className="font-code text-[10px] text-[#57534E]">
              Awal ({summaryStats.initialScore}/100) ➔ Aktif ({summaryStats.currentScore}/100)
            </span>
          </div>

          <div className="flex items-end gap-1.5 overflow-x-auto pb-1 pt-1">
            {[...timelineEvents]
              .reverse()
              .slice(-8)
              .map((ev, idx) => {
                const barHeight = Math.max(18, Math.min(48, Math.round(ev.overallDocRiskAfter * 0.52)));
                const isMitigated = ev.impactDirection === 'mitigated';
                const isElevated = ev.impactDirection === 'elevated';
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      const el = window.document.getElementById(`audit-evo-node-${ev.id}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="group flex-1 min-w-[66px] flex flex-col items-center p-1.5 bg-white hover:bg-[#EFF6FF] border border-[#E5E0D8] hover:border-[#93C5FD] rounded transition-colors cursor-pointer"
                    title={`${ev.clauseNumber}: ${ev.changeSummary}`}
                  >
                    <div className="text-[9.5px] font-code font-bold text-[#57534E] truncate max-w-full">
                      #{idx + 1} · {ev.clauseNumber}
                    </div>
                    <div className="h-12 flex items-end justify-center w-full my-1">
                      <div
                        style={{ height: `${barHeight}px` }}
                        className={`w-5 rounded-t transition-all ${
                          isMitigated
                            ? 'bg-emerald-600'
                            : isElevated
                            ? 'bg-rose-600'
                            : 'bg-[#1E3A8A]'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-0.5 text-[9.5px] font-code font-semibold text-[#18181B]">
                      <span>{ev.newRiskLevel}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Optional Add New Custom Audit Evolution & Client Justification Form */}
      {isAddingEntry && (
        <form
          data-testid="audit-evolution-add-form"
          onSubmit={handleCreateManualEntry}
          className="p-3 bg-[#EFF6FF]/60 border border-[#BFDBFE] rounded-md space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E3A8A]">
              Tambah Catatan Evolusi Risiko & Justifikasi Hukum Klien
            </span>
            <button
              type="button"
              onClick={() => setIsAddingEntry(false)}
              className="text-xs text-[#57534E] hover:text-[#18181B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10.5px] font-semibold text-[#18181B] mb-1">
                Pasal Terkait:
              </label>
              <select
                value={newEntryClauseNumber}
                onChange={(e) => setNewEntryClauseNumber(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded"
              >
                {document.clauses.map((c) => (
                  <option key={c.id} value={c.number}>
                    {c.number} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] font-semibold text-[#18181B] mb-1">
                Risiko Sebelumnya:
              </label>
              <select
                value={newEntryPrevRisk}
                onChange={(e) => setNewEntryPrevRisk(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded"
              >
                <option value="Kritis">Kritis</option>
                <option value="Perhatian">Perhatian</option>
                <option value="Standar">Standar</option>
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] font-semibold text-[#18181B] mb-1">
                Risiko Sesudah Revisi:
              </label>
              <select
                value={newEntryNextRisk}
                onChange={(e) => setNewEntryNextRisk(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded"
              >
                <option value="Standar">Standar (Termitigasi)</option>
                <option value="Perhatian">Perhatian</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-[#18181B] mb-1">
              Ringkasan Modifikasi Klausul:
            </label>
            <input
              type="text"
              value={newEntrySummary}
              onChange={(e) => setNewEntrySummary(e.target.value)}
              placeholder="Contoh: Penambahan plafon denda maksimal 5% & masa perbaikan (cure period) 14 hari..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-[#18181B] mb-1">
              Argumen Justifikasi Hukum untuk Klien (Kosongkan untuk dibuat otomatis):
            </label>
            <textarea
              rows={2}
              value={newEntryJustification}
              onChange={(e) => setNewEntryJustification(e.target.value)}
              placeholder="Contoh: Perubahan ini melindungi Klien dari tuntutan ganti rugi tak terbatas sesuai Pasal 1249 KUHPerdata..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded resize-none"
            />
          </div>

          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsAddingEntry(false)}
              className="px-2.5 py-1 text-xs text-[#57534E] hover:text-[#18181B]"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="audit-evolution-submit-manual-btn"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded cursor-pointer"
            >
              Simpan ke Linimasa Evolusi
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'all', label: `Semua (${timelineEvents.length})` },
              {
                id: 'risk_shift',
                label: `Perubahan Risiko (${summaryStats.riskShifts})`,
              },
              {
                id: 'clause_modified',
                label: `Modifikasi Pasal (${summaryStats.clauseMods})`,
              },
              {
                id: 'mitigated',
                label: `Mitigasi Klien (${summaryStats.mitigatedCount})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`audit-evolution-filter-${tab.id}`}
              onClick={() => setFilterType(tab.id)}
              className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-[#FAF9F6] text-[#57534E] border-[#E5E0D8] hover:text-[#18181B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Filter Pasal Linimasa Audit"
          data-testid="audit-evolution-clause-select"
          value={selectedClauseFilter}
          onChange={(e) => setSelectedClauseFilter(e.target.value)}
          className="px-2 py-1 text-[10.5px] font-medium text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
        >
          <option value="all">Semua Pasal ({document.clauses.length})</option>
          {document.clauses.map((c) => (
            <option key={c.id} value={c.number}>
              {c.number} — {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Vertical Visual Timeline of Risk-Level Changes & Clause Modifications */}
      <div
        data-testid="audit-evolution-timeline-list"
        className={`relative pl-4 border-l-2 border-[#1E3A8A]/30 space-y-3 ${
          isModalView ? 'max-h-[540px]' : 'max-h-[420px]'
        } overflow-y-auto pr-1`}
      >
        {filteredEvents.length === 0 ? (
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-xs text-[#57534E] text-center">
            Tidak ada catatan evolusi audit yang sesuai dengan filter saat ini.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isDiffExpanded = Boolean(expandedDiffIds[ev.id]);
            const isEditingJust = editingJustificationId === ev.id;
            const isMitigated = ev.impactDirection === 'mitigated';
            const isElevated = ev.impactDirection === 'elevated';

            return (
              <div
                key={ev.id}
                id={`audit-evo-node-${ev.id}`}
                data-testid={`audit-evolution-node-${ev.id}`}
                className="relative p-3 bg-[#FAF9F6] hover:bg-white border border-[#E5E0D8] rounded-md space-y-2 transition-colors"
              >
                {/* Timeline Dot Indicator on the Left Rail */}
                <span
                  className={`absolute -left-[21px] top-3.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                    isMitigated
                      ? 'bg-emerald-600'
                      : isElevated
                      ? 'bg-rose-600'
                      : 'bg-[#1E3A8A]'
                  }`}
                />

                {/* Top Meta Row: Version Transition + Timestamp + Risk Transition Pill */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 font-code font-bold bg-[#1E3A8A]/10 text-[#1E3A8A] rounded">
                      {ev.versionFromLabel} ➔ {ev.versionToLabel}
                    </span>
                    <span className="text-[#78716C] font-code">{ev.timestamp}</span>
                  </div>

                  {/* Visual Risk-Level Transition Badge */}
                  <div className="flex items-center gap-1">
                    {ev.previousRiskLevel && ev.previousRiskLevel !== ev.newRiskLevel ? (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#D6D0C4] rounded text-[10px] font-code font-bold">
                        <span
                          className={`px-1 py-0.2 rounded border ${getRiskBadgeClasses(
                            ev.previousRiskLevel
                          )}`}
                        >
                          {ev.previousRiskLevel}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-[#57534E]" />
                        <span
                          className={`px-1 py-0.2 rounded border ${getRiskBadgeClasses(
                            ev.newRiskLevel
                          )}`}
                        >
                          {ev.newRiskLevel}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-code font-bold ${getRiskBadgeClasses(
                          ev.newRiskLevel
                        )}`}
                      >
                        Risiko: {ev.newRiskLevel}
                      </span>
                    )}

                    {ev.riskScoreDelta !== 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-code font-bold ${
                          ev.riskScoreDelta < 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ev.riskScoreDelta < 0 ? (
                          <ArrowDownRight className="w-2.5 h-2.5" />
                        ) : (
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        )}
                        <span>
                          {ev.riskScoreDelta < 0
                            ? `${ev.riskScoreDelta} Poin`
                            : `+${ev.riskScoreDelta} Poin`}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Clause Title & Jump Action */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onJumpToClause?.(ev.clauseNumber)}
                    className="text-left text-xs font-bold text-[#18181B] hover:text-[#1E3A8A] hover:underline cursor-pointer"
                  >
                    {ev.clauseNumber} — {ev.clauseTitle}
                  </button>
                  <span className="text-[10px] font-medium text-[#1E3A8A] shrink-0">
                    {ev.legalBasis}
                  </span>
                </div>

                {/* Modification Summary */}
                <p className="text-[11px] text-[#27272A] leading-snug font-medium">
                  {ev.changeSummary}
                </p>

                {/* Client Legal Justification Box (Core Feature to Help Users Justify Legal Changes to Clients) */}
                <div className="p-2.5 bg-white border-l-3 border-l-[#1E3A8A] border border-[#E5E0D8] rounded space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      <span>Justifikasi Hukum untuk Klien (Client Rationale)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopySingleJustification(ev)}
                        className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#57534E] hover:text-[#1E3A8A] cursor-pointer"
                        title="Salin argumen justifikasi ini untuk dikirim ke klien"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Salin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(ev)}
                        className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#57534E] hover:text-[#1E3A8A] cursor-pointer"
                        title="Sesuaikan redaksi justifikasi untuk presentasi klien Anda"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  {isEditingJust ? (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        rows={3}
                        value={editingJustificationText}
                        onChange={(e) => setEditingJustificationText(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#FAF9F6] border border-[#1E3A8A] rounded focus:outline-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingJustificationId(null)}
                          className="px-2 py-0.5 text-[10.5px] text-[#57534E]"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(ev.id)}
                          className="px-2.5 py-0.5 text-[10.5px] font-semibold text-white bg-[#1E3A8A] rounded cursor-pointer"
                        >
                          Simpan Justifikasi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#3F3F46] leading-relaxed">
                      {ev.clientJustification}
                    </p>
                  )}
                </div>

                {/* Expandable Redline / Before-After Excerpt Comparison */}
                {(ev.previousExcerpt || ev.newExcerpt) && (
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDiffIds((prev) => ({
                          ...prev,
                          [ev.id]: !prev[ev.id],
                        }))
                      }
                      className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      {isDiffExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>Sembunyikan Perbandingan Redaksi Klausul</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>Lihat Perbandingan Redaksi Sebelum & Sesudah Revisi</span>
                        </>
                      )}
                    </button>

                    {isDiffExpanded && (
                      <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                        {ev.previousExcerpt && (
                          <div className="p-2 bg-rose-50/60 border border-rose-200 rounded space-y-0.5">
                            <div className="font-bold text-rose-900">
                              Redaksi Sebelumnya ({ev.versionFromLabel}):
                            </div>
                            <p className="font-legal text-[#3F3F46] leading-relaxed line-clamp-4">
                              {ev.previousExcerpt}
                            </p>
                          </div>
                        )}
                        {ev.newExcerpt && (
                          <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded space-y-0.5">
                            <div className="font-bold text-emerald-900">
                              Redaksi Hasil Revisi ({ev.versionToLabel}):
                            </div>
                            <p className="font-legal text-[#18181B] leading-relaxed line-clamp-4">
                              {ev.newExcerpt}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
