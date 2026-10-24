// client/src/pages/admin/AdminQuestionUpload.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminQuestions } from "../../services/adminApi.js";
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Info,
} from "lucide-react";

export default function AdminQuestionUpload() {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("published");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError("");
    setSuccess("");
    setPreviewData(null);
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setFileContent(text);
      parseFile(selected.name, text);
    };
    reader.readAsText(selected);
  };

  const parseFile = async (fileName, text) => {
    try {
      setLoading(true);
      let parsedRows = [];

      if (fileName.endsWith(".json")) {
        const jsonData = JSON.parse(text);
        parsedRows = Array.isArray(jsonData) ? jsonData : jsonData.questions || [];
      } else {
        // Simple, robust CSV parser for commas and quotes
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          throw new Error("CSV file must contain a header row and at least one data row.");
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

        for (let i = 1; i < lines.length; i++) {
          const rowVals = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
          const rowObj = {};
          headers.forEach((h, hIdx) => {
            rowObj[h] = rowVals[hIdx] || "";
          });
          parsedRows.push(rowObj);
        }
      }

      // Send to backend preview validator
      const res = await adminQuestions.previewImport(parsedRows);
      setPreviewData(res);
    } catch (err) {
      setError("File parsing error: " + (err.message || "Invalid file format."));
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.validCount === 0) return;

    const validOnly = previewData.rows.filter((r) => r.isValid);

    try {
      setCommitting(true);
      setError("");
      const res = await adminQuestions.commitImport(validOnly, defaultStatus);
      setSuccess(res.message);
      setTimeout(() => {
        navigate("/admin/questions");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to commit import.");
    } finally {
      setCommitting(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = `question_text,topic,realm,difficulty,option_a,option_b,option_c,option_d,correct_answer,hint,explanation,points
"What is the perimeter of a square with side 6 cm?","Area and Perimeter","Geometry Mountains","easy","18 cm","20 cm","24 cm","36 cm","24 cm","A square has 4 equal sides.","Perimeter = 4 * side = 24 cm.",10
"What is 3/4 + 2/4 in simplest form?","Fractions","Fraction Kingdom","easy","5/8","5/4","6/4","1/4","5/4","Add numerators over common denominator.","3/4 + 2/4 = 5/4.",10
"A rectangle has length 8 cm and width 5 cm. What is its area?","Area and Perimeter","Geometry Mountains","medium","26 sq cm","40 sq cm","80 sq cm","13 sq cm","40 sq cm","Area = length * width.","Area = 8 * 5 = 40 sq cm.",20`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "math_adventure_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleJson = () => {
    const jsonContent = JSON.stringify(
      [
        {
          question: "What is the perimeter of a square with side 6 cm?",
          topic: "Area and Perimeter",
          realm: "Geometry Mountains",
          difficulty: "easy",
          options: ["18 cm", "20 cm", "24 cm", "36 cm"],
          correctAnswer: "24 cm",
          hint: "Multiply side length by 4.",
          explanation: "Perimeter = 4 × 6 = 24 cm.",
          points: 10,
        },
        {
          question: "Convert 0.75 into a fraction in lowest terms.",
          topic: "Decimals",
          realm: "Desert of Numbers",
          difficulty: "medium",
          options: ["1/2", "3/4", "7/10", "4/5"],
          correctAnswer: "3/4",
          hint: "75/100 can be simplified by dividing by 25.",
          explanation: "0.75 = 75/100 = 3/4.",
          points: 20,
        },
      ],
      null,
      2
    );

    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "math_adventure_questions_template.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Bulk Question Import &amp; Validator</span>
            <span className="text-xl">📥</span>
          </h1>
          <p className="text-xs text-slate-400">
            Import hundreds of mathematical problems via CSV or JSON with automated schema checking
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download CSV Template</span>
          </button>
          <button
            onClick={downloadSampleJson}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download JSON Template</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* File Dropzone */}
      <div className="bg-slate-900/80 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-3xl p-8 text-center transition-all">
        <input
          type="file"
          id="question-file-input"
          accept=".csv,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="question-file-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <span className="font-fredoka text-base font-bold text-white block">
              {file ? file.name : "Click or drag CSV or JSON question file here"}
            </span>
            <span className="text-xs text-slate-400">Supports .csv and .json question packages</span>
          </div>
        </label>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div className="space-y-4">
          {/* Summary Metric Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Total Rows Scanned</div>
                <div className="font-fredoka text-2xl font-bold text-white">{previewData.totalRows}</div>
              </div>
              <Info className="w-6 h-6 text-slate-500" />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase">Valid &amp; Verified</div>
                <div className="font-fredoka text-2xl font-bold text-emerald-300">{previewData.validCount}</div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-rose-400 font-bold uppercase">Errors / Invalid</div>
                <div className="font-fredoka text-2xl font-bold text-rose-300">{previewData.errorCount}</div>
              </div>
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
          </div>

          {/* Validation Table */}
          <div className="admin-table-container">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Row-by-Row Integrity Review
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Import as:</span>
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="published">Published (Available in game)</option>
                  <option value="draft">Draft (Admin review first)</option>
                </select>
                <button
                  id="btn-commit-import"
                  onClick={handleCommit}
                  disabled={previewData.validCount === 0 || committing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>{committing ? "Importing..." : `Commit ${previewData.validCount} Valid Questions`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Status</th>
                    <th>Question Statement</th>
                    <th>Topic</th>
                    <th>Options &amp; Correct Answer</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row) => (
                    <tr key={row.rowIndex}>
                      <td className="font-mono text-xs">{row.rowIndex}</td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.isValid
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {row.isValid ? "✓ Valid" : "✕ Error"}
                        </span>
                      </td>
                      <td className="max-w-xs truncate text-xs font-medium text-slate-200">
                        {row.question || <span className="text-rose-400 italic">Missing question text</span>}
                      </td>
                      <td className="text-xs text-slate-300">{row.topic}</td>
                      <td className="text-xs">
                        <div className="text-emerald-400 font-bold">Key: {row.correctAnswer}</div>
                        <div className="text-[11px] text-slate-400">{row.options?.join(" • ")}</div>
                      </td>
                      <td className="text-xs text-rose-300">
                        {row.errors?.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5">
                            {row.errors.map((e, idx) => (
                              <li key={idx}>{e}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-emerald-400 text-xs">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
