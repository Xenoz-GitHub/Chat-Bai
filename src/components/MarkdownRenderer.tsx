import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-[15px] leading-relaxed break-words text-[var(--text-primary)] select-text">
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          let language = 'code';
          let codeContent = '';

          if (firstLineEnd !== -1) {
            language = part.slice(3, firstLineEnd).trim() || 'code';
            codeContent = part.slice(firstLineEnd + 1, -3);
          } else {
            codeContent = part.slice(3, -3);
          }

          return <CodeBlock key={index} code={codeContent} language={language} />;
        }

        return <TextMarkdownBlock key={index} text={part} />;
      })}
    </div>
  );
};

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="my-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--code-block-bg)] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--code-header-bg)] border-b border-[var(--border-color)] text-xs">
        <span className="font-mono text-[#F59E0B] font-medium lowercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded transition-colors text-[11px] cursor-pointer"
          title="Kopyaha ang code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Na-kopya na</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Kopyaha</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-[var(--text-primary)]">
        <pre className="selection:bg-[#F59E0B]/30">{code}</pre>
      </div>
    </div>
  );
};

const TextMarkdownBlock: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-semibold text-[var(--text-primary)] text-sm mt-3 mb-1">
              {renderInlineFormatting(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-semibold text-[var(--text-primary)] text-base mt-3 mb-1">
              {renderInlineFormatting(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-bold text-[var(--text-primary)] text-lg mt-3 mb-1">
              {renderInlineFormatting(trimmed.slice(2))}
            </h2>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-[#F59E0B] pl-3 py-1 text-[var(--text-secondary)] text-[13.5px] bg-[var(--bg-elevated)]/60 rounded-r my-1"
            >
              {renderInlineFormatting(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Unordered List
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-[var(--text-primary)]">
              <span className="text-[#F59E0B] font-bold select-none text-xs mt-1">•</span>
              <span className="flex-1">{renderInlineFormatting(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Ordered List
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-[var(--text-primary)]">
              <span className="text-[#F59E0B] font-mono text-xs mt-0.5 min-w-[18px]">
                {orderedMatch[1]}.
              </span>
              <span className="flex-1">{renderInlineFormatting(orderedMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[var(--text-primary)]">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineFormatting(text: string): React.ReactNode {
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 text-[12.5px] font-mono bg-[var(--bg-elevated)] text-[#D97706] dark:text-[#F59E0B] rounded border border-[var(--border-color)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-[var(--text-secondary)]">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}
