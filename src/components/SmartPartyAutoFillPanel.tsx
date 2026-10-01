import React, { useState, useMemo } from 'react';
import {
  Building2,
  UserCheck,
  Wand2,
  Check,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import {
  LegalDocument,
  PartyEntityType,
  SmartAutoFillProposal,
} from '../types/legal';
import {
  generateSmartAutoFillProposals,
  getEntityTypeLabel,
} from '../utils/partyAutoFill';

interface SmartPartyAutoFillPanelProps {
  document: LegalDocument;
  onChangePartyEntityType: (partyWhich: 'partyOne' | 'partyTwo', newType: PartyEntityType) => void;
  onApplySingleProposal: (proposal: SmartAutoFillProposal, mode: 'replace' | 'insert') => void;
  onApplyAllProposals: (proposals: SmartAutoFillProposal[]) => void;
  onNotify?: (msg: string) => void;
}

export const SmartPartyAutoFillPanel: React.FC<SmartPartyAutoFillPanelProps> = ({
  document,
  onChangePartyEntityType,
  onApplySingleProposal,
  onApplyAllProposals,
  onNotify,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [aiProposals, setAiProposals] = useState<SmartAutoFillProposal[] | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});

  const analysis = useMemo(() => generateSmartAutoFillProposals(document), [document]);
  const activeProposals = aiProposals && aiProposals.length > 0 ? aiProposals : analysis.proposals;

  const handleRequestAiAutoFill = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/legal/smart-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: document.title,
          partyOne: document.partyOne,
          partyTwo: document.partyTwo,
          partyOneType: analysis.partyOneType,
          partyTwoType: analysis.partyTwoType,
          existingClauses: document.clauses,
        }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data) && data.length > 0) {
        const mapped: SmartAutoFillProposal[] = data.map((item: any, idx: number) => {
          const matched = document.clauses.find(
            (c) =>
              item.matchedClauseNumber &&
              c.number.toLowerCase() === String(item.matchedClauseNumber).toLowerCase()
          );
          return {
            id: `ai-autofill-${Date.now()}-${idx}`,
            targetTopic: 'kapasitas_hukum',
            badgeLabel:
              item.badgeLabel || `AI Auto-Fill · ${analysis.partyOneType} vs ${analysis.partyTwoType}`,
            clauseTitle: item.clauseTitle || 'KETENTUAN KHUSUS PARA PIHAK',
            legalBasis: item.legalBasis || 'Pasal 1338 KUHPerdata',
            riskLevel: item.riskLevel || 'Perhatian',
            rationale: item.rationale || '',
            proposedContent: Array.isArray(item.proposedContent) ? item.proposedContent : [],
            matchedClauseId: matched?.id,
            matchedClauseNumber: matched?.number,
          };
        });
        setAiProposals(mapped);
        onNotify?.(
          `${mapped.length} usulan Auto-Fill Cerdas berbasis profil ${analysis.partyOneType} vs ${analysis.partyTwoType} berhasil disusun AI.`
        );
      } else {
        setAiProposals(null);
        onNotify?.(
          `Usulan Auto-Fill Cerdas (${analysis.partyOneType} vs ${analysis.partyTwoType}) telah diperbarui.`
        );
      }
    } catch {
      setAiProposals(null);
      onNotify?.(
        `Usulan Auto-Fill Cerdas (${analysis.partyOneType} vs ${analysis.partyTwoType}) siap diterapkan.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="no-print my-5 bg-[#FAF9F6] border border-[#1E3A8A]/30 rounded-md overflow-hidden font-ui">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-[#F7F5F0] border-b border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]">
                Auto-Fill Cerdas Berbasis Metadata Pihak
              </span>
              <span className="text-xs text-[#57534E]">·</span>
              <span className="text-xs font-semibold text-[#1E3A8A]">
                {analysis.pairingLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#57534E]">
              Mengusulkan isi Pasal spesifik secara otomatis berdasarkan status subjek hukum Pihak Pertama & Pihak Kedua (misal: PT vs Individu)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onApplyAllProposals(activeProposals);
              const nextMap: Record<string, boolean> = {};
              activeProposals.forEach((p) => {
                nextMap[p.id] = true;
              });
              setAppliedIds((prev) => ({ ...prev, ...nextMap }));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan Semua Auto-Fill ({activeProposals.length} Pasal)</span>
          </button>

          <button
            type="button"
            disabled={isLoadingAi}
            onClick={handleRequestAiAutoFill}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1E3A8A] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingAi ? 'Menganalisis Pihak...' : 'Rekomendasi AI'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-[#57534E] hover:text-[#18181B] bg-white border border-[#D6D0C4] rounded cursor-pointer"
            title={isOpen ? 'Sembunyikan panel Auto-Fill' : 'Tampilkan panel Auto-Fill'}
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Interactive Party Metadata Switcher (PT vs Individu, etc.) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white border border-[#E5E0D8] rounded">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                <span className="font-semibold text-[#1E3A8A] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Metadata Subjek Hukum Pihak Pertama:
                </span>
                <span className="font-medium text-[#18181B] truncate max-w-[180px]">
                  {document.partyOne.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['PT', 'Individu', 'CV_Firma', 'Instansi'] as PartyEntityType[]).map((t) => {
                  const active = analysis.partyOneType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setAiProposals(null);
                        onChangePartyEntityType('partyOne', t);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-[#FAF9F6] text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                      }`}
                    >
                      {t === 'PT'
                        ? 'PT (Badan Hukum)'
                        : t === 'Individu'
                        ? 'Individu (Perorangan)'
                        : t === 'CV_Firma'
                        ? 'CV / Firma'
                        : 'Instansi'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                <span className="font-semibold text-[#78350F] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Metadata Subjek Hukum Pihak Kedua:
                </span>
                <span className="font-medium text-[#18181B] truncate max-w-[180px]">
                  {document.partyTwo.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['PT', 'Individu', 'CV_Firma', 'Instansi'] as PartyEntityType[]).map((t) => {
                  const active = analysis.partyTwoType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setAiProposals(null);
                        onChangePartyEntityType('partyTwo', t);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#78350F] text-white border-[#78350F]'
                          : 'bg-[#FAF9F6] text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                      }`}
                    >
                      {t === 'PT'
                        ? 'PT (Badan Hukum)'
                        : t === 'Individu'
                        ? 'Individu (Perorangan)'
                        : t === 'CV_Firma'
                        ? 'CV / Firma'
                        : 'Instansi'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#57534E] leading-relaxed">
            <strong className="text-[#18181B]">Diagnosis Profil Pihak:</strong>{' '}
            {analysis.pairingSummary}
          </p>

          {/* Proposed Clauses List */}
          <div className="space-y-3">
            {activeProposals.map((prop) => {
              const isApplied = Boolean(appliedIds[prop.id]);
              return (
                <div
                  key={prop.id}
                  className="p-3.5 bg-white border border-[#E5E0D8] rounded-md space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#57534E]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-[#1E3A8A]">{prop.badgeLabel}</span>
                      <span>·</span>
                      <span>{prop.legalBasis}</span>
                      <span>·</span>
                      <span
                        className={`font-semibold ${
                          prop.riskLevel === 'Kritis'
                            ? 'text-red-700'
                            : prop.riskLevel === 'Perhatian'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        Risiko: {prop.riskLevel}
                      </span>
                    </div>
                    {prop.matchedClauseNumber && (
                      <span className="text-[11px] text-[#57534E]">
                        Target Auto-Fill: <strong className="text-[#18181B]">{prop.matchedClauseNumber}</strong>
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wide text-[#18181B]">
                    {prop.clauseTitle}
                  </div>

                  <p className="text-xs text-[#57534E] leading-relaxed">{prop.rationale}</p>

                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded space-y-1.5 font-legal text-xs text-[#18181B]">
                    {prop.proposedContent.map((line, lIdx) => (
                      <p key={lIdx} className="leading-relaxed text-justify">
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {prop.matchedClauseId && prop.matchedClauseNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplySingleProposal(prop, 'replace');
                          setAppliedIds((prev) => ({ ...prev, [prop.id]: true }));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>
                          {isApplied
                            ? `Diperbarui pada ${prop.matchedClauseNumber}`
                            : `Auto-Fill ke ${prop.matchedClauseNumber}`}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onApplySingleProposal(prop, 'insert');
                        setAppliedIds((prev) => ({ ...prev, [prop.id]: true }));
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                        prop.matchedClauseId
                          ? 'text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#D6D0C4]'
                          : 'text-white bg-[#1E3A8A] hover:bg-[#172554]'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sisipkan sebagai Pasal Baru</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
