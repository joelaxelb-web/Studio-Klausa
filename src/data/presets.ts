import { LegalDocument, QuickPromptPreset, ClauseLibraryItem } from '../types/legal';

export const QUICK_COMMAND_PRESETS: QuickPromptPreset[] = [
  {
    id: 'pks-software',
    label: 'PKS Pengembangan Aplikasi & Software',
    category: 'Perjanjian Komersial',
    stance: 'Melindungi Pemberi Kerja (Pihak Pertama)',
    prompt:
      'Buatkan Perjanjian Kerjasama Pengembangan Aplikasi Mobile & Web E-Commerce antara PT Nusantara Retailindo (Pihak Pertama) dan PT Kreasi Digital Solusi (Pihak Kedua) dengan nilai proyek Rp 240.000.000 selama 4 bulan, pembayaran 3 termin (30% DP, 40% UAT, 30% Go-Live), hak cipta source code milik penuh Pihak Pertama setelah lunas, garansi pemeliharaan bug 90 hari, dan denda keterlambatan 1 per mil per hari.',
  },
  {
    id: 'pkwt-karyawan',
    label: 'Kontrak Kerja Karyawan (PKWT)',
    category: 'Ketenagakerjaan',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    prompt:
      'Buatkan Perjanjian Kerja Waktu Tertentu (PKWT) untuk posisi Senior Product Manager di PT Sinar Teknologi Nusantara dengan gaji pokok Rp 24.500.000 per bulan, tunjangan tetap Rp 3.500.000, masa kontrak 12 bulan mulai 1 Oktober 2026 di Jakarta, mencakup klausul kerahasiaan data, HKI atas hasil kerja, jam kerja fleksibel hybrid, dan uang kompensasi PKWT sesuai PP No. 35 Tahun 2021.',
  },
  {
    id: 'nda-bisnis',
    label: 'Perjanjian Kerahasiaan Dua Arah (Mutual NDA)',
    category: 'Kerahasiaan (NDA)',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    prompt:
      'Buatkan Perjanjian Kerahasiaan Informasi Dua Arah (Mutual Non-Disclosure Agreement) antara PT Mandala Ventura Indonesia dan PT Pangan Lestari Nusantara untuk keperluan penjajakan investasi Seri A dan uji tuntas (due diligence) keuangan serta rahasia dagang, berlaku selama 3 tahun dengan sanksi ganti rugi penuh jika terjadi kebocoran data.',
  },
  {
    id: 'sewa-ruko',
    label: 'Perjanjian Sewa Menyewa Ruko / Ruang Kantor',
    category: 'Sewa Menyewa',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    prompt:
      'Buatkan Perjanjian Sewa Menyewa Bangunan Ruko 3 Lantai di Jl. Kemang Raya No. 48 Jakarta Selatan antara H. Hendra Wijaya (Pemilik) dan PT Kopi Senja Indonesia (Penyewa) selama 3 tahun dengan harga sewa Rp 320.000.000 per tahun, uang jaminan deposit Rp 30.000.000, PPh final ditanggung pemilik, dan izin renovasi interior kafe.',
  },
  {
    id: 'jasa-agensi',
    label: 'Kontrak Retainer Agensi Marketing & Kreatif',
    category: 'Perjanjian Jasa',
    stance: 'Melindungi Pelaksana Jasa (Pihak Kedua)',
    prompt:
      'Buatkan Perjanjian Jasa Retainer Digital Marketing & Pengelolaan Media Sosial antara PT Kosmetik Aura Cantika dan CV Studio Narasi Kreatif senilai Rp 28.000.000 per bulan selama 6 bulan, mencakup 20 konten video pendek dan 15 desain feed per bulan, batas revisi maksimal 2 kali per konten, pembayaran setiap tanggal 5, dan denda keterlambatan bayar 2% per minggu.',
  },
  {
    id: 'pemegang-saham',
    label: 'Perjanjian Pemegang Saham (Founders / SHA)',
    category: 'Korporasi & Investasi',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    prompt:
      'Buatkan Perjanjian Pemegang Saham Pendiri (Founders & Shareholders Agreement) untuk pendirian PT Teknologi Finansial Mandiri antara 3 pendiri (Budi 45%, Rina 35%, Dito 20%) dengan ketentuan vesting saham 4 tahun dan cliff 1 tahun, hak memesan efek terlebih dahulu (Right of First Refusal), drag-along dan tag-along rights, serta larangan kompetisi selama 2 tahun.',
  },
  {
    id: 'jual-beli-b2b',
    label: 'Perjanjian Jual Beli Pasokan Barang (B2B Supply)',
    category: 'Perjanjian Komersial',
    stance: 'Seimbang (Adil bagi Kedua Pihak)',
    prompt:
      'Buatkan Perjanjian Jual Beli dan Pasokan Bahan Baku Biji Kopi Arabika antara Koperasi Tani Gayo Makmur (Penjual) dan PT Roastery Nusantara Abadi (Pembeli) sebanyak 2.000 kg per bulan dengan harga Rp 135.000/kg selama 1 tahun, pengiriman CIF Gudang Tangerang, pembayaran TOP 30 hari setelah berita acara serah terima, dan garansi mutu kadar air maksimal 12%.',
  },
  {
    id: 'surat-kuasa-somasi',
    label: 'Surat Somasi / Teguran Hukum Wanprestasi',
    category: 'Surat Kuasa / Somasi',
    stance: 'Melindungi Pemberi Kerja (Pihak Pertama)',
    prompt:
      'Buatkan Dokumen Somasi Pertama dan Terakhir (Teguran Hukum Resmi) dari PT Logistik Cepat Nusantara kepada PT Konstruksi Jaya Makmur terkait kelalaian pembayaran tagihan Invoice No. INV/2026/089 senilai Rp 475.000.000 yang telah jatuh tempo selama 60 hari berdasarkan Perjanjian Pengangkutan Barang, dengan batas waktu pelunasan 7 hari kalender sebelum ditempuh gugatan perdata dan permohonan PKPU.',
  },
  {
    id: 'surat-kuasa-klien',
    label: 'Surat Kuasa Khusus Klien (Litigasi & Non-Litigasi)',
    category: 'Surat Kuasa / Somasi',
    stance: 'Melindungi Pemberi Kerja (Pihak Pertama)',
    prompt:
      'Buatkan Surat Kuasa Khusus Klien dari PT Nusantara Retailindo (Pemberi Kuasa / Klien) kepada Kantor Hukum Mahendra, Kusuma & Rekan (Penerima Kuasa / Advokat) untuk bertindak mewakili Klien secara litigasi maupun non-litigasi, melayangkan somasi, menghadiri mediasi, menandatangani akta perdamaian, serta mengajukan gugatan wanprestasi di Pengadilan Negeri Jakarta Selatan, lengkap dengan Hak Substitusi (Pasal 1803 KUHPerdata) dan Hak Retensi (Pasal 1812 KUHPerdata).',
  },
];

