import {
  LegalDocument,
  LegalClause,
  ClauseCategoryType,
  SmartChecklistItem,
  RiskMitigationInsight,
  ContextualClauseSuggestion,
  ComprehensiveScanFinding,
  SmartLifecycleReminder,
} from '../types/legal';

interface EssentialClauseTemplate {
  id: string;
  title: string;
  category: string;
  legalBasis: string;
  riskLevel: 'Standar' | 'Perhatian' | 'Kritis';
  detectionPatterns: RegExp[];
  reason: string;
  content: string[];
}

const ESSENTIAL_CLAUSE_TEMPLATES: EssentialClauseTemplate[] = [
  {
    id: 'ctx-force-majeure',
    title: 'KEADAAN KAHAR (FORCE MAJEURE)',
    category: 'Mitigasi Risiko Eksternal',
    legalBasis: 'Pasal 1244 & Pasal 1245 KUHPerdata',
    riskLevel: 'Standar',
    detectionPatterns: [
      /\bkeadaan kahar\b/i,
      /\bforce majeure\b/i,
      /\bkeadaan memaksa\b/i,
      /\bbencana alam\b/i,
    ],
    reason:
      'AI mendeteksi draf dokumen ini belum memuat klausul Keadaan Kahar (Force Majeure) untuk membebaskan Para Pihak dari tuntutan ganti rugi apabila terjadi bencana alam, epidemi, atau perubahan regulasi pemerintah di luar kendali wajar.',
    content: [
      '(1) Yang dimaksud dengan Keadaan Kahar (Force Majeure) dalam Perjanjian ini adalah suatu peristiwa atau keadaan yang terjadi di luar kekuasaan dan kemampuan wajar Para Pihak yang berdampak langsung sehingga menghalangi pelaksanaan kewajiban berdasarkan Perjanjian ini, termasuk namun tidak terbatas pada bencana alam, gempa bumi, banjir besar, kebakaran, epidemi/pandemi resmi, perang, huru-hara, pemogokan massal, atau perubahan peraturan perundang-undangan Pemerintah Republik Indonesia.',
      '(2) Pihak yang mengalami Keadaan Kahar wajib memberitahukan secara tertulis kepada Pihak lainnya selambat-lambatnya 7 (tujuh) Hari Kalender sejak terjadinya peristiwa tersebut dengan melampirkan bukti keterangan resmi dari instansi yang berwenang.',
      '(3) Kelalaian atau keterlambatan dalam menyampaikan pemberitahuan tertulis sebagaimana dimaksud pada ayat (2) Pasal ini mengakibatkan peristiwa tersebut tidak dapat diakui sebagai Keadaan Kahar oleh Pihak lainnya.',
      '(4) Apabila Keadaan Kahar berlangsung terus-menerus selama lebih dari 30 (tiga puluh) Hari Kalender, maka Para Pihak sepakat untuk merundingkan kembali kelanjutan atau pengakhiran Perjanjian ini secara musyawarah.',
    ],
  },
  {
    id: 'ctx-dispute-resolution',
    title: 'PENYELESAIAN SENGKETA DAN DOMISILI HUKUM',
    category: 'Yurisdiksi & Litigasi',
    legalBasis: 'Pasal 1338 KUHPerdata & UU No. 30 Tahun 1999',
    riskLevel: 'Perhatian',
    detectionPatterns: [
      /\bpenyelesaian sengketa\b/i,
      /\bperselisihan\b/i,
      /\bdomisili hukum\b/i,
      /\bpengadilan negeri\b/i,
      /\barbitrase\b/i,
      /\bbani\b/i,
      /\bpengadilan hubungan industrial\b/i,
    ],
    reason:
      'AI mendeteksi draf dokumen ini belum memiliki klausul Penyelesaian Sengketa dan pilihan Domisili Hukum yang tegas apabila terjadi perselisihan penafsiran atau pelaksanaan kontrak di kemudian hari.',
    content: [
      '(1) Perjanjian ini beserta seluruh hak dan kewajiban Para Pihak di dalamnya diatur dan ditafsirkan sepenuhnya berdasarkan Hukum Negara Republik Indonesia.',
      '(2) Apabila timbul perselisihan, perbedaan penafsiran, atau sengketa yang berkaitan dengan pelaksanaan Perjanjian ini, Para Pihak sepakat untuk terlebih dahulu menyelesaikannya secara musyawarah untuk mufakat dalam jangka waktu 30 (tiga puluh) Hari Kalender sejak diterimanya pemberitahuan tertulis mengenai sengketa tersebut.',
      '(3) Apabila penyelesaian secara musyawarah sebagaimana dimaksud pada ayat (2) tidak mencapai kesepakatan, maka Para Pihak sepakat untuk memilih domisili hukum yang tetap dan tidak berubah pada Kepaniteraan Pengadilan Negeri Jakarta Selatan atau melalui Badan Arbitrase Nasional Indonesia (BANI).',
    ],
  },
  {
    id: 'ctx-termination-1266',
    title: 'PENGAKHIRAN PERJANJIAN DAN PENGENYAMPINGAN PASAL 1266 KUHPERDATA',
    category: 'Pengakhiran Kontrak',
    legalBasis: 'Pasal 1266 & Pasal 1267 KUHPerdata',
    riskLevel: 'Kritis',
    detectionPatterns: [
      /\b1266\b/i,
      /\b1267\b/i,
      /\bpengakhiran perjanjian\b/i,
      /\bpemutusan perjanjian\b/i,
      /\bmengesampingkan\b/i,
    ],
    reason:
      'AI mendeteksi draf belum memuat mekanisme Pengakhiran Perjanjian beserta pengenyampingan Pasal 1266 & 1267 KUHPerdata, sehingga pemutusan kontrak saat wanprestasi berisiko harus menunggu putusan pengadilan.',
    content: [
      '(1) Salah satu Pihak berhak mengakhiri Perjanjian ini lebih awal secara sepihak apabila Pihak lainnya melakukan pelanggaran material (Wanprestasi) dan tidak memperbaiki pelanggaran tersebut dalam waktu 14 (empat belas) Hari Kalender setelah diterimanya Surat Peringatan tertulis.',
      '(2) Sehubungan dengan pengakhiran Perjanjian ini, Para Pihak dengan tegas sepakat untuk mengesampingkan keberlakuan ketentuan Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata sepanjang mengenai diperlukannya putusan pengadilan untuk mengakhiri suatu perjanjian.',
      '(3) Pengakhiran Perjanjian tidak menghapuskan kewajiban pembayaran atau penyelesaian hak dan kewajiban yang telah timbul sebelum tanggal efektif berakhirnya Perjanjian.',
    ],
  },
  {
    id: 'ctx-uu-pdp',
    title: 'PELINDUNGAN DATA PRIBADI DAN KEAMANAN INFORMASI',
    category: 'Kepatuhan Regulasi (UU PDP)',
    legalBasis: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
    riskLevel: 'Kritis',
    detectionPatterns: [
      /\bpelindungan data pribadi\b/i,
      /\bdata pribadi\b/i,
      /\b27 tahun 2022\b/i,
      /\buu pdp\b/i,
    ],
    reason:
      'AI mendeteksi draf belum memuat klausul Kepatuhan Pelindungan Data Pribadi (UU No. 27 Tahun 2022 / UU PDP) yang wajib dicantumkan apabila pelaksanaan kontrak melibatkan akses terhadap data pribadi pelanggan, karyawan, atau mitra.',
    content: [
      '(1) Dalam hal pelaksanaan Perjanjian ini melibatkan pengumpulan, pemrosesan, atau pertukaran Data Pribadi, masing-masing Pihak wajib mematuhi seluruh ketentuan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi beserta peraturan pelaksananya.',
      '(2) Pihak yang menerima atau memproses Data Pribadi wajib menerapkan langkah pengamanan teknis dan operasional yang memadai serta dilarang mengungkapkan atau memanfaatkan Data Pribadi tersebut di luar tujuan pelaksanaan Perjanjian ini.',
      '(3) Apabila terjadi insiden kegagalan pelindungan atau kebocoran Data Pribadi, Pihak yang mengalami insiden wajib memberitahukan secara tertulis kepada Pihak lainnya selambat-lambatnya dalam waktu 3 x 24 (tiga kali dua puluh empat) jam sejak diketahuinya insiden tersebut.',
    ],
  },
  {
    id: 'ctx-confidentiality',
    title: 'KERAHASIAAN INFORMASI DAN RAHASIA DAGANG',
    category: 'Kerahasiaan & NDA',
    legalBasis: 'UU No. 30 Tahun 2000 tentang Rahasia Dagang',
    riskLevel: 'Perhatian',
    detectionPatterns: [
      /\bkerahasiaan\b/i,
      /\binformasi rahasia\b/i,
      /\brahasia dagang\b/i,
      /\bconfidential\b/i,
    ],
    reason:
      'AI mendeteksi draf belum mengatur perlindungan Informasi Rahasia dan Rahasia Dagang guna mencegah kebocoran dokumen komersial, harga, atau strategi bisnis ke pihak ketiga.',
    content: [
      '(1) Seluruh data, dokumen teknis, informasi finansial, strategi usaha, maupun rahasia dagang yang dipertukarkan antara Para Pihak sehubungan dengan Perjanjian ini bersifat sangat rahasia ("Informasi Rahasia").',
      '(2) Masing-masing Pihak dilarang menyebarluaskan, menggandakan, atau mengungkapkan Informasi Rahasia kepada pihak ketiga mana pun tanpa persetujuan tertulis terlebih dahulu dari Pihak pemilik Informasi Rahasia.',
      '(3) Kewajiban menjaga kerahasiaan berdasarkan Pasal ini tetap berlaku secara mengikat selama masa berlakunya Perjanjian dan terus bertahan selama 3 (tiga) tahun setelah Perjanjian ini berakhir karena sebab apa pun.',
    ],
  },
  {
    id: 'ctx-representations-warranties',
    title: 'PERNYATAAN, JAMINAN HUKUM, DAN KEPATUHAN ANTI-SUAP',
    category: 'Tata Kelola & Kepatuhan',
    legalBasis: 'Pasal 1320 & Pasal 1338 KUHPerdata',
    riskLevel: 'Standar',
    detectionPatterns: [
      /\bpernyataan dan jaminan\b/i,
      /\banti-suap\b/i,
      /\bgratifikasi\b/i,
      /\bkapasitas hukum\b/i,
    ],
    reason:
      'AI menyarankan penambahan klausul Pernyataan & Jaminan Hukum (Representations & Warranties) serta kepatuhan Anti-Suap/Gratifikasi untuk menjamin keabsahan wewenang penandatangan dan membebaskan pihak dari klaim pihak ketiga.',
    content: [
      '(1) Masing-masing Pihak menyatakan dan menjamin bahwa pihaknya memiliki kapasitas hukum, perizinan usaha yang sah, serta kewenangan penuh berdasarkan Anggaran Dasar untuk menandatangani dan melaksanakan Perjanjian ini.',
      '(2) Penandatanganan dan pelaksanaan Perjanjian ini tidak melanggar ketentuan anggaran dasar, perjanjian lain dengan pihak ketiga, maupun peraturan perundang-undangan yang berlaku di Republik Indonesia.',
      '(3) Para Pihak berkomitmen penuh untuk mematuhi prinsip tata kelola perusahaan yang baik (Good Corporate Governance) serta dilarang memberikan atau menerima suap, komisi tidak sah, atau gratifikasi dalam bentuk apa pun sehubungan dengan Perjanjian ini.',
    ],
  },
  {
    id: 'ctx-non-solicitation',
    title: 'LARANGAN PENGALIHAN HAK DAN NON-SOLICITATION',
    category: 'Proteksi Komersial',
    legalBasis: 'Pasal 1338 KUHPerdata',
    riskLevel: 'Perhatian',
    detectionPatterns: [
      /\bnon-solicitation\b/i,
      /\bmembajak karyawan\b/i,
      /\bmerekrut karyawan\b/i,
      /\bmengalihkan sebagian atau seluruh\b/i,
    ],
    reason:
      'AI menyarankan penambahan klausul Larangan Pengalihan Hak (Non-Assignment) dan Non-Solicitation untuk mencegah pengalihan pekerjaan ke sub-kontraktor tanpa izin serta mencegah pembajakan personel kunci.',
    content: [
      '(1) Masing-masing Pihak dilarang mengalihkan sebagian atau seluruh hak dan kewajibannya berdasarkan Perjanjian ini kepada pihak ketiga mana pun tanpa persetujuan tertulis terlebih dahulu dari Pihak lainnya.',
      '(2) Selama masa berlakunya Perjanjian ini dan dalam jangka waktu 12 (dua belas) bulan setelah berakhirnya Perjanjian, masing-masing Pihak dilarang secara langsung maupun tidak langsung membujuk atau merekrut karyawan kunci dari Pihak lainnya yang terlibat langsung dalam pelaksanaan Perjanjian ini.',
    ],
  },
  {
    id: 'ctx-severability-addendum',
    title: 'KETERPISAHAN, ADDENDUM, DAN KESELURUHAN PERJANJIAN',
    category: 'Ketentuan Penutup',
    legalBasis: 'Pasal 1338 KUHPerdata',
    riskLevel: 'Standar',
    detectionPatterns: [
      /\bketerpisahan\b/i,
      /\bseverability\b/i,
      /\baddendum\b/i,
      /\bkeseluruhan perjanjian\b/i,
    ],
    reason:
      'AI mendeteksi draf belum memuat klausul Keterpisahan (Severability) dan mekanisme Addendum tertulis agar perubahan syarat di masa depan tidak dilakukan secara lisan.',
    content: [
      '(1) Segala hal yang belum diatur atau perubahan terhadap ketentuan dalam Perjanjian ini hanya sah dan mengikat apabila dituangkan secara tertulis dalam suatu Addendum atau Amandemen yang ditandatangani oleh wakil sah Para Pihak.',
      '(2) Apabila terdapat satu atau lebih ketentuan dalam Perjanjian ini yang dinyatakan batal demi hukum atau tidak dapat dilaksanakan berdasarkan peraturan perundang-undangan yang berlaku, maka ketentuan lainnya dalam Perjanjian ini tetap berlaku dan mengikat sepenuhnya (Asas Keterpisahan / Severability).',
    ],
  },
];

