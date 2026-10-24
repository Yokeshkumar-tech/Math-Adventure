// client/src/components/MathRenderer.jsx
import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Safely parse and render markdown text containing LaTeX math equations ($...$ and $$...$$),
 * bolding, numbered steps, and bullet points.
 */
export default function MathRenderer({ content = "", className = "" }) {
  const renderedElements = useMemo(() => {
    if (!content) return [];

    // Split content by block math first: $$...$$ or \[...\]
    const blockMathRegex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = blockMathRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          value: content.slice(lastIndex, match.index),
        });
      }
      const mathStr = match[1] || match[2] || "";
      parts.push({
        type: "block_math",
        value: mathStr.trim(),
      });
      lastIndex = blockMathRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        value: content.slice(lastIndex),
      });
    }

    // Function to render inline text with inline math $...$ or \(...\)
    const renderInline = (textStr, keyPrefix) => {
      const inlineMathRegex = /\$([^\$\n]+?)\$|\\\(([^\)]+?)\\\)/g;
      const elements = [];
      let iLast = 0;
      let iMatch;

      while ((iMatch = inlineMathRegex.exec(textStr)) !== null) {
        if (iMatch.index > iLast) {
          elements.push(
            formatFormatting(textStr.slice(iLast, iMatch.index), `${keyPrefix}-t-${iLast}`)
          );
        }
        const inlineMath = iMatch[1] || iMatch[2] || "";
        try {
          const html = katex.renderToString(inlineMath, {
            throwOnError: false,
            displayMode: false,
          });
          elements.push(
            <span
              key={`${keyPrefix}-m-${iMatch.index}`}
              className="inline-math px-1 text-indigo-900 font-semibold"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          elements.push(
            <code key={`${keyPrefix}-m-${iMatch.index}`} className="px-1 text-indigo-700 bg-indigo-50 rounded">
              {inlineMath}
            </code>
          );
        }
        iLast = inlineMathRegex.lastIndex;
      }

      if (iLast < textStr.length) {
        elements.push(
          formatFormatting(textStr.slice(iLast), `${keyPrefix}-t-${iLast}`)
        );
      }

      return elements;
    };

    // Helper to format bold **text** and bullet items
    const formatFormatting = (plainText, key) => {
      const lines = plainText.split("\n");
      return (
        <span key={key}>
          {lines.map((line, lIdx) => {
            // Process bold **text**
            const boldParts = line.split(/(\*\*[^\*]+?\*\*)/g);
            return (
              <React.Fragment key={lIdx}>
                {boldParts.map((bp, bIdx) => {
                  if (bp.startsWith("**") && bp.endsWith("**")) {
                    return (
                      <strong key={bIdx} className="font-bold text-slate-900">
                        {bp.slice(2, -2)}
                      </strong>
                    );
                  }
                  return bp;
                })}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </span>
      );
    };

    return parts.map((part, idx) => {
      if (part.type === "block_math") {
        try {
          const html = katex.renderToString(part.value, {
            throwOnError: false,
            displayMode: true,
          });
          return (
            <div
              key={idx}
              className="my-3 py-2 px-3 bg-indigo-50/60 rounded-xl overflow-x-auto text-center border border-indigo-100 shadow-2xs"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <div
              key={idx}
              className="my-3 p-3 bg-slate-100 font-mono text-sm rounded-xl overflow-x-auto text-center"
            >
              {part.value}
            </div>
          );
        }
      }

      return (
        <div key={idx} className="leading-relaxed">
          {renderInline(part.value, `block-${idx}`)}
        </div>
      );
    });
  }, [content]);

  return <div className={`math-rendered-content ${className}`}>{renderedElements}</div>;
}
