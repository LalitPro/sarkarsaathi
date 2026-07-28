import React, { useState, useEffect } from 'react';
import { Search, Info, HelpCircle, CheckCircle2, AlertTriangle, ExternalLink, X, Landmark, Volume2, VolumeX, Mic } from 'lucide-react';
import { isDemographicallyEligible, detectMissingDocuments } from '../utils/filter';
import { useSpeech } from '../hooks/useSpeech';
import ListeningOverlay from './ListeningOverlay';
import { translate } from '../utils/translator';

const STATES = ["Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Gujarat", "Bihar", "Delhi", "Punjab"];

export default function Schemes({ schemes, profile, lang, searchParam }) {
  const [searchVal, setSearchVal] = useState(searchParam || '');
  const [govType, setGovType] = useState('All');
  const [selectedState, setSelectedState] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const { isListening, transcript, isSpeaking, speakText, stopSpeaking, startListening } = useSpeech(lang);

  const getSchemeName = (scheme) => {
    if (lang === 'hi') return scheme.name;
    if (lang === 'en') {
      const translated = translate(scheme.id + '_name', 'en', null);
      if (translated) return translated;
      if (scheme.id.includes('_scheme_')) {
        let name = scheme.name;
        const statesMap = {
          "Madhya Pradesh": "Madhya Pradesh", "Rajasthan": "Rajasthan", "Uttar Pradesh": "Uttar Pradesh",
          "Maharashtra": "Maharashtra", "Gujarat": "Gujarat", "Bihar": "Bihar", "Delhi": "Delhi", "Punjab": "Punjab"
        };
        const prefixMap = {
          "मुख्यमंत्री": "Chief Minister", "राज्य": "State", "आत्मनिर्भर": "Self-reliant",
          "विकास": "Development", "जनकल्याण": "Welfare", "सर्वजन": "Universal"
        };
        const suffixMap = {
          "कृषि आदान अनुदान": "Agriculture Input Subsidy", "फसल बीमा सहायता": "Crop Insurance Assistance",
          "किसान कल्याण योजना": "Farmer Welfare Scheme", "कृषि यंत्र सब्सिडी": "Agriculture Equipment Subsidy",
          "आयुष्मान राज्य स्वास्थ्य कार्ड": "Ayushman State Health Card", "निःशुल्क चिकित्सा सहायता": "Free Medical Assistance",
          "मातृत्व सुरक्षा प्रोत्साहन": "Maternity Protection Incentive", "गंभीर बीमारी सहायता योजना": "Critical Illness Aid Scheme",
          "उच्च शिक्षा छात्रवृत्ति": "Higher Education Scholarship", "कक्षा ९-१२ छात्रवृत्ति": "Class 9-12 Scholarship",
          "साइकिल प्रदाय योजना": "Cycle Distribution Scheme", "छात्रावास सहायता योजना": "Hostel Assistance Scheme",
          "युवा स्वरोजगार योजना": "Youth Self-Employment Scheme", "महिला उद्यमिता प्रोत्साहन": "Women Entrepreneurship Promotion",
          "कौशल विकास प्रशिक्षण": "Skill Development Training", "लघु उद्योग ऋण योजना": "Small Scale Industry Loan Scheme",
          "निःशुल्क यात्रा योजना": "Free Travel Scheme", "यात्री रियायत योजना": "Passenger Concession Scheme",
          "बस पास सहायता": "Bus Pass Assistance", "परिवहन छूट योजना": "Transport Discount Scheme"
        };
        Object.keys(statesMap).forEach(k => { name = name.replace(k, statesMap[k]); });
        Object.keys(prefixMap).forEach(k => { name = name.replace(k, prefixMap[k]); });
        Object.keys(suffixMap).forEach(k => { name = name.replace(k, suffixMap[k]); });
        return name;
      }
    }
    return scheme.name;
  };

  const getSchemeDesc = (scheme) => {
    if (lang === 'hi') return scheme.description;
    if (lang === 'en') {
      const translated = translate(scheme.id + '_desc', 'en', null);
      if (translated) return translated;
      if (scheme.id.includes('_scheme_')) {
        let desc = scheme.description;
        const descMap = {
          "सरकार द्वारा संचालित।": "Government Operated.",
          "किसानों को फसल नुकसान की भरपाई और कृषि उपकरण खरीदने के लिए वित्तीय सहायता प्रदान करना।": "Providing financial assistance to farmers for crop damage compensation and purchasing agricultural equipment.",
          "गरीब परिवारों को गंभीर बीमारियों के इलाज के लिए कैशलेस स्वास्थ्य बीमा और मुफ्त दवाएं प्रदान करना।": "Providing cashless health insurance and free medicines to poor families for the treatment of serious illnesses.",
          "आर्थिक रूप से कमजोर वर्ग और आरक्षित वर्ग के मेधावी छात्र-छात्राओं को शिक्षा जारी रखने के लिए वित्तीय प्रोत्साहन।": "Financial incentives for meritorious students from economically weaker sections and reserved categories to continue their education.",
          "बेरोजगार युवाओं और महिलाओं को खुद का व्यवसाय शुरू करने के लिए कम ब्याज दर पर ऋण और सब्सिडी।": "Low interest rate loans and subsidies for unemployed youth and women to start their own businesses.",
          "सार्वजनिक परिवहन buses और ट्रेनों में रियायती या पूर्णतः निःशुल्क यात्रा सुविधाएं प्रदान करना।": "Providing subsidized or completely free travel facilities in public transport buses and trains.",
          "सार्वजनिक परिवहन बसों और ट्रेनों में रियायती या पूर्णतः निःशुल्क यात्रा सुविधाएं प्रदान करना।": "Providing subsidized or completely free travel facilities in public transport buses and trains."
        };
        Object.keys(descMap).forEach(k => { desc = desc.replace(k, descMap[k]); });
        return desc;
      }
    }
    return scheme.description;
  };

  const getSchemeBenefits = (scheme) => {
    if (lang === 'hi') return scheme.benefits;
    if (lang === 'en') {
      const translated = translate(scheme.id + '_benefits', 'en', null);
      if (translated) return translated;
      if (scheme.id.includes('_scheme_')) {
        let benefits = scheme.benefits;
        const benefitsMap = {
          "प्रति हेक्टेयर की इनपुट सब्सिडी तथा यंत्रों पर 50% तक की छूट।": "input subsidy per hectare and up to 50% discount on machinery.",
          "प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस इलाज सरकारी और सूचीबद्ध निजी अस्पतालों में।": "Cashless treatment up to ₹5,00,000 per family per year in government and listed private hospitals.",
          "की छात्रवृत्ति और निःशुल्क साइकिल/किताबें।": "scholarship and free cycles/books.",
          "तक का बिना गारंटी का लोन और 25% तक की सब्सिडी।": "collateral-free loan and up to 25% subsidy.",
          "किराए में 50% से 100% तक की छूट और रियायती मासिक पास की सुविधा।": "50% to 100% discount on fare and subsidized monthly pass facility."
        };
        Object.keys(benefitsMap).forEach(k => { benefits = benefits.replace(k, benefitsMap[k]); });
        return benefits;
      }
    }
    return scheme.benefits;
  };��ा।": "Providing subsidized or completely free travel facilities in public transport buses and trains.",
        "सार्वजनिक परिवहन बसों और ट्रेनों में रियायती या पूर्णतः निःशुल्क यात्रा सुविधाएं प्रदान करना।": "Providing subsidized or completely free travel facilities in public transport buses and trains."
      };
      Object.keys(descMap).forEach(k => { desc = desc.replace(k, descMap[k]); });
      return desc;
    }
    return scheme.description;
  };

  const getSchemeBenefits = (scheme) => {
    if (lang === 'hi') return scheme.benefits;
    const translated = translate(scheme.id + '_benefits', lang, null);
    if (translated) return translated;
    if (scheme.id.includes('_scheme_')) {
      let benefits = scheme.benefits;
      const benefitsMap = {
        "प्रति हेक्टेयर की इनपुट सब्सिडी तथा यंत्रों पर 50% तक की छूट।": "input subsidy per hectare and up to 50% discount on machinery.",
        "प्रति परिवार प्रति वर्ष ₹5,00000 तक का कैशलेस इलाज सरकारी और सूचीबद्ध निजी अस्पतालों में।": "Cashless treatment up to ₹5,00,000 per family per year in government and listed private hospitals.",
        "की छात्रवृत्ति और निःशुल्क साइकिल/किताबें।": "scholarship and free cycles/books.",
        "तक का बिना गारंटी का लोन और 25% तक की सब्सिडी।": "collateral-free loan and up to 25% subsidy.",
        "किराए में 50% से 100% तक की छूट और रियायती मासिक पास की सुविधा।": "50% to 100% discount on fare and subsidized monthly pass facility."
      };
      Object.keys(benefitsMap).forEach(k => { benefits = benefits.replace(k, benefitsMap[k]); });
      return benefits;
    }
    return scheme.benefits;
  };

  useEffect(() => {
    if (searchParam) {
      setSearchVal(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    if (!selectedScheme) {
      stopSpeaking();
    }
  }, [selectedScheme]);

  const handleAudioListen = () => {
    if (!selectedScheme) return;
    const textToSpeak = lang === 'hi' 
      ? `${selectedScheme.name}। विवरण: ${selectedScheme.description}। लाभ: ${selectedScheme.benefits}` 
      : `${selectedScheme.name}. Description: ${selectedScheme.description}. Benefits: ${selectedScheme.benefits}`;
    speakText(textToSpeak);
  };

  const filteredSchemes = schemes.filter(scheme => {
    // 1. Text Search query
    const query = searchVal.toLowerCase();
    const nameHi = scheme.name.toLowerCase();
    const nameEn = getSchemeName(scheme).toLowerCase();
    const descHi = scheme.description.toLowerCase();
    const descEn = getSchemeDesc(scheme).toLowerCase();
    
    const matchesQuery = 
      nameHi.includes(query) ||
      nameEn.includes(query) ||
      descHi.includes(query) ||
      descEn.includes(query) ||
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
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 w-full md:w-80 gap-1.5 focus-within:ring-1 focus-within:ring-brand-primary">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400"
            placeholder={lang === 'hi' ? "योजना का नाम यहाँ खोजें..." : "Search scheme name here..."}
          />
          <button
            type="button"
            onClick={() => startListening((text) => setSearchVal(text))}
            className="text-slate-400 hover:text-brand-primary transition-colors p-0.5"
            title={lang === 'hi' ? "आवाज़ से खोजें" : "Voice Search"}
          >
            <Mic className="w-4 h-4" />
          </button>
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
                  {getSchemeName(scheme)}
                </h4>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {getSchemeDesc(scheme)}
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
              <div className="flex flex-col flex-grow mr-4">
                <span className="text-[9px] text-slate-400 font-bold uppercase">{selectedScheme.governmentType === 'Central' ? 'Central' : `State: ${selectedScheme.state}`}</span>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">{getSchemeName(selectedScheme)}</h3>
                  <button 
                    type="button"
                    onClick={handleAudioListen}
                    className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-650 dark:text-slate-200 transition-all shrink-0"
                    title={lang === 'hi' ? "विवरण सुनें" : "Listen details"}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-brand-primary dark:text-emerald-400" />}
                  </button>
                </div>
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
                  {getSchemeDesc(selectedScheme)}
                </p>
              </div>

              <div>
                <span className="block font-black text-slate-700 dark:text-slate-300 mb-1">{lang === 'hi' ? 'योजना के लाभ (Benefits):' : 'Benefits:'}</span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl">
                  {getSchemeBenefits(selectedScheme)}
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

      {/* Listening Voice Recognizer Overlay */}
      <ListeningOverlay 
        isOpen={isListening}
        onClose={() => {}}
        transcript={transcript}
        lang={lang}
      />

    </div>
  );
}
