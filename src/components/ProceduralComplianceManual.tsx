import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Stamp,
  Users,
  Scale,
  Building2,
  FileCheck2,
  PlusCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { LegalClause, LegalDocument } from '../types/legal';

export type ComplianceCategoryProfileId =
  | 'auto'
  | 'commercial_b2b'
  | 'property_lease'
  | 'employment_hr'
  | 'personal_loan_family'
  | 'litigation_poa_dading'
  | 'tech_ip_saas';

export interface ProceduralChecklistStep {
  id: string;
  stepNumber: number;
  stage:
    | 'Bea Meterai & Pajak'
    | 'Kewenangan & Identitas Pihak'
    | 'Saksi & Paraf Halaman'
    | 'Notarisasi & Legalisasi'
    | 'Pendaftaran & Arsip Asli';
  title: string;
  requirementLevel: 'Wajib Hukum' | 'Wajib Pembuktian' | 'Rekomendasi Notariil';
  legalBasis: string;
  description: string;
  howToExecute: string;
  clauseInsertionTitle?: string;
  clauseInsertionContent?: string[];
  closingTextEnhancement?: string;
}

export interface CategoryManualProfile {
  id: Exclude<ComplianceCategoryProfileId, 'auto'>;
  label: string;
  shortBadge: string;
  summary: string;
  notarizationRequirement: string;
  stampDutyRule: string;
  witnessRule: string;
  steps: ProceduralChecklistStep[];
}

const PROCEDURAL_PROFILES: Record<
  Exclude<ComplianceCategoryProfileId, 'auto'>,
  CategoryManualProfile
