import {
  DocumentSectionOption,
  LegalDocument,
  LegalGlossaryItem,
  RegulationSearchHistoryItem,
} from '../types/legal';

export const REGULATION_SEARCH_HISTORY_KEY =
  'klausa_studio_regulation_search_history_v1';

export const DEFAULT_REGULATION_SEARCH_HISTORY: RegulationSearchHistoryItem[] = [
  {
    id: 'hist-uu-pdp-27-2022',
    query: 'Kewajiban & sanksi UU Pelindungan Data Pribadi No. 27 Tahun 2022',
    referenceNumber: 'UU No. 27 Tahun 2022 (UU PDP)',
    shortLabel: 'UU PDP 27/2022',
    category: 'Kepatuhan Data & Privasi',
    searchedAt: 'Riwayat Cari UU · Baru saja',
    summary:
      'Mewajibkan pemrosesan data pribadi secara sah, pengamanan teknis, serta notifikasi tertulis maksimal 3x24 jam atas kegagalan pelindungan data.',
    keywords: [
      'data',
      'pribadi',
      'rahasia',
      'kerahasiaan',
      'informasi',
      'kebocoran',
      'notifikasi',
      '3x24',
      'privasi',
      'elektronik',
      'sistem',
    ],
  },
  {
    id: 'hist-kuhper-1266-1267',
    query: 'Pengenyampingan Pasal 1266 & 1267 KUHPerdata pemutusan kontrak',
    referenceNumber: 'Pasal 1266 & 1267 KUHPerdata',
    shortLabel: 'Psl 1266/1267 KUHPer',
    category: 'Pemutusan & Wanprestasi',
    searchedAt: 'Riwayat Cari UU · 15 mnt lalu',
    summary:
      'Pengesampingan putusan hakim pengadilan negeri agar pengakhiran perjanjian secara sepihak saat wanprestasi berlaku efektif seketika.',
    keywords: [
      'pengakhiran',
      'pemutusan',
      'berakhir',
      'sepihak',
      '1266',
      '1267',
      'wanprestasi',
      'cidera janji',
      'kelalaian',
      'batal',
    ],
  },
  {
    id: 'hist-kuhper-1320-1338',
    query: 'Syarat sah perjanjian Pasal 1320 & Pasal 1338 KUHPerdata',
    referenceNumber: 'Pasal 1320 & 1338 KUHPerdata',
    shortLabel: 'Psl 1320/1338 KUHPer',
    category: 'Keabsahan & Ruang Lingkup',
    searchedAt: 'Riwayat Cari UU · 1 jam lalu',
    summary:
      'Empat syarat keabsahan perjanjian (kesepakatan, kecakapan, objek tertentu, kausa halal) dan asas Pacta Sunt Servanda.',
    keywords: [
      'ruang lingkup',
      'definisi',
      'objek',
      'hak',
      'kewajiban',
      'sepakat',
      'mengikat',
      'itikad baik',
      '1320',
      '1338',
      'ketentuan',
    ],
  },
  {
    id: 'hist-uu-hc-28-2014',
    query: 'UU Hak Cipta No. 28 Tahun 2014 peralihan HKI & Lisensi Karya',
    referenceNumber: 'UU No. 28 Tahun 2014 (Hak Cipta)',
    shortLabel: 'UU Hak Cipta 28/2014',
    category: 'Kekayaan Intelektual',
    searchedAt: 'Riwayat Cari UU · Hari ini',
    summary:
      'Mengatur hak ekonomi dan hak moral pencipta, peralihan tertulis Hak Kekayaan Intelektual, kode sumber, desain, dan hasil pekerjaan.',
    keywords: [
      'kekayaan intelektual',
      'hki',
      'hak cipta',
      'kode sumber',
      'source code',
      'lisensi',
      'karya',
      'desain',
      'kepemilikan',
      'merek',
    ],
  },
  {
    id: 'hist-pp-35-2021-ketenagakerjaan',
    query: 'Aturan PKWT, Alih Daya & Kompensasi PP No. 35 Tahun 2021',
    referenceNumber: 'PP No. 35 Tahun 2021 & UU Cipta Kerja',
    shortLabel: 'PP 35/2021 (Kerja/Jasa)',
    category: 'Ketenagakerjaan & Jasa',
    searchedAt: 'Riwayat Cari UU · Hari ini',
    summary:
      'Mengatur standar pelaksanaan kerja, kompensasi berakhirnya kontrak waktu tertentu, serta perlindungan tenaga pelaksana.',
    keywords: [
      'tenaga',
      'kerja',
      'jasa',
      'personel',
      'kompensasi',
      'upah',
      'honorarium',
      'pembayaran',
      'biaya',
      'termin',
      'jadwal',
    ],
  },
  {
    id: 'hist-uu-30-1999-arbitrase',
    query: 'Penyelesaian Sengketa BANI & Mediasi UU No. 30 Tahun 1999',
    referenceNumber: 'UU No. 30 Tahun 1999 (Arbitrase & APS)',
    shortLabel: 'UU 30/1999 Arbitrase',
    category: 'Penyelesaian Sengketa',
    searchedAt: 'Riwayat Cari UU · Kemarin',
    summary:
      'Mengatur klausul pilihan forum penyelesaian sengketa melalui musyawarah mufakat, mediasi, BANI, atau domisili Pengadilan Negeri.',
    keywords: [
      'sengketa',
      'perselisihan',
      'musyawarah',
      'arbitrase',
      'bani',
      'pengadilan',
      'hukum',
      'domisili',
      'yurisdiksi',
      'mediasi',
    ],
  },
];

