import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Grid,
  AlertTriangle,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  History,
  BookmarkCheck,
  Replace,
  Zap,
} from 'lucide-react';
import { LegalClause, RegulationSearchHistoryItem } from '../types/legal';
import { DEFAULT_REGULATION_SEARCH_HISTORY } from '../utils/autoGlossaryAgent';

export interface HeatmapCellData {
  cellId: string;
  clauseId: string;
  clauseNumber: string;
  clauseTitle: string;
  regId: string;
  regShortLabel: string;
  regReference: string;
  regCategory: string;
  fromSearchHistory: boolean;
  searchQuery: string;
  searchedAt: string;
  status: 'needs_update' | 'compliant' | 'partial' | 'neutral';
  complianceScore: number; // 0 to 100
  updatePriorityScore: number; // 0 to 100 (higher = more urgent update needed)
  reason: string;
  recommendedUpdateAyat: string;
  recommendedLegalBasisAppend: string;
}

export type RegulatoryClauseApplyMode =
  | 'fill_direct'
  | 'replace_clause'
  | 'mark_for_review';

export interface BulkRegulatoryUpdateItem {
  clauseId: string;
  clauseNumber: string;
  regId: string;
  regReference: string;
  regShortLabel: string;
  recommendedAyat: string;
}

interface RegulatoryComplianceHeatmapProps {
  clauses: LegalClause[];
  searchHistory?: RegulationSearchHistoryItem[];
  onJumpToClause?: (clauseId: string) => void;
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

function evaluateClauseAgainstRegulation(
  clause: LegalClause,
  reg: RegulationSearchHistoryItem,
  clauseIndex: number,
  totalClauses: number
): Omit<
  HeatmapCellData,
  | 'cellId'
  | 'clauseId'
  | 'clauseNumber'
  | 'clauseTitle'
  | 'regId'
  | 'regShortLabel'
  | 'regReference'
  | 'regCategory'
  | 'fromSearchHistory'
  | 'searchQuery'
  | 'searchedAt'
> {
  const fullClauseText = `${clause.title} ${clause.legalBasis} ${clause.content.join(' ')}`.toLowerCase();
  const basisLower = (clause.legalBasis || '').toLowerCase();
  const titleLower = (clause.title || '').toLowerCase();
  const refLower = reg.referenceNumber.toLowerCase();
  const queryLower = reg.query.toLowerCase();

  const alreadyAppliedByAiAgent =
    Array.isArray(clause.appliedRegulations) &&
    (clause.appliedRegulations.includes(reg.id) ||
      clause.appliedRegulations.includes(reg.referenceNumber) ||
      clause.appliedRegulations.includes(reg.shortLabel));

  // Check if clause already explicitly cites key numbers from this regulation
  const regNumbers = (reg.referenceNumber.match(/\d{2,4}/g) || []).filter(
    (n) => n !== '2026'
  );
  const explicitlyCitedInBasis =
    alreadyAppliedByAiAgent ||
    basisLower.includes(refLower) ||
    (regNumbers.length > 0 && regNumbers.some((num) => basisLower.includes(num)));

  // Count keyword hits
  const keywordHits = reg.keywords.filter((kw) => fullClauseText.includes(kw.toLowerCase()));
  const titleKeywordHits = reg.keywords.filter((kw) =>
    titleLower.includes(kw.toLowerCase())
  );

  // Domain-specific matching rules between clauses and active Indonesian regulations
  const isPdpReg = /27\s*tahun\s*2022|pdp|data pribadi/i.test(
    `${reg.referenceNumber} ${reg.query}`
  );
  const is1266Reg = /1266|1267|pemutusan/i.test(`${reg.referenceNumber} ${reg.query}`);
  const is1320Reg = /1320|1338|syarat sah/i.test(`${reg.referenceNumber} ${reg.query}`);
  const isHkiReg = /28\s*tahun\s*2014|hak cipta|hki/i.test(
    `${reg.referenceNumber} ${reg.query}`
  );
  const isPp35Reg = /35\s*tahun\s*2021|pkwt|kompensasi|kerja/i.test(
    `${reg.referenceNumber} ${reg.query}`
  );
  const isArbitraseReg = /30\s*tahun\s*1999|arbitrase|sengketa|bani/i.test(
    `${reg.referenceNumber} ${reg.query}`
  );

  let domainMatch = false;
  let hasFullStatutorySafeguard = false;
  let recommendedUpdateAyat = '';
  let reason = '';

  if (isPdpReg) {
    domainMatch =
      /rahasia|data|informasi|privasi|keamanan|kewajiban|sistem|teknologi/i.test(
        fullClauseText
      ) || clauseIndex === Math.min(2, totalClauses - 1);
    hasFullStatutorySafeguard =
      explicitlyCitedInBasis && /3\s*x\s*24|72\s*jam|notifikasi|pemberitahuan/i.test(fullClauseText);
    recommendedUpdateAyat =
      'Para Pihak wajib mematuhi ketentuan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP), termasuk kewajiban menyampaikan pemberitahuan tertulis selambat-lambatnya 3x24 (tiga kali dua puluh empat) jam apabila terjadi kegagalan pelindungan atau kebocoran Data Pribadi.';
    reason = hasFullStatutorySafeguard
      ? `Pasal ini telah memuat rujukan ${reg.referenceNumber} beserta mekanisme notifikasi insiden data 3x24 jam.`
      : `Berdasarkan riwayat pencarian "${reg.query}", bagian ini menyangkut kerahasiaan/data namun belum mencantumkan kewajiban notifikasi kebocoran data 3x24 jam sesuai ${reg.referenceNumber}.`;
  } else if (is1266Reg) {
    domainMatch =
      /pengakhiran|pemutusan|berakhir|wanprestasi|cidera janji|sanksi|batal|jangka waktu/i.test(
        fullClauseText
      );
    hasFullStatutorySafeguard =
      /1266/.test(fullClauseText) && /1267/.test(fullClauseText);
    recommendedUpdateAyat =
      'Untuk keperluan pengakhiran Perjanjian ini, Para Pihak sepakat secara tegas mengesampingkan berlakunya ketentuan Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata sepanjang mengenai diperlukannya putusan pengadilan untuk membatalkan perjanjian.';
    reason = hasFullStatutorySafeguard
      ? `Pasal ini telah mencantumkan pengesampingan tegas Pasal 1266 & 1267 KUHPerdata.`
      : `Berdasarkan riwayat pencarian "${reg.query}", pasal ini mengatur wanprestasi/berakhirnya perikatan namun perlu diperbarui dengan klausul pengesampingan tegas Pasal 1266 & 1267 KUHPerdata.`;
  } else if (is1320Reg) {
    domainMatch =
      /ruang lingkup|definisi|pokok|maksud|tujuan|hak|kewajiban|kesepakatan|jaminan/i.test(
        fullClauseText
      ) || clauseIndex === 0;
    hasFullStatutorySafeguard =
      /1320|1338/.test(fullClauseText) && /itikad baik|mengikat/i.test(fullClauseText);
    recommendedUpdateAyat =
      'Perjanjian ini dibuat berdasarkan kesepakatan bebas, kecakapan bertindak, objek tertentu, dan sebab yang halal sesuai Pasal 1320 KUHPerdata serta dilaksanakan dengan itikad baik sebagaimana diatur dalam Pasal 1338 KUHPerdata.';
    reason = hasFullStatutorySafeguard
      ? `Pasal ini telah selaras penuh dengan syarat keabsahan Pasal 1320 & asas Pacta Sunt Servanda Pasal 1338 KUHPerdata.`
      : `Berdasarkan riwayat pencarian "${reg.query}", pasal pokok ini disarankan memuat penegasan syarat sah Pasal 1320 & pelaksanaan beritikad baik Pasal 1338 KUHPerdata.`;
  } else if (isHkiReg) {
    domainMatch =
      /kekayaan intelektual|hki|hak cipta|karya|desain|kode|lisensi|hasil pekerjaan|serah terima|ruang lingkup/i.test(
        fullClauseText
      );
    hasFullStatutorySafeguard =
      explicitlyCitedInBasis || (/hak cipta|kekayaan intelektual/i.test(fullClauseText) && /28\s*tahun\s*2014|eksklusif|pelunasan/i.test(fullClauseText));
    recommendedUpdateAyat =
      'Sesuai ketentuan Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta, seluruh hak ekonomi dan kepemilikan atas karya cipta, dokumentasi, maupun hasil pelaksanaan pekerjaan beralih secara sah setelah pelunasan kewajiban pembayaran dipenuhi.';
    reason = hasFullStatutorySafeguard
      ? `Ketentuan kepemilikan/lisensi HKI pada pasal ini telah selaras dengan ${reg.referenceNumber}.`
      : `Berdasarkan riwayat pencarian "${reg.query}", pasal ini berkaitan dengan hasil pekerjaan/aset namun perlu pembaruan klausul peralihan hak ekonomi sesuai ${reg.referenceNumber}.`;
  } else if (isPp35Reg) {
    domainMatch =
      /pembayaran|biaya|upah|kompensasi|jasa|tenaga|pelaksanaan|termin|jangka waktu|kewajiban/i.test(
        fullClauseText
      );
    hasFullStatutorySafeguard =
      explicitlyCitedInBasis || /uang kompensasi|pp\s*no\.?\s*35/i.test(fullClauseText);
    recommendedUpdateAyat =
      'Pelaksanaan pekerjaan, imbalan jasa, dan pemenuhan hak kompensasi wajib mengindahkan standar perlindungan hukum yang berlaku berdasarkan Peraturan Pemerintah Nomor 35 Tahun 2021 beserta ketentuan pelaksanaannya.';
    reason = hasFullStatutorySafeguard
      ? `Pasal ini telah memuat rujukan kepatuhan kompensasi & pelaksanaan sesuai ${reg.referenceNumber}.`
      : `Berdasarkan riwayat pencarian "${reg.query}", pasal terkait pembayaran/pelaksanaan kerja ini perlu penyesuaian standar kepatuhan ${reg.referenceNumber}.`;
  } else if (isArbitraseReg) {
    domainMatch =
      /sengketa|perselisihan|musyawarah|arbitrase|pengadilan|domisili|hukum|penutup/i.test(
        fullClauseText
      ) || clauseIndex === totalClauses - 1;
    hasFullStatutorySafeguard =
      /30\s*tahun\s*1999|arbitrase|bani|musyawarah/i.test(fullClauseText) &&
      /hari kalender|pengadilan negeri/i.test(fullClauseText);
    recommendedUpdateAyat =
      'Apabila musyawarah untuk mufakat dalam jangka waktu 30 (tiga puluh) hari kalender tidak mencapai kesepakatan, Para Pihak sepakat menyelesaikan perselisihan melalui mekanisme penyelesaian sengketa sesuai Undang-Undang Nomor 30 Tahun 1999 tentang Arbitrase dan Alternatif Penyelesaian Sengketa atau Pengadilan Negeri yang berwenang.';
    reason = hasFullStatutorySafeguard
      ? `Klausul penyelesaian sengketa pada pasal ini telah mengatur tenggat musyawarah & pilihan forum sesuai ${reg.referenceNumber}.`
      : `Berdasarkan riwayat pencarian "${reg.query}", pasal ini perlu diperjelas tenggat musyawarah dan rujukan ${reg.referenceNumber}.`;
  } else {
    domainMatch = titleKeywordHits.length > 0 || keywordHits.length >= 2;
    hasFullStatutorySafeguard =
      explicitlyCitedInBasis || fullClauseText.includes(refLower);
    recommendedUpdateAyat = `Dalam melaksanakan ketentuan Pasal ini, Para Pihak wajib mematuhi ketentuan peraturan perundang-undangan yang berlaku terkait ${reg.referenceNumber} (${reg.query}).`;
    reason = hasFullStatutorySafeguard
      ? `Pasal ini telah mencantumkan rujukan terhadap ${reg.referenceNumber}.`
      : `Berdasarkan riwayat pencarian "${reg.query}", pasal ini memiliki irisan substansi yang memerlukan pembaruan rujukan ${reg.referenceNumber}.`;
  }

  if (
    alreadyAppliedByAiAgent ||
    hasFullStatutorySafeguard ||
    (recommendedUpdateAyat &&
      fullClauseText.includes(recommendedUpdateAyat.slice(0, 32).toLowerCase()))
  ) {
    return {
      status: 'compliant',
      complianceScore: alreadyAppliedByAiAgent ? 98 : 94,
      updatePriorityScore: 10,
      reason: alreadyAppliedByAiAgent
        ? `Pasal tujuan ini telah langsung diisi/diganti oleh AI Agent sesuai rekomendasi ${reg.referenceNumber}.`
        : reason,
      recommendedUpdateAyat,
      recommendedLegalBasisAppend: reg.referenceNumber,
    };
  }

  if (domainMatch || titleKeywordHits.length > 0) {
    const isCriticalClause = (clause.riskLevel || '').toLowerCase() === 'kritis';
    return {
      status: 'needs_update',
      complianceScore: isCriticalClause ? 38 : 52,
      updatePriorityScore: isCriticalClause ? 92 : 78,
      reason,
      recommendedUpdateAyat,
      recommendedLegalBasisAppend: reg.referenceNumber,
    };
  }

  if (keywordHits.length === 1) {
    return {
      status: 'partial',
      complianceScore: 74,
      updatePriorityScore: 42,
      reason: `Terdapat keterkaitan tidak langsung dengan ${reg.referenceNumber}; dapat diperkuat apabila relevan dengan objek transaksi.`,
      recommendedUpdateAyat,
      recommendedLegalBasisAppend: reg.referenceNumber,
    };
  }

  return {
    status: 'neutral',
    complianceScore: 85,
    updatePriorityScore: 10,
    reason: `Substansi ${clause.number} tidak terdampak langsung oleh perubahan atau persyaratan spesifik ${reg.referenceNumber}.`,
    recommendedUpdateAyat,
    recommendedLegalBasisAppend: reg.referenceNumber,
  };
}

export const RegulatoryComplianceHeatmap: React.FC<
  RegulatoryComplianceHeatmapProps
> = ({
  clauses,
  searchHistory,
  onJumpToClause,
  onApplyRegulatoryUpdateToClause,
  onApplyAllRegulatoryUpdates,
  onAddSearchHistoryQuery,
  onOpenRegulationSearchTab,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [onlyNeedsUpdateFilter, setOnlyNeedsUpdateFilter] = useState<boolean>(false);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [quickRegInput, setQuickRegInput] = useState<string>('');
  const [applyActionMode, setApplyActionMode] =
    useState<RegulatoryClauseApplyMode>('fill_direct');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activeRegulations = useMemo<RegulationSearchHistoryItem[]>(() => {
    const list =
      Array.isArray(searchHistory) && searchHistory.length > 0
        ? searchHistory
        : DEFAULT_REGULATION_SEARCH_HISTORY;
    return list.slice(0, 6);
  }, [searchHistory]);

  const heatmapMatrix = useMemo(() => {
    const cells: HeatmapCellData[] = [];
    clauses.forEach((clause, cIdx) => {
      activeRegulations.forEach((reg) => {
        const evalRes = evaluateClauseAgainstRegulation(
          clause,
          reg,
          cIdx,
          clauses.length
        );
        cells.push({
          cellId: `${clause.id}__${reg.id}`,
          clauseId: clause.id,
          clauseNumber: clause.number,
          clauseTitle: clause.title,
          regId: reg.id,
          regShortLabel: reg.shortLabel,
          regReference: reg.referenceNumber,
          regCategory: reg.category,
          fromSearchHistory: true,
          searchQuery: reg.query,
          searchedAt: reg.searchedAt,
          ...evalRes,
        });
      });
    });

    // Guarantee every searched regulation highlights at least 1 clause if none matched yet
    activeRegulations.forEach((reg) => {
      const regCells = cells.filter((c) => c.regId === reg.id);
      const hasHighlightedOrCompliant = regCells.some(
        (c) => c.status === 'needs_update' || c.status === 'compliant'
      );
      if (!hasHighlightedOrCompliant && regCells.length > 0) {
        const targetCell = regCells[0];
        targetCell.status = 'needs_update';
        targetCell.complianceScore = 45;
        targetCell.updatePriorityScore = 84;
      }
    });

    return cells;
  }, [clauses, activeRegulations]);

  const needsUpdateCells = useMemo(
    () => heatmapMatrix.filter((c) => c.status === 'needs_update'),
    [heatmapMatrix]
  );

  const compliantCells = useMemo(
    () => heatmapMatrix.filter((c) => c.status === 'compliant'),
    [heatmapMatrix]
  );

  const highlightedClauseNumbers = useMemo(
    () =>
      Array.from(
        new Set(needsUpdateCells.map((c) => c.clauseNumber))
      ),
    [needsUpdateCells]
  );

  const visibleClauses = useMemo(() => {
    if (!onlyNeedsUpdateFilter) return clauses;
    const filtered = clauses.filter(
      (cl) =>
        needsUpdateCells.some((cell) => cell.clauseId === cl.id) ||
        (selectedCellId !== null && selectedCellId.startsWith(`${cl.id}::`))
    );
    return filtered.length > 0 ? filtered : clauses;
  }, [clauses, onlyNeedsUpdateFilter, needsUpdateCells, selectedCellId]);

  const selectedCell = useMemo(() => {
    if (selectedCellId) {
      const found = heatmapMatrix.find((c) => c.cellId === selectedCellId);
      if (found) return found;
    }
    return needsUpdateCells[0] || heatmapMatrix[0] || null;
  }, [selectedCellId, heatmapMatrix, needsUpdateCells]);

  // Compute D3 layout scales (d3.scaleBand & d3.scaleOrdinal)
  const d3Layout = useMemo(() => {
    const marginLeft = 72;
    const marginTop = 44;
    const marginRight = 10;
    const marginBottom = 12;
    const colWidth = 48;
    const rowHeight = 28;

    const innerWidth = Math.max(180, activeRegulations.length * colWidth);
    const innerHeight = Math.max(56, visibleClauses.length * rowHeight);
    const svgWidth = marginLeft + innerWidth + marginRight;
    const svgHeight = marginTop + innerHeight + marginBottom;

    const xScale = d3
      .scaleBand<string>()
      .domain(activeRegulations.map((r) => r.id))
      .range([marginLeft, marginLeft + innerWidth])
      .paddingInner(0.12)
      .paddingOuter(0.06);

    const yScale = d3
      .scaleBand<string>()
      .domain(visibleClauses.map((c) => c.id))
      .range([marginTop, marginTop + innerHeight])
      .paddingInner(0.16)
      .paddingOuter(0.08);

    const fillScale = d3
      .scaleOrdinal<HeatmapCellData['status'], string>()
      .domain(['needs_update', 'partial', 'compliant', 'neutral'])
      .range(['#FEE2E2', '#EFF6FF', '#DCFCE7', '#F5F3EF']);

    const strokeScale = d3
      .scaleOrdinal<HeatmapCellData['status'], string>()
      .domain(['needs_update', 'partial', 'compliant', 'neutral'])
      .range(['#DC2626', '#93C5FD', '#16A34A', '#E5E0D8']);

    const textFillScale = d3
      .scaleOrdinal<HeatmapCellData['status'], string>()
      .domain(['needs_update', 'partial', 'compliant', 'neutral'])
      .range(['#991B1B', '#1E3A8A', '#166534', '#78716C']);

    return {
      svgWidth,
      svgHeight,
      marginLeft,
      marginTop,
      xScale,
      yScale,
      fillScale,
      strokeScale,
      textFillScale,
    };
  }, [activeRegulations, visibleClauses]);

  // Bind D3 data metadata & subtle transition enhancement via d3.select
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .attr('data-d3-rendered', 'true')
      .attr('data-d3-version', d3.version || '7.x');

    svg
      .selectAll<SVGGElement, unknown>('g.d3-heatmap-cell-group')
      .each(function () {
        const group = d3.select(this);
        group.attr('data-d3-bound', 'true');
      });
  }, [heatmapMatrix, visibleClauses, isExpanded]);

