import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, AlertCircle, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { translate } from '../utils/translator';

export default function Problems({ problems, allDocuments, lang, searchParam }) {
  const [searchVal, setSearchVal] = useState(searchParam || '');
  const [openProblemId, setOpenProblemId] = useState(null);
  
  // Track checked state of checklists locally
  const [checklistState, setChecklistState] = useState({});

  const getProblemIssue = (prob) => {
    if (lang === 'hi') return prob.issue;
    return translate(prob.id + '_issue', lang, prob.issue);
  };

  const getProblemReason = (prob) => {
    if (lang === 'hi') return prob.possibleReason;
    return translate(prob.id + '_reason', lang, prob.possibleReason);
  };

  const getProblemFix = (prob) => {
    if (lang === 'hi') return prob.requiredFix;
    return translate(prob.id + '_fix', lang, prob.requiredFix);
  };

  const getProblemGuidance = (prob) => {
    if (lang === 'hi') return prob.officialGuidance;
    return translate(prob.id + '_guidance', lang, prob.officialGuidance);
  };

  useEffect(() => {
    if (searchParam) {
      setSearchVal(searchParam);
      // Automatically open the first matched problem
      const matched = problems.find(p => p.issue.toLowerCase().includes(searchParam.toLowerCase()) || getProblemIssue(p).toLowerCase().includes(searchParam.toLowerCase()));
      if (matched) setOpenProblemId(matched.id);
    }
  }, [searchParam, problems]);

  const filteredProblems = problems.filter(p => {
    const q = searchVal.toLowerCase();
    const issueHi = p.issue.toLowerCase();
    const issueEn = getProblemIssue(p).toLowerCase();
    const reasonHi = p.possibleReason.toLowerCase();
    const reasonEn = getProblemReason(p).toLowerCase();
    return (
      issueHi.includes(q) ||
      issueEn.includes(q) ||
      reasonHi.includes(q) ||
      reasonEn.includes(q) ||
      p.targetId.toLowerCase().includes(q)
    );
  });

  const getProblemSteps = (prob) => {
    if (lang === 'hi') return prob.nextSteps;
    const stepTranslationMap = {
      'सहायक दस्तावेजों (PAN कार्ड/मार्कशीट) को स्कैन करें।': 'Scan supporting documents (PAN Card / Marksheet).',
      'यूआईडीएआई (UIDAI) के आधिकारिक पोर्टल (myaadhaar.uidai.gov.in) पर जाएं।': 'Go to UIDAI official portal (myaadhaar.uidai.gov.in).',
      "लॉगिन करके 'Name/Gender/Date of Birth Update' सेवा चुनें।": "Login and select 'Name/Gender/Date of Birth Update' service.",
      'सही नाम दर्ज करें और सहायक दस्तावेज अपलोड करें।': 'Enter correct spelling and upload supporting documents.',
      '₹50 के ऑनलाइन शुल्क का भुगतान करें।': 'Pay online update fee of ₹50.',
      'अपडेट रिक्वेस्ट नंबर (URN) नोट करें। 5 से 7 दिनों में नया कार्ड डाउनलोड करें।': 'Note the Update Request Number (URN). Download updated card in 5-7 days.',
      'अपने बैंक पासबुक की प्रथम पृष्ठ की फोटोकॉपी करवाएं।': 'Get photocopy of bank passbook first page.',
      'बैंक शाखा प्रबंधक को एक प्रार्थना पत्र (Application) लिखें, जिसमें नाम सुधार का अनुरोध हो।': 'Write a request application to branch manager for name correction.',
      'प्रार्थना पत्र के साथ अपना आधार कार्ड और पैन कार्ड संलग्न करें।': 'Attach Aadhaar Card and PAN Card with application.',
      'शाखा में जाकर ई-केवाईसी (e-KYC) अंगूठे के निशान या ओटीपी द्वारा करवाएं।': 'Complete e-KYC verification using fingerprint or OTP at branch.',
      'सत्यापन के बाद 48-72 घंटों में बैंक डेटा में नाम अपडेट हो जाएगा।': 'Name will be updated in bank records within 48-72 hours post verification.',
      'आयकर विभाग की ई-फाइलिंग वेबसाइट (incometax.gov.in) खोलें।': 'Open Income Tax e-filing website (incometax.gov.in).',
      "त्वरित लिंक्स अनुभाग में 'Link Aadhaar' विकल्प चुनें।": "Select 'Link Aadhaar' option in Quick Links section.",
      'अपना पैन और आधार नंबर दर्ज करें।': 'Enter your PAN and Aadhaar number.',
      'पेमेंट पोर्टल पर जाकर धारा 234H के तहत ₹1,000 के चालान का भुगतान करें।': 'Pay ₹1,000 late fee challan under Section 234H on payment portal.',
      'भुगतान के 4-5 दिनों बाद दोबारा वेबसाइट पर जाकर लिंकिंग सबमिट करें।': 'Re-visit website after 4-5 days of payment and submit link request.',
      'स्टेटस चेक करने पर आपको लिंकिंग सफल होने का संदेश दिखेगा।': 'Status check will display successful linking message.',
      "राज्य के खाद्य आपूर्ति विभाग (PDS Portal) की वेबसाइट पर जाएं।": 'Visit state Food and Civil Supplies (PDS Portal) website.',
      "नया सदस्य जोड़ने का विकल्प ('Add New Member') चुनें।": "Select 'Add New Member' option.",
      'सदस्य का आधार कार्ड और जन्म प्रमाण पत्र (या विवाह प्रमाण पत्र) की स्कैन कॉपी रखें।': 'Keep scanned copy of member Aadhaar card and birth/marriage certificate.',
      'फॉर्म में मांगी गई सभी व्यक्तिगत जानकारी और मुखिया से संबंध दर्ज करें।': 'Fill personal details and relationship with family head in form.',
      'दस्तावेज अपलोड करें और आवेदन सबमिट करें।': 'Upload documents and submit application.',
      'क्षेत्र के आपूर्ति अधिकारी द्वारा सत्यापन के बाद सदस्य का नाम राशन कार्ड में जोड़ दिया जाएगा।': 'Member name will be added after verification by area food inspector.',
      'समग्र सामाजिक सुरक्षा मिशन (samagra.gov.in) पोर्टल खोलें।': 'Open Samagra Portal (samagra.gov.in).',
      "होमपेज पर 'e-KYC करें' लिंक पर क्लिक करें।": "Click on 'Perform e-KYC' link on homepage.",
      'अपनी 9 अंकों की समग्र यूनिक आईडी (Samagra ID) दर्ज करें।': 'Enter 9-digit Samagra Member ID.',
      'आधार नंबर दर्ज करें और आधार से लिंक मोबाइल पर ओटीपी (OTP) प्राप्त करें।': 'Enter Aadhaar number and request OTP on registered mobile.',
      'ओटीपी सबमिट करके विवरण सत्यापित करें।': 'Submit OTP to verify details.',
      'यदि विवरण सही हैं, तो स्वीकृति दें। 24 से 48 घंटे में आपका ई-केवाईसी पूरा हो जाएगा।': 'Confirm details. e-KYC will be updated within 24-48 hours.',
      'राष्ट्रीय मतदाता सेवा पोर्टल (voters.eci.gov.in) पर पंजीकरण/लॉगिन करें।': 'Register/Login on Voters Service Portal (voters.eci.gov.in).',
      "पते के स्थानांतरण के लिए 'Form 8' भरें।": "Fill 'Form 8' for shifting of residence.",
      'नया पता दर्ज करें और सहायक दस्तावेज (मूल निवासी/बिजली बिल/किरायानामा) अपलोड करें।': 'Enter new address and upload proof (domicile/electricity bill/rent deed).',
      'आवेदन सबमिट करने पर आपको एक संदर्भ संख्या (Reference ID) मिलेगी।': 'Note the reference ID received upon application submission.',
      '10 से 15 दिनों में बीएलओ (BLO) सत्यापन के बाद पता बदल जाएगा और नया कार्ड भेजा जाएगा।': 'BLO will verify and send new Voter Card in 10-15 days.',
      'स्थानीय पुलिस स्टेशन के पोर्टल पर ऑनलाइन एफआईआर (Lost Article Report) दर्ज करें और कॉपी डाउनलोड करें।': 'File online lost report on police portal and download copy.',
      "सारथी परिवहन पोर्टल खोलें और 'Apply for Duplicate DL' सेवा चुनें।": "Open Sarathi Parivahan portal and select 'Apply for Duplicate DL' service.",
      'अपना डीएल नंबर और जन्मतिथि दर्ज करें।': 'Enter your DL number and Date of Birth.',
      'आवेदन पत्र भरें, एफआईआर और आधार कार्ड अपलोड करें।': 'Fill form and upload RTO application with lost report and Aadhaar.',
      'निर्धारित डुप्लीकेट डीएल शुल्क (लगभग ₹200-₹400) का भुगतान करें।': 'Pay duplicate DL fee (approx ₹200-400).',
      'आवेदन स्वीकृत होने पर नया लाइसेंस डाक से भेजा जाएगा।': 'Duplicate DL will be delivered by speed post after approval.',
      'चेक करें कि आपका किसी भी पुराने लोन या क्रेडिट कार्ड पर भुगतान बकाया तो नहीं है।': 'Verify that you have no pending defaults on credit cards or old loans.',
      'एक पेशेवर व्यावसायिक प्रोजेक्ट रिपोर्ट (Project Report) तैयार करवाएं जिसमें आय-व्यय का विवरण हो।': 'Prepare a detailed business project report showing cash flows and utility.',
      'जनसमर्थ पोर्टल (janasamarth.in) पर जाकर मुद्रा योजना के अंतर्गत ऑनलाइन आवेदन करें।': 'Apply online under Mudra Scheme on Jan Samarth portal (janasamarth.in).',
      'यदि बैंक अधिकारी बिना ठोस कारण के मना करे, तो बैंक के नोडल अधिकारी या जिला उद्योग केंद्र (DIC) में शिकायत करें।': 'If bank rejects without reason, file complaint with Bank Nodal Officer or DIC.',
      'UDID पोर्टल (swavlambancard.gov.in) पर पंजीकरण कर यूनिक विकलांगता पहचान पत्र प्राप्त करें।': 'Register on UDID portal to obtain Unique Disability Identity Card.',
      "किसी सरकारी अस्पताल के अधिकृत चिकित्सक से 'रेलवे रियायत प्रमाण पत्र' (Railway Concession Certificate) फॉर्म पर हस्ताक्षर करवाएं।": "Get Railway Concession Certificate signed by authorized government doctor.",
      'नजदीकी मंडल रेल प्रबंधक (DRM) कार्यालय के वाणिज्यिक विभाग (Commercial Branch) में जाकर रियायत कार्ड के लिए आवेदन करें।': 'Apply for photo ID card at Commercial Branch of nearest DRM Office.',
      "सत्यापन के बाद आपको एक फोटोयुक्त 'रेलवे रियायत फोटो पहचान पत्र' (Railway Concession Photo Card) जारी किया जाएगा, जिससे आप ऑनलाइन टिकट बुक करते समय भी रियायत पा सकेंगे।": 'Receive concessional photo card to book discounted tickets online.'
    };
    return prob.nextSteps.map(step => stepTranslationMap[step] || step);
  };

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
                      {getProblemIssue(p)}
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
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{getProblemReason(p)}</p>
                    </div>
                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl p-4 flex flex-col gap-1 border border-emerald-100 dark:border-emerald-900/20">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">{lang === 'hi' ? 'अनिवार्य समाधान (Fix)' : 'Required Resolution'}</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{getProblemFix(p)}</p>
                    </div>
                  </div>

                  {/* Official Guidance Text Box */}
                  <div>
                    <span className="block font-black text-slate-700 dark:text-slate-300 mb-1">{lang === 'hi' ? 'सरकारी दिशा-निर्देश (Official Guidance):' : 'Official Guidance:'}</span>
                    <p className="text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl leading-relaxed">
                      {getProblemGuidance(p)}
                    </p>
                  </div>

                  {/* Action Steps Interactive Checklist */}
                  <div>
                    <span className="block font-black text-slate-700 dark:text-slate-300 mb-3">{lang === 'hi' ? 'अगले कदम - चेकलिस्ट (Resolution Steps Checklist):' : 'Resolution Steps Checklist:'}</span>
                    <div className="flex flex-col gap-2">
                      {getProblemSteps(p).map((step, idx) => {
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
                          {allDocuments.find(d => d.id === docId)?.name.split(' (')[0] || docId.replace('_', ' ')}
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