export function loadRegulationSearchHistory(): RegulationSearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(REGULATION_SEARCH_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_REGULATION_SEARCH_HISTORY;
}

export function recordRegulationSearchToHistory(
  query: string,
  answerSummary?: string
): RegulationSearchHistoryItem[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) return loadRegulationSearchHistory();

  const current = loadRegulationSearchHistory();
  const qLower = cleanQuery.toLowerCase();

  // Derive concise regulation reference & keywords from query
  let referenceNumber = cleanQuery.slice(0, 42);
  let shortLabel = cleanQuery.slice(0, 22);
  let category = 'Regulasi Pencarian';

  if (/27\s*tahun\s*2022|pdp|data pribadi/i.test(cleanQuery)) {
    referenceNumber = 'UU No. 27 Tahun 2022 (UU PDP)';
    shortLabel = 'UU PDP 27/2022';
    category = 'Kepatuhan Data & Privasi';
  } else if (/1266|1267/i.test(cleanQuery)) {
    referenceNumber = 'Pasal 1266 & 1267 KUHPerdata';
    shortLabel = 'Psl 1266/1267 KUHPer';
    category = 'Pemutusan & Wanprestasi';
  } else if (/1320|1338/i.test(cleanQuery)) {
    referenceNumber = 'Pasal 1320 & 1338 KUHPerdata';
    shortLabel = 'Psl 1320/1338 KUHPer';
    category = 'Keabsahan & Perikatan';
  } else if (/35\s*tahun\s*2021|pkwt|kompensasi/i.test(cleanQuery)) {
    referenceNumber = 'PP No. 35 Tahun 2021';
    shortLabel = 'PP 35/2021 PKWT';
    category = 'Ketenagakerjaan';
  } else if (/28\s*tahun\s*2014|hak cipta|hki/i.test(cleanQuery)) {
    referenceNumber = 'UU No. 28 Tahun 2014 (Hak Cipta)';
    shortLabel = 'UU Hak Cipta 28/2014';
    category = 'Kekayaan Intelektual';
  } else if (/30\s*tahun\s*1999|arbitrase|bani|sengketa/i.test(cleanQuery)) {
    referenceNumber = 'UU No. 30 Tahun 1999 (Arbitrase)';
    shortLabel = 'UU 30/1999 Arbitrase';
    category = 'Penyelesaian Sengketa';
  } else if (/1243|1244|1245|kahar|force majeure|ganti rugi/i.test(cleanQuery)) {
    referenceNumber = 'Pasal 1243–1245 KUHPerdata';
    shortLabel = 'Psl 1243-1245 KUHPer';
    category = 'Ganti Rugi & Kahar';
  } else if (/uu\s*no\.?\s*\d+|pasal\s*\d+|pp\s*no\.?\s*\d+/i.test(cleanQuery)) {
    const m = cleanQuery.match(
      /((?:UU|PP|Perpres|Permen|Pasal)\s*(?:No\.?|Nomor)?\s*\d+(?:\s*Tahun\s*\d{4}|\s*KUHPerdata)?)/i
    );
    if (m) {
      referenceNumber = m[1].trim();
      shortLabel = m[1].trim().slice(0, 22);
    }
  }

  const rawKeywords = cleanQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length >= 3 &&
        !['dan', 'yang', 'atau', 'untuk', 'pada', 'dalam', 'tentang', 'nomor', 'tahun'].includes(
          w
        )
    );

  const timeStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const newItem: RegulationSearchHistoryItem = {
    id: `hist-${Date.now()}`,
    query: cleanQuery,
    referenceNumber,
    shortLabel,
    category,
    searchedAt: `Dicari ${timeStr} WIB`,
    summary:
      answerSummary?.slice(0, 180) ||
      `Hasil penelusuran aktif atas "${cleanQuery}" dari Cari Pasal & UU untuk audit keselarasan klausul dokumen.`,
    keywords: Array.from(new Set(rawKeywords)).slice(0, 10),
  };

  const deduplicated = [
    newItem,
    ...current.filter(
      (item) =>
        item.query.toLowerCase() !== qLower &&
        item.referenceNumber.toLowerCase() !== referenceNumber.toLowerCase()
    ),
  ].slice(0, 8);

  try {
    localStorage.setItem(REGULATION_SEARCH_HISTORY_KEY, JSON.stringify(deduplicated));
  } catch {
    // ignore storage errors
  }

  return deduplicated;
}

