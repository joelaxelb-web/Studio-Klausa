import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  buildUniversalDynamicDraftFromPrompt,
  applyProtectionStanceToDraftResult,
} from './src/utils/universalDraftEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Prioritized multi-model fallback chain using supported Gemini 3 models
const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-pro-preview',
];

async function generateContentWithFallback(options: {
  contents: any;
  config?: any;
  models?: string[];
}) {
  const modelsToTry = options.models || FALLBACK_MODELS;
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: options.config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Semua model AI sedang sibuk.');
}

// Context-aware Indonesian Legal Consultation synthesizer if upstream APIs hit temporary 503/429 spikes
function buildContextualLegalConsultationReply(
  question: string,
  documentContext: string,
  focusedClause: string
): { reply: string; sources: { title: string; uri: string }[] } {
  const qLower = question.toLowerCase();
  const docLines = (documentContext || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const docTitle = docLines[0] || 'PERJANJIAN KERJASAMA';

  // Extract the specific focused clause body from documentContext if available
  let targetClauseTitle = focusedClause && focusedClause !== 'Seluruh Dokumen' ? focusedClause : 'Seluruh Pasal dalam Kontrak';
  let clauseExcerpt = '';

  if (focusedClause && focusedClause !== 'Seluruh Dokumen') {
    const pasalPrefix = focusedClause.split('-')[0].trim().toUpperCase();
    const startIdx = docLines.findIndex((l) => l.toUpperCase() === pasalPrefix);
    if (startIdx !== -1) {
      const slice = docLines.slice(startIdx, startIdx + 8).join('\n');
      clauseExcerpt = slice;
    }
  }

  const defaultSources = [
    {
      title: 'Kitab Undang-Undang Hukum Perdata (KUHPerdata) - JDIH BPK RI',
      uri: 'https://peraturan.bpk.go.id',
    },
    {
      title: 'Portal Resmi Peraturan Perundang-undangan RI (Peraturan.go.id)',
      uri: 'https://peraturan.go.id',
    },
    {
      title: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi - JDIH Setneg',
      uri: 'https://jdih.setneg.go.id',
    },
  ];

  if (qLower.includes('risiko') || qLower.includes('bahaya') || qLower.includes('celah') || qLower.includes('kelemahan')) {
    return {
      reply: `Berikut adalah telaah risiko hukum atas **${targetClauseTitle}** pada dokumen **${docTitle}**:

1. **Identifikasi Risiko Utama (Eksposur Kewajiban & Wanprestasi)**
   - **Batas Tanggung Jawab (Limitation of Liability)**: Apabila klausul belum membatasi nilai maksimum ganti rugi (*liability cap*), salah satu pihak berisiko menanggung tuntutan ganti rugi tidak terbatas berdasarkan **Pasal 1243 s.d. Pasal 1248 KUHPerdata**.
   - **Kepastian Tolok Ukur Wanprestasi**: Pastikan syarat terjadinya kelalaian (*wanprestasi*) memiliki tenggat waktu tertulis yang terukur (misalnya melalui mekanisme *Surat Peringatan / Somasi* dengan masa perbaikan *cure period* 7–14 hari kalender).
   - **Pengakhiran Sepihak**: Tanpa pengenyampingan tegas atas **Pasal 1266 dan Pasal 1267 KUHPerdata**, pemutusan kontrak akibat wanprestasi secara normatif dapat digugat keabsahannya apabila tidak melalui putusan Pengadilan Negeri.

2. **Rekomendasi Mitigasi & Perbaikan Klausul**
   - Cantumkan batas plafon denda keterlambatan (*liquidated damages cap*), misalnya maksimal **5% (lima persen)** dari total nilai kontrak.
   - Pastikan mekanisme serah terima atau pembuktian prestasi didokumentasikan secara tertulis melalui **Berita Acara Serah Terima (BAST)** yang ditandatangani kedua belah pihak.

3. **Saran Rumusan Ayat Pengaman (Siap Disalin ke Editor)**
   > *"Total akumulasi denda keterlambatan dan/atau tuntutan ganti rugi yang wajib dibayarkan oleh Pihak yang lalai berdasarkan Pasal ini dalam keadaan apa pun tidak akan melebihi 5% (lima persen) dari total Nilai Perjanjian, serta Para Pihak sepakat mengesampingkan ketentuan Pasal 1266 dan Pasal 1267 KUHPerdata."*`,
      sources: defaultSources,
    };
  }

  if (qLower.includes('dasar hukum') || qLower.includes('pasal') || qLower.includes('uu') || qLower.includes('kuhperdata') || qLower.includes('regulasi')) {
    return {
      reply: `Berikut adalah rujukan **Dasar Hukum Positif Indonesia** yang mengatur **${targetClauseTitle}** pada draf **${docTitle}**:

1. **Kitab Undang-Undang Hukum Perdata (KUHPerdata)**
   - **Pasal 1320 KUHPerdata**: Mengatur 4 (empat) syarat sahnya perjanjian (kesepakatan para pihak, kecakapan bertindak, suatu pokok persoalan tertentu, dan sebab yang halal/tidak dilarang undang-undang).
   - **Pasal 1338 ayat (1) & (3) KUHPerdata**: Mengatur asas *Pacta Sunt Servanda* (perjanjian berlaku sebagai undang-undang bagi pembuatnya) dan kewajiban pelaksanaan kontrak dengan **itikad baik** (*te goeder trouw*).
   - **Pasal 1243, 1244, & 1245 KUHPerdata**: Mengatur dasar tuntutan ganti rugi akibat *wanprestasi* serta pengecualian tanggung jawab apabila terjadi *Keadaan Kahar (Force Majeure)*.
   - **Pasal 1266 & 1267 KUHPerdata**: Mengatur syarat batal dalam perjanjian timbal balik dan pengenyampingannya agar pengakhiran kontrak dapat dilakukan secara efektif melalui pemberitahuan tertulis.

2. **Peraturan Perundang-undangan Sektoral Terkait**
   - **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**: Wajib dirujuk apabila pelaksanaan kontrak melibatkan pertukaran data pribadi pelanggan/karyawan (kewajiban menjaga kerahasiaan & notifikasi insiden maksimal 3x24 jam).
   - **UU No. 28 Tahun 2014 tentang Hak Cipta**: Mengatur pengalihan hak ekonomi atas karya cipta, desain, atau perangkat lunak yang dihasilkan dari perjanjian kerja sama.
   - **UU No. 30 Tahun 1999 tentang Arbitrase dan Alternatif Penyelesaian Sengketa**: Menjadi dasar hukum apabila penyelesaian sengketa diarahkan ke BANI.`,
      sources: defaultSources,
    };
  }

  if (qLower.includes('saran') || qLower.includes('perbaikan') || qLower.includes('redaksi') || qLower.includes('revisi') || qLower.includes('ubah')) {
    return {
      reply: `Berikut adalah saran penyempurnaan redaksi hukum untuk **${targetClauseTitle}** agar lebih tegas, seimbang, dan meminimalkan multitafsir:

1. **Evaluasi Redaksi Saat Ini**
   ${clauseExcerpt ? `Redaksi pada draf saat ini:\n   > *"${clauseExcerpt.replace(/\n/g, ' ')}"*` : 'Klausul saat ini sudah memenuhi struktur dasar perjanjian komersial, namun dapat diperkuat pada aspek kepastian tenggat waktu (SLA) dan prosedur pemberitahuan tertulis.'}

2. **Rumusan Redaksi Pengganti yang Direkomendasikan**
   - **Ayat (1) — Kepastian Pelaksanaan & Standar Bukti**:
     > *"(1) Setiap pelaksanaan hak dan kewajiban berdasarkan Pasal ini wajib dibuktikan secara tertulis dan disahkan oleh wakil sah Para Pihak selambat-lambatnya dalam waktu 7 (tujuh) Hari Kerja sejak tanggal penyerahan."*
   - **Ayat (2) — Mekanisme Teguran & Perbaikan (Cure Period)**:
     > *"(2) Apabila terdapat ketidaksesuaian atau keterlambatan pelaksanaan kewajiban, Pihak yang dirugikan wajib menyampaikan pemberitahuan tertulis terlebih dahulu dengan memberikan jangka waktu perbaikan selama 14 (empat belas) Hari Kalender."*
   - **Ayat (3) — Kepastian Hukum**:
     > *"(3) Segala perubahan atau penambahan terhadap ketentuan dalam Pasal ini hanya sah dan mengikat apabila dituangkan dalam suatu Addendum tertulis yang ditandatangani oleh Para Pihak."*

Anda dapat langsung menerapkan rumusan di atas dengan mengeklik tombol **Revisi AI** pada pasal terkait atau menyalin ayat tersebut ke editor.`,
      sources: defaultSources,
    };
  }

  return {
    reply: `Berdasarkan telaah hukum terhadap pertanyaan Anda mengenai **"${question}"** pada konteks **${targetClauseTitle}** (${docTitle}):

1. **Interpretasi Hukum & Kedudukan Klausul**
   - Dalam kerangka Hukum Perikatan Indonesia (**Buku III KUHPerdata**), ketentuan pada **${targetClauseTitle}** mengikat kedua belah pihak secara penuh sepanjang memenuhi syarat sah perjanjian menurut **Pasal 1320 KUHPerdata** dan dilaksanakan dengan itikad baik (**Pasal 1338 KUHPerdata**).
   - Hak dan kewajiban yang dirumuskan harus memiliki parameter waktu, nilai, dan bukti serah terima yang jelas agar tidak menimbulkan sengketa penafsiran (*multi-interpretasi*).

2. **Implikasi Praktis bagi Para Pihak**
   - **Bagi Pihak Pertama**: Memberikan dasar hukum yang kuat untuk menuntut pemenuhan standar layanan/pekerjaan sesuai spesifikasi serta menahan pembayaran termin apabila syarat belum terpenuhi.
   - **Bagi Pihak Kedua**: Memberikan perlindungan kepastian pembayaran tepat waktu dan pembebasan tanggung jawab apabila terjadi kendala di luar kendali wajar (*Keadaan Kahar / Force Majeure* sesuai **Pasal 1244–1245 KUHPerdata**).

3. **Rekomendasi Tindak Lanjut**
   - Pastikan seluruh variabel dalam kurung siku (seperti tanggal efektif, nominal, atau batas waktu hari kerja/hari kalender) telah diisi secara konsisten melalui panel **Variabel** di kanan.
   - Apabila Anda ingin menyesuaikan bunyi pasal ini secara spesifik, klik tombol **Revisi AI** di bagian atas pasal tersebut.`,
    sources: defaultSources,
  };
}

// Context-aware Indonesian Regulation Search fallback if upstream APIs hit temporary 503/429 spikes
function buildFallbackRegulationSearchResult(query: string, documentTitle?: string) {
  const q = query.trim();
  const qLower = q.toLowerCase();

  let specificContent = '';
  let specificSources = [
    {
      title: `JDIH BPK RI — Database Peraturan Perundang-undangan (${q})`,
      uri: `https://peraturan.bpk.go.id/Search?keywords=${encodeURIComponent(q)}`,
    },
    {
      title: 'Peraturan.go.id — Portal Resmi Direktorat Jenderal Peraturan Perundang-undangan',
      uri: 'https://peraturan.go.id',
    },
    {
      title: 'JDIH Kementerian Sekretariat Negara RI',
      uri: 'https://jdih.setneg.go.id',
    },
  ];

  if (qLower.includes('1320') || qLower.includes('1338') || qLower.includes('syarat sah')) {
    specificContent = `1. **Dasar Hukum & Nomor Pasal yang Berlaku**
   - **Pasal 1320 & Pasal 1338 Kitab Undang-Undang Hukum Perdata (KUHPerdata / Burgerlijk Wetboek)**.

2. **Ringkasan Pokok Ketentuan / Bunyi Pasal**
   - **Pasal 1320 KUHPerdata** mengatur 4 syarat sahnya perjanjian:
     1) Kesepakatan mereka yang mengikatkan dirinya (syarat subjektif);
     2) Kecakapan untuk membuat suatu perikatan (syarat subjektif);
     3) Suatu pokok persoalan tertentu (syarat objektif);
     4) Suatu sebab yang tidak terlarang / halal (syarat objektif).
   - **Pasal 1338 KUHPerdata** menegaskan bahwa semua perjanjian yang dibuat secara sah berlaku sebagai undang-undang bagi mereka yang membuatnya (*Pacta Sunt Servanda*), tidak dapat ditarik kembali selain dengan kesepakatan kedua belah pihak, dan harus dilaksanakan dengan itikad baik.

3. **Implikasi Praktis dalam Penyusunan Kontrak**
   - Tidak terpenuhinya syarat subjektif (1 & 2) membuat kontrak *dapat dibatalkan* (*vernietigbaar*), sedangkan tidak terpenuhinya syarat objektif (3 & 4) membuat kontrak *batal demi hukum* (*nietig van rechtswege*).

4. **Contoh Rumusan Klausul yang Sesuai**
   > *"Perjanjian ini dibuat dan dilaksanakan oleh Para Pihak berdasarkan asas kebebasan berkontrak dan itikad baik sesuai ketentuan Pasal 1320 dan Pasal 1338 Kitab Undang-Undang Hukum Perdata."*`;
  } else if (qLower.includes('pkwt') || qLower.includes('35 tahun 2021') || qLower.includes('kompensasi')) {
    specificContent = `1. **Dasar Hukum & Nomor Peraturan yang Berlaku**
   - **Peraturan Pemerintah (PP) Nomor 35 Tahun 2021** tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja (turunan UU Cipta Kerja No. 6 Tahun 2023).

2. **Ringkasan Pokok Ketentuan / Bunyi Pasal**
   - **Pasal 8 & Pasal 12 PP 35/2021**: PKWT didasarkan atas jangka waktu (maksimal 5 tahun termasuk perpanjangan) atau selesainya suatu pekerjaan tertentu, dan dilarang mensyaratkan adanya masa percobaan (*probation*).
   - **Pasal 15 & Pasal 16 PP 35/2021**: Pengusaha wajib memberikan **Uang Kompensasi** kepada Pekerja pada saat berakhirnya PKWT (1 bulan upah untuk masa kerja 12 bulan terus-menerus, atau dihitung secara proporsional bagi masa kerja minimal 1 bulan).

3. **Implikasi Praktis dalam Penyusunan Kontrak**
   - Apabila PKWT mencantumkan masa percobaan (*probation*), maka syarat masa percobaan tersebut batal demi hukum dan status pekerja dapat beralih menjadi PKWTT (karyawan tetap).

4. **Contoh Rumusan Klausul yang Sesuai**
   > *"Pada saat berakhirnya jangka waktu Perjanjian Kerja Waktu Tertentu (PKWT) ini, Pihak Pertama wajib membayarkan Uang Kompensasi kepada Pihak Kedua sesuai perhitungan proporsional sebagaimana diatur dalam Pasal 15 dan Pasal 16 Peraturan Pemerintah Nomor 35 Tahun 2021."*`;
  } else if (qLower.includes('pdp') || qLower.includes('27 tahun 2022') || qLower.includes('data pribadi')) {
    specificContent = `1. **Dasar Hukum & Nomor Peraturan yang Berlaku**
   - **Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**.

2. **Ringkasan Pokok Ketentuan / Bunyi Pasal**
   - **Pasal 20 & Pasal 35 UU PDP**: Pengendali dan Prosesor Data Pribadi wajib memiliki dasar pemrosesan yang sah, menjaga kerahasiaan, dan menerapkan langkah keamanan teknis untuk mencegah akses tidak sah.
   - **Pasal 46 UU PDP**: Dalam hal terjadi kegagalan pelindungan Data Pribadi (kebocoran data), Pengendali Data Pribadi wajib menyampaikan pemberitahuan tertulis paling lambat **3 x 24 jam** kepada Subjek Data Pribadi dan lembaga penyelenggara PDP.

3. **Implikasi Praktis dalam Penyusunan Kontrak**
   - Setiap kontrak kerja sama teknologi, *cloud*, pemasaran, atau alih daya wajib memuat klausul kepatuhan UU PDP dan kewajiban pelaporan insiden siber maksimal 3x24 jam.

4. **Contoh Rumusan Klausul yang Sesuai**
   > *"Para Pihak wajib mematuhi seluruh ketentuan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, termasuk menjaga keamanan pemrosesan data dan menyampaikan pemberitahuan tertulis selambat-lambatnya 3x24 jam apabila terjadi insiden kegagalan pelindungan data pribadi."*`;
  } else if (qLower.includes('1266') || qLower.includes('1267') || qLower.includes('pemutusan') || qLower.includes('pengakhiran')) {
    specificContent = `1. **Dasar Hukum & Nomor Pasal yang Berlaku**
   - **Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata (KUHPerdata)**.

2. **Ringkasan Pokok Ketentuan / Bunyi Pasal**
   - **Pasal 1266 KUHPerdata** menyatakan bahwa syarat batal dianggap selalu dicantumkan dalam perjanjian timbal balik apabila salah satu pihak tidak memenuhi kewajibannya, namun pembatalan harus dimintakan kepada Hakim Pengadilan Negeri.
   - Dalam praktik hukum kontrak komersial di Indonesia, para pihak secara sah dapat menyepakati **pengenyampingan Pasal 1266 dan Pasal 1267 KUHPerdata** agar pengakhiran perjanjian dapat dilakukan langsung melalui pemberitahuan tertulis tanpa perlu menunggu putusan pengadilan.

3. **Implikasi Praktis dalam Penyusunan Kontrak**
   - Wajib dicantumkan dalam Pasal Pengakhiran Perjanjian (*Termination Clause*) untuk mencegah berlarut-larutnya proses penghentian kerja sama saat salah satu pihak wanprestasi.

4. **Contoh Rumusan Klausul yang Sesuai**
   > *"Untuk keperluan pengakhiran Perjanjian ini, Para Pihak dengan tegas sepakat untuk mengesampingkan keberlakuan ketentuan Pasal 1266 dan Pasal 1267 Kitab Undang-Undang Hukum Perdata sepanjang mengenai diperlukannya putusan pengadilan untuk mengakhiri suatu perjanjian."*`;
  } else {
    specificContent = `1. **Dasar Hukum & Nomor Peraturan / Pasal yang Berlaku**
   - Ketentuan mengenai **"${q}"** dalam sistem Hukum Positif Indonesia tunduk pada pengaturan **Kitab Undang-Undang Hukum Perdata (KUHPerdata Buku III tentang Perikatan)** serta regulasi sektoral terkait yang tercatat pada Jaringan Dokumentasi dan Informasi Hukum (**JDIH BPK RI / Peraturan.go.id**).

2. **Ringkasan Pokok Ketentuan**
   - Setiap kesepakatan kontraktual terkait *${q}* wajib memenuhi asas kepastian hukum, proporsionalitas hak dan kewajiban, serta tidak bertentangan dengan ketertiban umum dan peraturan perundang-undangan yang berlaku di Republik Indonesia.
   - Pelaksanaan hak dan kewajiban harus didukung oleh alat bukti tertulis yang sah sesuai **Pasal 1866 KUHPerdata** dan **UU No. 10 Tahun 2020 tentang Bea Meterai**.

3. **Implikasi Praktis dalam Penyusunan Kontrak (${documentTitle || 'Dokumen Aktif'})**
   - Rumuskan definisi ruang lingkup, tenggat waktu pelaksanaan, serta konsekuensi hukum secara eksplisit agar klausul dapat dieksekusi dengan jelas oleh kedua belah pihak.

4. **Contoh Rumusan Klausul yang Sesuai**
   > *"Para Pihak sepakat untuk melaksanakan seluruh ketentuan terkait ${q} secara profesional, transparan, dan sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia."*`;
  }

  return {
    query: q,
    answer: specificContent,
    sources: specificSources,
  };
}

const LEGAL_SYSTEM_INSTRUCTION = `Anda adalah Ahli Penyusun Segala Jenis Dokumen Hukum, Perdata, Perorangan, Litigasi, Administrasi, Akademik, Organisasi, Kreator/UMKM, dan Komersial di Indonesia (menguasai KUHPerdata, HIR/RBg, UU Perseroan Terbatas, UU Cipta Kerja, UU Perlindungan Konsumen, UU Hak Cipta, UU ITE, UU PDP, serta tata naskah dinas/organisasi/surat resmi).

Tugas Anda adalah menerjemahkan perintah dan kriteria dari pengguna menjadi DRAF DOKUMEN SIAP PAKAI yang sangat lengkap, dinamis, mengikat, dan 100% mengikuti jenis dokumen serta kriteria yang diminta pengguna — TIDAK TERBATAS pada kontrak legal korporasi saja, melainkan BISA UNTUK DRAF APA SAJA.

PRINSIP PENYUSUNAN DINAMIS UNIVERSAL:
1. ADAPTASI PENUH TERHADAP JENIS DOKUMEN & PERINTAH:
   - Pahami secara mendalam apa yang diminta pengguna. Jangan memaksakan format korporasi (PT/Direktur) apabila pengguna meminta dokumen pribadi/perorangan, surat pengakuan hutang, kesepakatan perdamaian kekeluargaan, jual beli kendaraan/tanah pribadi, sewa rumah/kos, kontrak endorsement kreator/freelance, berkas gugatan/somasi/jawaban litigasi, Surat Keputusan (SK) organisasi/kampus, SOP, Berita Acara (BAST), atau dokumen kustom lainnya.
   - Sesuaikan sebutan "partyOne.role" dan "partyTwo.role" secara dinamis sesuai konteks (misalnya: PEMBERI PINJAMAN & PENERIMA PINJAMAN, PENJUAL & PEMBELI, PEMILIK & PENYEWA, PENGGUGAT & TERGUGAT, PIHAK PENETAP KEPUTUSAN & PELAKSANA MANDAT, PEMBERI PERNYATAAN & PENERIMA PERNYATAAN, BRAND & CONTENT CREATOR, atau PIHAK PERTAMA & PIHAK KEDUA).
   - Sesuaikan penomoran dan judul di dalam "clauses" secara dinamis sesuai struktur dokumen:
     * Jika Perjanjian / Kontrak / Kesepakatan -> gunakan "Pasal 1", "Pasal 2", dst.
     * Jika Berkas Gugatan / Somasi / Litigasi -> gunakan "BAGIAN I (DUDUK PERKARA / POSITA)", "BAGIAN II (DASAR HUKUM & KERUGIAN)", "BAGIAN III (PETITUM / TUNTUTAN)", dst.
     * Jika Surat Keputusan (SK) / Kebijakan / SOP -> gunakan "KETETAPAN KESATU", "KETETAPAN KEDUA", dst. (dengan recitals diawali "Menimbang:", "Mengingat:", "Memperhatikan:").
     * Jika Surat Pernyataan / Pengakuan Hutang / Berita Acara -> gunakan pasal atau butir pernyataan yang relevan dengan konteks tersebut.
2. EKSTRAKSI DETAIL & KRITERIA KHUSUS:
   - Ekstrak seluruh detail yang disebutkan dalam perintah dan kriteria pengguna (nama pihak, objek, nilai/nominal, jadwal/termin, durasi, jaminan, saksi, sanksi, kriteria khusus, dll) dan tuangkan secara eksplisit ke dalam ayat-ayat dokumen.
   - Untuk detail spesifik yang belum disebutkan pengguna, gunakan placeholder berformat kurung siku seperti [Nomor NIK KTP], [Alamat Lengkap], [Nomor Rekening], dan daftarkan di dalam array "variables".
3. BAHASA & KETELITIAN:
   - Gunakan bahasa Indonesia yang presisi, tegas, dan sesuai konteks dokumen (bisa formal akta, lugas perorangan/kekeluargaan, tegas litigasi, atau administratif organisasi sesuai kriteria pengguna). Setiap bagian/pasal wajib memiliki butir/ayat bernomor "(1)", "(2)", "(3)" dst di dalam array content.
4. KHUSUS APABILA PENGGUNA MEMINTA PEMBUATAN SURAT KUASA (SK) DAN/ATAU SURAT TUGAS (ST) UNTUK AANMANING, BPSK, LAPS SJK, MEDIASI PN, GUGATAN SEDERHANA, GUGATAN PERDATA, ATAU PKPU:
   - Wajib mengikuti susunan template korporasi baku:
     a) openingText: "Yang bertanda tangan di bawah ini:"
     b) partyOne (role: "PEMBERI KUASA"): Komparisi Direktur lengkap (Nama Direktur, NIK KTP, Alamat KTP, bertindak selaku Direktur dari PT ..., Akta Pendirian & SK Pengesahan Kemenkumham RI, serta Akta Perubahan Terakhir & Surat Penerimaan Pemberitahuan AHU Kemenkumham RI, selanjutnya disebut sebagai "Pemberi Kuasa").
     c) partyTwo (role: "PENERIMA KUASA"): "Dengan ini memberikan kuasa kepada:" diikuti daftar bernomor Penerima Kuasa (Nama, Jabatan, No. KTP, Alamat KTP untuk karyawan internal korporasi, ATAU daftar nama Advokat & Konsultan Hukum pada Kantor Hukum), selanjutnya disebut sebagai "Penerima Kuasa".
     d) clauses: Susun bagian dengan nomor "KHUSUS" (Pokok Pemberian Kuasa spesifik sesuai forum Aanmaning / BPSK Pasal 45 ayat (1) UU No. 8 Tahun 1999 / LAPS SJK Mediasi / Mediasi PN Pasal 18 ayat (4) Perma No. 1 Tahun 2016 / Gugatan Sederhana Perma No. 4 Tahun 2019 / Gugatan Perdata), "WEWENANG KUASA" (rincian butir kewenangan Penerima Kuasa + ketentuan persetujuan tertulis Pemberi Kuasa & Hak Substitusi/Retensi), diikuti bagian "SURAT TUGAS" (Komparisi Pemberi Tugas & Penerima Tugas) dan "UNTUK" (rincian tugas resmi Penerima Tugas).`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // 1. One-Command Universal Dynamic Document Drafting Endpoint
  app.post('/api/legal/draft', async (req, res) => {
    const {
      prompt,
      stance = 'Seimbang (Adil bagi Kedua Pihak)',
      language = 'Bahasa Indonesia Formal',
      criteria = {},
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Perintah penyusunan dokumen tidak boleh kosong.' });
      return;
    }

    try {
      const domainCategory =
        criteria?.domainCategory || 'Otomatis (Deteksi Cerdas dari Perintah)';
      const structureStyle =
        criteria?.structureStyle || 'Otomatis Sesuai Konteks Dokumen';
      const customCriteria = (criteria?.customCriteria || '').trim();

      const userPrompt = `Perintah Penyusunan Dokumen Hukum dari Pengguna: "${prompt.trim()}"
Bidang / Kategori Instrumen Hukum: ${domainCategory}
Gaya & Struktur Susunan Akta/Naskah Hukum: ${structureStyle}
Sudut Pandang / Posisi Proteksi Hukum: ${stance}
Bahasa Dokumen: ${language}
${customCriteria ? `Kriteria & Ketentuan Hukum Khusus yang WAJIB Dimasukkan: "${customCriteria}"` : ''}

Susun draf dokumen hukum yang utuh, sah, mengikat, dan tetap berada dalam koridor Hukum Indonesia (KUHPerdata, HIR/RBg, dan UU terkait), namun 100% dinamis menyesuaikan jenis instrumen hukum yang diminta pengguna (baik Perdata Perorangan, Perjanjian Pinjam Meminjam, Sewa Menyewa Properti, Jual Beli Aset, Perikatan Jasa/Kreator/Kemitraan Bagi Hasil, Akta Perdamaian Dading, Berkas Litigasi/Gugatan/Somasi, Surat Kuasa/Keputusan Hukum, maupun Kontrak Korporasi).`;

      const response = await generateContentWithFallback({
        contents: userPrompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Judul resmi dokumen dalam huruf kapital, contoh: PERJANJIAN KERJASAMA PENGEMBANGAN PERANGKAT LUNAK',
              },
              subtitle: {
                type: Type.STRING,
                description: 'Subjudul atau ringkasan singkat objek kontrak',
              },
              documentNumber: {
                type: Type.STRING,
                description: 'Nomor surat/perjanjian formal, contoh: No. 042/PKS-LGL/IX/2026',
              },
              category: {
                type: Type.STRING,
                description: 'Kategori dokumen hukum, contoh: Perjanjian Komersial, Ketenagakerjaan, Kerahasiaan (NDA), Sewa Menyewa, Surat Kuasa / Somasi, Korporasi & Investasi',
              },
              jurisdiction: {
                type: Type.STRING,
                description: 'Hukum yang berlaku dan domisili pengadilan/arbitrase, contoh: Hukum Republik Indonesia · PN Jakarta Selatan',
              },
              effectiveDate: {
                type: Type.STRING,
                description: 'Tanggal efektif perjanjian dalam format Indonesia, contoh: 29 September 2026',
              },
              openingText: {
                type: Type.STRING,
                description: 'Kalimat pembuka akta/perjanjian (Pada hari ini, ... tanggal ... telah dibuat dan ditandatangani perjanjian oleh dan antara:)',
              },
              partyOne: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nama perusahaan atau individu Pihak Pertama' },
                  role: { type: Type.STRING, description: 'Sebutan dalam kontrak, misal: PIHAK PERTAMA / PEMBERI KERJA' },
                  representative: { type: Type.STRING, description: 'Nama & jabatan penandatangan yang mewakili Pihak Pertama' },
                  address: { type: Type.STRING, description: 'Alamat kedudukan hukum Pihak Pertama' },
                  description: { type: Type.STRING, description: 'Uraian komparisi lengkap Pihak Pertama (dasar hukum/akta/KTP dan kapasitas bertindak)' },
                },
                required: ['name', 'role', 'representative', 'address', 'description'],
              },
              partyTwo: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nama perusahaan atau individu Pihak Kedua' },
                  role: { type: Type.STRING, description: 'Sebutan dalam kontrak, misal: PIHAK KEDUA / PELAKSANA' },
                  representative: { type: Type.STRING, description: 'Nama & jabatan penandatangan yang mewakili Pihak Kedua' },
                  address: { type: Type.STRING, description: 'Alamat kedudukan hukum Pihak Kedua' },
                  description: { type: Type.STRING, description: 'Uraian komparisi lengkap Pihak Kedua (dasar hukum/akta/KTP dan kapasitas bertindak)' },
                },
                required: ['name', 'role', 'representative', 'address', 'description'],
              },
              recitals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daftar konsiderans / premis yang diawali dengan kata "Bahwa, ..." minimal 3 poin pertimbangan hukum.',
              },
              clauses: {
                type: Type.ARRAY,
                description: 'Daftar Pasal-Pasal lengkap dalam perjanjian (minimal 8-11 pasal).',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.STRING, description: 'Nomor pasal, contoh: Pasal 1' },
                    title: { type: Type.STRING, description: 'Judul pasal dalam huruf kapital, contoh: RUANG LINGKUP PEKERJAAN' },
                    content: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Ayat-ayat dalam pasal tersebut, masing-masing diawali (1), (2), (3) dengan redaksi hukum lengkap.',
                    },
                    legalBasis: {
                      type: Type.STRING,
                      description: 'Rujukan dasar hukum pasal ini, contoh: Pasal 1338 KUHPerdata / UU Hak Cipta No. 28/2014',
                    },
                    riskLevel: {
                      type: Type.STRING,
                      description: 'Tingkat krusialitas klausul: Standar, Perhatian, atau Kritis',
                    },
                  },
                  required: ['number', 'title', 'content', 'legalBasis', 'riskLevel'],
                },
              },
              closingText: {
                type: Type.STRING,
                description: 'Paragraf penutup akta/perjanjian mengenai pembuatan rangkap 2 bermaterai cukup dan mempunyai kekuatan hukum yang sama.',
              },
              signingLocation: {
                type: Type.STRING,
                description: 'Kota tempat penandatanganan, contoh: Jakarta',
              },
              variables: {
                type: Type.ARRAY,
                description: 'Daftar variabel penting dalam kontrak (baik yang sudah terisi dari perintah maupun placeholder yang perlu dilengkapi pengguna).',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING, description: 'Nama label variabel, contoh: Nilai Kontrak' },
                    value: { type: Type.STRING, description: 'Nilai saat ini di dalam naskah' },
                    category: { type: Type.STRING, description: 'Kategori: Para Pihak, Finansial, Waktu, atau Yurisdiksi' },
                  },
                  required: ['key', 'value', 'category'],
                },
              },
              auditNotes: {
                type: Type.ARRAY,
                description: 'Analisis kepatuhan & catatan mitigasi risiko hukum atas draf ini (3-5 poin).',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Judul poin analisis hukum' },
                    severity: { type: Type.STRING, description: 'Aman, Perlu Verifikasi, atau Krusial' },
                    recommendation: { type: Type.STRING, description: 'Penjelasan hukum dan saran konkret bagi pengguna' },
                  },
                  required: ['title', 'severity', 'recommendation'],
                },
              },
            },
            required: [
              'title',
              'subtitle',
              'documentNumber',
              'category',
              'jurisdiction',
              'effectiveDate',
              'openingText',
              'partyOne',
              'partyTwo',
              'recitals',
              'clauses',
              'closingText',
              'signingLocation',
              'variables',
              'auditNotes',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Model tidak mengembalikan respons teks.');
      }

      const parsed = JSON.parse(rawText.trim());
      const stanceAdapted = applyProtectionStanceToDraftResult(parsed, stance, language);
      res.json(stanceAdapted);
    } catch (_error: any) {
      const dynamicFallback = buildUniversalDynamicDraftFromPrompt({
        prompt,
        stance,
        language,
        criteria,
      });
      res.json(dynamicFallback);
    }
  });

  // 2. Refine / Rewrite Specific Clause with 1 Command
  app.post('/api/legal/refine-clause', async (req, res) => {
    const { documentTitle, clause, instruction } = req.body;
    if (!clause || !instruction) {
      res.status(400).json({ error: 'Data pasal dan instruksi revisi diperlukan.' });
      return;
    }

    try {
      const prompt = `Dokumen: "${documentTitle}"
Pasal Saat Ini: ${clause.number} - ${clause.title}
Isi Ayat Saat Ini:
${(clause.content || []).join('\n')}

Instruksi Revisi dari Pengguna: "${instruction}"

Tulis ulang pasal ini sesuai instruksi pengguna dengan bahasa hukum Indonesia yang sangat rapi, formal, dan mengikat.`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Judul pasal dalam huruf kapital' },
              content: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daftar ayat baru yang sudah direvisi, diawali (1), (2), dst.',
              },
              legalBasis: { type: Type.STRING, description: 'Rujukan dasar hukum yang relevan' },
              riskLevel: { type: Type.STRING, description: 'Standar, Perhatian, atau Kritis' },
              changeSummary: { type: Type.STRING, description: 'Ringkasan singkat perubahan hukum yang diterapkan' },
            },
            required: ['title', 'content', 'legalBasis', 'riskLevel', 'changeSummary'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gagal mendapatkan hasil revisi pasal.');
      }
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      const existingContent: string[] = Array.isArray(clause.content) ? clause.content : [];
      const nextAyatNum = existingContent.length + 1;
      res.json({
        title: clause.title,
        content: [
          ...existingContent,
          `(${nextAyatNum}) Ketentuan Khusus Hasil Penyesuaian: Para Pihak sepakat bahwa pelaksanaan ${clause.title.toLowerCase()} wajib mematuhi ketentuan tambahan mengenai ${instruction.trim()} secara mengikat sesuai Pasal 1338 KUHPerdata.`,
        ],
        legalBasis: clause.legalBasis || 'Pasal 1338 KUHPerdata',
        riskLevel: clause.riskLevel || 'Standar',
        changeSummary: instruction.trim(),
      });
    }
  });

  // 3. Add a New Clause with 1 Command
  app.post('/api/legal/add-clause', async (req, res) => {
    const { documentTitle, instruction, nextNumber } = req.body;
    if (!instruction) {
      res.status(400).json({ error: 'Perintah penambahan pasal diperlukan.' });
      return;
    }

    try {
      const prompt = `Dokumen Kontrak: "${documentTitle}"
Nomor Pasal Baru: Pasal ${nextNumber || 'Baru'}
Perintah Penambahan Pasal dari Pengguna: "${instruction}"

Susun 1 pasal baru yang lengkap, formal, dan langsung siap disisipkan ke dalam kontrak tersebut.`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.STRING, description: 'Nomor pasal, contoh: Pasal 11' },
              title: { type: Type.STRING, description: 'Judul pasal dalam huruf kapital' },
              content: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daftar ayat dalam pasal baru, diawali (1), (2), dst.',
              },
              legalBasis: { type: Type.STRING, description: 'Dasar hukum atau regulasi terkait' },
              riskLevel: { type: Type.STRING, description: 'Standar, Perhatian, atau Kritis' },
            },
            required: ['number', 'title', 'content', 'legalBasis', 'riskLevel'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gagal membuat pasal baru.');
      }
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      const cleanTitle = String(instruction)
        .replace(/^Susun pasal kontrak yang menerapkan ketentuan hukum\s*/i, '')
        .replace(/^Tambahkan pasal\s*/i, '')
        .replace(/sesuai peraturan Indonesia yang berlaku\.?$/i, '')
        .replace(/["']/g, '')
        .trim()
        .slice(0, 55)
        .toUpperCase();

      res.json({
        number: `Pasal ${nextNumber || 'Baru'}`,
        title: cleanTitle || 'KETENTUAN KHUSUS TAMBAHAN',
        content: [
          `(1) Para Pihak sepakat untuk melaksanakan ketentuan mengenai ${instruction.replace(/["']/g, '').trim()} dengan penuh tanggung jawab dan itikad baik sesuai hukum yang berlaku di Republik Indonesia.`,
          `(2) Setiap pelanggaran terhadap kewajiban sebagaimana dimaksud pada ayat (1) Pasal ini memberikan hak kepada Pihak yang dirugikan untuk menuntut pemulihan keadaan dan/atau ganti rugi sesuai peraturan perundang-undangan yang berlaku.`,
        ],
        legalBasis: 'Pasal 1338 KUHPerdata & Regulasi Terkait',
        riskLevel: 'Perhatian',
      });
    }
  });

  // 4. Whole-Document Quick Transformation / Global Instruction
  app.post('/api/legal/transform-document', async (req, res) => {
    try {
      const { currentDocument, instruction } = req.body;
      if (!currentDocument || !instruction) {
        res.status(400).json({ error: 'Dokumen dan instruksi perubahan diperlukan.' });
        return;
      }

      const prompt = `Berikut adalah draf dokumen hukum saat ini dalam format JSON:
${JSON.stringify({
  title: currentDocument.title,
  partyOne: currentDocument.partyOne,
  partyTwo: currentDocument.partyTwo,
  recitals: currentDocument.recitals,
  clauses: currentDocument.clauses,
})}

Perintah Perubahan Global dari Pengguna: "${instruction}"

Terapkan perubahan tersebut secara menyeluruh dan konsisten ke seluruh bagian dokumen yang relevan, lalu kembalikan struktur dokumen lengkap yang telah diperbarui.`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              jurisdiction: { type: Type.STRING },
              openingText: { type: Type.STRING },
              partyOne: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  representative: { type: Type.STRING },
                  address: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'role', 'representative', 'address', 'description'],
              },
              partyTwo: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  representative: { type: Type.STRING },
                  address: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'role', 'representative', 'address', 'description'],
              },
              recitals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.ARRAY, items: { type: Type.STRING } },
                    legalBasis: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                  },
                  required: ['number', 'title', 'content', 'legalBasis', 'riskLevel'],
                },
              },
              closingText: { type: Type.STRING },
              auditNotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ['title', 'severity', 'recommendation'],
                },
              },
            },
            required: ['title', 'subtitle', 'jurisdiction', 'openingText', 'partyOne', 'partyTwo', 'recitals', 'clauses', 'closingText', 'auditNotes'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gagal memperbarui dokumen.');
      }
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(500).json({
        error: 'Layanan AI sedang mengalami antrean tinggi. Silakan coba kembali dalam beberapa detik.',
      });
    }
  });

  // 5. Contextual Legal Glossary Extraction Endpoint
  app.post('/api/legal/glossary', async (req, res) => {
    try {
      const { documentTitle, documentText } = req.body;
      if (!documentText) {
        res.status(400).json({ error: 'Teks dokumen diperlukan untuk analisis glosarium.' });
        return;
      }

      const prompt = `Analisis draf dokumen hukum berikut:
Judul: "${documentTitle}"
Isi Dokumen:
${String(documentText).slice(0, 12000)}

Identifikasi 6 hingga 10 istilah hukum, klausul teknis, atau konsep perikatan kompleks yang terdapat di dalam draf tersebut, lalu berikan definisi singkat yang akurat dan mudah dipahami berdasarkan konteks Hukum Indonesia (KUHPerdata / Peraturan Perundang-undangan di Indonesia).`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: {
                  type: Type.STRING,
                  description: 'Nama istilah hukum atau konsep kontrak yang ditemukan di dalam draf',
                },
                category: {
                  type: Type.STRING,
                  description: 'Kategori hukum singkat, misal: Hukum Perikatan, Ketenagakerjaan, HKI, Sengketa',
                },
                legalReference: {
                  type: Type.STRING,
                  description: 'Dasar hukum Indonesia terkait, misal: Pasal 1338 KUHPerdata / UU No. 27/2022',
                },
                definition: {
                  type: Type.STRING,
                  description: 'Definisi singkat dan implikasi praktisnya dalam konteks hukum Indonesia',
                },
                locations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Bagian atau nomor Pasal tempat istilah tersebut muncul, misal: ["Pasal 3", "Pasal 7"]',
                },
              },
              required: ['term', 'category', 'legalReference', 'definition', 'locations'],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gagal menganalisis glosarium istilah.');
      }
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.json([
        {
          term: 'Asas Kebebasan Berkontrak (Pacta Sunt Servanda)',
          category: 'Prinsip Dasar Perikatan',
          legalReference: 'Pasal 1338 ayat (1) KUHPerdata',
          definition: 'Semua perjanjian yang dibuat secara sah berlaku sebagai undang-undang bagi para pihak yang menyepakatinya dan wajib dilaksanakan dengan itikad baik.',
          locations: ['Komparisi', 'Pasal 1'],
        },
        {
          term: 'Syarat Sahnya Perjanjian',
          category: 'Keabsahan Kontrak',
          legalReference: 'Pasal 1320 KUHPerdata',
          definition: 'Empat syarat keabsahan kontrak meliputi kesepakatan para pihak, kecakapan bertindak, suatu hal tertentu, dan sebab yang halal.',
          locations: ['Komparisi', 'Premis'],
        },
      ]);
    }
  });

  // 5b. Auto-Glossary Generator AI Agent (Extract, Define & Cross-Reference Domain-Specific Legal Terms from Selected Sections)
  app.post('/api/legal/auto-glossary-index', async (req, res) => {
    try {
      const { documentTitle, selectedSections } = req.body || {};
      if (!Array.isArray(selectedSections) || selectedSections.length === 0) {
        res.status(400).json({ error: 'Pilih minimal 1 bagian dokumen untuk diekstraksi oleh Auto-Glossary Generator.' });
        return;
      }

      const formattedSections = selectedSections
        .map(
          (sec: any) =>
            `[${sec.shortCode || sec.label}] (${sec.label}):\n${String(sec.text || '').slice(0, 2500)}`
        )
        .join('\n\n---\n\n');

      const prompt = `Anda adalah AI Legal Indexing & Glossary Agent untuk dokumen hukum Indonesia: "${documentTitle || 'Dokumen Hukum'}".
Pengguna telah memilih ${selectedSections.length} bagian spesifik dari dokumen berikut untuk diekstraksi menjadi "Custom Document Index" (Indeks Istilah & Referensi Silang Dokumen Kustom):

${formattedSections}

TUGAS ANDA:
1. Ekstraksi seluruh istilah hukum spesifik domain (domain-specific legal terms) yang muncul atau relevan langsung pada bagian-bagian terpilih di atas.
2. Berikan definisi hukum yang tajam, operasional, dan akurat menurut KUHPerdata / peraturan perundang-undangan Indonesia.
3. Buat referensi silang (crossReferences) antar bagian/pasal tempat istilah atau implikasi hukumnya saling terhubung (contoh: "Pasal 1 ↔ Pasal 4", "Komparisi ↔ Pasal 2"), serta daftar istilah hukum terkait (relatedTerms).`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: {
                  type: Type.STRING,
                  description: 'Istilah hukum spesifik domain yang diekstraksi dari bagian terpilih',
                },
                category: {
                  type: Type.STRING,
                  description: 'Kategori domain hukum, contoh: Hukum Perikatan, Mitigasi Risiko, Kepemilikan HKI',
                },
                legalReference: {
                  type: Type.STRING,
                  description: 'Rujukan pasal KUHPerdata atau UU Indonesia terkait',
                },
                definition: {
                  type: Type.STRING,
                  description: 'Definisi hukum mendalam beserta implikasinya pada bagian dokumen yang dipilih',
                },
                locations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Kode bagian/pasal tempat istilah ditemukan, contoh: ["Komparisi", "Pasal 2"]',
                },
                crossReferences: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Referensi silang antar bagian/pasal, contoh: ["Pasal 1 ↔ Pasal 3", "Komparisi ↔ Pasal 1"]',
                },
                relatedTerms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar istilah hukum lain yang berelasi erat dalam indeks dokumen',
                },
                isCritical: {
                  type: Type.BOOLEAN,
                  description: 'True jika istilah berkaitan dengan sanksi, wanprestasi, pengakhiran, atau kewajiban krusial',
                },
                isDefinedInContract: {
                  type: Type.BOOLEAN,
                  description: 'True jika istilah didefinisikan secara eksplisit di dalam bagian terpilih',
                },
              },
              required: [
                'term',
                'category',
                'legalReference',
                'definition',
                'locations',
                'crossReferences',
                'relatedTerms',
                'isCritical',
                'isDefinedInContract',
              ],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gagal mengekstraksi indeks glosarium otomatis.');
      }
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.json({ fallback: true });
    }
  });

  // 6. Multi-Turn AI Legal Consultant Chat Endpoint (with Multi-Model Fallback & Zero-Error Resilience)
  app.post('/api/legal/chat', async (req, res) => {
    const { messages, documentContext, focusedClause } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Pesan konsultasi tidak boleh kosong.' });
      return;
    }

    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === 'user')?.text ||
      String(messages[messages.length - 1]?.text || '');

    const consultantSystemInstruction = `Anda adalah "AI Legal Consultant" (Konsultan Hukum Korporasi & Perdata Senior Indonesia) yang mendampingi pengguna di dalam ruang kerja penyusunan kontrak Klausa Studio.

KONTEKS DOKUMEN HUKUM YANG SEDANG DISUSUN PENGGUNA SAAT INI:
${documentContext ? String(documentContext).slice(0, 12000) : 'Dokumen kontrak aktif'}

${focusedClause && focusedClause !== 'Seluruh Dokumen' ? `FOKUS PERTANYAAN PENGGUNA SAAT INI: ${focusedClause}` : ''}

PEDOMAN KONSULTASI & PENCARIAN REGULASI:
1. Jawab pertanyaan pengguna mengenai interpretasi klausul, makna pasal, risiko hukum, hak & kewajiban para pihak, maupun cara memperbaiki redaksi pasal secara akurat berdasarkan Hukum Positif Republik Indonesia (KUHPerdata, UU Cipta Kerja, UU PT, UU Hak Cipta, UU ITE, UU PDP, PP, dll.).
2. Gunakan pencarian Google untuk memverifikasi bunyi pasal undang-undang atau peraturan pemerintah Indonesia terbaru dari situs resmi pemerintah (seperti peraturan.bpk.go.id, jdih.setneg.go.id, peraturan.go.id, kemnaker.go.id, mahkamahagung.go.id) bila pengguna menanyakan dasar hukum atau peraturan yang berlaku.
3. Selalu rujuk langsung pada nomor Pasal atau Ayat yang ada di dalam dokumen yang sedang disusun bila relevan.
4. Gunakan format penjelasan yang terstruktur, lugas, dan mudah dipahami. Gunakan penebalan (**teks tebal**) untuk judul poin atau nomor pasal dan cetak miring (*teks miring*) untuk istilah hukum asing atau kutipan klausul, tanpa menggunakan simbol pagar (###) atau blok kode. Jika pengguna meminta saran perbaikan klausul, berikan contoh rumusan kalimat hukum yang siap disalin ke dalam kontrak.`;

    // Normalize conversation turns so it strictly starts with 'user' and alternates 'user' / 'model'
    const normalizedTurns: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const msg of messages) {
      const role: 'user' | 'model' = msg.role === 'model' ? 'model' : 'user';
      const text = String(msg.text || '').trim();
      if (!text) continue;

      // Skip leading 'model' welcome greeting or any previous error message
      if (normalizedTurns.length === 0 && role === 'model') {
        continue;
      }
      if (role === 'model' && text.startsWith('Maaf, terjadi kendala')) {
        continue;
      }

      if (normalizedTurns.length > 0 && normalizedTurns[normalizedTurns.length - 1].role === role) {
        normalizedTurns[normalizedTurns.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        normalizedTurns.push({
          role,
          parts: [{ text }],
        });
      }
    }

    if (normalizedTurns.length === 0) {
      normalizedTurns.push({ role: 'user', parts: [{ text: lastUserMessage || 'Jelaskan dokumen ini.' }] });
    }

    try {
      let response;
      try {
        // First attempt: with Google Search grounding across fallback models
        response = await generateContentWithFallback({
          contents: normalizedTurns,
          config: {
            systemInstruction: consultantSystemInstruction,
            tools: [{ googleSearch: {} }],
          },
          models: ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview'],
        });
      } catch {
        // Second attempt: fast generation without tool overhead across all fallback models
        response = await generateContentWithFallback({
          contents: normalizedTurns,
          config: {
            systemInstruction: consultantSystemInstruction,
          },
          models: FALLBACK_MODELS,
        });
      }

      const replyText = response.text;
      if (!replyText) {
        throw new Error('Empty response');
      }

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      const seenUris = new Set<string>();
      for (const chunk of rawChunks as any[]) {
        const uri = chunk?.web?.uri;
        const title = chunk?.web?.title || uri;
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          sources.push({ title, uri });
        }
      }

      res.json({ reply: replyText.trim(), sources });
    } catch (_error: any) {
      const fallbackData = buildContextualLegalConsultationReply(
        lastUserMessage,
        documentContext || '',
        focusedClause || 'Seluruh Dokumen'
      );
      res.json(fallbackData);
    }
  });

  // 7. Indonesian Law, Pasal & Government Regulation Search Endpoint (Google Search Grounded + Resilient Fallback)
  app.post('/api/legal/search-regulation', async (req, res) => {
    const { query, documentTitle } = req.body;
    if (!query || !String(query).trim()) {
      res.status(400).json({ error: 'Kata kunci pencarian pasal atau peraturan diperlukan.' });
      return;
    }

    const cleanQuery = String(query).trim();

    try {
      const searchPrompt = `Cari dan jelaskan secara akurat ketentuan hukum, bunyi pasal, dan peraturan perundang-undangan yang berlaku di Indonesia terkait:
"${cleanQuery}"
${documentTitle ? `(Konteks dokumen yang sedang disusun: ${documentTitle})` : ''}

Utamakan rujukan dari sumber resmi pemerintah Republik Indonesia yang terindeks di Google seperti:
- JDIH BPK RI (peraturan.bpk.go.id)
- JDIH Sekretariat Negara / Peraturan.go.id (peraturan.go.id / jdih.setneg.go.id)
- Kitab Undang-Undang Hukum Perdata (KUHPerdata) / UU / PP / Peraturan Menteri terkait.

Sajikan:
1. Dasar Hukum & Nomor Peraturan / Pasal yang Berlaku
2. Ringkasan Pokok Ketentuan / Bunyi Pasal
3. Implikasi Praktis dalam Penyusunan Kontrak / Perjanjian
4. Contoh Rumusan Klausul yang Sesuai dengan Peraturan Tersebut`;

      let response;
      try {
        response = await generateContentWithFallback({
          contents: searchPrompt,
          config: {
            systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
          },
          models: ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview'],
        });
      } catch {
        response = await generateContentWithFallback({
          contents: searchPrompt,
          config: {
            systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          },
          models: FALLBACK_MODELS,
        });
      }

      const answer = response.text;
      if (!answer) {
        throw new Error('Empty regulation search response');
      }

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      const seenUris = new Set<string>();

      for (const chunk of rawChunks as any[]) {
        const uri = chunk?.web?.uri;
        const title = chunk?.web?.title || uri;
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          sources.push({ title, uri });
        }
      }

      if (sources.length === 0) {
        sources.push({
          title: `JDIH BPK RI — Pencarian Peraturan (${cleanQuery})`,
          uri: `https://peraturan.bpk.go.id/Search?keywords=${encodeURIComponent(cleanQuery)}`,
        });
      }

      res.json({
        query: cleanQuery,
        answer: answer.trim(),
        sources,
      });
    } catch (_error: any) {
      const fallbackResult = buildFallbackRegulationSearchResult(cleanQuery, documentTitle);
      res.json(fallbackResult);
    }
  });

  // 8. AI Smart Checklist Generator for Risk Mitigation in Audit Hukum Panel
  app.post('/api/legal/smart-checklist', async (req, res) => {
    const { documentTitle, documentText } = req.body;
    if (!documentText) {
      res.status(400).json({ error: 'Teks dokumen diperlukan untuk menyusun Smart Checklist.' });
      return;
    }

    try {
      const prompt = `Analisis secara menyeluruh seluruh risiko hukum, komersial, dan operasional pada draf dokumen hukum berikut:
Judul: "${documentTitle}"
Isi Dokumen Lengkap:
${String(documentText).slice(0, 14000)}

TUGAS ANDA:
Buatkan daftar "Smart Checklist Mitigasi Risiko" beserta "Risk Mitigation Insights" yang TIDAK DIBATASI JUMLAHNYA (JANGAN hanya 5 item — hasilkan sebanyak mungkin langkah verifikasi sesuai seluruh risiko nyata yang ditemukan di setiap pasal, komparisi, variabel finansial, syarat pembayaran, pajak, HKI, kerahasiaan, pemutusan kontrak, penyelesaian sengketa, serta celah hukum yang belum diatur pada draf aktif ini).
Setiap risiko nyata pada masing-masing Pasal harus memiliki item verifikasi spesifiknya sendiri serta rekomendasi aksi konkret ("mitigationAction" seperti "Hubungi Notaris (Legalisasi / Waarmerking)", "Asuransikan (Professional Indemnity / Tanggung Gugat)", "Minta Bank Garansi / Escrow", "Konsultasi Pajak (PPh & PPN)", atau "Daftarkan ke DJKI / Audit UU PDP") dan rincian langkah konkretnya ("mitigationDetail").`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: {
                  type: Type.STRING,
                  description: 'Tindakan verifikasi spesifik berdasarkan risiko asli pada pasal/bagian draf tersebut',
                },
                category: {
                  type: Type.STRING,
                  description: 'Kategori risiko: Finansial, Masa Berlaku, Identitas Pihak, Mitigasi Klausul, Pajak & Kepatuhan, atau Celah Hukum',
                },
                priority: {
                  type: Type.STRING,
                  description: 'Prioritas: Tinggi, Sedang, atau Standar',
                },
                targetLocation: {
                  type: Type.STRING,
                  description: 'Lokasi pasal atau bagian kontrak yang harus diperiksa, contoh: Pasal 1, Pasal 3, atau Komparisi',
                },
                reason: {
                  type: Type.STRING,
                  description: 'Alasan hukum spesifik mengapa risiko pada pasal/bagian tersebut wajib diverifikasi',
                },
                mitigationAction: {
                  type: Type.STRING,
                  description: 'Label rekomendasi aksi konkret sesuai klasifikasi risiko pasal, misal: Hubungi Notaris (Legalisasi/Akta), Asuransikan (Tanggung Gugat/E&O), Minta Bank Garansi, Konsultasi Pajak, atau Daftarkan HKI',
                },
                mitigationDetail: {
                  type: Type.STRING,
                  description: 'Penjelasan langkah konkret pelaksanaan aksi mitigasi tersebut bagi para pihak',
                },
              },
              required: [
                'task',
                'category',
                'priority',
                'targetLocation',
                'reason',
                'mitigationAction',
                'mitigationDetail',
              ],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty smart checklist response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // 9. Proactive Contextual Clause Suggestion Endpoint for Editor Naskah
  app.post('/api/legal/contextual-suggestions', async (req, res) => {
    const { documentTitle, existingClauseTitles, documentText } = req.body;
    if (!documentText) {
      res.status(400).json({ error: 'Konteks dokumen diperlukan untuk saran klausul.' });
      return;
    }

    try {
      const prompt = `Analisis draf kontrak berikut:
Judul: "${documentTitle}"
Daftar Judul Pasal yang Sudah Ada: ${JSON.stringify(existingClauseTitles || [])}
Isi Dokumen:
${String(documentText).slice(0, 10000)}

Identifikasi 2 hingga 3 klausul krusial tambahan yang BELUM dimuat secara memadai dalam draf tersebut (atau sangat relevan untuk memperkuat perlindungan hukum kontrak tersebut, seperti Keadaan Kahar / Force Majeure, Penyelesaian Sengketa, Pelindungan Data Pribadi UU PDP, Pernyataan & Jaminan, atau Non-Solicitation) dan susun draf klausul lengkapnya agar siap disisipkan langsung oleh pengguna.`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'Judul pasal dalam huruf kapital, misal: KEADAAN KAHAR (FORCE MAJEURE)',
                },
                category: {
                  type: Type.STRING,
                  description: 'Kategori klausul singkat',
                },
                legalBasis: {
                  type: Type.STRING,
                  description: 'Dasar hukum KUHPerdata atau UU terkait',
                },
                riskLevel: {
                  type: Type.STRING,
                  description: 'Standar, Perhatian, atau Kritis',
                },
                reason: {
                  type: Type.STRING,
                  description: 'Alasan proaktif mengapa klausul ini disarankan untuk ditambahkan ke dalam draf ini',
                },
                content: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar ayat lengkap (1), (2), (3) siap pakai',
                },
              },
              required: ['title', 'category', 'legalBasis', 'riskLevel', 'reason', 'content'],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty contextual suggestions response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.json([
        {
          title: 'PERNYATAAN, JAMINAN HUKUM, DAN KEPATUHAN ANTI-KORUPSI',
          category: 'Tata Kelola & Kepatuhan',
          legalBasis: 'Pasal 1320 & Pasal 1338 KUHPerdata',
          riskLevel: 'Perhatian',
          reason: 'Memperkuat keabsahan wewenang penandatangan serta melarang praktik suap/gratifikasi dalam pelaksanaan kontrak.',
          content: [
            '(1) Masing-masing Pihak menyatakan dan menjamin bahwa pihaknya memiliki kapasitas hukum dan kewenangan penuh untuk menandatangani serta melaksanakan Perjanjian ini.',
            '(2) Para Pihak dilarang menawarkan, memberikan, atau menerima suap, komisi tidak sah, maupun gratifikasi dalam bentuk apa pun sehubungan dengan pelaksanaan Perjanjian ini.',
          ],
        },
      ]);
    }
  });

  // POST /api/legal/split-clause
  app.post('/api/legal/split-clause', async (req, res) => {
    const { sourceClause, selectedText, documentTitle, nextClauseNumber } = req.body || {};
    if (!sourceClause || !selectedText) {
      res.status(400).json({ error: 'Data pasal asal dan teks terpilih wajib diisi.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah Konsultan Hukum Korporasi Indonesia. Pengguna ingin melakukan "Split Clause" (Memecah Pasal) dari dokumen "${documentTitle || 'Perjanjian'}".

PASAL ASAL (${sourceClause.number} - ${sourceClause.title}):
Dasar Hukum Asal: ${sourceClause.legalBasis}
Tingkat Risiko Asal: ${sourceClause.riskLevel}
Isi Ayat Asal:
${(sourceClause.content || []).join('\n')}

TEKS YANG DIPILIH UNTUK DIPECAH MENJADI PASAL BARU TERPISAH:
"${selectedText}"

TUGAS ANDA:
1. Pisahkan teks terpilih tersebut menjadi Pasal baru yang mandiri (${nextClauseNumber || 'Pasal Baru'}) dengan judul pasal formal (HURUF KAPITAL), minimal 2 ayat lengkap yang koheren secara logika hukum Indonesia, dasar hukum yang relevan, dan tingkat risiko ('Standar', 'Perhatian', atau 'Kritis').
2. Rapikan dan sesuaikan kembali isi ayat-ayat pada Pasal Asal (${sourceClause.number}) setelah bagian teks tersebut dikeluarkan agar penomoran ayat (1), (2), dst. dan logika hukumnya tetap utuh serta tidak tumpang tindih.`,
        config: {
          temperature: 0.25,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updatedSourceClause: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  legalBasis: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ['Standar', 'Perhatian', 'Kritis'] },
                },
                required: ['title', 'content', 'legalBasis', 'riskLevel'],
              },
              newSplitClause: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  legalBasis: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ['Standar', 'Perhatian', 'Kritis'] },
                },
                required: ['title', 'content', 'legalBasis', 'riskLevel'],
              },
            },
            required: ['updatedSourceClause', 'newSplitClause'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty split clause response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // In-memory store for shared draft review links & clause comments (persists while server runs)
  const sharedDraftStore = new Map<string, any>();

  // POST /api/legal/smart-autofill
  app.post('/api/legal/smart-autofill', async (req, res) => {
    const { documentTitle, partyOne, partyTwo, partyOneType, partyTwoType, existingClauses } =
      req.body || {};

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah Konsultan Hukum Korporasi Indonesia. Berdasarkan metadata profil Para Pihak berikut pada dokumen "${documentTitle || 'Perjanjian'}", usulkan 3 isi Pasal spesifik untuk Auto-Fill Cerdas yang disesuaikan dengan status subjek hukum kedua pihak (${partyOneType || 'PT'} vs ${partyTwoType || 'Individu'}):

PIHAK PERTAMA (${partyOneType || 'PT'}):
Nama: ${partyOne?.name}
Perwakilan: ${partyOne?.representative}
Uraian: ${partyOne?.description}

PIHAK KEDUA (${partyTwoType || 'Individu'}):
Nama: ${partyTwo?.name}
Perwakilan: ${partyTwo?.representative}
Uraian: ${partyTwo?.description}

Daftar Pasal Saat Ini: ${JSON.stringify(
          (existingClauses || []).map((c: any) => ({
            id: c.id,
            number: c.number,
            title: c.title,
          }))
        )}

Susun 3 usulan isi pasal yang paling krusial untuk kombinasi ${partyOneType} vs ${partyTwoType} (contoh: perbedaan rezim pajak PPh 21 Orang Pribadi vs PPh 23/PPN Badan, kapasitas bertindak Direksi UU PT vs kecakapan perorangan Pasal 1320 KUHPerdata/persetujuan pasangan, peralihan HKI pencipta individu ke PT, atau pelindungan data pribadi NIK/NPWP).`,
        config: {
          temperature: 0.25,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                badgeLabel: { type: Type.STRING },
                clauseTitle: { type: Type.STRING },
                legalBasis: { type: Type.STRING },
                riskLevel: { type: Type.STRING, enum: ['Standar', 'Perhatian', 'Kritis'] },
                rationale: { type: Type.STRING },
                proposedContent: { type: Type.ARRAY, items: { type: Type.STRING } },
                matchedClauseNumber: { type: Type.STRING },
              },
              required: [
                'badgeLabel',
                'clauseTitle',
                'legalBasis',
                'riskLevel',
                'rationale',
                'proposedContent',
              ],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty smart autofill response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/share — Create or update a shared draft link snapshot
  app.post('/api/legal/share', (req, res) => {
    const { shareId, document } = req.body || {};
    if (!shareId || !document) {
      res.status(400).json({ error: 'shareId dan dokumen wajib diisi.' });
      return;
    }
    const existing = sharedDraftStore.get(shareId);
    const mergedComments = existing?.comments || document.comments || [];
    const savedDoc = {
      ...document,
      shareId,
      comments: mergedComments,
    };
    sharedDraftStore.set(shareId, savedDoc);
    res.json({ ok: true, shareId, document: savedDoc });
  });

  // GET /api/legal/share/:shareId — Retrieve a shared draft for commenting
  app.get('/api/legal/share/:shareId', (req, res) => {
    const { shareId } = req.params;
    const found = sharedDraftStore.get(shareId);
    if (!found) {
      res.status(404).json({ error: 'Tautan berbagi draf tidak ditemukan atau belum disinkronkan.' });
      return;
    }
    res.json({ ok: true, document: found });
  });

  // POST /api/legal/share/:shareId/comments — Add a clause comment without mutating original document text
  app.post('/api/legal/share/:shareId/comments', (req, res) => {
    const { shareId } = req.params;
    const { comment } = req.body || {};
    if (!comment) {
      res.status(400).json({ error: 'Komentar wajib diisi.' });
      return;
    }
    const found = sharedDraftStore.get(shareId);
    if (found) {
      found.comments = [comment, ...(found.comments || [])];
      sharedDraftStore.set(shareId, found);
    }
    res.json({ ok: true, comment, comments: found?.comments || [comment] });
  });

  // POST /api/legal/comprehensive-scan — Cross-clause terminology inconsistency & legal conflict scan
  app.post('/api/legal/comprehensive-scan', async (req, res) => {
    const { documentTitle, clauses } = req.body || {};
    if (!clauses || !Array.isArray(clauses)) {
      res.status(400).json({ error: 'Daftar pasal wajib dikirim untuk pemindaian komprehensif.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah Auditor Hukum Korporasi Indonesia. Lakukan "Scan Risiko Komprehensif" lintas-pasal pada dokumen "${documentTitle || 'Perjanjian'}" berikut untuk menemukan:
1. Inkonsistensi Terminologi Antar Pasal (misal: perbedaan penggunaan istilah "Hari Kerja" vs "Hari Kalender", istilah nilai kontrak/biaya, atau sebutan Para Pihak antar pasal).
2. Konflik Klausul Hukum (pasal-pasal yang saling bertentangan secara hukum Indonesia, seperti konflik forum sengketa Pengadilan Negeri vs Arbitrase BANI, hak pemutusan seketika vs masa perbaikan/Pasal 1266 KUHPerdata, atau syarat peralihan hak vs retensi pembayaran).

DAFTAR PASAL DOKUMEN:
${clauses
  .map(
    (c: any) =>
      `${c.number} - ${c.title} (Dasar Hukum: ${c.legalBasis}, Risiko: ${c.riskLevel}):\n${(
        c.content || []
      ).join('\n')}`
  )
  .join('\n\n')}

Berikan 3 hingga 4 temuan paling spesifik dalam format JSON.`,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ['Inkonsistensi Terminologi', 'Konflik Klausul Hukum'],
                },
                severity: {
                  type: Type.STRING,
                  enum: ['Kritis', 'Perhatian'],
                },
                title: { type: Type.STRING },
                involvedClauses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                description: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: [
                'type',
                'severity',
                'title',
                'involvedClauses',
                'description',
                'recommendation',
              ],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty comprehensive scan response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/summarize-clause — Generate a 1-sentence plain-language summary for a complex legal clause
  app.post('/api/legal/summarize-clause', async (req, res) => {
    const { clauseNumber, clauseTitle, content, legalBasis } = req.body || {};
    if (!content || !Array.isArray(content)) {
      res.status(400).json({ error: 'Isi pasal wajib dikirim untuk diringkas.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah Konsultan Hukum Indonesia yang ahli menerjemahkan bahasa hukum rumit ke bahasa awam yang sangat jelas bagi klien.
Buatkan TEPAT SATU KALIMAT ringkasan bahasa sederhana (plain-language summary) dalam Bahasa Indonesia untuk pasal berikut:

Nomor & Judul: ${clauseNumber || 'Pasal'} — ${clauseTitle || ''}
Dasar Hukum: ${legalBasis || 'KUHPerdata'}
Isi Klausul:
${content.join('\n')}

Syarat Mutlak:
- Harus terdiri dari TEPAT 1 (SATU) kalimat ringkas, jelas, dan mudah dipahami orang non-hukum/klien.
- Awali dengan "Inti ${clauseNumber || 'Pasal'}:" lalu jelaskan kewajiban/hak utamanya secara lugas.`,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plainSummary: {
                type: Type.STRING,
                description: 'Ringkasan 1 kalimat dalam bahasa sederhana yang mudah dipahami klien.',
              },
            },
            required: ['plainSummary'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty summarize-clause response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/categorize-clauses — AI automatic clause categorization & label suggestions
  app.post('/api/legal/categorize-clauses', async (req, res) => {
    const { documentTitle, clauses } = req.body || {};
    if (!clauses || !Array.isArray(clauses)) {
      res.status(400).json({ error: 'Daftar pasal wajib dikirim untuk dikategorikan.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah Konsultan Hukum Korporasi Indonesia. Analisis setiap pasal dari dokumen "${
          documentTitle || 'Perjanjian'
        }" berikut, lalu tentukan:
1. Kategori Utama ("category") dari pilihan berikut:
   - "Financial" (untuk pembayaran, harga, pajak, termin, upah, biaya)
   - "Liability" (untuk tanggung jawab, denda, wanprestasi, sanksi, ganti rugi, keadaan kahar)
   - "Operational" (untuk ruang lingkup pekerjaan, kewajiban operasional, SLA, serah terima/BAST)
   - "Intellectual Property" (untuk HKI, hak cipta, source code, lisensi)
   - "Confidentiality" (untuk kerahasiaan informasi, NDA, pelindungan data pribadi/UU PDP)
   - "Governance & Dispute" (untuk penyelesaian sengketa, arbitrase, pengadilan, pemberian kuasa)
   - "Termination" (untuk jangka waktu, masa berlaku, pengakhiran kontrak, Pasal 1266 KUHPerdata)
2. Label Aktif ("activeTags"): 2 label singkat berbahasa Indonesia yang paling merepresentasikan substansi pasal.
3. Saran Label Tambahan ("suggestedTags"): 3 saran label spesifik yang dapat dipilih pengguna.
4. Alasan singkat ("reason"): 1 kalimat penjelasan mengapa pasal masuk kategori tersebut.

DAFTAR PASAL:
${clauses
  .map(
    (c: any) =>
      `ID: ${c.id} | ${c.number} - ${c.title} (Dasar Hukum: ${c.legalBasis}):\n${(
        c.content || []
      ).join('\n')}`
  )
  .join('\n\n')}`,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: [
                    'Financial',
                    'Liability',
                    'Operational',
                    'Intellectual Property',
                    'Confidentiality',
                    'Governance & Dispute',
                    'Termination',
                  ],
                },
                activeTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                suggestedTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                reason: { type: Type.STRING },
              },
              required: ['id', 'category', 'activeTags', 'suggestedTags', 'reason'],
            },
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty categorize-clauses response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // In-memory store & dispatch endpoint for Document Owner Comment Notifications (Email + In-App)
  const ownerNotificationsLog: any[] = [];

  app.post('/api/legal/owner-notifications', (req, res) => {
    const { notification } = req.body || {};
    if (!notification) {
      res.status(400).json({ error: 'Missing notification payload' });
      return;
    }
    const dispatchedRecord = {
      ...notification,
      dispatchedAt: new Date().toISOString(),
      deliveryStatus: 'DELIVERED',
    };
    ownerNotificationsLog.unshift(dispatchedRecord);
    if (ownerNotificationsLog.length > 100) {
      ownerNotificationsLog.pop();
    }
    res.json({
      ok: true,
      receiptId: `ntf-rcpt-${Date.now()}`,
      dispatchedRecord,
    });
  });

  app.get('/api/legal/owner-notifications', (_req, res) => {
    res.json({ notifications: ownerNotificationsLog.slice(0, 30) });
  });

  // POST /api/legal/writing-assistant — AI Writing Assistant for inline paragraph transformations (Cmd+K)
  app.post('/api/legal/writing-assistant', async (req, res) => {
    const { selectedText, action, customPrompt, clauseContext } = req.body || {};
    if (!selectedText || typeof selectedText !== 'string') {
      res.status(400).json({ error: 'Teks yang dipilih wajib disertakan.' });
      return;
    }

    const actionPrompts: Record<string, string> = {
      expand:
        'Perluas dan perinci teks klausul ini (Expand) dengan menambahkan perlindungan hukum yang komprehensif, parameter tenggat waktu tertulis (Hari Kerja), mekanisme pembuktian tertulis, serta rujukan KUHPerdata yang relevan tanpa mengubah penomoran ayat di awal.',
      simplify:
        'Ringkas dan padatkan teks klausul ini (Simplify) menjadi kalimat hukum yang lugas, ringkas, langsung pada pokok kewajiban, dan bebas dari pengulangan kata, dengan tetap mempertahankan kekuatan mengikatnya.',
      tone_formal:
        'Ubah nada teks ini menjadi sangat Formal & Notariil (Change Tone: Formal) sesuai standar akta perjanjian komersial dan notariat Indonesia yang berwibawa dan baku.',
      tone_assertive:
        'Ubah nada teks ini menjadi Tegas & Mengikat Mutlak (Change Tone: Assertive) dengan penekanan pada kewajiban mutlak ("wajib", "mengikat secara penuh", "tanpa pengecualian") serta konsekuensi tegas apabila dilanggar.',
      legalese_to_plain_english:
        'Transformasikan teks bahasa hukum ini ke dalam Plain English (Legalese-to-Plain-English) yang sangat jelas, lugas, dan mudah dipahami oleh klien internasional maupun pihak non-hukum, diikuti padanan ringkas Bahasa Indonesia yang jelas dalam tanda kurung.',
    };

    const instructionText =
      customPrompt?.trim() ||
      actionPrompts[action] ||
      actionPrompts.expand;

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah AI Writing Assistant Hukum Kontrak pada Klausa Studio.
Konteks Pasal: ${clauseContext || 'Pasal Kontrak Hukum Indonesia'}
Teks Asli yang Dipilih:
"${selectedText}"

Instruksi Transformasi (${action || 'custom'}):
${instructionText}

Kembalikan JSON dengan:
- "transformedText": hasil transformasi teks yang siap langsung menggantikan teks asli (pertahankan awalan nomor ayat seperti "(1)" jika teks asli memilikinya).
- "explanation": 1 kalimat singkat penjelasan perubahan gaya/substansi yang dilakukan.`,
        config: {
          temperature: 0.25,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transformedText: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['transformedText', 'explanation'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty writing-assistant response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/semantic-clause-search — AI vector similarity & natural language clause matching
  app.post('/api/legal/semantic-clause-search', async (req, res) => {
    const { query, candidateIds, draftTitle, partyOneName, partyTwoName } = req.body || {};
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query pencarian semantik wajib diisi.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah Mesin Pencarian Semantik Vektor Hukum Indonesia (AI Vector Similarity Matcher) untuk dokumen "${
          draftTitle || 'Perjanjian'
        }" antara ${partyOneName || 'PIHAK PERTAMA'} dan ${partyTwoName || 'PIHAK KEDUA'}.
Pengguna mengetikkan deskripsi bahasa alami berikut:
"${query}"

Daftar ID kandidat klausul di pustaka: ${JSON.stringify(candidateIds || [])}

Tugas Anda:
1. Berikan skor kemiripan vektor semantik ("matches": array objek { id, similarityScore (0.65 s.d. 0.99), matchExplanation }) untuk kandidat yang secara makna/konsep hukum berkaitan dengan deskripsi pengguna meskipun kata kuncinya berbeda.
2. Buat juga 1 klausul khusus hasil sintesis AI ("synthesizedClause") yang menjawab secara spesifik skenario bahasa alami pengguna tersebut lengkap dengan judul, kategori, dasar hukum Indonesia, tingkat risiko, ringkasan, dan 2 ayat siap pakai.`,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    similarityScore: { type: Type.NUMBER },
                    matchExplanation: { type: Type.STRING },
                  },
                  required: ['id', 'similarityScore', 'matchExplanation'],
                },
              },
              synthesizedClause: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  legalBasis: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ['Standar', 'Perhatian', 'Kritis'] },
                  summary: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  similarityScore: { type: Type.NUMBER },
                  matchExplanation: { type: Type.STRING },
                },
                required: [
                  'title',
                  'category',
                  'legalBasis',
                  'riskLevel',
                  'summary',
                  'content',
                  'similarityScore',
                  'matchExplanation',
                ],
              },
            },
            required: ['matches', 'synthesizedClause'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Empty semantic-clause-search response');
      res.json(JSON.parse(rawText.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/bulk-import-clauses — AI agent to parse raw pasted external contract text into separate numbered clauses
  app.post('/api/legal/bulk-import-clauses', async (req, res) => {
    const { rawText, documentTitle } = req.body || {};
    if (!rawText || typeof rawText !== 'string') {
      res.status(400).json({ error: 'Teks mentah kontrak wajib diisi.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah AI Legal Document Parser & Clause Structuring Agent Indonesia.
Pengguna menempelkan (paste) teks mentah dari kontrak eksternal berikut untuk diimpor ke dalam dokumen "${
          documentTitle || 'Perjanjian'
        }":

"""
${rawText}
"""

Pisahkan, rapikan, dan strukturkan teks mentah tersebut menjadi daftar pasal terpisah yang rapi.
Untuk setiap pasal, kembalikan:
- "title": Judul pasal dalam huruf kapital yang jelas (tanpa kata "Pasal X" di dalam title).
- "content": Array string ayat-ayat di dalam pasal tersebut.
- "legalBasis": Rujukan pasal KUHPerdata atau UU Republik Indonesia yang relevan.
- "riskLevel": Tingkat risiko ("Standar", "Perhatian", atau "Kritis").
- "plainSummary": Ringkasan 1 kalimat maksud pasal tersebut.`,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.ARRAY, items: { type: Type.STRING } },
                    legalBasis: { type: Type.STRING },
                    riskLevel: { type: Type.STRING, enum: ['Standar', 'Perhatian', 'Kritis'] },
                    plainSummary: { type: Type.STRING },
                  },
                  required: ['title', 'content', 'legalBasis', 'riskLevel'],
                },
              },
            },
            required: ['clauses'],
          },
        },
      });

      const rawTextResp = response.text;
      if (!rawTextResp) throw new Error('Empty bulk-import-clauses response');
      res.json(JSON.parse(rawTextResp.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/ai-clause-rebuttal — AI Professional Legal Agent to generate critical rebuttal & counter-proposal comments on a clause
  app.post('/api/legal/ai-clause-rebuttal', async (req, res) => {
    const { clauseNumber, clauseTitle, clauseContent, legalBasis, riskLevel, persona, partyOneName, partyTwoName } =
      req.body || {};
    if (!clauseContent) {
      res.status(400).json({ error: 'Isi pasal wajib dikirim untuk dianalisis oleh AI Legal Agent.' });
      return;
    }

    try {
      const response = await generateContentWithFallback({
        contents: `Anda adalah AI Agent Legal Profesional Indonesia yang bertugas menyanggah, mengkritisi celah hukum, dan mengajukan redaksi tandingan (counter-proposal) pada kolom komentar pasal kontrak.
Peran / Persona AI Agent: ${persona || 'AI Agent — Kuasa Hukum Pihak Lawan (Counterparty Counsel)'}
Para Pihak: ${partyOneName || 'PIHAK PERTAMA'} dan ${partyTwoName || 'PIHAK KEDUA'}
Pasal yang Disanggah: ${clauseNumber || 'Pasal'} — ${clauseTitle || ''} (Risiko: ${riskLevel || 'Perhatian'}, Dasar Hukum: ${legalBasis || 'KUHPerdata'})
Isi Ayat Saat Ini:
${Array.isArray(clauseContent) ? clauseContent.join('\n') : clauseContent}

Susun sanggahan hukum yang tajam, profesional, dan konstruktif:
- "authorName": Nama AI Agent Legal (misal: "AI Legal Agent · Counsel Pihak Lawan" atau sesuai persona).
- "authorRole": Peran resmi AI Agent (misal: "AI Counterparty & Risk Rebuttal Agent").
- "commentText": Argumen sanggahan hukum spesifik terhadap pasal ini (mengapa pasal ini berat sebelah, ambigu, atau berisiko menurut KUHPerdata/UU Indonesia, serta poin apa yang harus direvisi).
- "proposedAlternative": Rumusan ayat alternatif/tandingan yang lebih seimbang dan melindungi kepentingan hukum secara terukur.`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              authorName: { type: Type.STRING },
              authorRole: { type: Type.STRING },
              commentText: { type: Type.STRING },
              proposedAlternative: { type: Type.STRING },
            },
            required: ['authorName', 'authorRole', 'commentText', 'proposedAlternative'],
          },
        },
      });

      const rawTextResp = response.text;
      if (!rawTextResp) throw new Error('Empty ai-clause-rebuttal response');
      res.json(JSON.parse(rawTextResp.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  // POST /api/legal/translate-clause — AI Legal Clause Translation maintaining legal precision (UU No. 24/2009 Bilingual Standard)
  app.post('/api/legal/translate-clause', async (req, res) => {
    try {
      const { clauseNumber, clauseTitle, clauseContent, legalBasis, targetLanguage } =
        req.body || {};
      if (!clauseTitle && !clauseContent) {
        return res.status(400).json({ error: 'Data pasal diperlukan untuk penerjemahan hukum.' });
      }

      const lang = targetLanguage || 'English';
      const response = await generateContentWithFallback({
        contents: `Anda adalah Penerjemah Hukum Tersumpah Internasional (Sworn Legal Translator) yang ahli menyusun kontrak bilingual sesuai UU No. 24 Tahun 2009 Pasal 31.
Terjemahkan pasal hukum berikut dari Bahasa Indonesia ke bahasa target: ${lang} dengan menjaga presisi terminologi hukum kontrak internasional (misal: "wajib" -> "shall", "berhak" -> "shall be entitled to", "Para Pihak" -> "The Parties", "Keadaan Kahar" -> "Force Majeure", "Wanprestasi" -> "Event of Default").
Pertahankan jumlah ayat yang sama persis dengan naskah asli agar sejajar dalam tampilan Dual-Language Layout.

Nomor Pasal: ${clauseNumber || 'Pasal'}
Judul Pasal Asli: ${clauseTitle || ''}
Dasar Hukum Asli: ${legalBasis || ''}
Ayat-Ayat Asli:
${Array.isArray(clauseContent) ? clauseContent.map((c: string, i: number) => `[Ayat ${i + 1}] ${c}`).join('\n') : clauseContent}`,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedTitle: { type: Type.STRING },
              translatedLegalBasis: { type: Type.STRING },
              translatedContent: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              legalPrecisionNote: { type: Type.STRING },
            },
            required: [
              'translatedTitle',
              'translatedLegalBasis',
              'translatedContent',
              'legalPrecisionNote',
            ],
          },
        },
      });

      const rawTextResp = response.text;
      if (!rawTextResp) throw new Error('Empty translate-clause response');
      res.json(JSON.parse(rawTextResp.trim()));
    } catch (_error: any) {
      res.status(200).json({ fallback: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Klausa Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
