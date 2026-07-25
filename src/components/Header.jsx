import React, { useState } from 'react';
import { Search, Moon, Sun, Menu, Globe, User, Mic } from 'lucide-react';
import logo from '../assets/logo.png';
import { useSpeech } from '../hooks/useSpeech';
import ListeningOverlay from './ListeningOverlay';

export default function Header({ 
  onMenuToggle, 
  darkMode, 
  onThemeToggle, 
  lang, 
  onLangToggle,
  onSearch,
  profile
}) {
  const [searchVal, setSearchVal] = useState('');
  const { isListening, transcript, startListening } = useSpeech(lang);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  const handleVoiceSearchResult = (text) => {
    setSearchVal(text);
    if (onSearch) onSearch(text);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (lang === 'hi') {
      if (hours < 12) return 'शुभ प्रभात';
      if (hours < 17) return 'नमस्कार';
      return 'शुभ संध्या';
    } else {
      if (hours < 12) return 'Good Morning';
      if (hours < 17) return 'Good Afternoon';
      return 'Good Evening';
    }
  };

  return (
    <>
      {/* TOP TRICOLOR DECORATIVE BAR */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 fixed top-0 left-0 right-0 z-50"></div>

      {/* HEADER BAR */}
      <header className="header bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-1.5 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 transition-colors">
        {/* Left Side: Logo and Menu toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="p-2 lg:hidden text-slate-600 dark:text-slate-300 hover:text-brand-primary rounded-lg"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <img src={logo} alt="Sarkar Saathi Logo" className="h-10 w-auto rounded-lg" />
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-blue-900 dark:text-blue-100 leading-none">सरकार साथी</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold leading-tight">Sarkar Saathi</span>
              <span className="text-[8px] text-slate-400 font-semibold tracking-wider uppercase leading-none">Your AI Government Guide</span>
            </div>
          </div>
        </div>

        {/* Center: Search Box */}
        <form onSubmit={handleSubmit} className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 w-96 focus-within:ring-2 focus-within:ring-brand-primary transition-all gap-1.5">
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400" 
            placeholder={lang === 'hi' ? "यहाँ खोजें (योजना, दस्तावेज़, समस्याएँ...)" : "Search here (schemes, documents, issues...)"}
          />
          <button 
            type="button"
            onClick={() => startListening(handleVoiceSearchResult)}
            className="text-slate-400 hover:text-brand-primary transition-colors p-1"
            title={lang === 'hi' ? "आवाज़ से खोजें" : "Voice Search"}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button type="submit" className="text-slate-400 hover:text-brand-primary transition-colors p-1">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Side: Lang and Theme Toggles */}
        <div className="flex items-center gap-3">
          {/* Greeting / User Indicator */}
          {profile && profile.name && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{getGreeting()}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">{profile.name}</span>
            </div>
          )}

          {/* Language Toggle Button */}
          <button 
            onClick={onLangToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-brand-primary" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button 
            onClick={onThemeToggle}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Listening Voice Recognizer Overlay */}
      <ListeningOverlay 
        isOpen={isListening}
        onClose={() => handleVoiceSearchResult('')}
        transcript={transcript}
        lang={lang}
      />
    </>
  );
}
