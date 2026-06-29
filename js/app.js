/* SarkarSaathi Global Application Logic */

const App = (() => {
  // Default Profile used to pre-populate form states
  const DEFAULT_PROFILE = {
    name: "",
    email: "",
    state: "Madhya Pradesh",
    age: "25",
    gender: "Male",
    category: "OBC",
    occupation: "Student",
    income: "120000",
    ruralUrban: "Rural",
    disability: "No",
    documents: ["aadhaar", "pan", "bank_passbook"]
  };

  function getProfile() {
    if (!localStorage.getItem('sarkar_saathi_profile')) {
      localStorage.setItem('sarkar_saathi_profile', JSON.stringify(DEFAULT_PROFILE));
    }
    return JSON.parse(localStorage.getItem('sarkar_saathi_profile'));
  }

  function saveProfile(profile) {
    localStorage.setItem('sarkar_saathi_profile', JSON.stringify(profile));
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('sarkar_saathi_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sarkar_saathi_theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const iconEl = document.querySelector('.theme-toggle i');
    if (iconEl) {
      if (theme === 'dark') {
        iconEl.className = 'fas fa-sun';
      } else {
        iconEl.className = 'fas fa-moon';
      }
    }
  }

  // Drawer / Sidebar Menu
  function initDrawer() {
    const menuBtn = document.querySelector('.menu-toggle');
    const backdrop = document.querySelector('.drawer-backdrop');
    const drawer = document.querySelector('.drawer');
    
    if (menuBtn && backdrop && drawer) {
      menuBtn.addEventListener('click', () => {
        drawer.classList.add('active');
        backdrop.classList.add('active');
      });

      backdrop.addEventListener('click', () => {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
      });

      // Bind custom actions in drawer
      const drawerClose = drawer.querySelector('.drawer-close');
      if (drawerClose) {
        drawerClose.addEventListener('click', () => {
          drawer.classList.remove('active');
          backdrop.classList.remove('active');
        });
      }
    }
  }

  // Highlight active page link
  function initActiveLinks() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    // Desktop header links
    const headerLinks = document.querySelectorAll('.header-nav-item');
    headerLinks.forEach(link => {
      const href = link.getAttribute('onclick') || '';
      if (href.includes(pageName)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile bottom nav links
    const bottomLinks = document.querySelectorAll('.bottom-nav-item');
    bottomLinks.forEach(link => {
      const href = link.getAttribute('href') || link.getAttribute('onclick') || '';
      if (href.includes(pageName)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Sidebar drawer links
    const drawerLinks = document.querySelectorAll('.drawer-item');
    drawerLinks.forEach(link => {
      const href = link.getAttribute('onclick') || '';
      if (href.includes(pageName)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Redirect Helpers
  function navigateTo(url) {
    window.location.href = url;
  }

  // Document Icon Mapper
  function getDocIconClass(docId) {
    const iconMap = {
      aadhaar: 'fas fa-id-card',
      pan: 'fas fa-address-card',
      income_certificate: 'fas fa-rupee-sign',
      domicile: 'fas fa-home',
      caste_certificate: 'fas fa-users',
      birth_certificate: 'fas fa-baby',
      passport: 'fas fa-passport',
      samagra_id: 'fas fa-user-friends',
      bank_passbook: 'fas fa-university'
    };
    return iconMap[docId] || 'fas fa-file-alt';
  }

  // Initialize Page Setup
  function init() {
    initTheme();
    initDrawer();
    initActiveLinks();

    // Bind global theme toggle click
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  }

  // Document-ready hook
  document.addEventListener('DOMContentLoaded', init);

  return {
    getProfile,
    saveProfile,
    navigateTo,
    getDocIconClass
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
} else {
  window.App = App;
}
