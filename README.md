# SarkarSaathi - Your Smart Government Guide (आपका स्मार्ट सरकारी मार्गदर्शक)

SarkarSaathi is a mobile-first, AI-powered Government Assistance Platform built for the **Build For Good 2026 Hackathon**. 

It is designed to help Indian citizens navigate government schemes, verify eligibility, understand document dependencies, resolve application errors, and get bilingual AI-assisted guidance, all in simple Hindi (Devanagari) combined with English.

---

## 🌟 Key Features

1. **Smart Scheme Finder (स्मार्ट योजना खोजक):** Check eligibility dynamically based on state, age, gender, category, occupation, income, and physical ability.
2. **State Filter (राज्य फ़िल्टर):** Shows central government schemes + chosen state schemes (e.g. Madhya Pradesh, Gujarat) while hiding other states.
3. **Document Sahayak (दस्तावेज़ सहायक):** Step-by-step guidance to apply, update, correct, download, or check status for essential documents (Aadhaar, PAN, Voter ID, Domicile, etc.).
4. **Document Dependency Engine (दस्तावेज़ निर्भरता):** Automatically displays which underlying documents are required to obtain another document.
5. **Smart Eligibility Booster (पात्रता बूस्टर):** Analyzes missing documents and tells users which schemes they can unlock once they obtain those documents.
6. **Missing Document Detector (लापता दस्तावेज़ पहचान):** Inside each scheme, compares the scheme's required documents against the user's possessed documents and highlights missing ones with direct Document Sahayak links.
7. **Problem Solver (समस्या समाधान):** Resolves common issues (e.g., mismatched names on Aadhaar, lost cards) with step-by-step solutions.
8. **AI Government Assistant (एआई सहायक):** Chat simulator equipped with quick-reply cards and keyword matching, ready for API integration.

---

## 📂 Folder Structure

```
sarkarsaathi/
│
├── index.html          # Homepage
├── schemes.html        # Scheme Finder Page
├── documents.html      # Document Sahayak Page
├── problems.html       # Problem Solver Page
├── assistant.html      # AI Assistant Page
├── result.html         # Smart Eligibility Results Page
│
├── css/
│   ├── variables.css   # Global color codes, margins, fonts
│   ├── common.css      # Header, Footer, Bottom Nav, Buttons, Cards
│   ├── home.css        # Hero, Stats, FAQs
│   ├── schemes.css     # Scheme filter inputs, card details
│   ├── documents.css   # Document workflow stages
│   ├── assistant.css   # Chat bubble layouts
│   ├── problem.css     # Error warnings and resolutions
│   └── responsive.css  # Viewport optimization (mobile, tablet, desktop)
│
├── js/
│   ├── app.js          # Shared navbar, drawer, theme toggles, profile
│   ├── data-loader.js  # Async JSON fetchers & local cache
│   ├── search.js       # Global text search algorithm
│   ├── filter.js       # Eligibility matching and dependency logic
│   ├── schemes.js      # Schemes list controller
│   ├── documents.js    # Document Sahayak controller
│   ├── assistant.js    # AI Assistant simulator & API outline
│   └── problems.js     # Problem Solver controller
│
├── data/
│   ├── schemes.json    # Scheme profiles database
│   ├── documents.json  # Document workflow & requirements
│   ├── problems.json   # Troubleshooting database
│   └── rules.json      # UI options (states, categories) and FAQs
│
├── assets/
│   ├── images/         # Media
│   └── icons/          # SVGs/Icons
│
└── README.md
```

## 🛠️ Technology Stack

* **Structure:** Semantic HTML5
* **Styling:** Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid)
* **Interactions:** Vanilla JavaScript (ES6 Modules)
* **Data Store:** Local JSON Files
