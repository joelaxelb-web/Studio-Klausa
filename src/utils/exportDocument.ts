import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { AuditEvolutionEvent, ClauseComment, LegalDocument } from '../types/legal';
import {
  generateSmartChecklistForDocument,
  runComprehensiveRiskScan,
} from './legalSmartAnalyzer';

export interface PdfExportOptions {
  watermarkEnabled?: boolean;
  watermarkText?: string;
}

export function exportToPdf(
  doc: LegalDocument,
  options?: PdfExportOptions
): void {
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'draf-dokumen-hukum';

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 22;
  const marginRight = 20;
  const marginTop = 22;
  const marginBottom = 24;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const centerX = pageWidth / 2;

  let cursorY = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      pdf.addPage();
      cursorY = marginTop;
    }
  };

  const writeWrappedParagraph = (
    text: string,
    options?: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
      indentLeft?: number;
      lineHeightMm?: number;
      spacingAfterMm?: number;
      align?: 'left' | 'center' | 'right';
    }
  ) => {
    const fontSize = options?.fontSize ?? 11;
    const fontStyle = options?.fontStyle ?? 'normal';
    const indentLeft = options?.indentLeft ?? 0;
    const lineHeightMm = options?.lineHeightMm ?? 5.2;
    const spacingAfterMm = options?.spacingAfterMm ?? 3;
    const align = options?.align ?? 'left';

    pdf.setFont('times', fontStyle);
    pdf.setFontSize(fontSize);

    const availableWidth = contentWidth - indentLeft;
    const lines: string[] = pdf.splitTextToSize(text || '', availableWidth);

    lines.forEach((line: string) => {
      ensureSpace(lineHeightMm);
      if (align === 'center') {
        pdf.text(line, centerX, cursorY, { align: 'center' });
      } else if (align === 'right') {
        pdf.text(line, pageWidth - marginRight, cursorY, { align: 'right' });
      } else {
        pdf.text(line, marginLeft + indentLeft, cursorY);
      }
      cursorY += lineHeightMm;
    });

    cursorY += spacingAfterMm;
  };

  // 1. Document Header / Title Block
  writeWrappedParagraph(doc.title.toUpperCase(), {
    fontSize: 13.5,
    fontStyle: 'bold',
    align: 'center',
    lineHeightMm: 6,
    spacingAfterMm: 1.5,
  });

  if (doc.subtitle) {
    writeWrappedParagraph(doc.subtitle, {
      fontSize: 10.5,
      fontStyle: 'normal',
      align: 'center',
      lineHeightMm: 4.8,
      spacingAfterMm: 1.5,
    });
  }

  writeWrappedParagraph(`Nomor: ${doc.documentNumber}`, {
    fontSize: 10.5,
    fontStyle: 'bold',
    align: 'center',
    lineHeightMm: 4.8,
    spacingAfterMm: 3,
  });

  // Formal Double Rule
  pdf.setDrawColor(24, 24, 27);
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 1.2;
  pdf.setLineWidth(0.2);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 6;

  // 2. Opening Komparisi
  writeWrappedParagraph(doc.openingText, {
    fontSize: 11,
    fontStyle: 'normal',
    lineHeightMm: 5.2,
    spacingAfterMm: 4,
  });

  // 3. Party One & Party Two Blocks
  const renderPartyBlock = (indexLabel: string, party: LegalDocument['partyOne']) => {
    ensureSpace(24);
    writeWrappedParagraph(`${indexLabel}. ${party.name} (${party.role})`, {
      fontSize: 11,
      fontStyle: 'bold',
      indentLeft: 5,
      lineHeightMm: 5,
      spacingAfterMm: 1,
    });
    writeWrappedParagraph(`Diwakili oleh: ${party.representative} | Kedudukan: ${party.address}`, {
      fontSize: 10,
      fontStyle: 'italic',
      indentLeft: 5,
      lineHeightMm: 4.6,
      spacingAfterMm: 1.5,
    });
    writeWrappedParagraph(party.description, {
      fontSize: 10.5,
      fontStyle: 'normal',
      indentLeft: 5,
      lineHeightMm: 5,
      spacingAfterMm: 4,
    });
  };

  renderPartyBlock('I', doc.partyOne);
  renderPartyBlock('II', doc.partyTwo);

  // 4. Recitals / Premis
  writeWrappedParagraph('Para Pihak terlebih dahulu menerangkan hal-hal sebagai berikut:', {
    fontSize: 11,
    fontStyle: 'bold',
    lineHeightMm: 5.2,
    spacingAfterMm: 2.5,
  });

  doc.recitals.forEach((recital, idx) => {
    writeWrappedParagraph(`${idx + 1}. ${recital}`, {
      fontSize: 11,
      fontStyle: 'normal',
      indentLeft: 4,
      lineHeightMm: 5.2,
      spacingAfterMm: 2.5,
    });
  });

  cursorY += 1.5;
  writeWrappedParagraph(
    'Berdasarkan pertimbangan tersebut di atas, Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian ini dengan ketentuan dan syarat-syarat sebagai berikut:',
    {
      fontSize: 11,
      fontStyle: 'italic',
      lineHeightMm: 5.2,
      spacingAfterMm: 5,
    }
  );

  // 5. Clauses (Pasal-Pasal / Bagian KHUSUS & SURAT TUGAS)
  doc.clauses.forEach((clause) => {
    if (clause.number.toUpperCase() === 'SURAT TUGAS') {
      pdf.addPage();
      cursorY = marginTop;
    } else {
      ensureSpace(22);
    }

    writeWrappedParagraph(clause.number.toUpperCase(), {
      fontSize: 11.5,
      fontStyle: 'bold',
      align: 'center',
      lineHeightMm: 5.2,
      spacingAfterMm: 0.8,
    });

    writeWrappedParagraph(clause.title.toUpperCase(), {
      fontSize: 11.5,
      fontStyle: 'bold',
      align: 'center',
      lineHeightMm: 5.2,
      spacingAfterMm: 3,
    });

    clause.content.forEach((ayat) => {
      writeWrappedParagraph(ayat, {
        fontSize: 11,
        fontStyle: 'normal',
        lineHeightMm: 5.2,
        spacingAfterMm: 2.5,
      });
    });

    cursorY += 2.5;
  });

  // 6. Closing & Signature Execution Block
  ensureSpace(65);
  pdf.setDrawColor(180, 175, 165);
  pdf.setLineWidth(0.25);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 5;

  writeWrappedParagraph(doc.closingText, {
    fontSize: 11,
    fontStyle: 'normal',
    lineHeightMm: 5.2,
    spacingAfterMm: 5,
  });

  writeWrappedParagraph(`${doc.signingLocation}, ${doc.effectiveDate}`, {
    fontSize: 11,
    fontStyle: 'bold',
    align: 'right',
    lineHeightMm: 5.2,
    spacingAfterMm: 6,
  });

  // 2-Column Signature Box
  ensureSpace(48);
  const colLeftX = marginLeft + contentWidth * 0.23;
  const colRightX = marginLeft + contentWidth * 0.77;
  const sigStartY = cursorY;

  pdf.setFont('times', 'bold');
  pdf.setFontSize(10.5);
  pdf.text((doc.partyOne.role || 'PIHAK PERTAMA').toUpperCase(), colLeftX, sigStartY, {
    align: 'center',
  });
  pdf.text((doc.partyTwo.role || 'PIHAK KEDUA').toUpperCase(), colRightX, sigStartY, {
    align: 'center',
  });

  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  const p1NameLines = pdf.splitTextToSize(doc.partyOne.name, contentWidth * 0.44);
  const p2NameLines = pdf.splitTextToSize(doc.partyTwo.name, contentWidth * 0.44);
  pdf.text(p1NameLines, colLeftX, sigStartY + 5, { align: 'center' });
  pdf.text(p2NameLines, colRightX, sigStartY + 5, { align: 'center' });

  // Materai Box on Pihak Pertama
  pdf.setDrawColor(140, 140, 140);
  pdf.setLineWidth(0.2);
  pdf.rect(colLeftX - 16, sigStartY + 14, 32, 11);
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Materai Rp10.000', colLeftX, sigStartY + 20.5, { align: 'center' });
  pdf.setTextColor(0, 0, 0);

  // Representative Names
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10.5);
  const repY = sigStartY + 36;
  const p1RepLines = pdf.splitTextToSize(doc.partyOne.representative, contentWidth * 0.45);
  const p2RepLines = pdf.splitTextToSize(doc.partyTwo.representative, contentWidth * 0.45);
  pdf.text(p1RepLines, colLeftX, repY, { align: 'center' });
  pdf.text(p2RepLines, colRightX, repY, { align: 'center' });

  // Underline Signatories
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.3);
  pdf.line(colLeftX - 28, repY + 1.5, colLeftX + 28, repY + 1.5);
  pdf.line(colRightX - 28, repY + 1.5, colRightX + 28, repY + 1.5);

  // Subtle Online Verification QR Code Block at Bottom of A4 Sheet
  cursorY = repY + 10;
  ensureSpace(26);
  const shareId = doc.shareId || `share-${doc.id}`;
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(
    shareId
  )}`;

  pdf.setDrawColor(214, 208, 196);
  pdf.setLineWidth(0.2);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 4;

  const qrBoxSizeMm = 19;
  const qrX = pageWidth - marginRight - qrBoxSizeMm;
  const qrY = cursorY;

  try {
    const qr = QRCode.create(shareUrl, { errorCorrectionLevel: 'H' });
    const modCount = qr.modules.size;
    const centerMin = Math.floor(modCount * 0.36);
    const centerMax = Math.ceil(modCount * 0.64);
    const cellMm = qrBoxSizeMm / (modCount + 2);
    pdf.setFillColor(250, 249, 246);
    pdf.setDrawColor(30, 58, 138);
    pdf.setLineWidth(0.35);
    pdf.rect(qrX, qrY, qrBoxSizeMm, qrBoxSizeMm, 'FD');
    pdf.setFillColor(24, 24, 27);
    for (let r = 0; r < modCount; r++) {
      for (let c = 0; c < modCount; c++) {
        if (r >= centerMin && r <= centerMax && c >= centerMin && c <= centerMax) {
          continue;
        }
        if (qr.modules.get(r, c)) {
          pdf.rect(
            qrX + (c + 1) * cellMm,
            qrY + (r + 1) * cellMm,
            cellMm + 0.04,
            cellMm + 0.04,
            'F'
          );
        }
      }
    }
    // Center Klausa Studio ('KS') emblem inside QR code
    const logoSizeMm = qrBoxSizeMm * 0.28;
    const logoX = qrX + (qrBoxSizeMm - logoSizeMm) / 2;
    const logoY = qrY + (qrBoxSizeMm - logoSizeMm) / 2;
    pdf.setFillColor(30, 58, 138);
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.rect(logoX, logoY, logoSizeMm, logoSizeMm, 'FD');
    pdf.setFont('times', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text('KS', qrX + qrBoxSizeMm / 2, qrY + qrBoxSizeMm / 2 + 0.8, {
      align: 'center',
    });

    // 'Scan to Verify' label below QR code
    pdf.setFillColor(30, 58, 138);
    pdf.rect(qrX, qrY + qrBoxSizeMm + 0.8, qrBoxSizeMm, 3.6, 'F');
    pdf.setFont('times', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(255, 255, 255);
    pdf.text('SCAN TO VERIFY', qrX + qrBoxSizeMm / 2, qrY + qrBoxSizeMm + 3.1, {
      align: 'center',
    });
  } catch {
    // ignore qr fallback
  }

  pdf.setFont('times', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(24, 24, 27);
  pdf.text(
    'VERIFIKASI KEASLIAN DOKUMEN & AKSES DRAF DARING',
    marginLeft,
    cursorY + 4
  );
  pdf.setFont('times', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(87, 83, 78);
  pdf.text(
    `Nomor Akta: ${doc.documentNumber} | Pindai QR untuk verifikasi daring:`,
    marginLeft,
    cursorY + 8.5
  );
  pdf.setTextColor(30, 58, 138);
  const urlLines = pdf.splitTextToSize(shareUrl, contentWidth - qrBoxSizeMm - 6);
  pdf.text(urlLines.slice(0, 2), marginLeft, cursorY + 13);
  pdf.setTextColor(0, 0, 0);

  // 7. Page Numbers, Running Footer & Optional Diagonal Watermark on All Pages
  const totalPages = pdf.getNumberOfPages();
  const wmEnabled = Boolean(options?.watermarkEnabled);
  const wmText = (options?.watermarkText || 'DRAFT').trim().toUpperCase();

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    if (wmEnabled && wmText) {
      pdf.saveGraphicsState();
      try {
        const GStateCtor = (pdf as any).GState;
        if (GStateCtor) {
          pdf.setGState(new GStateCtor({ opacity: 0.13 }));
          pdf.setTextColor(30, 58, 138);
        } else {
          pdf.setTextColor(224, 220, 212);
        }
      } catch {
        pdf.setTextColor(224, 220, 212);
      }
      pdf.setFont('times', 'bold');
      const fontSize = wmText.length > 14 ? 42 : 54;
      pdf.setFontSize(fontSize);
      pdf.text(wmText, pageWidth / 2, pageHeight / 2 + 12, {
        align: 'center',
        angle: 45,
      });
      pdf.restoreGraphicsState();
      pdf.setTextColor(0, 0, 0);
    }

    pdf.setDrawColor(210, 205, 195);
    pdf.setLineWidth(0.2);
    pdf.line(marginLeft, pageHeight - 15, pageWidth - marginRight, pageHeight - 15);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(90, 90, 90);
    pdf.text(`${doc.title} (${doc.documentNumber})`, marginLeft, pageHeight - 10.5);
    pdf.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginRight, pageHeight - 10.5, {
      align: 'right',
    });
    pdf.setTextColor(0, 0, 0);
  }

  pdf.save(`${safeFilename}.pdf`);
}

function renderRiskPieChartDataUrl(
  kritisCount: number,
  perhatianCount: number,
  standarCount: number
): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background card
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#E5E0D8';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);

    const total = Math.max(1, kritisCount + perhatianCount + standarCount);
    const slices = [
      { label: 'Risiko Kritis (Tinggi)', value: kritisCount, color: '#B91C1C' },
      { label: 'Risiko Perhatian (Sedang)', value: perhatianCount, color: '#D97706' },
      { label: 'Risiko Standar (Aman)', value: standarCount, color: '#15803D' },
    ];

    const centerX = 185;
    const centerY = 160;
    const outerRadius = 110;
    const innerRadius = 60;

    let currentAngle = -Math.PI / 2;

    slices.forEach((slice) => {
      if (slice.value <= 0) return;
      const sliceAngle = (slice.value / total) * (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // White separator stroke
      ctx.strokeStyle = '#FAF9F6';
      ctx.lineWidth = 4;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Inner donut cutout
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FAF9F6';
    ctx.fill();

    // Center text inside donut
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(kritisCount + perhatianCount + standarCount), centerX, centerY - 10);

    ctx.fillStyle = '#57534E';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('TOTAL PASAL', centerX, centerY + 20);

    // Right-hand Legend & Breakdown Table on Canvas
    ctx.textAlign = 'left';
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('DISTRIBUSI TINGKAT RISIKO PASAL', 360, 58);

    ctx.fillStyle = '#57534E';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      'Proporsi profil risiko hukum dari seluruh klausul dalam dokumen aktif:',
      360,
      88
    );

    slices.forEach((slice, idx) => {
      const rowY = 138 + idx * 54;
      const pct = Math.round((slice.value / total) * 100);

      // Color swatch
      ctx.fillStyle = slice.color;
      ctx.fillRect(360, rowY - 14, 22, 22);

      // Label
      ctx.fillStyle = '#18181B';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText(slice.label, 396, rowY);

      // Progress bar background
      ctx.fillStyle = '#E5E0D8';
      ctx.fillRect(670, rowY - 11, 160, 16);

      // Progress bar fill
      ctx.fillStyle = slice.color;
      ctx.fillRect(670, rowY - 11, Math.max(4, (160 * pct) / 100), 16);

      // Count & Percentage
      ctx.fillStyle = '#18181B';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${slice.value} Pasal (${pct}%)`, 845, rowY);
    });

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

