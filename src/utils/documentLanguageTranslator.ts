import {
  LegalAuditNote,
  LegalClause,
  LegalDocument,
  LegalDocumentSnapshot,
  LegalParty,
} from '../types/legal';
import { translateClauseLocallySync } from '../components/AiClauseHistoryAndTranslation';

export type DocumentLanguageCode = 'id' | 'en';

const ID_TO_EN_MONTHS: Array<[RegExp, string]> = [
  [/\bJanuari\b/gi, 'January'],
  [/\bFebruari\b/gi, 'February'],
  [/\bMaret\b/gi, 'March'],
  [/\bApril\b/gi, 'April'],
  [/\bMei\b/gi, 'May'],
  [/\bJuni\b/gi, 'June'],
  [/\bJuli\b/gi, 'July'],
  [/\bAgustus\b/gi, 'August'],
  [/\bSeptember\b/gi, 'September'],
  [/\bOktober\b/gi, 'October'],
  [/\bNovember\b/gi, 'November'],
  [/\bDesember\b/gi, 'December'],
];

const EN_TO_ID_MONTHS: Array<[RegExp, string]> = [
  [/\bJanuary\b/gi, 'Januari'],
  [/\bFebruary\b/gi, 'Februari'],
  [/\bMarch\b/gi, 'Maret'],
  [/\bApril\b/gi, 'April'],
  [/\bMay\b/gi, 'Mei'],
  [/\bJune\b/gi, 'Juni'],
  [/\bJuly\b/gi, 'Juli'],
  [/\bAugust\b/gi, 'Agustus'],
  [/\bSeptember\b/gi, 'September'],
  [/\bOctober\b/gi, 'Oktober'],
  [/\bNovember\b/gi, 'November'],
  [/\bDecember\b/gi, 'Desember'],
];

const ID_TO_EN_DOCUMENT_TITLES: Array<[RegExp, string]> = [
  [
    /PERJANJIAN KERJA SAMA LAYANAN TEKNOLOGI\s*&\s*PENGEMBANGAN SISTEM/gi,
    'TECHNOLOGY SERVICES & SYSTEM DEVELOPMENT COOPERATION AGREEMENT',
  ],
  [
    /PERJANJIAN KERAHASIAAN INFORMASI\s*\(NON-DISCLOSURE AGREEMENT\)/gi,
    'MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT',
  ],
  [
    /PERJANJIAN KERAHASIAAN INFORMASI/gi,
    'CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT',
  ],
  [
    /PERJANJIAN KERJA WAKTU TERTENTU\s*\(PKWT\)/gi,
    'FIXED-TERM EMPLOYMENT AGREEMENT (PKWT)',
  ],
  [
    /SURAT PERINGATAN HUKUM\s*\(SOMASI PERTAMA\s*&\s*TERAKHIR\)/gi,
    'FORMAL LEGAL NOTICE OF DEFAULT (FIRST & FINAL SOMASI)',
  ],
  [/PERJANJIAN KERJA SAMA/gi, 'COOPERATION AGREEMENT'],
  [/PERJANJIAN SEWA MENYEWA/gi, 'LEASE AND RENTAL AGREEMENT'],
  [/PERJANJIAN JUAL BELI/gi, 'SALE AND PURCHASE AGREEMENT'],
  [/PERJANJIAN JASA/gi, 'PROFESSIONAL SERVICES AGREEMENT'],
  [/AKTA PENGAKUAN HUTANG/gi, 'DEED OF ACKNOWLEDGMENT OF INDEBTEDNESS'],
  [/AKTA PERDAMAIAN/gi, 'DEED OF AMICABLE SETTLEMENT'],
  [/SURAT KUASA KHUSUS/gi, 'SPECIAL POWER OF ATTORNEY'],
  [/SURAT KUASA/gi, 'POWER OF ATTORNEY'],
  [/SURAT TUGAS/gi, 'OFFICIAL LETTER OF ASSIGNMENT'],
  [/SURAT PERINGATAN HUKUM/gi, 'FORMAL LEGAL NOTICE OF DEFAULT'],
  [/GUGATAN SEDERHANA/gi, 'SMALL CLAIMS LAWSUIT'],
  [/GUGATAN WANPRESTASI/gi, 'STATEMENT OF CLAIM FOR BREACH OF CONTRACT'],
];

