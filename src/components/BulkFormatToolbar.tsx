import React, { useState } from 'react';
import {
  ListOrdered,
  Type as TypeIcon,
  Indent,
  Check,
  SlidersHorizontal,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  FilePlus2,
  History,
  RotateCcw,
} from 'lucide-react';
import {
  BulkFormatConfig,
  NumberingStyle,
  FontStylePreset,
  IndentationPreset,
} from '../utils/clauseTools';
import { SmartFormattingHistoryEntry } from '../types/legal';

interface BulkFormatToolbarProps {
  config: BulkFormatConfig;
  onChangeConfig: (newConfig: BulkFormatConfig) => void;
  onApplyBulkFormat: (configToApply?: BulkFormatConfig) => void;
  onSyncAllClausesByRisk: () => void;
  onBulkImportClauses?: (
    rawText: string,
    mode: 'append' | 'replace',
    numberingStyle?: NumberingStyle
  ) => Promise<void> | void;
  currentClauseCount?: number;
  isImportingBulk?: boolean;
  smartFormatHistory?: SmartFormattingHistoryEntry[];
  onRestoreFormatState?: (entry: SmartFormattingHistoryEntry) => void;
}

export function formatConfigSummaryLabel(cfg: {
  numberingStyle: NumberingStyle;
  fontStyle: FontStylePreset;
  indentation: IndentationPreset;
  uppercaseTitles: boolean;
}): {
  numberingBadge: string;
  fontBadge: string;
  indentBadge: string;
  caseBadge: string;
} {
  const numberingBadge =
    cfg.numberingStyle === 'decimal_hierarchy'
      ? 'Pasal 1 → 1.1., a.'
      : cfg.numberingStyle === 'roman_parentheses'
      ? 'PASAL I → (1), a.'
      : cfg.numberingStyle === 'numeric_dot'
      ? 'Pasal 1 → 1., a.'
      : 'Pasal 1 → (1), a.';

  const fontBadge =
    cfg.fontStyle === 'sans_corporate'
      ? 'Sans Korporasi'
      : cfg.fontStyle === 'mono_audit'
      ? 'Mono Audit'
      : 'Serif Akta';

  const indentBadge =
    cfg.indentation === 'hanging_subclause'
      ? 'Hanging Indent'
      : cfg.indentation === 'notarial_first_line'
      ? 'Notarial First-Line'
      : 'Rata Kiri';

  const caseBadge = cfg.uppercaseTitles ? 'JUDUL KAPITAL' : 'Judul Standar';

  return { numberingBadge, fontBadge, indentBadge, caseBadge };
}

const SAMPLE_EXTERNAL_CONTRACT_RAW = `Pasal 1 - Jaminan Ketersediaan Layanan & Pemeliharaan Sistem
Penyedia jasa menjamin tingkat ketersediaan sistem (uptime SLA) minimal sebesar 99,5% setiap bulan kalender.
Apabila terjadi gangguan teknis kritis, penyedia wajib melakukan penanganan darurat dalam waktu maksimal 2x24 jam sejak laporan diterima secara tertulis.

Pasal 2 - Larangan Pengalihan Pekerjaan (Subkontrak)
Pihak Kedua dilarang mengalihkan sebagian maupun seluruh kewajiban pekerjaan dalam perjanjian ini kepada pihak ketiga tanpa persetujuan tertulis terlebih dahulu dari Pihak Pertama.
Pelanggaran atas larangan subkontrak ini memberikan hak kepada Pihak Pertama untuk mengakhiri perjanjian secara seketika dengan mengesampingkan Pasal 1266 KUHPerdata.

Pasal 3 - Audit Kepatuhan dan Keamanan Informasi
Pihak Pertama berhak melaksanakan audit kepatuhan keamanan data maksimal 1 (satu) kali setiap tahun dengan pemberitahuan tertulis 7 (tujuh) Hari Kerja sebelumnya sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.`;

