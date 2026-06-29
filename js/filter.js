/* SarkarSaathi Eligibility Matching and Dependency Engine */

const Filter = (() => {
  
  // 1. Core Scheme Eligibility Matcher
  function isDemographicallyEligible(userProfile, scheme) {
    const rules = scheme.eligibility;
    if (!rules) return true;

    // A. State Filter (If State Scheme, must match user state. If Central, all states allowed)
    if (scheme.governmentType === 'State' && scheme.state) {
      if (userProfile.state && userProfile.state.toLowerCase() !== scheme.state.toLowerCase()) {
        return false;
      }
    }

    // B. Age Filter
    if (userProfile.age !== undefined && userProfile.age !== null && userProfile.age !== "") {
      const age = parseInt(userProfile.age, 10);
      if (!isNaN(age)) {
        if (rules.ageMin !== null && age < rules.ageMin) return false;
        if (rules.ageMax !== null && age > rules.ageMax) return false;
      }
    }

    // C. Gender Filter (All, Male, Female)
    if (rules.gender && rules.gender !== 'All') {
      if (userProfile.gender && userProfile.gender.toLowerCase() !== rules.gender.toLowerCase()) {
        return false;
      }
    }

    // D. Category Filter (General, OBC, SC, ST)
    if (rules.category && !rules.category.includes('All')) {
      if (userProfile.category && !rules.category.map(c => c.toLowerCase()).includes(userProfile.category.toLowerCase())) {
        return false;
      }
    }

    // E. Occupation Filter
    if (rules.occupations && !rules.occupations.includes('All')) {
      if (userProfile.occupation && !rules.occupations.map(o => o.toLowerCase()).includes(userProfile.occupation.toLowerCase())) {
        return false;
      }
    }

    // F. Income Filter (Annual Income check)
    if (rules.maxIncome !== null && rules.maxIncome !== undefined) {
      if (userProfile.income !== undefined && userProfile.income !== null && userProfile.income !== "") {
        const income = parseFloat(userProfile.income);
        if (!isNaN(income) && income > rules.maxIncome) {
          return false;
        }
      }
    }

    // G. Rural / Urban Filter
    if (rules.ruralUrban && rules.ruralUrban !== 'Both') {
      if (userProfile.ruralUrban && userProfile.ruralUrban.toLowerCase() !== rules.ruralUrban.toLowerCase()) {
        return false;
      }
    }

    // H. Disability Status
    if (rules.disability && rules.disability === 'Required') {
      if (!userProfile.disability || userProfile.disability === 'No') {
        return false;
      }
    }

    return true;
  }

  // 2. Missing Document Detector
  function detectMissingDocuments(userDocuments, schemeRequiredDocuments) {
    const userDocsSet = new Set(userDocuments.map(d => d.toLowerCase()));
    const available = [];
    const missing = [];

    schemeRequiredDocuments.forEach(docId => {
      if (userDocsSet.has(docId.toLowerCase())) {
        available.push(docId);
      } else {
        missing.push(docId);
      }
    });

    return {
      available,
      missing,
      hasAll: missing.length === 0
    };
  }

  // 3. Smart Eligibility Booster
  // Finds schemes where user fits demographically but is missing documents
  function getBoostedEligibility(userProfile, schemesList, userDocuments) {
    const eligibleDemographics = schemesList.filter(scheme => isDemographicallyEligible(userProfile, scheme));
    
    const currentlyEligible = [];
    const boosterSchemes = [];

    eligibleDemographics.forEach(scheme => {
      const docCheck = detectMissingDocuments(userDocuments, scheme.requiredDocuments || []);
      if (docCheck.hasAll) {
        currentlyEligible.push(scheme);
      } else {
        boosterSchemes.push({
          scheme,
          missingDocuments: docCheck.missing
        });
      }
    });

    // Group schemes by missing documents to show what unlocking potential they have
    // e.g., missingDocMap = { "income_certificate": [scheme1, scheme2], "domicile": [scheme1] }
    const missingDocMap = {};
    boosterSchemes.forEach(item => {
      item.missingDocuments.forEach(docId => {
        if (!missingDocMap[docId]) {
          missingDocMap[docId] = [];
        }
        missingDocMap[docId].push(item.scheme);
      });
    });

    return {
      currentlyEligible,
      boosterSchemes, // contains schemes and their specific missing docs
      missingDocMap  // grouped by document id
    };
  }

  return {
    isDemographicallyEligible,
    detectMissingDocuments,
    getBoostedEligibility
  };
})();

// Export for Node.js test environment or expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Filter;
} else {
  window.Filter = Filter;
}
