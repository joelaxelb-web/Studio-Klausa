import { LegalClause, LegalDocument } from '../types/legal';

export type NumberingStyle =
  | 'ayat_parentheses' // Pasal 1 -> (1), (2), a., b.
  | 'decimal_hierarchy' // Level 1, 1.1, 1.2, a., b.
  | 'roman_parentheses' // PASAL I -> (1), (2), a., b.
  | 'numeric_dot'; // Pasal 1 -> 1., 2., a., b.

export type FontStylePreset = 'serif_legal' | 'sans_corporate' | 'mono_audit';

export type IndentationPreset = 'none' | 'hanging_subclause' | 'notarial_first_line';

export interface BulkFormatConfig {
  numberingStyle: NumberingStyle;
  fontStyle: FontStylePreset;
  indentation: IndentationPreset;
  uppercaseTitles: boolean;
}

const ROMAN_NUMERALS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
];

export function toRoman(num: number): string {
  if (num >= 1 && num <= ROMAN_NUMERALS.length) {
    return ROMAN_NUMERALS[num - 1];
  }
  return String(num);
}

// Strip any existing leading numbering like "(1)", "1.1.", "1.", "Ayat 1:" from an ayat string
export function stripLeadingAyatNumber(text: string): string {
  return text
    .trim()
    .replace(
      /^(?:\(\d+\)|\d+\.\d+(?:\.\d+)?\.?|\d+\.|[a-z]\)|\([a-z]\))\s*/i,
      ''
    )
    .trim();
}

// Reformat internal sub-items (e.g. "- ", "• ", "1) ", "a) ") into standardized "a. ", "b. ", "c. " hierarchy
function formatSubItemsToAlpha(body: string): string {
  const lines = body.split('\n');
  if (lines.length <= 1) return body;

  let alphaIdx = 0;
  const formattedLines = lines.map((line, idx) => {
    if (idx === 0) return line.trim();
    const trimmed = line.trim();
    if (!trimmed) return '';
    const strippedSub = trimmed.replace(
      /^(?:[-•*]|[a-z][.)]|\([a-z]\)|\d+[)])\s*/i,
      ''
    );
    const letter = String.fromCharCode(97 + (alphaIdx % 26));
    alphaIdx++;
    return `   ${letter}. ${strippedSub}`;
  });

  return formattedLines.filter(Boolean).join('\n');
}

export function applyBulkFormattingToDocument(
  doc: LegalDocument,
  config: BulkFormatConfig
): LegalDocument {
  const formattedClauses: LegalClause[] = doc.clauses.map((clause, cIdx) => {
    const clauseNum = cIdx + 1;

    let formattedNumber = `Pasal ${clauseNum}`;
    if (config.numberingStyle === 'roman_parentheses') {
      formattedNumber = `PASAL ${toRoman(clauseNum)}`;
    } else if (config.numberingStyle === 'decimal_hierarchy') {
      formattedNumber = `Pasal ${clauseNum}`;
    }

    const formattedTitle = config.uppercaseTitles
      ? clause.title.trim().toUpperCase()
      : clause.title.trim();

    const formattedContent = clause.content.map((rawAyat, aIdx) => {
      const ayatNum = aIdx + 1;
      const cleanBody = formatSubItemsToAlpha(stripLeadingAyatNumber(rawAyat));

      let prefix = `(${ayatNum})`;
      if (config.numberingStyle === 'decimal_hierarchy') {
        prefix = `${clauseNum}.${ayatNum}.`;
      } else if (config.numberingStyle === 'numeric_dot') {
        prefix = `${ayatNum}.`;
      } else {
        prefix = `(${ayatNum})`;
      }

      return `${prefix} ${cleanBody}`;
    });

    return {
      ...clause,
      number: formattedNumber,
      title: formattedTitle,
      content: formattedContent,
    };
  });

  return {
    ...doc,
    title: config.uppercaseTitles ? doc.title.toUpperCase() : doc.title,
    clauses: formattedClauses,
  };
}