export interface AuditSummaryExportOptions {
  selectedClauseIds?: string[];
  includeClauseContent?: boolean;
}

export function exportAuditSummaryToPdf(
  doc: LegalDocument,
  options?: AuditSummaryExportOptions
): void {
  const selectedIds = options?.selectedClauseIds;
  const auditedClauses =
    Array.isArray(selectedIds) && selectedIds.length > 0
      ? doc.clauses.filter((c) => selectedIds.includes(c.id))
      : doc.clauses;
  const auditedDoc: LegalDocument = {
    ...doc,
    clauses: auditedClauses,
  };
  const isCustomSelection = auditedClauses.length < doc.clauses.length;

  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dokumen-hukum';

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 22;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const centerX = pageWidth / 2;

  let cursorY = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      pdf.addPage();
      cursorY = marginTop;
    }
  };

  // 1. Executive Header Banner
  pdf.setFont('times', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(30, 58, 138);
  pdf.text('LEGAL COMPLIANCE & RISK AUDIT SUMMARY', centerX, cursorY, { align: 'center' });
  cursorY += 6;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(10.5);
  pdf.setTextColor(87, 83, 78);
  pdf.text(
    isCustomSelection
      ? `Laporan Eksekutif Audit Kepatuhan Hukum — Kustomisasi ${auditedClauses.length} dari ${doc.clauses.length} Pasal Terpilih`
      : 'Laporan Eksekutif Audit Kepatuhan Hukum, Grafik Risiko Pasal & Rekomendasi Mitigasi',
    centerX,
    cursorY,
    { align: 'center' }
  );
  cursorY += 4;

  // Double rule
  pdf.setDrawColor(30, 58, 138);
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 1.2;
  pdf.setLineWidth(0.2);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 6;

  // 2. Audited Contract Metadata Block
  pdf.setFillColor(247, 245, 240);
  pdf.setDrawColor(214, 208, 196);
  pdf.rect(marginLeft, cursorY, contentWidth, 33, 'FD');

  pdf.setTextColor(24, 24, 27);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  const titleLines = pdf.splitTextToSize(doc.title.toUpperCase(), contentWidth - 8);
  pdf.text(titleLines[0] || doc.title, marginLeft + 4, cursorY + 6);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(9.5);
  pdf.text(
    `Nomor Dokumen: ${doc.documentNumber}   |   Kategori: ${doc.category}   |   Yurisdiksi: ${doc.jurisdiction}`,
    marginLeft + 4,
    cursorY + 12.5
  );
  pdf.text(
    `Pihak Pertama: ${doc.partyOne.name} (${doc.partyOne.role})`,
    marginLeft + 4,
    cursorY + 18.5
  );
  pdf.text(
    `Pihak Kedua: ${doc.partyTwo.name} (${doc.partyTwo.role})   |   Tanggal: ${doc.effectiveDate}`,
    marginLeft + 4,
    cursorY + 24
  );
  pdf.setFont('times', 'bold');
  pdf.setTextColor(30, 58, 138);
  pdf.text(
    `Cakupan Pasal Audit: ${auditedClauses.length} dari ${doc.clauses.length} Pasal (${auditedClauses.map((c) => c.number).join(', ')})`,
    marginLeft + 4,
    cursorY + 29.5
  );

  cursorY += 39;

  // 3. Visual Pie Chart of Clause Risk Levels
  let kritisCount = 0;
  let perhatianCount = 0;
  let standarCount = 0;

  auditedClauses.forEach((c) => {
    const level = (c.riskLevel || '').toLowerCase();
    if (level.includes('kritis')) {
      kritisCount++;
    } else if (level.includes('perhatian')) {
      perhatianCount++;
    } else {
      standarCount++;
    }
  });

  pdf.setFont('times', 'bold');
  pdf.setFontSize(11.5);
  pdf.setTextColor(24, 24, 27);
  pdf.text('I. RINGKASAN VISUAL TINGKAT RISIKO PASAL (PIE CHART)', marginLeft, cursorY);
  cursorY += 4;

  const pieChartDataUrl = renderRiskPieChartDataUrl(kritisCount, perhatianCount, standarCount);
  if (pieChartDataUrl) {
    ensureSpace(58);
    pdf.addImage(pieChartDataUrl, 'PNG', marginLeft, cursorY, contentWidth, 54.4);
    cursorY += 60;
  } else {
    cursorY += 3;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10.5);
    pdf.text(
      `Total Pasal Terpilih: ${auditedClauses.length}  |  Risiko Kritis: ${kritisCount}  |  Risiko Perhatian: ${perhatianCount}  |  Risiko Standar: ${standarCount}`,
      marginLeft,
      cursorY
    );
    cursorY += 8;
  }

  // 4. Clause-by-Clause Risk Matrix
  ensureSpace(20);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11.5);
  pdf.setTextColor(24, 24, 27);
  pdf.text(
    `II. MATRIKS KEPATUHAN & PROFIL RISIKO PER PASAL (${auditedClauses.length} PASAL TERPILIH)`,
    marginLeft,
    cursorY
  );
  cursorY += 5;

  auditedClauses.forEach((clause) => {
    ensureSpace(14);
    const riskLower = (clause.riskLevel || '').toLowerCase();

    // Subtle left indicator bar color
    if (riskLower.includes('kritis')) {
      pdf.setFillColor(185, 28, 28);
    } else if (riskLower.includes('perhatian')) {
      pdf.setFillColor(217, 119, 6);
    } else {
      pdf.setFillColor(21, 128, 61);
    }
    pdf.rect(marginLeft, cursorY - 3.5, 2, 9.5, 'F');

    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(24, 24, 27);
    pdf.text(`${clause.number} — ${clause.title}`, marginLeft + 4.5, cursorY);

    pdf.setFont('times', 'bold');
    pdf.setFontSize(9.5);
    if (riskLower.includes('kritis')) {
      pdf.setTextColor(185, 28, 28);
    } else if (riskLower.includes('perhatian')) {
      pdf.setTextColor(180, 83, 9);
    } else {
      pdf.setTextColor(21, 128, 61);
    }
    pdf.text(
      `Risiko: ${clause.riskLevel.toUpperCase()}`,
      pageWidth - marginRight,
      cursorY,
      { align: 'right' }
    );

    cursorY += 4.5;
    pdf.setFont('times', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(87, 83, 78);
    pdf.text(`Dasar Hukum: ${clause.legalBasis}`, marginLeft + 4.5, cursorY);
    cursorY += 6;

    if (options?.includeClauseContent) {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(39, 39, 42);
      clause.content.forEach((ayatText) => {
        const ayatLines: string[] = pdf.splitTextToSize(ayatText, contentWidth - 8);
        ensureSpace(ayatLines.length * 4.4 + 2);
        ayatLines.forEach((line: string) => {
          pdf.text(line, marginLeft + 4.5, cursorY);
          cursorY += 4.4;
        });
      });
      cursorY += 2;
    }
  });

  cursorY += 3;

  // 5. Audit Findings & Stakeholder Recommendations
  ensureSpace(24);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11.5);
  pdf.setTextColor(24, 24, 27);
  pdf.text('III. TEMUAN AUDIT HUKUM & REKOMENDASI MITIGASI PEMANGKU KEPENTINGAN', marginLeft, cursorY);
  cursorY += 6;

  doc.auditNotes.forEach((note, idx) => {
    const recLines: string[] = pdf.splitTextToSize(note.recommendation || '', contentWidth - 10);
    const boxHeight = 14 + recLines.length * 4.8;
    ensureSpace(boxHeight + 4);

    pdf.setFillColor(250, 249, 246);
    pdf.setDrawColor(214, 208, 196);
    pdf.rect(marginLeft, cursorY - 4, contentWidth, boxHeight, 'FD');

    pdf.setFont('times', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(24, 24, 27);
    pdf.text(`${idx + 1}. ${note.title}`, marginLeft + 4, cursorY + 1.5);

    const isSafe = (note.severity || '').toLowerCase().includes('aman');
    if (isSafe) {
      pdf.setTextColor(21, 128, 61);
    } else {
      pdf.setTextColor(180, 83, 9);
    }
    pdf.setFontSize(9.5);
    pdf.text(`Status: ${note.severity}`, pageWidth - marginRight - 4, cursorY + 1.5, {
      align: 'right',
    });

    cursorY += 7;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(39, 39, 42);
    recLines.forEach((line: string) => {
      pdf.text(line, marginLeft + 4, cursorY);
      cursorY += 4.8;
    });

    cursorY += 5;
  });

  // 6. Smart Checklist for Stakeholder Verification
  const smartChecklist = generateSmartChecklistForDocument(auditedDoc);
  if (smartChecklist.length > 0) {
    ensureSpace(24);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(24, 24, 27);
    pdf.text('IV. SMART CHECKLIST VERIFIKASI & MITIGASI RISIKO PRA-TANDA TANGAN', marginLeft, cursorY);
    cursorY += 6;

    smartChecklist.forEach((chk) => {
      const taskLines: string[] = pdf.splitTextToSize(`[ ] ${chk.task} (${chk.targetLocation})`, contentWidth - 6);
      const reasonLines: string[] = pdf.splitTextToSize(`     Catatan: ${chk.reason}`, contentWidth - 6);
      ensureSpace((taskLines.length + reasonLines.length) * 4.8 + 4);

      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(24, 24, 27);
      taskLines.forEach((l: string) => {
        pdf.text(l, marginLeft + 2, cursorY);
        cursorY += 4.6;
      });

      pdf.setFont('times', 'italic');
      pdf.setFontSize(9.2);
      pdf.setTextColor(87, 83, 78);
      reasonLines.forEach((l: string) => {
        pdf.text(l, marginLeft + 2, cursorY);
        cursorY += 4.4;
      });

      cursorY += 2.5;
    });
  }

  // 7. Running Footer & Page Numbers
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(210, 205, 195);
    pdf.setLineWidth(0.2);
    pdf.line(marginLeft, pageHeight - 14, pageWidth - marginRight, pageHeight - 14);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(90, 90, 90);
    pdf.text(
      `Legal Compliance Summary — ${doc.title} (${doc.documentNumber})`,
      marginLeft,
      pageHeight - 9.5
    );
    pdf.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginRight, pageHeight - 9.5, {
      align: 'right',
    });
    pdf.setTextColor(0, 0, 0);
  }

  pdf.save(`legal-compliance-summary-${safeFilename}.pdf`);
}

