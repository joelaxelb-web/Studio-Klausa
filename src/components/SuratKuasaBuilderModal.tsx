import React, { useState, useEffect } from 'react';
import {
  FileSignature,
  UserCheck,
  Building2,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Scale,
  Briefcase,
  Gavel,
  Landmark,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { LegalDocument, LegalClause, PartyEntityType } from '../types/legal';

export type PowerOfAttorneyType =
  | 'aanmaning'
  | 'bpsk'
  | 'laps_sjk'
  | 'mediasi_pn'
  | 'gugatan_sederhana'
  | 'gugatan_perdata'
  | 'pkpu_niaga'
  | 'non_litigasi'
  | 'korporasi_rups'
  | 'perbankan_aset';

export type DocumentBuildMode =
  | 'sk_khusus'
  | 'surat_tugas'
  | 'bundel_sk_st'
  | 'naskah_perkara';

export type RecipientTemplateStyle = 'inhouse_corporate' | 'external_lawfirm' | 'hybrid_pkpu';

interface SuratKuasaBuilderModalProps {
  isOpen: boolean;
  initialType?: PowerOfAttorneyType;
  initialDocMode?: DocumentBuildMode;
  onClose: () => void;
  onCreateSuratKuasa: (newDoc: LegalDocument) => void;
  onGenerateWithAI?: (prompt: string, stance: string) => void;
}

export interface CorporateRecipientPerson {
  name: string;
  title: string;
  nik: string;
  address: string;
}

interface ForumPresetConfig {
  label: string;
  shortBadge: string;
  subtitle: string;
  legalBasis: string;
  defaultRecipientStyle: RecipientTemplateStyle;
  defaultPartyPosition: string;
  defaultScope: string;
  defaultAuthorityBullets: string[];
  defaultSuratTugasUntuk: string;
  defaultOpponentOrTarget: string;
  defaultCourtOrForum: string;
  defaultCaseNumber: string;
  defaultClaimValue: string;
  defaultPleadingTitle: string;
  defaultPositaSummary: string;
  defaultPetitumSummary: string;
}

export const DEFAULT_CORPORATE_GRANTOR = {
  companyName: 'PT Caturnusa Sejahtera Finance',
  directorName: 'Romi',
  directorTitle: 'Direktur',
  directorNik: '3171041205780002',
  directorAddress: 'Jl. Taman Kebon Sirih II No. 8, Jakarta Pusat',
  companyCity: 'Jakarta Selatan',
  companyAddress:
    'Gedung Menara Kadin Indonesia Lt. 20, Jl. H.R. Rasuna Said Blok X-5 Kav. 2-3, Kuningan Timur, Setiabudi, Jakarta Selatan',
  deedIncorporation:
    'Akta Nomor 09 tanggal 14 Agustus 2015, dibuat di hadapan Mala Mukti, S.H., LL.M., Notaris di Jakarta, yang telah memperoleh pengesahan dari Menteri Hukum dan Hak Asasi Manusia Republik Indonesia berdasarkan Surat Keputusan Nomor: AHU-2451820.AH.01.01.TAHUN 2015 tanggal 21 Agustus 2015',
  deedLatestAmendment:
    'Akta Nomor 18 tanggal 12 Juni 2024, dibuat di hadapan Jose Dima Satria, S.H., M.Kn., Notaris di Jakarta Selatan, yang telah memperoleh penerimaan pemberitahuan perubahan data perseroan dari Menteri Hukum dan Hak Asasi Manusia Republik Indonesia berdasarkan Surat Nomor: AHU-AH.01.09-0218490 tanggal 15 Juni 2024',
};

export const DEFAULT_INHOUSE_RECIPIENTS: CorporateRecipientPerson[] = [
  {
    name: 'M. Rizki Ramadhan, S.H.',
    title: 'Legal Specialist',
    nik: '3275041902950004',
    address: 'Jl. Cempaka Putih Tengah XXVII No. 14, Jakarta Pusat',
  },
  {
    name: 'Andika Pratama Putra, S.H.',
    title: 'Litigation & Dispute Resolution Officer',
    nik: '3174082107960008',
    address: 'Jl. Tebet Barat Dalam VI No. 22, Jakarta Selatan',
  },
  {
    name: 'Nadia Kusuma Wardhani, S.H., M.H.',
    title: 'Corporate Legal Counsel',
    nik: '3674035411940003',
    address: 'Jl. Bintaro Utama 3A Blok DD No. 11, Tangerang Selatan',
  },
];

export const DEFAULT_EXTERNAL_LAWFIRM = {
  firmName: 'Kantor Hukum BAMS & Co. Advocates & Legal Consultants',
  advocateList:
    '1. Sobroni, S.H., M.H.; 2. Bambang Ariyanto, S.H., M.H.; 3. M. Ridwan, S.H.',
  firmAddress:
    'Gedung Sarinah Lt. 11 Suite 1108, Jl. M.H. Thamrin No. 11, Gondangdia, Menteng, Jakarta Pusat',
  firmEmail: 'litigation@bamslawfirm.co.id',
};

export const KUASA_PRESETS: Record<PowerOfAttorneyType, ForumPresetConfig> = {
  aanmaning: {
    label: 'SK & ST Aanmaning (Teguran Eksekusi Pengadilan Negeri)',
    shortBadge: 'Aanmaning · Pasal 196 HIR',
    subtitle:
      'Susunan Standar SK & ST Korporasi Menghadap Aanmaning Perkara Eksekusi Jo. Putusan Pengadilan Negeri',
    legalBasis:
      'Pasal 196 & Pasal 197 HIR (Pasal 207 RBg) jo. Pasal 1795 KUHPerdata & SEMA No. 6 Tahun 1994',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Termohon Eksekusi / Pemohon Eksekusi',
    defaultScope:
      'Bertindak untuk dan atas nama Pemberi Kuasa untuk menghadap di Pengadilan Negeri dalam agenda Aanmaning (Teguran) sehubungan dengan Perkara Eksekusi Jo. Putusan Pengadilan Negeri antara Pemohon Eksekusi melawan Termohon Eksekusi',
    defaultAuthorityBullets: [
      'Menghadap Ketua Pengadilan Negeri, Panitera, Juru Sita, maupun pejabat peradilan yang berwenang dalam sidang teguran (Aanmaning);',
      'Menyampaikan keterangan, penjelasan, tanggapan, klarifikasi, dan/atau keberatan hukum sehubungan dengan pelaksanaan Aanmaning atas Putusan Pengadilan Negeri;',
      'Mengajukan, menyerahkan, menerima, serta menandatangani surat-surat, permohonan, tanggapan tertulis, daftar hadir, maupun Berita Acara Aanmaning;',
      'Melakukan segala tindakan hukum lain yang diperlukan dan dibenarkan oleh ketentuan hukum acara perdata demi membela dan melindungi hak serta kepentingan hukum Pemberi Kuasa.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas untuk hadir dan menghadap di Pengadilan Negeri dalam agenda Aanmaning sehubungan dengan Perkara Eksekusi Jo. Putusan Pengadilan Negeri, serta menyampaikan keterangan dan menandatangani berita acara yang diperlukan.',
    defaultOpponentOrTarget: 'Sdr. Hendra Gunawan (Pemohon Eksekusi)',
    defaultCourtOrForum: 'Pengadilan Negeri Jakarta Selatan',
    defaultCaseNumber:
      'Perkara Eksekusi Nomor: 42/Pdt.Eks/2025/PN Jkt.Sel Jo. Putusan Nomor: 218/Pdt.G/2024/PN Jkt.Sel',
    defaultClaimValue: 'Rp 680.000.000,- (enam ratus delapan puluh juta Rupiah)',
    defaultPleadingTitle: 'TANGGAPAN RESMI & PENJELASAN HUKUM DALAM AGENDA AANMANING',
    defaultPositaSummary:
      'Bahwa berdasarkan Relaas Panggilan Aanmaning (Teguran) Nomor 42/Pdt.Eks/2025/PN Jkt.Sel, Ketua Pengadilan Negeri telah memanggil Para Pihak guna pelaksanaan teguran pemenuhan isi putusan sesuai Pasal 196 HIR.',
    defaultPetitumSummary:
      'Menerima kehadiran dan tanggapan resmi Termohon/Pemohon Eksekusi dalam Berita Acara Aanmaning sesuai ketentuan hukum acara perdata yang berlaku.',
  },
  bpsk: {
    label: 'SK & ST BPSK (Badan Penyelesaian Sengketa Konsumen)',
    shortBadge: 'BPSK · Pasal 45 UU No. 8/1999',
    subtitle:
      'Susunan Standar SK & ST Korporasi Menghadap Pengaduan Konsumen & Eksepsi Kompetensi di BPSK',
    legalBasis:
      'Pasal 45 ayat (1) & Pasal 52 UU No. 8 Tahun 1999 tentang Perlindungan Konsumen jo. Permendag No. 72 Tahun 2020',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Pelaku Usaha / Teradu',
    defaultScope:
      'Bertindak untuk dan atas nama Pemberi Kuasa sehubungan dengan adanya pengaduan konsumen di Badan Penyelesaian Sengketa Konsumen (BPSK), dimana Pemberi Kuasa dan konsumen tersebut tidak memiliki hubungan hukum kontraktual langsung maupun tidak memenuhi unsur sengketa konsumen sebagaimana dimaksud dalam Pasal 45 ayat (1) Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen',
    defaultAuthorityBullets: [
      'Menghadap Ketua, Majelis, dan/atau Sekretariat Badan Penyelesaian Sengketa Konsumen (BPSK) guna memberikan penjelasan dan klarifikasi hukum;',
      'Menyampaikan Surat Jawaban, tanggapan tertulis, serta eksepsi/keberatan mengenai kewenangan mengadili (kompetensi absolut dan relatif) BPSK;',
      'Menyatakan keberatan dan menolak pemilihan forum penyelesaian sengketa melalui BPSK apabila tidak didasarkan pada kesepakatan tertulis para pihak sesuai ketentuan Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen;',
      'Menyerahkan bukti-bukti surat, dokumen pendukung, menandatangani daftar hadir maupun berita acara sidang/klarifikasi di BPSK.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas untuk hadir, menghadap, dan menyampaikan klarifikasi serta tanggapan resmi di Badan Penyelesaian Sengketa Konsumen (BPSK) sehubungan dengan pengaduan konsumen yang ditujukan kepada Pemberi Tugas.',
    defaultOpponentOrTarget: 'Sdr. Dedi Kurniawan (Konsumen Pengadu di BPSK)',
    defaultCourtOrForum: 'Badan Penyelesaian Sengketa Konsumen (BPSK) Kota Bandung',
    defaultCaseNumber: 'Nomor Registrasi Pengaduan: 089/P-BPSK/VIII/2025',
    defaultClaimValue: 'Rp 125.000.000,- (seratus dua puluh lima juta Rupiah)',
    defaultPleadingTitle: 'SURAT TANGGAPAN & KEBERATAN KOMPETENSI PADA BPSK',
    defaultPositaSummary:
      'Bahwa pengaduan yang diajukan di BPSK tidak memenuhi syarat kompetensi absolut/relatif BPSK sebagaimana diatur dalam Pasal 45 ayat (1) UU No. 8 Tahun 1999 tentang Perlindungan Konsumen serta klausul pilihan forum dalam perjanjian.',
    defaultPetitumSummary:
      'Menyatakan Badan Penyelesaian Sengketa Konsumen (BPSK) tidak berwenang memeriksa dan memutus pengaduan konsumen tersebut atau menolak pengaduan untuk seluruhnya.',
  },
  laps_sjk: {
    label: 'SK & ST LAPS SJK (Lembaga Alternatif Penyelesaian Sengketa SJK)',
    shortBadge: 'LAPS SJK · POJK 61/2020',
    subtitle:
      'Susunan Standar SK & ST Korporasi Proses Mediasi melalui LAPS Sektor Jasa Keuangan (Format Resmi LAPS-SJK-M)',
    legalBasis:
      'POJK No. 61/POJK.07/2020 tentang LAPS SJK jo. Peraturan LAPS SJK tentang Prosedur Mediasi',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Pelaku Usaha Jasa Keuangan (PUJK) / Termohon',
    defaultScope:
      'Bertindak untuk dan atas nama Pemberi Kuasa dalam proses Mediasi melalui Lembaga Alternatif Penyelesaian Sengketa Sektor Jasa Keuangan (LAPS SJK) sehubungan dengan pengaduan konsumen pada Sektor Jasa Keuangan',
    defaultAuthorityBullets: [
      'Menghadiri dan mengikuti proses pertemuan mediasi yang diselenggarakan oleh LAPS SJK;',
      'Menyampaikan dan menerima keterangan, penjelasan, maupun klarifikasi sehubungan dengan permasalahan yang dimediasikan;',
      'Mengajukan serta menanggapi usulan penyelesaian secara musyawarah untuk mencapai kesepakatan bersama;',
      'Menyusun, menandatangani, dan menerima kesepakatan perdamaian atau berita acara hasil mediasi sesuai dengan ketentuan LAPS SJK, dengan persetujuan tertulis terlebih dahulu dari Pemberi Kuasa;',
      'Melakukan tindakan-tindakan lain yang diperlukan dan berkaitan langsung dengan pelaksanaan proses mediasi dimaksud sepanjang tidak bertentangan dengan ketentuan hukum yang berlaku dan kebijakan LAPS SJK.',
    ],
    defaultSuratTugasUntuk:
      'Bertindak untuk dan atas nama Pemberi Tugas dalam proses Mediasi melalui Lembaga Alternatif Penyelesaian Sengketa Sektor Jasa Keuangan (LAPS SJK), termasuk menghadiri pertemuan mediasi, menyampaikan dan menerima klarifikasi, mengajukan/menanggapi usulan penyelesaian secara musyawarah, serta menandatangani berita acara hasil mediasi dengan persetujuan tertulis terlebih dahulu dari Pemberi Tugas.',
    defaultOpponentOrTarget: 'Sdr. Wahyu Hidayat (Pemohon Mediasi LAPS SJK)',
    defaultCourtOrForum:
      'Lembaga Alternatif Penyelesaian Sengketa Sektor Jasa Keuangan (LAPS SJK) — Jakarta',
    defaultCaseNumber: 'Nomor Registrasi: LAPS-SJK-M-2025.08.0314',
    defaultClaimValue: 'Rp 350.000.000,- (tiga ratus lima puluh juta Rupiah)',
    defaultPleadingTitle: 'TANGGAPAN & RESUME MEDIASI PADA LAPS SJK',
    defaultPositaSummary:
      'Bahwa sehubungan dengan pengaduan Nomor Registrasi LAPS-SJK-M-2025.08.0314 pada LAPS SJK, Pemberi Kuasa selaku PUJK telah melaksanakan seluruh prosedur pelayanan dan penyelesaian pengaduan sesuai POJK Perlindungan Konsumen.',
    defaultPetitumSummary:
      'Mencapai kesepakatan perdamaian yang proporsional dalam forum Mediasi LAPS SJK sesuai ketentuan peraturan perundang-undangan sektor jasa keuangan.',
  },
  mediasi_pn: {
    label: 'SK & ST Mediasi Pengadilan Negeri (Pasal 18 ayat (4) PERMA 1/2016)',
    shortBadge: 'Mediasi PN · PERMA No. 1/2016',
    subtitle:
      'Susunan Standar SK Khusus & ST Menghadap Hakim Mediator di Pengadilan Negeri',
    legalBasis:
      'Pasal 18 ayat (4) Peraturan Mahkamah Agung RI Nomor 1 Tahun 2016 tentang Prosedur Mediasi di Pengadilan',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Tergugat / Tergugat II',
    defaultScope:
      'Bertindak untuk dan atas nama Pemberi Kuasa selaku Prinsipal dalam proses Mediasi Perkara Perdata di Pengadilan Negeri berdasarkan ketentuan Pasal 18 ayat (4) Peraturan Mahkamah Agung Republik Indonesia Nomor 1 Tahun 2016 tentang Prosedur Mediasi di Pengadilan',
    defaultAuthorityBullets: [
      'Menghadap Hakim Mediator yang ditunjuk dalam Perkara Perdata pada Pengadilan Negeri guna mewakili Pemberi Kuasa dalam setiap pertemuan mediasi;',
      'Menyusun, menyerahkan, dan menerima Resume Perkara maupun usulan perdamaian dalam proses mediasi;',
      'Melakukan perundingan, menyampaikan penjelasan, serta menanggapi usulan penyelesaian sengketa dengan itikad baik;',
      'Menandatangani Kesepakatan Perdamaian atau Berita Acara Mediasi setelah memperoleh persetujuan tertulis terlebih dahulu dari Pemberi Kuasa.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas untuk hadir dan menghadap Hakim Mediator dalam agenda Mediasi Perkara Perdata di Pengadilan Negeri berdasarkan PERMA Nomor 1 Tahun 2016.',
    defaultOpponentOrTarget: 'Sdr. Agus Setiawan (Penggugat)',
    defaultCourtOrForum: 'Pengadilan Negeri Jakarta Pusat',
    defaultCaseNumber: 'Perkara Perdata Nomor: 315/Pdt.G/2025/PN Jkt.Pst',
    defaultClaimValue: 'Rp 500.000.000,- (lima ratus juta Rupiah)',
    defaultPleadingTitle: 'RESUME PERKARA & USULAN PERDAMAIAN MEDIASI',
    defaultPositaSummary:
      'Bahwa dalam rangka pelaksanaan Mediasi sesuai PERMA No. 1 Tahun 2016 pada Perkara Nomor 315/Pdt.G/2025/PN Jkt.Pst, pihak Prinsipal memberikan kuasa khusus mediasi untuk menempuh penyelesaian damai.',
    defaultPetitumSummary:
      'Menerima Resume Mediasi dan mencatat kehadiran sah Kuasa Mediasi berdasarkan Pasal 18 ayat (4) PERMA No. 1 Tahun 2016.',
  },
  gugatan_sederhana: {
    label: 'SK, ST & Gugatan Sederhana (Small Claims Court ≤ Rp 500 Juta)',
    shortBadge: 'Gugatan Sederhana · PERMA 4/2019',
    subtitle:
      'Susunan Standar SK, ST & Gugatan Sederhana (PERMA No. 2 Tahun 2015 jo. PERMA No. 4 Tahun 2019)',
    legalBasis:
      'PERMA No. 2 Tahun 2015 jo. PERMA No. 4 Tahun 2019 tentang Tata Cara Penyelesaian Gugatan Sederhana',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Tergugat / Penggugat',
    defaultScope:
      'Untuk dan atas nama Pemberi Kuasa mendampingi dan/atau mewakili Pemberi Kuasa dalam Perkara Gugatan Sederhana di Pengadilan Negeri berdasarkan Peraturan Mahkamah Agung RI Nomor 2 Tahun 2015 juncto Peraturan Mahkamah Agung RI Nomor 4 Tahun 2019 tentang Tata Cara Penyelesaian Gugatan Sederhana',
    defaultAuthorityBullets: [
      'Menghadap Hakim Tunggal, Panitera Pengganti, dan Juru Sita pada Pengadilan Negeri dalam seluruh tahapan persidangan Gugatan Sederhana;',
      'Mengajukan atau menanggapi Gugatan Sederhana, Jawaban, bukti-bukti surat yang telah bermeterai cukup (nazegelen), serta saksi dan/atau ahli;',
      'Menghadiri upaya perdamaian di hadapan Hakim Tunggal serta menandatangani Akta Perdamaian dengan persetujuan tertulis dari Pemberi Kuasa;',
      'Menerima Putusan Gugatan Sederhana, mengajukan atau menanggapi Permohonan Keberatan beserta Memori/Kontra Memori Keberatan dalam tenggang waktu 7 (tujuh) hari kerja sesuai PERMA No. 4 Tahun 2019.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili dan/atau mendampingi Pemberi Tugas dalam menghadiri persidangan Perkara Gugatan Sederhana di Pengadilan Negeri sampai dengan selesainya pemeriksaan perkara.',
    defaultOpponentOrTarget: 'CV Mitra Distribusi Mandiri',
    defaultCourtOrForum: 'Pengadilan Negeri Jakarta Selatan',
    defaultCaseNumber: 'Perkara Gugatan Sederhana Nomor: 58/Pdt.G.S/2025/PN Jkt.Sel',
    defaultClaimValue: 'Rp 385.000.000,- (tiga ratus delapan puluh lima juta Rupiah)',
    defaultPleadingTitle: 'SURAT GUGATAN SEDERHANA / JAWABAN GUGATAN SEDERHANA (PERMA 4/2019)',
    defaultPositaSummary:
      'Bahwa Penggugat dan Tergugat memiliki domisili hukum pada wilayah hukum Pengadilan yang sama, serta nilai gugatan materiil adalah sebesar Rp 385.000.000,- (tidak lebih dari Rp 500.000.000,-), sehingga memenuhi syarat formil pemeriksaan Gugatan Sederhana sesuai PERMA No. 4 Tahun 2019.',
    defaultPetitumSummary:
      '1. Mengabulkan Gugatan Sederhana/Jawaban untuk seluruhnya; 2. Menyatakan hukum atas hubungan perikatan para pihak; 3. Menghukum pihak lawan membayar biaya perkara.',
  },
  gugatan_perdata: {
    label: 'SK, ST & Gugatan Perdata Biasa (PMH / Wanprestasi PN)',
    shortBadge: 'Gugatan Perdata · Pasal 118 HIR',
    subtitle:
      'Susunan Standar SK Khusus Advokat / In-House Legal & ST Perkara Perdata (Wanprestasi / Perbuatan Melawan Hukum)',
    legalBasis:
      'Pasal 118 HIR / Pasal 142 RBg, Pasal 1795 KUHPerdata, UU No. 18 Tahun 2003 tentang Advokat & SEMA No. 6 Tahun 1994',
    defaultRecipientStyle: 'external_lawfirm',
    defaultPartyPosition: 'Tergugat I / Tergugat II / Penggugat',
    defaultScope:
      'Untuk dan atas nama Pemberi Kuasa mendampingi dan/atau mewakili Pemberi Kuasa dalam Perkara Perdata perihal Gugatan Perbuatan Melawan Hukum / Wanprestasi di Pengadilan Negeri',
    defaultAuthorityBullets: [
      'Menghadap di muka Pengadilan Negeri, Pengadilan Tinggi, Mahkamah Agung Republik Indonesia, Badan-Badan Kehakiman lain, serta instansi-instansi pemerintah maupun swasta terkait;',
      'Menghadiri persidangan-persidangan baik secara langsung maupun melalui sistem e-Court, mengikuti proses Mediasi, mengajukan dan menandatangani Eksepsi, Jawaban, Gugatan Rekonvensi, Replik, Duplik, Daftar Bukti Surat, menghadirkan Saksi-Saksi maupun Ahli, serta mengajukan Kesimpulan (Konklusi);',
      'Memohon atau menolak peletakan Sita Jaminan (Conservatoir Beslag / Revindicatoir Beslag) maupun tuntutan putusan serta-merta (Uitvoerbaar bij Voorraad);',
      'Menerima atau menolak putusan, menyatakan upaya hukum Banding, Kasasi, maupun Peninjauan Kembali (PK), serta menyusun, menandatangani, dan menyerahkan Memori/Kontra Memori Banding, Kasasi, maupun PK;',
      'Melakukan segala tindakan hukum yang dianggap perlu, penting, dan berguna bagi kepentingan hukum Pemberi Kuasa sesuai peraturan perundang-undangan yang berlaku.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili dan mendampingi Pemberi Tugas dalam seluruh rangkaian persidangan Perkara Perdata Gugatan Perbuatan Melawan Hukum / Wanprestasi di Pengadilan Negeri.',
    defaultOpponentOrTarget: 'Sdr. Ahmad Fauzi (Penggugat) Lawan PT Caturnusa Sejahtera Finance',
    defaultCourtOrForum: 'Pengadilan Negeri Jakarta Selatan',
    defaultCaseNumber: 'Perkara Perdata Nomor: 412/Pdt.G/2025/PN Jkt.Sel',
    defaultClaimValue: 'Rp 1.450.000.000,- (satu miliar empat ratus lima puluh juta Rupiah)',
    defaultPleadingTitle: 'SURAT GUGATAN / JAWABAN DAN EKSEPSI PERKARA PERDATA',
    defaultPositaSummary:
      'Bahwa sehubungan dengan Perkara Perdata Nomor 412/Pdt.G/2025/PN Jkt.Sel perihal Gugatan Perbuatan Melawan Hukum / Wanprestasi, Pemberi Kuasa memiliki dasar hukum yang sah dan alat bukti otentik atas pelaksanaan perjanjian.',
    defaultPetitumSummary:
      'DALAM EKSEPSI: Menerima eksepsi untuk seluruhnya. DALAM POKOK PERKARA: Menolak gugatan lawan untuk seluruhnya atau setidak-tidaknya menyatakan gugatan tidak dapat diterima (Niet Ontvankelijke Verklaard).',
  },
  pkpu_niaga: {
    label: 'SK & ST Perkara PKPU / Kepailitan (Pengadilan Niaga)',
    shortBadge: 'PKPU & Niaga · UU No. 37/2004',
    subtitle:
      'Susunan Standar SK Khusus Kolaborasi In-House Legal & Law Firm Eksternal pada Pengadilan Niaga',
    legalBasis:
      'UU No. 37 Tahun 2004 tentang Kepailitan dan Penundaan Kewajiban Pembayaran Utang (PKPU)',
    defaultRecipientStyle: 'hybrid_pkpu',
    defaultPartyPosition: 'Pemohon PKPU / Termohon PKPU / Kreditor',
    defaultScope:
      'Untuk dan atas nama Pemberi Kuasa mewakili dan mendampingi Pemberi Kuasa dalam Perkara Penundaan Kewajiban Pembayaran Utang (PKPU) / Kepailitan pada Pengadilan Niaga',
    defaultAuthorityBullets: [
      'Menghadap Majelis Hakim Pengadilan Niaga, Hakim Pengawas, Tim Pengurus PKPU / Kurator, serta Panitera pada Pengadilan Niaga;',
      'Mengajukan permohonan/tanggapan PKPU, mendaftarkan dan mencocokkan tagihan dalam Rapat Verifikasi Tagihan Pajak dan Kreditor;',
      'Menghadiri Rapat Kreditor, mengajukan atau membahas Rencana Perdamaian (Composition Plan), serta menggunakan hak suara (voting) dalam pemungutan suara atas Rencana Perdamaian;',
      'Menandatangani surat-surat, akta-akta, berita acara rapat kreditor, serta melakukan segala tindakan hukum sesuai UU No. 37 Tahun 2004 tentang Kepailitan dan PKPU.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas untuk hadir dalam persidangan Pengadilan Niaga serta Rapat Kreditor dan Verifikasi Tagihan di hadapan Hakim Pengawas dan Tim Pengurus PKPU.',
    defaultOpponentOrTarget: 'PT Mitra Properti Nusantara (Dalam PKPU)',
    defaultCourtOrForum: 'Pengadilan Niaga pada Pengadilan Negeri Jakarta Pusat',
    defaultCaseNumber: 'Perkara PKPU Nomor: 128/Pdt.Sus-PKPU/2025/PN.Niaga.Jkt.Pst',
    defaultClaimValue: 'Rp 4.250.000.000,- (empat miliar dua ratus lima puluh juta Rupiah)',
    defaultPleadingTitle: 'PENGAJUAN TAGIHAN KREDITOR / TANGGAPAN PERKARA PKPU',
    defaultPositaSummary:
      'Bahwa berdasarkan Putusan PKPU Sementara Pengadilan Niaga pada Pengadilan Negeri Jakarta Pusat, Pemberi Kuasa memiliki tagihan yang telah jatuh tempo dan dapat ditagih sesuai UU No. 37 Tahun 2004.',
    defaultPetitumSummary:
      'Menerima dan mengakui seluruh nilai tagihan Kreditor dalam Daftar Piutang Tetap yang disahkan oleh Hakim Pengawas.',
  },
  non_litigasi: {
    label: 'Non-Litigasi, Somasi & Mediasi Bipartit',
    shortBadge: 'Non-Litigasi & Somasi',
    subtitle: 'Perwakilan Somasi, Mediasi Bipartit, Uji Tuntas & Penyelesaian di Luar Pengadilan',
    legalBasis: 'Pasal 1792 KUHPerdata jo. UU No. 18 Tahun 2003 tentang Advokat',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Pemberi Kuasa',
    defaultScope:
      'Bertindak untuk dan atas nama Pemberi Kuasa dalam melakukan perundingan penyelesaian kewajiban kontrak, melayangkan Surat Teguran Hukum (Somasi I, II, dan III), melakukan verifikasi dokumen tagihan, dan menyusun Kesepakatan Perdamaian',
    defaultAuthorityBullets: [
      'Menyusun, menandatangani, dan mengirimkan Surat Teguran Hukum (Somasi Pertama, Kedua, dan Ketiga);',
      'Menghadiri pertemuan klarifikasi dan negosiasi bipartit dengan pihak lawan;',
      'Menyusun draf Kesepakatan Perdamaian (Settlement Agreement) dengan persetujuan tertulis terlebih dahulu dari Pemberi Kuasa.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas dalam pelaksanaan klarifikasi, negosiasi bipartit, dan penyerahan Surat Teguran Hukum (Somasi).',
    defaultOpponentOrTarget: 'Mitra Usaha / Debitur Terkait',
    defaultCourtOrForum: 'Domisili Hukum Jakarta Selatan',
    defaultCaseNumber: 'Ref. No. 024/SOM-LGL/IX/2026',
    defaultClaimValue: 'Rp 475.000.000,- (empat ratus tujuh puluh lima juta Rupiah)',
    defaultPleadingTitle: 'SURAT TEGURAN HUKUM (SOMASI) DAN UNDANGAN KLARIFIKASI BIPARTIT',
    defaultPositaSummary:
      'Bahwa berdasarkan rekonsiliasi kewajiban kontrak yang telah jatuh tempo, Pihak Terkait belum menyelesaikan pembayaran kewajiban pokok.',
    defaultPetitumSummary:
      'Meminta Pihak Terkait melunasi seluruh kewajiban paling lambat 7 (tujuh) Hari Kalender sejak tanggal Surat Teguran ini.',
  },
  korporasi_rups: {
    label: 'Korporasi, RUPS & Perizinan OSS',
    shortBadge: 'Korporasi & RUPS',
    subtitle: 'Perwakilan Pemegang Saham / Direksi dalam RUPS, Notaris & Instansi Pemerintah',
    legalBasis: 'Pasal 85 UU No. 40 Tahun 2007 tentang Perseroan Terbatas & Pasal 1792 KUHPerdata',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Pemegang Saham / Direksi',
    defaultScope:
      'Mewakili Pemberi Kuasa untuk hadir, mengeluarkan suara yang sah dalam Rapat Umum Pemegang Saham (RUPS), menandatangani Akta Pernyataan Keputusan Rapat di hadapan Notaris, serta mengurus perizinan berusaha berbasis risiko (OSS RBA)',
    defaultAuthorityBullets: [
      'Menghadiri Rapat Umum Pemegang Saham (RUPS) dan menggunakan hak suara atas seluruh saham milik Pemberi Kuasa;',
      'Menghadap Notaris untuk menandatangani Akta Pernyataan Keputusan Rapat (PKR) dan dokumen administrasi AHU.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas untuk hadir dalam Rapat Umum Pemegang Saham (RUPS) dan pengurusan akta korporasi di hadapan Notaris.',
    defaultOpponentOrTarget: 'Notaris & Kementerian Hukum / Instansi OSS',
    defaultCourtOrForum: 'Jakarta Selatan',
    defaultCaseNumber: 'Agenda RUPSLB / Akta PKR Tahun 2026',
    defaultClaimValue: 'Kepemilikan Saham & Kepatuhan Korporasi',
    defaultPleadingTitle: 'RISALAH MANDAT SUARA PEMEGANG SAHAM DALAM RUPS',
    defaultPositaSummary:
      'Bahwa Pemegang Saham menunjuk Kuasa/Utusan resmi berdasarkan Pasal 85 UU Perseroan Terbatas.',
    defaultPetitumSummary:
      'Mengeluarkan hak suara menyetujui mata acara RUPS dan menandatangani daftar hadir serta berita acara rapat.',
  },
  perbankan_aset: {
    label: 'Pengurusan Aset, Perbankan & Eksekusi Jaminan',
    shortBadge: 'Perbankan & Aset',
    subtitle: 'Pengurusan Dokumen Perbankan, Lelang Hak Tanggungan/Fidusia & Penagihan',
    legalBasis: 'Pasal 1792, Pasal 1795 & Pasal 1796 KUHPerdata jo. UU Hak Tanggungan / Fidusia',
    defaultRecipientStyle: 'inhouse_corporate',
    defaultPartyPosition: 'Kreditor / Pemegang Jaminan',
    defaultScope:
      'Mewakili Pemberi Kuasa untuk mengurus administrasi perbankan, KPKNL, BPN, menerima pembayaran tagihan, menandatangani Berita Acara Serah Terima Dokumen Aset, serta melakukan pencocokan saldo/rekonsiliasi',
    defaultAuthorityBullets: [
      'Menghadap pejabat perbankan, Kantor Pelayanan Kekayaan Negara dan Lelang (KPKNL), serta Badan Pertanahan Nasional (BPN);',
      'Mengajukan permohonan pendaftaran atau penghapusan (roya) jaminan Fidusia / Hak Tanggungan serta menerima warkat asli.',
    ],
    defaultSuratTugasUntuk:
      'Mewakili Pemberi Tugas dalam pengurusan administrasi jaminan, lelang KPKNL, dan serah terima dokumen aset.',
    defaultOpponentOrTarget: 'Lembaga Perbankan / KPKNL / BPN Terkait',
    defaultCourtOrForum: 'Wilayah Hukum Jakarta Pusat',
    defaultCaseNumber: 'Berkas Agunan & Rekonsiliasi No. 119/AST/2026',
    defaultClaimValue: 'Rp 950.000.000,- (sembilan ratus lima puluh juta Rupiah)',
    defaultPleadingTitle: 'PERMOHONAN PENGURUSAN DOKUMEN ASET & REKONSILIASI PERBANKAN',
    defaultPositaSummary:
      'Bahwa Pemberi Kuasa memerlukan penyelesaian administrasi warkat perbankan, roya/pencoretan jaminan, serta verifikasi dokumen aset secara sah.',
    defaultPetitumSummary:
      'Memproses penyerahan warkat asli dan menyelesaikan pencatatan administrasi aset sesuai ketentuan hukum yang berlaku.',
  },
};

export interface BuildOfficialSkStOptions {
  kuasaType: PowerOfAttorneyType;
  docMode: DocumentBuildMode;
  recipientStyle: RecipientTemplateStyle;
  clientEntityType: PartyEntityType;
  companyName: string;
  directorName: string;
  directorTitle: string;
  directorNik: string;
  directorAddress: string;
  companyCity: string;
  companyAddress: string;
  deedIncorporation: string;
  deedLatestAmendment: string;
  inhouseRecipients: CorporateRecipientPerson[];
  attorneyFirm: string;
  attorneyNames: string;
  attorneyAddress: string;
  attorneyEmail: string;
  partyPosition: string;
  opponentOrTarget: string;
  courtOrForum: string;
  caseNumber: string;
  claimValue: string;
  scopeDescription: string;
  positaSummary?: string;
  petitumSummary?: string;
  signingCity: string;
  effectiveDate?: string;
  includeSubstitusi: boolean;
  includeRetensi: boolean;
  includePriorApprovalClause: boolean;
}

/**
 * Generates a LegalDocument strictly following the corporate SK & ST layout from the uploaded reference PDFs:
 * - Komparisi Pemberi Kuasa (Direktur + Akta Pendirian & SK Kemenkumham + Akta Perubahan Terakhir & AHU)
 * - Komparisi Penerima Kuasa (Daftar Bernomor Nama, Jabatan, No. KTP, Alamat KTP untuk Karyawan Internal ATAU Advokat Kantor Hukum)
 * - Bagian KHUSUS (Pokok Pemberian Kuasa & Rincian Wewenang Hukum sesuai Aanmaning / BPSK / LAPS SJK / Mediasi / Gugatan Sederhana / Gugatan Perdata / PKPU)
 * - Bagian SURAT TUGAS (Nomor Surat Tugas, Pemberi Tugas, Penerima Tugas, UNTUK, Penutup)
 */
export function buildOfficialCorporateSkStDocument(
  opts: BuildOfficialSkStOptions
): LegalDocument {
  const preset = KUASA_PRESETS[opts.kuasaType] || KUASA_PRESETS.aanmaning;
  const todayStr = opts.effectiveDate || '30 September 2026';
  const docId = `doc-skst-${Date.now()}`;
  const randomReg = Math.floor(100 + Math.random() * 899);

  // Build Grantor (Pemberi Kuasa / Pemberi Tugas) exact corporate komparisi paragraph
  const buildGrantorKomparisi = (designation: 'Pemberi Kuasa' | 'Pemberi Tugas') => {
    if (opts.clientEntityType === 'Individu') {
      return `${opts.directorName}, Warga Negara Indonesia, pemegang Kartu Tanda Penduduk (KTP) Nomor: ${opts.directorNik}, bertempat tinggal di ${opts.directorAddress}, dalam hal ini bertindak untuk dan atas nama diri sendiri, selanjutnya disebut sebagai "${designation}".`;
    }
    return `${opts.directorName}, Warga Negara Indonesia, pemegang Kartu Tanda Penduduk (KTP) Nomor: ${opts.directorNik}, bertempat tinggal di ${opts.directorAddress}, dalam hal ini bertindak dalam jabatannya selaku ${opts.directorTitle} dari dan karenanya sah bertindak untuk dan atas nama ${opts.companyName}, suatu perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia, berkedudukan di ${opts.companyCity} dan beralamat di ${opts.companyAddress}, yang Anggaran Dasarnya dimuat dalam ${opts.deedIncorporation}, serta telah mengalami beberapa kali perubahan, dengan perubahan terakhir dimuat dalam ${opts.deedLatestAmendment}. Selanjutnya disebut sebagai "${designation}".`;
  };

  // Build Recipient (Penerima Kuasa / Penerima Tugas) exact list & closing paragraph
  const buildRecipientKomparisi = (designation: 'Penerima Kuasa' | 'Penerima Tugas') => {
    const formattedInhouseList = opts.inhouseRecipients
      .map(
        (person, idx) =>
          `${idx + 1}. Nama : ${person.name} | Jabatan : ${person.title} | No. KTP : ${person.nik} | Alamat KTP : ${person.address}`
      )
      .join('\n');

    if (opts.recipientStyle === 'external_lawfirm') {
      return `Dengan ini memberikan ${designation === 'Penerima Tugas' ? 'tugas' : 'kuasa'} kepada:\n${opts.attorneyNames}\nKesemuanya adalah Warga Negara Indonesia, Pekerjaan Advokat dan Konsultan Hukum pada ${opts.attorneyFirm}, beralamat di ${opts.attorneyAddress}, alamat email: ${opts.attorneyEmail}, baik secara bersama-sama maupun sendiri-sendiri, yang selanjutnya disebut sebagai "${designation}".`;
    }

    if (opts.recipientStyle === 'hybrid_pkpu') {
      return `Dengan ini memberikan ${designation === 'Penerima Tugas' ? 'tugas' : 'kuasa'} kepada:\nI. Tim Kuasa Hukum Internal (${opts.companyName}):\n${formattedInhouseList}\nII. Tim Advokat & Konsultan Hukum pada ${opts.attorneyFirm} (${opts.attorneyAddress}):\n${opts.attorneyNames}\nUntuk bertindak baik secara bersama-sama maupun sendiri-sendiri, yang selanjutnya disebut sebagai "${designation}".`;
    }

    return `Dengan ini memberikan ${designation === 'Penerima Tugas' ? 'tugas' : 'kuasa'} kepada:\n${formattedInhouseList}\nKesemuanya berkewarganegaraan Indonesia dan merupakan karyawan pada ${opts.companyName}, berkantor di ${opts.companyAddress}, untuk bertindak baik secara sendiri-sendiri maupun bersama-sama, yang selanjutnya disebut sebagai "${designation}".`;
  };

  const recipientRepresentativeSummary =
    opts.recipientStyle === 'external_lawfirm'
      ? opts.attorneyNames
      : opts.recipientStyle === 'hybrid_pkpu'
      ? `${opts.inhouseRecipients.map((r, i) => `${i + 1}. ${r.name} (${r.title})`).join('; ')}; & ${opts.attorneyNames}`
      : opts.inhouseRecipients
          .map((r, idx) => `${idx + 1}. ${r.name} (${r.title})`)
          .join('; ');

  const recipientPartyName =
    opts.recipientStyle === 'external_lawfirm'
      ? opts.attorneyFirm
      : opts.recipientStyle === 'hybrid_pkpu'
      ? `Tim Legal ${opts.companyName} & ${opts.attorneyFirm}`
      : `Tim Kuasa / Karyawan ${opts.companyName}`;

  // Construct KHUSUS narrative matching each PDF template
  const buildKhususNarrative = (): string => {
    if (opts.kuasaType === 'aanmaning') {
      return `Bertindak untuk dan atas nama Pemberi Kuasa untuk menghadap di ${opts.courtOrForum} dalam agenda Aanmaning (Teguran) sehubungan dengan ${opts.caseNumber} antara ${opts.opponentOrTarget} dengan ${opts.companyName} selaku ${opts.partyPosition}.`;
    }
    if (opts.kuasaType === 'bpsk') {
      return `Bertindak untuk dan atas nama Pemberi Kuasa sehubungan dengan adanya pengaduan konsumen di ${opts.courtOrForum} dengan ${opts.caseNumber} yang diajukan oleh ${opts.opponentOrTarget} terhadap Pemberi Kuasa, dimana Pemberi Kuasa dan konsumen tersebut tidak memiliki hubungan hukum kontraktual langsung maupun tidak memenuhi unsur sengketa konsumen sebagaimana dimaksud dalam Pasal 45 ayat (1) Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen, termasuk menyatakan keberatan dan menolak pemilihan forum penyelesaian sengketa melalui BPSK.`;
    }
    if (opts.kuasaType === 'laps_sjk') {
      return `Bertindak untuk dan atas nama Pemberi Kuasa dalam proses Mediasi melalui ${opts.courtOrForum} sehubungan dengan pengaduan dengan ${opts.caseNumber} antara ${opts.opponentOrTarget} dengan Pemberi Kuasa.`;
    }
    if (opts.kuasaType === 'mediasi_pn') {
      return `Bertindak untuk dan atas nama Pemberi Kuasa selaku Prinsipal (${opts.partyPosition}) untuk menghadap Hakim Mediator dalam proses Mediasi ${opts.caseNumber} pada ${opts.courtOrForum} berhadapan dengan ${opts.opponentOrTarget}, berdasarkan ketentuan Pasal 18 ayat (4) Peraturan Mahkamah Agung Republik Indonesia Nomor 1 Tahun 2016 tentang Prosedur Mediasi di Pengadilan.`;
    }
    if (opts.kuasaType === 'gugatan_sederhana') {
      return `Untuk dan atas nama Pemberi Kuasa mendampingi dan/atau mewakili Pemberi Kuasa selaku ${opts.partyPosition} dalam ${opts.caseNumber} perihal Gugatan Sederhana di ${opts.courtOrForum}, berhadapan dengan ${opts.opponentOrTarget}, berdasarkan Peraturan Mahkamah Agung RI Nomor 2 Tahun 2015 juncto Peraturan Mahkamah Agung RI Nomor 4 Tahun 2019 tentang Tata Cara Penyelesaian Gugatan Sederhana.`;
    }
    if (opts.kuasaType === 'gugatan_perdata') {
      return `Untuk dan atas nama Pemberi Kuasa mendampingi dan/atau mewakili Pemberi Kuasa selaku ${opts.partyPosition} dalam ${opts.caseNumber} perihal Gugatan Perbuatan Melawan Hukum / Wanprestasi di ${opts.courtOrForum}, berhadapan dengan ${opts.opponentOrTarget}.`;
    }
    if (opts.kuasaType === 'pkpu_niaga') {
      return `Untuk dan atas nama Pemberi Kuasa mewakili dan mendampingi Pemberi Kuasa selaku ${opts.partyPosition} dalam ${opts.caseNumber} pada ${opts.courtOrForum} sehubungan dengan proses Penundaan Kewajiban Pembayaran Utang (PKPU) / Kepailitan terhadap ${opts.opponentOrTarget}.`;
    }
    return `Bertindak untuk dan atas nama Pemberi Kuasa (${opts.companyName}) dalam rangka: ${opts.scopeDescription}, sehubungan dengan ${opts.caseNumber} pada ${opts.courtOrForum} berhadapan dengan ${opts.opponentOrTarget}.`;
  };

  // Construct SURAT TUGAS "UNTUK" narrative matching the uploaded PDFs
  const buildSuratTugasUntukNarrative = (): string[] => {
    if (opts.kuasaType === 'laps_sjk') {
      return [
        `(1) Bertindak untuk dan atas nama Pemberi Tugas dalam proses Mediasi melalui ${opts.courtOrForum} sehubungan dengan pengaduan dengan ${opts.caseNumber} antara ${opts.opponentOrTarget} dengan Pemberi Tugas.`,
        `(2) Untuk itu, Penerima Tugas diberikan tugas dan wewenang untuk:`,
        `- Menghadiri dan mengikuti proses pertemuan mediasi yang diselenggarakan oleh LAPS SJK;`,
        `- Menyampaikan dan menerima keterangan, penjelasan, maupun klarifikasi sehubungan dengan permasalahan yang dimediasikan;`,
        `- Mengajukan serta menanggapi usulan penyelesaian secara musyawarah untuk mencapai kesepakatan bersama;`,
        `- Menyusun, menandatangani, dan menerima kesepakatan perdamaian atau berita acara hasil mediasi sesuai dengan ketentuan LAPS SJK, dengan persetujuan tertulis terlebih dahulu dari Pemberi Tugas;`,
        `- Melakukan tindakan-tindakan lain yang diperlukan dan berkaitan langsung dengan pelaksanaan proses mediasi dimaksud sepanjang tidak bertentangan dengan ketentuan hukum yang berlaku dan kebijakan LAPS SJK.`,
        `(3) Surat Tugas ini diberikan dengan ketentuan bahwa setiap keputusan akhir yang bersifat mengikat Pemberi Tugas wajib memperoleh persetujuan tertulis terlebih dahulu dari Pemberi Tugas, dan berlaku sejak tanggal ditandatangani sampai dengan selesainya proses mediasi dimaksud.`,
      ];
    }
    if (opts.kuasaType === 'aanmaning') {
      return [
        `(1) Mewakili Pemberi Tugas untuk hadir dan menghadap di ${opts.courtOrForum} dalam agenda Aanmaning (Teguran) sehubungan dengan ${opts.caseNumber} antara ${opts.opponentOrTarget} dengan ${opts.companyName} selaku ${opts.partyPosition}.`,
        `(2) Menyampaikan keterangan, penjelasan, maupun tanggapan resmi kepada Ketua Pengadilan Negeri / Panitera, serta menerima dan menandatangani daftar hadir maupun Berita Acara Aanmaning.`,
        `(3) Demikian Surat Tugas ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`,
      ];
    }
    if (opts.kuasaType === 'bpsk') {
      return [
        `(1) Mewakili Pemberi Tugas untuk hadir dan menghadap di ${opts.courtOrForum} sehubungan dengan pengaduan konsumen dengan ${opts.caseNumber} yang diajukan oleh ${opts.opponentOrTarget}.`,
        `(2) Menyampaikan klarifikasi, surat tanggapan tertulis, serta keberatan mengenai kewenangan (kompetensi) BPSK berdasarkan Pasal 45 ayat (1) Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen.`,
        `(3) Demikian Surat Tugas ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`,
      ];
    }
    return [
      `(1) Mewakili dan/atau mendampingi Pemberi Tugas (${opts.companyName}) untuk hadir dan menghadap di ${opts.courtOrForum} sehubungan dengan ${opts.caseNumber} berhadapan dengan ${opts.opponentOrTarget}.`,
      `(2) ${preset.defaultSuratTugasUntuk}`,
      `(3) Surat Tugas ini berlaku sejak tanggal ditandatangani sampai dengan selesainya pelaksanaan penugasan dimaksud. Demikian Surat Tugas ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`,
    ];
  };

  const closingPowerParagraphs: string[] = [];
  if (opts.includePriorApprovalClause) {
    closingPowerParagraphs.push(
      `Surat Kuasa ini diberikan dengan ketentuan bahwa setiap keputusan akhir atau kesepakatan perdamaian yang bersifat mengikat Pemberi Kuasa wajib memperoleh persetujuan tertulis terlebih dahulu dari Pemberi Kuasa, dan berlaku sejak tanggal ditandatangani sampai dengan selesainya proses penanganan perkara dimaksud.`
    );
  }
  if (opts.includeSubstitusi && opts.includeRetensi) {
    closingPowerParagraphs.push(
      `Surat Kuasa ini diberikan dengan Hak Substitusi (recht van substitutie) baik sebagian maupun seluruhnya serta Hak Retensi sesuai ketentuan Undang-Undang yang berlaku.`
    );
  } else if (opts.includeSubstitusi) {
    closingPowerParagraphs.push(
      `Surat Kuasa ini diberikan dengan Hak Substitusi (recht van substitutie) baik sebagian maupun seluruhnya sesuai Pasal 1803 Kitab Undang-Undang Hukum Perdata.`
    );
  }

  let docTitle = 'SURAT KUASA KHUSUS';
  let docSubtitle = `${preset.label} — ${opts.companyName}`;
  let docNumber = `No. ${randomReg}/SK-LGL/IX/2026`;
  let docCategory = 'Surat Kuasa / Somasi';
  let closingText =
    'Demikian Surat Kuasa ini dibuat untuk dapat dipergunakan sebagaimana mestinya.';
  let clauses: LegalClause[] = [];

  const skClauses: LegalClause[] = [
    {
      id: `${docId}-sk-khusus`,
      number: 'KHUSUS',
      title: `POKOK PEMBERIAN KUASA (${preset.shortBadge.split('·')[0].trim().toUpperCase()})`,
      legalBasis: preset.legalBasis,
      riskLevel: 'Kritis',
      plainSummary: `Pokok Kuasa Khusus: Memberikan wewenang kepada Penerima Kuasa untuk mewakili ${opts.companyName} pada ${opts.courtOrForum} terkait ${opts.caseNumber}.`,
      content: [
        `(1) ${buildKhususNarrative()}`,
        ...(opts.scopeDescription &&
        opts.scopeDescription !== preset.defaultScope
          ? [`(2) Ruang Lingkup Tambahan: ${opts.scopeDescription}`]
          : []),
      ],
    },
    {
      id: `${docId}-sk-wewenang`,
      number: 'WEWENANG KUASA',
      title: 'RINCIAN KEWENANGAN DAN TINDAKAN HUKUM PENERIMA KUASA',
      legalBasis: preset.legalBasis,
      riskLevel: 'Perhatian',
      plainSummary:
        'Merinci kewenangan Penerima Kuasa di hadapan forum/pengadilan serta syarat persetujuan tertulis & hak substitusi.',
      content: [
        `Untuk itu, Penerima Kuasa diberikan wewenang dan berhak untuk:`,
        ...preset.defaultAuthorityBullets.map((item, idx) => `(${idx + 1}) ${item}`),
        ...closingPowerParagraphs,
      ],
    },
  ];

  const stNumber = `No. ${randomReg + 1}/ST-LGL/IX/2026`;
  const stClauses: LegalClause[] = [
    {
      id: `${docId}-st-komparisi`,
      number: 'SURAT TUGAS',
      title: `KOMPARISI PEMBERI TUGAS & PENERIMA TUGAS (${stNumber})`,
      legalBasis: preset.legalBasis,
      riskLevel: 'Standar',
      plainSummary: `Bagian Surat Tugas Resmi (${stNumber}) yang memuat identitas Pemberi Tugas (${opts.companyName}) dan daftar Penerima Tugas.`,
      content: [
        `Yang bertanda tangan di bawah ini:\n${buildGrantorKomparisi('Pemberi Tugas')}`,
        `${buildRecipientKomparisi('Penerima Tugas')}`,
      ],
    },
    {
      id: `${docId}-st-untuk`,
      number: 'UNTUK',
      title: `RINCIAN PENUGASAN RESMI (${preset.shortBadge.split('·')[0].trim().toUpperCase()})`,
      legalBasis: preset.legalBasis,
      riskLevel: 'Perhatian',
      plainSummary: `Bagian "UNTUK" pada Surat Tugas yang merinci mandat kehadiran dan tindakan Penerima Tugas di ${opts.courtOrForum}.`,
      content: buildSuratTugasUntukNarrative(),
    },
  ];

  if (opts.docMode === 'sk_khusus') {
    docTitle =
      opts.kuasaType === 'laps_sjk' || opts.kuasaType === 'aanmaning' || opts.kuasaType === 'bpsk'
        ? 'SURAT KUASA'
        : 'SURAT KUASA KHUSUS';
    docNumber = `No. ${randomReg}/SK-LGL/IX/2026`;
    clauses = skClauses;
  } else if (opts.docMode === 'surat_tugas') {
    docTitle = 'SURAT TUGAS';
    docSubtitle = `Surat Tugas ${preset.label} (${opts.caseNumber}) — ${opts.companyName}`;
    docNumber = stNumber;
    docCategory = 'Surat Tugas / Kuasa';
    closingText =
      'Demikian Surat Tugas ini dibuat untuk dapat dipergunakan sebagaimana mestinya.';
    clauses = [
      {
        id: `${docId}-st-only-untuk`,
        number: 'UNTUK',
        title: `POKOK PENUGASAN RESMI (${preset.shortBadge.split('·')[0].trim().toUpperCase()})`,
        legalBasis: preset.legalBasis,
        riskLevel: 'Kritis',
        plainSummary: `Rincian penugasan resmi Penerima Tugas pada ${opts.courtOrForum} sehubungan dengan ${opts.caseNumber}.`,
        content: buildSuratTugasUntukNarrative(),
      },
    ];
  } else if (opts.docMode === 'bundel_sk_st') {
    docTitle = 'SURAT KUASA DAN SURAT TUGAS';
    docSubtitle = `Bundel Resmi SK & ST ${preset.label} (${opts.caseNumber}) — ${opts.companyName}`;
    docNumber = `No. ${randomReg}/SK-ST/LGL/IX/2026`;
    docCategory = 'Surat Kuasa / Somasi';
    closingText =
      'Demikian Surat Kuasa dan Surat Tugas ini dibuat untuk dapat dipergunakan sebagaimana mestinya.';
    clauses = [...skClauses, ...stClauses];
  } else {
    // naskah_perkara (Bundel SK + ST + Pokok Gugatan / Tanggapan)
    docTitle = preset.defaultPleadingTitle;
    docSubtitle = `${preset.label} (${opts.caseNumber}) — ${opts.companyName} vs. ${opts.opponentOrTarget}`;
    docNumber = `No. ${randomReg}/LIT-LGL/IX/2026`;
    docCategory = 'Litigasi / Sengketa';
    closingText =
      'Demikian Surat Kuasa, Surat Tugas, dan Naskah Perkara ini diajukan untuk dipergunakan sebagaimana mestinya.';
    clauses = [
      ...skClauses,
      ...stClauses,
      {
        id: `${docId}-pleading-posita`,
        number: 'POSITA',
        title: 'DUDUK PERKARA / FUNDAMENTUM PETENDI',
        legalBasis: preset.legalBasis,
        riskLevel: 'Kritis',
        content: [
          `(1) ${opts.positaSummary || preset.defaultPositaSummary}`,
          `(2) Bahwa nilai objek sengketa/tuntutan dalam perkara ${opts.caseNumber} pada ${opts.courtOrForum} adalah sebesar ${opts.claimValue}.`,
        ],
      },
      {
        id: `${docId}-pleading-petitum`,
        number: 'PETITUM',
        title: 'PERMOHONAN PUTUSAN / AMAR PETITUM',
        legalBasis: preset.legalBasis,
        riskLevel: 'Kritis',
        content: [
          `(1) Berdasarkan uraian tersebut di atas, mohon kepada Ketua / Majelis pada ${opts.courtOrForum} untuk memutus:`,
          `(2) PRIMAIR: ${opts.petitumSummary || preset.defaultPetitumSummary}`,
          `(3) SUBSIDAIR: Apabila Majelis berpendapat lain, mohon putusan yang seadil-adilnya (ex aequo et bono).`,
        ],
      },
    ];
  }

  const primaryDesignationOne =
    opts.docMode === 'surat_tugas' ? 'PEMBERI TUGAS' : 'PEMBERI KUASA';
  const primaryDesignationTwo =
    opts.docMode === 'surat_tugas' ? 'PENERIMA TUGAS' : 'PENERIMA KUASA';

  return {
    id: docId,
    updatedAt: `Baru saja dibuat sesuai Template Korporasi (${preset.shortBadge})`,
    promptUsed: `${docTitle} — ${preset.label} (${opts.caseNumber})`,
    title: docTitle,
    subtitle: docSubtitle,
    documentNumber: docNumber,
    category: docCategory,
    jurisdiction: opts.courtOrForum,
    effectiveDate: todayStr,
    openingText: 'Yang bertanda tangan di bawah ini:',
    partyOne: {
      name: opts.companyName,
      role: primaryDesignationOne,
      representative: `${opts.directorName} (${opts.directorTitle})`,
      address: opts.companyAddress,
      entityType: opts.clientEntityType,
      description: buildGrantorKomparisi(
        opts.docMode === 'surat_tugas' ? 'Pemberi Tugas' : 'Pemberi Kuasa'
      ),
    },
    partyTwo: {
      name: recipientPartyName,
      role: primaryDesignationTwo,
      representative: recipientRepresentativeSummary,
      address:
        opts.recipientStyle === 'external_lawfirm'
          ? opts.attorneyAddress
          : opts.companyAddress,
      entityType:
        opts.recipientStyle === 'external_lawfirm' ? 'CV_Firma' : 'PT',
      description: buildRecipientKomparisi(
        opts.docMode === 'surat_tugas' ? 'Penerima Tugas' : 'Penerima Kuasa'
      ),
    },
    recitals: [
      `Bahwa, ${primaryDesignationOne} (${opts.companyName}) menunjuk ${primaryDesignationTwo} untuk bertindak mewakili kepentingan hukum Perseroan pada ${opts.courtOrForum} sehubungan dengan ${opts.caseNumber} berhadapan dengan ${opts.opponentOrTarget};`,
      `Bahwa, pemberian mandat ini disusun sesuai standar komparisi akta perseroan terbatas dan ketentuan ${preset.legalBasis} dengan susunan sebagai berikut:`,
    ],
    clauses,
    closingText,
    signingLocation: opts.signingCity,
    variables: [
      { key: 'Nama Perusahaan (Pemberi Kuasa/Tugas)', value: opts.companyName, category: 'Para Pihak' },
      { key: 'Nama Direktur Penandatangan', value: opts.directorName, category: 'Para Pihak' },
      { key: 'NIK KTP Direktur', value: opts.directorNik, category: 'Para Pihak' },
      { key: 'Penerima Kuasa / Penerima Tugas', value: recipientRepresentativeSummary, category: 'Para Pihak' },
      { key: 'Nomor Perkara / Registrasi', value: opts.caseNumber, category: 'Yurisdiksi' },
      { key: 'Pihak Lawan / Konsumen / Termohon', value: opts.opponentOrTarget, category: 'Para Pihak' },
      { key: 'Pengadilan / Forum (PN / BPSK / LAPS)', value: opts.courtOrForum, category: 'Yurisdiksi' },
      { key: 'Nilai Objek / Sengketa', value: opts.claimValue, category: 'Finansial' },
    ],
    auditNotes: [
      {
        title: `Susunan Sesuai Standar Template Korporasi (${preset.shortBadge})`,
        severity: 'Aman',
        recommendation: `Dokumen telah disusun mengikuti urutan baku: Komparisi Pemberi Kuasa (Direktur, Akta Pendirian & SK Kemenkumham, Akta Perubahan Terakhir & AHU), Komparisi Penerima Kuasa (Nama, Jabatan, No. KTP, Alamat KTP / Advokat), Bagian KHUSUS, dan Bagian SURAT TUGAS (UNTUK).`,
      },
      {
        title: 'Kelengkapan Tanda Tangan Berdampingan & Meterai Rp 10.000,-',
        severity: 'Perlu Verifikasi',
        recommendation:
          'Pastikan kolom Pemberi Kuasa ditandatangani oleh Direktur di atas Meterai Rp 10.000,- disertai cap perusahaan, dan kolom Penerima Kuasa ditandatangani oleh seluruh penerima kuasa/tugas.',
      },
    ],
  };
}

/**
 * Detects if a natural language prompt is asking for SK / ST / Aanmaning / BPSK / LAPS / Mediasi / Gugatan Sederhana / Gugatan / PKPU,
 * and builds the standardized corporate SK/ST document matching the uploaded PDF templates.
 */
export function tryBuildOfficialSkStFromPrompt(
  promptText: string
): LegalDocument | null {
  const p = promptText.trim();
  const lower = p.toLowerCase();

  const isSkStOrLitigationTrigger =
    /\b(surat kuasa|surat tugas|\bsk\b|\bst\b|aanmaning|bpsk|laps|gugatan sederhana|gugatan perdata|gugatan pmh|gugatan wanprestasi|kuasa mediasi|sk mediasi|sk pkpu)\b/i.test(
      lower
    );

  if (!isSkStOrLitigationTrigger) {
    return null;
  }

  let kuasaType: PowerOfAttorneyType = 'aanmaning';
  if (lower.includes('laps')) {
    kuasaType = 'laps_sjk';
  } else if (lower.includes('bpsk') || lower.includes('sengketa konsumen')) {
    kuasaType = 'bpsk';
  } else if (lower.includes('aanmaning') || lower.includes('teguran eksekusi')) {
    kuasaType = 'aanmaning';
  } else if (lower.includes('gugatan sederhana') || lower.includes('small claim')) {
    kuasaType = 'gugatan_sederhana';
  } else if (lower.includes('pkpu') || lower.includes('kepailitan') || lower.includes('niaga')) {
    kuasaType = 'pkpu_niaga';
  } else if (lower.includes('mediasi')) {
    kuasaType = 'mediasi_pn';
  } else if (lower.includes('gugatan') || lower.includes('perbuatan melawan hukum') || lower.includes('pmh')) {
    kuasaType = 'gugatan_perdata';
  }

  // Determine docMode (bundel_sk_st if both SK and ST are requested or by default for corporate templates)
  let docMode: DocumentBuildMode = 'bundel_sk_st';
  const mentionsSk = /\b(surat kuasa|\bsk\b)\b/i.test(lower);
  const mentionsSt = /\b(surat tugas|\bst\b)\b/i.test(lower);
  if (mentionsSt && !mentionsSk) {
    docMode = 'surat_tugas';
  } else if (mentionsSk && !mentionsSt && !lower.includes('dan st') && !lower.includes('sk st')) {
    docMode = 'bundel_sk_st'; // Default to Bundel SK + ST so both Surat Kuasa & Surat Tugas are included just like the PDFs!
  }

  const preset = KUASA_PRESETS[kuasaType];

  // Extract PT name if mentioned in prompt
  const ptMatch = p.match(/\b(PT\.?\s+[A-Z][A-Za-z0-9\s.&-]{2,40})/i);
  const extractedCompany = ptMatch
    ? ptMatch[1].trim()
    : DEFAULT_CORPORATE_GRANTOR.companyName;

  // Extract case/registration number if mentioned
  const caseMatch = p.match(
    /(?:nomor|no\.?|reg\.?)\s*[:.]?\s*([0-9A-Za-z./-]{4,45})/i
  );
  const extractedCaseNumber = caseMatch
    ? `Nomor: ${caseMatch[1].trim()}`
    : preset.defaultCaseNumber;

  // Extract court / forum if mentioned
  const pnMatch = p.match(
    /\b(Pengadilan Negeri\s+[A-Za-z\s]{3,25}|Pengadilan Niaga\s+[A-Za-z\s]{3,25}|BPSK\s+[A-Za-z\s]{3,25}|LAPS\s*SJK)\b/i
  );
  const extractedCourt = pnMatch ? pnMatch[1].trim() : preset.defaultCourtOrForum;

  return buildOfficialCorporateSkStDocument({
    kuasaType,
    docMode,
    recipientStyle: preset.defaultRecipientStyle,
    clientEntityType: 'PT',
    companyName: extractedCompany,
    directorName: DEFAULT_CORPORATE_GRANTOR.directorName,
    directorTitle: DEFAULT_CORPORATE_GRANTOR.directorTitle,
    directorNik: DEFAULT_CORPORATE_GRANTOR.directorNik,
    directorAddress: DEFAULT_CORPORATE_GRANTOR.directorAddress,
    companyCity: DEFAULT_CORPORATE_GRANTOR.companyCity,
    companyAddress: DEFAULT_CORPORATE_GRANTOR.companyAddress,
    deedIncorporation: DEFAULT_CORPORATE_GRANTOR.deedIncorporation,
    deedLatestAmendment: DEFAULT_CORPORATE_GRANTOR.deedLatestAmendment,
    inhouseRecipients: DEFAULT_INHOUSE_RECIPIENTS,
    attorneyFirm: DEFAULT_EXTERNAL_LAWFIRM.firmName,
    attorneyNames: DEFAULT_EXTERNAL_LAWFIRM.advocateList,
    attorneyAddress: DEFAULT_EXTERNAL_LAWFIRM.firmAddress,
    attorneyEmail: DEFAULT_EXTERNAL_LAWFIRM.firmEmail,
    partyPosition: preset.defaultPartyPosition,
    opponentOrTarget: preset.defaultOpponentOrTarget,
    courtOrForum: extractedCourt,
    caseNumber: extractedCaseNumber,
    claimValue: preset.defaultClaimValue,
    scopeDescription: preset.defaultScope,
    positaSummary: preset.defaultPositaSummary,
    petitumSummary: preset.defaultPetitumSummary,
    signingCity: 'Jakarta',
    includeSubstitusi: true,
    includeRetensi: kuasaType === 'gugatan_perdata' || kuasaType === 'pkpu_niaga',
    includePriorApprovalClause: true,
  });
}

export const SuratKuasaBuilderModal: React.FC<SuratKuasaBuilderModalProps> = ({
  isOpen,
  initialType,
  initialDocMode,
  onClose,
  onCreateSuratKuasa,
}) => {
  const [kuasaType, setKuasaType] = useState<PowerOfAttorneyType>(
    initialType || 'aanmaning'
  );
  const [docMode, setDocMode] = useState<DocumentBuildMode>(
    initialDocMode || 'bundel_sk_st'
  );
  const [recipientStyle, setRecipientStyle] = useState<RecipientTemplateStyle>(
    KUASA_PRESETS[initialType || 'aanmaning'].defaultRecipientStyle
  );

  // Pemberi Kuasa / Pemberi Tugas (PT & Akta Korporasi)
  const [clientEntityType, setClientEntityType] = useState<PartyEntityType>('PT');
  const [companyName, setCompanyName] = useState(
    DEFAULT_CORPORATE_GRANTOR.companyName
  );
  const [directorName, setDirectorName] = useState(
    DEFAULT_CORPORATE_GRANTOR.directorName
  );
  const [directorTitle, setDirectorTitle] = useState(
    DEFAULT_CORPORATE_GRANTOR.directorTitle
  );
  const [directorNik, setDirectorNik] = useState(
    DEFAULT_CORPORATE_GRANTOR.directorNik
  );
  const [directorAddress, setDirectorAddress] = useState(
    DEFAULT_CORPORATE_GRANTOR.directorAddress
  );
  const [companyCity, setCompanyCity] = useState(
    DEFAULT_CORPORATE_GRANTOR.companyCity
  );
  const [companyAddress, setCompanyAddress] = useState(
    DEFAULT_CORPORATE_GRANTOR.companyAddress
  );
  const [deedIncorporation, setDeedIncorporation] = useState(
    DEFAULT_CORPORATE_GRANTOR.deedIncorporation
  );
  const [deedLatestAmendment, setDeedLatestAmendment] = useState(
    DEFAULT_CORPORATE_GRANTOR.deedLatestAmendment
  );

  // Penerima Kuasa / Penerima Tugas (Karyawan In-House & Advokat Kantor Hukum)
  const [inhouseRecipients, setInhouseRecipients] = useState<
    CorporateRecipientPerson[]
  >(DEFAULT_INHOUSE_RECIPIENTS);
  const [attorneyFirm, setAttorneyFirm] = useState(
    DEFAULT_EXTERNAL_LAWFIRM.firmName
  );
  const [attorneyNames, setAttorneyNames] = useState(
    DEFAULT_EXTERNAL_LAWFIRM.advocateList
  );
  const [attorneyAddress, setAttorneyAddress] = useState(
    DEFAULT_EXTERNAL_LAWFIRM.firmAddress
  );
  const [attorneyEmail, setAttorneyEmail] = useState(
    DEFAULT_EXTERNAL_LAWFIRM.firmEmail
  );

  // Objek, Nomor Perkara, Nilai Sengketa & Rincian
  const [partyPosition, setPartyPosition] = useState(
    KUASA_PRESETS.aanmaning.defaultPartyPosition
  );
  const [scopeDescription, setScopeDescription] = useState(
    KUASA_PRESETS.aanmaning.defaultScope
  );
  const [opponentOrTarget, setOpponentOrTarget] = useState(
    KUASA_PRESETS.aanmaning.defaultOpponentOrTarget
  );
  const [courtOrForum, setCourtOrForum] = useState(
    KUASA_PRESETS.aanmaning.defaultCourtOrForum
  );
  const [caseNumber, setCaseNumber] = useState(
    KUASA_PRESETS.aanmaning.defaultCaseNumber
  );
  const [claimValue, setClaimValue] = useState(
    KUASA_PRESETS.aanmaning.defaultClaimValue
  );
  const [positaSummary, setPositaSummary] = useState(
    KUASA_PRESETS.aanmaning.defaultPositaSummary
  );
  const [petitumSummary, setPetitumSummary] = useState(
    KUASA_PRESETS.aanmaning.defaultPetitumSummary
  );
  const [signingCity, setSigningCity] = useState('Jakarta');

  // Hak Khusus Checkboxes
  const [includeSubstitusi, setIncludeSubstitusi] = useState(true);
  const [includeRetensi, setIncludeRetensi] = useState(false);
  const [includePriorApprovalClause, setIncludePriorApprovalClause] =
    useState(true);

  const handleSelectKuasaType = (type: PowerOfAttorneyType) => {
    setKuasaType(type);
    const preset = KUASA_PRESETS[type];
    setRecipientStyle(preset.defaultRecipientStyle);
    setPartyPosition(preset.defaultPartyPosition);
    setScopeDescription(preset.defaultScope);
    setOpponentOrTarget(preset.defaultOpponentOrTarget);
    setCourtOrForum(preset.defaultCourtOrForum);
    setCaseNumber(preset.defaultCaseNumber);
    setClaimValue(preset.defaultClaimValue);
    setPositaSummary(preset.defaultPositaSummary);
    setPetitumSummary(preset.defaultPetitumSummary);
  };

  useEffect(() => {
    if (initialType) {
      handleSelectKuasaType(initialType);
    }
  }, [initialType]);

  useEffect(() => {
    if (initialDocMode) {
      setDocMode(initialDocMode);
    }
  }, [initialDocMode]);

  if (!isOpen) return null;

  const handleUpdateInhousePerson = (
    idx: number,
    field: keyof CorporateRecipientPerson,
    val: string
  ) => {
    setInhouseRecipients((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleAddInhousePerson = () => {
    setInhouseRecipients((prev) => [
      ...prev,
      {
        name: 'Karyawan Penerima Kuasa Baru, S.H.',
        title: 'Legal Officer',
        nik: '3174010101970001',
        address: 'Jakarta Selatan',
      },
    ]);
  };

  const handleRemoveInhousePerson = (idx: number) => {
    if (inhouseRecipients.length <= 1) return;
    setInhouseRecipients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBuildInstantDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = buildOfficialCorporateSkStDocument({
      kuasaType,
      docMode,
      recipientStyle,
      clientEntityType,
      companyName,
      directorName,
      directorTitle,
      directorNik,
      directorAddress,
      companyCity,
      companyAddress,
      deedIncorporation,
      deedLatestAmendment,
      inhouseRecipients,
      attorneyFirm,
      attorneyNames,
      attorneyAddress,
      attorneyEmail,
      partyPosition,
      opponentOrTarget,
      courtOrForum,
      caseNumber,
      claimValue,
      scopeDescription,
      positaSummary,
      petitumSummary,
      signingCity,
      includeSubstitusi,
      includeRetensi,
      includePriorApprovalClause,
    });

    onCreateSuratKuasa(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px] p-4">
      <div
        data-testid="surat-kuasa-builder-modal"
        className="bg-white border border-[#CBD5E1] rounded-md shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1D4ED8] flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide uppercase">
                  Generator Standar Template SK & ST Korporasi (Aanmaning · BPSK · LAPS SJK · Mediasi · Gugatan Sederhana · Gugatan · PKPU)
                </h2>
                <span className="text-[10px] font-mono text-amber-300">
                  Sesuai Susunan Berkas PDF Resmi Korporasi
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Susunan Baku: Komparisi Direktur & Akta PT (SK Kemenkumham & AHU) → Tabel Penerima Kuasa (Nama/Jabatan/NIK/Alamat KTP) → KHUSUS → SURAT TUGAS (UNTUK) & Tanda Tangan Berdampingan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleBuildInstantDocument}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Step 1: Pilih Mode Jenis Dokumen (Bundel SK+ST / SK Khusus / Surat Tugas / Naskah Perkara) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mb-2">
              1. Pilih Format Keluaran Dokumen (Sesuai Template PDF Korporasi)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {(
                [
                  {
                    id: 'bundel_sk_st',
                    icon: Layers,
                    title: 'Bundel Lengkap SK + ST',
                    desc: 'Halaman Surat Kuasa + Halaman Surat Tugas (Standar PDF)',
                  },
                  {
                    id: 'sk_khusus',
                    icon: FileSignature,
                    title: 'SK — Surat Kuasa Khusus',
                    desc: 'Komparisi PT, Penerima Kuasa & Bagian KHUSUS',
                  },
                  {
                    id: 'surat_tugas',
                    icon: ClipboardCheck,
                    title: 'ST — Surat Tugas Resmi',
                    desc: 'Pemberi Tugas, Penerima Tugas & Bagian UNTUK',
                  },
                  {
                    id: 'naskah_perkara',
                    icon: FileText,
                    title: 'Bundel SK + ST + Naskah Gugatan',
                    desc: 'Lengkap dengan Posita & Petitum Perkara',
                  },
                ] as const
              ).map((m) => {
                const IconComp = m.icon;
                const active = docMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`sk-mode-btn-${m.id}`}
                    onClick={() => setDocMode(m.id)}
                    className={`text-left p-2.5 rounded border transition-all flex items-start gap-2 cursor-pointer ${
                      active
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <IconComp
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        active ? 'text-amber-300' : 'text-[#1D4ED8]'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold">{m.title}</div>
                      <div
                        className={`text-[10.5px] mt-0.5 ${
                          active ? 'text-blue-100' : 'text-[#64748B]'
                        }`}
                      >
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Pilih Forum & Jenis Perkara */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mb-2">
              2. Pilih Template Perkara (Aanmaning · BPSK · LAPS SJK · Mediasi · Gugatan Sederhana · Gugatan · PKPU)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {(
                [
                  {
                    id: 'aanmaning',
                    icon: AlertTriangle,
                    title: 'SK & ST Aanmaning',
                    desc: 'Perkara Eksekusi Jo. Putusan PN (Pasal 196 HIR)',
                  },
                  {
                    id: 'bpsk',
                    icon: Scale,
                    title: 'SK & ST BPSK',
                    desc: 'Pengaduan & Keberatan Kompetensi BPSK (Pasal 45 UU 8/1999)',
                  },
                  {
                    id: 'laps_sjk',
                    icon: Landmark,
                    title: 'SK & ST LAPS SJK',
                    desc: 'Mediasi LAPS Sektor Jasa Keuangan (Reg. LAPS-SJK-M)',
                  },
                  {
                    id: 'mediasi_pn',
                    icon: Scale,
                    title: 'SK & ST Mediasi PN',
                    desc: 'Kuasa Khusus Mediasi Pasal 18 ayat (4) PERMA 1/2016',
                  },
                  {
                    id: 'gugatan_sederhana',
                    icon: Gavel,
                    title: 'SK & ST Gugatan Sederhana',
                    desc: 'Small Claims Court ≤ Rp 500 Juta (PERMA 4/2019)',
                  },
                  {
                    id: 'gugatan_perdata',
                    icon: Gavel,
                    title: 'SK & ST Gugatan Perdata',
                    desc: 'Gugatan PMH / Wanprestasi PN (Advokat / In-House)',
                  },
                  {
                    id: 'pkpu_niaga',
                    icon: Building2,
                    title: 'SK & ST PKPU / Niaga',
                    desc: 'Kolaborasi In-House & Law Firm di Pengadilan Niaga',
                  },
                  {
                    id: 'non_litigasi',
                    icon: Briefcase,
                    title: 'SK & ST Somasi / Bipartit',
                    desc: 'Teguran Hukum & Mediasi di Luar Pengadilan',
                  },
                ] as const
              ).map((item) => {
                const IconComp = item.icon;
                const active = kuasaType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`sk-forum-btn-${item.id}`}
                    onClick={() => handleSelectKuasaType(item.id)}
                    className={`text-left p-2.5 rounded border transition-all flex items-start gap-2 cursor-pointer ${
                      active
                        ? 'bg-[#EFF6FF] border-[#1D4ED8] ring-1 ring-[#1D4ED8]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <IconComp
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        active ? 'text-[#1D4ED8]' : 'text-[#64748B]'
                      }`}
                    />
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          active ? 'text-[#1E3A8A]' : 'text-[#0F172A]'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10.5px] text-[#64748B] mt-0.5 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Identitas Pemberi Kuasa (Direktur & Akta Perseroan AHU) */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>
                  3. Komparisi Pemberi Kuasa / Pemberi Tugas (Direktur & Akta Perseroan Terbatas)
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setClientEntityType('PT')}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded border cursor-pointer ${
                    clientEntityType === 'PT'
                      ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                      : 'bg-white text-[#475569] border-[#CBD5E1]'
                  }`}
                >
                  Perseroan Terbatas (PT)
                </button>
                <button
                  type="button"
                  onClick={() => setClientEntityType('Individu')}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded border cursor-pointer ${
                    clientEntityType === 'Individu'
                      ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                      : 'bg-white text-[#475569] border-[#CBD5E1]'
                  }`}
                >
                  Perorangan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Nama Perseroan (PT)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Nama Direktur Penandatangan
                </label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Jabatan Penandatangan
                </label>
                <input
                  type="text"
                  value={directorTitle}
                  onChange={(e) => setDirectorTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Nomor KTP (NIK) Direktur
                </label>
                <input
                  type="text"
                  value={directorNik}
                  onChange={(e) => setDirectorNik(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Alamat Tempat Tinggal (KTP) Direktur
                </label>
                <input
                  type="text"
                  value={directorAddress}
                  onChange={(e) => setDirectorAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Alamat Kedudukan Kantor Perseroan ({companyCity})
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                />
              </div>
            </div>

            {clientEntityType === 'PT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                    Akta Pendirian & SK Pengesahan Kemenkumham RI
                  </label>
                  <textarea
                    rows={2}
                    value={deedIncorporation}
                    onChange={(e) => setDeedIncorporation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                    Akta Perubahan Terakhir & Surat Penerimaan AHU Kemenkumham RI
                  </label>
                  <textarea
                    rows={2}
                    value={deedLatestAmendment}
                    onChange={(e) => setDeedLatestAmendment(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-[#CBD5E1] rounded text-[#0F172A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Komparisi Penerima Kuasa / Penerima Tugas */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>4. Susunan Komparisi Penerima Kuasa / Penerima Tugas</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    {
                      id: 'inhouse_corporate',
                      label: 'Karyawan Internal PT (Nama / Jabatan / No. KTP / Alamat KTP)',
                    },
                    {
                      id: 'external_lawfirm',
                      label: 'Advokat Kantor Hukum Eksternal (Law Firm)',
                    },
                    {
                      id: 'hybrid_pkpu',
                      label: 'Gabungan In-House Legal & Law Firm',
                    },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setRecipientStyle(st.id)}
                    className={`px-2.5 py-1 text-[10.5px] font-semibold rounded border cursor-pointer ${
                      recipientStyle === st.id
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-white text-[#475569] border-[#CBD5E1]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {(recipientStyle === 'inhouse_corporate' ||
              recipientStyle === 'hybrid_pkpu') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold text-[#1E3A8A]">
                    Daftar Karyawan Penerima Kuasa / Tugas ({inhouseRecipients.length} Orang):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddInhousePerson}
                    className="px-2 py-0.5 text-[10.5px] font-semibold text-[#1D4ED8] bg-white border border-[#BFDBFE] rounded hover:bg-[#EFF6FF] cursor-pointer"
                  >
                    + Tambah Personel Penerima Kuasa
                  </button>
                </div>
                {inhouseRecipients.map((person, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-white border border-[#E2E8F0] rounded items-center"
                  >
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) =>
                          handleUpdateInhousePerson(idx, 'name', e.target.value)
                        }
                        placeholder="Nama Lengkap"
                        className="w-full px-2 py-1 text-xs border border-[#CBD5E1] rounded"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={person.title}
                        onChange={(e) =>
                          handleUpdateInhousePerson(idx, 'title', e.target.value)
                        }
                        placeholder="Jabatan (mis. Legal Spec)"
                        className="w-full px-2 py-1 text-xs border border-[#CBD5E1] rounded"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={person.nik}
                        onChange={(e) =>
                          handleUpdateInhousePerson(idx, 'nik', e.target.value)
                        }
                        placeholder="No. KTP"
                        className="w-full px-2 py-1 text-xs font-mono border border-[#CBD5E1] rounded"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={person.address}
                        onChange={(e) =>
                          handleUpdateInhousePerson(idx, 'address', e.target.value)
                        }
                        placeholder="Alamat KTP"
                        className="w-full px-2 py-1 text-xs border border-[#CBD5E1] rounded"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {inhouseRecipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInhousePerson(idx)}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(recipientStyle === 'external_lawfirm' ||
              recipientStyle === 'hybrid_pkpu') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                    Nama Kantor Hukum (Law Firm)
                  </label>
                  <input
                    type="text"
                    value={attorneyFirm}
                    onChange={(e) => setAttorneyFirm(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                    Daftar Nama Advokat & Konsultan Hukum
                  </label>
                  <input
                    type="text"
                    value={attorneyNames}
                    onChange={(e) => setAttorneyNames(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                    Alamat & Email Kantor Hukum
                  </label>
                  <input
                    type="text"
                    value={attorneyAddress}
                    onChange={(e) => setAttorneyAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Rincian Perkara & Bagian KHUSUS / UNTUK */}
          <div className="p-4 bg-white border border-[#CBD5E1] rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                5. Rincian Perkara pada Bagian "KHUSUS" & "UNTUK" ({KUASA_PRESETS[kuasaType].shortBadge})
              </label>
              <span className="text-[10px] font-mono text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                {KUASA_PRESETS[kuasaType].legalBasis}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Nomor Perkara / Reg. LAPS / BPSK / Eksekusi
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F8FAFC] border border-[#CBD5E1] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Kedudukan Pihak (mis. Termohon Eksekusi / Tergugat)
                </label>
                <input
                  type="text"
                  value={partyPosition}
                  onChange={(e) => setPartyPosition(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Pihak Lawan / Konsumen / Pemohon
                </label>
                <input
                  type="text"
                  value={opponentOrTarget}
                  onChange={(e) => setOpponentOrTarget(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Pengadilan Negeri / BPSK / LAPS SJK
                </label>
                <input
                  type="text"
                  value={courtOrForum}
                  onChange={(e) => setCourtOrForum(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Pokok Mandat Bagian KHUSUS / UNTUK
                </label>
                <input
                  type="text"
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                  Kota Penandatanganan
                </label>
                <input
                  type="text"
                  value={signingCity}
                  onChange={(e) => setSigningCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#334155]">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePriorApprovalClause}
                  onChange={(e) => setIncludePriorApprovalClause(e.target.checked)}
                />
                <span>
                  Wajib persetujuan tertulis Pemberi Kuasa untuk keputusan akhir / perdamaian
                </span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSubstitusi}
                  onChange={(e) => setIncludeSubstitusi(e.target.checked)}
                />
                <span>Hak Substitusi</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRetensi}
                  onChange={(e) => setIncludeRetensi(e.target.checked)}
                />
                <span>Hak Retensi</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>
                Susunan output mengikuti persis format berkas PDF SK & ST korporasi (siap cetak PDF A4 & Word).
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] border border-[#CBD5E1] rounded bg-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                data-testid="submit-build-sk-st-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {docMode === 'bundel_sk_st'
                    ? `Buat Bundel SK & ST (${KUASA_PRESETS[kuasaType].shortBadge.split('·')[0].trim()})`
                    : docMode === 'sk_khusus'
                    ? `Buat Surat Kuasa (${KUASA_PRESETS[kuasaType].shortBadge.split('·')[0].trim()})`
                    : docMode === 'surat_tugas'
                    ? `Buat Surat Tugas (${KUASA_PRESETS[kuasaType].shortBadge.split('·')[0].trim()})`
                    : `Buat Berkas Lengkap (${KUASA_PRESETS[kuasaType].shortBadge.split('·')[0].trim()})`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