// Marker used to identify risk-adaptive regulatory ayat so switching risk levels replaces cleanly
const RISK_MARKER_REGEX =
  /\[Ketentuan Khusus Risiko (?:Standar|Perhatian|Kritis)\]|Berdasarkan standar kepatuhan tingkat (?:Standar|Perhatian|Kritis)|Dalam rangka mitigasi risiko tingkat (?:Perhatian|Kritis)|Ketentuan Tegas Mitigasi Risiko Kritis/i;

export function extractCoreClauseContent(content: string[]): string[] {
  const filtered = content.filter((ayat) => !RISK_MARKER_REGEX.test(ayat));
  return filtered.length > 0 ? filtered : content.slice(0, Math.max(1, content.length - 1));
}

/**
 * Automatically adapts a clause's legalBasis (regulations) and content (ayat-ayat)
 * based on the selected Risk Level: 'Standar', 'Perhatian', or 'Kritis'.
 */
export function adaptClauseByRiskLevel(
  clause: LegalClause,
  targetRisk: 'Standar' | 'Perhatian' | 'Kritis'
): {
  legalBasis: string;
  content: string[];
  riskSummary: string;
} {
  const coreAyats = extractCoreClauseContent(clause.content);
  const titleUpper = clause.title.toUpperCase();
  const combinedText = `${clause.title} ${coreAyats.join(' ')}`.toLowerCase();

  // Detect numbering style currently used in this clause (e.g. "3.1." vs "(1)" vs "1.")
  const firstAyat = coreAyats[0]?.trim() || '';
  const decimalMatch = firstAyat.match(/^(\d+)\.\d+\./);
  const dotMatch = !decimalMatch && firstAyat.match(/^\d+\./);

  const formatPrefix = (index1Based: number) => {
    if (decimalMatch) {
      return `${decimalMatch[1]}.${index1Based}.`;
    }
    if (dotMatch) {
      return `${index1Based}.`;
    }
    return `(${index1Based})`;
  };

  // Re-number core ayats cleanly
  const normalizedCore = coreAyats.map((ayat, idx) => {
    const clean = stripLeadingAyatNumber(ayat);
    return `${formatPrefix(idx + 1)} ${clean}`;
  });

  const nextIdx = normalizedCore.length + 1;
  const nextPrefix = formatPrefix(nextIdx);
  const secondNextPrefix = formatPrefix(nextIdx + 1);

  // Determine topic category of the clause for accurate Indonesian regulation & content adaptation
  const isPaymentOrFinancial =
    /nilai|harga|pembayaran|biaya|upah|kompensasi|pajak|ppn|tagihan|invoice|sewa/i.test(
      combinedText
    );
  const isScopeOrDeliverables =
    /ruang lingkup|pekerjaan|spesifikasi|sla|serah terima|bast|uat|kewajiban/i.test(
      combinedText
    );
  const isIpOrConfidentiality =
    /kekayaan intelektual|hki|hak cipta|rahasia|data pribadi|pdp|nda|source code/i.test(
      combinedText
    );
  const isTerminationOrDefault =
    /wanprestasi|sanksi|denda|pengakhiran|pemutusan|1266|1267/i.test(combinedText);
  const isEmployment = /pkwt|pekerja|karyawan|jam kerja|cuti|ketenagakerjaan/i.test(
    combinedText
  );

  if (targetRisk === 'Standar') {
    if (isPaymentOrFinancial) {
      return {
        legalBasis: 'Pasal 1338 KUHPerdata & UU No. 7 Tahun 2021 (UU HPP / PPN)',
        content: [
          ...normalizedCore,
          `${nextPrefix} [Ketentuan Khusus Risiko Standar] Pelaksanaan pembayaran tagihan dilakukan secara proporsional sesuai kesepakatan Para Pihak dengan masa tenggang verifikasi dokumen tagihan (invoice) selama 14 (empat belas) Hari Kerja serta tunduk pada ketentuan perpajakan umum berdasarkan Undang-Undang Nomor 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan.`,
        ],
        riskSummary:
          'Isi pasal disesuaikan ke tingkat Standar: syarat verifikasi tagihan wajar (14 Hari Kerja) & kepatuhan pajak normatif.',
      };
    }

    if (isIpOrConfidentiality) {
      return {
        legalBasis: 'UU No. 28 Tahun 2014 tentang Hak Cipta & Pasal 1338 KUHPerdata',
        content: [
          ...normalizedCore,
          `${nextPrefix} [Ketentuan Khusus Risiko Standar] Berdasarkan standar kepatuhan tingkat Standar sesuai Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta, penggunaan informasi dan hasil pekerjaan dilaksanakan dengan itikad baik untuk mendukung kelancaran objek Perjanjian selama masa kontrak berlangsung.`,
        ],
        riskSummary:
          'Isi pasal disesuaikan ke tingkat Standar: pelindungan HKI & kerahasiaan normatif selama masa perjanjian.',
      };
    }

    if (isEmployment) {
      return {
        legalBasis: 'UU No. 13 Tahun 2003 & PP No. 35 Tahun 2021 tentang PKWT',
        content: [
          ...normalizedCore,
          `${nextPrefix} [Ketentuan Khusus Risiko Standar] Pelaksanaan hubungan kerja dalam Pasal ini dilaksanakan secara harmonis sesuai ketentuan Peraturan Pemerintah Nomor 35 Tahun 2021 dengan mengedepankan evaluasi berkala dan komunikasi dua arah antara Pengusaha dan Pekerja.`,
        ],
        riskSummary:
          'Isi pasal disesuaikan ke tingkat Standar: hubungan kerja normatif sesuai PP No. 35 Tahun 2021.',
      };
    }

    return {
      legalBasis: 'Pasal 1320 & Pasal 1338 ayat (1) dan (3) KUHPerdata',
      content: [
        ...normalizedCore,
        `${nextPrefix} [Ketentuan Khusus Risiko Standar] Berdasarkan standar kepatuhan tingkat Standar sesuai Pasal 1338 ayat (3) Kitab Undang-Undang Hukum Perdata, pelaksanaan ketentuan mengenai ${titleUpper.toLowerCase()} dijalankan dengan asas itikad baik, kepatutan, dan musyawarah apabila terdapat penyesuaian teknis di lapangan.`,
      ],
      riskSummary:
        'Isi pasal disesuaikan ke tingkat Standar: menggunakan asas itikad baik Pasal 1338 KUHPerdata dan mekanisme kooperatif.',
    };
  }

  if (targetRisk === 'Perhatian') {
    if (isPaymentOrFinancial) {
      return {
        legalBasis:
          'Pasal 1238 & 1866 KUHPerdata, UU No. 7 Tahun 2021 (PPN/PPh) & UU Bea Meterai No. 10/2020',
        content: [
          ...normalizedCore,
          `${nextPrefix} [Ketentuan Khusus Risiko Perhatian] Dalam rangka mitigasi risiko tingkat Perhatian, setiap pencairan pembayaran wajib dilampiri Faktur Pajak sah sesuai UU No. 7 Tahun 2021, kuitansi bermaterai cukup (UU No. 10 Tahun 2020), serta Berita Acara Serah Terima (BAST) asli yang telah diverifikasi tertulis oleh Para Pihak.`,
          `${secondNextPrefix} Apabila terdapat keterlambatan pembayaran atau ketidaksesuaian nilai tagihan melewati 7 (tujuh) Hari Kalender sejak jatuh tempo, Pihak yang dirugikan berhak menerbitkan Surat Teguran tertulis (Pasal 1238 KUHPerdata) dan menangguhkan pelaksanaan tahapan berikutnya hingga kewajiban pembayaran diselesaikan.`,
        ],
        riskSummary:
          'Isi pasal diperketat ke tingkat Perhatian: wajib Faktur Pajak, BAST terverifikasi, teguran Pasal 1238 KUHPerdata & hak penangguhan kerja.',
      };
    }

    if (isIpOrConfidentiality) {
      return {
        legalBasis:
          'UU No. 27 Tahun 2022 (UU PDP), UU No. 30 Tahun 2000 (Rahasia Dagang) & UU No. 28/2014',
        content: [
          ...normalizedCore,
          `${nextPrefix} [Ketentuan Khusus Risiko Perhatian] Dalam rangka mitigasi risiko tingkat Perhatian sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) dan UU No. 30 Tahun 2000 tentang Rahasia Dagang, setiap akses terhadap data dan kekayaan intelektual wajib melalui otorisasi tertulis serta audit keamanan berkala.`,
          `${secondNextPrefix} Apabila ditemukan indikasi akses tidak sah atau potensi kebocoran informasi, Pihak terkait wajib melaporkannya secara tertulis dalam waktu maksimal 3 x 24 (tiga kali dua puluh empat) jam serta melakukan tindakan isolasi risiko seketika.`,
        ],
        riskSummary:
          'Isi pasal diperketat ke tingkat Perhatian: kepatuhan UU PDP No. 27/2022, otorisasi tertulis & wajib lapor insiden 3x24 jam.',
      };
    }

    if (isScopeOrDeliverables) {
      return {
        legalBasis: 'Pasal 1238, Pasal 1243 & Pasal 1866 KUHPerdata (Pembuktian Prestasi)',
        content: [
          ...normalizedCore,
          `${nextPrefix} [Ketentuan Khusus Risiko Perhatian] Dalam rangka mitigasi risiko tingkat Perhatian, setiap pemenuhan kewajiban dalam Pasal ini wajib diuji melalui prosedur User Acceptance Test (UAT) tertulis dengan masa evaluasi maksimal 7 (tujuh) Hari Kerja dan masa perbaikan (cure period) maksimal 14 (empat belas) Hari Kalender sejak ditemukannya ketidaksesuaian spesifikasi.`,
        ],
        riskSummary:
          'Isi pasal diperketat ke tingkat Perhatian: wajib pengujian tertulis & batas waktu perbaikan (cure period) 14 hari.',
      };
    }

    return {
      legalBasis: 'Pasal 1238, Pasal 1243 & Pasal 1866 KUHPerdata',
      content: [
        ...normalizedCore,
        `${nextPrefix} [Ketentuan Khusus Risiko Perhatian] Dalam rangka mitigasi risiko tingkat Perhatian berdasarkan Pasal 1238 dan Pasal 1866 Kitab Undang-Undang Hukum Perdata, setiap pelaksanaan kewajiban pada Pasal ini wajib didokumentasikan secara tertulis dan memiliki batas waktu perbaikan (cure period) paling lama 14 (empat belas) Hari Kalender sejak diterimanya pemberitahuan tertulis atas ketidaksesuaian.`,
      ],
      riskSummary:
        'Isi pasal diperketat ke tingkat Perhatian: wajib bukti tertulis Pasal 1866 KUHPerdata & cure period 14 Hari Kalender.',
    };
  }

  // targetRisk === 'Kritis'
  if (isPaymentOrFinancial) {
    return {
      legalBasis:
        'Pasal 1243, Pasal 1266, Pasal 1267 & Pasal 1304 KUHPerdata (Sanksi Denda & Eksekusi Langsung)',
      content: [
        ...normalizedCore,
        `${nextPrefix} [Ketentuan Khusus Risiko Kritis] Ketentuan Tegas Mitigasi Risiko Kritis: Keterlambatan pembayaran atau pelanggaran kewajiban finansial dalam Pasal ini dikualifikasikan sebagai Wanprestasi Material seketika berdasarkan Pasal 1243 dan Pasal 1304 KUHPerdata yang dikenakan denda keterlambatan sebesar 2‰ (dua per mil) per hari kalender dari nilai tagihan tertunggak.`,
        `${secondNextPrefix} Apabila keterlambatan melampaui 14 (empat belas) Hari Kalender, Pihak yang dirugikan berhak menghentikan seluruh layanan/pekerjaan secara sepihak, menahan seluruh hak atas hasil pekerjaan, serta mengakhiri Perjanjian seketika dengan mengesampingkan keberlakuan Pasal 1266 dan Pasal 1267 KUHPerdata.`,
      ],
      riskSummary:
        'Isi pasal ditingkatkan ke tingkat Kritis: denda tegas 2‰ per hari (Pasal 1304 KUHPerdata), penahanan hasil & pemutusan sepihak (Pasal 1266 KUHPerdata).',
    };
  }

  if (isIpOrConfidentiality) {
    return {
      legalBasis:
        'Pasal 54-67 UU No. 27 Tahun 2022 (Sanksi Pidana & Denda UU PDP), Pasal 113 UU Hak Cipta No. 28/2014 & Pasal 1365 KUHPerdata',
      content: [
        ...normalizedCore,
        `${nextPrefix} [Ketentuan Khusus Risiko Kritis] Ketentuan Tegas Mitigasi Risiko Kritis: Setiap pelanggaran terhadap kewajiban kerahasiaan, penyalahgunaan Data Pribadi, atau pelanggaran Hak Kekayaan Intelektual dalam Pasal ini merupakan pelanggaran hukum berat yang tunduk pada tuntutan ganti rugi penuh (full indemnification) tanpa batas plafon berdasarkan Pasal 1365 KUHPerdata serta ancaman sanksi administratif dan pidana sesuai Pasal 57 s.d. Pasal 67 Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi dan Pasal 113 UU No. 28 Tahun 2014 tentang Hak Cipta.`,
        `${secondNextPrefix} Pihak yang dirugikan berhak melakukan pemutusan Perjanjian secara seketika tanpa teguran terlebih dahulu (mengesampingkan Pasal 1266 dan Pasal 1267 KUHPerdata) serta menuntut penyitaan atau penghapusan permanen seluruh data yang dikuasai Pihak yang melanggar.`,
      ],
      riskSummary:
        'Isi pasal ditingkatkan ke tingkat Kritis: ganti rugi penuh tanpa batas plafon (Pasal 1365 KUHPerdata) & rujukan sanksi pidana UU PDP / UU Hak Cipta.',
    };
  }

  if (isTerminationOrDefault) {
    return {
      legalBasis:
        'Pasal 1243, Pasal 1266, Pasal 1267, Pasal 1304 & Pasal 1365 KUHPerdata',
      content: [
        ...normalizedCore,
        `${nextPrefix} [Ketentuan Khusus Risiko Kritis] Ketentuan Tegas Mitigasi Risiko Kritis: Para Pihak sepakat bahwa pelanggaran terhadap ketentuan Pasal ini memberikan hak mutlak kepada Pihak yang tidak lalai untuk menuntut ganti rugi penuh atas seluruh kerugian nyata, biaya hukum, serta bunga (Pasal 1243 s.d. Pasal 1248 KUHPerdata), disertai pengakhiran Perjanjian secara sepihak dan seketika tanpa memerlukan putusan Pengadilan Negeri (mengesampingkan Pasal 1266 dan Pasal 1267 KUHPerdata).`,
      ],
      riskSummary:
        'Isi pasal ditingkatkan ke tingkat Kritis: tuntutan ganti rugi penuh Pasal 1243-1248 KUHPerdata & eksekusi pemutusan seketika.',
    };
  }

  return {
    legalBasis:
      'Pasal 1243, Pasal 1266, Pasal 1267 & Pasal 1304 KUHPerdata (Wanprestasi Material & Sanksi)',
    content: [
      ...normalizedCore,
      `${nextPrefix} [Ketentuan Khusus Risiko Kritis] Ketentuan Tegas Mitigasi Risiko Kritis: Setiap kelalaian atau penyimpangan terhadap pelaksanaan ${titleUpper.toLowerCase()} dalam Pasal ini dikualifikasikan sebagai Wanprestasi Material (Pasal 1243 KUHPerdata) yang mewajibkan Pihak yang melanggar membayar denda sanksi sebesar 1‰ (satu per mil) per hari keterlambatan serta membebaskan Pihak lainnya dari segala gugatan pihak ketiga (full indemnification).`,
      `${secondNextPrefix} Dalam hal pelanggaran tidak dipulihkan dalam waktu 7 (tujuh) Hari Kalender, Pihak yang dirugikan berhak mengakhiri Perjanjian secara sepihak dan seketika dengan mengesampingkan ketentuan Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata.`,
    ],
    riskSummary:
      'Isi pasal ditingkatkan ke tingkat Kritis: kualifikasi Wanprestasi Material, denda 1‰/hari, ganti rugi penuh & pengenyampingan Pasal 1266 KUHPerdata.',
  };
}