> = {
  commercial_b2b: {
    id: 'commercial_b2b',
    label: 'Kontrak Komersial, Korporasi & Kerjasama B2B',
    shortBadge: 'Komersial / B2B',
    summary:
      'Standar kepatuhan prosedural untuk Perjanjian Kerjasama (PKS), Pengadaan Vendor, Distribusi, dan Jasa Korporasi agar sah mengikat badan hukum (PT/CV) serta kuat sebagai alat bukti sempurna.',
    notarizationRequirement:
      'Akta di bawah tangan dengan opsi Waarmerking / Legalisasi Notaris untuk mengunci tanggal pasti (Pasal 1874a KUHPerdata).',
    stampDutyRule:
      'Wajib Meterai Tempel / e-Meterai Rp10.000 pada masing-masing rangkap asli (UU No. 10 Tahun 2020 Pasal 3 & 5).',
    witnessRule:
      'Minimal 2 (dua) orang Saksi dewasa yang cakap hukum (1 saksi dari tiap pihak) + paraf di setiap halaman.',
    steps: [
      {
        id: 'b2b-authority',
        stepNumber: 1,
        stage: 'Kewenangan & Identitas Pihak',
        title: 'Verifikasi Kewenangan Direksi & Anggaran Dasar (UU PT)',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 1320 KUHPerdata & Pasal 98 UU No. 40 Tahun 2007 (UU PT)',
        description:
          'Pastikan penandatangan adalah Direksi aktif yang tercantum dalam Akta Perubahan Terakhir & SK Kemenkumham, atau pemegang Surat Kuasa Khusus Direksi yang sah.',
        howToExecute:
          'Periksa masa jabatan Direksi pada Akta Terakhir, kecocokan KTP/NPWP, serta apakah nilai transaksi memerlukan persetujuan tertulis Dewan Komisaris/RUPS (Pasal 102 UU PT).',
        clauseInsertionTitle: 'PERNYATAAN DAN JAMINAN KEWENANGAN KORPORASI',
        clauseInsertionContent: [
          '(1) Masing-masing Pihak menyatakan dan menjamin bahwa pihaknya adalah badan hukum atau subjek hukum yang didirikan secara sah dan memiliki kewenangan penuh berdasarkan Anggaran Dasar yang berlaku untuk menandatangani serta melaksanakan Perjanjian ini.',
          '(2) Penandatangan yang mewakili masing-masing Pihak telah memperoleh seluruh persetujuan organ perseroan yang disyaratkan (termasuk persetujuan Dewan Komisaris apabila diwajibkan oleh Anggaran Dasar) sehingga Perjanjian ini sah dan mengikat secara hukum tanpa cacat kewenangan.',
        ],
      },
      {
        id: 'b2b-stamp-duty',
        stepNumber: 2,
        stage: 'Bea Meterai & Pajak',
        title: 'Pembubuhan Bea Meterai Rp10.000 (Tempel Silang / e-Meterai)',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 3 ayat (1) & Pasal 5 UU No. 10 Tahun 2020 tentang Bea Meterai',
        description:
          'Dokumen perjanjian perdata yang digunakan sebagai alat bukti di pengadilan wajib dilunasi Bea Meterai tarif tunggal Rp10.000 untuk setiap rangkap asli.',
        howToExecute:
          'Rangkap 1 (dipegang Pihak Pertama) ditempel meterai Rp10.000 pada kolom tanda tangan Pihak Kedua; Rangkap 2 (dipegang Pihak Kedua) ditempel meterai Rp10.000 pada kolom tanda tangan Pihak Pertama. Tanda tangan wajib menyentuh sebagian meterai dan kertas beserta stempel basah perusahaan.',
        closingTextEnhancement:
          'Demikian Perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing dibubuhi meterai cukup Rp10.000,- sesuai UU No. 10 Tahun 2020 tentang Bea Meterai dan memiliki kekuatan pembuktian hukum yang sama setelah ditandatangani oleh Para Pihak beserta Para Saksi.',
      },
      {
        id: 'b2b-witness-initials',
        stepNumber: 3,
        stage: 'Saksi & Paraf Halaman',
        title: 'Tanda Tangan 2 Saksi & Paraf Sudut Setiap Halaman',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 1867, Pasal 1874 & Pasal 1895 KUHPerdata',
        description:
          'Kehadiran minimal 2 (dua) orang saksi serta paraf pada setiap lembar mencegah penyangkalan tanda tangan atau penyisipan halaman secara sepihak.',
        howToExecute:
          'Minta perwakilan Para Pihak membubuhkan paraf (initial) di kanan bawah seluruh halaman (Pasal demi Pasal & Lampiran), lalu hadirkan 2 saksi dewasa untuk ikut menandatangani bagian penutup akta.',
        clauseInsertionTitle: 'KEABSAHAN PARAF HALAMAN, SAKSI, DAN EKSEKUSI RANGKAP ASLI',
        clauseInsertionContent: [
          '(1) Setiap lembar halaman dari Perjanjian ini beserta seluruh lampirannya wajib dibubuhi paraf oleh wakil sah Para Pihak sebagai tanda persetujuan atas keutuhan redaksi setiap pasal.',
          '(2) Penandatanganan Perjanjian ini disaksikan oleh sekurang-kurangnya 2 (dua) orang Saksi dewasa yang cakap secara hukum guna memenuhi kekuatan pembuktian akta sesuai ketentuan Kitab Undang-Undang Hukum Perdata.',
        ],
      },
      {
        id: 'b2b-notarization',
        stepNumber: 4,
        stage: 'Notarisasi & Legalisasi',
        title: 'Waarmerking atau Legalisasi Notaris (Kepastian Tanggal & Tanda Tangan)',
        requirementLevel: 'Rekomendasi Notariil',
        legalBasis: 'Pasal 15 ayat (2) UU No. 2 Tahun 2014 (UUJN) & Pasal 1874a KUHPerdata',
        description:
          'Untuk kontrak bernilai material/strategis, lakukan Legalisasi (tanda tangan di hadapan Notaris) atau Waarmerking (pembukuan surat di bawah tangan) agar tanggal & tanda tangan tidak dapat disangkal.',
        howToExecute:
          'Bawa kedua rangkap asli ke kantor Notaris untuk Legalisasi (sebelum ditandatangani) atau Waarmerking (setelah ditandatangani) guna mendapatkan nomor registrasi buku daftar Notaris.',
      },
      {
        id: 'b2b-archive-qr',
        stepNumber: 5,
        stage: 'Pendaftaran & Arsip Asli',
        title: 'Distribusi Rangkap Asli, Lampiran BAST & Kunci Verifikasi QR',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 5 ayat (1) UU No. 1 Tahun 2024 (UU ITE) & Pasal 1866 KUHPerdata',
        description:
          'Pastikan lampiran teknis (SoW/SLA/Harga) terjilid menyatu dengan naskah utama dan simpan salinan pindai (scan PDF) ber-QR Code verifikasi.',
        howToExecute:
          'Simpan snapshot versi final di Klausa Studio, ekspor PDF resmi ber-QR Code, dan serahkan 1 berkas asli bermaterai kepada masing-masing pihak.',
      },
    ],
  },
  property_lease: {
    id: 'property_lease',
    label: 'Properti, Sewa-Menyewa, Tanah & Bangunan',
    shortBadge: 'Properti & Sewa',
    summary:
      'Prosedur kepatuhan khusus untuk Perjanjian Sewa Ruko/Gedung/Rumah, PPJB, dan Pengelolaan Properti agar terlindungi dari sengketa penguasaan fisik, pajak PPh Final, dan klaim pihak ketiga.',
    notarizationRequirement:
      'Sangat disarankan Akta Notariil / Legalisasi Notaris (dan wajib Akta PPAT untuk AJB/Peralihan Hak Atas Tanah sesuai PP No. 24 Tahun 1997).',
    stampDutyRule:
      'Wajib Meterai Rp10.000 pada tiap rangkap asli perjanjian + Meterai Rp10.000 pada Kuitansi Tanda Terima Uang Sewa & Deposit.',
    witnessRule:
      'Minimal 2 Saksi (disarankan mengikutsertakan pengelola gedung/RT/RW atau staf legal) + Berita Acara Serah Terima (BAST) Kunci.',
    steps: [
      {
        id: 'prop-title-check',
        stepNumber: 1,
        stage: 'Kewenangan & Identitas Pihak',
        title: 'Verifikasi Sertifikat Hak (SHM/SHGB), IMB/PBG & Persetujuan Pasangan',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'PP No. 24 Tahun 1997 & Pasal 35-36 UU No. 1 Tahun 1974 tentang Perkawinan',
        description:
          'Pastikan Pihak yang menyewakan/mengalihkan adalah pemilik sah pada Sertifikat (SHM/SHGB) dan memperoleh persetujuan tertulis suami/istri apabila objek merupakan harta bersama.',
        howToExecute:
          'Cocokkan nama pada SHM/SHGB asli, PBB tahun terakhir, IMB/PBG, serta lampirkan Surat Persetujuan Suami/Istri (atau Komisaris jika milik PT).',
        clauseInsertionTitle: 'JAMINAN KEPEMILIKAN SAH DAN BEBAS SENGKETA OBJEK PROPERTI',
        clauseInsertionContent: [
          '(1) Pihak Pertama menjamin bahwa pihaknya adalah pemilik dan/atau pemegang hak yang sah atas Objek Properti sebagaimana dibuktikan dengan dokumen kepemilikan resmi, serta telah memperoleh seluruh persetujuan yang diwajibkan oleh hukum (termasuk persetujuan pasangan kawin atau organ perseroan).',
          '(2) Pihak Pertama menjamin bahwa selama Masa Sewa berlangsung, Objek Properti tidak sedang dalam sengketa pengadilan, sita jaminan, atau eksekusi pihak ketiga yang dapat mengganggu penguasaan fisik secara tenteram oleh Pihak Kedua sesuai Pasal 1550 KUHPerdata.',
        ],
      },
      {
        id: 'prop-stamp-tax',
        stepNumber: 2,
        stage: 'Bea Meterai & Pajak',
        title: 'Bea Meterai Rp10.000 & Kewajiban PPh Final Pasal 4 Ayat (2) Sewa Tanah/Bangunan',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'UU No. 10 Tahun 2020 (Bea Meterai) & PP No. 34 Tahun 2017 (PPh Final 10%)',
        description:
          'Selain meterai Rp10.000 pada kontrak dan kuitansi, transaksi sewa tanah/bangunan dikenakan PPh Final sebesar 10% dari jumlah bruto nilai persewaan.',
        howToExecute:
          'Bubuhkan meterai Rp10.000 secara silang pada 2 rangkap kontrak & kuitansi deposit, serta pastikan pemotongan/penyetoran PPh Final 10% dan bukti potong pajak terdokumentasi.',
      },
      {
        id: 'prop-witness-bast',
        stepNumber: 3,
        stage: 'Saksi & Paraf Halaman',
        title: 'Tanda Tangan 2 Saksi, Paraf Halaman & Berita Acara Serah Terima (BAST) Kunci',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 1550 - Pasal 1562 KUHPerdata',
        description:
          'Penyerahan fisik properti wajib disertai BAST Kunci, foto kondisi awal bangunan, serta pencatatan angka meteran listrik PLN dan air PAM yang ditandatangani Para Pihak & 2 Saksi.',
        howToExecute:
          'Lampirkan daftar inventaris properti & foto meteran utilitas yang diparaf di setiap halaman oleh kedua pihak dan 2 orang saksi.',
        closingTextEnhancement:
          'Demikian Perjanjian Sewa Menyewa ini dibuat dalam rangkap 2 (dua) asli bermaterai cukup Rp10.000,-, diparaf pada setiap halaman, serta ditandatangani oleh Para Pihak dengan disaksikan oleh 2 (dua) orang Saksi yang sah.',
      },
      {
        id: 'prop-notarization',
        stepNumber: 4,
        stage: 'Notarisasi & Legalisasi',
        title: 'Legalisasi Notaris / Akta Sewa Menyewa Notariil (Untuk Sewa Jangka Panjang)',
        requirementLevel: 'Rekomendasi Notariil',
        legalBasis: 'Pasal 1870 KUHPerdata & UU No. 2 Tahun 2014 tentang Jabatan Notaris',
        description:
          'Untuk sewa komersial/ruko di atas 2 tahun atau bernilai besar, pembuatan Akta Sewa di hadapan Notaris memberikan kekuatan pembuktian sempurna (akta otentik).',
        howToExecute:
          'Tandatangani akta di hadapan Notaris di wilayah kedudukan objek properti atau lakukan Legalisasi tanda tangan Para Pihak dan Saksi.',
      },
    ],
  },
  employment_hr: {
    id: 'employment_hr',
    label: 'Ketenagakerjaan, PKWT, PKWTT & Hubungan Industrial',
    shortBadge: 'Ketenagakerjaan / PKWT',
    summary:
      'Prosedur kepatuhan wajib bagi Perjanjian Kerja Waktu Tertentu (PKWT), PKWTT, Kontrak Eksekutif, dan NDA Karyawan sesuai UU Ketenagakerjaan, UU Cipta Kerja, dan PP No. 35 Tahun 2021.',
    notarizationRequirement:
      'Tidak memerlukan Notarisasi, namun PKWT WAJIB dicatatkan pada instansi Ketenagakerjaan (Kemnaker/Disnaker) agar tidak berubah demi hukum menjadi PKWTT.',
    stampDutyRule:
      'Wajib Meterai Rp10.000 pada rangkap asli Perusahaan dan Pekerja (biaya pembuatan perjanjian kerja ditanggung oleh Pengusaha sesuai Pasal 55 UU Ketenagakerjaan).',
    witnessRule:
      'Paraf Pekerja di setiap halaman sebagai bukti Pekerja telah membaca & memahami seluruh syarat kerja tanpa paksaan.',
    steps: [
      {
        id: 'emp-language-bilingual',
        stepNumber: 1,
        stage: 'Kewenangan & Identitas Pihak',
        title: 'Kewajiban Bahasa Indonesia & Pemeriksaan Identitas Pekerja',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 57 ayat (1) UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023',
        description:
          'PKWT wajib dibuat secara tertulis serta harus menggunakan Bahasa Indonesia dan huruf latin (apabila dwibahasa, teks Bahasa Indonesia wajib berlaku utama).',
        howToExecute:
          'Pastikan teks Bahasa Indonesia tercantum lengkap;หาก tidak dibuat dalam Bahasa Indonesia, PKWT dapat dinyatakan berubah menjadi PKWTT (Karyawan Tetap).',
        clauseInsertionTitle: 'BAHASA PERJANJIAN KERJA DAN PENCATATAN KETENAGAKERJAAN',
        clauseInsertionContent: [
          '(1) Perjanjian Kerja ini dibuat secara tertulis dalam Bahasa Indonesia dan huruf latin sesuai ketentuan Pasal 57 Undang-Undang Ketenagakerjaan jo. Peraturan Pemerintah Nomor 35 Tahun 2021.',
          '(2) Seluruh biaya penyusunan dan pelunasan Bea Meterai atas Perjanjian Kerja ini ditanggung sepenuhnya oleh Pengusaha, dan Pekerja berhak menerima 1 (satu) rangkap asli yang telah ditandatangani.',
        ],
      },
      {
        id: 'emp-stamp-cost',
        stepNumber: 2,
        stage: 'Bea Meterai & Pajak',
        title: 'Pelunasan Bea Meterai Rp10.000 atas Beban Pengusaha',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 54 ayat (3) & Pasal 55 UU No. 13 Tahun 2003 & UU No. 10 Tahun 2020',
        description:
          'Perjanjian kerja dibuat sekurang-kurangnya dalam rangkap 2 bermaterai Rp10.000, dan segala biaya pembuatan perjanjian kerja wajib ditanggung oleh Pengusaha.',
        howToExecute:
          'Bubuhkan meterai Rp10.000 pada kedua rangkap asli dan serahkan 1 rangkap asli langsung kepada Pekerja pada hari penandatanganan.',
      },
      {
        id: 'emp-initials-witness',
        stepNumber: 3,
        stage: 'Saksi & Paraf Halaman',
        title: 'Paraf Pekerja di Setiap Halaman & Saksi HRD/Manajemen',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 52 ayat (1) UU Ketenagakerjaan & Pasal 1320 KUHPerdata',
        description:
          'Paraf Pekerja di setiap halaman membuktikan Pekerja telah membaca uraian jabatan, upah, tata tertib, dan klausul uang kompensasi secara sadar.',
        howToExecute:
          'Pastikan Pekerja memaraf setiap halaman termasuk lampiran Deskripsi Pekerjaan (Job Description) dan menandatangani di hadapan saksi HRD.',
      },
      {
        id: 'emp-disnaker-registration',
        stepNumber: 4,
        stage: 'Pendaftaran & Arsip Asli',
        title: 'Pencatatan PKWT ke Kemnaker / Disnaker (Maksimal 3–7 Hari Kerja)',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 14 PP No. 35 Tahun 2021 tentang PKWT, Alih Daya, Waktu Kerja & PHK',
        description:
          'PKWT harus dicatatkan oleh Pengusaha pada kementerian/dinas ketenagakerjaan secara daring paling lambat 3 (tiga) hari kerja sejak penandatanganan (atau 7 hari kerja secara luring).',
        howToExecute:
          'Unggah PDF PKWT yang telah ditandatangani ke portal Wajib Lapor Ketenagakerjaan (wajiblapor.kemnaker.go.id) dan simpan Bukti Pencatatan PKWT.',
      },
    ],
  },
  personal_loan_family: {
    id: 'personal_loan_family',
    label: 'Pinjaman Perdata, Pengakuan Utang, Jaminan & Keluarga',
    shortBadge: 'Perdata Perorangan & Utang',
    summary:
      'Prosedur kepatuhan untuk Perjanjian Pinjam Meminjam Uang, Pengakuan Utang, Jaminan Gadai/Fidusia, dan Kesepakatan Keluarga agar terhindar dari gugatan batal demi hukum.',
    notarizationRequirement:
      'Wajib Akta Notariil untuk Akta Jaminan Fidusia (UU No. 42/1999) dan sangat disarankan Grosse Akta Pengakuan Utang Notariil (Pasal 224 HIR) agar memiliki kekuatan eksekutorial langsung.',
    stampDutyRule:
      'Wajib Meterai Rp10.000 pada Perjanjian + Meterai Rp10.000 pada Bukti Tanda Terima Uang / Kuitansi Pencairan.',
    witnessRule:
      'Minimal 2 Saksi independen + Persetujuan Tertulis Suami/Istri (Spousal Consent) dari pihak peminjam/penjamin.',
    steps: [
      {
        id: 'loan-spousal-consent',
        stepNumber: 1,
        stage: 'Kewenangan & Identitas Pihak',
        title: 'Persetujuan Tertulis Pasangan Kawin (Spousal Consent — Pasal 35-36 UU Perkawinan)',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 35 & Pasal 36 UU No. 1 Tahun 1974 tentang Perkawinan',
        description:
          'Tindakan hukum meminjam uang atau menjaminkan harta bersama tanpa persetujuan suami/istri berisiko digugat pembatalan oleh pasangan di pengadilan.',
        howToExecute:
          'Cantumkan kolom tanda tangan "Menyetujui: Suami/Istri" beserta salinan KTP, Kartu Keluarga, dan Buku Nikah/Akta Perkawinan (kecuali ada Perjanjian Pisah Harta yang terdaftar).',
        clauseInsertionTitle: 'PERSETUJUAN PASANGAN KAWIN (SPOUSAL CONSENT) DAN BUKTI PENCAIRAN DANA',
        clauseInsertionContent: [
          '(1) Apabila Pihak Peminjam terikat dalam perkawinan yang sah tanpa perjanjian pemisahan harta, maka tindakan hukum dalam Perjanjian ini telah memperoleh persetujuan tertulis dari pasangan kawin yang sah sebagaimana dibuktikan dengan turut ditandatanganinya Perjanjian ini.',
          '(2) Perjanjian Pinjam Meminjam ini berlaku efektif secara riil sejak dana pinjaman ditransfer ke rekening resmi Pihak Peminjam sesuai Pasal 1754 KUHPerdata, yang bukti transfer banknya menjadi bagian tak terpisahkan dari Perjanjian ini.',
        ],
      },
      {
        id: 'loan-stamp-transfer',
        stepNumber: 2,
        stage: 'Bea Meterai & Pajak',
        title: 'Bea Meterai Rp10.000 & Lampiran Bukti Transfer Bank (Kontrak Riil Pasal 1754)',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 1754 KUHPerdata, Pasal 1878 KUHPerdata & UU No. 10 Tahun 2020',
        description:
          'Pinjam-meminjam adalah perjanjian riil yang baru lahir saat uang diserahkan. Untuk pengakuan utang sepihak di bawah tangan, berlaku syarat tulisan tangan jumlah uang (Pasal 1878 KUHPerdata) bila tidak dibuat secara timbal balik/notariil.',
        howToExecute:
          'Bubuhkan meterai Rp10.000 pada perjanjian dan lampirkan bukti mutasi/transfer bank ke rekening atas nama Peminjam sendiri.',
      },
      {
        id: 'loan-witness',
        stepNumber: 3,
        stage: 'Saksi & Paraf Halaman',
        title: 'Tanda Tangan 2 Saksi Dewasa & Paraf Setiap Halaman',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 1867 & Pasal 1895 KUHPerdata',
        description:
          'Kehadiran 2 orang saksi yang menyaksikan penandatanganan serta penyerahan dana sangat krusial bila debitur kelak mengingkari utangnya.',
        howToExecute:
          'Pastikan 2 orang saksi mencantumkan nama terang sesuai KTP dan menandatangani lembar penutup perjanjian.',
      },
      {
        id: 'loan-notary-fidusia',
        stepNumber: 4,
        stage: 'Notarisasi & Legalisasi',
        title: 'Akta Notariil / Grosse Akta Pengakuan Utang & Pendaftaran Jaminan Fidusia',
        requirementLevel: 'Rekomendasi Notariil',
        legalBasis: 'Pasal 224 HIR & Pasal 5 ayat (1) UU No. 42 Tahun 1999 tentang Jaminan Fidusia',
        description:
          'Jika disertai jaminan benda bergerak (kendaraan/mesin/stok), wajib dibuat Akta Jaminan Fidusia Notariil dan didaftarkan di AHU Online agar memiliki hak eksekusi langsung (parate executie).',
        howToExecute:
          'Hadap Notaris untuk pembuatan Akta Pengakuan Utang / Akta Jaminan Fidusia dan pastikan Sertifikat Jaminan Fidusia terbit dalam maksimal 30 hari.',
      },
    ],
  },
  litigation_poa_dading: {
    id: 'litigation_poa_dading',
    label: 'Surat Kuasa Khusus, Somasi & Akta Perdamaian (Litigasi)',
    shortBadge: 'Surat Kuasa & Litigasi',
    summary:
      'Syarat formil mutlak bagi Surat Kuasa Khusus (SEMA No. 6 Tahun 1994), Teguran Somasi/Aanmaning, serta Kesepakatan Perdamaian (Acte van Dading) agar tidak dinyatakan cacat formil (NO) di pengadilan.',
    notarizationRequirement:
      'Surat Kuasa di luar negeri wajib legalisasi KBRI/Apostille; Kesepakatan Perdamaian (Dading) disarankan dikukuhkan menjadi Akta Perdamaian Pengadilan (Pasal 1858 KUHPerdata).',
    stampDutyRule:
      'Wajib Meterai Rp10.000 pada kolom Pemberi Kuasa dengan tanggal penandatanganan TIDAK BOLEH lebih baru dari tanggal pendaftaran gugatan.',
    witnessRule:
      'Untuk Kesepakatan Perdamaian (Dading), wajib ditandatangani Para Pihak + 2 Saksi atau Mediator Bersertifikat.',
    steps: [
      {
        id: 'lit-sema-formal',
        stepNumber: 1,
        stage: 'Kewenangan & Identitas Pihak',
        title: 'Pemenuhan Syarat Formil Surat Kuasa Khusus (SEMA No. 6 Tahun 1994)',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 123 HIR & SEMA RI No. 6 Tahun 1994 tentang Surat Kuasa Khusus',
        description:
          'Surat Kuasa Khusus wajib menyebutkan secara spesifik: (a) identitas & kedudukan para pihak (Penggugat/Tergugat), (b) pokok/objek sengketa, dan (c) kompetensi relatif Pengadilan yang dituju.',
        howToExecute:
          'Periksa redaksi khusus pada Surat Kuasa, pastikan mencantumkan Hak Substitusi dan Hak Retensi (Pasal 1812 KUHPerdata).',
        clauseInsertionTitle: 'KEKHUSUSAN KUASA, HAK SUBSTITUSI, DAN KEABSAHAN FORMIL',
        clauseInsertionContent: [
          '(1) Pemberian kuasa atau kesepakatan penyelesaian sengketa ini disusun dengan memenuhi syarat formil kekhususan objek perkara, identitas kedudukan para pihak, serta forum pengadilan yang berwenang sesuai Pasal 123 HIR dan SEMA Nomor 6 Tahun 1994.',
          '(2) Dokumen ini dibubuhi Bea Meterai Rp10.000,- yang sah dan bertanggal tepat pada saat penandatanganan sebagai syarat keabsahan alat bukti di hadapan pengadilan maupun instansi berwenang.',
        ],
      },
      {
        id: 'lit-stamp-date',
        stepNumber: 2,
        stage: 'Bea Meterai & Pajak',
        title: 'Meterai Rp10.000 pada Pemberi Kuasa & Kronologi Tanggal Penandatanganan',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'UU No. 10 Tahun 2020 & Yurisprudensi Mahkamah Agung RI',
        description:
          'Meterai Rp10.000 wajib ditempel pada sisi Pemberi Kuasa, dan tanggal Surat Kuasa harus mendahului atau sama dengan tanggal surat gugatan/somasi.',
        howToExecute:
          'Pemberi Kuasa menandatangani di atas meterai Rp10.000 disertai pencantuman tanggal dan tempat penandatanganan yang jelas.',
      },
      {
        id: 'lit-witness-mediator',
        stepNumber: 3,
        stage: 'Saksi & Paraf Halaman',
        title: 'Tanda Tangan Penerima Kuasa / Mediator & 2 Saksi (Untuk Dading)',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 1792 & Pasal 1851 KUHPerdata jo. PERMA No. 1 Tahun 2016',
        description:
          'Kedua belah pihak (Pemberi & Penerima Kuasa, atau Para Pihak dalam Perdamaian beserta Saksi/Mediator) wajib menandatangani naskah secara lengkap.',
        howToExecute:
          'Pastikan seluruh halaman diparaf dan bagian penutup ditandatangani lengkap oleh seluruh pihak.',
      },
      {
        id: 'lit-court-registration',
        stepNumber: 4,
        stage: 'Pendaftaran & Arsip Asli',
        title: 'Pendaftaran di Kepaniteraan Pengadilan (e-Court) / Pengukuhan Akta Van Dading',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'PERMA No. 7 Tahun 2022 (e-Court) & Pasal 1858 KUHPerdata',
        description:
          'Surat Kuasa wajib didaftarkan di Kepaniteraan Pengadilan Negeri; sedangkan Kesepakatan Perdamaian dapat dimohonkan pengukuhan menjadi Akta Perdamaian (Acta Van Vergelijk).',
        howToExecute:
          'Unggah pindaian dokumen bermaterai ke e-Court Mahkamah Agung dan bawa naskah asli saat sidang pemeriksaan legal standing.',
      },
    ],
  },
  tech_ip_saas: {
    id: 'tech_ip_saas',
    label: 'Teknologi, Software/SaaS, Lisensi HKI & Pelindungan Data (PDP)',
    shortBadge: 'Teknologi, HKI & PDP',
    summary:
      'Prosedur kepatuhan khusus untuk Kontrak Pengembangan Software, SaaS, Lisensi HKI, dan NDA/DPA sesuai UU Hak Cipta No. 28/2014, UU ITE No. 1/2024, dan UU PDP No. 27/2022.',
    notarizationRequirement:
      'Legalisasi/Waarmerking Notaris untuk pengalihan HKI bernilai tinggi + wajib Pencatatan Perjanjian Lisensi HKI di DJKI Kemenkumham agar mengikat pihak ketiga.',
    stampDutyRule:
      'Wajib e-Meterai Peruri / Meterai Tempel Rp10.000 pada kontrak utama dan Berita Acara Serah Terima Source Code / UAT.',
    witnessRule:
      '2 Saksi + Tanda Tangan Elektronik Tersertifikasi (PSrE) sesuai Pasal 11 UU ITE atau tanda tangan basah bermaterai.',
    steps: [
      {
        id: 'tech-pdp-consent',
        stepNumber: 1,
        stage: 'Kewenangan & Identitas Pihak',
        title: 'Kepatuhan Peran Pengendali & Pemroses Data Pribadi (UU PDP No. 27/2022)',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 20, Pasal 46 & Pasal 51 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
        description:
          'Pastikan kontrak secara tegas memisahkan kedudukan Pengendali Data (Data Controller) dan Pemroses Data (Data Processor) beserta kewajiban notifikasi insiden 3x24 jam.',
        howToExecute:
          'Verifikasi klausul kerahasiaan data pribadi dan lampirkan standar keamanan informasi (ISO 27001 / enkripsi) pada lampiran teknis.',
        clauseInsertionTitle: 'KEPATUHAN PELINDUNGAN DATA PRIBADI DAN PENCATATAN LISENSI HKI',
        clauseInsertionContent: [
          '(1) Dalam hal pelaksanaan Perjanjian melibatkan pemrosesan Data Pribadi, Para Pihak wajib mematuhi seluruh ketentuan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, termasuk kewajiban pemberitahuan tertulis paling lambat 3 x 24 (tiga kali dua puluh empat) jam apabila terjadi kegagalan pelindungan data.',
          '(2) Pengalihan atau pemberian lisensi Hak Kekayaan Intelektual berdasarkan Perjanjian ini dilaksanakan secara tertulis dan dapat dicatatkan pada Direktorat Jenderal Kekayaan Intelektual (DJKI) sesuai Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta.',
        ],
      },
      {
        id: 'tech-emeterai-tte',
        stepNumber: 2,
        stage: 'Bea Meterai & Pajak',
        title: 'Pembubuhan e-Meterai Rp10.000 & Tanda Tangan Elektronik Tersertifikasi (PSrE)',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'UU No. 10 Tahun 2020 (Bea Meterai) & Pasal 11 UU No. 1 Tahun 2024 (UU ITE)',
        description:
          'Untuk kontrak digital/elektronik, pembubuhan e-Meterai resmi wajib dilakukan sebelum dokumen dikunci dengan Tanda Tangan Elektronik Tersertifikasi (PSrE).',
        howToExecute:
          'Bubuhkan e-Meterai Rp10.000 (atau meterai fisik Rp10.000 jika tanda tangan basah) serta pastikan pemotongan PPh Pasal 23 (2% jasa teknis/software) diatur jelas.',
      },
      {
        id: 'tech-witness-uat',
        stepNumber: 3,
        stage: 'Saksi & Paraf Halaman',
        title: 'Tanda Tangan 2 Saksi, Paraf Lampiran SLA & Berita Acara UAT',
        requirementLevel: 'Wajib Pembuktian',
        legalBasis: 'Pasal 1338 & Pasal 1867 KUHPerdata',
        description:
          'Spesifikasi fitur, arsitektur sistem, dan kriteria User Acceptance Test (UAT) wajib diparaf di setiap halaman agar tidak terjadi sengketa ruang lingkup (scope creep).',
        howToExecute:
          'Paraf seluruh lampiran SoW/SLA dan hadirkan 2 saksi (Project Lead / Legal) pada saat penandatanganan kontrak.',
      },
      {
        id: 'tech-djki-recordation',
        stepNumber: 4,
        stage: 'Pendaftaran & Arsip Asli',
        title: 'Pencatatan Perjanjian Lisensi HKI di DJKI Kemenkumham',
        requirementLevel: 'Wajib Hukum',
        legalBasis: 'Pasal 83 UU No. 28 Tahun 2014 tentang Hak Cipta & PP No. 36 Tahun 2018',
        description:
          'Perjanjian Lisensi HKI wajib dicatatkan oleh Menteri (DJKI Kemenkumham); jika tidak dicatatkan, perjanjian lisensi tersebut tidak mempunyai akibat hukum terhadap pihak ketiga.',
        howToExecute:
          'Ajukan permohonan pencatatan perjanjian lisensi secara daring melalui portal DJKI Kemenkumham setelah akta ditandatangani.',
      },
    ],
  },
};

