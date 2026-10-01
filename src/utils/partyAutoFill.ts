import {
  LegalDocument,
  LegalParty,
  PartyEntityType,
  SmartAutoFillProposal,
} from '../types/legal';

export function detectPartyEntityType(party: LegalParty): PartyEntityType {
  if (party.entityType) return party.entityType;
  const text = `${party.name} ${party.description} ${party.representative}`.toLowerCase();

  if (/\b(pt\.?|perseroan terbatas|tbk)\b/i.test(text)) {
    return 'PT';
  }
  if (/\b(cv\.?|commanditaire vennootschap|firma|ud\.?)\b/i.test(text)) {
    return 'CV_Firma';
  }
  if (/\b(dinas|kementerian|badan|lembaga|instansi|universitas|yayasan)\b/i.test(text)) {
    return 'Instansi';
  }
  if (
    /\b(nik|ktp|warga negara|perorangan|individu|pribadi|pekerja|freelancer|konsultan independen|penyewa pribadi)\b/i.test(
      text
    )
  ) {
    return 'Individu';
  }
  // If name does not start with PT/CV/Yayasan, treat as Individu
  if (!/^(pt|cv|yayasan|koperasi|perum|pd)\b/i.test(party.name.trim())) {
    return 'Individu';
  }
  return 'PT';
}

export function getEntityTypeLabel(type: PartyEntityType): string {
  switch (type) {
    case 'PT':
      return 'Perseroan Terbatas (PT / Badan Hukum)';
    case 'Individu':
      return 'Individu / Orang Perorangan (Subjek Hukum Pribadi)';
    case 'CV_Firma':
      return 'CV / Firma (Badan Usaha Persekutuan)';
    case 'Instansi':
      return 'Instansi / Yayasan / Lembaga Resmi';
  }
}

export function updatePartyKomparisiByEntityType(
  party: LegalParty,
  newType: PartyEntityType,
  roleLabel: string
): LegalParty {
  const cleanName = party.name
    .replace(/^(PT\.?\s+|CV\.?\s+)/i, '')
    .trim();

  if (newType === 'PT') {
    const ptName = /^PT\b/i.test(party.name.trim()) ? party.name.trim() : `PT ${cleanName}`;
    return {
      ...party,
      entityType: 'PT',
      name: ptName,
      description: `Suatu perseroan terbatas yang didirikan berdasarkan Hukum Negara Republik Indonesia, berkedudukan di ${party.address}, dalam perbuatan hukum ini diwakili secara sah oleh ${party.representative} berdasarkan Anggaran Dasar Perseroan dan UU No. 40 Tahun 2007 tentang Perseroan Terbatas, selanjutnya disebut sebagai "${roleLabel}".`,
    };
  }

  if (newType === 'Individu') {
    const personName =
      /^PT\b|^CV\b/i.test(party.name.trim()) && party.representative
        ? party.representative.split(',')[0].replace(/\(.*\)/, '').trim()
        : cleanName;
    return {
      ...party,
      entityType: 'Individu',
      name: personName,
      representative: `${personName} (Bertindak untuk diri sendiri / Pribadi)`,
      description: `Warga Negara Indonesia, pemegang Kartu Tanda Penduduk (NIK terlampir) dan NPWP Orang Pribadi, bertempat tinggal di ${party.address}, dalam hal ini bertindak untuk dan atas nama diri sendiri secara cakap menurut Pasal 1320 Kitab Undang-Undang Hukum Perdata, selanjutnya disebut sebagai "${roleLabel}".`,
    };
  }

  if (newType === 'CV_Firma') {
    const cvName = /^CV\b/i.test(party.name.trim()) ? party.name.trim() : `CV ${cleanName}`;
    return {
      ...party,
      entityType: 'CV_Firma',
      name: cvName,
      description: `Suatu persekutuan komanditer (Commanditaire Vennootschap) yang didirikan berdasarkan hukum Indonesia dan terdaftar pada Sistem Administrasi Badan Usaha Kemenkumham RI, berkedudukan di ${party.address}, diwakili oleh ${party.representative} selaku Sekutu Pengurus, selanjutnya disebut sebagai "${roleLabel}".`,
    };
  }

  return {
    ...party,
    entityType: 'Instansi',
    description: `Suatu lembaga/instansi resmi yang berkedudukan di ${party.address}, dalam hal ini diwakili secara sah oleh ${party.representative} berdasarkan surat keputusan kewenangan jabatan yang berlaku, selanjutnya disebut sebagai "${roleLabel}".`,
  };
}