export const CLAUSE_LIBRARY_SNIPPETS: ClauseLibraryItem[] = [
  {
    id: 'clause-substitusi-retensi',
    title: 'HAK SUBSTITUSI & HAK RETENSI PENERIMA KUASA (SURAT KUASA)',
    category: 'Surat Kuasa Klien',
    legalBasis: 'Pasal 1792, Pasal 1803 & Pasal 1812 KUHPerdata jo. UU Advokat No. 18/2003',
    riskLevel: 'Standar',
    summary: 'Memberikan hak limpahan kuasa (substitusi) dan hak menahan dokumen (retensi) kepada Penerima Kuasa dalam menjalankan mandat Klien.',
    content: [
      '(1) Kuasa Khusus ini diberikan kepada PENERIMA KUASA dengan Hak Substitusi (recht van substitutie) baik sebagian maupun seluruhnya kepada advokat atau kuasa pengganti lainnya sesuai Pasal 1803 Kitab Undang-Undang Hukum Perdata.',
      '(2) PENERIMA KUASA diberikan pula Hak Retensi berdasarkan Pasal 1812 KUHPerdata untuk menahan dokumen-dokumen asli milik PEMBERI KUASA hingga seluruh kewajiban pembayaran biaya hukum dan honorarium diselesaikan secara lunas.',
    ],
  },
  {
    id: 'clause-1266',
    title: 'PENGENYAMPINGAN PASAL 1266 & 1267 KUHPERDATA',
    category: 'Pengakhiran Kontrak',
    legalBasis: 'Pasal 1266 & 1267 KUHPerdata',
    riskLevel: 'Kritis',
    summary: 'Memungkinkan pengakhiran perjanjian secara sepihak jika terjadi wanprestasi tanpa perlu menunggu putusan hakim Pengadilan Negeri.',
    content: [
      '(1) Para Pihak dengan ini secara tegas sepakat untuk mengesampingkan berlakunya ketentuan Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata (KUHPerdata) sepanjang mengenai diperlukannya putusan pengadilan terlebih dahulu untuk mengakhiri Perjanjian ini.',
      '(2) Dengan demikian, pengakhiran Perjanjian akibat kelalaian atau wanprestasi salah satu Pihak dapat berlaku efektif secara seketika melalui pemberitahuan tertulis dari Pihak yang dirugikan.',
    ],
  },
  {
    id: 'clause-pdp',
    title: 'PELINDUNGAN DATA PRIBADI (KEPATUHAN UU PDP)',
    category: 'Kerahasiaan & Data',
    legalBasis: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
    riskLevel: 'Kritis',
    summary: 'Kewajiban pengendali dan prosesor data pribadi sesuai standar UU PDP Indonesia termasuk notifikasi insiden 3x24 jam.',
    content: [
      '(1) Dalam hal pelaksanaan Perjanjian ini melibatkan pemrosesan Data Pribadi, masing-masing Pihak wajib mematuhi seluruh ketentuan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi beserta peraturan pelaksananya.',
      '(2) Pihak yang menerima Data Pribadi dilarang mengungkapkan, menyalin, atau memindahkan Data Pribadi kepada pihak ketiga mana pun tanpa persetujuan tertulis terlebih dahulu dari Pihak pemilik data.',
      '(3) Apabila terjadi kegagalan pelindungan atau kebocoran Data Pribadi, Pihak yang mengalami insiden wajib memberitahukan secara tertulis kepada Pihak lainnya selambat-lambatnya 3 x 24 (tiga kali dua puluh empat) jam sejak diketahuinya insiden tersebut.',
    ],
  },
  {
    id: 'clause-ip-transfer',
    title: 'HAK KEKAYAAN INTELEKTUAL PENUH (WORK MADE FOR HIRE)',
    category: 'Hak Kekayaan Intelektual',
    legalBasis: 'UU No. 28 Tahun 2014 tentang Hak Cipta',
    riskLevel: 'Perhatian',
    summary: 'Mengalihkan seluruh hak ekonomi atas karya, kode sumber, dan desain secara eksklusif kepada Pemberi Kerja setelah pelunasan.',
    content: [
      '(1) Seluruh Hak Kekayaan Intelektual termasuk namun tidak terbatas pada hak cipta, kode sumber (source code), dokumentasi teknis, desain antarmuka, dan hasil pekerjaan yang timbul dari pelaksanaan Perjanjian ini menjadi milik eksklusif PIHAK PERTAMA sejak dilunasinya seluruh nilai pembayaran.',
      '(2) PIHAK KEDUA menjamin bahwa seluruh hasil pekerjaan merupakan karya orisinal dan tidak melanggar Hak Kekayaan Intelektual pihak ketiga mana pun, serta membebaskan PIHAK PERTAMA dari segala klaim atau tuntutan hukum di kemudian hari.',
    ],
  },
  {
    id: 'clause-non-solicit',
    title: 'LARANGAN MEMBAJAK KARYAWAN & MITRA (NON-SOLICITATION)',
    category: 'Pembatasan Komersial',
    legalBasis: 'Pasal 1338 KUHPerdata (Asas Kebebasan Berkontrak)',
    riskLevel: 'Perhatian',
    summary: 'Melarang para pihak merekrut karyawan kunci pihak lawan selama masa kontrak dan 24 bulan setelah kontrak berakhir.',
    content: [
      '(1) Selama Jangka Waktu Perjanjian ini dan dalam kurun waktu 24 (dua puluh empat) bulan setelah berakhirnya Perjanjian, masing-masing Pihak dilarang secara langsung maupun tidak langsung membujuk, menawarkan pekerjaan, atau merekrut karyawan maupun tenaga ahli dari Pihak lainnya.',
      '(2) Pelanggaran terhadap ketentuan ayat (1) Pasal ini dikenakan sanksi denda ganti rugi seketika sebesar 12 (dua belas) kali gaji bulanan terakhir karyawan yang bersangkutan.',
    ],
  },
  {
    id: 'clause-bani',
    title: 'PENYELESAIAN SENGKETA MELALUI ARBITRASE BANI',
    category: 'Yurisdiksi & Sengketa',
    legalBasis: 'UU No. 30 Tahun 1999 tentang Arbitrase dan APS',
    riskLevel: 'Standar',
    summary: 'Menyelesaikan sengketa komersial secara tertutup, cepat, dan mengikat (final & binding) melalui BANI Jakarta.',
    content: [
      '(1) Setiap perselisihan yang timbul dari atau sehubungan dengan Perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk mencapai mufakat dalam waktu 30 (tiga puluh) Hari Kalender.',
      '(2) Apabila musyawarah tidak mencapai mufakat, Para Pihak sepakat untuk menyelesaikan perselisihan tersebut secara final dan mengikat melalui Badan Arbitrase Nasional Indonesia (BANI) di Jakarta sesuai dengan peraturan prosedur BANI yang berlaku.',
      '(3) Putusan arbitrase BANI bersifat final dan mengikat pada tingkat pertama dan terakhir (final and binding), serta tidak dapat diajukan banding atau kasasi.',
    ],
  },
  {
    id: 'clause-anti-bribery',
    title: 'KEPATUHAN ANTI-SUAP, GRATIFIKASI & KORUPSI',
    category: 'Kepatuhan Korporasi',
    legalBasis: 'UU No. 20 Tahun 2001 & Good Corporate Governance',
    riskLevel: 'Standar',
    summary: 'Komitmen zero-tolerance terhadap komisi tersembunyi, suap, atau gratifikasi kepada pejabat maupun karyawan para pihak.',
    content: [
      '(1) Masing-masing Pihak menjamin bahwa dalam negosiasi, penandatanganan, maupun pelaksanaan Perjanjian ini tidak pernah dan tidak akan memberikan, menjanjikan, atau menerima uang suap, komisi tersembunyi (kickback), maupun gratifikasi dalam bentuk apa pun.',
      '(2) Pelanggaran atas ketentuan Pasal ini memberikan hak kepada Pihak yang patuh untuk mengakhiri Perjanjian secara seketika tanpa kewajiban membayar ganti rugi apa pun kepada Pihak yang melanggar.',
    ],
  },
  {
    id: 'clause-force-majeure',
    title: 'KEADAAN KAHAR KOMPREHENSIF (FORCE MAJEURE)',
    category: 'Mitigasi Risiko',
    legalBasis: 'Pasal 1244 & 1245 KUHPerdata',
    riskLevel: 'Standar',
    summary: 'Mencakup bencana alam, perubahan kebijakan moneter/regulasi pemerintah mendadak, dan gangguan infrastruktur nasional.',
    content: [
      '(1) Tidak satu Pihak pun bertanggung jawab atas keterlambatan atau kegagalan pelaksanaan kewajiban berdasarkan Perjanjian ini apabila disebabkan oleh Keadaan Kahar (Force Majeure), yaitu peristiwa di luar kendali wajar Para Pihak meliputi bencana alam, kebakaran, perang, kerusuhan massal, epidemi resmi, atau perubahan peraturan perundang-undangan yang melarang langsung pelaksanaan objek Perjanjian.',
      '(2) Pihak yang mengalami Keadaan Kahar wajib memberitahukan secara tertulis kepada Pihak lainnya disertai bukti sah paling lambat 7 (tujuh) Hari Kalender sejak terjadinya peristiwa tersebut.',
      '(3) Apabila Keadaan Kahar berlangsung terus-menerus melebihi 60 (enam puluh) Hari Kalender, Para Pihak dapat berunding untuk mengakhiri Perjanjian ini secara baik-baik dengan menyelesaikan kewajiban yang telah timbul sebelum terjadinya Keadaan Kahar.',
    ],
  },
  {
    id: 'clause-late-penalty',
    title: 'DENDA KETERLAMBATAN & BATAS MAKSIMUM (LIQUIDATED DAMAGES)',
    category: 'Finansial & Sanksi',
    legalBasis: 'Pasal 1249 KUHPerdata',
    riskLevel: 'Perhatian',
    summary: 'Menetapkan denda harian yang terukur (1‰ per hari) dengan batas akumulasi maksimum 5% dari total nilai kontrak.',
    content: [
      '(1) Apabila salah satu Pihak terlambat memenuhi kewajiban penyerahan hasil pekerjaan atau kewajiban pembayaran sesuai jadwal yang telah disepakati, maka Pihak yang terlambat dikenakan denda keterlambatan sebesar 1‰ (satu per mil) per hari kalender dari nilai bagian yang terlambat.',
      '(2) Akumulasi maksimum denda keterlambatan sebagaimana dimaksud pada ayat (1) dibatasi paling tinggi sebesar 5% (lima persen) dari total Nilai Perjanjian.',
      '(3) Apabila denda telah mencapai batas maksimum 5% (lima persen) namun kewajiban masih belum dipenuhi, maka Pihak yang dirugikan berhak meninjau ulang atau mengakhiri Perjanjian ini.',
    ],
  },
];

