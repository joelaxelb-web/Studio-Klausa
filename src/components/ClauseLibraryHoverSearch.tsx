import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Replace,
  Plus,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { ClauseLibraryItem, LegalClause } from '../types/legal';

interface ScoredLibraryItem {
  item: ClauseLibraryItem;
  score: number;
  matchReason: string;
}

const NATURAL_LANGUAGE_SYNONYM_GROUPS: Array<{
  intentLabel: string;
  userKeywords: RegExp;
  libraryMatchPattern: RegExp;
}> = [
  {
    intentLabel: 'Pengakhiran kontrak sepihak tanpa putusan hakim (Pasal 1266)',
    userKeywords:
      /putus|batal|sepihak|pengadilan|hakim|berhenti|akhiri|1266|1267|pecat|terminasi/i,
    libraryMatchPattern: /1266|pengakhiran/i,
  },
  {
    intentLabel: 'Pelindungan data pribadi, privasi & kebocoran informasi (UU PDP)',
    userKeywords:
      /data|pribadi|bocor|privasi|rahasia|hack|insiden|pelanggan|pdp|konfidensial|nda/i,
    libraryMatchPattern: /data pribadi|pdp|kerahasiaan/i,
  },
  {
    intentLabel: 'Kepemilikan penuh HKI, hak cipta & source code (Work Made for Hire)',
    userKeywords:
      /hak cipta|hki|source code|kode|karya|desain|milik|kekayaan intelektual|aplikasi|orisinal/i,
    libraryMatchPattern: /kekayaan intelektual|hak cipta|work made/i,
  },
  {
    intentLabel: 'Larangan membajak karyawan, tim ahli & mitra (Non-Solicitation)',
    userKeywords:
      /bajak|rekrut|karyawan|pegawai|tim|tenaga ahli|pindah kerja|solicit|kompetitor/i,
    libraryMatchPattern: /membajak|non-solicit|karyawan/i,
  },
  {
    intentLabel: 'Penyelesaian sengketa cepat & tertutup melalui Arbitrase BANI',
    userKeywords:
      /sengketa|ribut|masalah|gugat|bani|arbitrase|musyawarah|mufakat|perselisihan|forum/i,
    libraryMatchPattern: /bani|arbitrase|sengketa/i,
  },
  {
    intentLabel: 'Kepatuhan anti-suap, komisi tersembunyi (kickback) & korupsi',
    userKeywords:
      /suap|korupsi|komisi|gratifikasi|kickback|sogok|curang|etik|integritas/i,
    libraryMatchPattern: /anti-suap|gratifikasi|korupsi/i,
  },
  {
    intentLabel: 'Pembebasan tanggung jawab akibat bencana alam / Force Majeure',
    userKeywords:
      /bencana|alam|banjir|gempa|perang|pandemi|darurat|kahar|force majeure|tidak sengaja|diluar kendali/i,
    libraryMatchPattern: /kahar|force majeure/i,
  },
  {
    intentLabel: 'Sanksi denda keterlambatan harian & batas maksimum denda',
    userKeywords:
      /telat|terlambat|denda|molor|mundur|bayar|jadwal|sanksi|penalti|ganti rugi|per mil/i,
    libraryMatchPattern: /denda keterlambatan|liquidated/i,
  },
  {
    intentLabel: 'Wewenang limpahan kuasa (Substitusi) & penahanan berkas (Retensi)',
    userKeywords:
      /kuasa|limpah|wakil|advokat|pengacara|tahan dokumen|substitusi|retensi|klien/i,
    libraryMatchPattern: /substitusi|retensi|surat kuasa/i,
  },
];

