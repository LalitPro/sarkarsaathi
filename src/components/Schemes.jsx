import React, { useState, useEffect } from 'react';
import { Search, Info, HelpCircle, CheckCircle2, AlertTriangle, ExternalLink, X, Landmark } from 'lucide-react';
import { isDemographicallyEligible, detectMissingDocuments } from '../utils/filter';

const STATES = ["Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Gujarat", "Bihar", "Delhi", "Punjab"];

export default function Schemes({ schemes, profile, lang, searchParam }) {
  const [searchVal, setSearchVal] = useState(searchParam || '');
  const [govType, setGovType] = useState('All');
  const [selectedState, setSelectedState] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    if (searchParam) {
      setSearchVal(searchParam);
    }
  }, [searchParam]);

  const filteredSchemes = schemes.filter(scheme => {
    // 1. Text Search query
    const query = searchVal.toLowerCase();
    const matchesQuery = 
      scheme.name.toLowerCase().includes(query) ||
      scheme.description.toLowerCase().includes(query) ||
      scheme.id.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    // 2. Gov Type Filter
    if (govType !== 'All' && scheme.governmentType !== govType) return false;

    // 3. State Filter
    if (scheme.governmentType === 'State' && selectedState && scheme.state !== selectedState) return false;

    return true;
  });

  const getDocStatus = (scheme) => {
    const userDocs = profile.documents || [];
    return detectMissingDocuments(userDocs, scheme.requiredDocuments || []);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. FILTER CONTROLS BAR */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400"
            placeholder={lang === 'hi' ? "योजना का नाम यहाँ खोजें..." : "Search scheme name here..."}
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Government Type Filter */}
          <select
            value={govType}
            onChange={(e) => {
              setGovType(e.target.value);
              if (e.target.value === 'Central') setSelectedState('');
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="All">{lang === 'hi' ? 'सभी प्रकार (All Gov Types)' : 'All Gov Types'}</option>
            <option value="Central">{lang === 'hi' ? 'केंद्रीय सरकार (Central Gov)' : 'Central Gov'}</option>
            <option value="State">{lang === 'hi' ? 'राज्य सरकार (State Gov)' : 'State Gov'}</option>
          </select>

          {/* State Dropdown (visible if State or All selected) */}
          {govType !== 'Central' && (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="">-- {lang === 'hi' ? 'सभी राज्य चुनें' : 'Select State'} --</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </section>

      {/* 2. SCHEMES CARD LISTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map(scheme => {
          const isEligible = isDemographicallyEligible(profile, scheme);
          const docs = getDocStatus(scheme);
          const typeLabel = scheme.governmentType === 'Central' ? 'Central' : `State: ${scheme.state}`;
          
          return (
            <div 
              key={scheme.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                    scheme.governmentType === 'Central' 
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' 
                      : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {typeLabel}
                  </span>
                  
                  {isEligible ? (
                    docs.hasAll ? (
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{lang === 'hi' ? 'सीधे पात्र' : 'Direct Eligible'}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>{lang === 'hi' ? 'दस्तावेज़ बाकी' : 'Docs Missing'}</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[9px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-full uppercase">
                      {lang === 'hi' ? 'अपात्र' : 'Ineligible'}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1 leading-snug line-clamp-1">
                  {scheme.name}
                </h4>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'अनुमानित समय' : 'Estimated Time'}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{scheme.processingTime}</span>
                </div>
                <button 
                  onClick={() => setSelectedScheme(scheme)}
                  className="bg-brand-primaryLight dark:bg-emerald-950/40 hover:bg-brand-primary dark:hover:bg-brand-primary text-brand-primary dark:text-emerald-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all"
                >
                  {lang === 'hi' ? 'विवरण देखें' : 'View Details'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SCHEME DETAILS VIEW MODAL */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold uppercase">{selectedScheme.governmentType === 'Central' ? 'Central' : `State: ${selectedScheme.state}`}</span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">{selectedScheme.name}</h3>
              </div>
              <button 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl outline-none"
                onClick={() => setSelectedScheme(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-4 text-xs">
              <div>
                <span className="block font-black text-slate-700 dark:text-slate-300 mb-1">{lang === 'hi' ? 'विवरण (Description):' : 'Description:'}</span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl">
                  {selectedScheme.description}
                </p>
              </div>

              <div>
                <span className="block font-black text-slate-700 dark:text-slate-300 mb-1">{lang === 'hi' ? 'योजना के लाभ (Benefits):' : 'Benefits:'}</span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl">
                  {selectedScheme.benefits}
                </p>
              </div>

              <div>
                <span className="block font-black text-slate-700 dark:text-slate-300 mb-2">{lang === 'hi' ? 'आवश्यक दस्तावेज़ की स्थिति (Required Documents Status):' : 'Required Documents Status:'}</span>
                <div className="flex flex-col gap-2">
                  {(selectedScheme.requiredDocuments || []).map(docId => {
                    const owned = (profile.documents || []).includes(docId);
                    return (
                      <div 
                        key={docId}
                        className={`flex items-center justify-between border rounded-xl p-2.5 ${
                          owned 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' 
                            : 'bg-red-50/40 dark:bg-red-950/20 border-red-100 dark:border-red-900/40'
                        }`}
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{docId.replace('_', ' ')}</span>
                        {owned ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{lang === 'hi' ? 'उपलब्ध' : 'Available'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{lang === 'hi' ? 'अपूर्ण (बनवाएं)' : 'Missing'}</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'समय सीमा (Time Limit)' : 'Processing Time'}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedScheme.processingTime}</span>
              </div>
              <a 
                href={selectedScheme.officialWebsite} 
                target="_blank" 
                rel="noreferrer"
                className="bg-brand-primary hover:bg-brand-primaryDark text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>{lang === 'hi' ? 'आधिकारिक पोर्टल खोलें' : 'Apply Online'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