export function detectMissingContextualClauses(
  doc: LegalDocument
): ContextualClauseSuggestion[] {
  const allClausesText = doc.clauses
    .map((c) => `${c.title} ${c.legalBasis} ${c.content.join(' ')}`)
    .join(' ');

  const missing: ContextualClauseSuggestion[] = [];

  for (const tpl of ESSENTIAL_CLAUSE_TEMPLATES) {
    const isPresent = tpl.detectionPatterns.some((regex) => regex.test(allClausesText));
    if (!isPresent) {
      missing.push({
        id: tpl.id,
        title: tpl.title,
        category: tpl.category,
        legalBasis: tpl.legalBasis,
        riskLevel: tpl.riskLevel,
        reason: tpl.reason,
        content: [...tpl.content],
      });
    }
  }

  return missing;
}

export function generateSmartChecklistForDocument(
  doc: LegalDocument
): SmartChecklistItem[] {
  const items: SmartChecklistItem[] = [];
  const seenKeys = new Set<string>();

  const pushUniqueItem = (item: SmartChecklistItem) => {
    const normKey = `${item.targetLocation.toLowerCase()}::${item.task
      .toLowerCase()
      .slice(0, 45)}`;
    if (!seenKeys.has(normKey)) {
      seenKeys.add(normKey);
      items.push(item);
    }
  };

  // 1. Check Unfilled Bracketed Placeholders [...] across Komparisi & Clauses
  const fullText = `${doc.openingText} ${doc.partyOne.name} ${doc.partyOne.representative} ${doc.partyOne.address} ${doc.partyOne.description} ${doc.partyTwo.name} ${doc.partyTwo.representative} ${doc.partyTwo.address} ${doc.partyTwo.description} ${doc.clauses
    .map((c) => c.content.join(' '))
    .join(' ')}`;
  const bracketMatches = Array.from(
    new Set(
      (fullText.match(/\[[^\]]+\]/g) || []).filter(
        (m) =>
          !m.toLowerCase().includes('materai') &&
          !m.toLowerCase().includes('ruang tanda')
      )
    )
  );

  if (bracketMatches.length > 0) {
    pushUniqueItem({
      id: `chk-placeholders-${doc.id}`,
      task: `Lengkapi ${bracketMatches.length} placeholder data yang masih dalam kurung siku: ${bracketMatches.join(', ')}`,
      category: 'Identitas Pihak',
      priority: 'Tinggi',
      targetLocation: 'Komparisi',
      reason:
        'Terdapat variabel identitas atau nomor administrasi yang masih berformat placeholder [...] dan wajib dilengkapi sebelum penandatanganan.',
      mitigationAction: 'Hubungi Notaris / Verifikasi Legalitas',
      mitigationDetail:
        'Minta salinan Akta Pendirian, SK Kemenkumham, NIB, dan KTP Direksi/Pihak terkait atau hubungi Notaris untuk memvalidasi komparisi sebelum penandatanganan.',
    });
  }

  // 2. Check Signatory Authority & Legal Capacity (Komparisi)
  pushUniqueItem({
    id: `chk-signatory-${doc.id}`,
    task: `Verifikasi kapasitas hukum & kewenangan wakil penandatangan (${doc.partyOne.representative} & ${doc.partyTwo.representative}) sesuai Akta/AD-ART/KTP`,
    category: 'Identitas Pihak',
    priority: 'Sedang',
    targetLocation: 'Komparisi',
    reason:
      'Sesuai Pasal 1320 KUHPerdata dan UU PT, penandatangan kontrak wajib memiliki kecakapan dan wewenang sah mewakili subjek hukum.',
    mitigationAction: 'Hubungi Notaris (Legalisasi / Waarmerking)',
    mitigationDetail:
      'Hubungi Notaris untuk melakukan Legalisasi tanda tangan atau Waarmerking akta di bawah tangan serta memeriksa kecocokan kewenangan Direksi pada AD/ART perseroan.',
  });

  // 3. Check Every Clause with 'Kritis' or 'Perhatian' Risk Level (Unlimited — 1 per risky clause)
  doc.clauses.forEach((clause) => {
    const level = (clause.riskLevel || '').toLowerCase();
    const clauseText = `${clause.title} ${clause.content.join(' ')}`;

    if (level === 'kritis' || level === 'perhatian') {
      let specificAction = `Tinjau dan verifikasi klausul "${clause.title}" (${clause.legalBasis})`;
      let specificReason = `Klausul ${clause.number} berstatus risiko ${clause.riskLevel} dan memerlukan verifikasi substansi hukum secara menyeluruh.`;
      let category: SmartChecklistItem['category'] = 'Mitigasi Klausul';
      let mitigationAction =
        level === 'kritis'
          ? 'Hubungi Notaris / Konsultan Hukum'
          : 'Siapkan Dokumen Pendukung (BAST / SLA)';
      let mitigationDetail =
        level === 'kritis'
          ? `Lakukan telaah legal opini bersama Notaris/Konsultan Hukum atau lakukan pengesahan akta untuk memitigasi risiko ${clause.riskLevel} pada ${clause.number}.`
          : `Dokumentasikan pelaksanaan kewajiban pada ${clause.number} melalui Berita Acara tertulis yang ditandatangani kedua pihak.`;

      if (/nilai|harga|biaya|pembayaran|termin|pajak|denda|penalti/i.test(clauseText)) {
        category = 'Finansial';
        specificAction = `Verifikasi nominal pembayaran, batas denda keterlambatan, dan kewajiban pajak pada ${clause.number} (${clause.title})`;
        specificReason = `Memastikan rincian nominal, syarat pencairan termin, serta batas maksimum denda (cap) pada ${clause.number} tidak menimbulkan eksposur finansial berlebih.`;
        mitigationAction = 'Asuransikan / Minta Bank Garansi & Konsultasi Pajak';
        mitigationDetail =
          'Syaratkan Jaminan Pelaksanaan (Performance Bond / Bank Garansi) atau asuransi kredit perdagangan, serta konsultasikan pemotongan PPh 23/PPh Final & Faktur PPN dengan Konsultan Pajak.';
      } else if (/jangka waktu|masa berlaku|periode|durasi|berakhir/i.test(clauseText)) {
        category = 'Masa Berlaku';
        specificAction = `Periksa periode masa berlaku, Tanggal Efektif (${doc.effectiveDate}), dan tenggat pemberitahuan perpanjangan pada ${clause.number}`;
        specificReason = `Menghindari perpanjangan otomatis yang tidak disengaja atau kekosongan masa perikatan pada ${clause.number}.`;
        mitigationAction = 'Siapkan Kalender Kepatuhan & Pengingat Addendum';
        mitigationDetail =
          'Jadwalkan evaluasi kontrak minimal 30 hari sebelum berakhir dan siapkan draf Addendum tertulis apabila masa perikatan diperpanjang.';
      } else if (/pengakhiran|pemutusan|1266|1267|wanprestasi/i.test(clauseText)) {
        category = 'Mitigasi Klausul';
        specificAction = `Pastikan syarat pemutusan sepihak, masa perbaikan (cure period), dan pengenyampingan Pasal 1266 & 1267 KUHPerdata pada ${clause.number}`;
        specificReason = `Klausul pengakhiran kontrak menentukan apakah kontrak dapat diakhiri tanpa putusan pengadilan apabila terjadi wanprestasi.`;
        mitigationAction = 'Hubungi Notaris & Siapkan Prosedur Somasi Resmi';
        mitigationDetail =
          'Hubungi Notaris/Kuasa Hukum untuk memastikan keabsahan klausul pengenyampingan Pasal 1266 & 1267 KUHPerdata serta siapkan format Surat Peringatan (Somasi) bertahap.';
      } else if (/kekayaan intelektual|hak cipta|hki|lisensi|kode sumber/i.test(clauseText)) {
        category = 'Mitigasi Klausul';
        specificAction = `Tinjau syarat peralihan Hak Kekayaan Intelektual (HKI) dan perlindungan hak moral/ekonomi pada ${clause.number} (${clause.title})`;
        specificReason = `Memastikan kepemilikan hasil karya/HKI hanya beralih setelah pelunasan penuh sesuai UU Hak Cipta No. 28 Tahun 2014.`;
        mitigationAction = 'Daftarkan ke DJKI Kemenkumham / Akta Pengalihan HKI';
        mitigationDetail =
          'Catatkan perjanjian lisensi atau akta pengalihan Hak Cipta/Merek pada Direktorat Jenderal Kekayaan Intelektual (DJKI) agar mengikat pihak ketiga.';
      } else if (/kerahasiaan|rahasia dagang|data pribadi|pdp/i.test(clauseText)) {
        category = 'Mitigasi Klausul';
        specificAction = `Verifikasi cakupan Informasi Rahasia, masa bertahan (survival period), dan kepatuhan UU PDP pada ${clause.number}`;
        specificReason = `Melindungi rahasia dagang (UU No. 30/2000) dan data pribadi (UU No. 27/2022) bahkan setelah masa kontrak berakhir.`;
        mitigationAction = 'Asuransikan (Cyber Liability) & Audit Kepatuhan UU PDP';
        mitigationDetail =
          'Lindungi risiko kebocoran data dengan Asuransi Siber (Cyber Liability Insurance) dan pastikan prosedur notifikasi insiden 3x24 jam sesuai UU No. 27 Tahun 2022.';
      } else if (/tanggung jawab|ganti rugi|indemnifikasi|jaminan|garansi|kahar|force majeure/i.test(clauseText)) {
        category = 'Mitigasi Klausul';
        specificAction = `Tinjau batasan tanggung jawab (limitation of liability) dan ruang lingkup ganti rugi pada ${clause.number} (${clause.title})`;
        specificReason = `Mencegah tuntutan ganti rugi tak terbatas (unlimited liability) yang melebihi nilai kontrak pada ${clause.number}.`;
        mitigationAction = 'Asuransikan (Professional Indemnity / Tanggung Gugat)';
        mitigationDetail =
          'Alihkan risiko tuntutan ganti rugi pihak ketiga dan kegagalan operasional dengan menutup polis Asuransi Tanggung Gugat (Public/Professional Indemnity Insurance).';
      } else if (/substitusi|retensi|khusus|pemberi kuasa|penerima kuasa/i.test(clauseText)) {
        category = 'Mitigasi Klausul';
        specificAction = `Verifikasi batas kewenangan Penerima Kuasa, Hak Substitusi (Pasal 1803), dan Hak Retensi (Pasal 1812) pada ${clause.number}`;
        specificReason = `Memastikan tindak hukum wakil tidak melampaui mandat khusus yang diberikan oleh Pemberi Kuasa.`;
        mitigationAction = 'Hubungi Notaris (Legalisasi Surat Kuasa Khusus)';
        mitigationDetail =
          'Hubungi Notaris untuk melegalisasi Surat Kuasa Khusus agar keabsahan tanda tangan dan tanggal pemberian kuasa tidak dapat disangkal di hadapan instansi/pengadilan.';
      }

      pushUniqueItem({
        id: `chk-clause-risk-${doc.id}-${clause.id}`,
        task: specificAction,
        category,
        priority: level === 'kritis' ? 'Tinggi' : 'Sedang',
        targetLocation: clause.number,
        reason: specificReason,
        mitigationAction,
        mitigationDetail,
      });
    }
  });

  // 4. Include Every Document Audit Note (doc.auditNotes) as an Actionable Verification Item
  (doc.auditNotes || []).forEach((note, idx) => {
    const noteCombined = `${note.title} ${note.recommendation}`;
    const matchedClause = doc.clauses.find((c) => {
      const m = noteCombined.match(/Pasal\s+\d+/i);
      return m && c.number.toLowerCase() === m[0].toLowerCase();
    });
    const targetLoc = matchedClause ? matchedClause.number : 'Pasal 1';
    const isHigh =
      note.severity === 'Krusial' ||
      /kritis|wajib|penting|denda|1266|pajak|sengketa|risiko/i.test(noteCombined);

    let auditMitigationAction = isHigh
      ? 'Hubungi Notaris / Konsultan Hukum'
      : 'Siapkan Dokumen Pendukung';
    let auditMitigationDetail = note.recommendation;

    if (/asuransi|tanggung jawab|ganti rugi|kahar|risiko/i.test(noteCombined)) {
      auditMitigationAction = 'Asuransikan / Batasi Tanggung Gugat';
    } else if (/notaris|akta|komparisi|wewenang|kuasa|1266/i.test(noteCombined)) {
      auditMitigationAction = 'Hubungi Notaris (Legalisasi / Akta)';
    } else if (/pajak|pph|ppn|termin|denda|pembayaran/i.test(noteCombined)) {
      auditMitigationAction = 'Konsultasi Pajak & Minta Jaminan Bank';
    } else if (/disnaker|pkwt|kompensasi|hki|pdp/i.test(noteCombined)) {
      auditMitigationAction = 'Registrasi Instansi & Audit Kepatuhan';
    }

    pushUniqueItem({
      id: `chk-audit-note-${doc.id}-${idx}`,
      task: `Verifikasi Audit (${note.title}): ${note.recommendation}`,
      category: 'Mitigasi Klausul',
      priority: isHigh ? 'Tinggi' : note.severity === 'Perlu Verifikasi' ? 'Sedang' : 'Standar',
      targetLocation: targetLoc,
      reason: `Temuan Audit Hukum berstatus "${note.severity}" pada draf aktif yang perlu dikonfirmasi sebelum penandatanganan.`,
      mitigationAction: auditMitigationAction,
      mitigationDetail: auditMitigationDetail,
    });
  });

  // 5. Include Every Cross-Clause Terminology Inconsistency & Legal Conflict from Comprehensive Risk Scan
  const scanFindings = runComprehensiveRiskScan(doc);
  scanFindings.forEach((finding) => {
    const firstTarget = finding.involvedClauses[0] || 'Pasal 1';
    pushUniqueItem({
      id: `chk-scan-${doc.id}-${finding.id}`,
      task: `${finding.type}: ${finding.title} (${finding.involvedClauses.join(', ')})`,
      category: 'Mitigasi Klausul',
      priority: finding.severity === 'Kritis' ? 'Tinggi' : 'Sedang',
      targetLocation: firstTarget,
      reason: `${finding.description} Rekomendasi: ${finding.recommendation}`,
      mitigationAction: 'Harmonisasi Klausul & Review Legal',
      mitigationDetail: finding.recommendation,
    });
  });

  // 6. Include Every Missing Essential Protection Clause Detected in the Draft
  const missingClauses = detectMissingContextualClauses(doc);
  missingClauses.forEach((missing) => {
    const isInsuranceTopic = /kahar|force majeure|tanggung jawab|data pribadi/i.test(missing.title);
    pushUniqueItem({
      id: `chk-missing-${doc.id}-${missing.id}`,
      task: `Pertimbangkan penambahan klausul "${missing.title}" (${missing.legalBasis}) yang belum termuat dalam draf`,
      category: missing.category,
      priority:
        missing.riskLevel === 'Kritis'
          ? 'Tinggi'
          : missing.riskLevel === 'Perhatian'
          ? 'Sedang'
          : 'Standar',
      targetLocation: `Pasal ${doc.clauses.length}`,
      reason: missing.reason,
      mitigationAction: isInsuranceTopic
        ? 'Asuransikan & Sisipkan Klausul Proteksi'
        : 'Sisipkan Klausul & Konsultasikan ke Notaris',
      mitigationDetail: `Tambahkan klausul ${missing.title} ke dalam naskah kontrak dan lengkapi proteksi eksternal (${
        isInsuranceTopic ? 'polis asuransi risiko terkait' : 'pengesahan legalitas'
      }).`,
    });
  });

  // 7. Check Financial Variables Consistency if not already covered
  (doc.variables || []).forEach((v, vIdx) => {
    if (
      v.category.toLowerCase().includes('finansial') ||
      /rp|nilai|harga|upah|biaya|denda|termin/i.test(`${v.key} ${v.value}`)
    ) {
      const finClause = doc.clauses.find((c) =>
        /nilai|harga|biaya|pembayaran|upah|kompensasi|sewa|termin/i.test(
          `${c.title} ${c.content.join(' ')}`
        )
      );
      pushUniqueItem({
        id: `chk-var-fin-${doc.id}-${vIdx}`,
        task: `Konfirmasi kesesuaian variabel finansial "${v.key}" (${v.value}) di seluruh ayat dan lampiran`,
        category: 'Finansial',
        priority: 'Tinggi',
        targetLocation: finClause ? finClause.number : 'Pasal 3',
        reason:
          'Memastikan nilai variabel finansial sinkron antara angka numerik, penulisan huruf (terbilang), dan jadwal pembayaran.',
        mitigationAction: 'Konsultasi Pajak & Siapkan Escrow / Jaminan',
        mitigationDetail: `Verifikasi implikasi PPN/PPh atas "${v.key}" (${v.value}) bersama bagian keuangan/pajak dan gunakan mekanisme pencairan bertahap berbasis BAST.`,
      });
    }
  });

  // 8. Check Dispute Resolution & Jurisdiction Forum
  const disputeClause = doc.clauses.find((c) =>
    /sengketa|perselisihan|pengadilan|arbitrase|bani|domisili/i.test(
      `${c.title} ${c.content.join(' ')}`
    )
  );
  pushUniqueItem({
    id: `chk-jurisdiction-${doc.id}`,
    task: `Konfirmasi forum penyelesaian sengketa dan pilihan domisili hukum (${doc.jurisdiction})`,
    category: 'Mitigasi Klausul',
    priority: 'Standar',
    targetLocation: disputeClause
      ? disputeClause.number
      : `Pasal ${doc.clauses.length}`,
    reason:
      'Memastikan forum penyelesaian sengketa (Pengadilan Negeri atau Arbitrase BANI) telah disepakati secara tegas oleh Para Pihak.',
    mitigationAction: 'Hubungi Notaris / Kuasa Hukum Litigasi',
    mitigationDetail:
      'Pastikan klausul pilihan forum (Pengadilan Negeri atau BANI) bersifat eksklusif dan tidak tumpang tindih agar eksekusi putusan berjalan efektif.',
  });

  return items;
}

