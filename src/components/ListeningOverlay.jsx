import React from 'react';
import { Mic, X } from 'lucide-react';

export default function ListeningOverlay({ isOpen, onClose, transcript, lang }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex flex-col items-center justify-center text-white p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl relative text-slate-800 dark:text-white text-center transition-colors">
        
        {/* Pulse Microphones */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-brand-primary/20 dark:bg-emerald-500/20 animate-ping"></div>
          <div className="absolute w-16 h-16 rounded-full bg-brand-primary/40 dark:bg-emerald-500/40 animate-pulse"></div>
          <div className="relative w-12 h-12 rounded-full bg-brand-primary dark:bg-emerald-500 flex items-center justify-center text-white">
            <Mic className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-extrabold mb-1">
            {lang === 'hi' ? 'कृपया बोलें (Speak Now)' : 'Speak Now'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {lang === 'hi' ? 'हम सुन रहे हैं...' : 'Listening...'}
          </p>
        </div>

        {/* Live Transcript Preview */}
        <div className="text-sm font-bold text-brand-primary dark:text-emerald-400 min-h-[2.5rem] px-4 max-w-xs break-words">
          {transcript || '...'}
        </div>

        <button 
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline focus:outline-none flex items-center gap-1"
        >
          <span>{lang === 'hi' ? 'रद्द करें' : 'Cancel'}</span>
        </button>

      </div>
    </div>
  );
}
