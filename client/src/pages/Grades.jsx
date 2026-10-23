// client/src/pages/Grades.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function Grades() {
  const { user, updateProfile, t } = useAuth();
  const navigate = useNavigate();

  const selectGrade = async (g) => {
    if (user) {
      await updateProfile({ grade: g });
    }
    navigate(`/grades/${g}/topics`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-center">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curriculum Hub</span>
        </div>
        <h1 className="font-fredoka text-3xl sm:text-5xl font-bold text-slate-900">
          Choose Your Grade Level
        </h1>
        <p className="mt-2 text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
          Select Grade 5 or Grade 6 to unlock your curriculum, interactive infographics, and adaptive practice quests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8">
        
        {/* Grade 5 Card */}
        <div className="bg-white rounded-3xl border-3 border-indigo-200 hover:border-indigo-500 shadow-md hover:shadow-xl transition-all p-8 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🎒
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                Ages 10-11
              </span>
            </div>

            <h3 className="font-fredoka text-3xl font-bold text-slate-900 mb-2">
              Grade 5 Adventure
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Foundational concepts in parts of a whole, decimal place value, geometry angles, and area.
            </p>

            <div className="space-y-2.5">
              {[
                "🍕 Fractions (Parts of a whole, equivalent, adding)",
                "🪙 Decimals (Place value, money & number line)",
                "🔢 Factors and Multiples (HCF & LCM basics)",
                "📐 Basic Geometry (Angles, triangles, polygons)",
                "▦ Area and Perimeter (Rectangles & squares)",
              ].map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-select-grade-5"
            onClick={() => selectGrade(5)}
            className="mt-8 w-full py-3.5 rounded-2xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-fredoka font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Enter Grade 5 Adventure</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grade 6 Card */}
        <div className="bg-white rounded-3xl border-3 border-purple-200 hover:border-purple-500 shadow-md hover:shadow-xl transition-all p-8 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🚀
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                Ages 11-12
              </span>
            </div>

            <h3 className="font-fredoka text-3xl font-bold text-slate-900 mb-2">
              Grade 6 Adventure
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Master ratios, unitary methods, fraction multiplication/division, negative integers, and 3D volume.
            </p>

            <div className="space-y-2.5">
              {[
                "⚖️ Ratios and Proportions (Unitary method)",
                "➗ Fractions & Decimals (Multiply and divide)",
                "🌡️ Integers (Number line, negative values)",
                "⭕ Geometry (Angle pairs, circles, radius/diameter)",
                "📦 Area and Volume (Triangles & cuboid space)",
              ].map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-select-grade-6"
            onClick={() => selectGrade(6)}
            className="mt-8 w-full py-3.5 rounded-2xl bg-purple-600 group-hover:bg-purple-700 text-white font-fredoka font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Enter Grade 6 Adventure</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