/**
 * Generates concrete, actionable Risk Mitigation Insights for every clause in the document
 * based on its risk classification ('Kritis', 'Perhatian', 'Standar') and legal category.
 */
export function generateRiskMitigationInsightsForDocument(
  doc: LegalDocument
): RiskMitigationInsight[] {
  return doc.clauses.map((clause) => {
    const categorized = categorizeClauseWithLabels(clause);
    const cat = categorized.category;
    const risk = clause.riskLevel || 'Standar';
    const text = `${clause.title} ${clause.content.join(' ')}`;

    let actionType: RiskMitigationInsight['actionType'] = 'Dokumen Operasional';
    let actionLabel = 'Siapkan BAST & SOP Pelaksanaan';
    let recommendation =
      'Dokumentasikan setiap pemenuhan kewajiban pasal ini secara tertulis menggunakan Berita Acara yang ditandatangani wakil sah kedua pihak.';
    let rationale = `Klausul ${clause.number} (${cat}) berstatus risiko ${risk}.`;

    if (
      /kuasa|substitusi|retensi|komparisi|akta|jaminan pribadi|borgtocht|sewa|tanah|bangunan/i.test(
        text
      ) ||
      (risk === 'Kritis' && (cat === 'Governance & Dispute' || cat === 'Termination'))
    ) {
      actionType = 'Hubungi Notaris';
      actionLabel = 'Hubungi Notaris (Legalisasi / Waarmerking)';
      recommendation = `Hubungi Notaris untuk melakukan Legalisasi tanda tangan atau Waarmerking atas perjanjian serta memverifikasi keabsahan wewenang bertindak terkait ${clause.number} (${clause.title}).`;
      rationale = `Risiko ${risk} pada aspek ${cat}: pengesahan Notaris memperkuat kekuatan pembuktian akta sesuai Pasal 1874 & 1875 KUHPerdata.`;
    } else if (
      cat === 'Liability' ||
      /tanggung jawab|ganti rugi|indemnifikasi|kahar|force majeure|kecelakaan|kerusakan|garansi/i.test(
        text
      )
    ) {
      actionType = 'Asuransikan';
      actionLabel = 'Asuransikan (Professional Indemnity / Tanggung Gugat)';
      recommendation = `Asuransikan eksposur risiko pada ${clause.number} dengan polis Asuransi Tanggung Gugat (Professional Indemnity / Errors & Omissions) atau Asuransi Kerugian Komersial senilai minimal batas eksposur kontrak.`;
      rationale = `Risiko ${risk} pada aspek ${cat}: mengalihkan beban finansial tuntutan ganti rugi atau kejadian tak terduga kepada perusahaan asuransi.`;
    } else if (cat === 'Financial' || /pembayaran|harga|nilai|termin|denda|penalti|uang muka/i.test(text)) {
      if (/pajak|pph|ppn|faktur/i.test(text)) {
        actionType = 'Konsultasi Pajak';
        actionLabel = 'Konsultasi Pajak (Verifikasi PPh & e-Faktur PPN)';
        recommendation = `Hubungi Konsultan Pajak untuk memastikan tarif pemotongan PPh (Pasal 23 / Pasal 21 / Pasal 4 ayat 2) dan penerbitan e-Faktur PPN pada ${clause.number} telah sesuai regulasi DJP terbaru.`;
        rationale = `Risiko ${risk} pada aspek ${cat}: mencegah sanksi administrasi perpajakan dan selisih nilai bersih pembayaran.`;
      } else {
        actionType = 'Jaminan & Escrow';
        actionLabel = 'Minta Bank Garansi / Asuransi Jaminan & Cek Pajak';
        recommendation = `Amankan transaksi pada ${clause.number} dengan meminta Jaminan Uang Muka / Performance Bond (Bank Garansi atau Surety Bond) serta verifikasi kewajiban pemotongan pajak terkait.`;
        rationale = `Risiko ${risk} pada aspek ${cat}: melindungi arus kas dari risiko gagal bayar atau wanprestasi setelah pencairan termin.`;
      }
    } else if (cat === 'Confidentiality' || /data pribadi|pdp|rahasia|siber|kebocoran/i.test(text)) {
      actionType = 'Asuransikan';
      actionLabel = 'Asuransikan (Cyber Liability) & Audit UU PDP';
      recommendation = `Lindungi risiko kebocoran informasi pada ${clause.number} melalui Asuransi Risiko Siber (Cyber Liability Insurance), pembatasan akses berjenjang (NDA), dan protokol pelaporan 3x24 jam sesuai UU PDP.`;
      rationale = `Risiko ${risk} pada aspek ${cat}: pelanggaran data pribadi dan rahasia dagang membawa sanksi denda administratif hingga 2% pendapatan tahunan.`;
    } else if (cat === 'Intellectual Property' || /hak cipta|hki|merek|paten|lisensi|kode sumber/i.test(text)) {
      actionType = 'Registrasi & Kepatuhan';
      actionLabel = 'Daftarkan ke DJKI Kemenkumham / Notaris HKI';
      recommendation = `Catatkan pengalihan hak ekonomi atau lisensi pada ${clause.number} ke Direktorat Jenderal Kekayaan Intelektual (DJKI) Kemenkumham dan gunakan repositori Escrow untuk penyerahan kode sumber/aset.`;
      rationale = `Risiko ${risk} pada aspek ${cat}: pencatatan lisensi/pengalihan HKI di DJKI wajib agar mengikat secara sah terhadap pihak ketiga.`;
    } else if (cat === 'Termination' || /pengakhiran|pemutusan|1266|1267/i.test(text)) {
      actionType = 'Hubungi Notaris';
      actionLabel = 'Hubungi Notaris / Kuasa Hukum (Validasi Klausul 1266)';
      recommendation = `Konsultasikan ke Notaris atau Kuasa Hukum untuk memastikan pengenyampingan Pasal 1266 & 1267 KUHPerdata pada ${clause.number} sah serta siapkan prosedur pengiriman Somasi tercatat.`;
      rationale = `Risiko ${risk} pada aspek ${cat}: memastikan pemutusan kontrak dapat dieksekusi tanpa terhambat gugatan pembatalan sepihak.`;
    } else if (cat === 'Governance & Dispute' || /sengketa|arbitrase|bani|pengadilan/i.test(text)) {
      actionType = 'Hubungi Notaris';
      actionLabel = 'Hubungi Notaris / Konsultan Hukum Sengketa';
      recommendation = `Verifikasi klausul domisili hukum dan forum penyelesaian sengketa pada ${clause.number} bersama Konsultan Hukum/Notaris agar tidak terjadi konflik yurisdiksi (Pengadilan Negeri vs BANI).`;
      rationale = `Risiko ${risk} pada aspek ${cat}: ketegasan pilihan forum menentukan kemudahan eksekusi putusan hukum di kemudian hari.`;
    }

    return {
      id: `rmi-${doc.id}-${clause.id}`,
      clauseId: clause.id,
      clauseNumber: clause.number,
      clauseTitle: clause.title,
      riskLevel: risk,
      clauseCategory: cat,
      actionType,
      actionLabel,
      recommendation,
      rationale,
    };
  });
}