export function formatDocumentAsPlainText(doc: LegalDocument): string {
  const lines: string[] = [];
  lines.push(doc.title.toUpperCase());
  if (doc.subtitle) lines.push(doc.subtitle);
  lines.push(`Nomor: ${doc.documentNumber}`);
  lines.push('====================================================================');
  lines.push('');
  lines.push(doc.openingText);
  lines.push('');
  lines.push(`I. ${doc.partyOne.name}`);
  lines.push(`   Peran       : ${doc.partyOne.role}`);
  lines.push(`   Diwakili    : ${doc.partyOne.representative}`);
  lines.push(`   Alamat      : ${doc.partyOne.address}`);
  lines.push(`   ${doc.partyOne.description}`);
  lines.push('');
  lines.push(`II. ${doc.partyTwo.name}`);
  lines.push(`   Peran       : ${doc.partyTwo.role}`);
  lines.push(`   Diwakili    : ${doc.partyTwo.representative}`);
  lines.push(`   Alamat      : ${doc.partyTwo.address}`);
  lines.push(`   ${doc.partyTwo.description}`);
  lines.push('');
  lines.push('PREMIS / PERTIMBANGAN:');
  doc.recitals.forEach((recital, idx) => {
    lines.push(`${idx + 1}. ${recital}`);
  });
  lines.push('');
  lines.push('Berdasarkan hal-hal tersebut di atas, Para Pihak sepakat mengatur ketentuan sebagai berikut:');
  lines.push('');

  doc.clauses.forEach((clause) => {
    lines.push('--------------------------------------------------------------------');
    lines.push(`${clause.number.toUpperCase()}`);
    lines.push(`${clause.title.toUpperCase()}`);
    lines.push('');
    clause.content.forEach((paragraph) => {
      lines.push(paragraph);
      lines.push('');
    });
  });

  lines.push('--------------------------------------------------------------------');
  lines.push('PENUTUP');
  lines.push(doc.closingText);
  lines.push('');
  lines.push(`${doc.signingLocation}, ${doc.effectiveDate}`);
  lines.push('');
  lines.push(`PIHAK PERTAMA                              PIHAK KEDUA`);
  lines.push(`${doc.partyOne.name.padEnd(42, ' ')} ${doc.partyTwo.name}`);
  lines.push('');
  lines.push('[ Materai Rp10.000 ]');
  lines.push('');
  lines.push(`${doc.partyOne.representative.padEnd(42, ' ')} ${doc.partyTwo.representative}`);

  return lines.join('\n');
}

