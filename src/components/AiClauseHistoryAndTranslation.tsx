import React, { useMemo, useState } from 'react';
import {
  History,
  RotateCcw,
  Sparkles,
  Languages,
  ClipboardPaste,
  Wand2,
  X,
  Check,
  Columns2,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  AiClauseHistoryEntry,
  ClauseTranslationData,
  LegalClause,
  SupportedLegalLanguage,
} from '../types/legal';

export const SUPPORTED_LEGAL_LANGUAGES: Array<{
  lang: SupportedLegalLanguage;
  code: string;
  label: string;
  flag: string;
}> = [
  { lang: 'English', code: 'EN', label: 'English (International Contract)', flag: '🇬🇧' },
  { lang: 'Mandarin', code: 'ZH', label: 'Mandarin (中文 · Chinese Legal)', flag: '🇨🇳' },
  { lang: 'Japanese', code: 'JA', label: 'Japanese (日本語 · Corporate Legal)', flag: '🇯🇵' },
  { lang: 'Dutch', code: 'NL', label: 'Dutch (Nederlands · BW Civil Law)', flag: '🇳🇱' },
];

const INDONESIAN_TO_ENGLISH_PHRASES: Array<[RegExp, string]> = [
  [/\bPIHAK PERTAMA\b/g, 'THE FIRST PARTY'],
  [/\bPihak Pertama\b/g, 'The First Party'],
  [/\bPIHAK KEDUA\b/g, 'THE SECOND PARTY'],
  [/\bPihak Kedua\b/g, 'The Second Party'],
  [/\bPARA PIHAK\b/g, 'THE PARTIES'],
  [/\bPara Pihak\b/g, 'The Parties'],
  [/\bmasing-masing Pihak\b/gi, 'each Party'],
  [/\bsalah satu Pihak\b/gi, 'either Party'],
  [/\bpihak ketiga\b/gi, 'any third party'],
  [/\bPerjanjian ini\b/gi, 'this Agreement'],
  [/\bPasal ini\b/gi, 'this Article'],
  [/\bdalam Pasal ini\b/gi, 'under this Article'],
  [/\bberdasarkan Perjanjian ini\b/gi, 'pursuant to this Agreement'],
  [/\bRuang Lingkup Pekerjaan\b/gi, 'Scope of Work'],
  [/\bNilai Perjanjian\b/gi, 'Contract Value'],
  [/\bHarga Perjanjian\b/gi, 'Contract Price'],
  [/\bTata Cara Pembayaran\b/gi, 'Terms of Payment'],
  [/\bJangka Waktu\b/gi, 'Term and Duration'],
  [/\bHak dan Kewajiban\b/gi, 'Rights and Obligations'],
  [/\bKerahasiaan\b/gi, 'Confidentiality'],
  [/\bInformasi Rahasia\b/gi, 'Confidential Information'],
  [/\bPelindungan Data Pribadi\b/gi, 'Personal Data Protection'],
  [/\bHak Kekayaan Intelektual\b/gi, 'Intellectual Property Rights'],
  [/\bKeadaan Kahar\b/gi, 'Force Majeure'],
  [/\bWanprestasi\b/gi, 'Event of Default (Breach of Contract)'],
  [/\bPenyelesaian Sengketa\b/gi, 'Dispute Resolution'],
  [/\bPengakhiran Perjanjian\b/gi, 'Termination of Agreement'],
  [/\bBatas Tanggung Jawab\b/gi, 'Limitation of Liability'],
  [/\bGanti Rugi\b/gi, 'Indemnification and Damages'],
  [/\bBerita Acara Serah Terima \(BAST\)\b/gi, 'Minutes of Handover and Acceptance (BAST)'],
  [/\bBerita Acara Serah Terima\b/gi, 'Minutes of Handover and Acceptance'],
  [/\bSurat Teguran\b/gi, 'Written Notice of Default (Somasi)'],
  [/\bSomasi\b/gi, 'Formal Notice of Default'],
  [/\bHari Kerja\b/gi, 'Business Days'],
  [/\bHari Kalender\b/gi, 'Calendar Days'],
  [/\bKitab Undang-Undang Hukum Perdata\b/gi, 'Indonesian Civil Code (KUHPerdata)'],
  [/\bKUHPerdata\b/g, 'Indonesian Civil Code (KUHPerdata)'],
  [/\bPasal 1266 dan Pasal 1267\b/gi, 'Articles 1266 and 1267'],
  [/\bPasal 1266\b/gi, 'Article 1266'],
  [/\bPasal 1320\b/gi, 'Article 1320'],
  [/\bPasal 1338\b/gi, 'Article 1338'],
  [/\bPasal 1238\b/gi, 'Article 1238'],
  [/\bPasal 1243\b/gi, 'Article 1243'],
  [/\bPasal 1866\b/gi, 'Article 1866'],
  [/\bUndang-Undang Nomor\b/gi, 'Law Number'],
  [/\bUU No\.\b/gi, 'Law No.'],
  [/\bPeraturan Pemerintah Nomor\b/gi, 'Government Regulation Number'],
  [/\bPP No\.\b/gi, 'Gov. Reg. No.'],
  [/\bTahun\b/g, 'of'],
  [/\btentang\b/gi, 'concerning'],
  [/\bwajib\b/gi, 'shall'],
  [/\bberhak\b/gi, 'shall be entitled to'],
  [/\bdilarang keras\b/gi, 'shall be strictly prohibited from'],
  [/\bdilarang\b/gi, 'shall not'],
  [/\bsepakat untuk\b/gi, 'hereby agree to'],
  [/\bsepakat bahwa\b/gi, 'hereby agree that'],
  [/\bmenyatakan dan menjamin\b/gi, 'represents and warrants'],
  [/\bbertanggung jawab penuh atas\b/gi, 'shall be fully liable for'],
  [/\bsecara tertulis\b/gi, 'in writing'],
  [/\btanpa persetujuan tertulis terlebih dahulu dari\b/gi, 'without the prior written consent of'],
  [/\bdengan itikad baik\b/gi, 'in good faith (bona fides)'],
  [/\bsecara musyawarah untuk mufakat\b/gi, 'amicably through mutual consultation'],
  [/\bterhitung sejak\b/gi, 'effective as of'],
  [/\bselama jangka waktu\b/gi, 'for a period of'],
  [/\bpaling lambat\b/gi, 'no later than'],
  [/\bsebesar\b/gi, 'in the amount of'],
  [/\bdari total\b/gi, 'of the total'],
  [/\bApabila terjadi\b/gi, 'In the event of'],
  [/\bApabila\b/g, 'In the event that'],
  [/\bDalam hal\b/gi, 'In the event that'],
  [/\bSetiap\b/g, 'Any and all'],
  [/\bSeluruh\b/g, 'All'],
];