/**
 * Comprehensive Cross-Clause Risk Scanner:
 * Scans the entire document for:
 * 1. Inkonsistensi Terminologi Antar Pasal (terminology discrepancies across clauses)
 * 2. Konflik Klausul Hukum (clauses that legally contradict each other)
 */
export function runComprehensiveRiskScan(
  doc: LegalDocument
): ComprehensiveScanFinding[] {
  const findings: ComprehensiveScanFinding[] = [];
  const clauses = doc.clauses || [];

  // 1. Check "Hari Kerja" vs "Hari Kalender" terminology inconsistency across clauses
  const hariKerjaClauses = clauses
    .filter((c) => /hari kerja/i.test(c.content.join(' ')))
    .map((c) => c.number);
  const hariKalenderClauses = clauses
    .filter((c) => /hari kalender/i.test(c.content.join(' ')))
    .map((c) => c.number);

  if (hariKerjaClauses.length > 0 && hariKalenderClauses.length > 0) {
    findings.push({
      id: `scan-term-days-${doc.id}`,
      type: 'Inkonsistensi Terminologi',
      severity: 'Perhatian',
      title: 'Inkonsistensi Satuan Waktu: "Hari Kerja" vs "Hari Kalender" Antar Pasal',
      involvedClauses: Array.from(new Set([...hariKerjaClauses, ...hariKalenderClauses])),
      description: `Ditemukan penggunaan istilah "${hariKerjaClauses.join(', ')}" yang memakai satuan "Hari Kerja", sedangkan "${hariKalenderClauses.join(', ')}" memakai satuan "Hari Kalender". Perbedaan ini berpotensi menimbulkan sengketa perhitungan jatuh tempo wanprestasi dan denda keterlambatan.`,
      recommendation:
        'Seragamkan satuan perhitungan tenggat waktu menjadi "Hari Kalender" atau "Hari Kerja" di seluruh pasal, atau tambahkan definisi tegas mengenai perbedaan keduanya.',
      harmonizeTarget: {
        fromTerm: 'Hari Kalender',
        toTerm: 'Hari Kerja',
      },
    });
  } else if (clauses.length >= 2) {
    findings.push({
      id: `scan-term-days-def-${doc.id}`,
      type: 'Inkonsistensi Terminologi',
      severity: 'Perhatian',
      title: 'Ketiadaan Definisi Baku Satuan Waktu ("Hari Kerja" vs "Hari Kalender")',
      involvedClauses: [clauses[0].number, clauses[1].number],
      description: `Klausul dalam ${clauses[0].number} dan ${clauses[1].number} menyebutkan tenggat waktu pelaksanaan kewajiban tanpa mendefinisikan apakah hari libur nasional diperhitungkan sebagai Hari Kerja atau Hari Kalender.`,
      recommendation:
        'Pastikan penulisan satuan waktu di seluruh pasal menggunakan istilah baku "Hari Kerja" secara konsisten.',
      harmonizeTarget: {
        targetClauseNumber: clauses[0].number,
        appendClarification:
          'Seluruh penyebutan satuan hari dalam Perjanjian ini merujuk pada Hari Kerja kecuali dinyatakan lain secara tegas.',
      },
    });
  }

  // 2. Check Financial / Compensation terminology inconsistency across clauses
  const nilaiTermsMap: { term: string; clauses: string[] }[] = [
    {
      term: 'Harga Pekerjaan / Nilai Kontrak',
      clauses: clauses
        .filter((c) => /harga pekerjaan|nilai kontrak|nilai perjanjian/i.test(c.content.join(' ')))
        .map((c) => c.number),
    },
    {
      term: 'Biaya Jasa / Imbalan / Kompensasi',
      clauses: clauses
        .filter((c) => /biaya jasa|imbalan|kompensasi|upah|uang sewa/i.test(c.content.join(' ')))
        .map((c) => c.number),
    },
    {
      term: 'Tagihan / Invoice',
      clauses: clauses
        .filter((c) => /tagihan|invoice/i.test(c.content.join(' ')))
        .map((c) => c.number),
    },
  ].filter((g) => g.clauses.length > 0);

  if (nilaiTermsMap.length >= 2) {
    const allInvolved = Array.from(new Set(nilaiTermsMap.flatMap((g) => g.clauses)));
    findings.push({
      id: `scan-term-finance-${doc.id}`,
      type: 'Inkonsistensi Terminologi',
      severity: 'Perhatian',
      title: 'Variasi Istilah Kompensasi & Nilai Finansial Antar Pasal',
      involvedClauses: allInvolved.length > 0 ? allInvolved : [clauses[0]?.number || 'Pasal 1'],
      description: `Dokumen menggunakan beberapa istilah berbeda untuk merujuk objek pembayaran (${nilaiTermsMap.map((g) => g.term).join(' vs ')}) pada ${allInvolved.join(', ')}. Dalam penafsiran Pasal 1342-1345 KUHPerdata, perbedaan istilah finansial dapat menimbulkan multitafsir dasar pengenaan denda atau pajak.`,
      recommendation:
        'Harmonisasikan istilah nilai pembayaran di seluruh pasal agar merujuk pada satu istilah baku yang konsisten.',
      harmonizeTarget: {
        fromTerm: 'invoice',
        toTerm: 'dokumen tagihan (Invoice) resmi',
      },
    });
  }

  // 3. Check Legal Conflict: Dispute Resolution Forum (Pengadilan Negeri vs Arbitrase BANI)
  const pnClauses = clauses
    .filter((c) => /pengadilan negeri/i.test(`${c.title} ${c.content.join(' ')}`))
    .map((c) => c.number);
  const arbitraseClauses = clauses
    .filter((c) => /arbitrase|bani/i.test(`${c.title} ${c.content.join(' ')}`))
    .map((c) => c.number);

  if (pnClauses.length > 0 && arbitraseClauses.length > 0) {
    findings.push({
      id: `scan-conflict-forum-${doc.id}`,
      type: 'Konflik Klausul Hukum',
      severity: 'Kritis',
      title: 'Pertentangan Kompetensi Absolut Forum Sengketa: Pengadilan Negeri vs Arbitrase (BANI)',
      involvedClauses: Array.from(new Set([...pnClauses, ...arbitraseClauses])),
      description: `Terdapat rujukan ganda ke Kepaniteraan Pengadilan Negeri (${pnClauses.join(', ')}) sekaligus Badan Arbitrase Nasional Indonesia / BANI (${arbitraseClauses.join(', ')}). Berdasarkan Pasal 3 dan Pasal 11 UU No. 30 Tahun 1999 tentang Arbitrase, klausul arbitrase meniadakan kompetensi Pengadilan Negeri sehingga pencantuman keduanya secara bersamaan saling bertentangan secara hukum.`,
      recommendation:
        'Pilih satu forum penyelesaian sengketa secara eksklusif (Arbitrase BANI saja atau Pengadilan Negeri saja) agar klausul sengketa tidak cacat formil (obscuur libel).',
      harmonizeTarget: {
        fromTerm: ' atau melalui Badan Arbitrase Nasional Indonesia (BANI)',
        toTerm: '',
      },
    });
  }

  // 4. Check Legal Conflict: Unilateral Immediate Termination vs Pasal 1266 KUHPerdata / Cure Period
  const terminationClauses = clauses.filter((c) =>
    /mengakhiri|pemutusan|pengakhiran|wanprestasi|denda/i.test(`${c.title} ${c.content.join(' ')}`)
  );
  const has1266Waiver = clauses.some((c) => /1266/i.test(c.content.join(' ')));
  const immediateTermClauses = clauses
    .filter((c) => /seketika|sepihak/i.test(c.content.join(' ')))
    .map((c) => c.number);
  const curePeriodClauses = clauses
    .filter((c) => /14 \(empat belas\)|30 \(tiga puluh\)|surat peringatan|teguran/i.test(c.content.join(' ')))
    .map((c) => c.number);

  if (!has1266Waiver) {
    const involved =
      terminationClauses.length > 0
        ? terminationClauses.map((c) => c.number)
        : [clauses[clauses.length - 1]?.number || 'Pasal Terakhir'];
    findings.push({
      id: `scan-conflict-1266-${doc.id}`,
      type: 'Konflik Klausul Hukum',
      severity: 'Kritis',
      title: 'Pertentangan Hak Pengakhiran Kontrak vs Keberlakuan Pasal 1266 KUHPerdata',
      involvedClauses: involved,
      description: `Klausul pada ${involved.join(', ')} mengatur sanksi wanprestasi atau berakhirnya perjanjian, namun draf belum mengesampingkan Pasal 1266 & Pasal 1267 KUHPerdata secara tegas. Secara hukum perdata Indonesia, tanpa pengenyampingan Pasal 1266 KUHPerdata, pengakhiran sepihak bertentangan dengan syarat batal yang wajib dimintakan ke Hakim Pengadilan Negeri.`,
      recommendation:
        'Tambahkan klausul pengenyampingan tegas terhadap Pasal 1266 dan Pasal 1267 KUHPerdata agar hak pengakhiran sepihak sah tanpa putusan pengadilan.',
      harmonizeTarget: {
        targetClauseNumber: involved[0],
        appendClarification:
          'Para Pihak dengan tegas sepakat mengesampingkan ketentuan Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata sepanjang mengenai diperlukannya putusan pengadilan untuk mengakhiri Perjanjian ini.',
      },
    });
  } else if (immediateTermClauses.length > 0 && curePeriodClauses.length > 0) {
    findings.push({
      id: `scan-conflict-cure-${doc.id}`,
      type: 'Konflik Klausul Hukum',
      severity: 'Kritis',
      title: 'Konflik Norma Pengakhiran Seketika vs Hak Masa Perbaikan (Cure Period)',
      involvedClauses: Array.from(new Set([...immediateTermClauses, ...curePeriodClauses])),
      description: `Terdapat ketegangan norma antara klausul pada ${immediateTermClauses.join(', ')} yang memberikan hak pemutusan "seketika tanpa teguran" dengan klausul pada ${curePeriodClauses.join(', ')} yang mensyaratkan masa perbaikan/verifikasi terlebih dahulu.`,
      recommendation:
        'Tegaskan bahwa pemutusan seketika hanya berlaku setelah masa perbaikan (cure period) terlampaui atau khusus untuk pelanggaran kerahasiaan/HKI yang bersifat tidak dapat dipulihkan.',
      harmonizeTarget: {
        targetClauseNumber: immediateTermClauses[0],
        appendClarification:
          'Pelaksanaan hak pengakhiran seketika pada Pasal ini berlaku khusus bagi pelanggaran material yang tidak dipulihkan setelah lewatnya masa perbaikan tertulis yang diberikan.',
      },
    });
  }

  // 5. Check Legal Conflict: Scope/Obligation Transfer vs Payment Retention / Liability Cap
  const paymentOrSanction = clauses.find((c) =>
    /pembayaran|harga|biaya|upah|sewa/i.test(c.title)
  );
  const ipOrScope = clauses.find((c) =>
    /kekayaan intelektual|hki|hak cipta|ruang lingkup|kewajiban/i.test(c.title)
  );
  if (paymentOrSanction && ipOrScope && paymentOrSanction.id !== ipOrScope.id) {
    findings.push({
      id: `scan-conflict-ip-payment-${doc.id}`,
      type: 'Konflik Klausul Hukum',
      severity: 'Perhatian',
      title: `Sinkronisasi Syarat Peralihan Hak (${ipOrScope.number}) vs Pelunasan Pembayaran (${paymentOrSanction.number})`,
      involvedClauses: [paymentOrSanction.number, ipOrScope.number],
      description: `Ketentuan pelaksanaan hak dan serah terima pada ${ipOrScope.number} (${ipOrScope.title}) perlu disinkronkan secara bersyarat (conditional precedent) dengan tahapan pelunasan pada ${paymentOrSanction.number} (${paymentOrSanction.title}) agar tidak timbul pertentangan hak kepemilikan apabila terjadi keterlambatan pembayaran.`,
      recommendation: `Pastikan ${ipOrScope.number} merujuk secara eksplisit pada pemenuhan kewajiban pembayaran di ${paymentOrSanction.number} sebagai syarat efektif beralihnya hak.`,
      harmonizeTarget: {
        targetClauseNumber: ipOrScope.number,
        appendClarification: `Peralihan penuh atas hak dan hasil pelaksanaan sebagaimana diatur dalam Pasal ini berlaku efektif setelah seluruh kewajiban pembayaran pada ${paymentOrSanction.number} dipenuhi secara lunas.`,
      },
    });
  }

  return findings;
}

