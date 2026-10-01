import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Sparkles,
  Wrench,
  Check,
  SearchCode,
} from 'lucide-react';
import {
  LegalDocument,
  ComprehensiveScanFinding,
} from '../types/legal';
import { runComprehensiveRiskScan } from '../utils/legalSmartAnalyzer';

interface ComprehensiveRiskScannerSectionProps {
  document: LegalDocument;
  onJumpToLocation: (loc: string) => void;
  onHarmonizeFinding: (finding: ComprehensiveScanFinding) => void;
  onNotify?: (msg: string) => void;
}

export const ComprehensiveRiskScannerSection: React.FC<
  ComprehensiveRiskScannerSectionProps
> = ({ document, onJumpToLocation, onHarmonizeFinding, onNotify }) => {
  const [aiFindings, setAiFindings] = useState<ComprehensiveScanFinding[] | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'Konflik Klausul Hukum' | 'Inkonsistensi Terminologi'>('all');
  const [harmonizedIds, setHarmonizedIds] = useState<Record<string, boolean>>({});

  const baseFindings = useMemo(() => runComprehensiveRiskScan(document), [document]);

  const allFindings = useMemo(() => {
    if (!aiFindings || aiFindings.length === 0) return baseFindings;
    const seen = new Set(baseFindings.map((f) => f.title.toLowerCase()));
    const combined = [...baseFindings];
    for (const item of aiFindings) {
      if (!seen.has(item.title.toLowerCase())) {
        seen.add(item.title.toLowerCase());
        combined.push(item);
      }
    }
    return combined;
  }, [baseFindings, aiFindings]);

  const filteredFindings = useMemo(() => {
    if (filterType === 'all') return allFindings;
    return allFindings.filter((f) => f.type === filterType);
  }, [allFindings, filterType]);

  const conflictCount = allFindings.filter((f) => f.type === 'Konflik Klausul Hukum').length;
  const termCount = allFindings.filter((f) => f.type === 'Inkonsistensi Terminologi').length;

  const handleRunComprehensiveAiScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/legal/comprehensive-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: document.title,
          clauses: document.clauses,
        }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data) && data.length > 0) {
        const mapped: ComprehensiveScanFinding[] = data.map((item: any, idx: number) => ({
          id: `ai-scan-${Date.now()}-${idx}`,
          type:
            item.type === 'Inkonsistensi Terminologi'
              ? 'Inkonsistensi Terminologi'
              : 'Konflik Klausul Hukum',
          severity: item.severity === 'Kritis' ? 'Kritis' : 'Perhatian',
          title: item.title || 'Temuan Pemindaian Lintas Pasal',
          involvedClauses: Array.isArray(item.involvedClauses)
            ? item.involvedClauses
            : ['Pasal 1'],
          description: item.description || '',
          recommendation: item.recommendation || '',
          harmonizeTarget: {
            targetClauseNumber: Array.isArray(item.involvedClauses)
              ? item.involvedClauses[0]
              : 'Pasal 1',
            appendClarification: item.recommendation,
          },
        }));
        setAiFindings(mapped);
        onNotify?.(
          `Scan Risiko Komprehensif selesai: ditemukan ${conflictCount + mapped.length} poin pemeriksaan lintas pasal.`
        );
      } else {
        onNotify?.(
          `Scan Risiko Komprehensif selesai: ${allFindings.length} temuan inkonsistensi & konflik hukum teridentifikasi.`
        );
      }
    } catch {
      onNotify?.(
        `Scan Risiko Komprehensif selesai: ${allFindings.length} temuan lintas pasal teridentifikasi.`
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="pt-3 border-t border-[#E5E0D8] space-y-3 font-ui">
      {/* Header & Scan Trigger */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <SearchCode className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span className="text-xs font-semibold text-[#18181B]">
              Scan Risiko Komprehensif (Lintas Pasal)
            </span>
          </div>
          <p className="text-[11px] text-[#57534E] mt-0.5">
            {conflictCount} Konflik Klausul Hukum · {termCount} Inkonsistensi Terminologi
          </p>
        </div>

        <button
          type="button"
          disabled={isScanning}
          onClick={handleRunComprehensiveAiScan}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          title="Pindai seluruh pasal untuk mendeteksi inkonsistensi istilah dan pertentangan norma hukum"
        >
          <Sparkles className="w-3 h-3" />
          <span>{isScanning ? 'Memindai...' : 'Scan Komprehensif'}</span>
        </button>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F7F5F0] border border-[#E5E0D8] rounded">
        {[
          { key: 'all', label: `Semua (${allFindings.length})` },
          { key: 'Konflik Klausul Hukum', label: `Konflik Hukum (${conflictCount})` },
          { key: 'Inkonsistensi Terminologi', label: `Terminologi (${termCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key as any)}
            className={`flex-1 py-1 px-2 text-[10.5px] font-medium rounded transition-colors cursor-pointer ${
              filterType === tab.key
                ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                : 'text-[#57534E] hover:text-[#18181B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="space-y-2.5">
        {filteredFindings.map((finding) => {
          const isHarmonized = Boolean(harmonizedIds[finding.id]);
          const isConflict = finding.type === 'Konflik Klausul Hukum';

          return (
            <div
              key={finding.id}
              className={`p-3 rounded-md border space-y-2 transition-colors ${
                isHarmonized
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : isConflict
                  ? 'bg-red-50/35 border-red-200/90'
                  : 'bg-amber-50/35 border-amber-200/90'
              }`}
            >
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] text-[#57534E]">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className={`w-3 h-3 shrink-0 ${
                      isConflict ? 'text-red-700' : 'text-amber-700'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      isConflict ? 'text-red-800' : 'text-amber-800'
                    }`}
                  >
                    {finding.type}
                  </span>
                  <span>·</span>
                  <span>Risiko {finding.severity}</span>
                </div>
              </div>

              {/* Title */}
              <div className="text-xs font-semibold text-[#18181B] leading-snug">
                {finding.title}
              </div>

              {/* Involved Clauses (Clickable Jump Links) */}
              {finding.involvedClauses.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-[#57534E]">
                  <span>Melibatkan:</span>
                  {finding.involvedClauses.map((clauseRef, idx) => (
                    <React.Fragment key={`${finding.id}-${clauseRef}`}>
                      <button
                        type="button"
                        onClick={() => onJumpToLocation(clauseRef)}
                        className="font-code font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                      >
                        {clauseRef}
                      </button>
                      {idx < finding.involvedClauses.length - 1 && <span>·</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Legal Conflict / Terminology Inconsistency Explanation */}
              <p className="text-[11px] text-[#27272A] leading-relaxed">
                {finding.description}
              </p>

              {/* Recommendation & 1-Click Auto-Harmonize */}
              <div className="pt-1.5 border-t border-[#E5E0D8]/80 space-y-2">
                <p className="text-[11px] text-[#57534E] leading-relaxed">
                  <strong className="text-[#18181B]">Rekomendasi:</strong>{' '}
                  {finding.recommendation}
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isHarmonized}
                    onClick={() => {
                      onHarmonizeFinding(finding);
                      setHarmonizedIds((prev) => ({ ...prev, [finding.id]: true }));
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-medium rounded transition-colors cursor-pointer ${
                      isHarmonized
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-[#1E3A8A] border border-[#1E3A8A]/40 hover:bg-[#1E3A8A] hover:text-white'
                    }`}
                  >
                    {isHarmonized ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Telah Diharmonisasi</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-3 h-3" />
                        <span>Harmonisasikan Otomatis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
