import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Plus,
  Sparkles,
  Star,
  Pin,
  Trash2,
} from 'lucide-react';
import {
  RegulationSearchResult,
  PinnedRegulation,
  RegulationSearchHistoryItem,
} from '../types/legal';
import { FormattedLegalText } from './FormattedLegalText';

interface RegulationSearchPanelProps {
  documentTitle: string;
  onConvertRegulationToClause: (instruction: string) => void;
  isAddingClause: boolean;
  onNotify?: (message: string) => void;
  searchHistory?: RegulationSearchHistoryItem[];
  onRecordSearch?: (query: string, answerSummary?: string) => void;
}

const PINNED_STORAGE_KEY = 'klausa_studio_pinned_regulations_v1';

const DEFAULT_PINNED_REGULATIONS: PinnedRegulation[] = [
  {
    id: 'pin-kuhper-1266',
    title: 'Pengenyampingan Putusan Pengadilan saat Pemutusan Kontrak',
    referenceNumber: 'Pasal 1266 & Pasal 1267 KUHPerdata',
    category: 'Hukum Perikatan',
    summary:
      'Memungkinkan pengakhiran perjanjian secara sepihak melalui pemberitahuan tertulis apabila terjadi wanprestasi tanpa perlu menunggu putusan hakim Pengadilan Negeri.',
    clausePrompt:
      'Tambahkan pasal Pengakhiran Perjanjian yang memuat klausul pengenyampingan Pasal 1266 dan Pasal 1267 KUHPerdata secara tegas.',
    sourceUri: 'https://peraturan.bpk.go.id',
    pinnedAt: 'Tersemat',
  },
  {
    id: 'pin-uu-pdp-2022',
    title: 'Kepatuhan Pelindungan Data Pribadi & Notifikasi Insiden',
    referenceNumber: 'UU No. 27 Tahun 2022 (UU PDP)',
    category: 'Kepatuhan Data',
    summary:
      'Mewajibkan Pengendali dan Prosesor Data Pribadi menjaga kerahasiaan data subjek serta memberikan pemberitahuan tertulis maksimal 3x24 jam jika terjadi kebocoran data.',
    clausePrompt:
      'Tambahkan pasal Pelindungan Data Pribadi sesuai UU Nomor 27 Tahun 2022 dengan kewajiban pemberitahuan insiden kebocoran data selambat-lambatnya 3x24 jam.',
    sourceUri: 'https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022',
    pinnedAt: 'Tersemat',
  },
  {
    id: 'pin-pp-35-2021',
    title: 'Ketentuan Kontrak PKWT & Uang Kompensasi Berakhirnya Kontrak',
    referenceNumber: 'Pasal 15 & 16 PP No. 35 Tahun 2021',
    category: 'Ketenagakerjaan',
    summary:
      'Mengatur larangan masa percobaan (probation) pada PKWT serta kewajiban pengusaha membayar Uang Kompensasi proporsional saat kontrak berakhir.',
    clausePrompt:
      'Tambahkan pasal Uang Kompensasi berakhirnya PKWT sesuai Pasal 15 dan Pasal 16 Peraturan Pemerintah Nomor 35 Tahun 2021 beserta larangan masa percobaan.',
    sourceUri: 'https://peraturan.bpk.go.id/Details/161904/pp-no-35-tahun-2021',
    pinnedAt: 'Tersemat',
  },
];