export const BulkFormatToolbar: React.FC<BulkFormatToolbarProps> = ({
  config,
  onChangeConfig,
  onApplyBulkFormat,
  onSyncAllClausesByRisk,
  onBulkImportClauses,
  currentClauseCount = 0,
  isImportingBulk = false,
  smartFormatHistory = [],
  onRestoreFormatState,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isFormatHistoryOpen, setIsFormatHistoryOpen] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const isEntryMatchingActiveConfig = (entry: SmartFormattingHistoryEntry) =>
    entry.numberingStyle === config.numberingStyle &&
    entry.fontStyle === config.fontStyle &&
    entry.indentation === config.indentation &&
    entry.uppercaseTitles === config.uppercaseTitles;

  const handleQuickDecimalFormat = () => {
    const quickConfig: BulkFormatConfig = {
      ...config,
      numberingStyle: 'decimal_hierarchy',
      indentation: 'hanging_subclause',
      uppercaseTitles: true,
    };
    onChangeConfig(quickConfig);
    onApplyBulkFormat(quickConfig);
  };

  return (
    <div
      data-testid="bulk-format-toolbar"
      className="no-print mb-6 bg-white border border-[#D6D0C4] rounded-md shadow-xs overflow-hidden font-ui"
    >
      {/* Primary Single-Click Action Bar */}
      <div className="px-4 py-3 bg-[#F7F5F0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#1E3A8A]/10 border border-[#1E3A8A]/25 flex items-center justify-center text-[#1E3A8A]">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]">
                Bulk Formatting & Otomatisasi Risiko Pasal
              </span>
              <span className="text-[10.5px] font-mono text-[#1E3A8A] bg-[#1E3A8A]/8 px-1.5 py-0.5 rounded border border-[#1E3A8A]/20">
                {config.numberingStyle === 'decimal_hierarchy'
                  ? 'Level 1, 1.1, a.'
                  : config.numberingStyle === 'roman_parentheses'
                  ? 'PASAL I, (1), a.'
                  : config.numberingStyle === 'numeric_dot'
                  ? 'Pasal 1, 1., a.'
                  : 'Pasal 1, (1), a.'}
              </span>
            </div>
            <p className="text-[11px] text-[#57534E]">
              Standarisasi font, hierarki penomoran (Level 1, 1.1, a.), indentasi, & isi pasal berbasis risiko dengan 1 klik
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Smart Formatting History Log Toggle Button */}
          <button
            type="button"
            data-testid="toggle-smart-format-history-btn"
            onClick={() => setIsFormatHistoryOpen((prev) => !prev)}
            title="Buka Smart Formatting History untuk beralih cepat antar konfigurasi format dokumen sebelumnya (penomoran, font, indentasi)"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
              isFormatHistoryOpen
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                : 'bg-white text-[#1E3A8A] hover:bg-[#EFF6FF] border-[#BFDBFE]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Smart Formatting History ({smartFormatHistory.length})</span>
            {isFormatHistoryOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* Bulk Clause Import Button in Editor Naskah */}
          <button
            type="button"
            data-testid="open-bulk-clause-import-btn"
            onClick={() => setIsBulkImportOpen((prev) => !prev)}
            title="Tempel (paste) teks mentah dari kontrak eksternal agar AI Agent memisahkan & memformatnya menjadi pasal-pasal terstruktur"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
              isBulkImportOpen
                ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#1E3A8A]'
                : 'bg-white text-[#1E3A8A] hover:bg-[#EFF6FF] border-[#BFDBFE]'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Bulk Clause Import</span>
          </button>

          {/* Single-click auto-reformat to Level 1, 1.1, a. */}
          <button
            type="button"
            onClick={handleQuickDecimalFormat}
            title="Format seluruh pasal ke hierarki Level 1, 1.1, a. dengan satu klik"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Standarisasi 1-Klik (Level 1, 1.1, a.)</span>
          </button>

          {/* Single-click adapt all clauses content & regulation by risk level */}
          <button
            type="button"
            onClick={onSyncAllClausesByRisk}
            title="Sesuaikan otomatis isi ayat dan peraturan seluruh pasal berdasarkan tingkat risikonya (Standar / Perhatian / Kritis)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Sesuaikan Isi Semua Pasal Sesuai Risiko</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#18181B] bg-white border border-[#D6D0C4] rounded transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Opsi Format</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Inline Toggle Strip for Historical Formatting States */}
      {smartFormatHistory.length > 0 && (
        <div
          data-testid="smart-format-quick-toggle-bar"
          className="px-4 py-2 bg-[#FAF9F6] border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#57534E]">
            <History className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span>Toggle Cepat Riwayat Format:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {smartFormatHistory.slice(0, 5).map((entry) => {
              const isActive = isEntryMatchingActiveConfig(entry);
              const meta = formatConfigSummaryLabel(entry);
              return (
                <button
                  key={entry.id}
                  type="button"
                  data-testid={`quick-toggle-format-${entry.id}`}
                  onClick={() => onRestoreFormatState?.(entry)}
                  title={`Beralih ke "${entry.label}" (${meta.numberingBadge} · ${meta.fontBadge} · ${meta.indentBadge})`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-semibold rounded border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs'
                      : 'bg-white text-[#18181B] hover:bg-[#EFF6FF] hover:border-[#93C5FD] border-[#D6D0C4]'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 shrink-0" />}
                  <span>{entry.label}</span>
                  <span
                    className={`font-code text-[9.5px] px-1 py-0.2 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F7F5F0] text-[#57534E]'
                    }`}
                  >
                    {meta.numberingBadge} · {meta.fontBadge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Smart Formatting History Log Panel */}
      {isFormatHistoryOpen && (
        <div
          data-testid="smart-format-history-panel"
          className="p-4 border-t border-[#BFDBFE] bg-[#FAF9F6] space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#1E3A8A]" />
                <span>
                  Smart Formatting History Log ({smartFormatHistory.length} Konfigurasi Tersimpan)
                </span>
              </h3>
              <p className="text-[11px] text-[#57534E]">
                Lacak dan beralih kembali ke konfigurasi pemformatan massal sebelumnya (gaya penomoran, tipografi font, indentasi, dan kapitalisasi judul) dengan 1 klik.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormatHistoryOpen(false)}
              className="px-2.5 py-1 text-[11px] font-medium text-[#57534E] hover:text-[#18181B] cursor-pointer"
            >
              Tutup Log
            </button>
          </div>

          <div
            data-testid="smart-format-history-list"
            className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1"
          >
            {smartFormatHistory.map((entry, idx) => {
              const isActive = isEntryMatchingActiveConfig(entry);
              const meta = formatConfigSummaryLabel(entry);
              return (
                <div
                  key={entry.id}
                  data-testid={`format-history-card-${entry.id}`}
                  className={`p-3 rounded-md border transition-all flex flex-col justify-between gap-2.5 ${
                    isActive
                      ? 'bg-[#EFF6FF]/90 border-[#1E3A8A] ring-1 ring-[#1E3A8A]/20'
                      : 'bg-white border-[#E5E0D8] hover:border-[#93C5FD]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#18181B]">
                            {entry.label}
                          </span>
                          {idx === 0 && (
                            <span className="text-[9.5px] font-code font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                              Terbaru
                            </span>
                          )}
                          {isActive && (
                            <span
                              data-testid={`format-history-active-badge-${entry.id}`}
                              className="text-[9.5px] font-code font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300"
                            >
                              Aktif Saat Ini
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-[#78716C] font-code mt-0.5">
                          {entry.timestamp} · {entry.clausesSnapshot.length} Pasal
                        </div>
                      </div>

                      <button
                        type="button"
                        data-testid={`restore-format-state-btn-${entry.id}`}
                        onClick={() => onRestoreFormatState?.(entry)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                            : 'bg-[#FAF9F6] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white border-[#BFDBFE]'
                        }`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isActive ? 'Terapkan Ulang' : 'Toggle Format Ini'}</span>
                      </button>
                    </div>

                    {/* Unboxed clean metadata summary */}
                    <div className="text-[11px] text-[#3F3F46] pt-1 border-t border-[#E5E0D8]/70 flex flex-wrap items-center gap-1.5 font-code">
                      <span className="font-semibold text-[#1E3A8A]">
                        {meta.numberingBadge}
                      </span>
                      <span>·</span>
                      <span>{meta.fontBadge}</span>
                      <span>·</span>
                      <span>{meta.indentBadge}</span>
                      <span>·</span>
                      <span>{meta.caseBadge}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Granular Bulk Formatting Controls */}
      {isExpanded && (
        <div className="p-4 border-t border-[#E5E0D8] bg-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Numbering Hierarchy */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#57534E]">
                <ListOrdered className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Hierarki Penomoran Pasal & Ayat</span>
              </label>
              <select
                value={config.numberingStyle}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    numberingStyle: e.target.value as NumberingStyle,
                  })
                }
                className="w-full text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded px-2.5 py-2 text-[#18181B] focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="decimal_hierarchy">
                  Level Desimal Bertingkat (Pasal 1 → 1.1., 1.2., a., b.)
                </option>
                <option value="ayat_parentheses">
                  Notariil Standar Indonesia (Pasal 1 → (1), (2), a., b.)
                </option>
                <option value="roman_parentheses">
                  Romawi Klasik (PASAL I → (1), (2), a., b.)
                </option>
                <option value="numeric_dot">
                  Angka Titik (Pasal 1 → 1., 2., a., b.)
                </option>
              </select>
            </div>

            {/* 2. Font Styling */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#57534E]">
                <TypeIcon className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Gaya Tipografi Naskah (Font Styling)</span>
              </label>
              <select
                value={config.fontStyle}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    fontStyle: e.target.value as FontStylePreset,
                  })
                }
                className="w-full text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded px-2.5 py-2 text-[#18181B] focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="serif_legal">
                  Serif Akta Notariil (Newsreader / Times Legal)
                </option>
                <option value="sans_corporate">
                  Sans-Serif Korporasi Modern (Plus Jakarta Sans)
                </option>
                <option value="mono_audit">
                  Monospace Audit Kontrak (JetBrains Mono)
                </option>
              </select>
            </div>

            {/* 3. Indentation */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#57534E]">
                <Indent className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Indentasi Paragraf & Sub-Klausul</span>
              </label>
              <select
                value={config.indentation}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    indentation: e.target.value as IndentationPreset,
                  })
                }
                className="w-full text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded px-2.5 py-2 text-[#18181B] focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="hanging_subclause">
                  Indentasi Sub-Ayat Bertingkat (Hanging Indent)
                </option>
                <option value="notarial_first_line">
                  Indentasi Alinea Baris Pertama (Notarial First-Line)
                </option>
                <option value="none">Rata Kiri Tanpa Indentasi</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-[#18181B] cursor-pointer">
              <input
                type="checkbox"
                checked={config.uppercaseTitles}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    uppercaseTitles: e.target.checked,
                  })
                }
                className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
              <span>Standarisasi seluruh Judul Pasal ke HURUF KAPITAL</span>
            </label>

            <button
              type="button"
              onClick={() => onApplyBulkFormat(config)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Terapkan Konfigurasi ke Seluruh Pasal</span>
            </button>
          </div>
        </div>
      )}

      {/* Expandable Bulk Clause Import Tool (AI Raw Contract Parser & Numbering Hierarchy Formatter) */}
      {isBulkImportOpen && (
        <div
          data-testid="bulk-clause-import-panel"
          className="p-4 border-t border-[#BFDBFE] bg-[#FAF9F6] space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <FilePlus2 className="w-4 h-4 text-[#1E3A8A]" />
                <span>
                  Bulk Clause Import — AI Agent Pemisah & Standarisasi Hierarki Pasal Eksternal
                </span>
              </h3>
              <p className="text-[11px] text-[#57534E]">
                Tempelkan (paste) teks mentah dari kontrak luar. AI Agent akan memisahkannya menjadi pasal-pasal terpisah lengkap dengan nomor urut, ayat, dasar hukum, dan tingkat risiko sesuai hierarki aktif (
                <strong>
                  {config.numberingStyle === 'decimal_hierarchy'
                    ? 'Pasal 1 → 1.1., 1.2., a.'
                    : config.numberingStyle === 'roman_parentheses'
                    ? 'PASAL I → (1), (2), a.'
                    : config.numberingStyle === 'numeric_dot'
                    ? 'Pasal 1 → 1., 2., a.'
                    : 'Pasal 1 → (1), (2), a.'}
                </strong>
                ).
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="load-sample-external-contract-btn"
                onClick={() => setRawImportText(SAMPLE_EXTERNAL_CONTRACT_RAW)}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] rounded cursor-pointer whitespace-nowrap"
              >
                + Muat Contoh Teks Kontrak Eksternal
              </button>
              <button
                type="button"
                onClick={() => setIsBulkImportOpen(false)}
                className="px-2 py-1 text-[11px] text-[#57534E] hover:text-[#18181B] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            data-testid="bulk-clause-import-textarea"
            value={rawImportText}
            onChange={(e) => setRawImportText(e.target.value)}
            placeholder="Tempelkan (paste) teks pasal-pasal mentah dari kontrak eksternal di sini (misal beberapa pasal sekaligus atau paragraf kontrak tanpa nomor baku)..."
            className="w-full p-3 text-xs font-legal bg-white border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A] leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#18181B] font-medium">
                <input
                  type="radio"
                  name="bulkImportMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span>
                  Tambahkan ke Akhir Draf (Mulai dari Pasal {currentClauseCount + 1})
                </span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#57534E] font-medium">
                <input
                  type="radio"
                  name="bulkImportMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span>Ganti Seluruh Pasal Dokumen (Mulai dari Pasal 1)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Hierarki Penomoran Bulk Import"
                value={config.numberingStyle}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    numberingStyle: e.target.value as NumberingStyle,
                  })
                }
                className="px-2.5 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded text-[#18181B] focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="ayat_parentheses">Hierarki: Pasal 1 → (1), (2), a.</option>
                <option value="decimal_hierarchy">Hierarki: Pasal 1 → 1.1., 1.2., a.</option>
                <option value="roman_parentheses">Hierarki: PASAL I → (1), (2), a.</option>
                <option value="numeric_dot">Hierarki: Pasal 1 → 1., 2., a.</option>
              </select>

              <button
                type="button"
                data-testid="submit-bulk-clause-import-btn"
                disabled={isImportingBulk || !rawImportText.trim()}
                onClick={async () => {
                  if (!rawImportText.trim() || !onBulkImportClauses) return;
                  await onBulkImportClauses(
                    rawImportText,
                    importMode,
                    config.numberingStyle
                  );
                  setRawImportText('');
                  setIsBulkImportOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] disabled:opacity-50 rounded transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isImportingBulk
                    ? 'AI Agent Memisahkan & Memformat Pasal...'
                    : 'Impor & Format Pasal dengan AI Agent'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