  const handleQuickAddSearchQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickRegInput.trim();
    if (!q) return;
    onAddSearchHistoryQuery?.(q);
    setQuickRegInput('');
  };

  return (
    <div
      data-testid="regulatory-compliance-heatmap-section"
      className="pt-2.5 border-t border-[#E5E0D8] space-y-2.5"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          data-testid="toggle-regulatory-heatmap-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B] hover:text-[#1E3A8A] cursor-pointer text-left"
        >
          <Grid className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
          <span>Regulatory Compliance Heatmap (D3 · Riwayat Cari UU)</span>
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-[10.5px] font-medium text-[#1E3A8A] hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
        >
          <span>{isExpanded ? 'Sembunyikan' : 'Tampilkan'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div
          data-testid="regulatory-compliance-heatmap-card"
          className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2.5"
        >
          {/* Summary Banner & Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10.5px] text-[#57534E]">
              <span>Pemetaan D3 </span>
              <strong className="font-code text-[#18181B]">
                {clauses.length} Pasal × {activeRegulations.length} Regulasi RI Aktif
              </strong>
              <span> · </span>
              <strong
                data-testid="heatmap-needs-update-count"
                className="font-code text-rose-700"
              >
                {needsUpdateCells.length} Titik Perlu Pembaruan
              </strong>
              <span> · </span>
              <span className="font-code text-emerald-700 font-semibold">
                {compliantCells.length} Selaras
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="heatmap-filter-needs-update-btn"
                onClick={() => setOnlyNeedsUpdateFilter((prev) => !prev)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                  onlyNeedsUpdateFilter
                    ? 'bg-rose-700 text-white border-rose-700'
                    : 'bg-white text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                }`}
              >
                {onlyNeedsUpdateFilter ? 'Semua Pasal' : 'Fokus Perlu Update'}
              </button>
              {onOpenRegulationSearchTab && (
                <button
                  type="button"
                  data-testid="heatmap-open-cari-uu-btn"
                  onClick={onOpenRegulationSearchTab}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded cursor-pointer"
                  title="Buka tab Cari Pasal & UU untuk menelusuri regulasi baru"
                >
                  <Search className="w-2.5 h-2.5" />
                  <span>Cari Pasal & UU</span>
                </button>
              )}
            </div>
          </div>

          {/* Highlighted Sections Alert based on 'Cari Pasal & UU' Search History + 1-Click Direct Fill/Mark All Target Clauses */}
          {highlightedClauseNumbers.length > 0 ? (
            <div
              data-testid="heatmap-highlighted-clauses-alert"
              className="p-2.5 bg-amber-50/90 border border-amber-300 rounded text-[10.5px] text-amber-950 space-y-2"
            >
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Sorotan Riwayat &lsquo;Cari Pasal &amp; UU&rsquo;:</strong> Bagian{' '}
                  <span className="font-code font-bold text-rose-800">
                    {highlightedClauseNumbers.join(', ')}
                  </span>{' '}
                  perlu ditinjau/diperbarui terhadap regulasi yang baru ditelusuri. Pilih aksi cepat di bawah agar langsung terisi ke pasal tujuan atau beri tanda cek:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  data-testid="heatmap-apply-all-needs-update-btn"
                  onClick={() => {
                    const bulkList: BulkRegulatoryUpdateItem[] = needsUpdateCells.map((c) => ({
                      clauseId: c.clauseId,
                      clauseNumber: c.clauseNumber,
                      regId: c.regId,
                      regReference: c.regReference,
                      regShortLabel: c.regShortLabel,
                      recommendedAyat: c.recommendedUpdateAyat,
                    }));
                    if (onApplyAllRegulatoryUpdates) {
                      onApplyAllRegulatoryUpdates(bulkList, 'fill_direct');
                    } else if (onApplyRegulatoryUpdateToClause) {
                      bulkList.forEach((item) =>
                        onApplyRegulatoryUpdateToClause(
                          item.clauseId,
                          item.regReference,
                          item.recommendedAyat,
                          'fill_direct',
                          item.regId,
                          item.regShortLabel
                        )
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer"
                  title="Langsung isi seluruh rekomendasi AI Agent ke masing-masing pasal tujuan sekaligus tanpa harus mengecek satu per satu"
                >
                  <Zap className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>
                    Isi Langsung Semua Pasal Tujuan ({needsUpdateCells.length} Titik → Otomatis Patuh)
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="heatmap-mark-all-clauses-btn"
                  onClick={() => {
                    const bulkList: BulkRegulatoryUpdateItem[] = needsUpdateCells.map((c) => ({
                      clauseId: c.clauseId,
                      clauseNumber: c.clauseNumber,
                      regId: c.regId,
                      regReference: c.regReference,
                      regShortLabel: c.regShortLabel,
                      recommendedAyat: c.recommendedUpdateAyat,
                    }));
                    if (onApplyAllRegulatoryUpdates) {
                      onApplyAllRegulatoryUpdates(bulkList, 'mark_for_review');
                    } else if (onApplyRegulatoryUpdateToClause) {
                      bulkList.forEach((item) =>
                        onApplyRegulatoryUpdateToClause(
                          item.clauseId,
                          item.regReference,
                          item.recommendedAyat,
                          'mark_for_review',
                          item.regId,
                          item.regShortLabel
                        )
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-amber-900 bg-white hover:bg-amber-100 border border-amber-400 rounded transition-colors cursor-pointer"
                  title="Beri tanda visual pada pasal-pasal di Editor Naskah yang perlu dicek atau diubah isinya terlebih dahulu"
                >
                  <BookmarkCheck className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>Tandai Pasal untuk Dicek Dulu ({highlightedClauseNumbers.length} Pasal)</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              data-testid="heatmap-all-compliant-banner"
              className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded text-[10.5px] text-emerald-950 flex items-center gap-1.5 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Seluruh pasal tujuan telah diisi dan selaras 100% dengan riwayat regulasi aktif.
              </span>
            </div>
          )}

          {/* D3 SVG Matrix Visual */}
          <div className="bg-white border border-[#E5E0D8] rounded p-1.5 overflow-x-auto">
            <svg
              ref={svgRef}
              data-testid="d3-regulatory-compliance-heatmap-svg"
              viewBox={`0 0 ${d3Layout.svgWidth} ${d3Layout.svgHeight}`}
              className="w-full h-auto min-w-[300px]"
              role="img"
              aria-label="D3 Regulatory Compliance Heatmap memetakan pasal dokumen terhadap regulasi Indonesia aktif"
            >
              {/* Top-left corner axis title */}
              <text
                x={6}
                y={16}
                fontSize="7.5"
                fontWeight="700"
                fill="#57534E"
                fontFamily="monospace"
              >
                PASAL \ UU RI
              </text>
              <text
                x={6}
                y={27}
                fontSize="6.5"
                fill="#78716C"
                fontFamily="monospace"
              >
                (Riwayat Cari)
              </text>

              {/* Column Headers: Active Indonesian Regulations from Search History */}
              {activeRegulations.map((reg, colIdx) => {
                const x = d3Layout.xScale(reg.id) ?? 0;
                const bw = d3Layout.xScale.bandwidth();
                const centerX = x + bw / 2;
                return (
                  <g
                    key={`col-hdr-${reg.id}`}
                    data-testid={`heatmap-reg-col-${colIdx}`}
                  >
                    <rect
                      x={x}
                      y={4}
                      width={bw}
                      height={34}
                      rx={3}
                      fill="#FAF9F6"
                      stroke="#E5E0D8"
                      strokeWidth={0.8}
                    />
                    <text
                      x={centerX}
                      y={16}
                      fontSize="6.8"
                      fontWeight="700"
                      textAnchor="middle"
                      fill="#1E3A8A"
                      fontFamily="monospace"
                    >
                      {reg.shortLabel.slice(0, 11)}
                    </text>
                    <text
                      x={centerX}
                      y={26}
                      fontSize="6"
                      textAnchor="middle"
                      fill="#57534E"
                      fontFamily="monospace"
                    >
                      {reg.shortLabel.slice(11, 22) || reg.category.slice(0, 10)}
                    </text>
                    <circle
                      cx={x + bw - 5}
                      cy={9}
                      r={2}
                      fill="#D97706"
                    >
                      <title>Dari Riwayat Cari Pasal &amp; UU: {reg.query}</title>
                    </circle>
                  </g>
                );
              })}

              {/* Rows: Document Clauses & D3 Matrix Cells */}
              {visibleClauses.map((clause) => {
                const y = d3Layout.yScale(clause.id) ?? 0;
                const bh = d3Layout.yScale.bandwidth();
                const rowHasUpdateNeeded = needsUpdateCells.some(
                  (c) => c.clauseId === clause.id
                );

                return (
                  <g
                    key={`row-${clause.id}`}
                    data-testid={`heatmap-clause-row-${clause.id}`}
                  >
                    {/* Clause Label on Y-axis with Target Clause Status Marker */}
                    <g
                      onClick={() => onJumpToClause?.(clause.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={2}
                        y={y}
                        width={d3Layout.marginLeft - 6}
                        height={bh}
                        rx={3}
                        fill={
                          clause.regulatoryUpdateMarker?.status === 'needs_review'
                            ? '#FFFBEB'
                            : clause.regulatoryUpdateMarker?.status === 'applied_direct' ||
                              clause.regulatoryUpdateMarker?.status === 'applied_replace'
                            ? '#ECFDF5'
                            : rowHasUpdateNeeded
                            ? '#FEF2F2'
                            : '#FAF9F6'
                        }
                        stroke={
                          clause.regulatoryUpdateMarker?.status === 'needs_review'
                            ? '#F59E0B'
                            : clause.regulatoryUpdateMarker?.status === 'applied_direct' ||
                              clause.regulatoryUpdateMarker?.status === 'applied_replace'
                            ? '#10B981'
                            : rowHasUpdateNeeded
                            ? '#FECACA'
                            : '#E5E0D8'
                        }
                        strokeWidth={clause.regulatoryUpdateMarker ? 1.3 : 0.8}
                      />
                      <text
                        x={7}
                        y={y + bh / 2 - 1.5}
                        fontSize="7.5"
                        fontWeight="700"
                        fill={rowHasUpdateNeeded ? '#991B1B' : '#18181B'}
                        fontFamily="monospace"
                      >
                        {clause.number}
                      </text>
                      {clause.regulatoryUpdateMarker && (
                        <circle
                          cx={d3Layout.marginLeft - 10}
                          cy={y + 6}
                          r={2.5}
                          fill={
                            clause.regulatoryUpdateMarker.status === 'needs_review'
                              ? '#D97706'
                              : '#059669'
                          }
                        />
                      )}
                      <text
                        x={7}
                        y={y + bh / 2 + 6.5}
                        fontSize="5.8"
                        fill="#57534E"
                      >
                        {clause.title.slice(0, 11)}
                      </text>
                    </g>

                    {/* Cells for each regulation */}
                    {activeRegulations.map((reg) => {
                      const cell = heatmapMatrix.find(
                        (c) => c.clauseId === clause.id && c.regId === reg.id
                      );
                      if (!cell) return null;

                      const x = d3Layout.xScale(reg.id) ?? 0;
                      const bw = d3Layout.xScale.bandwidth();
                      const isSelected = selectedCell?.cellId === cell.cellId;
                      const isNeedsUpdate = cell.status === 'needs_update';
                      const isCompliant = cell.status === 'compliant';

                      return (
                        <g
                          key={cell.cellId}
                          data-testid={`heatmap-cell-${clause.number.replace(/\s+/g, '-')}-${reg.id}`}
                          data-status={cell.status}
                          onClick={() => setSelectedCellId(cell.cellId)}
                          className="d3-heatmap-cell-group cursor-pointer"
                        >
                          <rect
                            x={x}
                            y={y}
                            width={bw}
                            height={bh}
                            rx={3}
                            fill={d3Layout.fillScale(cell.status)}
                            stroke={
                              isSelected
                                ? '#1E3A8A'
                                : d3Layout.strokeScale(cell.status)
                            }
                            strokeWidth={
                              isSelected ? 1.8 : isNeedsUpdate ? 1.3 : 0.8
                            }
                          />

                          {/* Status Marker & Score inside D3 Cell */}
                          <text
                            x={x + bw / 2}
                            y={y + bh / 2 - 1}
                            fontSize="7"
                            fontWeight="700"
                            textAnchor="middle"
                            fill={d3Layout.textFillScale(cell.status)}
                            fontFamily="monospace"
                          >
                            {isNeedsUpdate
                              ? 'UPDATE!'
                              : isCompliant
                              ? 'PATUH'
                              : cell.status === 'partial'
                              ? 'TERKAIT'
                              : '—'}
                          </text>
                          <text
                            x={x + bw / 2}
                            y={y + bh / 2 + 6.5}
                            fontSize="5.8"
                            textAnchor="middle"
                            fill={d3Layout.textFillScale(cell.status)}
                            fontFamily="monospace"
                          >
                            {cell.complianceScore}%
                          </text>

                          {/* Corner indicator dot for Needs Update */}
                          {isNeedsUpdate && (
                            <circle
                              cx={x + bw - 4.5}
                              cy={y + 4.5}
                              r={2.2}
                              fill="#DC2626"
                            />
                          )}
                          <title>
                            {`${clause.number} (${clause.title}) × ${reg.referenceNumber}: ${
                              isNeedsUpdate
                                ? 'PERLU PEMBARUAN'
                                : isCompliant
                                ? 'PATUH / SELARAS'
                                : 'TERKAIT'
                            } (${cell.complianceScore}%) — ${cell.reason}`}
                          </title>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Heatmap Legend (Unboxed clean typography per Zero-Pill rule) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#57534E]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FEE2E2] border border-[#DC2626] inline-block" />
                <strong className="text-rose-800">UPDATE!</strong> (Perlu Pembaruan · Riwayat Cari UU)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#DCFCE7] border border-[#16A34A] inline-block" />
                <strong className="text-emerald-800">PATUH</strong> (Selaras UU)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EFF6FF] border border-[#93C5FD] inline-block" />
                <strong className="text-[#1E3A8A]">TERKAIT</strong> (Parsial)
              </span>
            </div>
          </div>

          {/* Selected Heatmap Cell Inspector & 1-Click Direct Fill / Replace / Mark Target Clause */}
          {selectedCell && (
            <div
              data-testid="heatmap-selected-cell-inspector"
              className={`p-2.5 rounded border space-y-2 text-[11px] ${
                selectedCell.status === 'needs_update'
                  ? 'bg-rose-50/70 border-rose-200'
                  : selectedCell.status === 'compliant'
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-white border-[#E5E0D8]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="font-semibold text-[#18181B]">
                  <span className="font-code">{selectedCell.clauseNumber}</span> ·{' '}
                  {selectedCell.clauseTitle}{' '}
                  <span className="text-[#57534E] font-normal">×</span>{' '}
                  <span className="text-[#1E3A8A]">{selectedCell.regReference}</span>
                </div>
                <span className="font-code text-[10px] font-bold text-[#18181B]">
                  Kepatuhan: {selectedCell.complianceScore}%
                </span>
              </div>

              <div className="text-[10px] text-[#57534E] flex items-center gap-1">
                <History className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                <span>
                  Sumber Riwayat &lsquo;Cari Pasal &amp; UU&rsquo;:{' '}
                  <strong className="text-[#18181B]">&ldquo;{selectedCell.searchQuery}&rdquo;</strong>{' '}
                  ({selectedCell.searchedAt})
                </span>
              </div>

              <p className="text-[10.5px] text-[#27272A] leading-relaxed">
                {selectedCell.reason}
              </p>

              {/* AI Agent Recommended Clause Text Preview & Before/After Comparison for Target Clause */}
              {(() => {
                const targetClauseObj = clauses.find((c) => c.id === selectedCell.clauseId);
                const aiRecord = targetClauseObj?.aiChangeRecord;
                const markerSnap = targetClauseObj?.regulatoryUpdateMarker;
                const hasAppliedBeforeAfter = Boolean(
                  aiRecord || (markerSnap?.beforeSnapshot && markerSnap?.afterSnapshot)
                );
                const beforeContent =
                  aiRecord?.beforeSnapshot.content ||
                  markerSnap?.beforeSnapshot?.content ||
                  targetClauseObj?.content ||
                  [];
                const beforeBasis =
                  aiRecord?.beforeSnapshot.legalBasis ||
                  markerSnap?.beforeSnapshot?.legalBasis ||
                  targetClauseObj?.legalBasis ||
                  '';
                const afterContent =
                  aiRecord?.afterSnapshot.content ||
                  markerSnap?.afterSnapshot?.content ||
                  (targetClauseObj ? targetClauseObj.content : []);
                const afterBasis =
                  aiRecord?.afterSnapshot.legalBasis ||
                  markerSnap?.afterSnapshot?.legalBasis ||
                  targetClauseObj?.legalBasis ||
                  '';

                const changedPartsBadges: string[] = [];
                if (aiRecord) {
                  aiRecord.paragraphChanges.forEach((pc) => {
                    if (pc.changeType === 'added') {
                      changedPartsBadges.push(`+ Ayat (${pc.ayatIndex + 1}) Ditambahkan AI`);
                    } else if (pc.changeType === 'modified') {
                      changedPartsBadges.push(`✏️ Ayat (${pc.ayatIndex + 1}) Diubah Isinya`);
                    }
                  });
                  if (aiRecord.legalBasisChanged) {
                    changedPartsBadges.push('⚖️ Dasar Hukum Diperbarui AI');
                  }
                  if (aiRecord.titleChanged) {
                    changedPartsBadges.push('🏷️ Judul Pasal Diubah AI');
                  }
                } else if (markerSnap?.changedPartLabels?.length) {
                  changedPartsBadges.push(...markerSnap.changedPartLabels);
                }

                return (
                  <div
                    data-testid="heatmap-ai-suggested-clause-preview"
                    className="p-2.5 bg-white/95 border border-[#D6D0C4] rounded space-y-2 text-[10px]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-bold text-[#1E3A8A]">
                        Target Pasal Tujuan: {selectedCell.clauseNumber} ({selectedCell.clauseTitle})
                      </span>
                      <div className="inline-flex items-center gap-1 bg-[#F7F5F0] p-0.5 rounded border border-[#E5E0D8]">
                        <button
                          type="button"
                          data-testid="heatmap-mode-fill-direct-btn"
                          onClick={() => setApplyActionMode('fill_direct')}
                          className={`px-1.5 py-0.5 text-[9.5px] font-semibold rounded cursor-pointer ${
                            applyActionMode === 'fill_direct'
                              ? 'bg-[#1E3A8A] text-white'
                              : 'text-[#57534E] hover:text-[#18181B]'
                          }`}
                          title="Langsung isi ayat rekomendasi AI Agent ke dalam Pasal tujuan"
                        >
                          Langsung Isi (+Ayat Baru)
                        </button>
                        <button
                          type="button"
                          data-testid="heatmap-mode-replace-clause-btn"
                          onClick={() => setApplyActionMode('replace_clause')}
                          className={`px-1.5 py-0.5 text-[9.5px] font-semibold rounded cursor-pointer ${
                            applyActionMode === 'replace_clause'
                              ? 'bg-[#1E3A8A] text-white'
                              : 'text-[#57534E] hover:text-[#18181B]'
                          }`}
                          title="Langsung ganti isi Pasal tujuan dengan bunyi klausul regulasi dari AI Agent"
                        >
                          Ganti Isi Pasal
                        </button>
                      </div>
                    </div>

                    {/* Tanda Bagian Pasal yang Diubah / Ditambahkan AI */}
                    {hasAppliedBeforeAfter && changedPartsBadges.length > 0 && (
                      <div
                        data-testid="heatmap-changed-parts-badges"
                        className="flex flex-wrap items-center gap-1 pt-0.5"
                      >
                        <span className="font-bold text-emerald-900">
                          Bagian {selectedCell.clauseNumber} yang Diubah/Ditambah AI:
                        </span>
                        {changedPartsBadges.map((badge, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-code font-bold text-[9.5px]"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Before vs After Comparison inside Heatmap Inspector */}
                    {hasAppliedBeforeAfter ? (
                      <div
                        data-testid="heatmap-before-after-diff-box"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
                      >
                        {/* BEFORE */}
                        <div className="p-2 rounded bg-rose-50/70 border border-rose-200 space-y-1">
                          <div className="flex items-center justify-between text-[9.5px] font-code font-bold uppercase text-rose-900 border-b border-rose-200 pb-1">
                            <span>SEBELUM DIUBAH AI (BEFORE)</span>
                            <span>{beforeContent.length} Ayat</span>
                          </div>
                          <div className="text-[9.5px] text-rose-900/80 font-code">
                            Dasar UU: {beforeBasis}
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                            {beforeContent.map((bAyat, idx) => (
                              <p
                                key={idx}
                                className="text-[10px] font-legal text-rose-950/85 leading-snug"
                              >
                                {bAyat}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* AFTER */}
                        <div className="p-2 rounded bg-emerald-50/80 border border-emerald-300 space-y-1">
                          <div className="flex items-center justify-between text-[9.5px] font-code font-bold uppercase text-emerald-900 border-b border-emerald-200 pb-1">
                            <span>SESUDAH DIUBAH AI (AFTER)</span>
                            <span>{afterContent.length} Ayat</span>
                          </div>
                          <div className="text-[9.5px] text-emerald-900 font-code font-semibold">
                            Dasar UU: {afterBasis}
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                            {afterContent.map((aAyat, idx) => {
                              const prevAtIdx = beforeContent[idx];
                              const isAdded = idx >= beforeContent.length;
                              const isModified =
                                !isAdded && prevAtIdx && prevAtIdx.trim() !== aAyat.trim();
                              return (
                                <div
                                  key={idx}
                                  className={`text-[10px] font-legal leading-snug rounded p-1 ${
                                    isAdded
                                      ? 'bg-emerald-100/90 border border-emerald-400 text-emerald-950 font-semibold'
                                    : isModified
                                      ? 'bg-blue-100/85 border border-blue-300 text-blue-950 font-semibold'
                                      : 'text-[#27272A]'
                                  }`}
                                >
                                  {(isAdded || isModified) && (
                                    <span className="inline-block mr-1 px-1 py-0.2 rounded text-[8.5px] font-code font-bold uppercase bg-emerald-700 text-white">
                                      {isAdded
                                        ? `+ Ayat (${idx + 1}) Baru Ditambahkan AI`
                                        : `✏️ Ayat (${idx + 1}) Diubah AI`}
                                    </span>
                                  )}
                                  <span>{aAyat}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[9.5px] font-semibold text-[#57534E]">
                          Bunyi Ayat Kepatuhan Saran AI Agent (Akan{' '}
                          {applyActionMode === 'replace_clause'
                            ? `Mengganti Ayat (2) pada ${selectedCell.clauseNumber}`
                            : `Ditambahkan sebagai Ayat (${
                                (targetClauseObj?.content.length || 0) + 1
                              }) pada ${selectedCell.clauseNumber}`}
                          ):
                        </div>
                        <p className="font-legal italic text-[#27272A] leading-snug bg-[#FAF9F6] p-1.5 rounded border border-[#E5E0D8]">
                          &ldquo;{selectedCell.recommendedUpdateAyat}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {onApplyRegulatoryUpdateToClause && (
                  <>
                    <button
                      type="button"
                      data-testid="heatmap-apply-reg-update-btn"
                      onClick={() => {
                        setSelectedCellId(selectedCell.cellId);
                        onApplyRegulatoryUpdateToClause(
                          selectedCell.clauseId,
                          selectedCell.regReference,
                          selectedCell.recommendedUpdateAyat,
                          applyActionMode,
                          selectedCell.regId,
                          selectedCell.regShortLabel
                        );
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>
                        {applyActionMode === 'replace_clause'
                          ? `Ganti Langsung Isi ${selectedCell.clauseNumber} Sesuai ${selectedCell.regShortLabel}`
                          : `Perbarui & Isi Langsung ke ${selectedCell.clauseNumber} Sesuai ${selectedCell.regShortLabel}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="heatmap-replace-target-clause-btn"
                      onClick={() => {
                        setSelectedCellId(selectedCell.cellId);
                        onApplyRegulatoryUpdateToClause(
                          selectedCell.clauseId,
                          selectedCell.regReference,
                          selectedCell.recommendedUpdateAyat,
                          applyActionMode === 'replace_clause' ? 'fill_direct' : 'replace_clause',
                          selectedCell.regId,
                          selectedCell.regShortLabel
                        );
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
                      title="Ganti penuh atau tambahkan langsung ke Pasal tujuan tanpa perlu cek ulang"
                    >
                      <Replace className="w-3 h-3 shrink-0" />
                      <span>
                        {applyActionMode === 'replace_clause'
                          ? `Sisipkan Ayat ke ${selectedCell.clauseNumber}`
                          : `Ganti Penuh ${selectedCell.clauseNumber}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="heatmap-mark-clause-for-review-btn"
                      onClick={() => {
                        setSelectedCellId(selectedCell.cellId);
                        onApplyRegulatoryUpdateToClause(
                          selectedCell.clauseId,
                          selectedCell.regReference,
                          selectedCell.recommendedUpdateAyat,
                          'mark_for_review',
                          selectedCell.regId,
                          selectedCell.regShortLabel
                        );
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 rounded transition-colors cursor-pointer"
                      title="Kasih tanda pada Pasal tujuan di Editor Naskah apabila ingin dicek dulu sebelum diisi/diubah"
                    >
                      <BookmarkCheck className="w-3 h-3 text-amber-800 shrink-0" />
                      <span>Tandai {selectedCell.clauseNumber} (Cek Dulu)</span>
                    </button>
                  </>
                )}

                {selectedCell.status === 'compliant' && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {selectedCell.clauseNumber} telah langsung diisi & selaras dengan regulasi ini
                    </span>
                  </span>
                )}

                {onJumpToClause && (
                  <button
                    type="button"
                    data-testid="heatmap-jump-to-clause-btn"
                    onClick={() => onJumpToClause(selectedCell.clauseId)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-medium text-[#18181B] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
                  >
                    <span>Lompat ke {selectedCell.clauseNumber}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#1E3A8A]" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Sync Input to Test / Add 'Cari Pasal & UU' Search History Directly */}
          {onAddSearchHistoryQuery && (
            <form
              onSubmit={handleQuickAddSearchQuery}
              className="pt-1.5 border-t border-[#E5E0D8] flex items-center gap-1.5"
            >
              <input
                type="text"
                data-testid="heatmap-add-search-history-input"
                value={quickRegInput}
                onChange={(e) => setQuickRegInput(e.target.value)}
                placeholder="Tambah topik/UU ke Riwayat Cari Pasal & UU (mis: Pasal 1244 KUHPerdata Kahar)..."
                className="flex-1 px-2 py-1 text-[10.5px] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
              />
              <button
                type="submit"
                data-testid="heatmap-add-search-history-btn"
                className="px-2 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded cursor-pointer whitespace-nowrap"
              >
                + Petakan UU
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