export const INITIAL_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-pks-software-2026',
    updatedAt: '29 September 2026, 19:05 WIB',
    promptUsed:
      'Buatkan Perjanjian Kerjasama Pengembangan Aplikasi Mobile & Web E-Commerce antara PT Nusantara Retailindo dan PT Kreasi Digital Solusi senilai Rp 240.000.000 selama 4 bulan, termin 30%-40%-30%, HKI milik klien setelah lunas, garansi bug 90 hari.',
    title: 'PERJANJIAN KERJASAMA PENGEMBANGAN PERANGKAT LUNAK',
    subtitle: 'Pengembangan Sistem Aplikasi Mobile & Web Omnichannel E-Commerce',
    documentNumber: 'No. 048/PKS-IT/NRI-KDS/IX/2026',
    category: 'Perjanjian Komersial',
    jurisdiction: 'Hukum Republik Indonesia · PN Jakarta Selatan',
    effectiveDate: '29 September 2026',
    openingText:
      'Pada hari ini, Selasa, tanggal dua puluh sembilan bulan September tahun dua ribu dua puluh enam (29-09-2026), bertempat di Jakarta, telah dibuat dan ditandatangani Perjanjian Kerjasama Pengembangan Perangkat Lunak (selanjutnya disebut "Perjanjian") oleh dan antara:',
    partyOne: {
      name: 'PT Nusantara Retailindo Mandiri',
      role: 'PIHAK PERTAMA (PEMBERI KERJA)',
      representative: 'Hendra Kusuma, S.E., M.B.A. — Direktur Utama',
      address: 'Gedung Menara Sudirman Lt. 18, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan 12190',
      description:
        'Suatu perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia, dalam hal ini diwakili secara sah oleh Hendra Kusuma, S.E., M.B.A. dalam jabatannya selaku Direktur Utama, oleh karenanya sah bertindak untuk dan atas nama PT Nusantara Retailindo Mandiri, selanjutnya disebut sebagai "PIHAK PERTAMA".',
    },
    partyTwo: {
      name: 'PT Kreasi Digital Solusi',
      role: 'PIHAK KEDUA (PELAKSANA PENGEMBANG)',
      representative: 'Dimas Aditya Pratama, S.Kom. — Direktur Teknologi',
      address: 'Taman Tekno BSD Blok K-12, Setu, Tangerang Selatan, Banten 15314',
      description:
        'Suatu perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia, dalam hal ini diwakili secara sah oleh Dimas Aditya Pratama, S.Kom. dalam jabatannya selaku Direktur Teknologi, oleh karenanya sah bertindak untuk dan atas nama PT Kreasi Digital Solusi, selanjutnya disebut sebagai "PIHAK KEDUA".',
    },
    recitals: [
      'Bahwa, PIHAK PERTAMA adalah perusahaan yang bergerak di bidang perdagangan ritel modern yang membutuhkan sistem perangkat lunak aplikasi mobile (iOS & Android) serta dashboard web e-commerce terintegrasi;',
      'Bahwa, PIHAK KEDUA adalah perusahaan pengembang teknologi informasi profesional yang memiliki keahlian, pengalaman, dan sumber daya teknis dalam perancangan serta pembangunan perangkat lunak skala korporasi;',
      'Bahwa, berdasarkan surat penawaran nomor 112/SPH-KDS/IX/2026 yang telah disetujui oleh PIHAK PERTAMA, Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian ini dengan syarat-syarat dan ketentuan sebagai berikut:',
    ],
    clauses: [
      {
        id: 'cl-1',
        number: 'Pasal 1',
        title: 'RUANG LINGKUP PEKERJAAN',
        legalBasis: 'Pasal 1338 & 1601b KUHPerdata',
        riskLevel: 'Standar',
        content: [
          '(1) PIHAK PERTAMA dengan ini menunjuk PIHAK KEDUA, dan PIHAK KEDUA menerima penunjukan tersebut untuk merancang, membangun, menguji, dan mengimplementasikan Sistem Aplikasi Mobile (iOS & Android) serta Web Admin E-Commerce ("Perangkat Lunak").',
          '(2) Rincian spesifikasi teknis, daftar modul fitur, arsitektur basis data, dan jadwal tahapan pengerjaan tercantum secara lengkap dalam Lampiran I (Kerangka Acuan Kerja / Statement of Work) yang merupakan bagian tidak terpisahkan dari Perjanjian ini.',
          '(3) Setiap perubahan atau penambahan fitur di luar ruang lingkup Lampiran I (Change Request) wajib disepakati secara tertulis oleh Para Pihak melalui Addendum atau Berita Acara Perubahan Pekerjaan.',
        ],
      },
      {
        id: 'cl-2',
        number: 'Pasal 2',
        title: 'JANGKA WAKTU PELAKSANAAN',
        legalBasis: 'Pasal 1338 KUHPerdata',
        riskLevel: 'Standar',
        content: [
          '(1) Jangka waktu pengerjaan Perangkat Lunak adalah selama 4 (empat) bulan atau 120 (seratus dua puluh) Hari Kalender, terhitung efektif sejak tanggal 29 September 2026 sampai dengan tanggal 29 Januari 2027.',
          '(2) Penyerahan hasil pekerjaan dianggap selesai secara sah setelah Perangkat Lunak lulus pengujian User Acceptance Test (UAT) dan ditandatanganinya Berita Acara Serah Terima Pekerjaan (BAST) oleh Para Pihak.',
        ],
      },
      {
        id: 'cl-3',
        number: 'Pasal 3',
        title: 'NILAI PERJANJIAN DAN TATA CARA PEMBAYARAN',
        legalBasis: 'UU PPN & Hukum Perikatan',
        riskLevel: 'Kritis',
        content: [
          '(1) Total nilai pekerjaan pengembangan Perangkat Lunak yang disepakati oleh Para Pihak adalah sebesar Rp 240.000.000,- (dua ratus empat puluh juta Rupiah) belum termasuk Pajak Pertambahan Nilai (PPN) 11%.',
          '(2) Pembayaran dilakukan oleh PIHAK PERTAMA kepada PIHAK KEDUA secara bertahap (termin) dengan rincian sebagai berikut:\n   a. Termin I (Uang Muka / Down Payment) sebesar 30% atau Rp 72.000.000,- dibayarkan paling lambat 7 (tujuh) hari kerja setelah Perjanjian ditandatangani;\n   b. Termin II sebesar 40% atau Rp 96.000.000,- dibayarkan setelah penyelesaian prototipe UI/UX, modul backend utama, dan lulus pengujian di lingkungan staging (UAT);\n   c. Termin III (Pelunasan) sebesar 30% atau Rp 72.000.000,- dibayarkan setelah aplikasi resmi diluncurkan (Go-Live), penyerahan kode sumber penuh, dan penandatanganan BAST Akhir.',
          '(3) Seluruh pembayaran ditransfer melalui rekening resmi PIHAK KEDUA pada Bank Mandiri Cabang BSD Tangerang dengan Nomor Rekening [164-00-9988776-5] atas nama PT Kreasi Digital Solusi.',
        ],
      },
      {
        id: 'cl-4',
        number: 'Pasal 4',
        title: 'HAK KEKAYAAN INTELEKTUAL DAN KODE SUMBER',
        legalBasis: 'UU No. 28 Tahun 2014 tentang Hak Cipta',
        riskLevel: 'Kritis',
        content: [
          '(1) Para Pihak sepakat bahwa seluruh Hak Kekayaan Intelektual, termasuk hak cipta atas kode sumber (source code), skema basis data, desain antarmuka, dan dokumentasi teknis yang dibuat khusus untuk PIHAK PERTAMA beralih menjadi milik eksklusif PIHAK PERTAMA secara penuh setelah pembayaran Termin III (Pelunasan) diterima oleh PIHAK KEDUA.',
          '(2) PIHAK KEDUA wajib menyerahkan repositori kode sumber utuh tanpa enkripsi pengunci beserta dokumentasi instalasi (deployment guide) kepada tim teknis PIHAK PERTAMA pada saat penandatanganan BAST Akhir.',
          '(3) PIHAK KEDUA menjamin bahwa Perangkat Lunak yang dikembangkan tidak melanggar hak cipta atau paten pihak ketiga mana pun.',
        ],
      },
      {
        id: 'cl-5',
        number: 'Pasal 5',
        title: 'MASA GARANSI DAN PEMELIHARAAN PURNA JUAL',
        legalBasis: 'Pasal 1338 KUHPerdata',
        riskLevel: 'Perhatian',
        content: [
          '(1) PIHAK KEDUA memberikan Masa Garansi Teknis (Bug Fixing & Error Maintenance) tanpa biaya tambahan selama 90 (sembilan puluh) Hari Kalender terhitung sejak tanggal penandatanganan BAST Akhir.',
          '(2) Selama Masa Garansi, setiap gangguan kritis (critical bug) yang menyebabkan sistem tidak dapat diakses wajib ditangani oleh PIHAK KEDUA dengan waktu respons (response time) maksimal 4 (empat) jam kerja.',
        ],
      },
      {
        id: 'cl-6',
        number: 'Pasal 6',
        title: 'KERAHASIAAN INFORMASI DAN PELINDUNGAN DATA',
        legalBasis: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
        riskLevel: 'Perhatian',
        content: [
          '(1) Masing-masing Pihak wajib menjaga kerahasiaan seluruh data bisnis, data pelanggan, kredensial server, dan rahasia dagang yang diperoleh selama pelaksanaan Perjanjian ini sesuai ketentuan UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
          '(2) Kewajiban menjaga kerahasiaan ini tetap berlaku mengikat selama 3 (tiga) tahun meskipun Perjanjian ini telah berakhir karena sebab apa pun.',
        ],
      },
      {
        id: 'cl-7',
        number: 'Pasal 7',
        title: 'WANPRESTASI DAN DENDA KETERLAMBATAN',
        legalBasis: 'Pasal 1243 & 1249 KUHPerdata',
        riskLevel: 'Kritis',
        content: [
          '(1) Apabila PIHAK KEDUA mengalami keterlambatan penyerahan hasil pekerjaan melampaui jadwal yang disepakati bukan karena kesalahan PIHAK PERTAMA, maka PIHAK KEDUA dikenakan denda keterlambatan sebesar 1‰ (satu per mil) per hari kalender dari nilai termin terkait, dengan batas maksimum denda kumulatif sebesar 5% (lima persen) dari total Nilai Perjanjian.',
          '(2) Sebaliknya, apabila PIHAK PERTAMA terlambat melakukan pembayaran melampaui batas waktu 14 (empat belas) hari kerja sejak diterimanya tagihan lengkap, maka PIHAK KEDUA berhak menangguhkan sementara pengerjaan tahapan berikutnya hingga pembayaran diselesaikan.',
        ],
      },
      {
        id: 'cl-8',
        number: 'Pasal 8',
        title: 'PENGAKHIRAN PERJANJIAN',
        legalBasis: 'Pasal 1266 & 1267 KUHPerdata',
        riskLevel: 'Perhatian',
        content: [
          '(1) Perjanjian ini dapat diakhiri lebih awal sebelum berakhirnya Jangka Waktu apabila salah satu Pihak melakukan wanprestasi berat dan tidak memperbaikinya dalam waktu 14 (empat belas) Hari Kalender setelah menerima surat teguran tertulis.',
          '(2) Para Pihak sepakat untuk mengesampingkan berlakunya ketentuan Pasal 1266 dan Pasal 1267 KUHPerdata sehingga pengakhiran Perjanjian ini tidak memerlukan putusan Pengadilan Negeri terlebih dahulu.',
        ],
      },
      {
        id: 'cl-9',
        number: 'Pasal 9',
        title: 'PENYELESAIAN SENGKETA DAN DOMISILI HUKUM',
        legalBasis: 'Hukum Acara Perdata Indonesia',
        riskLevel: 'Standar',
        content: [
          '(1) Segala perselisihan yang timbul dari pelaksanaan Perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk mufakat dalam jangka waktu 30 (tiga puluh) Hari Kalender.',
          '(2) Apabila penyelesaian secara musyawarah tidak tercapai, Para Pihak sepakat memilih domisili hukum yang tetap dan umum di Kepaniteraan Pengadilan Negeri Jakarta Selatan.',
        ],
      },
    ],
    closingText:
      'Demikian Perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing bermaterai cukup dan memiliki kekuatan hukum pembuktian yang sama, ditandatangani oleh wakil sah Para Pihak dalam keadaan sadar serta tanpa paksaan dari pihak mana pun.',
    signingLocation: 'Jakarta',
    variables: [
      { key: 'Nama Pihak Pertama', value: 'PT Nusantara Retailindo Mandiri', category: 'Para Pihak' },
      { key: 'Penandatangan Pihak Pertama', value: 'Hendra Kusuma, S.E., M.B.A.', category: 'Para Pihak' },
      { key: 'Nama Pihak Kedua', value: 'PT Kreasi Digital Solusi', category: 'Para Pihak' },
      { key: 'Penandatangan Pihak Kedua', value: 'Dimas Aditya Pratama, S.Kom.', category: 'Para Pihak' },
      { key: 'Nilai Kontrak', value: 'Rp 240.000.000,-', category: 'Finansial' },
      { key: 'Nomor Rekening Pihak Kedua', value: '[164-00-9988776-5]', category: 'Finansial' },
      { key: 'Jangka Waktu', value: '4 (empat) bulan', category: 'Waktu' },
      { key: 'Tanggal Efektif', value: '29 September 2026', category: 'Waktu' },
      { key: 'Domisili Hukum', value: 'Pengadilan Negeri Jakarta Selatan', category: 'Yurisdiksi' },
    ],
    auditNotes: [
      {
        title: 'Kepemilikan HKI & Source Code Terlindungi',
        severity: 'Aman',
        recommendation:
          'Pasal 4 telah mengatur secara tegas bahwa peralihan HKI dan penyerahan source code terjadi setelah pelunasan Termin III, sehingga melindungi arus kas pengembang sekaligus menjamin hak milik klien.',
      },
      {
        title: 'Batas Maksimum Denda Keterlambatan (Cap 5%)',
        severity: 'Aman',
        recommendation:
          'Pasal 7 menerapkan plafon denda maksimal 5% dari nilai kontrak (1‰ per hari), sesuai praktik komersial yang sehat agar denda tidak membengkak tanpa batas.',
      },
      {
        title: 'Lengkapi Nomor Rekening & Lampiran Spesifikasi',
        severity: 'Perlu Verifikasi',
        recommendation:
          'Pastikan placeholder [164-00-9988776-5] pada Pasal 3 ayat (3) disesuaikan dengan nomor rekening bank aktual dan Lampiran I (SOW) dilampirkan saat penandatanganan.',
      },
    ],
  },
  {
    id: 'doc-pkwt-2026',
    updatedAt: '29 September 2026, 18:30 WIB',
    promptUsed:
      'Buatkan Perjanjian Kerja Waktu Tertentu (PKWT) untuk posisi Senior Product Manager di PT Sinar Teknologi Nusantara dengan gaji Rp 24.500.000/bulan selama 12 bulan sesuai UU Cipta Kerja.',
    title: 'PERJANJIAN KERJA WAKTU TERTENTU (PKWT)',
    subtitle: 'Hubungan Kerja Jabatan Senior Product Manager — Divisi Produk & Teknologi',
    documentNumber: 'No. 109/HR-PKWT/STN/IX/2026',
    category: 'Ketenagakerjaan',
    jurisdiction: 'UU Cipta Kerja & PP No. 35 Tahun 2021 · PHI Jakarta',
    effectiveDate: '1 Oktober 2026',
    openingText:
      'Pada hari ini, Selasa, tanggal dua puluh sembilan bulan September tahun dua ribu dua puluh enam (29-09-2026), bertempat di Jakarta, yang bertanda tangan di bawah ini:',
    partyOne: {
      name: 'PT Sinar Teknologi Nusantara',
      role: 'PIHAK PERTAMA (PENGUSAHA / PERUSAHAAN)',
      representative: 'Clarissa Wijaya, S.Psi., M.M. — Direktur Sumber Daya Manusia',
      address: 'District 8 Treasury Tower Lt. 27, SCBD Lot 28, Jakarta Selatan 12190',
      description:
        'Suatu perseroan terbatas yang didirikan menurut hukum Republik Indonesia, dalam hal ini diwakili oleh Clarissa Wijaya, S.Psi., M.M. selaku Direktur Sumber Daya Manusia, bertindak untuk dan atas nama PT Sinar Teknologi Nusantara, selanjutnya disebut "PERUSAHAAN" atau "PIHAK PERTAMA".',
    },
    partyTwo: {
      name: 'Arya Pratama, S.Kom.',
      role: 'PIHAK KEDUA (PEKERJA / KARYAWAN)',
      representative: 'Arya Pratama, S.Kom. — Pribadi (NIK: [3174091208940002])',
      address: 'Jl. Cempaka Putih Tengah XXVII No. 14, Jakarta Pusat 10510',
      description:
        'Warga Negara Indonesia, pemegang Kartu Tanda Penduduk dengan NIK [3174091208940002], dalam hal ini bertindak untuk dan atas nama dirinya sendiri, selanjutnya disebut sebagai "PEKERJA" atau "PIHAK KEDUA".',
    },
    recitals: [
      'Bahwa, PIHAK PERTAMA membutuhkan tenaga profesional dengan kompetensi manajemen produk digital untuk menyelesaikan proyek pengembangan lini produk periode tahun 2026–2027;',
      'Bahwa, PIHAK KEDUA menyatakan memiliki kualifikasi, keahlian, dan kesanggupan untuk bekerja pada PIHAK PERTAMA dalam ikatan hubungan kerja waktu tertentu;',
      'Bahwa, Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja Waktu Tertentu (PKWT) yang tunduk pada ketentuan Undang-Undang Ketenagakerjaan sebagaimana diubah dengan Undang-Undang Cipta Kerja serta Peraturan Pemerintah Nomor 35 Tahun 2021.',
    ],
    clauses: [
      {
        id: 'pkwt-1',
        number: 'Pasal 1',
        title: 'JABATAN, PENEMPATAN, DAN JANGKA WAKTU KERJA',
        legalBasis: 'Pasal 56 UU Ketenagakerjaan & PP No. 35/2021',
        riskLevel: 'Kritis',
        content: [
          '(1) PIHAK PERTAMA menerima PIHAK KEDUA untuk bekerja dengan jabatan sebagai Senior Product Manager pada Divisi Produk & Teknologi dengan lokasi penempatan kerja di Kantor Pusat Jakarta Selatan.',
          '(2) Perjanjian Kerja Waktu Tertentu ini berlaku selama 12 (dua belas) bulan, terhitung efektif mulai tanggal 1 Oktober 2026 sampai dengan tanggal 30 September 2027.',
          '(3) Sesuai ketentuan Pasal 58 Undang-Undang Ketenagakerjaan, PKWT ini tidak mensyaratkan adanya masa percobaan kerja (probation).',
        ],
      },
      {
        id: 'pkwt-2',
        number: 'Pasal 2',
        title: 'UPAH, TUNJANGAN, DAN FASILITAS KESEJAHTERAAN',
        legalBasis: 'PP No. 36 Tahun 2021 tentang Pengupahan',
        riskLevel: 'Kritis',
        content: [
          '(1) PIHAK KEDUA berhak menerima kompensasi bulanan dengan rincian:\n   a. Gaji Pokok sebesar Rp 21.000.000,- (dua puluh satu juta Rupiah) per bulan;\n   b. Tunjangan Tetap Jabatan & Transportasi sebesar Rp 3.500.000,- (tiga juta lima ratus ribu Rupiah) per bulan;\n   sehingga total penerimaan tetap kotor (gross) adalah Rp 24.500.000,- (dua puluh empat juta lima ratus ribu Rupiah) per bulan.',
          '(2) Pembayaran upah dilakukan setiap tanggal 25 (dua puluh lima) pada bulan berjalan melalui rekening Bank BCA atas nama PIHAK KEDUA setelah dipotong Pajak Penghasilan (PPh Pasal 21) dan iuran BPJS sesuai ketentuan yang berlaku.',
          '(3) PIHAK KEDUA diikutsertakan dalam program BPJS Kesehatan, BPJS Ketenagakerjaan, serta berhak atas Tunjangan Hari Raya (THR) Keagamaan secara proporsional atau penuh sesuai Peraturan Menteri Ketenagakerjaan.',
        ],
      },
      {
        id: 'pkwt-3',
        number: 'Pasal 3',
        title: 'WAKTU KERJA DAN HAK CUTI TAHUNAN',
        legalBasis: 'Pasal 77 & 79 UU Ketenagakerjaan',
        riskLevel: 'Standar',
        content: [
          '(1) Waktu kerja reguler adalah 5 (lima) hari kerja dalam seminggu, yaitu hari Senin sampai dengan Jumat pukul 09.00 WIB hingga 18.00 WIB (termasuk 1 jam waktu istirahat), dengan skema kerja hibrida (Hybrid Work Arrangement) sesuai kebijakan Perusahaan.',
          '(2) PIHAK KEDUA diberikan hak izin cuti berbayar sebanyak 12 (dua belas) hari kerja selama periode kontrak 12 bulan yang penggunaannya wajib diajukan minimal 3 (tiga) hari kerja sebelumnya.',
        ],
      },
      {
        id: 'pkwt-4',
        number: 'Pasal 4',
        title: 'UANG KOMPENSASI BERAKHIRNYA PKWT',
        legalBasis: 'Pasal 15 & 16 PP No. 35 Tahun 2021',
        riskLevel: 'Kritis',
        content: [
          '(1) Pada saat berakhirnya jangka waktu PKWT sebagaimana dimaksud dalam Pasal 1 ayat (2), PIHAK PERTAMA wajib memberikan Uang Kompensasi kepada PIHAK KEDUA sesuai ketentuan Pasal 15 dan Pasal 16 Peraturan Pemerintah Nomor 35 Tahun 2021.',
          '(2) Besaran Uang Kompensasi untuk masa kerja 12 (dua belas) bulan terus-menerus adalah sebesar 1 (satu) bulan Upah (Gaji Pokok ditambah Tunjangan Tetap).',
        ],
      },
      {
        id: 'pkwt-5',
        number: 'Pasal 5',
        title: 'KERAHASIAAN DAN HAK KEKAYAAN INTELEKTUAL',
        legalBasis: 'UU Rahasia Dagang & UU Hak Cipta',
        riskLevel: 'Perhatian',
        content: [
          '(1) Seluruh dokumen strategi produk, kode program, riset pengguna, dan rahasia dagang yang dibuat oleh PIHAK KEDUA selama masa hubungan kerja merupakan milik eksklusif PIHAK PERTAMA.',
          '(2) PIHAK KEDUA dilarang membocorkan informasi rahasia milik PIHAK PERTAMA kepada pihak ketiga baik selama masa kerja maupun setelah berakhirnya hubungan kerja.',
        ],
      },
      {
        id: 'pkwt-6',
        number: 'Pasal 6',
        title: 'PENGAKHIRAN HUBUNGAN KERJA DAN PENYELESAIAN PERSELISIHAN',
        legalBasis: 'Pasal 62 UU Ketenagakerjaan & UU No. 2/2004',
        riskLevel: 'Perhatian',
        content: [
          '(1) Apabila salah satu Pihak mengakhiri hubungan kerja sebelum berakhirnya jangka waktu yang ditetapkan dalam PKWT ini bukan karena alasan sebagaimana dimaksud dalam Pasal 61 ayat (1) UU Ketenagakerjaan, maka Pihak yang mengakhiri wajib memperhatikan ketentuan ganti rugi dan kompensasi sesuai peraturan perundang-undangan yang berlaku.',
          '(2) Segala perselisihan hubungan industrial diselesaikan terlebih dahulu secara bipartit dengan musyawarah mufakat, dan apabila tidak tercapai kesepakatan maka diselesaikan melalui mekanisme Dinas Ketenagakerjaan serta Pengadilan Hubungan Industrial (PHI) pada Pengadilan Negeri Jakarta Pusat.',
        ],
      },
    ],
    closingText:
      'Demikian Perjanjian Kerja Waktu Tertentu ini dibuat dalam rangkap 2 (dua) asli bermaterai cukup yang masing-masing mempunyai kekuatan hukum yang sama, dan mulai berlaku sejak tanggal ditandatangani oleh Para Pihak.',
    signingLocation: 'Jakarta',
    variables: [
      { key: 'Nama Perusahaan', value: 'PT Sinar Teknologi Nusantara', category: 'Para Pihak' },
      { key: 'Nama Pekerja', value: 'Arya Pratama, S.Kom.', category: 'Para Pihak' },
      { key: 'NIK Pekerja', value: '[3174091208940002]', category: 'Para Pihak' },
      { key: 'Gaji Pokok', value: 'Rp 21.000.000,-', category: 'Finansial' },
      { key: 'Tunjangan Tetap', value: 'Rp 3.500.000,-', category: 'Finansial' },
      { key: 'Masa Kontrak', value: '12 (dua belas) bulan', category: 'Waktu' },
      { key: 'Tanggal Mulai Kerja', value: '1 Oktober 2026', category: 'Waktu' },
    ],
    auditNotes: [
      {
        title: 'Kepatuhan Larangan Masa Probation pada PKWT',
        severity: 'Aman',
        recommendation:
          'Pasal 1 ayat (3) secara tegas tidak mencantumkan masa percobaan (probation). Sesuai Pasal 58 UU Ketenagakerjaan, syarat masa percobaan pada PKWT batal demi hukum.',
      },
      {
        title: 'Kewajiban Uang Kompensasi PP No. 35/2021 Tercantum',
        severity: 'Aman',
        recommendation:
          'Pasal 4 telah mengatur hak Uang Kompensasi sebesar 1 bulan upah setelah masa kontrak 12 bulan berakhir sesuai regulasi terbaru.',
      },
    ],
  },
  {
    id: 'doc-nda-mutual-2026',
    updatedAt: '29 September 2026, 17:15 WIB',
    promptUsed:
      'Buatkan Perjanjian Kerahasiaan Informasi Dua Arah (Mutual NDA) antara PT Mandala Ventura Indonesia dan PT Pangan Lestari Nusantara untuk penjajakan investasi.',
    title: 'PERJANJIAN KERAHASIAAN INFORMASI DUA ARAH',
    subtitle: 'Mutual Non-Disclosure Agreement (NDA) dalam Rangka Penjajakan Investasi Strategis',
    documentNumber: 'No. 019/NDA-MVI/IX/2026',
    category: 'Kerahasiaan (NDA)',
    jurisdiction: 'Hukum Republik Indonesia · BANI Jakarta',
    effectiveDate: '29 September 2026',
    openingText:
      'Pada hari ini, Selasa, tanggal dua puluh sembilan bulan September tahun dua ribu dua puluh enam (29-09-2026), telah dibuat dan ditandatangani Perjanjian Kerahasiaan Informasi Dua Arah ("Perjanjian") oleh dan antara:',
    partyOne: {
      name: 'PT Mandala Ventura Indonesia',
      role: 'PIHAK PERTAMA',
      representative: 'Raden Bagus Santoso — Managing Partner',
      address: 'Pacific Century Place Lt. 32, SCBD Lot 10, Jakarta Selatan 12190',
      description:
        'Suatu perseroan terbatas yang didirikan berdasarkan hukum Republik Indonesia, diwakili secara sah oleh Raden Bagus Santoso selaku Managing Partner, selanjutnya disebut "PIHAK PERTAMA".',
    },
    partyTwo: {
      name: 'PT Pangan Lestari Nusantara',
      role: 'PIHAK KEDUA',
      representative: 'Nadia Maharani, S.T. — Direktur Utama',
      address: 'Kawasan Industri Jababeka Tahap II Blok EE-4, Cikarang, Bekasi 17530',
      description:
        'Suatu perseroan terbatas yang didirikan berdasarkan hukum Republik Indonesia, diwakili secara sah oleh Nadia Maharani, S.T. selaku Direktur Utama, selanjutnya disebut "PIHAK KEDUA".',
    },
    recitals: [
      'Bahwa, Para Pihak bermaksud mengadakan diskusi, pertukaran data, dan uji tuntas (due diligence) sehubungan dengan penjajakan potensi kerjasama investasi strategis ("Tujuan Kerjasama");',
      'Bahwa, dalam rangka Tujuan Kerjasama tersebut, masing-masing Pihak dapat bertindak sebagai Pihak Pengungkap (Disclosing Party) sekaligus Pihak Penerima (Receiving Party) atas Informasi Rahasia;',
      'Bahwa, Para Pihak sepakat untuk melindungi seluruh Informasi Rahasia agar tidak disalahgunakan atau diungkapkan kepada pihak ketiga tanpa izin tertulis.',
    ],
    clauses: [
      {
        id: 'nda-1',
        number: 'Pasal 1',
        title: 'DEFINISI INFORMASI RAHASIA',
        legalBasis: 'UU No. 30 Tahun 2000 tentang Rahasia Dagang',
        riskLevel: 'Kritis',
        content: [
          '(1) "Informasi Rahasia" mencakup seluruh data laporan keuangan, proyeksi bisnis, resep produksi, algoritma, daftar pemasok, struktur harga, data pelanggan, maupun dokumen yang diberikan secara tertulis, lisan, maupun elektronik oleh Pihak Pengungkap kepada Pihak Penerima.',
          '(2) Informasi Rahasia tidak termasuk informasi yang: (a) telah menjadi milik publik bukan karena pelanggaran Perjanjian ini; (b) telah dimiliki secara sah oleh Pihak Penerima sebelum diungkapkan; atau (c) wajib dibuka berdasarkan perintah pengadilan atau otoritas regulator yang berwenang.',
        ],
      },
      {
        id: 'nda-2',
        number: 'Pasal 2',
        title: 'KEWAJIBAN MENJAGA KERAHASIAAN',
        legalBasis: 'Pasal 1338 KUHPerdata & UU Rahasia Dagang',
        riskLevel: 'Kritis',
        content: [
          '(1) Pihak Penerima wajib menjaga kerahasiaan Informasi Rahasia dengan tingkat kehati-hatian yang sama tingginya dengan perlindungan terhadap informasi rahasia miliknya sendiri, dan semata-mata menggunakannya hanya untuk Tujuan Kerjasama.',
          '(2) Pihak Penerima hanya diperkenankan membagikan Informasi Rahasia kepada direksi, karyawan, atau penasihat hukum/keuangan internal yang secara mutlak perlu mengetahui (need-to-know basis) dan terikat kewajiban kerahasiaan setara.',
        ],
      },
      {
        id: 'nda-3',
        number: 'Pasal 3',
        title: 'PENGEMBALIAN DAN PEMUSNAHAN DOKUMEN',
        legalBasis: 'UU No. 27 Tahun 2022 (UU PDP)',
        riskLevel: 'Standar',
        content: [
          '(1) Atas permintaan tertulis dari Pihak Pengungkap atau apabila penjajakan Tujuan Kerjasama dihentikan, Pihak Penerima wajib dalam waktu 7 (tujuh) Hari Kerja mengembalikan atau memusnahkan secara permanen seluruh salinan Informasi Rahasia.',
        ],
      },
      {
        id: 'nda-4',
        number: 'Pasal 4',
        title: 'JANGKA WAKTU DAN PENYELESAIAN SENGKETA',
        legalBasis: 'UU No. 30 Tahun 1999 tentang Arbitrase',
        riskLevel: 'Standar',
        content: [
          '(1) Perjanjian ini berlaku selama 3 (tiga) tahun sejak tanggal penandatanganan, dan kewajiban kerahasiaan tetap bertahan selama 2 (dua) tahun tambahan setelah berakhirnya Perjanjian.',
          '(2) Setiap sengketa yang timbul dari Perjanjian ini diselesaikan secara musyawarah, dan apabila tidak tercapai mufakat dalam 30 (tiga puluh) hari, diselesaikan melalui Badan Arbitrase Nasional Indonesia (BANI) di Jakarta.',
        ],
      },
    ],
    closingText:
      'Demikian Perjanjian Kerahasiaan Informasi Dua Arah ini dibuat dalam rangkap 2 (dua) asli bermaterai cukup dan ditandatangani oleh wakil sah Para Pihak pada tanggal sebagaimana disebutkan di bagian awal Perjanjian.',
    signingLocation: 'Jakarta',
    variables: [
      { key: 'Pihak Pertama', value: 'PT Mandala Ventura Indonesia', category: 'Para Pihak' },
      { key: 'Pihak Kedua', value: 'PT Pangan Lestari Nusantara', category: 'Para Pihak' },
      { key: 'Durasi Berlaku NDA', value: '3 (tiga) tahun', category: 'Waktu' },
      { key: 'Forum Sengketa', value: 'BANI Jakarta', category: 'Yurisdiksi' },
    ],
    auditNotes: [
      {
        title: 'Perlindungan Timbal Balik (Mutual Protection)',
        severity: 'Aman',
        recommendation:
          'Struktur NDA bersifat dua arah sehingga melindungi baik data valuasi investor maupun rahasia dagang operasional perusahaan target.',
      },
    ],
  },
  {
    id: 'doc-surat-kuasa-klien-2026',
    updatedAt: '30 September 2026, 09:30 WIB',
    promptUsed:
      'Buatkan Surat Kuasa Khusus untuk Klien (Litigasi & Non-Litigasi) lengkap dengan rincian wewenang tindakan hukum, Hak Substitusi Pasal 1803 KUHPerdata, dan Hak Retensi Pasal 1812 KUHPerdata.',
    title: 'SURAT KUASA KHUSUS',
    subtitle: 'Pemberian Kuasa Khusus Pendampingan Hukum, Negosiasi & Perwakilan Litigasi Klien',
    documentNumber: 'No. 108/SKK-MKR/IX/2026',
    category: 'Surat Kuasa / Somasi',
    jurisdiction: 'Pengadilan Negeri Jakarta Selatan',
    effectiveDate: '30 September 2026',
    openingText:
      'Yang bertanda tangan di bawah ini, pada hari ini Rabu, tanggal tiga puluh bulan September tahun dua ribu dua puluh enam (30-09-2026), menerangkan dengan sesungguhnya bahwa:',
    partyOne: {
      name: 'PT Nusantara Retailindo',
      role: 'PEMBERI KUASA (KLIEN)',
      representative: 'Hendra Wijaya, S.E., M.B.A. — Direktur Utama',
      address: 'Gedung Menara Sudirman Lt. 18, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan 12190',
      entityType: 'PT',
      description:
        'Suatu perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia, dalam hal ini diwakili secara sah oleh Hendra Wijaya, S.E., M.B.A. selaku Direktur Utama berdasarkan Akta Pendirian dan anggaran dasar perseroan, selanjutnya disebut "PEMBERI KUASA" atau "KLIEN".',
    },
    partyTwo: {
      name: 'Kantor Hukum Mahendra, Kusuma & Rekan',
      role: 'PENERIMA KUASA (KUASA HUKUM)',
      representative: 'Dr. R. Mahendra Kusuma, S.H., M.H. & Partners — Advokat & Konsultan Hukum',
      address: 'Equity Tower Lt. 26 Suite C, SCBD Lot 9, Jl. Jend. Sudirman, Jakarta Selatan 12190',
      entityType: 'CV_Firma',
      description:
        'Para Advokat dan Konsultan Hukum pada Kantor Hukum Mahendra, Kusuma & Rekan, berkewarganegaraan Indonesia, memilih domisili hukum pada alamat kantornya tersebut di atas, baik bertindak bersama-sama maupun sendiri-sendiri, selanjutnya disebut "PENERIMA KUASA".',
    },
    recitals: [
      'Bahwa, PEMBERI KUASA (KLIEN) memerlukan pendampingan hukum, perwakilan negosiasi komersial, serta tindakan hukum litigasi maupun non-litigasi sehubungan dengan perlindungan hak dan kepentingan hukum PEMBERI KUASA;',
      'Bahwa, berdasarkan Pasal 1792 dan Pasal 1795 Kitab Undang-Undang Hukum Perdata (KUHPerdata) jo. Surat Edaran Mahkamah Agung (SEMA) Nomor 6 Tahun 1994, PEMBERI KUASA dengan ini menerangkan memberikan Kuasa Khusus kepada PENERIMA KUASA.',
    ],
    clauses: [
      {
        id: 'skk-1',
        number: 'Pasal 1',
        title: 'POKOK PEMBERIAN KUASA KHUSUS (KHUSUS)',
        legalBasis: 'Pasal 1792 & Pasal 1795 KUHPerdata jo. Pasal 123 HIR / SEMA No. 6/1994',
        riskLevel: 'Kritis',
        plainSummary:
          'Inti Pasal 1: Memberikan wewenang khusus yang sah kepada Penerima Kuasa untuk bertindak mewakili Klien dalam menyelesaikan sengketa tagihan dan perjanjian komersial baik di luar maupun di dalam pengadilan.',
        content: [
          '(1) PEMBERI KUASA dengan ini memberikan Kuasa Khusus kepada PENERIMA KUASA untuk bertindak untuk dan atas nama serta mewakili kepentingan hukum PEMBERI KUASA (KLIEN) dalam menyelesaikan permasalahan hukum, penagihan kewajiban pembayaran senilai Rp 475.000.000,- (empat ratus tujuh puluh lima juta Rupiah), serta sengketa pelaksanaan kontrak komersial terhadap pihak lawan maupun pihak ketiga terkait.',
          '(2) Pemberian kuasa ini bersifat khusus sebagaimana dimaksud dalam Pasal 1795 Kitab Undang-Undang Hukum Perdata dan memenuhi syarat formil Surat Kuasa Khusus berdasarkan Pasal 123 HIR serta SEMA Nomor 6 Tahun 1994.',
        ],
      },
      {
        id: 'skk-2',
        number: 'Pasal 2',
        title: 'RUANG LINGKUP KEWENANGAN TINDAKAN HUKUM',
        legalBasis: 'Pasal 1796 & Pasal 1797 KUHPerdata jo. UU No. 18 Tahun 2003 tentang Advokat',
        riskLevel: 'Perhatian',
        plainSummary:
          'Inti Pasal 2: Merinci tindakan yang boleh dilakukan Kuasa Hukum atas nama Klien, mulai dari mengirim somasi, bernegosiasi, menghadiri sidang pengadilan, hingga menandatangani dokumen hukum.',
        content: [
          '(1) Untuk melaksanakan maksud pada Pasal 1, PENERIMA KUASA berwenang melakukan tindakan hukum non-litigasi maupun litigasi, meliputi: menyusun dan melayangkan Surat Somasi (Teguran Hukum), menghadiri perundingan bipartit atau mediasi, serta menandatangani Berita Acara atau Akta Perdamaian (dading) atas persetujuan tertulis PEMBERI KUASA.',
          '(2) PENERIMA KUASA berwenang menghadap Pejabat Instansi Pemerintah, Notaris, Kepolisian Negara Republik Indonesia, Kejaksaan, Badan Arbitrase Nasional Indonesia (BANI), maupun Kepaniteraan dan Majelis Hakim pada Pengadilan Negeri Jakarta Selatan serta pengadilan tingkat banding, kasasi, hingga peninjauan kembali.',
          '(3) PENERIMA KUASA berwenang mengajukan dan menandatangani Surat Gugatan, Jawaban, Replik, Duplik, daftar alat bukti surat, menghadirkan saksi maupun ahli, memohon peletakan Sita Jaminan (conservatoir beslag), serta memohon pelaksanaan eksekusi putusan.',
        ],
      },
      {
        id: 'skk-3',
        number: 'Pasal 3',
        title: 'HAK SUBSTITUSI DAN HAK RETENSI',
        legalBasis: 'Pasal 1803 & Pasal 1812 KUHPerdata',
        riskLevel: 'Standar',
        plainSummary:
          'Inti Pasal 3: Mengizinkan Kuasa Hukum melimpahkan sebagian tugas kepada rekan advokat lain (hak substitusi) dan menahan berkas perkara sampai kewajiban biaya jasa hukum Klien lunas (hak retensi).',
        content: [
          '(1) Kuasa Khusus ini diberikan dengan Hak Substitusi (recht van substitutie) baik sebagian maupun seluruhnya kepada advokat atau kuasa pengganti lain yang ditunjuk oleh PENERIMA KUASA sesuai ketentuan Pasal 1803 KUHPerdata.',
          '(2) PENERIMA KUASA diberikan pula Hak Retensi berdasarkan Pasal 1812 KUHPerdata untuk menyimpan dan menahan dokumen-dokumen yang berkaitan dengan pemberian kuasa ini sampai seluruh kewajiban honorarium dan biaya operasional hukum diselesaikan oleh PEMBERI KUASA.',
        ],
      },
      {
        id: 'skk-4',
        number: 'Pasal 4',
        title: 'MASA BERLAKU DAN KETENTUAN PENCABUTAN KUASA',
        legalBasis: 'Pasal 1813 & Pasal 1814 KUHPerdata',
        riskLevel: 'Perhatian',
        plainSummary:
          'Inti Pasal 4: Menetapkan bahwa Surat Kuasa ini berlaku selama 6 bulan hingga urusan Klien selesai dan tidak dapat dicabut sepihak tanpa pemberitahuan tertulis 14 hari kerja sebelumnya.',
        content: [
          '(1) Surat Kuasa Khusus ini mulai berlaku efektif sejak tanggal ditandatangani untuk jangka waktu 6 (enam) bulan atau hingga selesainya pokok pemberian kuasa sebagaimana dimaksud dalam Pasal 1.',
          '(2) PEMBERI KUASA tidak akan mencabut Surat Kuasa Khusus ini secara sepihak sebelum berakhirnya urusan hukum yang dikuasakan kecuali dengan pemberitahuan tertulis paling lambat 14 (empat belas) Hari Kerja sebelumnya disertai penyelesaian seluruh hak dan biaya PENERIMA KUASA.',
        ],
      },
    ],
    closingText:
      'Demikian Surat Kuasa Khusus ini dibuat dengan sebenarnya di atas kertas bermaterai cukup untuk dapat dipergunakan sebagaimana mestinya, serta ditandatangani oleh PEMBERI KUASA dan PENERIMA KUASA pada hari dan tanggal tersebut di atas.',
    signingLocation: 'Jakarta',
    variables: [
      { key: 'Nama Klien (Pemberi Kuasa)', value: 'PT Nusantara Retailindo', category: 'Para Pihak' },
      { key: 'Kuasa Hukum (Penerima Kuasa)', value: 'Kantor Hukum Mahendra, Kusuma & Rekan', category: 'Para Pihak' },
      { key: 'Nilai Objek Kuasa', value: 'Rp 475.000.000,-', category: 'Finansial' },
      { key: 'Masa Berlaku Kuasa', value: '6 (enam) bulan', category: 'Waktu' },
      { key: 'Domisili Pengadilan', value: 'Pengadilan Negeri Jakarta Selatan', category: 'Yurisdiksi' },
    ],
    auditNotes: [
      {
        title: 'Kepatuhan Syarat Formil Surat Kuasa Khusus (SEMA No. 6/1994)',
        severity: 'Aman',
        recommendation:
          'Surat Kuasa telah mencantumkan kata "KHUSUS", identitas para pihak, objek sengketa spesifik, dan kompetensi relatif Pengadilan Negeri Jakarta Selatan sesuai syarat sah SEMA No. 6 Tahun 1994.',
      },
      {
        title: 'Pencantuman Hak Substitusi & Hak Retensi',
        severity: 'Aman',
        recommendation:
          'Pasal 3 telah memuat klausul Hak Substitusi (Pasal 1803 KUHPerdata) dan Hak Retensi (Pasal 1812 KUHPerdata) untuk melindungi kelancaran persidangan dan hak profesional Penerima Kuasa.',
      },
    ],
  },
];
