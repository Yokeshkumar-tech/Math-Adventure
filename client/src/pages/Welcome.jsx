// client/src/pages/Welcome.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, Trophy, Rocket, Compass, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Welcome() {
  const { guestLogin, user, t } = useAuth();
  const navigate = useNavigate();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Could not start guest mode. Please check connection.");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-amber-50/40">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs sm:text-sm font-bold mb-6 animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Interactive • Adaptive • AI-Powered Maths</span>
          </div>

          <h1 className="font-fredoka text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Turn Maths into an <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
              Epic Adventure!
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Designed specially for Grades 5 and 6 students. Master fractions, decimals, geometry, and ratios with pizza slices, adaptive quizzes, and your personal AI guide Professor Pi!
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {user ? (
              <Link
                id="btn-welcome-dashboard"
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka text-lg font-bold shadow-lg shadow-indigo-300 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Continue Adventure</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  id="btn-welcome-start"
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka text-lg font-bold shadow-lg shadow-indigo-300 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  <span>Start Adventure</span>
                </Link>

                <button
                  id="btn-welcome-guest"
                  onClick={handleGuest}
                  disabled={guestLoading}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-fredoka text-base font-bold shadow-md shadow-amber-200 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>{guestLoading ? "Preparing Demo..." : "Try as Guest (Instant Demo)"}</span>
                  <Sparkles className="w-4 h-4 text-slate-900" />
                </button>
              </>
            )}
          </div>

          <p className="mt-4 text-xs font-semibold text-slate-500">
            No credit card or email required • 100% child safe &amp; ad-free
          </p>
        </div>

        {/* Decorative Floating Blobs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl mb-4">
              🍕
            </div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 mb-2">
              Visual Infographics
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cut real pizzas into equal slices, track numbers on lively lines, and explore angles with programmatic SVG visuals.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 mb-2">
              Adaptive Quizzes
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              3 correct answers promote you to medium and hard! 2 mistakes gently adjust difficulty so you build confidence.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-4">
              🦉
            </div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 mb-2">
              AI Tutor Professor Pi
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A patient, friendly tutor ready to re-explain topics with short words, everyday examples, and cheerful hints.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-4">
              🏆
            </div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 mb-2">
              Gamified Rewards
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Earn XP points, unlock 5 adventure badges, maintain daily streaks, and watch confetti burst as you level up!
            </p>
          </div>

        </div>
      </section>

      {/* Grade Selector Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="font-fredoka text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Explore Grades 5 and 6 Curriculum
        </h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Aligned with NCERT / state standards, carefully designed to make mathematical concepts concrete and enjoyable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-3xl p-8 text-left shadow-xl relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-indigo-200 font-bold mb-1">
              Ages 10-11
            </div>
            <h3 className="font-fredoka text-3xl font-bold mb-4">Grade 5 Adventure</h3>
            <ul className="space-y-2 text-sm text-indigo-100 font-medium mb-6">
              <li className="flex items-center gap-2">✓ Fractions (Parts of a whole, like addition)</li>
              <li className="flex items-center gap-2">✓ Decimals (Tenths, hundredths &amp; money)</li>
              <li className="flex items-center gap-2">✓ Factors and Multiples (HCF &amp; LCM basics)</li>
              <li className="flex items-center gap-2">✓ Basic Geometry (Angles &amp; Triangles)</li>
              <li className="flex items-center gap-2">✓ Area and Perimeter (Rectangles &amp; Squares)</li>
            </ul>
            <Link
              to="/grades"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors"
            >
              <span>Explore Grade 5</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-3xl p-8 text-left shadow-xl relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-purple-200 font-bold mb-1">
              Ages 11-12
            </div>
            <h3 className="font-fredoka text-3xl font-bold mb-4">Grade 6 Adventure</h3>
            <ul className="space-y-2 text-sm text-purple-100 font-medium mb-6">
              <li className="flex items-center gap-2">✓ Ratios and Proportions (Unitary method)</li>
              <li className="flex items-center gap-2">✓ Advanced Fractions &amp; Decimals (Multiply &amp; Divide)</li>
              <li className="flex items-center gap-2">✓ Integers (Positive, negative &amp; number line)</li>
              <li className="flex items-center gap-2">✓ Geometry (Linear pairs &amp; Circles)</li>
              <li className="flex items-center gap-2">✓ Area and Volume (Triangles &amp; Cuboids)</li>
            </ul>
            <Link
              to="/grades"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-800 font-bold text-sm hover:bg-purple-50 transition-colors"
            >
              <span>Explore Grade 6</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© 2026 Math Adventure • Gamified Math Learning Platform for Grades 5 and 6</p>
        <p className="mt-1">Server Source of Truth • Deterministic Fallbacks • Pure Kid Safety</p>
      </footer>
    </div>
  );
}