export function exportToWordDoc(doc: LegalDocument): void {
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'draf-dokumen-hukum';

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt;
      margin: 72.0pt 72.0pt 72.0pt 72.0pt;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: "Times New Roman", Georgia, serif;
      font-size: 11.5pt;
      line-height: 1.5;
      color: #000000;
    }
    h1 {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      margin-bottom: 4pt;
    }
    .doc-number {
      text-align: center;
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 18pt;
    }
    p {
      text-align: justify;
      margin-top: 0pt;
      margin-bottom: 8pt;
    }
    .party-box {
      margin-left: 18pt;
      margin-bottom: 12pt;
    }
    .clause-header {
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 16pt;
      margin-bottom: 6pt;
    }
    table.sig-table {
      width: 100%;
      margin-top: 28pt;
      border-collapse: collapse;
    }
    table.sig-table td {
      width: 50%;
      vertical-align: top;
      text-align: center;
      padding: 8pt;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <h1>${doc.title}</h1>
    <div class="doc-number">${doc.documentNumber}</div>

    <p>${doc.openingText}</p>

    <div class="party-box">
      <p><strong>1. ${doc.partyOne.name}</strong><br/>
      Kedudukan: ${doc.partyOne.address}<br/>
      Diwakili oleh: ${doc.partyOne.representative}<br/>
      ${doc.partyOne.description}</p>
    </div>

    <div class="party-box">
      <p><strong>2. ${doc.partyTwo.name}</strong><br/>
      Kedudukan: ${doc.partyTwo.address}<br/>
      Diwakili oleh: ${doc.partyTwo.representative}<br/>
      ${doc.partyTwo.description}</p>
    </div>

    <p>Para Pihak terlebih dahulu menerangkan hal-hal sebagai berikut:</p>
    ${doc.recitals.map((r) => `<p>${r}</p>`).join('\n')}

    <p>Berdasarkan pertimbangan tersebut di atas, Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian ini dengan ketentuan dan syarat-syarat sebagai berikut:</p>

    ${doc.clauses
      .map(
        (c) => `
      <div class="clause-header">
        ${c.number}<br/>
        ${c.title}
      </div>
      ${c.content.map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('\n')}
    `
      )
      .join('\n')}

    <p style="margin-top: 16pt;">${doc.closingText}</p>
    <p style="text-align: right; margin-top: 12pt;">${doc.signingLocation}, ${doc.effectiveDate}</p>

    <table class="sig-table">
      <tr>
        <td>
          <strong>PIHAK PERTAMA</strong><br/>
          ${doc.partyOne.name}
          <br/><br/><br/><br/>
          <span style="font-size: 9pt; color: #555555;">[ Materai Rp10.000 ]</span>
          <br/><br/><br/>
          <strong><u>${doc.partyOne.representative}</u></strong>
        </td>
        <td>
          <strong>PIHAK KEDUA</strong><br/>
          ${doc.partyTwo.name}
          <br/><br/><br/><br/>
          <br/><br/><br/>
          <strong><u>${doc.partyTwo.representative}</u></strong>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFilename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function applyVariableReplacement(
  doc: LegalDocument,
  oldValue: string,
  newValue: string
): LegalDocument {
  if (!oldValue || oldValue === newValue) return doc;

  const replaceStr = (str: string) => (str ? str.split(oldValue).join(newValue) : str);

  return {
    ...doc,
    updatedAt: 'Baru saja diperbarui',
    title: replaceStr(doc.title),
    subtitle: replaceStr(doc.subtitle),
    documentNumber: replaceStr(doc.documentNumber),
    jurisdiction: replaceStr(doc.jurisdiction),
    effectiveDate: replaceStr(doc.effectiveDate),
    openingText: replaceStr(doc.openingText),
    partyOne: {
      name: replaceStr(doc.partyOne.name),
      role: replaceStr(doc.partyOne.role),
      representative: replaceStr(doc.partyOne.representative),
      address: replaceStr(doc.partyOne.address),
      description: replaceStr(doc.partyOne.description),
    },
    partyTwo: {
      name: replaceStr(doc.partyTwo.name),
      role: replaceStr(doc.partyTwo.role),
      representative: replaceStr(doc.partyTwo.representative),
      address: replaceStr(doc.partyTwo.address),
      description: replaceStr(doc.partyTwo.description),
    },
    recitals: doc.recitals.map(replaceStr),
    clauses: doc.clauses.map((c) => ({
      ...c,
      title: replaceStr(c.title),
      content: c.content.map(replaceStr),
    })),
    closingText: replaceStr(doc.closingText),
    signingLocation: replaceStr(doc.signingLocation),
  };
}

export interface ClientLegalMemoData {
  memoNumber: string;
  recipient: string;
  sender: string;
  date: string;
  subject: string;
  executiveSummary: string;
  transactionParameters: { label: string; value: string }[];
  riskSummary: {
    totalClauses: number;
    kritisCount: number;
    perhatianCount: number;
    standarCount: number;
    overallAssessment: string;
  };
  crucialClientPoints: {
    title: string;
    clauseRef: string;
    legalBasis: string;
    riskLevel: string;
    clientImpact: string;
  }[];
  comprehensiveScanFindings: ReturnType<typeof runComprehensiveRiskScan>;
  actionRecommendations: {
    priority: string;
    action: string;
    rationale: string;
  }[];
}

export function buildClientLegalMemoData(doc: LegalDocument): ClientLegalMemoData {
  let kritisCount = 0;
  let perhatianCount = 0;
  let standarCount = 0;

  doc.clauses.forEach((c) => {
    const level = (c.riskLevel || '').toLowerCase();
    if (level.includes('kritis')) kritisCount++;
    else if (level.includes('perhatian')) perhatianCount++;
    else standarCount++;
  });

  const overallAssessment =
    kritisCount >= 2
      ? `Draf kontrak memiliki ${kritisCount} pasal berisiko Kritis dan ${perhatianCount} pasal berisiko Perhatian yang memuat konsekuensi finansial/hukum langsung dan memerlukan persetujuan prinsip klien sebelum penandatanganan.`
      : kritisCount === 1
      ? `Draf kontrak secara umum terstruktur dengan baik namun memuat 1 pasal berisiko Kritis serta ${perhatianCount} pasal berisiko Perhatian yang perlu diverifikasi pemenuhan syaratnya.`
      : `Struktur klausul didominasi ketentuan normatif dan seimbang (${standarCount} pasal Standar, ${perhatianCount} pasal Perhatian) sesuai prinsip Pasal 1320 & 1338 KUHPerdata.`;

  const crucialClientPoints = doc.clauses.map((c) => {
    const firstAyat = (c.content[0] || '').replace(/^\(\d+\)\s*|\d+\.\d+\.\s*/, '');
    return {
      title: c.title,
      clauseRef: c.number,
      legalBasis: c.legalBasis,
      riskLevel: c.riskLevel,
      clientImpact:
        firstAyat.length > 220 ? `${firstAyat.slice(0, 220)}...` : firstAyat,
    };
  });

  const scanFindings = runComprehensiveRiskScan(doc);
  const checklist = generateSmartChecklistForDocument(doc);

  const actionRecommendations = [
    ...doc.auditNotes.map((n) => ({
      priority: n.severity,
      action: n.title,
      rationale: n.recommendation,
    })),
    ...checklist.slice(0, 4).map((chk) => ({
      priority: `Prioritas ${chk.priority}`,
      action: chk.task,
      rationale: chk.reason,
    })),
  ];

  return {
    memoNumber: `MEMO/${doc.documentNumber.replace(/^No\.\s*/i, '')}`,
    recipient: `Manajemen Eksekutif / ${doc.partyOne.name} & ${doc.partyTwo.name}`,
    sender: 'Tim Penasihat Hukum & Audit Kontrak (Klausa Studio Legal Advisory)',
    date: doc.effectiveDate,
    subject: `Memorandum Telaah Hukum, Analisis Risiko & Poin Krusial Klien atas ${doc.title}`,
    executiveSummary: `Memorandum Hukum (Legal Memo) ini disusun sebagai bahan presentasi dan pengambilan keputusan bagi Klien sehubungan dengan rencana penandatanganan "${doc.title}" (${doc.documentNumber}) antara ${doc.partyOne.name} (${doc.partyOne.role}) dan ${doc.partyTwo.name} (${doc.partyTwo.role}) yang tunduk pada ${doc.jurisdiction}. Dokumen ini terdiri atas ${doc.clauses.length} Pasal yang mengatur ruang lingkup perikatan, mekanisme komersial, alokasi risiko hukum, serta penyelesaian sengketa.`,
    transactionParameters: [
      { label: 'Pihak Pertama', value: `${doc.partyOne.name} (Diwakili: ${doc.partyOne.representative})` },
      { label: 'Pihak Kedua', value: `${doc.partyTwo.name} (Diwakili: ${doc.partyTwo.representative})` },
      { label: 'Kategori & Yurisdiksi', value: `${doc.category} · ${doc.jurisdiction}` },
      ...doc.variables.map((v) => ({ label: v.key, value: v.value })),
    ],
    riskSummary: {
      totalClauses: doc.clauses.length,
      kritisCount,
      perhatianCount,
      standarCount,
      overallAssessment,
    },
    crucialClientPoints,
    comprehensiveScanFindings: scanFindings,
    actionRecommendations,
  };
}

export function exportLegalMemoToPdf(doc: LegalDocument): void {
  const memo = buildClientLegalMemoData(doc);
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dokumen-hukum';

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 22;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const centerX = pageWidth / 2;

  let cursorY = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      pdf.addPage();
      cursorY = marginTop;
    }
  };

  // 1. Formal Law Firm Memorandum Header
  pdf.setFont('times', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(30, 58, 138);
  pdf.text('MEMORANDUM HUKUM EKSEKUTIF (LEGAL MEMO)', centerX, cursorY, {
    align: 'center',
  });
  cursorY += 5.5;

  pdf.setFont('times', 'italic');
  pdf.setFontSize(9.5);
  pdf.setTextColor(87, 83, 78);
  pdf.text(
    'RAHASIA & ISTIMEWA (ATTORNEY-CLIENT PRIVILEGED) — DOKUMEN SIAP PRESENTASI KLIEN',
    centerX,
    cursorY,
    { align: 'center' }
  );
  cursorY += 4.5;

  // Header Memo Metadata Table
  pdf.setFillColor(247, 245, 240);
  pdf.setDrawColor(30, 58, 138);
  pdf.setLineWidth(0.4);
  pdf.rect(marginLeft, cursorY, contentWidth, 31, 'FD');

  pdf.setTextColor(24, 24, 27);
  pdf.setFontSize(9.5);

  const metaRows = [
    ['KEPADA (TO)', `: ${memo.recipient}`],
    ['DARI (FROM)', `: ${memo.sender}`],
    ['TANGGAL & REF', `: ${memo.date}   |   No. Memo: ${memo.memoNumber}`],
    ['PERIHAL', `: ${memo.subject}`],
  ];

  let metaY = cursorY + 6;
  metaRows.forEach(([label, val]) => {
    pdf.setFont('times', 'bold');
    pdf.text(label, marginLeft + 4, metaY);
    pdf.setFont('times', 'normal');
    const wrapped = pdf.splitTextToSize(val, contentWidth - 40);
    pdf.text(wrapped[0] || val, marginLeft + 36, metaY);
    metaY += 6.5;
  });

  cursorY += 37;

  // Section I: Ringkasan Eksekutif Draf & Struktur Transaksi
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 58, 138);
  pdf.text('I. RINGKASAN EKSEKUTIF DRAF & PARAMETER TRANSAKSI', marginLeft, cursorY);
  cursorY += 5;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(24, 24, 27);
  const execLines: string[] = pdf.splitTextToSize(memo.executiveSummary, contentWidth);
  execLines.forEach((l: string) => {
    ensureSpace(5);
    pdf.text(l, marginLeft, cursorY);
    cursorY += 4.8;
  });
  cursorY += 2;

  memo.transactionParameters.slice(0, 6).forEach((param) => {
    ensureSpace(6);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(9.5);
    pdf.text(`• ${param.label}:`, marginLeft + 2, cursorY);
    pdf.setFont('times', 'normal');
    const valLines: string[] = pdf.splitTextToSize(param.value, contentWidth - 52);
    pdf.text(valLines[0] || param.value, marginLeft + 50, cursorY);
    cursorY += 5;
  });
  cursorY += 4;

  // Section II: Analisis Risiko Komprehensif
  ensureSpace(28);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 58, 138);
  pdf.text('II. ANALISIS PROFIL RISIKO HUKUM', marginLeft, cursorY);
  cursorY += 5;

  const pieDataUrl = renderRiskPieChartDataUrl(
    memo.riskSummary.kritisCount,
    memo.riskSummary.perhatianCount,
    memo.riskSummary.standarCount
  );
  if (pieDataUrl) {
    ensureSpace(54);
    pdf.addImage(pieDataUrl, 'PNG', marginLeft, cursorY, contentWidth, 51);
    cursorY += 55;
  }

  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(24, 24, 27);
  const assessLines: string[] = pdf.splitTextToSize(
    memo.riskSummary.overallAssessment,
    contentWidth
  );
  assessLines.forEach((l: string) => {
    ensureSpace(5);
    pdf.text(l, marginLeft, cursorY);
    cursorY += 4.8;
  });
  cursorY += 4;

  // Section III: Poin-Poin Krusial yang Perlu Diperhatikan Klien
  ensureSpace(22);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 58, 138);
  pdf.text('III. POIN-POIN KRUSIAL PER PASAL YANG WAJIB DIPERHATIKAN KLIEN', marginLeft, cursorY);
  cursorY += 5.5;

  memo.crucialClientPoints.forEach((pt) => {
    const impactLines: string[] = pdf.splitTextToSize(pt.clientImpact, contentWidth - 8);
    const needed = 12 + impactLines.length * 4.5;
    ensureSpace(needed);

    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(24, 24, 27);
    pdf.text(
      `${pt.clauseRef} — ${pt.title} [Risiko: ${pt.riskLevel} | ${pt.legalBasis}]`,
      marginLeft,
      cursorY
    );
    cursorY += 4.5;

    pdf.setFont('times', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(55, 53, 47);
    impactLines.forEach((l: string) => {
      pdf.text(l, marginLeft + 4, cursorY);
      cursorY += 4.4;
    });
    cursorY += 2.5;
  });

  // Section IV: Hasil Scan Inkonsistensi Terminologi & Konflik Klausul
  if (memo.comprehensiveScanFindings.length > 0) {
    ensureSpace(22);
    cursorY += 2;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(30, 58, 138);
    pdf.text(
      'IV. TEMUAN SCAN INKONSISTENSI TERMINOLOGI & KONFLIK ANTAR-PASAL',
      marginLeft,
      cursorY
    );
    cursorY += 5.5;

    memo.comprehensiveScanFindings.forEach((f, idx) => {
      const descLines: string[] = pdf.splitTextToSize(f.description, contentWidth - 6);
      const recLines: string[] = pdf.splitTextToSize(
        `Rekomendasi: ${f.recommendation}`,
        contentWidth - 6
      );
      ensureSpace((descLines.length + recLines.length) * 4.5 + 10);

      pdf.setFont('times', 'bold');
      pdf.setFontSize(9.8);
      pdf.setTextColor(185, 28, 28);
      pdf.text(
        `${idx + 1}. [${f.type}] ${f.title} (${f.involvedClauses.join(', ')})`,
        marginLeft,
        cursorY
      );
      cursorY += 4.5;

      pdf.setFont('times', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(24, 24, 27);
      descLines.forEach((l: string) => {
        pdf.text(l, marginLeft + 4, cursorY);
        cursorY += 4.4;
      });

      pdf.setFont('times', 'italic');
      pdf.setTextColor(87, 83, 78);
      recLines.forEach((l: string) => {
        pdf.text(l, marginLeft + 4, cursorY);
        cursorY += 4.4;
      });
      cursorY += 2.5;
    });
  }

  // Section V: Rekomendasi Mitigasi & Tindak Lanjut Klien
  ensureSpace(22);
  cursorY += 2;
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 58, 138);
  pdf.text('V. REKOMENDASI TINDAK LANJUT & MITIGASI BAGI KLIEN', marginLeft, cursorY);
  cursorY += 5.5;

  memo.actionRecommendations.forEach((rec, i) => {
    const rLines: string[] = pdf.splitTextToSize(rec.rationale, contentWidth - 6);
    ensureSpace(rLines.length * 4.5 + 9);

    pdf.setFont('times', 'bold');
    pdf.setFontSize(9.8);
    pdf.setTextColor(24, 24, 27);
    pdf.text(`${i + 1}. ${rec.action} [${rec.priority}]`, marginLeft, cursorY);
    cursorY += 4.5;

    pdf.setFont('times', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(55, 53, 47);
    rLines.forEach((l: string) => {
      pdf.text(l, marginLeft + 4, cursorY);
      cursorY += 4.4;
    });
    cursorY += 2;
  });

  // Footer page numbering
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(210, 205, 195);
    pdf.setLineWidth(0.2);
    pdf.line(marginLeft, pageHeight - 14, pageWidth - marginRight, pageHeight - 14);
    pdf.setFont('times', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(90, 90, 90);
    pdf.text(
      `Legal Memo Eksekutif — ${doc.title} (${memo.memoNumber})`,
      marginLeft,
      pageHeight - 9.5
    );
    pdf.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginRight, pageHeight - 9.5, {
      align: 'right',
    });
  }

  pdf.save(`legal-memo-${safeFilename}.pdf`);
}

