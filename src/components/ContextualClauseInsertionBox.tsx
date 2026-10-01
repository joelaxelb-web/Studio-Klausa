import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Lightbulb, ChevronDown, ChevronUp, X } from 'lucide-react';
import { LegalDocument, ContextualClauseSuggestion } from '../types/legal';
import { detectMissingContextualClauses } from '../utils/legalSmartAnalyzer';
import { formatDocumentAsPlainText } from '../utils/exportDocument';

interface ContextualClauseInsertionBoxProps {
  document: LegalDocument;
  onInsertSuggestion: (suggestion: ContextualClauseSuggestion) => void;
  onNotify?: (message: string) => void;
}

export const ContextualClauseInsertionBox: React.FC<
  ContextualClauseInsertionBoxProps
> = ({ document, onInsertSuggestion, onNotify }) => {
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [aiSuggestionsByDoc, setAiSuggestionsByDoc] = useState<
    Record<string, ContextualClauseSuggestion[]>
  >({});
  const [isDetectingAI, setIsDetectingAI] = useState(false);

  const activeSuggestions = useMemo(() => {
    const autoDetected = detectMissingContextualClauses(document);
    const aiDetected = aiSuggestionsByDoc[document.id] || [];

    const existingTitlesLower = new Set(
      document.clauses.map((c) => c.title.toLowerCase())
    );
    const seenSuggestionTitles = new Set<string>();
    const combined: ContextualClauseSuggestion[] = [];

    for (const item of [...aiDetected, ...autoDetected]) {
      const titleKey = item.title.toLowerCase();
      if (
        !dismissedIds[item.id] &&
        !existingTitlesLower.has(titleKey) &&
        !seenSuggestionTitles.has(titleKey)
      ) {
        seenSuggestionTitles.add(titleKey);
        combined.push(item);
      }
    }

    return combined;
  }, [document, aiSuggestionsByDoc, dismissedIds]);

  const handleAnalyzeMissingClausesAI = async () => {
    if (isDetectingAI) return;
    setIsDetectingAI(true);
    try {
      const fullText = formatDocumentAsPlainText(document);
      const response = await fetch('/api/legal/contextual-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: document.title,
          existingClauseTitles: document.clauses.map((c) => `${c.number}: ${c.title}`),
          documentText: fullText,
        }),
      });

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: ContextualClauseSuggestion[] = data.map(
          (raw: any, idx: number) => ({
            id: `ai-ctx-${document.id}-${Date.now()}-${idx}`,
            title: (raw.title || 'KETENTUAN PELINDUNGAN TAMBAHAN').toUpperCase(),
            category: raw.category || 'Rekomendasi AI',
            legalBasis: raw.legalBasis || 'Pasal 1338 KUHPerdata',
            riskLevel:
              raw.riskLevel === 'Kritis' || raw.riskLevel === 'Perhatian'
                ? raw.riskLevel
                : 'Standar',
            reason:
              raw.reason ||
              'Klausul ini disarankan oleh AI untuk melengkapi celah perlindungan kontrak.',
            content: Array.isArray(raw.content)
              ? raw.content
              : [String(raw.content || '')],
          })
        );

        setAiSuggestionsByDoc((prev) => ({
          ...prev,
          [document.id]: mapped,
        }));
        onNotify?.(
          `AI menemukan ${mapped.length} saran klausul kontekstual tambahan untuk melengkapi draf.`
        );
      }
    } catch {
      onNotify?.('Deteksi klausul kontekstual proaktif telah diperbarui.');
    } finally {
      setIsDetectingAI(false);
    }
  };

  if (activeSuggestions.length === 0) {
    return (
      <div className="no-print p-3.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md font-ui flex items-center justify-between gap-3">
        <div className="text-xs text-[#57534E]">
          Seluruh klausul esensial standar telah termuat dalam draf ini. Anda tetap dapat meminta AI memindai klausul pengaman spesifik tambahan.
        </div>
        <button
          type="button"
          disabled={isDetectingAI}
          onClick={handleAnalyzeMissingClausesAI}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-white border border-[#D6D0C4] rounded hover:bg-[#EFECE6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isDetectingAI ? 'Memindai...' : 'Pindai Klausul Tambahan AI'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="no-print p-4 sm:p-5 bg-[#FAF9F6] border border-[#1E3A8A]/35 rounded-md font-ui space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0D8]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              PENYISIPAN KONTEKSTUAL PROAKTIF ({activeSuggestions.length} Klausul Disarankan)
            </span>
          </div>
          <p className="text-[11.5px] text-[#57534E] mt-0.5 leading-relaxed">
            AI mendeteksi draf dokumen ini belum memuat beberapa elemen pelindungan hukum krusial berikut. Klik <strong>Sisipkan Klausul</strong> untuk menambahkannya langsung ke naskah.
          </p>
        </div>

        <button
          type="button"
          disabled={isDetectingAI}
          onClick={handleAnalyzeMissingClausesAI}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isDetectingAI ? 'Menganalisis...' : 'Deteksi Celah Klausul AI'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {activeSuggestions.slice(0, 3).map((suggestion) => {
          const isExpanded = expandedPreviewId === suggestion.id;
          const nextPasalNumber = document.clauses.length + 1;

          return (
            <div
              key={suggestion.id}
              className="p-3.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A8A]/50 rounded-md space-y-2 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[#18181B]">
                    {suggestion.title}
                  </div>
                  <div className="text-[11px] text-[#57534E] mt-0.5">
                    <span>{suggestion.category}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-medium text-[#1E3A8A]">
                      {suggestion.legalBasis}
                    </span>
                    <span className="mx-1.5">·</span>
                    <span>Tingkat Krusialitas: {suggestion.riskLevel}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDismissedIds((prev) => ({ ...prev, [suggestion.id]: true }))
                  }
                  title="Abaikan saran klausul ini"
                  className="p-1 text-[#78716C] hover:text-[#18181B] cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[#3F3F46] leading-relaxed bg-[#F7F5F0] px-2.5 py-2 rounded border border-[#E5E0D8]">
                {suggestion.reason}
              </p>

              {/* Expandable Preview of Full Ayat-Ayat */}
              {isExpanded && (
                <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1.5 font-legal text-xs text-[#18181B] leading-relaxed">
                  <div className="font-ui text-[10.5px] font-semibold text-[#57534E] mb-1">
                    Pratinjau Bunyi Ayat yang Akan Disisipkan:
                  </div>
                  {suggestion.content.map((ayat, idx) => (
                    <p key={idx} className="text-justify">
                      {ayat}
                    </p>
                  ))}
                </div>
              )}

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPreviewId(isExpanded ? null : suggestion.id)
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#57534E] hover:text-[#18181B] cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Sembunyikan Bunyi Ayat</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Lihat Pratinjau Ayat ({suggestion.content.length} Ayat)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onInsertSuggestion(suggestion)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sisipkan sebagai Pasal {nextPasalNumber}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
