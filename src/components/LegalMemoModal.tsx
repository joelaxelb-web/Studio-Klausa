import React, { useMemo } from 'react';
import {
  FileText,
  FileDown,
  Download,
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { LegalDocument } from '../types/legal';
import {
  buildClientLegalMemoData,
  exportLegalMemoToPdf,
  exportLegalMemoToWord,
} from '../utils/exportDocument';

interface LegalMemoModalProps {
  document: LegalDocument;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export const LegalMemoModal: React.FC<LegalMemoModalProps> = ({
  document,
  onClose,
  onNotify,
}) => {
  const memo = useMemo(() => buildClientLegalMemoData(document), [document]);

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-ui">
      <div className="bg-[#F7F5F0] border border-[#D6D0C4] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-[#D6D0C4] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1E3A8A] text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#18181B]">
                Memorandum Hukum Klien (Executive Legal Memo — Siap Presentasi)
              </h3>
              <p className="text-[11px] text-[#57534E]">
                Rangkuman otomatis isi draf, analisis risiko, scan inkonsistensi & poin krusial bagi klien
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                exportLegalMemoToWord(document);
                onNotify?.('Dokumen Legal Memo (.doc) berhasil diunduh.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                exportLegalMemoToPdf(document);
                onNotify?.('Dokumen Legal Memo (PDF Siap Presentasi) berhasil diunduh.');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh PDF Legal Memo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#57534E] hover:text-[#18181B] rounded cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formal Legal Memo Document Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="bg-white border border-[#D6D0C4] rounded-md p-6 sm:p-10 shadow-xs space-y-6 font-legal text-[#18181B]">
            {/* Formal Memorandum Header */}
            <div className="text-center border-b-2 border-[#1E3A8A] pb-4 space-y-1">
              <div className="text-xs font-ui font-semibold uppercase tracking-widest text-[#1E3A8A]">
                Rahasia & Istimewa · Attorney-Client Privileged
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#18181B]">
                MEMORANDUM HUKUM EKSEKUTIF (LEGAL MEMO)
              </h2>
              <p className="text-xs font-ui text-[#57534E]">
                Nomor Referensi: <span className="font-code font-medium">{memo.memoNumber}</span>
              </p>
            </div>

            {/* Kepada / Dari / Tanggal / Perihal Grid */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E5E0D8] rounded font-ui text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                <span className="font-semibold text-[#57534E]">KEPADA (TO)</span>
                <span className="sm:col-span-3 font-semibold text-[#18181B]">
                  : {memo.recipient}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                <span className="font-semibold text-[#57534E]">DARI (FROM)</span>
                <span className="sm:col-span-3 text-[#18181B]">: {memo.sender}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                <span className="font-semibold text-[#57534E]">TANGGAL</span>
                <span className="sm:col-span-3 font-code text-[#18181B]">: {memo.date}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                <span className="font-semibold text-[#57534E]">PERIHAL</span>
                <span className="sm:col-span-3 font-semibold text-[#1E3A8A]">
                  : {memo.subject}
                </span>
              </div>
            </div>

            {/* Section I: Ringkasan Eksekutif */}
            <div className="space-y-3">
              <h3 className="text-sm font-ui font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-[#E5E0D8] pb-1.5">
                I. Ringkasan Eksekutif Draf & Parameter Transaksi
              </h3>
              <p className="text-sm leading-relaxed text-justify">
                {memo.executiveSummary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-ui text-xs">
                {memo.transactionParameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded"
                  >
                    <div className="text-[11px] text-[#57534E]">{param.label}</div>
                    <div className="font-semibold text-[#18181B] mt-0.5">{param.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section II: Analisis Risiko */}
            <div className="space-y-3">
              <h3 className="text-sm font-ui font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-[#E5E0D8] pb-1.5">
                II. Analisis Profil Risiko Hukum
              </h3>
              <div className="flex flex-wrap items-center gap-4 p-3.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded font-ui text-xs">
                <div>
                  <span className="text-[#57534E]">Total Klausul:</span>{' '}
                  <strong className="text-[#18181B]">{memo.riskSummary.totalClauses} Pasal</strong>
                </div>
                <span>·</span>
                <div>
                  <span className="text-red-700 font-semibold">
                    Risiko Kritis: {memo.riskSummary.kritisCount} Pasal
                  </span>
                </div>
                <span>·</span>
                <div>
                  <span className="text-amber-700 font-semibold">
                    Risiko Perhatian: {memo.riskSummary.perhatianCount} Pasal
                  </span>
                </div>
                <span>·</span>
                <div>
                  <span className="text-emerald-700 font-semibold">
                    Risiko Standar: {memo.riskSummary.standarCount} Pasal
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-justify">
                {memo.riskSummary.overallAssessment}
              </p>
            </div>

            {/* Section III: Poin-Poin Krusial Klien */}
            <div className="space-y-3">
              <h3 className="text-sm font-ui font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-[#E5E0D8] pb-1.5">
                III. Poin-Poin Krusial per Pasal yang Wajib Diperhatikan Klien
              </h3>
              <div className="space-y-2.5 font-ui">
                {memo.crucialClientPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#18181B]">
                        {pt.clauseRef} — {pt.title}
                      </span>
                      <span className="text-[11px] text-[#57534E]">
                        {pt.legalBasis} ·{' '}
                        <strong
                          className={
                            pt.riskLevel === 'Kritis'
                              ? 'text-red-700'
                              : pt.riskLevel === 'Perhatian'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          Risiko {pt.riskLevel}
                        </strong>
                      </span>
                    </div>
                    <p className="text-xs text-[#27272A] leading-relaxed font-legal">
                      {pt.clientImpact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section IV: Temuan Scan Inkonsistensi & Konflik Hukum */}
            <div className="space-y-3">
              <h3 className="text-sm font-ui font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-[#E5E0D8] pb-1.5">
                IV. Temuan Scan Inkonsistensi Terminologi & Konflik Antar-Pasal
              </h3>
              <div className="space-y-2.5 font-ui">
                {memo.comprehensiveScanFindings.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          f.type === 'Konflik Klausul Hukum'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}
                      />
                      <span>
                        [{f.type}] {f.title} ({f.involvedClauses.join(', ')})
                      </span>
                    </div>
                    <p className="text-xs text-[#27272A] leading-relaxed">{f.description}</p>
                    <p className="text-[11px] text-[#57534E]">
                      <strong className="text-[#18181B]">Rekomendasi:</strong> {f.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section V: Rekomendasi Tindak Lanjut Klien */}
            <div className="space-y-3">
              <h3 className="text-sm font-ui font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-[#E5E0D8] pb-1.5">
                V. Rekomendasi Tindak Lanjut & Langkah Mitigasi Klien
              </h3>
              <div className="space-y-2 font-ui">
                {memo.actionRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-[#18181B]">
                        {rec.action} · <span className="text-[#57534E] font-normal">{rec.priority}</span>
                      </div>
                      <p className="text-[#57534E] leading-relaxed">{rec.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
