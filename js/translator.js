// Translator module for Sarkar Saathi
const Translator = (() => {
  const LANGUAGES = [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
    { code: 'gom', name: 'Konkani', nativeName: 'कोंकणी' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mni', name: 'Manipuri', nativeName: 'मৈতৈলোন' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
    { code: 'sat', name: 'Santhali', nativeName: 'संथाली' },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
  ];

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    // Set cookie for root path and hostname
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
    document.cookie = name + "=" + (value || "") + expires + "; path=/; domain=" + window.location.hostname;
  }

  function getSelectedLanguage() {
    const googtrans = getCookie('googtrans');
    if (googtrans) {
      const parts = googtrans.split('/');
      if (parts.length >= 3) {
        return parts[2];
      }
    }
    return localStorage.getItem('sarkar_saathi_lang') || 'hi';
  }

  function translatePage(langCode) {
    // Save language code
    localStorage.setItem('sarkar_saathi_lang', langCode);
    
    // Set google translate cookie (both forms just to be safe)
    setCookie('googtrans', `/auto/${langCode}`, 30);

    // Call index.html's local toggleLanguage if it exists (for dual local-translation update)
    if (typeof window.toggleLanguage === 'function') {
      const baseLang = (langCode === 'en' || langCode === 'hi') ? langCode : 'hi';
      window.toggleLanguage(baseLang);
    }

    // Try to trigger combo element if loaded
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      // If combo is not loaded yet, reload the page so the cookie takes effect on load
      location.reload();
    }
  }

  // Inject Google Translate script and elements
  function injectGoogleTranslate() {
    // Add Google Translate container if it doesn't exist
    if (!document.getElementById('google_translate_element')) {
      const gtDiv = document.createElement('div');
      gtDiv.id = 'google_translate_element';
      gtDiv.style.display = 'none';
      document.body.appendChild(gtDiv);
    }

    // Hide Google Translate widgets using CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate, .goog-te-banner-frame, .goog-te-balloon-frame {
        display: none !important;
      }
      body {
        top: 0px !important;
      }
      .goog-text-highlight {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      .goog-tooltip {
        display: none !important;
      }
      .goog-tooltip:hover {
        display: none !important;
      }
      
      /* Custom styled select box container */
      .lang-dropdown-container {
        position: relative;
        display: inline-block;
      }
      .lang-dropdown-menu {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        margin-top: 0.5rem;
        width: 12rem;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 9999;
        max-height: 20rem;
        overflow-y: auto;
      }
      .lang-dropdown-menu.show {
        display: block;
      }
      .lang-dropdown-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
        color: #334155;
        text-align: left;
        transition: background-color 0.2s;
        cursor: pointer;
        border-bottom: 1px solid #f1f5f9;
      }
      .lang-dropdown-item:last-child {
        border-bottom: none;
      }
      .lang-dropdown-item:hover {
        background-color: #f8fafc;
        color: #0b6623;
      }
      .lang-dropdown-item.active {
        background-color: #e8f5e9;
        color: #0b6623;
        font-weight: bold;
      }
      
      /* Dark mode themes */
      [data-theme="dark"] .lang-dropdown-menu {
        background-color: #1e293b;
        border-color: #334155;
      }
      [data-theme="dark"] .lang-dropdown-item {
        color: #cbd5e1;
        border-bottom-color: #334155;
      }
      [data-theme="dark"] .lang-dropdown-item:hover {
        background-color: #334155;
        color: #10b981;
      }
      [data-theme="dark"] .lang-dropdown-item.active {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
    `;
    document.head.appendChild(style);

    // Initialize function
    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'auto',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    // Load Google script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }

  function injectSelector() {
    // Find theme toggle button wrapper in header
    const targetContainers = [
      document.querySelector('header .flex.items-center.gap-4'),
      document.querySelector('header .flex.items-center.gap-2'),
      document.querySelector('.header .flex.items-center.gap-2'),
      document.querySelector('header div:last-child')
    ];

    let headerControls = null;
    for (const container of targetContainers) {
      if (container && (container.querySelector('.theme-toggle') || container.querySelector('#lang-btn-hi'))) {
        headerControls = container;
        break;
      }
    }

    if (!headerControls) return;

    // If there is an existing language pill (in index.html), remove it to prevent overlap
    const existingPill = headerControls.querySelector('.bg-slate-100.rounded-full.p-0.5') || document.getElementById('lang-btn-hi')?.parentElement;
    if (existingPill) {
      existingPill.remove();
    }

    const currentLangCode = getSelectedLanguage();
    const currentLangObj = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

    // Create dropdown element
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'lang-dropdown-container mr-2';
    
    dropdownContainer.innerHTML = `
      <button id="lang-dropdown-btn" class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 transition-all focus:outline-none">
        <i class="fas fa-globe text-brand-primary dark:text-emerald-500"></i>
        <span>${currentLangObj.nativeName}</span>
        <i class="fas fa-chevron-down text-[8px] opacity-70"></i>
      </button>
      <div id="lang-dropdown-menu" class="lang-dropdown-menu">
        ${LANGUAGES.map(lang => `
          <div class="lang-dropdown-item ${lang.code === currentLangCode ? 'active' : ''}" data-lang="${lang.code}">
            ${lang.nativeName} (${lang.name})
          </div>
        `).join('')}
      </div>
    `;

    // Insert before the theme-toggle button
    const themeToggle = headerControls.querySelector('.theme-toggle');
    if (themeToggle) {
      headerControls.insertBefore(dropdownContainer, themeToggle);
    } else {
      headerControls.appendChild(dropdownContainer);
    }

    // Toggle dropdown visibility
    const dropdownBtn = dropdownContainer.querySelector('#lang-dropdown-btn');
    const dropdownMenu = dropdownContainer.querySelector('#lang-dropdown-menu');

    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    // Handle language selection
    dropdownMenu.querySelectorAll('.lang-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const langCode = item.getAttribute('data-lang');
        translatePage(langCode);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });
  }

  function init() {
    // If no language is selected yet, default to Hindi ('hi')
    if (!getCookie('googtrans') && !localStorage.getItem('sarkar_saathi_lang')) {
      localStorage.setItem('sarkar_saathi_lang', 'hi');
      setCookie('googtrans', '/auto/hi', 30);
    }

    injectGoogleTranslate();
    
    // Inject custom selector when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectSelector);
    } else {
      injectSelector();
    }
  }

  init();

  return {
    translatePage,
    getSelectedLanguage
  };
})();
