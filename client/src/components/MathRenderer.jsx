// client/src/components/MathRenderer.jsx
import React, { useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Copy, Check, Code } from "lucide-react";

/**
 * Render a single code block with language header and copy button
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800 text-xs text-slate-300 font-mono border-b border-slate-700/60">
        <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
          <Code className="w-3.5 h-3.5" />
          <span>{language || "code"}</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded transition-colors text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs text-slate-100 font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Render Markdown Table
 */
function TableBlock({ rows }) {
  if (!rows || rows.length === 0) return null;

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  return (
    <div className="my-3 overflow-x-auto rounded-2xl border border-indigo-100 shadow-2xs">
      <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
        <thead>
          <tr className="bg-indigo-50/80 border-b border-indigo-100 text-indigo-950 font-bold">
            {headerRow.map((cell, idx) => (
              <th key={idx} className="px-3.5 py-2.5">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`border-b border-slate-100 ${
                rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
              } hover:bg-indigo-50/40 transition-colors`}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2 text-slate-700 font-medium">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Safely parse and render markdown text containing LaTeX math equations ($...$ and $$...$$),
 * tables, code blocks, bolding, numbered steps, and bullet points.
 */
export default function MathRenderer({ content = "", className = "" }) {
  const renderedElements = useMemo(() => {
    if (!content) return [];

    // Helper to safely render LaTeX string with KaTeX
    const renderKaTeX = (mathStr, isBlock = false) => {
      try {
        return katex.renderToString(mathStr, {
          throwOnError: false,
          displayMode: isBlock,
        });
      } catch {
        return mathStr;
      }
    };

    // Helper to format inline text with $...$ math, bold **text**, and code `code`
    const renderInlineElements = (textStr, keyPrefix) => {
      // Split by inline math: $...$ or \(...\)
      const inlineMathRegex = /\$([^\$\n]+?)\$|\\\(([^\)]+?)\\\)/g;
      const elements = [];
      let iLast = 0;
      let iMatch;

      while ((iMatch = inlineMathRegex.exec(textStr)) !== null) {
        if (iMatch.index > iLast) {
          elements.push(
            formatTextStyles(textStr.slice(iLast, iMatch.index), `${keyPrefix}-t-${iLast}`)
          );
        }
        const inlineMath = iMatch[1] || iMatch[2] || "";
        const html = renderKaTeX(inlineMath, false);

        elements.push(
          <span
            key={`${keyPrefix}-m-${iMatch.index}`}
            className="inline-math px-1 text-indigo-900 font-semibold"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        iLast = inlineMathRegex.lastIndex;
      }

      if (iLast < textStr.length) {
        elements.push(
          formatTextStyles(textStr.slice(iLast), `${keyPrefix}-t-${iLast}`)
        );
      }

      return elements;
    };

    // Helper to format bold **text**, italics *text*, and backtick `code`
    const formatTextStyles = (plainText, keyPrefix) => {
      // Split by backticks `code` first
      const backtickParts = plainText.split(/(`[^`]+?`)/g);

      return (
        <span key={keyPrefix}>
          {backtickParts.map((bPart, bpIdx) => {
            if (bPart.startsWith("`") && bPart.endsWith("`")) {
              return (
                <code
                  key={bpIdx}
                  className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 border border-slate-200 text-indigo-700 font-mono text-xs"
                >
                  {bPart.slice(1, -1)}
                </code>
              );
            }

            // Process bold **text**
            const boldParts = bPart.split(/(\*\*[^\*]+?\*\*)/g);
            return (
              <React.Fragment key={bpIdx}>
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
              </React.Fragment>
            );
          })}
        </span>
      );
    };

    // 1. Break content into major blocks: Code blocks, block math ($$..$$), tables, and regular paragraphs
    const lines = content.split("\n");
    const blocks = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeLines = [];

    let inTable = false;
    let tableRows = [];

    let currentTextLines = [];

    const flushTextLines = () => {
      if (currentTextLines.length > 0) {
        blocks.push({
          type: "text",
          content: currentTextLines.join("\n"),
        });
        currentTextLines = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check code block start / end
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          flushTextLines();
          inCodeBlock = true;
          codeLanguage = trimmed.replace(/^```/, "").trim();
          codeLines = [];
        } else {
          inCodeBlock = false;
          blocks.push({
            type: "code",
            language: codeLanguage,
            code: codeLines.join("\n"),
          });
          codeLines = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Check table row (starts and ends with |)
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        // Skip separator line | --- | --- |
        if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(trimmed)) {
          continue;
        }
        flushTextLines();
        inTable = true;
        const cells = trimmed
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        inTable = false;
        blocks.push({
          type: "table",
          rows: tableRows,
        });
        tableRows = [];
      }

      // Check block math ($$...$$ or \[...\])
      if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
        flushTextLines();
        blocks.push({
          type: "block_math",
          math: trimmed.slice(2, -2).trim(),
        });
        continue;
      }

      currentTextLines.push(line);
    }

    if (inCodeBlock && codeLines.length > 0) {
      blocks.push({
        type: "code",
        language: codeLanguage,
        code: codeLines.join("\n"),
      });
    }

    if (inTable && tableRows.length > 0) {
      blocks.push({
        type: "table",
        rows: tableRows,
      });
    }

    flushTextLines();

    // 2. Render each parsed block
    return blocks.map((block, bIdx) => {
      if (block.type === "code") {
        return (
          <CodeBlock
            key={`code-${bIdx}`}
            code={block.code}
            language={block.language}
          />
        );
      }

      if (block.type === "table") {
        return <TableBlock key={`table-${bIdx}`} rows={block.rows} />;
      }

      if (block.type === "block_math") {
        const html = renderKaTeX(block.math, true);
        return (
          <div
            key={`bmath-${bIdx}`}
            className="my-3 py-2.5 px-4 bg-indigo-50/70 rounded-2xl overflow-x-auto text-center border border-indigo-100 shadow-2xs"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      // For text blocks, check headings, block math, bullet lists, numbered steps
      const blockText = block.content;

      // Handle any multi-line block math inside text: $$...$$
      const parts = [];
      const multiMathRegex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
      let lastIdx = 0;
      let m;

      while ((m = multiMathRegex.exec(blockText)) !== null) {
        if (m.index > lastIdx) {
          parts.push({ type: "prose", val: blockText.slice(lastIdx, m.index) });
        }
        parts.push({ type: "bmath", val: m[1] || m[2] || "" });
        lastIdx = multiMathRegex.lastIndex;
      }

      if (lastIdx < blockText.length) {
        parts.push({ type: "prose", val: blockText.slice(lastIdx) });
      }

      return (
        <div key={`text-block-${bIdx}`} className="space-y-2">
          {parts.map((p, pIdx) => {
            if (p.type === "bmath") {
              const html = renderKaTeX(p.val.trim(), true);
              return (
                <div
                  key={`bm-${bIdx}-${pIdx}`}
                  className="my-3 py-2.5 px-4 bg-indigo-50/70 rounded-2xl overflow-x-auto text-center border border-indigo-100 shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            }

            // Render prose lines
            const subLines = p.val.split("\n");
            return (
              <div key={`prose-${bIdx}-${pIdx}`} className="space-y-1.5 leading-relaxed">
                {subLines.map((sLine, sIdx) => {
                  const trimmedLine = sLine.trim();
                  if (!trimmedLine) return <div key={sIdx} className="h-1.5" />;

                  // Headings
                  if (trimmedLine.startsWith("### ")) {
                    return (
                      <h3
                        key={sIdx}
                        className="font-fredoka text-base sm:text-lg font-bold text-indigo-950 mt-3 mb-1 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block" />
                        <span>{trimmedLine.replace(/^###\s+/, "")}</span>
                      </h3>
                    );
                  }

                  if (trimmedLine.startsWith("## ")) {
                    return (
                      <h2
                        key={sIdx}
                        className="font-fredoka text-lg sm:text-xl font-bold text-indigo-950 mt-4 mb-2"
                      >
                        {trimmedLine.replace(/^##\s+/, "")}
                      </h2>
                    );
                  }

                  // Numbered step (e.g. "1. " or "Step 1: ")
                  const stepMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
                  if (stepMatch) {
                    return (
                      <div key={sIdx} className="flex items-start gap-2.5 my-1 pl-1">
                        <span className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {stepMatch[1]}
                        </span>
                        <div className="flex-1">
                          {renderInlineElements(stepMatch[2], `step-${sIdx}`)}
                        </div>
                      </div>
                    );
                  }

                  // Bullet point (e.g. "• " or "- ")
                  if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
                    const bulletContent = trimmedLine.replace(/^[•\-\*]\s+/, "");
                    return (
                      <div key={sIdx} className="flex items-start gap-2 pl-2 my-1">
                        <span className="text-indigo-500 font-bold text-sm shrink-0 mt-0.5">•</span>
                        <div className="flex-1">
                          {renderInlineElements(bulletContent, `bullet-${sIdx}`)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={sIdx} className="leading-relaxed">
                      {renderInlineElements(trimmedLine, `line-${sIdx}`)}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    });
  }, [content]);

  return <div className={`math-rendered-content ${className}`}>{renderedElements}</div>;
}
