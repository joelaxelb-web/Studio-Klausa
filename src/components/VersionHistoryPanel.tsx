import React, { useState, useEffect } from 'react';
import { History, RotateCcw, PlusCircle, CheckCircle2, GitCompare } from 'lucide-react';
import { LegalDocument, LegalDocumentVersion } from '../types/legal';

interface VersionHistoryPanelProps {
  document: LegalDocument;
  onSaveSnapshot: (note: string) => void;
  onRevertToVersion: (version: LegalDocumentVersion) => void;
  onCompareVersions: (leftVersionId: string, rightVersionId: string) => void;
  isComparing?: boolean;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  document,
  onSaveSnapshot,
  onRevertToVersion,
  onCompareVersions,
  isComparing = false,
}) => {
  const [snapshotNote, setSnapshotNote] = useState('');
  const [confirmingVersionId, setConfirmingVersionId] = useState<string | null>(null);

  const versions = document.versions || [];

  // Default selection: compare second newest (or oldest) on left vs newest on right
  const [selectedLeftId, setSelectedLeftId] = useState<string>(
    () => versions[1]?.id || versions[0]?.id || ''
  );
  const [selectedRightId, setSelectedRightId] = useState<string>(
    () => versions[0]?.id || ''
  );

  useEffect(() => {
    const vers = document.versions || [];
    if (vers.length >= 2) {
      setSelectedLeftId(vers[1].id);
      setSelectedRightId(vers[0].id);
    } else if (vers.length === 1) {
      setSelectedLeftId(vers[0].id);
      setSelectedRightId(vers[0].id);
    }
  }, [document.id, versions.length]);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const label = snapshotNote.trim() || 'Simpanan manual pengguna';
    onSaveSnapshot(label);
    setSnapshotNote('');
  };

  const handleLaunchComparison = () => {
    if (!selectedLeftId || !selectedRightId) return;
    onCompareVersions(selectedLeftId, selectedRightId);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>
            Riwayat Versi Dokumen (
            <span className="font-code tabular-nums">{versions.length}</span>)
          </span>
        </h2>
        {isComparing && (
          <span className="text-[10.5px] font-code font-medium text-[#1E3A8A]">
            Mode Banding Aktif
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#57534E] leading-relaxed">
        Setiap perubahan penting tercatat otomatis. Simpan checkpoint manual, bandingkan dua versi berdampingan (side-by-side), atau lakukan <strong>Revert</strong>.
      </p>

      {/* Side-by-Side Comparison Selector Box */}
      {versions.length >= 2 && (
        <div className="p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2">
          <div className="text-[11px] font-semibold text-[#18181B] flex items-center gap-1.5">
            <GitCompare className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Bandingkan Dua Versi (Side-by-Side)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] text-[#57534E] mb-0.5">Versi Kiri (Lama):</label>
              <select
                value={selectedLeftId}
                onChange={(e) => setSelectedLeftId(e.target.value)}
                className="w-full px-2 py-1 text-[11px] font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.versionLabel} · {v.summary.slice(0, 18)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#57534E] mb-0.5">Versi Kanan (Baru):</label>
              <select
                value={selectedRightId}
                onChange={(e) => setSelectedRightId(e.target.value)}
                className="w-full px-2 py-1 text-[11px] font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.versionLabel} · {v.summary.slice(0, 18)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLaunchComparison}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFECE6] border border-[#1E3A8A]/40 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Bandingkan Versi Side-by-Side</span>
          </button>
        </div>
      )}

      {/* Manual Snapshot Form */}
      <form onSubmit={handleCreateSnapshot} className="flex gap-1.5">
        <input
          type="text"
          value={snapshotNote}
          onChange={(e) => setSnapshotNote(e.target.value)}
          placeholder="Catatan versi (mis. Sebelum negosiasi klien)..."
          className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A]"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] whitespace-nowrap cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Simpan</span>
        </button>
      </form>

      {/* Version Timeline */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1 pt-1">
        {versions.length === 0 ? (
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-xs text-[#57534E] text-center">
            Belum ada riwayat versi tersimpan untuk dokumen ini. Klik "Simpan" di atas untuk membuat titik pemulihan pertama.
          </div>
        ) : (
          versions.map((ver, index) => {
            const isLatest = index === 0;
            const isConfirming = confirmingVersionId === ver.id;

            return (
              <div
                key={ver.id}
                className={`p-2.5 rounded-md border transition-colors space-y-1.5 ${
                  isLatest
                    ? 'bg-[#F7F5F0] border-[#D6D0C4]'
                    : 'bg-[#FAF9F6] border-[#E5E0D8]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5 min-w-0">
                    <span className="font-code text-[#1E3A8A] shrink-0">{ver.versionLabel}</span>
                    <span>·</span>
                    <span className="truncate">{ver.summary}</span>
                  </div>
                  {isLatest && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terbaru</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                  <span className="font-code tabular-nums">{ver.timestamp}</span>
                  <span className="font-code tabular-nums">
                    {ver.snapshot.clauses.length} Pasal
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2 border-t border-[#E5E0D8]/60">
                  {versions.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetRight = isLatest
                          ? versions[0].id
                          : versions[0].id;
                        const targetLeft = isLatest
                          ? (versions[1]?.id || ver.id)
                          : ver.id;
                        setSelectedLeftId(targetLeft);
                        setSelectedRightId(targetRight);
                        onCompareVersions(targetLeft, targetRight);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#57534E] hover:text-[#1E3A8A] cursor-pointer whitespace-nowrap"
                      title="Bandingkan versi ini secara berdampingan"
                    >
                      <GitCompare className="w-3 h-3" />
                      <span>Bandingkan</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {isConfirming ? (
                      <>
                        <span className="text-[11px] text-amber-800 font-medium">
                          Revert ke {ver.versionLabel}?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onRevertToVersion(ver);
                            setConfirmingVersionId(null);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172E6E] cursor-pointer whitespace-nowrap"
                        >
                          Ya
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingVersionId(null)}
                          className="px-1.5 py-0.5 text-[11px] font-medium text-[#57534E] hover:text-[#18181B] cursor-pointer whitespace-nowrap"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingVersionId(ver.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A8A] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert</span>
                      </button>
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
