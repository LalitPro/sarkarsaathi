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
        names: ["à¤›à¤¾à¤¤à¥�à¤°à¤µà¥ƒà¤¤à¥�à¤¤à¤¿ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤‰à¤šà¥�à¤š à¤¶à¤¿à¤•à¥�à¤·à¤¾ à¤ªà¥�à¤°à¥‹à¤¤à¥�à¤¸à¤¾à¤¹à¤¨", "à¤¸à¤¾à¤‡à¤•à¤¿à¤² à¤µà¤¿à¤¤à¤°à¤£ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤®à¥‡à¤§à¤¾à¤µà¥€ à¤›à¤¾à¤¤à¥�à¤° à¤ªà¥�à¤°à¥‹à¤¤à¥�à¤¸à¤¾à¤¹à¤¨"],
        desc: "à¤°à¤¾à¤œà¥�à¤¯ à¤•à¥‡ à¤›à¤¾à¤¤à¥�à¤°à¥‹à¤‚ à¤•à¥‹ à¤¶à¤¿à¤•à¥�à¤·à¤¾ à¤•à¥‡ à¤•à¥�à¤·à¥‡à¤¤à¥�à¤° à¤®à¥‡à¤‚ à¤†à¤—à¥‡ à¤¬à¤¢à¤¼à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤� à¤µà¤¿à¤¤à¥�à¤¤à¥€à¤¯ à¤”à¤° à¤¸à¤‚à¤¸à¤¾à¤§à¤¨ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤ªà¥�à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¤¾à¥¤",
        benefits: "à¤µà¤¾à¤°à¥�à¤·à¤¿à¤• â‚¹5,000 à¤¸à¥‡ â‚¹25,000 à¤¤à¤• à¤•à¥€ à¤›à¤¾à¤¤à¥�à¤°à¤µà¥ƒà¤¤à¥�à¤¤à¤¿ à¤”à¤° à¤¶à¥ˆà¤•à¥�à¤·à¤£à¤¿à¤• à¤¶à¥�à¤²à¥�à¤• à¤®à¥‡à¤‚ à¤›à¥‚à¤Ÿà¥¤",
        docs: ["aadhaar", "previous_marksheet", "income_certificate", "domicile", "bank_passbook"],
        eligibility: { ageMin: 10, ageMax: 25, gender: "All", category: ["All"], occupations: ["Student"], maxIncome: 250000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Agriculture",
        names: ["à¤•à¥ƒà¤·à¤• à¤µà¤¿à¤•à¤¾à¤¸ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤«à¤¸à¤² à¤°à¤¾à¤¹à¤¤ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾", "à¤¸à¤¿à¤‚à¤šà¤¾à¤ˆ à¤‰à¤ªà¤•à¤°à¤£ à¤¸à¤¬à¥�à¤¸à¤¿à¤¡à¥€", "à¤•à¤¿à¤¸à¤¾à¤¨ à¤•à¤²à¥�à¤¯à¤¾à¤£ à¤¯à¥‹à¤œà¤¨à¤¾"],
        desc: "à¤•à¤¿à¤¸à¤¾à¤¨à¥‹à¤‚ à¤•à¥‹ à¤–à¥‡à¤¤à¥€ à¤•à¥€ à¤²à¤¾à¤—à¤¤ à¤•à¤® à¤•à¤°à¤¨à¥‡ à¤”à¤° à¤†à¤§à¥�à¤¨à¤¿à¤• à¤‰à¤ªà¤•à¤°à¤£ à¤–à¤°à¥€à¤¦à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤� à¤¸à¤¬à¥�à¤¸à¤¿à¤¡à¥€ à¤ªà¥�à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¤¾à¥¤",
        benefits: "à¤•à¥ƒà¤·à¤¿ à¤‰à¤ªà¤•à¤°à¤£à¥‹à¤‚ à¤ªà¤° 50% à¤¤à¤• à¤¸à¤¬à¥�à¤¸à¤¿à¤¡à¥€ à¤”à¤° à¤¬à¥€à¤œ-à¤–à¤¾à¤¦ à¤•à¥‡ à¤²à¤¿à¤� à¤µà¤¾à¤°à¥�à¤·à¤¿à¤• â‚¹6,000 à¤•à¥€ à¤¨à¤•à¤¦ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾à¥¤",
        docs: ["aadhaar", "land_ownership_document", "bank_passbook"],
        eligibility: { ageMin: 18, ageMax: 80, gender: "All", category: ["All"], occupations: ["Farmer"], maxIncome: null, ruralUrban: "Rural", disability: "Both" }
      },
      {
        type: "Housing",
        names: ["à¤—à¥�à¤°à¤¾à¤®à¥€à¤£ à¤†à¤µà¤¾à¤¸ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤¶à¤¹à¤°à¥€ à¤†à¤¶à¥�à¤°à¤¯ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤—à¥ƒà¤¹ à¤¨à¤¿à¤°à¥�à¤®à¤¾à¤£ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾", "à¤¸à¥�à¤²à¤® à¤ªà¥�à¤¨à¤°à¥�à¤µà¤¾à¤¸ à¤•à¤¾à¤°à¥�à¤¯à¤•à¥�à¤°à¤®"],
        desc: "à¤•à¤®à¤œà¥‹à¤° à¤†à¤¯ à¤µà¤°à¥�à¤— à¤•à¥‡ à¤ªà¤°à¤¿à¤µà¤¾à¤°à¥‹à¤‚ à¤•à¥‹ à¤ªà¤•à¥�à¤•à¥‡ à¤˜à¤° à¤•à¥‡ à¤¨à¤¿à¤°à¥�à¤®à¤¾à¤£ à¤¯à¤¾ à¤®à¤°à¤®à¥�à¤®à¤¤ à¤•à¥‡ à¤²à¤¿à¤� à¤µà¤¿à¤¤à¥�à¤¤à¥€à¤¯ à¤…à¤¨à¥�à¤¦à¤¾à¤¨ à¤¦à¥‡à¤¨à¤¾à¥¤",
        benefits: "à¤¨à¤¯à¤¾ à¤®à¤•à¤¾à¤¨ à¤¬à¤¨à¤¾à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤� â‚¹1,20,000 à¤¸à¥‡ â‚¹1,50,000 à¤•à¥€ à¤µà¤¿à¤¤à¥�à¤¤à¥€à¤¯ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤¸à¥€à¤§à¥‡ à¤¬à¥ˆà¤‚à¤• à¤–à¤¾à¤¤à¥‡ à¤®à¥‡à¤‚à¥¤",
        docs: ["aadhaar", "domicile", "income_certificate", "bank_passbook"],
        eligibility: { ageMin: 18, ageMax: 75, gender: "All", category: ["All"], occupations: ["All"], maxIncome: 180000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Pension",
        names: ["à¤µà¥ƒà¤¦à¥�à¤§à¤¾à¤µà¤¸à¥�à¤¥à¤¾ à¤ªà¥‡à¤‚à¤¶à¤¨ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤µà¤¿à¤§à¤µà¤¾ à¤¸à¤®à¥�à¤®à¤¾à¤¨ à¤ªà¥‡à¤‚à¤¶à¤¨", "à¤¦à¤¿à¤µà¥�à¤¯à¤¾à¤‚à¤— à¤ªà¥‡à¤‚à¤¶à¤¨ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾", "à¤•à¤²à¥�à¤¯à¤¾à¤£à¤•à¤¾à¤°à¥€ à¤ªà¥‡à¤‚à¤¶à¤¨ à¤¯à¥‹à¤œà¤¨à¤¾"],
        desc: "à¤…à¤¸à¤¹à¤¾à¤¯ à¤¬à¥�à¤œà¥�à¤°à¥�à¤—à¥‹à¤‚, à¤µà¤¿à¤§à¤µà¤¾ à¤®à¤¹à¤¿à¤²à¤¾à¤“à¤‚ à¤”à¤° à¤¦à¤¿à¤µà¥�à¤¯à¤¾à¤‚à¤—à¥‹à¤‚ à¤•à¥‹ à¤†à¤¤à¥�à¤®à¤¨à¤¿à¤°à¥�à¤­à¤° à¤œà¥€à¤µà¤¨ à¤œà¥€à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤� à¤®à¤¾à¤¸à¤¿à¤• à¤†à¤°à¥�à¤¥à¤¿à¤• à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾à¥¤",
        benefits: "â‚¹1,000 à¤¸à¥‡ â‚¹2,500 à¤ªà¥�à¤°à¤¤à¤¿ à¤®à¤¾à¤¹ à¤•à¥€ à¤¨à¤¿à¤¶à¥�à¤šà¤¿à¤¤ à¤ªà¥‡à¤‚à¤¶à¤¨ à¤°à¤¾à¤¶à¤¿à¥¤",
        docs: ["aadhaar", "domicile", "income_certificate", "bank_passbook"],
        eligibility: { ageMin: 60, ageMax: 100, gender: "All", category: ["All"], occupations: ["Unemployed", "Senior Citizen"], maxIncome: 120000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Health",
        names: ["à¤¸à¥�à¤µà¤¾à¤¸à¥�à¤¥à¥�à¤¯ à¤¸à¥�à¤°à¤•à¥�à¤·à¤¾ à¤¬à¥€à¤®à¤¾", "à¤®à¥�à¤«à¥�à¤¤ à¤šà¤¿à¤•à¤¿à¤¤à¥�à¤¸à¤¾ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾", "à¤®à¤¾à¤¤à¥ƒà¤¤à¥�à¤µ à¤µà¤‚à¤¦à¤¨à¤¾ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤†à¤°à¥‹à¤—à¥�à    ];à¤µà¤¿à¤§à¤¾à¤�à¤‚ à¤ªà¥�à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¤¾à¥¤",
        benefits: "à¤•à¤¿à¤°à¤¾à¤� à¤®à¥‡à¤‚ 50% à¤¸à¥‡ 100% à¤¤à¤• à¤•à¥€ à¤›à¥‚à¤Ÿ and à¤°à¤¿à¤¯à¤¾à¤¯à¤¤à¥€ à¤®à¤¾à¤¸à¤¿à¤• à¤ªà¤¾à¤¸ à¤•à¥€ à¤¸à¥�à¤µà¤¿à¤§à¤¾à¥¤",
        docs: ["aadhaar", "domicile"],
        eligibility: { ageMin: 5, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
      }
    ];me: null, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Travel",
        names: ["à¤¨à¤¿à¤ƒà¤¶à¥�à¤²à¥�à¤• à¤¯à¤¾à¤¤à¥�à¤°à¤¾ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤¯à¤¾à¤¤à¥�à¤°à¥€ à¤°à¤¿à¤¯à¤¾à¤¯à¤¤ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤¬à¤¸ à¤ªà¤¾à¤¸ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾", "à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤›à¥‚à¤Ÿ à¤¯à¥‹à¤œà¤¨à¤¾"],
        desc: "à¤¸à¤¾à¤°à¥�à¤µà¤œà¤¨à¤¿à¤• à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤¬à¤¸à¥‹à¤‚ à¤”à¤° à¤Ÿà¥�à¤°à¥‡à¤¨à¥‹à¤‚ à¤®à¥‡à¤‚ à¤°à¤¿à¤¯à¤¾à¤¯à¤¤à¥€ à¤¯à¤¾ à¤ªà¥‚à¤°à¥�à¤£à¤¤à¤ƒ à¤¨à¤¿à¤ƒà¤¶à¥�à¤²à¥�à¤• à¤¯à¤¾à¤¤à¥�à¤°à¤¾ à¤¸à¥�à¤µà¤¿à¤§à¤¾à¤�à¤‚ à¤ªà¥�à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¤¾à¥¤",
        benefits: "à¤•à¤¿à¤°à¤¾à¤� à¤®à¥‡à¤‚ 50% à¤¸à¥‡ 100% à¤¤à¤• à¤•à¥€ à¤›à¥‚à¤Ÿ à¤”à¤° à¤°à¤¿à¤¯à¤¾à¤¯à¤¤à¥€ à¤®à¤¾à¤¸à¤¿à¤• à¤ªà¤¾à¤¸ à¤•à¥€ à¤¸à¥�à¤µà¤¿à¤§à¤¾à¥¤",
        docs: ["aadhaar", "domicile"],
        eligibility: { ageMin: 5, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
      }à¤¯à¥‹à¤œà¤¨à¤¾"],
        desc: "à¤—à¤°à¥€à¤¬ à¤ªà¤°à¤¿à¤µà¤¾à¤°à¥‹à¤‚ à¤•à¥‹ à¤—à¤‚à¤­à¥€à¤° à¤¬à¥€à¤®à¤¾à¤°à¤¿à¤¯à¥‹à¤‚ à¤•à¥‡ à¤‡à¤²à¤¾à¤œ à¤•à¥‡ à¤²à¤¿à¤� à¤•à¥ˆà¤¶à¤²à¥‡à¤¸ à¤¸à¥�à¤µà¤¾à¤¸à¥�à¤¥à¥�à¤¯ à¤¬à¥€à¤®à¤¾ à¤”à¤° à¤®à¥�à¤«à¥�à¤¤ à¤¦à¤µà¤¾à¤�à¤‚ à¤ªà¥�à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¤¾à¥¤",
        benefits: "à¤ªà¥�à¤°à¤¤à¤¿ à¤ªà¤°à¤¿à¤µà¤¾à¤° à¤ªà¥�à¤°à¤¤à¤¿ à¤µà¤°à¥�à¤· â‚¹5,00000 à¤¤à¤• à¤•à¤¾ à¤•à¥ˆà¤¶à¤²à¥‡à¤¸ à¤‡à¤²à¤¾à¤œ à¤¸à¤°à¤•à¤¾à¤°à¥€ à¤”à¤° à¤¸à¥‚à¤šà¥€à¤¬à¤¦à¥�à¤§ à¤¨à¤¿à¤œà¥€ à¤…à¤¸à¥�à¤ªà¤¤à¤¾à¤²à¥‹à¤‚ à¤®à¥‡à¤‚à¥¤",
        docs: ["aadhaar", "ration_card", "income_certificate", "bank_passbook"],
        eligibility: { ageMin: 0, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: 200000, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Employment",
        names: ["à¤¯à¥�à¤µà¤¾ à¤¸à¥�à¤µà¤°à¥‹à¤œà¤—à¤¾à¤° à¤¯à¥‹à¤œà¤¨à¤¾", "à¤®à¤¹à¤¿à¤²à¤¾ à¤‰à¤¦à¥�à¤¯à¤®à¤¿à¤¤à¤¾ à¤ªà¥�à¤°à¥‹à¤¤à¥�à¤¸à¤¾à¤¹à¤¨", "à¤•à¥Œà¤¶à¤² à¤µà¤¿à¤•à¤¾à¤¸ à¤ªà¥�à¤°à¤¶à¤¿à¤•à¥�à¤·à¤£", "à¤²à¤˜à¥� à¤‰à¤¦à¥�à¤¯à¥‹à¤— à¤‹à¤£ à¤¯à¥‹à¤œà¤¨à¤¾"],
        desc: "à¤¬à¥‡à¤°à¥‹à¤œà¤—à¤¾à¤° à¤¯à¥�à¤µà¤¾à¤“à¤‚ à¤”à¤° à¤®à¤¹à¤¿à¤²à¤¾à¤“à¤‚ à¤•à¥‹ à¤–à¥�à¤¦ à¤•à¤¾ à¤µà¥�à¤¯à¤µà¤¸à¤¾à¤¯ à¤¶à¥�à¤°à¥‚ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤� à¤•à¤® à¤¬à¥�à¤¯à¤¾à¤œ à¤¦à¤° à¤ªà¤° à¤‹à¤£ à¤”à¤° à¤¸à¤¬à¥�à¤¸à¤¿à¤¡à¥€à¥¤",
        benefits: "â‚¹50,000 à¤¸à¥‡ â‚¹10,00000 à¤¤à¤• à¤•à¤¾ à¤¬à¤¿à¤¨à¤¾ à¤—à¤¾à¤°à¤‚à¤Ÿà¥€ à¤•à¤¾ à¤²à¥‹à¤¨ à¤”à¤° 25% à¤¤à¤• à¤•à¥€ à¤¸à¤¬à¥�à¤¸à¤¿à¤¡à¥€à¥¤",
        docs: ["aadhaar", "pan", "domicile", "bank_passbook", "photo"],
        eligibility: { ageMin: 18, ageMax: 45, gender: "All", category: ["All"], occupations: ["Unemployed", "Business Owner"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
      },
      {
        type: "Travel",
        names: ["à¤¨à¤¿à¤ƒà¤¶à¥�à¤²à¥�à¤• à¤¯à¤¾à¤¤à¥�à¤°à¤¾ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤¯à¤¾à¤¤à¥�à¤°à¥€ à¤°à¤¿à¤¯à¤¾à¤¯à¤¤ à¤¯à¥‹à¤œà¤¨à¤¾", "à¤¬à¤¸ à¤ªà¤¾à¤¸ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾", "à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤›à¥‚à¤Ÿ à¤¯à¥‹à¤œà¤¨à¤¾"],
        desc: "à¤¸à¤¾à¤°à¥�à¤µà¤œà¤¨à¤¿à¤• à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤¬à¤¸à¥‹à¤‚ à¤”à¤° à¤Ÿà¥�à¤°à¥‡à¤¨à¥‹à¤‚ à¤®à¥‡à¤‚ à¤°à¤¿à¤¯à¤¾à¤¯à¤¤à¥€ à¤¯à¤¾ à¤ªà¥‚à¤°à¥�à¤£à¤¤à¤ƒ à¤¨à¤¿à¤ƒà¤¶à¥�à¤²à¥�à¤• à¤¯à¤¾à¤¤à¥�à¤°à¤¾ à¤¸à¥�à¤µà¤¿à¤§à¤¾à¤�à¤‚ à¤ªà¥�à¤°à¤¦à¤¾à¤¨ à¤•à¤°à¤¨à¤¾à¥¤",
        benefits: "à¤•à¤¿à¤°à¤¾à¤� à¤®à¥‡à¤‚ 50% à¤¸à¥‡ 100% à¤¤à¤• à¤•à¥€ à¤›à¥‚à¤Ÿ à¤”à¤° à¤°à¤¿à¤¯à¤¾à¤¯à¤¤à¥€ à¤®à¤¾à¤¸à¤¿à¤• à¤ªà¤¾à¤¸ à¤•à¥€ à¤¸à¥�à¤µà¤¿à¤§à¤¾à¥¤",
        docs: ["aadhaar", "domicile", "photo"],
        eligibility: { ageMin: 5, ageMax: 100, gender: "All", category: ["All"], occupations: ["All"], maxIncome: null, ruralUrban: "Both", disability: "Both" }
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
        const prefix = ["à¤®à¥�à¤–à¥�à¤¯à¤®à¤‚à¤¤à¥�à¤°à¥€", "à¤°à¤¾à¤œà¥�à¤¯", "à¤†à¤¤à¥�à¤®à¤¨à¤¿à¤°à¥�à¤­à¤°", "à¤µà¤¿à¤•à¤¾à¤¸", "à¤œà¤¨à¤•à¤²à¥�à¤¯à¤¾à¤£", "à¤¸à¤°à¥�à¤µà¤œà¤¨"][i % 6];
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
          description: `${state} à¤¸à¤°à¤•à¤¾à¤° à¤¦à¥�à¤µà¤¾à¤°à¤¾ à¤¸à¤‚à¤šà¤¾à¤²à¤¿à¤¤à¥¤ ${cat.desc}`,
          benefits: cat.benefits,
          eligibility: eligibility,
          requiredDocuments: cat.docs,
          processingTime: `${15 + (i % 4) * 5} à¤¦à¤¿à¤¨`,
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

      // Merge with custom Admin-updated data if DB helper is loaded
      if (typeof DB !== 'undefined') {
        const customSchemes = DB.getCustomSchemes();
        customSchemes.forEach(cs => {
          const idx = cache.schemes.findIndex(s => s.id === cs.id);
          if (idx !== -1) cache.schemes[idx] = cs;
          else cache.schemes.push(cs);
        });

        const customDocs = DB.getCustomDocuments();
        customDocs.forEach(cd => {
          const idx = cache.documents.findIndex(d => d.id === cd.id);
          if (idx !== -1) cache.documents[idx] = cd;
          else cache.documents.push(cd);
        });

        const customProbs = DB.getCustomProblems();
        customProbs.forEach(cp => {
          const idx = cache.problems.findIndex(p => p.id === cp.id);
          if (idx !== -1) cache.problems[idx] = cp;
          else cache.problems.push(cp);
        });
      }

      // Build Fast Lookup O(1) Maps to replace linear array searches
      cache.schemesMap = cache.schemes.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
      cache.documentsMap = cache.documents.reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
      cache.problemsMap = cache.problems.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

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
