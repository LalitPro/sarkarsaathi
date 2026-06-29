/* SarkarSaathi Documents Page Logic */

document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  await DataLoader.loadAll();

  const categoriesContainer = document.getElementById('doc-categories');
  const searchInput = document.getElementById('doc-search-input');
  const docGridEl = document.getElementById('doc-grid');
  const sahayakContainerEl = document.getElementById('sahayak-container');
  
  let activeCategory = 'all';

  // Read URL query parameters (e.g., ?doc=income_certificate&action=new)
  const urlParams = new URLSearchParams(window.location.search);
  const paramDocId = urlParams.get('doc');
  const paramAction = urlParams.get('action') || 'new';

  // Setup categories dynamically
  setupCategoryChips();

  // If a document was passed via URL, go straight to that document's sahayak workflow
  if (paramDocId) {
    showSahayakWorkflow(paramDocId, paramAction);
  } else {
    renderDocuments();
  }

  // Setup Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', renderDocuments);
  }

  function setupCategoryChips() {
    if (!categoriesContainer) return;

    const chips = categoriesContainer.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.getAttribute('data-category');
        
        // Hide sahayak view and return to grid
        if (sahayakContainerEl) sahayakContainerEl.style.display = 'none';
        if (docGridEl) docGridEl.style.display = 'grid';
        
        renderDocuments();
      });
    });
  }

  // Render list of documents in grid
  function renderDocuments() {
    if (!docGridEl) return;

    let docs = DataLoader.getDocuments();
    const query = searchInput ? searchInput.value : "";

    // 1. Text Search Filter
    if (query) {
      docs = Search.searchDocuments(query, docs);
    }

    // 2. Category Filter
    if (activeCategory !== 'all') {
      docs = docs.filter(d => d.type === activeCategory);
    }

    if (docs.length === 0) {
      docGridEl.innerHTML = `
        <div class="card text-center" style="grid-column: 1/-1; padding: 40px 20px;">
          <i class="fas fa-file-excel" style="font-size: 40px; color: var(--text-light); margin-bottom: 12px;"></i>
          <p style="font-size: 14px; color: var(--text-muted);">कोई दस्तावेज़ नहीं मिला। कृपया दूसरा कीवर्ड खोजें।</p>
        </div>
      `;
      return;
    }

    docGridEl.innerHTML = '';
    docs.forEach(doc => {
      const typeLabels = {
        identity: 'पहचान प्रमाण (Identity)',
        address: 'पते का प्रमाण (Address)',
        income: 'आय प्रमाण (Income)',
        caste: 'जाति प्रमाण (Caste)',
        other: 'अन्य दस्तावेज़ (Other)'
      };

      docGridEl.innerHTML += `
        <div class="card doc-card">
          <div class="doc-info">
            <div class="doc-icon-wrapper">
              <i class="${App.getDocIconClass(doc.id)}"></i>
            </div>
            <div>
              <h3 class="doc-name">${doc.name}</h3>
              <span class="doc-type-label">${typeLabels[doc.type] || doc.type}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="DocumentsPage.selectDocument('${doc.id}')">सहायक खोलें</button>
        </div>
      `;
    });
  }

  // Interactive Document Sahayak Workflow UI
  function showSahayakWorkflow(docId, actionKey = 'new') {
    const doc = DataLoader.getDocumentById(docId);
    if (!doc) return;

    if (docGridEl) docGridEl.style.display = 'none';
    if (sahayakContainerEl) {
      sahayakContainerEl.style.display = 'flex';
      
      // Structure the Sahayak Layout
      sahayakContainerEl.innerHTML = `
        <button class="btn btn-secondary btn-sm mb-12" style="width: auto; align-self: flex-start;" onclick="DocumentsPage.backToList()">
          <i class="fas fa-arrow-left"></i> सूची पर वापस जाएं (Back to List)
        </button>

        <div class="selected-doc-banner">
          <div>
            <h3 class="selected-doc-title">${doc.name}</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${doc.description}</p>
          </div>
          <div class="doc-icon-wrapper" style="background: white;">
            <i class="${App.getDocIconClass(doc.id)}"></i>
          </div>
        </div>

        <div class="action-grid">
          ${renderActionButtons(doc, actionKey)}
        </div>

        <div id="dynamic-workflow-area">
          <!-- Populated by action toggle -->
        </div>
      `;

      loadWorkflowContent(docId, actionKey);
    }
  }

  function renderActionButtons(doc, activeKey) {
    const actions = doc.actions;
    const labels = {
      new: { title: 'नया (New)', icon: 'fa-plus-circle' },
      update: { title: 'अपडेट (Update)', icon: 'fa-edit' },
      correction: { title: 'सुधार (Correction)', icon: 'fa-tools' },
      download: { title: 'डाउनलोड (Download)', icon: 'fa-download' },
      status: { title: 'स्थिति (Status)', icon: 'fa-info-circle' }
    };

    return Object.keys(actions).map(key => {
      const activeClass = key === activeKey ? 'active' : '';
      return `
        <button class="action-btn ${activeClass}" onclick="DocumentsPage.changeAction('${doc.id}', '${key}')">
          <i class="fas ${labels[key].icon}"></i>
          <span>${labels[key].title}</span>
        </button>
      `;
    }).join('');
  }

  // Load selected action detail view
  function loadWorkflowContent(docId, actionKey) {
    const doc = DataLoader.getDocumentById(docId);
    const actionData = doc.actions[actionKey];
    const workflowArea = document.getElementById('dynamic-workflow-area');
    
    if (!actionData || !workflowArea) return;

    // Build the dynamic view
    let requiredDocsHTML = '';
    let dependencyEngineHTML = '';

    // A. Gather default documents list
    let documentList = actionData.requiredDocuments || [];
    
    // Check if it's the "update" action and there are sub-fields
    let isUpdateAction = actionKey === 'update';
    let fieldSelectorHTML = '';

    if (isUpdateAction && actionData.fields) {
      // Create checklist of update fields (Name, Address, Mobile, DOB, Photo)
      const fields = actionData.fields;
      fieldSelectorHTML = `
        <div class="card update-fields-card mb-24">
          <h4 class="update-fields-title">आप क्या जानकारी अपडेट करना चाहते हैं? (Select field to update)</h4>
          <div class="update-fields-grid">
            ${Object.keys(fields).map(fieldKey => `
              <label class="checkbox-label" onclick="DocumentsPage.toggleUpdateField(event, '${docId}', '${fieldKey}')">
                <input type="checkbox" value="${fieldKey}">
                <span>${fields[fieldKey].name.split(' (')[0]}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Function to calculate and render documents and dependencies
    // Called initially, and recalled when update checkboxes change
    function renderRequirements(docsArray) {
      // 1. Render simple checklist of required documents
      let docsListHTML = '';
      if (docsArray.length === 0) {
        docsListHTML = `<p style="font-size: 13px; color: var(--scheme-color); font-weight: 600;"><i class="fas fa-check-circle"></i> किसी अन्य सहायक दस्तावेज़ की आवश्यकता नहीं है।</p>`;
      } else {
        docsListHTML = `
          <ul class="info-list">
            ${docsArray.map(dId => {
              const dObj = DataLoader.getDocumentById(dId);
              return `<li><i class="fas fa-file-alt" style="color: var(--document-color); margin-right: 8px;"></i>${dObj ? dObj.name : dId}</li>`;
            }).join('')}
          </ul>
        `;
      }

      // 2. Document Dependency Engine: Check for underlying dependencies
      // e.g. if required document is Income Certificate, check if it needs Aadhaar, etc.
      let dependenciesList = [];
      docsArray.forEach(dId => {
        const dObj = DataLoader.getDocumentById(dId);
        if (dObj && dObj.dependencies && dObj.dependencies.length > 0) {
          dObj.dependencies.forEach(depId => {
            const depObj = DataLoader.getDocumentById(depId);
            dependenciesList.push({
              parentName: dObj.name.split(' (')[0],
              depName: depObj ? depObj.name.split(' (')[0] : depId
            });
          });
        }
      });

      let depHTML = '';
      if (dependenciesList.length > 0) {
        depHTML = `
          <div class="dependency-box">
            <h4 class="dependency-title">
              <i class="fas fa-network-wired"></i> दस्तावेज़ निर्भरता गाइड (Document Dependency Engine)
            </h4>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
              निम्नलिखित सहायक दस्तावेजों को बनाने के लिए अन्य दस्तावेजों की आवश्यकता होगी:
            </p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
              ${dependenciesList.map(dep => `
                <li style="font-size: 11.5px; display: flex; align-items: center; gap: 6px;">
                  <span class="badge badge-state" style="padding: 2px 6px; font-size: 10px;">${dep.parentName}</span>
                  <span>को बनाने के लिए</span>
                  <span class="badge badge-central" style="padding: 2px 6px; font-size: 10px;">${dep.depName}</span>
                  <span>अनिवार्य है।</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }

      // Update inner HTML of dynamic area
      const reqDocsContainer = document.getElementById('required-documents-container');
      const depContainer = document.getElementById('dependency-engine-container');
      
      if (reqDocsContainer) reqDocsContainer.innerHTML = docsListHTML;
      if (depContainer) depContainer.innerHTML = depHTML;
    }

    // Base structural layout for action details
    workflowArea.innerHTML = `
      ${fieldSelectorHTML}

      <div class="card mb-24" style="border-top: 4px solid var(--document-color);">
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: var(--primary-color);">
          आवश्यक जानकारी (Process Information)
        </h4>
        
        <div class="scheme-details-row">
          <div class="detail-item">
            <strong>अनुमानित शुल्क (Required Fees)</strong>
            ${actionData.fees !== undefined ? actionData.fees : 'शुल्क की जानकारी उपलब्ध नहीं'}
          </div>
          <div class="detail-item">
            <strong>समय सीमा (Timeframe)</strong>
            ${actionData.estimatedTime}
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <strong>आवेदन कहाँ करें (Where to Apply)</strong>
            ${actionData.whereToApply}
          </div>
        </div>

        <div style="margin-top: 16px;">
          <strong>आवश्यक सहायक दस्तावेज़ (Prerequisite Documents)</strong>
          <div id="required-documents-container" style="margin-top: 8px;">
            <!-- Loaded via renderRequirements -->
          </div>
        </div>

        <div id="dependency-engine-container" style="margin-top: 16px;">
          <!-- Loaded via renderRequirements -->
        </div>
      </div>

      <div class="card mb-24">
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--primary-color);">
          आवेदन प्रक्रिया गाइड (Step-by-step Guide)
        </h4>
        <div class="timeline">
          ${actionData.stepByStepGuide.map((step, idx) => `
            <div class="timeline-step">
              <div class="timeline-num">${idx + 1}</div>
              <div class="timeline-text">${step}</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${actionData.importantNotes && actionData.importantNotes.length > 0 ? `
        <div class="notes-box">
          <strong>महत्वपूर्ण बातें (Important Notes)</strong>
          <ul style="padding-left: 16px; display: flex; flex-direction: column; gap: 4px;">
            ${actionData.importantNotes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="mt-24" style="text-align: center;">
        <a href="${actionData.officialWebsite}" target="_blank" class="btn btn-document">
          आधिकारिक सरकारी वेबसाइट खोलें <i class="fas fa-external-link-alt"></i>
        </a>
      </div>
    `;

    // Perform initial render
    renderRequirements(documentList);
  }

  // Handle checking/unchecking update parameter checkboxes
  function toggleUpdateField(evt, docId, fieldKey) {
    const label = evt.currentTarget;
    const checkbox = label.querySelector('input');
    
    // Stop event bubbling for clicks on input
    if (evt.target.tagName === 'INPUT') return;

    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
      label.classList.add('checked');
    } else {
      label.classList.remove('checked');
    }

    recalculateUpdateRequirements(docId);
  }

  function recalculateUpdateRequirements(docId) {
    const doc = DataLoader.getDocumentById(docId);
    const actionData = doc.actions['update'];
    
    // Find all checked boxes
    const checkboxGrid = document.querySelector('.update-fields-grid');
    if (!checkboxGrid) return;

    const checkedBoxes = checkboxGrid.querySelectorAll('input:checked');
    const selectedFieldKeys = Array.from(checkedBoxes).map(cb => cb.value);

    // Calculate unique list of documents required
    let updatedDocsList = [];
    
    if (selectedFieldKeys.length === 0) {
      // Default: base required documents for update (usually base document itself)
      updatedDocsList = actionData.requiredDocuments || [];
    } else {
      // Collect documents for all selected fields
      const docsSet = new Set();
      
      // Always include the document itself
      docsSet.add(docId);

      selectedFieldKeys.forEach(key => {
        const fieldData = actionData.fields[key];
        if (fieldData && fieldData.requiredDocuments) {
          fieldData.requiredDocuments.forEach(d => docsSet.add(d));
        }
      });
      
      updatedDocsList = Array.from(docsSet);
    }

    // Trigger update of required documents and dependency HTML
    const reqDocsContainer = document.getElementById('required-documents-container');
    const depContainer = document.getElementById('dependency-engine-container');
    
    if (reqDocsContainer) {
      if (updatedDocsList.length === 0) {
        reqDocsContainer.innerHTML = `<p style="font-size: 13px; color: var(--scheme-color); font-weight: 600;"><i class="fas fa-check-circle"></i> किसी सहायक दस्तावेज़ की आवश्यकता नहीं है।</p>`;
      } else {
        reqDocsContainer.innerHTML = `
          <ul class="info-list">
            ${updatedDocsList.map(dId => {
              const dObj = DataLoader.getDocumentById(dId);
              return `<li><i class="fas fa-file-alt" style="color: var(--document-color); margin-right: 8px;"></i>${dObj ? dObj.name : dId}</li>`;
            }).join('')}
          </ul>
        `;
      }
    }

    // Recalculate dependencies
    let dependenciesList = [];
    updatedDocsList.forEach(dId => {
      const dObj = DataLoader.getDocumentById(dId);
      if (dObj && dObj.dependencies && dObj.dependencies.length > 0) {
        dObj.dependencies.forEach(depId => {
          const depObj = DataLoader.getDocumentById(depId);
          dependenciesList.push({
            parentName: dObj.name.split(' (')[0],
            depName: depObj ? depObj.name.split(' (')[0] : depId
          });
        });
      }
    });

    if (depContainer) {
      if (dependenciesList.length > 0) {
        depContainer.innerHTML = `
          <div class="dependency-box">
            <h4 class="dependency-title">
              <i class="fas fa-network-wired"></i> दस्तावेज़ निर्भरता गाइड (Document Dependency Engine)
            </h4>
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
              निम्नलिखित सहायक दस्तावेजों को बनाने के लिए अन्य दस्तावेजों की आवश्यकता होगी:
            </p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
              ${dependenciesList.map(dep => `
                <li style="font-size: 11.5px; display: flex; align-items: center; gap: 6px;">
                  <span class="badge badge-state" style="padding: 2px 6px; font-size: 10px;">${dep.parentName}</span>
                  <span>को बनाने के लिए</span>
                  <span class="badge badge-central" style="padding: 2px 6px; font-size: 10px;">${dep.depName}</span>
                  <span>अनिवार्य है।</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      } else {
        depContainer.innerHTML = '';
      }
    }
  }

  // Toggle back to list
  function backToList() {
    // Clear url query params so refreshing stays on list
    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (sahayakContainerEl) sahayakContainerEl.style.display = 'none';
    if (docGridEl) docGridEl.style.display = 'grid';
    renderDocuments();
  }

  function selectDocument(docId) {
    showSahayakWorkflow(docId, 'new');
  }

  function changeAction(docId, actionKey) {
    showSahayakWorkflow(docId, actionKey);
  }

  // Expose global methods
  window.DocumentsPage = {
    selectDocument,
    changeAction,
    backToList,
    toggleUpdateField
  };
});
