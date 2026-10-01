import { UniversalDraftCriteria, LegalAuditNote } from '../types/legal';

export type ProtectionStanceMode =
  | 'balanced'
  | 'pro_party_one'
  | 'pro_party_two'
  | 'aggressive_party_one'
  | 'aggressive_party_two'
  | 'strict_conservative';

export interface LegalProtectionStanceOption {
  value: string;
  shortLabel: string;
  mode: ProtectionStanceMode;
  favoredPartyLabel: string;
  badgeText: string;
  strategyDescription: string;
  keyMechanisms: string[];
}

export const LEGAL_PROTECTION_STANCE_OPTIONS: LegalProtectionStanceOption[] = [
  {
    value: 'Seimbang (Adil bagi Kedua Pihak)',
    shortLabel: '⚖️ Seimbang (Win-Win)',
    mode: 'balanced',
    favoredPartyLabel: 'Kedua Pihak Setara (Reciprocal)',
    badgeText: 'NETRAL & PROPORSIONAL',
    strategyDescription:
      'Hak, kewajiban, masa perbaikan (cure period 14 hari), dan batas tanggung jawab dibagi secara proporsional serta setara bagi Pihak Pertama maupun Pihak Kedua sesuai Pasal 1338 ayat (3) KUHPerdata.',
    keyMechanisms: [
      'Cure Period Timbal Balik 14 Hari',
      'Kewajiban & Jaminan Setara',
      'Musyawarah Mufakat 30 Hari',
    ],
  },
  {
    value: 'Melindungi Pemberi Kerja / Pihak Pertama',
    shortLabel: '🛡️ Memihak Pihak Pertama (Klien / Pemberi Mandat)',
    mode: 'pro_party_one',
    favoredPartyLabel: 'Memihak Pihak Pertama (Klien / Kreditur / Pemilik)',
    badgeText: 'PRO-PIHAK PERTAMA',
    strategyDescription:
      'Memprioritaskan perlindungan hukum bagi Pihak Pertama melalui hak menahan pembayaran (retention) sebelum BAST disetujui, kepemilikan penuh HKI sejak dibuat, denda keterlambatan tegas bagi Pihak Kedua, serta hak pemutusan sepihak.',
    keyMechanisms: [
      'Hak Tahan Pembayaran (Retention Right)',
      'HKI & Hasil Kerja Milik Eksklusif Pihak Pertama',
      'Denda Wanprestasi 2‰/Hari & Indemnifikasi Pihak Kedua',
      'Hak Pengakhiran Sepihak oleh Pihak Pertama (Waiver Pasal 1266)',
    ],
  },
  {
    value: 'Melindungi Pelaksana / Pihak Kedua',
    shortLabel: '🛡️ Memihak Pihak Kedua (Pelaksana / Vendor / Mitra)',
    mode: 'pro_party_two',
    favoredPartyLabel: 'Memihak Pihak Kedua (Pelaksana / Vendor / Debitur / Penyewa)',
    badgeText: 'PRO-PIHAK KEDUA',
    strategyDescription:
      'Memprioritaskan perlindungan hukum bagi Pihak Kedua melalui jaminan DP non-refundable, hak menghentikan pekerjaan jika pembayaran terlambat (Pasal 1478 KUHPerdata), persetujuan otomatis BAST (Deemed Acceptance 5 hari), dan pembatasan ganti rugi (Liability Cap 10%).',
    keyMechanisms: [
      'DP Wajib & Hak Hentikan Pekerjaan Jika Bayar Terlambat (Pasal 1478)',
      'Deemed Acceptance Otomatis 5 Hari Kerja & Batas Revisi',
      'Liability Cap Maksimal 10% (Pembatasan Pasal 1247 KUHPerdata)',
      'Retensi HKI oleh Pihak Kedua Sampai Lunas 100%',
    ],
  },
  {
    value: 'Agresif Memihak Pihak Pertama (Hak Veto & Indemnifikasi Penuh)',
    shortLabel: '⚔️ Agresif Pro-Pihak Pertama (Proteksi Maksimal Klien)',
    mode: 'aggressive_party_one',
    favoredPartyLabel: 'Agresif Memihak Pihak Pertama (Dominasi Klien / Kreditur)',
    badgeText: 'AGRESIF PRO-PIHAK 1',
    strategyDescription:
      'Posisi kuasa hukum agresif untuk Pihak Pertama: memberikan hak veto penerimaan hasil kerja, hak potong langsung tagihan (set-off Pasal 1425 KUHPerdata), tanggung jawab ganti rugi Pihak Kedua tanpa plafon (uncapped indemnity), dan pengakhiran seketika tanpa kompensasi.',
    keyMechanisms: [
      'Hak Veto Mutlak & Potong Tagihan Otomatis (Set-Off Pasal 1425)',
      'Uncapped Indemnity (Ganti Rugi Penuh Tanpa Batas oleh Pihak Kedua)',
      'Larangan Sub-Kontrak Mutlak & Sita Jaminan',
      'Pemutusan Seketika Tanpa Kompensasi Pengakhiran',
    ],
  },
  {
    value: 'Agresif Memihak Pihak Kedua (Liability Cap & DP Non-Refundable)',
    shortLabel: '⚔️ Agresif Pro-Pihak Kedua (Proteksi Maksimal Pelaksana)',
    mode: 'aggressive_party_two',
    favoredPartyLabel: 'Agresif Memihak Pihak Kedua (Perisai Penuh Vendor / Pelaksana)',
    badgeText: 'AGRESIF PRO-PIHAK 2',
    strategyDescription:
      'Posisi kuasa hukum agresif untuk Pihak Kedua: seluruh pembayaran yang diterima bersifat non-refundable, persetujuan otomatis 3x24 jam (Deemed Approved), plafon ganti rugi maksimal 5% dari nilai termin yang diterima, serta bebas denda apabila keterlambatan dipicu oleh Pihak Pertama.',
    keyMechanisms: [
      'Seluruh Pembayaran Non-Refundable & Bunga Keterlambatan Bayar Klien',
      'Deemed Approved Otomatis 3x24 Jam Tanpa Hak Tolak Sepihak',
      'Strict Liability Cap Maksimal 5% & Pengecualian Kerugian Konsekuensial',
      'Background IP Tetap Milik Eksklusif Pihak Kedua',
    ],
  },
  {
    value: 'Ketat & Konservatif (Mitigasi Risiko Maksimum)',
    shortLabel: '🔒 Ketat & Konservatif (Audit & Mitigasi Maksimum)',
    mode: 'strict_conservative',
    favoredPartyLabel: 'Mitigasi Risiko Korporasi & Kepatuhan Regulasi Ketat',
    badgeText: 'KONSERVATIF & KETAT',
    strategyDescription:
      'Menekankan kepatuhan formil dan materiil maksimum: setiap tahapan wajib dibuktikan dengan Berita Acara Tertulis bermaterai Rp10.000, kepatuhan penuh UU PDP No. 27/2022, pakta anti-suap/GCG, serta pengesampingan tegas Pasal 1266 & 1267 KUHPerdata.',
    keyMechanisms: [
      'Wajib Bukti Tertulis Autentik & BAST Bermaterai (Pasal 1866 KUHPerdata)',
      'Kepatuhan Penuh UU PDP No. 27/2022 & Anti-Fraud GCG',
      'Pengesampingan Tegas Pasal 1266 & 1267 KUHPerdata',
    ],
  },
];

export function getLegalStanceProfile(stance?: string): LegalProtectionStanceOption {
  const s = (stance || '').toLowerCase();
  if (s.includes('agresif') && (s.includes('pihak pertama') || s.includes('pemberi'))) {
    return LEGAL_PROTECTION_STANCE_OPTIONS[3];
  }
  if (s.includes('agresif') && (s.includes('pihak kedua') || s.includes('pelaksana'))) {
    return LEGAL_PROTECTION_STANCE_OPTIONS[4];
  }
  if (s.includes('pihak pertama') || s.includes('pemberi kerja') || s.includes('klien') || s.includes('kreditur')) {
    return LEGAL_PROTECTION_STANCE_OPTIONS[1];
  }
  if (s.includes('pihak kedua') || s.includes('pelaksana') || s.includes('vendor') || s.includes('mitra') || s.includes('debitur')) {
    return LEGAL_PROTECTION_STANCE_OPTIONS[2];
  }
  if (s.includes('ketat') || s.includes('konservatif') || s.includes('maksimum')) {
    return LEGAL_PROTECTION_STANCE_OPTIONS[5];
  }
  return LEGAL_PROTECTION_STANCE_OPTIONS[0];
}