export function buildDocumentSectionsForGlossary(
  doc: LegalDocument
): DocumentSectionOption[] {
  const sections: DocumentSectionOption[] = [
    {
      id: 'sec-komparisi',
      label: `Komparisi · Identitas Para Pihak (${doc.partyOne.name} & ${doc.partyTwo.name})`,
      shortCode: 'Komparisi',
      sectionType: 'komparisi',
      text: `${doc.openingText}\nPihak Pertama: ${doc.partyOne.name} (${doc.partyOne.role}), ${doc.partyOne.representative}, ${doc.partyOne.address}. ${doc.partyOne.description}\nPihak Kedua: ${doc.partyTwo.name} (${doc.partyTwo.role}), ${doc.partyTwo.representative}, ${doc.partyTwo.address}. ${doc.partyTwo.description}`,
    },
    {
      id: 'sec-premis',
      label: `Premis / Konsiderans (${doc.recitals.length} Butir Latar Belakang Hukum)`,
      shortCode: 'Premis',
      sectionType: 'premis',
      text: doc.recitals.join('\n'),
    },
  ];

  doc.clauses.forEach((clause) => {
    sections.push({
      id: `sec-${clause.id}`,
      label: `${clause.number} · ${clause.title}`,
      shortCode: clause.number,
      sectionType: 'clause',
      text: `${clause.number} ${clause.title}\nDasar Hukum: ${clause.legalBasis}\n${clause.content.join('\n')}`,
    });
  });

  sections.push({
    id: 'sec-penutup',
    label: 'Bagian Penutup & Pengesahan Akta',
    shortCode: 'Penutup',
    sectionType: 'penutup',
    text: `${doc.closingText}\nLokasi Penandatanganan: ${doc.signingLocation}, Tanggal Efektif: ${doc.effectiveDate}, Yurisdiksi: ${doc.jurisdiction}`,
  });

  return sections;
}

interface DomainLegalTermPattern {
  term: string;
  category: string;
  legalReference: string;
  regex: RegExp;
  isCritical: boolean;
  baseDefinition: string;
  relatedConcepts: string[];
}

