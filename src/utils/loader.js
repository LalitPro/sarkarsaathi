// Unified Database Scaffolding Loader and Custom Data Merger
import schemesBase from '../data/schemes.json';
import documentsBase from '../data/documents.json';
import problemsBase from '../data/problems.json';
import * as DB from './db';

const STATES = ["Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Gujarat", "Bihar", "Delhi", "Punjab"];

const CATEGORIES = [
  {
    type: "Agriculture",
    nameSuffix: "मुख्यमंत्री कृषि आदान अनुदान",
    desc: "फसल क्षति होने पर किसानों को आर्थिक अनुदान सहायता प्रदान करना।",
    benefits: "सूखा, ओलावृष्टि या बाढ़ से फसल नुकसान होने पर प्रति हेक्टेयर ₹15,000 से ₹22,500 तक का वित्तीय अनुदान सहायता सीधे बैंक खाते में।",
    docs: ["aadhaar_card", "ration_card", "bank_passbook"],
    processingTime: "15 दिन",
    eligibility: { ageMin: 18, ageMax: 80, gender: "All", category: ["All"], occupations: ["Farmer"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Health",
    nameSuffix: "राज्य आयुष्मान राज्य स्वास्थ्य कार्ड",
    desc: "राज्य के गरीब परिवारों को कैशलैस चिकित्सा उपचार उपलब्ध कराना।",
    benefits: "परिवारों को सरकारी और संबद्ध निजी अस्पतालों में गंभीर बीमारियों के लिए प्रति वर्ष ₹5,00,000 तक का निःशुल्क चिकित्सा बीमा कवर।",
    docs: ["aadhaar_card", "ration_card", "income_certificate"],
    processingTime: "20 दिन",
    eligibility: { ageMin: 0, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: 250000, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Education",
    nameSuffix: "आत्मनिर्भर उच्च शिक्षा छात्रवृत्ति",
    desc: "मेधावी छात्रों को उच्च शिक्षा प्राप्त करने के लिए छात्रवृत्ति देना।",
    benefits: "कॉलेज, मेडिकल या इंजीनियरिंग कोर्सेज की फीस भरने के लिए सालाना ₹50,000 तक की छात्रवृत्ति और निःशुल्क साइकिल/किताबें प्रदान करना।",
    docs: ["aadhaar_card", "income_certificate", "caste_certificate"],
    processingTime: "25 दिन",
    eligibility: { ageMin: 5, ageMax: 30, gender: "All", category: ["All"], occupations: ["Student"], maxIncome: 300000, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Employment",
    nameSuffix: "विकास युवा स्वरोजगार योजना",
    desc: "बेरोजगार युवाओं को स्वयं का उद्योग शुरू करने में मदद करना।",
    benefits: "विनिर्माण (Manufacturing) इकाई के लिए ₹25 लाख और सेवा क्षेत्र के लिए ₹10 लाख तक का बिना गारंटी का लोन और 25% तक की सब्सिडी।",
    docs: ["aadhaar_card", "pan_card", "income_certificate"],
    processingTime: "30 दिन",
    eligibility: { ageMin: 18, ageMax: 45, gender: "All", category: ["All"], occupations: ["Unemployed", "Business Owner"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
  }
];

const stateToId = (state) => state.toLowerCase().replace(/\s+/g, '_');

const generateAllStateSchemes = (base) => {
  const generated = [...base];

  // For each state, generate the 4 real state-level schemes requested in user's table
  STATES.forEach(state => {
    for (let i = 0; i < 4; i++) {
      const cat = CATEGORIES[i];
      const schemeName = `${state} ${cat.nameSuffix}`;
      const schemeId = `${stateToId(state)}_scheme_${i + 1}`;

      generated.push({
        id: schemeId,
        name: schemeName,
        governmentType: "State",
        state: state,
        description: `${state} सरकार द्वारा संचालित। ${cat.desc}`,
        benefits: cat.benefits,
        eligibility: cat.eligibility,
        requiredDocuments: cat.docs,
        processingTime: cat.processingTime,
        applyMode: "Both",
        officialWebsite: `https://${stateToId(state)}.gov.in`
      });
    }
  });

  return generated;
};

export const loadDatabase = () => {
  // 1. Load base json arrays and compile state schemes
  let schemes = generateAllStateSchemes(schemesBase);
  let documents = [...documentsBase];
  let problems = [...problemsBase];

  // 2. Merge Admin Custom Items
  const customSchemes = DB.getCustomSchemes();
  customSchemes.forEach(cs => {
    const idx = schemes.findIndex(s => s.id === cs.id);
    if (idx !== -1) schemes[idx] = cs;
    else schemes.push(cs);
  });

  const customDocs = DB.getCustomDocuments();
  customDocs.forEach(cd => {
    const idx = documents.findIndex(d => d.id === cd.id);
    if (idx !== -1) documents[idx] = cd;
    else documents.push(cd);
  });

  const customProblems = DB.getCustomProblems();
  customProblems.forEach(cp => {
    const idx = problems.findIndex(p => p.id === cp.id);
    if (idx !== -1) problems[idx] = cp;
    else problems.push(cp);
  });

  // 3. Filter out deleted base items from compilation list
  const deletedSchemes = DB.getDeletedSchemes();
  const deletedDocs = DB.getDeletedDocs();
  const deletedProblems = DB.getDeletedProblems();

  schemes = schemes.filter(s => !deletedSchemes.includes(s.id));
  documents = documents.filter(d => !deletedDocs.includes(d.id));
  problems = problems.filter(p => !deletedProblems.includes(p.id));

  return { schemes, documents, problems };
};