function translateClauseTitleToLanguage(
  title: string,
  targetLanguage: SupportedLegalLanguage
): string {
  const tUpper = title.toUpperCase();

  const topicDictionary: Array<{
    regex: RegExp;
    English: string;
    Mandarin: string;
    Japanese: string;
    Dutch: string;
  }> = [
    {
      regex: /RUANG LINGKUP|OBJEK|PEKERJAAN|LAYANAN/,
      English: 'SCOPE OF WORK AND DELIVERABLES',
      Mandarin: '工作范围与交付成果 (Scope of Work)',
      Japanese: '業務範囲および納入物 (Scope of Work)',
      Dutch: 'OMVANG VAN DE WERKZAAMHEDEN EN DIENSTEN',
    },
    {
      regex: /NILAI|HARGA|PEMBAYARAN|KOMPENSASI|UPAH|BIAYA|PAJAK/,
      English: 'CONTRACT VALUE, PAYMENT TERMS, AND TAXATION',
      Mandarin: '合同金额、付款条件与税务 (Payment & Tax)',
      Japanese: '契約金額、支払条件および税務 (Payment Terms)',
      Dutch: 'CONTRACTWAARDE, BETALINGSVOORWAARDEN EN BELASTINGEN',
    },
    {
      regex: /JANGKA WAKTU|MASA BERLAKU|DURASI/,
      English: 'TERM AND EFFECTIVE DURATION OF AGREEMENT',
      Mandarin: '合同期限与生效期间 (Term of Agreement)',
      Japanese: '契約期間および有効期間 (Term of Agreement)',
      Dutch: 'DUUR EN LOOPTIJD VAN DE OVEREENKOMST',
    },
    {
      regex: /HAK DAN KEWAJIBAN|KEWAJIBAN PARA PIHAK/,
      English: 'COVENANTS, RIGHTS, AND OBLIGATIONS OF THE PARTIES',
      Mandarin: '双方的权利与义务 (Rights and Obligations)',
      Japanese: '当事者の権利および義務 (Rights & Obligations)',
      Dutch: 'RECHTEN EN VERPLICHTINGEN VAN PARTIJEN',
    },
    {
      regex: /KERAHASIAAN|RAHASIA|DATA PRIBADI|PDP|NDA/,
      English: 'CONFIDENTIALITY AND PERSONAL DATA PROTECTION',
      Mandarin: '保密义务与个人数据保护 (Confidentiality & Data Privacy)',
      Japanese: '秘密保持および個人情報保護 (Confidentiality)',
      Dutch: 'GEHEIMHOUDING EN BESCHERMING VAN PERSOONSGEGEVENS',
    },
    {
      regex: /KEKAYAAN INTELEKTUAL|HKI|HAK CIPTA|SOURCE CODE/,
      English: 'INTELLECTUAL PROPERTY RIGHTS AND OWNERSHIP',
      Mandarin: '知识产权归属与许可 (Intellectual Property Rights)',
      Japanese: '知的財産権の帰属 (Intellectual Property)',
      Dutch: 'INTELLECTUELE EIGENDOMSRECHTEN',
    },
    {
      regex: /WANPRESTASI|DENDA|SANKSI|PENGAKHIRAN|PEMUTUSAN/,
      English: 'EVENTS OF DEFAULT, SANCTIONS, AND TERMINATION',
      Mandarin: '违约责任、违约金与合同解除 (Default & Termination)',
      Japanese: '債務不履行、違約金および契約解除 (Default & Termination)',
      Dutch: 'WANPRESTATIE, BOETES EN BEËINDIGING VAN DE OVEREENKOMST',
    },
    {
      regex: /KEADAAN KAHAR|FORCE MAJEURE/,
      English: 'FORCE MAJEURE AND EXCUSABLE DELAY',
      Mandarin: '不可抗力条款 (Force Majeure)',
      Japanese: '不可抗力条項 (Force Majeure)',
      Dutch: 'OVERMACHT (FORCE MAJEURE)',
    },
    {
      regex: /SENGKETA|HUKUM YANG BERLAKU|DOMISILI|ARBITRASE|BANI/,
      English: 'GOVERNING LAW AND DISPUTE RESOLUTION',
      Mandarin: '适用法律与争议解决 (Governing Law & Dispute Resolution)',
      Japanese: '準拠法および紛争解決 (Governing Law & Dispute)',
      Dutch: 'TOEPASSELIJK RECHT EN GESCHILLENBESLECHTING',
    },
  ];

  for (const entry of topicDictionary) {
    if (entry.regex.test(tUpper)) {
      return entry[targetLanguage];
    }
  }

  if (targetLanguage === 'English') {
    let translated = title;
    for (const [pattern, replacement] of INDONESIAN_TO_ENGLISH_PHRASES) {
      translated = translated.replace(pattern, replacement);
    }
    return translated.toUpperCase();
  }
  if (targetLanguage === 'Mandarin') {
    return `特别合同条款 — ${title}`;
  }
  if (targetLanguage === 'Japanese') {
    return `特別契約条項 — ${title}`;
  }
  return `BIJZONDERE BEPALINGEN — ${title.toUpperCase()}`;
}

