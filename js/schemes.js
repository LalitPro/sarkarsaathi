/* SarkarSaathi Schemes Page Logic */

document.addEventListener('DOMContentLoaded', async () => {
  // Load necessary JSON data
  await DataLoader.loadAll();
  
  const schemesListEl = document.getElementById('schemes-list');
  const searchInput = document.getElementById('scheme-search-input');
  const stateSelect = document.getElementById('filter-state');
  const categorySelect = document.getElementById('filter-category');
  const occupationSelect = document.getElementById('filter-occupation');
  const genderSelect = document.getElementById('filter-gender');
  const ageInput = document.getElementById('filter-age');
  const incomeInput = document.getElementById('filter-income');
  const residenceSelect = document.getElementById('filter-residence');
  const disabilitySelect = document.getElementById('filter-disability');
  const checkEligibilityBtn = document.getElementById('check-eligibility-btn');
  const documentsGridEl = document.getElementById('filter-documents-grid');
  
  // Category Chips
  const chips = document.querySelectorAll('.chip[data-category]');
  let activeCategoryChip = 'all';

  // Load Rules to populate dropdowns
  const rules = DataLoader.getRules();
  populateDropdown(stateSelect, rules.states, "सभी राज्य (All States)");
  populateDropdown(categorySelect, rules.categories, "सभी श्रेणियां (All Categories)");
  populateDropdown(occupationSelect, rules.occupations, "सभी व्यवसाय (All Occupations)");

  // Load user profile to pre-fill filters
  const profile = App.getProfile();
  prefillFilters(profile);

  // Render initially
  renderSchemes();

  // Set up event listeners for filters
  [searchInput, ageInput, incomeInput].forEach(el => {
    if (el) el.addEventListener('input', renderSchemes);
  });

  [stateSelect, categorySelect, occupationSelect, genderSelect, residenceSelect, disabilitySelect].forEach(el => {
    if (el) el.addEventListener('change', renderSchemes);
  });

  // Category Chips Clicks
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategoryChip = chip.getAttribute('data-category');
      renderSchemes();
    });
  });

  // Watch document checkboxes
  if (documentsGridEl) {
    documentsGridEl.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const label = e.target.closest('.checkbox-label');
        if (label) {
          if (e.target.checked) {
            label.classList.add('checked');
          } else {
            label.classList.remove('checked');
          }
        }
        renderSchemes();
      }
    });
  }

  // Check Eligibility & Go to Results page
  if (checkEligibilityBtn) {
    checkEligibilityBtn.addEventListener('click', () => {
      const currentProfile = gatherProfileFromForm();
      App.saveProfile(currentProfile);
      App.navigateTo('result.html');
    });
  }

  // Populate helper
  function populateDropdown(selectEl, items, defaultText) {
    if (!selectEl || !items) return;
    selectEl.innerHTML = `<option value="">${defaultText}</option>`;
    items.forEach(item => {
      selectEl.innerHTML += `<option value="${item}">${item}</option>`;
    });
  }

  // Pre-fill form from profile
  function prefillFilters(prof) {
    if (stateSelect && prof.state) stateSelect.value = prof.state;
    if (categorySelect && prof.category) categorySelect.value = prof.category;
    if (occupationSelect && prof.occupation) occupationSelect.value = prof.occupation;
    if (genderSelect && prof.gender) genderSelect.value = prof.gender;
    if (ageInput && prof.age) ageInput.value = prof.age;
    if (incomeInput && prof.income) incomeInput.value = prof.income;
    if (residenceSelect && prof.ruralUrban) residenceSelect.value = prof.ruralUrban;
    if (disabilitySelect && prof.disability) disabilitySelect.value = prof.disability;

    // Populating existing documents checklist
    const allDocs = DataLoader.getDocuments();
    if (documentsGridEl && allDocs.length > 0) {
      documentsGridEl.innerHTML = '';
      allDocs.forEach(doc => {
        const isChecked = prof.documents.includes(doc.id);
        documentsGridEl.innerHTML += `
          <label class="checkbox-label ${isChecked ? 'checked' : ''}">
            <input type="checkbox" value="${doc.id}" ${isChecked ? 'checked' : ''}>
            <span>${doc.name.split(' (')[0]}</span>
          </label>
        `;
      });
    }
  }

  // Gather filter inputs into profile object
  function gatherProfileFromForm() {
    const docCheckboxes = documentsGridEl ? documentsGridEl.querySelectorAll('input[type="checkbox"]:checked') : [];
    const ownedDocs = Array.from(docCheckboxes).map(cb => cb.value);

    return {
      name: profile.name || "Jitendra Kumar",
      email: profile.email || "jitendra@example.com",
      state: stateSelect ? stateSelect.value : (profile.state || ""),
      age: ageInput ? ageInput.value : (profile.age || ""),
      gender: genderSelect ? genderSelect.value : (profile.gender || ""),
      category: categorySelect ? categorySelect.value : (profile.category || ""),
      occupation: occupationSelect ? occupationSelect.value : (profile.occupation || ""),
      income: incomeInput ? incomeInput.value : (profile.income || ""),
      ruralUrban: residenceSelect ? residenceSelect.value : (profile.ruralUrban || ""),
      disability: disabilitySelect ? disabilitySelect.value : (profile.disability || ""),
      documents: ownedDocs
    };
  }

  // Render Scheme Cards based on filters
  function renderSchemes() {
    if (!schemesListEl) return;

    let schemes = DataLoader.getSchemes();
    const query = searchInput ? searchInput.value : "";
    const activeProfile = gatherProfileFromForm();

    // 1. Text Search Filter
    if (query) {
      schemes = Search.searchSchemes(query, schemes);
    }

    // 2. Chip Category Filter (Central vs State)
    if (activeCategoryChip === 'central') {
      schemes = schemes.filter(s => s.governmentType === 'Central');
    } else if (activeCategoryChip === 'state') {
      schemes = schemes.filter(s => s.governmentType === 'State');
    }

    // 3. Demographic Eligibility Filter
    schemes = schemes.filter(scheme => Filter.isDemographicallyEligible(activeProfile, scheme));

    // Render Cards HTML
    if (schemes.length === 0) {
      schemesListEl.innerHTML = `
        <div class="card text-center" style="grid-column: 1/-1; padding: 40px 20px;">
          <i class="fas fa-search-minus" style="font-size: 40px; color: var(--text-light); margin-bottom: 12px;"></i>
          <p style="font-size: 14px; color: var(--text-muted);">आपकी खोज के लिए कोई योजना नहीं मिली। कृपया फ़िल्टर बदलें।</p>
        </div>
      `;
      return;
    }

    schemesListEl.innerHTML = '';
    schemes.forEach(scheme => {
      const governmentLabel = scheme.governmentType === 'Central' ? 'केंद्र सरकार (Central Gov)' : `राज्य सरकार (${scheme.state})`;
      const badgeClass = scheme.governmentType === 'Central' ? 'badge-central' : 'badge-state';
      
      // Calculate missing documents
      const docCheck = Filter.detectMissingDocuments(activeProfile.documents, scheme.requiredDocuments || []);
      const docBadgeText = docCheck.missing.length === 0 ? "सभी दस्तावेज़ उपलब्ध" : `${docCheck.missing.length} दस्तावेज़ लापता`;
      const docBadgeClass = docCheck.missing.length === 0 ? 'badge-free' : 'badge-fees';

      schemesListEl.innerHTML += `
        <div class="card scheme-card">
          <div class="scheme-card-header">
            <span class="badge ${badgeClass}">${governmentLabel}</span>
            <span class="badge ${docBadgeClass}">${docBadgeText}</span>
          </div>
          <h3 class="scheme-title mb-12">${scheme.name}</h3>
          <p class="scheme-desc">${scheme.description}</p>
          <div class="scheme-details-row">
            <div class="detail-item">
              <strong>समय सीमा</strong>
              ${scheme.processingTime}
            </div>
            <div class="detail-item">
              <strong>आवेदन का माध्यम</strong>
              ${scheme.applyMode === 'Both' ? 'ऑनलाइन / ऑफलाइन' : (scheme.applyMode === 'Online' ? 'ऑनलाइन (Online)' : 'ऑफलाइन (Offline)')}
            </div>
          </div>
          <button class="btn btn-scheme btn-sm" onclick="SchemesPage.showDetails('${scheme.id}')">विवरण देखें (View Details)</button>
        </div>
      `;
    });
  }

  // Open Details Modal and Bind tabs
  function showDetails(schemeId) {
    const scheme = DataLoader.getSchemeById(schemeId);
    if (!scheme) return;

    const modalBackdrop = document.getElementById('modal-backdrop');
    if (!modalBackdrop) return;

    const activeProfile = gatherProfileFromForm();
    const docCheck = Filter.detectMissingDocuments(activeProfile.documents, scheme.requiredDocuments || []);

    // Get documents names
    const docsDetailsListHTML = scheme.requiredDocuments.map(docId => {
      const docObj = DataLoader.getDocumentById(docId);
      const docName = docObj ? docObj.name : docId;
      const isMissing = docCheck.missing.includes(docId);
      
      if (isMissing) {
        return `
          <div class="detector-item missing">
            <div class="detector-label">
              <span class="detector-status-icon"><i class="fas fa-exclamation-circle"></i></span>
              <span>${docName}</span>
            </div>
            <button class="btn btn-document btn-sm" style="padding: 4px 10px; font-size: 11px;" onclick="SchemesPage.goToDoc('${docId}')">प्राप्त करें</button>
          </div>
        `;
      } else {
        return `
          <div class="detector-item available">
            <div class="detector-label">
              <span class="detector-status-icon"><i class="fas fa-check-circle"></i></span>
              <span>${docName}</span>
            </div>
            <span style="font-size: 11px; color: var(--scheme-color); font-weight: 600;">उपलब्ध</span>
          </div>
        `;
      }
    }).join('');

    // Setup Modal structure
    modalBackdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${scheme.name}</h3>
          <button class="modal-close" onclick="SchemesPage.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tab-navigation">
            <button class="tab-btn active" onclick="SchemesPage.switchTab(event, 'tab-desc')">विवरण</button>
            <button class="tab-btn" onclick="SchemesPage.switchTab(event, 'tab-benefits')">लाभ</button>
            <button class="tab-btn" onclick="SchemesPage.switchTab(event, 'tab-elig')">पात्रता</button>
            <button class="tab-btn" onclick="SchemesPage.switchTab(event, 'tab-docs')">दस्तावेज़</button>
            <button class="tab-btn" onclick="SchemesPage.switchTab(event, 'tab-apply')">आवेदन</button>
          </div>
          
          <div id="tab-desc" class="tab-pane active">
            <h4 class="pane-title">योजना के बारे में (About Scheme)</h4>
            <p style="font-size: 13.5px; line-height: 1.6; margin-bottom: 16px;">${scheme.description}</p>
            <div style="font-size: 13px; color: var(--text-muted); background: var(--bg-color); padding: 12px; border-radius: var(--radius-md);">
              <span style="display: block; margin-bottom: 4px;"><strong>श्रेणी:</strong> ${scheme.governmentType === 'Central' ? 'केंद्रीय योजना' : `राज्य योजना (${scheme.state})`}</span>
              <span><strong>आधिकारिक वेबसाइट:</strong> <a href="${scheme.officialWebsite}" target="_blank" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">${scheme.officialWebsite}</a></span>
            </div>
          </div>
          
          <div id="tab-benefits" class="tab-pane">
            <h4 class="pane-title">योजना के लाभ (Benefits)</h4>
            <p style="font-size: 13.5px; line-height: 1.6;">${scheme.benefits}</p>
          </div>
          
          <div id="tab-elig" class="tab-pane">
            <h4 class="pane-title">पात्रता मापदंड (Eligibility Criteria)</h4>
            <ul class="info-list">
              <li><strong>आयु सीमा:</strong> ${scheme.eligibility.ageMin} से ${scheme.eligibility.ageMax} वर्ष</li>
              <li><strong>लिंग:</strong> ${scheme.eligibility.gender === 'All' ? 'सभी के लिए' : (scheme.eligibility.gender === 'Female' ? 'केवल महिलाएँ' : 'केवल पुरुष')}</li>
              ${scheme.eligibility.maxIncome ? `<li><strong>अधिकतम वार्षिक आय:</strong> ₹${scheme.eligibility.maxIncome} तक</li>` : ''}
              ${scheme.eligibility.occupations.includes('All') ? '' : `<li><strong>पात्र व्यवसाय:</strong> ${scheme.eligibility.occupations.join(', ')}</li>`}
              ${scheme.eligibility.category.includes('All') ? '' : `<li><strong>पात्र वर्ग (Category):</strong> ${scheme.eligibility.category.join(', ')}</li>`}
              ${scheme.eligibility.ruralUrban === 'Both' ? '' : `<li><strong>क्षेत्र:</strong> ${scheme.eligibility.ruralUrban === 'Rural' ? 'केवल ग्रामीण' : 'केवल शहरी'}</li>`}
              ${scheme.eligibility.disability === 'Required' ? '<li><strong>विशेष:</strong> केवल दिव्यांग नागरिकों के लिए</li>' : ''}
            </ul>
          </div>
          
          <div id="tab-docs" class="tab-pane">
            <h4 class="pane-title">आवश्यक दस्तावेज़ (Required Documents)</h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">आपके पास उपलब्ध और लापता दस्तावेज़ों की स्थिति नीचे दी गई है:</p>
            <div class="detector-list">
              ${docsDetailsListHTML}
            </div>
          </div>
          
          <div id="tab-apply" class="tab-pane">
            <h4 class="pane-title">आवेदन की प्रक्रिया (Apply Process)</h4>
            <ul class="info-list">
              <li><strong>आवेदन प्रकार:</strong> ${scheme.applyMode === 'Both' ? 'ऑनलाइन और ऑफलाइन' : (scheme.applyMode === 'Online' ? 'केवल ऑनलाइन (Online)' : 'केवल ऑफलाइन (Offline)')}</li>
              <li><strong>प्रसंस्करण समय:</strong> ${scheme.processingTime}</li>
            </ul>
            <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
              <a href="${scheme.officialWebsite}" target="_blank" class="btn btn-primary" style="width: auto; margin: 0; display: inline-flex; align-items: center; gap: 8px;">
                आधिकारिक पोर्टल पर आवेदन करें <i class="fas fa-external-link-alt"></i>
              </a>
              <button class="btn btn-outline" onclick="window.print()" style="width: auto; margin: 0; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-print"></i> प्रिंट / PDF गाइड (Print)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('active');
  }

  function closeModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
  }

  // Switch tabs inside modal
  function switchTab(evt, tabId) {
    const modal = evt.target.closest('.modal');
    if (!modal) return;

    // Toggle tab buttons active
    const tabBtns = modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    evt.target.classList.add('active');

    // Toggle tab panes active
    const tabPanes = modal.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));
    modal.querySelector(`#${tabId}`).classList.add('active');
  }

  // Open Document Sahayak for missing document
  function goToDoc(docId) {
    closeModal();
    App.navigateTo(`documents.html?doc=${docId}&action=new`);
  }

  // Expose methods for HTML binding
  window.SchemesPage = {
    showDetails,
    closeModal,
    switchTab,
    goToDoc
  };
});