const DOMAIN_LEGAL_PATTERNS: DomainLegalTermPattern[] = [
  {
    term: 'Komparisi & Kecakapan Bertindak',
    category: 'Subjek & Kewenangan Hukum',
    legalReference: 'Pasal 1320 & Pasal 1330 KUHPerdata · UU No. 40 Tahun 2007',
    regex: /\b(komparisi|bertindak untuk dan atas nama|mewakili|berwenang|direktur|pihak pertama|pihak kedua|kecakapan)\b/i,
    isCritical: false,
    baseDefinition:
      'Bagian awal instrumen hukum yang menguraikan identitas para pihak serta dasar kewenangan hukum (persona standi in judicio / kapasitas perwakilan) untuk mengikatkan diri secara sah.',
    relatedConcepts: ['Pacta Sunt Servanda', 'Premis / Konsiderans', 'Subjek Hukum'],
  },
  {
    term: 'Premis (Konsiderans / Recitals)',
    category: 'Konstruksi Akta',
    legalReference: 'Pasal 1342–1351 KUHPerdata (Penafsiran Perjanjian)',
    regex: /\b(bahwa|premis|menerangkan terlebih dahulu|konsiderans|menimbang|mengingat)\b/i,
    isCritical: false,
    baseDefinition:
      'Pernyataan latar belakang fakta dan maksud awal para pihak sebelum memasuki pasal-pasal pokok yang menjadi pedoman utama penafsiran maksud perikatan apabila timbul multitafsir.',
    relatedConcepts: ['Komparisi & Kecakapan Bertindak', 'Asas Itikad Baik'],
  },
  {
    term: 'Pacta Sunt Servanda & Asas Mengikat',
    category: 'Asas Perikatan',
    legalReference: 'Pasal 1338 ayat (1) KUHPerdata',
    regex: /\b(mengikat|undang-undang bagi|pacta sunt servanda|tidak dapat ditarik kembali|kesepakatan bersama|berlaku efektif)\b/i,
    isCritical: false,
    baseDefinition:
      'Prinsip fundamental hukum perjanjian bahwa setiap kesepakatan yang dibuat secara sah berlaku sebagai undang-undang bagi para pihak yang menyepakatinya.',
    relatedConcepts: ['Asas Itikad Baik', 'Wanprestasi (Cidera Janji)'],
  },
  {
    term: 'Wanprestasi (Cidera Janji / Default)',
    category: 'Pelaksanaan & Sanksi',
    legalReference: 'Pasal 1238 & Pasal 1243 KUHPerdata',
    regex: /\b(wanprestasi|cidera janji|kelalaian|ingkar janji|melanggar kewajiban|keterlambatan|lalai)\b/i,
    isCritical: true,
    baseDefinition:
      'Keadaan di mana salah satu pihak tidak melaksanakan kewajiban kontraktualnya, terlambat memenuhi prestasi, atau melaksanakan tetapi tidak sesuai dengan spesifikasi yang disepakati.',
    relatedConcepts: [
      'Denda Keterlambatan (Liquidated Damages)',
      'Pengenyampingan Pasal 1266 & 1267 KUHPerdata',
      'Ganti Kerugian & Pembatasan Tanggung Jawab',
    ],
  },
  {
    term: 'Pengenyampingan Pasal 1266 & 1267 KUHPerdata',
    category: 'Pemutusan Perjanjian',
    legalReference: 'Pasal 1266 & Pasal 1267 KUHPerdata',
    regex: /\b(1266|1267|pengesampingan|mengesampingkan|pemutusan sepihak|pengakhiran perjanjian|tanpa putusan pengadilan)\b/i,
    isCritical: true,
    baseDefinition:
      'Klausul pengesampingan syarat batal melalui putusan hakim Pengadilan Negeri, sehingga pihak yang dirugikan berhak mengakhiri kontrak secara sepihak cukup dengan pemberitahuan tertulis.',
    relatedConcepts: ['Wanprestasi (Cidera Janji / Default)', 'Pemberitahuan Tertulis'],
  },
  {
    term: 'Keadaan Kahar (Force Majeure / Overmacht)',
    category: 'Pengecualian Tanggung Jawab',
    legalReference: 'Pasal 1244 & Pasal 1245 KUHPerdata',
    regex: /\b(kahar|force majeure|overmacht|bencana alam|di luar kendali|huru-hara|kebijakan pemerintah)\b/i,
    isCritical: true,
    baseDefinition:
      'Peristiwa tak terduga di luar kemampuan dan kendali wajar Para Pihak yang secara objektif menghalangi pemenuhan prestasi sehingga membebaskan debitur dari kewajiban ganti rugi selama keadaan tersebut berlangsung.',
    relatedConcepts: ['Wanprestasi (Cidera Janji / Default)', 'Ganti Kerugian & Pembatasan Tanggung Jawab'],
  },
  {
    term: 'Hak Kekayaan Intelektual (HKI) & Lisensi',
    category: 'Kepemilikan Aset Hukum',
    legalReference: 'UU No. 28 Tahun 2014 tentang Hak Cipta · UU Merek & Paten',
    regex: /\b(kekayaan intelektual|hki|hak cipta|source code|kode sumber|lisensi|karya cipta|merek|paten|hak ekonomi)\b/i,
    isCritical: true,
    baseDefinition:
      'Hak eksklusif atas karya intelektual, perangkat lunak, desain, atau dokumen kerja yang pengalihan kepemilikan maupun lisensinya wajib dinyatakan secara tegas dan tertulis di dalam perjanjian.',
    relatedConcepts: ['Informasi Rahasia (Confidentiality / NDA)', 'Serah Terima (BAST)'],
  },
  {
    term: 'Informasi Rahasia & Pelindungan Data Pribadi',
    category: 'Kepatuhan Data & Rahasia Dagang',
    legalReference: 'UU No. 27 Tahun 2022 (UU PDP) · UU No. 30 Tahun 2000',
    regex: /\b(rahasia|kerahasiaan|data pribadi|nda|kebocoran data|pengendali data|prosesor data|informasi sensitif)\b/i,
    isCritical: true,
    baseDefinition:
      'Kewajiban hukum menjaga kerahasiaan informasi komersial serta melindungi data pribadi subjek data sesuai standar keamanan teknis dan batas waktu notifikasi insiden UU PDP.',
    relatedConcepts: ['Hak Kekayaan Intelektual (HKI) & Lisensi', 'Ganti Kerugian & Pembatasan Tanggung Jawab'],
  },
  {
    term: 'Termin Pembayaran & Bukti Serah Terima (BAST)',
    category: 'Finansial & Operasional',
    legalReference: 'Pasal 1338 & Pasal 1457 KUHPerdata',
    regex: /\b(termin|pembayaran|harga|biaya|nilai kontrak|bast|berita acara serah terima|uang muka|dp|pelunasan|cicilan)\b/i,
    isCritical: true,
    baseDefinition:
      'Struktur tahapan pemenuhan pembayaran imbalan prestasi yang dikaitkan dengan ketercapaian milestone atau penandatanganan Berita Acara Serah Terima (BAST) yang sah.',
    relatedConcepts: ['Denda Keterlambatan (Liquidated Damages)', 'Pajak & Kewajiban Fiskal'],
  },
  {
    term: 'Denda Keterlambatan & Ganti Kerugian',
    category: 'Mitigasi Risiko Finansial',
    legalReference: 'Pasal 1246–1249 & Pasal 1304 KUHPerdata (Klausul Penalti)',
    regex: /\b(denda|penalti|ganti rugi|kerugian|kompensasi|1\s*per\s*mil|bunga|tuntutan|indemnifikasi|pembatasan tanggung jawab)\b/i,
    isCritical: true,
    baseDefinition:
      'Ketentuan kompensasi finansial terukur atas keterlambatan atau pelanggaran kewajiban, termasuk batas maksimum pertanggungjawaban hukum (limitation of liability) masing-masing pihak.',
    relatedConcepts: ['Wanprestasi (Cidera Janji / Default)', 'Termin Pembayaran & Bukti Serah Terima (BAST)'],
  },
  {
    term: 'Pilihan Hukum & Forum Penyelesaian Sengketa',
    category: 'Yurisdiksi & Litigasi',
    legalReference: 'UU No. 30 Tahun 1999 · Pasal 118 HIR (Kompetensi Relatif)',
    regex: /\b(sengketa|perselisihan|musyawarah|mufakat|arbitrase|bani|pengadilan negeri|domisili hukum|mediasi|yurisdiksi)\b/i,
    isCritical: false,
    baseDefinition:
      'Penunjukan hukum yang mengatur kontrak (governing law) serta mekanisme berjenjang penyelesaian perselisihan mulai dari musyawarah mufakat hingga forum arbitrase atau Pengadilan Negeri.',
    relatedConcepts: ['Pacta Sunt Servanda & Asas Mengikat', 'Wanprestasi (Cidera Janji / Default)'],
  },
  {
    term: 'Jaminan Hukum (Representations & Warranties)',
    category: 'Pernyataan & Jaminan',
    legalReference: 'Pasal 1338 ayat (3) & Pasal 1491 KUHPerdata',
    regex: /\b(menjamin|pernyataan dan jaminan|bebas dari sengketa|sitaan|agunan|jaminan|itikad baik|keabsahan)\b/i,
    isCritical: false,
    baseDefinition:
      'Pernyataan tegas dari masing-masing pihak mengenai kebenaran fakta hukum, kepemilikan sah atas objek, serta ketiadaan sengketa atau ikatan pihak ketiga yang dapat mengganggu pelaksanaan kontrak.',
    relatedConcepts: ['Komparisi & Kecakapan Bertindak', 'Denda Keterlambatan & Ganti Kerugian'],
  },
];

