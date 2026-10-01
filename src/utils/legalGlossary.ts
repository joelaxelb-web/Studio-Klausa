import { LegalDocument, LegalGlossaryItem } from '../types/legal';

export interface GlossaryDictionaryEntry {
  id: string;
  term: string;
  keywords: string[];
  patterns: RegExp[];
  category: string;
  legalReference: string;
  definition: string;
  isCritical?: boolean;
  isDefinedInContract?: boolean;
}

const CRITICAL_GLOSSARY_IDS = new Set([
  'term-wanprestasi',
  'term-pasal-1266',
  'term-force-majeure',
  'term-hki',
  'term-pdp',
  'term-denda-permil',
  'term-uang-kompensasi',
  'term-probation',
  'term-rahasia-dagang',
]);

const DEFINED_IN_CONTRACT_GLOSSARY_IDS = new Set([
  'term-bast',
  'term-uat',
  'term-hki',
  'term-pdp',
  'term-pkwt',
  'term-rahasia-dagang',
  'term-force-majeure',
]);

export const INDONESIAN_LEGAL_GLOSSARY_DICTIONARY: GlossaryDictionaryEntry[] = [
  {
    id: 'term-wanprestasi',
    term: 'Wanprestasi (Cidera Janji)',
    keywords: ['wanprestasi', 'cidera janji', 'kelalaian'],
    patterns: [/\bwanprestasi\b/i, /\bcidera janji\b/i, /\bkelalaian\b/i],
    category: 'Hukum Perikatan',
    legalReference: 'Pasal 1243 KUHPerdata',
    definition:
      'Keadaan di mana salah satu pihak tidak memenuhi kewajiban yang telah disepakati dalam perjanjian, memenuhi tetapi terlambat, atau melakukan sesuatu yang dilarang oleh kontrak, sehingga menimbulkan hak tuntutan ganti rugi.',
  },
  {
    id: 'term-pasal-1266',
    term: 'Pengenyampingan Pasal 1266 & 1267 KUHPerdata',
    keywords: ['Pasal 1266', 'Pasal 1267', '1266', '1267', 'mengesampingkan'],
    patterns: [/\bpasal 1266\b/i, /\bpasal 1267\b/i, /\b1266\b/i, /\b1267\b/i, /\bmengesampingkan\b/i],
    category: 'Pengakhiran Kontrak',
    legalReference: 'Pasal 1266 & 1267 KUHPerdata',
    definition:
      'Klausul baku dalam kontrak komersial Indonesia yang memungkinkan pihak yang dirugikan mengakhiri perjanjian secara sepihak dan seketika melalui surat tertulis tanpa harus menunggu putusan pembatalan dari hakim Pengadilan Negeri.',
  },
  {
    id: 'term-pasal-1338',
    term: 'Asas Kebebasan Berkontrak (Pacta Sunt Servanda)',
    keywords: ['Pasal 1338', 'mengikatkan diri', 'itikad baik'],
    patterns: [/\bpasal 1338\b/i, /\bmengikatkan diri\b/i, /\bitikad baik\b/i],
    category: 'Prinsip Dasar Kontrak',
    legalReference: 'Pasal 1338 ayat (1) KUHPerdata',
    definition:
      'Menetapkan bahwa setiap perjanjian yang dibuat secara sah berlaku sebagai undang-undang bagi mereka yang membuatnya, tidak dapat ditarik kembali selain dengan kesepakatan kedua belah pihak, dan wajib dilaksanakan dengan itikad baik.',
  },
  {
    id: 'term-force-majeure',
    term: 'Keadaan Kahar (Force Majeure)',
    keywords: ['Keadaan Kahar', 'Force Majeure', 'keadaan memaksa'],
    patterns: [/\bkeadaan kahar\b/i, /\bforce majeure\b/i, /\bkeadaan memaksa\b/i],
    category: 'Mitigasi Risiko',
    legalReference: 'Pasal 1244 & 1245 KUHPerdata',
    definition:
      'Peristiwa tak terduga di luar kendali wajar para pihak (seperti bencana alam, perang, epidemi resmi, atau perubahan regulasi pemerintah yang melarang objek kontrak) yang membebaskan pihak terdampak dari tuntutan ganti rugi atas keterlambatan pelaksanaan kewajiban.',
  },
  {
    id: 'term-hki',
    term: 'Hak Kekayaan Intelektual (HKI)',
    keywords: ['Hak Kekayaan Intelektual', 'hak cipta', 'source code', 'kode sumber'],
    patterns: [/\bhak kekayaan intelektual\b/i, /\bhak cipta\b/i, /\bsource code\b/i, /\bkode sumber\b/i],
    category: 'Kekayaan Intelektual',
    legalReference: 'UU No. 28 Tahun 2014 tentang Hak Cipta',
    definition:
      'Hak eksklusif yang timbul secara hukum atas karya intelektual meliputi hak moral dan hak ekonomi atas program komputer, desain, karya tulis, atau rahasia dagang yang pengalihannya wajib dinyatakan secara tertulis.',
  },
  {
    id: 'term-pdp',
    term: 'Pelindungan Data Pribadi (UU PDP)',
    keywords: ['Data Pribadi', 'Pelindungan Data Pribadi', 'UU Nomor 27 Tahun 2022', 'UU PDP'],
    patterns: [/\bpelindungan data pribadi\b/i, /\bdata pribadi\b/i, /\b27 tahun 2022\b/i, /\buu pdp\b/i],
    category: 'Kepatuhan Data',
    legalReference: 'UU No. 27 Tahun 2022 (UU PDP)',
    definition:
      'Regulasi nasional Indonesia yang mewajibkan setiap Pengendali dan Prosesor Data Pribadi menjaga keamanan data subjek, meminta persetujuan sah, serta melaporkan insiden kebocoran data paling lambat 3x24 jam.',
  },
  {
    id: 'term-pkwt',
    term: 'Perjanjian Kerja Waktu Tertentu (PKWT)',
    keywords: ['Perjanjian Kerja Waktu Tertentu', 'PKWT', 'Peraturan Pemerintah Nomor 35 Tahun 2021'],
    patterns: [/\bperjanjian kerja waktu tertentu\b/i, /\bpkwt\b/i, /\b35 tahun 2021\b/i],
    category: 'Ketenagakerjaan',
    legalReference: 'UU Cipta Kerja & PP No. 35 Tahun 2021',
    definition:
      'Perjanjian kerja antara pekerja dan pengusaha untuk pekerjaan yang menurut jenis dan sifatnya akan selesai dalam waktu tertentu. PKWT dilarang mencantumkan masa percobaan (probation) dan wajib dibuat secara tertulis dalam Bahasa Indonesia.',
  },
  {
    id: 'term-uang-kompensasi',
    term: 'Uang Kompensasi Berakhirnya PKWT',
    keywords: ['Uang Kompensasi', 'Pasal 15', 'Pasal 16'],
    patterns: [/\buang kompensasi\b/i, /\bpasal 15\b/i, /\bpasal 16\b/i],
    category: 'Ketenagakerjaan',
    legalReference: 'Pasal 15 & 16 PP No. 35 Tahun 2021',
    definition:
      'Kewajiban pengusaha membayar kompensasi finansial kepada pekerja PKWT saat masa kontrak berakhir (sebesar 1 bulan upah untuk masa kerja 12 bulan penuh, atau dihitung proporsional untuk masa kerja minimal 1 bulan).',
  },
  {
    id: 'term-probation',
    term: 'Masa Percobaan Kerja (Probation)',
    keywords: ['masa percobaan', 'probation', 'Pasal 58'],
    patterns: [/\bmasa percobaan\b/i, /\bprobation\b/i, /\bpasal 58\b/i],
    category: 'Ketenagakerjaan',
    legalReference: 'Pasal 58 UU No. 13 Tahun 2003',
    definition:
      'Masa evaluasi awal kerja paling lama 3 bulan yang hanya boleh diterapkan pada karyawan tetap (PKWTT). Apabila masa percobaan dicantumkan dalam kontrak PKWT, syarat tersebut batal demi hukum dan pekerja dianggap berstatus PKWTT.',
  },
  {
    id: 'term-bani',
    term: 'Arbitrase BANI (Badan Arbitrase Nasional Indonesia)',
    keywords: ['Badan Arbitrase Nasional Indonesia', 'BANI', 'arbitrase'],
    patterns: [/\bbadan arbitrase nasional indonesia\b/i, /\bbani\b/i, /\barbitrase\b/i],
    category: 'Penyelesaian Sengketa',
    legalReference: 'UU No. 30 Tahun 1999 tentang Arbitrase dan APS',
    definition:
      'Cara penyelesaian sengketa perdata komersial di luar peradilan umum yang pemeriksaannya bersifat tertutup (rahasia) dan menghasilkan putusan yang langsung bersifat final serta mengikat (final and binding) tanpa proses banding.',
  },
  {
    id: 'term-domisili-hukum',
    term: 'Domisili Hukum (Pilihan Yurisdiksi Pengadilan)',
    keywords: ['domisili hukum', 'Kepaniteraan Pengadilan Negeri', 'Pengadilan Negeri'],
    patterns: [/\bdomisili hukum\b/i, /\bkepaniteraan pengadilan negeri\b/i, /\bpengadilan negeri\b/i],
    category: 'Hukum Acara Perdata',
    legalReference: 'Pasal 24 KUHPerdata & Pasal 118 HIR',
    definition:
      'Kesepakatan para pihak dalam memilih Pengadilan Negeri tertentu sebagai forum yurisdiksi yang berwenang memeriksa dan mengadili gugatan apabila terjadi sengketa di kemudian hari.',
  },
  {
    id: 'term-bast',
    term: 'Berita Acara Serah Terima (BAST)',
    keywords: ['Berita Acara Serah Terima', 'BAST'],
    patterns: [/\bberita acara serah terima\b/i, /\bbast\b/i],
    category: 'Administrasi Kontrak',
    legalReference: 'Hukum Pembuktian Perdata (Pasal 1866 KUHPerdata)',
    definition:
      'Dokumen pembuktian tertulis yang ditandatangani oleh para pihak untuk mengesahkan bahwa pekerjaan atau barang telah diserahkan sesuai spesifikasi kontrak, yang umumnya menjadi syarat pencairan tagihan (invoice) dan mulainya masa garansi.',
  },
  {
    id: 'term-uat',
    term: 'User Acceptance Test (UAT)',
    keywords: ['User Acceptance Test', 'UAT'],
    patterns: [/\buser acceptance test\b/i, /\buat\b/i],
    category: 'Standar Teknis & SLA',
    legalReference: 'Praktik Kontrak Teknologi & Pasal 1338 KUHPerdata',
    definition:
      'Tahapan pengujian resmi oleh pengguna akhir atau Pemberi Kerja untuk memverifikasi bahwa perangkat lunak/sistem telah berjalan sesuai Kerangka Acuan Kerja (Statement of Work) sebelum diluncurkan secara komersial.',
  },
  {
    id: 'term-denda-permil',
    term: 'Denda Keterlambatan (Liquidated Damages / Per Mil)',
    keywords: ['denda keterlambatan', 'satu per mil', 'per mil', '1‰'],
    patterns: [/\bdenda keterlambatan\b/i, /\bsatu per mil\b/i, /\bper mil\b/i, /1‰/],
    category: 'Finansial & Sanksi',
    legalReference: 'Pasal 1249 & 1304 KUHPerdata',
    definition:
      'Besaran sanksi ganti rugi keterlambatan yang telah ditetapkan di muka dalam kontrak (misalnya 1‰ atau 1/1000 per hari dari nilai pekerjaan) beserta batas plafon maksimum (cap) untuk memberikan kepastian perhitungan kerugian.',
  },
  {
    id: 'term-rahasia-dagang',
    term: 'Informasi Rahasia & Rahasia Dagang',
    keywords: ['Informasi Rahasia', 'rahasia dagang', 'Non-Disclosure Agreement', 'NDA'],
    patterns: [/\binformasi rahasia\b/i, /\brahasia dagang\b/i, /\bnon-disclosure agreement\b/i, /\bnda\b/i],
    category: 'Kerahasiaan & Data',
    legalReference: 'UU No. 30 Tahun 2000 tentang Rahasia Dagang',
    definition:
      'Informasi di bidang teknologi dan/atau bisnis yang tidak diketahui oleh umum, mempunyai nilai ekonomi karena berguna dalam kegiatan usaha, dan dijaga kerahasiaannya oleh pemiliknya melalui perjanjian tertulis.',
  },
  {
    id: 'term-addendum',
    term: 'Addendum Perjanjian',
    keywords: ['Addendum', 'Amandemen', 'Change Request'],
    patterns: [/\baddendum\b/i, /\bamandemen\b/i, /\bchange request\b/i],
    category: 'Administrasi Kontrak',
    legalReference: 'Pasal 1338 KUHPerdata',
    definition:
      'Dokumen perjanjian tambahan atau perubahan resmi yang mengubah, menambah, atau menghapus ketentuan dalam perjanjian induk berdasarkan kesepakatan tertulis seluruh pihak.',
  },
  {
    id: 'term-due-diligence',
    term: 'Uji Tuntas (Due Diligence)',
    keywords: ['uji tuntas', 'due diligence'],
    patterns: [/\buji tuntas\b/i, /\bdue diligence\b/i],
    category: 'Korporasi & Investasi',
    legalReference: 'Hukum Perseroan & Praktik M&A Indonesia',
    definition:
      'Proses pemeriksaan dan audit menyeluruh dari aspek hukum (Legal Due Diligence), keuangan, pajak, serta operasional terhadap suatu perusahaan sebelum dilakukannya transaksi investasi, akuisisi, atau kemitraan strategis.',
  },
  {
    id: 'term-materai',
    term: 'Bea Meterai (Materai Rp10.000)',
    keywords: ['bermaterai cukup', 'Materai', 'Meterai'],
    patterns: [/\bbermaterai cukup\b/i, /\bmaterai\b/i, /\bmeterai\b/i],
    category: 'Pembuktian Hukum',
    legalReference: 'UU No. 10 Tahun 2020 tentang Bea Meterai',
    definition:
      'Pajak atas dokumen perdata yang digunakan sebagai alat bukti di pengadilan. Ketiadaan meterai tidak membuat perjanjian batal demi hukum (karena sahnya kontrak ditentukan Pasal 1320 KUHPerdata), namun dokumen wajib dimeteraikan kemudian (nazegelen) bila diajukan sebagai bukti.',
  },
  {
    id: 'term-phi',
    term: 'Pengadilan Hubungan Industrial (PHI) & Bipartit',
    keywords: ['Pengadilan Hubungan Industrial', 'hubungan industrial', 'bipartit'],
    patterns: [/\bpengadilan hubungan industrial\b/i, /\bhubungan industrial\b/i, /\bbipartit\b/i],
    category: 'Ketenagakerjaan',
    legalReference: 'UU No. 2 Tahun 2004 tentang PPHI',
    definition:
      'Mekanisme penyelesaian perselisihan ketenagakerjaan yang wajib diawali dengan perundingan dua pihak secara musyawarah (Bipartit), mediasi di Dinas Ketenagakerjaan, hingga penyelesaian di Pengadilan Hubungan Industrial.',
  },
  {
    id: 'term-non-solicitation',
    term: 'Non-Solicitation (Larangan Membajak Karyawan)',
    keywords: ['non-solicitation', 'merekrut karyawan'],
    patterns: [/\bnon-solicitation\b/i, /\bmerekrut karyawan\b/i],
    category: 'Pembatasan Komersial',
    legalReference: 'Pasal 1338 KUHPerdata',
    definition:
      'Klausul pelarangan bagi salah satu pihak untuk membujuk, menawarkan pekerjaan, atau membajak karyawan kunci maupun klien dari pihak lawan selama masa kontrak berlangsung dan dalam periode tertentu setelah kontrak berakhir.',
  },
];