/**
 * Generates temporary Smart Reminder notifications for the Audit Hukum panel
 * for clauses nearing their effectiveDate, expiration, or critical lifecycle milestones.
 */
export function generateSmartLifecycleReminders(
  doc: LegalDocument
): SmartLifecycleReminder[] {
  const reminders: SmartLifecycleReminder[] = [];
  const clauses = doc.clauses || [];

  // 1. Effective Date Activation Reminder
  const firstOrScopeClause =
    clauses.find((c) => /ruang lingkup|objek|kuasa|tujuan|pokok/i.test(c.title)) ||
    clauses[0];
  if (firstOrScopeClause) {
    reminders.push({
      id: `rem-eff-${doc.id}`,
      clauseNumber: firstOrScopeClause.number,
      clauseTitle: firstOrScopeClause.title,
      eventType: 'Mulai Berlaku (Effective Date)',
      urgency: 'Mendesak',
      timeBadge: 'Aktif / H-3 Efektif',
      dateReference: doc.effectiveDate || 'Segera Berlaku',
      message: `Klausul ${firstOrScopeClause.number} (${firstOrScopeClause.title}) memasuki tanggal efektif perikatan pada ${doc.effectiveDate}. Pastikan dokumen komparisi dan tanda tangan bermaterai telah lengkap.`,
    });
  }

  // 2. Expiration / Contract Term Lifecycle Reminder
  const durationClause =
    clauses.find((c) =>
      /jangka waktu|masa berlaku|berakhir|durasi|pengakhiran|pencabutan/i.test(
        `${c.title} ${c.content.join(' ')}`
      )
    ) || clauses[clauses.length - 1];

  const durationVar = doc.variables.find((v) =>
    /jangka waktu|masa|durasi|periode|tanggal/i.test(v.key)
  );

  if (durationClause) {
    reminders.push({
      id: `rem-exp-${doc.id}-${durationClause.id}`,
      clauseNumber: durationClause.number,
      clauseTitle: durationClause.title,
      eventType: 'Mendekati Kedaluwarsa (Expiration)',
      urgency: 'Segera',
      timeBadge: 'Jendela Evaluasi H-14',
      dateReference: durationVar ? durationVar.value : `Siklus ${doc.effectiveDate}`,
      message: `Pengingat siklus berakhirnya ${durationClause.number} (${durationClause.title}): jadwalkan evaluasi perpanjangan atau pemberitahuan tertulis sebelum masa berlaku (${durationVar?.value || 'periode kontrak'}) berakhir.`,
    });
  }

  // 3. Payment / SLA / Verification Window Reminder
  const deadlineClause = clauses.find((c) =>
    /hari kerja|hari kalender|jatuh tempo|tagihan|pembayaran|serah terima|bast/i.test(
      `${c.title} ${c.content.join(' ')}`
    )
  );
  if (deadlineClause) {
    const dayMatch = deadlineClause.content
      .join(' ')
      .match(/(\d+)\s*\([^)]+\)\s*Hari\s*(?:Kerja|Kalender)/i);
    const slaText = dayMatch ? dayMatch[0] : '14 (empat belas) Hari Kerja';

    reminders.push({
      id: `rem-sla-${doc.id}-${deadlineClause.id}`,
      clauseNumber: deadlineClause.number,
      clauseTitle: deadlineClause.title,
      eventType: 'Tenggat Kewajiban Klausul',
      urgency: 'Terjadwal',
      timeBadge: `Batas Tenggat: ${slaText}`,
      dateReference: `Sejak ${doc.effectiveDate}`,
      message: `${deadlineClause.number} menetapkan batas waktu kritis selama ${slaText}. Pantau pemenuhan dokumen agar terhindar dari kualifikasi wanprestasi atau denda keterlambatan.`,
    });
  }

  return reminders;
}

