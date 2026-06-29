/* SarkarSaathi Global Application Logic */

const App = (() => {
  // Default User Profile for Hackathon Demo
  const DEFAULT_PROFILE = {
    name: "Jitendra Kumar",
    email: "jitendra@example.com",
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

  // Initialize Profile in LocalStorage
  function initProfile() {
    // If logged-in status is not set, default to guest (false)
    if (localStorage.getItem('sarkar_saathi_logged_in') === null) {
      localStorage.setItem('sarkar_saathi_logged_in', 'false');
    }
  }

  function getProfile() {
    initProfile();
    const isLoggedIn = localStorage.getItem('sarkar_saathi_logged_in') === 'true';
    
    if (isLoggedIn) {
      if (!localStorage.getItem('sarkar_saathi_profile')) {
        localStorage.setItem('sarkar_saathi_profile', JSON.stringify(DEFAULT_PROFILE));
      }
      return JSON.parse(localStorage.getItem('sarkar_saathi_profile'));
    } else {
      // Guest profile: temporary inputs saved here so eligibility checks still function
      if (!localStorage.getItem('sarkar_saathi_guest_profile')) {
        const guestProfile = {
          name: "अतिथि (Guest)",
          email: "लॉगिन करके डेटा सहेजें",
          state: "",
          age: "",
          gender: "",
          category: "",
          occupation: "",
          income: "",
          ruralUrban: "",
          disability: "No",
          documents: []
        };
        localStorage.setItem('sarkar_saathi_guest_profile', JSON.stringify(guestProfile));
      }
      return JSON.parse(localStorage.getItem('sarkar_saathi_guest_profile'));
    }
  }

  function saveProfile(profile) {
    const isLoggedIn = localStorage.getItem('sarkar_saathi_logged_in') === 'true';
    if (isLoggedIn) {
      localStorage.setItem('sarkar_saathi_profile', JSON.stringify(profile));
    } else {
      localStorage.setItem('sarkar_saathi_guest_profile', JSON.stringify(profile));
    }
  }

  // Login Modal HTML Injection
  function injectLoginModal() {
    if (document.getElementById('login-modal-backdrop')) return;

    const modalHtml = `
      <div id="login-modal-backdrop" class="modal-backdrop">
        <div class="modal" style="max-width: 400px; padding: 24px; border-radius: var(--radius-lg); background-color: var(--card-bg);">
          <div class="modal-header" style="border:none; padding:0; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center;">
            <h3 class="modal-title" style="font-size: 18px; font-weight:700; color:var(--primary-color); display:flex; align-items:center; gap:8px;">
              <i class="fas fa-lock" style="color: var(--tricolor-saffron);"></i> <span>सुरक्षित लॉगिन (Secure Login)</span>
            </h3>
            <button class="modal-close" onclick="App.closeLoginModal()">&times;</button>
          </div>
          <div class="modal-body" style="padding:0;">
            <form id="login-modal-form" onsubmit="App.handleLoginSubmit(evt => evt.preventDefault())">
              <div class="form-group mb-12" style="display:flex; flex-direction:column; gap:6px;">
                <label style="font-size:13px; font-weight:600; color:var(--text-primary);">मोबाइल नंबर या ईमेल (Mobile / Email)</label>
                <input type="text" id="login-username" class="form-control" placeholder="उदा. 9876543210" required style="padding:10px;">
              </div>
              <div class="form-group mb-24" style="display:flex; flex-direction:column; gap:6px; margin-bottom:20px;">
                <label style="font-size:13px; font-weight:600; color:var(--text-primary);">पासवर्ड या ओटीपी (Password / OTP)</label>
                <input type="password" id="login-password" class="form-control" placeholder="उदा. 1234" required style="padding:10px;">
              </div>
              <button type="button" class="btn btn-primary" onclick="App.handleLoginSubmit()" style="width:100%; padding:12px;">
                लॉगिन करें (Login)
              </button>
            </form>
            <div style="font-size:11px; color:var(--text-muted); text-align:center; margin-top:16px; line-height:1.4;">
              * हैकथॉन टेस्टिंग के लिए आप <strong>कोई भी विवरण</strong> डालकर लॉगिन बटन दबा सकते हैं। यह जितेंद्र कुमार का प्रोफाइल लोड कर देगा।
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  function showLoginModal() {
    injectLoginModal();
    const backdrop = document.getElementById('login-modal-backdrop');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeLoginModal() {
    const backdrop = document.getElementById('login-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function handleLoginSubmit() {
    localStorage.setItem('sarkar_saathi_logged_in', 'true');
    // Load default profile on fresh login
    localStorage.setItem('sarkar_saathi_profile', JSON.stringify(DEFAULT_PROFILE));
    closeLoginModal();
    window.location.reload();
  }

  function logout() {
    localStorage.setItem('sarkar_saathi_logged_in', 'false');
    // Clear guest inputs
    localStorage.removeItem('sarkar_saathi_guest_profile');
    window.location.reload();
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

    // Populate drawer profile card depending on login state
    const isLoggedIn = localStorage.getItem('sarkar_saathi_logged_in') === 'true';
    const profile = getProfile();
    const usernameEl = document.querySelector('.drawer-username');
    const emailEl = document.querySelector('.drawer-email');
    const avatarEl = document.querySelector('.drawer-avatar');
    const logoutBtn = document.querySelector('.drawer-logout');
    
    if (isLoggedIn) {
      if (usernameEl && profile.name) usernameEl.textContent = profile.name;
      if (emailEl && profile.email) emailEl.textContent = profile.email;
      if (avatarEl && profile.name) avatarEl.textContent = profile.name.charAt(0);
      
      if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>लॉगआउट (Logout)</span>';
        logoutBtn.style.color = 'var(--danger-color)';
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          logout();
        };
      }
    } else {
      if (usernameEl) usernameEl.textContent = "अतिथि (Guest User)";
      if (emailEl) emailEl.textContent = "लॉगिन करके डेटा सहेजें";
      if (avatarEl) avatarEl.innerHTML = '<i class="fas fa-user-secret" style="font-size: 20px;"></i>';
      
      if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>लॉगिन करें (Login)</span>';
        logoutBtn.style.color = 'var(--primary-color)';
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          showLoginModal();
        };
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
    initProfile();
    initTheme();
    initDrawer();
    initActiveLinks();

    // Bind global theme toggle click
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Bind profile button in header
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
      profileBtn.removeAttribute('onclick'); // remove static inline attribute
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isLoggedIn = localStorage.getItem('sarkar_saathi_logged_in') === 'true';
        if (isLoggedIn) {
          App.navigateTo('schemes.html');
        } else {
          showLoginModal();
        }
      });
    }
  }

  // Document-ready hook
  document.addEventListener('DOMContentLoaded', init);

  return {
    getProfile,
    saveProfile,
    navigateTo,
    getDocIconClass,
    showLoginModal,
    closeLoginModal,
    handleLoginSubmit,
    logout
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
} else {
  window.App = App;
}