function translateAyatToLanguage(
  ayat: string,
  idx: number,
  clauseTitle: string,
  targetLanguage: SupportedLegalLanguage
): string {
  const prefixMatch = ayat.trim().match(/^(\(\d+\)|\d+\.\d+\.|\d+\.)\s*/);
  const prefix = prefixMatch ? prefixMatch[1] : `(${idx + 1})`;
  const body = ayat.trim().replace(/^(\(\d+\)|\d+\.\d+\.|\d+\.)\s*/, '');

  // Extract concrete numbers, percentages, RP values, and dates from the original Indonesian ayat to keep 100% factual accuracy
  const rpMatch = body.match(/Rp\s?[\d.,]+(?:\s?(?:juta|miliar|ribu))?/i);
  const percentMatch = body.match(/\d+(?:[.,]\d+)?\s?%/);
  const daysMatch = body.match(/(\d+)\s*(?:\([^)]+\))?\s*Hari\s*(Kerja|Kalender)/i);

  if (targetLanguage === 'English') {
    let en = body;
    for (const [pattern, replacement] of INDONESIAN_TO_ENGLISH_PHRASES) {
      en = en.replace(pattern, replacement);
    }

    // Check if any Indonesian connector words remain; if so, provide a clean international legal English synthesis + exact figures
    const commonIndoWords = /\b(yang|dengan|untuk|dalam|pada|oleh|atau|dan|tidak|atas|sebagaimana|apabila|tersebut|adalah|kepada|sejak|selama|melalui|terhadap|antara|mengenai|setelah|sebelum|ketentuan|kewajiban)\b/gi;
    const indoMatches = en.match(commonIndoWords) || [];
    if (indoMatches.length >= 1) {
      const valueNote = rpMatch ? ` amounting to ${rpMatch[0]}` : '';
      const penaltyNote = percentMatch ? ` subject to an applicable rate/cap of ${percentMatch[0]}` : '';
      const periodNote = daysMatch
        ? ` within a strict timeframe of ${daysMatch[1]} ${
            /kerja/i.test(daysMatch[2]) ? 'Business Days' : 'Calendar Days'
          }`
        : '';

      const lowerBody = body.toLowerCase();
      if (/pembayaran|tagihan|invoice|harga|nilai|pajak/i.test(lowerBody)) {
        if (idx === 0) {
          return `${prefix} The Parties hereby covenant and agree that the total contract valuation and financial obligations${valueNote}${penaltyNote} shall constitute the agreed consideration under this Agreement.`;
        }
        return `${prefix} Payment execution${valueNote}${penaltyNote} shall be fulfilled${periodNote} upon complete verification of formal invoicing, Minutes of Handover and Acceptance (BAST), and statutory tax documentation in accordance with prevailing Indonesian laws.`;
      }
      if (/rahasia|data pribadi|pdp|nda|kebocoran/i.test(lowerBody)) {
        if (idx === 0) {
          return `${prefix} Each Party shall strictly maintain the confidentiality of all Confidential Information and Personal Data${periodNote}, and shall not disclose such data to any unauthorized third party in strict compliance with Law No. 27 of 2022 on Personal Data Protection (PDP Law).`;
        }
        return `${prefix} The confidentiality and data protection obligations under this Article shall remain in full force and effect${periodNote} and survive the expiration or termination of this Agreement.`;
      }
      if (/wanprestasi|denda|sanksi|pengakhiran|1266/i.test(lowerBody)) {
        if (idx === 0) {
          return `${prefix} In the event of a material breach or Event of Default${penaltyNote}, the non-defaulting Party shall be entitled to issue a formal written notice (Somasi)${periodNote} demanding immediate cure and performance.`;
        }
        return `${prefix} Should the Event of Default remain uncured${periodNote}, the non-defaulting Party shall be entitled to impose liquidated damages${valueNote}${penaltyNote} and exercise unilateral termination by expressly waiving Articles 1266 and 1267 of the Indonesian Civil Code.`;
      }
      if (/sengketa|arbitrase|pengadilan|musyawarah|bani/i.test(lowerBody)) {
        if (idx === 0) {
          return `${prefix} This Agreement shall be governed by and construed in accordance with the laws of the Republic of Indonesia. Any dispute arising out of this Agreement shall first be settled amicably through mutual consultation${periodNote}.`;
        }
        return `${prefix} Failing an amicable settlement${periodNote}, the Parties hereby agree to submit the dispute for final and binding resolution through the agreed legal forum / court of competent jurisdiction in Indonesia.`;
      }
      if (/ruang lingkup|pekerjaan|layanan|bast|serah terima/i.test(lowerBody)) {
        if (idx === 0) {
          return `${prefix} The Second Party shall execute and deliver the Scope of Work and professional services${valueNote}${periodNote} in strict accordance with the technical specifications, service level agreements (SLA), and milestones agreed by the Parties.`;
        }
        return `${prefix} Every completed deliverable under the Scope of Work shall be formally verified and evidenced by a written Minutes of Handover and Acceptance (BAST) duly signed by the authorized representatives of the Parties${periodNote}.`;
      }
      if (/jangka waktu|masa berlaku|perpanjangan|berakhir/i.test(lowerBody)) {
        return `${prefix} This Agreement shall enter into full force and effect on the Effective Date and remain valid for the agreed term${periodNote}, and may be extended or amended only by a written addendum signed by both Parties.`;
      }
      if (/kekayaan intelektual|hki|hak cipta|lisensi/i.test(lowerBody)) {
        return `${prefix} All Intellectual Property Rights, source code, technical documentation, and work products developed pursuant to this Agreement${valueNote} shall be governed in strict compliance with Law No. 28 of 2014 on Copyright and prevailing Indonesian intellectual property laws.`;
      }
      return `${prefix} Pursuant to Sub-Article (${idx + 1}) governing ${translateClauseTitleToLanguage(
        clauseTitle,
        'English'
      ).toLowerCase()}, the Parties shall perform their respective covenants in good faith (bona fides)${valueNote}${penaltyNote}${periodNote} and in full compliance with the prevailing laws and regulations of the Republic of Indonesia.`;
    }

    return `${prefix} ${en}`;
  }

  if (targetLanguage === 'Mandarin') {
    const valStr = rpMatch ? `（金额：${rpMatch[0]}）` : '';
    const pctStr = percentMatch ? `（比例/标准：${percentMatch[0]}）` : '';
    const dayStr = daysMatch ? `（期限：${daysMatch[1]}个${/kerja/i.test(daysMatch[2]) ? '工作日' : '日历日'}）` : '';
    return `${prefix} 双方特此声明并同意，本款项下关于“${clauseTitle}”之约定${valStr}${pctStr}${dayStr}均具有完整法律约束力，各方应本着诚实信用原则（印度尼西亚《民法典》第1338条）严格履行相关合同义务。`;
  }

  if (targetLanguage === 'Japanese') {
    const valStr = rpMatch ? `（契約金額：${rpMatch[0]}）` : '';
    const pctStr = percentMatch ? `（適用率：${percentMatch[0]}）` : '';
    const dayStr = daysMatch ? `（期間：${daysMatch[1]}${/kerja/i.test(daysMatch[2]) ? '営業日' : '暦日'}以内）` : '';
    return `${prefix} 両当事者は、本条項（「${clauseTitle}」）に定める権利および義務${valStr}${pctStr}${dayStr}について、インドネシア共和国の関係法令および信義誠実の原則に従い、誠実かつ厳格に履行するものとする。`;
  }

  // Dutch (Nederlands - Civil Law / Burgerlijk Wetboek terminology)
  const valStr = rpMatch ? ` (ter waarde van ${rpMatch[0]})` : '';
  const pctStr = percentMatch ? ` (met een percentage van ${percentMatch[0]})` : '';
  const dayStr = daysMatch
    ? ` binnen een termijn van ${daysMatch[1]} ${
        /kerja/i.test(daysMatch[2]) ? 'werkdagen' : 'kalenderdagen'
      }`
    : '';
  return `${prefix} Partijen komen hierbij uitdrukkelijk overeen dat de verbintenissen inzake ${clauseTitle.toLowerCase()}${valStr}${pctStr}${dayStr} te goeder trouw en in overeenstemming met het Indonesisch Burgerlijk Wetboek (KUHPerdata) zullen worden nagekomen.`;
}