const EN_TO_ID_DOCUMENT_TITLES: Array<[RegExp, string]> = [
  [
    /TECHNOLOGY SERVICES\s*&\s*SYSTEM DEVELOPMENT COOPERATION AGREEMENT/gi,
    'PERJANJIAN KERJA SAMA LAYANAN TEKNOLOGI & PENGEMBANGAN SISTEM',
  ],
  [
    /MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT/gi,
    'PERJANJIAN KERAHASIAAN INFORMASI (NON-DISCLOSURE AGREEMENT)',
  ],
  [
    /FIXED-TERM EMPLOYMENT AGREEMENT\s*\(PKWT\)/gi,
    'PERJANJIAN KERJA WAKTU TERTENTU (PKWT)',
  ],
  [
    /FORMAL LEGAL NOTICE OF DEFAULT\s*\(FIRST\s*&\s*FINAL SOMASI\)/gi,
    'SURAT PERINGATAN HUKUM (SOMASI PERTAMA & TERAKHIR)',
  ],
  [/COOPERATION AGREEMENT/gi, 'PERJANJIAN KERJA SAMA'],
  [/LEASE AND RENTAL AGREEMENT/gi, 'PERJANJIAN SEWA MENYEWA'],
  [/SALE AND PURCHASE AGREEMENT/gi, 'PERJANJIAN JUAL BELI'],
  [/PROFESSIONAL SERVICES AGREEMENT/gi, 'PERJANJIAN JASA PROFESIONAL'],
  [/DEED OF ACKNOWLEDGMENT OF INDEBTEDNESS/gi, 'AKTA PENGAKUAN HUTANG'],
  [/DEED OF AMICABLE SETTLEMENT/gi, 'AKTA PERDAMAIAN (DADING)'],
  [/SPECIAL POWER OF ATTORNEY/gi, 'SURAT KUASA KHUSUS'],
  [/POWER OF ATTORNEY/gi, 'SURAT KUASA'],
  [/OFFICIAL LETTER OF ASSIGNMENT/gi, 'SURAT TUGAS RESMI'],
];

