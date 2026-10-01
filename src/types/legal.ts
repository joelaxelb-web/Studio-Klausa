export type PartyEntityType =
  | 'PT'
  | 'Individu'
  | 'CV_Firma'
  | 'Instansi';

export interface LegalParty {
  name: string;
  role: string;
  representative: string;
  address: string;
  description: string;
  entityType?: PartyEntityType;
}

export type ClauseCategoryType =
  | 'Financial'
  | 'Liability'
  | 'Operational'
  | 'Intellectual Property'
  | 'Confidentiality'
  | 'Governance & Dispute'
  | 'Termination';

export type SupportedLegalLanguage = 'English' | 'Mandarin' | 'Japanese' | 'Dutch';

export interface ClauseTranslationData {
  targetLanguage: SupportedLegalLanguage;
  languageCode: string;
  translatedTitle: string;
  translatedLegalBasis: string;
  translatedContent: string[];
  legalPrecisionNote: string;
  translatedAt: string;
}

export interface AiClauseHistoryEntry {
  id: string;
  clauseId: string;
  clauseNumber: string;
  source:
    | 'AI Writing Assistant'
    | 'Bulk Importer'
    | 'AI Clause Revision'
    | 'AI Translation'
    | 'Initial State'
    | string;
  actionLabel: string;
  timestamp: string;
  snapshot: {
    title: string;
    content: string[];
    legalBasis: string;
    riskLevel: 'Standar' | 'Perhatian' | 'Kritis' | string;
  };
}

export interface AiParagraphChangeDetail {
  ayatIndex: number;
  changeType: 'added' | 'modified' | 'unchanged';
  beforeText?: string;
  afterText: string;
}

export interface AiClauseChangeRecord {
  id: string;
  sourceLabel: string;
  changeMode: 'ayat_added' | 'content_modified' | 'clause_replaced' | 'new_clause_added';
  timestamp: string;
  summary: string;
  beforeSnapshot: {
    title: string;
    legalBasis: string;
    content: string[];
  };
  afterSnapshot: {
    title: string;
    legalBasis: string;
    content: string[];
  };
  paragraphChanges: AiParagraphChangeDetail[];
  titleChanged: boolean;
  legalBasisChanged: boolean;
}

export interface ClauseRegulatoryMarker {
  status: 'needs_review' | 'applied_direct' | 'applied_replace';
  regReference: string;
  regShortLabel?: string;
  recommendedAyat?: string;
  updatedAtLabel: string;
  beforeSnapshot?: {
    title: string;
    legalBasis: string;
    content: string[];
  };
  afterSnapshot?: {
    title: string;
    legalBasis: string;
    content: string[];
  };
  changedPartLabels?: string[];
}

export interface LegalClause {
  id: string;
  number: string;
  title: string;
  content: string[];
  legalBasis: string;
  riskLevel: 'Standar' | 'Perhatian' | 'Kritis' | string;
  plainSummary?: string;
  clauseCategory?: ClauseCategoryType;
  clauseTags?: string[];
  suggestedTags?: string[];
  categoryReason?: string;
  aiHistory?: AiClauseHistoryEntry[];
  translations?: Partial<Record<SupportedLegalLanguage, ClauseTranslationData>>;
  activeTranslationLang?: SupportedLegalLanguage;
  appliedRegulations?: string[];
  regulatoryUpdateMarker?: ClauseRegulatoryMarker;
  aiChangeRecord?: AiClauseChangeRecord;
}

export interface LegalVariable {
  key: string;
  value: string;
  category: 'Para Pihak' | 'Finansial' | 'Waktu' | 'Yurisdiksi' | string;
}

export interface LegalAuditNote {
  title: string;
  severity: 'Aman' | 'Perlu Verifikasi' | 'Krusial' | string;
  recommendation: string;
}

export interface LegalDocumentSnapshot {
  title: string;
  subtitle: string;
  documentNumber: string;
  category: string;
  jurisdiction: string;
  effectiveDate: string;
  openingText: string;
  partyOne: LegalParty;
  partyTwo: LegalParty;
  recitals: string[];
  clauses: LegalClause[];
  closingText: string;
  signingLocation: string;
  variables: LegalVariable[];
  auditNotes: LegalAuditNote[];
}

export interface LegalDocumentVersion {
  id: string;
  versionLabel: string;
  timestamp: string;
  summary: string;
  snapshot: LegalDocumentSnapshot;
}

export interface SmartFormattingHistoryEntry {
  id: string;
  label: string;
  timestamp: string;
  numberingStyle: 'decimal_hierarchy' | 'ayat_parentheses' | 'roman_parentheses' | 'numeric_dot';
  fontStyle: 'serif_legal' | 'sans_corporate' | 'mono_audit';
  indentation: 'hanging_subclause' | 'notarial_first_line' | 'none';
  uppercaseTitles: boolean;
  clausesSnapshot: LegalClause[];
  summaryText: string;
}

export type AuditEvolutionEventType =
  | 'risk_shift'
  | 'clause_modified'
  | 'clause_added'
  | 'clause_removed'
  | 'ai_iteration'
  | 'milestone';

export interface AuditEvolutionEvent {
  id: string;
  timestamp: string;
  versionFromLabel: string;
  versionToLabel: string;
  eventType: AuditEvolutionEventType;
  clauseId?: string;
  clauseNumber: string;
  clauseTitle: string;
  previousRiskLevel?: string;
  newRiskLevel: string;
  riskScoreDelta: number;
  overallDocRiskBefore: number;
  overallDocRiskAfter: number;
  changeSummary: string;
  previousExcerpt?: string;
  newExcerpt?: string;
  legalBasis: string;
  clientJustification: string;
  impactDirection: 'mitigated' | 'elevated' | 'refined';
}