export function detectLegalTermsInDocument(doc: LegalDocument): LegalGlossaryItem[] {
  const detected: LegalGlossaryItem[] = [];

  for (const entry of INDONESIAN_LEGAL_GLOSSARY_DICTIONARY) {
    const locations: string[] = [];

    const matchesEntry = (text: string) =>
      Boolean(text && entry.patterns.some((regex) => regex.test(text)));

    if (
      matchesEntry(doc.title) ||
      matchesEntry(doc.subtitle) ||
      matchesEntry(doc.jurisdiction) ||
      matchesEntry(doc.openingText) ||
      matchesEntry(doc.partyOne.description) ||
      matchesEntry(doc.partyTwo.description)
    ) {
      locations.push('Komparisi');
    }

    if (doc.recitals.some((r) => matchesEntry(r))) {
      locations.push('Premis');
    }

    let appearsInCriticalClause = false;
    let explicitlyDefinedInClause = false;

    doc.clauses.forEach((clause) => {
      const clauseText = `${clause.title} ${clause.legalBasis} ${clause.content.join(' ')}`;
      if (matchesEntry(clauseText)) {
        locations.push(clause.number);
        if ((clause.riskLevel || '').toLowerCase() === 'kritis') {
          appearsInCriticalClause = true;
        }
        const joinedContent = clause.content.join(' ');
        const hasExplicitDefinition =
          entry.keywords.some((kw) => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const defRegex = new RegExp(
              `\\("${escaped}"\\)|disebut\\s+(sebagai\\s+)?"?${escaped}"?|("${escaped}")`,
              'i'
            );
            return defRegex.test(joinedContent) || new RegExp(escaped, 'i').test(clause.title);
          });
        if (hasExplicitDefinition) {
          explicitlyDefinedInClause = true;
        }
      }
    });

    if (matchesEntry(doc.closingText)) {
      locations.push('Penutup');
    }

    if (locations.length > 0) {
      const isCritical =
        CRITICAL_GLOSSARY_IDS.has(entry.id) || appearsInCriticalClause;
      const isDefinedInContract =
        DEFINED_IN_CONTRACT_GLOSSARY_IDS.has(entry.id) ||
        explicitlyDefinedInClause ||
        doc.variables.some((v) =>
          entry.keywords.some(
            (kw) =>
              v.key.toLowerCase().includes(kw.toLowerCase()) ||
              v.value.toLowerCase().includes(kw.toLowerCase())
          )
        );

      detected.push({
        id: entry.id,
        term: entry.term,
        category: entry.category,
        legalReference: entry.legalReference,
        definition: entry.definition,
        locations: Array.from(new Set(locations)),
        isCritical,
        isDefinedInContract,
      });
    }
  }

  return detected;
}

