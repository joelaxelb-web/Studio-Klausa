import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Lock,
  MessageSquare,
  CheckCircle2,
  Send,
  User,
  ExternalLink,
  X,
  QrCode,
  ShieldCheck,
  BellRing,
  Mail,
  Scale,
  Link2,
  Stamp,
  AlertCircle,
  FileDown,
  Download,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Users,
  ScanLine,
  Scan,
  Clock,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import * as QRCodeModule from 'qrcode';
import {
  LegalDocument,
  LegalClause,
  ClauseComment,
  OwnerCommentNotification,
} from '../types/legal';
import {
  exportCommentsToCsv,
  exportCommentsToPdf,
  exportToPdf,
} from '../utils/exportDocument';
import {
  ProceduralComplianceManual,
  evaluateProceduralComplianceStatus,
  ProceduralComplianceEvaluation,
  ComplianceCategoryProfileId,
} from './ProceduralComplianceManual';

function buildQrSvgData(urlText: string): { viewBoxSize: number; pathData: string } {
  const text = urlText || 'https://klausa.studio';
  try {
    const createFn =
      typeof (QRCodeModule as any)?.create === 'function'
        ? (QRCodeModule as any).create
        : typeof (QRCodeModule as any)?.default?.create === 'function'
        ? (QRCodeModule as any).default.create
        : null;

    if (createFn) {
      // Use High error correction ('H' = 30%) so the centered Klausa Studio logo keeps the QR scannable
      const qr = createFn(text, { errorCorrectionLevel: 'H' });
      const size = qr.modules.size;
      const centerMin = Math.floor(size * 0.36);
      const centerMax = Math.ceil(size * 0.64);
      const paths: string[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          // Leave clean space in the very center for the Klausa Studio emblem
          if (r >= centerMin && r <= centerMax && c >= centerMin && c <= centerMax) {
            continue;
          }
          if (qr.modules.get(r, c)) {
            paths.push(`M${c + 1},${r + 1}h1v1h-1z`);
          }
        }
      }
      return {
        viewBoxSize: size + 2,
        pathData: paths.join(''),
      };
    }
  } catch {
    // Fallback to deterministic 29x29 QR matrix below
  }

  // Deterministic Version-3 (29x29) QR Matrix fallback with standard Finder, Timing & Alignment patterns
  const size = 29;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[rr][cc] = true;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Alignment pattern at (22, 22)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = 22 + r;
      const cc = 22 + c;
      reserved[rr][cc] = true;
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        grid[rr][cc] = true;
      }
    }
  }

  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const centerMin = 10;
  const centerMax = 18;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r >= centerMin && r <= centerMax && c >= centerMin && c <= centerMax) {
        reserved[r][c] = true;
        grid[r][c] = false;
        continue;
      }
      if (!reserved[r][c]) {
        const bitSeed = Math.imul(hash ^ (r * 31 + c * 17), 2654435761) >>> 0;
        const charByte = text.charCodeAt((r * size + c) % text.length) || 75;
        grid[r][c] = ((bitSeed ^ charByte) & 1) === 1;
      }
    }
  }

  const paths: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        paths.push(`M${c + 1},${r + 1}h1v1h-1z`);
      }
    }
  }

  return {
    viewBoxSize: size + 2,
    pathData: paths.join(''),
  };
}

