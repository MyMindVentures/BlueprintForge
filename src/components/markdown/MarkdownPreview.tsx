import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-body p-10 bg-white/[0.01] rounded-[32px] border border-white/5 shadow-inner">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "_Protocol documentation pending generation..._"}
      </ReactMarkdown>
    </div>
  );
}