/**
 * Generates a one-sentence plain-language summary (Bahasa Sederhana 1 Kalimat)
 * for a complex legal clause.
 */
export function generatePlainLanguageClauseSummary(clause: LegalClause): string {
  if (clause.plainSummary && clause.plainSummary.trim().length > 10) {
    return clause.plainSummary.trim();
  }

  const combined = `${clause.title} ${clause.content.join(' ')}`.toLowerCase();

  if (/ruang lingkup|objek|pokok pekerjaan/i.test(combined)) {
    return `Inti ${clause.number}: Mengatur secara jelas rincian pekerjaan, layanan, atau objek transaksi yang wajib dikerjakan dan diserahkan sesuai standar yang disepakati.`;
  }
  if (/nilai|harga|pembayaran|biaya|upah|sewa|termin|pajak/i.test(combined)) {
    return `Inti ${clause.number}: Menentukan besaran nominal biaya yang harus dibayar, jadwal pencairan tahapan pembayaran, syarat dokumen tagihan, serta pemotongan pajak yang berlaku.`;
  }
  if (/kekayaan intelektual|hki|hak cipta|source code|karya/i.test(combined)) {
    return `Inti ${clause.number}: Menegaskan siapa pemilik sah atas hasil karya/kekayaan intelektual setelah pembayaran lunas serta larangan menggandakannya tanpa izin.`;
  }
  if (/rahasia|data pribadi|pdp|nda|konfidensial/i.test(combined)) {
    return `Inti ${clause.number}: Mewajibkan kedua pihak menjaga kerahasiaan data bisnis maupun data pribadi serta melarang membocorkannya kepada pihak luar.`;
  }
  if (/wanprestasi|sanksi|denda|pengakhiran|pemutusan|1266/i.test(combined)) {
    return `Inti ${clause.number}: Mengatur sanksi denda, ganti rugi, dan hak mengakhiri kontrak secara sepihak apabila salah satu pihak melanggar janji atau terlambat memenuhi kewajiban.`;
  }
  if (/kahar|force majeure|bencana/i.test(combined)) {
    return `Inti ${clause.number}: Membebaskan pihak dari tuntutan denda apabila kewajiban tertunda akibat bencana alam atau keadaan darurat di luar kendali manusia.`;
  }
  if (/sengketa|perselisihan|pengadilan|arbitrase|bani|domisili/i.test(combined)) {
    return `Inti ${clause.number}: Menetapkan cara menyelesaikan masalah secara musyawarah terlebih dahulu, serta menunjuk pengadilan atau badan arbitrase jika musyawarah gagal.`;
  }
  if (/kuasa|substitusi|retensi|pemberi kuasa|penerima kuasa/i.test(combined)) {
    return `Inti ${clause.number}: Memberikan wewenang hukum resmi kepada Penerima Kuasa untuk bertindak dan menandatangani dokumen atas nama Pemberi Kuasa (Klien) sesuai batas yang ditentukan.`;
  }

  const firstClean = (clause.content[0] || '')
    .replace(/^\(\d+\)\s*|\d+\.\d+\.\s*|\d+\.\s*/, '')
    .replace(/\[Ketentuan Khusus Risiko [^\]]+\]\s*/i, '')
    .trim();
  const shortSentence = firstClean.split('.')[0] || firstClean;
  return `Inti ${clause.number} (${clause.title}): Menetapkan kewajiban mengikat bagi Para Pihak bahwa ${shortSentence.charAt(0).toLowerCase()}${shortSentence.slice(1)}.`;
}