interface ShareDraftModalProps {
  document: LegalDocument;
  shareUrl: string;
  isReviewOnlyMode: boolean;
  onToggleReviewOnlyMode: (val: boolean) => void;
  onJumpToClause: (clauseId: string) => void;
  onResolveAllCommentsInDocument?: () => void;
  ownerEmail?: string;
  onChangeOwnerEmail?: (email: string) => void;
  emailNotificationsEnabled?: boolean;
  onToggleEmailNotifications?: (enabled: boolean) => void;
  ownerNotifications?: OwnerCommentNotification[];
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export const ShareDraftReviewModal: React.FC<ShareDraftModalProps> = ({
  document,
  shareUrl,
  isReviewOnlyMode,
  onToggleReviewOnlyMode,
  onJumpToClause,
  onResolveAllCommentsInDocument,
  ownerEmail = 'legal-owner@klausa.studio',
  onChangeOwnerEmail,
  emailNotificationsEnabled: propEmailNotificationsEnabled,
  onToggleEmailNotifications,
  ownerNotifications = [],
  onClose,
  onNotify,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [localResolvedAll, setLocalResolvedAll] = useState(false);
  const [modalFadingIds, setModalFadingIds] = useState<Record<string, boolean>>({});
  const [modalJustResolvedIds, setModalJustResolvedIds] = useState<Record<string, boolean>>({});
  const [modalAnimKey, setModalAnimKey] = useState<number>(0);
  const [showGlobalResolveAnim, setShowGlobalResolveAnim] = useState(false);
  const [globalResolveFeedback, setGlobalResolveFeedback] = useState<string | null>(null);
  const [modalOwnerAlerts, setModalOwnerAlerts] = useState<OwnerCommentNotification[]>([]);
  const [exportStatusBanner, setExportStatusBanner] = useState<string | null>(null);
  const [localEmailNotifEnabled, setLocalEmailNotifEnabled] = useState<boolean>(
    document.emailNotificationsEnabled ?? true
  );
  const effectiveEmailNotifEnabled =
    propEmailNotificationsEnabled !== undefined
      ? propEmailNotificationsEnabled
      : localEmailNotifEnabled;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onNotify?.('Tautan berbagi draf (Mode Komentar) berhasil disalin ke clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onNotify?.('Tautan siap dibagikan: ' + shareUrl);
    }
  };

  const rawComments = document.comments || [];
  const comments: ClauseComment[] = localResolvedAll
    ? rawComments.map((c) => ({ ...c, status: 'Diselesaikan' as const }))
    : rawComments;
  const openComments = comments.filter((c) => c.status !== 'Diselesaikan');
  const openCommentsCount = openComments.length;

  const handleGlobalResolveAllInDocument = () => {
    if (comments.length === 0) return;
    const countToResolve = openComments.length;
    const affectedClauseNumbers = Array.from(
      new Set(
        (countToResolve > 0 ? openComments : comments).map((c) => c.clauseNumber)
      )
    );

    const fadeMap: Record<string, boolean> = {};
    const checkMap: Record<string, boolean> = {};
    comments.forEach((c) => {
      fadeMap[c.id] = true;
      checkMap[c.id] = true;
    });

    setModalAnimKey((prev) => prev + 1);
    setShowGlobalResolveAnim(true);
    setModalFadingIds(fadeMap);
    setModalJustResolvedIds(checkMap);
    setLocalResolvedAll(true);

    const summaryMsg =
      countToResolve > 0
        ? `Seluruh ${countToResolve} komentar terbuka pada ${affectedClauseNumbers.join(
            ', '
          )} (${comments.length} total komentar dokumen) berhasil diselesaikan secara simultan.`
        : `Seluruh ${comments.length} komentar pada dokumen ini telah terverifikasi Diselesaikan.`;

    setGlobalResolveFeedback(summaryMsg);

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const newDocAlert: OwnerCommentNotification = {
      id: `doc-own-ntf-${Date.now()}`,
      documentId: document.id,
      documentTitle: document.title,
      clauseId: affectedClauseNumbers[0] || 'all-clauses',
      clauseNumber: affectedClauseNumbers.join(', ') || 'Seluruh Pasal',
      clauseTitle: document.title,
      eventType: 'all_comments_resolved',
      channel: 'In-App & Email',
      ownerEmail,
      actorName: 'Tim Legal / Reviewer',
      summaryText: summaryMsg,
      timestamp: `Baru saja (${nowTime} WIB)`,
    };
    setModalOwnerAlerts((prev) => [newDocAlert, ...prev.slice(0, 4)]);

    if (onResolveAllCommentsInDocument) {
      onResolveAllCommentsInDocument();
    } else {
      onNotify?.(
        `Notifikasi Pemilik Dokumen (In-App & Email → ${ownerEmail}): ${summaryMsg}`
      );
    }

    setTimeout(() => {
      setModalFadingIds({});
    }, 680);

    setTimeout(() => {
      setModalJustResolvedIds({});
    }, 1800);

    setTimeout(() => {
      setShowGlobalResolveAnim(false);
    }, 2600);
  };

  const combinedModalAlerts = [...modalOwnerAlerts, ...ownerNotifications].filter(
    (v, i, arr) => arr.findIndex((x) => x.id === v.id) === i
  );

  const handleExportCommentsCsv = () => {
    exportCommentsToCsv(document, comments);
    const msg = `Seluruh ${comments.length} komentar dokumen berhasil diekspor ke file CSV untuk arsip eksternal.`;
    setExportStatusBanner(msg);
    onNotify?.(msg);
    setTimeout(() => setExportStatusBanner(null), 3500);
  };

  const handleExportCommentsPdf = () => {
    exportCommentsToPdf(document, comments);
    const msg = `Seluruh ${comments.length} komentar dokumen berhasil diekspor ke file PDF untuk arsip eksternal.`;
    setExportStatusBanner(msg);
    onNotify?.(msg);
    setTimeout(() => setExportStatusBanner(null), 3500);
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 font-ui">
      <div className="bg-white border border-[#D6D0C4] rounded-lg shadow-xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#F7F5F0] border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1E3A8A] text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#18181B]">
                Link Berbagi Draf & Komentar Klausul
              </h3>
              <p className="text-[11px] text-[#57534E]">
                Pihak lain dapat memberi komentar langsung pada pasal tertentu tanpa mengubah naskah asli
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#57534E] hover:text-[#18181B] rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Protection Status */}
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
            <div className="text-xs text-[#57534E] leading-relaxed">
              <strong className="text-[#18181B]">Proteksi Naskah Asli Aktif:</strong> Penerima tautan ini hanya memiliki akses <em>Komentar per Klausul (Comment-Only)</em>. Isi asli akta/perjanjian terkunci dan tidak akan berubah ketika pihak lawan atau konsultan eksternal menambahkan catatan.
            </div>
          </div>

          {/* Shareable Link Input + Copy */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18181B]">
              Tautan Berbagi Draf (Siap Dikirim ke Pihak Kedua / Reviewer):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-3 py-2 text-xs font-code text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Switch to External Reviewer Simulation Mode */}
          <div className="p-3.5 bg-[#F7F5F0] border border-[#D6D0C4] rounded flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#18181B]">
                Mode Tinjauan Pihak Lain (Simulasi Penerima Link)
              </div>
              <p className="text-[11px] text-[#57534E]">
                Kunci naskah asli dan tampilkan antarmuka komentar klausul sebagaimana dilihat oleh penerima link
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onToggleReviewOnlyMode(!isReviewOnlyMode);
                onClose();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                isReviewOnlyMode
                  ? 'bg-amber-700 text-white hover:bg-amber-800'
                  : 'bg-white text-[#1E3A8A] border border-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>
                {isReviewOnlyMode
                  ? 'Kembali ke Mode Editor Penuh'
                  : 'Buka Mode Reviewer Pihak Lain'}
              </span>
            </button>
          </div>

          {/* Document Email Notifications Setting + External Record-Keeping Export (CSV / PDF) */}
          <div className="p-3.5 bg-[#FAF9F6] border border-[#D6D0C4] rounded space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#18181B]">
                    Email Notifications (Peringatan Email Instan Komentar)
                  </div>
                  <p className="text-[10.5px] text-[#57534E]">
                    Terima notifikasi email instan setiap kali pihak lain menambah atau menyelesaikan komentar
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={effectiveEmailNotifEnabled}
                data-testid="modal-email-notifications-toggle"
                onClick={() => {
                  const next = !effectiveEmailNotifEnabled;
                  setLocalEmailNotifEnabled(next);
                  onToggleEmailNotifications?.(next);
                  onNotify?.(
                    next
                      ? `Email Notifications diaktifkan: Peringatan email instan dikirim ke ${ownerEmail}.`
                      : 'Email Notifications dinonaktifkan untuk dokumen ini.'
                  );
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                  effectiveEmailNotifEnabled
                    ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD]'
                    : 'bg-white text-[#57534E] border-[#D6D0C4]'
                }`}
              >
                <BellRing className="w-3 h-3" />
                <span>Email Notifications</span>
                <span
                  className={`px-1.5 py-0.2 text-[9.5px] font-code uppercase rounded ${
                    effectiveEmailNotifEnabled
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-[#E5E0D8] text-[#57534E]'
                  }`}
                >
                  {effectiveEmailNotifEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {effectiveEmailNotifEnabled && onChangeOwnerEmail && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#57534E] shrink-0">Email Penerima Alert:</span>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => onChangeOwnerEmail(e.target.value)}
                  placeholder="Email pemilik dokumen..."
                  className="flex-1 px-2.5 py-1 text-xs font-code bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            )}

            {/* Export All Comments as CSV or PDF for External Record-Keeping */}
            <div className="pt-2.5 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-[#57534E]">
                <strong className="text-[#18181B]">Ekspor Rekaman Komentar ({comments.length}):</strong>{' '}
                Unduh seluruh catatan diskusi pasal sebagai CSV atau PDF untuk arsip audit eksternal
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCommentsCsv}
                  data-testid="export-comments-csv-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#18181B] bg-white hover:bg-[#F7F5F0] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
                  title="Ekspor seluruh komentar dokumen sebagai file CSV (Spreadsheet/Excel)"
                >
                  <Download className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCommentsPdf}
                  data-testid="export-comments-pdf-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
                  title="Ekspor seluruh komentar dokumen sebagai dokumen PDF resmi"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {exportStatusBanner && (
              <div
                role="status"
                data-testid="export-comments-status-banner"
                className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded text-[11px] font-medium text-emerald-900 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{exportStatusBanner}</span>
              </div>
            )}
          </div>

          {/* Active Comments Summary + Global 'Resolve All Comments in Document' Action */}
          <div className="space-y-2.5 pt-2 border-t border-[#E5E0D8]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#18181B]">
                Daftar Komentar Masuk pada Klausul ({comments.length} total · {openCommentsCount} terbuka)
              </span>

              {/* Global 'Resolve All Comments in Document' Button */}
              <button
                type="button"
                disabled={comments.length === 0}
                onClick={handleGlobalResolveAllInDocument}
                data-testid="resolve-all-document-comments-btn"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded border transition-all duration-300 cursor-pointer ${
                  openCommentsCount > 0
                    ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800 shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                } disabled:opacity-50`}
                title="Selesaikan seluruh komentar terbuka di semua pasal dalam dokumen ini sekaligus serta kirim notifikasi pemilik"
              >
                <span
                  key={`global-resolve-doc-icon-${modalAnimKey}`}
                  className={`inline-flex items-center justify-center rounded-full transition-transform duration-300 ${
                    showGlobalResolveAnim || (comments.length > 0 && openCommentsCount === 0)
                      ? 'scale-110 text-emerald-600 bg-white w-4 h-4 animate-checkmark-pop'
                      : ''
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <span>Resolve All Comments in Document</span>
                <span className="font-code text-[10px] opacity-95">
                  ({openCommentsCount > 0 ? `${openCommentsCount} Terbuka → Diselesaikan` : 'Semua Diselesaikan'})
                </span>
              </button>
            </div>

            {/* Global Resolve All Success Checkmark Feedback Banner */}
            {globalResolveFeedback && (
              <div
                role="status"
                data-testid="global-resolve-success-banner"
                className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50 border border-emerald-300 rounded text-[11px] text-emerald-900 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-2xs animate-checkmark-pop shrink-0">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3 h-3 stroke-current stroke-[2.5]"
                    >
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-checkmark-stroke"
                      />
                    </svg>
                  </span>
                  <span className="font-semibold">{globalResolveFeedback}</span>
                </div>
                <span className="font-code text-[10px] text-emerald-700 shrink-0">
                  ✓ Semua Pasal Diselesaikan
                </span>
              </div>
            )}

            {/* Global Owner Notification Dispatch Log inside Modal */}
            {combinedModalAlerts.length > 0 && (
              <div className="space-y-1">
                {combinedModalAlerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    data-testid="modal-owner-notification-alert"
                    className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 bg-[#EFF6FF]/80 border border-[#BFDBFE] rounded text-[11px] text-[#1E3A8A]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BellRing className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                      <span className="font-semibold">
                        [Alert Pemilik Terkirim · {alert.channel}]
                      </span>
                      <span className="text-[#18181B] truncate">{alert.summaryText}</span>
                    </div>
                    <span className="font-code text-[10px] text-[#57534E] shrink-0">
                      Ke: {alert.ownerEmail} · {alert.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {comments.length === 0 ? (
              <p className="text-xs text-[#57534E] py-3 text-center bg-[#FAF9F6] rounded border border-[#E5E0D8]">
                Belum ada komentar pada draf ini. Klik tombol &ldquo;Komentar&rdquo; pada pasal mana pun untuk menambahkan catatan.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {comments.map((c) => {
                  const isResolved = c.status === 'Diselesaikan';
                  const isFading = Boolean(modalFadingIds[c.id]);
                  const isJustResolved = Boolean(modalJustResolvedIds[c.id]);

                  return (
                    <div
                      key={c.id}
                      data-comment-status={c.status}
                      onClick={() => {
                        onJumpToClause(c.clauseId);
                        onClose();
                      }}
                      className={`p-2.5 border rounded cursor-pointer transition-all duration-500 space-y-1 ${
                        isFading
                          ? 'animate-comment-resolve-fade bg-emerald-50/90 border-emerald-300'
                          : isResolved
                          ? 'bg-[#F7F5F0]/85 border-emerald-200 hover:bg-[#F0ECE3]'
                          : 'bg-[#FAF9F6] hover:bg-[#F0ECE3] border-[#E5E0D8]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                        <span>
                          <strong className="text-[#1E3A8A]">{c.clauseNumber}</strong> · {c.authorName} ({c.authorRole})
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          {isResolved && (
                            <span
                              key={`modal-check-${c.id}-${isJustResolved ? modalAnimKey : 'static'}`}
                              className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white ${
                                isJustResolved ? 'animate-checkmark-pop' : ''
                              }`}
                            >
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                className="w-2.5 h-2.5 stroke-current stroke-[2.6]"
                              >
                                <path
                                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={isJustResolved ? 'animate-checkmark-stroke' : ''}
                                />
                              </svg>
                            </span>
                          )}
                          <span
                            className={`font-semibold ${
                              isResolved ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span>·</span>
                          <span>{c.timestamp}</span>
                        </span>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 ${
                          isResolved
                            ? 'text-[#57534E] line-through decoration-emerald-600/40'
                            : 'text-[#18181B]'
                        }`}
                      >
                        {c.commentText}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ClauseCommentThreadProps {
  clause: LegalClause;
  comments: ClauseComment[];
  defaultReviewerName: string;
  defaultReviewerRole: string;
  shareUrl?: string;
  onNotify?: (msg: string) => void;
  ownerEmail?: string;
  onChangeOwnerEmail?: (email: string) => void;
  emailNotificationsEnabled?: boolean;
  onToggleEmailNotifications?: (enabled: boolean) => void;
  ownerNotifications?: OwnerCommentNotification[];
  onTriggerOwnerNotification?: (payload: {
    clause: LegalClause;
    eventType: OwnerCommentNotification['eventType'];
    channel: OwnerCommentNotification['channel'];
    ownerEmail: string;
    actorName: string;
    summaryText: string;
  }) => void;
  onAddComment: (
    clause: LegalClause,
    authorName: string,
    authorRole: string,
    commentText: string,
    proposedAlternative?: string
  ) => void;
  onToggleResolveComment: (commentId: string) => void;
  onResolveAllComments?: (clauseId: string, clauseNumber: string) => void;
  showUnresolvedInSidebar?: boolean;
  onToggleShowUnresolvedInSidebar?: (nextVal: boolean) => void;
  globalResolveTrigger?: number;
}

export type AiRebuttalPerspective =
  | 'Pihak Kedua (Counterparty)'
  | 'Pihak Pertama (Owner)'
  | 'Auditor Hukum Independen';

export async function generateAiLegalRebuttalForClause(
  clause: LegalClause,
  perspective: AiRebuttalPerspective = 'Pihak Kedua (Counterparty)',
  partyOneName = 'PIHAK PERTAMA',
  partyTwoName = 'PIHAK KEDUA'
): Promise<{
  authorName: string;
  authorRole: string;
  commentText: string;
  proposedAlternative: string;
  legalBasisCited: string;
}> {
  const authorMap: Record<AiRebuttalPerspective, { name: string; role: string }> = {
    'Pihak Kedua (Counterparty)': {
      name: 'AI Legal Counsel — Pihak Kedua',
      role: 'AI Agent Legal Profesional (Counterparty)',
    },
    'Pihak Pertama (Owner)': {
      name: 'AI Legal Counsel — Pihak Pertama',
      role: 'AI Agent Legal Profesional (Owner Counsel)',
    },
    'Auditor Hukum Independen': {
      name: 'AI Senior Legal Auditor',
      role: 'AI Agent Legal Profesional (Independent Review)',
    },
  };

  // Try backend Gemini endpoint with fast timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2400);
    const res = await fetch('/api/legal/ai-clause-rebuttal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clauseNumber: clause.number,
        clauseTitle: clause.title,
        clauseContent: clause.content,
        legalBasis: clause.legalBasis,
        riskLevel: clause.riskLevel,
        perspective,
        partyOneName,
        partyTwoName,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.fallback && typeof data.commentText === 'string' && data.commentText.trim()) {
        return {
          authorName: data.authorName || authorMap[perspective].name,
          authorRole: data.authorRole || authorMap[perspective].role,
          commentText: data.commentText.trim(),
          proposedAlternative: (data.proposedAlternative || '').trim(),
          legalBasisCited: data.legalBasisCited || clause.legalBasis || 'Pasal 1338 KUHPerdata',
        };
      }
    }
  } catch {
    // Fallback to deterministic domain-specific Indonesian legal rebuttal
  }

  const combinedText = `${clause.title} ${clause.content.join(' ')}`.toLowerCase();
  const isPayment = /pembayaran|nilai|harga|tagihan|invoice|termin|pajak|ppn/i.test(combinedText);
  const isPenaltyOrTermination = /denda|sanksi|wanprestasi|pengakhiran|pemutusan|1266|1267/i.test(
    combinedText
  );
  const isConfidentialityOrData = /rahasia|data pribadi|pdp|nda|kebocoran|informasi/i.test(
    combinedText
  );
  const isIp = /kekayaan intelektual|hki|hak cipta|source code|karya/i.test(combinedText);
  const isScopeOrSla = /ruang lingkup|pekerjaan|spesifikasi|sla|serah terima|bast/i.test(
    combinedText
  );

  if (perspective === 'Pihak Kedua (Counterparty)') {
    if (isPayment) {
      return {
        authorName: authorMap[perspective].name,
        authorRole: authorMap[perspective].role,
        commentText: `[Sanggahan AI Legal Agent] Ketentuan pembayaran pada ${clause.number} (${clause.title}) membebankan risiko arus kas sepihak kepada ${partyTwoName} karena belum mengatur konsekuensi denda bunga keterlambatan bayar oleh ${partyOneName} serta batas waktu verifikasi Berita Acara (deemed acceptance). Sesuai asas keseimbangan berkontrak (Pasal 1338 ayat (3) & Pasal 1250 KUHPerdata), harus ada batas waktu verifikasi maksimal 7 Hari Kerja.`,
        proposedAlternative: `Apabila dalam jangka waktu 7 (tujuh) Hari Kerja sejak diterimanya dokumen tagihan (invoice) tidak terdapat keberatan tertulis dari ${partyOneName}, maka tagihan dianggap disetujui secara hukum (deemed accepted), dan keterlambatan pembayaran oleh ${partyOneName} dikenakan kompensasi keterlambatan sebesar 0,1% per hari.`,
        legalBasisCited: 'Pasal 1250 & Pasal 1338 ayat (3) KUHPerdata',
      };
    }

    if (isPenaltyOrTermination) {
      return {
        authorName: authorMap[perspective].name,
        authorRole: authorMap[perspective].role,
        commentText: `[Sanggahan AI Legal Agent] Klausul sanksi/pengakhiran pada ${clause.number} (${clause.title}) terlalu berat sebelah (unconscionable) dan berpotensi mengekspos ${partyTwoName} pada klaim ganti rugi tak terbatas tanpa masa perbaikan (cure period) yang memadai. Berdasarkan Pasal 1238 & 1243 KUHPerdata, keadaan lalai wajib didahului Surat Somasi tertulis dengan masa perbaikan minimal 14 Hari Kerja serta pembatasan tanggung jawab (Liability Cap).`,
        proposedAlternative: `Pengenaan sanksi atau pengakhiran Perjanjian berdasarkan ${clause.number} wajib didahului dengan Surat Teguran tertulis (Somasi) yang memberikan waktu perbaikan (cure period) selama 14 (empat belas) Hari Kerja, serta total akumulasi denda/ganti rugi dibatasi maksimal 10% (sepuluh persen) dari nilai porsi pekerjaan yang terlambat.`,
        legalBasisCited: 'Pasal 1238, Pasal 1243 & Pasal 1338 KUHPerdata',
      };
    }

    if (isConfidentialityOrData) {
      return {
        authorName: authorMap[perspective].name,
        authorRole: authorMap[perspective].role,
        commentText: `[Sanggahan AI Legal Agent] Kewajiban kerahasiaan dan pelindungan data pada ${clause.number} (${clause.title}) perlu disanggah karena belum mengecualikan informasi yang telah menjadi domain publik atau diwajibkan dibuka oleh perintah pengadilan/regulator sesuai UU No. 27 Tahun 2022 (UU PDP) dan UU No. 30 Tahun 2000.`,
        proposedAlternative: `Kewajiban menjaga Informasi Rahasia dalam ${clause.number} berlaku secara timbal balik (mutual NDA) bagi kedua belah pihak dan dikecualikan terhadap informasi yang telah menjadi milik publik bukan karena kesalahan Pihak Penerima atau yang wajib diungkapkan berdasarkan perintah hukum/regulator yang berwenang.`,
        legalBasisCited: 'UU No. 27 Tahun 2022 (UU PDP) & UU No. 30 Tahun 2000',
      };
    }

    if (isIp) {
      return {
        authorName: authorMap[perspective].name,
        authorRole: authorMap[perspective].role,
        commentText: `[Sanggahan AI Legal Agent] Pengalihan Hak Kekayaan Intelektual pada ${clause.number} (${clause.title}) berisiko mengambil alih Pre-Existing IP (modul/pustaka dasar) milik ${partyTwoName} sebelum pelunasan penuh diterima. Berdasarkan UU No. 28 Tahun 2014 tentang Hak Cipta, kepemilikan HKI latar belakang tetap melekat pada pencipta asal dan pengalihan hasil kerja hanya efektif setelah pembayaran lunas 100%.`,
        proposedAlternative: `Pengalihan Hak Kekayaan Intelektual atas Hasil Pekerjaan kepada ${partyOneName} baru berlaku efektif sejak seluruh kewajiban pembayaran dilunasi 100% (seratus persen), dengan ketentuan bahwa HKI Latar Belakang (Pre-Existing IP) milik ${partyTwoName} tetap menjadi milik eksklusif ${partyTwoName}.`,
        legalBasisCited: 'UU No. 28 Tahun 2014 tentang Hak Cipta',
      };
    }

    if (isScopeOrSla) {
      return {
        authorName: authorMap[perspective].name,
        authorRole: authorMap[perspective].role,
        commentText: `[Sanggahan AI Legal Agent] Rumusan kewajiban pada ${clause.number} (${clause.title}) membuka celah penambahan ruang lingkup sepihak (scope creep) tanpa kompensasi biaya dan waktu tambahan. Berdasarkan Pasal 1320 & Pasal 1338 KUHPerdata, objek prestasi harus tertentu dan setiap perubahan spesifikasi wajib melalui Change Request tertulis.`,
        proposedAlternative: `Setiap permintaan perubahan atau penambahan spesifikasi di luar ruang lingkup awal pada ${clause.number} wajib dituangkan dalam Perintah Perubahan Tertulis (Change Request) yang disepakati bersama beserta penyesuaian biaya dan jadwal pengerjaan secara proporsional.`,
        legalBasisCited: 'Pasal 1320 & Pasal 1338 KUHPerdata',
      };
    }

    return {
      authorName: authorMap[perspective].name,
      authorRole: authorMap[perspective].role,
      commentText: `[Sanggahan AI Legal Agent] Redaksi ${clause.number} (${clause.title}) masih mengandung perumusan kewajiban yang asimetris dan berpotensi menimbulkan multitafsir yang merugikan ${partyTwoName}. Mengacu pada Pasal 1342 & Pasal 1338 ayat (3) KUHPerdata, pelaksanaan hak dan kewajiban dalam Pasal ini wajib berlaku timbal balik (resiprokal) disertai pemberitahuan tertulis sekurang-kurangnya 14 (empat belas) Hari Kalender.`,
      proposedAlternative: `Pelaksanaan seluruh hak dan kewajiban dalam ${clause.number} tentang ${clause.title} berlaku secara timbal balik dan proporsional bagi Para Pihak dengan mengedepankan pemberitahuan tertulis sekurang-kurangnya 14 (empat belas) Hari Kalender sebelumnya sesuai Pasal 1338 ayat (3) KUHPerdata.`,
      legalBasisCited: 'Pasal 1338 ayat (3) & Pasal 1342 KUHPerdata',
    };
  }

  if (perspective === 'Pihak Pertama (Owner)') {
    return {
      authorName: authorMap[perspective].name,
      authorRole: authorMap[perspective].role,
      commentText: `[Sanggahan AI Legal Agent — Proteksi ${partyOneName}] Rumusan ${clause.number} (${clause.title}) belum memberikan instrumen eksekusi langsung bagi ${partyOneName} apabila terjadi keterlambatan atau ketidaksesuaian mutu oleh ${partyTwoName}. Berdasarkan Pasal 1238 & 1266 KUHPerdata, perlu ditegaskan bahwa lewatnya waktu saja sudah merupakan bukti wanprestasi yang sah tanpa perlu putusan pengadilan terlebih dahulu.`,
      proposedAlternative: `Dengan lewatnya batas waktu pemenuhan kewajiban pada ${clause.number} saja telah menjadi bukti sah dan cukup adanya kelalaian (wanprestasi) dari ${partyTwoName} sesuai Pasal 1238 KUHPerdata, sehingga ${partyOneName} berhak menahan pencairan pembayaran atau menunjuk pihak ketiga atas beban biaya ${partyTwoName}.`,
      legalBasisCited: 'Pasal 1238, Pasal 1243 & Pasal 1266 KUHPerdata',
    };
  }

  return {
    authorName: authorMap[perspective].name,
    authorRole: authorMap[perspective].role,
    commentText: `[Sanggahan & Audit AI Legal Agent] Dari sudut pandang kepatuhan hukum objektif, ${clause.number} (${clause.title}) memiliki celah pembuktian karena belum mencantumkan tolok ukur kuantitatif, batas waktu respons tertulis (SLA hari kerja), serta rujukan ke alat bukti elektronik yang sah menurut Pasal 5 ayat (1) UU ITE No. 1 Tahun 2024.`,
    proposedAlternative: `Seluruh komunikasi, persetujuan, dan pelaporan pelaksanaan ${clause.number} wajib terdokumentasi secara tertulis atau melalui sistem elektronik terverifikasi yang diakui sebagai alat bukti hukum yang sah sesuai Pasal 5 ayat (1) UU No. 1 Tahun 2024 (UU ITE) dengan batas waktu tanggapan maksimal 5 (lima) Hari Kerja.`,
    legalBasisCited: 'Pasal 1866 KUHPerdata & Pasal 5 ayat (1) UU No. 1 Tahun 2024 (UU ITE)',
  };
}

export const ClauseCommentThread: React.FC<ClauseCommentThreadProps> = ({
  clause,
  comments,
  defaultReviewerName,
  defaultReviewerRole,
  shareUrl,
  onNotify,
  ownerEmail: propOwnerEmail,
  onChangeOwnerEmail,
  ownerNotifications = [],
  onTriggerOwnerNotification,
  onAddComment,
  onToggleResolveComment,
  onResolveAllComments,
  showUnresolvedInSidebar,
  onToggleShowUnresolvedInSidebar,
  globalResolveTrigger = 0,
}) => {
  const [authorName, setAuthorName] = useState(defaultReviewerName || 'Kuasa Hukum Pihak Kedua');
  const [authorRole, setAuthorRole] = useState(defaultReviewerRole || 'Reviewer Pihak Kedua');
  const [commentText, setCommentText] = useState('');
  const [proposedAlt, setProposedAlt] = useState('');
  const [showAltInput, setShowAltInput] = useState(false);
  const [copiedClauseDeepLink, setCopiedClauseDeepLink] = useState(false);
  const [lastCopiedDeepLinkUrl, setLastCopiedDeepLinkUrl] = useState<string | null>(null);

  // 'Show Watermark' toggle state to display 'Needs Legal Review' over unresolved comments
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  // 'Show Unresolved' toggle state to highlight unresolved clauses & counters in the clause navigation sidebar
  const [localShowUnresolved, setLocalShowUnresolved] = useState<boolean>(true);
  const effectiveShowUnresolved =
    showUnresolvedInSidebar !== undefined ? showUnresolvedInSidebar : localShowUnresolved;

  // Animation states for subtle fade-out & green success checkmark animation when resolving comments
  const [fadingOutCommentIds, setFadingOutCommentIds] = useState<Record<string, boolean>>({});
  const [justResolvedCommentIds, setJustResolvedCommentIds] = useState<Record<string, boolean>>({});
  const [animSequenceKey, setAnimSequenceKey] = useState<number>(0);
  const [showResolveAllSuccessAnim, setShowResolveAllSuccessAnim] = useState(false);
  const [resolveSuccessFeedback, setResolveSuccessFeedback] = useState<string | null>(null);

  // Document Owner Notification Trigger State (In-App + Email Alert)
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(true);
  const [notifyChannel, setNotifyChannel] = useState<OwnerCommentNotification['channel']>('In-App & Email');
  const [localOwnerEmail, setLocalOwnerEmail] = useState(
    propOwnerEmail || 'legal-owner@klausa.studio'
  );
  const [localAlerts, setLocalAlerts] = useState<OwnerCommentNotification[]>([]);
  const [aiRebuttalPerspective, setAiRebuttalPerspective] = useState<AiRebuttalPerspective>(
    'Pihak Kedua (Counterparty)'
  );
  const [isGeneratingAiRebuttal, setIsGeneratingAiRebuttal] = useState(false);

  const effectiveOwnerEmail = propOwnerEmail !== undefined ? propOwnerEmail : localOwnerEmail;
  const openComments = comments.filter((c) => c.status !== 'Diselesaikan');

  const handlePostAiLegalRebuttal = async (mode: 'post_directly' | 'fill_form') => {
    if (isGeneratingAiRebuttal) return;
    setIsGeneratingAiRebuttal(true);
    try {
      const rebuttal = await generateAiLegalRebuttalForClause(clause, aiRebuttalPerspective);
      if (mode === 'fill_form') {
        setAuthorName(rebuttal.authorName);
        setAuthorRole(rebuttal.authorRole);
        setCommentText(rebuttal.commentText);
        setProposedAlt(rebuttal.proposedAlternative);
        setShowAltInput(true);
        onNotify?.(
          `Sanggahan hukum AI Legal Agent (${rebuttal.authorName}) telah diisikan ke kolom komentar ${clause.number}.`
        );
      } else {
        onAddComment(
          clause,
          rebuttal.authorName,
          rebuttal.authorRole,
          rebuttal.commentText,
          rebuttal.proposedAlternative || undefined
        );
        if (autoNotifyEnabled) {
          dispatchOwnerAlert(
            'comment_added',
            `${rebuttal.authorName} (${rebuttal.authorRole})`,
            `Sanggahan hukum AI Agent ditambahkan pada ${clause.number}: "${rebuttal.commentText.slice(
              0,
              85
            )}..."`
          );
        }
        onNotify?.(
          `${rebuttal.authorName} berhasil menambahkan sanggahan hukum & usulan redaksi alternatif pada ${clause.number}.`
        );
      }
    } finally {
      setIsGeneratingAiRebuttal(false);
    }
  };

  // Trigger simultaneous fade-out & green checkmark animation when global 'Resolve All Comments in Document' is clicked
  useEffect(() => {
    if (!globalResolveTrigger || comments.length === 0) return;
    const allIds = comments.map((c) => c.id);
    const fadeMap: Record<string, boolean> = {};
    const checkMap: Record<string, boolean> = {};
    allIds.forEach((id) => {
      fadeMap[id] = true;
      checkMap[id] = true;
    });

    setAnimSequenceKey((prev) => prev + 1);
    setShowResolveAllSuccessAnim(true);
    setFadingOutCommentIds(fadeMap);
    setJustResolvedCommentIds(checkMap);
    setResolveSuccessFeedback(
      `Seluruh ${comments.length} komentar pada ${clause.number} berhasil diselesaikan melalui Resolve All Comments in Document`
    );

    const t1 = setTimeout(() => setFadingOutCommentIds({}), 680);
    const t2 = setTimeout(() => setJustResolvedCommentIds({}), 1800);
    const t3 = setTimeout(() => {
      setShowResolveAllSuccessAnim(false);
      setResolveSuccessFeedback(null);
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [globalResolveTrigger]);

  const handleToggleShowUnresolved = () => {
    const nextVal = !effectiveShowUnresolved;
    setLocalShowUnresolved(nextVal);
    onToggleShowUnresolvedInSidebar?.(nextVal);
    onNotify?.(
      nextVal
        ? 'Show Unresolved aktif: Klausul dengan komentar terbuka disorot beserta penghitung pada Daftar Isi Pasal.'
        : 'Sorotan Show Unresolved pada Daftar Isi Pasal disembunyikan.'
    );
  };

  const dispatchOwnerAlert = (
    eventType: OwnerCommentNotification['eventType'],
    actor: string,
    summaryText: string
  ) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const newAlert: OwnerCommentNotification = {
      id: `own-ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      documentId: 'active-doc',
      documentTitle: clause.title,
      clauseId: clause.id,
      clauseNumber: clause.number,
      clauseTitle: clause.title,
      eventType,
      channel: notifyChannel,
      ownerEmail: effectiveOwnerEmail || 'legal-owner@klausa.studio',
      actorName: actor,
      summaryText,
      timestamp: `Baru saja (${nowTime} WIB)`,
    };

    setLocalAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);
    onTriggerOwnerNotification?.({
      clause,
      eventType,
      channel: notifyChannel,
      ownerEmail: effectiveOwnerEmail || 'legal-owner@klausa.studio',
      actorName: actor,
      summaryText,
    });
  };

  const handleShareClauseDeepLink = async () => {
    const base =
      shareUrl ||
      `${window.location.origin}${window.location.pathname}?share=share-active`;
    const separator = base.includes('?') ? '&' : '?';
    const deepLink = `${base}${separator}clause=${encodeURIComponent(
      clause.id
    )}#clause-comment-${clause.id}`;

    let copiedOk = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(deepLink);
        copiedOk = true;
      }
    } catch {
      copiedOk = false;
    }

    if (!copiedOk) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = deepLink;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        // fallback handled via toast & inline url preview
      }
    }

    setCopiedClauseDeepLink(true);
    setLastCopiedDeepLinkUrl(deepLink);
    onNotify?.(
      `Deep link ke thread komentar ${clause.number} (${clause.title}) berhasil disalin ke clipboard.`
    );
    setTimeout(() => setCopiedClauseDeepLink(false), 2600);
  };

  const handleResolveAll = () => {
    if (comments.length === 0) return;
    const countToResolve = openComments.length;

    // Trigger the existing fade-out & green success checkmark animation sequence
    // for ALL comments in this clause simultaneously
    const allCommentIds = comments.map((c) => c.id);
    const simultaneousFadeMap: Record<string, boolean> = {};
    const simultaneousCheckmarkMap: Record<string, boolean> = {};
    allCommentIds.forEach((id) => {
      simultaneousFadeMap[id] = true;
      simultaneousCheckmarkMap[id] = true;
    });

    setAnimSequenceKey((prev) => prev + 1);
    setShowResolveAllSuccessAnim(true);
    setFadingOutCommentIds(simultaneousFadeMap);
    setJustResolvedCommentIds(simultaneousCheckmarkMap);
    setResolveSuccessFeedback(
      countToResolve > 0
        ? `Seluruh ${comments.length} komentar pada ${clause.number} berhasil diselesaikan secara simultan`
        : `Seluruh ${comments.length} komentar pada ${clause.number} telah terverifikasi Diselesaikan`
    );

    if (countToResolve > 0) {
      if (onResolveAllComments) {
        onResolveAllComments(clause.id, clause.number);
      } else {
        openComments.forEach((c) => onToggleResolveComment(c.id));
      }

      if (autoNotifyEnabled) {
        dispatchOwnerAlert(
          'all_comments_resolved',
          authorName.trim() || 'Tim Legal',
          `Seluruh ${countToResolve} komentar terbuka pada ${clause.number} (${clause.title}) telah ditandai Diselesaikan.`
        );
      }
    }

    setTimeout(() => {
      setFadingOutCommentIds({});
    }, 680);

    setTimeout(() => {
      setJustResolvedCommentIds({});
    }, 1800);

    setTimeout(() => {
      setShowResolveAllSuccessAnim(false);
      setResolveSuccessFeedback(null);
    }, 2600);
  };

  const handleToggleSingleComment = (item: ClauseComment) => {
    const nextStatus = item.status === 'Diselesaikan' ? 'Terbuka' : 'Diselesaikan';
    if (nextStatus === 'Diselesaikan') {
      setAnimSequenceKey((prev) => prev + 1);
      setFadingOutCommentIds((prev) => ({ ...prev, [item.id]: true }));
      setJustResolvedCommentIds((prev) => ({ ...prev, [item.id]: true }));
      setResolveSuccessFeedback(
        `Komentar dari ${item.authorName} ditandai Diselesaikan`
      );
      setTimeout(() => {
        setFadingOutCommentIds((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 680);
      setTimeout(() => {
        setJustResolvedCommentIds((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      }, 1800);
      setTimeout(() => {
        setResolveSuccessFeedback(null);
      }, 2200);
    } else {
      setJustResolvedCommentIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setResolveSuccessFeedback(null);
    }

    onToggleResolveComment(item.id);
    if (autoNotifyEnabled) {
      dispatchOwnerAlert(
        nextStatus === 'Diselesaikan' ? 'comment_resolved' : 'comment_reopened',
        authorName.trim() || item.authorName,
        `Komentar dari ${item.authorName} pada ${clause.number} diubah statusnya menjadi "${nextStatus}".`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const cleanAuthor = authorName.trim() || 'Reviewer Eksternal';
    const cleanRole = authorRole.trim() || 'Pihak Kedua';
    const cleanComment = commentText.trim();

    onAddComment(
      clause,
      cleanAuthor,
      cleanRole,
      cleanComment,
      proposedAlt.trim() || undefined
    );

    if (autoNotifyEnabled) {
      dispatchOwnerAlert(
        'comment_added',
        `${cleanAuthor} (${cleanRole})`,
        `Komentar baru ditambahkan pada ${clause.number}: "${cleanComment.slice(0, 90)}${
          cleanComment.length > 90 ? '...' : ''
        }"`
      );
    }

    setCommentText('');
    setProposedAlt('');
    setShowAltInput(false);
  };

  const clauseAlerts = [
    ...ownerNotifications.filter(
      (n) => n.clauseId === clause.id || n.clauseNumber === clause.number
    ),
    ...localAlerts,
  ].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);

  return (
    <div
      id={`clause-comment-${clause.id}`}
      className="ClauseCommentThread no-print mt-3 p-3.5 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md font-ui space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#E5E0D8] pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#18181B]">
          <MessageSquare className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>
            Diskusi & Komentar pada {clause.number} ({comments.length} komentar)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 'Show Unresolved' Toggle to Highlight Clauses Requiring Attention in the Clause Navigation Sidebar */}
          <button
            type="button"
            role="switch"
            aria-checked={effectiveShowUnresolved}
            onClick={handleToggleShowUnresolved}
            data-testid="show-unresolved-toggle"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-all duration-200 cursor-pointer ${
              effectiveShowUnresolved
                ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs'
                : 'bg-white text-[#57534E] hover:text-[#18181B] hover:bg-[#F7F5F0] border-[#D6D0C4]'
            }`}
            title="Sorot dan tampilkan penghitung komentar belum selesai (Unresolved) pada navigasi Daftar Isi Pasal di sidebar kiri"
          >
            <AlertCircle
              className={`w-3.5 h-3.5 ${
                effectiveShowUnresolved ? 'text-rose-700' : 'text-[#78716C]'
              }`}
            />
            <span>Show Unresolved</span>
            <span
              className={`px-1.5 py-0.2 text-[9.5px] font-code uppercase rounded ${
                effectiveShowUnresolved
                  ? 'bg-rose-700 text-white'
                  : 'bg-[#E5E0D8] text-[#57534E]'
              }`}
            >
              {effectiveShowUnresolved ? `ON · ${openComments.length}` : 'OFF'}
            </span>
          </button>

          {/* 'Show Watermark' Toggle to Display 'Needs Legal Review' Label over Unresolved Comments */}
          <button
            type="button"
            role="switch"
            aria-checked={showWatermark}
            onClick={() => setShowWatermark((prev) => !prev)}
            data-testid="show-watermark-toggle"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-all duration-200 cursor-pointer ${
              showWatermark
                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs'
                : 'bg-white text-[#57534E] hover:text-[#18181B] hover:bg-[#F7F5F0] border-[#D6D0C4]'
            }`}
            title="Tampilkan atau sembunyikan watermark 'Needs Legal Review' pada komentar yang belum diselesaikan"
          >
            <Stamp className={`w-3.5 h-3.5 ${showWatermark ? 'text-amber-700' : 'text-[#78716C]'}`} />
            <span>Show Watermark</span>
            <span
              className={`px-1.5 py-0.2 text-[9.5px] font-code uppercase rounded ${
                showWatermark
                  ? 'bg-amber-700 text-white'
                  : 'bg-[#E5E0D8] text-[#57534E]'
              }`}
            >
              {showWatermark ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Dedicated 'Share Clause' Button to Copy Deep Link to this Clause's Comment Thread */}
          <button
            type="button"
            onClick={handleShareClauseDeepLink}
            data-testid="share-clause-btn"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-all duration-200 cursor-pointer ${
              copiedClauseDeepLink
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border-[#BFDBFE]'
            }`}
            title={`Salin deep link langsung ke thread komentar ${clause.number} (#clause-comment-${clause.id})`}
          >
            {copiedClauseDeepLink ? (
              <>
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white animate-checkmark-pop">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-2.5 h-2.5 stroke-current stroke-[2.5]"
                  >
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-checkmark-stroke"
                    />
                  </svg>
                </span>
                <span className="text-emerald-800">Deep Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Share Clause</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={comments.length === 0}
            onClick={handleResolveAll}
            data-testid="resolve-all-comments-btn"
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded border transition-all duration-300 ${
              openComments.length > 0
                ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
            }`}
            title="Set all open comments for this specific clause to Diselesaikan and trigger simultaneous checkmark animation"
          >
            <span
              key={`resolve-all-icon-${animSequenceKey}`}
              className={`inline-flex items-center justify-center rounded-full transition-transform duration-300 ${
                showResolveAllSuccessAnim || openComments.length === 0
                  ? 'scale-110 text-emerald-600 bg-white w-4 h-4 animate-checkmark-pop'
                  : ''
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <span>Resolve All Comments</span>
            <span className="font-code text-[10px] opacity-95">
              ({openComments.length > 0 ? `${openComments.length} Terbuka → Diselesaikan` : 'Semua Diselesaikan'})
            </span>
          </button>
          <span className="text-[11px] text-[#57534E]">
            Naskah asli tidak berubah oleh komentar
          </span>
        </div>
      </div>

      {/* Copied Clause Deep Link Confirmation Pill */}
      {lastCopiedDeepLinkUrl && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[11px] text-[#1E3A8A]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link2 className="w-3.5 h-3.5 shrink-0 text-[#1E3A8A]" />
            <span className="font-semibold shrink-0">Deep Link {clause.number} Tersalin:</span>
            <code className="font-code text-[10.5px] bg-white px-1.5 py-0.5 rounded border border-[#DBEAFE] text-[#18181B] truncate max-w-xs sm:max-w-md">
              {lastCopiedDeepLinkUrl}
            </code>
          </div>
          <button
            type="button"
            onClick={() => setLastCopiedDeepLinkUrl(null)}
            className="text-[10.5px] text-[#57534E] hover:text-[#18181B] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Green Success Checkmark Feedback Banner when Resolving Comments */}
      {resolveSuccessFeedback && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded text-[11px] text-emerald-900 transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-2xs animate-checkmark-pop">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="w-3 h-3 stroke-current stroke-[2.5]"
              >
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-checkmark-stroke"
                />
              </svg>
            </span>
            <span className="font-semibold">{resolveSuccessFeedback}</span>
          </div>
          <span className="font-code text-[10px] text-emerald-700">✓ Status: Diselesaikan</span>
        </div>
      )}

      {/* Document Owner Real-Time Email & In-App Notification Trigger Bar */}
      <div className="p-2.5 bg-white border border-[#E5E0D8] rounded space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#18181B] cursor-pointer">
            <input
              type="checkbox"
              checked={autoNotifyEnabled}
              onChange={(e) => setAutoNotifyEnabled(e.target.checked)}
              className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A]"
            />
            <BellRing className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>
              Notifikasi Otomatis Pemilik Dokumen (Saat Komentar Ditambah / Diselesaikan)
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={notifyChannel}
              onChange={(e) =>
                setNotifyChannel(e.target.value as OwnerCommentNotification['channel'])
              }
              className="px-2 py-1 text-[11px] font-medium text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
              title="Pilih saluran pengiriman notifikasi ke pemilik dokumen"
            >
              <option value="In-App & Email">Saluran: In-App & Email</option>
              <option value="In-App Saja">Saluran: In-App Saja</option>
              <option value="Email Saja">Saluran: Email Saja</option>
            </select>

            <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#D6D0C4] rounded px-2 py-0.5">
              <Mail className="w-3 h-3 text-[#1E3A8A] shrink-0" />
              <input
                type="email"
                value={effectiveOwnerEmail}
                onChange={(e) => {
                  setLocalOwnerEmail(e.target.value);
                  onChangeOwnerEmail?.(e.target.value);
                }}
                placeholder="Email pemilik dokumen..."
                className="w-40 text-[11px] font-code text-[#18181B] bg-transparent focus:outline-none"
                title="Alamat email pemilik dokumen untuk peringatan instan"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                dispatchOwnerAlert(
                  openComments.length === 0 && comments.length > 0
                    ? 'all_comments_resolved'
                    : 'comment_added',
                  authorName.trim() || 'Tim Reviewer',
                  `Peringatan langsung pada ${clause.number}: ${openComments.length} komentar terbuka, ${
                    comments.length - openComments.length
                  } diselesaikan.`
                )
              }
              className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
              title="Kirim peringatan instan sekarang ke pemilik dokumen"
            >
              <Send className="w-2.5 h-2.5" />
              <span>Kirim Alert Pemilik</span>
            </button>
          </div>
        </div>

        {/* Immediate Owner Notification Dispatch Log for this Clause */}
        {clauseAlerts.length > 0 && (
          <div className="pt-1.5 border-t border-[#F0ECE3] space-y-1">
            {clauseAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 bg-[#EFF6FF]/70 border border-[#BFDBFE] rounded text-[11px] text-[#1E3A8A]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <BellRing className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                  <span className="font-semibold">
                    [Alert Pemilik Terkirim · {alert.channel}]
                  </span>
                  <span className="text-[#18181B] truncate">{alert.summaryText}</span>
                </div>
                <span className="font-code text-[10px] text-[#57534E] shrink-0">
                  Ke: {alert.ownerEmail} · {alert.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Legal Professional Agent Rebuttal & Counter-Drafting Bar */}
      <div
        data-testid={`ai-legal-agent-rebuttal-bar-${clause.id}`}
        className="p-2.5 bg-[#EFF6FF]/75 border border-[#BFDBFE] rounded space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#1E3A8A] block leading-tight">
                AI Legal Agent Profesional — Sanggahan & Uji Kritis Pasal
              </span>
              <span className="text-[10px] text-[#57534E] block">
                Minta AI Legal Agent menganalisis {clause.number} dan menulis komentar sanggahan hukum beserta usulan redaksi tandingan
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <select
              aria-label="Sudut Pandang AI Legal Agent"
              data-testid={`ai-rebuttal-perspective-select-${clause.id}`}
              value={aiRebuttalPerspective}
              onChange={(e) =>
                setAiRebuttalPerspective(e.target.value as AiRebuttalPerspective)
              }
              className="px-2 py-1 text-[11px] font-medium text-[#18181B] bg-white border border-[#BFDBFE] rounded focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="Pihak Kedua (Counterparty)">
                Peran AI: Kuasa Hukum Pihak Kedua (Menyanggah)
              </option>
              <option value="Pihak Pertama (Owner)">
                Peran AI: Kuasa Hukum Pihak Pertama (Proteksi)
              </option>
              <option value="Auditor Hukum Independen">
                Peran AI: Auditor Hukum Independen
              </option>
            </select>

            <button
              type="button"
              disabled={isGeneratingAiRebuttal}
              data-testid="fill-ai-legal-rebuttal-btn"
              onClick={() => handlePostAiLegalRebuttal('fill_form')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#DBEAFE] border border-[#93C5FD] rounded transition-colors cursor-pointer disabled:opacity-50"
              title="Isi kolom form komentar di bawah dengan draf sanggahan AI Legal Agent agar dapat Anda sunting sebelum dikirim"
            >
              <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
              <span>Isi ke Kolom Komentar</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingAiRebuttal}
              data-testid="post-ai-legal-rebuttal-btn"
              onClick={() => handlePostAiLegalRebuttal('post_directly')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Langsung tambahkan komentar sanggahan hukum dari AI Legal Agent Profesional ke pasal ini"
            >
              <Bot className="w-3 h-3" />
              <span>
                {isGeneratingAiRebuttal
                  ? 'AI Menyusun Sanggahan...'
                  : '+ Sanggahan AI Legal Agent'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Comments List with Subtle Fade-Out, Simultaneous Checkmark Sequence & 'Needs Legal Review' Watermark */}
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((item) => {
            const isResolved = item.status === 'Diselesaikan';
            const isFadingOut = Boolean(fadingOutCommentIds[item.id]);
            const isJustResolved = Boolean(justResolvedCommentIds[item.id]);
            const showUnresolvedWatermark = showWatermark && (!isResolved || isFadingOut);

            return (
              <div
                key={item.id}
                data-comment-status={item.status}
                className={`relative overflow-hidden p-3 rounded border space-y-1.5 transition-all duration-500 ease-out ${
                  isFadingOut
                    ? 'animate-comment-resolve-fade bg-emerald-50/85 border-emerald-300'
                    : isResolved
                    ? 'bg-[#F7F5F0]/80 border-emerald-200/95 opacity-65 scale-[0.995]'
                    : 'bg-white border-[#D6D0C4] opacity-100 scale-100'
                }`}
              >
                {/* 'Needs Legal Review' Watermark Overlay over Unresolved Comments */}
                {showUnresolvedWatermark && (
                  <div
                    data-testid={`needs-legal-review-watermark-${item.id}`}
                    className={`pointer-events-none select-none absolute inset-0 flex items-center justify-center z-0 transition-opacity duration-500 ${
                      isFadingOut ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <span className="px-3 py-1 border-2 border-dashed border-amber-600/30 rounded text-[11px] sm:text-xs font-code font-extrabold uppercase tracking-[0.2em] text-amber-800/20 bg-amber-50/30 -rotate-6">
                      Needs Legal Review
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#57534E]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/ai legal|ai counsel|ai agent|ai senior/i.test(
                      `${item.authorName} ${item.authorRole}`
                    ) ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-code font-bold uppercase tracking-wider bg-[#1E3A8A] text-white rounded">
                        <Bot className="w-2.5 h-2.5" />
                        <span>AI Legal Agent</span>
                      </span>
                    ) : (
                      <User className="w-3 h-3 text-[#1E3A8A]" />
                    )}
                    <strong className="text-[#18181B]">{item.authorName}</strong>
                    <span>·</span>
                    <span>{item.authorRole}</span>
                    <span>·</span>
                    <span>{item.timestamp}</span>
                    <span>·</span>
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold transition-all duration-300 ${
                        isResolved ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isResolved && (
                        <span
                          key={`status-check-${item.id}-${isJustResolved ? animSequenceKey : 'static'}`}
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-200 ${
                            isJustResolved ? 'animate-checkmark-pop' : ''
                          }`}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            className="w-2.5 h-2.5 stroke-current stroke-[2.6]"
                          >
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={isJustResolved ? 'animate-checkmark-stroke' : ''}
                            />
                          </svg>
                        </span>
                      )}
                      <span>Status: {item.status}</span>
                    </span>

                    {/* High-visibility 'Needs Legal Review' Pending Action Badge when Watermark is enabled */}
                    {showWatermark && !isResolved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-code font-bold uppercase tracking-wider bg-amber-100/95 text-amber-900 border border-amber-400 rounded shadow-2xs">
                        <Stamp className="w-2.5 h-2.5 text-amber-700" />
                        <span>Needs Legal Review</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSingleComment(item)}
                    data-testid={`resolve-comment-btn-${item.id}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all duration-300 cursor-pointer ${
                      isResolved
                        ? 'text-emerald-800 bg-emerald-100/90 border border-emerald-300 shadow-2xs'
                        : 'text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300'
                    }`}
                  >
                    <span
                      key={`btn-check-${item.id}-${isJustResolved ? animSequenceKey : 'static'}`}
                      className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                        isResolved
                          ? `bg-emerald-600 text-white ${isJustResolved ? 'animate-checkmark-pop' : ''}`
                          : 'border border-emerald-600 text-emerald-700'
                      }`}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="w-2.5 h-2.5 stroke-current stroke-[2.6]"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={isResolved && isJustResolved ? 'animate-checkmark-stroke' : ''}
                        />
                      </svg>
                    </span>
                    <span>{isResolved ? 'Diselesaikan' : 'Resolve'}</span>
                  </button>
                </div>

                <p
                  className={`relative z-10 text-xs leading-relaxed transition-all duration-500 ${
                    isResolved
                      ? 'text-[#57534E] line-through decoration-emerald-600/40 opacity-85'
                      : 'text-[#18181B]'
                  }`}
                >
                  {item.commentText}
                </p>

                {item.proposedAlternative && (
                  <div className="p-2 bg-[#FAF9F6] border-l-2 border-[#1E3A8A] text-[11.5px] font-legal text-[#27272A]">
                    <span className="block font-ui text-[10.5px] font-semibold text-[#1E3A8A] mb-0.5">
                      Usulan Bunyi Alternatif (Tanpa Mengubah Naskah Asli):
                    </span>
                    {item.proposedAlternative}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Clause Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Nama Pemberi Komentar..."
            className="px-2.5 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
          />
          <input
            type="text"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Peran (misal: Legal Pihak Kedua / Reviewer)..."
            className="px-2.5 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
          />
        </div>

        <textarea
          rows={2}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`Tulis komentar, keberatan, atau catatan tinjauan untuk ${clause.number} tanpa mengubah naskah asli...`}
          className="w-full p-2.5 text-xs bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
        />

        {showAltInput && (
          <textarea
            rows={2}
            value={proposedAlt}
            onChange={(e) => setProposedAlt(e.target.value)}
            placeholder="Opsional: Tuliskan usulan redaksi alternatif sebagai bahan pertimbangan..."
            className="w-full p-2 text-xs font-legal bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowAltInput(!showAltInput)}
            className="text-[11px] text-[#1E3A8A] hover:underline cursor-pointer"
          >
            {showAltInput
              ? '- Sembunyikan usulan redaksi alternatif'
              : '+ Lampirkan usulan redaksi alternatif (opsional)'}
          </button>

          <button
            type="submit"
            disabled={!commentText.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Kirim Komentar & Beritahu Pemilik</span>
          </button>
        </div>
      </form>
    </div>
  );
};

interface DocumentVerificationQrFooterProps {
  document: LegalDocument;
  shareUrl: string;
  onOpenShareModal?: () => void;
  onSimulateScanQr?: () => void;
  onDownloadOriginalPdf?: () => void;
  onOpenManualKepatuhanTab?: () => void;
  onInsertProceduralClause?: (clause: Omit<LegalClause, 'id' | 'number'>) => void;
  onUpdateClosingText?: (newClosingText: string) => void;
  manualComplianceCheckedByDoc?: Record<string, string[]>;
  onChangeManualComplianceCheckedByDoc?: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >;
  manualComplianceProfileMode?: ComplianceCategoryProfileId;
  onChangeManualComplianceProfileMode?: (mode: ComplianceCategoryProfileId) => void;
  onNotify?: (msg: string) => void;
}

export const DocumentVerificationQrFooter: React.FC<DocumentVerificationQrFooterProps> = ({
  document,
  shareUrl,
  onOpenShareModal,
  onSimulateScanQr,
  onDownloadOriginalPdf,
  onOpenManualKepatuhanTab,
  onInsertProceduralClause,
  onUpdateClosingText,
  manualComplianceCheckedByDoc,
  onChangeManualComplianceCheckedByDoc,
  manualComplianceProfileMode = 'auto',
  onChangeManualComplianceProfileMode,
  onNotify,
}) => {
  const [copiedVerificationUrl, setCopiedVerificationUrl] = useState(false);
  const [showQrGuide, setShowQrGuide] = useState(true);

  // Dedicated 'Bantuan Kepatuhan' Modal Overlay state
  const [isBantuanKepatuhanModalOpen, setIsBantuanKepatuhanModalOpen] = useState(false);
  const [localProfileMode, setLocalProfileMode] =
    useState<ComplianceCategoryProfileId>(manualComplianceProfileMode);
  const effectiveProfileMode =
    onChangeManualComplianceProfileMode !== undefined
      ? manualComplianceProfileMode
      : localProfileMode;
  const setEffectiveProfileMode =
    onChangeManualComplianceProfileMode || setLocalProfileMode;

  // Visual 'QR Expiry' Countdown Timer state (remaining validity period in seconds + enable/disable toggle for indefinite validity)
  const [isQrExpiryTimerEnabled, setIsQrExpiryTimerEnabled] = useState<boolean>(true);
  const [qrExpiryPresetSeconds, setQrExpiryPresetSeconds] = useState<number>(86400); // Default 24 hours (86,400s)
  const [qrRemainingSeconds, setQrRemainingSeconds] = useState<number>(86385); // Starts at 23h 59m 45s
  const [qrLastRefreshedLabel, setQrLastRefreshedLabel] = useState<string>('Baru saja');

  useEffect(() => {
    if (!isQrExpiryTimerEnabled) return;
    const timer = window.setInterval(() => {
      setQrRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isQrExpiryTimerEnabled]);

  const handleToggleQrExpiryTimer = (nextEnabled?: boolean) => {
    const targetState = nextEnabled !== undefined ? nextEnabled : !isQrExpiryTimerEnabled;
    setIsQrExpiryTimerEnabled(targetState);
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setQrLastRefreshedLabel(`${nowTime} WIB`);
    if (!targetState) {
      onNotify?.(
        `QR Expiry Timer dinonaktifkan oleh Tim Keamanan — Tautan verifikasi Kode QR (${document.documentNumber}) kini aktif tanpa batas waktu (Indefinite).`
      );
    } else {
      onNotify?.(
        `QR Expiry Timer diaktifkan kembali — Penghitung waktu mundur validitas tautan Kode QR (${document.documentNumber}) berjalan.`
      );
    }
  };

  const handleRefreshQrExpiry = (newDurationSeconds: number = qrExpiryPresetSeconds) => {
    setIsQrExpiryTimerEnabled(true);
    setQrExpiryPresetSeconds(newDurationSeconds);
    setQrRemainingSeconds(newDurationSeconds);
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setQrLastRefreshedLabel(`${nowTime} WIB`);
    onNotify?.(
      `Masa berlaku tautan verifikasi Kode QR (${document.documentNumber}) berhasil diperbarui & di-refresh.`
    );
  };

  const qrHours = Math.floor(qrRemainingSeconds / 3600);
  const qrMinutes = Math.floor((qrRemainingSeconds % 3600) / 60);
  const qrSeconds = qrRemainingSeconds % 60;
  const qrFormattedTime = `${String(qrHours).padStart(2, '0')}j : ${String(
    qrMinutes
  ).padStart(2, '0')}m : ${String(qrSeconds).padStart(2, '0')}d`;
  const qrCompactTime = `${String(qrHours).padStart(2, '0')}:${String(
    qrMinutes
  ).padStart(2, '0')}:${String(qrSeconds).padStart(2, '0')}`;
  const qrValidityRatioPct = !isQrExpiryTimerEnabled
    ? 100
    : Math.max(
        0,
        Math.min(100, Math.round((qrRemainingSeconds / Math.max(1, qrExpiryPresetSeconds)) * 100))
      );
  const isQrExpired = isQrExpiryTimerEnabled && qrRemainingSeconds <= 0;
  const isQrLessThanFiveMinutes =
    isQrExpiryTimerEnabled && !isQrExpired && qrRemainingSeconds <= 300; // < 5 minutes (300s)
  const isQrExpiringSoon =
    isQrExpiryTimerEnabled && !isQrExpired && qrRemainingSeconds <= 3600; // < 1 hour

  // Basic Security Anomaly Detection: Track QR link clicks from distinct IP addresses
  const DISTINCT_IP_POOL = React.useMemo(
    () => [
      { ip: '103.144.172.14', location: 'Jakarta Selatan (Biznet Fiber)' },
      { ip: '114.122.89.201', location: 'Surabaya (Telkomsel 5G)' },
      { ip: '182.253.44.92', location: 'Bandung (IndiHome)' },
      { ip: '36.72.210.18', location: 'Medan (Telkom Astinet)' },
      { ip: '103.28.114.55', location: 'Denpasar (CBN Fiber)' },
      { ip: '125.160.31.88', location: 'Semarang (XL Axiata)' },
      { ip: '202.152.10.41', location: 'Makassar (FirstMedia)' },
      { ip: '103.105.52.19', location: 'Singapura (Cross-Border Proxy)' },
      { ip: '45.118.133.77', location: 'Yogyakarta (MyRepublic)' },
      { ip: '118.99.71.104', location: 'Tangerang (Indosat HiFi)' },
    ],
    []
  );

  const [distinctIpClickLogs, setDistinctIpClickLogs] = useState<
    { ip: string; location: string; clickedAt: string }[]
  >([]);

  const handleRecordQrClickFromDistinctIp = (customBatchCount?: number) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setDistinctIpClickLogs((prev) => {
      if (customBatchCount && customBatchCount > prev.length) {
        const nextList = [...prev];
        while (nextList.length < customBatchCount) {
          const idx = nextList.length;
          const preset = DISTINCT_IP_POOL[idx] || {
            ip: `103.${20 + idx}.${110 + idx}.${15 + idx}`,
            location: `Node Eksternal #${idx + 1}`,
          };
          nextList.push({
            ip: preset.ip,
            location: preset.location,
            clickedAt: `${nowTime} WIB`,
          });
        }
        return nextList;
      }

      const nextIdx = prev.length;
      const preset = DISTINCT_IP_POOL[nextIdx] || {
        ip: `103.${30 + nextIdx}.${100 + nextIdx}.${11 + nextIdx}`,
        location: `Jaringan Eksternal #${nextIdx + 1}`,
      };
      return [
        ...prev,
        {
          ip: preset.ip,
          location: preset.location,
          clickedAt: `${nowTime} WIB`,
        },
      ];
    });
  };

  const handleResetDistinctIpLogs = () => {
    setDistinctIpClickLogs([]);
    onNotify?.(
      `Log akses IP unik untuk tautan Kode QR (${document.documentNumber}) telah di-reset & token diamankan.`
    );
  };

  const distinctIpClickCount = distinctIpClickLogs.length;
  const hasDistinctIpAnomaly = distinctIpClickCount > 5;

  // Hover & Expandable Explanation Popup States for the QR Code
  const [isQrHovered, setIsQrHovered] = useState(false);
  const [isQrPopupPinned, setIsQrPopupPinned] = useState(false);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);

  // Fallback local state if not controlled from parent
  const [localCheckedByDoc, setLocalCheckedByDoc] = useState<Record<string, string[]>>({});
  const effectiveCheckedByDoc =
    manualComplianceCheckedByDoc !== undefined
      ? manualComplianceCheckedByDoc
      : localCheckedByDoc;
  const setEffectiveCheckedByDoc =
    onChangeManualComplianceCheckedByDoc || setLocalCheckedByDoc;

  const complianceEval: ProceduralComplianceEvaluation = React.useMemo(
    () =>
      evaluateProceduralComplianceStatus(
        document,
        effectiveCheckedByDoc,
        effectiveProfileMode
      ),
    [document, effectiveCheckedByDoc, effectiveProfileMode]
  );

  const missingProceduralSteps = React.useMemo(
    () => complianceEval.stepsWithStatus.filter((s) => !s.isPassed),
    [complianceEval.stepsWithStatus]
  );

  const handleToggleProceduralStepFromFooter = (stepId: string) => {
    setEffectiveCheckedByDoc((prev) => {
      const existing =
        prev[complianceEval.docStateKey] !== undefined
          ? prev[complianceEval.docStateKey]
          : complianceEval.checkedStepIds;
      const next = existing.includes(stepId)
        ? existing.filter((id) => id !== stepId)
        : [...existing, stepId];
      return {
        ...prev,
        [complianceEval.docStateKey]: next,
      };
    });
  };

  const handleMarkAllProceduralChecksPassed = () => {
    const allStepIds = complianceEval.profile.steps.map((s) => s.id);
    setEffectiveCheckedByDoc((prev) => ({
      ...prev,
      [complianceEval.docStateKey]: allStepIds,
    }));
    onNotify?.(
      `Seluruh ${allStepIds.length} syarat Manual Kepatuhan (Bea Meterai, Kehadiran Saksi, & Notarisasi) telah diverifikasi — Dokumen kini berstatus SIAP DITANDATANGANI (Ready for Signature).`
    );
  };

  const handleDownloadPdfShortcut = () => {
    if (onDownloadOriginalPdf) {
      onDownloadOriginalPdf();
      return;
    }
    try {
      exportToPdf(document);
      onNotify?.(
        `Ekspor PDF Asli untuk "${document.title}" (${document.documentNumber}) berhasil diunduh.`
      );
    } catch {
      onNotify?.('Mengunduh dokumen PDF asli...');
    }
  };

  // Interactive QR Code Generator state for encoding the shareable draft URL to be printed at the bottom of the legal document
  const [qrCustomShareUrl, setQrCustomShareUrl] = useState<string>('');
  const [qrPrintSize, setQrPrintSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [qrGeneratedCount, setQrGeneratedCount] = useState<number>(1);
  const [qrGeneratedAtLabel, setQrGeneratedAtLabel] = useState<string>('Siap Cetak');

  useEffect(() => {
    setQrCustomShareUrl('');
  }, [document.id, shareUrl]);

  const effectiveEncodedShareUrl = React.useMemo(() => {
    const base = qrCustomShareUrl.trim() || shareUrl;
    return base;
  }, [qrCustomShareUrl, shareUrl]);

  const qrSvgData = React.useMemo(
    () => buildQrSvgData(effectiveEncodedShareUrl),
    [effectiveEncodedShareUrl, qrGeneratedCount]
  );

  const handleGenerateDocumentQrCode = (customUrlToSet?: string) => {
    if (typeof customUrlToSet === 'string') {
      setQrCustomShareUrl(customUrlToSet);
    }
    setQrGeneratedCount((prev) => prev + 1);
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setQrGeneratedAtLabel(`${nowTime} WIB`);
    const targetEncoded = (customUrlToSet !== undefined ? customUrlToSet : qrCustomShareUrl).trim() || shareUrl;
    onNotify?.(
      `Kode QR Dokumen (${document.documentNumber}) berhasil dibuat ulang dengan mengenkode URL Draf: ${targetEncoded}`
    );
  };

  const handleDownloadQrSvg = () => {
    try {
      const centerCoordVal = qrSvgData.viewBoxSize / 2;
      const logoSizeVal = qrSvgData.viewBoxSize * 0.28;
      const logoOffsetVal = centerCoordVal - logoSizeVal / 2;
      const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrSvgData.viewBoxSize} ${qrSvgData.viewBoxSize}" width="320" height="320" shape-rendering="crispEdges">
  <title>QR Code ${document.documentNumber} - ${effectiveEncodedShareUrl}</title>
  <rect width="${qrSvgData.viewBoxSize}" height="${qrSvgData.viewBoxSize}" fill="#FFFFFF"/>
  <path d="${qrSvgData.pathData}" fill="#18181B"/>
  <rect x="${logoOffsetVal}" y="${logoOffsetVal}" width="${logoSizeVal}" height="${logoSizeVal}" rx="1.6" fill="#FFFFFF" stroke="#1E3A8A" stroke-width="0.8"/>
</svg>`;
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const objUrl = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = objUrl;
      a.download = `QR-Dokumen-${document.documentNumber.replace(/[^a-zA-Z0-9_-]/g, '-')}.svg`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
      onNotify?.(
        `File SVG Kode QR untuk "${document.title}" (${document.documentNumber}) berhasil diunduh.`
      );
    } catch {
      onNotify?.('Gagal mengunduh file SVG Kode QR.');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(effectiveEncodedShareUrl);
      setCopiedVerificationUrl(true);
      onNotify?.('Tautan verifikasi daring dokumen berhasil disalin.');
      setTimeout(() => setCopiedVerificationUrl(false), 2200);
    } catch {
      onNotify?.('Tautan verifikasi daring: ' + effectiveEncodedShareUrl);
    }
  };

  const latestVersionLabel = (document.versions || [])[0]?.versionLabel || 'v1.0';
  const centerCoord = qrSvgData.viewBoxSize / 2;
  const logoBoxSize = qrSvgData.viewBoxSize * 0.28;
  const logoBoxOffset = centerCoord - logoBoxSize / 2;
  const showHoverExplanationPopup = isQrHovered || isQrPopupPinned;

  return (
    <footer
      id="document-verification-qr-footer"
      data-testid="document-verification-qr-footer"
      className="DocumentVerificationQrFooter mt-10 pt-5 border-t-2 border-[#D6D0C4] space-y-4 text-[#57534E] font-ui break-inside-avoid"
    >
      {/* VISUAL PROCEDURAL COMPLIANCE & SIGNATURE READINESS INDICATOR (EXTRACTED FROM MANUAL KEPATUHAN) */}
      <div
        data-testid="qr-procedural-compliance-indicator"
        data-signature-ready={complianceEval.readyForSignature ? 'true' : 'false'}
        className={`p-3.5 rounded-lg border transition-all space-y-2.5 ${
          complianceEval.readyForSignature
            ? 'bg-emerald-50/75 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/40 animate-pulse animate-compliance-pulse'
            : 'bg-[#FAF9F6] border-[#D6D0C4] text-[#18181B]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {complianceEval.readyForSignature ? (
              <span
                data-testid="qr-signature-ready-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-code font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-2xs animate-pulse"
              >
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>SIAP DITANDATANGANI (READY FOR SIGNATURE)</span>
              </span>
            ) : (
              <span
                data-testid="qr-signature-pending-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-code font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300"
              >
                <Stamp className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  CEK PRA-TANDA TANGAN: {complianceEval.completedCount}/{complianceEval.totalSteps} SYARAT LULUS ({complianceEval.progressPct}%)
                </span>
              </span>
            )}

            <span className="text-xs font-bold text-[#18181B]">
              Indikator Kepatuhan Prosedural Versi {latestVersionLabel} ({complianceEval.profile.shortBadge})
            </span>
          </div>

          <div className="no-print flex flex-wrap items-center gap-1.5">
            {!complianceEval.readyForSignature && (
              <button
                type="button"
                data-testid="qr-pass-all-procedural-btn"
                onClick={handleMarkAllProceduralChecksPassed}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
                title="Tandai seluruh syarat prosedural Manual Kepatuhan (Bea Meterai, Saksi, & Notarisasi) telah terpenuhi agar siap ditandatangani"
              >
                <Check className="w-3 h-3" />
                <span>Penuhi Semua Syarat (Siap Tanda Tangan)</span>
              </button>
            )}
            <a
              href="#bantuan-kepatuhan"
              data-testid="qr-bantuan-kepatuhan-link"
              onClick={(e) => {
                e.preventDefault();
                setIsBantuanKepatuhanModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#93C5FD] rounded transition-colors cursor-pointer"
              title="Buka Bantuan Kepatuhan (ProceduralComplianceManual) dalam modal khusus untuk memeriksa syarat yang belum terpenuhi seperti tanda tangan saksi atau bea meterai"
            >
              <HelpCircle className="w-3 h-3 text-[#1E3A8A]" />
              <span>Bantuan Kepatuhan</span>
            </a>
            {onOpenManualKepatuhanTab && (
              <button
                type="button"
                data-testid="qr-open-manual-kepatuhan-tab-btn"
                onClick={onOpenManualKepatuhanTab}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
              >
                <Scale className="w-3 h-3" />
                <span>Buka Tab Manual Kepatuhan</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-[#3F3F46]">
          {complianceEval.readyForSignature ? (
            <>
              <strong className="text-emerald-900">Verifikasi Pemindai QR:</strong> Versi dokumen{' '}
              <strong>{latestVersionLabel}</strong> telah lulus seluruh pemeriksaan kepatuhan prosedural dari{' '}
              <strong>Manual Kepatuhan</strong> (termasuk pelunasan <strong>Bea Meterai Rp10.000</strong>,{' '}
              <strong>Kehadiran & Tanda Tangan Saksi</strong>, serta syarat <strong>Notarisasi/Kewenangan</strong>). Dokumen ini sah dan siap dieksekusi tanda tangan basah maupun elektronik.
            </>
          ) : (
            <>
              Indikator ini mengekstraksi status pemeriksaan dari tab <strong>Manual Kepatuhan</strong> agar pemindai Kode QR mengetahui apakah <strong>Versi {latestVersionLabel}</strong> telah memenuhi syarat formil eksekusi (Bea Meterai Rp10.000, Saksi & Paraf, serta Notarisasi/Kewenangan). Klik item di bawah untuk memverifikasi syarat yang telah dipenuhi:
            </>
          )}
        </p>

        {/* Key Procedural Pillar Status Chips + Individual Step Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
          {/* Pillar 1: Stamp Duty (Bea Meterai) */}
          <div
            data-testid="qr-pillar-stamp-duty"
            className={`px-2.5 py-1.5 rounded border text-[10.5px] flex items-center justify-between gap-2 ${
              complianceEval.stampDutyPassed
                ? 'bg-white border-emerald-300 text-emerald-900'
                : 'bg-white border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Stamp
                className={`w-3.5 h-3.5 shrink-0 ${
                  complianceEval.stampDutyPassed ? 'text-emerald-700' : 'text-amber-600'
                }`}
              />
              <span className="font-semibold truncate">Bea Meterai Rp10.000</span>
            </div>
            <span
              className={`font-code text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                complianceEval.stampDutyPassed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {complianceEval.stampDutyPassed ? 'LULUS ✓' : 'BELUM CEK'}
            </span>
          </div>

          {/* Pillar 2: Witness Presence & Initials (Kehadiran Saksi & Paraf) */}
          <div
            data-testid="qr-pillar-witness-presence"
            className={`px-2.5 py-1.5 rounded border text-[10.5px] flex items-center justify-between gap-2 ${
              complianceEval.witnessPresencePassed
                ? 'bg-white border-emerald-300 text-emerald-900'
                : 'bg-white border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Users
                className={`w-3.5 h-3.5 shrink-0 ${
                  complianceEval.witnessPresencePassed ? 'text-emerald-700' : 'text-amber-600'
                }`}
              />
              <span className="font-semibold truncate">Kehadiran 2 Saksi & Paraf</span>
            </div>
            <span
              className={`font-code text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                complianceEval.witnessPresencePassed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {complianceEval.witnessPresencePassed ? 'LULUS ✓' : 'BELUM CEK'}
            </span>
          </div>

          {/* Pillar 3: Notarization & Corporate/Formal Authority */}
          <div
            data-testid="qr-pillar-notarization-authority"
            className={`px-2.5 py-1.5 rounded border text-[10.5px] flex items-center justify-between gap-2 ${
              complianceEval.notarizationOrAuthorityPassed
                ? 'bg-white border-emerald-300 text-emerald-900'
                : 'bg-white border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Scale
                className={`w-3.5 h-3.5 shrink-0 ${
                  complianceEval.notarizationOrAuthorityPassed
                    ? 'text-emerald-700'
                    : 'text-amber-600'
                }`}
              />
              <span className="font-semibold truncate">Notarisasi & Kewenangan</span>
            </div>
            <span
              className={`font-code text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                complianceEval.notarizationOrAuthorityPassed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {complianceEval.notarizationOrAuthorityPassed ? 'LULUS ✓' : 'BELUM CEK'}
            </span>
          </div>
        </div>

        {/* Interactive Checklist Toggle Chips synced with Manual Kepatuhan */}
        <div className="no-print flex flex-wrap items-center gap-1.5 pt-1">
          {complianceEval.stepsWithStatus.map((step) => (
            <button
              key={step.id}
              type="button"
              data-testid={`qr-compliance-step-chip-${step.stepNumber}`}
              onClick={() => handleToggleProceduralStepFromFooter(step.id)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                step.isPassed
                  ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-semibold'
                  : 'bg-white text-[#57534E] border-[#D6D0C4] hover:border-[#1E3A8A] hover:text-[#18181B]'
              }`}
              title={`${step.title} (${step.legalBasis}) — Klik untuk mengubah status kepatuhan`}
            >
              <span>{step.isPassed ? '✓' : '○'}</span>
              <span>
                Langkah {step.stepNumber}: {step.stage}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]">
              <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
              <span>Segel Kode QR Verifikasi Keaslian Dokumen & Akses Draf Daring Resmi</span>
            </div>
            <span className="px-2 py-0.5 text-[9.5px] font-code font-semibold bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded">
              Pasal 5 ayat (1) UU ITE No. 1/2024
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#57534E]">
            Arahkan kursor (<em>hover</em>) pada <strong>Kode QR Klausa Studio</strong> di samping untuk membuka{' '}
            <strong className="text-[#18181B]">Expandable Explanation Popup</strong> yang memuat: (1) Verifikasi Keaslian Dokumen Instan, (2) Akses Langsung ke <em>Live &apos;Review Only&apos; Mode</em> untuk Pihak Ketiga, (3) Pintasan Unduh Ekspor PDF Asli, serta panduan <strong>Cara Pakai</strong> melalui kamera smartphone.
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-code text-[#3F3F46] pt-0.5">
            <span>No Akta: {document.documentNumber}</span>
            <span>·</span>
            <span>Versi Aktif: {latestVersionLabel} ({document.clauses.length} Pasal)</span>
            <span>·</span>
            <a
              href={effectiveEncodedShareUrl}
              data-testid="qr-generated-verification-link"
              onClick={(e) => {
                e.preventDefault();
                handleRecordQrClickFromDistinctIp();
              }}
              className="text-[#1E3A8A] hover:underline truncate max-w-[320px] sm:max-w-[420px] cursor-pointer"
              title="Klik tautan verifikasi daring dokumen (Mencatat akses IP ke sistem deteksi anomali keamanan)"
            >
              {effectiveEncodedShareUrl}
            </a>
          </div>

          {/* DOCUMENT QR CODE GENERATOR (ENCODES SHAREABLE DRAFT URL TO BE PRINTED AT BOTTOM OF LEGAL DOCUMENT) */}
          <div
            id="document-qr-code-generator"
            data-testid="document-qr-code-generator"
            className="no-print mt-2 p-3 rounded-md bg-[#FAF9F6] border border-[#D6D0C4] space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E3A8A]">
                <QrCode className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                <span>
                  QR Code Generator Dokumen — Encode Shareable Draft URL (Tercetak di Bagian Bawah Akta)
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9.5px] font-code font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded">
                Status QR: Aktif ({qrGeneratedAtLabel}) · Cetakan #{qrGeneratedCount}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="qr-encoded-share-url-input"
                  className="sr-only"
                >
                  Shareable Draft URL Encoded in QR Code
                </label>
                <input
                  id="qr-encoded-share-url-input"
                  type="text"
                  data-testid="qr-encoded-share-url-input"
                  value={qrCustomShareUrl || shareUrl}
                  onChange={(e) => setQrCustomShareUrl(e.target.value)}
                  placeholder="Masukkan Shareable Draft URL yang akan dienkode ke Kode QR..."
                  className="w-full px-2.5 py-1.5 text-[11px] font-code text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  data-testid="generate-document-qr-btn"
                  onClick={() => handleGenerateDocumentQrCode()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
                  title="Generate / Perbarui Kode QR yang mengenkode Shareable Draft URL untuk dicetak di bagian bawah dokumen hukum"
                >
                  <QrCode className="w-3 h-3 text-amber-300" />
                  <span>Generate QR Code</span>
                </button>

                <select
                  aria-label="Ukuran Cetak Kode QR di Bawah Dokumen"
                  data-testid="qr-size-select"
                  value={qrPrintSize}
                  onChange={(e) =>
                    setQrPrintSize(e.target.value as 'small' | 'medium' | 'large')
                  }
                  className="px-2 py-1.5 text-[10.5px] font-code font-semibold bg-white border border-[#D6D0C4] rounded text-[#18181B] focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                >
                  <option value="small">Ukuran QR: Kecil (80px)</option>
                  <option value="medium">Ukuran QR: Standar (108px)</option>
                  <option value="large">Ukuran QR: Besar (136px)</option>
                </select>

                <button
                  type="button"
                  data-testid="qr-download-svg-btn"
                  onClick={handleDownloadQrSvg}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#93C5FD] rounded transition-colors cursor-pointer"
                  title="Unduh file vektor SVG Kode QR yang mengenkode URL draf"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh QR (.SVG)</span>
                </button>

                <button
                  type="button"
                  data-testid="print-document-with-qr-btn"
                  onClick={handleDownloadPdfShortcut}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10.5px] font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors cursor-pointer"
                  title="Cetak dokumen hukum lengkap dengan Kode QR di bagian bawah halaman"
                >
                  <FileDown className="w-3 h-3 text-emerald-700" />
                  <span>Cetak Dokumen + QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* VISUAL SECURITY ANOMALY WARNING BADGE: APPEARS ONLY IF QR LINK CLICKED > 5 TIMES FROM DISTINCT IP ADDRESSES */}
          {hasDistinctIpAnomaly && (
            <div
              data-testid="qr-security-anomaly-warning-badge"
              data-distinct-ip-count={distinctIpClickCount}
              role="alert"
              className="no-print mt-2 p-2.5 rounded-md bg-red-50 border-2 border-red-500 text-red-950 shadow-xs space-y-1.5 animate-pulse"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-code font-bold uppercase tracking-wider bg-red-700 text-white">
                    <AlertCircle className="w-3 h-3 text-amber-200 shrink-0" />
                    <span>
                      ⚠️ PERINGATAN ANOMALI KEAMANAN: {distinctIpClickCount} KLIK DARI &gt;5 IP UNIK
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-red-900">
                    Deteksi Anomali Akses Pemilik Dokumen ({distinctIpClickCount} Alamat IP Berbeda &gt; Ambang Batas 5 IP)
                  </span>
                </div>

                <button
                  type="button"
                  data-testid="qr-anomaly-rotate-token-btn"
                  onClick={() => {
                    handleResetDistinctIpLogs();
                    handleRefreshQrExpiry(qrExpiryPresetSeconds);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white bg-red-700 hover:bg-red-800 rounded cursor-pointer"
                  title="Reset daftar IP & perbarui token tautan QR untuk membatalkan akses pihak tidak dikenal"
                >
                  <RefreshCw className="w-2.5 h-2.5 text-amber-200" />
                  <span>Amankan &amp; Reset Akses IP</span>
                </button>
              </div>

              <p className="text-[10.5px] text-red-900 leading-snug">
                Tautan verifikasi Kode QR ini telah diakses sebanyak{' '}
                <strong>{distinctIpClickCount} kali dari alamat IP yang berbeda</strong> (melebihi batas aman 5 IP unik). Hal ini mengindikasikan tautan draf mungkin telah diteruskan ke pihak luar tanpa izin pemilik dokumen.
              </p>

              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="text-[9.5px] font-code font-bold text-red-900">
                  IP Unik Terdeteksi:
                </span>
                {distinctIpClickLogs.map((entry, idx) => (
                  <span
                    key={`${entry.ip}-${idx}`}
                    className="px-1.5 py-0.2 rounded bg-white border border-red-300 text-[9px] font-code font-semibold text-red-900"
                    title={`Klik #${idx + 1} dari ${entry.location} pada ${entry.clickedAt}`}
                  >
                    {entry.ip} ({entry.location.split(' (')[0]})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="no-print flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="qr-copy-verification-link-btn"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-medium text-[#18181B] bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
            >
              {copiedVerificationUrl ? (
                <>
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Tautan Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#1E3A8A]" />
                  <span>Salin Link Verifikasi QR</span>
                </>
              )}
            </button>
            {onSimulateScanQr && (
              <button
                type="button"
                data-testid="qr-simulate-scan-btn"
                onClick={() => {
                  handleRecordQrClickFromDistinctIp();
                  onSimulateScanQr();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
                title="Simulasikan apa yang dilihat oleh klien/pihak lawan saat memindai Kode QR ini dengan kamera HP"
              >
                <QrCode className="w-3 h-3 text-amber-300" />
                <span>Simulasi Hasil Pindai QR</span>
              </button>
            )}
            <button
              type="button"
              data-testid="qr-record-distinct-ip-click-btn"
              onClick={() => handleRecordQrClickFromDistinctIp()}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-code font-semibold text-[#18181B] bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer"
              title="Catat 1 klik akses tautan QR dari alamat IP unik baru (Deteksi Anomali muncul jika > 5 IP berbeda)"
            >
              <span>+ Klik IP Baru ({distinctIpClickCount}/5 IP)</span>
            </button>
            <button
              type="button"
              data-testid="qr-simulate-ip-anomaly-btn"
              onClick={() => handleRecordQrClickFromDistinctIp(6)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-code font-semibold rounded border transition-colors cursor-pointer ${
                hasDistinctIpAnomaly
                  ? 'bg-red-700 text-white border-red-800'
                  : 'text-red-800 bg-red-50/80 hover:bg-red-100 border-red-300'
              }`}
              title="Simulasikan > 5 klik dari alamat IP berbeda (6 IP unik) untuk menampilkan peringatan deteksi anomali keamanan"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Uji Anomali (&gt;5 IP Unik)</span>
            </button>
            {distinctIpClickCount > 0 && (
              <button
                type="button"
                data-testid="qr-reset-ip-clicks-btn"
                onClick={handleResetDistinctIpLogs}
                className="px-2 py-1 text-[10px] font-code font-medium text-[#57534E] hover:text-[#18181B] bg-white border border-[#D6D0C4] rounded cursor-pointer"
                title="Reset penghitung klik IP unik kembali ke 0"
              >
                Reset IP
              </button>
            )}
            <button
              type="button"
              data-testid="qr-footer-download-pdf-btn"
              onClick={handleDownloadPdfShortcut}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
              title="Pintasan untuk mengunduh ekspor PDF asli dari dokumen ini"
            >
              <FileDown className="w-3 h-3" />
              <span>Unduh PDF Asli</span>
            </button>
            {onOpenShareModal && (
              <button
                type="button"
                data-testid="qr-open-share-settings-btn"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-medium text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>Pengaturan Link & Komentar QR</span>
              </button>
            )}
            <button
              type="button"
              data-testid="qr-toggle-guide-btn"
              onClick={() => setShowQrGuide((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#57534E] hover:text-[#18181B] bg-white border border-[#D6D0C4] rounded transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3 h-3 text-[#1E3A8A]" />
              <span>
                {showQrGuide ? 'Sembunyikan Panduan QR' : 'Fungsi & Cara Pakai Kode QR'}
              </span>
            </button>
            <a
              href="#bantuan-kepatuhan-modal"
              data-testid="qr-footer-bantuan-kepatuhan-btn"
              onClick={(e) => {
                e.preventDefault();
                setIsBantuanKepatuhanModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold text-[#1E3A8A] hover:underline bg-white border border-[#BFDBFE] rounded transition-colors cursor-pointer"
              title="Buka panduan lengkap Bantuan Kepatuhan dalam jendela modal untuk memahami syarat saksi & bea meterai yang belum lengkap"
            >
              <HelpCircle className="w-3 h-3 text-[#1E3A8A]" />
              <span>Bantuan Kepatuhan ({missingProceduralSteps.length > 0 ? `${missingProceduralSteps.length} Syarat Kurang` : 'Lengkap'})</span>
            </a>
          </div>

          {/* VISUAL 'QR EXPIRY' COUNTDOWN TIMER FOR SECURITY TEAMS (WITH ENABLE/DISABLE TOGGLE SWITCH & <5 MIN COLOR-SHIFT ALERT) */}
          <div
            data-testid="qr-expiry-countdown-timer"
            data-qr-timer-enabled={isQrExpiryTimerEnabled ? 'true' : 'false'}
            data-qr-under-5min={isQrLessThanFiveMinutes ? 'true' : 'false'}
            data-qr-expiry-status={
              !isQrExpiryTimerEnabled
                ? 'indefinite'
                : isQrExpired
                ? 'expired'
                : isQrLessThanFiveMinutes
                ? 'critical_under_5min'
                : isQrExpiringSoon
                ? 'expiring_soon'
                : 'valid'
            }
            className={`no-print mt-2 p-2.5 rounded-md border transition-all ${
              !isQrExpiryTimerEnabled
                ? 'bg-[#EFF6FF]/75 border-[#93C5FD] text-[#1E3A8A]'
                : isQrExpired
                ? 'bg-red-50 border-red-300 text-red-950'
                : isQrLessThanFiveMinutes
                ? 'bg-rose-50/95 border-rose-400 text-rose-950 ring-2 ring-rose-300/60 animate-qr-expiry-urgent animate-pulse'
                : isQrExpiringSoon
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-[#FAF9F6] border-[#D6D0C4] text-[#18181B]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle Switch to Enable / Disable QR Expiry Timer (Keep Link Active Indefinitely) */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isQrExpiryTimerEnabled}
                  aria-label="Aktifkan atau Nonaktifkan QR Expiry Timer (Batas Waktu Link QR)"
                  data-testid="qr-expiry-toggle-switch"
                  onClick={() => handleToggleQrExpiryTimer()}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold border transition-all cursor-pointer ${
                    isQrExpiryTimerEnabled
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                      : 'bg-emerald-700 text-white border-emerald-800'
                  }`}
                  title={
                    isQrExpiryTimerEnabled
                      ? 'Klik untuk menonaktifkan QR Expiry Timer agar tautan verifikasi tetap aktif permanen tanpa batas waktu (Indefinite)'
                      : 'Klik untuk mengaktifkan kembali QR Expiry Countdown Timer'
                  }
                >
                  <span
                    className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full transition-colors ${
                      isQrExpiryTimerEnabled ? 'bg-amber-300' : 'bg-white/35'
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 transform rounded-full transition-transform ${
                        isQrExpiryTimerEnabled
                          ? 'translate-x-3 bg-[#1E3A8A]'
                          : 'translate-x-0.5 bg-white'
                      }`}
                    />
                  </span>
                  <span>
                    {isQrExpiryTimerEnabled ? 'Timer Expiry: ON' : 'Timer OFF (Aktif Permanen)'}
                  </span>
                </button>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-code font-bold uppercase tracking-wider ${
                    !isQrExpiryTimerEnabled
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : isQrExpired
                      ? 'bg-red-700 text-white'
                      : isQrLessThanFiveMinutes
                      ? 'bg-red-600 text-white animate-pulse'
                      : isQrExpiringSoon
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-[#1E3A8A] text-white'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-200 shrink-0" />
                  <span>
                    {!isQrExpiryTimerEnabled
                      ? 'Link Aktif Tanpa Batas'
                      : isQrLessThanFiveMinutes
                      ? '⚠️ < 5 Menit Tersisa!'
                      : 'QR Expiry Countdown'}
                  </span>
                </span>

                <span
                  data-testid="qr-expiry-time-display"
                  className={`font-code text-xs font-bold tabular-nums transition-all ${
                    !isQrExpiryTimerEnabled
                      ? 'px-2 py-0.5 rounded bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                      : isQrExpired
                      ? 'px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300'
                      : isQrLessThanFiveMinutes
                      ? 'px-2 py-0.5 rounded border font-extrabold ring-1 ring-rose-400/60 animate-qr-expiry-text-highlight animate-pulse'
                      : 'text-[#18181B]'
                  }`}
                >
                  {!isQrExpiryTimerEnabled
                    ? '∞ Aktif Tanpa Batas Waktu (Indefinite)'
                    : isQrExpired
                    ? '00j : 00m : 00d (Kedaluwarsa)'
                    : isQrLessThanFiveMinutes
                    ? `${qrFormattedTime} (Segera Invalid!)`
                    : qrFormattedTime}
                </span>

                <span className="text-[10px] text-[#57534E]">
                  · Status Keamanan Link:{' '}
                  <strong
                    className={
                      !isQrExpiryTimerEnabled
                        ? 'text-emerald-800'
                        : isQrExpired
                        ? 'text-red-700'
                        : isQrLessThanFiveMinutes
                        ? 'text-rose-700 underline decoration-rose-400'
                        : isQrExpiringSoon
                        ? 'text-amber-800'
                        : 'text-emerald-700'
                    }
                  >
                    {!isQrExpiryTimerEnabled
                      ? 'Aktif Permanen (Timer Dinonaktifkan Tim Keamanan)'
                      : isQrExpired
                      ? 'Wajib Refresh Token'
                      : isQrLessThanFiveMinutes
                      ? 'KRITIS (< 5 Menit) — Link Segera Tidak Valid!'
                      : isQrExpiringSoon
                      ? 'Segera Kedaluwarsa — Disarankan Refresh'
                      : `Valid (${qrValidityRatioPct}% Sisa Masa Aktif)`}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  data-testid="qr-expiry-simulate-under-5min-btn"
                  onClick={() => handleRefreshQrExpiry(285)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-code font-semibold rounded border transition-colors cursor-pointer ${
                    isQrLessThanFiveMinutes
                      ? 'bg-rose-700 text-white border-rose-800'
                      : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                  title="Uji peringatan visual saat waktu tersisa kurang dari 5 menit (04m : 45d)"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>Uji &lt; 5 Menit</span>
                </button>

                <select
                  aria-label="Kebijakan Masa Berlaku Tautan QR"
                  data-testid="qr-expiry-policy-select"
                  value={isQrExpiryTimerEnabled ? qrExpiryPresetSeconds : 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val === 0) {
                      handleToggleQrExpiryTimer(false);
                    } else {
                      handleRefreshQrExpiry(val);
                    }
                  }}
                  className="px-1.5 py-0.5 text-[10px] font-code font-semibold bg-white border border-[#D6D0C4] rounded text-[#18181B] focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                >
                  <option value={86400}>Masa Berlaku: 24 Jam (Standar)</option>
                  <option value={28800}>Masa Berlaku: 8 Jam (Jam Kerja)</option>
                  <option value={3600}>Masa Berlaku: 1 Jam (Ketat)</option>
                  <option value={1800}>Simulasi Segera Habis (30 Menit)</option>
                  <option value={285}>Peringatan &lt; 5 Menit (04m : 45d)</option>
                  <option value={0}>∞ Tanpa Batas Waktu (Matikan Timer)</option>
                </select>

                <button
                  type="button"
                  data-testid="qr-expiry-refresh-btn"
                  onClick={() => handleRefreshQrExpiry(qrExpiryPresetSeconds)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
                  title="Perbarui / Refresh masa berlaku tautan verifikasi Kode QR untuk keamanan"
                >
                  <RefreshCw className="w-2.5 h-2.5 text-amber-300" />
                  <span>Refresh Link QR</span>
                </button>
              </div>
            </div>

            {/* Visual Validity Progress Bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#E5E0D8] rounded-full overflow-hidden">
                <div
                  data-testid="qr-expiry-progress-bar"
                  className={`h-full transition-all duration-500 ${
                    !isQrExpiryTimerEnabled
                      ? 'bg-[#1E3A8A]'
                      : isQrExpired
                      ? 'bg-red-600'
                      : isQrLessThanFiveMinutes
                      ? 'bg-rose-600 animate-pulse'
                      : isQrExpiringSoon
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${qrValidityRatioPct}%` }}
                />
              </div>
              <span className="font-code text-[9.5px] text-[#57534E] shrink-0">
                {!isQrExpiryTimerEnabled
                  ? 'Mode Permanen Aktif'
                  : `Refresh Terakhir: ${qrLastRefreshedLabel}`}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Container with Hover 'Expandable Explanation' Popup / Tooltip */}
        <div
          data-testid="qr-code-hover-container"
          className="relative shrink-0"
          onMouseEnter={() => setIsQrHovered(true)}
          onMouseLeave={() => setIsQrHovered(false)}
        >
          {/* EXPANDABLE EXPLANATION POPUP / TOOLTIP ON QR CODE HOVER */}
          <div
            data-testid="qr-expandable-explanation-popup"
            role="tooltip"
            aria-hidden={!showHoverExplanationPopup}
            className={`no-print absolute right-0 bottom-full mb-3 w-[340px] sm:w-[410px] p-4 bg-white text-[#18181B] border-2 border-[#1E3A8A] rounded-lg shadow-2xl z-40 transition-all duration-200 ${
              showHoverExplanationPopup
                ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                : 'opacity-0 translate-y-1 pointer-events-none invisible'
            }`}
          >
            {/* Popup Header with Expand/Collapse Toggle & Pin Close */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                </span>
                <div>
                  <div className="text-xs font-bold text-[#18181B] leading-tight">
                    Expandable Explanation — Fitur Kode QR Dokumen
                  </div>
                  <div className="text-[10px] font-code text-[#57534E]">
                    {document.documentNumber} · Versi {latestVersionLabel} ·{' '}
                    {complianceEval.readyForSignature
                      ? 'Siap Tanda Tangan ✓'
                      : `${complianceEval.completedCount}/${complianceEval.totalSteps} Cek Prosedural`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  data-testid="qr-popup-expand-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExplanationExpanded((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded cursor-pointer"
                  title="Perluas atau ringkas rincian penjelasan fitur & Cara Pakai"
                >
                  <span>{isExplanationExpanded ? 'Ringkas' : 'Perluas'}</span>
                  {isExplanationExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {isQrPopupPinned && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsQrPopupPinned(false);
                      setIsQrHovered(false);
                    }}
                    className="p-0.5 text-[#57534E] hover:text-[#18181B] rounded cursor-pointer"
                    title="Tutup popup"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Explicitly Listed 3 Core Features */}
            <div className="py-2.5 space-y-2 text-[11px]" data-testid="qr-popup-features-list">
              {/* Feature (1): Instant document authenticity verification */}
              <div
                data-testid="qr-popup-feature-1"
                className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-0.5"
              >
                <div className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>(1) Instant Document Authenticity Verification</span>
                </div>
                <p className="text-[10.5px] text-[#3F3F46] leading-snug">
                  Verifikasi keaslian dokumen secara instan untuk memastikan naskah cetak/PDF identik 100% dengan catatan asli <strong>Versi {latestVersionLabel}</strong> ({document.clauses.length} Pasal) dan bebas dari pemalsuan ayat.
                </p>
              </div>

              {/* Feature (2): Direct access to the live 'Review Only' mode for third-party parties */}
              <div
                data-testid="qr-popup-feature-2"
                className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1"
              >
                <div className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>(2) Direct Access to Live &apos;Review Only&apos; Mode</span>
                </div>
                <p className="text-[10.5px] text-[#3F3F46] leading-snug">
                  Akses langsung ke mode tinjauan terkunci (<em>Live Review-Only Mode</em>) bagi pihak ketiga / lawan transaksi untuk memberi komentar per pasal tanpa mengubah naskah asli.
                </p>
                {onSimulateScanQr && (
                  <button
                    type="button"
                    data-testid="qr-popup-open-review-only-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSimulateScanQr();
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded cursor-pointer"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Buka Live &apos;Review Only&apos; Mode Sekarang</span>
                  </button>
                )}
              </div>

              {/* Feature (3): A shortcut to download the original PDF export */}
              <div
                data-testid="qr-popup-feature-3"
                className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1.5"
              >
                <div className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5 shrink-0" />
                  <span>(3) Shortcut to Download Original PDF Export</span>
                </div>
                <p className="text-[10.5px] text-[#3F3F46] leading-snug">
                  Pintasan langsung untuk mengunduh salinan ekspor PDF asli resmi lengkap dengan stempel Kode QR verifikasi dan nomor akta.
                </p>
                <button
                  type="button"
                  data-testid="qr-popup-download-pdf-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownloadPdfShortcut();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Original PDF Export ({document.documentNumber})</span>
                </button>
              </div>
            </div>

            {/* Expandable 'Cara Pakai' Section inside the Hover Popup */}
            {isExplanationExpanded && (
              <div
                data-testid="qr-popup-cara-pakai-section"
                className="pt-2.5 border-t border-[#E5E0D8] space-y-1.5 text-[10.5px]"
              >
                <div className="font-bold text-[#18181B] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                  <span>Cara Pakai (Smartphone Camera → Secure Web Portal)</span>
                </div>
                <p className="text-[#3F3F46] leading-relaxed bg-[#EFF6FF]/60 p-2 rounded border border-[#BFDBFE]">
                  Cukup pindai (<em>scan</em>) Kode QR ini menggunakan <strong>kamera smartphone apa pun (iOS / Android)</strong> tanpa perlu aplikasi khusus — kamera akan langsung mengarahkan pengguna secara instan ke <strong>portal web aman Klausa Studio</strong> untuk memverifikasi keaslian akta, memeriksa status kesiapan tanda tangan, meninjau dalam mode <em>Review Only</em>, atau mengunduh PDF asli.
                </p>
              </div>
            )}
          </div>

          {/* Distinct Branded Klausa Studio QR Code Area with Center Logo, Signature Readiness Badge & 'Scan to Verify' Label */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Record click from distinct IP & allow pinning the expandable explanation popup when clicked if Shift isn't held
              if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleRecordQrClickFromDistinctIp();
                setIsQrPopupPinned((prev) => !prev);
              }
            }}
            title={`Hover atau Klik untuk Membuka Expandable Explanation · Scan to Verify: ${shareUrl}`}
            className={`branded-qr-verification-box group flex flex-col items-center shrink-0 p-3 bg-gradient-to-b from-[#FAF9F6] to-[#F2EFE9] border-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
              complianceEval.readyForSignature
                ? 'border-emerald-700 hover:border-emerald-800'
                : 'border-[#1E3A8A] hover:border-[#172554]'
            }`}
          >
            {/* Top Branded Seal Header */}
            <div className="w-full flex items-center justify-center gap-1.5 pb-1.5 mb-1.5 border-b border-[#D6D0C4] text-[9px] font-legal font-bold uppercase tracking-widest text-[#1E3A8A]">
              <Scale className="w-3 h-3 text-[#1E3A8A] shrink-0" />
              <span>Klausa Studio</span>
            </div>

            {/* Procedural Compliance Status Pill right inside the QR Seal */}
            <div
              data-testid="qr-box-compliance-seal"
              className={`mb-1.5 px-2 py-0.5 rounded text-[8.5px] font-code font-bold uppercase tracking-wider flex items-center gap-1 ${
                complianceEval.readyForSignature
                  ? 'bg-emerald-700 text-white animate-pulse'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {complianceEval.readyForSignature ? (
                <>
                  <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-300" />
                  </span>
                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-200 shrink-0" />
                  <span>Ready for Signature</span>
                </>
              ) : (
                <>
                  <Stamp className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                  <span>
                    {complianceEval.completedCount}/{complianceEval.totalSteps} Cek Kepatuhan
                  </span>
                </>
              )}
            </div>

            {/* Scannable Area Row: Small Intuitive Scan Icon Next to the QR Code Matrix */}
            <div className="flex items-center gap-2">
              {/* Small Scan Icon Cue Next to the QR Code */}
              <div
                data-testid="qr-scan-icon-indicator"
                className="flex flex-col items-center justify-center gap-1 px-1.5 py-2 rounded-md bg-white/90 border border-[#1E3A8A]/30 text-[#1E3A8A] shadow-2xs group-hover:border-[#1E3A8A] group-hover:bg-[#EFF6FF] transition-colors"
                title="Area Pindai Kamera (Scannable QR Area) — Arahkan kamera smartphone ke Kode QR di samping"
              >
                <div className="relative flex items-center justify-center w-6 h-6 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A]">
                  <ScanLine className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                </div>
                <Scan className="w-3 h-3 text-[#1E3A8A]/75 shrink-0" />
                <span className="text-[7.5px] font-code font-bold uppercase tracking-wider text-[#1E3A8A] leading-none">
                  SCAN
                </span>
              </div>

              {/* QR Matrix Frame with Centered Klausa Studio Logo Overlay */}
              <div className="relative p-1.5 bg-white border-2 border-[#1E3A8A]/25 rounded-md shadow-2xs flex items-center justify-center">
                <svg
                  data-testid="document-bottom-qr-code-svg"
                  data-encoded-url={effectiveEncodedShareUrl}
                  viewBox={`0 0 ${qrSvgData.viewBoxSize} ${qrSvgData.viewBoxSize}`}
                  className={`${
                    qrPrintSize === 'small'
                      ? 'w-20 h-20'
                      : qrPrintSize === 'large'
                      ? 'w-32 h-32 sm:w-36 sm:h-36'
                      : 'w-24 h-24 sm:w-28 sm:h-28'
                  } text-[#18181B] transition-all`}
                  shapeRendering="crispEdges"
                  role="img"
                  aria-label={`QR Code Klausa Studio Scan to Verify untuk ${document.title} (${effectiveEncodedShareUrl})`}
                >
                  <rect
                    width={qrSvgData.viewBoxSize}
                    height={qrSvgData.viewBoxSize}
                    fill="#FFFFFF"
                  />
                  <path d={qrSvgData.pathData} fill="currentColor" />

                  {/* SVG Fallback Backing for Center Logo Area */}
                  <rect
                    x={logoBoxOffset}
                    y={logoBoxOffset}
                    width={logoBoxSize}
                    height={logoBoxSize}
                    rx={1.6}
                    fill="#FFFFFF"
                    stroke="#1E3A8A"
                    strokeWidth={0.8}
                  />
                </svg>

                {/* Distinct Centered Klausa Studio Logo Emblem in the Center of the QR Code */}
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="flex flex-col items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#1E3A8A] text-white border-2 border-white shadow-xs ring-1 ring-[#1E3A8A]">
                    <Scale className="w-3.5 h-3.5 text-amber-300 stroke-[2.2] shrink-0" />
                    <span className="text-[6.5px] font-legal font-bold tracking-tighter uppercase leading-none mt-0.5">
                      Klausa
                    </span>
                    <span className="text-[5.5px] font-ui font-semibold tracking-widest uppercase leading-none text-amber-200">
                      Studio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Small 'Scan to Verify' Label with Scan Icon & Compact QR Expiry Indicator */}
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#1E3A8A] text-white text-[10px] font-ui font-bold uppercase tracking-wider rounded-sm group-hover:bg-[#172554] transition-colors shadow-2xs">
              <ScanLine className="w-2.5 h-2.5 text-amber-300 shrink-0" />
              <QrCode className="w-2.5 h-2.5 text-amber-300 shrink-0" />
              <span>Scan to Verify · Hover Info</span>
            </div>
            <div
              data-testid="printed-qr-shareable-url"
              className="mt-1 max-w-[200px] truncate text-[8px] font-code text-[#1E3A8A] bg-white/90 px-1.5 py-0.5 rounded border border-[#D6D0C4]"
              title={`Encoded Shareable Draft URL: ${effectiveEncodedShareUrl}`}
            >
              {effectiveEncodedShareUrl}
            </div>
            <div
              data-testid="qr-box-expiry-badge"
              className={`mt-1 inline-flex items-center gap-1 text-[8.5px] font-code font-semibold px-1.5 py-0.5 rounded transition-all ${
                !isQrExpiryTimerEnabled
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isQrLessThanFiveMinutes
                  ? 'border animate-qr-expiry-text-highlight animate-pulse font-bold'
                  : 'text-[#57534E]'
              }`}
            >
              <Clock className="w-2.5 h-2.5 text-[#1E3A8A] shrink-0" />
              <span>
                {!isQrExpiryTimerEnabled
                  ? 'QR Expiry: ∞ Aktif Permanen'
                  : isQrLessThanFiveMinutes
                  ? `⚠️ QR Expiry: ${qrCompactTime} (<5m)`
                  : `QR Expiry: ${qrCompactTime}`}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* DEDICATED 'BANTUAN KEPATUHAN' MODAL OVERLAY (OPENS PROCEDURALCOMPLIANCEMANUAL) */}
      {isBantuanKepatuhanModalOpen && (
        <div
          data-testid="bantuan-kepatuhan-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Bantuan Kepatuhan — Manual Kepatuhan Prosedural & Pemeriksaan Syarat Sah"
          className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsBantuanKepatuhanModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[88vh] bg-white border-2 border-[#1E3A8A] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#18181B]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#1E3A8A] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4 text-amber-300" />
                </span>
                <div>
                  <h3 className="text-sm font-bold leading-tight">
                    Bantuan Kepatuhan — Panduan Syarat Prosedural & Kesiapan Tanda Tangan
                  </h3>
                  <p className="text-[11px] text-blue-100 font-code">
                    {document.title} ({document.documentNumber}) · Versi {latestVersionLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-bantuan-kepatuhan-modal-btn"
                onClick={() => setIsBantuanKepatuhanModalOpen(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tutup</span>
              </button>
            </div>

            {/* Diagnostic Banner for Scanner: Missing Requirements Summary (Witness Signatures, Stamp Duty, Notarization) */}
            <div className="px-5 py-3 bg-[#FAF9F6] border-b border-[#D6D0C4] space-y-2">
              {missingProceduralSteps.length > 0 ? (
                <div
                  data-testid="bantuan-kepatuhan-missing-requirements-banner"
                  className="p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-1.5 text-xs text-amber-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        Ditemukan {missingProceduralSteps.length} Syarat Prosedural yang Belum Lengkap Sebelum Tanda Tangan:
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid="bantuan-kepatuhan-modal-pass-all-btn"
                      onClick={handleMarkAllProceduralChecksPassed}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                    >
                      ✓ Tandai Semua Syarat Terpenuhi
                    </button>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-900">
                    {!complianceEval.stampDutyPassed && (
                      <li>
                        <strong>Bea Meterai Rp10.000 Belum Lengkap (Incomplete Stamp Duty):</strong>{' '}
                        Pastikan pencantuman & pelunasan Meterai Tempel / e-Meterai Rp10.000 sesuai UU No. 10 Tahun 2020.
                      </li>
                    )}
                    {!complianceEval.witnessPresencePassed && (
                      <li>
                        <strong>Tanda Tangan / Kehadiran Saksi Belum Lengkap (Missing Witness Signatures):</strong>{' '}
                        Diperlukan minimal 2 (dua) orang saksi dewasa beserta paraf pada setiap halaman sesuai Pasal 1868–1875 KUHPerdata.
                      </li>
                    )}
                    {!complianceEval.notarizationOrAuthorityPassed && (
                      <li>
                        <strong>Verifikasi Kewenangan / Notarisasi Belum Lengkap:</strong>{' '}
                        Periksa kecocokan identitas penandatangan, kewenangan direksi/kuasa, atau syarat legalisasi notaris.
                      </li>
                    )}
                    {missingProceduralSteps.map((ms) => (
                      <li key={ms.id}>
                        <span className="font-semibold">
                          Langkah {ms.stepNumber} ({ms.stage}):
                        </span>{' '}
                        {ms.title} — <em>{ms.legalBasis}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  data-testid="bantuan-kepatuhan-all-passed-banner"
                  className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-xs text-emerald-950 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Seluruh syarat prosedural (Bea Meterai Rp10.000, Kehadiran 2 Saksi & Paraf, serta Kewenangan/Notarisasi) telah terpenuhi. Dokumen siap ditandatangani.
                  </span>
                </div>
              )}
            </div>

            {/* Embedded Interactive ProceduralComplianceManual Component */}
            <div className="p-5 overflow-y-auto flex-1">
              <ProceduralComplianceManual
                document={document}
                onInsertProceduralClause={(clause) => {
                  if (onInsertProceduralClause) {
                    onInsertProceduralClause(clause);
                  } else {
                    onNotify?.(
                      `Klausul "${clause.title}" siap ditambahkan ke dokumen.`
                    );
                  }
                }}
                onUpdateClosingText={(newText) => {
                  if (onUpdateClosingText) {
                    onUpdateClosingText(newText);
                  } else {
                    onNotify?.(
                      'Kalimat penutup akta diperbarui dengan klausul Bea Meterai Rp10.000 & Saksi.'
                    );
                  }
                }}
                onNotify={(msg) => onNotify?.(msg)}
                checkedByDoc={effectiveCheckedByDoc}
                onChangeCheckedByDoc={setEffectiveCheckedByDoc}
                selectedProfileMode={effectiveProfileMode}
                onChangeProfileMode={setEffectiveProfileMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Clear Explanation Panel: Fungsi & Cara Pakai Kode QR pada Dokumen */}
      {showQrGuide && (
        <div
          data-testid="qr-function-and-usage-guide"
          className="no-print p-3.5 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[11px]"
        >
          {/* Left Column: 3 Fungsi Utama Kode QR */}
          <div className="space-y-1.5">
            <div className="font-bold text-[#18181B] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span>3 Fitur Utama Kode QR Dokumen:</span>
            </div>
            <ul className="space-y-1 text-[#3F3F46] leading-relaxed list-disc pl-4">
              <li>
                <strong className="text-[#18181B]">(1) Instant Document Authenticity Verification:</strong>{' '}
                Memastikan lembar kontrak fisik/PDF yang hendak ditandatangani identik 100% dengan naskah asli versi <strong>{latestVersionLabel}</strong> di sistem (mencegah perubahan angka/ayat secara sepihak pada berkas cetak).
              </li>
              <li>
                <strong className="text-[#18181B]">(2) Direct Access to Live &apos;Review Only&apos; Mode:</strong>{' '}
                Menghubungkan kertas fisik langsung ke ruang tinjauan daring (<code>?share={document.shareId || `share-${document.id}`}</code>) bagi pihak ketiga untuk menulis komentar per pasal tanpa mengubah teks asli.
              </li>
              <li>
                <strong className="text-[#18181B]">(3) Shortcut to Download Original PDF Export:</strong>{' '}
                Menyediakan pintasan unduh langsung PDF asli resmi bernomor akta (<strong>{document.documentNumber}</strong>) melalui popup Kode QR maupun portal verifikasi.
              </li>
            </ul>
          </div>

          {/* Right Column: Cara Pakai */}
          <div className="space-y-1.5">
            <div className="font-bold text-[#18181B] flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span>Cara Pakai (Scan via Smartphone Camera):</span>
            </div>
            <ol className="space-y-1 text-[#3F3F46] leading-relaxed list-decimal pl-4">
              <li>
                <strong className="text-[#18181B]">Pindai dengan Kamera Smartphone Apa Pun:</strong>{' '}
                Arahkan kamera HP (iOS/Android) ke kotak <strong>Scan to Verify</strong> — pengguna langsung diarahkan secara instan ke <strong>portal web aman Klausa Studio</strong>.
              </li>
              <li>
                <strong className="text-[#18181B]">Cek Indikator Kesiapan Tanda Tangan:</strong>{' '}
                Pastikan badge kepatuhan prosedural menunjukkan <strong>SIAP DITANDATANGANI (Ready for Signature)</strong> (Bea Meterai Rp10.000 & Kehadiran Saksi terpenuhi).
              </li>
              <li>
                <strong className="text-[#18181B]">Tinjau atau Unduh PDF Asli:</strong>{' '}
                Gunakan mode <em>Review Only</em> untuk memberi komentar klausul atau klik pintasan <em>Download Original PDF Export</em>.
              </li>
            </ol>
          </div>
        </div>
      )}
    </footer>
  );
};
