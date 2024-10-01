// components/MarkdownDisplay.tsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { preprocessMarkdown } from '../utils/markdownPreprocessor'
import DOMPurify from 'dompurify';

interface MarkdownDisplayProps {
  markdown: string;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ markdown }) => {
  // Preprocess the markdown to fix formatting issues
  const processedContent = preprocessMarkdown(markdown);

  // Sanitize the processed content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(processedContent);

  return (
    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
      {sanitizedContent}
    </ReactMarkdown>
  );
};

export default MarkdownDisplay;