export interface ClauseCategoryStyle {
  category: ClauseCategoryType;
  bilingualLabel: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  tagBg: string;
  tagText: string;
  tagBorder: string;
  leftAccent: string;
}

export const CLAUSE_CATEGORY_STYLES: Record<ClauseCategoryType, ClauseCategoryStyle> = {
  Financial: {
    category: 'Financial',
    bilingualLabel: 'Financial · Finansial & Pembayaran',
    shortLabel: 'Financial',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    tagBg: 'bg-emerald-100/70',
    tagText: 'text-emerald-900',
    tagBorder: 'border-emerald-300',
    leftAccent: 'border-l-emerald-600',
  },
  Liability: {
    category: 'Liability',
    bilingualLabel: 'Liability · Tanggung Jawab & Sanksi',
    shortLabel: 'Liability',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300',
    tagBg: 'bg-rose-100/70',
    tagText: 'text-rose-900',
    tagBorder: 'border-rose-300',
    leftAccent: 'border-l-rose-600',
  },
  Operational: {
    category: 'Operational',
    bilingualLabel: 'Operational · Operasional & Pelaksanaan',
    shortLabel: 'Operational',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-300',
    tagBg: 'bg-sky-100/70',
    tagText: 'text-sky-900',
    tagBorder: 'border-sky-300',
    leftAccent: 'border-l-sky-600',
  },
  'Intellectual Property': {
    category: 'Intellectual Property',
    bilingualLabel: 'Intellectual Property · HKI & Lisensi',
    shortLabel: 'Intellectual Property',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    tagBg: 'bg-purple-100/70',
    tagText: 'text-purple-900',
    tagBorder: 'border-purple-300',
    leftAccent: 'border-l-purple-600',
  },
  Confidentiality: {
    category: 'Confidentiality',
    bilingualLabel: 'Confidentiality · Kerahasiaan & Data',
    shortLabel: 'Confidentiality',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    tagBg: 'bg-amber-100/70',
    tagText: 'text-amber-900',
    tagBorder: 'border-amber-300',
    leftAccent: 'border-l-amber-600',
  },
  'Governance & Dispute': {
    category: 'Governance & Dispute',
    bilingualLabel: 'Governance & Dispute · Sengketa & Kuasa',
    shortLabel: 'Governance & Dispute',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300',
    tagBg: 'bg-indigo-100/70',
    tagText: 'text-indigo-900',
    tagBorder: 'border-indigo-300',
    leftAccent: 'border-l-indigo-600',
  },
  Termination: {
    category: 'Termination',
    bilingualLabel: 'Termination · Jangka Waktu & Pengakhiran',
    shortLabel: 'Termination',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-300',
    tagBg: 'bg-orange-100/70',
    tagText: 'text-orange-900',
    tagBorder: 'border-orange-300',
    leftAccent: 'border-l-orange-600',
  },
};

