/* SarkarSaathi Test Suite - Eligibility and Booster Logic */

const fs = require('fs');
const path = require('path');

// Load modules using relative paths
const Filter = require('./js/filter.js');

// Load databases
const schemes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/schemes.json'), 'utf8'));

// Test Cases
const runTests = () => {
  console.log("=== STARTING SARKARSAATHI ELIGIBILITY ENGINE TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] - ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] - ${message}`);
      failed++;
    }
  }

  // Test Case 1: PMJDY Scheme Eligibility (Central, General/All)
  const pmjdyScheme = schemes.find(s => s.id === 'pmjdy');
  const user1 = {
    state: "Madhya Pradesh",
    age: 25,
    gender: "Male",
    category: "General",
    occupation: "Student",
    income: 120000,
    ruralUrban: "Rural",
    disability: "No"
  };
  
  assert(
    Filter.isDemographicallyEligible(user1, pmjdyScheme),
    "User 1 should be demographically eligible for PMJDY (Central, age 25, income 1.2L)"
  );

  // Test Case 2: PMUY (Ujjwala) Scheme Eligibility (Central, Female, maxIncome: 1.5L)
  const pmuyScheme = schemes.find(s => s.id === 'pmuy');
  const userMale = {
    state: "Madhya Pradesh",
    age: 25,
    gender: "Male",
    category: "General",
    occupation: "Student",
    income: 80000,
    ruralUrban: "Rural",
    disability: "No"
  };
  const userFemaleLowIncome = {
    state: "Madhya Pradesh",
    age: 25,
    gender: "Female",
    category: "General",
    occupation: "Student",
    income: 80000,
    ruralUrban: "Rural",
    disability: "No"
  };
  const userFemaleHighIncome = {
    state: "Madhya Pradesh",
    age: 25,
    gender: "Female",
    category: "General",
    occupation: "Student",
    income: 200000,
    ruralUrban: "Rural",
    disability: "No"
  };

  assert(
    !Filter.isDemographicallyEligible(userMale, pmuyScheme),
    "Male user should NOT be eligible for PMUY (Ujjwala is female-only)"
  );
  assert(
    Filter.isDemographicallyEligible(userFemaleLowIncome, pmuyScheme),
    "Low income female should be eligible for PMUY"
  );
  assert(
    !Filter.isDemographicallyEligible(userFemaleHighIncome, pmuyScheme),
    "High income female (2.0L) should NOT be eligible for PMUY (Income limit is 1.5L)"
  );

  // Test Case 3: State-specific Scheme (Ladli Behna in Madhya Pradesh)
  const ladliBehnaScheme = schemes.find(s => s.id === 'ladli_behna');
  const userMPOldFemale = {
    state: "Madhya Pradesh",
    age: 35,
    gender: "Female",
    category: "General",
    occupation: "Student",
    income: 100000,
    ruralUrban: "Rural",
    disability: "No"
  };
  const userRajasthanFemale = {
    state: "Rajasthan",
    age: 35,
    gender: "Female",
    category: "General",
    occupation: "Student",
    income: 100000,
    ruralUrban: "Rural",
    disability: "No"
  };
  const userMPYoungFemale = {
    state: "Madhya Pradesh",
    age: 18,
    gender: "Female",
    category: "General",
    occupation: "Student",
    income: 100000,
    ruralUrban: "Rural",
    disability: "No"
  };

  assert(
    Filter.isDemographicallyEligible(userMPOldFemale, ladliBehnaScheme),
    "35 year old MP Female should be eligible for Ladli Behna"
  );
  assert(
    !Filter.isDemographicallyEligible(userRajasthanFemale, ladliBehnaScheme),
    "Rajasthan Female should NOT be eligible for MP State Scheme"
  );
  assert(
    !Filter.isDemographicallyEligible(userMPYoungFemale, ladliBehnaScheme),
    "18 year old MP Female should NOT be eligible for Ladli Behna (Min age is 21)"
  );

  // Test Case 4: Missing Document Detection
  const pmjdyReqs = pmjdyScheme.requiredDocuments;
  const userDocs1 = ["aadhaar", "photo"];
  const docCheck1 = Filter.detectMissingDocuments(userDocs1, pmjdyReqs);

  assert(
    docCheck1.missing.includes("mobile_number") && docCheck1.missing.length === 1,
    "Missing Document Detector should identify 'mobile_number' as missing"
  );
  assert(
    docCheck1.available.includes("aadhaar") && docCheck1.available.includes("photo"),
    "Missing Document Detector should identify 'aadhaar' and 'photo' as available"
  );

  // Test Case 5: Smart Eligibility Booster
  const testProfile = {
    state: "Madhya Pradesh",
    age: 25,
    gender: "Female",
    category: "General",
    occupation: "Student",
    income: 120000,
    ruralUrban: "Rural",
    disability: "No"
  };
  const testDocs = ["aadhaar", "pan", "bank_passbook", "photo", "mobile_number"];

  const boosterResult = Filter.getBoostedEligibility(testProfile, schemes, testDocs);

  assert(
    boosterResult.currentlyEligible.some(s => s.id === 'pmjdy'),
    "User should be currently eligible for PMJDY (all required docs owned)"
  );
  
  assert(
    !boosterResult.currentlyEligible.some(s => s.id === 'ladli_behna'),
    "User should NOT be currently eligible for Ladli Behna (missing samagra_id, domicile, income_certificate)"
  );

  // Check if Ladli Behna is in the booster mapping for samagra_id
  assert(
    boosterResult.missingDocMap['samagra_id'] && boosterResult.missingDocMap['samagra_id'].some(s => s.id === 'ladli_behna'),
    "Ladli Behna should be listed under booster unlocking for 'samagra_id'"
  );

  console.log(`\n=== TEST RUN COMPLETED. PASSED: ${passed}, FAILED: ${failed} ===`);
  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
