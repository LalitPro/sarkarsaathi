import React from 'react';
import { User, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, HelpCircle, Rocket } from 'lucide-react';
import { getBoostedEligibility } from '../utils/filter';

const STATES = ["Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Gujarat", "Bihar", "Delhi", "Punjab"];
const OCCUPATIONS = ["Farmer", "Student", "Senior Citizen", "Unemployed", "Business Owner", "Other"];
const CATEGORIES = ["General", "OBC", "SC", "ST"];

export default function Dashboard({ 
  profile, 
  onProfileUpdate, 
  schemes, 
  allDocuments, 
  lang,
  onTabSwitch,
  onDocSelect
}) {
  
  // Demo Personas definitions
  const PERSONAS = [
    {
      id: "pers-rural-farmer",
      name: lang === 'hi' ? "राजेश कुमार (किसान)" : "Rajesh Kumar (Farmer)",
      profile: {
        name: "Rajesh Kumar",
        state: "Madhya Pradesh",
        age: "45",
        gender: "Male",
        category: "OBC",
        occupation: "Farmer",
        income: "80000",
        ruralUrban: "Rural",
        disability: "No",
        documents: ["aadhaar", "pan", "bank_passbook"]
      }
    },
    {
      id: "pers-urban-student",
      name: lang === 'hi' ? "आरती शर्मा (छात्रा)" : "Aarti Sharma (Student)",
      profile: {
        name: "Aarti Sharma",
        state: "Rajasthan",
        age: "19",
        gender: "Female",
        category: "General",
        occupation: "Student",
        income: "180000",
        ruralUrban: "Urban",
        disability: "No",
        documents: ["aadhaar", "pan"]
      }
    },
    {
      id: "pers-disabled-citizen",
      name: lang === 'hi' ? "सुनील वर्मा (वरिष्ठ नागरिक)" : "Sunil Verma (Senior Citizen)",
      profile: {
        name: "Sunil Verma",
        state: "Madhya Pradesh",
        age: "68",
        gender: "Male",
        category: "SC",
        occupation: "Senior Citizen",
        income: "110000",
        ruralUrban: "Rural",
        disability: "Yes",
        documents: ["aadhaar", "bank_passbook"]
      }
    }
  ];

  const handlePersonaSelect = (pers) => {
    onProfileUpdate(pers.profile);
  };

  const handleInputChange = (field, val) => {
    onProfileUpdate({ ...profile, [field]: val });
  };

  const toggleDocument = (docId) => {
    const docs = profile.documents || [];
    let updatedDocs;
    if (docs.includes(docId)) {
      updatedDocs = docs.filter(d => d !== docId);
    } else {
      updatedDocs = [...docs, docId];
    }
    handleInputChange('documents', updatedDocs);
  };

  // Run eligibility checks
  const booster = getBoostedEligibility(profile, schemes, profile.documents || []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. HACKATHON PERSONA SWAPPER */}
      <section className="bg-blue-50/50 dark:bg-slate-800/40 border border-blue-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-colors">
        <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-sm mb-1.5 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-500" />
          <span>{lang === 'hi' ? 'डेमो प्रोफ़ाइल स्विचर (Demo Profile Switcher)' : 'Demo Profile Switcher'}</span>
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
          {lang === 'hi' 
            ? 'विभिन्न पात्रता मापदंडों और दस्तावेज़ स्थितियों को तुरंत बदलने के लिए एक प्रोफाइल चुनें:' 
            : 'Select a profile to instantly test eligibility parameters and document statuses:'}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePersonaSelect(p)}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
            >
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Currently Eligible */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 rounded-3xl p-6 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            {lang === 'hi' ? 'सीधे पात्र योजनाएँ' : 'Direct Eligible Schemes'}
          </span>
          <span className="text-3xl font-black text-emerald-800 dark:text-emerald-300">
            {booster.currentlyEligible.length}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {lang === 'hi' 
              ? 'आप इन योजनाओं के लिए सभी दस्तावेज़ पात्रता रखते हैं।' 
              : 'You possess all required documents for these schemes.'}
          </p>
        </div>

        {/* Card 2: Unlockable Booster */}
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/60 rounded-3xl p-6 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">
            {lang === 'hi' ? 'पात्रता बूस्टर (अनलॉक योग्य)' : 'Unlockable Schemes'}
          </span>
          <span className="text-3xl font-black text-orange-800 dark:text-orange-300">
            {booster.boosterSchemes.length}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {lang === 'hi' 
              ? 'दस्तावेज़ पूर्ण करने पर खुली जाने वाली योजनाएँ।' 
              : 'Schemes you can unlock by obtaining missing documents.'}
          </p>
        </div>

        {/* Card 3: Owned Documents */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/60 rounded-3xl p-6 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            {lang === 'hi' ? 'आपके दस्तावेज़' : 'Your Documents'}
          </span>
          <span className="text-3xl font-black text-blue-800 dark:text-blue-300">
            {(profile.documents || []).length} / {allDocuments.length}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {lang === 'hi' 
              ? 'प्रक्रिया को और तेज करने के लिए अतिरिक्त दस्तावेज़ टिक करें।' 
              : 'Check additional documents below to calculate more schemes.'}
          </p>
        </div>
      </div>

      {/* 3. PROFILE EDITOR & DOCUMENTS SELECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Demographic Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 transition-colors">
          <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            {lang === 'hi' ? '१. अपनी सामाजिक-आर्थिक स्थिति दर्ज करें' : '1. Enter Socio-Economic Credentials'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'नाम (Name)' : 'Name'}:</label>
              <input 
                type="text" 
                value={profile.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'राज्य (State)' : 'State'}:</label>
              <select
                value={profile.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="">-- {lang === 'hi' ? 'राज्य चुनें' : 'Select State'} --</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'आयु (Age)' : 'Age'}:</label>
              <input 
                type="number" 
                value={profile.age || ''} 
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'लिंग (Gender)' : 'Gender'}:</label>
              <select
                value={profile.gender || 'Male'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="Male">{lang === 'hi' ? 'पुरुष (Male)' : 'Male'}</option>
                <option value="Female">{lang === 'hi' ? 'महिला (Female)' : 'Female'}</option>
                <option value="Other">{lang === 'hi' ? 'अन्य (Other)' : 'Other'}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'वर्ग (Category)' : 'Category'}:</label>
              <select
                value={profile.category || 'General'}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'व्यवसाय (Occupation)' : 'Occupation'}:</label>
              <select
                value={profile.occupation || 'Student'}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              >
                {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'वार्षिक आय (Annual Income)' : 'Annual Income'} (₹):</label>
              <input 
                type="number" 
                value={profile.income || ''} 
                onChange={(e) => handleInputChange('income', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{lang === 'hi' ? 'क्षेत्र (Area)' : 'Area'}:</label>
              <select
                value={profile.ruralUrban || 'Rural'}
                onChange={(e) => handleInputChange('ruralUrban', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="Rural">{lang === 'hi' ? 'ग्रामीण (Rural)' : 'Rural'}</option>
                <option value="Urban">{lang === 'hi' ? 'शहरी (Urban)' : 'Urban'}</option>
                <option value="Both">{lang === 'hi' ? 'दोनों (Both)' : 'Both'}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="disability-chk"
              checked={profile.disability === 'Yes'} 
              onChange={(e) => handleInputChange('disability', e.target.checked ? 'Yes' : 'No')}
              className="rounded text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="disability-chk" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              {lang === 'hi' ? 'मैं दिव्यांग श्रेणी (Differently-abled) में आता हूँ' : 'I belong to differently-abled category'}
            </label>
          </div>
        </div>

        {/* Right Side: Documents Selector */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4 transition-colors">
          <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            {lang === 'hi' ? '२. आपके पास जो दस्तावेज़ हैं उन पर टिक करें' : '2. Tick Documents You Currently Own'}
          </h3>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-2">
            {allDocuments.map(doc => {
              const docs = profile.documents || [];
              const owned = docs.includes(doc.id);
              return (
                <label 
                  key={doc.id}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
                    owned 
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={owned}
                    onChange={() => toggleDocument(doc.id)}
                    className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{doc.type}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. ELIGIBILITY BOOSTER RECOMMENDATIONS SECTION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
        <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-base border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-orange-500" />
          <span>{lang === 'hi' ? 'स्मार्ट पात्रता बूस्टर (Eligibility Booster)' : 'Smart Eligibility Booster'}</span>
        </h3>
        
        {Object.keys(booster.missingDocMap).length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {lang === 'hi' 
              ? 'बधाई हो! आपके पास सभी आवश्यक दस्तावेज़ हैं या आप वर्तमान में कोई अन्य योजना अनलॉक नहीं कर सकते।' 
              : 'All done! You have all eligible documents or no unlockable schemes left.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(booster.missingDocMap).map(docId => {
              const doc = allDocuments.find(d => d.id === docId);
              const count = booster.missingDocMap[docId].length;
              if (!doc) return null;
              return (
                <div 
                  key={docId}
                  className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        {lang === 'hi' ? 'अनलॉक करें' : 'Unlock Booster'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{doc.type}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">
                      {doc.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'hi' 
                        ? `इस दस्तावेज़ को बनवाकर आप ${count} नई सरकारी योजनाओं के लिए पात्र बन जाएंगे!`
                        : `Obtaining this document will unlock eligibility for ${count} new government schemes!`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {booster.missingDocMap[docId].slice(0, 2).map(s => (
                        <span key={s.id} className="text-[9px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {s.name.split(' (')[0]}
                        </span>
                      ))}
                      {count > 2 && (
                        <span className="text-[9px] font-black text-brand-primary dark:text-emerald-400 mt-0.5">
                          + {count - 2} {lang === 'hi' ? 'अन्य' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onDocSelect(docId)}
                      className="bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>{lang === 'hi' ? 'बनाने की प्रक्रिया' : 'Apply Guide'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