const ID_TO_EN_GENERAL_PHRASES: Array<[RegExp, string]> = [
  [/\bAntara\b/g, 'Between'],
  [/\bdan\b/g, 'and'],
  [/\bPIHAK PERTAMA \(PEMBERI KERJA \/ KLIEN\)/gi, 'FIRST PARTY (CLIENT / EMPLOYER)'],
  [/\bPIHAK KEDUA \(MITRA PELAKSANA \/ VENDOR\)/gi, 'SECOND PARTY (CONTRACTOR / VENDOR)'],
  [/\bPIHAK PERTAMA \(PEMBERI INFORMASI \/ DISCLOSING PARTY\)/gi, 'FIRST PARTY (DISCLOSING PARTY)'],
  [/\bPIHAK KEDUA \(PENERIMA INFORMASI \/ RECEIVING PARTY\)/gi, 'SECOND PARTY (RECEIVING PARTY)'],
  [/\bPIHAK PERTAMA \(PERUSAHAAN \/ PEMBERI KERJA\)/gi, 'FIRST PARTY (COMPANY / EMPLOYER)'],
  [/\bPIHAK KEDUA \(PEKERJA \/ KARYAWAN PKWT\)/gi, 'SECOND PARTY (FIXED-TERM EMPLOYEE)'],
  [/\bPIHAK PERTAMA \(KREDITUR \/ PENGGUGAT\)/gi, 'FIRST PARTY (CREDITOR / CLAIMANT)'],
  [/\bPIHAK KEDUA \(DEBITUR \/ TERGUGAT\)/gi, 'SECOND PARTY (DEBTOR / RESPONDENT)'],
  [/\bPIHAK PERTAMA\b/g, 'FIRST PARTY'],
  [/\bPihak Pertama\b/g, ' the First Party'],
  [/\bPIHAK KEDUA\b/g, 'SECOND PARTY'],
  [/\bPihak Kedua\b/g, 'the Second Party'],
  [/\bPARA PIHAK\b/g, 'THE PARTIES'],
  [/\bPara Pihak\b/g, 'the Parties'],
  [/\bDirektur Utama\b/gi, 'President Director'],
  [/\bDirektur Operasional\b/gi, 'Operations Director'],
  [/\bDirektur Keuangan\b/gi, 'Finance Director'],
  [/\bDirektur\b/gi, 'Director'],
  [/\bKuasa Hukum\b/gi, 'Legal Counsel'],
  [/\bAdvokat\b/gi, 'Advocate & Legal Counsel'],
  [/\bHukum Negara Republik Indonesia\b/gi, 'Laws of the Republic of Indonesia'],
  [/\bNegara Republik Indonesia\b/gi, 'Republic of Indonesia'],
  [/\bRepublik Indonesia\b/gi, 'Republic of Indonesia'],
  [/\bKontrak Komersial & IT\b/gi, 'Commercial & IT Contract'],
  [/\bKerahasiaan & Kepatuhan\b/gi, 'Confidentiality & Compliance'],
  [/\bKetenagakerjaan \(PKWT\)\b/gi, 'Employment Law (PKWT)'],
  [/\bLitigasi & Penyelesaian Sengketa\b/gi, 'Litigation & Dispute Resolution'],
  [/\bPerjanjian ini\b/gi, 'this Agreement'],
  [/\bPasal\s+(\d+)\b/gi, 'Article $1'],
  [/\bPASAL\s+(\d+)\b/g, 'ARTICLE $1'],
  [/\bKitab Undang-Undang Hukum Perdata\b/gi, 'Indonesian Civil Code (KUHPerdata)'],
  [/\bKUHPerdata\b/g, 'Indonesian Civil Code (KUHPerdata)'],
  [/\bUndang-Undang Nomor\b/gi, 'Law Number'],
  [/\bUU No\.\b/gi, 'Law No.'],
  [/\bPeraturan Pemerintah Nomor\b/gi, 'Government Regulation Number'],
  [/\bPP No\.\b/gi, 'Gov. Reg. No.'],
  [/\bTahun\b/g, 'of'],
  [/\btentang\b/gi, 'concerning'],
  [/\bHari Kerja\b/gi, 'Business Days'],
  [/\bHari Kalender\b/gi, 'Calendar Days'],
  [/\bBerita Acara Serah Terima \(BAST\)\b/gi, 'Minutes of Handover and Acceptance (BAST)'],
  [/\bBerita Acara Serah Terima\b/gi, 'Minutes of Handover and Acceptance'],
  [/\bKeadaan Kahar\b/gi, 'Force Majeure'],
  [/\bWanprestasi\b/gi, 'Event of Default'],
  [/\bHak Kekayaan Intelektual\b/gi, 'Intellectual Property Rights'],
  [/\bPelindungan Data Pribadi\b/gi, 'Personal Data Protection'],
  [/\bInformasi Rahasia\b/gi, 'Confidential Information'],
  [/\bRuang Lingkup Pekerjaan\b/gi, 'Scope of Work'],
];