export function detectComplianceProfileFromDocument(
  doc: LegalDocument
): Exclude<ComplianceCategoryProfileId, 'auto'> {
  const combined = `${doc.category || ''} ${doc.title || ''} ${doc.subtitle || ''}`.toLowerCase();
  if (/sewa|properti|tanah|bangunan|ruko|gedung|apartemen|ppjb|ajb|kos/i.test(combined)) {
    return 'property_lease';
  }
  if (/kerja|pkwt|pkwtt|karyawan|pekerja|hrd|ketenagakerjaan|hubungan industrial/i.test(combined)) {
    return 'employment_hr';
  }
  if (/pinjam|utang|piutang|gadai|fidusia|jaminan|keluarga|waris|hibah|pernyataan/i.test(combined)) {
    return 'personal_loan_family';
  }
  if (/kuasa|somasi|aanmaning|gugatan|perdamaian|dading|litigasi|sengketa|mediasi/i.test(combined)) {
    return 'litigation_poa_dading';
  }
  if (/software|aplikasi|teknologi|saas|it\b|hki|hak cipta|data pribadi|pdp|nda|rahasia/i.test(combined)) {
    return 'tech_ip_saas';
  }
  return 'commercial_b2b';
}

export interface ProceduralComplianceEvaluation {
  profile: CategoryManualProfile;
  activeProfileKey: Exclude<ComplianceCategoryProfileId, 'auto'>;
  docStateKey: string;
  checkedStepIds: string[];
  completedCount: number;
  totalSteps: number;
  progressPct: number;
  allPassed: boolean;
  readyForSignature: boolean;
  stampDutyPassed: boolean;
  witnessPresencePassed: boolean;
  notarizationOrAuthorityPassed: boolean;
  stepsWithStatus: Array<ProceduralChecklistStep & { isPassed: boolean }>;
}

