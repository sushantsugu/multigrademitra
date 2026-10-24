import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { normalizeMarkdownEscapedNewlines } from '../../lib/markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children }) => <h1 className="text-xl font-bold text-[#14263D]">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold text-[#14263D]">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold text-[#3730A3]">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-slate-800">{children}</h4>,
  p: ({ children }) => <p className="leading-7 text-slate-700">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-6">{children}</li>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-400 pl-4 text-slate-600">{children}</blockquote>,
  pre: ({ children }) => <pre className="overflow-x-auto rounded bg-slate-900 p-4 text-xs text-emerald-200">{children}</pre>,
  code: ({ children, className }) => className
    ? <code className={className}>{children}</code>
    : <code className="rounded bg-slate-100 px-1 py-0.5 text-indigo-800">{children}</code>,
  table: ({ children }) => <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
  th: ({ children }) => <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-slate-200 px-3 py-2 align-top">{children}</td>
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
      {normalizeMarkdownEscapedNewlines(content)}
    </ReactMarkdown>
  </div>
);
