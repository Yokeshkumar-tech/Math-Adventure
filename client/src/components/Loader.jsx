// client/src/components/Loader.jsx
import React from "react";

export default function Loader({ message = "Calculating adventures..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center text-white text-2xl font-bold font-fredoka shadow-lg shadow-indigo-200 animate-bounce-gentle">
          π
        </div>
      </div>
      <h3 className="font-fredoka text-xl font-bold text-slate-800 mb-1">
        {message}
      </h3>
      <p className="text-sm text-slate-500 font-medium">Getting numbers ready for you!</p>
    </div>
  );
}