export function evaluateProceduralComplianceStatus(
  doc: LegalDocument,
  checkedByDoc: Record<string, string[]> = {},
  profileMode: ComplianceCategoryProfileId = 'auto'
): ProceduralComplianceEvaluation {
  const detectedKey = detectComplianceProfileFromDocument(doc);
  const activeProfileKey = profileMode === 'auto' ? detectedKey : profileMode;
  const profile = PROCEDURAL_PROFILES[activeProfileKey];
  const docStateKey = `${doc.id}::${activeProfileKey}`;

  const closingLower = (doc.closingText || '').toLowerCase();
  const clausesLower = (doc.clauses || [])
    .map((c) => `${c.title} ${c.content.join(' ')}`)
    .join(' ')
    .toLowerCase();
  const combinedText = `${closingLower} ${clausesLower}`;

  let effectiveCheckedIds: string[];
  if (checkedByDoc[docStateKey] !== undefined) {
    effectiveCheckedIds = checkedByDoc[docStateKey];
  } else {
    const autoDetected: string[] = [];
    profile.steps.forEach((step) => {
      if (
        step.stage === 'Bea Meterai & Pajak' &&
        /meterai|materai/i.test(combinedText)
      ) {
        autoDetected.push(step.id);
      } else if (
        step.stage === 'Saksi & Paraf Halaman' &&
        /saksi|paraf|disaksikan/i.test(combinedText)
      ) {
        autoDetected.push(step.id);
      } else if (
        step.stage === 'Kewenangan & Identitas Pihak' &&
        /kewenangan penuh|anggaran dasar|pasangan kawin|spousal consent|sema nomor 6/i.test(
          combinedText
        )
      ) {
        autoDetected.push(step.id);
      }
    });
    effectiveCheckedIds = autoDetected;
  }

  const stepsWithStatus = profile.steps.map((step) => ({
    ...step,
    isPassed: effectiveCheckedIds.includes(step.id),
  }));

  const completedCount = stepsWithStatus.filter((s) => s.isPassed).length;
  const totalSteps = profile.steps.length;
  const progressPct = Math.round((completedCount / Math.max(1, totalSteps)) * 100);
  const allPassed = completedCount === totalSteps && totalSteps > 0;

  const stampDutyStep = stepsWithStatus.find(
    (s) => s.stage === 'Bea Meterai & Pajak'
  );
  const witnessStep = stepsWithStatus.find(
    (s) => s.stage === 'Saksi & Paraf Halaman'
  );
  const authorityOrNotarySteps = stepsWithStatus.filter(
    (s) =>
      s.stage === 'Kewenangan & Identitas Pihak' ||
      s.stage === 'Notarisasi & Legalisasi' ||
      s.stage === 'Pendaftaran & Arsip Asli'
  );

  const stampDutyPassed = stampDutyStep ? stampDutyStep.isPassed : allPassed;
  const witnessPresencePassed = witnessStep ? witnessStep.isPassed : allPassed;
  const notarizationOrAuthorityPassed =
    authorityOrNotarySteps.length > 0
      ? authorityOrNotarySteps.every((s) => s.isPassed)
      : allPassed;

  return {
    profile,
    activeProfileKey,
    docStateKey,
    checkedStepIds: effectiveCheckedIds,
    completedCount,
    totalSteps,
    progressPct,
    allPassed,
    readyForSignature: allPassed,
    stampDutyPassed,
    witnessPresencePassed,
    notarizationOrAuthorityPassed,
    stepsWithStatus,
  };
}