export interface UniversalDraftCriteria {
  domainCategory: string;
  structureStyle: string;
  customCriteria: string;
}

export interface LegalDocument extends LegalDocumentSnapshot {
  id: string;
  updatedAt: string;
  promptUsed: string;
  versions?: LegalDocumentVersion[];
  comments?: ClauseComment[];
  shareId?: string;
  emailNotificationsEnabled?: boolean;
  ownerNotificationEmail?: string;
  smartFormatHistory?: SmartFormattingHistoryEntry[];
  customAuditJustifications?: Record<string, string>;
  manualAuditEvents?: AuditEvolutionEvent[];
  activeDocumentLanguage?: 'id' | 'en';
  languageSnapshots?: {
    id?: LegalDocumentSnapshot;
    en?: LegalDocumentSnapshot;
  };
}

export interface QuickPromptPreset {
  id: string;
  label: string;
  category: string;
  prompt: string;
  stance: string;
}

export interface ClauseLibraryItem {
  id: string;
  title: string;
  category: string;
  legalBasis: string;
  riskLevel: 'Standar' | 'Perhatian' | 'Kritis';
  summary: string;
  content: string[];
}

export interface LegalGlossaryItem {
  id: string;
  term: string;
  category: string;
  legalReference: string;
  definition: string;
  locations: string[];
  isCritical?: boolean;
  isDefinedInContract?: boolean;
  crossReferences?: string[];
  relatedTerms?: string[];
  sectionExcerpts?: { sectionLabel: string; snippet: string }[];
  isCustomIndexEntry?: boolean;
}

export interface DocumentSectionOption {
  id: string;
  label: string;
  shortCode: string;
  sectionType: 'komparisi' | 'premis' | 'clause' | 'penutup';
  text: string;
}

export interface RegulationSearchHistoryItem {
  id: string;
  query: string;
  referenceNumber: string;
  shortLabel: string;
  category: string;
  searchedAt: string;
  summary: string;
  keywords: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface LegalChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  focusedClause?: string;
  timestamp: string;
  sources?: GroundingSource[];
}

export interface RegulationSearchResult {
  query: string;
  answer: string;
  sources: GroundingSource[];
  timestamp: string;
}

export interface PinnedRegulation {
  id: string;
  title: string;
  referenceNumber: string;
  category: string;
  summary: string;
  clausePrompt: string;
  sourceUri?: string;
  pinnedAt: string;
}

export interface SmartChecklistItem {
  id: string;
  task: string;
  category: 'Finansial' | 'Masa Berlaku' | 'Identitas Pihak' | 'Mitigasi Klausul' | string;
  priority: 'Tinggi' | 'Sedang' | 'Standar' | string;
  targetLocation: string;
  reason: string;
  mitigationAction?: string;
  mitigationDetail?: string;
  completed?: boolean;
}

export interface RiskMitigationInsight {
  id: string;
  clauseId: string;
  clauseNumber: string;
  clauseTitle: string;
  riskLevel: 'Kritis' | 'Perhatian' | 'Standar' | string;
  clauseCategory: string;
  actionType:
    | 'Hubungi Notaris'
    | 'Asuransikan'
    | 'Jaminan & Escrow'
    | 'Konsultasi Pajak'
    | 'Registrasi & Kepatuhan'
    | 'Dokumen Operasional';
  actionLabel: string;
  recommendation: string;
  rationale: string;
}

export interface ContextualClauseSuggestion {
  id: string;
  title: string;
  category: string;
  legalBasis: string;
  riskLevel: 'Standar' | 'Perhatian' | 'Kritis';
  reason: string;
  content: string[];
}

export interface SmartAutoFillProposal {
  id: string;
  targetTopic: 'perpajakan' | 'kapasitas_hukum' | 'hki' | 'data_pribadi' | 'tanggung_jawab';
  badgeLabel: string;
  clauseTitle: string;
  legalBasis: string;
  riskLevel: 'Standar' | 'Perhatian' | 'Kritis';
  rationale: string;
  proposedContent: string[];
  matchedClauseId?: string;
  matchedClauseNumber?: string;
}

export interface ClauseComment {
  id: string;
  clauseId: string;
  clauseNumber: string;
  clauseTitle: string;
  authorName: string;
  authorRole: string;
  commentText: string;
  proposedAlternative?: string;
  status: 'Terbuka' | 'Diselesaikan';
  timestamp: string;
}

export interface OwnerCommentNotification {
  id: string;
  documentId: string;
  documentTitle: string;
  clauseId: string;
  clauseNumber: string;
  clauseTitle: string;
  eventType:
    | 'comment_added'
    | 'comment_resolved'
    | 'all_comments_resolved'
    | 'comment_reopened';
  channel: 'In-App & Email' | 'In-App Saja' | 'Email Saja';
  ownerEmail: string;
  actorName: string;
  summaryText: string;
  timestamp: string;
}

export interface ComprehensiveScanFinding {
  id: string;
  type: 'Inkonsistensi Terminologi' | 'Konflik Klausul Hukum';
  severity: 'Kritis' | 'Perhatian';
  title: string;
  involvedClauses: string[];
  description: string;
  recommendation: string;
  harmonizeTarget?: {
    fromTerm?: string;
    toTerm?: string;
    targetClauseNumber?: string;
    appendClarification?: string;
  };
}

export interface SmartLifecycleReminder {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  eventType: 'Mulai Berlaku (Effective Date)' | 'Mendekati Kedaluwarsa (Expiration)' | 'Tenggat Kewajiban Klausul';
  urgency: 'Mendesak' | 'Segera' | 'Terjadwal';
  timeBadge: string;
  message: string;
  dateReference: string;
}
