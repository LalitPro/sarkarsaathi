import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, AlertCircle, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Problems({ problems, allDocuments, lang, searchParam }) {
  const [searchVal, setSearchVal] = useState(searchParam || '');
  const [openProblemId, setOpenProblemId] = useState(null);
  
  // Track checked state of checklists locally
  const [checklistState, setChecklistState] = useState({});

  useEffect(() => {
    if (searchParam) {
      setSearchVal(searchParam);
      // Automatically open the first matched problem
      const matched = problems.find(p => p.issue.toLowerCase().includes(searchParam.toLowerCase()));
      if (matched) setOpenProblemId(matched.id);
    }
  }, [searchParam, problems]);

  const filteredProblems = problems.filter(p => {
    const q = searchVal.toLowerCase();
    return (
      p.issue.toLowerCase().includes(q) ||
      p.possibleReason.toLowerCase().includes(q) ||
      p.targetId.toLowerCase().includes(q)
    );
  });

  const toggleProblem = (id) => {
    setOpenProblemId(openProblemId === id ? null : id);
  };

  const toggleChecklistItem = (probId, stepIdx) => {
    const key = `${probId}-${stepIdx}`;
    setChecklistState({
      ...checklistState,
      [key]: !checklistState[key]
    });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. FILTER HEADER BAR */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors">
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400"
            placeholder={lang === 'hi' ? "समस्या या त्रुटि खोजें (जैसे: नाम गलत, गुम गया...)" : "Search issue or error details here..."}
          />
        </div>
      </section>

      {/* 2. PROBLEMS ACCORDION LIST */}
      <div className="flex flex-col gap-4">
        {filteredProblems.map(p => {
          const isOpen = openProblemId === p.id;
          const relatedDoc = allDocuments.find(d => d.id === p.targetId);
          
          return (
            <div 
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors"
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => toggleProblem(p.id)}
                className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 pr-4">
                      {p.issue}
                    </span>
                    {relatedDoc && (
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        {lang === 'hi' ? 'सम्बन्धित दस्तावेज़' : 'Target Document'}: {relatedDoc.name.split(' (')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Accordion Expandable Content Workspace */}
              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/30 dark:bg-slate-800/10 flex flex-col gap-5 text-xs">
                  
                  {/* Cause & Fix Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'संभावित कारण (Reason)' : 'Potential Cause'}</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{p.possibleReason}</p>
                    </div>
                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl p-4 flex flex-col gap-1 border border-emerald-100 dark:border-emerald-900/20">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">{lang === 'hi' ? 'अनिवार्य समाधान (Fix)' : 'Required Resolution'}</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{p.requiredFix}</p>
                    </div>
                  </div>

                  {/* Official Guidance Text Box */}
                  <div>
                    <span className="block font-black text-slate-700 dark:text-slate-300 mb-1">{lang === 'hi' ? 'सरकारी दिशा-निर्देश (Official Guidance):' : 'Official Guidance:'}</span>
                    <p className="text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl leading-relaxed">
                      {p.officialGuidance}
                    </p>
                  </div>

                  {/* Action Steps Interactive Checklist */}
                  <div>
                    <span className="block font-black text-slate-700 dark:text-slate-300 mb-3">{lang === 'hi' ? 'अगले कदम - चेकलिस्ट (Resolution Steps Checklist):' : 'Resolution Steps Checklist:'}</span>
                    <div className="flex flex-col gap-2">
                      {p.nextSteps.map((step, idx) => {
                        const key = `${p.id}-${idx}`;
                        const checked = !!checklistState[key];
                        return (
                          <label 
                            key={idx}
                            onClick={() => toggleChecklistItem(p.id, idx)}
                            className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
                              checked 
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' 
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4 mt-0.5"
                            />
                            <span className={`text-xs ${checked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                              {step}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Required Documents checklist for fix */}
                  {p.requiredDocuments && p.requiredDocuments.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-500 mr-2">{lang === 'hi' ? 'सुधार के लिए आवश्यक दस्तावेज़:' : 'Required Documents for Fix'}:</span>
                      {p.requiredDocuments.map(docId => (
                        <span key={docId} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                          {docId.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
