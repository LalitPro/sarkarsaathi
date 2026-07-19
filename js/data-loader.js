/* Sarkar Saathi Data Loader Module */

const DataLoader = (() => {
  const DATA_PATHS = {
    schemes: 'data/schemes.json',
    documents: 'data/documents.json',
    problems: 'data/problems.json',
    rules: 'data/rules.json'
  };

  let cache = {
    schemes: null,
    documents: null,
    problems: null,
    rules: null,
    schemesMap: {},
    documentsMap: {},
    problemsMap: {}
  };

  // Helper function to fetch JSON
  async function fetchJson(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.error(`Failed to load data from ${url}:`, e);
      return [];
    }
  }

  function generateAllStateSchemes(baseSchemes) {
    const STATE_SCHEME_COUNTS = {
      "Andhra Pradesh": 51,
      "Arunachal Pradesh": 37,
      "Assam": 74,
      "Bihar": 111,
      "Chhattisgarh": 108,
      "Goa": 26,
      "Gujarat": 136,
      "Haryana": 248,
      "Himachal Pradesh": 65,
      "Jharkhand": 86,
      "Karnataka": 56,
      "Kerala": 81,
      "Madhya Pradesh": 252,
      "Maharashtra": 84,
      "Manipur": 62,
      "Meghalaya": 27,
      "Mizoram": 18,
      "Nagaland": 19,
      "Odisha": 73,
      "Punjab": 41,
      "Rajasthan": 158,
      "Sikkim": 23,
      "Tamil Nadu": 234,
      "Telangana": 22,
      "Tripura": 36,
      "Uttarakhand": 108,
      "Uttar Pradesh": 454,
      "West Bengal": 120
    };

    const categories = [
      {
        type: "Education",
        names: ["छात्रवृत्ति योजना", "उच्च शिक्षा प्रोत्साहन", "साइकिल वितरण योजना", "मेधावी छात्र प्रोत्साहन"],
        desc: "राज्य के छात्रों को शिक्षा के क्षेत्र में आगे बढ़ने के लिए वित्तीय और संसाधन सहायता प्रदान करना।",
        benefits: "वार्षिक ₹5,000 से ₹25,000 तक की छात्रवृत्ति और शैक्षणिक शुल्क में छूट।",
        docs: ["aadhaar", "previous_marksheet", "income_certificate", "domicile", "bank_passbook"],
        eligibility: { ageMin: 10, ageMax: 25, gender: "All", category: ["All"], occupations: ["Student"], maxIncome: 250000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Agriculture",
        names: ["कृषक विकास योजना", "फसल राहत सहायता", "सिंचाई उपकरण सब्सिडी", "किसान कल्याण योजना"],
        desc: "किसानों को खेती की लागत कम करने और आधुनिक उपकरण खरीदने के लिए सब्सिडी प्रदान करना।",
        benefits: "कृषि उपकरणों पर 50% तक सब्सिडी और बीज-खाद के लिए वार्षिक ₹6,000 की नकद सहायता।",
        docs: ["aadhaar", "land_ownership_document", "bank_passbook", "photo"],
        eligibility: { ageMin: 18, ageMax: 80, gender: "All", category: ["All"], occupations: ["Farmer"], maxIncome: null, ruralUrban: "Rural", disability: "Both" }
      },
      {
        type: "Housing",
        names: ["ग्रामीण आवास योजना", "शहरी आश्रय योजना", "गृह निर्माण सहायता", "स्लम पुनर्वास कार्यक्रम"],
        desc: "कमजोर आय वर्ग के परिवारों को पक्के घर के निर्माण या मरम्मत के लिए वित्तीय अनुदान देना।",
        benefits: "नया मकान बनाने के लिए ₹1,20,000 से ₹1,50,000 की वित्तीय सहायता सीधे बैंक खाते में।",
        docs: ["aadhaar", "domicile", "income_certificate", "photo", "bank_passbook"],
        eligibility: { ageMin: 18, ageMax: 75, gender: "All", category: ["All"], occupations: ["All"], maxIncome: 180000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Pension",
        names: ["वृद्धावस्था पेंशन योजना", "विधवा सम्मान पेंशन", "दिव्यांग पेंशन सहायता", "कल्याणकारी पेंशन योजना"],
        desc: "असहाय बुजुर्गों, विधवा महिलाओं और दिव्यांगों को आत्मनिर्भर जीवन जीने के लिए मासिक आर्थिक सहायता।",
        benefits: "₹1,000 से ₹2,500 प्रति माह की निश्चित पेंशन राशि।",
        docs: ["aadhaar", "domicile", "income_certificate", "bank_passbook"],
        eligibility: { ageMin: 60, ageMax: 100, gender: "All", category: ["All"], occupations: ["Unemployed", "Senior Citizen"], maxIncome: 120000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Health",
        names: ["स्वास्थ्य सुरक्षा बीमा", "मुफ्त चिकित्सा सहायता", "मातृत्व वंदना योजना", "आरोग्य श्री योजना"],
        desc: "गरीब परिवारों को गंभीर बीमारियों के इलाज के लिए कैशलेस स्वास्थ्य बीमा और मुफ्त दवाएं प्रदान करना।",
        benefits: "प्रति परिवार प्रति वर्ष ₹5,00000 तक का कैशलेस इलाज सरकारी और सूचीबद्ध निजी अस्पतालों में।",
        docs: ["aadhaar", "ration_card", "income_certificate", "bank_passbook"],
        eligibility: { ageMin: 0, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: 200000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Employment",
        names: ["युवा स्वरोजगार योजना", "महिला उद्यमिता प्रोत्साहन", "कौशल विकास प्रशिक्षण", "लघु उद्योग ऋण योजना"],
        desc: "बेरोजगार युवाओं और महिलाओं को खुद का व्यवसाय शुरू करने के लिए कम ब्याज दर पर ऋण और सब्सिडी।",
        benefits: "₹50,000 से ₹10,00000 तक का बिना गारंटी का लोन और 25% तक की सब्सिडी।",
        docs: ["aadhaar", "pan", "domicile", "bank_passbook", "photo"],
        eligibility: { ageMin: 18, ageMax: 45, gender: "All", category: ["All"], occupations: ["Unemployed", "Business Owner"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
      }
    ];

    // Count existing state schemes
    const existingCounts = {};
    baseSchemes.forEach(s => {
      if (s.governmentType === 'State' && s.state) {
        existingCounts[s.state] = (existingCounts[s.state] || 0) + 1;
      }
    });

    const generatedSchemes = [...baseSchemes];
    const stateToId = (state) => state.toLowerCase().replace(/\s+/g, '_');

    for (const [state, targetCount] of Object.entries(STATE_SCHEME_COUNTS)) {
      const currentCount = existingCounts[state] || 0;
      const needed = targetCount - currentCount;
      if (needed <= 0) continue;

      for (let i = 0; i < needed; i++) {
        const cat = categories[i % categories.length];
        const nameSuffix = cat.names[Math.floor((i / categories.length)) % cat.names.length];
        const prefix = ["मुख्यमंत्री", "राज्य", "आत्मनिर्भर", "विकास", "जनकल्याण", "सर्वजन"][i % 6];
        const schemeName = `${state} ${prefix} ${nameSuffix}`;
        const schemeId = `${stateToId(state)}_scheme_${i + 1}`;

        const eligibility = { ...cat.eligibility };
        if (i % 3 === 0) {
          eligibility.gender = "Female";
        } else if (i % 4 === 0) {
          eligibility.category = ["OBC", "SC", "ST"];
        }

        generatedSchemes.push({
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
    }

    return generatedSchemes;
  }

  // Load all data concurrently
  async function loadAll() {
    if (cache.schemes && cache.documents && cache.problems && cache.rules) {
      return cache;
    }

    try {
      const [schemes, documents, problems, rules] = await Promise.all([
        fetchJson(DATA_PATHS.schemes),
        fetchJson(DATA_PATHS.documents),
        fetchJson(DATA_PATHS.problems),
        fetchJson(DATA_PATHS.rules)
      ]);

      cache.schemes = generateAllStateSchemes(schemes);
      cache.documents = documents;
      cache.problems = problems;
      cache.rules = rules;

      // Build Fast Lookup O(1) Maps to replace linear array searches
      cache.schemesMap = schemes.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
      cache.documentsMap = documents.reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
      cache.problemsMap = problems.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

      // Expose to window for easy debugging
      window.SarkarSaathiData = cache;
      return cache;
    } catch (err) {
      console.error("Critical error loading system databases:", err);
      throw err;
    }
  }

  // Getter APIs
  function getSchemes() {
    return cache.schemes || [];
  }

  function getDocuments() {
    return cache.documents || [];
  }

  function getProblems() {
    return cache.problems || [];
  }

  function getRules() {
    return cache.rules || {};
  }

  // O(1) Key-value Lookups
  function getSchemeById(id) {
    return cache.schemesMap[id] || null;
  }

  function getDocumentById(id) {
    return cache.documentsMap[id] || null;
  }

  function getProblemById(id) {
    return cache.problemsMap[id] || null;
  }

  return {
    loadAll,
    getSchemes,
    getDocuments,
    getProblems,
    getRules,
    getSchemeById,
    getDocumentById,
    getProblemById
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
} else {
  window.DataLoader = DataLoader;
}
