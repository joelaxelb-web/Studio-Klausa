import React from 'react';

interface FormattedLegalTextProps {
  text: string;
  className?: string;
  isInverted?: boolean;
}

/**
 * Parses inline markdown-style emphasis (**bold**, *italic*, __bold__, _italic_, `code`)
 * into clean React elements (<strong>, <em>, <code>) with zero raw markdown symbols.
 */
export function renderInlineFormattedText(
  input: string,
  keyPrefix = 'inl'
): React.ReactNode[] {
  if (!input) return [];

  // Normalize any paired smart/ascii quotes around single asterisks like *"..."* -> "*...*"
  const normalized = input.replace(/\\([*_`#>])/g, '$1');

  const tokenRegex =
    /(\*\*\*[\s\S]+?\*\*\*|___[\s\S]+?___|\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[^\s*](?:[^*]*[^\s*])?\*|\*[^\s*]\*|_[^\s_](?:[^_]*[^\s_])?_|`[^`]+`)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const plainChunk = normalized
        .slice(lastIndex, match.index)
        .replace(/\*\*/g, '')
        .replace(/__/g, '');
      nodes.push(plainChunk);
    }

    const token = match[0];
    const currentKey = `${keyPrefix}-${idx++}`;

    if (
      (token.startsWith('***') && token.endsWith('***')) ||
      (token.startsWith('___') && token.endsWith('___'))
    ) {
      const inner = token.slice(3, -3);
      nodes.push(
        <strong key={currentKey} className="font-semibold italic">
          {renderInlineFormattedText(inner, currentKey)}
        </strong>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={currentKey} className="font-semibold">
          {renderInlineFormattedText(inner, currentKey)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      const inner = token.slice(1, -1);
      nodes.push(
        <em key={currentKey} className="italic">
          {renderInlineFormattedText(inner, currentKey)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <code
          key={currentKey}
          className="font-code text-[11px] px-1 py-0.5 bg-[#F7F5F0] text-[#1E3A8A] border border-[#E5E0D8] rounded"
        >
          {inner}
        </code>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    const remaining = normalized
      .slice(lastIndex)
      .replace(/\*\*/g, '')
      .replace(/__/g, '');
    nodes.push(remaining);
  }

  return nodes;
}

/**
 * Renders AI legal consultation and regulation explanations with real bold (<strong>),
 * italic (<em>), structured lists, and blockquotes without displaying raw markdown symbols.
 */
export const FormattedLegalText: React.FC<FormattedLegalTextProps> = ({
  text,
  className = '',
  isInverted = false,
}) => {
  if (!text) return null;

  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/```[a-zA-Z]*\n?/g, '')
    .split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {lines.map((rawLine, lineIdx) => {
        const trimmed = rawLine.trim();

        if (!trimmed) {
          return <div key={`empty-${lineIdx}`} className="h-0.5" />;
        }

        // Horizontal divider (--- or ***)
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return (
            <hr
              key={`hr-${lineIdx}`}
              className={isInverted ? 'border-blue-300/30 my-1.5' : 'border-[#E5E0D8] my-1.5'}
            />
          );
        }

        // Markdown Headings (#, ##, ###, ####)
        const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
        if (headingMatch) {
          const cleanHeading = headingMatch[1].replace(/^[*_]+|[*_]+$/g, '');
          return (
            <div
              key={`hd-${lineIdx}`}
              className={`font-semibold pt-1 ${
                isInverted ? 'text-white' : 'text-[#18181B]'
              }`}
            >
              {renderInlineFormattedText(cleanHeading, `hd-${lineIdx}`)}
            </div>
          );
        }

        // Blockquotes (> ...)
        const quoteMatch = trimmed.match(/^>\s*(.+)$/);
        if (quoteMatch) {
          const quoteContent = quoteMatch[1].trim();
          return (
            <blockquote
              key={`qt-${lineIdx}`}
              className={`pl-2.5 py-1.5 my-1 border-l-2 italic rounded-r ${
                isInverted
                  ? 'border-blue-200 bg-blue-900/40 text-blue-50'
                  : 'border-[#1E3A8A] bg-[#FAF9F6] text-[#18181B]'
              }`}
            >
              {renderInlineFormattedText(quoteContent, `qt-${lineIdx}`)}
            </blockquote>
          );
        }

        // Numbered list items (1. ... or 1) ...)
        const numberedMatch = trimmed.match(/^(\d+[.)])\s+(.+)$/);
        if (numberedMatch) {
          const marker = numberedMatch[1];
          const content = numberedMatch[2];
          return (
            <div key={`num-${lineIdx}`} className="flex items-start gap-1.5 pt-0.5">
              <span
                className={`font-semibold shrink-0 min-w-[16px] ${
                  isInverted ? 'text-blue-100' : 'text-[#1E3A8A]'
                }`}
              >
                {marker}
              </span>
              <div className="flex-1 min-w-0">
                {renderInlineFormattedText(content, `num-${lineIdx}`)}
              </div>
            </div>
          );
        }

        // Sub-lettered list items (a. ... or a) ...)
        const letterMatch = trimmed.match(/^([a-zA-Z][.)])\s+(.+)$/);
        if (letterMatch && rawLine.startsWith(' ')) {
          const marker = letterMatch[1];
          const content = letterMatch[2];
          return (
            <div key={`let-${lineIdx}`} className="flex items-start gap-1.5 pl-3">
              <span
                className={`font-medium shrink-0 ${
                  isInverted ? 'text-blue-100' : 'text-[#57534E]'
                }`}
              >
                {marker}
              </span>
              <div className="flex-1 min-w-0">
                {renderInlineFormattedText(content, `let-${lineIdx}`)}
              </div>
            </div>
          );
        }

        // Bullet list items (- ..., * ..., • ...)
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[1];
          return (
            <div key={`bul-${lineIdx}`} className="flex items-start gap-1.5 pl-2">
              <span
                className={`font-bold leading-snug shrink-0 ${
                  isInverted ? 'text-blue-200' : 'text-[#1E3A8A]'
                }`}
              >
                •
              </span>
              <div className="flex-1 min-w-0">
                {renderInlineFormattedText(content, `bul-${lineIdx}`)}
              </div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <div key={`p-${lineIdx}`} className="leading-relaxed">
            {renderInlineFormattedText(trimmed, `p-${lineIdx}`)}
          </div>
        );
      })}
    </div>
  );
};