export function exportLegalMemoToWord(doc: LegalDocument): void {
  const memo = buildClientLegalMemoData(doc);
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dokumen-hukum';

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Legal Memo - ${doc.title}</title>
  <style>
    body { font-family: "Times New Roman", Georgia, serif; font-size: 11pt; line-height: 1.5; color: #18181B; }
    h1 { font-size: 15pt; color: #1E3A8A; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
    h2 { font-size: 12pt; color: #1E3A8A; border-bottom: 1pt solid #D6D0C4; padding-bottom: 3pt; margin-top: 16pt; }
    .sub { text-align: center; font-size: 9.5pt; font-style: italic; color: #57534E; margin-bottom: 14pt; }
    table.meta { width: 100%; border-collapse: collapse; background: #F7F5F0; border: 1pt solid #1E3A8A; margin-bottom: 16pt; }
    table.meta td { padding: 5pt 8pt; font-size: 10pt; vertical-align: top; }
    .box { border: 1pt solid #D6D0C4; padding: 8pt; margin-bottom: 8pt; background: #FAF9F6; }
  </style>
</head>
<body>
  <h1>MEMORANDUM HUKUM EKSEKUTIF (LEGAL MEMO)</h1>
  <div class="sub">RAHASIA & ISTIMEWA (ATTORNEY-CLIENT PRIVILEGED) — DOKUMEN SIAP PRESENTASI KLIEN</div>
  <table class="meta">
    <tr><td width="22%"><strong>KEPADA (TO)</strong></td><td>: ${memo.recipient}</td></tr>
    <tr><td><strong>DARI (FROM)</strong></td><td>: ${memo.sender}</td></tr>
    <tr><td><strong>TANGGAL & REF</strong></td><td>: ${memo.date} | No. Memo: ${memo.memoNumber}</td></tr>
    <tr><td><strong>PERIHAL</strong></td><td>: <strong>${memo.subject}</strong></td></tr>
  </table>

  <h2>I. RINGKASAN EKSEKUTIF DRAF & PARAMETER TRANSAKSI</h2>
  <p>${memo.executiveSummary}</p>
  <ul>
    ${memo.transactionParameters.map((p) => `<li><strong>${p.label}:</strong> ${p.value}</li>`).join('')}
  </ul>

  <h2>II. ANALISIS PROFIL RISIKO HUKUM</h2>
  <p><strong>Distribusi Risiko Pasal:</strong> Total ${memo.riskSummary.totalClauses} Pasal (${memo.riskSummary.kritisCount} Risiko Kritis · ${memo.riskSummary.perhatianCount} Risiko Perhatian · ${memo.riskSummary.standarCount} Risiko Standar)</p>
  <p>${memo.riskSummary.overallAssessment}</p>

  <h2>III. POIN-POIN KRUSIAL PER PASAL YANG WAJIB DIPERHATIKAN KLIEN</h2>
  ${memo.crucialClientPoints
    .map(
      (pt) => `
    <div class="box">
      <strong>${pt.clauseRef} — ${pt.title}</strong> (Risiko: ${pt.riskLevel} · Dasar Hukum: ${pt.legalBasis})<br/>
      <span>${pt.clientImpact}</span>
    </div>`
    )
    .join('')}

  <h2>IV. TEMUAN SCAN INKONSISTENSI TERMINOLOGI & KONFLIK ANTAR-PASAL</h2>
  ${memo.comprehensiveScanFindings
    .map(
      (f) => `
    <div class="box">
      <strong>[${f.type} — ${f.severity}] ${f.title}</strong> (Melibatkan: ${f.involvedClauses.join(', ')})<br/>
      <span>${f.description}</span><br/>
      <em>Rekomendasi Harmonisasi: ${f.recommendation}</em>
    </div>`
    )
    .join('')}

  <h2>V. REKOMENDASI TINDAK LANJUT & MITIGASI BAGI KLIEN</h2>
  <ol>
    ${memo.actionRecommendations
      .map(
        (r) => `<li><strong>${r.action} (${r.priority}):</strong> ${r.rationale}</li>`
      )
      .join('')}
  </ol>
</body>
</html>`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `legal-memo-${safeFilename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all clause comments within a document as a CSV file for external record-keeping.
 */
export function exportCommentsToCsv(
  doc: LegalDocument,
  overrideComments?: ClauseComment[]
): void {
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dokumen-hukum';

  const comments = overrideComments || doc.comments || [];
  const escapeCsvCell = (val: string | undefined): string => {
    const str = String(val ?? '').replace(/\r?\n/g, ' ');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = [
    'No',
    'ID Komentar',
    'Judul Dokumen',
    'Nomor Dokumen',
    'Nomor Pasal',
    'Judul Pasal',
    'Nama Pemberi Komentar',
    'Peran / Jabatan',
    'Status Penyelesaian',
    'Waktu Komentar',
    'Isi Komentar / Catatan Hukum',
    'Usulan Redaksi Alternatif',
  ];

  const rows = comments.map((c, idx) => [
    String(idx + 1),
    escapeCsvCell(c.id),
    escapeCsvCell(doc.title),
    escapeCsvCell(doc.documentNumber),
    escapeCsvCell(c.clauseNumber),
    escapeCsvCell(c.clauseTitle),
    escapeCsvCell(c.authorName),
    escapeCsvCell(c.authorRole),
    escapeCsvCell(c.status),
    escapeCsvCell(c.timestamp),
    escapeCsvCell(c.commentText),
    escapeCsvCell(c.proposedAlternative || '-'),
  ]);

  const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF', csvString], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rekaman-komentar-${safeFilename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all clause comments within a document as a formal PDF file for external record-keeping.
 */
export function exportCommentsToPdf(
  doc: LegalDocument,
  overrideComments?: ClauseComment[]
): void {
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dokumen-hukum';

  const comments = overrideComments || doc.comments || [];
  const openCount = comments.filter((c) => c.status !== 'Diselesaikan').length;
  const resolvedCount = comments.length - openCount;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let cursorY = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      pdf.addPage();
      cursorY = marginTop;
    }
  };

  pdf.setFillColor(30, 58, 138);
  pdf.rect(marginLeft, cursorY, contentWidth, 2, 'F');
  cursorY += 8;

  pdf.setFont('times', 'bold');
  pdf.setFontSize(13.5);
  pdf.setTextColor(24, 24, 27);
  pdf.text(
    'REKAPITULASI KOMENTAR & TINJAUAN KLAUSUL DOKUMEN',
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );
  cursorY += 5.5;

  pdf.setFont('times', 'italic');
  pdf.setFontSize(9.5);
  pdf.setTextColor(87, 83, 78);
  pdf.text(
    'Log Audit Eksternal Komentar Klausul — Klausa Studio Legal Workbench',
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );
  cursorY += 7;

  // Document Metadata Box
  pdf.setFillColor(247, 245, 240);
  pdf.setDrawColor(214, 208, 196);
  pdf.rect(marginLeft, cursorY, contentWidth, 24, 'FD');

  pdf.setFont('times', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(24, 24, 27);
  pdf.text(`Judul Dokumen: ${doc.title}`, marginLeft + 4, cursorY + 6);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(9.5);
  pdf.text(
    `Nomor Dokumen: ${doc.documentNumber}   |   Kategori: ${doc.category}`,
    marginLeft + 4,
    cursorY + 12
  );
  pdf.text(
    `Total Komentar: ${comments.length}   |   Terbuka: ${openCount}   |   Diselesaikan: ${resolvedCount}`,
    marginLeft + 4,
    cursorY + 18
  );
  cursorY += 31;

  if (comments.length === 0) {
    pdf.setFont('times', 'italic');
    pdf.setFontSize(10.5);
    pdf.setTextColor(87, 83, 78);
    pdf.text('Tidak terdapat catatan komentar pada dokumen ini.', marginLeft, cursorY);
  } else {
    comments.forEach((c, idx) => {
      const commentLines: string[] = pdf.splitTextToSize(
        `Komentar: ${c.commentText}`,
        contentWidth - 10
      );
      const altLines: string[] = c.proposedAlternative
        ? pdf.splitTextToSize(
            `Usulan Redaksi Alternatif: ${c.proposedAlternative}`,
            contentWidth - 10
          )
        : [];

      const boxHeight =
        18 +
        commentLines.length * 4.6 +
        (altLines.length > 0 ? altLines.length * 4.6 + 4 : 0);

      ensureSpace(boxHeight + 5);

      pdf.setFillColor(250, 249, 246);
      pdf.setDrawColor(214, 208, 196);
      pdf.rect(marginLeft, cursorY, contentWidth, boxHeight, 'FD');

      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 58, 138);
      pdf.text(
        `${idx + 1}. ${c.clauseNumber} — ${c.clauseTitle}`,
        marginLeft + 4,
        cursorY + 6
      );

      const isResolved = c.status === 'Diselesaikan';
      if (isResolved) {
        pdf.setTextColor(21, 128, 61);
      } else {
        pdf.setTextColor(180, 83, 9);
      }
      pdf.setFontSize(9.5);
      pdf.text(
        `Status: ${c.status.toUpperCase()}`,
        pageWidth - marginRight - 4,
        cursorY + 6,
        { align: 'right' }
      );

      pdf.setFont('times', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(87, 83, 78);
      pdf.text(
        `Oleh: ${c.authorName} (${c.authorRole}) · Waktu: ${c.timestamp}`,
        marginLeft + 4,
        cursorY + 11.5
      );

      let innerY = cursorY + 17;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(24, 24, 27);
      commentLines.forEach((line: string) => {
        pdf.text(line, marginLeft + 4, innerY);
        innerY += 4.6;
      });

      if (altLines.length > 0) {
        innerY += 1.5;
        pdf.setFont('times', 'italic');
        pdf.setTextColor(30, 58, 138);
        altLines.forEach((line: string) => {
          pdf.text(line, marginLeft + 4, innerY);
          innerY += 4.6;
        });
      }

      cursorY += boxHeight + 4;
    });
  }

  pdf.save(`rekaman-komentar-${safeFilename}.pdf`);
}

export function exportAuditEvolutionToPdf(
  doc: LegalDocument,
  events: AuditEvolutionEvent[]
): void {
  const safeFilename =
    doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dokumen-hukum';

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 22;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const centerX = pageWidth / 2;

  let cursorY = marginTop;

  const ensureSpace = (neededMm: number) => {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      pdf.addPage();
      cursorY = marginTop;
    }
  };

  pdf.setFont('times', 'bold');
  pdf.setFontSize(13.5);
  pdf.setTextColor(30, 58, 138);
  pdf.text('AUDIT EVOLUTION LOG & CLIENT LEGAL JUSTIFICATION', centerX, cursorY, {
    align: 'center',
  });
  cursorY += 5.5;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(87, 83, 78);
  pdf.text(
    'Linimasa Perubahan Tingkat Risiko, Modifikasi Klausul & Argumen Justifikasi Hukum untuk Klien',
    centerX,
    cursorY,
    { align: 'center' }
  );
  cursorY += 4;

  pdf.setDrawColor(30, 58, 138);
  pdf.setLineWidth(0.4);
  pdf.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 6;

  // Document info box
  pdf.setFillColor(247, 245, 240);
  pdf.setDrawColor(214, 208, 196);
  pdf.rect(marginLeft, cursorY, contentWidth, 24, 'FD');

  pdf.setTextColor(24, 24, 27);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10.5);
  const titleLines = pdf.splitTextToSize(doc.title.toUpperCase(), contentWidth - 8);
  pdf.text(titleLines[0] || doc.title, marginLeft + 4, cursorY + 6);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(9.5);
  pdf.text(
    `Nomor: ${doc.documentNumber}  |  Kategori: ${doc.category}  |  Total Catatan Evolusi: ${events.length} Perubahan`,
    marginLeft + 4,
    cursorY + 12.5
  );
  pdf.text(
    `Para Pihak: ${doc.partyOne.name} (${doc.partyOne.role}) & ${doc.partyTwo.name} (${doc.partyTwo.role})`,
    marginLeft + 4,
    cursorY + 18.5
  );

  cursorY += 30;

  events.forEach((ev, idx) => {
    const summaryLines = pdf.splitTextToSize(
      `Perubahan: ${ev.changeSummary}`,
      contentWidth - 8
    );
    const justLines = pdf.splitTextToSize(
      `Justifikasi Klien: ${ev.clientJustification}`,
      contentWidth - 8
    );
    const boxHeight = 16 + summaryLines.length * 4.5 + justLines.length * 4.5 + 4;

    ensureSpace(boxHeight + 6);

    pdf.setFillColor(250, 249, 246);
    pdf.setDrawColor(214, 208, 196);
    pdf.rect(marginLeft, cursorY, contentWidth, boxHeight, 'FD');

    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30, 58, 138);
    pdf.text(
      `${idx + 1}. ${ev.clauseNumber} — ${ev.clauseTitle} (${ev.versionFromLabel} -> ${ev.versionToLabel})`,
      marginLeft + 4,
      cursorY + 6
    );

    const riskTransition = ev.previousRiskLevel
      ? `Risiko: ${ev.previousRiskLevel} -> ${ev.newRiskLevel}`
      : `Risiko: ${ev.newRiskLevel}`;
    pdf.setFontSize(9.5);
    pdf.setTextColor(24, 24, 27);
    pdf.text(riskTransition, pageWidth - marginRight - 4, cursorY + 6, {
      align: 'right',
    });

    pdf.setFont('times', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(87, 83, 78);
    pdf.text(
      `Waktu: ${ev.timestamp}  |  Dasar Hukum: ${ev.legalBasis}`,
      marginLeft + 4,
      cursorY + 11.5
    );

    let innerY = cursorY + 16.5;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(24, 24, 27);
    summaryLines.forEach((line: string) => {
      pdf.text(line, marginLeft + 4, innerY);
      innerY += 4.4;
    });

    innerY += 1.5;
    pdf.setFont('times', 'bold');
    pdf.setTextColor(30, 58, 138);
    justLines.forEach((line: string) => {
      pdf.text(line, marginLeft + 4, innerY);
      innerY += 4.4;
    });

    cursorY += boxHeight + 4;
  });

  pdf.save(`audit-evolution-log-${safeFilename}.pdf`);
}