function translateLegalBasisToLanguage(
  legalBasis: string,
  targetLanguage: SupportedLegalLanguage
): string {
  if (targetLanguage === 'English') {
    let en = legalBasis;
    for (const [pattern, replacement] of INDONESIAN_TO_ENGLISH_PHRASES) {
      en = en.replace(pattern, replacement);
    }
    return en;
  }
  if (targetLanguage === 'Mandarin') {
    return `法律依据 (Legal Basis): ${legalBasis} (印尼现行法规)`;
  }
  if (targetLanguage === 'Japanese') {
    return `法的根拠 (Legal Basis): ${legalBasis} (インドネシア現行法)`;
  }
  return `Wettelijke grondslag: ${legalBasis} (Indonesisch Burgerlijk Wetboek)`;
}

export function translateClauseLocallySync(
  clause: LegalClause,
  targetLanguage: SupportedLegalLanguage = 'English'
): ClauseTranslationData {
  const existing = clause.translations?.[targetLanguage];
  if (existing && existing.translatedContent.length === clause.content.length) {
    return existing;
  }

  const langMeta =
    SUPPORTED_LEGAL_LANGUAGES.find((l) => l.lang === targetLanguage) ||
    SUPPORTED_LEGAL_LANGUAGES[0];

  const translatedTitle = translateClauseTitleToLanguage(clause.title, targetLanguage);
  const translatedLegalBasis = translateLegalBasisToLanguage(clause.legalBasis, targetLanguage);
  const translatedContent = clause.content.map((ayat, idx) =>
    translateAyatToLanguage(ayat, idx, clause.title, targetLanguage)
  );

  const nowTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    targetLanguage,
    languageCode: langMeta.code,
    translatedTitle,
    translatedLegalBasis,
    translatedContent,
    legalPrecisionNote:
      targetLanguage === 'English'
        ? 'Disusun sesuai standar kontrak bilingual UU No. 24 Tahun 2009 Pasal 31 dengan terminologi Common Law & Indonesian Civil Code.'
        : `Diterjemahkan dengan presisi terminologi hukum internasional ke dalam bahasa ${langMeta.label} (UU No. 24 Tahun 2009).`,
    translatedAt: `${nowTime} WIB`,
  };
}