/**
 * Local deterministic fallback for splitting a clause when user selects text/ayat
 * so Split Clause always succeeds with coherent legal numbering and structure.
 */
export function splitClauseLocally(
  sourceClause: LegalClause,
  selectedText: string,
  nextClauseNumber: number
): {
  updatedSourceClause: {
    title: string;
    content: string[];
    legalBasis: string;
    riskLevel: string;
  };
  newSplitClause: {
    title: string;
    content: string[];
    legalBasis: string;
    riskLevel: string;
  };
} {
  const cleanSelected = stripLeadingAyatNumber(selectedText.trim());

  // Remove or trim the selected text from the source clause ayats
  const remainingAyats: string[] = [];
  for (const ayat of sourceClause.content) {
    if (ayat.trim() === selectedText.trim()) {
      continue;
    }
    if (selectedText.trim().length > 20 && ayat.includes(selectedText.trim())) {
      const leftover = ayat.replace(selectedText.trim(), '').trim();
      if (stripLeadingAyatNumber(leftover).length > 15) {
        remainingAyats.push(leftover);
      }
    } else {
      remainingAyats.push(ayat);
    }
  }

  if (remainingAyats.length === 0) {
    remainingAyats.push(
      `(1) Para Pihak sepakat bahwa ketentuan pokok mengenai ${sourceClause.title.toLowerCase()} dilaksanakan sesuai syarat dan spesifikasi yang disepakati dalam Perjanjian ini.`
    );
  }

  const renumberedSource = remainingAyats.map(
    (a, idx) => `(${idx + 1}) ${stripLeadingAyatNumber(a)}`
  );

  // Derive a formal title for the new split clause from the selected text
  const words = cleanSelected
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
  const derivedTitle =
    words.length >= 2
      ? `KETENTUAN KHUSUS ${words.join(' ').toUpperCase()}`
      : `KETENTUAN LANJUTAN ${sourceClause.title.toUpperCase()}`;

  const newClauseContent = [
    `(1) ${cleanSelected.endsWith('.') ? cleanSelected : `${cleanSelected}.`}`,
    `(2) Pelaksanaan ketentuan sebagaimana dimaksud pada ayat (1) Pasal ini wajib dikoordinasikan secara tertulis oleh Para Pihak sebagai bagian yang tidak terpisahkan dari pelaksanaan ${sourceClause.number} Perjanjian ini.`,
  ];

  return {
    updatedSourceClause: {
      title: sourceClause.title,
      content: renumberedSource,
      legalBasis: sourceClause.legalBasis,
      riskLevel: sourceClause.riskLevel,
    },
    newSplitClause: {
      title: derivedTitle,
      content: newClauseContent,
      legalBasis: sourceClause.legalBasis || 'Pasal 1338 KUHPerdata',
      riskLevel: sourceClause.riskLevel || 'Perhatian',
    },
  };
}

