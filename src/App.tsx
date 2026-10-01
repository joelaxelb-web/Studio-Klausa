import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  FileDown,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Wand2,
  BookOpen,
  ShieldAlert,
  SlidersHorizontal,
  FolderOpen,
  ChevronRight,
  Edit3,
  Eye,
  AlertCircle,
  BookMarked,
  Search,
  MessageSquare,
  Send,
  RotateCcw,
  ExternalLink,
  History,
  GitCompare,
  Scissors,
  Share2,
  Lock,
  FileText,
  FileSignature,
  Tag,
  GripVertical,
  ArrowUpDown,
  Stamp,
  ShieldCheck,
  BellRing,
  Mail,
  Bot,
  Languages,
  Columns2,
  QrCode,
} from 'lucide-react';
import {
  LegalDocument,
  LegalDocumentSnapshot,
  LegalDocumentVersion,
  LegalClause,
  ClauseCategoryType,
  ClauseLibraryItem,
  LegalGlossaryItem,
  LegalChatMessage,
  ContextualClauseSuggestion,
  PartyEntityType,
  SmartAutoFillProposal,
  ClauseComment,
  OwnerCommentNotification,
  ComprehensiveScanFinding,
  AiClauseHistoryEntry,
  AiClauseChangeRecord,
  AiParagraphChangeDetail,
  ClauseTranslationData,
  SupportedLegalLanguage,
  SmartFormattingHistoryEntry,
  AuditEvolutionEvent,
  DocumentSectionOption,
  RegulationSearchHistoryItem,
} from './types/legal';
import {
  buildDocumentSectionsForGlossary,
  extractDomainGlossaryFromSections,
  loadRegulationSearchHistory,
  recordRegulationSearchToHistory,
} from './utils/autoGlossaryAgent';
import {
  INITIAL_LEGAL_DOCUMENTS,
  QUICK_COMMAND_PRESETS,
  CLAUSE_LIBRARY_SNIPPETS,
} from './data/presets';
import {
  exportToPdf,
  exportAuditSummaryToPdf,
  exportLegalMemoToPdf,
  exportAuditEvolutionToPdf,
  exportToWordDoc,
  formatDocumentAsPlainText,
  applyVariableReplacement,
} from './utils/exportDocument';
import { AuditEvolutionLog } from './components/AuditEvolutionLog';
import {
  UNIVERSAL_DOMAIN_CATEGORIES,
  UNIVERSAL_STRUCTURE_STYLES,
  UNIVERSAL_QUICK_CRITERIA_CHIPS,
  UNIVERSAL_EXTENDED_PRESETS,
  LEGAL_PROTECTION_STANCE_OPTIONS,
  getLegalStanceProfile,
  adaptClauseByProtectionStance,
  applyProtectionStanceToDraftResult,
  buildUniversalDynamicDraftFromPrompt,
} from './utils/universalDraftEngine';
import { detectLegalTermsInDocument } from './utils/legalGlossary';
import { AuditRiskChart } from './components/AuditRiskChart';
import { RiskAnalysisDashboard } from './components/RiskAnalysisDashboard';
import {
  RegulatoryClauseApplyMode,
  BulkRegulatoryUpdateItem,
} from './components/RegulatoryComplianceHeatmap';
import { SmartChecklistSection } from './components/SmartChecklistSection';
import { ComprehensiveRiskScannerSection } from './components/ComprehensiveRiskScannerSection';
import { LegalMemoModal } from './components/LegalMemoModal';
import { SmartLifecycleReminderBanner } from './components/SmartLifecycleReminderBanner';
import {
  SuratKuasaBuilderModal,
  PowerOfAttorneyType,
  DocumentBuildMode,
  tryBuildOfficialSkStFromPrompt,
} from './components/SuratKuasaBuilderModal';
import {
  ClauseHeaderHoverSearch,
  PasalPlaceholderHoverCard,
} from './components/ClauseLibraryHoverSearch';
import {
  generatePlainLanguageClauseSummary,
  categorizeClauseWithLabels,
  CLAUSE_CATEGORY_STYLES,
} from './utils/legalSmartAnalyzer';
import { ContextualClauseInsertionBox } from './components/ContextualClauseInsertionBox';
import { VersionHistoryPanel } from './components/VersionHistoryPanel';
import { VersionComparisonView } from './components/VersionComparisonView';
import { RegulationSearchPanel } from './components/RegulationSearchPanel';
import { FormattedLegalText } from './components/FormattedLegalText';
import {
  LegalAnnotatedText,
  EditableAnnotatedParagraph,
} from './components/LegalAnnotatedText';
import {
  BulkFormatToolbar,
  formatConfigSummaryLabel,
} from './components/BulkFormatToolbar';
import { SmartPartyAutoFillPanel } from './components/SmartPartyAutoFillPanel';
import {
  ShareDraftReviewModal,
  ClauseCommentThread,
  DocumentVerificationQrFooter,
  generateAiLegalRebuttalForClause,
} from './components/ShareDraftReviewModal';
import {
  ProceduralComplianceManual,
  formatClauseAsMarkdown,
  ComplianceCategoryProfileId,
} from './components/ProceduralComplianceManual';
import { updatePartyKomparisiByEntityType } from './utils/partyAutoFill';
import {
  BulkFormatConfig,
  NumberingStyle,
  applyBulkFormattingToDocument,
  adaptClauseByRiskLevel,
  splitClauseLocally,
  parseRawContractTextIntoClauses,
} from './utils/clauseTools';
import {
  analyzeDraftConditionsForLibrary,
  computeSemanticClauseSearch,
  DynamicClauseLibraryItem,
} from './utils/dynamicClauseLibrary';
import {
  AiClauseHistorySidePanel,
  DualLanguageClauseView,
  SUPPORTED_LEGAL_LANGUAGES,
  translateClauseLocallySync,
  translateClauseWithAI,
} from './components/AiClauseHistoryAndTranslation';
import {
  DocumentLanguageCode,
  translateEntireDocumentInRealtime,
} from './utils/documentLanguageTranslator';

const STORAGE_KEY = 'klausa_studio_documents_v8';

function createSnapshotFromDoc(doc: LegalDocument): LegalDocumentSnapshot {
  return {
    title: doc.title,
    subtitle: doc.subtitle,
    documentNumber: doc.documentNumber,
    category: doc.category,
    jurisdiction: doc.jurisdiction,
    effectiveDate: doc.effectiveDate,
    openingText: doc.openingText,
    partyOne: { ...doc.partyOne },
    partyTwo: { ...doc.partyTwo },
    recitals: [...doc.recitals],
    clauses: doc.clauses.map((c) => ({ ...c, content: [...c.content] })),
    closingText: doc.closingText,
    signingLocation: doc.signingLocation,
    variables: doc.variables.map((v) => ({ ...v })),
    auditNotes: doc.auditNotes.map((n) => ({ ...n })),
  };
}

function ensureInitialVersions(docs: LegalDocument[]): LegalDocument[] {
  return docs.map((doc) => {
    const shareId = doc.shareId || `share-${doc.id}`;
    const secondClause = doc.clauses[1] || doc.clauses[0];
    const fourthClause = doc.clauses[3] || doc.clauses[2] || doc.clauses[0];
    const baseComments: ClauseComment[] = secondClause
      ? [
          {
            id: `cmt-init-1-${doc.id}`,
            clauseId: secondClause.id,
            clauseNumber: secondClause.number,
            clauseTitle: secondClause.title,
            authorName: 'Hendra Wijaya, S.H., M.Kn.',
            authorRole: 'Kuasa Hukum Pihak Kedua',
            commentText:
              'Mohon ditinjau agar batas waktu verifikasi dokumen tagihan disesuaikan menjadi maksimal 10 (sepuluh) Hari Kerja sejak BAST ditandatangani.',
            proposedAlternative:
              'Pembayaran wajib dilunasi paling lambat 10 (sepuluh) Hari Kerja sejak diterimanya tagihan lengkap beserta Faktur Pajak dan BAST.',
            status: 'Terbuka',
            timestamp: 'Hari ini, 14:20 WIB',
          },
          {
            id: `cmt-init-2-${doc.id}`,
            clauseId: secondClause.id,
            clauseNumber: secondClause.number,
            clauseTitle: secondClause.title,
            authorName: 'Nadia Putri, S.H.',
            authorRole: 'Legal Counsel Pihak Pertama',
            commentText:
              'Perlu dipastikan rincian rekening bank tujuan dan mekanisme pemotongan PPh Pasal 23 tercantum secara eksplisit dalam ayat ini.',
            status: 'Terbuka',
            timestamp: 'Hari ini, 14:35 WIB',
          },
          ...(fourthClause && fourthClause.id !== secondClause.id
            ? [
                {
                  id: `cmt-init-3-${doc.id}`,
                  clauseId: fourthClause.id,
                  clauseNumber: fourthClause.number,
                  clauseTitle: fourthClause.title,
                  authorName: 'Hendra Wijaya, S.H., M.Kn.',
                  authorRole: 'Kuasa Hukum Pihak Kedua',
                  commentText:
                    'Mohon diperjelas masa perbaikan (remedy period) selama 14 Hari Kalender sebelum pengakhiran perjanjian secara sepihak dilakukan.',
                  status: 'Terbuka' as const,
                  timestamp: 'Hari ini, 14:50 WIB',
                },
              ]
            : []),
        ]
      : [];
    const defaultComments: ClauseComment[] =
      doc.comments && doc.comments.length > 0
        ? doc.comments.length === 1 &&
          doc.comments[0].id === `cmt-init-1-${doc.id}` &&
          baseComments[1]
          ? [...doc.comments, baseComments[1]]
          : doc.comments
        : baseComments;

    const hasAnyPlainSummary = doc.clauses.some((c) => Boolean(c.plainSummary));
    const enrichedClauses = (
      hasAnyPlainSummary
        ? doc.clauses
        : doc.clauses.map((c, idx) =>
            idx === 0 || idx === 2 || idx === 3
              ? { ...c, plainSummary: generatePlainLanguageClauseSummary(c) }
              : c
          )
    ).map((c, idx) => {
      if (c.aiHistory && c.aiHistory.length > 0) return c;
      const baseEntry: AiClauseHistoryEntry = {
        id: `hist-init-${c.id}`,
        clauseId: c.id,
        clauseNumber: c.number,
        source: 'Initial State',
        actionLabel: 'Versi Dasar Klausul (Sebelum Transformasi AI)',
        timestamp: '29 Sep 2026, 10:00 WIB',
        snapshot: {
          title: c.title,
          content: c.content.map((p) =>
            p.replace(/14 \(empat belas\)/g, '30 (tiga puluh)')
          ),
          legalBasis: c.legalBasis,
          riskLevel: idx === 1 ? 'Standar' : c.riskLevel,
        },
      };

      if (idx === 0) {
        return {
          ...c,
          aiHistory: [
            {
              id: `hist-wa-${c.id}`,
              clauseId: c.id,
              clauseNumber: c.number,
              source: 'AI Writing Assistant',
              actionLabel: 'AI Writing Assistant · Expand (Perluas & Perinci)',
              timestamp: 'Hari ini, 13:15 WIB',
              snapshot: {
                title: c.title,
                content: [...c.content],
                legalBasis: c.legalBasis,
                riskLevel: c.riskLevel,
              },
            },
            baseEntry,
          ],
        };
      }

      if (idx === 1) {
        return {
          ...c,
          aiHistory: [
            {
              id: `hist-bi-${c.id}`,
              clauseId: c.id,
              clauseNumber: c.number,
              source: 'Bulk Importer',
              actionLabel: 'Bulk Clause Import · Standarisasi Hierarki & Risiko AI',
              timestamp: 'Hari ini, 13:40 WIB',
              snapshot: {
                title: c.title,
                content: [...c.content],
                legalBasis: c.legalBasis,
                riskLevel: c.riskLevel,
              },
            },
            baseEntry,
          ],
        };
      }

      return {
        ...c,
        aiHistory: [baseEntry],
      };
    });

    if (doc.versions && doc.versions.length >= 2 && doc.smartFormatHistory && doc.smartFormatHistory.length > 0) {
      return {
        ...doc,
        clauses: enrichedClauses,
        shareId,
        comments: defaultComments,
      };
    }
    const latestSnapshot = createSnapshotFromDoc({
      ...doc,
      clauses: enrichedClauses,
    });

    // Build 30-day historical snapshots so side-by-side diff, Risk Evolution chart, and 30-Day Contract Health Score Trend-Line show clear progression out-of-the-box
    const baselineClauses = doc.clauses
      .slice(0, Math.max(1, doc.clauses.length - 1))
      .map((c, idx) => {
        if (idx === 0) {
          return {
            ...c,
            riskLevel: 'Kritis',
            content: c.content.map((p) =>
              p.replace(/maksimal|setinggi-tingginya/gi, 'sepenuhnya tanpa batas')
            ),
          };
        }
        if (idx === 1 && c.content.length > 0) {
          return {
            ...c,
            riskLevel: 'Perhatian',
            content: [
              c.content[0].replace(/14 \(empat belas\)/g, '30 (tiga puluh)'),
              ...c.content.slice(1),
            ],
          };
        }
        return { ...c, content: [...c.content] };
      });

    const midMonthClauses = doc.clauses.map((c, idx) => {
      if (idx === 0) {
        return {
          ...c,
          riskLevel: 'Perhatian',
        };
      }
      if (idx === 1 && c.content.length > 0) {
        return {
          ...c,
          riskLevel: 'Perhatian',
        };
      }
      return { ...c, content: [...c.content] };
    });

    const baselineSnapshot: LegalDocumentSnapshot = {
      ...latestSnapshot,
      clauses: baselineClauses,
    };

    const midMonthSnapshot: LegalDocumentSnapshot = {
      ...latestSnapshot,
      clauses: midMonthClauses,
    };

    const defaultSmartFormatHistory: SmartFormattingHistoryEntry[] =
      doc.smartFormatHistory && doc.smartFormatHistory.length > 0
        ? doc.smartFormatHistory
        : [
            {
              id: `fmt-init-notarial-${doc.id}`,
              label: 'Standar Akta Notariil',
              timestamp: '29 Sep 2026, 18:30 WIB',
              numberingStyle: 'ayat_parentheses',
              fontStyle: 'serif_legal',
              indentation: 'hanging_subclause',
              uppercaseTitles: true,
              clausesSnapshot: enrichedClauses.map((c) => ({
                ...c,
                content: [...c.content],
              })),
              summaryText: 'Pasal 1 → (1), a. · Serif Akta · Hanging Indent · JUDUL KAPITAL',
            },
            {
              id: `fmt-init-decimal-${doc.id}`,
              label: 'Hierarki Desimal Korporasi',
              timestamp: '29 Sep 2026, 19:00 WIB',
              numberingStyle: 'decimal_hierarchy',
              fontStyle: 'sans_corporate',
              indentation: 'hanging_subclause',
              uppercaseTitles: true,
              clausesSnapshot: applyBulkFormattingToDocument(
                { ...doc, clauses: enrichedClauses },
                {
                  numberingStyle: 'decimal_hierarchy',
                  fontStyle: 'sans_corporate',
                  indentation: 'hanging_subclause',
                  uppercaseTitles: true,
                }
              ).clauses,
              summaryText: 'Pasal 1 → 1.1., a. · Sans Korporasi · Hanging Indent · JUDUL KAPITAL',
            },
            {
              id: `fmt-init-roman-${doc.id}`,
              label: 'Romawi Klasik Audit',
              timestamp: '29 Sep 2026, 19:15 WIB',
              numberingStyle: 'roman_parentheses',
              fontStyle: 'mono_audit',
              indentation: 'notarial_first_line',
              uppercaseTitles: true,
              clausesSnapshot: applyBulkFormattingToDocument(
                { ...doc, clauses: enrichedClauses },
                {
                  numberingStyle: 'roman_parentheses',
                  fontStyle: 'mono_audit',
                  indentation: 'notarial_first_line',
                  uppercaseTitles: true,
                }
              ).clauses,
              summaryText: 'PASAL I → (1), a. · Mono Audit · Notarial First-Line · JUDUL KAPITAL',
            },
          ];

    return {
      ...doc,
      clauses: enrichedClauses,
      shareId,
      comments: defaultComments,
      smartFormatHistory: defaultSmartFormatHistory,
      versions:
        doc.versions && doc.versions.length >= 3
          ? doc.versions
          : [
              {
                id: `ver-v1-2-${doc.id}`,
                versionLabel: 'v1.2',
                timestamp: doc.updatedAt || '29 Sep 2026, 19:45 WIB',
                summary: 'Penyempurnaan Klausul Proteksi & Mitigasi Risiko',
                snapshot: latestSnapshot,
              },
              {
                id: `ver-v1-1-${doc.id}`,
                versionLabel: 'v1.1',
                timestamp: '16 Sep 2026, 14:20 WIB',
                summary: 'Evaluasi Tengah Bulan & Mitigasi Kewajiban Para Pihak',
                snapshot: midMonthSnapshot,
              },
              {
                id: `ver-v1-0-${doc.id}`,
                versionLabel: 'v1.0',
                timestamp: '02 Sep 2026, 10:15 WIB',
                summary: 'Draf Awal Penyusunan Dokumen (Baseline Risiko 30 Hari)',
                snapshot: baselineSnapshot,
              },
            ],
    };
  });
}

export default function App() {
  // Document collection state with localStorage persistence + initial version history
  const [documents, setDocuments] = useState<LegalDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((d: LegalDocument) => d.id));
          const missingPresets = INITIAL_LEGAL_DOCUMENTS.filter(
            (presetDoc) => !existingIds.has(presetDoc.id)
          );
          return ensureInitialVersions([...parsed, ...missingPresets]);
        }
      }
    } catch {
      // fallback to initial documents
    }
    return ensureInitialVersions(INITIAL_LEGAL_DOCUMENTS);
  });

  const [activeDocId, setActiveDocId] = useState<string>(
    () => documents[0]?.id || 'doc-pks-software-2026'
  );
  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  // One-command AI drafting state
  const [commandInput, setCommandInput] = useState<string>('');
  const [stance, setStance] = useState<string>('Seimbang (Adil bagi Kedua Pihak)');
  const [language, setLanguage] = useState<string>('Bahasa Indonesia Formal');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [draftingStage, setDraftingStage] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Navigation & view mode state
  const [activeNavSection, setActiveNavSection] = useState<
    'prompt' | 'editor' | 'consultant' | 'regulations' | 'audit'
  >('prompt');
  const [viewMode, setViewMode] = useState<'structured' | 'folio' | 'compare'>('structured');
  const [rightTab, setRightTab] = useState<
    'variables' | 'library' | 'regulations' | 'audit' | 'clause_history'
  >('audit');
  const [focusedAiHistoryClauseId, setFocusedAiHistoryClauseId] = useState<string | null>(null);
  const [dualLanguageEnabled, setDualLanguageEnabled] = useState<boolean>(false);
  const [dualLanguageClauseIds, setDualLanguageClauseIds] = useState<Record<string, boolean>>({});
  const [targetTranslationLang, setTargetTranslationLang] =
    useState<SupportedLegalLanguage>('English');
  const [translatingClauseId, setTranslatingClauseId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Side-by-side version comparison state
  const [compareLeftVersionId, setCompareLeftVersionId] = useState<string>('');
  const [compareRightVersionId, setCompareRightVersionId] = useState<string>('');

  // Per-clause AI refinement state
  const [refiningClauseId, setRefiningClauseId] = useState<string | null>(null);
  const [clauseInstruction, setClauseInstruction] = useState<string>('');
  const [isRefiningClause, setIsRefiningClause] = useState<boolean>(false);

  // Add new clause with 1 AI command state
  const [newClausePrompt, setNewClausePrompt] = useState<string>('');
  const [isAddingClause, setIsAddingClause] = useState<boolean>(false);

  // Whole-document AI revision command state
  const [globalRevisionPrompt, setGlobalRevisionPrompt] = useState<string>('');
  const [isTransformingDoc, setIsTransformingDoc] = useState<boolean>(false);

  // Variable editing state
  const [editingVarValues, setEditingVarValues] = useState<Record<number, string>>({});
  const [newVarKey, setNewVarKey] = useState<string>('');
  const [newVarValue, setNewVarValue] = useState<string>('');

  // Filter for clause library
  const [libraryFilter, setLibraryFilter] = useState<string>('Semua');

  // Legal Glossary state (Auto-detected + AI enriched + Auto-Glossary Custom Document Index per document)
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [glossaryFilterMode, setGlossaryFilterMode] = useState<
    'all' | 'critical_or_defined' | 'critical' | 'defined' | 'custom_index'
  >('all');
  const [aiGlossaryByDoc, setAiGlossaryByDoc] = useState<Record<string, LegalGlossaryItem[]>>({});
  const [isAnalyzingGlossary, setIsAnalyzingGlossary] = useState<boolean>(false);
  const [showAutoGlossaryPicker, setShowAutoGlossaryPicker] = useState<boolean>(false);
  const [selectedGlossarySectionIds, setSelectedGlossarySectionIds] = useState<string[]>([]);
  const [isGeneratingAutoGlossaryIndex, setIsGeneratingAutoGlossaryIndex] =
    useState<boolean>(false);
  const [customIndexMetaByDoc, setCustomIndexMetaByDoc] = useState<
    Record<
      string,
      {
        generatedAt: string;
        sectionLabels: string[];
        termCount: number;
        crossRefCount: number;
      }
    >
  >({});

  // 'Cari Pasal & UU' Search History synced with D3 Regulatory Compliance Heatmap
  const [regulationSearchHistory, setRegulationSearchHistory] = useState<
    RegulationSearchHistoryItem[]
  >(() => loadRegulationSearchHistory());

  // AI Legal Consultant Chat state (Multi-turn per document)
  const [chatHistories, setChatHistories] = useState<Record<string, LegalChatMessage[]>>({});
  const [chatInput, setChatInput] = useState<string>('');
  const [focusedChatClause, setFocusedChatClause] = useState<string>('Seluruh Dokumen');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Bulk Formatting & Split Clause States
  const [bulkFormatConfig, setBulkFormatConfig] = useState<BulkFormatConfig>({
    numberingStyle: 'ayat_parentheses',
    fontStyle: 'serif_legal',
    indentation: 'none',
    uppercaseTitles: true,
  });
  const [splittingClauseId, setSplittingClauseId] = useState<string | null>(null);
  const [splitSelectedText, setSplitSelectedText] = useState<string>('');
  const [isSplittingClause, setIsSplittingClause] = useState<boolean>(false);

  // Shareable Draft Review Link & Clause Commenting States
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isReviewOnlyMode, setIsReviewOnlyMode] = useState<boolean>(false);
  const [openCommentClauseId, setOpenCommentClauseId] = useState<string | null>(null);
  const [ownerNotificationEmail, setOwnerNotificationEmail] = useState<string>(
    'joelaxelb123@gmail.com'
  );
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(true);
  const [ownerCommentAlerts, setOwnerCommentAlerts] = useState<OwnerCommentNotification[]>([]);
  const [showUnresolvedInSidebar, setShowUnresolvedInSidebar] = useState<boolean>(true);
  const [globalResolveAnimTrigger, setGlobalResolveAnimTrigger] = useState<number>(0);
  const [libraryDynamicFilter, setLibraryDynamicFilter] = useState<
    'all' | 'missing_recommended' | 'strengthen_critical' | 'covered_in_draft'
  >('all');
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>('');
  const [isSemanticSearching, setIsSemanticSearching] = useState<boolean>(false);
  const [aiSemanticOverrides, setAiSemanticOverrides] = useState<{
    matches?: Array<{ id: string; similarityScore: number; matchExplanation: string }>;
    synthesizedClause?: any;
  } | null>(null);
  const [isImportingBulk, setIsImportingBulk] = useState<boolean>(false);
  const [isGeneratingAiRebuttalClauseId, setIsGeneratingAiRebuttalClauseId] = useState<
    string | null
  >(null);
  const [isLegalMemoModalOpen, setIsLegalMemoModalOpen] = useState<boolean>(false);
  const [isSuratKuasaModalOpen, setIsSuratKuasaModalOpen] = useState<boolean>(false);
  const [suratKuasaInitialType, setSuratKuasaInitialType] =
    useState<PowerOfAttorneyType>('aanmaning');
  const [suratKuasaInitialDocMode, setSuratKuasaInitialDocMode] =
    useState<DocumentBuildMode>('sk_khusus');

  // Summarize Clause (1-Sentence Plain Language Summary) States
  const [expandedSummaryClauseIds, setExpandedSummaryClauseIds] = useState<
    Record<string, boolean>
  >({});
  const [summarizingClauseId, setSummarizingClauseId] = useState<string | null>(null);

  // AI Clause Categorization & Color-Coded Tag Suggestion States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    'Semua' | ClauseCategoryType
  >('Semua');
  const [onlyCriticalRiskFilter, setOnlyCriticalRiskFilter] = useState<boolean>(false);
  const [onlyLowRiskFilter, setOnlyLowRiskFilter] = useState<boolean>(false);
  const [activeClauseSort, setActiveClauseSort] = useState<string>('');
  const [isCategorizingAllAI, setIsCategorizingAllAI] = useState<boolean>(false);
  const [customTagInputs, setCustomTagInputs] = useState<Record<string, string>>({});

  // Legal Compliance Summary PDF Clause Customization States
  const [isCustomizingAuditPdf, setIsCustomizingAuditPdf] = useState<boolean>(true);
  const [selectedAuditClauseIds, setSelectedAuditClauseIds] = useState<string[]>(() =>
    INITIAL_LEGAL_DOCUMENTS[0]?.clauses.map((c) => c.id) || []
  );
  const [includeClauseContentInAuditPdf, setIncludeClauseContentInAuditPdf] =
    useState<boolean>(false);

  // PDF Export Watermark Settings State
  const [pdfWatermarkEnabled, setPdfWatermarkEnabled] = useState<boolean>(false);
  const [pdfWatermarkText, setPdfWatermarkText] = useState<string>('DRAFT');

  // Universal Dynamic Document Drafting Criteria States (for Perintah Penyusunan Dokumen)
  const [universalDomainCategory, setUniversalDomainCategory] = useState<string>(
    'Otomatis (Deteksi Cerdas dari Perintah)'
  );
  const [universalStructureStyle, setUniversalStructureStyle] = useState<string>(
    'Otomatis Sesuai Konteks Dokumen'
  );
  const [universalCustomCriteria, setUniversalCustomCriteria] = useState<string>('');
  const [presetDomainFilter, setPresetDomainFilter] = useState<string>('Semua');

  // Audit Evolution Log Full Modal State
  const [isAuditEvolutionModalOpen, setIsAuditEvolutionModalOpen] = useState<boolean>(false);

  // Batch Processing States for Categorization UI (Multi-Clause Bulk Category Change & Tag Addition)
  const [selectedBatchClauseIds, setSelectedBatchClauseIds] = useState<string[]>([]);
  const [batchTargetCategory, setBatchTargetCategory] = useState<ClauseCategoryType | ''>('');
  const [batchTagInput, setBatchTagInput] = useState<string>('');

  // Drag-and-Drop Clause Reordering States for 'Daftar Isi Pasal'
  const [draggedClauseIdx, setDraggedClauseIdx] = useState<number | null>(null);
  const [dragOverClauseIdx, setDragOverClauseIdx] = useState<number | null>(null);

  // 'Manual Kepatuhan' Tab State inside Audit Hukum Panel & 'Copy as Markdown' Clause Action State
  const [auditPanelSubTab, setAuditPanelSubTab] = useState<
    'analisis_risiko' | 'manual_kepatuhan'
  >('manual_kepatuhan');
  const [copiedMarkdownClauseId, setCopiedMarkdownClauseId] = useState<string | null>(null);
  const [manualComplianceCheckedByDoc, setManualComplianceCheckedByDoc] = useState<
    Record<string, string[]>
  >({});
  const [manualComplianceProfileMode, setManualComplianceProfileMode] =
    useState<ComplianceCategoryProfileId>('auto');

  const editorRef = useRef<HTMLDivElement>(null);
  const glossaryPanelRef = useRef<HTMLDivElement>(null);
  const consultantPanelRef = useRef<HTMLDivElement>(null);
  const rightInspectorRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      // ignore storage quota errors
    }
  }, [documents]);

  // Detect ?share=<shareId> in URL to open shared draft in Review & Clause Comment Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get('share');
    const hashMatch = window.location.hash.match(/^#clause-comment-(.+)$/);
    const clauseParam = params.get('clause') || (hashMatch ? decodeURIComponent(hashMatch[1]) : null);
    if (clauseParam) {
      setOpenCommentClauseId(clauseParam);
      setViewMode('structured');
      setActiveNavSection('editor');
      setTimeout(() => {
        const el =
          document.getElementById(`clause-comment-${clauseParam}`) ||
          document.getElementById(`clause-${clauseParam}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
    if (!sharedParam) return;

    setIsReviewOnlyMode(true);
    setViewMode('structured');
    setActiveNavSection('editor');

    fetch(`/api/legal/share/${encodeURIComponent(sharedParam)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.document) {
          const sharedDoc: LegalDocument = ensureInitialVersions([data.document])[0];
          setDocuments((prev) => {
            const exists = prev.some((d) => d.id === sharedDoc.id);
            return exists
              ? prev.map((d) => (d.id === sharedDoc.id ? sharedDoc : d))
              : [sharedDoc, ...prev];
          });
          setActiveDocId(sharedDoc.id);
        } else {
          const localMatch = documents.find(
            (d) => d.shareId === sharedParam || `share-${d.id}` === sharedParam
          );
          if (localMatch) {
            setActiveDocId(localMatch.id);
          }
        }
        showToast(
          'Mode Tinjauan Link Berbagi Draf aktif: Anda dapat memberi komentar pada klausul tanpa mengubah naskah asli.'
        );
      })
      .catch(() => {
        showToast(
          'Mode Tinjauan Link Berbagi Draf aktif: Naskah asli terkunci untuk komentar klausul.'
        );
      });
  }, []);

  // Sync variable edit buffer & default version comparison IDs when active document changes
  useEffect(() => {
    if (!activeDoc) return;
    const initialMap: Record<number, string> = {};
    activeDoc.variables.forEach((v, idx) => {
      initialMap[idx] = v.value;
    });
    setEditingVarValues(initialMap);
    setFocusedChatClause('Seluruh Dokumen');

    const vers = activeDoc.versions || [];
    if (vers.length >= 2) {
      setCompareLeftVersionId(vers[1].id);
      setCompareRightVersionId(vers[0].id);
    } else if (vers.length === 1) {
      setCompareLeftVersionId(vers[0].id);
      setCompareRightVersionId(vers[0].id);
    }
  }, [activeDocId, activeDoc?.variables.length]);

  // Sync selected clauses for Legal Compliance Summary PDF export & Batch Categorization when active document changes
  useEffect(() => {
    if (!activeDoc) return;
    setSelectedAuditClauseIds((prev) => {
      const validExisting = prev.filter((id) =>
        activeDoc.clauses.some((c) => c.id === id)
      );
      return validExisting.length > 0
        ? validExisting
        : activeDoc.clauses.map((c) => c.id);
    });
    setSelectedBatchClauseIds((prev) =>
      prev.filter((id) => activeDoc.clauses.some((c) => c.id === id))
    );
  }, [activeDocId, activeDoc?.clauses.length]);

  // Current document's chat thread (with welcome message if empty)
  const currentChatMessages: LegalChatMessage[] = useMemo(() => {
    if (!activeDoc) return [];
    const existing = chatHistories[activeDoc.id];
    if (existing && existing.length > 0) return existing;
    return [
      {
        id: `welcome-${activeDoc.id}`,
        role: 'model',
        text: `Halo, saya AI Legal Consultant Anda (terhubung dengan pencarian Google & portal regulasi pemerintah Indonesia). Saya telah menelaah draf "${activeDoc.title}" beserta ${activeDoc.clauses.length} pasalnya. Silakan tanyakan interpretasi pasal, dasar hukum UU/KUHPerdata, atau risiko kontrak.`,
        focusedClause: 'Seluruh Dokumen',
        timestamp: 'Siap Konsultasi',
      },
    ];
  }, [activeDoc, chatHistories]);

  // Auto-scroll chat thread when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentChatMessages.length, isChatLoading]);

  // Animated progress stages during AI drafting
  useEffect(() => {
    if (!isDrafting) {
      setDraftingStage(0);
      return;
    }
    const interval = setInterval(() => {
      setDraftingStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [isDrafting]);

  // Document Sections available for Auto-Glossary Generator section picker
  const documentGlossarySections = useMemo<DocumentSectionOption[]>(() => {
    if (!activeDoc) return [];
    return buildDocumentSectionsForGlossary(activeDoc);
  }, [activeDoc]);

  // Keep default section selection populated when switching documents
  useEffect(() => {
    if (documentGlossarySections.length > 0) {
      setSelectedGlossarySectionIds((prev) => {
        const validPrev = prev.filter((id) =>
          documentGlossarySections.some((sec) => sec.id === id)
        );
        if (validPrev.length > 0) return validPrev;
        return documentGlossarySections.slice(0, Math.min(4, documentGlossarySections.length)).map((s) => s.id);
      });
    }
  }, [activeDoc.id, documentGlossarySections]);

  // Automatically detect complex legal terms in the active document in real time
  const detectedGlossaryTerms = useMemo(() => {
    if (!activeDoc) return [];
    const autoTerms = detectLegalTermsInDocument(activeDoc);
    const aiTerms = aiGlossaryByDoc[activeDoc.id] || [];

    // Put Custom Index / AI-extracted entries first so they are immediately visible
    const seen = new Set<string>();
    const merged: LegalGlossaryItem[] = [];
    for (const item of aiTerms) {
      const key = item.term.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
    for (const item of autoTerms) {
      const key = item.term.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
    return merged;
  }, [activeDoc, aiGlossaryByDoc]);

  const filteredGlossaryTerms = useMemo(() => {
    const q = glossarySearch.trim().toLowerCase();
    return detectedGlossaryTerms.filter((item) => {
      if (glossaryFilterMode === 'custom_index' && !item.isCustomIndexEntry) {
        return false;
      }
      if (
        glossaryFilterMode === 'critical_or_defined' &&
        !item.isCritical &&
        !item.isDefinedInContract
      ) {
        return false;
      }
      if (glossaryFilterMode === 'critical' && !item.isCritical) {
        return false;
      }
      if (glossaryFilterMode === 'defined' && !item.isDefinedInContract) {
        return false;
      }
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.legalReference.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.crossReferences || []).some((cr) => cr.toLowerCase().includes(q)) ||
        (item.relatedTerms || []).some((rt) => rt.toLowerCase().includes(q))
      );
    });
  }, [detectedGlossaryTerms, glossarySearch, glossaryFilterMode]);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Track which clauses have their Before/After AI diff panel collapsed (expanded by default)
  const [collapsedBeforeAfterClauseIds, setCollapsedBeforeAfterClauseIds] = useState<
    Record<string, boolean>
  >({});

  // Helper to build exact per-part / per-ayat AI change record & Before/After snapshot for any AI clause modification
  const buildAiClauseChangeRecord = (params: {
    clause: LegalClause;
    nextTitle: string;
    nextLegalBasis: string;
    nextContent: string[];
    sourceLabel: string;
    changeMode: 'ayat_added' | 'content_modified' | 'clause_replaced' | 'new_clause_added';
    timestampLabel: string;
  }): { record: AiClauseChangeRecord; changedPartLabels: string[] } => {
    const immediateBefore = {
      title: params.clause.title,
      legalBasis: params.clause.legalBasis,
      content: [...params.clause.content],
    };
    const existingBefore = params.clause.aiChangeRecord?.beforeSnapshot;
    const isSameAsImmediate =
      immediateBefore.title.trim() === params.nextTitle.trim() &&
      immediateBefore.legalBasis.trim() === params.nextLegalBasis.trim() &&
      immediateBefore.content.join('\n').trim() === params.nextContent.join('\n').trim();
    const isSameAsExistingBefore =
      Boolean(existingBefore) &&
      existingBefore!.title.trim() === params.nextTitle.trim() &&
      existingBefore!.legalBasis.trim() === params.nextLegalBasis.trim() &&
      existingBefore!.content.join('\n').trim() === params.nextContent.join('\n').trim();

    const baselineBefore =
      params.changeMode === 'new_clause_added'
        ? {
            title: params.nextTitle,
            legalBasis: params.nextLegalBasis,
            content: [],
          }
        : isSameAsImmediate && existingBefore
        ? existingBefore
        : isSameAsExistingBefore
        ? immediateBefore
        : existingBefore || immediateBefore;

    const afterSnapshot = {
      title: params.nextTitle,
      legalBasis: params.nextLegalBasis,
      content: [...params.nextContent],
    };

    const paragraphChanges: AiParagraphChangeDetail[] = params.nextContent.map(
      (afterText, ayatIndex) => {
        if (params.changeMode === 'new_clause_added') {
          return {
            ayatIndex,
            changeType: 'added',
            beforeText: undefined,
            afterText,
          };
        }
        const beforeTextAtIdx = baselineBefore.content[ayatIndex];
        if (beforeTextAtIdx === undefined) {
          return {
            ayatIndex,
            changeType: 'added',
            beforeText: undefined,
            afterText,
          };
        }
        if (beforeTextAtIdx.trim() !== afterText.trim()) {
          return {
            ayatIndex,
            changeType: 'modified',
            beforeText: beforeTextAtIdx,
            afterText,
          };
        }
        return {
          ayatIndex,
          changeType: 'unchanged',
          beforeText: beforeTextAtIdx,
          afterText,
        };
      }
    );

    // Ensure at least one paragraph is marked as changed if all were 'unchanged' (e.g. when consolidating ayats or re-verifying a clause)
    if (
      paragraphChanges.length > 0 &&
      paragraphChanges.every((pc) => pc.changeType === 'unchanged')
    ) {
      const targetIdx = paragraphChanges.length - 1;
      const extraRemovedBefore =
        baselineBefore.content.length > params.nextContent.length
          ? baselineBefore.content.slice(targetIdx).join(' ')
          : paragraphChanges[targetIdx].beforeText;
      paragraphChanges[targetIdx] = {
        ...paragraphChanges[targetIdx],
        changeType:
          params.changeMode === 'ayat_added' || params.changeMode === 'new_clause_added'
            ? 'added'
            : 'modified',
        beforeText:
          params.changeMode === 'ayat_added' || params.changeMode === 'new_clause_added'
            ? undefined
            : extraRemovedBefore,
      };
    }

    const titleChanged = baselineBefore.title.trim() !== afterSnapshot.title.trim();
    const legalBasisChanged =
      baselineBefore.legalBasis.trim() !== afterSnapshot.legalBasis.trim();

    const changedPartLabels: string[] = [];
    paragraphChanges.forEach((pc) => {
      if (pc.changeType === 'added') {
        changedPartLabels.push(`+ Ayat (${pc.ayatIndex + 1}) Ditambahkan AI`);
      } else if (pc.changeType === 'modified') {
        changedPartLabels.push(`✏️ Ayat (${pc.ayatIndex + 1}) Diubah Isinya`);
      }
    });
    if (legalBasisChanged) {
      changedPartLabels.push('⚖️ Dasar Hukum Diperbarui AI');
    }
    if (titleChanged) {
      changedPartLabels.push('🏷️ Judul Pasal Diubah AI');
    }
    if (changedPartLabels.length === 0) {
      changedPartLabels.push('✏️ Isi Pasal Diperbarui AI');
    }

    const record: AiClauseChangeRecord = {
      id: `ai-chg-${params.clause.id}-${Date.now()}`,
      sourceLabel: params.sourceLabel,
      changeMode: params.changeMode,
      timestamp: params.timestampLabel,
      summary: changedPartLabels.join(' · '),
      beforeSnapshot: baselineBefore,
      afterSnapshot,
      paragraphChanges,
      titleChanged,
      legalBasisChanged,
    };

    return { record, changedPartLabels };
  };

  const handleRevertClauseToBeforeAiChange = (clauseId: string) => {
    const targetClause = activeDoc.clauses.find((c) => c.id === clauseId);
    const beforeSnap =
      targetClause?.aiChangeRecord?.beforeSnapshot ||
      targetClause?.regulatoryUpdateMarker?.beforeSnapshot;
    if (!targetClause || !beforeSnap) return;

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Kembalikan ${targetClause.number} ke versi sebelum diubah AI (Before)`,
        clauses: doc.clauses.map((cl) =>
          cl.id === clauseId
            ? {
                ...cl,
                title: beforeSnap.title,
                legalBasis: beforeSnap.legalBasis,
                content: [...beforeSnap.content],
                aiChangeRecord: undefined,
                regulatoryUpdateMarker: undefined,
                appliedRegulations: [],
              }
            : cl
        ),
      }),
      `Revert ${targetClause.number} ke Versi Sebelum Diubah AI (Before)`
    );

    showToast(
      `${targetClause.number} (${targetClause.title}) berhasil dikembalikan ke isi sebelum diubah oleh AI (Before).`
    );
  };

  // Update active document and optionally record a new version snapshot
  const updateActiveDocument = (
    updater: (doc: LegalDocument) => LegalDocument,
    versionSummary?: string
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDoc.id) return doc;
        const updated = updater(doc);
        if (!versionSummary) return updated;

        const existingVersions = updated.versions || [];
        const nextMinor = existingVersions.length;
        const nowTime = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const newVersion: LegalDocumentVersion = {
          id: `ver-${Date.now()}`,
          versionLabel: `v1.${nextMinor}`,
          timestamp: `29 Sep 2026, ${nowTime} WIB`,
          summary: versionSummary,
          snapshot: createSnapshotFromDoc(updated),
        };

        return {
          ...updated,
          versions: [newVersion, ...existingVersions],
        };
      })
    );
  };

  // Save a manual version snapshot
  const handleSaveManualSnapshot = (note: string) => {
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Versi disimpan (${note})`,
      }),
      note
    );
    showToast(`Snapshot versi baru ("${note}") berhasil disimpan.`);
  };

  // Revert active document to a selected historical version
  const handleRevertToVersion = (targetVersion: LegalDocumentVersion) => {
    updateActiveDocument(
      (doc) => ({
        ...doc,
        ...targetVersion.snapshot,
        partyOne: { ...targetVersion.snapshot.partyOne },
        partyTwo: { ...targetVersion.snapshot.partyTwo },
        recitals: [...targetVersion.snapshot.recitals],
        clauses: targetVersion.snapshot.clauses.map((c) => ({
          ...c,
          content: [...c.content],
        })),
        variables: targetVersion.snapshot.variables.map((v) => ({ ...v })),
        auditNotes: targetVersion.snapshot.auditNotes.map((n) => ({ ...n })),
        updatedAt: `Dikembalikan ke ${targetVersion.versionLabel}`,
      }),
      `Revert ke ${targetVersion.versionLabel} (${targetVersion.summary})`
    );
    setViewMode('structured');
    showToast(`Dokumen berhasil dikembalikan (revert) ke ${targetVersion.versionLabel}.`);
  };

  // Open side-by-side comparison of two versions
  const handleOpenCompareVersions = (leftId: string, rightId: string) => {
    setCompareLeftVersionId(leftId);
    setCompareRightVersionId(rightId);
    setViewMode('compare');
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Export to PDF via jsPDF (with optional Diagonal Watermark on all pages)
  const handleExportPdf = () => {
    try {
      const wmClean = (pdfWatermarkText || 'DRAFT').trim().toUpperCase();
      exportToPdf(activeDoc, {
        watermarkEnabled: pdfWatermarkEnabled,
        watermarkText: wmClean,
      });
      showToast(
        pdfWatermarkEnabled
          ? `Dokumen "${activeDoc.title}" berhasil diunduh ke PDF dengan watermark diagonal "${wmClean}" di setiap halaman.`
          : `Dokumen "${activeDoc.title}" berhasil diunduh dalam format PDF profesional.`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengekspor dokumen ke PDF.');
    }
  };

  // Automatically Sort Clauses by Category, Risk Level, or Alphabetical Title
  const handleSortClauses = (
    sortMode: 'category' | 'risk_desc' | 'risk_asc' | 'title_asc' | 'title_desc'
  ) => {
    if (!sortMode) return;
    setActiveClauseSort(sortMode);

    const riskPriorityMap: Record<string, number> = {
      kritis: 3,
      perhatian: 2,
      standar: 1,
    };

    const categoryOrder: ClauseCategoryType[] = [
      'Financial',
      'Operational',
      'Liability',
      'Intellectual Property',
      'Confidentiality',
      'Termination',
      'Governance & Dispute',
    ];

    const labelMap: Record<typeof sortMode, string> = {
      category: 'Kategori Klausul (Category)',
      risk_desc: 'Tingkat Risiko (Kritis → Standar)',
      risk_asc: 'Tingkat Risiko (Standar → Kritis)',
      title_asc: 'Judul Alfabetis (A → Z)',
      title_desc: 'Judul Alfabetis (Z → A)',
    };

    updateActiveDocument(
      (doc) => {
        const cloned = [...doc.clauses];
        cloned.sort((a, b) => {
          if (sortMode === 'category') {
            const catA = categorizeClauseWithLabels(a).category;
            const catB = categorizeClauseWithLabels(b).category;
            const idxA = categoryOrder.indexOf(catA);
            const idxB = categoryOrder.indexOf(catB);
            if (idxA !== idxB) return idxA - idxB;
            return a.title.localeCompare(b.title, 'id');
          }
          if (sortMode === 'risk_desc') {
            const rA = riskPriorityMap[(a.riskLevel || '').toLowerCase()] || 0;
            const rB = riskPriorityMap[(b.riskLevel || '').toLowerCase()] || 0;
            if (rB !== rA) return rB - rA;
            return a.title.localeCompare(b.title, 'id');
          }
          if (sortMode === 'risk_asc') {
            const rA = riskPriorityMap[(a.riskLevel || '').toLowerCase()] || 0;
            const rB = riskPriorityMap[(b.riskLevel || '').toLowerCase()] || 0;
            if (rA !== rB) return rA - rB;
            return a.title.localeCompare(b.title, 'id');
          }
          if (sortMode === 'title_asc') {
            return a.title.localeCompare(b.title, 'id');
          }
          return b.title.localeCompare(a.title, 'id');
        });

        const renumbered = cloned.map((c, idx) => ({
          ...c,
          number: `Pasal ${idx + 1}`,
        }));

        return {
          ...doc,
          updatedAt: `Urutan pasal diurutkan otomatis (${labelMap[sortMode]})`,
          clauses: renumbered,
        };
      },
      `Sort Clauses: ${labelMap[sortMode]}`
    );

    showToast(
      `Seluruh ${activeDoc.clauses.length} pasal berhasil diurutkan ulang berdasarkan ${labelMap[sortMode]} dan dinomori ulang.`
    );
  };

  // Export Audit Hukum findings, Pie Chart & Recommendations as a separate Legal Compliance Summary PDF (with customizable clause selection)
  const handleExportAuditSummaryPdf = () => {
    try {
      const validIds = activeDoc.clauses
        .filter((c) => selectedAuditClauseIds.includes(c.id))
        .map((c) => c.id);
      const effectiveIds =
        validIds.length > 0 ? validIds : activeDoc.clauses.map((c) => c.id);

      exportAuditSummaryToPdf(activeDoc, {
        selectedClauseIds: effectiveIds,
        includeClauseContent: includeClauseContentInAuditPdf,
      });
      showToast(
        `Laporan "Legal Compliance Summary" (${effectiveIds.length} dari ${activeDoc.clauses.length} pasal terpilih) untuk "${activeDoc.title}" berhasil diunduh sebagai PDF.`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengekspor Legal Compliance Summary PDF.');
    }
  };

  // Audit Evolution Log Handlers (Save Custom Client Justification, Add Manual Event, Export PDF)
  const handleSaveCustomJustification = (eventId: string, justificationText: string) => {
    updateActiveDocument((doc) => ({
      ...doc,
      customAuditJustifications: {
        ...(doc.customAuditJustifications || {}),
        [eventId]: justificationText,
      },
    }));
  };

  const handleAddManualAuditEvent = (newEvent: AuditEvolutionEvent) => {
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Catatan evolusi audit ditambahkan pada ${newEvent.clauseNumber}`,
        manualAuditEvents: [newEvent, ...(doc.manualAuditEvents || [])],
      }),
      `Justifikasi Klien & Evolusi Risiko pada ${newEvent.clauseNumber}: ${newEvent.previousRiskLevel || 'Standar'} → ${newEvent.newRiskLevel}`
    );
  };

  const handleExportAuditEvolutionPdf = (events: AuditEvolutionEvent[]) => {
    try {
      exportAuditEvolutionToPdf(activeDoc, events);
      showToast(
        `Laporan "Audit Evolution Log & Justifikasi Hukum Klien" (${events.length} catatan evolusi) berhasil diunduh sebagai PDF.`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengekspor PDF Audit Evolution Log.');
    }
  };

  // Send message in AI Legal Consultant Chat
  const handleSendChatMessage = async (customQuestion?: string) => {
    const questionText = (customQuestion ?? chatInput).trim();
    if (!questionText || isChatLoading) return;

    const timeNow = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: LegalChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text: questionText,
      focusedClause: focusedChatClause,
      timestamp: `${timeNow} WIB`,
    };

    // Strip any previous transient error messages so the conversation thread stays clean
    const cleanExisting = currentChatMessages.filter(
      (m) => !m.id.startsWith('msg-err-') && !m.text.startsWith('Maaf, terjadi kendala')
    );
    const updatedHistory = [...cleanExisting, userMsg];
    setChatHistories((prev) => ({
      ...prev,
      [activeDoc.id]: updatedHistory,
    }));
    if (!customQuestion) {
      setChatInput('');
    }
    setIsChatLoading(true);
    setErrorMessage(null);

    try {
      const fullDocText = formatDocumentAsPlainText(activeDoc);
      const response = await fetch('/api/legal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            text:
              m.focusedClause && m.focusedClause !== 'Seluruh Dokumen' && m.role === 'user'
                ? `[Fokus pada ${m.focusedClause}] ${m.text}`
                : m.text,
          })),
          documentContext: fullDocText,
          focusedClause: focusedChatClause,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan respons dari AI Legal Consultant.');
      }

      const replyTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const aiMsg: LegalChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Berikut telaah hukum atas pertanyaan Anda.',
        focusedClause: focusedChatClause,
        timestamp: `${replyTime} WIB`,
        sources: Array.isArray(data.sources) ? data.sources : [],
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeDoc.id]: [...updatedHistory, aiMsg],
      }));
    } catch (err: any) {
      const errMsg: LegalChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: `Maaf, terjadi kendala saat memproses pertanyaan Anda: ${
          err.message || 'Silakan coba kirim ulang pertanyaan Anda.'
        }`,
        focusedClause: focusedChatClause,
        timestamp: 'Info Sistem',
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeDoc.id]: [...updatedHistory, errMsg],
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetChatHistory = () => {
    setChatHistories((prev) => {
      const copy = { ...prev };
      delete copy[activeDoc.id];
      return copy;
    });
    showToast('Riwayat percakapan konsultasi direset.');
  };

  const handleAskConsultantAboutClause = (clause: LegalClause) => {
    const label = `${clause.number} - ${clause.title}`;
    setFocusedChatClause(label);
    setActiveNavSection('consultant');
    consultantPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 250);
  };

  // Enrich Glossary with AI contextual detection
  const handleAnalyzeGlossaryAI = async () => {
    if (!activeDoc) return;
    setIsAnalyzingGlossary(true);
    setErrorMessage(null);

    try {
      const fullText = formatDocumentAsPlainText(activeDoc);
      const response = await fetch('/api/legal/glossary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: activeDoc.title,
          documentText: fullText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menganalisis glosarium istilah hukum.');
      }

      if (Array.isArray(data)) {
        const mapped: LegalGlossaryItem[] = data.map((item: any, idx: number) => {
          const locs: string[] =
            Array.isArray(item.locations) && item.locations.length > 0
              ? item.locations
              : ['Naskah Kontrak'];
          const isCritical =
            Boolean(item.isCritical) ||
            /wanprestasi|denda|sanksi|kritis|1266|pdp|hki|kahar/i.test(
              `${item.term || ''} ${item.category || ''} ${item.definition || ''}`
            );
          const isDefinedInContract =
            Boolean(item.isDefinedInContract) ||
            locs.some((l) => /pasal 1\b|komparisi|premis/i.test(l));
          return {
            id: `ai-term-${Date.now()}-${idx}`,
            term: item.term || 'Istilah Hukum',
            category: item.category || 'Hukum Kontrak',
            legalReference: item.legalReference || 'KUHPerdata Indonesia',
            definition: item.definition || '',
            locations: locs,
            isCritical,
            isDefinedInContract,
          };
        });

        setAiGlossaryByDoc((prev) => ({
          ...prev,
          [activeDoc.id]: mapped,
        }));
        showToast(`${mapped.length} istilah hukum kontekstual berhasil dianalisis oleh AI.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menganalisis istilah hukum.');
    } finally {
      setIsAnalyzingGlossary(false);
    }
  };

  // Auto-Glossary Generator AI Agent: Pick Specific Document Sections -> Extract, Define & Cross-Reference Domain Terms -> Build Custom Document Index
  const handleRunAutoGlossaryGenerator = async () => {
    if (!activeDoc) return;
    const chosenSections = documentGlossarySections.filter((sec) =>
      selectedGlossarySectionIds.includes(sec.id)
    );
    const effectiveSections =
      chosenSections.length > 0 ? chosenSections : documentGlossarySections;

    setIsGeneratingAutoGlossaryIndex(true);
    setErrorMessage(null);

    try {
      let aiExtracted: Partial<LegalGlossaryItem>[] | undefined = undefined;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        const response = await fetch('/api/legal/auto-glossary-index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentTitle: activeDoc.title,
            selectedSections: effectiveSections,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (response.ok) {
          const parsed = await response.json();
          if (Array.isArray(parsed)) {
            aiExtracted = parsed;
          }
        }
      } catch {
        // Local domain-specific legal term & cross-reference agent handles extraction seamlessly
      }

      const customIndexItems = extractDomainGlossaryFromSections(
        activeDoc,
        effectiveSections,
        aiExtracted
      );

      const totalCrossRefs = customIndexItems.reduce(
        (acc, item) => acc + (item.crossReferences?.length || 0),
        0
      );
      const nowTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setAiGlossaryByDoc((prev) => ({
        ...prev,
        [activeDoc.id]: customIndexItems,
      }));
      setCustomIndexMetaByDoc((prev) => ({
        ...prev,
        [activeDoc.id]: {
          generatedAt: `${nowTime} WIB`,
          sectionLabels: effectiveSections.map((s) => s.shortCode),
          termCount: customIndexItems.length,
          crossRefCount: totalCrossRefs,
        },
      }));
      setGlossaryFilterMode('custom_index');
      showToast(
        `Auto-Glossary AI Agent berhasil mengekstraksi ${customIndexItems.length} istilah hukum & ${totalCrossRefs} referensi silang dari ${effectiveSections.length} bagian terpilih.`
      );
    } finally {
      setIsGeneratingAutoGlossaryIndex(false);
    }
  };

  // Insert the generated Custom Document Index as a formal Definition & Cross-Reference Clause into the active document
  const handleInsertCustomIndexAsClause = () => {
    const customEntries = detectedGlossaryTerms.filter((t) => t.isCustomIndexEntry);
    const entriesToUse =
      customEntries.length > 0 ? customEntries : detectedGlossaryTerms.slice(0, 6);
    if (entriesToUse.length === 0) return;

    const nextNum = activeDoc.clauses.length + 1;
    const contentAyat = entriesToUse.slice(0, 8).map((entry, idx) => {
      const refs =
        entry.crossReferences && entry.crossReferences.length > 0
          ? ` [Referensi Silang: ${entry.crossReferences.join('; ')}]`
          : ` [Bagian: ${entry.locations.join(', ')}]`;
      return `(${idx + 1}) "${entry.term}" (${entry.legalReference}): ${entry.definition}${refs}`;
    });

    const newClause: LegalClause = {
      id: `cl-glossary-idx-${Date.now()}`,
      number: `Pasal ${nextNum}`,
      title: 'INDEKS ISTILAH HUKUM & REFERENSI SILANG DOKUMEN',
      content: contentAyat,
      legalBasis: 'Pasal 1338 & Pasal 1342 KUHPerdata (Penafsiran & Indeks Istilah)',
      riskLevel: 'Standar',
      clauseCategory: 'Governance & Dispute',
      clauseTags: ['Indeks Glosarium AI', 'Referensi Silang'],
    };

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Pasal Indeks Istilah & Referensi Silang ditambahkan`,
        clauses: [...doc.clauses, newClause],
      }),
      `Sisipkan Custom Document Index (${entriesToUse.length} Istilah Hukum & Referensi Silang) sebagai Pasal ${nextNum}`
    );

    showToast(
      `Custom Document Index (${contentAyat.length} definisi & referensi silang) berhasil disisipkan sebagai Pasal ${nextNum}.`
    );
  };

  // Record a regulation search from 'Cari Pasal & UU' or Heatmap and sync with D3 Regulatory Compliance Heatmap
  const handleRecordRegulationSearch = (query: string, answerSummary?: string) => {
    const updated = recordRegulationSearchToHistory(query, answerSummary);
    setRegulationSearchHistory(updated);
  };

  // Apply 1-click regulatory compliance update (direct fill, full replace, or mark for review) from D3 Regulatory Compliance Heatmap to a target clause
  const handleApplyRegulatoryUpdateToClause = (
    clauseId: string,
    regReference: string,
    recommendedAyat: string,
    mode: RegulatoryClauseApplyMode = 'fill_direct',
    regId?: string,
    regShortLabel?: string
  ) => {
    const targetClause = activeDoc.clauses.find((c) => c.id === clauseId);
    if (!targetClause) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (mode === 'mark_for_review') {
      updateActiveDocument(
        (doc) => ({
          ...doc,
          updatedAt: `Tanda cek regulasi (${regReference}) dipasang pada ${targetClause.number}`,
          clauses: doc.clauses.map((cl) =>
            cl.id === clauseId
              ? {
                  ...cl,
                  regulatoryUpdateMarker: {
                    status: 'needs_review',
                    regReference,
                    regShortLabel: regShortLabel || regReference,
                    recommendedAyat,
                    updatedAtLabel: `Ditandai untuk dicek (${nowTime} WIB)`,
                  },
                }
              : cl
          ),
        }),
        `Tandai ${targetClause.number} untuk Dicek Sesuai ${regReference}`
      );

      showToast(
        `${targetClause.number} (${targetClause.title}) telah diberi tanda cek regulasi (${regReference}). Anda dapat mengecek dan langsung mengisi/mengganti isinya di Editor Naskah.`
      );
      if (viewMode === 'compare') setViewMode('structured');
      setTimeout(() => {
        const el = document.getElementById(`clause-${clauseId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      return;
    }

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Pembaruan kepatuhan ${regReference} langsung pada ${targetClause.number}`,
        clauses: doc.clauses.map((cl) => {
          if (cl.id !== clauseId) return cl;
          const existingApplied = Array.from(
            new Set([
              ...(cl.appliedRegulations || []),
              regReference,
              ...(regId ? [regId] : []),
              ...(regShortLabel ? [regShortLabel] : []),
            ])
          );
          const updatedBasis = cl.legalBasis.toLowerCase().includes(regReference.toLowerCase())
            ? cl.legalBasis
            : `${cl.legalBasis} · ${regReference}`;

          const alreadyContainsAyat = cl.content.some((p) =>
            p.toLowerCase().includes(recommendedAyat.slice(0, 32).toLowerCase())
          );

          let nextContent: string[];
          if (mode === 'replace_clause') {
            const firstAyatCore =
              cl.content[0]?.replace(/^\(\d+\)\s*/, '') ||
              `Pelaksanaan ${cl.title.toLowerCase()} oleh Para Pihak wajib tunduk pada ketentuan hukum yang berlaku.`;
            nextContent = [
              `(1) ${firstAyatCore}`,
              `(2) ${recommendedAyat}`,
            ];
          } else if (alreadyContainsAyat) {
            nextContent = [...cl.content];
          } else {
            const nextAyatNum = cl.content.length + 1;
            nextContent = [...cl.content, `(${nextAyatNum}) ${recommendedAyat}`];
          }

          const prevHistory = cl.aiHistory || [];
          const newHistoryEntry: AiClauseHistoryEntry = {
            id: `hist-reg-${cl.id}-${Date.now()}`,
            clauseId: cl.id,
            clauseNumber: cl.number,
            source: 'AI Clause Revision',
            actionLabel:
              mode === 'replace_clause'
                ? `Compliance Heatmap AI · Ganti Isi Pasal Sesuai ${regReference}`
                : `Compliance Heatmap AI · Isi Langsung ke Pasal Sesuai ${regReference}`,
            timestamp: `Baru saja (${nowTime} WIB)`,
            snapshot: {
              title: cl.title,
              content: nextContent,
              legalBasis: updatedBasis,
              riskLevel: cl.riskLevel,
            },
          };

          const { record: aiChangeRec, changedPartLabels } = buildAiClauseChangeRecord({
            clause: cl,
            nextTitle: cl.title,
            nextLegalBasis: updatedBasis,
            nextContent,
            sourceLabel:
              mode === 'replace_clause'
                ? `AI Agent Compliance Heatmap · Ganti Isi (${regShortLabel || regReference})`
                : `AI Agent Compliance Heatmap · Isi Ayat Baru (${regShortLabel || regReference})`,
            changeMode: mode === 'replace_clause' ? 'clause_replaced' : 'ayat_added',
            timestampLabel: `${nowTime} WIB`,
          });

          return {
            ...cl,
            legalBasis: updatedBasis,
            content: nextContent,
            appliedRegulations: existingApplied,
            aiChangeRecord: aiChangeRec,
            regulatoryUpdateMarker: {
              status: mode === 'replace_clause' ? 'applied_replace' : 'applied_direct',
              regReference,
              regShortLabel: regShortLabel || regReference,
              recommendedAyat,
              updatedAtLabel:
                mode === 'replace_clause'
                  ? `Isi pasal diganti sesuai AI (${nowTime} WIB)`
                  : `Diisi langsung ke pasal tujuan (${nowTime} WIB)`,
              beforeSnapshot: aiChangeRec.beforeSnapshot,
              afterSnapshot: aiChangeRec.afterSnapshot,
              changedPartLabels,
            },
            aiHistory: [newHistoryEntry, ...prevHistory],
          };
        }),
      }),
      `${
        mode === 'replace_clause' ? 'Ganti Isi' : 'Isi Langsung'
      } ${targetClause.number} Sesuai ${regReference}`
    );

    showToast(
      `${targetClause.number} (${targetClause.title}) langsung ${
        mode === 'replace_clause' ? 'diganti isinya' : 'diisi'
      } sesuai ${regReference} & diberi tanda selesai pada pasal tujuan (Status Heatmap: PATUH).`
    );

    if (viewMode === 'compare') setViewMode('structured');
    setTimeout(() => {
      const el = document.getElementById(`clause-${clauseId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  // Bulk apply or bulk mark all regulatory updates across all affected target clauses in 1 click
  const handleApplyAllRegulatoryUpdates = (
    updates: BulkRegulatoryUpdateItem[],
    mode: RegulatoryClauseApplyMode = 'fill_direct'
  ) => {
    if (!updates || updates.length === 0) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatesByClause = new Map<string, BulkRegulatoryUpdateItem[]>();
    updates.forEach((u) => {
      const list = updatesByClause.get(u.clauseId) || [];
      list.push(u);
      updatesByClause.set(u.clauseId, list);
    });

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt:
          mode === 'mark_for_review'
            ? `${updatesByClause.size} pasal ditandai untuk pengecekan regulasi`
            : `${updatesByClause.size} pasal langsung diisi sesuai rekomendasi AI Agent (${updates.length} titik regulasi)`,
        clauses: doc.clauses.map((cl) => {
          const clauseUpdates = updatesByClause.get(cl.id);
          if (!clauseUpdates || clauseUpdates.length === 0) return cl;

          const regRefsJoined = Array.from(
            new Set(clauseUpdates.map((u) => u.regShortLabel || u.regReference))
          ).join(', ');
          const firstUpdate = clauseUpdates[0];

          if (mode === 'mark_for_review') {
            return {
              ...cl,
              regulatoryUpdateMarker: {
                status: 'needs_review',
                regReference: regRefsJoined,
                regShortLabel: firstUpdate.regShortLabel,
                recommendedAyat: clauseUpdates
                  .map((u) => u.recommendedAyat)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .join(' '),
                updatedAtLabel: `Perlu dicek (${clauseUpdates.length} Regulasi · ${nowTime} WIB)`,
              },
            };
          }

          let nextContent = [...cl.content];
          let nextBasis = cl.legalBasis;
          const nextApplied = new Set<string>(cl.appliedRegulations || []);

          clauseUpdates.forEach((u) => {
            nextApplied.add(u.regId);
            nextApplied.add(u.regReference);
            nextApplied.add(u.regShortLabel);
            if (!nextBasis.toLowerCase().includes(u.regReference.toLowerCase())) {
              nextBasis = `${nextBasis} · ${u.regReference}`;
            }
            if (mode === 'replace_clause') {
              const firstAyatCore =
                cl.content[0]?.replace(/^\(\d+\)\s*/, '') ||
                `Pelaksanaan ${cl.title.toLowerCase()} oleh Para Pihak wajib tunduk pada ketentuan hukum yang berlaku.`;
              nextContent = [`(1) ${firstAyatCore}`, `(2) ${u.recommendedAyat}`];
            } else {
              const alreadyInContent = nextContent.some((p) =>
                p.toLowerCase().includes(u.recommendedAyat.slice(0, 32).toLowerCase())
              );
              if (!alreadyInContent) {
                nextContent.push(`(${nextContent.length + 1}) ${u.recommendedAyat}`);
              }
            }
          });

          const { record: aiChangeRec, changedPartLabels } = buildAiClauseChangeRecord({
            clause: cl,
            nextTitle: cl.title,
            nextLegalBasis: nextBasis,
            nextContent,
            sourceLabel: `AI Agent Compliance Heatmap (${regRefsJoined})`,
            changeMode: mode === 'replace_clause' ? 'clause_replaced' : 'ayat_added',
            timestampLabel: `${nowTime} WIB`,
          });

          return {
            ...cl,
            legalBasis: nextBasis,
            content: nextContent,
            appliedRegulations: Array.from(nextApplied),
            aiChangeRecord: aiChangeRec,
            regulatoryUpdateMarker: {
              status: mode === 'replace_clause' ? 'applied_replace' : 'applied_direct',
              regReference: regRefsJoined,
              regShortLabel: firstUpdate.regShortLabel,
              recommendedAyat: firstUpdate.recommendedAyat,
              updatedAtLabel: `Diisi otomatis oleh AI Agent (${clauseUpdates.length} UU · ${nowTime} WIB)`,
              beforeSnapshot: aiChangeRec.beforeSnapshot,
              afterSnapshot: aiChangeRec.afterSnapshot,
              changedPartLabels,
            },
          };
        }),
      }),
      mode === 'mark_for_review'
        ? `Tandai ${updatesByClause.size} Pasal untuk Dicek (Compliance Heatmap)`
        : `Isi Otomatis ${updatesByClause.size} Pasal Tujuan Sesuai ${updates.length} Regulasi AI`
    );

    showToast(
      mode === 'mark_for_review'
        ? `Tanda cek berhasil dipasang pada ${updatesByClause.size} pasal tujuan di Editor Naskah.`
        : `Seluruh ${updatesByClause.size} pasal tujuan langsung diisi sesuai ${updates.length} titik regulasi AI Agent — Status Heatmap kini 100% PATUH!`
    );
  };

  const handleClearClauseRegulatoryMarker = (clauseId: string) => {
    updateActiveDocument((doc) => ({
      ...doc,
      clauses: doc.clauses.map((cl) =>
        cl.id === clauseId
          ? { ...cl, regulatoryUpdateMarker: undefined, aiChangeRecord: undefined }
          : cl
      ),
    }));
  };

  // Jump to a specific Pasal when clicking a location tag in Glosarium Istilah
  const handleJumpToLocation = (loc: string) => {
    if (viewMode === 'compare') {
      setViewMode('structured');
    }
    setTimeout(() => {
      const matchClause = activeDoc.clauses.find(
        (c) => c.number.toLowerCase() === loc.toLowerCase()
      );
      if (matchClause) {
        const el = document.getElementById(`clause-${matchClause.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Apply selected Legal Protection Stance (Posisi Proteksi) & Language directly to the currently active document's clauses
  const handleApplyProtectionStanceToActiveDoc = (
    nextStance: string,
    nextLanguage?: string,
    silentToast?: boolean
  ) => {
    const effectiveLanguage = nextLanguage ?? language;
    setStance(nextStance);
    if (nextLanguage) {
      setLanguage(nextLanguage);
    }

    const profile = getLegalStanceProfile(nextStance);
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateActiveDocument(
      (doc) => {
        const partyOneLabel = `${doc.partyOne?.role || 'PIHAK PERTAMA'} (${
          doc.partyOne?.name || 'Pihak Pertama'
        })`;
        const partyTwoLabel = `${doc.partyTwo?.role || 'PIHAK KEDUA'} (${
          doc.partyTwo?.name || 'Pihak Kedua'
        })`;

        const updatedClauses = doc.clauses.map((cl, idx) => {
          const adapted = adaptClauseByProtectionStance({
            title: cl.title,
            baselineContent: cl.content,
            baselineLegalBasis: cl.legalBasis,
            baselineRiskLevel: cl.riskLevel,
            clauseIndex: idx,
            stance: nextStance,
            partyOneLabel,
            partyTwoLabel,
            language: effectiveLanguage,
          });

          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: cl,
            nextTitle: cl.title,
            nextLegalBasis: adapted.legalBasis,
            nextContent: adapted.content,
            sourceLabel: `Posisi Proteksi Hukum: ${profile.badgeText} (${profile.favoredPartyLabel})`,
            changeMode:
              adapted.content.length > cl.content.length ? 'ayat_added' : 'content_modified',
            timestampLabel: `${nowTime} WIB`,
          });

          const newHistoryEntry: AiClauseHistoryEntry = {
            id: `hist-stance-${cl.id}-${Date.now()}-${idx}`,
            clauseId: cl.id,
            clauseNumber: cl.number,
            source: 'AI Clause Revision',
            actionLabel: `Posisi Proteksi: ${profile.badgeText} (${profile.shortLabel})`,
            timestamp: `Baru saja (${nowTime} WIB)`,
            snapshot: {
              title: cl.title,
              content: adapted.content,
              legalBasis: adapted.legalBasis,
              riskLevel: adapted.riskLevel,
            },
          };

          return {
            ...cl,
            content: adapted.content,
            legalBasis: adapted.legalBasis,
            riskLevel: adapted.riskLevel,
            aiChangeRecord: aiChangeRec,
            aiHistory: [newHistoryEntry, ...(cl.aiHistory || [])],
          };
        });

        const cleanSubtitle = (doc.subtitle || 'Dokumen Hukum Resmi')
          .replace(/\s*\[Posisi Hukum:[^\]]+\]/gi, '')
          .trim();

        const stanceAuditNote = {
          title: `Posisi Proteksi Aktif: ${profile.favoredPartyLabel} (${profile.badgeText})`,
          severity: (profile.mode === 'balanced' ? 'Aman' : 'Krusial') as
            | 'Aman'
            | 'Perlu Verifikasi'
            | 'Krusial',
          recommendation: `${profile.strategyDescription} Instrumen utama: ${profile.keyMechanisms.join(
            ' · '
          )}.`,
        };

        const filteredAuditNotes = (doc.auditNotes || []).filter(
          (n) => !n.title.startsWith('Posisi Proteksi Aktif:')
        );

        return {
          ...doc,
          subtitle: `${cleanSubtitle} [Posisi Hukum: ${profile.badgeText}]`,
          updatedAt: `Posisi Proteksi diterapkan: ${profile.badgeText} (${nowTime} WIB)`,
          clauses: updatedClauses,
          auditNotes: [stanceAuditNote, ...filteredAuditNotes],
        };
      },
      `Terapkan Posisi Proteksi: ${profile.badgeText} (${profile.favoredPartyLabel})`
    );

    if (!silentToast) {
      showToast(
        `Posisi Proteksi "${profile.shortLabel}" aktif — Seluruh ${activeDoc.clauses.length} pasal dalam "${activeDoc.title}" telah disesuaikan (${profile.favoredPartyLabel}) lengkap dengan tanda Before vs After.`
      );
    }
  };

  // 1. Generate Complete Document from 1 Command (Universal & Dynamic across ANY Document Type & Criteria)
  const handleGenerateDraft = async (
    customPrompt?: string,
    customStance?: string,
    customCriteriaOverride?: string
  ) => {
    const targetPrompt = (customPrompt ?? commandInput).trim();
    const targetStance = customStance ?? stance;
    const effectiveCustomCriteria = (
      customCriteriaOverride ?? universalCustomCriteria
    ).trim();

    if (!targetPrompt) {
      setErrorMessage(
        'Masukkan 1 perintah deskripsi dokumen, kontrak, surat, atau berkas apa saja yang ingin Anda buat.'
      );
      promptRef.current?.focus();
      return;
    }

    setErrorMessage(null);

    // Check if the user command is requesting an official Corporate SK / ST / Aanmaning / BPSK / LAPS / Mediasi / Gugatan Sederhana / Gugatan / PKPU
    const officialSkStDoc = tryBuildOfficialSkStFromPrompt(targetPrompt);
    if (officialSkStDoc) {
      const stanceProfile = getLegalStanceProfile(targetStance);
      const nowTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const partyOneLabel = `${officialSkStDoc.partyOne?.role || 'PIHAK PERTAMA'} (${
        officialSkStDoc.partyOne?.name || 'Pihak Pertama'
      })`;
      const partyTwoLabel = `${officialSkStDoc.partyTwo?.role || 'PIHAK KEDUA'} (${
        officialSkStDoc.partyTwo?.name || 'Pihak Kedua'
      })`;

      const adaptedOfficialClauses: LegalClause[] = officialSkStDoc.clauses.map((cl, idx) => {
        if (stanceProfile.mode === 'balanced') return cl;
        const adapted = adaptClauseByProtectionStance({
          title: cl.title,
          baselineContent: cl.content,
          baselineLegalBasis: cl.legalBasis,
          baselineRiskLevel: cl.riskLevel,
          clauseIndex: idx,
          stance: targetStance,
          partyOneLabel,
          partyTwoLabel,
          language,
        });
        const { record: aiChangeRec } = buildAiClauseChangeRecord({
          clause: cl,
          nextTitle: cl.title,
          nextLegalBasis: adapted.legalBasis,
          nextContent: adapted.content,
          sourceLabel: `Posisi Proteksi Hukum: ${stanceProfile.badgeText} (${stanceProfile.favoredPartyLabel})`,
          changeMode:
            adapted.content.length > cl.content.length ? 'ayat_added' : 'content_modified',
          timestampLabel: `${nowTime} WIB`,
        });
        return {
          ...cl,
          content: adapted.content,
          legalBasis: adapted.legalBasis,
          riskLevel: adapted.riskLevel,
          aiChangeRecord: aiChangeRec,
        };
      });

      const docWithStance: LegalDocument = {
        ...officialSkStDoc,
        subtitle:
          stanceProfile.mode === 'balanced'
            ? officialSkStDoc.subtitle
            : `${officialSkStDoc.subtitle} [Posisi Hukum: ${stanceProfile.badgeText}]`,
        clauses: adaptedOfficialClauses,
      };

      const enrichedSkSt = ensureInitialVersions([docWithStance])[0];
      setDocuments((prev) => [enrichedSkSt, ...prev]);
      setActiveDocId(enrichedSkSt.id);
      setViewMode('structured');
      setActiveNavSection('editor');
      showToast(
        `Naskah "${enrichedSkSt.title}" (${enrichedSkSt.subtitle}) berhasil disusun sesuai Standar Template SK & ST Korporasi.`
      );
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }

    setIsDrafting(true);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/legal/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: targetPrompt,
            stance: targetStance,
            language,
            criteria: {
              domainCategory: universalDomainCategory,
              structureStyle: universalStructureStyle,
              customCriteria: effectiveCustomCriteria,
            },
          }),
        });

        const parsed = await response.json();
        if (response.ok && parsed && parsed.title) {
          data = parsed;
        } else {
          data = buildUniversalDynamicDraftFromPrompt({
            prompt: targetPrompt,
            stance: targetStance,
            language,
            criteria: {
              domainCategory: universalDomainCategory,
              structureStyle: universalStructureStyle,
              customCriteria: effectiveCustomCriteria,
            },
          });
        }
      } catch {
        data = buildUniversalDynamicDraftFromPrompt({
          prompt: targetPrompt,
          stance: targetStance,
          language,
          criteria: {
            domainCategory: universalDomainCategory,
            structureStyle: universalStructureStyle,
            customCriteria: effectiveCustomCriteria,
          },
        });
      }

      const nowStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const baseDoc: LegalDocument = {
        id: `doc-${Date.now()}`,
        updatedAt: `${nowStr}, Baru saja dibuat`,
        promptUsed: effectiveCustomCriteria
          ? `${targetPrompt} [Kriteria: ${effectiveCustomCriteria}]`
          : targetPrompt,
        title: data.title || 'DOKUMEN KESEPAKATAN & PERJANJIAN',
        subtitle: data.subtitle || 'Dokumen Resmi Dinamis',
        documentNumber: data.documentNumber || `No. 001/DOC/X/2026`,
        category: data.category || universalDomainCategory,
        jurisdiction: data.jurisdiction || 'Hukum Republik Indonesia',
        effectiveDate: data.effectiveDate || nowStr,
        openingText: data.openingText || '',
        partyOne: data.partyOne || {
          name: '[Nama Pihak Pertama]',
          role: 'PIHAK PERTAMA',
          representative: '[Nama Penandatangan Pihak Pertama]',
          address: '[Alamat Lengkap Pihak Pertama]',
          description: 'Bertindak untuk dan atas nama Pihak Pertama.',
        },
        partyTwo: data.partyTwo || {
          name: '[Nama Pihak Kedua]',
          role: 'PIHAK KEDUA',
          representative: '[Nama Penandatangan Pihak Kedua]',
          address: '[Alamat Lengkap Pihak Kedua]',
          description: 'Bertindak untuk dan atas nama Pihak Kedua.',
        },
        recitals: Array.isArray(data.recitals) ? data.recitals : [],
        clauses: Array.isArray(data.clauses)
          ? data.clauses.map((c: any, idx: number) => {
              const rawContent: string[] = Array.isArray(c.content)
                ? c.content
                : [String(c.content || '')];
              const clauseObj: LegalClause = {
                id: `cl-${Date.now()}-${idx}`,
                number: c.number || `Pasal ${idx + 1}`,
                title: c.title || `KETENTUAN ${idx + 1}`,
                content: rawContent,
                legalBasis: c.legalBasis || 'Pasal 1338 KUHPerdata',
                riskLevel: c.riskLevel || 'Standar',
              };
              const stanceProfile = getLegalStanceProfile(targetStance);
              if (stanceProfile.mode !== 'balanced' && rawContent.length > 1) {
                const baselineContentWithoutStance = rawContent.slice(0, -1);
                const nowTime = new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const { record: aiChangeRec } = buildAiClauseChangeRecord({
                  clause: {
                    ...clauseObj,
                    content: baselineContentWithoutStance,
                  },
                  nextTitle: clauseObj.title,
                  nextLegalBasis: clauseObj.legalBasis,
                  nextContent: rawContent,
                  sourceLabel: `Posisi Proteksi Hukum: ${stanceProfile.badgeText} (${stanceProfile.favoredPartyLabel})`,
                  changeMode: 'ayat_added',
                  timestampLabel: `${nowTime} WIB`,
                });
                return {
                  ...clauseObj,
                  aiChangeRecord: aiChangeRec,
                };
              }
              return clauseObj;
            })
          : [],
        closingText:
          data.closingText ||
          'Demikian dokumen ini dibuat dalam rangkap 2 (dua) bermaterai cukup dan masing-masing memiliki kekuatan hukum yang sama.',
        signingLocation: data.signingLocation || 'Jakarta',
        variables: Array.isArray(data.variables) ? data.variables : [],
        auditNotes: Array.isArray(data.auditNotes) ? data.auditNotes : [],
      };

      const newDocWithVersion = ensureInitialVersions([baseDoc])[0];

      setDocuments((prev) => [newDocWithVersion, ...prev]);
      setActiveDocId(newDocWithVersion.id);
      setViewMode('structured');
      setActiveNavSection('editor');
      showToast(
        `Draf "${newDocWithVersion.title}" (${newDocWithVersion.category}) berhasil disusun secara dinamis sesuai perintah & kriteria Anda.`
      );
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyusun draf dokumen.');
    } finally {
      setIsDrafting(false);
    }
  };

  // 2. Refine Specific Clause with 1 Command (auto-saves version snapshot)
  const handleRefineClause = async (clause: LegalClause) => {
    if (!clauseInstruction.trim()) return;
    setIsRefiningClause(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/legal/refine-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: activeDoc.title,
          clause,
          instruction: clauseInstruction.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal merevisi pasal.');
      }

      const nowTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      updateActiveDocument(
        (doc) => ({
          ...doc,
          updatedAt: `Revisi AI pada ${clause.number}`,
          clauses: doc.clauses.map((c) => {
            if (c.id !== clause.id) return c;
            const nextTitle = data.title || c.title;
            const nextContent = Array.isArray(data.content) ? data.content : c.content;
            const nextBasis = data.legalBasis || c.legalBasis;
            const { record: aiChangeRec } = buildAiClauseChangeRecord({
              clause: c,
              nextTitle,
              nextLegalBasis: nextBasis,
              nextContent,
              sourceLabel: `Revisi AI (${clauseInstruction.trim().slice(0, 48)})`,
              changeMode: 'content_modified',
              timestampLabel: `${nowTime} WIB`,
            });
            return {
              ...c,
              title: nextTitle,
              content: nextContent,
              legalBasis: nextBasis,
              riskLevel: data.riskLevel || c.riskLevel,
              aiChangeRecord: aiChangeRec,
            };
          }),
        }),
        `Revisi AI pada ${clause.number}: ${data.changeSummary || clauseInstruction.trim()}`
      );

      setRefiningClauseId(null);
      setClauseInstruction('');
      showToast(`${clause.number} berhasil diperbarui & versi disimpan.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal merevisi pasal.');
    } finally {
      setIsRefiningClause(false);
    }
  };

  // 3. Add a New Clause with 1 AI Command (or from Regulation Search)
  const executeAddClauseWithAI = async (instructionText: string) => {
    if (!instructionText.trim()) return;
    setIsAddingClause(true);
    setErrorMessage(null);

    try {
      const nextNum = activeDoc.clauses.length + 1;
      const response = await fetch('/api/legal/add-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: activeDoc.title,
          instruction: instructionText.trim(),
          nextNumber: nextNum,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menambahkan pasal baru.');
      }

      const nowTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const rawClauseContent = Array.isArray(data.content)
        ? data.content
        : [String(data.content || '')];
      const baseNewClause: LegalClause = {
        id: `cl-${Date.now()}`,
        number: `Pasal ${nextNum}`,
        title: data.title || 'KETENTUAN TAMBAHAN',
        content: rawClauseContent,
        legalBasis: data.legalBasis || 'Pasal 1338 KUHPerdata',
        riskLevel: data.riskLevel || 'Standar',
      };
      const { record: aiChangeRec } = buildAiClauseChangeRecord({
        clause: {
          ...baseNewClause,
          content: [],
        },
        nextTitle: baseNewClause.title,
        nextLegalBasis: baseNewClause.legalBasis,
        nextContent: rawClauseContent,
        sourceLabel: `AI Agent · Tambah Pasal Baru (${instructionText.trim().slice(0, 42)})`,
        changeMode: 'new_clause_added',
        timestampLabel: `${nowTime} WIB`,
      });
      const newClause: LegalClause = {
        ...baseNewClause,
        aiChangeRecord: aiChangeRec,
      };

      updateActiveDocument(
        (doc) => ({
          ...doc,
          updatedAt: `Penambahan ${newClause.number}`,
          clauses: [...doc.clauses, newClause],
        }),
        `Tambah ${newClause.number} (${newClause.title})`
      );

      setNewClausePrompt('');
      showToast(`${newClause.number} (${newClause.title}) ditambahkan & versi disimpan.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menambahkan pasal baru.');
    } finally {
      setIsAddingClause(false);
    }
  };

  const handleAddClauseWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAddClauseWithAI(newClausePrompt);
  };

  // 4. Global Whole-Document Transformation with 1 Command
  const handleGlobalTransform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalRevisionPrompt.trim()) return;

    setIsTransformingDoc(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/legal/transform-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDocument: activeDoc,
          instruction: globalRevisionPrompt.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui dokumen.');
      }

      const summaryNote = `Revisi Global: ${globalRevisionPrompt.trim().slice(0, 45)}`;
      updateActiveDocument(
        (doc) => ({
          ...doc,
          updatedAt: 'Diperbarui secara menyeluruh oleh AI',
          title: data.title || doc.title,
          subtitle: data.subtitle || doc.subtitle,
          jurisdiction: data.jurisdiction || doc.jurisdiction,
          openingText: data.openingText || doc.openingText,
          partyOne: data.partyOne || doc.partyOne,
          partyTwo: data.partyTwo || doc.partyTwo,
          recitals: Array.isArray(data.recitals) ? data.recitals : doc.recitals,
          clauses: Array.isArray(data.clauses)
            ? data.clauses.map((c: any, idx: number) => {
                const prevClause = doc.clauses[idx];
                const nextTitle = c.title || prevClause?.title || `KETENTUAN ${idx + 1}`;
                const nextContent = Array.isArray(c.content)
                  ? c.content
                  : [String(c.content || '')];
                const nextBasis =
                  c.legalBasis || prevClause?.legalBasis || 'Pasal 1338 KUHPerdata';
                const nowTime = new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const baselineClause: LegalClause = prevClause || {
                  id: `cl-${Date.now()}-${idx}`,
                  number: c.number || `Pasal ${idx + 1}`,
                  title: nextTitle,
                  content: [],
                  legalBasis: nextBasis,
                  riskLevel: c.riskLevel || 'Standar',
                };
                const { record: aiChangeRec } = buildAiClauseChangeRecord({
                  clause: baselineClause,
                  nextTitle,
                  nextLegalBasis: nextBasis,
                  nextContent,
                  sourceLabel: `Revisi Global AI (${globalRevisionPrompt.trim().slice(0, 38)})`,
                  changeMode: prevClause ? 'content_modified' : 'new_clause_added',
                  timestampLabel: `${nowTime} WIB`,
                });
                return {
                  ...baselineClause,
                  id: prevClause?.id || `cl-${Date.now()}-${idx}`,
                  number: c.number || `Pasal ${idx + 1}`,
                  title: nextTitle,
                  content: nextContent,
                  legalBasis: nextBasis,
                  riskLevel: c.riskLevel || prevClause?.riskLevel || 'Standar',
                  aiChangeRecord: aiChangeRec,
                };
              })
            : doc.clauses,
          closingText: data.closingText || doc.closingText,
          auditNotes: Array.isArray(data.auditNotes) ? data.auditNotes : doc.auditNotes,
        }),
        summaryNote
      );

      setGlobalRevisionPrompt('');
      showToast('Seluruh naskah dokumen berhasil disesuaikan & versi baru disimpan.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menerapkan perubahan global.');
    } finally {
      setIsTransformingDoc(false);
    }
  };

  // Insert a clause from the authoritative library
  const handleInsertLibraryClause = (snippet: ClauseLibraryItem) => {
    const nextNum = activeDoc.clauses.length + 1;
    const newClause: LegalClause = {
      id: `cl-lib-${Date.now()}`,
      number: `Pasal ${nextNum}`,
      title: snippet.title,
      content: [...snippet.content],
      legalBasis: snippet.legalBasis,
      riskLevel: snippet.riskLevel,
    };

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Sisipan Pustaka Klausul (Pasal ${nextNum})`,
        clauses: [...doc.clauses, newClause],
      }),
      `Sisipkan Klausul Baku: ${snippet.title}`
    );

    showToast(`Klausul "${snippet.title}" disisipkan sebagai Pasal ${nextNum}.`);
  };

  // Insert a proactive contextual clause suggestion directly in Editor Naskah
  const handleInsertContextualSuggestion = (suggestion: ContextualClauseSuggestion) => {
    const nextNum = activeDoc.clauses.length + 1;
    const newClause: LegalClause = {
      id: `cl-ctx-${Date.now()}`,
      number: `Pasal ${nextNum}`,
      title: suggestion.title,
      content: [...suggestion.content],
      legalBasis: suggestion.legalBasis,
      riskLevel: suggestion.riskLevel,
    };

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Sisipan Kontekstual (Pasal ${nextNum})`,
        clauses: [...doc.clauses, newClause],
      }),
      `Sisipan Kontekstual: ${suggestion.title}`
    );

    showToast(
      `Klausul kontekstual "${suggestion.title}" berhasil disisipkan sebagai Pasal ${nextNum}.`
    );
  };

  // Re-number clauses cleanly after reorder or deletion
  const renumberClauses = (clauses: LegalClause[]): LegalClause[] =>
    clauses.map((c, idx) => ({
      ...c,
      number: `Pasal ${idx + 1}`,
    }));

  // Bulk Formatting Handler (1-click standardization of font, numbering hierarchy, and indentation + Smart Formatting History tracking)
  const handleApplyBulkFormat = (configToApply: BulkFormatConfig = bulkFormatConfig) => {
    const labelMap: Record<string, string> = {
      decimal_hierarchy: 'Level Desimal (1, 1.1, a.)',
      ayat_parentheses: 'Notariil Standar ((1), (2), a.)',
      roman_parentheses: 'Romawi (PASAL I, (1), a.)',
      numeric_dot: 'Angka Titik (1., 2., a.)',
    };

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const meta = formatConfigSummaryLabel(configToApply);

    updateActiveDocument(
      (doc) => {
        const formatted = applyBulkFormattingToDocument(doc, configToApply);
        const newHistoryEntry: SmartFormattingHistoryEntry = {
          id: `fmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: `Format: ${labelMap[configToApply.numberingStyle] || configToApply.numberingStyle}`,
          timestamp: `Baru saja (${nowTime} WIB)`,
          numberingStyle: configToApply.numberingStyle,
          fontStyle: configToApply.fontStyle,
          indentation: configToApply.indentation,
          uppercaseTitles: configToApply.uppercaseTitles,
          clausesSnapshot: formatted.clauses.map((c) => ({
            ...c,
            content: [...c.content],
          })),
          summaryText: `${meta.numberingBadge} · ${meta.fontBadge} · ${meta.indentBadge} · ${meta.caseBadge}`,
        };

        const existingHistory = doc.smartFormatHistory || [];
        return {
          ...formatted,
          updatedAt: `Format Massal: ${labelMap[configToApply.numberingStyle] || configToApply.numberingStyle}`,
          smartFormatHistory: [newHistoryEntry, ...existingHistory].slice(0, 12),
        };
      },
      `Format Massal: ${labelMap[configToApply.numberingStyle] || configToApply.numberingStyle}`
    );

    showToast(
      `Format massal (${labelMap[configToApply.numberingStyle]}) diterapkan & disimpan di Smart Formatting History.`
    );
  };

  // Restore / Toggle to a historical formatting state from Smart Formatting History Log
  const handleRestoreFormatState = (entry: SmartFormattingHistoryEntry) => {
    const restoredConfig: BulkFormatConfig = {
      numberingStyle: entry.numberingStyle,
      fontStyle: entry.fontStyle,
      indentation: entry.indentation,
      uppercaseTitles: entry.uppercaseTitles,
    };
    setBulkFormatConfig(restoredConfig);

    updateActiveDocument(
      (doc) => {
        const formatted = applyBulkFormattingToDocument(doc, restoredConfig);
        return {
          ...formatted,
          updatedAt: `Beralih ke Riwayat Format: ${entry.label}`,
        };
      },
      `Toggle Format: ${entry.label} (${entry.summaryText})`
    );

    showToast(
      `Berhasil beralih ke konfigurasi "${entry.label}" (${entry.summaryText}).`
    );
  };

  // Bulk Clause Import Handler: Parse raw external contract text into separate, properly numbered clauses
  const handleBulkImportClauses = async (
    rawText: string,
    mode: 'append' | 'replace',
    numberingStyleOverride?: NumberingStyle
  ) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    const effectiveConfig: BulkFormatConfig = numberingStyleOverride
      ? { ...bulkFormatConfig, numberingStyle: numberingStyleOverride }
      : bulkFormatConfig;
    const startNumber = mode === 'replace' ? 1 : activeDoc.clauses.length + 1;

    setIsImportingBulk(true);
    let aiParsedClauses: any[] | undefined;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2800);
      const res = await fetch('/api/legal/bulk-import-clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: trimmed,
          documentTitle: activeDoc.title,
          startClauseNumber: startNumber,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.fallback && Array.isArray(data.clauses) && data.clauses.length > 0) {
          aiParsedClauses = data.clauses;
        }
      }
    } catch {
      // Uses deterministic local parser seamlessly
    } finally {
      setIsImportingBulk(false);
    }

    const parsedClauses = parseRawContractTextIntoClauses(
      trimmed,
      startNumber,
      effectiveConfig,
      aiParsedClauses
    );

    if (parsedClauses.length === 0) {
      showToast('Tidak ditemukan teks pasal yang dapat diimpor.');
      return;
    }

    const nowLabel = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const parsedWithHistory: LegalClause[] = parsedClauses.map((cl) => ({
      ...cl,
      aiHistory: [
        {
          id: `hist-bulk-fmt-${cl.id}-${Date.now()}`,
          clauseId: cl.id,
          clauseNumber: cl.number,
          source: 'Bulk Importer',
          actionLabel: `Bulk Clause Import · AI Parser & Hierarki (${effectiveConfig.numberingStyle})`,
          timestamp: `Baru saja (${nowLabel} WIB)`,
          snapshot: {
            title: cl.title,
            content: [...cl.content],
            legalBasis: cl.legalBasis,
            riskLevel: cl.riskLevel,
          },
        },
        {
          id: `hist-bulk-raw-${cl.id}-${Date.now()}`,
          clauseId: cl.id,
          clauseNumber: cl.number,
          source: 'Initial State',
          actionLabel: 'Teks Mentah Kontrak Eksternal (Sebelum Standarisasi Penomoran)',
          timestamp: `Baru saja (${nowLabel} WIB)`,
          snapshot: {
            title: cl.title,
            content: cl.content.map((p) => p.replace(/^(?:\(\d+\)|\d+\.\d+\.|\d+\.)\s*/, '')),
            legalBasis: 'Pasal 1338 KUHPerdata (Draf Eksternal)',
            riskLevel: 'Standar',
          },
        },
      ],
    }));

    updateActiveDocument(
      (doc) => {
        const combinedClauses =
          mode === 'replace' ? parsedWithHistory : [...doc.clauses, ...parsedWithHistory];
        const formattedDoc = applyBulkFormattingToDocument(
          {
            ...doc,
            updatedAt: `Bulk Clause Import: ${parsedWithHistory.length} pasal diimpor & diformat`,
            clauses: combinedClauses,
          },
          effectiveConfig
        );
        return formattedDoc;
      },
      `Bulk Clause Import: ${parsedWithHistory.length} Pasal (${
        mode === 'replace' ? 'Ganti Seluruh Pasal' : 'Tambah ke Akhir'
      })`
    );

    showToast(
      `AI Agent berhasil memisahkan dan memformat ${parsedWithHistory.length} pasal baru serta mencatatnya di AI Clause History.`
    );
  };

  // Real-time Full Document Language Toggle (Bahasa Indonesia ⇄ English)
  const activeDocumentLanguage: DocumentLanguageCode =
    activeDoc.activeDocumentLanguage || 'id';

  const handleSwitchDocumentLanguage = (targetLang: DocumentLanguageCode) => {
    const currentLang: DocumentLanguageCode = activeDoc.activeDocumentLanguage || 'id';
    const effectiveTarget: DocumentLanguageCode =
      targetLang === currentLang ? (currentLang === 'id' ? 'en' : 'id') : targetLang;

    updateActiveDocument((doc) => {
      const switched = translateEntireDocumentInRealtime(doc, effectiveTarget);
      return {
        ...switched,
        updatedAt:
          effectiveTarget === 'en'
            ? 'Switched to English (Real-Time Full Document Translation)'
            : 'Dialihkan ke Bahasa Indonesia (Naskah Utama)',
      };
    });

    showToast(
      effectiveTarget === 'en'
        ? `Bahasa seluruh dokumen berhasil dialihkan secara real-time ke English (${activeDoc.clauses.length} Pasal & seluruh bagian akta).`
        : `Bahasa seluruh dokumen berhasil dikembalikan secara real-time ke Bahasa Indonesia (${activeDoc.clauses.length} Pasal & seluruh bagian akta).`
    );
  };

  const handleToggleDocumentLanguage = () => {
    const currentLang: DocumentLanguageCode = activeDoc.activeDocumentLanguage || 'id';
    handleSwitchDocumentLanguage(currentLang === 'id' ? 'en' : 'id');
  };

  // Record a new iteration in AI Clause History whenever AI Writing Assistant transforms a paragraph
  const handleRecordClauseAiWritingTransform = (
    clause: LegalClause,
    ayatIndex: number,
    actionLabel: string,
    newAyatText: string,
    previousAyatText: string
  ) => {
    const nowLabel = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    updateActiveDocument((doc) => ({
      ...doc,
      updatedAt: `${actionLabel} pada ${clause.number}`,
      clauses: doc.clauses.map((item) => {
        if (item.id !== clause.id) return item;
        const existingHistory = item.aiHistory || [];
        const previousContentList = item.content.map((p, i) =>
          i === ayatIndex ? previousAyatText : p
        );
        const updatedContentList = item.content.map((p, i) =>
          i === ayatIndex ? newAyatText : p
        );

        const initialSeedIfEmpty: AiClauseHistoryEntry[] =
          existingHistory.length === 0
            ? [
                {
                  id: `hist-seed-${clause.id}-${Date.now() - 1}`,
                  clauseId: clause.id,
                  clauseNumber: clause.number,
                  source: 'Initial State',
                  actionLabel: 'Versi Sebelum Transformasi AI Writing Assistant',
                  timestamp: `Sebelum ⌘K (${nowLabel} WIB)`,
                  snapshot: {
                    title: item.title,
                    content: previousContentList,
                    legalBasis: item.legalBasis,
                    riskLevel: item.riskLevel,
                  },
                },
              ]
            : [];

        const newIteration: AiClauseHistoryEntry = {
          id: `hist-wa-${clause.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          clauseId: clause.id,
          clauseNumber: clause.number,
          source: 'AI Writing Assistant',
          actionLabel,
          timestamp: `Baru saja (${nowLabel} WIB)`,
          snapshot: {
            title: item.title,
            content: updatedContentList,
            legalBasis: item.legalBasis,
            riskLevel: item.riskLevel,
          },
        };

        const { record: aiChangeRec } = buildAiClauseChangeRecord({
          clause: {
            ...item,
            content: previousContentList,
          },
          nextTitle: item.title,
          nextLegalBasis: item.legalBasis,
          nextContent: updatedContentList,
          sourceLabel: `AI Writing Assistant · ${actionLabel} (Ayat ${ayatIndex + 1})`,
          changeMode: 'content_modified',
          timestampLabel: `${nowLabel} WIB`,
        });

        return {
          ...item,
          content: updatedContentList,
          aiChangeRecord: aiChangeRec,
          aiHistory: [newIteration, ...initialSeedIfEmpty, ...existingHistory],
        };
      }),
    }));
  };

  // Revert a single clause to a previous AI-generated or baseline iteration without rolling back the whole document
  const handleRevertSingleClauseToIteration = (
    clauseId: string,
    entry: AiClauseHistoryEntry
  ) => {
    const targetClause = activeDoc.clauses.find((c) => c.id === clauseId);
    if (!targetClause) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Revert ${targetClause.number} ke iterasi: ${entry.actionLabel}`,
        clauses: doc.clauses.map((item) => {
          if (item.id !== clauseId) return item;
          if (entry.source === 'Initial State') {
            return {
              ...item,
              title: entry.snapshot.title,
              content: [...entry.snapshot.content],
              legalBasis: entry.snapshot.legalBasis,
              riskLevel: entry.snapshot.riskLevel,
              aiChangeRecord: undefined,
              regulatoryUpdateMarker: undefined,
            };
          }
          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: item,
            nextTitle: entry.snapshot.title,
            nextLegalBasis: entry.snapshot.legalBasis,
            nextContent: [...entry.snapshot.content],
            sourceLabel: `Revert AI History: ${entry.actionLabel}`,
            changeMode: 'content_modified',
            timestampLabel: `${nowTime} WIB`,
          });
          return {
            ...item,
            title: entry.snapshot.title,
            content: [...entry.snapshot.content],
            legalBasis: entry.snapshot.legalBasis,
            riskLevel: entry.snapshot.riskLevel,
            aiChangeRecord: aiChangeRec,
          };
        }),
      }),
      `Revert Klausul Tunggal (${targetClause.number}) → ${entry.actionLabel}`
    );

    showToast(
      `${targetClause.number} berhasil dikembalikan ke state "${entry.actionLabel}" tanpa mengubah pasal lainnya di dokumen.`
    );
  };

  // AI Translation Handler for a Clause (with Dual-Language View & AI Clause History tracking)
  const handleTranslateClauseWithAI = async (
    clause: LegalClause,
    langOverride?: SupportedLegalLanguage
  ) => {
    const lang = langOverride || targetTranslationLang;
    if (langOverride) {
      setTargetTranslationLang(langOverride);
    }

    // Immediately show Dual-Language View for this clause using synchronous precision translation
    const syncTranslation = translateClauseLocallySync(clause, lang);
    setDualLanguageClauseIds((prev) => ({ ...prev, [clause.id]: true }));
    updateActiveDocument((doc) => ({
      ...doc,
      clauses: doc.clauses.map((item) =>
        item.id === clause.id
          ? {
              ...item,
              activeTranslationLang: lang,
              translations: {
                ...(item.translations || {}),
                [lang]: syncTranslation,
              },
            }
          : item
      ),
    }));

    setTranslatingClauseId(clause.id);
    try {
      const aiTranslation = await translateClauseWithAI(clause, lang);
      updateActiveDocument((doc) => ({
        ...doc,
        updatedAt: `AI Translation (${lang}) pada ${clause.number}`,
        clauses: doc.clauses.map((item) =>
          item.id === clause.id
            ? {
                ...item,
                activeTranslationLang: lang,
                translations: {
                  ...(item.translations || {}),
                  [lang]: aiTranslation,
                },
              }
            : item
        ),
      }));
      showToast(
        `${clause.number} berhasil diterjemahkan ke bahasa ${lang} dengan presisi hukum (Dual-Language Layout aktif).`
      );
    } finally {
      setTranslatingClauseId(null);
    }
  };

  // Apply translated text directly to a single clause's main body (and record in AI Clause History so it can be reverted)
  const handleApplyTranslationToClauseText = (
    clause: LegalClause,
    translation: ClauseTranslationData
  ) => {
    const nowLabel = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Terjemahan ${translation.targetLanguage} diterapkan ke ${clause.number}`,
        clauses: doc.clauses.map((item) => {
          if (item.id !== clause.id) return item;
          const prevHistory = item.aiHistory || [];
          const newEntry: AiClauseHistoryEntry = {
            id: `hist-tr-${clause.id}-${Date.now()}`,
            clauseId: clause.id,
            clauseNumber: clause.number,
            source: 'AI Translation',
            actionLabel: `AI Translation · Terjemahan Hukum (${translation.targetLanguage})`,
            timestamp: `Baru saja (${nowLabel} WIB)`,
            snapshot: {
              title: translation.translatedTitle,
              content: [...translation.translatedContent],
              legalBasis: translation.translatedLegalBasis,
              riskLevel: item.riskLevel,
            },
          };
          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: item,
            nextTitle: translation.translatedTitle,
            nextLegalBasis: translation.translatedLegalBasis,
            nextContent: [...translation.translatedContent],
            sourceLabel: `AI Translation · Terjemahan Hukum (${translation.targetLanguage})`,
            changeMode: 'clause_replaced',
            timestampLabel: `${nowLabel} WIB`,
          });
          return {
            ...item,
            title: translation.translatedTitle,
            content: [...translation.translatedContent],
            legalBasis: translation.translatedLegalBasis,
            aiChangeRecord: aiChangeRec,
            aiHistory: [newEntry, ...prevHistory],
          };
        }),
      }),
      `Terapkan Terjemahan Hukum (${translation.targetLanguage}) pada ${clause.number}`
    );
    showToast(
      `Teks ${translation.targetLanguage} diterapkan pada ${clause.number}. Anda dapat mengembalikannya kapan saja lewat AI Clause History.`
    );
  };

  // Trigger AI Legal Professional Agent Rebuttal directly on a clause
  const handleQuickAiRebuttalForClause = async (clause: LegalClause) => {
    if (isGeneratingAiRebuttalClauseId === clause.id) return;
    setIsGeneratingAiRebuttalClauseId(clause.id);
    setOpenCommentClauseId(clause.id);
    try {
      const rebuttal = await generateAiLegalRebuttalForClause(
        clause,
        'Pihak Kedua (Counterparty)',
        activeDoc.partyOne.name,
        activeDoc.partyTwo.name
      );
      handleAddClauseComment(
        clause,
        rebuttal.authorName,
        rebuttal.authorRole,
        rebuttal.commentText,
        rebuttal.proposedAlternative || undefined
      );
      showToast(
        `${rebuttal.authorName} menambahkan sanggahan hukum pada ${clause.number} (${clause.title}).`
      );
    } finally {
      setIsGeneratingAiRebuttalClauseId(null);
    }
  };

  // Automatic Clause Content & Regulation Adaptation based on Risk Level (Standar / Perhatian / Kritis)
  const handleChangeClauseRiskLevel = (
    clause: LegalClause,
    newRisk: 'Standar' | 'Perhatian' | 'Kritis'
  ) => {
    const adapted = adaptClauseByRiskLevel(clause, newRisk);
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Otomatisasi isi & UU ${clause.number} (Risiko ${newRisk})`,
        clauses: doc.clauses.map((item) => {
          if (item.id !== clause.id) return item;
          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: item,
            nextTitle: item.title,
            nextLegalBasis: adapted.legalBasis,
            nextContent: adapted.content,
            sourceLabel: `Otomatisasi AI Risiko Pasal (${newRisk})`,
            changeMode: 'content_modified',
            timestampLabel: `${nowTime} WIB`,
          });
          return {
            ...item,
            riskLevel: newRisk,
            legalBasis: adapted.legalBasis,
            content: adapted.content,
            aiChangeRecord: aiChangeRec,
          };
        }),
      }),
      `Ubah Risiko & Isi ${clause.number} ke ${newRisk}`
    );
    showToast(`${clause.number}: ${adapted.riskSummary}`);
  };

  // Bulk synchronize all clauses' content and legalBasis according to their current risk level
  const handleSyncAllClausesByRisk = () => {
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: 'Isi & peraturan seluruh pasal disesuaikan menurut tingkat risiko',
        clauses: doc.clauses.map((c) => {
          const targetRisk =
            c.riskLevel === 'Kritis' || c.riskLevel === 'Perhatian' || c.riskLevel === 'Standar'
              ? c.riskLevel
              : 'Standar';
          const adapted = adaptClauseByRiskLevel(c, targetRisk);
          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: c,
            nextTitle: c.title,
            nextLegalBasis: adapted.legalBasis,
            nextContent: adapted.content,
            sourceLabel: `Sinkronisasi AI Risiko Pasal (${targetRisk})`,
            changeMode: 'content_modified',
            timestampLabel: `${nowTime} WIB`,
          });
          return {
            ...c,
            riskLevel: targetRisk,
            legalBasis: adapted.legalBasis,
            content: adapted.content,
            aiChangeRecord: aiChangeRec,
          };
        }),
      }),
      'Sinkronisasi otomatis isi & regulasi seluruh pasal berdasarkan tingkat risiko'
    );
    showToast(
      `Isi ayat dan dasar peraturan seluruh ${activeDoc.clauses.length} pasal telah disesuaikan otomatis berdasarkan tingkat risikonya.`
    );
  };

  // Split Clause Handler: Split selected text within a clause into a new separate clause using AI
  const handleSplitClauseWithAI = async (sourceClause: LegalClause, clauseIndex: number) => {
    const trimmedSelection = splitSelectedText.trim();
    if (!trimmedSelection) {
      showToast('Pilih atau sorot teks dalam pasal terlebih dahulu untuk dipecah.');
      return;
    }

    setIsSplittingClause(true);
    setErrorMessage(null);

    const nextClauseNum = clauseIndex + 2;
    let splitData = splitClauseLocally(sourceClause, trimmedSelection, nextClauseNum);

    try {
      const response = await fetch('/api/legal/split-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceClause,
          selectedText: trimmedSelection,
          documentTitle: activeDoc.title,
          nextClauseNumber: `Pasal ${nextClauseNum}`,
        }),
      });
      const data = await response.json();
      if (response.ok && data && !data.fallback && data.updatedSourceClause && data.newSplitClause) {
        splitData = data;
      }
    } catch {
      // Uses deterministic local fallback seamlessly
    } finally {
      setIsSplittingClause(false);
    }

    const newClauseId = `cl-split-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => {
        const updatedClauses: LegalClause[] = [];
        doc.clauses.forEach((c) => {
          if (c.id === sourceClause.id) {
            const nextSourceTitle = splitData.updatedSourceClause.title || c.title;
            const nextSourceContent =
              Array.isArray(splitData.updatedSourceClause.content) &&
              splitData.updatedSourceClause.content.length > 0
                ? splitData.updatedSourceClause.content
                : c.content;
            const nextSourceBasis = splitData.updatedSourceClause.legalBasis || c.legalBasis;
            const { record: sourceAiRec } = buildAiClauseChangeRecord({
              clause: c,
              nextTitle: nextSourceTitle,
              nextLegalBasis: nextSourceBasis,
              nextContent: nextSourceContent,
              sourceLabel: `AI Split Clause · Pemisahan dari ${sourceClause.number}`,
              changeMode: 'content_modified',
              timestampLabel: `${nowTime} WIB`,
            });
            updatedClauses.push({
              ...c,
              title: nextSourceTitle,
              content: nextSourceContent,
              legalBasis: nextSourceBasis,
              riskLevel: splitData.updatedSourceClause.riskLevel || c.riskLevel,
              aiChangeRecord: sourceAiRec,
            });

            const newSplitTitle =
              splitData.newSplitClause.title || 'KETENTUAN PEMISAHAN KLAUSUL';
            const newSplitContent =
              Array.isArray(splitData.newSplitClause.content) &&
              splitData.newSplitClause.content.length > 0
                ? splitData.newSplitClause.content
                : [`(1) ${trimmedSelection}`];
            const newSplitBasis = splitData.newSplitClause.legalBasis || c.legalBasis;
            const tempNewClause: LegalClause = {
              id: newClauseId,
              number: `Pasal ${nextClauseNum}`,
              title: newSplitTitle,
              content: [],
              legalBasis: newSplitBasis,
              riskLevel: splitData.newSplitClause.riskLevel || c.riskLevel,
            };
            const { record: newSplitAiRec } = buildAiClauseChangeRecord({
              clause: tempNewClause,
              nextTitle: newSplitTitle,
              nextLegalBasis: newSplitBasis,
              nextContent: newSplitContent,
              sourceLabel: `AI Split Clause · Hasil Pecahan dari ${sourceClause.number}`,
              changeMode: 'new_clause_added',
              timestampLabel: `${nowTime} WIB`,
            });
            updatedClauses.push({
              ...tempNewClause,
              content: newSplitContent,
              aiChangeRecord: newSplitAiRec,
            });
          } else {
            updatedClauses.push(c);
          }
        });

        const renumbered = renumberClauses(updatedClauses);
        const formattedDoc = applyBulkFormattingToDocument(
          {
            ...doc,
            updatedAt: `Split Clause: ${sourceClause.number} dipecah menjadi pasal baru`,
            clauses: renumbered,
          },
          bulkFormatConfig
        );
        return formattedDoc;
      },
      `Split Clause: Pecah ${sourceClause.number} → Pasal Baru (${splitData.newSplitClause.title})`
    );

    setSplittingClauseId(null);
    setSplitSelectedText('');
    showToast(
      `Teks terpilih berhasil dipecah menjadi pasal baru "${splitData.newSplitClause.title}" dengan logika hukum konsisten.`
    );

    setTimeout(() => {
      const el = document.getElementById(`clause-${newClauseId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  // Smart Auto-Fill Handlers based on Party Metadata (e.g., PT vs Individu)
  const handleChangePartyEntityType = (
    partyWhich: 'partyOne' | 'partyTwo',
    newType: PartyEntityType
  ) => {
    const roleLabel = partyWhich === 'partyOne' ? 'PIHAK PERTAMA' : 'PIHAK KEDUA';
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Metadata ${roleLabel} diubah ke ${newType}`,
        [partyWhich]: updatePartyKomparisiByEntityType(doc[partyWhich], newType, roleLabel),
      }),
      `Ubah Metadata ${roleLabel} menjadi ${newType}`
    );
    showToast(
      `Metadata ${roleLabel} diubah ke ${newType}. Usulan Auto-Fill Cerdas Pasal telah disesuaikan otomatis.`
    );
  };

  const handleApplySingleAutoFill = (
    proposal: SmartAutoFillProposal,
    mode: 'replace' | 'insert'
  ) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    if (mode === 'replace' && proposal.matchedClauseId) {
      updateActiveDocument(
        (doc) => ({
          ...doc,
          updatedAt: `Auto-Fill Cerdas diterapkan pada ${proposal.matchedClauseNumber}`,
          clauses: doc.clauses.map((c) => {
            if (c.id !== proposal.matchedClauseId) return c;
            const { record: aiChangeRec } = buildAiClauseChangeRecord({
              clause: c,
              nextTitle: proposal.clauseTitle,
              nextLegalBasis: proposal.legalBasis,
              nextContent: [...proposal.proposedContent],
              sourceLabel: `Smart Auto-Fill AI (${proposal.badgeLabel})`,
              changeMode: 'clause_replaced',
              timestampLabel: `${nowTime} WIB`,
            });
            return {
              ...c,
              title: proposal.clauseTitle,
              legalBasis: proposal.legalBasis,
              riskLevel: proposal.riskLevel,
              content: [...proposal.proposedContent],
              aiChangeRecord: aiChangeRec,
            };
          }),
        }),
        `Auto-Fill Cerdas (${proposal.badgeLabel}) → ${proposal.matchedClauseNumber}`
      );
      showToast(
        `Isi ${proposal.matchedClauseNumber} berhasil di-autofill otomatis sesuai profil pihak (${proposal.badgeLabel}).`
      );
      setTimeout(() => {
        const el = document.getElementById(`clause-${proposal.matchedClauseId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const nextNum = activeDoc.clauses.length + 1;
    const newId = `cl-autofill-${Date.now()}`;
    const baseAutoClause: LegalClause = {
      id: newId,
      number: `Pasal ${nextNum}`,
      title: proposal.clauseTitle,
      legalBasis: proposal.legalBasis,
      riskLevel: proposal.riskLevel,
      content: [],
    };
    const { record: aiChangeRec } = buildAiClauseChangeRecord({
      clause: baseAutoClause,
      nextTitle: proposal.clauseTitle,
      nextLegalBasis: proposal.legalBasis,
      nextContent: [...proposal.proposedContent],
      sourceLabel: `Smart Auto-Fill AI (${proposal.badgeLabel})`,
      changeMode: 'new_clause_added',
      timestampLabel: `${nowTime} WIB`,
    });
    const newClause: LegalClause = {
      ...baseAutoClause,
      content: [...proposal.proposedContent],
      aiChangeRecord: aiChangeRec,
    };

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Sisipan Auto-Fill Cerdas (Pasal ${nextNum})`,
        clauses: [...doc.clauses, newClause],
      }),
      `Sisipkan Pasal Auto-Fill: ${proposal.clauseTitle}`
    );
    showToast(`Pasal "${proposal.clauseTitle}" berhasil ditambahkan sebagai Pasal ${nextNum}.`);
    setTimeout(() => {
      const el = document.getElementById(`clause-${newId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleApplyAllAutoFill = (proposals: SmartAutoFillProposal[]) => {
    if (proposals.length === 0) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => {
        let updatedClauses = [...doc.clauses];
        const replacedIds = new Set<string>();

        proposals.forEach((prop) => {
          if (prop.matchedClauseId && !replacedIds.has(prop.matchedClauseId)) {
            replacedIds.add(prop.matchedClauseId);
            updatedClauses = updatedClauses.map((c) => {
              if (c.id !== prop.matchedClauseId) return c;
              const { record: aiChangeRec } = buildAiClauseChangeRecord({
                clause: c,
                nextTitle: prop.clauseTitle,
                nextLegalBasis: prop.legalBasis,
                nextContent: [...prop.proposedContent],
                sourceLabel: `Smart Auto-Fill AI (${prop.badgeLabel})`,
                changeMode: 'clause_replaced',
                timestampLabel: `${nowTime} WIB`,
              });
              return {
                ...c,
                title: prop.clauseTitle,
                legalBasis: prop.legalBasis,
                riskLevel: prop.riskLevel,
                content: [...prop.proposedContent],
                aiChangeRecord: aiChangeRec,
              };
            });
          } else {
            const nextNum = updatedClauses.length + 1;
            const baseNew: LegalClause = {
              id: `cl-autofill-bulk-${Date.now()}-${nextNum}`,
              number: `Pasal ${nextNum}`,
              title: prop.clauseTitle,
              legalBasis: prop.legalBasis,
              riskLevel: prop.riskLevel,
              content: [],
            };
            const { record: aiChangeRec } = buildAiClauseChangeRecord({
              clause: baseNew,
              nextTitle: prop.clauseTitle,
              nextLegalBasis: prop.legalBasis,
              nextContent: [...prop.proposedContent],
              sourceLabel: `Smart Auto-Fill AI (${prop.badgeLabel})`,
              changeMode: 'new_clause_added',
              timestampLabel: `${nowTime} WIB`,
            });
            updatedClauses.push({
              ...baseNew,
              content: [...prop.proposedContent],
              aiChangeRecord: aiChangeRec,
            });
          }
        });

        return {
          ...doc,
          updatedAt: 'Seluruh usulan Auto-Fill Cerdas berbasis metadata pihak diterapkan',
          clauses: renumberClauses(updatedClauses),
        };
      },
      `Terapkan Semua Auto-Fill Cerdas (${proposals.length} Pasal)`
    );
    showToast(
      `Seluruh ${proposals.length} pasal usulan Auto-Fill Cerdas berbasis metadata pihak berhasil diterapkan!`
    );
  };

  // Shareable Draft Link & Clause Comment Handlers
  const currentShareId = activeDoc.shareId || `share-${activeDoc.id}`;
  const currentShareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(
    currentShareId
  )}`;

  const handleOpenShareModal = async () => {
    setIsShareModalOpen(true);
    try {
      await fetch('/api/legal/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId: currentShareId,
          document: activeDoc,
        }),
      });
    } catch {
      // local state already ready
    }
  };

  const handleAddClauseComment = async (
    clause: LegalClause,
    authorName: string,
    authorRole: string,
    commentText: string,
    proposedAlternative?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newComment: ClauseComment = {
      id: `cmt-${Date.now()}`,
      clauseId: clause.id,
      clauseNumber: clause.number,
      clauseTitle: clause.title,
      authorName,
      authorRole,
      commentText,
      proposedAlternative,
      status: 'Terbuka',
      timestamp: `Hari ini, ${nowTime} WIB`,
    };

    updateActiveDocument((doc) => ({
      ...doc,
      comments: [newComment, ...(doc.comments || [])],
    }));

    try {
      await fetch(`/api/legal/share/${encodeURIComponent(currentShareId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment }),
      });
    } catch {
      // stored locally in document state
    }

    showToast(`Komentar pada ${clause.number} berhasil ditambahkan tanpa mengubah naskah asli.`);
  };

  const handleToggleEmailNotifications = (nextVal: boolean) => {
    setEmailNotificationsEnabled(nextVal);
    updateActiveDocument((doc) => ({
      ...doc,
      emailNotificationsEnabled: nextVal,
    }));
    showToast(
      nextVal
        ? `Email Notifications Aktif: Peringatan email instan dikirim ke ${ownerNotificationEmail} saat komentar ditambah atau diselesaikan.`
        : 'Email Notifications Nonaktif: Peringatan email instan untuk aktivitas komentar dimatikan.'
    );
  };

  const handleChangeOwnerEmailSetting = (nextEmail: string) => {
    setOwnerNotificationEmail(nextEmail);
    updateActiveDocument((doc) => ({
      ...doc,
      ownerNotificationEmail: nextEmail,
    }));
  };

  const handleToggleResolveComment = (commentId: string) => {
    const targetComment = (activeDoc.comments || []).find((c) => c.id === commentId);
    const nextStatus =
      targetComment?.status === 'Diselesaikan' ? 'Terbuka' : 'Diselesaikan';

    updateActiveDocument((doc) => ({
      ...doc,
      comments: (doc.comments || []).map((c) =>
        c.id === commentId
          ? { ...c, status: c.status === 'Diselesaikan' ? 'Terbuka' : 'Diselesaikan' }
          : c
      ),
    }));

    if (targetComment && emailNotificationsEnabled) {
      const targetClause =
        activeDoc.clauses.find((cl) => cl.id === targetComment.clauseId) ||
        activeDoc.clauses[0];
      if (targetClause) {
        handleTriggerOwnerNotification({
          clause: targetClause,
          eventType:
            nextStatus === 'Diselesaikan' ? 'comment_resolved' : 'comment_reopened',
          channel: 'In-App & Email',
          ownerEmail: ownerNotificationEmail || 'legal-owner@klausa.studio',
          actorName: targetComment.authorName,
          summaryText: `[Instant Email Alert] Komentar pada ${targetComment.clauseNumber} diubah menjadi "${nextStatus}".`,
        });
      }
    }
  };

  const handleResolveAllClauseComments = (clauseId: string, clauseNumber: string) => {
    const openForClause = (activeDoc.comments || []).filter(
      (c) =>
        (c.clauseId === clauseId || c.clauseNumber === clauseNumber) &&
        c.status !== 'Diselesaikan'
    );
    if (openForClause.length === 0) return;

    updateActiveDocument((doc) => ({
      ...doc,
      comments: (doc.comments || []).map((c) =>
        c.clauseId === clauseId || c.clauseNumber === clauseNumber
          ? { ...c, status: 'Diselesaikan' }
          : c
      ),
    }));

    showToast(
      `Seluruh ${openForClause.length} komentar terbuka pada ${clauseNumber} telah ditandai sebagai Diselesaikan.`
    );
  };

  const handleResolveAllDocumentComments = () => {
    const allDocComments = activeDoc.comments || [];
    if (allDocComments.length === 0) return;

    const openComments = allDocComments.filter((c) => c.status !== 'Diselesaikan');
    const targetComments = openComments.length > 0 ? openComments : allDocComments;

    // Trigger simultaneous fade-out & green checkmark animation across all ClauseCommentThread instances
    setGlobalResolveAnimTrigger((prev) => prev + 1);

    updateActiveDocument((doc) => ({
      ...doc,
      comments: (doc.comments || []).map((c) => ({
        ...c,
        status: 'Diselesaikan',
      })),
    }));

    // Dispatch owner notifications for each clause that had comments resolved
    const affectedClauses = activeDoc.clauses.filter((cl) =>
      targetComments.some((c) => c.clauseId === cl.id || c.clauseNumber === cl.number)
    );

    affectedClauses.forEach((cl) => {
      const clauseOpenCount = targetComments.filter(
        (c) => c.clauseId === cl.id || c.clauseNumber === cl.number
      ).length;
      handleTriggerOwnerNotification({
        clause: cl,
        eventType: 'all_comments_resolved',
        channel: 'In-App & Email',
        ownerEmail: ownerNotificationEmail || 'legal-owner@klausa.studio',
        actorName: 'Tim Legal / Reviewer',
        summaryText: `Seluruh ${clauseOpenCount} komentar pada ${cl.number} (${cl.title}) telah ditandai Diselesaikan secara global.`,
      });
    });

    showToast(
      openComments.length > 0
        ? `Seluruh ${openComments.length} komentar terbuka pada ${affectedClauses.length} pasal dalam dokumen telah ditandai sebagai Diselesaikan.`
        : `Seluruh ${allDocComments.length} komentar dalam dokumen telah terverifikasi Diselesaikan.`
    );
  };

  // Trigger immediate Email & In-App Notification to Document Owner when comment is added or resolved
  const handleTriggerOwnerNotification = async (payload: {
    clause: LegalClause;
    eventType: OwnerCommentNotification['eventType'];
    channel: OwnerCommentNotification['channel'];
    ownerEmail: string;
    actorName: string;
    summaryText: string;
  }) => {
    const effectiveChannel: OwnerCommentNotification['channel'] =
      !emailNotificationsEnabled && payload.channel.includes('Email')
        ? 'In-App Saja'
        : payload.channel;

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const newNotification: OwnerCommentNotification = {
      id: `owner-ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      documentId: activeDoc.id,
      documentTitle: activeDoc.title,
      clauseId: payload.clause.id,
      clauseNumber: payload.clause.number,
      clauseTitle: payload.clause.title,
      eventType: payload.eventType,
      channel: effectiveChannel,
      ownerEmail: payload.ownerEmail,
      actorName: payload.actorName,
      summaryText: payload.summaryText,
      timestamp: `Hari ini, ${nowTime} WIB`,
    };

    setOwnerCommentAlerts((prev) => [newNotification, ...prev.slice(0, 12)]);

    try {
      await fetch('/api/legal/owner-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification: newNotification,
          emailNotificationsEnabled,
        }),
      });
    } catch {
      // local state notification already active
    }

    showToast(
      emailNotificationsEnabled
        ? `Notifikasi Email Instan Terkirim (${effectiveChannel} → ${payload.ownerEmail}): ${payload.summaryText}`
        : `Notifikasi In-App (${effectiveChannel}): ${payload.summaryText} (Email Notifications: OFF)`
    );
  };

  // Harmonize a terminology inconsistency or legal clause conflict detected by Comprehensive Risk Scan
  const handleHarmonizeScanFinding = (finding: ComprehensiveScanFinding) => {
    const target = finding.harmonizeTarget;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => {
        if (target?.fromTerm && target.toTerm !== undefined) {
          const regex = new RegExp(target.fromTerm, 'gi');
          return {
            ...doc,
            updatedAt: `Harmonisasi terminologi (${finding.title.slice(0, 35)})`,
            clauses: doc.clauses.map((c) => {
              const nextContent = c.content.map((p) => p.replace(regex, target.toTerm || ''));
              const changed = nextContent.some((p, i) => p !== c.content[i]);
              if (!changed) return c;
              const { record: aiChangeRec } = buildAiClauseChangeRecord({
                clause: c,
                nextTitle: c.title,
                nextLegalBasis: c.legalBasis,
                nextContent,
                sourceLabel: `Harmonisasi Risiko AI: ${finding.title.slice(0, 38)}`,
                changeMode: 'content_modified',
                timestampLabel: `${nowTime} WIB`,
              });
              return {
                ...c,
                content: nextContent,
                aiChangeRecord: aiChangeRec,
              };
            }),
          };
        }

        const targetNum = target?.targetClauseNumber || finding.involvedClauses[0];
        const clarification =
          target?.appendClarification ||
          `Ketentuan pelaksanaan pada Pasal ini ditafsirkan secara harmonis dan tidak saling meniadakan dengan pasal-pasal lainnya dalam Perjanjian ini (${finding.recommendation}).`;

        return {
          ...doc,
          updatedAt: `Harmonisasi konflik hukum (${targetNum || 'Pasal'})`,
          clauses: doc.clauses.map((c, idx) => {
            const isMatch =
              (targetNum && c.number.toLowerCase() === targetNum.toLowerCase()) ||
              (!targetNum && idx === doc.clauses.length - 1);
            if (!isMatch) return c;
            const nextAyatNum = c.content.length + 1;
            const nextContent = [...c.content, `(${nextAyatNum}) ${clarification}`];
            const { record: aiChangeRec } = buildAiClauseChangeRecord({
              clause: c,
              nextTitle: c.title,
              nextLegalBasis: c.legalBasis,
              nextContent,
              sourceLabel: `Harmonisasi Risiko AI: ${finding.title.slice(0, 38)}`,
              changeMode: 'ayat_added',
              timestampLabel: `${nowTime} WIB`,
            });
            return {
              ...c,
              content: nextContent,
              aiChangeRecord: aiChangeRec,
            };
          }),
        };
      },
      `Harmonisasi Scan Risiko: ${finding.title.slice(0, 42)}`
    );

    showToast(`Temuan "${finding.title}" berhasil diharmonisasikan secara otomatis pada draf.`);
  };

  // Generate or toggle 1-sentence plain-language summary for a clause using AI
  const handleSummarizeClauseWithAI = async (
    clause: LegalClause,
    forceRefresh = false
  ) => {
    const isCurrentlyOpen = Boolean(expandedSummaryClauseIds[clause.id]);
    if (isCurrentlyOpen && !forceRefresh) {
      setExpandedSummaryClauseIds((prev) => ({
        ...prev,
        [clause.id]: false,
      }));
      return;
    }

    setExpandedSummaryClauseIds((prev) => ({
      ...prev,
      [clause.id]: true,
    }));

    if (clause.plainSummary && !forceRefresh) {
      return;
    }

    setSummarizingClauseId(clause.id);
    try {
      const response = await fetch('/api/legal/summarize-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseNumber: clause.number,
          clauseTitle: clause.title,
          content: clause.content,
          legalBasis: clause.legalBasis,
        }),
      });
      const data = await response.json();
      const summaryText =
        data?.plainSummary && typeof data.plainSummary === 'string'
          ? data.plainSummary.trim()
          : generatePlainLanguageClauseSummary(clause);

      updateActiveDocument((doc) => ({
        ...doc,
        clauses: doc.clauses.map((c) =>
          c.id === clause.id ? { ...c, plainSummary: summaryText } : c
        ),
      }));
      showToast(`Ringkasan 1 kalimat bahasa sederhana untuk ${clause.number} siap ditampilkan.`);
    } catch {
      const fallbackSummary = generatePlainLanguageClauseSummary(clause);
      updateActiveDocument((doc) => ({
        ...doc,
        clauses: doc.clauses.map((c) =>
          c.id === clause.id ? { ...c, plainSummary: fallbackSummary } : c
        ),
      }));
      showToast(`Ringkasan bahasa sederhana untuk ${clause.number} ditampilkan.`);
    } finally {
      setSummarizingClauseId(null);
    }
  };

  // Create a new Client Power of Attorney (Surat Kuasa Klien) document from the builder modal
  const handleCreateSuratKuasaDoc = (newDoc: LegalDocument) => {
    const initialized = ensureInitialVersions([newDoc])[0];
    setDocuments((prev) => [initialized, ...prev]);
    setActiveDocId(initialized.id);
    setViewMode('structured');
    setActiveNavSection('editor');
    showToast(
      `Naskah "${initialized.title} — ${initialized.partyOne.name}" berhasil dibuat untuk Klien.`
    );
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Run AI automatic categorization & label suggestion across all clauses in the document
  const handleCategorizeAllClausesWithAI = async () => {
    setIsCategorizingAllAI(true);
    try {
      const response = await fetch('/api/legal/categorize-clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: activeDoc.title,
          clauses: activeDoc.clauses,
        }),
      });
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const aiMap = new Map(data.map((item: any) => [item.id, item]));
        updateActiveDocument(
          (doc) => ({
            ...doc,
            updatedAt: 'Kategorisasi & label klausul AI diperbarui',
            clauses: doc.clauses.map((c) => {
              const found = aiMap.get(c.id);
              const local = categorizeClauseWithLabels(c);
              return {
                ...c,
                clauseCategory: (found?.category as ClauseCategoryType) || local.category,
                clauseTags:
                  Array.isArray(found?.activeTags) && found.activeTags.length > 0
                    ? found.activeTags
                    : local.activeTags,
                suggestedTags:
                  Array.isArray(found?.suggestedTags) && found.suggestedTags.length > 0
                    ? found.suggestedTags
                    : local.suggestedTags,
                categoryReason: found?.reason || local.reason,
              };
            }),
          }),
          'Kategorisasi & Label Klausul Otomatis (AI)'
        );
        showToast(
          `AI berhasil mengkategorikan dan menyarankan label warna pada ${activeDoc.clauses.length} pasal.`
        );
      } else {
        updateActiveDocument(
          (doc) => ({
            ...doc,
            updatedAt: 'Kategorisasi & label klausul diperbarui',
            clauses: doc.clauses.map((c) => {
              const local = categorizeClauseWithLabels({ ...c, clauseCategory: undefined });
              return {
                ...c,
                clauseCategory: local.category,
                clauseTags: local.activeTags,
                suggestedTags: local.suggestedTags,
                categoryReason: local.reason,
              };
            }),
          }),
          'Kategorisasi & Label Klausul Otomatis'
        );
        showToast(
          `Seluruh ${activeDoc.clauses.length} pasal berhasil dikategorikan beserta saran labelnya.`
        );
      }
    } catch {
      updateActiveDocument((doc) => ({
        ...doc,
        clauses: doc.clauses.map((c) => {
          const local = categorizeClauseWithLabels(c);
          return {
            ...c,
            clauseCategory: local.category,
            clauseTags: local.activeTags,
            suggestedTags: local.suggestedTags,
            categoryReason: local.reason,
          };
        }),
      }));
      showToast('Kategori dan saran label klausul berhasil diterapkan.');
    } finally {
      setIsCategorizingAllAI(false);
    }
  };

  const handleChangeClauseCategory = (
    clause: LegalClause,
    newCategory: ClauseCategoryType
  ) => {
    updateActiveDocument((doc) => ({
      ...doc,
      clauses: doc.clauses.map((c) =>
        c.id === clause.id ? { ...c, clauseCategory: newCategory } : c
      ),
    }));
    showToast(
      `Kategori ${clause.number} diubah menjadi "${CLAUSE_CATEGORY_STYLES[newCategory].bilingualLabel}".`
    );
  };

  const handleAddTagToClause = (clause: LegalClause, tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (!clean) return;
    const catInfo = categorizeClauseWithLabels(clause);
    if (catInfo.activeTags.includes(clean)) return;
    const nextTags = [...catInfo.activeTags, clean];
    updateActiveDocument((doc) => ({
      ...doc,
      clauses: doc.clauses.map((c) =>
        c.id === clause.id
          ? {
              ...c,
              clauseCategory: catInfo.category,
              clauseTags: nextTags,
            }
          : c
      ),
    }));
    showToast(`Label "${clean}" ditambahkan ke ${clause.number}.`);
  };

  const handleRemoveTagFromClause = (clause: LegalClause, tagToRemove: string) => {
    const catInfo = categorizeClauseWithLabels(clause);
    const nextTags = catInfo.activeTags.filter((t) => t !== tagToRemove);
    updateActiveDocument((doc) => ({
      ...doc,
      clauses: doc.clauses.map((c) =>
        c.id === clause.id
          ? {
              ...c,
              clauseCategory: catInfo.category,
              clauseTags: nextTags,
            }
          : c
      ),
    }));
  };

  // Batch Processing Handlers for Categorization UI (Select Multiple Clauses & Apply Bulk Category Change or Tag Addition)
  const handleToggleBatchSelectClause = (clauseId: string) => {
    setSelectedBatchClauseIds((prev) =>
      prev.includes(clauseId) ? prev.filter((id) => id !== clauseId) : [...prev, clauseId]
    );
  };

  const handleBatchSelectAllClauses = (clauseIdsToSelect: string[]) => {
    const allAlreadySelected =
      clauseIdsToSelect.length > 0 &&
      clauseIdsToSelect.every((id) => selectedBatchClauseIds.includes(id));
    if (allAlreadySelected) {
      setSelectedBatchClauseIds([]);
    } else {
      setSelectedBatchClauseIds(Array.from(new Set(clauseIdsToSelect)));
    }
  };

  const handleApplyBatchCategorizationAndTags = (
    overrideCategory?: ClauseCategoryType | '',
    overrideTagStr?: string
  ) => {
    if (selectedBatchClauseIds.length === 0) {
      showToast('Pilih minimal 1 pasal terlebih dahulu untuk pemrosesan massal (Batch Processing).');
      return;
    }

    const targetCategory =
      overrideCategory !== undefined ? overrideCategory : batchTargetCategory;
    const rawTagInput = (
      overrideTagStr !== undefined ? overrideTagStr : batchTagInput
    ).trim();
    const tagsToAdd = rawTagInput
      ? rawTagInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    if (!targetCategory && tagsToAdd.length === 0) {
      showToast('Pilih kategori baru atau ketik label/tag yang ingin ditambahkan secara massal.');
      return;
    }

    const selectedSet = new Set(selectedBatchClauseIds);
    const affectedNumbers: string[] = [];

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Batch kategorisasi/label pada ${selectedBatchClauseIds.length} pasal`,
        clauses: doc.clauses.map((c) => {
          if (!selectedSet.has(c.id)) return c;
          affectedNumbers.push(c.number);
          const catInfo = categorizeClauseWithLabels(c);
          const nextCategory: ClauseCategoryType = targetCategory || catInfo.category;
          const mergedTags = Array.from(new Set([...catInfo.activeTags, ...tagsToAdd]));
          return {
            ...c,
            clauseCategory: nextCategory,
            clauseTags: mergedTags,
            categoryReason: targetCategory
              ? `Diubah secara massal (Batch Processing) ke kategori ${CLAUSE_CATEGORY_STYLES[targetCategory].bilingualLabel}`
              : c.categoryReason || catInfo.reason,
          };
        }),
      }),
      `Batch Processing (${selectedBatchClauseIds.length} Pasal): ${
        targetCategory ? `Kategori → ${CLAUSE_CATEGORY_STYLES[targetCategory].shortLabel}` : ''
      }${targetCategory && tagsToAdd.length > 0 ? ' & ' : ''}${
        tagsToAdd.length > 0 ? `+Tag [${tagsToAdd.join(', ')}]` : ''
      }`
    );

    if (overrideTagStr === undefined && tagsToAdd.length > 0) {
      setBatchTagInput('');
    }

    const summaryParts: string[] = [];
    if (targetCategory) {
      summaryParts.push(
        `Kategori diubah ke "${CLAUSE_CATEGORY_STYLES[targetCategory].bilingualLabel}"`
      );
    }
    if (tagsToAdd.length > 0) {
      summaryParts.push(`Label [${tagsToAdd.join(', ')}] ditambahkan`);
    }

    showToast(
      `Batch Processing berhasil diterapkan pada ${selectedBatchClauseIds.length} pasal (${affectedNumbers.join(', ')}): ${summaryParts.join(' & ')}.`
    );
  };

  const handleMoveClause = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDoc.clauses.length) return;

    updateActiveDocument((doc) => {
      const copy = [...doc.clauses];
      const [removed] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, removed);
      return {
        ...doc,
        updatedAt: 'Urutan pasal diperbarui',
        clauses: renumberClauses(copy),
      };
    });
  };

  // Drag-and-drop reorder handler for 'Daftar Isi Pasal' in the left sidebar
  const handleReorderClauseDragDrop = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= activeDoc.clauses.length ||
      toIndex >= activeDoc.clauses.length
    ) {
      return;
    }

    const movedClause = activeDoc.clauses[fromIndex];
    updateActiveDocument(
      (doc) => {
        const copy = [...doc.clauses];
        const [removed] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, removed);
        return {
          ...doc,
          updatedAt: `Urutan pasal diubah (Pasal ${fromIndex + 1} ke Pasal ${toIndex + 1})`,
          clauses: renumberClauses(copy),
        };
      },
      `Drag & Drop Urutan: ${movedClause?.title || 'Pasal'} ke Pasal ${toIndex + 1}`
    );

    showToast(
      `Urutan pasal berhasil diperbarui: "${movedClause?.title}" kini menjadi Pasal ${toIndex + 1}.`
    );
  };

  // Replace an existing clause directly from the Pustaka Klausul Standar hover search
  const handleReplaceClauseWithLibraryItem = (
    targetClauseId: string,
    snippet: ClauseLibraryItem
  ) => {
    const targetClause = activeDoc.clauses.find((c) => c.id === targetClauseId);
    if (!targetClause) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `${targetClause.number} diganti dari Pustaka Klausul Standar`,
        clauses: doc.clauses.map((c) => {
          if (c.id !== targetClauseId) return c;
          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: c,
            nextTitle: snippet.title,
            nextLegalBasis: snippet.legalBasis,
            nextContent: [...snippet.content],
            sourceLabel: `Pustaka Klausul AI: ${snippet.title}`,
            changeMode: 'clause_replaced',
            timestampLabel: `${nowTime} WIB`,
          });
          return {
            ...c,
            title: snippet.title,
            legalBasis: snippet.legalBasis,
            riskLevel: snippet.riskLevel,
            content: [...snippet.content],
            plainSummary: snippet.summary,
            clauseCategory: undefined,
            clauseTags: undefined,
            aiChangeRecord: aiChangeRec,
          };
        }),
      }),
      `Ganti ${targetClause.number} dengan Pustaka: ${snippet.title}`
    );

    showToast(
      `${targetClause.number} berhasil diganti secara instan dengan "${snippet.title}".`
    );
  };

  // Insert a library clause right after a specific clause index from the hover search
  const handleInsertLibraryItemAfterClause = (
    afterIndex: number,
    snippet: ClauseLibraryItem
  ) => {
    const newClauseId = `cl-lib-hover-${Date.now()}`;
    const insertedNumber = afterIndex + 2;
    const newClause: LegalClause = {
      id: newClauseId,
      number: `Pasal ${insertedNumber}`,
      title: snippet.title,
      content: [...snippet.content],
      legalBasis: snippet.legalBasis,
      riskLevel: snippet.riskLevel,
      plainSummary: snippet.summary,
    };

    updateActiveDocument(
      (doc) => {
        const copy = [...doc.clauses];
        copy.splice(afterIndex + 1, 0, newClause);
        return {
          ...doc,
          updatedAt: `Pasal ${insertedNumber} disisipkan dari Pustaka Klausul`,
          clauses: renumberClauses(copy),
        };
      },
      `Sisipkan Pasal ${insertedNumber} dari Pustaka: ${snippet.title}`
    );

    showToast(
      `Klausul "${snippet.title}" berhasil disisipkan sebagai Pasal ${insertedNumber}.`
    );
    setTimeout(() => {
      const el = document.getElementById(`clause-${newClauseId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDeleteClause = (clauseId: string) => {
    if (activeDoc.clauses.length <= 1) {
      showToast('Dokumen harus memiliki minimal 1 pasal.');
      return;
    }
    const target = activeDoc.clauses.find((c) => c.id === clauseId);
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: 'Pasal dihapus',
        clauses: renumberClauses(doc.clauses.filter((c) => c.id !== clauseId)),
      }),
      `Hapus ${target?.number || 'Pasal'}`
    );
  };

  const handleAddManualClause = () => {
    const nextNum = activeDoc.clauses.length + 1;
    const newClause: LegalClause = {
      id: `cl-manual-${Date.now()}`,
      number: `Pasal ${nextNum}`,
      title: 'KETENTUAN TAMBAHAN',
      content: [
        '(1) Para Pihak sepakat bahwa ketentuan dalam Pasal ini mengikat sebagai bagian yang tidak terpisahkan dari Perjanjian.',
      ],
      legalBasis: 'Pasal 1338 KUHPerdata',
      riskLevel: 'Standar',
    };
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: 'Pasal manual ditambahkan',
        clauses: [...doc.clauses, newClause],
      }),
      `Tambah Pasal ${nextNum} secara manual`
    );
  };

  // Apply smart variable update across the entire document
  const handleApplyVariable = (idx: number) => {
    const variable = activeDoc.variables[idx];
    const newValue = editingVarValues[idx];
    if (!variable || newValue === undefined || newValue === variable.value) return;

    const oldValue = variable.value;
    updateActiveDocument(
      (doc) => {
        const replaced = applyVariableReplacement(doc, oldValue, newValue);
        return {
          ...replaced,
          variables: replaced.variables.map((v, i) =>
            i === idx ? { ...v, value: newValue } : v
          ),
        };
      },
      `Ubah Variabel ${variable.key}: ${newValue}`
    );

    showToast(`Variabel "${variable.key}" diperbarui di seluruh naskah.`);
  };

  const handleAddCustomVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarKey.trim() || !newVarValue.trim()) return;
    updateActiveDocument((doc) => ({
      ...doc,
      variables: [
        ...doc.variables,
        { key: newVarKey.trim(), value: newVarValue.trim(), category: 'Kustom' },
      ],
    }));
    setNewVarKey('');
    setNewVarValue('');
    showToast('Variabel baru ditambahkan.');
  };

  const handleCopyFullText = async () => {
    const text = formatDocumentAsPlainText(activeDoc);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      showToast('Seluruh naskah hukum berhasil disalin ke clipboard.');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      showToast('Gagal menyalin ke clipboard.');
    }
  };

  // Copy a single formatted clause (including numbering, title, legal basis, and sub-clauses) as Markdown
  const handleCopyClauseAsMarkdown = async (clause: LegalClause) => {
    const mdText = formatClauseAsMarkdown(
      clause,
      activeDoc.title,
      activeDoc.documentNumber
    );
    try {
      await navigator.clipboard.writeText(mdText);
    } catch {
      const ta = window.document.createElement('textarea');
      ta.value = mdText;
      window.document.body.appendChild(ta);
      ta.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(ta);
    }
    setCopiedMarkdownClauseId(clause.id);
    showToast(
      `${clause.number} (${clause.title}) disalin sebagai Markdown (lengkap dengan penomoran — siap ditempel ke Notion / WhatsApp / Slack).`
    );
    setTimeout(() => {
      setCopiedMarkdownClauseId((prev) => (prev === clause.id ? null : prev));
    }, 2400);
  };

  // Insert a procedural compliance clause directly from Manual Kepatuhan checklist
  const handleInsertProceduralClauseFromManual = (
    partialClause: Omit<LegalClause, 'id' | 'number'>
  ) => {
    const nextNum = activeDoc.clauses.length + 1;
    const newClause: LegalClause = {
      id: `cl-proc-${Date.now()}`,
      number: `Pasal ${nextNum}`,
      ...partialClause,
    };
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Klausul Kepatuhan Prosedural ditambahkan (${newClause.number})`,
        clauses: [...doc.clauses, newClause],
      }),
      `Manual Kepatuhan: Sisipkan ${newClause.number} (${newClause.title})`
    );
    showToast(
      `Klausul kepatuhan prosedural "${newClause.title}" berhasil disisipkan sebagai ${newClause.number}.`
    );
  };

  // Update document closingText with formal stamp duty (Bea Meterai) & witness requirements from Manual Kepatuhan
  const handleUpdateClosingTextFromManual = (newClosingText: string) => {
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: 'Kalimat penutup akta diperbarui sesuai Manual Kepatuhan (Meterai & Saksi)',
        closingText: newClosingText,
      }),
      'Manual Kepatuhan: Standarisasi Kalimat Penutup (Bea Meterai Rp10.000 & Saksi)'
    );
    showToast(
      'Kalimat Penutup Akta berhasil diperbarui dengan klausul Bea Meterai Rp10.000 & Para Saksi.'
    );
  };

  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) {
      showToast('Minimal satu dokumen harus tetap tersimpan di ruang kerja.');
      return;
    }
    const filtered = documents.filter((d) => d.id !== id);
    setDocuments(filtered);
    if (activeDocId === id) {
      setActiveDocId(filtered[0].id);
    }
    showToast('Dokumen dihapus dari arsip.');
  };

  const dynamicClauseLibrary = useMemo(
    () => analyzeDraftConditionsForLibrary(activeDoc, CLAUSE_LIBRARY_SNIPPETS),
    [activeDoc]
  );

  const libraryCategories = [
    'Semua',
    ...Array.from(new Set(dynamicClauseLibrary.items.map((s) => s.category))),
  ];

  const filteredLibrary = useMemo(() => {
    const baseFiltered = dynamicClauseLibrary.items.filter((item) => {
      const matchesCat =
        libraryFilter === 'Semua' || item.category === libraryFilter;
      const matchesMode =
        libraryDynamicFilter === 'all' ||
        item.dynamicStatus === libraryDynamicFilter;
      return matchesCat && matchesMode;
    });

    const q = librarySearchQuery.trim();
    if (!q) return baseFiltered;

    return computeSemanticClauseSearch(
      q,
      baseFiltered,
      activeDoc,
      aiSemanticOverrides || undefined
    );
  }, [
    dynamicClauseLibrary,
    libraryFilter,
    libraryDynamicFilter,
    librarySearchQuery,
    activeDoc,
    aiSemanticOverrides,
  ]);

  const handleTriggerAiSemanticSearch = async (customQuery?: string) => {
    const q = (customQuery ?? librarySearchQuery).trim();
    if (customQuery !== undefined) {
      setLibrarySearchQuery(customQuery);
    }
    if (!q) return;

    setIsSemanticSearching(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2400);
      const res = await fetch('/api/legal/semantic-clause-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          documentTitle: activeDoc.title,
          partyOneName: activeDoc.partyOne.name,
          partyTwoName: activeDoc.partyTwo.name,
          libraryItems: dynamicClauseLibrary.items.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            summary: item.summary,
          })),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.fallback) {
          setAiSemanticOverrides(data);
        }
      }
    } catch {
      // Local vector similarity search already active
    } finally {
      setIsSemanticSearching(false);
    }

    const results = computeSemanticClauseSearch(
      q,
      dynamicClauseLibrary.items,
      activeDoc,
      aiSemanticOverrides || undefined
    );
    const topMatch = results[0];
    if (topMatch) {
      showToast(
        `Semantic Search AI menemukan ${results.length} klausul relevan (Skor Vektor Tertinggi: ${Math.round(
          (topMatch.vectorSimilarityScore || 0.92) * 100
        )}% — ${topMatch.title}).`
      );
    }
  };

  const handleAppendLibraryAyatToClause = (
    targetClauseId: string,
    item: DynamicClauseLibraryItem
  ) => {
    const targetClause = activeDoc.clauses.find((cl) => cl.id === targetClauseId);
    if (!targetClause) {
      handleInsertLibraryClause(item);
      return;
    }
    const additionalAyatText =
      item.suggestedAdditionalAyat ||
      item.content[item.content.length - 1]?.replace(/^\(\d+\)\s*/, '') ||
      item.summary;
    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    updateActiveDocument(
      (doc) => ({
        ...doc,
        updatedAt: `Ayat dinamis ditambahkan pada ${targetClause.number}`,
        clauses: doc.clauses.map((cl) => {
          if (cl.id !== targetClauseId) return cl;
          const nextAyat = cl.content.length + 1;
          const nextContent = [...cl.content, `(${nextAyat}) ${additionalAyatText}`];
          const { record: aiChangeRec } = buildAiClauseChangeRecord({
            clause: cl,
            nextTitle: cl.title,
            nextLegalBasis: cl.legalBasis,
            nextContent,
            sourceLabel: `Klausul AI Kontekstual: ${item.title}`,
            changeMode: 'ayat_added',
            timestampLabel: `${nowTime} WIB`,
          });
          return {
            ...cl,
            content: nextContent,
            aiChangeRecord: aiChangeRec,
          };
        }),
      }),
      `Tambah Ayat Dinamis ke ${targetClause.number}: ${item.title}`
    );
    showToast(
      `Ayat proteksi kontekstual berhasil ditambahkan ke ${targetClause.number} (${targetClause.title}).`
    );
    setTimeout(() => {
      const el = document.getElementById(`clause-${targetClauseId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const draftingStagesText = [
    'Menganalisis maksud perintah, entitas para pihak, dan konstruksi hukum...',
    'Menyusun bagian Komparisi, Premis (Konsiderans), dan rujukan KUHPerdata...',
    'Merumuskan Pasal-Pasal perlindungan hak, kewajiban, termin, serta sanksi...',
    'Melakukan audit kepatuhan hukum dan mengekstraksi variabel pintar...',
  ];

  const docVersions = activeDoc.versions || [];
  const leftComparedVersion =
    docVersions.find((v) => v.id === compareLeftVersionId) ||
    docVersions[1] ||
    docVersions[0];
  const rightComparedVersion =
    docVersions.find((v) => v.id === compareRightVersionId) || docVersions[0];
  const extraAiGlossary = aiGlossaryByDoc[activeDoc.id] || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#18181B]">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#E5E0D8]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveNavSection('prompt');
          }}
          className="text-xl font-legal font-semibold tracking-tight text-[#18181B] whitespace-nowrap"
        >
          Klausa Studio
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
          <button
            type="button"
            onClick={() => {
              setActiveNavSection('prompt');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              activeNavSection === 'prompt'
                ? 'border-[#1E3A8A] text-[#18181B] font-semibold'
                : 'border-transparent hover:text-[#18181B]'
            }`}
          >
            Perintah AI
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveNavSection('editor');
              editorRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              activeNavSection === 'editor'
                ? 'border-[#1E3A8A] text-[#18181B] font-semibold'
                : 'border-transparent hover:text-[#18181B]'
            }`}
          >
            Editor Naskah
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveNavSection('consultant');
              consultantPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
              setTimeout(() => chatInputRef.current?.focus(), 200);
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              activeNavSection === 'consultant'
                ? 'border-[#1E3A8A] text-[#18181B] font-semibold'
                : 'border-transparent hover:text-[#18181B]'
            }`}
          >
            Konsultan AI
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveNavSection('regulations');
              setRightTab('regulations');
              rightInspectorRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              activeNavSection === 'regulations'
                ? 'border-[#1E3A8A] text-[#18181B] font-semibold'
                : 'border-transparent hover:text-[#18181B]'
            }`}
          >
            Cari Pasal & UU
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveNavSection('audit');
              setRightTab('audit');
              rightInspectorRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              activeNavSection === 'audit'
                ? 'border-[#1E3A8A] text-[#18181B] font-semibold'
                : 'border-transparent hover:text-[#18181B]'
            }`}
          >
            Audit Hukum
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Language Toggle, Word .DOC, PDF Watermark Settings & Professional jsPDF Export) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="header-language-toggle-btn"
            data-active-language={activeDocumentLanguage}
            onClick={handleToggleDocumentLanguage}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap cursor-pointer ${
              activeDocumentLanguage === 'en'
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                : 'bg-white text-[#1E3A8A] hover:bg-[#EFF6FF] border-[#BFDBFE]'
            }`}
            title="Switch entire document content between Bahasa Indonesia and English in real-time"
          >
            <Languages className="w-3.5 h-3.5 shrink-0" />
            <span>
              {activeDocumentLanguage === 'en'
                ? '🇬🇧 English ⇄ 🇮🇩 Bahasa Indonesia'
                : '🇮🇩 Bahasa Indonesia ⇄ 🇬🇧 English'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => exportToWordDoc(activeDoc)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded-md hover:bg-[#EFECE6] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Unduh .DOC</span>
          </button>

          {/* PDF Export Watermark Toggle & Custom Label Selector */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#D6D0C4] rounded-md text-xs">
            <label className="inline-flex items-center gap-1.5 font-medium text-[#18181B] cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={pdfWatermarkEnabled}
                onChange={(e) => setPdfWatermarkEnabled(e.target.checked)}
                className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
              />
              <Stamp className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Watermark</span>
            </label>
            {pdfWatermarkEnabled && (
              <div className="flex items-center gap-1 pl-1 border-l border-[#E5E0D8]">
                <select
                  value={
                    ['DRAFT', 'CONFIDENTIAL', 'RAHASIA', 'SALINAN RESMI'].includes(
                      pdfWatermarkText.toUpperCase()
                    )
                      ? pdfWatermarkText.toUpperCase()
                      : 'CUSTOM'
                  }
                  onChange={(e) => {
                    if (e.target.value !== 'CUSTOM') {
                      setPdfWatermarkText(e.target.value);
                    }
                  }}
                  aria-label="Preset Watermark PDF"
                  className="text-[11px] font-semibold text-[#1E3A8A] bg-[#FAF9F6] border border-[#D6D0C4] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#1E3A8A]"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="RAHASIA">RAHASIA</option>
                  <option value="SALINAN RESMI">SALINAN RESMI</option>
                  <option value="CUSTOM">Kustom...</option>
                </select>
                <input
                  type="text"
                  value={pdfWatermarkText}
                  onChange={(e) => setPdfWatermarkText(e.target.value.toUpperCase())}
                  placeholder="DRAFT / CONFIDENTIAL"
                  aria-label="Teks Watermark Kustom"
                  className="w-24 px-1.5 py-0.5 text-[11px] font-code font-semibold text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>
              {pdfWatermarkEnabled
                ? `Ekspor PDF (${(pdfWatermarkText || 'DRAFT').trim()})`
                : 'Ekspor PDF'}
            </span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {statusToast && (
        <div className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#18181B] text-white text-xs font-medium rounded-md shadow-lg border border-[#3F3F46]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* ONE-COMMAND AI LEGAL DRAFTING STUDIO (HERO CONSOLE) */}
      <section className="no-print border-b border-[#E5E0D8] bg-[#F7F5F0]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-7">
          <div className="max-w-3xl mb-5">
            <p className="text-xs text-[#57534E] mb-1.5">
              Penyusunan Kontrak & Perjanjian Otomatis · Standar Hukum Perdata & Komersial Indonesia
            </p>
            <h1
              className="text-2xl sm:text-3xl font-legal font-semibold text-[#18181B] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Satu Perintah untuk Draf Dokumen Hukum Siap Pakai & Dapat Diedit
            </h1>
          </div>

          {/* Command Console Box (Universal & Dynamic Drafting Studio) */}
          <div
            data-testid="universal-command-console"
            className="bg-white border border-[#D6D0C4] rounded-lg p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label
                htmlFor="legal-command-input"
                className="block text-xs font-semibold text-[#18181B]"
              >
                Perintah Penyusunan Dokumen (Deskripsikan kontrak yang Anda butuhkan dalam 1 kalimat atau paragraf)
              </label>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-code font-semibold bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]">
                <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
                <span>Koridor Hukum Indonesia · Dinamis Lintas Bidang Hukum & Kriteria</span>
              </span>
            </div>

            <textarea
              id="legal-command-input"
              ref={promptRef}
              rows={3}
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerateDraft();
                }
              }}
              placeholder="Deskripsikan instrumen hukum yang Anda butuhkan (tetap dalam koridor hukum Indonesia & dinamis lintas bidang): Misal Akta Pengakuan Hutang Perdata, Perjanjian Sewa Properti (Pasal 1548 KUHPerdata), Perjanjian Jasa & Lisensi HKI Kreator, Jual Beli Kendaraan/Tanah, Akta Perdamaian (Dading), SK Hukum Yayasan, Gugatan/Somasi, SK/ST Aanmaning/BPSK/LAPS, hingga PKS Korporasi..."
              className="w-full px-3.5 py-3 text-sm text-[#18181B] bg-[#FAF9F6] border border-[#E5E0D8] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-colors resize-y leading-relaxed"
            />

            {/* Dynamic Legal Criteria & Structure Controls */}
            <div
              data-testid="universal-criteria-panel"
              className="mt-3 p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2.5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="universal-domain-select"
                    className="block text-[11px] font-semibold text-[#18181B] mb-1"
                  >
                    Bidang / Kategori Instrumen Hukum (Dinamis Lintas Ranah Hukum):
                  </label>
                  <select
                    id="universal-domain-select"
                    data-testid="universal-domain-select"
                    value={universalDomainCategory}
                    onChange={(e) => setUniversalDomainCategory(e.target.value)}
                    className="w-full text-xs font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A8A]"
                  >
                    {UNIVERSAL_DOMAIN_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="universal-structure-select"
                    className="block text-[11px] font-semibold text-[#18181B] mb-1"
                  >
                    Gaya & Konstruksi Susunan Naskah Hukum:
                  </label>
                  <select
                    id="universal-structure-select"
                    data-testid="universal-structure-select"
                    value={universalStructureStyle}
                    onChange={(e) => setUniversalStructureStyle(e.target.value)}
                    className="w-full text-xs font-medium text-[#18181B] bg-white border border-[#D6D0C4] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A8A]"
                  >
                    {UNIVERSAL_STRUCTURE_STYLES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific Custom Criteria Input + 1-Click Quick Criteria Chips */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <label
                    htmlFor="universal-custom-criteria-input"
                    className="text-[11px] font-semibold text-[#18181B]"
                  >
                    Kriteria & Klausul Hukum Khusus yang Wajib Dimuat (Opsional):
                  </label>
                  {universalCustomCriteria && (
                    <button
                      type="button"
                      onClick={() => setUniversalCustomCriteria('')}
                      className="text-[10px] text-[#57534E] hover:text-[#18181B] cursor-pointer"
                    >
                      Reset Kriteria
                    </button>
                  )}
                </div>
                <input
                  id="universal-custom-criteria-input"
                  data-testid="universal-custom-criteria-input"
                  type="text"
                  value={universalCustomCriteria}
                  onChange={(e) => setUniversalCustomCriteria(e.target.value)}
                  placeholder="Ketik kriteria hukum spesifik Anda (mis: wajib 2 saksi & materai, pengesampingan Pasal 1266 KUHPerdata, jaminan BPKB, denda keterlambatan, dsb.)..."
                  className="w-full px-3 py-1.5 text-xs text-[#18181B] bg-white border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A]"
                />
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-[#57534E] mr-0.5">
                    + Tambah kriteria cepat:
                  </span>
                  {UNIVERSAL_QUICK_CRITERIA_CHIPS.map((chip) => {
                    const isActive = universalCustomCriteria
                      .toLowerCase()
                      .includes(chip.toLowerCase());
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setUniversalCustomCriteria((prev) => {
                            if (prev.toLowerCase().includes(chip.toLowerCase())) {
                              return prev;
                            }
                            return prev.trim() ? `${prev.trim()}, ${chip}` : chip;
                          });
                        }}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                            : 'bg-white text-[#57534E] hover:text-[#1E3A8A] border border-[#D6D0C4]'
                        }`}
                      >
                        + {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stance, Language & Execute Bar */}
            <div className="mt-3.5 flex flex-col gap-3 pt-3 border-t border-[#F0ECE3]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#18181B] whitespace-nowrap">
                      Posisi Proteksi:
                    </span>
                    <select
                      data-testid="protection-stance-select"
                      aria-label="Posisi Proteksi"
                      value={stance}
                      onChange={(e) => {
                        const selectedStance = e.target.value;
                        handleApplyProtectionStanceToActiveDoc(selectedStance);
                      }}
                      className="text-xs font-semibold text-[#18181B] bg-[#F7F5F0] border border-[#D6D0C4] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                    >
                      {LEGAL_PROTECTION_STANCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.shortLabel} — {opt.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#57534E] whitespace-nowrap">Format Bahasa:</span>
                    <select
                      data-testid="document-language-select"
                      value={language}
                      onChange={(e) => {
                        const nextLang = e.target.value;
                        handleApplyProtectionStanceToActiveDoc(stance, nextLang);
                      }}
                      className="text-xs font-medium text-[#18181B] bg-[#F7F5F0] border border-[#D6D0C4] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                    >
                      <option value="Bahasa Indonesia Formal">Bahasa Indonesia Formal</option>
                      <option value="Bahasa Indonesia Lugas (Mudah Dipahami / Non-Korporat)">
                        Bahasa Indonesia Lugas (Non-Korporat / Praktis)
                      </option>
                      <option value="Bilingual (Bahasa Indonesia & Bahasa Inggris)">
                        Bilingual (Indonesia & Inggris)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {(commandInput || universalCustomCriteria) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCommandInput('');
                        setUniversalCustomCriteria('');
                      }}
                      className="px-3 py-2 text-xs font-medium text-[#57534E] hover:text-[#18181B] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Bersihkan
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isDrafting}
                    onClick={() => handleGenerateDraft()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] disabled:opacity-60 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isDrafting ? 'Menyusun Draf Dinamis...' : 'Buat Draf Dokumen Sekarang'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Interactive Legal Counsel Protection Stance Switcher & Active Strategy Banner */}
              {(() => {
                const activeProfile = getLegalStanceProfile(stance);
                const isProP1 =
                  activeProfile.mode === 'pro_party_one' ||
                  activeProfile.mode === 'aggressive_party_one';
                const isProP2 =
                  activeProfile.mode === 'pro_party_two' ||
                  activeProfile.mode === 'aggressive_party_two';
                const isStrict = activeProfile.mode === 'strict_conservative';

                return (
                  <div
                    data-testid="protection-stance-strategy-panel"
                    className={`p-3 rounded-md border transition-colors ${
                      isProP1
                        ? 'bg-blue-50/70 border-blue-300'
                        : isProP2
                        ? 'bg-amber-50/70 border-amber-300'
                        : isStrict
                        ? 'bg-purple-50/70 border-purple-300'
                        : 'bg-[#FAF9F6] border-[#E5E0D8]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#18181B]">
                          Mode Keberpihakan Kuasa Hukum (Pilih Posisi Proteksi):
                        </span>
                        <span
                          data-testid="active-protection-stance-badge"
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                            isProP1
                              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                              : isProP2
                              ? 'bg-amber-700 text-white border-amber-800'
                              : isStrict
                              ? 'bg-purple-800 text-white border-purple-900'
                              : 'bg-emerald-700 text-white border-emerald-800'
                          }`}
                        >
                          {activeProfile.badgeText} · {activeProfile.favoredPartyLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          data-testid="apply-stance-to-active-doc-btn"
                          onClick={() => handleApplyProtectionStanceToActiveDoc(stance)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#18181B] hover:bg-[#27272A] text-white rounded transition-colors cursor-pointer"
                        >
                          ⚡ Terapkan Posisi Ini ke Dokumen Aktif ({activeDoc.clauses.length} Pasal)
                        </button>
                      </div>
                    </div>

                    {/* Quick 1-Click Protection Stance Buttons for Lawyers (All 6 Positions) */}
                    <div
                      data-testid="protection-stance-quick-buttons"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mb-2.5"
                    >
                      {LEGAL_PROTECTION_STANCE_OPTIONS.map((opt) => {
                        const isSelected = opt.value === activeProfile.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            data-testid={`stance-option-btn-${opt.mode}`}
                            onClick={() => handleApplyProtectionStanceToActiveDoc(opt.value)}
                            className={`text-left px-2.5 py-1.5 rounded border text-[11px] transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] font-bold shadow-xs'
                                : 'bg-white hover:bg-[#F5F2EB] text-[#18181B] border-[#D6D0C4] font-medium'
                            }`}
                          >
                            <span className="truncate">{opt.shortLabel}</span>
                            <span
                              className={`shrink-0 px-1.5 py-0.2 text-[9px] font-bold uppercase rounded ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#F5F2EB] text-[#57534E]'
                              }`}
                            >
                              {isSelected ? 'AKTIF' : 'Pilih'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Stance Strategy Explanation & Injected Clause Mechanisms */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-2 border-t border-black/10 text-[11px]">
                      <p className="text-[#44403C] leading-relaxed">
                        <strong className="text-[#18181B]">Strategi Klausul Aktif:</strong>{' '}
                        {activeProfile.strategyDescription}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 shrink-0">
                        {activeProfile.keyMechanisms.map((mech, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 text-[#18181B] border border-[#D6D0C4] rounded"
                          >
                            ✓ {mech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Live AI Drafting Progress Banner */}
            {isDrafting && (
              <div className="mt-4 p-4 bg-[#F7F5F0] border border-[#D6D0C4] rounded-md">
                <div className="flex items-center justify-between text-xs font-medium text-[#1E3A8A] mb-2">
                  <span>{draftingStagesText[draftingStage]}</span>
                  <span className="font-code tabular-nums">Tahap {draftingStage + 1} / 4</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E0D8] rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[#1E3A8A] transition-all duration-500"
                    style={{ width: `${((draftingStage + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-xs font-medium text-red-700 hover:underline whitespace-nowrap"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Quick Dynamic Legal 1-Command Templates Bar (Across Perdata Perorangan, Perikatan Jasa/HKI, Properti, Yayasan, Sengketa & Korporasi) */}
            <div className="mt-4 pt-3.5 border-t border-[#F0ECE3]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-medium text-[#57534E]">
                  Contoh Perintah Instrumen Hukum Dinamis (Perdata Perorangan, HKI/Jasa, Properti, SK Badan, Perdamaian & Korporasi):
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    'Semua',
                    ...Array.from(new Set(UNIVERSAL_EXTENDED_PRESETS.map((p) => p.domain))),
                  ].map((domTab) => (
                    <button
                      key={domTab}
                      type="button"
                      onClick={() => setPresetDomainFilter(domTab)}
                      className={`px-2 py-0.5 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                        presetDomainFilter === domTab
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#FAF9F6] text-[#57534E] border-[#E5E0D8] hover:text-[#18181B]'
                      }`}
                    >
                      {domTab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {UNIVERSAL_EXTENDED_PRESETS.filter(
                  (p) => presetDomainFilter === 'Semua' || p.domain === presetDomainFilter
                ).map((preset) => (
                  <div
                    key={preset.id}
                    className="group flex flex-col justify-between p-2.5 bg-[#FAF9F6] hover:bg-[#F2EFE9] border border-[#E5E0D8] rounded-md transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[9.5px] font-code font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded">
                          {preset.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#18181B] group-hover:text-[#1E3A8A] transition-colors line-clamp-1">
                        {preset.label}
                      </div>
                      <p className="text-[11px] text-[#57534E] mt-0.5 line-clamp-2 leading-snug">
                        {preset.prompt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#E5E0D8]/70 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setCommandInput(preset.prompt);
                          setStance(preset.stance);
                          setUniversalCustomCriteria(preset.criteria);
                          promptRef.current?.focus();
                        }}
                        className="font-medium text-[#57534E] hover:text-[#18181B] cursor-pointer whitespace-nowrap"
                      >
                        Isi + Kriteria
                      </button>
                      <button
                        type="button"
                        disabled={isDrafting}
                        onClick={() => {
                          setCommandInput(preset.prompt);
                          setStance(preset.stance);
                          setUniversalCustomCriteria(preset.criteria);
                          handleGenerateDraft(preset.prompt, preset.stance, preset.criteria);
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-[#1E3A8A] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        <span>Langsung Buat</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedicated Quick Launcher for SK, ST, Aanmaning, BPSK, LAPS SJK, Gugatan Sederhana & Gugatan */}
            <div className="mt-4 pt-3.5 border-t border-[#F0ECE3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B]">
                <FileSignature className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <span>
                  Generator Cepat SK (Surat Kuasa), ST (Surat Tugas) & Berkas Sengketa:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    {
                      label: 'SK / ST Aanmaning',
                      type: 'aanmaning' as PowerOfAttorneyType,
                      mode: 'bundel_sk_st' as DocumentBuildMode,
                    },
                    {
                      label: 'SK / ST BPSK',
                      type: 'bpsk' as PowerOfAttorneyType,
                      mode: 'bundel_sk_st' as DocumentBuildMode,
                    },
                    {
                      label: 'SK / ST LAPS SJK',
                      type: 'laps_sjk' as PowerOfAttorneyType,
                      mode: 'bundel_sk_st' as DocumentBuildMode,
                    },
                    {
                      label: 'Gugatan Sederhana (SK/ST/Gugatan)',
                      type: 'gugatan_sederhana' as PowerOfAttorneyType,
                      mode: 'naskah_perkara' as DocumentBuildMode,
                    },
                    {
                      label: 'Gugatan Perdata (SK/ST/Gugatan)',
                      type: 'gugatan_perdata' as PowerOfAttorneyType,
                      mode: 'naskah_perkara' as DocumentBuildMode,
                    },
                  ] as const
                ).map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => {
                      setSuratKuasaInitialType(btn.type);
                      setSuratKuasaInitialDocMode(btn.mode);
                      setIsSuratKuasaModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN 3-COLUMN LEGAL WORKBENCH */}
      <main
        ref={editorRef}
        className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* LEFT SIDEBAR: DOCUMENT ARCHIVE, VERSION CONTROL (SIDE-BY-SIDE COMPARE & REVERT), GLOBAL AI REVISION, & CLAUSE OUTLINE */}
        <aside className="no-print lg:col-span-3 space-y-5">
          {/* Active Documents List */}
          <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Arsip Dokumen ({documents.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuratKuasaModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded cursor-pointer whitespace-nowrap"
                  title="Buka Generator SK, ST, Aanmaning, BPSK, LAPS, Gugatan Sederhana & Gugatan"
                >
                  <FileSignature className="w-3 h-3" />
                  <span>+ SK / ST & Gugatan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCommandInput('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => promptRef.current?.focus(), 200);
                  }}
                  className="text-xs font-medium text-[#1E3A8A] hover:underline whitespace-nowrap cursor-pointer"
                >
                  + Draf Baru
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = doc.id === activeDoc.id;
                return (
                  <div
                    key={doc.id}
                    className={`group flex items-start justify-between gap-2 p-2.5 rounded-md border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F7F5F0] border-[#1E3A8A]'
                        : 'bg-white border-transparent hover:bg-[#FAF9F6] hover:border-[#E5E0D8]'
                    }`}
                    onClick={() => setActiveDocId(doc.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#18181B] truncate">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-[#57534E] truncate mt-0.5">
                        {doc.category} ·{' '}
                        <span className="font-code tabular-nums">{doc.clauses.length}</span> Pasal ·{' '}
                        <span className="font-code tabular-nums">
                          {(doc.versions || []).length}
                        </span>{' '}
                        Versi
                      </div>
                    </div>
                    {documents.length > 1 && (
                      <button
                        type="button"
                        title="Hapus dokumen"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#78716C] hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* VERSION HISTORY, SIDE-BY-SIDE COMPARISON & REVERT SYSTEM */}
          <VersionHistoryPanel
            document={activeDoc}
            onSaveSnapshot={handleSaveManualSnapshot}
            onRevertToVersion={handleRevertToVersion}
            onCompareVersions={handleOpenCompareVersions}
            isComparing={viewMode === 'compare'}
          />

          {/* Global 1-Command Document Modifier */}
          <div className="bg-white border border-[#E5E0D8] rounded-lg p-4">
            <h2 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5 mb-1.5">
              <Wand2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Revisi Seluruh Dokumen (1 Perintah)</span>
            </h2>
            <p className="text-[11px] text-[#57534E] mb-2.5 leading-relaxed">
              Perintahkan AI untuk mengubah nilai, pihak, atau ketentuan di seluruh naskah sekaligus.
            </p>
            <form onSubmit={handleGlobalTransform} className="space-y-2">
              <textarea
                rows={2}
                value={globalRevisionPrompt}
                onChange={(e) => setGlobalRevisionPrompt(e.target.value)}
                placeholder="Contoh: Ubah domisili hukum ke BANI Jakarta dan denda keterlambatan menjadi 2%..."
                className="w-full px-2.5 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-md focus:outline-none focus:border-[#1E3A8A]"
              />
              <button
                type="submit"
                disabled={isTransformingDoc || !globalRevisionPrompt.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#18181B] rounded-md hover:bg-[#27272A] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isTransformingDoc ? 'Menerapkan Revisi...' : 'Terapkan ke Seluruh Naskah'}
                </span>
              </button>
            </form>
          </div>

          {/* Risk Analysis Dashboard (Dynamic Contract Health Score, 30-Day Trend-Line, D3 Regulatory Compliance Heatmap, Risk Evolution Chart & Counts) */}
          <RiskAnalysisDashboard
            clauses={activeDoc.clauses}
            versions={activeDoc.versions || []}
            regulationSearchHistory={regulationSearchHistory}
            onSaveSnapshot={(label) =>
              handleSaveManualSnapshot(label || 'Snapshot Health Score 30H')
            }
            onApplyRegulatoryUpdateToClause={handleApplyRegulatoryUpdateToClause}
            onApplyAllRegulatoryUpdates={handleApplyAllRegulatoryUpdates}
            onAddSearchHistoryQuery={(q) => {
              handleRecordRegulationSearch(q);
              showToast(
                `Regulasi "${q}" ditambahkan ke Riwayat 'Cari Pasal & UU' dan dipetakan pada D3 Regulatory Compliance Heatmap.`
              );
            }}
            onOpenRegulationSearchTab={() => {
              setRightTab('regulations');
              setActiveNavSection('regulations');
              setTimeout(() => {
                rightInspectorRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
              }, 80);
            }}
            onChangeClauseRiskLevel={(clauseId, newRisk) => {
              const target = activeDoc.clauses.find((c) => c.id === clauseId);
              const prevRisk = target?.riskLevel || 'Standar';
              updateActiveDocument(
                (d) => ({
                  ...d,
                  updatedAt: `Tingkat risiko ${target?.number || 'Pasal'} diubah ke ${newRisk}`,
                  clauses: d.clauses.map((item) =>
                    item.id === clauseId ? { ...item, riskLevel: newRisk } : item
                  ),
                }),
                `Perubahan Tingkat Risiko ${target?.number || 'Pasal'} (${target?.title || ''}) dari ${prevRisk} menjadi ${newRisk}`
              );
              showToast(
                `Tingkat risiko ${target?.number || 'Pasal'} diperbarui menjadi "${newRisk}" & tercatat di Audit Evolution Log.`
              );
            }}
            onJumpToClause={(clauseId) => {
              if (viewMode === 'compare') setViewMode('structured');
              const el = document.getElementById(`clause-${clauseId}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />

          {/* Quick Launcher Card for Audit Evolution Log (Visual Timeline & Client Legal Justifications) */}
          <div className="bg-white border border-[#E5E0D8] rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Audit Evolution Log & Justifikasi Klien</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-code font-bold bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded">
                Linimasa Visual
              </span>
            </div>
            <p className="text-[11px] text-[#57534E] leading-snug">
              Tinjau linimasa seluruh perubahan tingkat risiko & modifikasi klausul beserta argumen hukum untuk meyakinkan klien Anda.
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="sidebar-open-audit-evolution-modal-btn"
                onClick={() => setIsAuditEvolutionModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded-md transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka Audit Evolution Log</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRightTab('audit');
                  rightInspectorRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-[#1E3A8A] bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md transition-colors cursor-pointer"
              >
                Panel Audit
              </button>
            </div>
          </div>

          {/* Document Structure / Clause Navigation with Drag-and-Drop Reordering, Sort Clauses Menu & Unresolved Comment Highlight/Counter */}
          <div
            id="clause-navigation-sidebar"
            data-testid="clause-navigation-sidebar"
            className="bg-white border border-[#E5E0D8] rounded-lg p-4"
          >
            {(() => {
              const allComments = activeDoc.comments || [];
              const totalUnresolved = allComments.filter(
                (c) => c.status !== 'Diselesaikan'
              ).length;
              const clausesWithUnresolved = activeDoc.clauses.filter((cl) =>
                allComments.some(
                  (c) =>
                    (c.clauseId === cl.id || c.clauseNumber === cl.number) &&
                    c.status !== 'Diselesaikan'
                )
              ).length;

              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xs font-semibold text-[#18181B]">
                        Daftar Isi Pasal (
                        <span className="font-code tabular-nums">{activeDoc.clauses.length}</span>)
                      </h2>
                      <span
                        data-testid="sidebar-unresolved-counter"
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-code font-bold rounded border transition-colors ${
                          totalUnresolved > 0
                            ? showUnresolvedInSidebar
                              ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                        title={
                          totalUnresolved > 0
                            ? `${totalUnresolved} komentar belum diselesaikan pada ${clausesWithUnresolved} pasal`
                            : 'Seluruh komentar pada dokumen ini telah diselesaikan'
                        }
                      >
                        <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                        <span>
                          {totalUnresolved > 0
                            ? `${totalUnresolved} Unresolved`
                            : '0 Unresolved'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#D6D0C4] rounded px-1.5 py-0.5">
                        <ArrowUpDown className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                        <select
                          value={activeClauseSort}
                          onChange={(e) => {
                            const val = e.target.value as
                              | 'category'
                              | 'risk_desc'
                              | 'risk_asc'
                              | 'title_asc'
                              | 'title_desc';
                            if (val) handleSortClauses(val);
                          }}
                          aria-label="Sort Clauses Menu"
                          className="text-[10.5px] font-semibold text-[#18181B] bg-transparent focus:outline-none cursor-pointer"
                        >
                          <option value="">Sort Clauses...</option>
                          <option value="category">By Category (Kategori)</option>
                          <option value="risk_desc">By Risk Level (Kritis → Standar)</option>
                          <option value="risk_asc">By Risk Level (Standar → Kritis)</option>
                          <option value="title_asc">By Alphabetical Title (A → Z)</option>
                          <option value="title_desc">By Alphabetical Title (Z → A)</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddManualClause}
                        className="text-xs font-medium text-[#1E3A8A] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        + Pasal Manual
                      </button>
                    </div>
                  </div>

                  {/* Unresolved Clauses Attention Banner synced with 'Show Unresolved' toggle */}
                  {showUnresolvedInSidebar && (
                    <div
                      data-testid="sidebar-unresolved-attention-banner"
                      className={`mb-2.5 px-2.5 py-1.5 rounded border text-[10.5px] flex items-center justify-between gap-2 transition-colors ${
                        totalUnresolved > 0
                          ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <AlertCircle
                          className={`w-3 h-3 shrink-0 ${
                            totalUnresolved > 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        />
                        <span className="font-medium truncate">
                          {totalUnresolved > 0
                            ? `${clausesWithUnresolved} Pasal perlu ditinjau (${totalUnresolved} komentar terbuka)`
                            : 'Semua komentar klausul telah diselesaikan'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUnresolvedInSidebar(false)}
                        className="text-[10px] font-semibold underline opacity-80 hover:opacity-100 shrink-0 cursor-pointer"
                      >
                        Sembunyikan
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
            <p className="text-[10.5px] text-[#57534E] mb-2.5">
              Seret (drag & drop) baris pasal di bawah untuk mengubah urutan pasal secara intuitif.
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {activeDoc.clauses.map((clause, idx) => {
                const isDraggingThis = draggedClauseIdx === idx;
                const isDragOverThis =
                  dragOverClauseIdx === idx &&
                  draggedClauseIdx !== null &&
                  draggedClauseIdx !== idx;
                const clauseCommentsForNav = (activeDoc.comments || []).filter(
                  (c) => c.clauseId === clause.id || c.clauseNumber === clause.number
                );
                const unresolvedCount = clauseCommentsForNav.filter(
                  (c) => c.status !== 'Diselesaikan'
                ).length;
                const hasUnresolvedHighlight =
                  showUnresolvedInSidebar && unresolvedCount > 0;

                return (
                  <div
                    key={clause.id}
                    data-testid={`sidebar-clause-item-${clause.id}`}
                    data-unresolved-count={unresolvedCount}
                    draggable={!isReviewOnlyMode}
                    onDragStart={(e) => {
                      setDraggedClauseIdx(idx);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(idx));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverClauseIdx !== idx) {
                        setDragOverClauseIdx(idx);
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOverClauseIdx(idx);
                    }}
                    onDragLeave={() => {
                      if (dragOverClauseIdx === idx) {
                        setDragOverClauseIdx(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const sourceIdx =
                        draggedClauseIdx !== null
                          ? draggedClauseIdx
                          : Number(e.dataTransfer.getData('text/plain'));
                      setDraggedClauseIdx(null);
                      setDragOverClauseIdx(null);
                      if (!Number.isNaN(sourceIdx)) {
                        handleReorderClauseDragDrop(sourceIdx, idx);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedClauseIdx(null);
                      setDragOverClauseIdx(null);
                    }}
                    className={`group flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-md border transition-all ${
                      isDraggingThis
                        ? 'opacity-45 bg-[#F7F5F0] border-dashed border-[#1E3A8A]'
                        : isDragOverThis
                        ? 'bg-[#EFF6FF] border-[#1E3A8A] ring-1 ring-[#1E3A8A]'
                        : hasUnresolvedHighlight
                        ? 'bg-rose-50/90 border-rose-300 border-l-4 border-l-rose-600 ring-1 ring-rose-200/70 shadow-2xs'
                        : 'bg-white border-transparent hover:bg-[#FAF9F6] hover:border-[#E5E0D8]'
                    } ${!isReviewOnlyMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    title={
                      unresolvedCount > 0
                        ? `${clause.number}: ${unresolvedCount} komentar belum diselesaikan (Perlu Perhatian)`
                        : 'Seret untuk mengubah urutan pasal, atau klik untuk melompat ke pasal'
                    }
                  >
                    <GripVertical className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#1E3A8A] shrink-0" />
                    <a
                      href={`#clause-${clause.id}`}
                      onClick={() => {
                        if (viewMode === 'compare') setViewMode('structured');
                        if (unresolvedCount > 0) setOpenCommentClauseId(clause.id);
                      }}
                      className={`flex-1 truncate ${
                        hasUnresolvedHighlight
                          ? 'text-rose-950 font-semibold'
                          : 'text-[#57534E] group-hover:text-[#18181B]'
                      }`}
                    >
                      <span
                        className={`font-code font-medium ${
                          hasUnresolvedHighlight ? 'text-rose-900 font-bold' : 'text-[#18181B]'
                        }`}
                      >
                        {clause.number}
                      </span>
                      <span className="mx-1.5">·</span>
                      <span>{clause.title}</span>
                    </a>

                    {/* Unresolved Comments Counter / Highlight Badge in Clause Navigation Sidebar */}
                    {unresolvedCount > 0 && (
                      <span
                        data-testid={`sidebar-clause-unresolved-badge-${clause.id}`}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-code font-bold shrink-0 transition-all ${
                          showUnresolvedInSidebar
                            ? 'bg-rose-700 text-white shadow-2xs ring-2 ring-rose-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                        title={`${unresolvedCount} komentar belum diselesaikan pada ${clause.number}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            showUnresolvedInSidebar ? 'bg-white animate-pulse' : 'bg-amber-600'
                          }`}
                        />
                        <span>
                          {showUnresolvedInSidebar
                            ? `${unresolvedCount} Unresolved`
                            : unresolvedCount}
                        </span>
                      </span>
                    )}

                    {/* Resolved Indicator when all comments on this clause are resolved */}
                    {unresolvedCount === 0 && clauseCommentsForNav.length > 0 && (
                      <span
                        data-testid={`sidebar-clause-resolved-badge-${clause.id}`}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] font-code font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0"
                        title={`Seluruh ${clauseCommentsForNav.length} komentar pada ${clause.number} telah diselesaikan`}
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                        <span>Resolved</span>
                      </span>
                    )}

                    {(clause.regulatoryUpdateMarker || clause.aiChangeRecord) && (
                      <span
                        data-testid={`sidebar-clause-reg-marker-${clause.id}`}
                        title={
                          clause.regulatoryUpdateMarker?.status === 'needs_review'
                            ? `Tanda Cek Regulasi: ${clause.number} perlu diisi/diubah sesuai ${clause.regulatoryUpdateMarker.regReference}`
                            : clause.aiChangeRecord
                            ? `Diubah AI (${clause.aiChangeRecord.sourceLabel}): ${clause.aiChangeRecord.summary}`
                            : `${clause.number} telah diisi/diganti sesuai ${clause.regulatoryUpdateMarker?.regReference}`
                        }
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-code font-bold shrink-0 ${
                          clause.regulatoryUpdateMarker?.status === 'needs_review'
                            ? 'bg-amber-100 text-amber-900 border border-amber-400'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                        }`}
                      >
                        <span>
                          {clause.regulatoryUpdateMarker?.status === 'needs_review'
                            ? '📌 Cek UU'
                            : clause.aiChangeRecord
                            ? '✨ Diubah AI'
                            : '✓ Diisi UU'}
                        </span>
                      </span>
                    )}

                    {clause.plainSummary && (
                      <span
                        title={`Disederhanakan oleh AI (Plain Language): ${clause.plainSummary}`}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-amber-50 text-[#1E3A8A] border border-amber-300 shrink-0"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400 shrink-0" />
                        <span>AI</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER VIEWPORT: EDITABLE A4 LEGAL CONTRACT PAPER CANVAS OR SIDE-BY-SIDE VERSION COMPARISON */}
        <section className="lg:col-span-6 space-y-4">
          {/* Document Toolbar (No-Print) */}
          <div className="no-print bg-white border border-[#E5E0D8] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Segmented Mode Control */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F7F5F0] rounded-md border border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setViewMode('structured')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  viewMode === 'structured'
                    ? 'bg-white text-[#18181B] shadow-xs'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor Terstruktur</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('folio')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  viewMode === 'folio'
                    ? 'bg-white text-[#18181B] shadow-xs'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Akta</span>
              </button>
              {docVersions.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setViewMode('compare')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    viewMode === 'compare'
                      ? 'bg-white text-[#1E3A8A] shadow-xs font-semibold'
                      : 'text-[#57534E] hover:text-[#18181B]'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Bandingkan Versi</span>
                </button>
              )}
            </div>

            {/* Quick Export, Surat Kuasa Klien, Legal Memo, Share Draft Link, Version Save & Copy Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSuratKuasaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Buat SK (Surat Kuasa), ST (Surat Tugas), Aanmaning, BPSK, LAPS, Gugatan Sederhana, atau Gugatan Perdata"
              >
                <FileSignature className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Generator SK, ST & Gugatan</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLegalMemoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Buka & ekspor Legal Memo (rangkuman isi draf, analisis risiko, dan poin krusial bagi klien siap presentasi)"
              >
                <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Ekspor Legal Memo</span>
              </button>
              <button
                type="button"
                onClick={handleOpenShareModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1E3A8A] bg-[#1E3A8A]/8 hover:bg-[#1E3A8A]/15 border border-[#1E3A8A]/30 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Bagikan tautan draf agar pihak lain dapat memberi komentar langsung pada pasal tertentu tanpa mengubah naskah asli"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>
                  Link Berbagi Draf ({(activeDoc.comments || []).length} Komentar)
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveManualSnapshot('Checkpoint Editor')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Simpan checkpoint versi saat ini"
              >
                <History className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Simpan Versi</span>
              </button>
              <button
                type="button"
                onClick={handleCopyFullText}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Naskah</span>
                  </>
                )}
              </button>
              {/* Secondary Language Toggle Button (Real-Time Entire Document Content Switch: Bahasa Indonesia ⇄ English) */}
              <button
                type="button"
                id="toolbar-document-language-toggle"
                data-testid="toolbar-language-toggle-btn"
                data-active-language={activeDocumentLanguage}
                aria-label="Toggle Document Language between Bahasa Indonesia and English"
                onClick={handleToggleDocumentLanguage}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap cursor-pointer ${
                  activeDocumentLanguage === 'en'
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs ring-2 ring-[#93C5FD]/50'
                    : 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] border-[#93C5FD]'
                }`}
                title="Alihkan seluruh isi dokumen hukum secara real-time antara Bahasa Indonesia dan Bahasa Inggris (Switch Entire Document Content: Bahasa Indonesia ⇄ English)"
              >
                <Languages className="w-3.5 h-3.5 shrink-0" />
                <span
                  data-testid="toolbar-lang-pill-id"
                  className={`px-1.5 py-0.5 rounded text-[10.5px] font-code font-bold transition-colors ${
                    activeDocumentLanguage === 'id'
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-white/15 text-blue-100'
                  }`}
                >
                  🇮🇩 Bahasa Indonesia
                </span>
                <span className="text-[10px] opacity-80">⇄</span>
                <span
                  data-testid="toolbar-lang-pill-en"
                  className={`px-1.5 py-0.5 rounded text-[10.5px] font-code font-bold transition-colors ${
                    activeDocumentLanguage === 'en'
                      ? 'bg-amber-300 text-[#18181B]'
                      : 'bg-white text-[#57534E] border border-[#BFDBFE]'
                  }`}
                >
                  🇬🇧 English
                </span>
              </button>

              {/* Toolbar Shortcut to Document QR Code Generator at Bottom of Legal Document */}
              <a
                href="#document-verification-qr-footer"
                data-testid="toolbar-qr-generator-btn"
                onClick={(e) => {
                  e.preventDefault();
                  const qrFooterEl = document.getElementById('document-verification-qr-footer');
                  qrFooterEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  showToast(
                    `Generator Kode QR Dokumen aktif di bagian bawah akta (${activeDoc.documentNumber}) — Mengenkode Shareable Draft URL untuk dicetak.`
                  );
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-[#FAF9F6] hover:bg-[#EFF6FF] border border-[#D6D0C4] hover:border-[#93C5FD] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Lompat ke QR Code Generator di bagian bawah dokumen hukum yang mengenkode Shareable Draft URL"
              >
                <QrCode className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>QR Code Generator</span>
              </a>

              {/* Dual-Language Layout Toggle (Bilingual Contract View UU No. 24/2009) */}
              <div
                data-testid="dual-language-toolbar-control"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs transition-colors ${
                  dualLanguageEnabled
                    ? 'bg-[#EFF6FF] border-[#1E3A8A] text-[#1E3A8A]'
                    : 'bg-[#FAF9F6] border-[#D6D0C4] text-[#18181B]'
                }`}
              >
                <label
                  className="inline-flex items-center gap-1.5 font-semibold cursor-pointer whitespace-nowrap"
                  title="Tampilkan seluruh pasal dalam tata letak dua bahasa berdampingan (Dual-Language Layout)"
                >
                  <input
                    type="checkbox"
                    data-testid="dual-language-layout-toggle"
                    checked={dualLanguageEnabled}
                    onChange={(e) => {
                      const nextVal = e.target.checked;
                      setDualLanguageEnabled(nextVal);
                      showToast(
                        nextVal
                          ? `Dual-Language Layout aktif: Menampilkan seluruh pasal dalam Bahasa Indonesia & ${targetTranslationLang} secara berdampingan.`
                          : 'Dual-Language Layout global dinonaktifkan.'
                      );
                    }}
                    className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                  />
                  <Columns2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Dual-Language Layout</span>
                </label>
                <select
                  aria-label="Bahasa Target Dual-Language Layout"
                  data-testid="global-translation-language-select"
                  value={targetTranslationLang}
                  onChange={(e) =>
                    setTargetTranslationLang(e.target.value as SupportedLegalLanguage)
                  }
                  className="px-1.5 py-0.5 text-[10.5px] font-semibold bg-white border border-[#BFDBFE] rounded text-[#1E3A8A] focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LEGAL_LANGUAGES.map((l) => (
                    <option key={l.lang} value={l.lang}>
                      {l.flag} {l.lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Open AI Clause History Side-Panel Button */}
              <button
                type="button"
                data-testid="open-ai-clause-history-panel-btn"
                onClick={() => {
                  setFocusedAiHistoryClauseId(null);
                  setRightTab('clause_history');
                  setTimeout(() => {
                    rightInspectorRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                    });
                  }, 80);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                  rightTab === 'clause_history'
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-[#FAF9F6] text-[#1E3A8A] hover:bg-[#EFF6FF] border-[#BFDBFE]'
                }`}
                title="Buka panel samping AI Clause History untuk melacak & me-revert iterasi AI per pasal"
              >
                <History className="w-3.5 h-3.5" />
                <span>AI Clause History</span>
              </button>

              {/* Document Settings: Email Notifications Toggle for Instant Comment & Resolution Alerts */}
              <div
                data-testid="document-settings-email-notifications"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs transition-colors ${
                  emailNotificationsEnabled
                    ? 'bg-[#EFF6FF]/70 border-[#BFDBFE] text-[#1E3A8A]'
                    : 'bg-[#FAF9F6] border-[#D6D0C4] text-[#57534E]'
                }`}
              >
                <label
                  className="inline-flex items-center gap-1.5 font-medium cursor-pointer whitespace-nowrap"
                  title="Pengaturan Dokumen: Aktifkan atau nonaktifkan peringatan email instan saat komentar baru ditambahkan atau diselesaikan oleh pihak lain"
                >
                  <input
                    type="checkbox"
                    data-testid="document-email-notifications-toggle"
                    checked={emailNotificationsEnabled}
                    onChange={(e) => handleToggleEmailNotifications(e.target.checked)}
                    className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                  />
                  <BellRing
                    className={`w-3.5 h-3.5 ${
                      emailNotificationsEnabled ? 'text-[#1E3A8A]' : 'text-[#78716C]'
                    }`}
                  />
                  <span className="text-[#18181B]">Email Notifications</span>
                  <span
                    className={`px-1.5 py-0.2 text-[9.5px] font-code font-bold rounded uppercase ${
                      emailNotificationsEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {emailNotificationsEnabled ? 'ON' : 'OFF'}
                  </span>
                </label>
                {emailNotificationsEnabled && (
                  <div className="flex items-center gap-1 pl-1.5 border-l border-[#BFDBFE]">
                    <Mail className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                    <input
                      type="email"
                      data-testid="document-email-notifications-recipient"
                      value={ownerNotificationEmail}
                      onChange={(e) => handleChangeOwnerEmailSetting(e.target.value)}
                      placeholder="Email tujuan..."
                      className="w-36 px-1.5 py-0.5 text-[10.5px] font-code text-[#18181B] bg-white border border-[#BFDBFE] rounded focus:outline-none focus:border-[#1E3A8A]"
                      title="Alamat email penerima notifikasi instan saat komentar ditambahkan atau diselesaikan oleh pihak lain"
                    />
                  </div>
                )}
              </div>

              {/* Inline Watermark Toggle for PDF Export Settings */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md text-xs">
                <label className="inline-flex items-center gap-1.5 font-medium text-[#18181B] cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={pdfWatermarkEnabled}
                    onChange={(e) => setPdfWatermarkEnabled(e.target.checked)}
                    className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                  />
                  <Stamp className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Watermark PDF</span>
                </label>
                {pdfWatermarkEnabled && (
                  <div className="flex items-center gap-1 pl-1 border-l border-[#E5E0D8]">
                    {(['DRAFT', 'CONFIDENTIAL'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPdfWatermarkText(preset)}
                        className={`px-1.5 py-0.5 text-[10px] font-code font-bold rounded cursor-pointer transition-colors ${
                          pdfWatermarkText.toUpperCase() === preset
                            ? 'bg-[#1E3A8A] text-white'
                            : 'bg-white text-[#57534E] border border-[#D6D0C4] hover:text-[#18181B]'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                    <input
                      type="text"
                      value={pdfWatermarkText}
                      onChange={(e) => setPdfWatermarkText(e.target.value.toUpperCase())}
                      placeholder="Custom..."
                      className="w-24 px-1.5 py-0.5 text-[10.5px] font-code font-semibold text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                      title="Ketik teks watermark diagonal kustom untuk seluruh halaman PDF"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>
                  {pdfWatermarkEnabled
                    ? `Unduh PDF (${(pdfWatermarkText || 'DRAFT').trim()})`
                    : 'Unduh PDF'}
                </span>
              </button>
            </div>
          </div>

          {/* REVIEW-ONLY SHARED LINK BANNER */}
          {isReviewOnlyMode && (
            <div className="no-print mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-md flex flex-wrap items-center justify-between gap-3 font-ui">
              <div className="flex items-center gap-2.5 text-xs text-amber-950">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Mode Tinjauan Link Berbagi Draf Aktif (Naskah Asli Terkunci):</strong> Anda dapat membaca seluruh akta dan memberikan komentar langsung pada setiap pasal di bawah tanpa mengubah naskah asli.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOnlyMode(false)}
                className="px-3 py-1 text-xs font-medium text-white bg-[#18181B] hover:bg-[#27272A] rounded cursor-pointer"
              >
                Kembali ke Mode Editor Penuh
              </button>
            </div>
          )}

          {/* BULK FORMATTING & RISK AUTOMATION TOOLBAR */}
          {viewMode !== 'compare' && (
            <BulkFormatToolbar
              config={bulkFormatConfig}
              onChangeConfig={setBulkFormatConfig}
              onApplyBulkFormat={handleApplyBulkFormat}
              onSyncAllClausesByRisk={handleSyncAllClausesByRisk}
              onBulkImportClauses={handleBulkImportClauses}
              currentClauseCount={activeDoc.clauses.length}
              isImportingBulk={isImportingBulk}
              smartFormatHistory={activeDoc.smartFormatHistory || []}
              onRestoreFormatState={handleRestoreFormatState}
            />
          )}

          {viewMode === 'compare' && leftComparedVersion && rightComparedVersion ? (
            /* MODE 3: SIDE-BY-SIDE VERSION COMPARISON VIEW */
            <VersionComparisonView
              leftVersion={leftComparedVersion}
              rightVersion={rightComparedVersion}
              allVersions={docVersions}
              onChangeLeftVersion={setCompareLeftVersionId}
              onChangeRightVersion={setCompareRightVersionId}
              onRevertToVersion={handleRevertToVersion}
              onClose={() => setViewMode('structured')}
            />
          ) : (
            /* THE A4 LEGAL PAPER SHEET (STRUCTURED EDITOR OR FOLIO VIEW WITH HOVER GLOSSARY TOOLTIPS) */
            <article
              className={`print-only-sheet bg-white border border-[#D6D0C4] rounded-lg px-6 sm:px-10 py-8 sm:py-12 ${
                bulkFormatConfig.fontStyle === 'sans_corporate'
                  ? 'font-ui'
                  : bulkFormatConfig.fontStyle === 'mono_audit'
                  ? 'font-code'
                  : 'font-legal'
              }`}
            >
              {/* Document Metadata Header + Real-Time Document Language Status */}
              <div className="no-print flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E5E0D8] text-xs text-[#57534E]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    data-testid="active-document-language-badge"
                    data-language={activeDocumentLanguage}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-code font-bold border ${
                      activeDocumentLanguage === 'en'
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]'
                    }`}
                  >
                    <span>
                      {activeDocumentLanguage === 'en'
                        ? '🇬🇧 Active Language: English'
                        : '🇮🇩 Bahasa Aktif: Bahasa Indonesia'}
                    </span>
                  </span>
                  <span>·</span>
                  <span>{activeDoc.category}</span>
                  <span>·</span>
                  <span>{activeDoc.jurisdiction}</span>
                </div>
                <div className="font-code tabular-nums">
                  {activeDocumentLanguage === 'en' ? 'Version' : 'Versi'}{' '}
                  {(activeDoc.versions || [])[0]?.versionLabel || 'v1.0'} · {activeDoc.updatedAt}
                </div>
              </div>

              {viewMode === 'structured' ? (
                /* MODE 1: INTERACTIVE IN-PLACE STRUCTURED LEGAL EDITOR WITH AUTOMATIC GLOSSARY TOOLTIPS */
                <div className="space-y-7 font-legal text-[#18181B]">
                  {/* Kepala Akta / Judul & Nomor Surat */}
                  <div className="text-center space-y-2 pb-6 border-b-2 border-[#18181B]">
                    <input
                      type="text"
                      value={activeDoc.title}
                      onChange={(e) =>
                        updateActiveDocument((d) => ({ ...d, title: e.target.value }))
                      }
                      aria-label="Judul Dokumen Hukum"
                      className="w-full text-center text-xl sm:text-2xl font-legal font-semibold uppercase tracking-wide text-[#18181B] bg-transparent border-b border-transparent hover:border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none py-1"
                    />
                    <input
                      type="text"
                      value={activeDoc.subtitle}
                      onChange={(e) =>
                        updateActiveDocument((d) => ({ ...d, subtitle: e.target.value }))
                      }
                      aria-label="Subjudul Dokumen"
                      className="w-full text-center text-sm font-ui text-[#57534E] bg-transparent border-b border-transparent hover:border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none py-0.5"
                    />
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <span className="text-xs font-ui text-[#57534E]">
                        {activeDocumentLanguage === 'en' ? 'Document No.:' : 'Nomor:'}
                      </span>
                      <input
                        type="text"
                        value={activeDoc.documentNumber}
                        onChange={(e) =>
                          updateActiveDocument((d) => ({ ...d, documentNumber: e.target.value }))
                        }
                        aria-label="Nomor Dokumen"
                        className="text-center text-xs font-code font-medium text-[#18181B] bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#E5E0D8] focus:border-[#1E3A8A] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Kalimat Pembuka (Opening Komparisi) with Glossary Tooltips */}
                  <div>
                    <label className="no-print block text-[11px] font-ui font-medium text-[#57534E] mb-1">
                      {activeDocumentLanguage === 'en'
                        ? 'Opening Deed Clause (Legal Comparition):'
                        : 'Kalimat Pembuka Akta (Komparisi):'}
                    </label>
                    <EditableAnnotatedParagraph
                      rows={3}
                      value={activeDoc.openingText}
                      extraGlossaryItems={extraAiGlossary}
                      onChange={(val) =>
                        updateActiveDocument((d) => ({ ...d, openingText: val }))
                      }
                    />
                  </div>

                  {/* Identitas Para Pihak (Party 1 & Party 2) */}
                  <div className="space-y-4">
                    {/* Pihak Pertama */}
                    <div className="p-4 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-ui font-semibold text-[#1E3A8A]">
                        <span>
                          {activeDocumentLanguage === 'en'
                            ? 'I. FIRST PARTY IDENTITY'
                            : 'I. IDENTITAS PIHAK PERTAMA'}
                        </span>
                        <input
                          type="text"
                          value={activeDoc.partyOne.role}
                          onChange={(e) =>
                            updateActiveDocument((d) => ({
                              ...d,
                              partyOne: { ...d.partyOne, role: e.target.value },
                            }))
                          }
                          className="text-right font-code text-[11px] bg-transparent border-b border-transparent focus:border-[#1E3A8A] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-ui">
                        <div>
                          <label className="block text-[11px] text-[#57534E]">
                            Nama Instansi / Pihak:
                          </label>
                          <input
                            type="text"
                            value={activeDoc.partyOne.name}
                            onChange={(e) =>
                              updateActiveDocument((d) => ({
                                ...d,
                                partyOne: { ...d.partyOne, name: e.target.value },
                              }))
                            }
                            className="w-full text-xs font-semibold text-[#18181B] bg-white px-2.5 py-1.5 rounded border border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#57534E]">
                            Diwakili Oleh / Jabatan:
                          </label>
                          <input
                            type="text"
                            value={activeDoc.partyOne.representative}
                            onChange={(e) =>
                              updateActiveDocument((d) => ({
                                ...d,
                                partyOne: { ...d.partyOne, representative: e.target.value },
                              }))
                            }
                            className="w-full text-xs text-[#18181B] bg-white px-2.5 py-1.5 rounded border border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="font-ui">
                        <label className="block text-[11px] text-[#57534E]">Alamat Kedudukan:</label>
                        <input
                          type="text"
                          value={activeDoc.partyOne.address}
                          onChange={(e) =>
                            updateActiveDocument((d) => ({
                              ...d,
                              partyOne: { ...d.partyOne, address: e.target.value },
                            }))
                          }
                          className="w-full text-xs text-[#18181B] bg-white px-2.5 py-1.5 rounded border border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-ui text-[#57534E] mb-1">
                          Uraian Komparisi Hukum:
                        </label>
                        <EditableAnnotatedParagraph
                          rows={2}
                          value={activeDoc.partyOne.description}
                          extraGlossaryItems={extraAiGlossary}
                          className="bg-white border-[#D6D0C4]"
                          onChange={(val) =>
                            updateActiveDocument((d) => ({
                              ...d,
                              partyOne: { ...d.partyOne, description: val },
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Pihak Kedua */}
                    <div className="p-4 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-ui font-semibold text-[#78350F]">
                        <span>
                          {activeDocumentLanguage === 'en'
                            ? 'II. SECOND PARTY IDENTITY'
                            : 'II. IDENTITAS PIHAK KEDUA'}
                        </span>
                        <input
                          type="text"
                          value={activeDoc.partyTwo.role}
                          onChange={(e) =>
                            updateActiveDocument((d) => ({
                              ...d,
                              partyTwo: { ...d.partyTwo, role: e.target.value },
                            }))
                          }
                          className="text-right font-code text-[11px] bg-transparent border-b border-transparent focus:border-[#78350F] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-ui">
                        <div>
                          <label className="block text-[11px] text-[#57534E]">
                            Nama Instansi / Pihak:
                          </label>
                          <input
                            type="text"
                            value={activeDoc.partyTwo.name}
                            onChange={(e) =>
                              updateActiveDocument((d) => ({
                                ...d,
                                partyTwo: { ...d.partyTwo, name: e.target.value },
                              }))
                            }
                            className="w-full text-xs font-semibold text-[#18181B] bg-white px-2.5 py-1.5 rounded border border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#57534E]">
                            Diwakili Oleh / Jabatan:
                          </label>
                          <input
                            type="text"
                            value={activeDoc.partyTwo.representative}
                            onChange={(e) =>
                              updateActiveDocument((d) => ({
                                ...d,
                                partyTwo: { ...d.partyTwo, representative: e.target.value },
                              }))
                            }
                            className="w-full text-xs text-[#18181B] bg-white px-2.5 py-1.5 rounded border border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="font-ui">
                        <label className="block text-[11px] text-[#57534E]">Alamat Kedudukan:</label>
                        <input
                          type="text"
                          value={activeDoc.partyTwo.address}
                          onChange={(e) =>
                            updateActiveDocument((d) => ({
                              ...d,
                              partyTwo: { ...d.partyTwo, address: e.target.value },
                            }))
                          }
                          className="w-full text-xs text-[#18181B] bg-white px-2.5 py-1.5 rounded border border-[#D6D0C4] focus:border-[#1E3A8A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-ui text-[#57534E] mb-1">
                          Uraian Komparisi Hukum:
                        </label>
                        <EditableAnnotatedParagraph
                          rows={2}
                          value={activeDoc.partyTwo.description}
                          extraGlossaryItems={extraAiGlossary}
                          className="bg-white border-[#D6D0C4]"
                          onChange={(val) =>
                            updateActiveDocument((d) => ({
                              ...d,
                              partyTwo: { ...d.partyTwo, description: val },
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Smart Auto-Fill System Based on Party Metadata (e.g., PT vs Individu) */}
                    {!isReviewOnlyMode && (
                      <SmartPartyAutoFillPanel
                        document={activeDoc}
                        onChangePartyEntityType={handleChangePartyEntityType}
                        onApplySingleProposal={handleApplySingleAutoFill}
                        onApplyAllProposals={handleApplyAllAutoFill}
                        onNotify={showToast}
                      />
                    )}
                  </div>

                  {/* Premis / Konsiderans ("Bahwa, ...") with Glossary Tooltips */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-ui font-semibold text-[#18181B]">
                        {activeDocumentLanguage === 'en'
                          ? 'RECITALS / LEGAL CONSIDERATIONS (WHEREAS)'
                          : 'PREMIS / PERTIMBANGAN HUKUM (KONSIDERANS)'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDocument((d) => ({
                            ...d,
                            recitals: [
                              ...d.recitals,
                              'Bahwa, Para Pihak sepakat untuk melaksanakan kerjasama dengan itikad baik;',
                            ],
                          }))
                        }
                        className="no-print text-xs font-ui font-medium text-[#1E3A8A] hover:underline cursor-pointer"
                      >
                        + Tambah Premis
                      </button>
                    </div>
                    {activeDoc.recitals.map((recital, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2 group">
                        <span className="font-code text-xs text-[#57534E] pt-2.5 select-none">
                          {rIdx + 1}.
                        </span>
                        <EditableAnnotatedParagraph
                          rows={2}
                          value={recital}
                          extraGlossaryItems={extraAiGlossary}
                          onChange={(val) => {
                            updateActiveDocument((d) => ({
                              ...d,
                              recitals: d.recitals.map((item, idx) => (idx === rIdx ? val : item)),
                            }));
                          }}
                        />
                        {activeDoc.recitals.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveDocument((d) => ({
                                ...d,
                                recitals: d.recitals.filter((_, idx) => idx !== rIdx),
                              }))
                            }
                            className="no-print opacity-0 group-hover:opacity-100 p-1.5 text-[#78716C] hover:text-red-600 transition-opacity"
                            title="Hapus premis"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* PASAL-PASAL PERJANJIAN (CLAUSES) WITH AUTOMATIC GLOSSARY TOOLTIPS & AI COLOR-CODED CATEGORY TAGS */}
                  <div className="space-y-6 pt-4 border-t border-[#E5E0D8]">
                    {/* AI Clause Categorization & Color-Coded Tag Filter Bar */}
                    <div className="no-print p-3.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md font-ui space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[#1E3A8A]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                            Kategorisasi & Label Klausul Otomatis (AI)
                          </span>
                          <span className="text-[11px] text-[#57534E]">
                            · Deteksi otomatis substansi pasal (Financial, Liability, Operational, HKI, dll.)
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 bg-white border border-[#D6D0C4] rounded px-2 py-1">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                            <span className="text-[11px] font-semibold text-[#57534E]">
                              Sort Clauses:
                            </span>
                            <select
                              value={activeClauseSort}
                              onChange={(e) => {
                                const val = e.target.value as
                                  | 'category'
                                  | 'risk_desc'
                                  | 'risk_asc'
                                  | 'title_asc'
                                  | 'title_desc';
                                if (val) handleSortClauses(val);
                              }}
                              aria-label="Sort Clauses Header Menu"
                              className="text-[11px] font-semibold text-[#18181B] bg-transparent focus:outline-none cursor-pointer"
                            >
                              <option value="">Pilih Urutan...</option>
                              <option value="category">By Category (Kategori Klausul)</option>
                              <option value="risk_desc">By Risk Level (Kritis → Standar)</option>
                              <option value="risk_asc">By Risk Level (Standar → Kritis)</option>
                              <option value="title_asc">By Alphabetical Title (A → Z)</option>
                              <option value="title_desc">By Alphabetical Title (Z → A)</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            disabled={isCategorizingAllAI}
                            onClick={handleCategorizeAllClausesWithAI}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>
                              {isCategorizingAllAI
                                ? 'Mengkategorikan Pasal dengan AI...'
                                : 'Analisis & Sarankan Label AI'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Color-Coded Category Filter Tabs + Dedicated 'Risiko Kritis Saja' & 'Risiko Rendah' Filters */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter('Semua');
                            setOnlyCriticalRiskFilter(false);
                            setOnlyLowRiskFilter(false);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                            selectedCategoryFilter === 'Semua' &&
                            !onlyCriticalRiskFilter &&
                            !onlyLowRiskFilter
                              ? 'bg-[#18181B] text-white border-[#18181B]'
                              : 'bg-white text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                          }`}
                        >
                          Semua Pasal ({activeDoc.clauses.length})
                        </button>

                        {/* Dedicated 'Risiko Kritis Saja' High-Risk Clause Filter Button */}
                        {(() => {
                          const criticalCount = activeDoc.clauses.filter(
                            (cl) => (cl.riskLevel || '').toLowerCase() === 'kritis'
                          ).length;
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setOnlyCriticalRiskFilter((prev) => {
                                  const next = !prev;
                                  if (next) setOnlyLowRiskFilter(false);
                                  return next;
                                });
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-all cursor-pointer ${
                                onlyCriticalRiskFilter
                                  ? 'bg-red-700 text-white border-red-700 ring-1 ring-red-700 shadow-2xs'
                                  : 'bg-red-50/80 text-red-800 border-red-300 hover:bg-red-100'
                              }`}
                              title="Tampilkan hanya pasal-pasal dengan tingkat Risiko Kritis (Tinggi)"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span>Risiko Kritis Saja</span>
                              <span className="font-code text-[10px] opacity-90">
                                ({criticalCount})
                              </span>
                            </button>
                          );
                        })()}

                        {/* Dedicated 'Risiko Rendah' Minimal-Risk Clause Filter Button */}
                        {(() => {
                          const lowRiskCount = activeDoc.clauses.filter((cl) => {
                            const rl = (cl.riskLevel || '').toLowerCase();
                            return rl === 'standar' || rl === 'rendah';
                          }).length;
                          return (
                            <button
                              type="button"
                              data-testid="low-risk-filter-btn"
                              onClick={() => {
                                setOnlyLowRiskFilter((prev) => {
                                  const next = !prev;
                                  if (next) setOnlyCriticalRiskFilter(false);
                                  return next;
                                });
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-all cursor-pointer ${
                                onlyLowRiskFilter
                                  ? 'bg-emerald-700 text-white border-emerald-700 ring-1 ring-emerald-700 shadow-2xs'
                                  : 'bg-emerald-50/90 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              }`}
                              title="Tampilkan hanya pasal-pasal dengan tingkat Risiko Rendah / Minimal (Standar)"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Risiko Rendah</span>
                              <span className="font-code text-[10px] opacity-90">
                                ({lowRiskCount})
                              </span>
                            </button>
                          );
                        })()}

                        {(
                          Object.keys(CLAUSE_CATEGORY_STYLES) as ClauseCategoryType[]
                        ).map((catKey) => {
                          const catStyle = CLAUSE_CATEGORY_STYLES[catKey];
                          const count = activeDoc.clauses.filter((cl) => {
                            const matchesCat =
                              categorizeClauseWithLabels(cl).category === catKey;
                            const rl = (cl.riskLevel || '').toLowerCase();
                            const matchesCrit =
                              !onlyCriticalRiskFilter || rl === 'kritis';
                            const matchesLow =
                              !onlyLowRiskFilter || rl === 'standar' || rl === 'rendah';
                            return matchesCat && matchesCrit && matchesLow;
                          }).length;
                          const isSelected = selectedCategoryFilter === catKey;
                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() =>
                                setSelectedCategoryFilter(
                                  isSelected ? 'Semua' : catKey
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded border transition-all cursor-pointer ${
                                isSelected
                                  ? `${catStyle.badgeBg} ${catStyle.badgeText} ${catStyle.badgeBorder} ring-1 ring-current`
                                  : `bg-white ${catStyle.badgeText} border-[#E5E0D8] hover:${catStyle.badgeBg}`
                              }`}
                            >
                              <span>{catStyle.shortLabel}</span>
                              <span className="font-code text-[10px] opacity-80">
                                ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Filter Status Indicator when 'Risiko Kritis Saja', 'Risiko Rendah', or Category is active */}
                      {(onlyCriticalRiskFilter ||
                        onlyLowRiskFilter ||
                        selectedCategoryFilter !== 'Semua') && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#E5E0D8] text-[11px]">
                          <div className="flex items-center gap-1.5 text-[#57534E]">
                            <span>Filter Aktif:</span>
                            {onlyCriticalRiskFilter && (
                              <span className="font-semibold text-red-700">
                                Risiko Kritis Saja
                              </span>
                            )}
                            {onlyLowRiskFilter && (
                              <span className="font-semibold text-emerald-700">
                                Risiko Rendah (Minimal / Standar)
                              </span>
                            )}
                            {(onlyCriticalRiskFilter || onlyLowRiskFilter) &&
                              selectedCategoryFilter !== 'Semua' && <span>·</span>}
                            {selectedCategoryFilter !== 'Semua' && (
                              <span className="font-semibold text-[#1E3A8A]">
                                Kategori {CLAUSE_CATEGORY_STYLES[selectedCategoryFilter].shortLabel}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOnlyCriticalRiskFilter(false);
                              setOnlyLowRiskFilter(false);
                              setSelectedCategoryFilter('Semua');
                            }}
                            className="font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                          >
                            Reset Filter
                          </button>
                        </div>
                      )}

                      {/* BATCH PROCESSING FEATURE IN CATEGORIZATION UI (SELECT MULTIPLE CLAUSES & APPLY BULK CATEGORY CHANGE OR TAG ADDITION) */}
                      {(() => {
                        const visibleClausesForBatch = activeDoc.clauses.filter((cl) => {
                          const catAnalysis = categorizeClauseWithLabels(cl);
                          const matchesCat =
                            selectedCategoryFilter === 'Semua' ||
                            catAnalysis.category === selectedCategoryFilter;
                          const rl = (cl.riskLevel || '').toLowerCase();
                          const matchesCrit = !onlyCriticalRiskFilter || rl === 'kritis';
                          const matchesLow =
                            !onlyLowRiskFilter || rl === 'standar' || rl === 'rendah';
                          return matchesCat && matchesCrit && matchesLow;
                        });
                        const visibleIds = visibleClausesForBatch.map((c) => c.id);
                        const allVisibleSelected =
                          visibleIds.length > 0 &&
                          visibleIds.every((id) => selectedBatchClauseIds.includes(id));

                        return (
                          <div
                            data-testid="categorization-batch-processing-section"
                            className="pt-2.5 border-t border-[#E5E0D8] space-y-2.5"
                          >
                            {/* Top Row: Multi-Clause Selection Header & Quick Select Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1">
                                  <SlidersHorizontal className="w-3 h-3" />
                                  <span>Batch Processing (Kategori & Label Massal)</span>
                                </span>
                                <span
                                  data-testid="batch-selected-count-badge"
                                  className={`px-2 py-0.5 text-[10.5px] font-code font-bold rounded border ${
                                    selectedBatchClauseIds.length > 0
                                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                      : 'bg-white text-[#57534E] border-[#D6D0C4]'
                                  }`}
                                >
                                  {selectedBatchClauseIds.length} Pasal Dipilih
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  data-testid="batch-select-all-clauses-btn"
                                  onClick={() => handleBatchSelectAllClauses(visibleIds)}
                                  className="px-2 py-0.5 text-[10.5px] font-semibold bg-white hover:bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] rounded cursor-pointer transition-colors"
                                >
                                  {allVisibleSelected
                                    ? 'Batal Pilih Semua'
                                    : `Pilih Semua Tampil (${visibleIds.length})`}
                                </button>
                                {selectedBatchClauseIds.length > 0 && (
                                  <button
                                    type="button"
                                    data-testid="batch-clear-selection-btn"
                                    onClick={() => setSelectedBatchClauseIds([])}
                                    className="px-2 py-0.5 text-[10.5px] font-medium text-[#57534E] hover:text-red-700 bg-white border border-[#D6D0C4] rounded cursor-pointer"
                                  >
                                    Reset Pilihan
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Interactive Multi-Clause Selection Pills */}
                            <div
                              data-testid="batch-clause-selector-list"
                              className="flex flex-wrap items-center gap-1.5"
                            >
                              {visibleClausesForBatch.map((cl) => {
                                const isChecked = selectedBatchClauseIds.includes(cl.id);
                                const clCat = categorizeClauseWithLabels(cl);
                                return (
                                  <button
                                    key={`batch-pill-${cl.id}`}
                                    type="button"
                                    data-testid={`batch-clause-pill-${cl.id}`}
                                    onClick={() => handleToggleBatchSelectClause(cl.id)}
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10.5px] font-medium rounded border transition-all cursor-pointer ${
                                      isChecked
                                        ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#1E3A8A] font-semibold ring-1 ring-[#1E3A8A]'
                                        : 'bg-white text-[#57534E] border-[#D6D0C4] hover:border-[#1E3A8A] hover:text-[#18181B]'
                                    }`}
                                    title={`${cl.number} · ${cl.title} (Kategori saat ini: ${clCat.style.shortLabel})`}
                                  >
                                    <span
                                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                        isChecked
                                          ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                                          : 'bg-white border-[#A8A29E] text-transparent'
                                      }`}
                                    >
                                      ✓
                                    </span>
                                    <span className="font-code font-bold">{cl.number}</span>
                                    <span className="truncate max-w-[115px]">{cl.title}</span>
                                    <span
                                      className={`px-1 py-0.2 text-[9px] font-semibold rounded ${clCat.style.badgeBg} ${clCat.style.badgeText}`}
                                    >
                                      {clCat.style.shortLabel}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Single-Action Batch Category & Tag Controls Bar */}
                            <div
                              data-testid="batch-action-controls-bar"
                              className="p-2.5 bg-white border border-[#D6D0C4] rounded-md space-y-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                {/* Bulk Category Selector */}
                                <div className="sm:col-span-5 flex items-center gap-1.5">
                                  <label
                                    htmlFor="batch-category-select-input"
                                    className="text-[10.5px] font-semibold text-[#57534E] whitespace-nowrap"
                                  >
                                    Kategori Baru:
                                  </label>
                                  <select
                                    id="batch-category-select-input"
                                    aria-label="Pilih Kategori Massal untuk Pasal Terpilih"
                                    data-testid="batch-category-select"
                                    value={batchTargetCategory}
                                    onChange={(e) =>
                                      setBatchTargetCategory(
                                        e.target.value as ClauseCategoryType | ''
                                      )
                                    }
                                    className="flex-1 min-w-0 px-2 py-1.5 text-[11px] font-semibold text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A] cursor-pointer"
                                  >
                                    <option value="">-- Tidak Ubah Kategori --</option>
                                    {(
                                      Object.keys(
                                        CLAUSE_CATEGORY_STYLES
                                      ) as ClauseCategoryType[]
                                    ).map((catKey) => (
                                      <option key={`batch-opt-${catKey}`} value={catKey}>
                                        {CLAUSE_CATEGORY_STYLES[catKey].bilingualLabel}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Bulk Tag Addition Input */}
                                <div className="sm:col-span-4 flex items-center gap-1.5">
                                  <label
                                    htmlFor="batch-tag-text-input"
                                    className="text-[10.5px] font-semibold text-[#57534E] whitespace-nowrap"
                                  >
                                    + Label/Tag:
                                  </label>
                                  <input
                                    id="batch-tag-text-input"
                                    type="text"
                                    data-testid="batch-tag-input"
                                    value={batchTagInput}
                                    onChange={(e) => setBatchTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyBatchCategorizationAndTags();
                                      }
                                    }}
                                    placeholder="Ketik tag (mis. Prioritas Audit)..."
                                    className="flex-1 min-w-0 px-2 py-1.5 text-[11px] text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                                  />
                                </div>

                                {/* Single-Action Execute Button */}
                                <div className="sm:col-span-3 flex items-center justify-end">
                                  <button
                                    type="button"
                                    data-testid="apply-batch-categorization-btn"
                                    disabled={
                                      selectedBatchClauseIds.length === 0 ||
                                      (!batchTargetCategory && !batchTagInput.trim())
                                    }
                                    onClick={() => handleApplyBatchCategorizationAndTags()}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 rounded transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>
                                      Terapkan ({selectedBatchClauseIds.length} Pasal)
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Quick Preset Batch Tags Row */}
                              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#F0ECE3] text-[10px]">
                                <span className="text-[#57534E] font-medium mr-1">
                                  Tag Cepat Massal:
                                </span>
                                {[
                                  'Prioritas Audit',
                                  'Wajib Review Klien',
                                  'Klausul Krusial',
                                  'Mitigasi Risiko',
                                  'Kepatuhan KUHPerdata',
                                ].map((presetTag) => (
                                  <button
                                    key={presetTag}
                                    type="button"
                                    data-testid={`batch-preset-tag-${presetTag
                                      .toLowerCase()
                                      .replace(/\s+/g, '-')}`}
                                    onClick={() => {
                                      setBatchTagInput((prev) => {
                                        const existing = prev
                                          .split(',')
                                          .map((s) => s.trim())
                                          .filter(Boolean);
                                        if (existing.includes(presetTag)) return prev;
                                        return existing.length > 0
                                          ? `${existing.join(', ')}, ${presetTag}`
                                          : presetTag;
                                      });
                                    }}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#FAF9F6] hover:bg-[#EFF6FF] text-[#57534E] hover:text-[#1E3A8A] border border-[#D6D0C4] hover:border-[#93C5FD] rounded cursor-pointer transition-colors"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>{presetTag}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <p className="text-[15px] leading-relaxed text-justify italic text-[#27272A]">
                      <LegalAnnotatedText
                        text={
                          activeDocumentLanguage === 'en'
                            ? 'NOW, THEREFORE, based on the foregoing premises and considerations, the Parties hereby agree to bind themselves to this Agreement under the following terms and conditions:'
                            : 'Berdasarkan hal-hal dan pertimbangan tersebut di atas, Para Pihak dengan ini sepakat untuk mengikatkan diri dalam Perjanjian dengan ketentuan dan syarat-syarat sebagai berikut:'
                        }
                        extraGlossaryItems={extraAiGlossary}
                      />
                    </p>

                    {activeDoc.clauses.filter((clause) => {
                      const catAnalysis = categorizeClauseWithLabels(clause);
                      const matchesCategory =
                        selectedCategoryFilter === 'Semua' ||
                        catAnalysis.category === selectedCategoryFilter;
                      const rl = (clause.riskLevel || '').toLowerCase();
                      const matchesCritical =
                        !onlyCriticalRiskFilter || rl === 'kritis';
                      const matchesLowRisk =
                        !onlyLowRiskFilter || rl === 'standar' || rl === 'rendah';
                      return matchesCategory && matchesCritical && matchesLowRisk;
                    }).length === 0 && (
                      <div className="no-print p-5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-center font-ui space-y-2">
                        <div className="text-xs font-semibold text-[#18181B]">
                          Tidak ditemukan pasal yang sesuai dengan kombinasi filter saat ini.
                        </div>
                        <p className="text-[11px] text-[#57534E]">
                          Ubah filter kategori atau matikan filter risiko untuk menampilkan seluruh pasal dalam kontrak.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setOnlyCriticalRiskFilter(false);
                            setOnlyLowRiskFilter(false);
                            setSelectedCategoryFilter('Semua');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer"
                        >
                          Tampilkan Semua Pasal ({activeDoc.clauses.length})
                        </button>
                      </div>
                    )}

                    {activeDoc.clauses.map((clause, cIdx) => {
                      const catAnalysis = categorizeClauseWithLabels(clause);
                      if (
                        selectedCategoryFilter !== 'Semua' &&
                        catAnalysis.category !== selectedCategoryFilter
                      ) {
                        return null;
                      }
                      const riskLower = (clause.riskLevel || '').toLowerCase();
                      if (onlyCriticalRiskFilter && riskLower !== 'kritis') {
                        return null;
                      }
                      if (
                        onlyLowRiskFilter &&
                        riskLower !== 'standar' &&
                        riskLower !== 'rendah'
                      ) {
                        return null;
                      }
                      const isRefiningThis = refiningClauseId === clause.id;
                      const isSplittingThis = splittingClauseId === clause.id;
                      const isSummaryExpanded = Boolean(expandedSummaryClauseIds[clause.id]);
                      const isSummarizingThis = summarizingClauseId === clause.id;
                      const plainSummaryText =
                        clause.plainSummary || generatePlainLanguageClauseSummary(clause);
                      const clauseComments = (activeDoc.comments || []).filter(
                        (cmt) => cmt.clauseId === clause.id || cmt.clauseNumber === clause.number
                      );
                      const isCommentOpen =
                        isReviewOnlyMode ||
                        openCommentClauseId === clause.id ||
                        clauseComments.length > 0;
                      const customTagVal = customTagInputs[clause.id] || '';
                      const isSelectedForBatch = selectedBatchClauseIds.includes(clause.id);
                      return (
                        <div
                          key={clause.id}
                          id={`clause-${clause.id}`}
                          className={`p-4 sm:p-5 bg-white border ${
                            clause.regulatoryUpdateMarker?.status === 'needs_review'
                              ? 'border-amber-400 ring-2 ring-amber-300/40'
                              : clause.regulatoryUpdateMarker
                              ? 'border-emerald-400 ring-2 ring-emerald-300/35'
                              : isSelectedForBatch
                              ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/15'
                              : 'border-[#E5E0D8]'
                          } border-l-4 ${catAnalysis.style.leftAccent} hover:border-[#D6D0C4] rounded-md transition-colors space-y-3`}
                        >
                          {/* VISUAL TARGET CLAUSE MARKER & BEFORE/AFTER AI DIFF PANEL (SHOWS WHICH PART OF CLAUSE WAS CHANGED OR ADDED BY AI + BEFORE/AFTER) */}
                          {(clause.regulatoryUpdateMarker || clause.aiChangeRecord) && (
                            <div
                              data-testid={`clause-regulatory-marker-${clause.id}`}
                              data-marker-status={
                                clause.regulatoryUpdateMarker?.status || 'ai_modified'
                              }
                              className={`no-print p-3 rounded-md border font-ui text-xs space-y-2.5 ${
                                clause.regulatoryUpdateMarker?.status === 'needs_review'
                                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                                  : 'bg-emerald-50/85 border-emerald-300 text-emerald-950'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5 font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-code uppercase ${
                                      clause.regulatoryUpdateMarker?.status === 'needs_review'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-emerald-700 text-white'
                                    }`}
                                  >
                                    {clause.regulatoryUpdateMarker?.status === 'needs_review'
                                      ? `📌 TANDA CEK PASAL TUJUAN (${clause.number})`
                                      : `✨ PASAL DIUBAH / DITAMBAHKAN AI (${clause.number})`}
                                  </span>
                                  <span>
                                    {clause.regulatoryUpdateMarker?.status === 'needs_review'
                                      ? `Perlu Diisi / Diubah Sesuai: ${clause.regulatoryUpdateMarker.regReference}`
                                      : clause.aiChangeRecord?.sourceLabel ||
                                        `Diperbarui Otomatis Sesuai: ${clause.regulatoryUpdateMarker?.regReference}`}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  {clause.regulatoryUpdateMarker?.status === 'needs_review' &&
                                    clause.regulatoryUpdateMarker.recommendedAyat && (
                                      <>
                                        <button
                                          type="button"
                                          data-testid={`clause-marker-fill-direct-btn-${clause.id}`}
                                          onClick={() =>
                                            handleApplyRegulatoryUpdateToClause(
                                              clause.id,
                                              clause.regulatoryUpdateMarker!.regReference,
                                              clause.regulatoryUpdateMarker!.recommendedAyat!,
                                              'fill_direct',
                                              undefined,
                                              clause.regulatoryUpdateMarker!.regShortLabel
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded cursor-pointer"
                                        >
                                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                          <span>Langsung Isi ke {clause.number}</span>
                                        </button>
                                        <button
                                          type="button"
                                          data-testid={`clause-marker-replace-btn-${clause.id}`}
                                          onClick={() =>
                                            handleApplyRegulatoryUpdateToClause(
                                              clause.id,
                                              clause.regulatoryUpdateMarker!.regReference,
                                              clause.regulatoryUpdateMarker!.recommendedAyat!,
                                              'replace_clause',
                                              undefined,
                                              clause.regulatoryUpdateMarker!.regShortLabel
                                            )
                                          }
                                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#93C5FD] rounded cursor-pointer"
                                        >
                                          <span>Ganti Isi {clause.number}</span>
                                        </button>
                                      </>
                                    )}

                                  {clause.aiChangeRecord && (
                                    <>
                                      <button
                                        type="button"
                                        data-testid={`toggle-clause-before-after-btn-${clause.id}`}
                                        onClick={() =>
                                          setCollapsedBeforeAfterClauseIds((prev) => ({
                                            ...prev,
                                            [clause.id]: !prev[clause.id],
                                          }))
                                        }
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#93C5FD] rounded cursor-pointer"
                                      >
                                        <Columns2 className="w-3 h-3" />
                                        <span>
                                          {collapsedBeforeAfterClauseIds[clause.id]
                                            ? 'Tampilkan Before & After'
                                            : 'Sembunyikan Before & After'}
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        data-testid={`revert-clause-before-ai-btn-${clause.id}`}
                                        onClick={() =>
                                          handleRevertClauseToBeforeAiChange(clause.id)
                                        }
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded cursor-pointer"
                                        title="Kembalikan isi pasal ini ke kondisi sebelum diubah oleh AI (Before)"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5" />
                                        <span>Kembalikan ke Before</span>
                                      </button>
                                    </>
                                  )}

                                  <button
                                    type="button"
                                    data-testid={`clause-marker-dismiss-btn-${clause.id}`}
                                    onClick={() => handleClearClauseRegulatoryMarker(clause.id)}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-[#57534E] hover:text-[#18181B] bg-white/80 border border-[#D6D0C4] rounded cursor-pointer"
                                  >
                                    ✓ Selesai Cek (Hapus Tanda)
                                  </button>
                                </div>
                              </div>

                              {/* TANDA BAGIAN PASAL MANA YANG DIUBAH ISINYA ATAU DITAMBAHKAN OLEH AI */}
                              {clause.aiChangeRecord && (
                                <div
                                  data-testid={`clause-changed-parts-list-${clause.id}`}
                                  className="flex flex-wrap items-center gap-1.5 pt-0.5"
                                >
                                  <span className="text-[11px] font-bold text-emerald-950">
                                    Bagian {clause.number} yang Diubah / Ditambahkan AI:
                                  </span>
                                  {clause.aiChangeRecord.paragraphChanges
                                    .filter((pc) => pc.changeType !== 'unchanged')
                                    .map((pc) => (
                                      <span
                                        key={`part-badge-${pc.ayatIndex}`}
                                        data-testid={`clause-part-badge-${clause.id}-${pc.ayatIndex}`}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-code font-bold border ${
                                          pc.changeType === 'added'
                                            ? 'bg-emerald-700 text-white border-emerald-800'
                                            : 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                        }`}
                                      >
                                        <span>
                                          {pc.changeType === 'added'
                                            ? `➕ Ayat (${pc.ayatIndex + 1}) Ditambahkan AI`
                                            : `✏️ Ayat (${pc.ayatIndex + 1}) Diubah Isinya oleh AI`}
                                        </span>
                                      </span>
                                    ))}
                                  {clause.aiChangeRecord.legalBasisChanged && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-code font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      ⚖️ Dasar Hukum Diperbarui AI
                                    </span>
                                  )}
                                  {clause.aiChangeRecord.titleChanged && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-code font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                      🏷️ Judul Pasal Diubah AI
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* SIDE-BY-SIDE BEFORE & AFTER COMPARISON PANEL */}
                              {clause.aiChangeRecord &&
                                !collapsedBeforeAfterClauseIds[clause.id] && (
                                  <div
                                    data-testid={`clause-before-after-comparison-${clause.id}`}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1"
                                  >
                                    {/* BEFORE (SEBELUM DIUBAH AI) */}
                                    <div
                                      data-testid={`clause-diff-before-${clause.id}`}
                                      className="p-2.5 rounded-md bg-rose-50/85 border border-rose-200 space-y-1.5 text-[#18181B]"
                                    >
                                      <div className="flex items-center justify-between border-b border-rose-200 pb-1">
                                        <span className="text-[10px] font-code font-bold uppercase tracking-wider text-rose-900">
                                          SEBELUM DIUBAH AI (BEFORE)
                                        </span>
                                        <span className="text-[9.5px] font-code font-semibold text-rose-800">
                                          {clause.aiChangeRecord.beforeSnapshot.content.length} Ayat Asli
                                        </span>
                                      </div>

                                      <div className="text-[10px] font-code text-rose-900/90">
                                        <strong>Dasar Hukum (Before):</strong>{' '}
                                        <span
                                          className={
                                            clause.aiChangeRecord.legalBasisChanged
                                              ? 'line-through decoration-rose-500'
                                              : ''
                                          }
                                        >
                                          {clause.aiChangeRecord.beforeSnapshot.legalBasis}
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 pt-0.5">
                                        {clause.aiChangeRecord.beforeSnapshot.content.map(
                                          (beforeAyat, bIdx) => {
                                            const afterAtSameIdx =
                                              clause.aiChangeRecord!.afterSnapshot.content[bIdx];
                                            const wasModifiedOrReplaced =
                                              afterAtSameIdx === undefined ||
                                              afterAtSameIdx.trim() !== beforeAyat.trim();
                                            return (
                                              <div
                                                key={`before-ayat-${bIdx}`}
                                                className={`p-1.5 rounded text-[11px] font-legal leading-relaxed ${
                                                  wasModifiedOrReplaced
                                                    ? 'bg-rose-100/90 border border-rose-300 text-rose-950'
                                                    : 'bg-white/80 border border-rose-100 text-[#3F3F46]'
                                                }`}
                                              >
                                                <div className="flex items-center justify-between gap-1 mb-0.5 font-ui">
                                                  <span className="text-[9.5px] font-code font-bold text-rose-900">
                                                    Ayat ({bIdx + 1}) — Before
                                                  </span>
                                                  {wasModifiedOrReplaced && (
                                                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-code font-bold uppercase bg-rose-700 text-white">
                                                      {afterAtSameIdx === undefined
                                                        ? 'Diganti AI'
                                                        : 'Isi Diubah AI'}
                                                    </span>
                                                  )}
                                                </div>
                                                <p
                                                  className={
                                                    wasModifiedOrReplaced
                                                      ? 'line-through decoration-rose-500/80'
                                                      : ''
                                                  }
                                                >
                                                  {beforeAyat}
                                                </p>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>

                                    {/* AFTER (SESUDAH DIUBAH / DITAMBAHKAN AI) */}
                                    <div
                                      data-testid={`clause-diff-after-${clause.id}`}
                                      className="p-2.5 rounded-md bg-white border-2 border-emerald-400 space-y-1.5 text-[#18181B]"
                                    >
                                      <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                                        <span className="text-[10px] font-code font-bold uppercase tracking-wider text-emerald-900">
                                          SESUDAH DIUBAH AI (AFTER)
                                        </span>
                                        <span className="text-[9.5px] font-code font-semibold text-emerald-800">
                                          {clause.aiChangeRecord.afterSnapshot.content.length} Ayat Aktif
                                        </span>
                                      </div>

                                      <div className="text-[10px] font-code text-emerald-950">
                                        <strong>Dasar Hukum (After):</strong>{' '}
                                        <span
                                          className={
                                            clause.aiChangeRecord.legalBasisChanged
                                              ? 'px-1 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold'
                                              : ''
                                          }
                                        >
                                          {clause.aiChangeRecord.afterSnapshot.legalBasis}
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 pt-0.5">
                                        {clause.aiChangeRecord.paragraphChanges.map((pc) => (
                                          <div
                                            key={`after-ayat-${pc.ayatIndex}`}
                                            className={`p-1.5 rounded text-[11px] font-legal leading-relaxed ${
                                              pc.changeType === 'added'
                                                ? 'bg-emerald-100/90 border border-emerald-400 text-emerald-950 font-medium'
                                                : pc.changeType === 'modified'
                                                ? 'bg-blue-50/95 border border-blue-300 text-blue-950 font-medium'
                                                : 'bg-[#FAF9F6] border border-[#E5E0D8] text-[#3F3F46]'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-1 mb-0.5 font-ui">
                                              <span className="text-[9.5px] font-code font-bold text-[#18181B]">
                                                Ayat ({pc.ayatIndex + 1}) — After
                                              </span>
                                              {pc.changeType !== 'unchanged' && (
                                                <span
                                                  className={`px-1.5 py-0.2 rounded text-[8.5px] font-code font-bold uppercase text-white ${
                                                    pc.changeType === 'added'
                                                      ? 'bg-emerald-700'
                                                      : 'bg-[#1E3A8A]'
                                                  }`}
                                                >
                                                  {pc.changeType === 'added'
                                                    ? '+ Baru Ditambahkan AI'
                                                    : '✏️ Isi Diubah AI'}
                                                </span>
                                              )}
                                            </div>
                                            <p>{pc.afterText}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {clause.regulatoryUpdateMarker?.status === 'needs_review' &&
                                clause.regulatoryUpdateMarker.recommendedAyat && (
                                  <p className="text-[11px] font-legal italic text-amber-950 bg-white/80 p-2 rounded border border-amber-200">
                                    <strong>Saran AI Agent untuk {clause.number}:</strong> &ldquo;
                                    {clause.regulatoryUpdateMarker.recommendedAyat}&rdquo;
                                  </p>
                                )}
                            </div>
                          )}

                          {/* Top metadata & action bar for each Pasal (with Batch Selection Checkbox & Color-Coded Category Tag) */}
                          <div className="no-print flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F0ECE3] font-ui text-xs text-[#57534E]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Batch Selection Checkbox for Clause */}
                              <label
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10.5px] font-semibold cursor-pointer transition-colors ${
                                  isSelectedForBatch
                                    ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#1E3A8A]'
                                    : 'bg-[#FAF9F6] text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                                }`}
                                title="Centang untuk memilih pasal ini dalam Batch Processing (Ubah Kategori / Tambah Label Massal)"
                              >
                                <input
                                  type="checkbox"
                                  data-testid={`clause-batch-checkbox-${clause.id}`}
                                  checked={isSelectedForBatch}
                                  onChange={() => handleToggleBatchSelectClause(clause.id)}
                                  className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                                />
                                <span>Batch</span>
                              </label>

                              {/* Color-Coded AI Category Tag Selector */}
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${catAnalysis.style.badgeBg} ${catAnalysis.style.badgeText} ${catAnalysis.style.badgeBorder}`}
                                title={catAnalysis.reason}
                              >
                                <Tag className="w-3 h-3 shrink-0" />
                                <select
                                  value={catAnalysis.category}
                                  onChange={(e) =>
                                    handleChangeClauseCategory(
                                      clause,
                                      e.target.value as ClauseCategoryType
                                    )
                                  }
                                  aria-label="Kategori Klausul AI"
                                  className="text-[11px] font-bold uppercase tracking-wider bg-transparent focus:outline-none cursor-pointer"
                                >
                                  {(
                                    Object.keys(
                                      CLAUSE_CATEGORY_STYLES
                                    ) as ClauseCategoryType[]
                                  ).map((catKey) => (
                                    <option
                                      key={catKey}
                                      value={catKey}
                                      className="text-[#18181B] bg-white font-sans normal-case"
                                    >
                                      {CLAUSE_CATEGORY_STYLES[catKey].bilingualLabel}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span>·</span>
                              <span className="font-semibold text-[#18181B]">
                                <LegalAnnotatedText
                                  text={clause.legalBasis}
                                  extraGlossaryItems={extraAiGlossary}
                                />
                              </span>
                              <span>·</span>
                              <select
                                value={clause.riskLevel}
                                onChange={(e) => {
                                  const newRisk = e.target.value as
                                    | 'Standar'
                                    | 'Perhatian'
                                    | 'Kritis';
                                  handleChangeClauseRiskLevel(clause, newRisk);
                                }}
                                aria-label="Tingkat Risiko Pasal (Otomatis Sesuaikan Isi & Peraturan)"
                                className={`text-xs font-semibold bg-transparent focus:outline-none cursor-pointer ${
                                  clause.riskLevel === 'Kritis'
                                    ? 'text-red-700'
                                    : clause.riskLevel === 'Perhatian'
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}
                              >
                                <option value="Standar">Risiko: Standar (Otomatis Isi Normatif)</option>
                                <option value="Perhatian">Risiko: Perhatian (Otomatis Verifikasi & Bukti)</option>
                                <option value="Kritis">Risiko: Kritis (Otomatis Sanksi & Denda Tegas)</option>
                              </select>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Copy as Markdown Button (Copies formatted clause with numbering for Notion / Messaging Apps) */}
                              <button
                                type="button"
                                data-testid={`copy-clause-markdown-btn-${clause.id}`}
                                onClick={() => handleCopyClauseAsMarkdown(clause)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                                  copiedMarkdownClauseId === clause.id
                                    ? 'bg-emerald-700 text-white border-emerald-700'
                                    : 'text-[#18181B] bg-[#FAF9F6] hover:bg-[#EFF6FF] hover:text-[#1E3A8A] border-[#D6D0C4]'
                                }`}
                                title={`Salin ${clause.number} (${clause.title}) beserta penomoran ayat dalam format Markdown untuk ditempel ke Notion, Slack, atau aplikasi pesan`}
                              >
                                {copiedMarkdownClauseId === clause.id ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Copied Markdown!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#1E3A8A]" />
                                    <span>Copy as Markdown</span>
                                  </>
                                )}
                              </button>

                              {/* Summarize Clause Button with Hover Tooltip + Click Expanded View */}
                              <div className="relative group/sum">
                                <button
                                  type="button"
                                  onClick={() => handleSummarizeClauseWithAI(clause)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                                    isSummaryExpanded
                                      ? 'bg-[#1E3A8A] text-white'
                                      : 'text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE]'
                                  }`}
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>
                                    {isSummarizingThis
                                      ? 'Meringkas...'
                                      : 'Ringkas Pasal'}
                                  </span>
                                </button>
                                {/* Instant Hover Tooltip showing 1-sentence plain-language summary */}
                                <div className="pointer-events-none opacity-0 group-hover/sum:opacity-100 transition-opacity duration-150 absolute right-0 bottom-full mb-2 w-72 sm:w-80 p-2.5 bg-[#0F172A] text-white text-[11px] leading-relaxed rounded shadow-xl border border-slate-700 z-30">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                                    Ringkasan 1 Kalimat (Bahasa Sederhana)
                                  </div>
                                  <p>{plainSummaryText}</p>
                                  <div className="text-[9.5px] text-slate-300 mt-1">
                                    Klik tombol untuk menyematkan tampilan ringkasan AI di bawah.
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenCommentClauseId(
                                    openCommentClauseId === clause.id ? null : clause.id
                                  )
                                }
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                                  clauseComments.length > 0 || openCommentClauseId === clause.id
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6]'
                                }`}
                                title="Buka atau tambahkan komentar pihak lain pada pasal ini tanpa mengubah naskah asli"
                              >
                                <MessageSquare className="w-3 h-3 text-amber-700" />
                                <span>Komentar ({clauseComments.length})</span>
                              </button>
                              <button
                                type="button"
                                data-testid={`quick-ai-rebuttal-btn-${clause.id}`}
                                disabled={isGeneratingAiRebuttalClauseId === clause.id}
                                onClick={() => handleQuickAiRebuttalForClause(clause)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                                title="Minta AI Agent Legal Profesional memberikan komentar sanggahan hukum & redaksi tandingan pada pasal ini"
                              >
                                <Bot className="w-3 h-3 text-[#1E3A8A]" />
                                <span>
                                  {isGeneratingAiRebuttalClauseId === clause.id
                                    ? 'AI Menyanggah...'
                                    : 'Sanggah AI'}
                                </span>
                              </button>
                              <button
                                type="button"
                                data-testid={`ai-translate-clause-btn-${clause.id}`}
                                disabled={translatingClauseId === clause.id}
                                onClick={() => handleTranslateClauseWithAI(clause)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                                  dualLanguageEnabled || dualLanguageClauseIds[clause.id]
                                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                    : 'text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE]'
                                }`}
                                title="Terjemahkan pasal ini menggunakan AI Legal Translator dengan presisi hukum dan tampilkan Dual-Language Layout"
                              >
                                <Languages className="w-3 h-3" />
                                <span>
                                  {translatingClauseId === clause.id
                                    ? 'Translating...'
                                    : 'AI Translation'}
                                </span>
                              </button>
                              <button
                                type="button"
                                data-testid={`open-clause-ai-history-btn-${clause.id}`}
                                onClick={() => {
                                  setFocusedAiHistoryClauseId(clause.id);
                                  setRightTab('clause_history');
                                  setTimeout(() => {
                                    rightInspectorRef.current?.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'nearest',
                                    });
                                  }, 80);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                                  rightTab === 'clause_history' &&
                                  focusedAiHistoryClauseId === clause.id
                                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                    : 'text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] border-[#E5E0D8]'
                                }`}
                                title={`Buka AI Clause History untuk melacak & me-revert iterasi AI khusus pada ${clause.number}`}
                              >
                                <History className="w-3 h-3 text-[#1E3A8A]" />
                                <span>
                                  AI History ({(clause.aiHistory || []).length || 1})
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSplittingThis) {
                                    setSplittingClauseId(null);
                                    setSplitSelectedText('');
                                  } else {
                                    setSplittingClauseId(clause.id);
                                    const defaultAyat =
                                      clause.content[clause.content.length - 1] ||
                                      clause.content[0] ||
                                      '';
                                    setSplitSelectedText(defaultAyat);
                                  }
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                                  isSplittingThis
                                    ? 'bg-[#1E3A8A] text-white'
                                    : 'text-[#1E3A8A] bg-[#F7F5F0] hover:bg-[#EFECE6]'
                                }`}
                                title="Pecah sebagian teks atau ayat menjadi pasal baru terpisah menggunakan AI (Split Clause)"
                              >
                                <Scissors className="w-3 h-3" />
                                <span>Pecah Pasal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAskConsultantAboutClause(clause)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#18181B] bg-[#F7F5F0] hover:bg-[#EFECE6] rounded transition-colors cursor-pointer whitespace-nowrap"
                                title="Tanyakan interpretasi pasal ini ke AI Legal Consultant"
                              >
                                <MessageSquare className="w-3 h-3 text-[#1E3A8A]" />
                                <span>Tanya AI</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRefiningClauseId(isRefiningThis ? null : clause.id);
                                  setClauseInstruction('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1E3A8A] bg-[#F7F5F0] hover:bg-[#EFECE6] rounded transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Wand2 className="w-3 h-3" />
                                <span>Revisi AI</span>
                              </button>
                              <div className="inline-flex items-center gap-1 bg-[#F7F5F0] border border-[#E5E0D8] rounded px-2 py-0.5">
                                <ArrowUpDown className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                                <select
                                  value={activeClauseSort}
                                  onChange={(e) => {
                                    const val = e.target.value as
                                      | 'category'
                                      | 'risk_desc'
                                      | 'risk_asc'
                                      | 'title_asc'
                                      | 'title_desc';
                                    if (val) handleSortClauses(val);
                                  }}
                                  aria-label="Sort Clauses"
                                  className="text-[11px] font-medium text-[#18181B] bg-transparent focus:outline-none cursor-pointer"
                                  title="Urutkan otomatis seluruh pasal berdasarkan Kategori, Tingkat Risiko, atau Judul Alfabetis"
                                >
                                  <option value="">Sort Clauses</option>
                                  <option value="category">By Category</option>
                                  <option value="risk_desc">By Risk Level (Kritis → Standar)</option>
                                  <option value="risk_asc">By Risk Level (Standar → Kritis)</option>
                                  <option value="title_asc">By Alphabetical Title (A → Z)</option>
                                  <option value="title_desc">By Alphabetical Title (Z → A)</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => handleMoveClause(cIdx, 'up')}
                                title="Pindah ke atas"
                                className="p-1 text-[#57534E] hover:text-[#18181B] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === activeDoc.clauses.length - 1}
                                onClick={() => handleMoveClause(cIdx, 'down')}
                                title="Pindah ke bawah"
                                className="p-1 text-[#57534E] hover:text-[#18181B] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClause(clause.id)}
                                title="Hapus pasal"
                                className="p-1 text-[#57534E] hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Automatic Risk-Based Content & Regulation Switcher Bar */}
                          <div className="no-print flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded font-ui text-[11px]">
                            <div className="flex items-center gap-1.5 text-[#57534E]">
                              <ShieldAlert
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  clause.riskLevel === 'Kritis'
                                    ? 'text-red-700'
                                    : clause.riskLevel === 'Perhatian'
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}
                              />
                              <span>
                                <strong className="text-[#18181B]">
                                  Mode Isi & Regulasi Otomatis ({clause.riskLevel}):
                                </strong>{' '}
                                {clause.riskLevel === 'Kritis'
                                  ? 'Memuat sanksi denda tegas, ganti rugi penuh (Pasal 1243/1304 KUHPerdata) & pemutusan sepihak (Pasal 1266 KUHPerdata).'
                                  : clause.riskLevel === 'Perhatian'
                                  ? 'Memuat syarat pembuktian tertulis (Pasal 1866 KUHPerdata), verifikasi dokumen & masa perbaikan (cure period).'
                                  : 'Memuat ketentuan pelaksanaan normatif, musyawarah & asas itikad baik (Pasal 1338 KUHPerdata).'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {(['Standar', 'Perhatian', 'Kritis'] as const).map((rLevel) => {
                                const active = clause.riskLevel === rLevel;
                                return (
                                  <button
                                    key={rLevel}
                                    type="button"
                                    onClick={() => handleChangeClauseRiskLevel(clause, rLevel)}
                                    className={`px-2 py-0.5 text-[10.5px] font-medium rounded border transition-colors cursor-pointer ${
                                      active
                                        ? rLevel === 'Kritis'
                                          ? 'bg-red-700 text-white border-red-700'
                                          : rLevel === 'Perhatian'
                                          ? 'bg-amber-700 text-white border-amber-700'
                                          : 'bg-emerald-700 text-white border-emerald-700'
                                        : 'bg-white text-[#57534E] border-[#D6D0C4] hover:text-[#18181B]'
                                    }`}
                                  >
                                    {rLevel}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Color-Coded Clause Tags & AI Suggested Labels Bar */}
                          <div className="no-print flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#FAF9F6]/70 border border-[#E5E0D8] rounded font-ui text-[11px]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10.5px] font-semibold text-[#57534E] mr-0.5">
                                Label Aktif:
                              </span>
                              {catAnalysis.activeTags.map((tagItem) => (
                                <span
                                  key={tagItem}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded border ${catAnalysis.style.tagBg} ${catAnalysis.style.tagText} ${catAnalysis.style.tagBorder}`}
                                >
                                  <span>{tagItem}</span>
                                  {catAnalysis.activeTags.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveTagFromClause(clause, tagItem)
                                      }
                                      className="opacity-60 hover:opacity-100 ml-0.5 cursor-pointer"
                                      title="Hapus label ini"
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              ))}

                              {catAnalysis.suggestedTags.length > 0 && (
                                <>
                                  <span className="text-[#D6D0C4] mx-1">|</span>
                                  <span className="text-[10.5px] text-[#57534E]">
                                    Saran AI:
                                  </span>
                                  {catAnalysis.suggestedTags.slice(0, 3).map((sugTag) => (
                                    <button
                                      key={sugTag}
                                      type="button"
                                      onClick={() =>
                                        handleAddTagToClause(clause, sugTag)
                                      }
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#57534E] hover:text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-dashed border-[#D6D0C4] hover:border-[#93C5FD] rounded transition-colors cursor-pointer"
                                      title="Klik untuk menyematkan saran label AI ini ke pasal"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>{sugTag}</span>
                                    </button>
                                  ))}
                                </>
                              )}
                            </div>

                            {/* Quick Add Custom Label Input */}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!customTagVal.trim()) return;
                                handleAddTagToClause(clause, customTagVal);
                                setCustomTagInputs((prev) => ({
                                  ...prev,
                                  [clause.id]: '',
                                }));
                              }}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="text"
                                value={customTagVal}
                                onChange={(e) =>
                                  setCustomTagInputs((prev) => ({
                                    ...prev,
                                    [clause.id]: e.target.value,
                                  }))
                                }
                                placeholder="+ Label kustom..."
                                className="w-28 px-2 py-0.5 text-[10.5px] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A] text-[#18181B]"
                              />
                              {customTagVal.trim() && (
                                <button
                                  type="submit"
                                  className="px-2 py-0.5 text-[10px] font-semibold text-white bg-[#1E3A8A] rounded cursor-pointer"
                                >
                                  Tambah
                                </button>
                              )}
                            </form>
                          </div>

                          {/* Expanded 1-Sentence Plain-Language Summary View (Summarize Clause AI) */}
                          {isSummaryExpanded && (
                            <div className="no-print p-3 bg-[#EFF6FF] border-l-4 border-l-[#1D4ED8] border border-[#BFDBFE] rounded font-ui space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                                  <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                                  <span>
                                    Ringkasan 1 Kalimat Bahasa Sederhana ({clause.number})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={isSummarizingThis}
                                    onClick={() => handleSummarizeClauseWithAI(clause, true)}
                                    className="text-[11px] font-semibold text-[#1D4ED8] hover:underline disabled:opacity-50 cursor-pointer"
                                  >
                                    {isSummarizingThis ? 'Memproses AI...' : 'Perbarui via AI'}
                                  </button>
                                  <span className="text-[#CBD5E1]">·</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedSummaryClauseIds((prev) => ({
                                        ...prev,
                                        [clause.id]: false,
                                      }))
                                    }
                                    className="text-[11px] text-[#475569] hover:text-[#0F172A] cursor-pointer"
                                  >
                                    Tutup
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-[#0F172A] leading-relaxed font-medium">
                                {plainSummaryText}
                              </p>
                            </div>
                          )}

                          {/* Inline Split Clause (Pecah Pasal dengan AI) Drawer */}
                          {isSplittingThis && (
                            <div className="no-print p-3.5 bg-[#F7F5F0] border border-[#1E3A8A]/40 rounded-md font-ui space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                                  <Scissors className="w-3.5 h-3.5" />
                                  <span>
                                    Split Clause AI — Pecah Teks Terpilih dari {clause.number} Menjadi Pasal Baru (Pasal {cIdx + 2})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSplittingClauseId(null);
                                    setSplitSelectedText('');
                                  }}
                                  className="text-[11px] text-[#57534E] hover:text-[#18181B] cursor-pointer"
                                >
                                  Tutup
                                </button>
                              </div>

                              <p className="text-[11px] text-[#57534E]">
                                Sorot teks langsung pada ayat di bawah, klik salah satu ayat, atau sunting potongan teks berikut untuk dipecah menjadi Pasal mandiri dengan logika hukum yang tetap konsisten:
                              </p>

                              {clause.content.length > 1 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10.5px] text-[#57534E]">Pilih cepat ayat:</span>
                                  {clause.content.map((ayatItem, idxAyat) => (
                                    <button
                                      key={idxAyat}
                                      type="button"
                                      onClick={() => setSplitSelectedText(ayatItem)}
                                      className={`px-2 py-0.5 text-[10.5px] rounded border cursor-pointer ${
                                        splitSelectedText.trim() === ayatItem.trim()
                                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                          : 'bg-white text-[#18181B] border-[#D6D0C4] hover:bg-[#EFECE6]'
                                      }`}
                                    >
                                      Ayat {idxAyat + 1}
                                    </button>
                                  ))}
                                </div>
                              )}

                              <textarea
                                rows={2}
                                value={splitSelectedText}
                                onChange={(e) => setSplitSelectedText(e.target.value)}
                                placeholder="Sorot atau ketik bagian klausul yang ingin dipisahkan menjadi Pasal baru..."
                                className="w-full p-2.5 text-xs bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                              />

                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isSplittingClause || !splitSelectedText.trim()}
                                  onClick={() => handleSplitClauseWithAI(clause, cIdx)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded disabled:opacity-50 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>
                                    {isSplittingClause
                                      ? 'Memecah & Menyelaraskan Logika Hukum...'
                                      : `Pecah Jadi Pasal ${cIdx + 2} dengan AI`}
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Inline Per-Pasal AI Revision Drawer */}
                          {isRefiningThis && (
                            <div className="no-print p-3 bg-[#F7F5F0] border border-[#D6D0C4] rounded-md font-ui space-y-2">
                              <div className="text-xs font-semibold text-[#18181B]">
                                Perintah Revisi Otomatis untuk {clause.number}:
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  value={clauseInstruction}
                                  onChange={(e) => setClauseInstruction(e.target.value)}
                                  placeholder="Contoh: Perketat sanksi keterlambatan menjadi 2 per mil per hari..."
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                                />
                                <button
                                  type="button"
                                  disabled={isRefiningClause || !clauseInstruction.trim()}
                                  onClick={() => handleRefineClause(clause)}
                                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172E6E] disabled:opacity-50 whitespace-nowrap cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{isRefiningClause ? 'Menulis Ulang...' : 'Ubah Pasal'}</span>
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {[
                                  'Perkuat perlindungan Pihak Pertama',
                                  'Perkuat perlindungan Pihak Kedua',
                                  'Buat redaksi lebih ringkas & tegas',
                                  'Tambahkan batas waktu (SLA) yang jelas',
                                ].map((quickHint) => (
                                  <button
                                    key={quickHint}
                                    type="button"
                                    onClick={() => setClauseInstruction(quickHint)}
                                    className="text-[11px] text-[#57534E] hover:text-[#1E3A8A] bg-white px-2 py-0.5 rounded border border-[#E5E0D8] cursor-pointer whitespace-nowrap"
                                  >
                                    {quickHint}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Centered Formal Pasal Number & Title with Hover Natural Language Search across Pustaka Klausul Standar */}
                          <ClauseHeaderHoverSearch
                            clause={clause}
                            clauseIndex={cIdx}
                            library={dynamicClauseLibrary.items}
                            isSummaryExpanded={isSummaryExpanded}
                            onTogglePlainSummary={() => handleSummarizeClauseWithAI(clause)}
                            onUpdateTitle={(newTitle) => {
                              updateActiveDocument((d) => ({
                                ...d,
                                clauses: d.clauses.map((item) =>
                                  item.id === clause.id ? { ...item, title: newTitle } : item
                                ),
                              }));
                            }}
                            onReplaceClauseWithLibraryItem={handleReplaceClauseWithLibraryItem}
                            onInsertLibraryItemAfterClause={handleInsertLibraryItemAfterClause}
                          />

                          {/* Ayat-Ayat (Sub-clauses) with Automatic Glossary Tooltips + Click-to-Edit + Text Selection Split */}
                          <div
                            className={`space-y-2.5 pt-1 ${
                              bulkFormatConfig.indentation === 'hanging_subclause'
                                ? 'pl-4 sm:pl-6 border-l-2 border-[#E5E0D8]'
                                : bulkFormatConfig.indentation === 'notarial_first_line'
                                ? '[&_div.text-justify]:indent-8'
                                : ''
                            }`}
                          >
                            {clause.content.map((ayat, aIdx) => {
                              const ayatAiChange = clause.aiChangeRecord?.paragraphChanges.find(
                                (pc) => pc.ayatIndex === aIdx
                              );
                              const isAyatAddedByAi = ayatAiChange?.changeType === 'added';
                              const isAyatModifiedByAi = ayatAiChange?.changeType === 'modified';

                              return (
                                <div
                                  key={aIdx}
                                  data-testid={`clause-ayat-row-${clause.id}-${aIdx}`}
                                  data-ai-change-type={ayatAiChange?.changeType || 'unchanged'}
                                  className={`space-y-1.5 transition-all ${
                                    isAyatAddedByAi
                                      ? 'p-2.5 rounded-md bg-emerald-50/75 border border-emerald-300 border-l-4 border-l-emerald-600'
                                      : isAyatModifiedByAi
                                      ? 'p-2.5 rounded-md bg-blue-50/65 border border-blue-300 border-l-4 border-l-[#1E3A8A]'
                                      : ''
                                  }`}
                                >
                                  {/* Direct Inline Marker on the Exact Ayat Changed or Added by AI */}
                                  {(isAyatAddedByAi || isAyatModifiedByAi) && (
                                    <div
                                      data-testid={`ayat-ai-marker-badge-${clause.id}-${aIdx}`}
                                      className="no-print flex flex-wrap items-center justify-between gap-1.5 font-ui text-[10px]"
                                    >
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-code font-bold uppercase tracking-wider text-white ${
                                            isAyatAddedByAi ? 'bg-emerald-700' : 'bg-[#1E3A8A]'
                                          }`}
                                        >
                                          <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                                          <span>
                                            {isAyatAddedByAi
                                              ? `➕ Bagian Ditambahkan AI · Ayat (${aIdx + 1})`
                                              : `✏️ Bagian Diubah Isinya oleh AI · Ayat (${aIdx + 1})`}
                                          </span>
                                        </span>
                                        <span className="text-[#57534E] font-medium">
                                          {clause.aiChangeRecord?.sourceLabel}
                                        </span>
                                      </div>

                                      {isAyatAddedByAi && (
                                        <span className="font-code text-[9.5px] font-semibold text-emerald-800 bg-white/90 px-1.5 py-0.5 rounded border border-emerald-200">
                                          Before: Belum ada Ayat ({aIdx + 1}) → After: Ditambahkan AI
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Inline Before Text Strip when this specific Ayat's content was modified by AI */}
                                  {isAyatModifiedByAi && ayatAiChange?.beforeText && (
                                    <div
                                      data-testid={`ayat-inline-before-box-${clause.id}-${aIdx}`}
                                      className="no-print p-2 rounded bg-rose-50/90 border border-rose-200 text-[11px] font-ui space-y-0.5"
                                    >
                                      <div className="text-[9.5px] font-code font-bold uppercase text-rose-800">
                                        SEBELUM DIUBAH AI (Before Ayat {aIdx + 1}):
                                      </div>
                                      <p className="font-legal text-rose-950 line-through decoration-rose-400 leading-snug">
                                        {ayatAiChange.beforeText}
                                      </p>
                                      <div className="text-[9.5px] font-code font-bold uppercase text-emerald-800 pt-1">
                                        SESUDAH DIUBAH AI (After Ayat {aIdx + 1} — Aktif di Bawah):
                                      </div>
                                    </div>
                                  )}

                                  <div className="group flex items-start gap-2">
                                    <EditableAnnotatedParagraph
                                      rows={Math.max(2, Math.ceil(ayat.length / 85))}
                                      value={ayat}
                                      extraGlossaryItems={extraAiGlossary}
                                      clauseContext={`${clause.number} - ${clause.title}`}
                                      enableGlobalShortcutFallback={cIdx === 0 && aIdx === 0}
                                      onSelectText={(selected) => {
                                        setSplittingClauseId(clause.id);
                                        setSplitSelectedText(selected);
                                      }}
                                      onAiTransformApplied={(
                                        actionLabel,
                                        newParagraphVal,
                                        prevParagraphVal
                                      ) =>
                                        handleRecordClauseAiWritingTransform(
                                          clause,
                                          aIdx,
                                          actionLabel,
                                          newParagraphVal,
                                          prevParagraphVal
                                        )
                                      }
                                      onChange={(newText) => {
                                        updateActiveDocument((d) => ({
                                          ...d,
                                          clauses: d.clauses.map((item) =>
                                            item.id === clause.id
                                              ? {
                                                  ...item,
                                                  content: item.content.map((p, i) =>
                                                    i === aIdx ? newText : p
                                                  ),
                                                }
                                              : item
                                          ),
                                        }));
                                      }}
                                    />
                                    {clause.content.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSplittingClauseId(clause.id);
                                          setSplitSelectedText(ayat);
                                        }}
                                        className="no-print opacity-0 group-hover:opacity-100 p-1 text-[#1E3A8A] hover:bg-[#F7F5F0] rounded transition-opacity cursor-pointer"
                                        title="Pecah ayat ini menjadi pasal baru (Split Clause)"
                                      >
                                        <Scissors className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {clause.content.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateActiveDocument((d) => ({
                                            ...d,
                                            clauses: d.clauses.map((item) =>
                                              item.id === clause.id
                                                ? {
                                                    ...item,
                                                    content: item.content.filter(
                                                      (_, i) => i !== aIdx
                                                    ),
                                                  }
                                                : item
                                            ),
                                          }))
                                        }
                                        className="no-print opacity-0 group-hover:opacity-100 p-1 text-[#78716C] hover:text-red-600 transition-opacity"
                                        title="Hapus ayat"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="no-print pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateActiveDocument((d) => ({
                                  ...d,
                                  clauses: d.clauses.map((item) =>
                                    item.id === clause.id
                                      ? {
                                          ...item,
                                          content: [
                                            ...item.content,
                                            `(${item.content.length + 1}) Ketentuan ayat tambahan sebagaimana disepakati oleh Para Pihak.`,
                                          ],
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="text-xs font-ui font-medium text-[#57534E] hover:text-[#1E3A8A] cursor-pointer"
                            >
                              + Tambah Ayat ({clause.content.length + 1})
                            </button>
                          </div>

                          {/* Dual-Language Layout View (Side-by-Side Indonesian & Legal Translation) */}
                          {(dualLanguageEnabled || dualLanguageClauseIds[clause.id]) && (
                            <DualLanguageClauseView
                              clause={clause}
                              targetLanguage={
                                clause.activeTranslationLang || targetTranslationLang
                              }
                              onChangeTargetLanguage={(lang) => {
                                setTargetTranslationLang(lang);
                              }}
                              onRetranslateWithAI={(cl, lang) =>
                                handleTranslateClauseWithAI(cl, lang)
                              }
                              onApplyTranslationToClauseText={
                                handleApplyTranslationToClauseText
                              }
                              isTranslating={translatingClauseId === clause.id}
                            />
                          )}

                          {/* Clause-Specific Commenting Thread (Does not mutate original clause text) */}
                          {isCommentOpen && (
                            <ClauseCommentThread
                              clause={clause}
                              comments={clauseComments}
                              defaultReviewerName={
                                isReviewOnlyMode
                                  ? activeDoc.partyTwo.representative || 'Reviewer Pihak Kedua'
                                  : 'Tim Legal / Reviewer'
                              }
                              defaultReviewerRole={
                                isReviewOnlyMode ? 'Pihak Kedua (Via Link Berbagi)' : 'Kuasa Hukum'
                              }
                              shareUrl={currentShareUrl}
                              onNotify={showToast}
                              ownerEmail={ownerNotificationEmail}
                              onChangeOwnerEmail={handleChangeOwnerEmailSetting}
                              emailNotificationsEnabled={emailNotificationsEnabled}
                              onToggleEmailNotifications={handleToggleEmailNotifications}
                              ownerNotifications={ownerCommentAlerts}
                              onTriggerOwnerNotification={handleTriggerOwnerNotification}
                              onAddComment={handleAddClauseComment}
                              onToggleResolveComment={handleToggleResolveComment}
                              onResolveAllComments={handleResolveAllClauseComments}
                              showUnresolvedInSidebar={showUnresolvedInSidebar}
                              onToggleShowUnresolvedInSidebar={setShowUnresolvedInSidebar}
                              globalResolveTrigger={globalResolveAnimTrigger}
                            />
                          )}
                        </div>
                      );
                    })}

                    {/* Hoverable Pasal Placeholder for Natural Language Search across Pustaka Klausul Standar */}
                    {!isReviewOnlyMode && (
                      <PasalPlaceholderHoverCard
                        nextClauseNumber={activeDoc.clauses.length + 1}
                        lastClause={activeDoc.clauses[activeDoc.clauses.length - 1]}
                        library={dynamicClauseLibrary.items}
                        onInsertLibraryClause={handleInsertLibraryClause}
                        onReplaceLastClause={handleReplaceClauseWithLibraryItem}
                      />
                    )}

                    {/* Proactive Contextual Clause Suggestions (Penyisipan Kontekstual) */}
                    <ContextualClauseInsertionBox
                      document={activeDoc}
                      onInsertSuggestion={handleInsertContextualSuggestion}
                      onNotify={showToast}
                    />

                    {/* Add New Clause via 1 AI Command Box */}
                    <form
                      onSubmit={handleAddClauseWithAI}
                      className="no-print p-4 bg-[#FAF9F6] border border-dashed border-[#D6D0C4] rounded-md font-ui space-y-2.5"
                    >
                      <label className="block text-xs font-semibold text-[#18181B]">
                        Tambah Pasal Baru dengan 1 Perintah AI (Otomatis jadi Pasal{' '}
                        {activeDoc.clauses.length + 1})
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newClausePrompt}
                          onChange={(e) => setNewClausePrompt(e.target.value)}
                          placeholder="Contoh: Tambahkan pasal larangan membajak karyawan selama 2 tahun dengan denda Rp 100 juta..."
                          className="flex-1 px-3 py-2 text-xs bg-white border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A]"
                        />
                        <button
                          type="submit"
                          disabled={isAddingClause || !newClausePrompt.trim()}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] disabled:opacity-50 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddingClause ? 'Menyusun Pasal...' : 'Sisipkan Pasal AI'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* PENUTUP & TANDA TANGAN (CLOSING & EXECUTION BLOCK) */}
                  <div className="pt-6 border-t-2 border-[#18181B] space-y-6">
                    <div>
                      <label className="no-print block text-[11px] font-ui font-medium text-[#57534E] mb-1">
                        Kalimat Penutup Akta:
                      </label>
                      <EditableAnnotatedParagraph
                        rows={3}
                        value={activeDoc.closingText}
                        extraGlossaryItems={extraAiGlossary}
                        onChange={(val) =>
                          updateActiveDocument((d) => ({ ...d, closingText: val }))
                        }
                      />
                    </div>

                    {/* Location & Effective Date */}
                    <div className="flex items-center justify-end gap-2 font-ui text-xs">
                      <input
                        type="text"
                        value={activeDoc.signingLocation}
                        onChange={(e) =>
                          updateActiveDocument((d) => ({ ...d, signingLocation: e.target.value }))
                        }
                        className="w-28 text-right font-medium text-[#18181B] bg-[#FAF9F6] px-2 py-1 rounded border border-[#E5E0D8]"
                      />
                      <span>,</span>
                      <input
                        type="text"
                        value={activeDoc.effectiveDate}
                        onChange={(e) =>
                          updateActiveDocument((d) => ({ ...d, effectiveDate: e.target.value }))
                        }
                        className="w-40 font-code text-[#18181B] bg-[#FAF9F6] px-2 py-1 rounded border border-[#E5E0D8]"
                      />
                    </div>

                    {/* 2-Column Formal Signature Grid */}
                    <div className="grid grid-cols-2 gap-6 pt-4 text-center">
                      <div className="flex flex-col justify-between min-h-[180px] p-4 border border-[#E5E0D8] rounded-md">
                        <div>
                          <div className="text-xs font-ui font-bold uppercase tracking-wider text-[#18181B]">
                            {activeDoc.partyOne.role || 'PIHAK PERTAMA'}
                          </div>
                          <div className="text-sm font-semibold text-[#18181B] mt-0.5">
                            {activeDoc.partyOne.name}
                          </div>
                        </div>

                        <div className="my-4 mx-auto px-3 py-2 border border-dashed border-[#A8A29E] text-[11px] font-code text-[#78716C]">
                          <LegalAnnotatedText
                            text={
                              activeDocumentLanguage === 'en'
                                ? '[ Stamp Duty IDR 10,000 ]'
                                : '[ Materai Rp10.000 ]'
                            }
                            extraGlossaryItems={extraAiGlossary}
                          />
                        </div>

                        <div>
                          <div className="text-sm font-bold underline text-[#18181B]">
                            {activeDoc.partyOne.representative}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between min-h-[180px] p-4 border border-[#E5E0D8] rounded-md">
                        <div>
                          <div className="text-xs font-ui font-bold uppercase tracking-wider text-[#18181B]">
                            {activeDoc.partyTwo.role || 'PIHAK KEDUA'}
                          </div>
                          <div className="text-sm font-semibold text-[#18181B] mt-0.5">
                            {activeDoc.partyTwo.name}
                          </div>
                        </div>

                        <div className="my-4 mx-auto px-3 py-2 text-[11px] font-code text-transparent select-none">
                          [ Ruang Tanda Tangan ]
                        </div>

                        <div>
                          <div className="text-sm font-bold underline text-[#18181B]">
                            {activeDoc.partyTwo.representative}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE 2: CLEAN ARCHIVAL FOLIO VIEW (WITH AUTOMATIC HOVER GLOSSARY TOOLTIPS) */
                <div className="space-y-6 font-legal text-[15.5px] leading-[1.75] text-[#18181B]">
                  <div className="text-center pb-6 border-b-2 border-[#18181B]">
                    <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
                      <LegalAnnotatedText
                        text={activeDoc.title}
                        extraGlossaryItems={extraAiGlossary}
                      />
                    </h2>
                    {activeDoc.subtitle && (
                      <p className="text-sm text-[#57534E] mt-1">{activeDoc.subtitle}</p>
                    )}
                    <p className="text-xs font-code font-semibold mt-2">
                      {activeDocumentLanguage === 'en' ? 'Document No.:' : 'Nomor:'}{' '}
                      {activeDoc.documentNumber}
                    </p>
                  </div>

                  <p className="text-justify">
                    <LegalAnnotatedText
                      text={activeDoc.openingText}
                      extraGlossaryItems={extraAiGlossary}
                    />
                  </p>

                  <div className="pl-4 border-l-2 border-[#18181B] space-y-4">
                    <div>
                      <div className="font-bold">1. {activeDoc.partyOne.name}</div>
                      <div className="text-sm text-[#3F3F46]">
                        {activeDocumentLanguage === 'en' ? 'Represented by:' : 'Diwakili oleh:'}{' '}
                        {activeDoc.partyOne.representative} ·{' '}
                        {activeDocumentLanguage === 'en' ? 'Domicile:' : 'Kedudukan:'}{' '}
                        {activeDoc.partyOne.address}
                      </div>
                      <p className="text-justify mt-1">
                        <LegalAnnotatedText
                          text={activeDoc.partyOne.description}
                          extraGlossaryItems={extraAiGlossary}
                        />
                      </p>
                    </div>

                    <div>
                      <div className="font-bold">2. {activeDoc.partyTwo.name}</div>
                      <div className="text-sm text-[#3F3F46]">
                        {activeDocumentLanguage === 'en' ? 'Represented by:' : 'Diwakili oleh:'}{' '}
                        {activeDoc.partyTwo.representative} ·{' '}
                        {activeDocumentLanguage === 'en' ? 'Domicile:' : 'Kedudukan:'}{' '}
                        {activeDoc.partyTwo.address}
                      </div>
                      <p className="text-justify mt-1">
                        <LegalAnnotatedText
                          text={activeDoc.partyTwo.description}
                          extraGlossaryItems={extraAiGlossary}
                        />
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold">
                      {activeDocumentLanguage === 'en'
                        ? 'The Parties hereby first recite and declare as follows:'
                        : 'Para Pihak terlebih dahulu menerangkan hal-hal sebagai berikut:'}
                    </p>
                    {activeDoc.recitals.map((r, i) => (
                      <p key={i} className="text-justify">
                        <LegalAnnotatedText text={r} extraGlossaryItems={extraAiGlossary} />
                      </p>
                    ))}
                  </div>

                  <p className="text-justify italic">
                    <LegalAnnotatedText
                      text={
                        activeDocumentLanguage === 'en'
                          ? 'NOW, THEREFORE, based on the foregoing premises, the Parties hereby agree to bind themselves to this Agreement under the following terms and conditions:'
                          : 'Berdasarkan hal-hal tersebut di atas, Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian ini dengan syarat-syarat dan ketentuan sebagai berikut:'
                      }
                      extraGlossaryItems={extraAiGlossary}
                    />
                  </p>

                  <div className="space-y-6 pt-2">
                    {activeDoc.clauses.map((c) => (
                      <div key={c.id} className="space-y-2">
                        <div className="text-center font-bold uppercase">
                          <div>{c.number}</div>
                          <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                            <span>
                              <LegalAnnotatedText
                                text={c.title}
                                extraGlossaryItems={extraAiGlossary}
                              />
                            </span>
                            {c.plainSummary && (
                              <span
                                title={`Ringkasan AI (Plain Language): ${c.plainSummary}`}
                                className="no-print inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider bg-amber-50 text-[#1E3A8A] border border-amber-300"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400 shrink-0" />
                                <span>AI</span>
                              </span>
                            )}
                          </div>
                        </div>
                        {c.content.map((p, idx) => (
                          <p key={idx} className="text-justify whitespace-pre-line">
                            <LegalAnnotatedText text={p} extraGlossaryItems={extraAiGlossary} />
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-[#D6D0C4] space-y-6">
                    <p className="text-justify">
                      <LegalAnnotatedText
                        text={activeDoc.closingText}
                        extraGlossaryItems={extraAiGlossary}
                      />
                    </p>
                    <p className="text-right font-semibold">
                      {activeDoc.signingLocation}, {activeDoc.effectiveDate}
                    </p>

                    <div className="grid grid-cols-2 gap-8 pt-4 text-center">
                      <div className="space-y-16">
                        <div>
                          <div className="font-bold uppercase text-xs">
                            {activeDocumentLanguage === 'en' ? 'FIRST PARTY' : 'PIHAK PERTAMA'}
                          </div>
                          <div className="font-semibold">{activeDoc.partyOne.name}</div>
                        </div>
                        <div className="text-xs font-code text-[#78716C]">
                          <LegalAnnotatedText
                            text={
                              activeDocumentLanguage === 'en'
                                ? '[ Stamp Duty IDR 10,000 ]'
                                : '[ Materai Rp10.000 ]'
                            }
                            extraGlossaryItems={extraAiGlossary}
                          />
                        </div>
                        <div className="font-bold underline">
                          {activeDoc.partyOne.representative}
                        </div>
                      </div>

                      <div className="space-y-16">
                        <div>
                          <div className="font-bold uppercase text-xs">
                            {activeDocumentLanguage === 'en' ? 'SECOND PARTY' : 'PIHAK KEDUA'}
                          </div>
                          <div className="font-semibold">{activeDoc.partyTwo.name}</div>
                        </div>
                        <div className="text-xs font-code text-transparent select-none">-</div>
                        <div className="font-bold underline">
                          {activeDoc.partyTwo.representative}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtle Online Verification QR Code Footer at Bottom of A4 Sheet */}
              <DocumentVerificationQrFooter
                document={activeDoc}
                shareUrl={currentShareUrl}
                onOpenShareModal={handleOpenShareModal}
                onDownloadOriginalPdf={handleExportPdf}
                onInsertProceduralClause={handleInsertProceduralClauseFromManual}
                onUpdateClosingText={handleUpdateClosingTextFromManual}
                onOpenManualKepatuhanTab={() => {
                  setRightTab('audit');
                  setAuditPanelSubTab('manual_kepatuhan');
                  setTimeout(() => {
                    rightInspectorRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }, 80);
                }}
                manualComplianceCheckedByDoc={manualComplianceCheckedByDoc}
                onChangeManualComplianceCheckedByDoc={setManualComplianceCheckedByDoc}
                manualComplianceProfileMode={manualComplianceProfileMode}
                onChangeManualComplianceProfileMode={setManualComplianceProfileMode}
                onSimulateScanQr={() => {
                  setIsReviewOnlyMode(true);
                  setViewMode('structured');
                  if (activeDoc.clauses[0]) {
                    setOpenCommentClauseId(activeDoc.clauses[0].id);
                  }
                  showToast(
                    `Simulasi Pindai Kode QR Aktif: Menampilkan halaman verifikasi daring "${activeDoc.title}" (${activeDoc.documentNumber}) dalam Mode Tinjauan Terkunci (Comment-Only).`
                  );
                }}
                onNotify={showToast}
              />
            </article>
          )}
        </section>

        {/* RIGHT SIDEBAR: AI LEGAL CONSULTANT CHAT, AUDIT PIE CHART & REGULATION SEARCH, & GLOSARIUM ISTILAH */}
        <aside className="no-print lg:col-span-3 space-y-5">
          {/* Card 1: AI LEGAL CONSULTANT CHAT PANEL (Google Search Grounded) */}
          <div
            ref={consultantPanelRef}
            className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>AI Legal Consultant Chat</span>
              </h2>
              {currentChatMessages.length > 1 && (
                <button
                  type="button"
                  onClick={handleResetChatHistory}
                  title="Reset percakapan"
                  className="inline-flex items-center gap-1 text-[11px] text-[#57534E] hover:text-[#18181B] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#57534E] leading-relaxed">
              Tanyakan interpretasi klausul, bunyi pasal KUHPerdata/UU terbaru dari sumber Google & pemerintah, atau risiko kontrak aktif.
            </p>

            {/* Clause Context Selector */}
            <div>
              <label className="block text-[11px] font-medium text-[#57534E] mb-1">
                Fokus Pertanyaan Pasal:
              </label>
              <select
                value={focusedChatClause}
                onChange={(e) => setFocusedChatClause(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-[#FAF9F6] border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A]"
              >
                <option value="Seluruh Dokumen">
                  Seluruh Dokumen ({activeDoc.clauses.length} Pasal)
                </option>
                {activeDoc.clauses.map((c) => {
                  const val = `${c.number} - ${c.title}`;
                  return (
                    <option key={c.id} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Scrollable Multi-Turn Conversation Thread */}
            <div
              ref={chatScrollRef}
              className="space-y-2.5 max-h-[320px] overflow-y-auto p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md"
            >
              {currentChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-md text-xs leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-[#1E3A8A] text-white ml-4'
                      : 'bg-white text-[#18181B] border border-[#E5E0D8] mr-2'
                  }`}
                >
                  <div
                    className={`text-[10px] ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-[#57534E]'
                    }`}
                  >
                    <span>{msg.role === 'user' ? 'Anda' : 'Konsultan Hukum AI'}</span>
                    {msg.focusedClause && msg.focusedClause !== 'Seluruh Dokumen' && (
                      <>
                        <span className="mx-1">·</span>
                        <span>{msg.focusedClause}</span>
                      </>
                    )}
                    <span className="mx-1">·</span>
                    <span className="font-code tabular-nums">{msg.timestamp}</span>
                  </div>
                  <FormattedLegalText
                    text={msg.text}
                    isInverted={msg.role === 'user'}
                  />

                  {/* Display Google Search & Government Portal Citations if available */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E0D8] space-y-1">
                      <div className="text-[10px] font-semibold text-[#57534E]">
                        Sumber Rujukan Google & Web Pemerintah:
                      </div>
                      {msg.sources.slice(0, 4).map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-1.5 text-[10.5px] text-[#1E3A8A] hover:underline truncate"
                        >
                          <span className="truncate">{src.title || src.uri}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isChatLoading && (
                <div className="p-2.5 bg-white border border-[#E5E0D8] rounded-md text-xs text-[#57534E]">
                  Menelaah klausul & menelusuri regulasi hukum Indonesia di Google...
                </div>
              )}
            </div>

            {/* Quick Consultation Question Prompts */}
            <div className="flex flex-wrap gap-1">
              {[
                'Apa risiko utama di pasal ini?',
                'Dasar hukum pasal ini menurut UU/KUHPerdata?',
                'Saran perbaikan redaksi klausul',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isChatLoading}
                  onClick={() => handleSendChatMessage(q)}
                  className="text-[11px] text-[#57534E] hover:text-[#1E3A8A] bg-[#FAF9F6] hover:bg-[#EFECE6] px-2 py-1 rounded border border-[#E5E0D8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="space-y-2"
            >
              <textarea
                ref={chatInputRef}
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                placeholder="Tanyakan interpretasi pasal, UU, atau risiko hukum..."
                className="w-full px-2.5 py-2 text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:bg-white resize-none"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isChatLoading ? 'Menelaah...' : 'Kirim Pertanyaan Hukum'}</span>
              </button>
            </form>
          </div>

          {/* Card 2: AUDIT HUKUM (WITH RECHARTS PIE CHART), PENCARIAN PASAL & UU (GOOGLE/JDIH), VARIABEL, & KLAUSUL */}
          <div
            ref={rightInspectorRef}
            className="bg-white border border-[#E5E0D8] rounded-lg p-4"
          >
            {/* Segmented Tab Bar */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-[#F7F5F0] rounded-md border border-[#E5E0D8] mb-4">
              <button
                type="button"
                onClick={() => setRightTab('audit')}
                className={`px-1 py-1.5 text-[10.5px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                  rightTab === 'audit'
                    ? 'bg-white text-[#18181B] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                Audit
              </button>
              <button
                type="button"
                onClick={() => setRightTab('regulations')}
                className={`px-1 py-1.5 text-[10.5px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                  rightTab === 'regulations'
                    ? 'bg-white text-[#18181B] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                Cari UU
              </button>
              <button
                type="button"
                onClick={() => setRightTab('variables')}
                className={`px-1 py-1.5 text-[10.5px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                  rightTab === 'variables'
                    ? 'bg-white text-[#18181B] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                Variabel
              </button>
              <button
                type="button"
                onClick={() => setRightTab('library')}
                className={`px-1 py-1.5 text-[10.5px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                  rightTab === 'library'
                    ? 'bg-white text-[#18181B] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                Klausul
              </button>
              <button
                type="button"
                data-testid="right-tab-clause-history"
                onClick={() => setRightTab('clause_history')}
                className={`px-1 py-1.5 text-[10.5px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                  rightTab === 'clause_history'
                    ? 'bg-white text-[#1E3A8A] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
                title="AI Clause History — Lacak & revert iterasi AI per pasal"
              >
                Riwayat AI
              </button>
            </div>

            {/* TAB 1: AUDIT HUKUM + MANUAL KEPATUHAN TAB + SMART REMINDER + RECHARTS PIE CHART OF CLAUSE RISK LEVELS */}
            {rightTab === 'audit' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Panel Audit Hukum & Kepatuhan Prosedural</span>
                  </h3>
                </div>

                {/* Sub-Tab Bar inside Audit Hukum Panel: 'Analisis & Risiko' vs 'Manual Kepatuhan' */}
                <div
                  data-testid="audit-hukum-subtab-bar"
                  className="grid grid-cols-2 gap-1 p-1 bg-[#F7F5F0] border border-[#D6D0C4] rounded-md"
                >
                  <button
                    type="button"
                    data-testid="audit-subtab-manual-kepatuhan"
                    onClick={() => setAuditPanelSubTab('manual_kepatuhan')}
                    className={`px-2 py-1.5 text-[11px] font-semibold rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      auditPanelSubTab === 'manual_kepatuhan'
                        ? 'bg-[#1E3A8A] text-white shadow-2xs'
                        : 'text-[#57534E] hover:text-[#18181B] bg-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Manual Kepatuhan</span>
                  </button>
                  <button
                    type="button"
                    data-testid="audit-subtab-analisis-risiko"
                    onClick={() => setAuditPanelSubTab('analisis_risiko')}
                    className={`px-2 py-1.5 text-[11px] font-semibold rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      auditPanelSubTab === 'analisis_risiko'
                        ? 'bg-[#1E3A8A] text-white shadow-2xs'
                        : 'text-[#57534E] hover:text-[#18181B] bg-transparent'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>Analisis & Grafik Risiko</span>
                  </button>
                </div>

                {/* MANUAL KEPATUHAN TAB CONTENT (Step-by-Step Procedural Checklist by Document Category) */}
                {auditPanelSubTab === 'manual_kepatuhan' && (
                  <ProceduralComplianceManual
                    document={activeDoc}
                    onInsertProceduralClause={handleInsertProceduralClauseFromManual}
                    onUpdateClosingText={handleUpdateClosingTextFromManual}
                    onNotify={showToast}
                    checkedByDoc={manualComplianceCheckedByDoc}
                    onChangeCheckedByDoc={setManualComplianceCheckedByDoc}
                    selectedProfileMode={manualComplianceProfileMode}
                    onChangeProfileMode={setManualComplianceProfileMode}
                  />
                )}

                <div className="space-y-3.5 pt-1 border-t border-[#E5E0D8]">

                {/* Smart Reminder: Temporary Lifecycle Notifications for Effective Date & Expiration */}
                <div className="-mx-4">
                  <SmartLifecycleReminderBanner
                    document={activeDoc}
                    onJumpToClause={handleJumpToLocation}
                  />
                </div>

                {/* Export Legal Compliance Summary PDF & Legal Memo Actions for Stakeholders/Clients */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportAuditSummaryPdf}
                      disabled={selectedAuditClauseIds.length === 0}
                      data-testid="export-audit-summary-pdf-btn"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      title="Unduh laporan Audit Hukum, Grafik Pie Chart Risiko, dan Rekomendasi sebagai PDF sesuai pasal yang dipilih"
                    >
                      <FileDown className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Ekspor PDF Legal Compliance Summary (
                        {
                          activeDoc.clauses.filter((c) =>
                            selectedAuditClauseIds.includes(c.id)
                          ).length
                        }
                        /{activeDoc.clauses.length} Pasal)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomizingAuditPdf((prev) => !prev)}
                      data-testid="customize-audit-pdf-btn"
                      className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                        isCustomizingAuditPdf
                          ? 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]'
                          : 'bg-white text-[#18181B] border-[#D6D0C4] hover:bg-[#F7F5F0]'
                      }`}
                      title="Pilih pasal-pasal tertentu saja yang ingin disertakan dalam ekspor PDF Legal Compliance Summary"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Kustomisasi</span>
                    </button>
                  </div>

                  {/* Clause Selection Customization Panel for PDF Legal Compliance Summary */}
                  {isCustomizingAuditPdf && (
                    <div
                      data-testid="audit-pdf-customization-panel"
                      className="p-3 bg-[#FAF9F6] border border-[#D6D0C4] rounded-md space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-[#18181B]">
                          Pilih Pasal untuk Dokumen Audit PDF:
                        </span>
                        <span className="font-code text-[10.5px] font-semibold text-[#1E3A8A]">
                          {
                            activeDoc.clauses.filter((c) =>
                              selectedAuditClauseIds.includes(c.id)
                            ).length
                          }{' '}
                          dari {activeDoc.clauses.length} Pasal Dipilih
                        </span>
                      </div>

                      {/* Quick Filter / Selection Shortcuts */}
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAuditClauseIds(activeDoc.clauses.map((c) => c.id))
                          }
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-[#EFECE6] text-[#18181B] border border-[#D6D0C4] rounded cursor-pointer"
                        >
                          Pilih Semua ({activeDoc.clauses.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const critIds = activeDoc.clauses
                              .filter((c) => (c.riskLevel || '').toLowerCase() === 'kritis')
                              .map((c) => c.id);
                            setSelectedAuditClauseIds(
                              critIds.length > 0 ? critIds : activeDoc.clauses.map((c) => c.id)
                            );
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded cursor-pointer"
                        >
                          Hanya Kritis
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const lowIds = activeDoc.clauses
                              .filter((c) => {
                                const rl = (c.riskLevel || '').toLowerCase();
                                return rl === 'standar' || rl === 'rendah';
                              })
                              .map((c) => c.id);
                            setSelectedAuditClauseIds(
                              lowIds.length > 0 ? lowIds : activeDoc.clauses.map((c) => c.id)
                            );
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded cursor-pointer"
                        >
                          Hanya Risiko Rendah
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAuditClauseIds([])}
                          className="px-2 py-0.5 text-[10px] font-medium text-[#57534E] hover:text-red-700 px-1.5 cursor-pointer"
                        >
                          Kosongkan
                        </button>
                      </div>

                      {/* Individual Clause Checkboxes */}
                      <div className="max-h-44 overflow-y-auto space-y-1 pr-1 border-t border-b border-[#E5E0D8] py-1.5">
                        {activeDoc.clauses.map((clause) => {
                          const isChecked = selectedAuditClauseIds.includes(clause.id);
                          const rl = (clause.riskLevel || '').toLowerCase();
                          return (
                            <label
                              key={clause.id}
                              className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                                isChecked
                                  ? 'bg-white border-[#BFDBFE] text-[#18181B]'
                                  : 'bg-[#F7F5F0]/60 border-transparent text-[#78716C]'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedAuditClauseIds((prev) =>
                                      prev.includes(clause.id)
                                        ? prev.filter((id) => id !== clause.id)
                                        : [...prev, clause.id]
                                    );
                                  }}
                                  className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] shrink-0"
                                />
                                <span className="font-code font-semibold text-[#18181B] shrink-0">
                                  {clause.number}
                                </span>
                                <span className="truncate">{clause.title}</span>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 text-[9.5px] font-semibold rounded shrink-0 ${
                                  rl === 'kritis'
                                    ? 'bg-red-100 text-red-800'
                                    : rl === 'perhatian'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {rl === 'standar' ? 'Rendah / Standar' : clause.riskLevel}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Option to also include full sub-clause text in the PDF matrix */}
                      <label className="flex items-center gap-2 text-[11px] text-[#57534E] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeClauseContentInAuditPdf}
                          onChange={(e) => setIncludeClauseContentInAuditPdf(e.target.checked)}
                          className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                        <span>Sertakan teks lengkap ayat pada PDF Legal Compliance Summary</span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsLegalMemoModalOpen(true)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#1E3A8A]/30 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      title="Buka pratinjau dokumen formal Legal Memo siap presentasi klien"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Buka & Ekspor Legal Memo Klien</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportLegalMemoToPdf(activeDoc);
                        showToast('PDF Legal Memo Klien berhasil diunduh.');
                      }}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#18181B] bg-white hover:bg-[#F7F5F0] border border-[#D6D0C4] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      title="Unduh langsung Legal Memo dalam format PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>PDF Memo</span>
                    </button>
                  </div>
                </div>

                {/* Recharts PieChart Visual Summary of Clause Risk Levels (reflecting selected audit clauses) */}
                <AuditRiskChart
                  clauses={
                    selectedAuditClauseIds.length > 0
                      ? activeDoc.clauses.filter((c) => selectedAuditClauseIds.includes(c.id))
                      : activeDoc.clauses
                  }
                />

                {/* AUDIT EVOLUTION LOG: VISUAL TIMELINE OF RISK-LEVEL CHANGES, CLAUSE MODIFICATIONS & CLIENT LEGAL JUSTIFICATIONS */}
                <AuditEvolutionLog
                  document={activeDoc}
                  onJumpToClause={handleJumpToLocation}
                  onSaveCustomJustification={handleSaveCustomJustification}
                  onAddManualAuditEvent={handleAddManualAuditEvent}
                  onExportAuditEvolutionPdf={handleExportAuditEvolutionPdf}
                  onNotify={showToast}
                  onOpenFullModal={() => setIsAuditEvolutionModalOpen(true)}
                />

                {/* Comprehensive Cross-Clause Risk Scan (Terminology Inconsistency & Legal Conflicts) */}
                <ComprehensiveRiskScannerSection
                  document={activeDoc}
                  onJumpToLocation={handleJumpToLocation}
                  onHarmonizeFinding={handleHarmonizeScanFinding}
                  onNotify={showToast}
                />

                {/* Smart Checklist for Specific Risk Mitigation Steps */}
                <SmartChecklistSection
                  document={activeDoc}
                  onJumpToLocation={handleJumpToLocation}
                  onNotify={showToast}
                />

                <div className="space-y-2.5 pt-1">
                  <div className="text-xs font-semibold text-[#18181B]">
                    Catatan Kepatuhan & Mitigasi Risiko:
                  </div>
                  {activeDoc.auditNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#18181B]">{note.title}</span>
                      </div>
                      <div className="text-[11px] font-medium text-[#57534E]">
                        Status:{' '}
                        <span
                          className={
                            note.severity === 'Aman' ? 'text-emerald-700' : 'text-amber-700'
                          }
                        >
                          {note.severity}
                        </span>
                      </div>
                      <p className="text-xs text-[#3F3F46] leading-relaxed pt-1">
                        {note.recommendation}
                      </p>
                    </div>
                  ))}
                </div>

                {auditPanelSubTab === 'analisis_risiko' && (
                  <div className="pt-2 border-t border-[#E5E0D8]">
                    <ProceduralComplianceManual
                      document={activeDoc}
                      onInsertProceduralClause={handleInsertProceduralClauseFromManual}
                      onUpdateClosingText={handleUpdateClosingTextFromManual}
                      onNotify={showToast}
                      checkedByDoc={manualComplianceCheckedByDoc}
                      onChangeCheckedByDoc={setManualComplianceCheckedByDoc}
                      selectedProfileMode={manualComplianceProfileMode}
                      onChangeProfileMode={setManualComplianceProfileMode}
                    />
                  </div>
                )}
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE & INDONESIAN GOVERNMENT REGULATION SEARCH + PINNED REGULATIONS */}
            {rightTab === 'regulations' && (
              <RegulationSearchPanel
                documentTitle={activeDoc.title}
                onConvertRegulationToClause={(instr) => executeAddClauseWithAI(instr)}
                isAddingClause={isAddingClause}
                onNotify={showToast}
                searchHistory={regulationSearchHistory}
                onRecordSearch={handleRecordRegulationSearch}
              />
            )}

            {/* TAB 3: SMART VARIABLES PANEL */}
            {rightTab === 'variables' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Variabel Kontrak Pintar ({activeDoc.variables.length})</span>
                  </h3>
                </div>
                <p className="text-[11px] text-[#57534E] leading-relaxed">
                  Ubah nilai variabel di bawah ini lalu klik <strong>Terapkan</strong> untuk mengganti otomatis di seluruh pasal dokumen.
                </p>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {activeDoc.variables.map((v, idx) => {
                    const currentEdited = editingVarValues[idx] ?? v.value;
                    const isChanged = currentEdited !== v.value;
                    return (
                      <div
                        key={`${v.key}-${idx}`}
                        className="p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                          <span className="font-semibold text-[#18181B]">{v.key}</span>
                          <span>{v.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={currentEdited}
                            onChange={(e) =>
                              setEditingVarValues((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyVariable(idx);
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 text-xs font-code text-[#18181B] bg-white border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
                          />
                          {isChanged && (
                            <button
                              type="button"
                              onClick={() => handleApplyVariable(idx)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172E6E] whitespace-nowrap cursor-pointer"
                            >
                              Terapkan
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Custom Variable */}
                <form
                  onSubmit={handleAddCustomVariable}
                  className="pt-3 border-t border-[#E5E0D8] space-y-2"
                >
                  <div className="text-[11px] font-semibold text-[#18181B]">
                    + Tambah Variabel Baru
                  </div>
                  <input
                    type="text"
                    value={newVarKey}
                    onChange={(e) => setNewVarKey(e.target.value)}
                    placeholder="Nama variabel (mis. Nomor NPWP)"
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded focus:outline-none focus:border-[#1E3A8A]"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      placeholder="Nilai saat ini di dokumen"
                      className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded focus:outline-none focus:border-[#1E3A8A]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#18181B] rounded hover:bg-[#27272A] whitespace-nowrap cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: DYNAMIC CONTEXT-AWARE CLAUSE LIBRARY (PUSTAKA KLAUSUL DINAMIS) */}
            {rightTab === 'library' && (
              <div className="space-y-3" data-testid="dynamic-clause-library-panel">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Pustaka Klausul Dinamis ({filteredLibrary.length})</span>
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-code font-semibold bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]">
                    <Sparkles className="w-2.5 h-2.5 text-[#1E3A8A]" />
                    <span>Adaptif Isi Draf</span>
                  </span>
                </div>

                {/* Live Draft Condition & Clause Context Summary Box */}
                <div
                  data-testid="dynamic-library-context-summary"
                  className="p-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-2"
                >
                  <div className="flex items-center justify-between gap-1 text-[10.5px] font-semibold text-[#18181B]">
                    <span>Kondisi & Konteks Pasal Draf Aktif:</span>
                    <span className="font-code text-[#1E3A8A]">
                      {dynamicClauseLibrary.contextSummary.totalClauses} Pasal Aktif
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-[#57534E]">
                    <div className="bg-white px-2 py-1 rounded border border-[#E5E0D8] truncate" title={`${dynamicClauseLibrary.contextSummary.partyOneName} & ${dynamicClauseLibrary.contextSummary.partyTwoName}`}>
                      <span className="text-[#78716C]">Para Pihak: </span>
                      <span className="font-semibold text-[#18181B]">
                        {dynamicClauseLibrary.contextSummary.partyOneName}
                      </span>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-[#E5E0D8] truncate" title={dynamicClauseLibrary.contextSummary.contractValue}>
                      <span className="text-[#78716C]">Nilai/Objek: </span>
                      <span className="font-code font-semibold text-[#18181B]">
                        {dynamicClauseLibrary.contextSummary.contractValue}
                      </span>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-[#E5E0D8] truncate">
                      <span className="text-[#78716C]">Durasi: </span>
                      <span className="font-semibold text-[#18181B]">
                        {dynamicClauseLibrary.contextSummary.durationText}
                      </span>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-[#E5E0D8] truncate">
                      <span className="text-[#78716C]">Risiko Kritis: </span>
                      <span
                        className={`font-code font-semibold ${
                          dynamicClauseLibrary.contextSummary.highRiskClauseNumbers.length > 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {dynamicClauseLibrary.contextSummary.highRiskClauseNumbers.length > 0
                          ? dynamicClauseLibrary.contextSummary.highRiskClauseNumbers.join(', ')
                          : '0 Pasal'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-[#57534E] leading-snug">
                    Redaksi klausul di bawah otomatis menyesuaikan nama pihak, nilai transaksi, yurisdiksi, dan mendeteksi celah pasal yang belum ada atau perlu diperkuat di draf Anda.
                  </p>
                </div>

                {/* Dynamic Condition Filter Tabs */}
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    data-testid="dynamic-library-filter-all"
                    onClick={() => setLibraryDynamicFilter('all')}
                    className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                      libraryDynamicFilter === 'all'
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-[#FAF9F6] text-[#57534E] border-[#E5E0D8] hover:text-[#18181B]'
                    }`}
                  >
                    Semua ({dynamicClauseLibrary.items.length})
                  </button>
                  <button
                    type="button"
                    data-testid="dynamic-library-filter-missing"
                    onClick={() =>
                      setLibraryDynamicFilter(
                        libraryDynamicFilter === 'missing_recommended'
                          ? 'all'
                          : 'missing_recommended'
                      )
                    }
                    className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                      libraryDynamicFilter === 'missing_recommended'
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Belum Ada di Draf ({dynamicClauseLibrary.contextSummary.missingRecommendedCount})
                  </button>
                  <button
                    type="button"
                    data-testid="dynamic-library-filter-strengthen"
                    onClick={() =>
                      setLibraryDynamicFilter(
                        libraryDynamicFilter === 'strengthen_critical'
                          ? 'all'
                          : 'strengthen_critical'
                      )
                    }
                    className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                      libraryDynamicFilter === 'strengthen_critical'
                        ? 'bg-rose-700 text-white border-rose-700'
                        : 'bg-rose-50/90 text-rose-900 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Penguatan Kritis ({dynamicClauseLibrary.contextSummary.strengthenCriticalCount})
                  </button>
                  <button
                    type="button"
                    data-testid="dynamic-library-filter-covered"
                    onClick={() =>
                      setLibraryDynamicFilter(
                        libraryDynamicFilter === 'covered_in_draft' ? 'all' : 'covered_in_draft'
                      )
                    }
                    className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                      libraryDynamicFilter === 'covered_in_draft'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-emerald-50/90 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Tercakup ({dynamicClauseLibrary.contextSummary.coveredInDraftCount})
                  </button>
                </div>

                {/* AI Semantic Vector Similarity Search & Category Filter Buttons */}
                <div className="space-y-2 p-2.5 bg-[#EFF6FF]/60 border border-[#BFDBFE] rounded-md">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
                      <span>Semantic Search (AI Vector Similarity)</span>
                    </span>
                    {librarySearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setLibrarySearchQuery('');
                          setAiSemanticOverrides(null);
                        }}
                        className="text-[10px] font-semibold text-[#57534E] hover:text-[#18181B] cursor-pointer"
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-[#1E3A8A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        data-testid="dynamic-library-search-input"
                        value={librarySearchQuery}
                        onChange={(e) => {
                          setLibrarySearchQuery(e.target.value);
                          setAiSemanticOverrides(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTriggerAiSemanticSearch();
                          }
                        }}
                        placeholder="Ketik deskripsi bahasa alami (mis: bagaimana jika vendor telat atau data bocor)..."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#93C5FD] rounded-md focus:outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                    <button
                      type="button"
                      data-testid="semantic-search-clause-btn"
                      disabled={isSemanticSearching || !librarySearchQuery.trim()}
                      onClick={() => handleTriggerAiSemanticSearch()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] disabled:opacity-50 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      title="Jalankan pencarian kemiripan vektor AI untuk menemukan klausul berdasarkan makna bahasa alami"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isSemanticSearching ? 'Mencari...' : 'Cari Vektor AI'}</span>
                    </button>
                  </div>

                  {/* Quick Natural Language Semantic Query Chips */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9.5px] text-[#57534E] mr-0.5">Contoh kueri alami:</span>
                    {[
                      'Vendor telat kirim & ingkar janji',
                      'Data pelanggan bocor ke pihak luar',
                      'Karyawan dibajak kompetitor',
                      'Server down karena bencana alam',
                    ].map((sampleQ) => (
                      <button
                        key={sampleQ}
                        type="button"
                        onClick={() => handleTriggerAiSemanticSearch(sampleQ)}
                        className="px-1.5 py-0.5 text-[9.5px] font-medium bg-white hover:bg-[#DBEAFE] text-[#1E3A8A] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
                      >
                        &ldquo;{sampleQ}&rdquo;
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-[#DBEAFE]">
                    {libraryCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setLibraryFilter(cat)}
                        className={`px-2 py-0.5 text-[10.5px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                          libraryFilter === cat
                            ? 'bg-[#1E3A8A] text-white'
                            : 'bg-white text-[#57534E] hover:text-[#18181B] border border-[#E5E0D8]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Clause Cards List */}
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredLibrary.length === 0 ? (
                    <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-xs text-[#57534E] text-center space-y-2">
                      <p>Tidak ada klausul yang cocok dengan filter kondisi atau pencarian saat ini.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLibraryFilter('Semua');
                          setLibraryDynamicFilter('all');
                          setLibrarySearchQuery('');
                        }}
                        className="text-[#1E3A8A] font-medium hover:underline cursor-pointer"
                      >
                        Reset Filter Pustaka Klausul
                      </button>
                    </div>
                  ) : (
                    filteredLibrary.map((snippet) => {
                      const isStrengthen = snippet.dynamicStatus === 'strengthen_critical';
                      const isMissing = snippet.dynamicStatus === 'missing_recommended';

                      return (
                        <div
                          key={snippet.id}
                          data-testid={`dynamic-library-item-${snippet.id}`}
                          className={`p-3 rounded-md border space-y-2 transition-colors ${
                            isStrengthen
                              ? 'bg-rose-50/40 border-rose-200'
                              : isMissing
                              ? 'bg-amber-50/35 border-amber-200'
                              : 'bg-[#FAF9F6] border-[#E5E0D8]'
                          }`}
                        >
                           {/* Status Badge, Vector Similarity Score & Category */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex flex-wrap items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-code font-bold uppercase tracking-wider border ${
                                  isStrengthen
                                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                                    : isMissing
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                {snippet.statusBadge}
                              </span>
                              {typeof snippet.vectorSimilarityScore === 'number' && (
                                <span
                                  data-testid={`vector-similarity-badge-${snippet.id}`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-code font-bold bg-[#1E3A8A] text-white"
                                >
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>
                                    {Math.round(snippet.vectorSimilarityScore * 100)}% Vector Match
                                  </span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-code text-[#57534E]">
                              {snippet.category} · Risiko {snippet.riskLevel}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-[#18181B]">
                            {snippet.title}
                          </div>
                          <div className="text-[10.5px] font-medium text-[#1E3A8A]">
                            {snippet.legalBasis}
                          </div>

                          {/* AI Semantic Vector Similarity Explanation when searching */}
                          {snippet.semanticMatchExplanation && (
                            <div
                              data-testid={`semantic-match-explanation-${snippet.id}`}
                              className="p-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[10.5px] text-[#1E3A8A] leading-snug space-y-1"
                            >
                              <div>
                                <span className="font-bold">Kecocokan Vektor Semantik AI: </span>
                                {snippet.semanticMatchExplanation}
                              </div>
                              {snippet.semanticConceptTags &&
                                snippet.semanticConceptTags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                    {snippet.semanticConceptTags.map((tag, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="px-1.5 py-0.2 bg-white border border-[#93C5FD] rounded text-[9.5px] font-code text-[#1E3A8A]"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Contextual Reason Adapted to Current Draft Clauses */}
                          <div className="p-2 bg-white/90 border border-[#E5E0D8] rounded text-[10.5px] text-[#3F3F46] leading-snug">
                            <span className="font-semibold text-[#18181B]">Analisis Kondisi Draf: </span>
                            {snippet.dynamicReason}
                          </div>

                          {/* Preview of Dynamically Interpolated Ayat Content */}
                          <details className="group text-[10.5px]">
                            <summary className="cursor-pointer font-medium text-[#1E3A8A] hover:underline select-none">
                              Lihat pratinjau {snippet.content.length} ayat kontekstual ({dynamicClauseLibrary.contextSummary.partyOneName} & {dynamicClauseLibrary.contextSummary.partyTwoName})
                            </summary>
                            <div className="mt-1.5 p-2 bg-white border border-[#E5E0D8] rounded space-y-1 font-legal text-[11px] text-[#27272A]">
                              {snippet.content.map((ayatText, idx) => (
                                <p key={idx} className="leading-relaxed">
                                  {ayatText}
                                </p>
                              ))}
                            </div>
                          </details>

                          {/* Dynamic Insertion / Clause Update Actions */}
                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleInsertLibraryClause(snippet)}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Sisipkan sbg Pasal {activeDoc.clauses.length + 1}</span>
                            </button>

                            {snippet.matchedClauseId && snippet.matchedClauseNumber && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAppendLibraryAyatToClause(
                                      snippet.matchedClauseId!,
                                      snippet
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[10.5px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] rounded transition-colors cursor-pointer whitespace-nowrap"
                                  title={`Tambahkan ayat proteksi ini langsung ke dalam ${snippet.matchedClauseNumber}`}
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>+ Ayat ke {snippet.matchedClauseNumber}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReplaceClauseWithLibraryItem(
                                      snippet.matchedClauseId!,
                                      snippet
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[10.5px] font-medium text-[#57534E] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded transition-colors cursor-pointer whitespace-nowrap"
                                  title={`Ganti substansi ${snippet.matchedClauseNumber} dengan klausul standar kontekstual ini`}
                                >
                                  <span>Ganti {snippet.matchedClauseNumber}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: AI CLAUSE HISTORY SIDE-PANEL (PER-CLAUSE AI ITERATION TRACKER & SINGLE-CLAUSE REVERT) */}
            {rightTab === 'clause_history' && (
              <AiClauseHistorySidePanel
                clauses={activeDoc.clauses}
                focusedClauseId={focusedAiHistoryClauseId}
                onSelectFocusedClauseId={setFocusedAiHistoryClauseId}
                onRevertSingleClauseToIteration={handleRevertSingleClauseToIteration}
                onJumpToClause={(clauseId) => {
                  const el = document.getElementById(`clause-${clauseId}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />
            )}
          </div>

          {/* Card 3: DEDICATED 'GLOSARIUM ISTILAH' PANEL (AUTO-DETECTED LEGAL TERMS & AUTO-GLOSSARY GENERATOR CUSTOM DOCUMENT INDEX) */}
          <div
            ref={glossaryPanelRef}
            data-testid="glossary-panel-card"
            className="bg-white border border-[#E5E0D8] rounded-lg p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>
                  Glosarium Istilah (
                  <span className="font-code tabular-nums">{detectedGlossaryTerms.length}</span>)
                </span>
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid="auto-glossary-generator-btn"
                  onClick={() => setShowAutoGlossaryPicker((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    showAutoGlossaryPicker
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                      : 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE] hover:bg-[#DBEAFE]'
                  }`}
                  title="Pilih bagian spesifik dokumen dan jalankan AI Agent untuk mengekstraksi, mendefinisikan, dan membuat referensi silang indeks dokumen kustom"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Glossary Generator</span>
                </button>
                <button
                  type="button"
                  disabled={isAnalyzingGlossary}
                  onClick={handleAnalyzeGlossaryAI}
                  className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#57534E] hover:text-[#1E3A8A] hover:underline disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <span>{isAnalyzingGlossary ? 'Mendeteksi...' : 'Deteksi Penuh'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#57534E] leading-relaxed">
              Mendeteksi otomatis istilah hukum di dalam draf aktif atau gunakan <strong>Auto-Glossary Generator</strong> untuk mengekstraksi definisi & referensi silang dari bagian dokumen pilihan Anda.
            </p>

            {/* AUTO-GLOSSARY GENERATOR: SECTION PICKER & AI CUSTOM DOCUMENT INDEX BUILDER */}
            {showAutoGlossaryPicker && (
              <div
                data-testid="auto-glossary-generator-panel"
                className="p-3 bg-[#FAF9F6] border border-[#93C5FD] rounded-md space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="text-[11px] font-semibold text-[#18181B]">
                    Pilih Bagian Dokumen untuk Diekstraksi AI Agent (
                    <span className="font-code text-[#1E3A8A]">
                      {selectedGlossarySectionIds.length}/{documentGlossarySections.length}
                    </span>
                    ):
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      data-testid="auto-glossary-select-all-sections-btn"
                      onClick={() =>
                        setSelectedGlossarySectionIds(
                          documentGlossarySections.map((s) => s.id)
                        )
                      }
                      className="px-1.5 py-0.5 text-[9.5px] font-semibold text-[#1E3A8A] bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] rounded cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      data-testid="auto-glossary-select-clauses-only-btn"
                      onClick={() =>
                        setSelectedGlossarySectionIds(
                          documentGlossarySections
                            .filter((s) => s.sectionType === 'clause')
                            .map((s) => s.id)
                        )
                      }
                      className="px-1.5 py-0.5 text-[9.5px] font-medium text-[#57534E] bg-white hover:bg-[#EFECE6] border border-[#D6D0C4] rounded cursor-pointer"
                    >
                      Hanya Pasal
                    </button>
                    <button
                      type="button"
                      data-testid="auto-glossary-clear-sections-btn"
                      onClick={() => setSelectedGlossarySectionIds([])}
                      className="px-1.5 py-0.5 text-[9.5px] font-medium text-[#57534E] hover:text-rose-700 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Checkboxes for Document Sections */}
                <div
                  data-testid="auto-glossary-section-list"
                  className="max-h-40 overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded border border-[#E5E0D8]"
                >
                  {documentGlossarySections.map((sec) => {
                    const isChecked = selectedGlossarySectionIds.includes(sec.id);
                    return (
                      <label
                        key={sec.id}
                        data-testid={`auto-glossary-section-option-${sec.shortCode.replace(/\s+/g, '-')}`}
                        className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#EFF6FF]/90 text-[#18181B] font-medium'
                            : 'hover:bg-[#FAF9F6] text-[#57534E]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setSelectedGlossarySectionIds((prev) =>
                                prev.includes(sec.id)
                                  ? prev.filter((id) => id !== sec.id)
                                  : [...prev, sec.id]
                              )
                            }
                            className="rounded border-[#D6D0C4] text-[#1E3A8A] focus:ring-[#1E3A8A] shrink-0 cursor-pointer"
                          />
                          <span className="font-code text-[10px] font-bold text-[#1E3A8A] shrink-0">
                            {sec.shortCode}
                          </span>
                          <span className="truncate">{sec.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Trigger AI Agent Button */}
                <button
                  type="button"
                  data-testid="run-auto-glossary-agent-btn"
                  disabled={
                    isGeneratingAutoGlossaryIndex ||
                    selectedGlossarySectionIds.length === 0
                  }
                  onClick={handleRunAutoGlossaryGenerator}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGeneratingAutoGlossaryIndex
                      ? 'AI Agent Mengekstraksi & Menyusun Indeks...'
                      : `Ekstrak Istilah & Bangun Indeks Kustom (${selectedGlossarySectionIds.length} Bagian)`}
                  </span>
                </button>
              </div>
            )}

            {/* Custom Document Index Summary Banner (when generated) */}
            {customIndexMetaByDoc[activeDoc.id] && (
              <div
                data-testid="custom-document-index-banner"
                className="p-2.5 bg-[#EFF6FF]/80 border border-[#BFDBFE] rounded-md space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-[10.5px]">
                  <span className="font-semibold text-[#1E3A8A]">
                    Indeks Dokumen Kustom Aktif ({customIndexMetaByDoc[activeDoc.id].termCount} Istilah ·{' '}
                    {customIndexMetaByDoc[activeDoc.id].crossRefCount} Referensi Silang)
                  </span>
                  <span className="font-code text-[9.5px] text-[#57534E]">
                    {customIndexMetaByDoc[activeDoc.id].generatedAt}
                  </span>
                </div>
                <div className="text-[10px] text-[#3F3F46]">
                  Bagian Terindeks:{' '}
                  <span className="font-code font-semibold text-[#18181B]">
                    {customIndexMetaByDoc[activeDoc.id].sectionLabels.join(', ')}
                  </span>
                </div>
                <div className="pt-0.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="insert-custom-index-clause-btn"
                    onClick={handleInsertCustomIndexAsClause}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Sisipkan Indeks sbg Pasal Definisi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Search / Filter inside Glosarium Istilah */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Cari istilah, pasal, atau referensi silang..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-md focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              {/* Filter Tabs: All, Custom Index, Critical or Defined, Critical, Defined in Contract */}
              {(() => {
                const customIndexCount = detectedGlossaryTerms.filter(
                  (t) => t.isCustomIndexEntry
                ).length;
                const criticalOrDefinedCount = detectedGlossaryTerms.filter(
                  (t) => t.isCritical || t.isDefinedInContract
                ).length;
                const criticalCount = detectedGlossaryTerms.filter((t) => t.isCritical).length;
                const definedCount = detectedGlossaryTerms.filter(
                  (t) => t.isDefinedInContract
                ).length;

                return (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setGlossaryFilterMode('all')}
                      className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                        glossaryFilterMode === 'all'
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#FAF9F6] text-[#57534E] border-[#E5E0D8] hover:text-[#18181B]'
                      }`}
                    >
                      Semua ({detectedGlossaryTerms.length})
                    </button>
                    {customIndexCount > 0 && (
                      <button
                        type="button"
                        data-testid="glossary-filter-custom-index"
                        onClick={() =>
                          setGlossaryFilterMode(
                            glossaryFilterMode === 'custom_index' ? 'all' : 'custom_index'
                          )
                        }
                        className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                          glossaryFilterMode === 'custom_index'
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                            : 'bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD] hover:bg-[#DBEAFE]'
                        }`}
                      >
                        Indeks Kustom ({customIndexCount})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setGlossaryFilterMode(
                          glossaryFilterMode === 'critical_or_defined'
                            ? 'all'
                            : 'critical_or_defined'
                        )
                      }
                      title="Sembunyikan istilah umum dan tampilkan hanya istilah Critical atau Defined in Contract"
                      className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                        glossaryFilterMode === 'critical_or_defined'
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE] hover:bg-[#DBEAFE]'
                      }`}
                    >
                      Critical / Defined ({criticalOrDefinedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGlossaryFilterMode(
                          glossaryFilterMode === 'critical' ? 'all' : 'critical'
                        )
                      }
                      title="Tampilkan hanya istilah berisiko tinggi (Critical)"
                      className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                        glossaryFilterMode === 'critical'
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-red-50/80 text-red-800 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      Critical ({criticalCount})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGlossaryFilterMode(
                          glossaryFilterMode === 'defined' ? 'all' : 'defined'
                        )
                      }
                      title="Tampilkan hanya istilah yang didefinisikan secara eksplisit di dalam kontrak (Defined in Contract)"
                      className={`px-2 py-1 text-[10.5px] font-semibold rounded border transition-colors cursor-pointer ${
                        glossaryFilterMode === 'defined'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      Defined in Contract ({definedCount})
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Detected & Custom-Indexed Glossary Terms List */}
            <div
              data-testid="glossary-terms-list"
              className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1"
            >
              {filteredGlossaryTerms.length === 0 ? (
                <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md text-xs text-[#57534E] text-center space-y-2">
                  <p>Tidak ditemukan istilah hukum yang cocok dengan filter atau pencarian Anda.</p>
                  {(glossarySearch || glossaryFilterMode !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setGlossarySearch('');
                        setGlossaryFilterMode('all');
                      }}
                      className="text-[#1E3A8A] font-medium hover:underline cursor-pointer"
                    >
                      Reset Filter & Pencarian
                    </button>
                  )}
                </div>
              ) : (
                filteredGlossaryTerms.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`glossary-term-card-${item.id}`}
                    className={`p-3 rounded-md border space-y-1.5 ${
                      item.isCustomIndexEntry
                        ? 'bg-[#FAF9F6] border-[#93C5FD]'
                        : 'bg-[#FAF9F6] border-[#E5E0D8]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-1.5">
                      <div className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                        <span className="font-code text-[10px] font-bold text-[#1E3A8A]">
                          [{item.term.charAt(0).toUpperCase()}]
                        </span>
                        <span>{item.term}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-code">
                        {item.isCustomIndexEntry && (
                          <span className="font-bold text-[#1E3A8A]">
                            Indeks Kustom
                          </span>
                        )}
                        {item.isCritical && (
                          <span className="font-bold text-red-700">
                            {item.isCustomIndexEntry ? '· Critical' : 'Critical'}
                          </span>
                        )}
                        {item.isDefinedInContract && (
                          <span className="font-bold text-emerald-800">
                            {item.isCustomIndexEntry || item.isCritical
                              ? '· Defined'
                              : 'Defined in Contract'}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Unboxed clean metadata per Zero-Pill rule */}
                    <div className="text-[11px] text-[#57534E]">
                      <span>{item.category}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-medium text-[#1E3A8A]">{item.legalReference}</span>
                    </div>
                    <p className="text-[11.5px] text-[#27272A] leading-relaxed">
                      {item.definition}
                    </p>

                    {/* Cross-References between Document Sections */}
                    {item.crossReferences && item.crossReferences.length > 0 && (
                      <div
                        data-testid={`glossary-cross-refs-${item.id}`}
                        className="pt-1 border-t border-[#E5E0D8]/70 text-[10.5px] text-[#3F3F46] space-y-0.5"
                      >
                        <div className="font-semibold text-[#18181B]">
                          Referensi Silang Antar-Bagian:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 font-code text-[10px] text-[#1E3A8A]">
                          {item.crossReferences.map((xref, xIdx) => {
                            const primaryTarget = xref.split('↔')[0]?.trim() || '';
                            return (
                              <React.Fragment key={`${xref}-${xIdx}`}>
                                <button
                                  type="button"
                                  onClick={() => handleJumpToLocation(primaryTarget)}
                                  className="hover:underline cursor-pointer font-semibold"
                                >
                                  {xref}
                                </button>
                                {xIdx < item.crossReferences!.length - 1 && (
                                  <span className="text-[#78716C]">·</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Related Domain Terms */}
                    {item.relatedTerms && item.relatedTerms.length > 0 && (
                      <div className="text-[10px] text-[#57534E]">
                        <span>Istilah Terkait: </span>
                        {item.relatedTerms.map((rt, rIdx) => (
                          <React.Fragment key={rt}>
                            <button
                              type="button"
                              onClick={() => setGlossarySearch(rt)}
                              className="text-[#18181B] hover:text-[#1E3A8A] hover:underline font-medium cursor-pointer"
                            >
                              {rt}
                            </button>
                            {rIdx < item.relatedTerms!.length - 1 && <span> · </span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {item.locations.length > 0 && (
                      <div className="pt-1 border-t border-[#E5E0D8]/70 flex flex-wrap items-center gap-1 text-[11px] text-[#57534E]">
                        <span>Ditemukan pada:</span>
                        {item.locations.map((loc, lIdx) => (
                          <React.Fragment key={loc}>
                            <button
                              type="button"
                              onClick={() => handleJumpToLocation(loc)}
                              className="font-code font-medium text-[#18181B] hover:text-[#1E3A8A] hover:underline cursor-pointer"
                            >
                              {loc}
                            </button>
                            {lIdx < item.locations.length - 1 && <span>·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* LEGAL MEMO PRESENTATION & EXPORT MODAL */}
      {isLegalMemoModalOpen && (
        <LegalMemoModal
          document={activeDoc}
          onClose={() => setIsLegalMemoModalOpen(false)}
          onNotify={showToast}
        />
      )}

      {/* FULL-SCREEN AUDIT EVOLUTION LOG & CLIENT LEGAL JUSTIFICATION MODAL */}
      {isAuditEvolutionModalOpen && (
        <div
          data-testid="audit-evolution-modal-backdrop"
          className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-[#F7F5F0] border border-[#D6D0C4] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#E5E0D8]">
              <div>
                <h2 className="text-sm font-bold text-[#18181B]">
                  Audit Evolution Log — Linimasa Perubahan Risiko, Modifikasi Klausul & Justifikasi Klien
                </h2>
                <p className="text-xs text-[#57534E]">
                  {activeDoc.title} ({activeDoc.documentNumber}) · Siap dipresentasikan atau diekspor untuk Klien
                </p>
              </div>
              <button
                type="button"
                data-testid="close-audit-evolution-modal-btn"
                onClick={() => setIsAuditEvolutionModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#18181B] bg-[#FAF9F6] hover:bg-[#EFECE6] border border-[#D6D0C4] rounded-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <AuditEvolutionLog
                document={activeDoc}
                isModalView={true}
                onJumpToClause={(loc) => {
                  setIsAuditEvolutionModalOpen(false);
                  handleJumpToLocation(loc);
                }}
                onSaveCustomJustification={handleSaveCustomJustification}
                onAddManualAuditEvent={handleAddManualAuditEvent}
                onExportAuditEvolutionPdf={handleExportAuditEvolutionPdf}
                onNotify={showToast}
              />
            </div>
          </div>
        </div>
      )}

      {/* CLIENT POWER OF ATTORNEY (SK), SURAT TUGAS (ST) & LITIGATION BUILDER MODAL */}
      <SuratKuasaBuilderModal
        isOpen={isSuratKuasaModalOpen}
        initialType={suratKuasaInitialType}
        initialDocMode={suratKuasaInitialDocMode}
        onClose={() => setIsSuratKuasaModalOpen(false)}
        onCreateSuratKuasa={handleCreateSuratKuasaDoc}
        onGenerateWithAI={(promptText, stanceVal) => {
          setCommandInput(promptText);
          setStance(stanceVal);
          handleGenerateDraft(promptText, stanceVal);
        }}
      />

      {/* SHAREABLE DRAFT LINK & CLAUSE COMMENTING MODAL */}
      {isShareModalOpen && (
        <ShareDraftReviewModal
          document={activeDoc}
          shareUrl={currentShareUrl}
          isReviewOnlyMode={isReviewOnlyMode}
          onToggleReviewOnlyMode={(val) => {
            setIsReviewOnlyMode(val);
            showToast(
              val
                ? 'Mode Tinjauan Pihak Lain aktif: Naskah asli dikunci & kolom komentar dibuka pada setiap pasal.'
                : 'Kembali ke Mode Editor Penuh.'
            );
          }}
          onJumpToClause={(clauseId) => {
            setViewMode('structured');
            setOpenCommentClauseId(clauseId);
            setTimeout(() => {
              const el = document.getElementById(`clause-${clauseId}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
          }}
          onResolveAllCommentsInDocument={handleResolveAllDocumentComments}
          ownerEmail={ownerNotificationEmail}
          emailNotificationsEnabled={emailNotificationsEnabled}
          onToggleEmailNotifications={handleToggleEmailNotifications}
          ownerNotifications={ownerCommentAlerts}
          onClose={() => setIsShareModalOpen(false)}
          onNotify={showToast}
        />
      )}

      {/* QUIET FOOTER */}
      <footer className="no-print mt-12 border-t border-[#E5E0D8] bg-[#F7F5F0] py-5 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#57534E]">
          <div>
            <span className="font-legal font-semibold text-[#18181B]">Klausa Studio</span>
            <span className="mx-2">·</span>
            <span>Sistem Penyusunan Draf Kontrak, Perjanjian & Dokumen Hukum Otomatis</span>
          </div>
          <div>
            Draf yang dihasilkan dapat diedit penuh dan disarankan untuk ditinjau sesuai kebutuhan spesifik transaksi Anda.
          </div>
        </div>
      </footer>
    </div>
  );
}