export function extractDomainGlossaryFromSections(
  doc: LegalDocument,
  selectedSections: DocumentSectionOption[],
  aiTerms?: Partial<LegalGlossaryItem>[]
): LegalGlossaryItem[] {
  const activeSections =
    selectedSections.length > 0
      ? selectedSections
      : buildDocumentSectionsForGlossary(doc);

  const results: LegalGlossaryItem[] = [];
  const usedTerms = new Set<string>();

  // 1. First incorporate any AI-extracted terms if returned by the server agent
  if (Array.isArray(aiTerms) && aiTerms.length > 0) {
    aiTerms.forEach((raw, idx) => {
      const termName = (raw.term || '').trim();
      if (!termName || usedTerms.has(termName.toLowerCase())) return;
      usedTerms.add(termName.toLowerCase());

      // Match against selected sections to verify locations and excerpts
      const matchedLocs: string[] = [];
      const excerpts: { sectionLabel: string; snippet: string }[] = [];

      const termWords = termName
        .toLowerCase()
        .split(/[\s/()&-]+/)
        .filter((w) => w.length >= 4);

      activeSections.forEach((sec) => {
        const secLower = sec.text.toLowerCase();
        if (
          secLower.includes(termName.toLowerCase()) ||
          termWords.some((w) => secLower.includes(w))
        ) {
          matchedLocs.push(sec.shortCode);
          const lines = sec.text.split('\n').filter((l) => l.trim().length > 15);
          const bestLine =
            lines.find((l) =>
              termWords.some((w) => l.toLowerCase().includes(w))
            ) || lines[0];
          if (bestLine && excerpts.length < 2) {
            excerpts.push({
              sectionLabel: sec.shortCode,
              snippet: bestLine.trim().slice(0, 140),
            });
          }
        }
      });

      const finalLocations =
        Array.isArray(raw.locations) && raw.locations.length > 0
          ? raw.locations
          : matchedLocs.length > 0
          ? matchedLocs
          : [activeSections[0]?.shortCode || 'Pasal 1'];

      const crossRefs =
        Array.isArray(raw.crossReferences) && raw.crossReferences.length > 0
          ? raw.crossReferences
          : finalLocations.length >= 2
          ? finalLocations.map((loc, i) =>
              i < finalLocations.length - 1
                ? `${loc} ↔ ${finalLocations[i + 1]}`
                : `${loc} ↔ ${finalLocations[0]}`
            )
          : [`${finalLocations[0]} ↔ Komparisi / Ketentuan Pokok`];

      results.push({
        id: `auto-idx-ai-${Date.now()}-${idx}`,
        term: termName,
        category: raw.category || 'Terminologi Kontrak',
        legalReference: raw.legalReference || 'KUHPerdata Indonesia',
        definition:
          raw.definition ||
          `Istilah hukum spesifik dalam "${doc.title}" yang mengatur pelaksanaan hak dan kewajiban pada ${finalLocations.join(', ')}.`,
        locations: finalLocations,
        isCritical: Boolean(raw.isCritical),
        isDefinedInContract:
          Boolean(raw.isDefinedInContract) ||
          finalLocations.some((l) => /pasal 1\b|komparisi|premis/i.test(l)),
        crossReferences: crossRefs,
        relatedTerms: Array.isArray(raw.relatedTerms) ? raw.relatedTerms : [],
        sectionExcerpts:
          Array.isArray(raw.sectionExcerpts) && raw.sectionExcerpts.length > 0
            ? raw.sectionExcerpts
            : excerpts,
        isCustomIndexEntry: true,
      });
    });
  }

  // 2. Deterministic section-by-section legal pattern & explicit defined-term extraction
  // Also extract quoted terms or explicitly defined terms in the selected sections e.g. ("...") or selanjutnya disebut "..."
  const explicitQuoteRegex =
    /(?:selanjutnya disebut(?:\s+sebagai)?\s+|istilah\s+)["“]([^"”]{3,40})["”]/gi;
  activeSections.forEach((sec) => {
    let match: RegExpExecArray | null;
    while ((match = explicitQuoteRegex.exec(sec.text)) !== null) {
      const explicitTerm = match[1].trim();
      if (!explicitTerm || usedTerms.has(explicitTerm.toLowerCase())) continue;
      usedTerms.add(explicitTerm.toLowerCase());

      // Find all selected sections where this explicit term appears
      const appearances = activeSections.filter((s) =>
        s.text.toLowerCase().includes(explicitTerm.toLowerCase())
      );
      const locs = appearances.map((a) => a.shortCode);
      const crossRefs =
        locs.length >= 2
          ? locs.slice(0, 4).map((l, idx) =>
              idx < Math.min(locs.length, 4) - 1 ? `${l} ↔ ${locs[idx + 1]}` : `${l} ↔ ${locs[0]}`
            )
          : [`${sec.shortCode} ↔ Seluruh Pasal Terkait`];

      results.push({
        id: `auto-idx-exp-${explicitTerm.replace(/\s+/g, '-').toLowerCase()}`,
        term: explicitTerm,
        category: 'Definisi Eksplisit Kontrak',
        legalReference: 'Pasal 1338 & Pasal 1342 KUHPerdata',
        definition: `Entitas atau terminologi yang didefinisikan secara eksplisit pada ${sec.shortCode} dan digunakan sebagai rujukan mengikat pada ${locs.join(', ')}.`,
        locations: locs.length > 0 ? locs : [sec.shortCode],
        isCritical: false,
        isDefinedInContract: true,
        crossReferences: crossRefs,
        relatedTerms: ['Komparisi & Kecakapan Bertindak', 'Pacta Sunt Servanda & Asas Mengikat'],
        sectionExcerpts: [
          {
            sectionLabel: sec.shortCode,
            snippet: sec.text.split('\n')[0]?.slice(0, 135) || sec.label,
          },
        ],
        isCustomIndexEntry: true,
      });
    }
  });

  // 3. Scan selected sections against DOMAIN_LEGAL_PATTERNS
  DOMAIN_LEGAL_PATTERNS.forEach((pat, patIdx) => {
    if (usedTerms.has(pat.term.toLowerCase())) return;

    const matchedSections: DocumentSectionOption[] = [];
    const sectionExcerpts: { sectionLabel: string; snippet: string }[] = [];

    activeSections.forEach((sec) => {
      if (pat.regex.test(sec.text)) {
        matchedSections.push(sec);
        const lines = sec.text.split('\n');
        const hitLine = lines.find((l) => pat.regex.test(l)) || lines[0];
        if (hitLine && sectionExcerpts.length < 2) {
          sectionExcerpts.push({
            sectionLabel: sec.shortCode,
            snippet: hitLine.trim().slice(0, 145),
          });
        }
      }
    });

    if (matchedSections.length > 0) {
      usedTerms.add(pat.term.toLowerCase());
      const locs = matchedSections.map((m) => m.shortCode);
      const crossReferences: string[] = [];
      if (locs.length >= 2) {
        for (let i = 0; i < Math.min(locs.length - 1, 3); i++) {
          crossReferences.push(`${locs[i]} ↔ ${locs[i + 1]}`);
        }
      } else {
        const primary = locs[0];
        const fallbackPartner =
          activeSections.find((s) => s.shortCode !== primary)?.shortCode || 'Pasal 1';
        crossReferences.push(`${primary} ↔ ${fallbackPartner}`);
      }

      results.push({
        id: `auto-idx-dom-${patIdx}`,
        term: pat.term,
        category: pat.category,
        legalReference: pat.legalReference,
        definition: pat.baseDefinition,
        locations: locs,
        isCritical: pat.isCritical,
        isDefinedInContract: locs.some((l) => /pasal 1\b|komparisi|premis/i.test(l)),
        crossReferences,
        relatedTerms: pat.relatedConcepts,
        sectionExcerpts,
        isCustomIndexEntry: true,
      });
    }
  });

  // Sort alphabetically by term to form a proper Custom Document Index
  return results.sort((a, b) => a.term.localeCompare(b.term, 'id'));
}