function inferLegalBasisAndRiskFromText(
  title: string,
  bodyText: string
): { legalBasis: string; riskLevel: 'Standar' | 'Perhatian' | 'Kritis' } {
  const combined = `${title} ${bodyText}`.toLowerCase();
  if (/denda|wanprestasi|sanksi|ganti rugi|1266|1267|pengakhiran|pemutusan/i.test(combined)) {
    return {
      legalBasis: 'Pasal 1243, Pasal 1266 & Pasal 1267 KUHPerdata',
      riskLevel: 'Kritis',
    };
  }
  if (/pembayaran|harga|biaya|nilai|tagihan|invoice|termin|pajak|ppn|pph/i.test(combined)) {
    return {
      legalBasis: 'Pasal 1338 KUHPerdata & UU No. 7 Tahun 2021 (UU HPP)',
      riskLevel: 'Kritis',
    };
  }
  if (/rahasia|kerahasiaan|data pribadi|pdp|nda|privasi/i.test(combined)) {
    return {
      legalBasis: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)',
      riskLevel: 'Perhatian',
    };
  }
  if (/kekayaan intelektual|hki|hak cipta|source code|kode sumber|lisensi/i.test(combined)) {
    return {
      legalBasis: 'UU No. 28 Tahun 2014 tentang Hak Cipta',
      riskLevel: 'Kritis',
    };
  }
  if (/sengketa|perselisihan|pengadilan|arbitrase|bani|mediasi/i.test(combined)) {
    return {
      legalBasis: 'UU No. 30 Tahun 1999 tentang Arbitrase & APS',
      riskLevel: 'Perhatian',
    };
  }
  if (/kahar|force majeure|bencana|overmacht/i.test(combined)) {
    return {
      legalBasis: 'Pasal 1244 & Pasal 1245 KUHPerdata',
      riskLevel: 'Standar',
    };
  }
  return {
    legalBasis: 'Pasal 1320 & Pasal 1338 KUHPerdata',
    riskLevel: 'Standar',
  };
}

