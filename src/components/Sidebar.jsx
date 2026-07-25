import React from 'react';
import { Home, Landmark, FileText, AlertTriangle, MessageSquare, Rocket, Lock, Info, X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar({ activeTab, onTabSwitch, sidebarOpen, onMenuClose, lang }) {
  const menuItems = [
    { id: 'dashboard', icon: Home, labelHi: 'होम डैशबोर्ड', labelEn: 'Home Dashboard' },
    { id: 'schemes', icon: Landmark, labelHi: 'योजना खोजें', labelEn: 'Schemes Finder' },
    { id: 'documents', icon: FileText, labelHi: 'दस्तावेज़ सहायक', labelEn: 'Document Sahayak' },
    { id: 'problems', icon: AlertTriangle, labelHi: 'समस्या समाधान', labelEn: 'Problem Solver' },
    { id: 'assistant', icon: MessageSquare, labelHi: 'AI सहायक', labelEn: 'AI Assistant' }
  ];

  const getLabel = (item) => (lang === 'hi' ? item.labelHi : item.labelEn);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 pt-6 px-4 transition-colors">
      <div className="flex flex-col gap-1.5 flex-grow">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabSwitch(item.id);
                if (onMenuClose) onMenuClose();
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left w-full ${
                isActive 
                  ? 'font-extrabold bg-brand-primaryLight dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400' 
                  : 'font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary dark:hover:text-emerald-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{getLabel(item)}</span>
              {item.id === 'assistant' && (
                <span className="ml-auto bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase">AI</span>
              )}
            </button>
          );
        })}
        
        <hr className="my-2 border-slate-100 dark:border-slate-800" />
        
        <a 
          href="https://black-coding-portfolio.netlify.app/" 
          target="_self"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-all"
        >
          <Info className="w-4 h-4" />
          <span>{lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</span>
        </a>
      </div>

      {/* Flag / Sansad Promotion Panel */}
      <div className="mt-auto mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/50 dark:to-slate-800/30 border border-emerald-100 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
        <span className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 z-10">
          {lang === 'hi' ? 'सबका साथ, सबका विकास' : 'Together with all, Development for all'}
        </span>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-3 z-10">
          {lang === 'hi' ? 'भारत सरकार की योजनाओं का सीधा लाभ उठाएं।' : 'Access government benefits directly and simply.'}
        </p>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Sansad_Bhavan_2023.jpg" 
          alt="Sansad Bhavan" 
          className="w-24 h-auto rounded-lg object-cover z-10 border border-white dark:border-slate-700" 
        />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl"></div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 fixed top-17.5 bottom-0 left-0 pt-6 px-4 z-30">
        {sidebarContent}
      </aside>

      {/* MOBILE OVERLAY DRAWER */}
      {sidebarOpen && (
        <div 
          onClick={onMenuClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[99] lg:hidden transition-opacity duration-300"
        />
      )}
      
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 z-[100] lg:hidden shadow-2xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="bg-gradient-to-r from-brand-primary to-brand-primaryDark p-6 text-white flex flex-col gap-2 relative">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Sarkar Saathi Logo" className="h-8 w-auto rounded" />
              <span className="font-extrabold text-base tracking-wide">Sarkar Saathi</span>
            </div>
            <button 
              onClick={onMenuClose}
              className="text-white hover:text-emerald-200 outline-none p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-emerald-200">
            {lang === 'hi' ? 'आपका स्मार्ट सरकार साथी' : 'Your Smart Government Guide'}
          </p>
        </div>
        
        <div className="h-[calc(100%-100px)] overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
