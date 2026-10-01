import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ArrowLeft,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import { LegalDocumentVersion, LegalClause } from '../types/legal';

interface VersionComparisonViewProps {
  leftVersion: LegalDocumentVersion;
  rightVersion: LegalDocumentVersion;
  allVersions: LegalDocumentVersion[];
  onChangeLeftVersion: (versionId: string) => void;
  onChangeRightVersion: (versionId: string) => void;
  onRevertToVersion: (version: LegalDocumentVersion) => void;
  onClose: () => void;
}

type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged';

interface ClauseDiffRow {
  key: string;
  status: DiffStatus;
  leftClause?: LegalClause;
  rightClause?: LegalClause;
}

export const VersionComparisonView: React.FC<VersionComparisonViewProps> = ({
  leftVersion,
  rightVersion,
  allVersions,
  onChangeLeftVersion,
  onChangeRightVersion,
  onRevertToVersion,
  onClose,
}) => {
  const [showOnlyChanges, setShowOnlyChanges] = useState<boolean>(false);

  // Compute clause-by-clause diff between leftVersion and rightVersion
  const diffRows = useMemo<ClauseDiffRow[]>(() => {
    const leftClauses = leftVersion.snapshot.clauses || [];
    const rightClauses = rightVersion.snapshot.clauses || [];

    const rows: ClauseDiffRow[] = [];
    const matchedRightIndices = new Set<number>();

    // Match clauses by ID first, or fallback to title/index
    leftClauses.forEach((lClause, lIdx) => {
      let rIdx = rightClauses.findIndex(
        (rc, idx) => !matchedRightIndices.has(idx) && rc.id === lClause.id
      );

      if (rIdx === -1) {
        rIdx = rightClauses.findIndex(
          (rc, idx) =>
            !matchedRightIndices.has(idx) &&
            rc.title.trim().toLowerCase() === lClause.title.trim().toLowerCase()
        );
      }

      if (rIdx === -1) {
        // Clause was removed in rightVersion
        rows.push({
          key: `removed-${lClause.id}-${lIdx}`,
          status: 'removed',
          leftClause: lClause,
          rightClause: undefined,
        });
      } else {
        matchedRightIndices.add(rIdx);
        const rClause = rightClauses[rIdx];
        const isTitleSame = lClause.title.trim() === rClause.title.trim();
        const isRiskSame = lClause.riskLevel === rClause.riskLevel;
        const isBasisSame = lClause.legalBasis.trim() === rClause.legalBasis.trim();
        const isContentSame =
          lClause.content.length === rClause.content.length &&
          lClause.content.every((p, i) => p.trim() === (rClause.content[i] || '').trim());

        const status: DiffStatus =
          isTitleSame && isRiskSame && isBasisSame && isContentSame
            ? 'unchanged'
            : 'modified';

        rows.push({
          key: `pair-${lClause.id}-${rClause.id}-${lIdx}`,
          status,
          leftClause: lClause,
          rightClause: rClause,
        });
      }
    });

    // Any remaining clauses in rightClauses were added
    rightClauses.forEach((rClause, rIdx) => {
      if (!matchedRightIndices.has(rIdx)) {
        rows.push({
          key: `added-${rClause.id}-${rIdx}`,
          status: 'added',
          leftClause: undefined,
          rightClause: rClause,
        });
      }
    });

    return rows;
  }, [leftVersion, rightVersion]);

  const stats = useMemo(() => {
    return {
      added: diffRows.filter((r) => r.status === 'added').length,
      removed: diffRows.filter((r) => r.status === 'removed').length,
      modified: diffRows.filter((r) => r.status === 'modified').length,
      unchanged: diffRows.filter((r) => r.status === 'unchanged').length,
    };
  }, [diffRows]);

  const visibleRows = useMemo(
    () => (showOnlyChanges ? diffRows.filter((r) => r.status !== 'unchanged') : diffRows),
    [diffRows, showOnlyChanges]
  );

  const isMetadataModified =
    leftVersion.snapshot.title !== rightVersion.snapshot.title ||
    leftVersion.snapshot.partyOne.name !== rightVersion.snapshot.partyOne.name ||
    leftVersion.snapshot.partyTwo.name !== rightVersion.snapshot.partyTwo.name ||
    leftVersion.snapshot.jurisdiction !== rightVersion.snapshot.jurisdiction;

  return (
    <div className="bg-white border border-[#D6D0C4] rounded-lg p-5 sm:p-6 space-y-5">
      {/* Header & Version Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
            <GitCompare className="w-4 h-4" />
            <span>PERBANDINGAN DUA VERSI DOKUMEN (SIDE-BY-SIDE DIFF)</span>
          </div>
          <h2 className="text-lg font-legal font-semibold text-[#18181B] mt-0.5">
            {rightVersion.snapshot.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Editor Naskah</span>
        </button>
      </div>

      {/* Side-by-Side Version Picker Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#18181B]">
              Kolom Kiri (Versi Dasar / Lama):
            </label>
            <button
              type="button"
              onClick={() => onRevertToVersion(leftVersion)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A8A] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revert ke {leftVersion.versionLabel}</span>
            </button>
          </div>
          <select
            value={leftVersion.id}
            onChange={(e) => onChangeLeftVersion(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
          >
            {allVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.versionLabel} — {v.summary} ({v.timestamp})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#18181B]">
              Kolom Kanan (Versi Pembanding / Baru):
            </label>
            <button
              type="button"
              onClick={() => onRevertToVersion(rightVersion)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A8A] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revert ke {rightVersion.versionLabel}</span>
            </button>
          </div>
          <select
            value={rightVersion.id}
            onChange={(e) => onChangeRightVersion(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
          >
            {allVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.versionLabel} — {v.summary} ({v.timestamp})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff Summary Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-md text-xs">
        <div className="flex flex-wrap items-center gap-4 font-code tabular-nums">
          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ditambahkan: {stats.added}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-800 font-medium">
            <MinusCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Dihapus: {stats.removed}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-800 font-medium">
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Dimodifikasi: {stats.modified}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#57534E]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Tidak Berubah: {stats.unchanged}</span>
          </span>
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-medium text-[#18181B] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showOnlyChanges}
            onChange={(e) => setShowOnlyChanges(e.target.checked)}
            className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A]"
          />
          <span>Hanya tampilkan pasal yang berubah</span>
        </label>
      </div>

      {/* Header / Komparisi Diff Summary */}
      {isMetadataModified && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-md space-y-2">
          <div className="text-xs font-semibold text-amber-900">
            PERUBAHAN IDENTITAS & METADATA KONTRAK
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-2.5 bg-white/90 border border-amber-200 rounded space-y-1">
              <div className="font-code text-[11px] text-[#57534E]">{leftVersion.versionLabel}</div>
              <div><strong>Judul:</strong> {leftVersion.snapshot.title}</div>
              <div><strong>Pihak I:</strong> {leftVersion.snapshot.partyOne.name}</div>
              <div><strong>Pihak II:</strong> {leftVersion.snapshot.partyTwo.name}</div>
              <div><strong>Yurisdiksi:</strong> {leftVersion.snapshot.jurisdiction}</div>
            </div>
            <div className="p-2.5 bg-white/90 border border-amber-200 rounded space-y-1">
              <div className="font-code text-[11px] text-[#57534E]">{rightVersion.versionLabel}</div>
              <div><strong>Judul:</strong> {rightVersion.snapshot.title}</div>
              <div><strong>Pihak I:</strong> {rightVersion.snapshot.partyOne.name}</div>
              <div><strong>Pihak II:</strong> {rightVersion.snapshot.partyTwo.name}</div>
              <div><strong>Yurisdiksi:</strong> {rightVersion.snapshot.jurisdiction}</div>
            </div>
          </div>
        </div>
      )}

      {/* Clause-by-Clause Side-by-Side Comparison Grid */}
      <div className="space-y-4">
        {visibleRows.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-xs text-[#57534E]">
            Tidak ada perbedaan pasal antara {leftVersion.versionLabel} dan {rightVersion.versionLabel}.
          </div>
        ) : (
          visibleRows.map((row) => {
            const containerStyle =
              row.status === 'added'
                ? 'border-emerald-300 bg-emerald-50/35'
                : row.status === 'removed'
                ? 'border-red-300 bg-red-50/35'
                : row.status === 'modified'
                ? 'border-amber-300 bg-amber-50/35'
                : 'border-[#E5E0D8] bg-white';

            const statusLabel =
              row.status === 'added'
                ? '+ PASAL DITAMBAHKAN'
                : row.status === 'removed'
                ? '- PASAL DIHAPUS'
                : row.status === 'modified'
                ? '~ PASAL DIMODIFIKASI'
                : 'TIDAK BERUBAH';

            const statusTextClass =
              row.status === 'added'
                ? 'text-emerald-800'
                : row.status === 'removed'
                ? 'text-red-800'
                : row.status === 'modified'
                ? 'text-amber-800'
                : 'text-[#57534E]';

            return (
              <div
                key={row.key}
                className={`border rounded-md p-4 space-y-3 ${containerStyle}`}
              >
                {/* Row Status Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/10 text-xs">
                  <span className={`font-code font-bold tracking-wide ${statusTextClass}`}>
                    {statusLabel}
                  </span>
                  <span className="text-[11px] text-[#57534E]">
                    {row.rightClause?.number || row.leftClause?.number} ·{' '}
                    {row.rightClause?.title || row.leftClause?.title}
                  </span>
                </div>

                {/* 2-Column Side-by-Side Diff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LEFT COLUMN (OLD VERSION) */}
                  <div
                    className={`p-3 rounded border text-xs space-y-2 ${
                      row.status === 'removed'
                        ? 'bg-red-50/90 border-red-300 text-red-950'
                        : row.status === 'modified'
                        ? 'bg-amber-50/60 border-amber-200 text-[#18181B]'
                        : row.status === 'added'
                        ? 'bg-[#FAF9F6] border-dashed border-[#D6D0C4] text-[#78716C] flex items-center justify-center min-h-[100px]'
                        : 'bg-[#FAF9F6] border-[#E5E0D8] text-[#18181B]'
                    }`}
                  >
                    {row.leftClause ? (
                      <>
                        <div className="flex items-center justify-between text-[11px] text-[#57534E] pb-1 border-b border-black/10">
                          <span className="font-code font-semibold text-[#18181B]">
                            {leftVersion.versionLabel}: {row.leftClause.number}
                          </span>
                          <span>
                            {row.leftClause.legalBasis} · Risiko: {row.leftClause.riskLevel}
                          </span>
                        </div>
                        <div className="font-legal font-bold text-sm uppercase">
                          {row.leftClause.title}
                        </div>
                        <div className="space-y-1.5 font-legal text-[13.5px] leading-relaxed">
                          {row.leftClause.content.map((ayat, idx) => {
                            const rightAyat = row.rightClause?.content[idx];
                            const isAyatChanged =
                              row.status === 'modified' &&
                              (!rightAyat || rightAyat.trim() !== ayat.trim());
                            return (
                              <p
                                key={idx}
                                className={
                                  isAyatChanged
                                    ? 'p-1.5 rounded bg-red-100/80 text-red-950 border-l-2 border-red-500'
                                    : ''
                                }
                              >
                                {ayat}
                              </p>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="italic text-[11px]">
                        (Belum ada pada {leftVersion.versionLabel})
                      </span>
                    )}
                  </div>

                  {/* RIGHT COLUMN (NEW VERSION) */}
                  <div
                    className={`p-3 rounded border text-xs space-y-2 ${
                      row.status === 'added'
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : row.status === 'modified'
                        ? 'bg-amber-50/90 border-amber-300 text-[#18181B]'
                        : row.status === 'removed'
                        ? 'bg-[#FAF9F6] border-dashed border-[#D6D0C4] text-[#78716C] flex items-center justify-center min-h-[100px]'
                        : 'bg-[#FAF9F6] border-[#E5E0D8] text-[#18181B]'
                    }`}
                  >
                    {row.rightClause ? (
                      <>
                        <div className="flex items-center justify-between text-[11px] text-[#57534E] pb-1 border-b border-black/10">
                          <span className="font-code font-semibold text-[#18181B]">
                            {rightVersion.versionLabel}: {row.rightClause.number}
                          </span>
                          <span>
                            {row.rightClause.legalBasis} · Risiko: {row.rightClause.riskLevel}
                          </span>
                        </div>
                        <div className="font-legal font-bold text-sm uppercase">
                          {row.rightClause.title}
                        </div>
                        <div className="space-y-1.5 font-legal text-[13.5px] leading-relaxed">
                          {row.rightClause.content.map((ayat, idx) => {
                            const leftAyat = row.leftClause?.content[idx];
                            const isAyatChanged =
                              row.status === 'modified' &&
                              (!leftAyat || leftAyat.trim() !== ayat.trim());
                            return (
                              <p
                                key={idx}
                                className={
                                  isAyatChanged
                                    ? 'p-1.5 rounded bg-emerald-100/80 text-emerald-950 border-l-2 border-emerald-600'
                                    : ''
                                }
                              >
                                {ayat}
                              </p>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="italic text-[11px]">
                        (Dihapus pada {rightVersion.versionLabel})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