export function parseRawContractTextIntoClauses(
  rawText: string,
  startClauseNumber1Based: number,
  config: BulkFormatConfig,
  aiParsedClauses?: Array<{
    title: string;
    content: string[];
    legalBasis?: string;
    riskLevel?: string;
    plainSummary?: string;
  }>
): LegalClause[] {
  let rawBlocks: Array<{
    title: string;
    content: string[];
    legalBasis?: string;
    riskLevel?: string;
    plainSummary?: string;
  }> = [];

  if (aiParsedClauses && aiParsedClauses.length > 0) {
    rawBlocks = aiParsedClauses;
  } else {
    const cleaned = rawText.replace(/\r\n/g, '\n').trim();
    // Split by explicit "Pasal X", "PASAL X", "Article X", "BAGIAN X", or top-level numbered headers, or fallback to double-newlines
    const pasalRegex =
      /(?:^|\n)\s*(?:PASAL|Pasal|ARTICLE|Article|BAGIAN|Klausul)\s+(?:[IVXLCDM]+|\d+)\b[:.\s-]*/g;
    const hasPasalHeaders = pasalRegex.test(cleaned);

    if (hasPasalHeaders) {
      const segments = cleaned
        .split(/(?=(?:^|\n)\s*(?:PASAL|Pasal|ARTICLE|Article|BAGIAN|Klausul)\s+(?:[IVXLCDM]+|\d+)\b)/)
        .map((s) => s.trim())
        .filter(Boolean);

      rawBlocks = segments.map((seg, idx) => {
        const lines = seg
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        let firstLine = lines[0] || '';
        firstLine = firstLine
          .replace(/^(?:PASAL|Pasal|ARTICLE|Article|BAGIAN|Klausul)\s+(?:[IVXLCDM]+|\d+)\s*[:.\-–—]*\s*/i, '')
          .trim();

        let title = '';
        let contentStartIdx = 1;

        if (firstLine && firstLine.length <= 95 && !/^\(\d+\)/.test(firstLine)) {
          title = firstLine;
          contentStartIdx = 1;
        } else if (lines[1] && lines[1].length <= 95 && !/^\(\d+\)|^\d+\./.test(lines[1])) {
          title = lines[1];
          contentStartIdx = 2;
        } else {
          const words = (firstLine || lines[1] || `Ketentuan Tambahan ${idx + 1}`)
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .trim()
            .split(/\s+/)
            .slice(0, 5)
            .join(' ');
          title = words || `KETENTUAN PASAL IMPOR ${idx + 1}`;
          contentStartIdx = firstLine ? 0 : 1;
        }

        const bodyLines = lines.slice(contentStartIdx);
        const ayats =
          bodyLines.length > 0
            ? bodyLines
            : [firstLine || 'Para Pihak sepakat untuk melaksanakan ketentuan dalam Pasal ini dengan itikad baik.'];

        return {
          title: title.replace(/^[:.\-–—\s]+/, '').trim(),
          content: ayats,
        };
      });
    } else {
      // Split by double newline blocks or numbered sections
      const paragraphs = cleaned
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      rawBlocks = paragraphs.map((block, idx) => {
        const lines = block
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        const firstLine = lines[0] || '';
        const isFirstLineShortHeader =
          lines.length > 1 &&
          firstLine.length <= 85 &&
          !/[.;]$/.test(firstLine);

        if (isFirstLineShortHeader) {
          const cleanHeader = firstLine.replace(/^(?:\d+[.)]|[-•])\s*/, '').trim();
          return {
            title: cleanHeader,
            content: lines.slice(1),
          };
        }

        // Derive title from first few keywords of the paragraph
        const strippedFirst = stripLeadingAyatNumber(firstLine);
        const keyWords = strippedFirst
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3)
          .slice(0, 5)
          .join(' ');
        const derivedTitle = keyWords
          ? `KETENTUAN ${keyWords.toUpperCase()}`
          : `KETENTUAN KLAUSUL IMPOR ${idx + 1}`;

        // If single block has multiple sentences or lines, split into clean ayats
        const ayats =
          lines.length > 1
            ? lines
            : strippedFirst
                .split(/(?<=\.)\s+(?=[A-Z(])/)
                .map((s) => s.trim())
                .filter((s) => s.length > 10);

        return {
          title: derivedTitle,
          content: ayats.length > 0 ? ayats : [strippedFirst],
        };
      });
    }
  }

  // Format each parsed clause using the app's existing numbering hierarchy logic (BulkFormatConfig)
  return rawBlocks.map((block, idx) => {
    const clauseNum = startClauseNumber1Based + idx;
    let formattedNumber = `Pasal ${clauseNum}`;
    if (config.numberingStyle === 'roman_parentheses') {
      formattedNumber = `PASAL ${toRoman(clauseNum)}`;
    }

    const cleanTitle = (block.title || `KETENTUAN PASAL ${clauseNum}`)
      .replace(/^(?:PASAL|Pasal|ARTICLE|Article)\s+(?:[IVXLCDM]+|\d+)\s*[:.\-–—]*\s*/i, '')
      .trim();
    const formattedTitle = config.uppercaseTitles
      ? cleanTitle.toUpperCase()
      : cleanTitle;

    const rawContentList =
      block.content && block.content.length > 0
        ? block.content
        : ['Para Pihak sepakat melaksanakan ketentuan Pasal ini dengan itikad baik.'];

    const formattedContent = rawContentList.map((rawAyat, aIdx) => {
      const ayatNum = aIdx + 1;
      const cleanBody = formatSubItemsToAlpha(stripLeadingAyatNumber(rawAyat));

      let prefix = `(${ayatNum})`;
      if (config.numberingStyle === 'decimal_hierarchy') {
        prefix = `${clauseNum}.${ayatNum}.`;
      } else if (config.numberingStyle === 'numeric_dot') {
        prefix = `${ayatNum}.`;
      } else {
        prefix = `(${ayatNum})`;
      }

      const bodyWithPeriod =
        cleanBody.endsWith('.') || cleanBody.endsWith(';') || cleanBody.endsWith(':')
          ? cleanBody
          : `${cleanBody}.`;
      return `${prefix} ${bodyWithPeriod}`;
    });

    const inferred = inferLegalBasisAndRiskFromText(formattedTitle, formattedContent.join(' '));
    const validRisk =
      block.riskLevel === 'Kritis' ||
      block.riskLevel === 'Perhatian' ||
      block.riskLevel === 'Standar'
        ? block.riskLevel
        : inferred.riskLevel;

    return {
      id: `cl-bulk-import-${Date.now()}-${idx}`,
      number: formattedNumber,
      title: formattedTitle,
      content: formattedContent,
      legalBasis: block.legalBasis || inferred.legalBasis,
      riskLevel: validRisk,
      plainSummary: block.plainSummary,
    };
  });
}