export function generateSmartAutoFillProposals(doc: LegalDocument): {
  pairingLabel: string;
  pairingSummary: string;
  partyOneType: PartyEntityType;
  partyTwoType: PartyEntityType;
  proposals: SmartAutoFillProposal[];
} {
  const p1Type = detectPartyEntityType(doc.partyOne);
  const p2Type = detectPartyEntityType(doc.partyTwo);

  // Helper to locate matching existing clause in doc.clauses
  const findMatchingClause = (regex: RegExp) => {
    const found = doc.clauses.find((c) => regex.test(`${c.title} ${c.content.join(' ')}`));
    return found ? { id: found.id, number: found.number } : undefined;
  };

  const paymentClause = findMatchingClause(/pembayaran|harga|nilai|biaya|upah|pajak|kompensasi|sewa/i);
  const ipClause = findMatchingClause(/kekayaan intelektual|hki|hak cipta|source code|karya/i);
  const privacyClause = findMatchingClause(/rahasia|data pribadi|pdp|informasi|nda/i);
  const scopeOrRepClause = findMatchingClause(/kewajiban|pernyataan|jaminan|ruang lingkup|kedudukan/i);

  const isCorporateVsIndividual =
    (p1Type === 'PT' && p2Type === 'Individu') ||
    (p1Type === 'Individu' && p2Type === 'PT') ||
    (p1Type === 'CV_Firma' && p2Type === 'Individu') ||
    (p1Type === 'Instansi' && p2Type === 'Individu');

  const isBothIndividual = p1Type === 'Individu' && p2Type === 'Individu';

  if (isCorporateVsIndividual) {
    const corpParty = p1Type === 'Individu' ? doc.partyTwo : doc.partyOne;
    const indivParty = p1Type === 'Individu' ? doc.partyOne : doc.partyTwo;
    const corpRole = p1Type === 'Individu' ? 'Pihak Kedua' : 'Pihak Pertama';
    const indivRole = p1Type === 'Individu' ? 'Pihak Pertama' : 'Pihak Kedua';

    return {
      pairingLabel: `${p1Type} vs ${p2Type} (Korporasi & Subjek Hukum Perorangan)`,
      pairingSummary: `Terdeteksi hubungan hukum antara Badan Hukum (${corpParty.name}) dan Orang Perorangan (${indivParty.name}). Sistem Auto-Fill Cerdas menyesuaikan rezim perpajakan ke PPh Pasal 21 Orang Pribadi, kapasitas pribadi Pasal 1320 KUHPerdata, peralihan HKI perorangan, serta pelindungan NIK/NPWP pribadi.`,
      partyOneType: p1Type,
      partyTwoType: p2Type,
      proposals: [
        {
          id: 'autofill-pt-ind-tax',
          targetTopic: 'perpajakan',
          badgeLabel: 'Khusus PT vs Individu · PPh Pasal 21',
          clauseTitle: 'MEKANISME PEMBAYARAN DAN PEMOTONGAN PAJAK ORANG PRIBADI (PPh PASAL 21)',
          legalBasis: 'UU No. 7 Tahun 2021 (UU HPP) Pasal 21 & PMK No. 168 Tahun 2023',
          riskLevel: 'Perhatian',
          rationale: `Karena ${indivParty.name} (${indivRole}) berstatus Individu (bukan PT/PKP Badan), objek pajak penghasilan bukan PPh Pasal 23 melainkan Pemotongan PPh Pasal 21 oleh ${corpParty.name} (${corpRole}) selaku Pemotong Pajak Badan.`,
          proposedContent: [
            `(1) Pembayaran imbalan jasa/kompensasi oleh ${corpRole} (${corpParty.name}) kepada ${indivRole} (${indivParty.name}) dilakukan melalui transfer bank ke rekening pribadi atas nama ${indivParty.name} setelah pekerjaan atau kewajiban dinyatakan selesai secara tertulis.`,
            `(2) Mengingat ${indivRole} merupakan Subjek Pajak Orang Pribadi dalam negeri, maka setiap pembayaran imbalan berdasarkan Perjanjian ini tunduk pada pemotongan Pajak Penghasilan Pasal 21 (PPh Pasal 21) sesuai ketentuan Undang-Undang Nomor 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan (UU HPP) dan PMK Nomor 168 Tahun 2023.`,
            `(3) ${indivRole} wajib menyerahkan salinan Kartu Tanda Penduduk (NIK yang telah terintegrasi sebagai NPWP Orang Pribadi) kepada ${corpRole}, dan ${corpRole} wajib menerbitkan Bukti Pemotongan PPh Pasal 21 resmi kepada ${indivRole} sesuai periode perpajakan yang berlaku.`,
          ],
          matchedClauseId: paymentClause?.id,
          matchedClauseNumber: paymentClause?.number,
        },
        {
          id: 'autofill-pt-ind-capacity',
          targetTopic: 'kapasitas_hukum',
          badgeLabel: 'Khusus PT vs Individu · Kapasitas Pribadi & Non-Eksklusif',
          clauseTitle: 'PERNYATAAN KAPASITAS HUKUM PERORANGAN DAN KEWENANGAN PERSEROAN',
          legalBasis: 'Pasal 1320 KUHPerdata & Pasal 98 UU No. 40 Tahun 2007 tentang PT',
          riskLevel: 'Standar',
          rationale: `Membedakan dasar kecakapan hukum antara Direksi PT (berdasarkan Anggaran Dasar & UU PT) dan Individu (berdasarkan kecakapan pribadi Pasal 1320 KUHPerdata serta bebas benturan kepentingan).`,
          proposedContent: [
            `(1) ${corpRole} (${corpParty.name}) menyatakan dan menjamin bahwa pihaknya adalah badan hukum Perseroan Terbatas yang sah menurut Undang-Undang Nomor 40 Tahun 2007 tentang Perseroan Terbatas dan penandatangan Perjanjian ini memiliki kewenangan penuh berdasarkan Anggaran Dasar Perseroan.`,
            `(2) ${indivRole} (${indivParty.name}) menyatakan dan menjamin bahwa dirinya adalah orang perorangan yang cakap melakukan perbuatan hukum menurut Pasal 1320 Kitab Undang-Undang Hukum Perdata, bertindak secara mandiri atas nama pribadi, serta tidak sedang terikat perjanjian eksklusif dengan pihak ketiga mana pun yang melarang penandatanganan Perjanjian ini.`,
            `(3) Apabila tindakan hukum ${indivRole} dalam Perjanjian ini melibatkan objek harta bersama dalam perkawinan, ${indivRole} menjamin telah memperoleh persetujuan tertulis yang sah dari pasangannya sesuai Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan sehingga membebaskan ${corpRole} dari segala gugatan pihak ketiga.`,
          ],
          matchedClauseId: scopeOrRepClause?.id,
          matchedClauseNumber: scopeOrRepClause?.number,
        },
        {
          id: 'autofill-pt-ind-ip',
          targetTopic: 'hki',
          badgeLabel: 'Khusus PT vs Individu · Pengalihan Ciptaan Pribadi',
          clauseTitle: 'PENGALIHAN HAK KEKAYAAN INTELEKTUAL ATAS KARYA PERORANGAN',
          legalBasis: 'Pasal 35, Pasal 36 & Pasal 16 ayat (2) UU No. 28 Tahun 2014 tentang Hak Cipta',
          riskLevel: 'Kritis',
          rationale: `Dalam hubungan PT vs Individu, Pasal 36 UU Hak Cipta mengatur bahwa pencipta perorangan tetap memegang hak tertentu kecuali diperjanjikan beralih secara tertulis kepada pemberi pesanan (${corpParty.name}).`,
          proposedContent: [
            `(1) Menyimpang dari ketentuan umum pencipta perorangan sebagaimana dimaksud dalam Pasal 36 Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta, Para Pihak secara tegas menyepakati bahwa seluruh Hak Ekonomi dan kepemilikan atas hasil karya, kode sumber, desain, maupun dokumen yang dihasilkan oleh ${indivRole} (${indivParty.name}) berdasarkan Perjanjian ini beralih sepenuhnya menjadi milik ${corpRole} (${corpParty.name}) sejak pembayaran lunas dilakukan.`,
            `(2) ${indivRole} dengan ini melepaskan hak untuk menuntut royalti tambahan di luar nilai kompensasi yang telah disepakati dalam Perjanjian ini serta dilarang memperbanyak atau mengalihkan hasil karya tersebut kepada pihak lain tanpa izin tertulis dari ${corpRole}.`,
          ],
          matchedClauseId: ipClause?.id,
          matchedClauseNumber: ipClause?.number,
        },
        {
          id: 'autofill-pt-ind-pdp',
          targetTopic: 'data_pribadi',
          badgeLabel: 'Khusus PT vs Individu · Pelindungan Data NIK & NPWP',
          clauseTitle: 'PELINDUNGAN DATA PRIBADI SUBJEK PERORANGAN DAN KERAHASIAAN KORPORASI',
          legalBasis: 'Pasal 20 & Pasal 35 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
          riskLevel: 'Perhatian',
          rationale: `Mengatur pelindungan timbal balik: PT wajib melindungi data identitas pribadi (NIK, NPWP, rekening pribadi) milik ${indivParty.name} sesuai UU PDP, sementara Individu wajib menjaga rahasia dagang PT.`,
          proposedContent: [
            `(1) ${corpRole} selaku Pengendali Data Pribadi wajib menjaga keamanan dan kerahasiaan data identitas pribadi milik ${indivRole} (meliputi NIK KTP, NPWP Pribadi, nomor rekening, dan data kontak) semata-mata untuk kepentingan administrasi kontrak dan pelaporan pajak sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.`,
            `(2) Sebaliknya, ${indivRole} wajib menjaga kerahasiaan seluruh informasi bisnis, data pelanggan, dan rahasia dagang milik ${corpRole} serta bertanggung jawab secara pribadi atas segala kebocoran informasi yang disebabkan oleh kelalaian ${indivRole}.`,
          ],
          matchedClauseId: privacyClause?.id,
          matchedClauseNumber: privacyClause?.number,
        },
      ],
    };
  }

  if (isBothIndividual) {
    return {
      pairingLabel: 'Individu vs Individu (Perikatan Perdata Perorangan)',
      pairingSummary: `Terdeteksi kedua pihak (${doc.partyOne.name} dan ${doc.partyTwo.name}) merupakan Subjek Hukum Orang Perorangan. Sistem Auto-Fill Cerdas mengusulkan klausul kecakapan perdata perorangan, persetujuan pasangan/ahli waris, serta pembayaran bersih bermaterai tanpa faktur PPN korporasi.`,
      partyOneType: p1Type,
      partyTwoType: p2Type,
      proposals: [
        {
          id: 'autofill-ind-ind-payment',
          targetTopic: 'perpajakan',
          badgeLabel: 'Khusus Individu vs Individu · Pembayaran Bersih & Meterai',
          clauseTitle: 'TATA CARA PEMBAYARAN ANTAR-PERORANGAN DAN BEA METERAI',
          legalBasis: 'Pasal 1338 KUHPerdata & UU No. 10 Tahun 2020 tentang Bea Meterai',
          riskLevel: 'Standar',
          rationale: `Karena kedua pihak adalah orang perorangan non-PKP, transaksi tidak menggunakan e-Faktur PPN korporasi melainkan bukti transfer rekening pribadi dan kuitansi bermaterai Rp10.000.`,
          proposedContent: [
            `(1) Pembayaran nilai transaksi dalam Perjanjian ini dilakukan secara langsung dari rekening pribadi Pihak Pertama (${doc.partyOne.name}) ke rekening pribadi Pihak Kedua (${doc.partyTwo.name}) sesuai jadwal yang disepakati.`,
            `(2) Setiap penerimaan pembayaran wajib dibuktikan dengan kuitansi tanda terima tertulis yang dibubuhi Meterai tempel atau e-Meterai senilai Rp10.000 (sepuluh ribu Rupiah) sesuai Undang-Undang Nomor 10 Tahun 2020 tentang Bea Meterai sebagai alat bukti perdata yang sempurna.`,
            `(3) Kewajiban pelaporan pajak penghasilan orang pribadi (apabila ada) menjadi tanggung jawab masing-masing Pihak sesuai ketentuan perpajakan yang berlaku bagi Wajib Pajak Orang Pribadi.`,
          ],
          matchedClauseId: paymentClause?.id,
          matchedClauseNumber: paymentClause?.number,
        },
        {
          id: 'autofill-ind-ind-capacity',
          targetTopic: 'kapasitas_hukum',
          badgeLabel: 'Khusus Individu vs Individu · Persetujuan Pasangan & Ahli Waris',
          clauseTitle: 'KECAKAPAN PRIBADI, PERSETUJUAN PASANGAN, DAN KEBERLANJUTAN AHLI WARIS',
          legalBasis: 'Pasal 833 & Pasal 1320 KUHPerdata serta Pasal 36 UU No. 1 Tahun 1974',
          riskLevel: 'Perhatian',
          rationale: `Dalam perjanjian antar-individu, risiko utama adalah gugatan pasangan sah atas harta bersama atau terhentinya perikatan apabila salah satu pihak meninggal dunia (Pasal 833 KUHPerdata).`,
          proposedContent: [
            `(1) Masing-masing Pihak menjamin bahwa dirinya berusia dewasa, cakap melakukan perbuatan hukum, tidak berada di bawah pengampuan (curatele), serta memiliki hak penuh atas objek yang diperjanjikan.`,
            `(2) Dalam hal objek atau dana yang digunakan dalam Perjanjian ini merupakan bagian dari harta bersama dalam perkawinan, masing-masing Pihak menjamin telah memperoleh persetujuan tertulis dari suami/istri yang sah sehingga membebaskan Pihak lainnya dari segala keberatan atau tuntutan hukum.`,
            `(3) Sesuai asas Pasal 833 dan Pasal 1318 Kitab Undang-Undang Hukum Perdata, seluruh hak dan kewajiban perdata yang timbul dari Perjanjian ini tetap mengikat dan beralih karena hukum kepada para ahli waris yang sah apabila salah satu Pihak meninggal dunia sebelum berakhirnya Perjanjian.`,
          ],
          matchedClauseId: scopeOrRepClause?.id,
          matchedClauseNumber: scopeOrRepClause?.number,
        },
      ],
    };
  }

  // Default: PT vs PT / B2B Corporate
  return {
    pairingLabel: `${p1Type} vs ${p2Type} (Transaksi Korporasi B2B)`,
    pairingSummary: `Terdeteksi kedua pihak (${doc.partyOne.name} dan ${doc.partyTwo.name}) merupakan Badan Hukum / Badan Usaha Korporasi. Sistem Auto-Fill Cerdas mengusulkan klausul Faktur Pajak PPN 11% & PPh Pasal 23 antar-badan, representasi kewenangan Direksi UU PT, serta pembatasan tanggung jawab korporasi.`,
    partyOneType: p1Type,
    partyTwoType: p2Type,
    proposals: [
      {
        id: 'autofill-pt-pt-tax',
        targetTopic: 'perpajakan',
        badgeLabel: 'Khusus PT vs PT (B2B) · e-Faktur PPN & PPh Pasal 23',
        clauseTitle: 'KETENTUAN PERPAJAKAN KORPORASI (e-FAKTUR PPN DAN PEMOTONGAN PPh PASAL 23)',
        legalBasis: 'Pasal 23 UU PPh & UU No. 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan',
        riskLevel: 'Perhatian',
        rationale: `Transaksi antar-Perseroan Terbatas (${doc.partyOne.name} & ${doc.partyTwo.name}) mewajibkan administrasi Faktur Pajak Elektronik (e-Faktur PPN) oleh Pengusaha Kena Pajak (PKP) dan pemotongan PPh Pasal 23 atas jasa badan usaha.`,
        proposedContent: [
          `(1) Seluruh penagihan (invoice) antar-badan hukum dalam Perjanjian ini wajib dilampiri dengan Faktur Pajak Elektronik (e-Faktur) Pajak Pertambahan Nilai (PPN) yang sah sesuai ketentuan Undang-Undang Nomor 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan.`,
          `(2) Pihak Pembayar selaku badan pemotong pajak wajib melakukan pemotongan Pajak Penghasilan Pasal 23 (PPh Pasal 23) sebesar tarif yang berlaku atas nilai imbalan jasa sebelum PPN, serta wajib menyerahkan Bukti Pemotongan PPh Pasal 23 (e-Bupot Unifikasi) kepada Pihak Penerima Pembayaran paling lambat 30 (tiga puluh) hari kalender setelah bulan pembayaran.`,
        ],
        matchedClauseId: paymentClause?.id,
        matchedClauseNumber: paymentClause?.number,
      },
      {
        id: 'autofill-pt-pt-authority',
        targetTopic: 'kapasitas_hukum',
        badgeLabel: 'Khusus PT vs PT (B2B) · Kewenangan Direksi UU PT',
        clauseTitle: 'PERNYATAAN KEWENANGAN DIREKSI DAN STATUS BADAN HUKUM PERSEROAN',
        legalBasis: 'Pasal 92 & Pasal 98 Undang-Undang Nomor 40 Tahun 2007 tentang Perseroan Terbatas',
        riskLevel: 'Standar',
        rationale: `Memastikan bahwa direksi yang mewakili ${doc.partyOne.name} dan ${doc.partyTwo.name} memiliki wewenang sah menurut Anggaran Dasar & SK Kemenkumham serta tidak dalam sengketa kepailitan/PKPU.`,
        proposedContent: [
          `(1) Masing-masing Pihak menyatakan dan menjamin bahwa pihaknya adalah badan hukum yang didirikan secara sah, telah memperoleh pengesahan Menteri Hukum dan Hak Asasi Manusia Republik Indonesia, serta memiliki Nomor Induk Berusaha (NIB) dan perizinan berusaha yang masih berlaku.`,
          `(2) Pejabat atau anggota Direksi yang menandatangani Perjanjian ini memiliki kewenangan penuh untuk mewakili Perseroan di dalam maupun di luar pengadilan sesuai Pasal 98 Undang-Undang Nomor 40 Tahun 2007 tentang Perseroan Terbatas dan Anggaran Dasar masing-masing Pihak, serta tidak sedang berada dalam keadaan pailit atau Penundaan Kewajiban Pembayaran Utang (PKPU).`,
        ],
        matchedClauseId: scopeOrRepClause?.id,
        matchedClauseNumber: scopeOrRepClause?.number,
      },
      {
        id: 'autofill-pt-pt-liability',
        targetTopic: 'tanggung_jawab',
        badgeLabel: 'Khusus PT vs PT (B2B) · Batas Tanggung Jawab Korporasi',
        clauseTitle: 'PEMBATASAN TANGGUNG JAWAB KORPORASI DAN GANTI RUGI PIHAK KETIGA',
        legalBasis: 'Pasal 1243, Pasal 1247 & Pasal 1365 KUHPerdata',
        riskLevel: 'Kritis',
        rationale: `Standar tata kelola kontrak korporasi B2B untuk membatasi eksposur kerugian tidak langsung (indirect/consequential damages) maksimal sebesar 100% nilai kontrak.`,
        proposedContent: [
          `(1) Kecuali dalam hal pelanggaran kewajiban Kerahasiaan, Pelindungan Data Pribadi, atau kesengajaan (willful misconduct), total batas tanggung jawab kumulatif masing-masing Perseroan atas tuntutan ganti rugi yang timbul dari Perjanjian ini dibatasi maksimal sebesar 100% (seratus persen) dari total nilai Perjanjian.`,
          `(2) Tidak ada Pihak yang bertanggung jawab kepada Pihak lainnya atas kerugian tidak langsung, kehilangan potensi keuntungan (loss of profit), atau kerugian konsekuensial lainnya di luar kerugian nyata yang dapat dibuktikan secara sah menurut Pasal 1247 KUHPerdata.`,
        ],
        matchedClauseId: ipClause?.id,
        matchedClauseNumber: ipClause?.number,
      },
    ],
  };
}