interface ProceduralComplianceManualProps {
  document: LegalDocument;
  onInsertProceduralClause: (clause: Omit<LegalClause, 'id' | 'number'>) => void;
  onUpdateClosingText: (newClosingText: string) => void;
  onNotify: (msg: string) => void;
  checkedByDoc?: Record<string, string[]>;
  onChangeCheckedByDoc?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  selectedProfileMode?: ComplianceCategoryProfileId;
  onChangeProfileMode?: (mode: ComplianceCategoryProfileId) => void;
}

export const ProceduralComplianceManual: React.FC<ProceduralComplianceManualProps> = ({
  document,
  onInsertProceduralClause,
  onUpdateClosingText,
  onNotify,
  checkedByDoc: externalCheckedByDoc,
  onChangeCheckedByDoc,
  selectedProfileMode: externalProfileMode,
  onChangeProfileMode,
}) => {
  const [internalProfileMode, setInternalProfileMode] =
    useState<ComplianceCategoryProfileId>('auto');
  const [internalCheckedByDoc, setInternalCheckedByDoc] = useState<
    Record<string, string[]>
  >({});
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  const selectedProfileMode =
    externalProfileMode !== undefined ? externalProfileMode : internalProfileMode;
  const setSelectedProfileMode = (nextMode: ComplianceCategoryProfileId) => {
    setInternalProfileMode(nextMode);
    onChangeProfileMode?.(nextMode);
  };

  const checkedByDoc =
    externalCheckedByDoc !== undefined ? externalCheckedByDoc : internalCheckedByDoc;
  const setCheckedByDoc = onChangeCheckedByDoc || setInternalCheckedByDoc;

  const detectedProfileKey = useMemo(
    () => detectComplianceProfileFromDocument(document),
    [document]
  );

  const evaluation = useMemo(
    () =>
      evaluateProceduralComplianceStatus(
        document,
        checkedByDoc,
        selectedProfileMode
      ),
    [document, checkedByDoc, selectedProfileMode]
  );

  const {
    profile: activeProfile,
    docStateKey,
    checkedStepIds: currentCheckedIds,
    completedCount,
    totalSteps,
    progressPct,
  } = evaluation;

  const handleToggleStep = (stepId: string) => {
    setCheckedByDoc((prev) => {
      const existing =
        prev[docStateKey] !== undefined ? prev[docStateKey] : currentCheckedIds;
      const next = existing.includes(stepId)
        ? existing.filter((id) => id !== stepId)
        : [...existing, stepId];
      return {
        ...prev,
        [docStateKey]: next,
      };
    });
  };

  const handleCheckAll = () => {
    setCheckedByDoc((prev) => ({
      ...prev,
      [docStateKey]: activeProfile.steps.map((s) => s.id),
    }));
    onNotify(
      `Seluruh ${activeProfile.steps.length} langkah prosedural pada Manual Kepatuhan (${activeProfile.shortBadge}) ditandai terpenuhi — Dokumen kini berstatus SIAP DITANDATANGANI pada Kode QR.`
    );
  };

  const handleResetAll = () => {
    setCheckedByDoc((prev) => ({
      ...prev,
      [docStateKey]: [],
    }));
    onNotify('Status checklist Manual Kepatuhan direset.');
  };

  const handleCopyManualAsText = async () => {
    const lines: string[] = [
      `# MANUAL KEPATUHAN PROSEDURAL — ${document.title}`,
      `Nomor Dokumen: ${document.documentNumber} | Kategori: ${document.category} (${activeProfile.label})`,
      ``,
      `## Ringkasan Syarat Formil Eksekusi:`,
      `- **Bea Meterai:** ${activeProfile.stampDutyRule}`,
      `- **Saksi & Paraf:** ${activeProfile.witnessRule}`,
      `- **Notarisasi / Pendaftaran:** ${activeProfile.notarizationRequirement}`,
      ``,
      `## Daftar Periksa Langkah demi Langkah (Step-by-Step Checklist):`,
      ...activeProfile.steps.map((s) => {
        const isDone = currentCheckedIds.includes(s.id);
        return `${s.stepNumber}. [${isDone ? 'x' : ' '}] **${s.title}** (${s.stage} — ${s.requirementLevel})\n   - Dasar Hukum: ${s.legalBasis}\n   - Panduan Pelaksanaan: ${s.howToExecute}`;
      }),
    ];
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = window.document.createElement('textarea');
      ta.value = text;
      window.document.body.appendChild(ta);
      ta.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(ta);
    }
    setCopiedChecklist(true);
    onNotify('Checklist Manual Kepatuhan berhasil disalin ke clipboard (format Markdown).');
    setTimeout(() => setCopiedChecklist(false), 2400);
  };

  return (
    <div
      data-testid="manual-kepatuhan-panel"
      className="space-y-3.5 font-ui text-[#18181B]"
    >
      {/* Header & Category Selector */}
      <div className="p-3 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <h4 className="text-xs font-bold text-[#18181B]">
                Manual Kepatuhan Prosedural & Formil Akta
              </h4>
            </div>
            <p className="text-[10.5px] text-[#57534E] leading-relaxed">
              Panduan langkah demi langkah berdasarkan kategori dokumen untuk memastikan syarat bea meterai, saksi, paraf halaman, dan notarisasi terpenuhi.
            </p>
          </div>
          <span className="font-code text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] shrink-0">
            {completedCount}/{totalSteps} Selesai ({progressPct}%)
          </span>
        </div>

        {/* Category Switcher */}
        <div className="space-y-1">
          <label
            htmlFor="manual-kepatuhan-category-select"
            className="block text-[10px] font-semibold uppercase tracking-wider text-[#57534E]"
          >
            Kategori Dokumen Acuan Checklist:
          </label>
          <select
            id="manual-kepatuhan-category-select"
            data-testid="manual-kepatuhan-category-select"
            value={selectedProfileMode}
            onChange={(e) =>
              setSelectedProfileMode(e.target.value as ComplianceCategoryProfileId)
            }
            className="w-full px-2.5 py-1.5 text-[11px] font-semibold text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
          >
            <option value="auto">
              Otomatis Sesuai Dokumen Aktif ({document.category} → {PROCEDURAL_PROFILES[detectedProfileKey].shortBadge})
            </option>
            <option value="commercial_b2b">
              Kontrak Komersial, Korporasi & Kerjasama B2B
            </option>
            <option value="property_lease">
              Properti, Sewa-Menyewa, Tanah & Bangunan
            </option>
            <option value="employment_hr">
              Ketenagakerjaan, PKWT, PKWTT & SDM
            </option>
            <option value="personal_loan_family">
              Pinjaman Perdata, Pengakuan Utang, Jaminan & Keluarga
            </option>
            <option value="litigation_poa_dading">
              Surat Kuasa Khusus, Somasi & Akta Perdamaian (Litigasi)
            </option>
            <option value="tech_ip_saas">
              Teknologi, Software/SaaS, Lisensi HKI & PDP
            </option>
          </select>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPct === 100
                  ? 'bg-emerald-600'
                  : progressPct >= 50
                  ? 'bg-[#1E3A8A]'
                  : 'bg-amber-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-testid="manual-kepatuhan-check-all-btn"
                onClick={handleCheckAll}
                className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-[#EFF6FF] text-[#1E3A8A] border border-[#D6D0C4] rounded cursor-pointer transition-colors"
              >
                Tandai Semua Terpenuhi
              </button>
              <button
                type="button"
                data-testid="manual-kepatuhan-reset-btn"
                onClick={handleResetAll}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-[#57534E] hover:text-red-700 bg-white border border-[#D6D0C4] rounded cursor-pointer transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>
            <button
              type="button"
              data-testid="manual-kepatuhan-copy-btn"
              onClick={handleCopyManualAsText}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#18181B] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded cursor-pointer transition-colors"
              title="Salin seluruh panduan langkah demi langkah Manual Kepatuhan ke clipboard"
            >
              {copiedChecklist ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5 text-[#1E3A8A]" />
                  <span>Salin Checklist</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Procedural Pillars Summary Card (Bea Meterai, Saksi, Notarisasi) */}
      <div className="p-3 bg-white border border-[#E5E0D8] rounded-md space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#18181B]">
            Ringkasan 3 Pilar Prosedural ({activeProfile.shortBadge})
          </span>
          <span className="text-[9.5px] font-code text-[#57534E]">
            Kategori: {document.category}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 text-[10.5px]">
          <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded flex items-start gap-2">
            <Stamp className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#18181B] block">
                1. Bea Meterai (Stamp Duty — UU No. 10/2020):
              </span>
              <span className="text-[#57534E] leading-snug block">
                {activeProfile.stampDutyRule}
              </span>
            </div>
          </div>

          <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded flex items-start gap-2">
            <Users className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#18181B] block">
                2. Tanda Tangan Saksi & Paraf (Witnesses & Initials):
              </span>
              <span className="text-[#57534E] leading-snug block">
                {activeProfile.witnessRule}
              </span>
            </div>
          </div>

          <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded flex items-start gap-2">
            <Scale className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#18181B] block">
                3. Notarisasi, Legalisasi & Pendaftaran Resmi:
              </span>
              <span className="text-[#57534E] leading-snug block">
                {activeProfile.notarizationRequirement}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Interactive Procedural Checklist */}
      <div className="space-y-2.5" data-testid="manual-kepatuhan-steps-list">
        {activeProfile.steps.map((step) => {
          const isChecked = currentCheckedIds.includes(step.id);
          return (
            <div
              key={step.id}
              data-testid={`manual-kepatuhan-step-${step.stepNumber}`}
              className={`p-3 rounded-md border transition-all space-y-2 ${
                isChecked
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-white border-[#E5E0D8] hover:border-[#1E3A8A]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <label className="flex items-start gap-2 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    data-testid={`manual-step-checkbox-${step.stepNumber}`}
                    checked={isChecked}
                    onChange={() => handleToggleStep(step.id)}
                    className="mt-0.5 rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-code text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                        Langkah {step.stepNumber} · {step.stage}
                      </span>
                      <span
                        className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded ${
                          step.requirementLevel === 'Wajib Hukum'
                            ? 'bg-red-100 text-red-800'
                            : step.requirementLevel === 'Wajib Pembuktian'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-[#1E3A8A]'
                        }`}
                      >
                        {step.requirementLevel}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-bold leading-snug ${
                        isChecked ? 'line-through text-[#57534E]' : 'text-[#18181B]'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </label>
              </div>

              <div className="pl-5 space-y-1.5 text-[11px]">
                <div className="font-code text-[10px] text-[#1E3A8A] font-semibold">
                  Dasar Hukum: {step.legalBasis}
                </div>
                <p className="text-[#3F3F46] leading-relaxed">{step.description}</p>
                <div className="p-2 bg-[#FAF9F6] border-l-2 border-[#1E3A8A] rounded-r text-[10.5px] text-[#27272A] leading-relaxed">
                  <strong className="text-[#18181B]">Cara Pelaksanaan Praktis:</strong>{' '}
                  {step.howToExecute}
                </div>

                {/* Actionable 1-click insertion into active document */}
                {(step.clauseInsertionTitle || step.closingTextEnhancement) && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    {step.clauseInsertionTitle && step.clauseInsertionContent && (
                      <button
                        type="button"
                        data-testid={`manual-step-insert-clause-${step.stepNumber}`}
                        onClick={() => {
                          onInsertProceduralClause({
                            title: step.clauseInsertionTitle!,
                            content: step.clauseInsertionContent!,
                            legalBasis: step.legalBasis,
                            riskLevel: 'Standar',
                            clauseCategory: 'Governance & Dispute',
                            clauseTags: ['Kepatuhan Prosedural', step.stage],
                          });
                          if (!isChecked) {
                            handleToggleStep(step.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-3 h-3 shrink-0" />
                        <span>Sisipkan Klausul Prosedural ke Draf</span>
                      </button>
                    )}

                    {step.closingTextEnhancement && (
                      <button
                        type="button"
                        data-testid={`manual-step-update-closing-${step.stepNumber}`}
                        onClick={() => {
                          onUpdateClosingText(step.closingTextEnhancement!);
                          if (!isChecked) {
                            handleToggleStep(step.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Perbarui Kalimat Penutup (Meterai & Saksi)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Formats a single LegalClause into clean, structured Markdown (including clause numbering,
 * title, legal basis metadata, and sub-clause numbering) ready to paste into Notion,
 * Slack, WhatsApp, or external Markdown documents.
 */
export function formatClauseAsMarkdown(
  clause: LegalClause,
  documentTitle?: string,
  documentNumber?: string
): string {
  const headerLine = `### ${clause.number} — ${clause.title}`;
  const metaParts: string[] = [];
  if (clause.legalBasis) {
    metaParts.push(`**Dasar Hukum:** ${clause.legalBasis}`);
  }
  if (clause.clauseCategory) {
    metaParts.push(`**Kategori:** ${clause.clauseCategory}`);
  }
  if (clause.riskLevel) {
    metaParts.push(`**Tingkat Risiko:** ${clause.riskLevel}`);
  }

  const formattedAyat = (clause.content || []).map((paragraph, idx) => {
    const trimmed = paragraph.trim();
    const hasLeadingNumber = /^(?:\(\d+\)|\d+\.\d+\.?|\d+\.|[a-z]\.)/i.test(trimmed);
    const numberedText = hasLeadingNumber ? trimmed : `(${idx + 1}) ${trimmed}`;
    return `${idx + 1}. ${numberedText}`;
  });

  const lines: string[] = [
    headerLine,
    metaParts.length > 0 ? `> ${metaParts.join(' | ')}` : '',
    '',
    ...formattedAyat,
  ].filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''));

  if (clause.plainSummary) {
    lines.push('', `> **Ringkasan Bahasa Sederhana:** ${clause.plainSummary}`);
  }

  if (documentTitle) {
    lines.push(
      '',
      `_${documentTitle}${documentNumber ? ` (${documentNumber})` : ''}_`
    );
  }

  return lines.join('\n');
}
