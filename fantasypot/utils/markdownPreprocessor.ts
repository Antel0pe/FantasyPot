// utils/markdownPreprocessor.ts

export const preprocessMarkdown = (markdown: string): string => {
    // Step 2: Remove unintended indentation (up to 4 spaces) from list items
    const lines = markdown.split('\n');
    const processedLines = lines.map((line) => {
      // Regex to match ordered and unordered list items
      const listItemRegex = /^\s*(-|\*|\d+\.)\s+/;
  
      if (listItemRegex.test(line)) {
        // Remove leading spaces (up to 4)
        return line.replace(/^\s{1,4}/, '');
      }
  
      return line;
    });
    
    return processedLines.join(`\n`);
  };
  