export interface AnnotatedTextSegment {
  text: string;
  glossaryItem?: {
    term: string;
    category: string;
    legalReference: string;
    definition: string;
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function tokenizeTextWithGlossary(
  text: string,
  extraGlossaryItems: LegalGlossaryItem[] = []
): AnnotatedTextSegment[] {
  if (!text) return [{ text: '' }];

  // Build keyword -> glossary metadata map
  const keywordMap = new Map<
    string,
    { term: string; category: string; legalReference: string; definition: string }
  >();

  for (const entry of INDONESIAN_LEGAL_GLOSSARY_DICTIONARY) {
    for (const kw of entry.keywords) {
      keywordMap.set(kw.toLowerCase(), {
        term: entry.term,
        category: entry.category,
        legalReference: entry.legalReference,
        definition: entry.definition,
      });
    }
  }

  for (const extra of extraGlossaryItems) {
    const cleanTerm = extra.term.replace(/\s*\(.*?\)\s*/g, '').trim();
    if (cleanTerm.length >= 3 && !keywordMap.has(cleanTerm.toLowerCase())) {
      keywordMap.set(cleanTerm.toLowerCase(), {
        term: extra.term,
        category: extra.category,
        legalReference: extra.legalReference,
        definition: extra.definition,
      });
    }
  }

  // Sort keywords longest first so "Berita Acara Serah Terima" matches before "BAST"
  const sortedKeywords = Array.from(keywordMap.keys()).sort((a, b) => b.length - a.length);
  if (sortedKeywords.length === 0) return [{ text }];

  const patternSource = sortedKeywords.map(escapeRegExp).join('|');
  const combinedRegex = new RegExp(`(${patternSource})`, 'gi');

  const parts = text.split(combinedRegex);
  const segments: AnnotatedTextSegment[] = [];

  for (const part of parts) {
    if (!part) continue;
    const matchMeta = keywordMap.get(part.toLowerCase());
    if (matchMeta) {
      segments.push({
        text: part,
        glossaryItem: matchMeta,
      });
    } else {
      segments.push({ text: part });
    }
  }

  return segments;
}
