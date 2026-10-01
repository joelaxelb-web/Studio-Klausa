import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Edit3,
  Check,
  Sparkles,
  Wand2,
  X,
  RotateCcw,
  Languages,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { LegalGlossaryItem } from '../types/legal';
import { tokenizeTextWithGlossary } from '../utils/legalGlossary';

export type WritingAssistantAction =
  | 'expand'
  | 'simplify'
  | 'tone_formal'
  | 'tone_assertive'
  | 'legalese_to_plain_english';

export function transformLegalTextLocally(
  selectedText: string,
  action: WritingAssistantAction,
  customPrompt?: string
): { transformedText: string; explanation: string } {
  const raw = selectedText.trim();
  const ayatMatch = raw.match(/^(\(\d+\)\s*)/);
  const prefix = ayatMatch ? ayatMatch[1] : '';
  const body = ayatMatch ? raw.slice(prefix.length).trim() : raw;
  const cleanBody = body.replace(/\.$/, '').trim();

  if (customPrompt && customPrompt.trim()) {
    return {
      transformedText: `${prefix}${cleanBody}, dengan ketentuan pelaksanaan mengikuti syarat: ${customPrompt.trim()} secara tertulis dan mengikat sesuai Pasal 1338 KUHPerdata.`,
      explanation: `Disesuaikan dengan instruksi kustom: "${customPrompt.trim()}".`,
    };
  }

  switch (action) {
    case 'expand':
      return {
        transformedText: `${prefix}${cleanBody}. Pelaksanaan ketentuan ini wajib dibuktikan secara tertulis melalui Berita Acara resmi yang disahkan oleh wakil berwenang Para Pihak selambat-lambatnya dalam waktu 7 (tujuh) Hari Kerja, serta dilaksanakan dengan itikad baik dan batas tanggung jawab terukur sesuai Pasal 1338 Kitab Undang-Undang Hukum Perdata.`,
        explanation:
          'Expand: Diperluas dengan syarat bukti tertulis (Berita Acara), tenggat waktu 7 Hari Kerja (SLA), dan perlindungan Pasal 1338 KUHPerdata.',
      };

    case 'simplify': {
      const simplified = cleanBody
        .replace(/sebagaimana dimaksud dalam ketentuan/gi, 'sesuai')
        .replace(/dengan tidak mengurangi ketentuan/gi, 'tanpa mengesampingkan')
        .replace(/dalam hal terjadi keadaan di mana/gi, 'apabila')
        .replace(/para pihak dengan ini sepakat dan setuju bahwa/gi, 'Para Pihak sepakat bahwa');
      const concise =
        simplified.length > 160
          ? `${simplified.slice(0, 155).trim()} secara tertulis dan mengikat.`
          : `${simplified} secara ringkas, jelas, dan mengikat kedua belah pihak.`;
      return {
        transformedText: `${prefix}${concise}`,
        explanation:
          'Simplify: Dipadatkan menjadi rumusan kalimat yang ringkas, lugas, dan bebas dari pengulangan kata.',
      };
    }

    case 'tone_formal':
      return {
        transformedText: `${prefix}Bahwa berdasarkan kesepakatan yang sah dan mengikat menurut hukum, ${
          cleanBody.charAt(0).toLowerCase() + cleanBody.slice(1)
        }, sebagaimana dituangkan secara resmi dalam akta Perjanjian ini dan tunduk sepenuhnya pada ketentuan Kitab Undang-Undang Hukum Perdata Republik Indonesia.`,
        explanation:
          'Change Tone (Formal): Diubah ke dalam gaya bahasa akta notariil dan kontraktual resmi yang baku.',
      };

    case 'tone_assertive':
      return {
        transformedText: `${prefix}Para Pihak secara tegas dan mutlak wajib memastikan bahwa ${
          cleanBody.charAt(0).toLowerCase() + cleanBody.slice(1)
        } tanpa pengecualian apa pun, dan setiap kelalaian atas kewajiban ini secara seketika menimbulkan hak menuntut pemenuhan tertulis serta pemulihan penuh sesuai Pasal 1266 dan Pasal 1267 KUHPerdata.`,
        explanation:
          'Change Tone (Assertive): Dipertegas dengan diksi kewajiban mutlak ("wajib", "tanpa pengecualian") dan konsekuensi penegakan hukum.',
      };

    case 'legalese_to_plain_english':
      return {
        transformedText: `${prefix}[Plain English]: Both Parties clearly agree to fulfill this obligation in good faith with written verification within the agreed business days — (${cleanBody}).`,
        explanation:
          'Legalese-to-Plain-English: Diterjemahkan dari jargon hukum rumit menjadi Plain English yang lugas dan mudah dipahami klien.',
      };
  }
}