export function adaptClauseByProtectionStance(params: {
  title: string;
  baselineContent: string[];
  baselineLegalBasis: string;
  baselineRiskLevel: string;
  clauseIndex: number;
  stance?: string;
  partyOneLabel?: string;
  partyTwoLabel?: string;
  language?: string;
}): {
  content: string[];
  legalBasis: string;
  riskLevel: 'Standar' | 'Perhatian' | 'Kritis';
} {
  const profile = getLegalStanceProfile(params.stance);
  const p1 = params.partyOneLabel || 'Pihak Pertama';
  const p2 = params.partyTwoLabel || 'Pihak Kedua';
  const tLower = params.title.toLowerCase();
  const isBilingual = (params.language || '').toLowerCase().includes('bilingual');
  const isPlainLugas = (params.language || '').toLowerCase().includes('lugas');

  // Strip any previously injected stance ayat (marked by [Proteksi ...]) from baseline so switching stances is clean
  const cleanBase = params.baselineContent
    .filter(
      (line) =>
        !line.includes('[Proteksi Pihak Pertama]') &&
        !line.includes('[Proteksi Pihak Kedua]') &&
        !line.includes('[Proteksi Agresif Pihak Pertama]') &&
        !line.includes('[Proteksi Agresif Pihak Kedua]') &&
        !line.includes('[Mitigasi Ketat & Konservatif]') &&
        !line.includes('[Keseimbangan Proporsional Para Pihak]') &&
        !line.includes('[Bilingual Legal Summary:')
    )
    .map((line, idx) => {
      const stripped = line.replace(/^\(\d+\)\s*/, '').trim();
      return `(${idx + 1}) ${stripped}`;
    });

  const baseList =
    cleanBase.length > 0
      ? cleanBase
      : [`(1) Pelaksanaan ketentuan mengenai ${params.title.toLowerCase()} mengikat Para Pihak secara sah.`];

  const nextNum = baseList.length + 1;
  let stanceAyat = '';
  let extraBasis = '';
  let nextRisk: 'Standar' | 'Perhatian' | 'Kritis' =
    params.baselineRiskLevel === 'Kritis' ||
    params.baselineRiskLevel === 'Perhatian' ||
    params.baselineRiskLevel === 'Standar'
      ? params.baselineRiskLevel
      : 'Standar';

  const isPaymentClause =
    /nilai|pembayaran|harga|kompensasi|biaya|anggaran|termin|cicilan|keuangan/i.test(tLower);
  const isScopeOrObligationClause =
    /ruang lingkup|objek|pokok|hak|kewajiban|wewenang|penunjukan|tugas|pelaksanaan|jaminan/i.test(
      tLower
    );
  const isDefaultOrSanctionClause =
    /wanprestasi|kelalaian|sanksi|denda|pengakhiran|pemutusan|tanggung jawab|kerugian|sita|tuntutan/i.test(
      tLower
    );
  const isIpOrConfidentialityClause =
    /hak kekayaan intelektual|hki|hak cipta|kerahasiaan|data pribadi|publikasi/i.test(tLower);

  if (profile.mode === 'pro_party_one') {
    if (isPaymentClause) {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Pertama] Setiap pencairan pembayaran oleh ${p1} hanya wajib dilakukan apabila seluruh tahapan hasil pekerjaan telah diverifikasi dan disetujui secara tertulis melalui Berita Acara Serah Terima (BAST) yang ditandatangani oleh ${p1}, serta ${p1} berhak menahan pembayaran (hak retensi) apabila terdapat ketidaksesuaian spesifikasi.`;
      extraBasis = 'Pasal 1338 & Hak Retensi Pihak Pertama';
      nextRisk = 'Perhatian';
    } else if (isDefaultOrSanctionClause) {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Pertama] Dalam hal ${p2} terlambat atau lalai memenuhi kewajibannya, ${p2} dikenakan denda keterlambatan sebesar 2‰ (dua per mil) per hari kalender dan wajib mengganti seluruh kerugian nyata yang diderita oleh ${p1}, serta ${p1} berhak mengakhiri Perjanjian ini secara sepihak dengan pemberitahuan tertulis 3 (tiga) hari kalender melalui pengesampingan Pasal 1266 dan Pasal 1267 KUHPerdata.`;
      extraBasis = 'Pasal 1243, Pasal 1266 & Pasal 1267 KUHPerdata (Pro-Pihak Pertama)';
      nextRisk = 'Kritis';
    } else if (isIpOrConfidentialityClause || isScopeOrObligationClause) {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Pertama] Seluruh hasil pekerjaan, laporan, desain, maupun Hak Kekayaan Intelektual yang timbul dari pelaksanaan Pasal ini secara otomatis menjadi milik penuh dan eksklusif ${p1} sejak saat diciptakan, dan ${p2} dilarang mengalihkan sebagian atau seluruh pelaksanaan kewajiban kepada pihak ketiga (sub-kontrak) tanpa izin tertulis terlebih dahulu dari ${p1}.`;
      extraBasis = 'UU No. 28/2014 tentang Hak Cipta & Proteksi Eksklusif Pihak Pertama';
      nextRisk = 'Perhatian';
    } else {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Pertama] Segala pelaksanaan ketentuan dalam Pasal ini wajib mengutamakan perlindungan kepentingan hukum dan standar kepatuhan ${p1}, serta setiap perubahan jadwal maupun teknis pelaksanaan hanya sah apabila disetujui secara tertulis oleh ${p1}.`;
      extraBasis = 'Pasal 1338 KUHPerdata (Prioritas Perlindungan Pihak Pertama)';
    }
  } else if (profile.mode === 'aggressive_party_one') {
    if (isPaymentClause) {
      stanceAyat = `(${nextNum}) [Proteksi Agresif Pihak Pertama] ${p1} memiliki hak perjumpaan utang (set-off otomatis sesuai Pasal 1425 KUHPerdata) untuk memotong langsung setiap denda keterlambatan, klaim kekurangan mutu, atau biaya perbaikan dari tagihan pembayaran ${p2} tanpa memerlukan persetujuan terlebih dahulu dari ${p2}.`;
      extraBasis = 'Pasal 1425 & Pasal 1426 KUHPerdata (Set-Off Otomatis Pihak Pertama)';
      nextRisk = 'Kritis';
    } else if (isDefaultOrSanctionClause) {
      stanceAyat = `(${nextNum}) [Proteksi Agresif Pihak Pertama] Tanggung jawab ganti rugi dan indemnifikasi oleh ${p2} kepada ${p1} atas setiap pelanggaran, kelalaian, atau tuntutan pihak ketiga bersifat penuh tanpa batas plafon maksimum (uncapped indemnity), serta ${p1} berwenang memutuskan Perjanjian ini seketika kapan saja tanpa kewajiban membayar kompensasi pengakhiran kepada ${p2}.`;
      extraBasis = 'Pasal 1243, Pasal 1246 & Pengesampingan Pasal 1266 KUHPerdata (Uncapped Indemnity)';
      nextRisk = 'Kritis';
    } else {
      stanceAyat = `(${nextNum}) [Proteksi Agresif Pihak Pertama] ${p1} memegang hak evaluasi dan hak veto mutlak atas kelayakan pelaksanaan Pasal ini; apabila menurut penilaian sepihak ${p1} terdapat ketidaksesuaian, maka ${p2} wajib melakukan perbaikan dan pemulihan penuh atas biaya ${p2} sendiri dalam waktu selambat-lambatnya 3x24 jam.`;
      extraBasis = 'Pasal 1338 KUHPerdata & Hak Veto Mutlak Pihak Pertama';
      nextRisk = 'Kritis';
    }
  } else if (profile.mode === 'pro_party_two') {
    if (isPaymentClause) {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Kedua] Pembayaran Uang Muka (Down Payment) yang telah diterima oleh ${p2} bersifat mengikat dan tidak dapat ditarik kembali (non-refundable) atas pekerjaan yang telah berjalan; apabila ${p1} terlambat melakukan pembayaran melampaui 7 (tujuh) hari kalender dari tanggal jatuh tempo, maka ${p2} berhak menghentikan sementara seluruh pelaksanaan kewajiban (hak suspensi sesuai Pasal 1478 KUHPerdata) tanpa dianggap wanprestasi.`;
      extraBasis = 'Pasal 1478 KUHPerdata (Exceptio Non Adimpleti Contractus · Pro-Pihak Kedua)';
      nextRisk = 'Perhatian';
    } else if (isDefaultOrSanctionClause) {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Kedua] Jumlah maksimum akumulasi tanggung jawab ganti rugi atau denda yang dapat dibebankan kepada ${p2} dalam keadaan apa pun dibatasi setinggi-tingginya 10% (sepuluh persen) dari nilai pembayaran yang telah diterima ${p2} (Liability Cap sesuai Pasal 1247 KUHPerdata), dengan mengecualikan segala kerugian tidak langsung/konsekuensial serta wajib didahului masa perbaikan (cure period) selama 14 (empat belas) hari kalender.`;
      extraBasis = 'Pasal 1247 & Pasal 1248 KUHPerdata (Limitation of Liability Pihak Kedua)';
      nextRisk = 'Standar';
    } else if (isScopeOrObligationClause || isIpOrConfidentialityClause) {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Kedua] Apabila dalam waktu 5 (lima) Hari Kerja setelah penyerahan hasil pekerjaan ${p1} tidak memberikan tanggapan atau keberatan tertulis yang spesifik, maka hasil pekerjaan dinyatakan telah diterima dan disetujui secara sah demi hukum (Deemed Acceptance), serta pengalihan hak atas hasil pekerjaan hanya berlaku efektif setelah seluruh pembayaran dilunasi 100% (seratus persen) oleh ${p1}.`;
      extraBasis = 'Asas Kepastian Hukum & Deemed Acceptance Perlindungan Pihak Kedua';
      nextRisk = 'Standar';
    } else {
      stanceAyat = `(${nextNum}) [Proteksi Pihak Kedua] ${p2} dibebaskan dari segala tuntutan keterlambatan maupun sanksi apabila hambatan pelaksanaan timbul akibat keterlambatan penyediaan data, instruksi, atau persetujuan dari ${p1}, dan setiap permintaan tambahan di luar ruang lingkup awal wajib dituangkan dalam Addendum Biaya Tambahan (Change Order).`;
      extraBasis = 'Pasal 1338 ayat (3) KUHPerdata (Perlindungan Hak Pelaksana / Pihak Kedua)';
    }
  } else if (profile.mode === 'aggressive_party_two') {
    if (isPaymentClause) {
      stanceAyat = `(${nextNum}) [Proteksi Agresif Pihak Kedua] Seluruh termin pembayaran yang telah dibayarkan oleh ${p1} kepada ${p2} bersifat final dan 100% tidak dapat diminta kembali (strictly non-refundable) dalam kondisi apa pun, dan keterlambatan pelunasan tagihan oleh ${p1} dikenakan denda keterlambatan sebesar 2‰ (dua per mil) per hari untuk keuntungan ${p2}.`;
      extraBasis = 'Pasal 1243 & Pasal 1382 KUHPerdata (Proteksi Pembayaran Mutlak Pihak Kedua)';
      nextRisk = 'Perhatian';
    } else if (isDefaultOrSanctionClause) {
      stanceAyat = `(${nextNum}) [Proteksi Agresif Pihak Kedua] Plafon maksimum tanggung jawab hukum dan ganti rugi ${p2} dibatasi secara ketat maksimal 5% (lima persen) dari nilai fee bersih yang telah diterima ${p2} (Strict Liability Cap), serta ${p1} melepaskan hak untuk menuntut ganti rugi immateriil, kehilangan keuntungan (loss of profit), maupun pengakhiran sepihak tanpa melunasi seluruh pekerjaan yang telah dikerjakan oleh ${p2}.`;
      extraBasis = 'Pasal 1247 KUHPerdata (Strict Liability Cap 5% Pihak Kedua)';
      nextRisk = 'Standar';
    } else {
      stanceAyat = `(${nextNum}) [Proteksi Agresif Pihak Kedua] Hasil pekerjaan dianggap disetujui penuh secara otomatis (Deemed Approved) apabila ${p1} tidak memberikan umpan balik tertulis dalam 3x24 jam sejak diserahkan; seluruh metodologi, template dasar, dan Background IP tetap menjadi hak milik eksklusif ${p2}.`;
      extraBasis = 'UU No. 28/2014 & Perlindungan Maksimum Pihak Kedua';
      nextRisk = 'Standar';
    }
  } else if (profile.mode === 'strict_conservative') {
    stanceAyat = `(${nextNum}) [Mitigasi Ketat & Konservatif] Setiap pemenuhan kewajiban dalam Pasal ini wajib dibuktikan dengan dokumen autentik atau Berita Acara Tertulis bermaterai Rp10.000 (UU No. 10/2020), mematuhi standar keamanan informasi & pelindungan data pribadi (UU No. 27/2022 tentang PDP), serta mengesampingkan Pasal 1266 dan Pasal 1267 KUHPerdata demi kepastian eksekusi hukum.`;
    extraBasis = 'Pasal 1866, Pasal 1266 KUHPerdata & UU No. 27/2022 tentang PDP';
    nextRisk = isDefaultOrSanctionClause ? 'Kritis' : 'Perhatian';
  } else {
    // Balanced ('Seimbang (Adil bagi Kedua Pihak)')
    stanceAyat = `(${nextNum}) [Keseimbangan Proporsional Para Pihak] Pelaksanaan hak, kewajiban, dan tanggung jawab dalam Pasal ini berlaku secara timbal balik, setara, dan proporsional bagi ${p1} maupun ${p2} berlandaskan asas itikad baik (Pasal 1338 ayat (3) KUHPerdata) dengan masa perbaikan bersama selama 14 (empat belas) hari kalender.`;
  }

  const updatedContent = [...baseList, stanceAyat];

  if (isPlainLugas) {
    updatedContent[0] = updatedContent[0]
      .replace(/sebagaimana dimaksud pada/gi, 'sesuai dengan')
      .replace(/selanjutnya disebut sebagai/gi, 'disebut');
  }

  if (isBilingual) {
    const enNote =
      profile.mode === 'pro_party_one' || profile.mode === 'aggressive_party_one'
        ? `(${updatedContent.length + 1}) [Bilingual Legal Summary: First-Party Protective Clause] All rights, remedies, deliverable approvals, and indemnification under this Article shall be construed primarily in favor of and for the legal protection of ${p1}.`
        : profile.mode === 'pro_party_two' || profile.mode === 'aggressive_party_two'
        ? `(${updatedContent.length + 1}) [Bilingual Legal Summary: Second-Party Protective Clause] ${p2} shall be protected by deemed acceptance, suspension rights upon late payment, and a strict limitation of liability cap under this Article.`
        : `(${updatedContent.length + 1}) [Bilingual Legal Summary: Balanced Reciprocal Clause] The rights and obligations under this Article shall apply equally, proportionally, and in good faith to both ${p1} and ${p2}.`;
    updatedContent.push(enNote);
  }

  const cleanBaseLegalBasis = params.baselineLegalBasis
    .split(' · ')
    .filter(
      (part) =>
        !part.includes('Pro-Pihak') &&
        !part.includes('Set-Off Otomatis') &&
        !part.includes('Uncapped Indemnity') &&
        !part.includes('Hak Veto') &&
        !part.includes('Limitation of Liability') &&
        !part.includes('Strict Liability Cap') &&
        !part.includes('Deemed Acceptance') &&
        !part.includes('Hak Retensi') &&
        !part.includes('Prioritas Perlindungan') &&
        !part.includes('Perlindungan Hak Pelaksana') &&
        !part.includes('Proteksi Pembayaran Mutlak') &&
        !part.includes('Perlindungan Maksimum Pihak Kedua')
    )
    .join(' · ');

  const updatedLegalBasis =
    extraBasis && !cleanBaseLegalBasis.toLowerCase().includes(extraBasis.toLowerCase())
      ? `${cleanBaseLegalBasis} · ${extraBasis}`
      : cleanBaseLegalBasis;

  return {
    content: updatedContent,
    legalBasis: updatedLegalBasis,
    riskLevel: nextRisk,
  };
}

export function buildStanceAuditNote(
  stance?: string,
  partyOneName: string = 'Pihak Pertama',
  partyTwoName: string = 'Pihak Kedua'
): LegalAuditNote {
  const profile = getLegalStanceProfile(stance);
  if (profile.mode === 'pro_party_one' || profile.mode === 'aggressive_party_one') {
    return {
      title: `Posisi Proteksi Aktif: ${profile.badgeText} (Memihak ${partyOneName})`,
      severity: 'Aman',
      recommendation: `Seluruh pasal telah disesuaikan untuk melindungi kepentingan hukum ${partyOneName} (Pihak Pertama), mencakup hak tahan/potong pembayaran, kepemilikan HKI eksklusif, denda keterlambatan atas ${partyTwoName}, dan hak pemutusan sepihak.`,
    };
  }
  if (profile.mode === 'pro_party_two' || profile.mode === 'aggressive_party_two') {
    return {
      title: `Posisi Proteksi Aktif: ${profile.badgeText} (Memihak ${partyTwoName})`,
      severity: 'Aman',
      recommendation: `Seluruh pasal telah disesuaikan untuk melindungi kepentingan hukum ${partyTwoName} (Pihak Kedua), mencakup DP non-refundable, hak penghentian pekerjaan jika pembayaran terlambat (Pasal 1478 KUHPerdata), Deemed Acceptance otomatis, dan Limitation of Liability Cap.`,
    };
  }
  if (profile.mode === 'strict_conservative') {
    return {
      title: `Posisi Proteksi Aktif: ${profile.badgeText}`,
      severity: 'Perlu Verifikasi',
      recommendation:
        'Seluruh pasal menggunakan mitigasi risiko maksimum dengan syarat bukti tertulis bermaterai Rp10.000, kepatuhan UU PDP No. 27/2022, dan pengesampingan Pasal 1266 KUHPerdata.',
    };
  }
  return {
    title: `Posisi Proteksi Aktif: ${profile.badgeText} (Adil bagi Kedua Pihak)`,
    severity: 'Aman',
    recommendation: `Hak dan kewajiban antara ${partyOneName} dan ${partyTwoName} disusun secara berimbang dan proporsional sesuai Pasal 1338 ayat (3) KUHPerdata.`,
  };
}

export interface UniversalPresetOption {
  id: string;
  label: string;
  domain: string;
  badge: string;
  stance: string;
  criteria: string;
  prompt: string;
}

export const UNIVERSAL_DOMAIN_CATEGORIES = [
  {
    value: 'Otomatis (Deteksi Cerdas dari Perintah)',
    label: 'Otomatis — Deteksi Cerdas Instrumen Hukum Sesuai Perintah',
  },
  {
    value: 'Pribadi, Perorangan, Pinjaman, Pernyataan & Keluarga',
    label: 'Hukum Perdata Perorangan & Keluarga (Pinjaman, Pernyataan, Waris, Hibah)',
  },
  {
    value: 'Litigasi, Gugatan, Somasi, Jawaban & Sengketa',
    label: 'Hukum Acara & Litigasi (Gugatan, Somasi, Perdamaian, BPSK, LAPS)',
  },
  {
    value: 'Surat Kuasa (SK), Surat Tugas (ST) & Mandat',
    label: 'Hukum Perwakilan & Kuasa (Surat Kuasa Khusus, Substitusi, Surat Tugas)',
  },
  {
    value: 'Properti, Sewa Menyewa, Kos, Tanah & Kendaraan',
    label: 'Hukum Properti, Agraria & Jual Beli Aset (Sewa Rumah/Kos, Tanah, Kendaraan)',
  },
  {
    value: 'Freelance, Kreator, Influencer, Event & UMKM',
    label: 'Hukum Perikatan Jasa, Kreator/KOL, Agensi & Kemitraan Bagi Hasil UMKM',
  },
  {
    value: 'Organisasi, Akademik, SK Keputusan, SOP & Berita Acara',
    label: 'Instrumen Hukum Badan/Yayasan (SK Keputusan Hukum, BAST, Pakta Integritas)',
  },
  {
    value: 'Kontrak Bisnis, Korporasi, Teknologi & Ketenagakerjaan',
    label: 'Hukum Korporasi, Komersial, IT/Lisensi, NDA & Ketenagakerjaan (PKWT)',
  },
  {
    value: 'Dokumen Kustom Bebas (Sesuai Kriteria Pengguna)',
    label: 'Instrumen Hukum Kustom Dinamis (Konstruksi Pasal Mengikuti Kriteria Hukum)',
  },
];

export const UNIVERSAL_STRUCTURE_STYLES = [
  {
    value: 'Otomatis Sesuai Konteks Dokumen',
    label: 'Otomatis Sesuai Jenis Instrumen Hukum (Adaptif)',
  },
  {
    value: 'Akta & Perjanjian Berpasal (Pasal 1, Pasal 2, dst.)',
    label: 'Akta & Perjanjian Hukum Berpasal (Komparisi + Premis + Pasal 1, 2, dst.)',
  },
  {
    value: 'Surat Resmi / Surat Pernyataan / Berita Acara / Pengakuan',
    label: 'Akta Di Bawah Tangan / Surat Pernyataan Hukum / Pengakuan / BAST',
  },
  {
    value: 'Berkas Litigasi (Posita / Duduk Perkara & Petitum / Tuntutan)',
    label: 'Berkas Hukum Acara & Litigasi (Duduk Perkara / Posita, Dasar Hukum & Petitum)',
  },
  {
    value: 'Surat Keputusan (Menimbang, Mengingat, Memutuskan: KESATU, KEDUA)',
    label: 'Ketetapan / Surat Keputusan Hukum (Menimbang, Mengingat, Memutuskan)',
  },
];

export const UNIVERSAL_QUICK_CRITERIA_CHIPS = [
  'Sertakan 2 Saksi Hukum & Materai Rp10.000',
  'Bahasa Hukum Lugas & Mengikat (Pasal 1338 KUHPerdata)',
  'Rincikan Termin Pembayaran, BAST & Denda Wanprestasi',
  'Cantumkan Klausul Jaminan Hukum & Pengesampingan Pasal 1266',
  'Penyelesaian Musyawarah Mufakat & Domisili Pengadilan Negeri',
  'Perlindungan Kerahasiaan & Kepatuhan UU PDP No. 27/2022',
];

export const UNIVERSAL_EXTENDED_PRESETS: UniversalPresetOption[] = [
  {
    id: 'univ-pinjaman-pribadi',
    label: 'Akta Pengakuan Hutang & Perjanjian Pinjam Meminjam',
    domain: 'Hukum Perdata Perorangan',
    badge: 'Perdata Perorangan',
    stance: 'Melindungi Pemberi Kerja / Pihak Pertama',
    criteria: 'Sertakan jaminan BPKB kendaraan, jadwal cicilan 6 bulan, dan 2 saksi hukum',
    prompt:
      'Buatkan Surat Perjanjian Pinjam Meminjam Uang & Pengakuan Hutang secara hukum perdata antara Andi Pratama (Kreditur / Pemberi Pinjaman) dan Riko Saputra (Debitur / Penerima Pinjaman) sebesar Rp 45.000.000 tanpa bunga untuk modal usaha, dicicil Rp 7.500.000 per bulan selama 6 bulan setiap tanggal 10, dengan jaminan penyerahan BPKB Motor Honda PCX 2024 dan disaksikan 2 orang saksi.',
  },
  {
    id: 'univ-kreator-endorse',
    label: 'Perjanjian Hukum Jasa Endorsement & Lisensi Konten (KOL)',
    domain: 'Hukum Perikatan & HKI',
    badge: 'Perikatan Jasa / HKI',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    criteria: 'Cantumkan jumlah deliverables, lisensi hak pakai konten 6 bulan (UU Hak Cipta), dan klausul wanprestasi',
    prompt:
      'Buatkan Perjanjian Hukum Kerjasama Jasa Endorsement & Lisensi Konten antara Brand Skincare GlowNesia dan Kreator @NadiaBeauty untuk pembuatan 3 video Reels dan 2 TikTok senilai Rp 15.000.000, DP 50% saat produk diterima dan pelunasan 50% maksimal 3 hari setelah video tayang, lisensi hak ekonomi konten selama 6 bulan sesuai UU Hak Cipta, serta revisi script maksimal 1 kali.',
  },
  {
    id: 'univ-sewa-kos-kontrakan',
    label: 'Perjanjian Sewa Menyewa Rumah / Properti (Pasal 1548 KUHPerdata)',
    domain: 'Hukum Properti & Sewa',
    badge: 'Hukum Properti',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    criteria: 'Atur uang deposit jaminan kerusakan, beban utilitas penyewa, dan larangan alih sewa (onderhuur)',
    prompt:
      'Buatkan Perjanjian Sewa Menyewa Rumah Tinggal di Perumahan Griya Asri Blok C4 Bandung antara Ibu Hj. Ratna Sari (Pihak Yang Menyewakan) dan Dimas Aditya (Pihak Penyewa) selama 1 tahun senilai Rp 36.000.000 sesuai Pasal 1548 KUHPerdata, uang deposit jaminan kerusakan Rp 3.000.000, biaya utilitas ditanggung penyewa, serta larangan menyewakan ulang (onderhuur) kepada pihak ketiga.',
  },
  {
    id: 'univ-sk-panitia-organisasi',
    label: 'Surat Keputusan (SK) Hukum Pengangkatan Pengurus Yayasan/Badan',
    domain: 'Hukum Yayasan & Badan',
    badge: 'SK Hukum Badan',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    criteria: 'Gunakan format konsiderans hukum Menimbang, Mengingat, Memutuskan (KESATU, KEDUA, KETIGA)',
    prompt:
      'Buatkan Surat Keputusan (SK) Ketua Pengurus Yayasan Pendidikan Cendekia Nusantara tentang Pengangkatan Pelaksana Program Hukum & Kewirausahaan Nasional 2026 yang diketuai oleh Dr. Farhan Hakim, M.T. beserta rincian kewenangan hukum pengelolaan anggaran Rp 120.000.000 dan kewajiban pertanggungjawaban audit maksimal 14 hari setelah masa tugas berakhir.',
  },
  {
    id: 'univ-jual-beli-mobil',
    label: 'Perjanjian Jual Beli Kendaraan Bermotor (Pasal 1457 KUHPerdata)',
    domain: 'Hukum Jual Beli Perdata',
    badge: 'Jual Beli Aset',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    criteria: 'Jaminan bebas sitaan/fidusia/leasing (Pasal 1491 KUHPerdata) dan serah terima BPKB + STNK',
    prompt:
      'Buatkan Surat Perjanjian Jual Beli Mobil Toyota Innova Zenix Tahun 2023 Warna Hitam Nopol B 1829 KZX antara Bpk. Surya Darmawan (Penjual) dan Bpk. Kevin Wijaya (Pembeli) dengan harga Rp 385.000.000 lunas melalui transfer bank, disertai jaminan hukum kendaraan bebas sengketa atau ikatan fidusia/leasing sesuai Pasal 1491 KUHPerdata, serta penyerahan BPKB asli dan STNK.',
  },
  {
    id: 'univ-bagi-hasil-umkm',
    label: 'Perjanjian Kemitraan & Bagi Hasil Usaha (Maatschap / Persekutuan)',
    domain: 'Hukum Perikatan & UMKM',
    badge: 'Hukum Kemitraan',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    criteria: 'Bagi hasil laba bersih 60:40, hak audit pembukuan bulanan, dan perlindungan modal',
    prompt:
      'Buatkan Perjanjian Hukum Kerjasama Investasi & Bagi Hasil Usaha Kedai Kopi "Kopi Sudut Kota" antara Fajar Nugroho (Mitra Pemodal Rp 85.000.000) dan Reza Mahendra (Mitra Pengelola Operasional) selama 2 tahun dengan pembagian laba bersih 60% untuk Pemodal dan 40% untuk Pengelola sampai balik modal (BEP), kemudian menjadi 50%:50% setelah BEP, lengkap dengan hak audit laporan keuangan setiap tanggal 5.',
  },
  {
    id: 'univ-perdamaian-kekeluargaan',
    label: 'Akta Kesepakatan Perdamaian Bersama (Dading · Pasal 1851 KUHPerdata)',
    domain: 'Hukum Acara & Sengketa',
    badge: 'Akta Perdamaian',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    criteria: 'Sertakan klausul pembebasan tuntutan (acquittal & discharge) dan pencabutan laporan hukum',
    prompt:
      'Buatkan Akta Kesepakatan Perdamaian Bersama (Dading sesuai Pasal 1851 KUHPerdata) antara Bpk. Haryanto dan Bpk. Dedi Kurniawan terkait penyelesaian ganti rugi insiden kecelakaan lalu lintas dan kerusakan kendaraan di Jalan Jenderal Sudirman, dengan kompensasi biaya perbaikan sebesar Rp 12.500.000 dibayar lunas serta pernyataan pembebasan tuntutan pidana maupun perdata di kemudian hari.',
  },
  {
    id: 'univ-pks-software',
    label: 'PKS Pengembangan Aplikasi & Pengalihan HKI (Korporasi)',
    domain: 'Hukum Kontrak Korporasi',
    badge: 'Korporasi / IT',
    stance: 'Melindungi Pemberi Kerja / Pihak Pertama',
    criteria: 'Termin 30%-40%-30%, HKI source code milik klien setelah lunas (UU Hak Cipta), garansi bug 90 hari',
    prompt:
      'Buatkan Perjanjian Kerjasama Pengembangan Aplikasi Mobile & Web E-Commerce antara PT Nusantara Retailindo (Pihak Pertama) dan PT Kreasi Digital Solusi (Pihak Kedua) dengan nilai proyek Rp 240.000.000 selama 4 bulan, pembayaran 3 termin (30% DP, 40% UAT, 30% Go-Live), hak cipta source code milik penuh Pihak Pertama setelah lunas, garansi pemeliharaan bug 90 hari, dan denda keterlambatan 1 per mil per hari.',
  },
];

function extractPartyNamesFromPrompt(prompt: string): {
  partyOneName: string;
  partyTwoName: string;
} {
  // Match patterns like "antara X dan Y" or "dari X kepada Y"
  const antaraMatch = prompt.match(
    /\bantara\s+([^,.;()]+?)(?:\s*\([^)]*\))?\s+(?:dan|dengan|&|serta)\s+([^,.;()]+?)(?:\s*\([^)]*\)|\s+(?:senilai|sebesar|selama|untuk|terkait|dengan|di\s+))/i
  );
  if (antaraMatch) {
    return {
      partyOneName: antaraMatch[1].trim(),
      partyTwoName: antaraMatch[2].trim(),
    };
  }

  const dariKepadaMatch = prompt.match(
    /\bdari\s+([^,.;()]+?)(?:\s*\([^)]*\))?\s+kepada\s+([^,.;()]+?)(?:\s*\([^)]*\)|\s+(?:untuk|terkait|senilai|sebesar|tentang))/i
  );
  if (dariKepadaMatch) {
    return {
      partyOneName: dariKepadaMatch[1].trim(),
      partyTwoName: dariKepadaMatch[2].trim(),
    };
  }

  return {
    partyOneName: '[Nama Pihak Pertama / Pemberi Mandat]',
    partyTwoName: '[Nama Pihak Kedua / Mitra Pelaksana]',
  };
}

function extractAmountFromPrompt(prompt: string): string {
  const rpMatch = prompt.match(/Rp\.?\s*[\d.,]+(?:\s*(?:juta|miliar|ribu|jt|m))?/i);
  return rpMatch ? rpMatch[0].trim() : '[Nominal / Nilai Kesepakatan]';
}

function extractDurationFromPrompt(prompt: string): string {
  const durMatch = prompt.match(/\b(\d+\s*(?:hari|minggu|bulan|tahun|jam|x\s*24\s*jam))\b/i);
  return durMatch ? durMatch[1].trim() : '12 (dua belas) bulan';
}

function extractCityFromPrompt(prompt: string): string {
  const cities = [
    'Jakarta Selatan',
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Timur',
    'Jakarta Utara',
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Medan',
    'Semarang',
    'Yogyakarta',
    'Denpasar',
    'Makassar',
    'Tangerang',
    'Bekasi',
    'Depok',
    'Bogor',
  ];
  for (const c of cities) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(prompt)) {
      return c;
    }
  }
  return 'Jakarta';
}

export function buildUniversalDynamicDraftFromPrompt(params: {
  prompt: string;
  stance?: string;
  language?: string;
  criteria?: Partial<UniversalDraftCriteria>;
}) {
  const rawPrompt = params.prompt.trim();
  const pLower = rawPrompt.toLowerCase();
  const domainCategory = params.criteria?.domainCategory || 'Otomatis (Deteksi Cerdas dari Perintah)';
  const structureStyle = params.criteria?.structureStyle || 'Otomatis Sesuai Konteks Dokumen';
  const customCriteria = (params.criteria?.customCriteria || '').trim();

  const { partyOneName, partyTwoName } = extractPartyNamesFromPrompt(rawPrompt);
  const amount = extractAmountFromPrompt(rawPrompt);
  const duration = extractDurationFromPrompt(rawPrompt);
  const city = extractCityFromPrompt(rawPrompt);

  const nowDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Detect specific document archetypes from prompt + criteria
  const isSkKeputusanOrSop =
    /\b(surat keputusan|sk pengangkatan|sk panitia|sk pengurus|sop|standar operasional prosedur|peraturan internal|kebijakan)\b/i.test(
      rawPrompt
    ) || /Surat Keputusan/i.test(structureStyle);

  const isLitigationOrSomasi =
    /\b(gugatan|somasi|teguran hukum|jawaban tergugat|eksepsi|replik|duplik|posita|petitum|pengaduan|sengketa)\b/i.test(
      rawPrompt
    ) || /Berkas Litigasi/i.test(structureStyle);

  const isPersonalLoanOrStatement =
    /\b(pengakuan hutang|pinjam meminjam|hutang piutang|surat pernyataan|perdamaian|kekeluargaan|waris|hibah|berita acara|bast)\b/i.test(
      rawPrompt
    ) || /Surat Resmi/i.test(structureStyle);

  const isPropertyOrSale =
    /\b(sewa|kos|kontrakan|rumah|apartemen|tanah|ruko|jual beli|mobil|motor|kendaraan|ppjb)\b/i.test(
      rawPrompt
    );

  const isCreatorOrFreelanceOrUmkm =
    /\b(endorsement|influencer|kreator|tiktok|instagram|reels|youtube|freelance|desain|fotografi|event organizer|wedding|bagi hasil|kedai|umkm|franchise|konsinyasi)\b/i.test(
      rawPrompt
    );

  // Extract custom user requirements sentences/clauses from prompt
  const extraCriteriaClauseItems: string[] = [];
  if (customCriteria) {
    extraCriteriaClauseItems.push(
      `(1) Ketentuan Kriteria Khusus Pengguna: Para Pihak secara tegas menyepakati pemenuhan kriteria tambahan berikut dalam pelaksanaan dokumen ini: ${customCriteria}.`,
      `(2) Seluruh parameter khusus sebagaimana dimaksud pada ayat (1) menjadi bagian integral yang tidak terpisahkan dan mengikat secara penuh bagi masing-masing Pihak.`
    );
  }

  // CASE 1: SK KEPUTUSAN / PENGANGKATAN / SOP / ORGANISASI
  if (isSkKeputusanOrSop) {
    const cleanTopic = rawPrompt
      .replace(/^(buatkan|tolong buatkan|susun|buat)\s+/i, '')
      .replace(/^(surat keputusan|sk|sop)\s*(tentang|mengenai|untuk)?\s*/i, '')
      .trim();

    return {
      title: /\bsop\b/i.test(rawPrompt)
        ? `STANDAR OPERASIONAL PROSEDUR (SOP) & PEDOMAN PELAKSANAAN`
        : `SURAT KEPUTUSAN RESMI TENTANG ${cleanTopic.slice(0, 65).toUpperCase()}`,
      subtitle: cleanTopic.slice(0, 110) || 'Penetapan Keputusan, Mandat Tugas & Tata Kelola Resmi',
      documentNumber: `No. 018/SK-RESMI/X/2026`,
      category: 'SK Keputusan / Organisasi / SOP',
      jurisdiction: `Ketentuan Hukum & Tata Kelola Organisasi · ${city}`,
      effectiveDate: nowDate,
      openingText: `Dengan Rahmat Tuhan Yang Maha Esa, Pimpinan / Penanggung Jawab yang bertanda tangan di bawah ini menetapkan Keputusan dan Pedoman Pelaksanaan sebagai berikut:`,
      partyOne: {
        name: partyOneName !== '[Nama Pihak Pertama / Pemberi Mandat]' ? partyOneName : '[Nama Pimpinan / Ketua Organisasi / Penetap Keputusan]',
        role: 'PIHAK PENETAP KEPUTUSAN',
        representative: '[Nama Pejabat / Ketua Penandatangan]',
        address: city,
        description:
          'Bertindak dalam kapasitas resmi selaku Pimpinan / Penanggung Jawab yang berwenang menetapkan keputusan dan mandat pelaksanaan.',
      },
      partyTwo: {
        name: partyTwoName !== '[Nama Pihak Kedua / Mitra Pelaksana]' ? partyTwoName : '[Nama Pelaksana / Tim / Panitia yang Ditunjuk]',
        role: 'PELAKSANA MANDAT / PENERIMA SK',
        representative: '[Koordinator / Penanggung Jawab Pelaksana]',
        address: city,
        description:
          'Bertindak selaku pihak pelaksana yang menerima penugasan, wewenang, dan tanggung jawab sesuai ketetapan dalam dokumen ini.',
      },
      recitals: [
        `Bahwa Menimbang: untuk kelancaran pelaksanaan "${rawPrompt}", dipandang perlu menetapkan dasar penugasan, struktur tanggung jawab, dan pedoman pelaksanaan yang jelas serta terukur;`,
        `Bahwa Mengingat: Anggaran Dasar / Anggaran Rumah Tangga, peraturan internal yang berlaku, serta asas akuntabilitas dan kepastian tata kelola di ${city};`,
        `Bahwa Memperhatikan: hasil musyawarah, kebutuhan operasional, serta kriteria pelaksanaan${customCriteria ? ` (${customCriteria})` : ''} yang telah ditetapkan.`,
      ],
      clauses: [
        {
          number: 'KETETAPAN KESATU',
          title: 'PENUNJUKAN, POKOK KEPUTUSAN & RUANG LINGKUP MANDAT',
          content: [
            `(1) Menetapkan dan mengesahkan pelaksanaan: ${rawPrompt}.`,
            `(2) Menunjuk ${partyTwoName} selaku Pelaksana Mandat untuk menjalankan seluruh tugas, fungsi, dan tanggung jawab operasional sebagaimana dirincikan dalam keputusan ini dengan penuh integritas.`,
            `(3) Pelaksana Mandat berwenang melakukan koordinasi internal maupun eksternal sepanjang diperlukan untuk mencapai target yang telah ditetapkan.`,
          ],
          legalBasis: 'Tata Kelola Organisasi & Pasal 1338 KUHPerdata',
          riskLevel: 'Standar',
        },
        {
          number: 'KETETAPAN KEDUA',
          title: 'RINCIAN TUGAS, WEWENANG & STANDAR PELAKSANAAN',
          content: [
            `(1) Pelaksana Mandat wajib menyusun rencana kerja, jadwal tahapan pelaksanaan, serta pembagian tugas teknis secara tertib dan terdokumentasi.`,
            `(2) Setiap pengambilan keputusan strategis yang berdampak pada perubahan ruang lingkup atau komitmen kepada pihak luar wajib memperoleh persetujuan tertulis terlebih dahulu dari Pihak Penetap Keputusan.`,
            ...(customCriteria
              ? [
                  `(3) Kriteria Khusus Pelaksanaan: Pelaksanaan wajib memenuhi ketentuan spesifik berikut: ${customCriteria}.`,
                ]
              : []),
          ],
          legalBasis: 'Asas Akuntabilitas & Tata Kelola Resmi',
          riskLevel: 'Perhatian',
        },
        {
          number: 'KETETAPAN KETIGA',
          title: 'ANGGARAN, PEMBIAYAAN & PERTANGGUNGJAWABAN (LPJ)',
          content: [
            `(1) Segala biaya dan anggaran pelaksanaan sehubungan dengan keputusan ini ditetapkan sebesar ${amount} yang dikelola secara transparan dan akuntabel sesuai bukti pengeluaran yang sah.`,
            `(2) Pelaksana Mandat wajib menyerahkan Laporan Pertanggungjawaban (LPJ) kegiatan dan keuangan secara tertulis selambat-lambatnya 14 (empat belas) hari kalender setelah kegiatan atau periode penugasan berakhir.`,
          ],
          legalBasis: 'Prinsip Transparansi & Akuntabilitas Keuangan',
          riskLevel: 'Kritis',
        },
        {
          number: 'KETETAPAN KEEMPAT',
          title: 'MASA BERLAKU, EVALUASI & KETENTUAN PENUTUP',
          content: [
            `(1) Surat Keputusan / Pedoman ini mulai berlaku efektif sejak tanggal ditetapkan (${nowDate}) untuk jangka waktu ${duration}.`,
            `(2) Apabila di kemudian hari ditemukan terdapat kekeliruan dalam penetapan ini, maka akan dilakukan perbaikan dan penyesuaian sebagaimana mestinya.`,
          ],
          legalBasis: 'Ketentuan Administrasi & Hukum Perdata Indonesia',
          riskLevel: 'Standar',
        },
      ],
      closingText:
        'Demikian Keputusan ini ditetapkan secara resmi untuk dilaksanakan sebagaimana mestinya dengan penuh tanggung jawab.',
      signingLocation: city,
      variables: [
        { key: 'Pihak Penetap', value: partyOneName, category: 'Para Pihak' },
        { key: 'Pelaksana Mandat', value: partyTwoName, category: 'Para Pihak' },
        { key: 'Nilai / Anggaran', value: amount, category: 'Finansial' },
        { key: 'Masa Berlaku', value: duration, category: 'Waktu' },
      ],
      auditNotes: [
        {
          title: 'Kejelasan Mandat & Batas Kewenangan',
          severity: 'Aman',
          recommendation:
            'Ketetapan Kesatu dan Kedua telah membatasi lingkup wewenang pelaksana agar tidak melampaui mandat.',
        },
        {
          title: 'Kewajiban Laporan Pertanggungjawaban (LPJ)',
          severity: 'Perlu Verifikasi',
          recommendation:
            'Pastikan tenggat waktu penyerahan bukti kwitansi dan LPJ dipantau secara berkala.',
        },
      ],
    };
  }

  // CASE 2: PERSONAL / PINJAMAN / PENGAKUAN HUTANG / PERNYATAAN / PERDAMAIAN / KEKELUARGAAN
  if (isPersonalLoanOrStatement) {
    const isPeace = /perdamaian|kekeluargaan|kecelakaan|tuntutan/i.test(rawPrompt);
    const isLoan = /hutang|pinjam|cicil|modal/i.test(rawPrompt);

    const roleOne = isLoan
      ? 'PIHAK PERTAMA (PEMBERI PINJAMAN / KREDITUR)'
      : isPeace
      ? 'PIHAK PERTAMA'
      : 'PIHAK YANG MENYATAKAN / PIHAK PERTAMA';
    const roleTwo = isLoan
      ? 'PIHAK KEDUA (PENERIMA PINJAMAN / DEBITUR)'
      : isPeace
      ? 'PIHAK KEDUA'
      : 'PENERIMA PERNYATAAN / PIHAK KEDUA';

    return {
      title: isLoan
        ? 'SURAT PERJANJIAN PINJAM MEMINJAM UANG & PENGAKUAN HUTANG'
        : isPeace
        ? 'SURAT KESEPAKATAN PERDAMAIAN SECARA KEKELUARGAAN'
        : 'SURAT PERNYATAAN & KESEPAKATAN BERSAMA',
      subtitle: rawPrompt.slice(0, 115),
      documentNumber: `No. 009/SPK-PRIBADI/X/2026`,
      category: 'Dokumen Pribadi / Perorangan & Kekeluargaan',
      jurisdiction: `Hukum Perdata Indonesia · Musyawarah & PN ${city}`,
      effectiveDate: nowDate,
      openingText: `Pada hari ini, tanggal ${nowDate} bertempat di ${city}, kami yang bertanda tangan di bawah ini dalam keadaan sadar, sehat jasmani dan rohani, serta tanpa paksaan dari pihak mana pun:`,
      partyOne: {
        name: partyOneName,
        role: roleOne,
        representative: partyOneName,
        address: `[Alamat Lengkap Sesuai KTP di ${city}]`,
        description: `Warga Negara Indonesia, Pemegang NIK KTP: [Nomor NIK KTP Pihak Pertama], bertindak untuk dan atas nama diri sendiri, selanjutnya disebut sebagai "${roleOne}".`,
      },
      partyTwo: {
        name: partyTwoName,
        role: roleTwo,
        representative: partyTwoName,
        address: `[Alamat Lengkap Sesuai KTP di ${city}]`,
        description: `Warga Negara Indonesia, Pemegang NIK KTP: [Nomor NIK KTP Pihak Kedua], bertindak untuk dan atas nama diri sendiri, selanjutnya disebut sebagai "${roleTwo}".`,
      },
      recitals: [
        `Bahwa Para Pihak bermaksud menuangkan kesepakatan tertulis mengenai: ${rawPrompt};`,
        `Bahwa kesepakatan ini dibuat dengan itikad baik, rasa saling percaya, dan kekeluargaan namun tetap memiliki kekuatan pembuktian hukum yang sah dan mengikat sesuai Pasal 1320, Pasal 1338, dan Pasal 1867 KUHPerdata;`,
        ...(customCriteria
          ? [`Bahwa Para Pihak juga menyepakati kriteria khusus: ${customCriteria}.`]
          : []),
      ],
      clauses: [
        {
          number: 'Pasal 1',
          title: 'POKOK KESEPAKATAN & PERNYATAAN MENGIKAT',
          content: [
            `(1) Para Pihak dengan ini menerangkan dan menyepakati pelaksanaan pokok kesepakatan sebagai berikut: ${rawPrompt}.`,
            `(2) Nilai objek atau komitmen finansial yang disepakati dalam dokumen ini adalah sebesar ${amount} yang telah diterima/disepakati secara sah oleh Para Pihak.`,
          ],
          legalBasis: 'Pasal 1320 & Pasal 1338 KUHPerdata',
          riskLevel: 'Standar',
        },
        {
          number: 'Pasal 2',
          title: 'JADWAL PELAKSANAAN, TATA CARA PEMBAYARAN & BUKTI TERTULIS',
          content: [
            `(1) Pelaksanaan kewajiban atau pelunasan sebagaimana dimaksud dalam Pasal 1 berlaku untuk jangka waktu ${duration} terhitung sejak tanggal ${nowDate}.`,
            `(2) Setiap penyerahan uang, cicilan, atau pemenuhan kewajiban wajib disertai bukti transfer bank atau tanda terima tertulis (kwitansi) yang ditandatangani oleh Pihak yang menerima.`,
          ],
          legalBasis: 'Pasal 1382 & Pasal 1866 KUHPerdata',
          riskLevel: 'Perhatian',
        },
        {
          number: 'Pasal 3',
          title: isPeace
            ? 'PEMBEBASAN TUNTUTAN HUKUM (ACQUIT ET DE CHARGE)'
            : 'JAMINAN KEPASTIAN & KONSEKUENSI KETERLAMBATAN',
          content: isPeace
            ? [
                `(1) Dengan telah dilaksanakannya kesepakatan perdamaian dan kompensasi sebagaimana diatur dalam Surat Kesepakatan ini, maka persoalan di antara Para Pihak dinyatakan selesai secara tuntas.`,
                `(2) Kedua belah Pihak berjanji tidak akan mengajukan tuntutan hukum baru, baik secara perdata maupun pidana, sehubungan dengan peristiwa tersebut di kemudian hari (Pasal 1851 KUHPerdata tentang Perdamaian).`,
              ]
            : [
                `(1) Demi menjamin kepastian pemenuhan kewajiban sebesar ${amount}, Pihak yang berkewajiban memberikan jaminan itikad baik dan kesanggupan penuh sesuai yang disebutkan dalam kesepakatan ini.`,
                `(2) Apabila terjadi keterlambatan pemenuhan kewajiban melampaui tenggat waktu yang disepakati, Para Pihak akan mengutamakan pemberitahuan dan musyawarah maksimal 7 (tujuh) hari kalender sebelum menempuh langkah penyelesaian hukum lebih lanjut.`,
              ],
          legalBasis: isPeace ? 'Pasal 1851 & Pasal 1858 KUHPerdata' : 'Pasal 1131 & Pasal 1243 KUHPerdata',
          riskLevel: 'Kritis',
        },
        {
          number: 'Pasal 4',
          title: 'SAKSI-SAKSI, KETENTUAN TAMBAHAN & PENYELESAIAN SECARA KEKELUARGAAN',
          content: [
            `(1) Segala hal yang belum cukup diatur dalam dokumen ini akan diputuskan bersama secara musyawarah dan kekeluargaan oleh Para Pihak.`,
            `(2) Dokumen ini dibuat di hadapan 2 (dua) orang Saksi yang turut membubuhkan tanda tangan untuk memperkuat keabsahan pembuktian.`,
            ...(extraCriteriaClauseItems.length > 0
              ? [`(3) ${extraCriteriaClauseItems[0].replace(/^\(\d+\)\s*/, '')}`]
              : []),
          ],
          legalBasis: 'Pasal 1867 KUHPerdata & UU No. 10/2020 tentang Bea Meterai',
          riskLevel: 'Standar',
        },
      ],
      closingText:
        'Demikian Surat Kesepakatan / Pernyataan ini dibuat dengan sebenarnya dalam rangkap 2 (dua) bermaterai cukup (Rp10.000), ditandatangani oleh Para Pihak beserta Saksi-Saksi, dan masing-masing mempunyai kekuatan hukum pembuktian yang sama.',
      signingLocation: city,
      variables: [
        { key: 'Nama Pihak Pertama', value: partyOneName, category: 'Para Pihak' },
        { key: 'Nama Pihak Kedua', value: partyTwoName, category: 'Para Pihak' },
        { key: 'Nilai Kesepakatan', value: amount, category: 'Finansial' },
        { key: 'Jangka Waktu', value: duration, category: 'Waktu' },
        { key: 'Kota Penandatanganan', value: city, category: 'Yurisdiksi' },
      ],
      auditNotes: [
        {
          title: 'Kekuatan Pembuktian Akta di Bawah Tangan',
          severity: 'Aman',
          recommendation:
            'Penandatanganan di atas meterai Rp10.000 dengan 2 orang saksi dewasa memberikan kekuatan pembuktian sempurna sesuai Pasal 1875 KUHPerdata.',
        },
        {
          title: 'Kelengkapan Identitas NIK KTP',
          severity: 'Perlu Verifikasi',
          recommendation:
            'Pastikan nomor NIK KTP kedua belah pihak dan saksi diisi sesuai kartu identitas asli.',
        },
      ],
    };
  }

  // CASE 3: LITIGASI / SOMASI / GUGATAN / SENGKETA
  if (isLitigationOrSomasi) {
    const isSomasi = /somasi|teguran/i.test(rawPrompt);
    return {
      title: isSomasi
        ? 'SURAT SOMASI PERTAMA DAN TERAKHIR (TEGURAN HUKUM RESMI)'
        : 'NASKAH GUGATAN / TUNTUTAN HUKUM PERDATA',
      subtitle: rawPrompt.slice(0, 115),
      documentNumber: `No. 027/LIT-HUKUM/X/2026`,
      category: 'Litigasi, Somasi & Sengketa Hukum',
      jurisdiction: `Pengadilan Negeri ${city} · Hukum Acara Perdata Indonesia`,
      effectiveDate: nowDate,
      openingText: isSomasi
        ? `Kepada Yth. ${partyTwoName} di ${city}. Dengan hormat, bersama ini kami menyampaikan Somasi / Teguran Hukum Resmi sehubungan dengan permasalahan hukum berikut:`
        : `Kepada Yth. Ketua Pengadilan Negeri ${city}. Dengan hormat, yang bertanda tangan di bawah ini mengajukan Gugatan / Permohonan Hukum dengan uraian sebagai berikut:`,
      partyOne: {
        name: partyOneName,
        role: isSomasi ? 'PIHAK PEMBERI SOMASI (KREDITUR / KLIEN)' : 'PENGGUGAT / PEMOHON',
        representative: partyOneName,
        address: city,
        description: `Bertindak sebagai Pihak yang menuntut pemenuhan hak dan pemulihan kerugian berdasarkan hukum yang berlaku.`,
      },
      partyTwo: {
        name: partyTwoName,
        role: isSomasi ? 'PIHAK TERTEGUR / DEBITUR' : 'TERGUGAT / TERMOHON',
        representative: partyTwoName,
        address: city,
        description: `Pihak yang dituntut untuk memenuhi kewajiban prestasi dan/atau pertanggungjawaban hukum.`,
      },
      recitals: [
        `Bahwa terdapat hubungan hukum dan fakta peristiwa sebagai berikut: ${rawPrompt};`,
        `Bahwa hingga diterbitkannya dokumen ini, kewajiban hukum senilai ${amount} belum diselesaikan sebagaimana mestinya sehingga menimbulkan kerugian nyata bagi ${partyOneName};`,
        ...(customCriteria
          ? [`Bahwa kriteria dan tuntutan khusus dalam perkara ini mencakup: ${customCriteria}.`]
          : []),
      ],
      clauses: [
        {
          number: 'BAGIAN I',
          title: 'DUDUK PERKARA & FAKTA HUKUM (POSITA)',
          content: [
            `(1) Bahwa hubungan hukum antara ${partyOneName} dan ${partyTwoName} didasarkan pada fakta dan kesepakatan mengenai: ${rawPrompt}.`,
            `(2) Bahwa berdasarkan jadwal dan kewajiban yang telah ditentukan, ${partyTwoName} seharusnya telah melaksanakan kewajibannya secara utuh, namun faktanya lalai (wanprestasi) meskipun telah diberikan peringatan secara patut.`,
          ],
          legalBasis: 'Pasal 1238 & Pasal 1243 KUHPerdata',
          riskLevel: 'Kritis',
        },
        {
          number: 'BAGIAN II',
          title: 'KUALIFIKASI WANPRESTASI / PERBUATAN MELAWAN HUKUM & RINCIAN KERUGIAN',
          content: [
            `(1) Bahwa tindakan atau kelalaian ${partyTwoName} tersebut secara sah memenuhi unsur pelanggaran kewajiban hukum yang merugikan ${partyOneName} sebesar ${amount}.`,
            `(2) Bahwa selain kerugian materiil pokok sebesar ${amount}, keterlambatan penyelesaian juga menimbulkan kerugian immateriil dan biaya penanganan hukum yang wajib dipertanggungjawabkan oleh ${partyTwoName}.`,
          ],
          legalBasis: 'Pasal 1246, Pasal 1248 & Pasal 1365 KUHPerdata',
          riskLevel: 'Kritis',
        },
        {
          number: 'BAGIAN III',
          title: isSomasi
            ? 'PERINTAH PEMENUHAN KEWAJIBAN & TENGGAT WAKTU TERAKHIR'
            : 'PERMOHONAN SITA JAMINAN (CONSERVATOIR BESLAG) & PUTUSAN SERTA-MERTA',
          content: isSomasi
            ? [
                `(1) Melalui Somasi ini, kami memberikan kesempatan terakhir kepada ${partyTwoName} untuk melunasi/menyelesaikan seluruh kewajibannya selambat-lambatnya dalam waktu 7 (tujuh) hari kalender sejak tanggal surat ini.`,
                `(2) Apabila dalam tenggat waktu tersebut ${partyTwoName} tetap tidak menunjukkan itikad baik, maka kami akan segera menempuh upaya hukum litigasi perdata dan/atau laporan hukum yang berlaku tanpa teguran lagi.`,
              ]
            : [
                `(1) Guna menjamin agar gugatan ini tidak sia-sia (illusoir), Penggugat mohon agar diletakkan Sita Jaminan (Conservatoir Beslag) terhadap harta kekayaan Tergugat.`,
                `(2) Mengingat gugatan ini didukung bukti-bukti autentik yang kuat, Penggugat mohon agar putusan dapat dijalankan terlebih dahulu meskipun ada upaya hukum (uitvoerbaar bij voorraad).`,
              ],
          legalBasis: 'Pasal 227 HIR & Pasal 180 ayat (1) HIR',
          riskLevel: 'Perhatian',
        },
        {
          number: 'BAGIAN IV',
          title: 'TUNTUTAN HUKUM (PETITUM)',
          content: [
            `(1) Menerima dan mengabulkan tuntutan/permohonan ${partyOneName} untuk seluruhnya.`,
            `(2) Menyatakan ${partyTwoName} telah sah melakukan kelalaian/wanprestasi dan menghukum ${partyTwoName} untuk membayar lunas kewajiban sebesar ${amount} secara tunai dan seketika.`,
            ...(customCriteria ? [`(3) Menetapkan tuntutan tambahan: ${customCriteria}.`] : []),
          ],
          legalBasis: 'Hukum Acara Perdata (HIR / RBg)',
          riskLevel: 'Standar',
        },
      ],
      closingText:
        'Demikian naskah hukum ini kami sampaikan dengan tegas untuk menjadi perhatian serius dan ditindaklanjuti sebagaimana mestinya.',
      signingLocation: city,
      variables: [
        { key: 'Pihak Penuntut / Penggugat', value: partyOneName, category: 'Para Pihak' },
        { key: 'Pihak Tertegur / Tergugat', value: partyTwoName, category: 'Para Pihak' },
        { key: 'Nilai Tuntutan / Sengketa', value: amount, category: 'Finansial' },
        { key: 'Forum / Kota', value: city, category: 'Yurisdiksi' },
      ],
      auditNotes: [
        {
          title: 'Kelengkapan Alat Bukti Tertulis (Pasal 164 HIR)',
          severity: 'Krusial',
          recommendation:
            'Siapkan bukti perjanjian/invoice asli, bukti transfer, dan riwayat korespondensi sebelum mendaftarkan berkas.',
        },
      ],
    };
  }

  // CASE 4: PROPERTI / SEWA MENYEWA / JUAL BELI KENDARAAN / CREATOR / UMKM / GENERAL CUSTOM DRAFTS
  let docTitle = 'PERJANJIAN & KESEPAKATAN HUKUM';
  let docCategory =
    domainCategory !== 'Otomatis (Deteksi Cerdas dari Perintah)'
      ? domainCategory
      : 'Perjanjian & Dokumen Dinamis';
  let role1 = 'PIHAK PERTAMA';
  let role2 = 'PIHAK KEDUA';

  if (isPropertyOrSale) {
    if (/jual beli/i.test(rawPrompt)) {
      docTitle = 'SURAT PERJANJIAN JUAL BELI & PENYERAHAN HAK';
      docCategory = 'Jual Beli Aset / Properti / Kendaraan';
      role1 = 'PIHAK PERTAMA (PENJUAL)';
      role2 = 'PIHAK KEDUA (PEMBELI)';
    } else {
      docTitle = 'PERJANJIAN SEWA MENYEWA';
      docCategory = 'Properti & Sewa Menyewa';
      role1 = 'PIHAK PERTAMA (PEMILIK / YANG MENYEWAKAN)';
      role2 = 'PIHAK KEDUA (PENYEWA)';
    }
  } else if (isCreatorOrFreelanceOrUmkm) {
    if (/endorse|influencer|kreator|tiktok|instagram/i.test(rawPrompt)) {
      docTitle = 'PERJANJIAN KERJASAMA ENDORSEMENT & CONTENT CREATOR (KOL)';
      docCategory = 'Kreator, Influencer & Media Kreatif';
      role1 = 'PIHAK PERTAMA (BRAND / PEMBERI KERJA)';
      role2 = 'PIHAK KEDUA (CONTENT CREATOR / TALENT)';
    } else if (/bagi hasil|investasi|kedai|umkm|kemitraan/i.test(rawPrompt)) {
      docTitle = 'PERJANJIAN KERJASAMA KEMITRAAN & BAGI HASIL USAHA';
      docCategory = 'Kemitraan Usaha & UMKM';
      role1 = 'PIHAK PERTAMA (MITRA PEMODAL)';
      role2 = 'PIHAK KEDUA (MITRA PENGELOLA)';
    } else {
      docTitle = 'PERJANJIAN JASA PROFESIONAL & FREELANCE';
      docCategory = 'Freelance & Jasa Kreatif';
      role1 = 'PIHAK PERTAMA (KLIEN)';
      role2 = 'PIHAK KEDUA (PELAKSANA / FREELANCER)';
    }
  } else {
    const cleanedHeading = rawPrompt
      .replace(/^(buatkan|tolong buatkan|susun|buat)\s+(draf|dokumen|surat|kontrak|perjanjian)?\s*/i, '')
      .split(/[,.]/)[0]
      .trim()
      .slice(0, 65)
      .toUpperCase();
    if (cleanedHeading.length > 5) {
      docTitle = `DOKUMEN KESEPAKATAN: ${cleanedHeading}`;
    }
  }

  const rawResult = {
    title: docTitle,
    subtitle: rawPrompt.slice(0, 120),
    documentNumber: `No. 015/DOC-DYN/X/2026`,
    category: docCategory,
    jurisdiction: `Hukum Republik Indonesia · ${city}`,
    effectiveDate: nowDate,
    openingText: `Pada hari ini, tanggal ${nowDate}, bertempat di ${city}, telah dibuat dan disepakati dokumen hukum oleh dan antara:`,
    partyOne: {
      name: partyOneName,
      role: role1,
      representative: partyOneName,
      address: `[Alamat Lengkap di ${city}]`,
      description: `Bertindak dalam kapasitas hukumnya yang sah untuk dan atas nama ${partyOneName}, selanjutnya disebut sebagai "${role1}".`,
    },
    partyTwo: {
      name: partyTwoName,
      role: role2,
      representative: partyTwoName,
      address: `[Alamat Lengkap di ${city}]`,
      description: `Bertindak dalam kapasitas hukumnya yang sah untuk dan atas nama ${partyTwoName}, selanjutnya disebut sebagai "${role2}".`,
    },
    recitals: [
      `Bahwa Para Pihak sepakat untuk mengadakan perikatan dan pengaturan tertulis mengenai: ${rawPrompt};`,
      `Bahwa konstruksi hukum perjanjian ini disusun dengan posisi proteksi "${getLegalStanceProfile(params.stance).shortLabel}" (${getLegalStanceProfile(params.stance).favoredPartyLabel});`,
      ...(customCriteria
        ? [`Bahwa Para Pihak menetapkan kriteria khusus pelaksanaan yaitu: ${customCriteria}.`]
        : [
            `Bahwa Para Pihak menjamin kecakapan bertindak dan itikad baik sesuai Pasal 1320 dan Pasal 1338 Kitab Undang-Undang Hukum Perdata.`,
          ]),
    ],
    clauses: [
      {
        number: 'Pasal 1',
        title: 'OBJEK, MAKSUD & RUANG LINGKUP KESEPAKATAN',
        content: [
          `(1) Para Pihak dengan ini sepakat untuk melaksanakan kesepakatan dengan rincian pokok sebagai berikut: ${rawPrompt}.`,
          `(2) Pelaksanaan ruang lingkup sebagaimana dimaksud pada ayat (1) wajib mengacu pada spesifikasi, standar mutu, dan kriteria yang telah disetujui bersama oleh ${partyOneName} dan ${partyTwoName}.`,
        ],
        legalBasis: 'Pasal 1320 & Pasal 1338 KUHPerdata',
        riskLevel: 'Standar',
      },
      {
        number: 'Pasal 2',
        title: 'JANGKA WAKTU & JADWAL PELAKSANAAN',
        content: [
          `(1) Kesepakatan ini berlaku efektif selama ${duration} terhitung sejak tanggal ${nowDate}, dan dapat diperpanjang atau disesuaikan berdasarkan kesepakatan tertulis Para Pihak.`,
          `(2) Masing-masing Pihak wajib mematuhi tenggat waktu penyerahan maupun pelaksanaan kewajiban tepat sesuai jadwal yang telah ditentukan.`,
        ],
        legalBasis: 'Pasal 1238 & Pasal 1338 KUHPerdata',
        riskLevel: 'Standar',
      },
      {
        number: 'Pasal 3',
        title: 'NILAI TRANSAKSI, KOMPENSASI & TATA CARA PEMBAYARAN',
        content: [
          `(1) Nilai kesepakatan, biaya, atau kompensasi yang disetujui oleh Para Pihak adalah sebesar ${amount}.`,
          `(2) Pembayaran dilakukan melalui rekening resmi yang disepakati dengan bukti pembayaran tertulis yang sah sesuai tahapan/ketentuan dalam perintah kesepakatan ini.`,
        ],
        legalBasis: 'Pasal 1382 KUHPerdata & UU Mata Uang No. 7/2011',
        riskLevel: 'Perhatian',
      },
      {
        number: 'Pasal 4',
        title: 'HAK, KEWAJIBAN & JAMINAN PARA PIHAK',
        content: [
          `(1) ${role1} berhak menerima pemenuhan prestasi sesuai standar yang dijanjikan serta berkewajiban memenuhi komitmen pembayaran/penyerahan hak secara tepat waktu.`,
          `(2) ${role2} berkewajiban melaksanakan kewajibannya secara jujur, profesional, bebas dari cacat tersembunyi ataupun klaim pihak ketiga, serta berhak memperoleh perlindungan hukum yang seimbang.`,
        ],
        legalBasis: 'Pasal 1338 ayat (3) & Pasal 1491 KUHPerdata',
        riskLevel: 'Perhatian',
      },
      ...(extraCriteriaClauseItems.length > 0
        ? [
            {
              number: 'Pasal 5',
              title: 'KETENTUAN KRITERIA KHUSUS & SYARAT TAMBAHAN',
              content: extraCriteriaClauseItems,
              legalBasis: 'Asas Kebebasan Berkontrak (Pasal 1338 KUHPerdata)',
              riskLevel: 'Perhatian',
            },
          ]
        : []),
      {
        number: extraCriteriaClauseItems.length > 0 ? 'Pasal 6' : 'Pasal 5',
        title: 'KELALAIAN (WANPRESTASI), SANKSI & PEMULIHAN HAK',
        content: [
          `(1) Apabila salah satu Pihak melanggar atau tidak memenuhi kewajibannya sesuai kesepakatan ini, Pihak yang dirugikan berhak memberikan teguran tertulis dengan batas waktu perbaikan selama 7 (tujuh) hari kalender.`,
          `(2) Segala kerugian nyata yang timbul akibat kelalaian atau pelanggaran kesepakatan wajib dipertanggungjawabkan secara proporsional dengan batas ganti rugi yang terukur serta mengesampingkan Pasal 1266 KUHPerdata untuk pengakhiran efektif.`,
        ],
        legalBasis: 'Pasal 1243, Pasal 1249 & Pasal 1266 KUHPerdata',
        riskLevel: 'Kritis',
      },
      {
        number: extraCriteriaClauseItems.length > 0 ? 'Pasal 7' : 'Pasal 6',
        title: 'KEADAAN KAHAR (FORCE MAJEURE) & PENYELESAIAN PERSELISIHAN',
        content: [
          `(1) Para Pihak dibebaskan dari tanggung jawab atas keterlambatan akibat peristiwa di luar kendali wajar (Force Majeure) sesuai Pasal 1244–1245 KUHPerdata sepanjang diberitahukan tertulis maksimal 7 (tujuh) hari kalender.`,
          `(2) Setiap perselisihan yang timbul akan diselesaikan terlebih dahulu secara musyawarah untuk mufakat dalam 30 (tiga puluh) hari kalender, dan apabila tidak tercapai kesepakatan maka diselesaikan melalui forum hukum di ${city}.`,
        ],
        legalBasis: 'Pasal 1244, 1245 & Pasal 1851 KUHPerdata',
        riskLevel: 'Standar',
      },
    ],
    closingText:
      'Demikian dokumen kesepakatan ini dibuat dalam rangkap 2 (dua) bermaterai cukup dan masing-masing memiliki kekuatan hukum yang sama sejak ditandatangani oleh Para Pihak.',
    signingLocation: city,
    variables: [
      { key: 'Pihak Pertama', value: partyOneName, category: 'Para Pihak' },
      { key: 'Pihak Kedua', value: partyTwoName, category: 'Para Pihak' },
      { key: 'Nilai / Kompensasi', value: amount, category: 'Finansial' },
      { key: 'Jangka Waktu', value: duration, category: 'Waktu' },
      { key: 'Kota / Yurisdiksi', value: city, category: 'Yurisdiksi' },
    ],
    auditNotes: [
      buildStanceAuditNote(params.stance, partyOneName, partyTwoName),
      {
        title: 'Kesesuaian Draf dengan Perintah & Kriteria Dinamis',
        severity: 'Aman',
        recommendation:
          'Struktur dokumen, peran para pihak, dan pasal-pasal telah disesuaikan secara dinamis mengikuti perintah dan kriteria spesifik Anda.',
      },
      {
        title: 'Verifikasi Identitas & Bukti Pelaksanaan',
        severity: 'Perlu Verifikasi',
        recommendation:
          'Lengkapi variabel dalam tanda kurung siku pada panel Variabel Pintar sebelum mencetak atau mengekspor PDF.',
      },
    ],
  };

  return {
    ...rawResult,
    clauses: rawResult.clauses.map((cl, idx) => {
      const adapted = adaptClauseByProtectionStance({
        title: cl.title,
        baselineContent: cl.content,
        baselineLegalBasis: cl.legalBasis,
        baselineRiskLevel: cl.riskLevel,
        clauseIndex: idx,
        stance: params.stance,
        partyOneLabel: `${partyOneName} (${role1})`,
        partyTwoLabel: `${partyTwoName} (${role2})`,
        language: params.language,
      });
      return {
        ...cl,
        content: adapted.content,
        legalBasis: adapted.legalBasis,
        riskLevel: adapted.riskLevel,
      };
    }),
  };
}

export function applyProtectionStanceToDraftResult(
  draftResult: any,
  stance?: string,
  language?: string
): any {
  if (!draftResult || typeof draftResult !== 'object') return draftResult;
  const profile = getLegalStanceProfile(stance);
  const p1Name = draftResult.partyOne?.name || 'Pihak Pertama';
  const p1Role = draftResult.partyOne?.role || 'PIHAK PERTAMA';
  const p2Name = draftResult.partyTwo?.name || 'Pihak Kedua';
  const p2Role = draftResult.partyTwo?.role || 'PIHAK KEDUA';

  const adaptedClauses = Array.isArray(draftResult.clauses)
    ? draftResult.clauses.map((cl: any, idx: number) => {
        const adapted = adaptClauseByProtectionStance({
          title: cl.title || `KETENTUAN ${idx + 1}`,
          baselineContent: Array.isArray(cl.content) ? cl.content : [String(cl.content || '')],
          baselineLegalBasis: cl.legalBasis || 'Pasal 1338 KUHPerdata',
          baselineRiskLevel: cl.riskLevel || 'Standar',
          clauseIndex: idx,
          stance,
          partyOneLabel: `${p1Name} (${p1Role})`,
          partyTwoLabel: `${p2Name} (${p2Role})`,
          language,
        });
        return {
          ...cl,
          content: adapted.content,
          legalBasis: adapted.legalBasis,
          riskLevel: adapted.riskLevel,
        };
      })
    : [];

  const cleanSub = String(draftResult.subtitle || 'Dokumen Hukum Resmi')
    .replace(/\s*\[Posisi Hukum:[^\]]+\]/gi, '')
    .trim();

  const stanceNote = buildStanceAuditNote(stance, p1Name, p2Name);
  const existingNotes = Array.isArray(draftResult.auditNotes)
    ? draftResult.auditNotes.filter(
        (n: any) => !String(n?.title || '').startsWith('Posisi Proteksi Hukum:')
      )
    : [];

  return {
    ...draftResult,
    subtitle: `${cleanSub} [Posisi Hukum: ${profile.badgeText}]`,
    clauses: adaptedClauses,
    auditNotes: [stanceNote, ...existingNotes],
  };
}

