import React from 'react';

/**
 * Parses markdown-like text and converts it to React elements
 * Handles: **bold**, *italic*, numbered lists, bullet points, ### headers
 */
export function formatMessageContent(content: string): React.ReactNode {
  if (!content) return null;

  // Split content by newlines to handle line breaks and lists
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    // Check for ### headers (e.g., "### 9. Measuring Impact")
    const h3Match = line.match(/^###\s*(.*)$/);
    // Check for ## headers
    const h2Match = line.match(/^##\s*(.*)$/);
    // Check for # headers
    const h1Match = line.match(/^#\s*(.*)$/);
    // Check for numbered list items (e.g., "1. **Title**:")
    const numberedListMatch = line.match(/^(\d+)\.\s*(.*)$/);
    // Check for bullet points
    const bulletMatch = line.match(/^[-•]\s*(.*)$/);

    if (h3Match) {
      const [, text] = h3Match;
      elements.push(
        <h4 key={lineIndex} className="font-semibold text-gray-900 mt-3 mb-1">
          {parseInlineFormatting(text)}
        </h4>
      );
    } else if (h2Match) {
      const [, text] = h2Match;
      elements.push(
        <h3 key={lineIndex} className="font-semibold text-gray-900 text-lg mt-3 mb-1">
          {parseInlineFormatting(text)}
        </h3>
      );
    } else if (h1Match) {
      const [, text] = h1Match;
      elements.push(
        <h2 key={lineIndex} className="font-bold text-gray-900 text-xl mt-4 mb-2">
          {parseInlineFormatting(text)}
        </h2>
      );
    } else if (numberedListMatch) {
      const [, number, rest] = numberedListMatch;
      elements.push(
        <div key={lineIndex} className="flex gap-2 my-1">
          <span className="font-medium text-gray-700 shrink-0">{number}.</span>
          <span>{parseInlineFormatting(rest)}</span>
        </div>
      );
    } else if (bulletMatch) {
      const [, rest] = bulletMatch;
      elements.push(
        <div key={lineIndex} className="flex gap-2 my-1 ml-4">
          <span className="text-gray-500">•</span>
          <span>{parseInlineFormatting(rest)}</span>
        </div>
      );
    } else if (line.trim() === '') {
      // Empty line - add spacing
      elements.push(<div key={lineIndex} className="h-2" />);
    } else {
      // Regular paragraph
      elements.push(
        <p key={lineIndex} className="my-1">
          {parseInlineFormatting(line)}
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

/**
 * Parses inline formatting like **bold** and *italic*
 */
function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Look for **bold** pattern
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Look for *italic* pattern (single asterisk, not double)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    // Find the earliest match
    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
    const italicIndex = italicMatch ? remaining.indexOf(italicMatch[0]) : -1;

    let earliestIndex = -1;
    let earliestMatch: RegExpMatchArray | null = null;
    let isBold = false;

    if (boldIndex !== -1 && (italicIndex === -1 || boldIndex <= italicIndex)) {
      earliestIndex = boldIndex;
      earliestMatch = boldMatch;
      isBold = true;
    } else if (italicIndex !== -1) {
      earliestIndex = italicIndex;
      earliestMatch = italicMatch;
      isBold = false;
    }

    if (earliestIndex !== -1 && earliestMatch) {
      // Add text before the match
      if (earliestIndex > 0) {
        parts.push(remaining.substring(0, earliestIndex));
      }

      // Add the formatted text
      if (isBold) {
        parts.push(
          <strong key={keyIndex++} className="font-semibold">
            {earliestMatch[1]}
          </strong>
        );
      } else {
        parts.push(
          <em key={keyIndex++} className="italic">
            {earliestMatch[1]}
          </em>
        );
      }

      // Continue with the rest
      remaining = remaining.substring(earliestIndex + earliestMatch[0].length);
    } else {
      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

/**
 * Strips all markdown formatting and returns plain text
 */
export function stripMarkdown(content: string): string {
  if (!content) return '';

  return content
    .replace(/^###\s*/gm, '')            // Remove ### headers
    .replace(/^##\s*/gm, '')             // Remove ## headers
    .replace(/^#\s*/gm, '')              // Remove # headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // Remove **bold**
    .replace(/\*([^*]+)\*/g, '$1')       // Remove *italic*
    .replace(/^(\d+)\.\s*/gm, '$1. ')    // Keep numbered lists clean
    .replace(/^[-•]\s*/gm, '• ');        // Normalize bullet points
}