export function searchClauseLibraryNaturalLanguage(
  query: string,
  library: ClauseLibraryItem[]
): ScoredLibraryItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return library.map((item) => ({
      item,
      score: 1,
      matchReason: `Klausul standar kategori ${item.category} (${item.legalBasis})`,
    }));
  }

  const tokens = clean
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const scored: ScoredLibraryItem[] = library.map((item) => {
    let score = 0;
    let matchedIntent = '';

    const haystack = `${item.title} ${item.category} ${item.legalBasis} ${item.summary} ${item.content.join(' ')}`.toLowerCase();

    // 1. Check natural language intent / synonym groups
    for (const group of NATURAL_LANGUAGE_SYNONYM_GROUPS) {
      if (
        group.userKeywords.test(clean) &&
        group.libraryMatchPattern.test(haystack)
      ) {
        score += 45;
        matchedIntent = group.intentLabel;
      }
    }

    // 2. Direct phrase match
    if (haystack.includes(clean)) {
      score += 35;
    }

    // 3. Token-level scoring
    for (const token of tokens) {
      if (item.title.toLowerCase().includes(token)) score += 15;
      if (item.summary.toLowerCase().includes(token)) score += 10;
      if (item.category.toLowerCase().includes(token)) score += 8;
      if (item.legalBasis.toLowerCase().includes(token)) score += 10;
      if (item.content.join(' ').toLowerCase().includes(token)) score += 6;
    }

    const matchReason = matchedIntent
      ? `Relevan secara semantik: ${matchedIntent}`
      : score > 0
      ? `Cocok dengan kata kunci pada ${item.category} (${item.legalBasis})`
      : `Klausul referensi ${item.category}`;

    return {
      item,
      score,
      matchReason,
    };
  });

  const matchingOnly = scored.filter((s) => s.score > 0);
  if (matchingOnly.length > 0) {
    return matchingOnly.sort((a, b) => b.score - a.score);
  }
  return scored;
}

const NATURAL_SEARCH_EXAMPLES = [
  'Putus kontrak sepihak tanpa pengadilan',
  'Kalau ada bencana alam atau darurat',
  'Denda kalau telat bayar atau molor',
  'Jangan bajak karyawan selama 2 tahun',
  'Hak cipta source code milik penuh klien',
  'Bocor data rahasia pelanggan (UU PDP)',
];

interface ClauseHeaderHoverSearchProps {
  clause: LegalClause;
  clauseIndex: number;
  library: ClauseLibraryItem[];
  onUpdateTitle: (newTitle: string) => void;
  onReplaceClauseWithLibraryItem: (
    targetClauseId: string,
    snippet: ClauseLibraryItem
  ) => void;
  onInsertLibraryItemAfterClause: (
    afterIndex: number,
    snippet: ClauseLibraryItem
  ) => void;
  isSummaryExpanded?: boolean;
  onTogglePlainSummary?: () => void;
}

export const ClauseHeaderHoverSearch: React.FC<
  ClauseHeaderHoverSearchProps
