// Unified Database Scaffolding Loader and Custom Data Merger
import schemesBase from '../data/schemes.json';
import documentsBase from '../data/documents.json';
import problemsBase from '../data/problems.json';
import * as DB from './db';

const STATES = ["Madhya Pradesh", "Rajasthan", "Uttar Pradesh", "Maharashtra", "Gujarat", "Bihar", "Delhi", "Punjab"];

const CATEGORIES = [
  {
    type: "Agriculture",
    names: ["कृषि आदान अनुदान", "फसल बीमा सहायता", "किसान कल्याण योजना", "कृषि यंत्र सब्सिडी"],
    desc: "किसानों को फसल नुकसान की भरपाई और कृषि उपकरण खरीदने के लिए वित्तीय सहायता प्रदान करना।",
    benefits: "₹5,000 से ₹25,000 प्रति हेक्टेयर की इनपुट सब्सिडी तथा यंत्रों पर 50% तक की छूट।",
    docs: ["aadhaar", "ration_card", "bank_passbook", "domicile"],
    eligibility: { ageMin: 18, ageMax: 80, gender: "All", category: ["All"], occupations: ["Farmer"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Health",
    names: ["आयुष्मान राज्य स्वास्थ्य कार्ड", "निःशुल्क चिकित्सा सहायता", "मातृत्व सुरक्षा प्रोत्साहन", "गंभीर बीमारी सहायता योजना"],
    desc: "गरीब परिवारों को गंभीर बीमारियों के इलाज के लिए कैशलेस स्वास्थ्य बीमा और मुफ्त दवाएं प्रदान करना।",
    benefits: "प्रति परिवार प्रति वर्ष ₹5,00000 तक का कैशलेस इलाज सरकारी और सूचीबद्ध निजी अस्पतालों में।",
    docs: ["aadhaar", "ration_card", "income_certificate", "bank_passbook"],
    eligibility: { ageMin: 0, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: 200000, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Education",
    names: ["उच्च शिक्षा छात्रवृत्ति", "कक्षा ९-१२ छात्रवृत्ति", "साइकिल प्रदाय योजना", "छात्रावास सहायता योजना"],
    desc: "आर्थिक रूप से कमजोर वर्ग और आरक्षित वर्ग के मेधावी छात्र-छात्राओं को शिक्षा जारी रखने के लिए वित्तीय प्रोत्साहन।",
    benefits: "₹2,500 से ₹50,000 प्रति वर्ष की छात्रवृत्ति और निःशुल्क साइकिल/किताबें।",
    docs: ["aadhaar", "ration_card", "income_certificate", "bank_passbook"],
    eligibility: { ageMin: 5, ageMax: 30, gender: "All", category: ["All"], occupations: ["Student"], maxIncome: 250000, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Employment",
    names: ["युवा स्वरोजगार योजना", "महिला उद्यमिता प्रोत्साहन", "कौशल विकास प्रशिक्षण", "लघु उद्योग ऋण योजना"],
    desc: "बेरोजगार युवाओं और महिलाओं को खुद का व्यवसाय शुरू करने के लिए कम ब्याज दर पर ऋण और सब्सिडी।",
    benefits: "₹50,000 से ₹10,00000 तक का बिना गारंटी का लोन और 25% तक की सब्सिडी।",
    docs: ["aadhaar", "pan", "domicile", "bank_passbook"],
    eligibility: { ageMin: 18, ageMax: 45, gender: "All", category: ["All"], occupations: ["Unemployed", "Business Owner"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
  },
  {
    type: "Travel",
    names: ["निःशुल्क यात्रा योजना", "यात्री रियायत योजना", "बस पास सहायता", "परिवहन छूट योजना"],
    desc: "सार्वजनिक परिवहन बसों और ट्रेनों में रियायती या पूर्णतः निःशुल्क यात्रा सुविधाएं प्रदान करना।",
    benefits: "किराए में 50% से 100% तक की छूट और रियायती मासिक पास की सुविधा।",
    docs: ["aadhaar", "domicile"],
    eligibility: { ageMin: 5, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
  }
];

const stateToId = (state) => state.toLowerCase().replace(/\s+/g, '_');

const generateAllStateSchemes = (base) => {
  const generated = [...base];

  // For each state, generate 4 schemes dynamically to demonstrate the engine scalability
  STATES.forEach(state => {
    const needed = 4;
    for (let i = 0; i < needed; i++) {
      const cat = CATEGORIES[i % CATEGORIES.length];
      const nameSuffix = cat.names[Math.floor((i / CATEGORIES.length)) % cat.names.length];
      const prefix = ["मुख्यमंत्री", "राज्य", "आत्मनिर्भर", "विकास", "जनकल्याण", "सर्वजन"][i % 6];
      const schemeName = `${state} ${prefix} ${nameSuffix}`;
      const schemeId = `${stateToId(state)}_scheme_${i + 1}`;

      const eligibility = { ...cat.eligibility };
      if (i % 3 === 0) {
        eligibility.gender = "Female";
      } else if (i % 4 === 0) {
        eligibility.category = ["OBC", "SC", "ST"];
      }

      generated.push({
        id: schemeId,
        name: schemeName,
        governmentType: "State",
        state: state,
        description: `${state} सरकार द्वारा संचालित। ${cat.desc}`,
        benefits: cat.benefits,
        eligibility: eligibility,
        requiredDocuments: cat.docs,
        processingTime: `${15 + (i % 4) * 5} दिन`,
        applyMode: i % 2 === 0 ? "Both" : "Online",
        officialWebsite: `https://www.serviceonline.gov.in`
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

  return { schemes, documents, problems };
};
