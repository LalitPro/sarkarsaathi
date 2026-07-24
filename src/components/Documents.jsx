import React, { useState, useEffect } from 'react';
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, ClipboardList } from 'lucide-react';
import { detectMissingDocuments } from '../utils/filter';

export default function Documents({ documents, profile, lang, selectedDocId }) {
  const [activeDoc, setActiveDoc] = useState(documents[0]);
  const [actionMode, setActionMode] = useState('new'); // 'new' | 'update' | 'download'

  useEffect(() => {
    if (selectedDocId) {
      const found = documents.find(d => d.id === selectedDocId);
      if (found) {
        setActiveDoc(found);
      }
    }
  }, [selectedDocId, documents]);

  if (!activeDoc) return null;

  // Run dependency analysis
  const docs = profile.documents || [];
  const dependencyStatus = detectMissingDocuments(docs, activeDoc.dependencies || []);

  const currentActionDetails = activeDoc.actions[actionMode] || activeDoc.actions['new'] || {
    requiredDocuments: [],
    fees: '₹50',
    estimatedTime: '15 दिन',
    whereToApply: 'CSC Center',
    officialWebsite: 'https://serviceonline.gov.in',
    stepByStepGuide: ['पात्रता जांचें', 'दस्तावेज अपलोड करें', 'शुल्क का भुगतान करें'],
    importantNotes: ['सभी मूल दस्तावेज साथ रखें।']
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. LEFT COLUMN: DOCUMENTS SELECTION LIST */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4 max-h-[80vh] overflow-y-auto transition-colors">
        <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
          {lang === 'hi' ? 'दस्तावेज़ों की सूची (Documents)' : 'Documents List'}
        </h3>
        <div className="flex flex-col gap-2">
          {documents.map(d => {
            const isActive = activeDoc.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setActiveDoc(d);
                  setActionMode('new');
                }}
                className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer text-left transition-all ${
                  isActive 
                    ? 'bg-brand-primaryLight dark:bg-emerald-950/40 border-brand-primary dark:border-emerald-900/60' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                }`}
              >
                <FileText className={`w-4 h-4 ${isActive ? 'text-brand-primary dark:text-emerald-400' : 'text-slate-400'}`} />
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${isActive ? 'text-brand-primary dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {d.name.split(' (')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{d.type}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: DETAILS WORKSPACE */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Active Doc Description Header */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-3 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {activeDoc.name}
            </h2>
            <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full uppercase">
              {activeDoc.type}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeDoc.description}
          </p>
        </section>

        {/* Action Mode Tabs & Core Details */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 transition-colors">
          
          {/* Action Tabs Selector */}
          <div className="flex bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 gap-1">
            {['new', 'update', 'download'].map(mode => {
              // Check if mode details exist in config
              if (!activeDoc.actions[mode]) return null;
              
              const modeLabel = {
                new: lang === 'hi' ? 'नया दस्तावेज़ (New)' : 'New Application',
                update: lang === 'hi' ? 'सुधार / अपडेट' : 'Update/Correction',
                download: lang === 'hi' ? 'डाउनलोड (Get Copy)' : 'Download'
              }[mode];

              return (
                <button
                  key={mode}
                  onClick={() => setActionMode(mode)}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                    actionMode === mode 
                      ? 'bg-white dark:bg-slate-700 text-brand-primary dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {modeLabel}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics (Fees, Time, Location) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'अनुमानित शुल्क (Fees)' : 'Estimated Fees'}</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{currentActionDetails.fees}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'अनुमानित समय सीमा' : 'Time Limit'}</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{currentActionDetails.estimatedTime}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'कहाँ आवेदन करें' : 'Where to Apply'}</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{currentActionDetails.whereToApply}</span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-brand-primary" />
              <span>{lang === 'hi' ? 'आवेदन की चरण-दर-चरण प्रक्रिया' : 'Step-by-Step Instructions'}</span>
            </h4>
            <div className="flex flex-col gap-3.5 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
              {currentActionDetails.stepByStepGuide.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center text-[9px] font-black">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-2 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dependency check alerts */}
          {activeDoc.dependencies && activeDoc.dependencies.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <span>{lang === 'hi' ? 'सम्बन्धित सहायक दस्तावेज़ (Dependencies):' : 'Required Supporting Documents:'}</span>
              </h4>
              <div className="flex flex-col gap-2">
                {activeDoc.dependencies.map(depId => {
                  const owned = docs.includes(depId);
                  return (
                    <div 
                      key={depId}
                      className={`flex items-center justify-between border rounded-xl p-2.5 ${
                        owned 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' 
                          : 'bg-red-50/40 dark:bg-red-950/20 border-red-100 dark:border-red-900/40'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{depId.replace('_', ' ')}</span>
                      {owned ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'hi' ? 'उपलब्ध' : 'Available'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{lang === 'hi' ? 'लागू नहीं (अपूर्ण)' : 'Missing'}</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes and Apply Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="text-left w-full sm:w-auto">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'महत्वपूर्ण' : 'Important Note'}</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {currentActionDetails.importantNotes ? currentActionDetails.importantNotes[0] : ''}
              </p>
            </div>
            {currentActionDetails.officialWebsite && (
              <a 
                href={currentActionDetails.officialWebsite} 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primaryDark text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>{lang === 'hi' ? 'आधिकारिक पोर्टल खोलें' : 'Official Portal'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

        </section>

      </div>

    </div>
  );
}