> = ({
  clause,
  clauseIndex,
  library,
  onUpdateTitle,
  onReplaceClauseWithLibraryItem,
  onInsertLibraryItemAfterClause,
  isSummaryExpanded = false,
  onTogglePlainSummary,
}) => {
  const [isHoveredOrPinned, setIsHoveredOrPinned] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const hoverTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPlaceholderClause =
    /ketentuan tambahan|placeholder|judul pasal|pasal baru/i.test(clause.title);
  const hasPlainSummary = Boolean(
    clause.plainSummary && clause.plainSummary.trim().length > 0
  );

  const results = useMemo(
    () => searchClauseLibraryNaturalLanguage(nlQuery, library),
    [nlQuery, library]
  );

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoveredOrPinned(true);
  };

  const handleMouseLeave = () => {
    if (isPinnedOpen) return;
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHoveredOrPinned(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative text-center space-y-1 group/pasalheader"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pasal Number Badge + Hover Trigger Hint + AI Plain Language Summary Status Indicator */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2">
        <span
          onClick={() => {
            setIsPinnedOpen((prev) => !prev);
            setIsHoveredOrPinned(true);
            setTimeout(() => inputRef.current?.focus(), 60);
          }}
          title="Arahkan kursor (hover) atau klik untuk mencari & mengganti pasal dari Pustaka Klausul Standar"
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            isPlaceholderClause
              ? 'bg-[#EFF6FF] text-[#1E3A8A] border border-dashed border-[#93C5FD]'
              : 'text-[#18181B] hover:bg-[#FAF9F6] border border-transparent hover:border-[#D6D0C4]'
          }`}
        >
          <span>{clause.number}</span>
          <span className="no-print inline-flex items-center gap-1 text-[10px] font-ui font-semibold normal-case text-[#1E3A8A] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE] opacity-80 group-hover/pasalheader:opacity-100 transition-opacity">
            <Search className="w-2.5 h-2.5" />
            <span>Pustaka Klausul</span>
          </span>
        </span>
      </div>

      {/* Editable Formal Clause Title with AI Plain-Language Status Indicator Badge */}
      <div className="relative flex items-center justify-center gap-2">
        <input
          type="text"
          value={clause.title}
          placeholder="KETIK JUDUL PASAL ATAU ARAHKAN KURSOR UNTUK CARI DI PUSTAKA KLAUSUL..."
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="w-full text-center text-base font-bold uppercase tracking-wide text-[#18181B] bg-transparent border-b border-transparent hover:border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
        />

        {hasPlainSummary && (
          <div className="no-print relative group/ai-badge shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlainSummary?.();
              }}
              aria-label={`Indikator Status Ringkasan AI Plain Language untuk ${clause.number}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-ui font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-2xs ${
                isSummaryExpanded
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] ring-2 ring-[#93C5FD]'
                  : 'bg-amber-50 text-[#1E3A8A] border-amber-300 hover:bg-[#EFF6FF] hover:border-[#93C5FD]'
              }`}
              title={`Pasal ini sudah memiliki ringkasan bahasa sederhana (Plain Language AI): "${clause.plainSummary}" — Klik untuk membuka/menutup ringkasan`}
            >
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
              <span>AI</span>
              <span className="hidden sm:inline text-[9.5px] font-semibold normal-case opacity-90">
                · Ringkasan
              </span>
            </button>

            {/* Instant Hover Tooltip Preview of the AI Plain Language Summary */}
            <div className="pointer-events-none opacity-0 group-hover/ai-badge:opacity-100 transition-opacity duration-150 absolute right-0 bottom-full mb-2 w-72 sm:w-80 p-2.5 bg-[#0F172A] text-white text-[11px] font-ui leading-relaxed rounded-md shadow-xl border border-slate-700 z-50 text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />
                <span>Disederhanakan oleh AI (Plain Language)</span>
              </div>
              <p className="text-slate-100 font-normal">{clause.plainSummary}</p>
              <div className="text-[9.5px] text-slate-300 mt-1">
                Klik indikator &ldquo;AI&rdquo; ini untuk menampilkan/menyembunyikan kotak ringkasan di bawah judul pasal.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Natural Language Search Popover across Pustaka Klausul Standar */}
      {(isHoveredOrPinned || isPinnedOpen) && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="no-print absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-full max-w-xl bg-white border border-[#1E3A8A]/40 rounded-md shadow-2xl z-40 text-left font-ui overflow-hidden"
        >
          {/* Popover Header */}
          <div className="px-3.5 py-2.5 bg-[#0F172A] text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Pencarian Bahasa Alami · Pustaka Klausul Standar ({clause.number})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPinnedOpen(false);
                setIsHoveredOrPinned(false);
              }}
              className="text-slate-300 hover:text-white p-0.5 cursor-pointer"
              title="Tutup pencarian pustaka"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="p-3 bg-[#FAF9F6] border-b border-[#E5E0D8] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#57534E] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={nlQuery}
                onFocus={() => setIsPinnedOpen(true)}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ketik kebutuhan dalam bahasa sehari-hari (mis: 'kalau ada bencana alam', 'putus kontrak sepihak', 'denda telat')..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A] text-[#18181B]"
              />
              {nlQuery && (
                <button
                  type="button"
                  onClick={() => setNlQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#18181B]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Natural Language Query Chips */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-semibold text-[#57534E] mr-0.5">
                Contoh cepat:
              </span>
              {NATURAL_SEARCH_EXAMPLES.slice(0, 4).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setIsPinnedOpen(true);
                    setNlQuery(ex);
                  }}
                  className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                    nlQuery === ex
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                      : 'bg-white text-[#57534E] border-[#E5E0D8] hover:border-[#1E3A8A]'
                  }`}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>

          {/* Matching Library Clauses List with Instant Replace & Insert Actions */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#F0ECE3] bg-white">
            {results.slice(0, 5).map(({ item, matchReason }) => (
              <div
                key={item.id}
                className="p-3 hover:bg-[#FAF9F6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#18181B]">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-semibold text-[#1E3A8A]">
                      · {item.legalBasis}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3F3F46] leading-snug">
                    {item.summary}
                  </p>
                  {nlQuery.trim() && (
                    <div className="text-[10px] font-medium text-emerald-700 flex items-center gap-1 pt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{matchReason}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onReplaceClauseWithLibraryItem(clause.id, item);
                      setIsPinnedOpen(false);
                      setIsHoveredOrPinned(false);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer whitespace-nowrap"
                    title={`Ganti isi ${clause.number} dengan klausul standar ini`}
                  >
                    <Replace className="w-3 h-3" />
                    <span>Ganti {clause.number}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertLibraryItemAfterClause(clauseIndex, item);
                      setIsPinnedOpen(false);
                      setIsHoveredOrPinned(false);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer whitespace-nowrap"
                    title={`Sisipkan sebagai Pasal ${clauseIndex + 2} tepat setelah ${clause.number}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Sisipkan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PasalPlaceholderHoverCardProps {
  nextClauseNumber: number;
  lastClause?: LegalClause;
  library: ClauseLibraryItem[];
  onInsertLibraryClause: (snippet: ClauseLibraryItem) => void;
  onReplaceLastClause?: (targetClauseId: string, snippet: ClauseLibraryItem) => void;
}

export const PasalPlaceholderHoverCard: React.FC<
  PasalPlaceholderHoverCardProps
> = ({
  nextClauseNumber,
  lastClause,
  library,
  onInsertLibraryClause,
  onReplaceLastClause,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [nlQuery, setNlQuery] = useState('');

  const results = useMemo(
    () => searchClauseLibraryNaturalLanguage(nlQuery, library),
    [nlQuery, library]
  );

  const showSearch = isHovered || isPinned || Boolean(nlQuery.trim());

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isPinned && !nlQuery.trim()) setIsHovered(false);
      }}
      className={`no-print p-4 rounded-md border-2 border-dashed transition-all font-ui ${
        showSearch
          ? 'bg-white border-[#1E3A8A] shadow-md'
          : 'bg-[#FAF9F6]/70 border-[#D6D0C4] hover:border-[#1E3A8A]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-code font-bold uppercase bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded">
            Placeholder Pasal {nextClauseNumber}
          </span>
          <span className="text-xs font-semibold text-[#18181B]">
            Arahkan Kursor (Hover) untuk Pencarian Bahasa Alami di Pustaka Klausul Standar
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsPinned((prev) => !prev)}
          className="text-[11px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
        >
          {showSearch ? (isPinned ? 'Sematkan Aktif' : 'Sematkan Panel') : 'Buka Pencarian'}
        </button>
      </div>

      {!showSearch ? (
        <p className="text-[11px] text-[#57534E] mt-1">
          Arahkan kursor ke placeholder Pasal ini untuk mencari klausul menggunakan kalimat sehari-hari (contoh: <em>"kalau ada bencana alam"</em>, <em>"putus kontrak sepihak"</em>, <em>"denda keterlambatan"</em>) lalu sisipkan atau ganti pasal secara instan.
        </p>
      ) : (
        <div className="mt-3 space-y-3 pt-2.5 border-t border-[#E5E0D8]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nlQuery}
              onFocus={() => setIsPinned(true)}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="Cari klausul dengan bahasa alami (mis: 'biar bisa putus kontrak tanpa pengadilan', 'jangan bajak karyawan')..."
              className="w-full pl-8 pr-8 py-2 text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A] focus:bg-white text-[#18181B]"
            />
            {nlQuery && (
              <button
                type="button"
                onClick={() => setNlQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#18181B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] font-semibold text-[#57534E]">
              Coba pencarian bahasa alami:
            </span>
            {NATURAL_SEARCH_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setIsPinned(true);
                  setNlQuery(ex);
                }}
                className={`px-2 py-0.5 text-[10.5px] rounded border transition-colors cursor-pointer ${
                  nlQuery === ex
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-[#FAF9F6] text-[#57534E] border-[#E5E0D8] hover:border-[#1E3A8A]'
                }`}
              >
                "{ex}"
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
            {results.slice(0, 4).map(({ item, matchReason }) => (
              <div
                key={item.id}
                className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#18181B]">
                    {item.title}{' '}
                    <span className="font-normal text-[#57534E]">
                      · {item.legalBasis}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3F3F46] leading-snug">
                    {item.summary}
                  </p>
                  <div className="text-[10px] font-medium text-[#1E3A8A]">
                    {matchReason}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {lastClause && onReplaceLastClause && (
                    <button
                      type="button"
                      onClick={() => onReplaceLastClause(lastClause.id, item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#18181B] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer whitespace-nowrap"
                      title={`Ganti ${lastClause.number} dengan klausul ini`}
                    >
                      <Replace className="w-3 h-3 text-[#1E3A8A]" />
                      <span>Ganti {lastClause.number}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onInsertLibraryClause(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-3 h-3" />
                    <span>Sisipkan Jadi Pasal {nextClauseNumber}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
