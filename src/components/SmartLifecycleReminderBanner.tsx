import React, { useState, useMemo } from 'react';
import {
  BellRing,
  CalendarClock,
  ArrowRight,
  X,
  RotateCcw,
  Plus,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { LegalDocument, SmartLifecycleReminder } from '../types/legal';
import { generateSmartLifecycleReminders } from '../utils/legalSmartAnalyzer';

interface SmartLifecycleReminderBannerProps {
  document: LegalDocument;
  onJumpToClause: (clauseNumberOrTitle: string) => void;
}

export const SmartLifecycleReminderBanner: React.FC<
  SmartLifecycleReminderBannerProps
> = ({ document, onJumpToClause }) => {
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});
  const [customReminders, setCustomReminders] = useState<SmartLifecycleReminder[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [selectedClauseNumber, setSelectedClauseNumber] = useState(
    document.clauses[0]?.number || 'Pasal 1'
  );
  const [customDateLabel, setCustomDateLabel] = useState('15 Oktober 2026 (H-7)');
  const [customEventType, setCustomEventType] = useState<
    SmartLifecycleReminder['eventType']
  >('Mendekati Kedaluwarsa (Expiration)');

  const autoReminders = useMemo(
    () => generateSmartLifecycleReminders(document),
    [document]
  );

  const allReminders = useMemo(
    () => [...customReminders, ...autoReminders],
    [customReminders, autoReminders]
  );

  const visibleReminders = allReminders.filter((r) => !dismissedIds[r.id]);
  const dismissedCount = allReminders.length - visibleReminders.length;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleRestoreAll = () => {
    setDismissedIds({});
  };

  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClause =
      document.clauses.find((c) => c.number === selectedClauseNumber) ||
      document.clauses[0];
    if (!targetClause) return;

    const newRem: SmartLifecycleReminder = {
      id: `rem-custom-${Date.now()}`,
      clauseNumber: targetClause.number,
      clauseTitle: targetClause.title,
      eventType: customEventType,
      urgency:
        customEventType === 'Mendekati Kedaluwarsa (Expiration)'
          ? 'Mendesak'
          : 'Segera',
      timeBadge: customDateLabel.trim() || 'Pengingat Aktif',
      dateReference: customDateLabel.trim() || document.effectiveDate,
      message: `Notifikasi Siklus Kontrak: ${targetClause.number} (${targetClause.title}) dijadwalkan untuk evaluasi ${customEventType.toLowerCase()} pada ${customDateLabel}.`,
    };

    setCustomReminders((prev) => [newRem, ...prev]);
    setIsAddingCustom(false);
  };

  return (
    <div className="border-b border-[#E2E8F0] px-4 py-3.5 bg-[#FFFBEB]/60">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <BellRing className="w-3.5 h-3.5 text-[#D97706]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
            Smart Reminder · Siklus Kontrak
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {dismissedCount > 0 && (
            <button
              type="button"
              onClick={handleRestoreAll}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B] hover:text-[#0F172A] border border-[#CBD5E1] bg-white rounded transition-colors"
              title="Tampilkan kembali notifikasi sementara yang ditutup"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Pulihkan ({dismissedCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddingCustom((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FCD34D] rounded transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            Set Pengingat
          </button>
        </div>
      </div>

      <p className="text-[11px] text-[#475569] leading-relaxed mb-2.5">
        Notifikasi sementara untuk memantau klausul yang mendekati{' '}
        <span className="font-semibold text-[#0F172A]">
          Tanggal Efektif ({document.effectiveDate})
        </span>{' '}
        atau masa kedaluwarsa kontrak.
      </p>

      {isAddingCustom && (
        <form
          onSubmit={handleAddCustomReminder}
          className="mb-3 p-2.5 bg-white border border-[#FCD34D] rounded space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
              Tambah Pengingat Siklus Klausul
            </span>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                Pilih Pasal
              </label>
              <select
                value={selectedClauseNumber}
                onChange={(e) => setSelectedClauseNumber(e.target.value)}
                className="w-full px-2 py-1 text-[11px] bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0F172A]"
              >
                {document.clauses.map((c) => (
                  <option key={c.id} value={c.number}>
                    {c.number} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#475569] mb-0.5">
                Jenis Siklus
              </label>
              <select
                value={customEventType}
                onChange={(e) =>
                  setCustomEventType(
                    e.target.value as SmartLifecycleReminder['eventType']
                  )
                }
                className="w-full px-2 py-1 text-[11px] bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0F172A]"
              >
                <option value="Mendekati Kedaluwarsa (Expiration)">
                  Mendekati Kedaluwarsa
                </option>
                <option value="Mulai Berlaku (Effective Date)">
                  Mulai Berlaku (Effective)
                </option>
                <option value="Tenggat Kewajiban Klausul">
                  Tenggat Kewajiban
                </option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customDateLabel}
              onChange={(e) => setCustomDateLabel(e.target.value)}
              placeholder="Contoh: 30 Oktober 2026 (H-7)"
              className="flex-1 px-2 py-1 text-[11px] bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0F172A]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-white text-[10px] font-semibold rounded transition-colors"
            >
              Aktifkan
            </button>
          </div>
        </form>
      )}

      {visibleReminders.length === 0 ? (
        <div className="p-2.5 bg-white border border-[#E2E8F0] rounded flex items-center justify-between">
          <span className="text-[11px] text-[#64748B]">
            Seluruh notifikasi pengingat sementara telah ditutup.
          </span>
          <button
            type="button"
            onClick={handleRestoreAll}
            className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
          >
            Tampilkan ({allReminders.length})
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleReminders.map((rem) => {
            const isUrgent = rem.urgency === 'Mendesak';
            const isSoon = rem.urgency === 'Segera';
            return (
              <div
                key={rem.id}
                className={`p-2.5 rounded border transition-all bg-white ${
                  isUrgent
                    ? 'border-l-4 border-l-[#DC2626] border-[#FECACA]'
                    : isSoon
                    ? 'border-l-4 border-l-[#D97706] border-[#FDE68A]'
                    : 'border-l-4 border-l-[#1D4ED8] border-[#BFDBFE]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold">
                    {isUrgent ? (
                      <AlertTriangle className="w-3 h-3 text-[#DC2626] shrink-0" />
                    ) : (
                      <CalendarClock className="w-3 h-3 text-[#D97706] shrink-0" />
                    )}
                    <span
                      className={
                        isUrgent
                          ? 'text-[#B91C1C] font-bold uppercase'
                          : isSoon
                          ? 'text-[#B45309] font-bold uppercase'
                          : 'text-[#1D4ED8] font-bold uppercase'
                      }
                    >
                      {rem.urgency}
                    </span>
                    <span className="text-[#CBD5E1]">·</span>
                    <span className="text-[#0F172A]">{rem.eventType}</span>
                    <span className="text-[#CBD5E1]">·</span>
                    <span className="font-mono text-[#475569] inline-flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {rem.timeBadge}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDismiss(rem.id)}
                    title="Tutup notifikasi sementara ini"
                    className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[11px] text-[#334155] leading-relaxed mt-1">
                  {rem.message}
                </p>

                <div className="mt-2 pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#64748B]">
                    Acuan: <strong className="text-[#0F172A]">{rem.dateReference}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToClause(rem.clauseNumber)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF]"
                  >
                    Periksa {rem.clauseNumber}
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