export function categorizeClauseWithLabels(clause: LegalClause): {
  category: ClauseCategoryType;
  style: ClauseCategoryStyle;
  activeTags: string[];
  suggestedTags: string[];
  reason: string;
} {
  const combined = `${clause.title} ${clause.content.join(' ')} ${clause.legalBasis}`.toLowerCase();

  let detectedCategory: ClauseCategoryType = 'Operational';
  let defaultActiveTags: string[] = [];
  let candidateSuggestions: string[] = [];
  let reason = '';

  if (
    /nilai|harga|pembayaran|biaya|upah|gaji|tunjangan|sewa|termin|pajak|ppn|pph|invoice|tagihan|kompensasi|retensi/i.test(
      clause.title
    ) ||
    (/rp\s*[\d.]+|pembayaran|termin|faktur pajak|rekening/i.test(combined) &&
      !/wanprestasi|sengketa/i.test(clause.title))
  ) {
    detectedCategory = 'Financial';
    defaultActiveTags = ['Nilai & Pembayaran', 'Kewajiban Finansial'];
    candidateSuggestions = [
      'Termin Pencairan',
      'Faktur Pajak (PPN/PPh)',
      'Jatuh Tempo Tagihan',
      'Syarat BAST',
      'Kompensasi & Upah',
    ];
    reason =
      'Mencakup pengaturan nilai transaksi, termin pencairan pembayaran, atau kewajiban perpajakan.';
  } else if (
    /wanprestasi|sanksi|denda|tanggung jawab|ganti rugi|indemnifikasi|kahar|force majeure|jaminan/i.test(
      clause.title
    ) ||
    /denda|ganti rugi|wanprestasi|1243|1365|1244/i.test(combined)
  ) {
    detectedCategory = 'Liability';
    defaultActiveTags = ['Mitigasi Liabilitas', 'Sanksi & Ganti Rugi'];
    candidateSuggestions = [
      'Denda Keterlambatan',
      'Wanprestasi Pasal 1243',
      'Indemnifikasi Pihak Ketiga',
      'Force Majeure',
      'Batas Tanggung Jawab',
    ];
    reason =
      'Mengatur alokasi risiko kerugian, denda keterlambatan, wanprestasi, atau pembebasan tanggung jawab.';
  } else if (
    /kekayaan intelektual|hki|hak cipta|source code|paten|merek|lisensi|karya/i.test(
      `${clause.title} ${clause.legalBasis}`
    )
  ) {
    detectedCategory = 'Intellectual Property';
    defaultActiveTags = ['Kepemilikan HKI', 'Lisensi & Hak Cipta'];
    candidateSuggestions = [
      'Work Made for Hire',
      'Peralihan Source Code',
      'Jaminan Orisinalitas',
      'UU Hak Cipta 28/2014',
    ];
    reason =
      'Mengatur status kepemilikan hak ekonomi, hak cipta, kode sumber, atau lisensi kekayaan intelektual.';
  } else if (
    /rahasia|kerahasiaan|data pribadi|pdp|konfidensial|nda|pengembalian dokumen|pemusnahan/i.test(
      `${clause.title} ${clause.legalBasis}`
    )
  ) {
    detectedCategory = 'Confidentiality';
    defaultActiveTags = ['Kerahasiaan Data', 'Kepatuhan Privasi'];
    candidateSuggestions = [
      'UU PDP No. 27/2022',
      'Rahasia Dagang',
      'Non-Disclosure',
      'Notifikasi Insiden 3x24 Jam',
      'Pemusnahan Dokumen',
    ];
    reason =
      'Mengatur pelindungan informasi rahasia, rahasia dagang, atau pemrosesan data pribadi sesuai UU PDP.';
  } else if (
    /jangka waktu|masa berlaku|pengakhiran|pemutusan|berakhir|pencabutan/i.test(
      clause.title
    )
  ) {
    detectedCategory = 'Termination';
    defaultActiveTags = ['Masa Berlaku', 'Pengakhiran Kontrak'];
    candidateSuggestions = [
      'Pengenyampingan Pasal 1266',
      'Evaluasi Perpanjangan',
      'Cure Period 14 Hari',
      'Pemberitahuan Tertulis',
    ];
    reason =
      'Mengatur siklus masa berlaku perikatan, syarat perpanjangan, atau tata cara pengakhiran perjanjian.';
  } else if (
    /sengketa|perselisihan|domisili|hukum yang berlaku|arbitrase|bani|pengadilan|kuasa|substitusi/i.test(
      `${clause.title} ${clause.legalBasis}`
    )
  ) {
    detectedCategory = 'Governance & Dispute';
    defaultActiveTags = ['Yurisdiksi & Forum', 'Tata Kelola Hukum'];
    candidateSuggestions = [
      'Musyawarah 30 Hari',
      'Arbitrase BANI',
      'Pengadilan Negeri',
      'Kuasa Khusus SEMA 6/1994',
      'Hak Substitusi Pasal 1803',
    ];
    reason =
      'Mengatur pilihan hukum, mekanisme penyelesaian sengketa, forum peradilan/arbitrase, atau mandat kuasa.';
  } else {
    detectedCategory = 'Operational';
    defaultActiveTags = ['Ruang Lingkup Kerja', 'Pelaksanaan Teknis'];
    candidateSuggestions = [
      'Standar Layanan (SLA)',
      'Serah Terima (BAST)',
      'Uji Terima (UAT)',
      'Koordinasi Para Pihak',
      'Kewajiban Operasional',
    ];
    reason =
      'Mengatur pelaksanaan operasional, ruang lingkup pekerjaan, spesifikasi teknis, dan prosedur serah terima.';
  }

  const finalCategory = clause.clauseCategory || detectedCategory;
  const style = CLAUSE_CATEGORY_STYLES[finalCategory] || CLAUSE_CATEGORY_STYLES.Operational;
  const activeTags =
    clause.clauseTags && clause.clauseTags.length > 0
      ? clause.clauseTags
      : defaultActiveTags;
  const allSuggestions =
    clause.suggestedTags && clause.suggestedTags.length > 0
      ? clause.suggestedTags
      : candidateSuggestions;
  const filteredSuggestions = allSuggestions.filter((t) => !activeTags.includes(t));

  return {
    category: finalCategory,
    style,
    activeTags,
    suggestedTags: filteredSuggestions,
    reason: clause.categoryReason || reason,
  };
}


