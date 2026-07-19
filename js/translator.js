// Translator module for Sarkar Saathi - Production Ready Version
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
    { code: 'mni', name: 'Manipuri', nativeName: 'मৈতैलोन' },
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
    localStorage.setItem('sarkar_saathi_lang', langCode);
    setCookie('googtrans', `/auto/${langCode}`, 30);

    // Call index.html's local toggleLanguage if it exists
    if (typeof window.toggleLanguage === 'function') {
      const baseLang = (langCode === 'en' || langCode === 'hi') ? langCode : 'hi';
      window.toggleLanguage(baseLang);
    }

    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      location.reload();
    }
  }

  // Inject Google Translate script and styling
  function injectGoogleTranslate() {
    if (!document.getElementById('google_translate_element')) {
      const gtDiv = document.createElement('div');
      gtDiv.id = 'google_translate_element';
      gtDiv.style.display = 'none';
      document.body.appendChild(gtDiv);
    }

    const style = document.createElement('style');
    style.innerHTML = `
      /* Hide standard Google Translate elements */
      .goog-te-banner-frame.skiptranslate, 
      .goog-te-banner-frame, 
      .goog-te-balloon-frame,
      .goog-te-banner,
      iframe[id^=":"] {
        display: none !important;
        visibility: hidden !important;
      }
      body {
        top: 0px !important;
      }
      .goog-text-highlight {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      .goog-tooltip, .goog-tooltip:hover {
        display: none !important;
      }
      
      /* Glassmorphism drop-down styling */
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
        width: 22rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 9999;
        padding: 0.75rem;
        animation: langSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .lang-dropdown-menu.show {
        display: block;
      }
      .lang-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.25rem;
        max-height: 16rem;
        overflow-y: auto;
        padding-right: 0.25rem;
      }
      /* Custom Scrollbar */
      .lang-grid::-webkit-scrollbar {
        width: 4px;
      }
      .lang-grid::-webkit-scrollbar-track {
        background: transparent;
      }
      .lang-grid::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      .lang-dropdown-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        color: #334155;
        border-radius: 0.5rem;
        transition: all 0.15s ease;
        cursor: pointer;
      }
      .lang-dropdown-item:hover {
        background-color: #f1f5f9;
        color: #0b6623;
        transform: translateY(-0.5px);
      }
      .lang-dropdown-item.active {
        background-color: #e8f5e9;
        color: #0b6623;
        font-weight: 700;
      }
      
      @keyframes langSlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Dark mode overrides */
      [data-theme="dark"] .lang-dropdown-menu {
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(51, 65, 85, 0.8);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
      }
      [data-theme="dark"] .lang-dropdown-item {
        color: #cbd5e1;
      }
      [data-theme="dark"] .lang-dropdown-item:hover {
        background-color: #334155;
        color: #10b981;
      }
      [data-theme="dark"] .lang-dropdown-item.active {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
      [data-theme="dark"] .lang-grid::-webkit-scrollbar-thumb {
        background: #475569;
      }
    `;
    document.head.appendChild(style);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'auto',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.onerror = () => console.warn("Google Translate could not be loaded. Running offline mode.");
    document.body.appendChild(script);
  }

  function injectSelector() {
    // 1. DESKTOP / HEADER INJECTION
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

    if (headerControls) {
      // Remove any pre-existing language controls to avoid overlap
      const existingPill = headerControls.querySelector('.bg-slate-100.rounded-full.p-0.5') || document.getElementById('lang-btn-hi')?.parentElement;
      if (existingPill) {
        existingPill.remove();
      }

      const currentLangCode = getSelectedLanguage();
      const currentLangObj = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

      const dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'lang-dropdown-container mr-2';
      
      dropdownContainer.innerHTML = `
        <button id="lang-dropdown-btn" class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 transition-all focus:outline-none">
          <i class="fas fa-globe text-brand-primary dark:text-emerald-500 animate-pulse"></i>
          <span>${currentLangObj.nativeName}</span>
          <i class="fas fa-chevron-down text-[8px] opacity-70"></i>
        </button>
        <div id="lang-dropdown-menu" class="lang-dropdown-menu">
          <div class="mb-2">
            <input type="text" id="lang-search" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand-primary text-slate-700 dark:text-slate-200" placeholder="भाषा खोजें (Search)...">
          </div>
          <div class="lang-grid">
            ${LANGUAGES.map(lang => `
              <div class="lang-dropdown-item ${lang.code === currentLangCode ? 'active' : ''}" data-lang="${lang.code}" data-name="${lang.name.toLowerCase()}" data-native="${lang.nativeName.toLowerCase()}">
                <span>${lang.nativeName}</span>
                ${lang.code === currentLangCode ? '<i class="fas fa-check text-[10px] text-emerald-600 dark:text-emerald-400"></i>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const themeToggle = headerControls.querySelector('.theme-toggle');
      if (themeToggle) {
        headerControls.insertBefore(dropdownContainer, themeToggle);
      } else {
        headerControls.appendChild(dropdownContainer);
      }

      // Dropdown handlers
      const dropdownBtn = dropdownContainer.querySelector('#lang-dropdown-btn');
      const dropdownMenu = dropdownContainer.querySelector('#lang-dropdown-menu');
      const searchInput = dropdownContainer.querySelector('#lang-search');

      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        if (dropdownMenu.classList.contains('show') && searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      });

      // Filter logic
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          dropdownMenu.querySelectorAll('.lang-dropdown-item').forEach(item => {
            const name = item.getAttribute('data-name');
            const native = item.getAttribute('data-native');
            if (name.includes(query) || native.includes(query)) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
        searchInput.addEventListener('click', (e) => e.stopPropagation());
      }

      // Handle item selection
      dropdownMenu.querySelectorAll('.lang-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const langCode = item.getAttribute('data-lang');
          translatePage(langCode);
        });
      });

      document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
    }

    // 2. MOBILE DRAWER INJECTION
    const mobileDrawer = document.querySelector('.drawer');
    if (mobileDrawer && !mobileDrawer.querySelector('.mobile-lang-section')) {
      const currentLangCode = getSelectedLanguage();
      const langSection = document.createElement('div');
      langSection.className = 'mobile-lang-section border-t border-slate-100 dark:border-slate-800 p-5 mt-4';
      
      langSection.innerHTML = `
        <div class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2 tracking-wider flex items-center gap-1.5">
          <i class="fas fa-globe text-emerald-600"></i>
          <span>भाषा चुनें / Select Language</span>
        </div>
        <select id="mobile-lang-select" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary">
          ${LANGUAGES.map(lang => `
            <option value="${lang.code}" ${lang.code === currentLangCode ? 'selected' : ''}>
              ${lang.nativeName} (${lang.name})
            </option>
          `).join('')}
        </select>
      `;
      mobileDrawer.appendChild(langSection);

      const selectEl = langSection.querySelector('#mobile-lang-select');
      selectEl.addEventListener('change', (e) => {
        translatePage(e.target.value);
      });
    }
  }

  function init() {
    if (!getCookie('googtrans') && !localStorage.getItem('sarkar_saathi_lang')) {
      localStorage.setItem('sarkar_saathi_lang', 'hi');
      setCookie('googtrans', '/auto/hi', 30);
    }

    injectGoogleTranslate();
    
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