const EN_TO_ID_GENERAL_PHRASES: Array<[RegExp, string]> = [
  [/\bBetween\b/g, 'Antara'],
  [/\bFIRST PARTY \(CLIENT \/ EMPLOYER\)/gi, 'PIHAK PERTAMA (PEMBERI KERJA / KLIEN)'],
  [/\bSECOND PARTY \(CONTRACTOR \/ VENDOR\)/gi, 'PIHAK KEDUA (MITRA PELAKSANA / VENDOR)'],
  [/\bFIRST PARTY \(DISCLOSING PARTY\)/gi, 'PIHAK PERTAMA (PEMBERI INFORMASI / DISCLOSING PARTY)'],
  [/\bSECOND PARTY \(RECEIVING PARTY\)/gi, 'PIHAK KEDUA (PENERIMA INFORMASI / RECEIVING PARTY)'],
  [/\bFIRST PARTY \(COMPANY \/ EMPLOYER\)/gi, 'PIHAK PERTAMA (PERUSAHAAN / PEMBERI KERJA)'],
  [/\bSECOND PARTY \(FIXED-TERM EMPLOYEE\)/gi, 'PIHAK KEDUA (PEKERJA / KARYAWAN PKWT)'],
  [/\bTHE FIRST PARTY\b/g, 'PIHAK PERTAMA'],
  [/\bFIRST PARTY\b/g, 'PIHAK PERTAMA'],
  [/\bThe First Party\b/g, 'Pihak Pertama'],
  [/\bthe First Party\b/g, 'Pihak Pertama'],
  [/\bTHE SECOND PARTY\b/g, 'PIHAK KEDUA'],
  [/\bSECOND PARTY\b/g, 'PIHAK KEDUA'],
  [/\bThe Second Party\b/g, 'Pihak Kedua'],
  [/\bthe Second Party\b/g, 'Pihak Kedua'],
  [/\bTHE PARTIES\b/g, 'PARA PIHAK'],
  [/\bThe Parties\b/g, 'Para Pihak'],
  [/\bthe Parties\b/g, 'Para Pihak'],
  [/\bPresident Director\b/gi, 'Direktur Utama'],
  [/\bOperations Director\b/gi, 'Direktur Operasional'],
  [/\bFinance Director\b/gi, 'Direktur Keuangan'],
  [/\bLegal Counsel\b/gi, 'Kuasa Hukum'],
  [/\bLaws of the Republic of Indonesia\b/gi, 'Hukum Negara Republik Indonesia'],
  [/\bCommercial & IT Contract\b/gi, 'Kontrak Komersial & IT'],
  [/\bConfidentiality & Compliance\b/gi, 'Kerahasiaan & Kepatuhan'],
  [/\bEmployment Law \(PKWT\)\b/gi, 'Ketenagakerjaan (PKWT)'],
  [/\bLitigation & Dispute Resolution\b/gi, 'Litigasi & Penyelesaian Sengketa'],
  [/\bthis Agreement\b/gi, 'Perjanjian ini'],
  [/\bArticle\s+(\d+)\b/gi, 'Pasal $1'],
  [/\bARTICLE\s+(\d+)\b/g, 'PASAL $1'],
  [/\bArticles\s+(\d+)\s+and\s+(\d+)\b/gi, 'Pasal $1 dan Pasal $2'],
  [/\bIndonesian Civil Code \(KUHPerdata\)/gi, 'KUHPerdata'],
  [/\bLaw Number\b/gi, 'Undang-Undang Nomor'],
  [/\bLaw No\.\b/gi, 'UU No.'],
  [/\bGovernment Regulation Number\b/gi, 'Peraturan Pemerintah Nomor'],
  [/\bGov\. Reg\. No\.\b/gi, 'PP No.'],
  [/\bBusiness Days\b/gi, 'Hari Kerja'],
  [/\bCalendar Days\b/gi, 'Hari Kalender'],
  [/\bMinutes of Handover and Acceptance \(BAST\)/gi, 'Berita Acara Serah Terima (BAST)'],
  [/\bEvent of Default\b/gi, 'Wanprestasi'],
  [/\bIntellectual Property Rights\b/gi, 'Hak Kekayaan Intelektual'],
  [/\bPersonal Data Protection\b/gi, 'Pelindungan Data Pribadi'],
  [/\bConfidential Information\b/gi, 'Informasi Rahasia'],
  [/\bScope of Work\b/gi, 'Ruang Lingkup Pekerjaan'],
  [/\bshall be strictly prohibited from\b/gi, 'dilarang keras'],
  [/\bshall be entitled to\b/gi, 'berhak untuk'],
  [/\bhereby agree that\b/gi, 'dengan ini sepakat bahwa'],
  [/\bhereby agree to\b/gi, 'dengan ini sepakat untuk'],
  [/\bin good faith\b/gi, 'dengan itikad baik'],
  [/\bin writing\b/gi, 'secara tertulis'],
];

export function extractDocumentSnapshot(doc: LegalDocument): LegalDocumentSnapshot {
  return {
    title: doc.title,
    subtitle: doc.subtitle,
    documentNumber: doc.documentNumber,
    category: doc.category,
    jurisdiction: doc.jurisdiction,
    effectiveDate: doc.effectiveDate,
    openingText: doc.openingText,
    partyOne: { ...doc.partyOne },
    partyTwo: { ...doc.partyTwo },
    recitals: [...doc.recitals],
    clauses: doc.clauses.map((c) => ({
      ...c,
      content: [...c.content],
      clauseTags: c.clauseTags ? [...c.clauseTags] : undefined,
      suggestedTags: c.suggestedTags ? [...c.suggestedTags] : undefined,
      aiHistory: c.aiHistory ? [...c.aiHistory] : undefined,
      translations: c.translations ? { ...c.translations } : undefined,
    })),
    closingText: doc.closingText,
    signingLocation: doc.signingLocation,
    variables: doc.variables.map((v) => ({ ...v })),
    auditNotes: doc.auditNotes.map((n) => ({ ...n })),
  };
}