const POPULAR_REGULATION_CATALOG = [
  {
    query: 'Syarat sah perjanjian Pasal 1320 & Pasal 1338 KUHPerdata',
    referenceNumber: 'Pasal 1320 & 1338 KUHPerdata',
    category: 'Prinsip Kontrak',
    summary:
      'Mengatur 4 syarat keabsahan kontrak serta asas Pacta Sunt Servanda bahwa perjanjian yang sah berlaku sebagai undang-undang bagi pembuatnya.',
  },
  {
    query: 'Aturan PKWT & Uang Kompensasi PP No. 35 Tahun 2021',
    referenceNumber: 'Pasal 15 & 16 PP No. 35 Tahun 2021',
    category: 'Ketenagakerjaan',
    summary:
      'Mengatur jangka waktu PKWT, larangan probation, dan perhitungan Uang Kompensasi.',
  },
  {
    query: 'Kewajiban & sanksi UU Pelindungan Data Pribadi No. 27 Tahun 2022',
    referenceNumber: 'UU No. 27 Tahun 2022 (UU PDP)',
    category: 'Kepatuhan Data',
    summary:
      'Kewajiban keamanan pemrosesan data pribadi dan pelaporan kebocoran data 3x24 jam.',
  },
  {
    query: 'Pengenyampingan Pasal 1266 & 1267 KUHPerdata pemutusan kontrak',
    referenceNumber: 'Pasal 1266 & Pasal 1267 KUHPerdata',
    category: 'Hukum Perikatan',
    summary:
      'Pengesampingan syarat batal pengadilan untuk efektivitas pengakhiran kontrak komersial.',
  },
  {
    query: 'UU Hak Cipta No. 28 Tahun 2014 peralihan HKI perangkat lunak',
    referenceNumber: 'UU No. 28 Tahun 2014 tentang Hak Cipta',
    category: 'Kekayaan Intelektual',
    summary:
      'Mengatur hak moral dan pengalihan tertulis hak ekonomi atas karya cipta, kode sumber, serta desain.',
  },
];

