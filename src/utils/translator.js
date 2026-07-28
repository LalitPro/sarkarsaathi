// Sarkar Saathi Manual Translation Dictionary and Helper
// This avoids automated Google Translate scripts and enables perfect manual translations.

const DICTIONARY = {
  en: {
    // 1. Schemes Translations
    "pmjdy_name": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    "pmjdy_desc": "Provides zero-balance savings bank accounts and financial inclusion to low-income families.",
    "pmjdy_benefits": "₹10,000 overdraft limit, free RuPay debit card, ₹2 Lakh accidental insurance cover, and zero minimum balance.",
    
    "pmuy_name": "Pradhan Mantri Ujjwala Yojana (PMUY)",
    "pmuy_desc": "Provides free LPG kitchen gas connections to women belonging to BPL (Below Poverty Line) households.",
    "pmuy_benefits": "Free gas cylinder connection, subsidy on gas stove purchase, and first cylinder refilled completely free.",

    "pmsby_name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    "pmsby_desc": "Accidental insurance scheme offering high coverage at a low premium for all bank account holders.",
    "pmsby_benefits": "Accidental death or total disability cover of ₹2 Lakh, and partial disability cover of ₹1 Lakh for an annual premium of just ₹20.",

    "pmjjby_name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    "pmjjby_desc": "Government-backed life insurance scheme providing financial security to family members.",
    "pmjjby_benefits": "Life insurance cover of ₹2 Lakh in case of death due to any reason, for an annual premium of just ₹436.",

    "pm_kisan_name": "PM Kisan Samman Nidhi (PM-KISAN)",
    "pm_kisan_desc": "Income support scheme for all landholder farmer families across the country.",
    "pm_kisan_benefits": "Direct financial assistance of ₹6,000 per year, transferred in three equal installments of ₹2,000 directly into bank accounts.",

    "ladli_behna_name": "Mukhyamantri Ladli Behna Yojana (MP)",
    "ladli_behna_desc": "Madhya Pradesh state government scheme for women empowerment and financial independence.",
    "ladli_behna_benefits": "Monthly financial aid of ₹1,250 transferred directly into the bank accounts of eligible married women.",

    // 2. Documents Translations
    "aadhaar_name": "Aadhaar Card (आधार कार्ड)",
    "aadhaar_desc": "12-digit unique identity number issued by UIDAI, serving as proof of identity and address across India.",

    "pan_name": "PAN Card (पैन कार्ड)",
    "pan_desc": "10-digit alphanumeric identifier issued by the Income Tax Department, required for all major financial transactions.",

    "ration_card_name": "Ration Card (राशन कार्ड)",
    "ration_card_desc": "State-issued document to purchase subsidized food grains from the Public Distribution System (PDS).",

    "income_certificate_name": "Income Certificate (आय प्रमाण पत्र)",
    "income_certificate_desc": "Official document certifying the annual income of an individual or family, needed for scholarships and subsidies.",

    "domicile_name": "Domicile Certificate (मूल निवासी प्रमाण पत्र)",
    "domicile_desc": "State-issued document proving that a resident belongs to a particular State or Union Territory.",

    "caste_certificate_name": "Caste Certificate (जाति प्रमाण पत्र)",
    "caste_certificate_desc": "Official document certifying that a person belongs to a specific reserved category (SC/ST/OBC).",

    "samagra_id_name": "Samagra ID (समग्र आईडी)",
    "samagra_id_desc": "A unique 9-digit family/individual profile ID mandated by the Madhya Pradesh government to access state benefits.",

    "bank_passbook_name": "Bank Passbook (बैंक पासबुक)",
    "bank_passbook_desc": "Record of bank account transactions, serving as proof of an active bank account for direct benefit transfers (DBT).",

    // 3. Problems Translations
    "aadhar_wrong_name_issue": "My name is misspelled in Aadhaar card, what to do?",
    "aadhar_wrong_name_reason": "Typographical error by the operator during registration or submitting documents with wrong spelling.",
    "aadhar_wrong_name_fix": "Perform Aadhaar demographic update online or visit your nearest Aadhaar Center.",
    "aadhar_wrong_name_guidance": "To correct your name in Aadhaar, you need a government-issued photo ID (PAN Card, Passport, or 10th marksheet) with the correct spelling. Note that you can update your name in Aadhaar only twice in your lifetime.",

    "bank_name_mismatch_issue": "Name mismatch between bank account and government schemes application, what to do?",
    "bank_name_mismatch_reason": "Difference in spelling, middle names, or surnames between government databases and bank passbook records.",
    "bank_name_mismatch_fix": "Submit a name correction application to bank or match application profile with passbook spelling.",
    "bank_name_mismatch_guidance": "Visit your bank branch with your Aadhaar Card and submit a name correction application. Alternatively, you can update your application profile to match the exact spelling shown on your bank passbook.",

    "pan_aadhaar_link_issue": "PAN Card and Aadhaar Card are not linked, how to link?",
    "pan_aadhaar_link_reason": "Failure to complete linking before the government deadline, or minor details mismatch (Name/DoB).",
    "pan_aadhaar_link_fix": "Pay the late fee online on Income Tax e-filing portal and link documents.",
    "pan_aadhaar_link_guidance": "Go to the Income Tax e-filing portal. Pay the late fee of ₹1,000 under Section 234H, then submit the linking request. Make sure your name and Date of Birth match exactly on both cards.",

    "ration_card_member_issue": "How to add a new family member's name in Ration Card?",
    "ration_card_member_reason": "Marriage or birth of a child in the family requiring inclusion for subsidised rations.",
    "ration_card_member_fix": "Submit Online Addition Form on State Food Portal or visit Ration Office.",
    "ration_card_member_guidance": "You need the birth certificate of the child or the marriage certificate/name deletion certificate of the spouse. Make sure they already have an Aadhaar card before applying.",

    "samagra_e_kyc_issue": "Samagra E-KYC is incomplete or mismatched, how to complete?",
    "samagra_e_kyc_reason": "Mismatch between Samagra profile data and Aadhaar details.",
    "samagra_e_kyc_fix": "Perform online Samagra E-KYC using Aadhaar OTP.",
    "samagra_e_kyc_guidance": "Visit the official Samagra portal. Click on 'E-KYC' and enter your Samagra ID. Verify using Aadhaar OTP or Biometrics. Details on Samagra will automatically match Aadhaar.",

    "voter_address_change_issue": "Address changed after relocation, how to update in Voter ID?",
    "voter_address_change_reason": "Relocation due to marriage, employment, or purchasing a new house.",
    "voter_address_change_fix": "Submit Form 8 online on Voters Service Portal.",
    "voter_address_change_guidance": "Submit Form 8 on the NVSP portal. Upload your address proof (water/electricity bill or registry document). A BLO will verify and send the updated Voter ID.",

    "dl_lost_duplicate_issue": "Driving Licence (DL) is lost, how to obtain duplicate?",
    "dl_lost_duplicate_reason": "Misplacement, theft, or card damage.",
    "dl_lost_duplicate_fix": "Apply for 'Duplicate DL' service online on Sarathi Parivahan portal.",
    "dl_lost_duplicate_guidance": "File a lost report online or at police station. Visit Sarathi Portal, enter DL number and DoB, pay fee (₹200-400), and upload the lost report copy.",

    "mudra_loan_rejected_issue": "Mudra Loan is getting rejected or delayed by bank, what to do?",
    "mudra_loan_rejected_reason": "Low credit score (CIBIL), weak business project report, or bank internal policies.",
    "mudra_loan_rejected_fix": "Apply online on Jan Samarth or Udyam portal with strong project report.",
    "mudra_loan_rejected_guidance": "Ensure your credit score is clear. Prepare a detailed project report. If banks deny without reason, register a complaint with the bank's Nodal Officer or District Industries Center.",

    "travel_concession_disabled_issue": "How to get Divyangjan Travel Concession Card for bus/railway?",
    "travel_concession_disabled_reason": "Disability certificate not verified online, or lack of concession rules awareness.",
    "travel_concession_disabled_fix": "Register on UDID portal and submit concession card request at DRM office.",
    "travel_concession_disabled_guidance": "Register on swavlambancard.gov.in. Get Railway Concession Certificate signed by government doctor. Submit it to DRM office to get concession photo card."
  }
};