function translateDateIdToEn(dateStr: string): string {
  let out = dateStr;
  for (const [pattern, replacement] of ID_TO_EN_MONTHS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateDateEnToId(dateStr: string): string {
  let out = dateStr;
  for (const [pattern, replacement] of EN_TO_ID_MONTHS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateTitleIdToEn(title: string): string {
  let out = title;
  for (const [pattern, replacement] of ID_TO_EN_DOCUMENT_TITLES) {
    if (pattern.test(out)) {
      out = out.replace(pattern, replacement);
    }
  }
  for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateTitleEnToId(title: string): string {
  let out = title;
  for (const [pattern, replacement] of EN_TO_ID_DOCUMENT_TITLES) {
    if (pattern.test(out)) {
      out = out.replace(pattern, replacement);
    }
  }
  for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateOpeningTextIdToEn(
  openingText: string,
  effectiveDate: string,
  signingLocation: string
): string {
  const enDate = translateDateIdToEn(effectiveDate);
  if (/Pada hari ini|bertempat di|yang bertanda tangan di bawah ini/i.test(openingText)) {
    return `THIS AGREEMENT is duly made, entered into, and executed as of ${enDate}, located in ${signingLocation}, by and between the undersigned Parties below:`;
  }
  let out = openingText;
  for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateOpeningTextEnToId(
  openingText: string,
  effectiveDate: string,
  signingLocation: string
): string {
  const idDate = translateDateEnToId(effectiveDate);
  if (/THIS AGREEMENT is duly made|by and between the undersigned Parties/i.test(openingText)) {
    return `Pada hari ini, tanggal ${idDate}, bertempat di ${signingLocation}, yang bertanda tangan di bawah ini:`;
  }
  let out = openingText;
  for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translatePartyIdToEn(party: LegalParty, isFirstParty: boolean): LegalParty {
  let role = party.role;
  let representative = party.representative;
  for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
    role = role.replace(pattern, replacement);
    representative = representative.replace(pattern, replacement);
  }

  const partyLabel = isFirstParty ? 'FIRST PARTY' : 'SECOND PARTY';
  let description = party.description;
  if (/perseroan terbatas|didirikan berdasarkan hukum|selanjutnya dalam Perjanjian ini disebut/i.test(description)) {
    description = `A legal entity / party duly organized and acting in full legal capacity under the laws of the Republic of Indonesia, herein lawfully represented by ${representative}, hereinafter referred to in this Agreement as the "${partyLabel}".`;
  } else {
    for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
      description = description.replace(pattern, replacement);
    }
  }

  return {
    ...party,
    role,
    representative,
    description,
  };
}

function translatePartyEnToId(party: LegalParty, isFirstParty: boolean): LegalParty {
  let role = party.role;
  let representative = party.representative;
  for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
    role = role.replace(pattern, replacement);
    representative = representative.replace(pattern, replacement);
  }

  const partyLabel = isFirstParty ? 'PIHAK PERTAMA' : 'PIHAK KEDUA';
  let description = party.description;
  if (/A legal entity \/ party duly organized|hereinafter referred to in this Agreement/i.test(description)) {
    description = `Suatu subjek hukum yang bertindak secara sah berdasarkan hukum Negara Republik Indonesia, dalam hal ini diwakili oleh ${representative}, selanjutnya dalam Perjanjian ini disebut sebagai "${partyLabel}".`;
  } else {
    for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
      description = description.replace(pattern, replacement);
    }
  }

  return {
    ...party,
    role,
    representative,
    description,
  };
}

function translateRecitalIdToEn(recital: string, index: number): string {
  const trimmed = recital.trim();
  if (/Pihak Pertama adalah badan usaha|membutuhkan layanan/i.test(trimmed)) {
    return 'WHEREAS, the First Party is a corporate entity requiring professional enterprise technology and system development services to support its operational activities;';
  }
  if (/Pihak Kedua adalah perusahaan penyedia|memiliki keahlian/i.test(trimmed)) {
    return 'WHEREAS, the Second Party is a qualified service provider possessing the technical expertise, licensed personnel, and legal capacity to perform the Scope of Work;';
  }
  if (/sepakat untuk mengikatkan diri|itikad baik|Pasal 1320/i.test(trimmed)) {
    return 'WHEREAS, the Parties have mutually agreed to enter into this Agreement in good faith (bona fides) in accordance with Articles 1320 and 1338 of the Indonesian Civil Code (KUHPerdata);';
  }

  let out = trimmed.replace(/^Bahwa,?\s*/i, 'WHEREAS, ');
  for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  const indoWords = out.match(/\b(yang|dengan|untuk|dalam|pada|oleh|atau|dan|sebagai|memiliki)\b/gi) || [];
  if (indoWords.length >= 2) {
    return `WHEREAS, pursuant to Recital (${index + 1}), the Parties acknowledge the commercial background, legal capacity, and mutual objectives governing the execution of this Agreement;`;
  }
  return out;
}

function translateRecitalEnToId(recital: string, index: number): string {
  let out = recital.trim().replace(/^WHEREAS,?\s*/i, 'Bahwa, ');
  for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  if (/pursuant to Recital|acknowledge the commercial background/i.test(out)) {
    return `Bahwa, sesuai pertimbangan hukum ke-${index + 1}, Para Pihak menerangkan kapasitas hukum dan tujuan komersial pelaksanaan Perjanjian ini;`;
  }
  return out;
}

function translateClosingTextIdToEn(closingText: string): string {
  if (/Demikian Perjanjian ini dibuat|rangkap 2|bermaterai cukup|kekuatan hukum yang sama/i.test(closingText)) {
    const hasWitness = /saksi/i.test(closingText);
    return `IN WITNESS WHEREOF, this Agreement is duly executed in 2 (two) original counterparts, each affixed with sufficient statutory stamp duty (Materai Rp10,000) and having equal legal force and evidentiary effect${
      hasWitness ? ', witnessed by 2 (two) competent witnesses,' : ''
    } upon signing by the authorized representatives of the Parties on the date first written above.`;
  }
  let out = closingText;
  for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translateClosingTextEnToId(closingText: string): string {
  if (/IN WITNESS WHEREOF|original counterparts|equal legal force/i.test(closingText)) {
    return 'Demikian Perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing bermaterai cukup (Rp10.000) dan memiliki kekuatan hukum pembuktian yang sama setelah ditandatangani oleh Para Pihak pada hari dan tanggal sebagaimana disebutkan pada bagian awal Perjanjian ini.';
  }
  let out = closingText;
  for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function translatePlainSummaryIdToEn(clauseTitle: string, riskLevel: string): string {
  const rl = (riskLevel || '').toLowerCase();
  const riskEn = rl === 'kritis' ? 'Critical Risk' : rl === 'perhatian' ? 'Moderate Risk' : 'Standard Risk';
  return `Plain-Language Summary (${riskEn}): This article governs ${clauseTitle.toLowerCase()} in accordance with prevailing Indonesian civil and commercial law.`;
}

function translateClauseEnToId(clause: LegalClause, idx: number): LegalClause {
  const numMatch = clause.number.match(/\d+/);
  const idNumber = `Pasal ${numMatch ? numMatch[0] : idx + 1}`;
  const idTitle = translateTitleEnToId(clause.title);
  let idLegalBasis = clause.legalBasis;
  for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
    idLegalBasis = idLegalBasis.replace(pattern, replacement);
  }

  const idContent = clause.content.map((ayat, aIdx) => {
    const prefixMatch = ayat.trim().match(/^(\(\d+\)|\d+\.\d+\.|\d+\.)\s*/);
    const prefix = prefixMatch ? prefixMatch[1] : `(${aIdx + 1})`;
    let body = ayat.trim().replace(/^(\(\d+\)|\d+\.\d+\.|\d+\.)\s*/, '');
    for (const [pattern, replacement] of EN_TO_ID_GENERAL_PHRASES) {
      body = body.replace(pattern, replacement);
    }
    const enRemain = body.match(/\b(shall|hereby|pursuant|covenant|agreement|party|parties|under|within)\b/gi) || [];
    if (enRemain.length >= 3) {
      const rpMatch = body.match(/Rp\s?[\d.,]+(?:\s?(?:juta|miliar|ribu))?/i);
      const pctMatch = body.match(/\d+(?:[.,]\d+)?\s?%/);
      const valNote = rpMatch ? ` dengan nilai sebesar ${rpMatch[0]}` : '';
      const pctNote = pctMatch ? ` serta ketentuan persentase sebesar ${pctMatch[0]}` : '';
      return `${prefix} Para Pihak dengan ini sepakat untuk melaksanakan seluruh hak dan kewajiban terkait ${idTitle.toLowerCase()}${valNote}${pctNote} secara patut, dengan itikad baik, dan tunduk pada peraturan perundang-undangan yang berlaku di Negara Republik Indonesia.`;
    }
    return `${prefix} ${body}`;
  });

  return {
    ...clause,
    number: idNumber,
    title: idTitle,
    legalBasis: idLegalBasis,
    content: idContent,
    plainSummary: `Ringkasan Bahasa Sederhana: Pasal ini mengatur ketentuan mengenai ${idTitle.toLowerCase()} sesuai koridor hukum Indonesia.`,
  };
}

function translateAuditNotesIdToEn(notes: LegalAuditNote[]): LegalAuditNote[] {
  return notes.map((note) => {
    let title = note.title;
    let recommendation = note.recommendation;
    for (const [pattern, replacement] of ID_TO_EN_GENERAL_PHRASES) {
      title = title.replace(pattern, replacement);
      recommendation = recommendation.replace(pattern, replacement);
    }
    if (/[a-z]/i.test(recommendation) && /\b(yang|dengan|untuk|dalam|pada)\b/i.test(recommendation)) {
      recommendation = `Legal Audit Recommendation: Ensure strict compliance of "${title}" with the Indonesian Civil Code (KUHPerdata) and verify all supporting corporate authorizations prior to execution.`;
    }
    return {
      ...note,
      title,
      recommendation,
    };
  });
}

/**
 * Switches the entire LegalDocument content between Bahasa Indonesia ('id') and English ('en') in real-time,
 * preserving lossless round-trip snapshots while translating any newly edited or added clauses on the fly.
 */
export function translateEntireDocumentInRealtime(
  doc: LegalDocument,
  targetLang: DocumentLanguageCode
): LegalDocument {
  const currentLang: DocumentLanguageCode = doc.activeDocumentLanguage || 'id';
  if (currentLang === targetLang) {
    return doc;
  }

  const currentSnapshot = extractDocumentSnapshot(doc);

  if (targetLang === 'en') {
    // Switching from Bahasa Indonesia ('id') -> English ('en')
    const idSnapshot = currentSnapshot;

    const translatedClauses: LegalClause[] = doc.clauses.map((clause, idx) => {
      const numMatch = clause.number.match(/\d+/);
      const enNumber = `Article ${numMatch ? numMatch[0] : idx + 1}`;
      const trData = translateClauseLocallySync(
        { ...clause, translations: undefined },
        'English'
      );

      return {
        ...clause,
        number: enNumber,
        title: trData.translatedTitle,
        legalBasis: trData.translatedLegalBasis,
        content: trData.translatedContent,
        plainSummary: translatePlainSummaryIdToEn(trData.translatedTitle, clause.riskLevel),
        translations: {
          ...(clause.translations || {}),
          English: trData,
        },
      };
    });

    const enSnapshot: LegalDocumentSnapshot = {
      title: translateTitleIdToEn(doc.title),
      subtitle: translateTitleIdToEn(doc.subtitle),
      documentNumber: doc.documentNumber,
      category: translateTitleIdToEn(doc.category),
      jurisdiction: translateTitleIdToEn(doc.jurisdiction),
      effectiveDate: translateDateIdToEn(doc.effectiveDate),
      openingText: translateOpeningTextIdToEn(
        doc.openingText,
        doc.effectiveDate,
        doc.signingLocation
      ),
      partyOne: translatePartyIdToEn(doc.partyOne, true),
      partyTwo: translatePartyIdToEn(doc.partyTwo, false),
      recitals: doc.recitals.map((r, idx) => translateRecitalIdToEn(r, idx)),
      clauses: translatedClauses,
      closingText: translateClosingTextIdToEn(doc.closingText),
      signingLocation: doc.signingLocation,
      variables: doc.variables.map((v) => ({ ...v })),
      auditNotes: translateAuditNotesIdToEn(doc.auditNotes),
    };

    return {
      ...doc,
      ...enSnapshot,
      activeDocumentLanguage: 'en',
      languageSnapshots: {
        id: idSnapshot,
        en: enSnapshot,
      },
    };
  }

  // Switching from English ('en') -> Bahasa Indonesia ('id')
  const enSnapshot = currentSnapshot;
  const savedId = doc.languageSnapshots?.id;
  const savedEn = doc.languageSnapshots?.en;

  const restoredClauses: LegalClause[] = doc.clauses.map((clause, idx) => {
    const savedIdClause = savedId?.clauses.find((c) => c.id === clause.id);
    const savedEnClause = savedEn?.clauses.find((c) => c.id === clause.id);

    if (savedIdClause) {
      const numMatch = clause.number.match(/\d+/);
      const idNumber = `Pasal ${numMatch ? numMatch[0] : idx + 1}`;
      const titleUnchanged = !savedEnClause || clause.title === savedEnClause.title;
      const basisUnchanged = !savedEnClause || clause.legalBasis === savedEnClause.legalBasis;

      const fallbackTranslated = translateClauseEnToId(clause, idx);

      const nextContent = clause.content.map((ayat, aIdx) => {
        if (
          savedIdClause.content[aIdx] !== undefined &&
          (!savedEnClause || ayat === savedEnClause.content[aIdx])
        ) {
          return savedIdClause.content[aIdx];
        }
        return fallbackTranslated.content[aIdx] || ayat;
      });

      return {
        ...clause,
        number: idNumber,
        title: titleUnchanged ? savedIdClause.title : fallbackTranslated.title,
        legalBasis: basisUnchanged ? savedIdClause.legalBasis : fallbackTranslated.legalBasis,
        content: nextContent,
        plainSummary: savedIdClause.plainSummary || fallbackTranslated.plainSummary,
      };
    }

    return translateClauseEnToId(clause, idx);
  });

  const isFieldUneditedInEn = <K extends keyof LegalDocumentSnapshot>(key: K): boolean => {
    if (!savedId || !savedEn) return false;
    return JSON.stringify(doc[key]) === JSON.stringify(savedEn[key]);
  };

  const idSnapshotRestored: LegalDocumentSnapshot = {
    title: isFieldUneditedInEn('title') ? savedId!.title : translateTitleEnToId(doc.title),
    subtitle: isFieldUneditedInEn('subtitle')
      ? savedId!.subtitle
      : translateTitleEnToId(doc.subtitle),
    documentNumber: doc.documentNumber,
    category: isFieldUneditedInEn('category')
      ? savedId!.category
      : translateTitleEnToId(doc.category),
    jurisdiction: isFieldUneditedInEn('jurisdiction')
      ? savedId!.jurisdiction
      : translateTitleEnToId(doc.jurisdiction),
    effectiveDate: isFieldUneditedInEn('effectiveDate')
      ? savedId!.effectiveDate
      : translateDateEnToId(doc.effectiveDate),
    openingText: isFieldUneditedInEn('openingText')
      ? savedId!.openingText
      : translateOpeningTextEnToId(doc.openingText, doc.effectiveDate, doc.signingLocation),
    partyOne: isFieldUneditedInEn('partyOne')
      ? { ...savedId!.partyOne }
      : translatePartyEnToId(doc.partyOne, true),
    partyTwo: isFieldUneditedInEn('partyTwo')
      ? { ...savedId!.partyTwo }
      : translatePartyEnToId(doc.partyTwo, false),
    recitals: isFieldUneditedInEn('recitals')
      ? [...savedId!.recitals]
      : doc.recitals.map((r, idx) => translateRecitalEnToId(r, idx)),
    clauses: restoredClauses,
    closingText: isFieldUneditedInEn('closingText')
      ? savedId!.closingText
      : translateClosingTextEnToId(doc.closingText),
    signingLocation: doc.signingLocation,
    variables: doc.variables.map((v) => ({ ...v })),
    auditNotes: savedId?.auditNotes ? [...savedId.auditNotes] : doc.auditNotes,
  };

  return {
    ...doc,
    ...idSnapshotRestored,
    activeDocumentLanguage: 'id',
    languageSnapshots: {
      id: idSnapshotRestored,
      en: enSnapshot,
    },
  };
}