export const RegulationSearchPanel: React.FC<RegulationSearchPanelProps> = ({
  documentTitle,
  onConvertRegulationToClause,
  isAddingClause,
  onNotify,
  searchHistory = [],
  onRecordSearch,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<RegulationSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pinnedRegulations, setPinnedRegulations] = useState<PinnedRegulation[]>(() => {
    try {
      const saved = localStorage.getItem(PINNED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_PINNED_REGULATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedRegulations));
    } catch {
      // ignore storage errors
    }
  }, [pinnedRegulations]);

  const isRegulationPinned = (titleOrRef: string): boolean => {
    const target = titleOrRef.trim().toLowerCase();
    return pinnedRegulations.some(
      (item) =>
        item.title.toLowerCase() === target ||
        item.referenceNumber.toLowerCase() === target ||
        target.includes(item.referenceNumber.toLowerCase())
    );
  };

  const handleTogglePinFromResult = (searchResult: RegulationSearchResult) => {
    const targetKey = searchResult.query.trim();
    const existing = pinnedRegulations.find(
      (p) => p.title.toLowerCase() === targetKey.toLowerCase()
    );

    if (existing) {
      setPinnedRegulations((prev) => prev.filter((p) => p.id !== existing.id));
      onNotify?.(`"${existing.title}" dihapus dari Pinned Regulations.`);
      return;
    }

    const firstParagraph =
      searchResult.answer
        .split('\n')
        .map((l) => l.replace(/^[0-9#*>-]+\s*/, '').trim())
        .find((l) => l.length > 35) ||
      `Ketentuan hukum dan dasar regulasi terkait ${targetKey}.`;

    const newPin: PinnedRegulation = {
      id: `pin-${Date.now()}`,
      title: targetKey,
      referenceNumber: targetKey.slice(0, 48),
      category: 'Regulasi Tersimpan',
      summary: firstParagraph.slice(0, 200),
      clausePrompt: `Susun pasal kontrak yang menerapkan ketentuan hukum "${targetKey}" sesuai peraturan Indonesia yang berlaku.`,
      sourceUri: searchResult.sources?.[0]?.uri || 'https://peraturan.bpk.go.id',
      pinnedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      }),
    };

    setPinnedRegulations((prev) => [newPin, ...prev]);
    onNotify?.(`"${newPin.title}" ditambahkan ke Pinned Regulations.`);
  };

  const handleTogglePinCatalogItem = (item: (typeof POPULAR_REGULATION_CATALOG)[0]) => {
    const existing = pinnedRegulations.find(
      (p) =>
        p.referenceNumber.toLowerCase() === item.referenceNumber.toLowerCase() ||
        p.title.toLowerCase() === item.query.toLowerCase()
    );

    if (existing) {
      setPinnedRegulations((prev) => prev.filter((p) => p.id !== existing.id));
      onNotify?.(`"${item.referenceNumber}" dihapus dari Pinned Regulations.`);
    } else {
      const newPin: PinnedRegulation = {
        id: `pin-cat-${Date.now()}`,
        title: item.query,
        referenceNumber: item.referenceNumber,
        category: item.category,
        summary: item.summary,
        clausePrompt: `Susun pasal kontrak yang menerapkan ketentuan hukum "${item.query}" (${item.referenceNumber}) sesuai peraturan Indonesia yang berlaku.`,
        sourceUri: 'https://peraturan.bpk.go.id',
        pinnedAt: 'Favorit',
      };
      setPinnedRegulations((prev) => [newPin, ...prev]);
      onNotify?.(`"${item.referenceNumber}" disimpan ke Pinned Regulations.`);
    }
  };

  const handleRemovePin = (id: string, title: string) => {
    setPinnedRegulations((prev) => prev.filter((p) => p.id !== id));
    onNotify?.(`"${title}" dihapus dari Pinned Regulations.`);
  };

  const handleSearch = async (customQuery?: string) => {
    const q = (customQuery ?? query).trim();
    if (!q || isSearching) return;

    if (customQuery) setQuery(customQuery);
    setIsSearching(true);
    setError(null);
    onRecordSearch?.(q);

    try {
      const response = await fetch('/api/legal/search-regulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          documentTitle,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mencari pasal dan peraturan.');
      }

      const answerStr = data.answer || '';
      onRecordSearch?.(data.query || q, answerStr);

      setResult({
        query: data.query || q,
        answer: answerStr,
        sources: Array.isArray(data.sources) ? data.sources : [],
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari peraturan.');
    } finally {
      setIsSearching(false);
    }
  };

  const isCurrentResultPinned = result
    ? pinnedRegulations.some((p) => p.title.toLowerCase() === result.query.toLowerCase())
    : false;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>Pencarian Pasal & Peraturan RI (Google & JDIH)</span>
        </h3>
      </div>

      <p className="text-[11px] text-[#57534E] leading-relaxed">
        Telusuri bunyi pasal KUHPerdata, UU, dan PP dari Google & portal pemerintah, lalu <strong>Favoritkan (Pin)</strong> regulasi penting untuk disisipkan cepat ke kontrak mendatang.
      </p>

      {/* DEDICATED PINNED REGULATIONS SECTION (FAVORITED LAWS FOR FAST INSERTION) */}
      <div className="p-3 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>
              Pinned Regulations · Favorit (
              <span className="font-code tabular-nums">{pinnedRegulations.length}</span>)
            </span>
          </div>
          <span className="text-[10px] text-[#57534E]">Siap Pakai Lintas Kontrak</span>
        </div>

        {pinnedRegulations.length === 0 ? (
          <div className="p-2.5 bg-white border border-[#E5E0D8] rounded text-[11px] text-[#57534E] text-center">
            Belum ada UU/Pasal yang difavoritkan. Klik ikon bintang pada hasil pencarian atau daftar topik di bawah untuk menyematkan regulasi.
          </div>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-0.5">
            {pinnedRegulations.map((pinItem) => (
              <div
                key={pinItem.id}
                className="p-2.5 bg-white border border-[#E5E0D8] hover:border-[#D6D0C4] rounded-md space-y-1.5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#18181B] leading-snug">
                      {pinItem.title}
                    </div>
                    <div className="text-[10.5px] text-[#57534E] mt-0.5">
                      <span className="font-medium text-[#1E3A8A]">
                        {pinItem.referenceNumber}
                      </span>
                      <span className="mx-1">·</span>
                      <span>{pinItem.category}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePin(pinItem.id, pinItem.referenceNumber)}
                    title="Hapus dari Pinned Regulations"
                    className="p-1 text-amber-500 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[11px] text-[#3F3F46] leading-snug line-clamp-2">
                  {pinItem.summary}
                </p>

                <div className="pt-1 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    disabled={isAddingClause}
                    onClick={() => onConvertRegulationToClause(pinItem.clausePrompt)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 rounded transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    <span>
                      {isAddingClause ? 'Menyisipkan...' : 'Sisipkan ke Kontrak'}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isSearching}
                    onClick={() => handleSearch(pinItem.title)}
                    className="px-2 py-1 text-[11px] font-medium text-[#57534E] hover:text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#E5E0D8] rounded transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEARCH FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="space-y-2"
      >
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik UU, PP, atau Pasal (mis. PP 35 Tahun 2021)..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isSearching ? 'Mencari di Google & Portal Pemerintah...' : 'Cari Pasal & Regulasi'}
          </span>
        </button>
      </form>

      {/* Quick Preset Queries with 1-Click Favorite Star */}
      {searchHistory.length > 0 && (
        <div
          data-testid="regulation-search-history-list"
          className="p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-1.5"
        >
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#18181B]">
            <span>Riwayat &lsquo;Cari Pasal &amp; UU&rsquo; (Dipetakan ke Compliance Heatmap):</span>
            <span className="font-code text-[#1E3A8A]">{searchHistory.length} UU</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {searchHistory.slice(0, 5).map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => handleSearch(h.query)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-[#EFF6FF] text-[#1E3A8A] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
                title={`${h.query} (${h.searchedAt})`}
              >
                {h.shortLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <span className="text-[10px] font-medium text-[#57534E]">
          Katalog Regulasi Populer (Klik untuk mencari atau ★ untuk sematkan):
        </span>
        <div className="space-y-1">
          {POPULAR_REGULATION_CATALOG.map((item) => {
            const pinned = isRegulationPinned(item.referenceNumber);
            return (
              <div
                key={item.query}
                className="flex items-center justify-between gap-1.5 p-1.5 bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#E5E0D8] rounded transition-colors"
              >
                <button
                  type="button"
                  disabled={isSearching}
                  onClick={() => handleSearch(item.query)}
                  className="text-[11px] text-left text-[#57534E] hover:text-[#1E3A8A] flex-1 truncate cursor-pointer"
                >
                  {item.query}
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePinCatalogItem(item)}
                  title={pinned ? 'Hapus dari Pinned Regulations' : 'Sematkan ke Pinned Regulations'}
                  className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                    pinned
                      ? 'text-amber-500 hover:text-amber-600'
                      : 'text-[#A8A29E] hover:text-amber-500'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={pinned ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Search Result Display with Favorite / Pin Toggle */}
      {result && (
        <div className="p-3 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md space-y-2.5 max-h-[420px] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5E0D8]">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#18181B] truncate">{result.query}</div>
              <div className="text-[10px] font-code text-[#57534E]">{result.timestamp} WIB</div>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePinFromResult(result)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                isCurrentResultPinned
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-[#D6D0C4] text-[#18181B] hover:border-[#1E3A8A]'
              }`}
            >
              <Star
                className={`w-3 h-3 ${isCurrentResultPinned ? 'text-amber-500' : 'text-[#57534E]'}`}
                fill={isCurrentResultPinned ? 'currentColor' : 'none'}
              />
              <span>{isCurrentResultPinned ? 'Tersemat' : 'Favoritkan'}</span>
            </button>
          </div>

          <FormattedLegalText
            text={result.answer}
            className="text-xs text-[#18181B]"
          />

          {/* Grounding Sources from Google & Government Portals */}
          {result.sources.length > 0 && (
            <div className="pt-2 border-t border-[#E5E0D8] space-y-1.5">
              <div className="text-[11px] font-semibold text-[#18181B]">
                Sumber Referensi Google & Situs Pemerintah ({result.sources.length}):
              </div>
              <div className="space-y-1">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-1.5 bg-white hover:bg-[#F2EFE9] border border-[#E5E0D8] rounded text-[11px] text-[#1E3A8A] transition-colors"
                  >
                    <span className="truncate font-medium">{src.title || src.uri}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action to turn regulation into a contract clause */}
          <div className="pt-2 border-t border-[#E5E0D8]">
            <button
              type="button"
              disabled={isAddingClause}
              onClick={() =>
                onConvertRegulationToClause(
                  `Susun pasal kontrak yang menerapkan ketentuan hukum "${result.query}" sesuai peraturan Indonesia yang berlaku.`
                )
              }
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-white border border-[#1E3A8A] rounded hover:bg-[#1E3A8A] hover:text-white disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isAddingClause ? 'Menyusun Pasal...' : 'Jadikan Pasal di Dokumen Aktif'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
