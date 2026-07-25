import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Schemes from './components/Schemes';
import Documents from './components/Documents';
import Problems from './components/Problems';
import Assistant from './components/Assistant';
import Admin from './components/Admin';
import { loadDatabase } from './utils/loader';
import { pullFromFirebase, getFirebaseConfig } from './utils/db';
import logo from './assets/logo.png';

export default function App() {
  // 1. Core Config states
  const [lang, setLang] = useState(() => localStorage.getItem('sarkar_saathi_lang') || 'hi');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('sarkar_saathi_theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // 2. Search & Link states
  const [searchParam, setSearchParam] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(null);

  // 3. User Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('sarkar_saathi_profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      state: '',
      age: '',
      gender: 'Male',
      category: 'General',
      occupation: 'Student',
      income: '',
      ruralUrban: 'Rural',
      disability: 'No',
      documents: []
    };
  });

  // 4. Unified Databases State
  const [db, setDb] = useState(() => loadDatabase());

  const handleReloadDatabase = () => {
    setDb(loadDatabase());
  };

  // Sync profile storage
  useEffect(() => {
    localStorage.setItem('sarkar_saathi_profile', JSON.stringify(profile));
  }, [profile]);

  // Sync language storage
  useEffect(() => {
    localStorage.setItem('sarkar_saathi_lang', lang);
  }, [lang]);

  // Sync dark theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sarkar_saathi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sarkar_saathi_theme', 'light');
    }
  }, [darkMode]);

  // Handle /admin route simulation
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
      setActiveTab('admin');
    }
  }, []);

  // Background auto-sync database from Firebase on mount
  useEffect(() => {
    const syncDb = async () => {
      const config = getFirebaseConfig();
      if (config && config.databaseURL) {
        const success = await pullFromFirebase();
        if (success) {
          handleReloadDatabase();
        }
      }
    };
    syncDb();
  }, []);

  useEffect(() => {
    if (activeTab === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else {
      if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  }, [activeTab]);

  const handleTopSearch = (query) => {
    setSearchParam(query);
    const docTerms = ["दस्तावेज", "दस्तावेज़", "आधार", "पैन", "वोटर", "राशन", "ड्राइविंग", "प्रमाण", "aadhaar", "pan", "document", "voter", "ration", "caste", "income", "domicile", "licence"];
    const probTerms = ["समस्या", "समाधान", "शिकायत", "सुधार", "त्रुटि", "गलती", "correction", "problem", "complaint", "error"];
    
    const isDoc = docTerms.some(term => query.toLowerCase().includes(term));
    const isProb = probTerms.some(term => query.toLowerCase().includes(term));

    if (isDoc) {
      setActiveTab('documents');
    } else if (isProb) {
      setActiveTab('problems');
    } else {
      setActiveTab('schemes');
    }
  };

  const handleDocSelect = (docId) => {
    setSelectedDocId(docId);
    setActiveTab('documents');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            profile={profile}
            onProfileUpdate={setProfile}
            schemes={db.schemes}
            allDocuments={db.documents}
            lang={lang}
            onTabSwitch={setActiveTab}
            onDocSelect={handleDocSelect}
          />
        );
      case 'schemes':
        return (
          <Schemes 
            schemes={db.schemes}
            profile={profile}
            lang={lang}
            searchParam={searchParam}
          />
        );
      case 'documents':
        return (
          <Documents 
            documents={db.documents}
            profile={profile}
            lang={lang}
            selectedDocId={selectedDocId}
          />
        );
      case 'problems':
        return (
          <Problems 
            problems={db.problems}
            allDocuments={db.documents}
            lang={lang}
            searchParam={searchParam}
          />
        );
      case 'assistant':
        return (
          <Assistant 
            schemes={db.schemes}
            documents={db.documents}
            problems={db.problems}
            profile={profile}
            lang={lang}
          />
        );
      case 'admin':
        return (
          <Admin 
            schemes={db.schemes}
            documents={db.documents}
            problems={db.problems}
            onDatabaseReload={handleReloadDatabase}
            lang={lang}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Dynamic Header Component */}
      <Header 
        onMenuToggle={() => setSidebarOpen(true)}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
        lang={lang}
        onLangToggle={() => setLang(lang === 'hi' ? 'en' : 'hi')}
        onSearch={handleTopSearch}
        profile={profile}
      />

      {/* Dynamic Sidebar Component */}
      <Sidebar 
        activeTab={activeTab}
        onTabSwitch={(tab) => {
          setActiveTab(tab);
          setSearchParam('');
          setSelectedDocId(null);
        }}
        sidebarOpen={sidebarOpen}
        onMenuClose={() => setSidebarOpen(false)}
        lang={lang}
      />

      {/* Main Workspace Frame container */}
      <main className="lg:pl-64 pt-20 min-h-screen flex flex-col justify-between">
        
        {/* Active Page View Component */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveView()}
        </div>

        {/* Global Unified Professional Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Logo block */}
              <div className="md:col-span-6 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <img src={logo} alt="Sarkar Saathi Logo" className="h-9 w-auto rounded-lg" />
                  <span className="text-white font-extrabold text-base tracking-wide">सरकार साथी (Sarkar Saathi)</span>
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  {lang === 'hi' 
                    ? 'सरकार साथी एक AI-संचालित सहायता मंच है जो सरकारी योजनाओं और दस्तावेज़ों को सरल भाषा में समझाता है।'
                    : 'Sarkar Saathi is an AI-powered guidance platform that simplifies government schemes and documentation for Indian citizens.'}
                </p>
              </div>

              {/* Navigation Links block */}
              <div className="md:col-span-3 flex flex-col gap-3">
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider">{lang === 'hi' ? 'त्वरित लिंक्स' : 'Quick Links'}</h4>
                <ul className="flex flex-col gap-2 text-xs">
                  <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors text-left">{lang === 'hi' ? 'होम डैशबोर्ड' : 'Dashboard'}</button></li>
                  <li><button onClick={() => setActiveTab('schemes')} className="hover:text-white transition-colors text-left">{lang === 'hi' ? 'योजना खोजें' : 'Schemes Finder'}</button></li>
                  <li><button onClick={() => setActiveTab('documents')} className="hover:text-white transition-colors text-left">{lang === 'hi' ? 'दस्तावेज़ सहायक' : 'Document Sahayak'}</button></li>
                  <li><button onClick={() => setActiveTab('problems')} className="hover:text-white transition-colors text-left">{lang === 'hi' ? 'समस्या समाधान' : 'Problem Solver'}</button></li>
                  <li><button onClick={() => setActiveTab('assistant')} className="hover:text-white transition-colors text-left">{lang === 'hi' ? 'AI सहायक' : 'AI Assistant'}</button></li>
                </ul>
              </div>

              {/* Contact Developer block */}
              <div className="md:col-span-3 flex flex-col gap-3">
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider">{lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</h4>
                <ul className="flex flex-col gap-2 text-xs">
                  <li>
                    <a 
                      href="https://black-coding-portfolio.netlify.app/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {lang === 'hi' ? 'नो योर डेवलपर्स (About Developers)' : 'About Developers'}
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Government Disclaimer */}
            <div className="text-[10px] text-slate-600 dark:text-slate-500 leading-normal border-t border-slate-800/80 pt-6">
              <strong>{lang === 'hi' ? 'अस्वीकरण (Disclaimer):' : 'Disclaimer:'}</strong>{' '}
              {lang === 'hi' 
                ? 'सरकार साथी (Sarkar Saathi) एक स्वतंत्र सहायता मंच है। इसका किसी भी सरकारी संगठन या आधिकारिक संस्थान से कोई सीधा संबंध नहीं है। पोर्टल की सभी जानकारी विभिन्न सार्वजनिक स्रोतों से ली गई है। आधिकारिक सूचना के लिए हमेशा सरकारी वेबसाइट देखें।'
                : 'Sarkar Saathi is an independent citizen assistance utility. It does not represent any government authority or agency. All information is collated from open data sources. For official guidelines, please consult direct government departments.'}
            </div>

            {/* Copyright and Hackathon Promo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600 dark:text-slate-500 border-t border-slate-850 pt-4">
              <span>&copy; 2026 Sarkar Saathi. {lang === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</span>
              <span className="font-extrabold text-slate-500 dark:text-slate-400">
                Built for **Build For Good 2026 Hackathon**
              </span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