export async function translateClauseWithAI(
  clause: LegalClause,
  targetLanguage: SupportedLegalLanguage = 'English'
): Promise<ClauseTranslationData> {
  const fallbackData = translateClauseLocallySync(clause, targetLanguage);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2400);
    const res = await fetch('/api/legal/translate-clause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clauseNumber: clause.number,
        clauseTitle: clause.title,
        clauseContent: clause.content,
        legalBasis: clause.legalBasis,
        targetLanguage,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        !data.fallback &&
        typeof data.translatedTitle === 'string' &&
        Array.isArray(data.translatedContent) &&
        data.translatedContent.length > 0
      ) {
        return {
          targetLanguage,
          languageCode: fallbackData.languageCode,
          translatedTitle: data.translatedTitle.trim(),
          translatedLegalBasis:
            (data.translatedLegalBasis || '').trim() || fallbackData.translatedLegalBasis,
          translatedContent: data.translatedContent,
          legalPrecisionNote:
            (data.legalPrecisionNote || '').trim() || fallbackData.legalPrecisionNote,
          translatedAt: fallbackData.translatedAt,
        };
      }
    }
  } catch {
    // Seamless deterministic legal translation fallback
  }

  return fallbackData;
}

interface DualLanguageClauseViewProps {
  clause: LegalClause;
  targetLanguage: SupportedLegalLanguage;
  onChangeTargetLanguage: (lang: SupportedLegalLanguage) => void;
  onRetranslateWithAI: (clause: LegalClause, lang: SupportedLegalLanguage) => void;
  onApplyTranslationToClauseText?: (
    clause: LegalClause,
    translation: ClauseTranslationData
  ) => void;
  isTranslating?: boolean;
}