export const translate = (key, lang, defaultValue) => {
  if (lang === 'en' && DICTIONARY.en[key]) {
    return DICTIONARY.en[key];
  }
  return defaultValue;
};

export const INDIAN_LANGUAGES = [
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'en', label: 'English' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'as', label: 'অসমীয়া (Assamese)' },
  { code: 'brx', label: 'बड़ो (Bodo)' },
  { code: 'doi', label: 'डोगरी (Dogri)' },
  { code: 'kok', label: 'कोंकणी (Konkani)' },
  { code: 'mai', label: 'मैथिली (Maithili)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'mni', label: 'মনিपुरী (Manipuri)' },
  { code: 'ne', label: 'नेपाली (Nepali)' },
  { code: 'or', label: 'ଓଡ଼िଆ (Odia)' },
  { code: 'sa', label: 'संस्कृत (Sanskrit)' },
  { code: 'sat', label: 'संताली (Santali)' },
  { code: 'sd', label: 'सिंधी (Sindhi)' }
];

export const translateDatabase = async (db, targetLang) => {
  if (!db || targetLang === 'hi' || targetLang === 'en') {
    return db;
  }

  try {
    const translateItem = async (text, to) => {
      if (!text) return '';
      // MyMemory Free translation API
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=hi|${to}`;
      const res = await fetch(url);
      if (!res.ok) return text;
      const json = await res.json();
      return json.responseData.translatedText || text;
    };

    // We translate the top items for dynamic translation demo to respect api speed limits
    const schemesPromises = db.schemes.map(async (s) => ({
      ...s,
      name: await translateItem(s.name, targetLang),
      description: await translateItem(s.description, targetLang),
      benefits: await translateItem(s.benefits, targetLang)
    }));

    const docsPromises = db.documents.map(async (d) => ({
      ...d,
      name: await translateItem(d.name, targetLang),
      description: await translateItem(d.description, targetLang)
    }));

    const problemsPromises = db.problems.map(async (p) => ({
      ...p,
      issue: await translateItem(p.issue, targetLang),
      possibleReason: await translateItem(p.possibleReason, targetLang),
      requiredFix: await translateItem(p.requiredFix, targetLang),
      officialGuidance: await translateItem(p.officialGuidance, targetLang)
    }));

    const schemes = await Promise.all(schemesPromises);
    const documents = await Promise.all(docsPromises);
    const problems = await Promise.all(problemsPromises);

    return { schemes, documents, problems };
  } catch (e) {
    console.error("Translation compilation failed:", e);
    return db;
  }
};
