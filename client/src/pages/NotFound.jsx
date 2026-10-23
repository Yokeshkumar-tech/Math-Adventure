// client/src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-indigo-100 flex items-center justify-center text-4xl shadow-md">
        🧭
      </div>
      <h1 className="font-fredoka text-4xl font-bold text-slate-800">
        Adventure Path Not Found (404)
      </h1>
      <p className="text-sm text-slate-500 max-w-md font-medium">
        It looks like this math trail wandered off the map! Let's get you back on track to your dashboard.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-sm shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