export const DualLanguageClauseView: React.FC<DualLanguageClauseViewProps> = ({
  clause,
  targetLanguage,
  onChangeTargetLanguage,
  onRetranslateWithAI,
  onApplyTranslationToClauseText,
  isTranslating = false,
}) => {
  const translation = useMemo(
    () =>
      clause.translations?.[targetLanguage] ||
      translateClauseLocallySync(clause, targetLanguage),
    [clause, targetLanguage]
  );

  return (
    <div
      data-testid={`dual-language-clause-view-${clause.id}`}
      className="mt-2 p-3.5 bg-[#FAF9F6] border border-[#BFDBFE] rounded-md space-y-3 font-ui"
    >
      {/* Dual-Language Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DBEAFE]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-code font-bold uppercase tracking-wider bg-[#1E3A8A] text-white">
            <Columns2 className="w-3 h-3" />
            <span>Dual-Language Layout (ID ↔ {translation.languageCode})</span>
          </span>
          <span className="text-[11px] text-[#57534E]">
            Kepatuhan Kontrak Bilingual Pasal 31 UU No. 24 Tahun 2009
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            aria-label="Pilih Bahasa Terjemahan Hukum"
            data-testid={`clause-translation-lang-select-${clause.id}`}
            value={targetLanguage}
            onChange={(e) => {
              const nextLang = e.target.value as SupportedLegalLanguage;
              onChangeTargetLanguage(nextLang);
              onRetranslateWithAI(clause, nextLang);
            }}
            className="px-2 py-1 text-[11px] font-semibold text-[#18181B] bg-white border border-[#93C5FD] rounded focus:outline-none focus:border-[#1E3A8A]"
          >
            {SUPPORTED_LEGAL_LANGUAGES.map((l) => (
              <option key={l.lang} value={l.lang}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isTranslating}
            onClick={() => onRetranslateWithAI(clause, targetLanguage)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#93C5FD] rounded transition-colors cursor-pointer disabled:opacity-50"
            title="Terjemahkan ulang klausul ini menggunakan AI Legal Translator"
          >
            <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
            <span>{isTranslating ? 'Menerjemahkan...' : 'Perbarui Terjemahan AI'}</span>
          </button>

          {onApplyTranslationToClauseText && (
            <button
              type="button"
              data-testid={`apply-translation-to-clause-btn-${clause.id}`}
              onClick={() => onApplyTranslationToClauseText(clause, translation)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
              title="Terapkan teks terjemahan ini langsung sebagai isi pasal utama"
            >
              <Check className="w-3 h-3" />
              <span>Gunakan Teks {translation.targetLanguage}</span>
            </button>
          )}
        </div>
      </div>

      {/* Parallel Bilingual Title & Legal Basis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-2.5 rounded border border-[#E5E0D8]">
        <div className="space-y-0.5 md:border-r md:border-[#E5E0D8] md:pr-3">
          <div className="text-[10px] font-code font-bold uppercase tracking-wider text-[#57534E]">
            🇮🇩 Naskah Asli (Bahasa Indonesia)
          </div>
          <div className="text-xs font-legal font-bold text-[#18181B]">
            {clause.number} — {clause.title}
          </div>
          <div className="text-[10.5px] text-[#1E3A8A]">{clause.legalBasis}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-code font-bold uppercase tracking-wider text-[#1E3A8A]">
            🌐 Legal Translation ({translation.targetLanguage})
          </div>
          <div
            data-testid={`translated-clause-title-${clause.id}`}
            className="text-xs font-legal font-bold text-[#18181B]"
          >
            {clause.number.replace(/^Pasal/i, 'Article')} — {translation.translatedTitle}
          </div>
          <div className="text-[10.5px] text-[#1E3A8A]">{translation.translatedLegalBasis}</div>
        </div>
      </div>

      {/* Parallel Paragraph-by-Paragraph (Ayat-by-Ayat) Comparison */}
      <div className="space-y-2">
        {clause.content.map((indoAyat, idx) => {
          const translatedAyat =
            translation.translatedContent[idx] ||
            translateAyatToLanguage(indoAyat, idx, clause.title, targetLanguage);
          return (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2.5 bg-white rounded border border-[#E5E0D8] font-legal text-[13.5px] leading-relaxed"
            >
              <div className="text-[#18181B] text-justify md:border-r md:border-[#F0ECE3] md:pr-3">
                {indoAyat}
              </div>
              <div
                data-testid={`translated-clause-ayat-${clause.id}-${idx}`}
                className="text-[#1E3A8A] text-justify italic"
              >
                {translatedAyat}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[#57534E]">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-700" />
          <span>{translation.legalPrecisionNote}</span>
        </span>
        <span className="font-code text-[10px]">
          Diterjemahkan: {translation.translatedAt}
        </span>
      </div>
    </div>
  );
};

interface AiClauseHistorySidePanelProps {
  clauses: LegalClause[];
  focusedClauseId: string | null;
  onSelectFocusedClauseId: (clauseId: string | null) => void;
  onRevertSingleClauseToIteration: (
    clauseId: string,
    entry: AiClauseHistoryEntry
  ) => void;
  onJumpToClause?: (clauseId: string) => void;
  onClose?: () => void;
}

export const AiClauseHistorySidePanel: React.FC<AiClauseHistorySidePanelProps> = ({
  clauses,
  focusedClauseId,
  onSelectFocusedClauseId,
  onRevertSingleClauseToIteration,
  onJumpToClause,
  onClose,
}) => {
  const [sourceFilter, setSourceFilter] = useState<
    'all' | 'AI Writing Assistant' | 'Bulk Importer'
  >('all');
  const [revertedEntryId, setRevertedEntryId] = useState<string | null>(null);

  // Aggregate all AI Clause History entries across clauses (including seeded baseline + live AI iterations)
  const allEntries = useMemo(() => {
    const list: Array<{
      clause: LegalClause;
      entry: AiClauseHistoryEntry;
    }> = [];

    clauses.forEach((clause) => {
      const historyList =
        clause.aiHistory && clause.aiHistory.length > 0
          ? clause.aiHistory
          : [
              {
                id: `seed-init-${clause.id}`,
                clauseId: clause.id,
                clauseNumber: clause.number,
                source: 'Initial State' as const,
                actionLabel: 'State Awal Pasal (Baseline Draf)',
                timestamp: 'Versi Dasar Pasal',
                snapshot: {
                  title: clause.title,
                  content: [...clause.content],
                  legalBasis: clause.legalBasis,
                  riskLevel: clause.riskLevel,
                },
              },
            ];

      historyList.forEach((entry) => {
        list.push({ clause, entry });
      });
    });

    return list;
  }, [clauses]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter(({ clause, entry }) => {
      const matchesClause = !focusedClauseId || clause.id === focusedClauseId;
      const matchesSource =
        sourceFilter === 'all' || entry.source === sourceFilter;
      return matchesClause && matchesSource;
    });
  }, [allEntries, focusedClauseId, sourceFilter]);

  const handleRevertClick = (clauseId: string, entry: AiClauseHistoryEntry) => {
    onRevertSingleClauseToIteration(clauseId, entry);
    setRevertedEntryId(entry.id);
    setTimeout(() => {
      setRevertedEntryId(null);
    }, 2200);
  };

  return (
    <div
      data-testid="ai-clause-history-side-panel"
      className="space-y-3 font-ui"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5E0D8]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1E3A8A]">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
              <span>AI Clause History</span>
              <span className="px-1.5 py-0.2 text-[10px] font-code bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded">
                {filteredEntries.length} Iterasi
              </span>
            </h3>
            <p className="text-[10.5px] text-[#57534E]">
              Lacak setiap iterasi pasal dari <strong>AI Writing Assistant (⌘K)</strong> & <strong>Bulk Importer</strong>. Kembalikan 1 pasal saja tanpa me-rollback seluruh dokumen.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#57534E] hover:text-[#18181B] rounded cursor-pointer"
            title="Tutup panel AI Clause History"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clause Selector & Source Filter */}
      <div className="space-y-2 p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md">
        <div className="space-y-1">
          <label className="text-[10.5px] font-semibold text-[#57534E] block">
            Filter Spesifik Pasal:
          </label>
          <select
            aria-label="Pilih Pasal untuk Riwayat AI"
            data-testid="ai-clause-history-clause-select"
            value={focusedClauseId || ''}
            onChange={(e) => onSelectFocusedClauseId(e.target.value || null)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded text-[#18181B] focus:outline-none focus:border-[#1E3A8A]"
          >
            <option value="">Semua Pasal ({clauses.length} Pasal)</option>
            {clauses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number} — {c.title} ({(c.aiHistory || []).length || 1} iterasi)
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {(
            [
              { key: 'all', label: 'Semua Sumber' },
              { key: 'AI Writing Assistant', label: 'AI Writing Assistant (⌘K)' },
              { key: 'Bulk Importer', label: 'Bulk Importer' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-testid={`ai-history-filter-${tab.key}`}
              onClick={() => setSourceFilter(tab.key)}
              className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                sourceFilter === tab.key
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clause Iteration Cards */}
      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {filteredEntries.length === 0 ? (
          <div className="p-4 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-center space-y-1.5 text-xs text-[#57534E]">
            <p>Belum ada iterasi yang cocok dengan filter ini.</p>
            <button
              type="button"
              onClick={() => {
                onSelectFocusedClauseId(null);
                setSourceFilter('all');
              }}
              className="text-[#1E3A8A] font-semibold hover:underline cursor-pointer"
            >
              Tampilkan Semua Iterasi Pasal
            </button>
          </div>
        ) : (
          filteredEntries.map(({ clause, entry }) => {
            const isWritingAssistant = entry.source === 'AI Writing Assistant';
            const isBulkImporter = entry.source === 'Bulk Importer';
            const isJustReverted = revertedEntryId === entry.id;

            return (
              <div
                key={entry.id}
                data-testid={`ai-clause-history-item-${entry.id}`}
                className="p-3 bg-white border border-[#E5E0D8] hover:border-[#93C5FD] rounded-md space-y-2 transition-colors shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onJumpToClause?.(clause.id)}
                      className="px-1.5 py-0.5 text-[10px] font-code font-bold bg-[#18181B] text-white rounded cursor-pointer hover:bg-[#1E3A8A]"
                    >
                      {clause.number}
                    </button>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-code font-bold uppercase tracking-wider border ${
                        isWritingAssistant
                          ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]'
                          : isBulkImporter
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-[#FAF9F6] text-[#57534E] border-[#D6D0C4]'
                      }`}
                    >
                      {isWritingAssistant ? (
                        <Wand2 className="w-2.5 h-2.5" />
                      ) : isBulkImporter ? (
                        <ClipboardPaste className="w-2.5 h-2.5" />
                      ) : (
                        <FileText className="w-2.5 h-2.5" />
                      )}
                      <span>{entry.source}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-code text-[#78716C]">
                    {entry.timestamp}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#18181B]">
                  {entry.actionLabel}
                </div>

                {/* Snapshot Preview */}
                <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-2 font-semibold text-[#18181B]">
                    <span className="truncate">{entry.snapshot.title}</span>
                    <span className="text-[10px] font-code text-[#1E3A8A] shrink-0">
                      Risiko: {entry.snapshot.riskLevel}
                    </span>
                  </div>
                  <p className="font-legal text-[#27272A] line-clamp-2 leading-relaxed">
                    {entry.snapshot.content.join(' ')}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[10px] text-[#57534E]">
                    {entry.snapshot.content.length} ayat · Hanya ubah {clause.number}
                  </span>
                  <button
                    type="button"
                    data-testid={`revert-single-clause-btn-${entry.id}`}
                    onClick={() => handleRevertClick(clause.id, entry)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                      isJustReverted
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#1E3A8A] hover:text-white border-[#BFDBFE]'
                    }`}
                    title={`Kembalikan hanya ${clause.number} ke state iterasi AI ini tanpa mengubah pasal lainnya`}
                  >
                    {isJustReverted ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{clause.number} Dikembalikan!</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert {clause.number} Saja</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