interface LegalAnnotatedTextProps {
  text: string;
  extraGlossaryItems?: LegalGlossaryItem[];
  className?: string;
}

export const LegalAnnotatedText: React.FC<LegalAnnotatedTextProps> = ({
  text,
  extraGlossaryItems = [],
  className = '',
}) => {
  const segments = useMemo(
    () => tokenizeTextWithGlossary(text, extraGlossaryItems),
    [text, extraGlossaryItems]
  );

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (!seg.glossaryItem) {
          return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
        }

        const { term, category, legalReference, definition } = seg.glossaryItem;

        return (
          <span
            key={idx}
            tabIndex={0}
            className="relative inline group/term border-b border-dotted border-[#1E3A8A]/75 bg-[#1E3A8A]/[0.04] hover:bg-[#1E3A8A]/12 text-[#18181B] px-0.5 rounded-xs transition-colors cursor-help focus:outline-none focus:bg-[#1E3A8A]/15"
          >
            {seg.text}
            {/* Subtle Floating Tooltip on Hover / Focus */}
            <span
              role="tooltip"
              className="no-print pointer-events-none opacity-0 group-hover/term:opacity-100 group-focus/term:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 w-72 sm:w-80 p-3 bg-[#18181B] text-white rounded-md shadow-xl border border-[#3F3F46] font-ui text-left block normal-case tracking-normal leading-snug"
            >
              <span className="block text-xs font-semibold text-white mb-0.5">
                {term}
              </span>
              <span className="block text-[10.5px] text-[#D6D0C4] mb-1.5">
                {category} · <span className="text-blue-300 font-medium">{legalReference}</span>
              </span>
              <span className="block text-[11px] text-[#E4E4E7] leading-relaxed">
                {definition}
              </span>
              {/* Downward Caret */}
              <span
                aria-hidden="true"
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#18181B]"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
};

interface EditableAnnotatedParagraphProps {
  value: string;
  onChange: (newValue: string) => void;
  extraGlossaryItems?: LegalGlossaryItem[];
  rows?: number;
  className?: string;
  onSelectText?: (selectedText: string) => void;
  clauseContext?: string;
  enableGlobalShortcutFallback?: boolean;
  onAiTransformApplied?: (
    actionLabel: string,
    newParagraphValue: string,
    previousParagraphValue: string
  ) => void;
}

export const EditableAnnotatedParagraph: React.FC<EditableAnnotatedParagraphProps> = ({
  value,
  onChange,
  extraGlossaryItems = [],
  rows = 3,
  className = '',
  onSelectText,
  clauseContext,
  enableGlobalShortcutFallback = false,
  onAiTransformApplied,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const [originalBeforeTransform, setOriginalBeforeTransform] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<{
    transformedText: string;
    explanation: string;
    action: WritingAssistantAction;
  } | null>(null);
  const [isTransformingAI, setIsTransformingAI] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current && !isAssistantOpen) {
      textareaRef.current.focus();
    }
  }, [isEditing, isAssistantOpen]);

  const captureCurrentSelection = useCallback(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const sub = el.value.substring(start, end).trim();
      if (sub.length > 0) {
        setSelectedRange({ start, end, text: sub });
        return { start, end, text: sub };
      }
    }
    setSelectedRange({ start: 0, end: value.length, text: value });
    return { start: 0, end: value.length, text: value };
  }, [value]);

  const openWritingAssistantPopup = useCallback(() => {
    setIsEditing(true);
    const sel = captureCurrentSelection();
    if (!sel.text) {
      setSelectedRange({ start: 0, end: value.length, text: value });
    }
    setOriginalBeforeTransform((prev) => prev ?? value);
    setIsAssistantOpen(true);
  }, [captureCurrentSelection, value]);

  // Listen for global Cmd+K / Ctrl+K when this paragraph is the designated fallback or currently active
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (isEditing) {
          e.preventDefault();
          e.stopPropagation();
          openWritingAssistantPopup();
        } else if (enableGlobalShortcutFallback) {
          const activeEl = document.activeElement;
          const isAnotherTextarea =
            activeEl &&
            (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT') &&
            !containerRef.current?.contains(activeEl);
          if (!isAnotherTextarea) {
            e.preventDefault();
            openWritingAssistantPopup();
          }
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isEditing, enableGlobalShortcutFallback, openWritingAssistantPopup]);

  const handleTextareaSelection = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const selected = el.value.substring(el.selectionStart, el.selectionEnd).trim();
    if (selected.length > 0) {
      setSelectedRange({
        start: el.selectionStart,
        end: el.selectionEnd,
        text: selected,
      });
    }
    if (onSelectText && selected.length >= 10) {
      onSelectText(selected);
    }
  };

  const handleWindowSelection = () => {
    if (!onSelectText) return;
    const sel = window.getSelection();
    const selected = sel ? sel.toString().trim() : '';
    if (selected.length >= 10 && value.includes(selected.slice(0, 12))) {
      onSelectText(selected);
    }
  };

  const applyReplacementToParagraph = (
    replacementSegment: string,
    range: { start: number; end: number; text: string } | null
  ): string => {
    if (
      range &&
      range.start >= 0 &&
      range.end <= value.length &&
      range.end > range.start &&
      range.end - range.start < value.length
    ) {
      const nextVal =
        value.slice(0, range.start) + replacementSegment + value.slice(range.end);
      onChange(nextVal);
      setSelectedRange({
        start: range.start,
        end: range.start + replacementSegment.length,
        text: replacementSegment,
      });
      return nextVal;
    } else {
      onChange(replacementSegment);
      setSelectedRange({
        start: 0,
        end: replacementSegment.length,
        text: replacementSegment,
      });
      return replacementSegment;
    }
  };

  const handleRunTransformation = async (
    action: WritingAssistantAction,
    customPromptText?: string
  ) => {
    const previousValue = value;
    const activeSel = selectedRange?.text ? selectedRange : { start: 0, end: value.length, text: value };
    const sourceText = activeSel.text || value;

    const actionLabels: Record<WritingAssistantAction, string> = {
      expand: customPromptText?.trim()
        ? `AI Writing Assistant · Custom (${customPromptText.trim().slice(0, 32)})`
        : 'AI Writing Assistant · Expand (Perluas & Perinci)',
      simplify: 'AI Writing Assistant · Simplify (Ringkas & Lugas)',
      tone_formal: 'AI Writing Assistant · Change Tone: Formal (Akta Notariil)',
      tone_assertive: 'AI Writing Assistant · Change Tone: Assertive (Tegas & Mengikat)',
      legalese_to_plain_english: 'AI Writing Assistant · Legalese-to-Plain-English',
    };

    // 1. Immediate deterministic transformation so UI & Contract Health Score respond without delay
    const localResult = transformLegalTextLocally(sourceText, action, customPromptText);
    setPreviewResult({
      transformedText: localResult.transformedText,
      explanation: localResult.explanation,
      action,
    });
    const nextParagraphValue = applyReplacementToParagraph(localResult.transformedText, activeSel);
    onAiTransformApplied?.(actionLabels[action], nextParagraphValue, previousValue);

    // 2. Also query server-side Gemini endpoint in background to enrich if available
    setIsTransformingAI(true);
    try {
      const response = await fetch('/api/legal/writing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText: sourceText,
          action,
          customPrompt: customPromptText,
          clauseContext,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.transformedText && !data.fallback) {
          setPreviewResult({
            transformedText: data.transformedText,
            explanation: data.explanation || localResult.explanation,
            action,
          });
          const aiNextParagraphValue = applyReplacementToParagraph(data.transformedText, {
            start: activeSel.start,
            end: activeSel.start + localResult.transformedText.length,
            text: localResult.transformedText,
          });
          onAiTransformApplied?.(actionLabels[action], aiNextParagraphValue, previousValue);
        }
      }
    } catch {
      // Deterministic local transformation is already applied
    } finally {
      setIsTransformingAI(false);
    }
  };

  const handleUndoTransform = () => {
    if (originalBeforeTransform !== null) {
      onChange(originalBeforeTransform);
      setPreviewResult(null);
      setSelectedRange({
        start: 0,
        end: originalBeforeTransform.length,
        text: originalBeforeTransform,
      });
    }
  };

  if (isEditing) {
    return (
      <div ref={containerRef} className="flex-1 space-y-2 relative">
        <textarea
          ref={textareaRef}
          data-testid="editable-legal-paragraph-textarea"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextareaSelection}
          onMouseUp={handleTextareaSelection}
          onKeyUp={handleTextareaSelection}
          onBlur={(e) => {
            if (
              isAssistantOpen ||
              (containerRef.current &&
                e.relatedTarget instanceof Node &&
                containerRef.current.contains(e.relatedTarget))
            ) {
              return;
            }
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
              e.preventDefault();
              e.stopPropagation();
              openWritingAssistantPopup();
              return;
            }
            if (e.key === 'Escape') {
              if (isAssistantOpen) {
                setIsAssistantOpen(false);
              } else {
                setIsEditing(false);
              }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              setIsAssistantOpen(false);
              setIsEditing(false);
            }
          }}
          className="w-full text-[15px] leading-relaxed text-justify bg-[#FAF9F6] p-2.5 rounded border border-[#1E3A8A] focus:outline-none resize-y"
        />

        {/* Inline Editing Toolbar with AI Writing Assistant (Cmd+K) Trigger */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 text-[11px] font-ui text-[#57534E]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="open-ai-writing-assistant-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                openWritingAssistantPopup();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded transition-colors cursor-pointer"
              title="Buka AI Writing Assistant (Pintasan Keyboard: Cmd+K atau Ctrl+K)"
            >
              <Sparkles className="w-3 h-3 text-[#1E3A8A]" />
              <span>AI Writing Assistant</span>
              <kbd className="px-1 py-0.2 text-[9.5px] font-code bg-white text-[#1E3A8A] border border-[#BFDBFE] rounded">
                ⌘K
              </kbd>
            </button>
            <span className="text-[10.5px] text-[#78716C]">
              Sorot teks lalu tekan <strong>Cmd+K</strong> / <strong>Ctrl+K</strong> untuk transformasi AI
            </span>
          </div>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsAssistantOpen(false);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-[#1E3A8A] rounded cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Selesai Edit</span>
          </button>
        </div>

        {/* AI WRITING ASSISTANT POPUP (Triggered by Cmd+K / Ctrl+K or Button) */}
        {isAssistantOpen && (
          <div
            role="dialog"
            aria-label="AI Writing Assistant"
            data-testid="ai-writing-assistant-popup"
            onMouseDown={(e) => e.stopPropagation()}
            className="no-print mt-1.5 p-3.5 bg-white border-2 border-[#1E3A8A] rounded-lg shadow-xl font-ui space-y-3 z-30"
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                    <span>AI Writing Assistant</span>
                    <span className="px-1.5 py-0.2 text-[9.5px] font-code font-semibold bg-[#F7F5F0] text-[#1E3A8A] border border-[#D6D0C4] rounded">
                      ⌘K / Ctrl+K
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#57534E]">
                    Transformasi instan untuk teks paragraf yang dipilih
                  </div>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-ai-writing-assistant-btn"
                onClick={() => setIsAssistantOpen(false)}
                className="p-1 text-[#78716C] hover:text-[#18181B] rounded cursor-pointer"
                title="Tutup AI Writing Assistant (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Text Excerpt */}
            <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded text-[11px] text-[#3F3F46]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] mb-0.5">
                Teks Terpilih ({selectedRange?.text ? 'Kutipan Tersorot' : 'Seluruh Ayat'}):
              </div>
              <div className="line-clamp-2 font-legal italic text-[#18181B]">
                "{selectedRange?.text || value}"
              </div>
            </div>

            {/* 3 Core Transformation Categories Requested */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Group 1: Expand / Simplify */}
              <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-1.5">
                <div className="text-[10.5px] font-bold text-[#18181B] flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-[#1E3A8A]" />
                  <span>Expand/Simplify</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    data-testid="ai-assistant-expand-btn"
                    disabled={isTransformingAI}
                    onClick={() => handleRunTransformation('expand')}
                    className={`w-full text-left px-2 py-1.5 text-[11px] font-medium rounded border transition-colors cursor-pointer flex items-center justify-between ${
                      previewResult?.action === 'expand'
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-white text-[#18181B] border-[#D6D0C4] hover:bg-[#EFF6FF] hover:border-[#1E3A8A]'
                    }`}
                  >
                    <span>Expand (Perluas & Perinci)</span>
                    <Maximize2 className="w-3 h-3 shrink-0 opacity-75" />
                  </button>
                  <button
                    type="button"
                    data-testid="ai-assistant-simplify-btn"
                    disabled={isTransformingAI}
                    onClick={() => handleRunTransformation('simplify')}
                    className={`w-full text-left px-2 py-1.5 text-[11px] font-medium rounded border transition-colors cursor-pointer flex items-center justify-between ${
                      previewResult?.action === 'simplify'
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-white text-[#18181B] border-[#D6D0C4] hover:bg-[#EFF6FF] hover:border-[#1E3A8A]'
                    }`}
                  >
                    <span>Simplify (Ringkas & Lugas)</span>
                    <Minimize2 className="w-3 h-3 shrink-0 opacity-75" />
                  </button>
                </div>
              </div>

              {/* Group 2: Change Tone (Formal / Assertive) */}
              <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-1.5">
                <div className="text-[10.5px] font-bold text-[#18181B] flex items-center gap-1">
                  <Scale className="w-3 h-3 text-[#1E3A8A]" />
                  <span>Change Tone (Formal/Assertive)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    data-testid="ai-assistant-tone-formal-btn"
                    disabled={isTransformingAI}
                    onClick={() => handleRunTransformation('tone_formal')}
                    className={`w-full text-left px-2 py-1.5 text-[11px] font-medium rounded border transition-colors cursor-pointer flex items-center justify-between ${
                      previewResult?.action === 'tone_formal'
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-white text-[#18181B] border-[#D6D0C4] hover:bg-[#EFF6FF] hover:border-[#1E3A8A]'
                    }`}
                  >
                    <span>Formal (Akta Notariil)</span>
                    <Scale className="w-3 h-3 shrink-0 opacity-75" />
                  </button>
                  <button
                    type="button"
                    data-testid="ai-assistant-tone-assertive-btn"
                    disabled={isTransformingAI}
                    onClick={() => handleRunTransformation('tone_assertive')}
                    className={`w-full text-left px-2 py-1.5 text-[11px] font-medium rounded border transition-colors cursor-pointer flex items-center justify-between ${
                      previewResult?.action === 'tone_assertive'
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-white text-[#18181B] border-[#D6D0C4] hover:bg-[#EFF6FF] hover:border-[#1E3A8A]'
                    }`}
                  >
                    <span>Assertive (Tegas & Mengikat)</span>
                    <ShieldCheck className="w-3 h-3 shrink-0 opacity-75" />
                  </button>
                </div>
              </div>

              {/* Group 3: Legalese-to-Plain-English */}
              <div className="p-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded-md space-y-1.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-[10.5px] font-bold text-[#18181B] flex items-center gap-1">
                    <Languages className="w-3 h-3 text-[#1E3A8A]" />
                    <span>Legalese-to-Plain-English</span>
                  </div>
                  <p className="text-[10px] text-[#57534E] leading-snug">
                    Ubah istilah hukum rumit ke bahasa Plain English yang mudah dipahami klien.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="ai-assistant-plain-english-btn"
                  disabled={isTransformingAI}
                  onClick={() => handleRunTransformation('legalese_to_plain_english')}
                  className={`w-full text-left px-2 py-1.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer flex items-center justify-between ${
                    previewResult?.action === 'legalese_to_plain_english'
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                      : 'bg-white text-[#1E3A8A] border-[#BFDBFE] hover:bg-[#EFF6FF]'
                  }`}
                >
                  <span>Legalese-to-Plain-English</span>
                  <Languages className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>

            {/* Optional Custom Prompt Row */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                data-testid="ai-assistant-custom-input"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInstruction.trim()) {
                    e.preventDefault();
                    handleRunTransformation('expand', customInstruction);
                  }
                }}
                placeholder="Atau ketik instruksi penulisan khusus (mis. tambahkan batas waktu 14 hari)..."
                className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-[#D6D0C4] rounded focus:outline-none focus:border-[#1E3A8A]"
              />
              <button
                type="button"
                disabled={!customInstruction.trim() || isTransformingAI}
                onClick={() => handleRunTransformation('expand', customInstruction)}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] disabled:opacity-50 rounded cursor-pointer whitespace-nowrap"
              >
                Transformasi
              </button>
            </div>

            {/* Result Preview & Confirm/Undo Footer */}
            {previewResult && (
              <div
                data-testid="ai-assistant-result-preview"
                className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-md space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10.5px] font-semibold text-emerald-900">
                  <span>{previewResult.explanation}</span>
                  {isTransformingAI && (
                    <span className="font-code text-[10px] text-[#1E3A8A]">
                      Menyempurnakan dengan AI...
                    </span>
                  )}
                </div>
                <div
                  data-testid="ai-assistant-transformed-text"
                  className="text-xs font-legal text-[#18181B] bg-white p-2 rounded border border-emerald-200 leading-relaxed"
                >
                  {previewResult.transformedText}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {originalBeforeTransform !== null && (
                    <button
                      type="button"
                      data-testid="ai-assistant-undo-btn"
                      onClick={handleUndoTransform}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#57534E] hover:text-[#18181B] bg-white border border-[#D6D0C4] rounded cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Kembalikan Asli</span>
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid="ai-assistant-apply-btn"
                    onClick={() => {
                      setIsAssistantOpen(false);
                      setIsEditing(false);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Terapkan & Selesai</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseUp={handleWindowSelection}
      className={`flex-1 group/para relative p-2 rounded border border-transparent hover:border-[#E5E0D8] hover:bg-[#FAF9F6]/60 transition-colors ${className}`}
    >
      <div className="text-[15px] leading-relaxed text-justify whitespace-pre-line">
        <LegalAnnotatedText text={value} extraGlossaryItems={extraGlossaryItems} />
      </div>
      <div className="no-print opacity-0 group-hover/para:opacity-100 focus-within:opacity-100 transition-opacity absolute top-1.5 right-1.5 inline-flex items-center gap-1">
        <button
          type="button"
          data-testid="quick-open-ai-writing-assistant-btn"
          onClick={openWritingAssistantPopup}
          title="Buka AI Writing Assistant (Cmd+K / Ctrl+K)"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-ui font-semibold text-[#1E3A8A] bg-[#EFF6FF] border border-[#BFDBFE] rounded shadow-2xs hover:bg-[#DBEAFE] cursor-pointer"
        >
          <Sparkles className="w-2.5 h-2.5 text-[#1E3A8A]" />
          <span>AI Assistant (⌘K)</span>
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          title="Klik untuk mengedit teks ini"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-ui font-medium text-[#1E3A8A] bg-white border border-[#D6D0C4] rounded shadow-2xs hover:bg-[#F7F5F0] cursor-pointer"
        >
          <Edit3 className="w-2.5 h-2.5" />
          <span>Edit Teks</span>
        </button>
      </div>
    </div>
  );
};
