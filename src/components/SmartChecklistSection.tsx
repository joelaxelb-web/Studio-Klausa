import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  ArrowUpRight,
  Search,
  ListChecks,
  CheckCheck,
  RotateCcw,
  ShieldCheck,
  Stamp,
  Umbrella,
  Landmark,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react';
import {
  LegalDocument,
  SmartChecklistItem,
  RiskMitigationInsight,
} from '../types/legal';
import {
  generateSmartChecklistForDocument,
  generateRiskMitigationInsightsForDocument,
} from '../utils/legalSmartAnalyzer';
import { formatDocumentAsPlainText } from '../utils/exportDocument';

interface SmartChecklistSectionProps {
  document: LegalDocument;
  risks?: SmartChecklistItem[];
  onJumpToLocation: (location: string) => void;
  onNotify?: (message: string) => void;
}

export const SmartChecklistSection: React.FC<SmartChecklistSectionProps> = ({
  document,
  risks: externalRisks,
  onJumpToLocation,
  onNotify,
}) => {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [actionDoneMap, setActionDoneMap] = useState<Record<string, boolean>>({});
  const [copiedInsightId, setCopiedInsightId] = useState<string | null>(null);
  const [aiChecklistByDoc, setAiChecklistByDoc] = useState<
    Record<string, SmartChecklistItem[]>
  >({});
  const [autoAnalyzedDocIds, setAutoAnalyzedDocIds] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<
    'Semua' | 'Tinggi' | 'Sedang' | 'Standar'
  >('Semua');
  const [insightActionFilter, setInsightActionFilter] = useState<
    'Semua' | 'Notaris' | 'Asuransi' | 'Finansial & Pajak' | 'Kepatuhan'
  >('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompactMode, setIsCompactMode] = useState(true);

  const clauseInsights = useMemo(
    () => generateRiskMitigationInsightsForDocument(document),
    [document]
  );

  const runAiRiskAnalysis = useCallback(
    async (silent = false) => {
      if (isAnalyzing) return;
      setIsAnalyzing(true);
      try {
        const fullText = formatDocumentAsPlainText(document);
        const response = await fetch('/api/legal/smart-checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentTitle: document.title,
            documentText: fullText,
          }),
        });

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: SmartChecklistItem[] = data.map((raw: any, idx: number) => ({
            id: `ai-chk-${document.id}-${idx}-${String(raw.targetLocation || 'p').replace(/\s+/g, '')}`,
            task: raw.task || 'Verifikasi klausul kontrak',
            category: raw.category || 'Mitigasi Klausul',
            priority:
              raw.priority === 'Tinggi' || raw.priority === 'Sedang' || raw.priority === 'Standar'
                ? raw.priority
                : 'Tinggi',
            targetLocation: raw.targetLocation || 'Pasal 1',
            reason: raw.reason || 'Berdasarkan telaah risiko kontrak oleh AI.',
            mitigationAction:
              raw.mitigationAction ||
              (raw.priority === 'Tinggi'
                ? 'Hubungi Notaris / Asuransikan Risiko'
                : 'Siapkan Dokumen Pendukung (BAST / SLA)'),
            mitigationDetail:
              raw.mitigationDetail ||
              'Tindak lanjuti bersama Notaris, Konsultan Hukum, atau penyedia asuransi tanggung gugat sesuai klasifikasi risiko pasal.',
          }));
          setAiChecklistByDoc((prev) => ({
            ...prev,
            [document.id]: mapped,
          }));
          if (!silent) {
            onNotify?.(
              `Smart Checklist & Risk Mitigation Insights diperbarui dengan ${mapped.length} rekomendasi aksi konkret dari AI.`
            );
          }
        } else {
          // Deep per-clause dynamic fallback if upstream AI is busy
          const clauseDeepItems: SmartChecklistItem[] = clauseInsights.map((ins, idx) => ({
            id: `ai-clause-deep-${document.id}-${ins.clauseId}-${idx}`,
            task: `Audit kepatuhan ${ins.clauseNumber} (${ins.clauseTitle}): Laksanakan aksi "${ins.actionLabel}"`,
            category: ins.clauseCategory,
            priority:
              ins.riskLevel === 'Kritis'
                ? 'Tinggi'
                : ins.riskLevel === 'Perhatian'
                ? 'Sedang'
                : 'Standar',
            targetLocation: ins.clauseNumber,
            reason: ins.rationale,
            mitigationAction: ins.actionLabel,
            mitigationDetail: ins.recommendation,
          }));
          setAiChecklistByDoc((prev) => ({
            ...prev,
            [document.id]: clauseDeepItems,
          }));
          if (!silent) {
            onNotify?.(
              `Smart Checklist & Risk Mitigation Insights memuat rekomendasi aksi konkret untuk seluruh ${document.clauses.length} pasal.`
            );
          }
        }
      } catch {
        if (!silent) {
          onNotify?.(
            'Smart Checklist & Risk Mitigation Insights menampilkan seluruh risiko dari draf aktif.'
          );
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [document, isAnalyzing, onNotify, clauseInsights]
  );

  // Automatically trigger dynamic AI risk detection once per document so all AI + draft risks are populated
  useEffect(() => {
    if (!document?.id) return;
    if (autoAnalyzedDocIds[document.id]) return;
    setAutoAnalyzedDocIds((prev) => ({ ...prev, [document.id]: true }));
    runAiRiskAnalysis(true);
  }, [document?.id, autoAnalyzedDocIds, runAiRiskAnalysis]);

  // Combine unlimited external risks, AI-detected risks, and draft-detected risks without any cap
  const checklistItems = useMemo(() => {
    const autoItems = generateSmartChecklistForDocument(document);
    const aiItems = aiChecklistByDoc[document.id] || [];
    const customItems = Array.isArray(externalRisks) ? externalRisks : [];

    const seenTasks = new Set<string>();
    const combined: SmartChecklistItem[] = [];

    const pushUnique = (item: SmartChecklistItem) => {
      const normalizedKey = `${(item.targetLocation || '').toLowerCase().trim()}::${(
        item.task || ''
      )
        .toLowerCase()
        .trim()
        .slice(0, 48)}`;
      if (!seenTasks.has(normalizedKey)) {
        seenTasks.add(normalizedKey);
        combined.push(item);
      }
    };

    for (const item of customItems) {
      pushUnique(item);
    }
    for (const item of aiItems) {
      pushUnique(item);
    }
    for (const item of autoItems) {
      pushUnique(item);
    }

    return combined;
  }, [document, aiChecklistByDoc, externalRisks]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return checklistItems.filter((item) => {
      const matchesPriority =
        priorityFilter === 'Semua' || item.priority === priorityFilter;
      if (!matchesPriority) return false;
      if (!q) return true;
      return (
        item.task.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.targetLocation.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.mitigationAction || '').toLowerCase().includes(q) ||
        (item.mitigationDetail || '').toLowerCase().includes(q)
      );
    });
  }, [checklistItems, priorityFilter, searchQuery]);

  const filteredInsights = useMemo(() => {
    return clauseInsights.filter((ins) => {
      if (insightActionFilter === 'Semua') return true;
      if (insightActionFilter === 'Notaris') return ins.actionType === 'Hubungi Notaris';
      if (insightActionFilter === 'Asuransi') return ins.actionType === 'Asuransikan';
      if (insightActionFilter === 'Finansial & Pajak') {
        return (
          ins.actionType === 'Konsultasi Pajak' || ins.actionType === 'Jaminan & Escrow'
        );
      }
      return (
        ins.actionType === 'Registrasi & Kepatuhan' ||
        ins.actionType === 'Dokumen Operasional'
      );
    });
  }, [clauseInsights, insightActionFilter]);

  const notaryActionCount = useMemo(
    () => clauseInsights.filter((i) => i.actionType === 'Hubungi Notaris').length,
    [clauseInsights]
  );

  const insuranceActionCount = useMemo(
    () => clauseInsights.filter((i) => i.actionType === 'Asuransikan').length,
    [clauseInsights]
  );

  const financeTaxActionCount = useMemo(
    () =>
      clauseInsights.filter(
        (i) => i.actionType === 'Konsultasi Pajak' || i.actionType === 'Jaminan & Escrow'
      ).length,
    [clauseInsights]
  );

  const completedCount = useMemo(
    () => checklistItems.filter((item) => Boolean(checkedMap[item.id])).length,
    [checklistItems, checkedMap]
  );

  const highRiskCount = useMemo(
    () => checklistItems.filter((item) => item.priority === 'Tinggi').length,
    [checklistItems]
  );

  const mediumRiskCount = useMemo(
    () => checklistItems.filter((item) => item.priority === 'Sedang').length,
    [checklistItems]
  );

  const standardRiskCount = useMemo(
    () => checklistItems.filter((item) => item.priority === 'Standar').length,
    [checklistItems]
  );

  const progressPct =
    checklistItems.length > 0
      ? Math.round((completedCount / checklistItems.length) * 100)
      : 0;

  const toggleItem = (id: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleInsightActionDone = (id: string, label: string, clauseNumber: string) => {
    const nextState = !actionDoneMap[id];
    setActionDoneMap((prev) => ({
      ...prev,
      [id]: nextState,
    }));
    if (nextState) {
      onNotify?.(`Aksi mitigasi "${label}" untuk ${clauseNumber} ditandai telah dijadwalkan/selesai.`);
    }
  };

  const handleCopyInsightBrief = async (ins: RiskMitigationInsight) => {
    const brief = `[Instruksi Mitigasi Risiko - ${document.title}]\nPasal: ${ins.clauseNumber} (${ins.clauseTitle})\nKlasifikasi Risiko: ${ins.riskLevel} · Kategori: ${ins.clauseCategory}\nAksi Konkret: ${ins.actionLabel}\nRekomendasi Tindak Lanjut: ${ins.recommendation}`;
    try {
      await navigator.clipboard.writeText(brief);
      setCopiedInsightId(ins.id);
      onNotify?.(`Instruksi aksi konkret "${ins.actionLabel}" (${ins.clauseNumber}) disalin.`);
      setTimeout(() => setCopiedInsightId((prev) => (prev === ins.id ? null : prev)), 2000);
    } catch {
      onNotify?.(`Aksi Konkret ${ins.clauseNumber}: ${ins.recommendation}`);
    }
  };

  const handleCheckAllFiltered = () => {
    const allFilteredChecked =
      filteredItems.length > 0 &&
      filteredItems.every((item) => Boolean(checkedMap[item.id]));
    setCheckedMap((prev) => {
      const next = { ...prev };
      filteredItems.forEach((item) => {
        next[item.id] = !allFilteredChecked;
      });
      return next;
    });
  };

  const getInsightIcon = (actionType: RiskMitigationInsight['actionType']) => {
    switch (actionType) {
      case 'Hubungi Notaris':
        return <Stamp className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />;
      case 'Asuransikan':
        return <Umbrella className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
      case 'Konsultasi Pajak':
      case 'Jaminan & Escrow':
        return <Landmark className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
      default:
        return <FileCheck2 className="w-3.5 h-3.5 text-[#57534E] shrink-0" />;
    }
  };

  return (
    <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span className="truncate">Smart Checklist Mitigasi Risiko</span>
          </div>
          <div className="text-[10.5px] text-[#57534E] mt-0.5 leading-snug">
            Menampilkan seluruh{' '}
            <span className="font-code font-semibold text-[#18181B]">
              {checklistItems.length}
            </span>{' '}
            risiko terdeteksi secara dinamis dari draf kontrak & AI
          </div>
        </div>
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={() => runAiRiskAnalysis(false)}
          className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Analisis ulang seluruh risiko & rekomendasi aksi konkret dengan AI"
        >
          <Sparkles className="w-3 h-3" />
          <span>{isAnalyzing ? 'Menganalisis...' : 'Analisis AI'}</span>
        </button>
      </div>

      {/* NEW: RISK MITIGATION INSIGHTS PANEL (REKOMENDASI AKSI KONKRET PER KLASIFIKASI RISIKO PASAL) */}
      <div className="p-2.5 bg-white border border-[#D6D0C4] rounded space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11.5px] font-semibold text-[#18181B] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span>Risk Mitigation Insights (Aksi Konkret per Pasal)</span>
            </div>
            <p className="text-[10px] text-[#57534E] mt-0.5 leading-snug">
              Rekomendasi tindakan praktis (Notaris, Asuransi, Bank Garansi, Pajak) berdasarkan klasifikasi risiko tiap pasal:
            </p>
          </div>
        </div>

        {/* Summary Action Counters & Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {(
            [
              { key: 'Semua', label: `Semua Pasal (${clauseInsights.length})` },
              { key: 'Notaris', label: `Hubungi Notaris (${notaryActionCount})` },
              { key: 'Asuransi', label: `Asuransikan (${insuranceActionCount})` },
              { key: 'Finansial & Pajak', label: `Jaminan & Pajak (${financeTaxActionCount})` },
              { key: 'Kepatuhan', label: 'Kepatuhan & BAST' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setInsightActionFilter(tab.key)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                insightActionFilter === tab.key
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-[#FAF9F6] text-[#57534E] border-[#E5E0D8] hover:text-[#18181B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Per-Clause Risk Mitigation Insights List */}
        <div className="max-h-[210px] overflow-y-auto pr-1 space-y-1.5 scroll-smooth">
          {filteredInsights.length === 0 ? (
            <div className="p-2 text-center text-[10.5px] text-[#57534E] bg-[#FAF9F6] rounded border border-[#E5E0D8]">
              Tidak ada pasal pada kategori aksi ini. Klik &ldquo;Semua Pasal&rdquo; untuk melihat seluruh rekomendasi.
            </div>
          ) : (
            filteredInsights.map((ins) => {
              const isDone = Boolean(actionDoneMap[ins.id]);
              const riskColor =
                ins.riskLevel === 'Kritis'
                  ? 'text-red-700'
                  : ins.riskLevel === 'Perhatian'
                  ? 'text-amber-700'
                  : 'text-emerald-700';

              return (
                <div
                  key={ins.id}
                  className={`p-2 rounded border transition-colors space-y-1 ${
                    isDone
                      ? 'bg-[#F7F5F0]/80 border-emerald-300/80 opacity-80'
                      : 'bg-[#FAF9F6] border-[#E5E0D8] hover:border-[#1E3A8A]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <div className="mt-0.5">{getInsightIcon(ins.actionType)}</div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[#1E3A8A] leading-snug">
                          {ins.actionLabel}
                        </div>
                        <div className="text-[10px] text-[#57534E]">
                          <strong className="text-[#18181B]">{ins.clauseNumber}</strong> ({ins.clauseTitle})
                          <span className="mx-1">·</span>
                          <span>{ins.clauseCategory}</span>
                          <span className="mx-1">·</span>
                          <span className={`font-semibold ${riskColor}`}>
                            Risiko {ins.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onJumpToLocation(ins.clauseNumber)}
                      className="inline-flex items-center gap-0.5 text-[10px] font-code font-semibold text-[#1E3A8A] hover:underline shrink-0 cursor-pointer"
                    >
                      <span>{ins.clauseNumber}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <p className="text-[10.5px] text-[#27272A] leading-snug pl-5">
                    {ins.recommendation}
                  </p>

                  <div className="pl-5 pt-0.5 flex items-center justify-between gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        toggleInsightActionDone(ins.id, ins.actionLabel, ins.clauseNumber)
                      }
                      className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                        isDone ? 'text-emerald-700' : 'text-[#57534E] hover:text-[#18181B]'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Square className="w-3 h-3 text-[#78716C]" />
                      )}
                      <span>{isDone ? 'Aksi Dijadwalkan' : 'Tandai Ditindaklanjuti'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyInsightBrief(ins)}
                      className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1E3A8A] cursor-pointer"
                      title="Salin instruksi aksi konkret untuk dikirim ke Notaris / Broker Asuransi / Tim Pajak"
                    >
                      {copiedInsightId === ins.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-700" />
                          <span className="text-emerald-700 font-semibold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Salin Instruksi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Completion Progress Bar & Bulk Action */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10.5px] font-code text-[#57534E]">
          <span>
            Terverifikasi: {completedCount} / {checklistItems.length} Risiko ({progressPct}%)
          </span>
          <div className="flex items-center gap-2 font-ui">
            <button
              type="button"
              onClick={handleCheckAllFiltered}
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#1E3A8A] hover:underline cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              <span>
                {filteredItems.length > 0 &&
                filteredItems.every((i) => Boolean(checkedMap[i.id]))
                  ? 'Batal Centang'
                  : 'Centang Semua'}
              </span>
            </button>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => setCheckedMap({})}
                className="inline-flex items-center gap-0.5 text-[10px] text-[#78716C] hover:text-[#18181B] cursor-pointer"
                title="Reset status centang"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#E5E0D8] rounded-xs overflow-hidden">
          <div
            className="h-full bg-[#15803D] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Compact Filter & Search Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3 h-3 text-[#78716C] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari dari ${checklistItems.length} risiko, pasal, atau aksi (mis. Notaris, Asuransi)...`}
              className="w-full pl-6 pr-2 py-1 text-[11px] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsCompactMode((prev) => !prev)}
            className="px-2 py-1 text-[10px] font-semibold text-[#57534E] hover:text-[#18181B] bg-white border border-[#D6D0C4] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Ubah kerapatan tampilan daftar risiko"
          >
            {isCompactMode ? 'Detail' : 'Ringkas'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { key: 'Semua', label: `Semua (${checklistItems.length})` },
              { key: 'Tinggi', label: `Tinggi (${highRiskCount})` },
              { key: 'Sedang', label: `Sedang (${mediumRiskCount})` },
              { key: 'Standar', label: `Standar (${standardRiskCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPriorityFilter(tab.key)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                priorityFilter === tab.key
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Scrollable Unlimited Risk List */}
      <div className="max-h-[290px] overflow-y-auto pr-1 space-y-1.5 scroll-smooth">
        {filteredItems.length === 0 ? (
          <div className="p-3 bg-white border border-[#E5E0D8] rounded text-center text-[11px] text-[#57534E]">
            Tidak ada item risiko yang cocok dengan filter saat ini.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isChecked = Boolean(checkedMap[item.id]);
            const priorityColor =
              item.priority === 'Tinggi'
                ? 'text-red-700'
                : item.priority === 'Sedang'
                ? 'text-amber-700'
                : 'text-emerald-700';

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-2 rounded border transition-colors cursor-pointer ${
                  isChecked
                    ? 'bg-[#F7F5F0]/80 border-[#E5E0D8] opacity-70'
                    : 'bg-white border-[#D6D0C4] hover:border-[#1E3A8A]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(item.id);
                    }}
                    className="mt-0.5 text-[#1E3A8A] shrink-0 cursor-pointer"
                    aria-label={item.task}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-[#78716C]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <div
                        className={`text-[11.5px] font-medium leading-snug ${
                          isChecked ? 'line-through text-[#78716C]' : 'text-[#18181B]'
                        }`}
                      >
                        <span className="font-code text-[10px] text-[#57534E] mr-1">
                          #{idx + 1}
                        </span>
                        {item.task}
                      </div>
                    </div>

                    <p
                      className={`text-[10.5px] text-[#57534E] leading-snug mt-0.5 ${
                        isCompactMode ? 'line-clamp-1' : ''
                      }`}
                    >
                      {item.reason}
                    </p>

                    {/* Concrete Risk Mitigation Insight Action per Checklist Item */}
                    {item.mitigationAction && (
                      <div className="mt-1 pt-1 border-t border-[#F0ECE3] text-[10px] text-[#18181B]">
                        <span className="font-semibold text-[#1E3A8A]">
                          Aksi Konkret: {item.mitigationAction}
                        </span>
                        {!isCompactMode && item.mitigationDetail && (
                          <p className="text-[10px] text-[#57534E] mt-0.5 leading-snug">
                            {item.mitigationDetail}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between gap-2 text-[10px] text-[#57534E]">
                      <div className="truncate">
                        <span>{item.category}</span>
                        <span className="mx-1">·</span>
                        <span className={`font-semibold ${priorityColor}`}>
                          {item.priority}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJumpToLocation(item.targetLocation);
                        }}
                        className="inline-flex items-center gap-0.5 font-code font-semibold text-[#1E3A8A] hover:underline cursor-pointer shrink-0"
                      >
                        <span>Cek {item.targetLocation}</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scrollable Footer Summary */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8] text-[10px] text-[#57534E]">
        <span>
          Menampilkan {filteredItems.length} dari {checklistItems.length} total risiko draf
        </span>
        <span className="font-code">Gulir untuk melihat semua</span>
      </div>
    </div>
  );
};
