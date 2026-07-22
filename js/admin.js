// Admin Page Management Module for Sarkar Saathi
const Admin = (() => {
  let activeTab = 'schemes';
  let currentEditingItem = null; // Stores { type: 'scheme'|'document'|'problem', data: obj, isNew: bool }

  // Simple authentication logic
  function checkAuth() {
    const isAuth = sessionStorage.getItem('sarkarsaathi_admin_auth') === 'true';
    const loginCard = document.getElementById('admin-login-card');
    const dashboard = document.getElementById('admin-dashboard');

    if (isAuth) {
      if (loginCard) loginCard.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
      loadTabContent();
    } else {
      if (loginCard) loginCard.classList.remove('hidden');
      if (dashboard) dashboard.classList.add('hidden');
    }
  }

  function login() {
    const passwordInput = document.getElementById('admin-pass-input');
    if (passwordInput && passwordInput.value === 'admin123') {
      sessionStorage.setItem('sarkarsaathi_admin_auth', 'true');
      checkAuth();
    } else {
      alert("गलत पासवर्ड! (Incorrect Password)");
    }
  }

  // Manage UI tab switches
  function switchTab(tabId) {
    activeTab = tabId;
    
    // Update sidebar navigation active classes
    const tabs = ['schemes', 'documents', 'problems', 'firebase'];
    tabs.forEach(t => {
      const navEl = document.getElementById(`nav-${t}`);
      if (navEl) {
        if (t === tabId) {
          navEl.className = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-extrabold bg-brand-primaryLight text-brand-primary transition-all cursor-pointer";
        } else {
          navEl.className = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-all cursor-pointer";
        }
      }
    });

    // Update tab visibility
    tabs.forEach(t => {
      const pane = document.getElementById(`tab-${t}`);
      if (pane) {
        if (t === tabId) pane.classList.remove('hidden');
        else pane.classList.add('hidden');
      }
    });

    loadTabContent();
  }

  // Load content dynamically depending on active tab
  async function loadTabContent() {
    await DataLoader.loadAll();

    if (activeTab === 'schemes') {
      renderSchemesTable();
    } else if (activeTab === 'documents') {
      renderDocsTable();
    } else if (activeTab === 'problems') {
      renderProblemsTable();
    } else if (activeTab === 'firebase') {
      loadFirebaseConfigFields();
    }
  }

  // Tab 1 Renderer: Schemes Table
  function renderSchemesTable() {
    const tbody = document.getElementById('admin-schemes-table-body');
    if (!tbody) return;

    const schemes = DataLoader.getSchemes();
    tbody.innerHTML = '';

    schemes.forEach(scheme => {
      const typeLabel = scheme.governmentType === 'Central' ? 'केंद्रीय' : `राज्य (${scheme.state})`;
      const row = document.createElement('tr');
      row.className = "border-b border-slate-100 hover:bg-slate-50/50";
      row.innerHTML = `
        <td class="p-4 font-bold text-slate-900">${scheme.name}</td>
        <td class="p-4"><span class="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold">${typeLabel}</span></td>
        <td class="p-4 text-slate-500">${scheme.benefits.substring(0, 50)}...</td>
        <td class="p-4 text-right flex items-center justify-end gap-2">
          <button onclick="Admin.openSchemeForm('${scheme.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><i class="fas fa-edit"></i></button>
          <button onclick="Admin.deleteScheme('${scheme.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Tab 2 Renderer: Documents Table
  function renderDocsTable() {
    const tbody = document.getElementById('admin-docs-table-body');
    if (!tbody) return;

    const docs = DataLoader.getDocuments();
    tbody.innerHTML = '';

    docs.forEach(doc => {
      const row = document.createElement('tr');
      row.className = "border-b border-slate-100 hover:bg-slate-50/50";
      row.innerHTML = `
        <td class="p-4 font-bold text-slate-900">${doc.name}</td>
        <td class="p-4"><span class="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold uppercase">${doc.type}</span></td>
        <td class="p-4 text-slate-500">${doc.description.substring(0, 50)}...</td>
        <td class="p-4 text-right flex items-center justify-end gap-2">
          <button onclick="Admin.openDocForm('${doc.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><i class="fas fa-edit"></i></button>
          <button onclick="Admin.deleteDoc('${doc.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Tab 3 Renderer: Problems Table
  function renderProblemsTable() {
    const tbody = document.getElementById('admin-problems-table-body');
    if (!tbody) return;

    const probs = DataLoader.getProblems();
    tbody.innerHTML = '';

    probs.forEach(prob => {
      const row = document.createElement('tr');
      row.className = "border-b border-slate-100 hover:bg-slate-50/50";
      row.innerHTML = `
        <td class="p-4 font-bold text-slate-900">${prob.issue}</td>
        <td class="p-4 text-slate-500">${prob.targetId}</td>
        <td class="p-4 text-slate-500">${prob.possibleReason.substring(0, 50)}...</td>
        <td class="p-4 text-right flex items-center justify-end gap-2">
          <button onclick="Admin.openProblemForm('${prob.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><i class="fas fa-edit"></i></button>
          <button onclick="Admin.deleteProblem('${prob.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Modal Controllers
  function closeModal() {
    const backdrop = document.getElementById('admin-modal-backdrop');
    if (backdrop) backdrop.classList.replace('flex', 'hidden');
    currentEditingItem = null;
  }

  function openModal(title) {
    const backdrop = document.getElementById('admin-modal-backdrop');
    const titleEl = document.getElementById('admin-modal-title');
    if (backdrop) backdrop.classList.replace('hidden', 'flex');
    if (titleEl) titleEl.textContent = title;
  }

  // Dialog Form Prefilling: Schemes
  function openSchemeForm(schemeId = null) {
    const container = document.getElementById('admin-modal-fields-container');
    if (!container) return;

    let scheme = {
      id: `scheme_${Date.now()}`,
      name: '',
      governmentType: 'Central',
      state: '',
      description: '',
      benefits: '',
      eligibility: { ageMin: 18, ageMax: 60, gender: 'All', category: ['All'], occupations: ['All'], maxIncome: null, ruralUrban: 'Both', disability: 'Both' },
      requiredDocuments: [],
      processingTime: '15 दिन',
      applyMode: 'Both',
      officialWebsite: 'https://serviceonline.gov.in'
    };

    const isNew = !schemeId;
    if (!isNew) {
      const found = DataLoader.getSchemeById(schemeId);
      if (found) scheme = JSON.parse(JSON.stringify(found));
    }

    currentEditingItem = { type: 'scheme', data: scheme, isNew };

    // Get documents list for checkbox selection
    const allDocs = DataLoader.getDocuments();

    container.innerHTML = `
      <div class="flex flex-col gap-4 text-left text-xs">
        <div>
          <label class="block font-bold text-slate-500 mb-1">योजना का नाम (Scheme Name):</label>
          <input type="text" id="form-name" value="${scheme.name}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-primary">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-500 mb-1">प्रकार (Government Type):</label>
            <select id="form-gov-type" onchange="Admin.toggleStateField(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-primary">
              <option value="Central" ${scheme.governmentType === 'Central' ? 'selected' : ''}>केंद्रीय (Central)</option>
              <option value="State" ${scheme.governmentType === 'State' ? 'selected' : ''}>राज्य (State)</option>
            </select>
          </div>
          <div id="form-state-container" class="${scheme.governmentType === 'State' ? '' : 'hidden'}">
            <label class="block font-bold text-slate-500 mb-1">राज्य (State Name):</label>
            <input type="text" id="form-state" value="${scheme.state || ''}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-primary" placeholder="e.g. Madhya Pradesh">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">योजना का विवरण (Description):</label>
          <textarea id="form-desc" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-primary">${scheme.description}</textarea>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">योजना के लाभ (Benefits):</label>
          <textarea id="form-benefits" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-primary">${scheme.benefits}</textarea>
        </div>
        <div class="border-t border-slate-100 pt-3">
          <span class="block font-black text-slate-700 mb-2">पात्रता नियम (Eligibility Criteria):</span>
          <div class="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label class="block font-bold text-slate-400 mb-1">न्यूनतम आयु (Min Age):</label>
              <input type="number" id="form-elig-age-min" value="${scheme.eligibility.ageMin}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-primary">
            </div>
            <div>
              <label class="block font-bold text-slate-400 mb-1">अधिकतम आयु (Max Age):</label>
              <input type="number" id="form-elig-age-max" value="${scheme.eligibility.ageMax}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-primary">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label class="block font-bold text-slate-400 mb-1">लिंग (Gender):</label>
              <select id="form-elig-gender" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none">
                <option value="All" ${scheme.eligibility.gender === 'All' ? 'selected' : ''}>सभी (All)</option>
                <option value="Female" ${scheme.eligibility.gender === 'Female' ? 'selected' : ''}>केवल महिलाएं</option>
                <option value="Male" ${scheme.eligibility.gender === 'Male' ? 'selected' : ''}>केवल पुरुष</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-400 mb-1">अधिकतम वार्षिक आय (Max Income):</label>
              <input type="number" id="form-elig-income" value="${scheme.eligibility.maxIncome || ''}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none" placeholder="None">
            </div>
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1.5">आवश्यक दस्तावेज़ (Required Documents):</label>
          <div class="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50 max-h-36 overflow-y-auto">
            ${allDocs.map(doc => `
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="form-doc-checkbox" value="${doc.id}" ${scheme.requiredDocuments.includes(doc.id) ? 'checked' : ''}>
                <span>${doc.name.split(' (')[0]}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-500 mb-1">समय सीमा (Processing Time):</label>
            <input type="text" id="form-proc-time" value="${scheme.processingTime}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">आधिकारिक वेबसाइट (Website):</label>
            <input type="text" id="form-website" value="${scheme.officialWebsite}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
          </div>
        </div>
      </div>
    `;

    openModal(isNew ? "नई योजना जोड़ें (Add New Scheme)" : "योजना संपादित करें (Edit Scheme)");
  }

  function toggleStateField(govType) {
    const el = document.getElementById('form-state-container');
    if (el) {
      if (govType === 'State') el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  }

  // Dialog Form Prefilling: Documents
  function openDocForm(docId = null) {
    const container = document.getElementById('admin-modal-fields-container');
    if (!container) return;

    let doc = {
      id: `doc_${Date.now()}`,
      name: '',
      type: 'identity',
      description: '',
      dependencies: [],
      actions: {
        new: { requiredDocuments: [], fees: '₹50', estimatedTime: '15 दिन', whereToApply: 'CSC Center', officialWebsite: '', stepByStepGuide: [''], importantNotes: [''] }
      }
    };

    const isNew = !docId;
    if (!isNew) {
      const found = DataLoader.getDocumentById(docId);
      if (found) doc = JSON.parse(JSON.stringify(found));
    }

    currentEditingItem = { type: 'document', data: doc, isNew };

    // Standard documents checklist for dependencies
    const allDocs = DataLoader.getDocuments().filter(d => d.id !== docId);

    container.innerHTML = `
      <div class="flex flex-col gap-4 text-left text-xs">
        <div>
          <label class="block font-bold text-slate-500 mb-1">दस्तावेज़ का नाम (Document Name):</label>
          <input type="text" id="form-name" value="${doc.name}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-500 mb-1">दस्तावेज़ प्रकार (Type):</label>
            <select id="form-type" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
              <option value="identity" ${doc.type === 'identity' ? 'selected' : ''}>पहचान पत्र (Identity)</option>
              <option value="address" ${doc.type === 'address' ? 'selected' : ''}>पता प्रमाण (Address)</option>
              <option value="income" ${doc.type === 'income' ? 'selected' : ''}>आय / वित्त (Financial)</option>
              <option value="other" ${doc.type === 'other' ? 'selected' : ''}>अन्य दस्तावेज़</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">अनुमानित समय (Time Limit):</label>
            <input type="text" id="form-time" value="${doc.actions.new.estimatedTime}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">संक्षिप्त विवरण (Description):</label>
          <textarea id="form-desc" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">${doc.description}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-500 mb-1">आवेदन शुल्क (Fees):</label>
            <input type="text" id="form-fees" value="${doc.actions.new.fees}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">कहाँ आवेदन करें (Where to Apply):</label>
            <input type="text" id="form-where" value="${doc.actions.new.whereToApply}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1.5">सम्बन्धित सहायक दस्तावेज़ (Dependencies):</label>
          <div class="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50 max-h-32 overflow-y-auto">
            ${allDocs.map(d => `
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="form-dep-checkbox" value="${d.id}" ${doc.dependencies.includes(d.id) ? 'checked' : ''}>
                <span>${d.name.split(' (')[0]}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    openModal(isNew ? "नया दस्तावेज़ जोड़ें" : "दस्तावेज़ संपादित करें");
  }

  // Dialog Form Prefilling: Problems
  function openProblemForm(probId = null) {
    const container = document.getElementById('admin-modal-fields-container');
    if (!container) return;

    let prob = {
      id: `prob_${Date.now()}`,
      type: 'document',
      targetId: 'aadhaar',
      issue: '',
      possibleReason: '',
      requiredFix: '',
      requiredDocuments: [],
      officialGuidance: '',
      nextSteps: [''],
      officialWebsite: ''
    };

    const isNew = !probId;
    if (!isNew) {
      const found = DataLoader.getProblemById(probId);
      if (found) prob = JSON.parse(JSON.stringify(found));
    }

    currentEditingItem = { type: 'problem', data: prob, isNew };

    const allDocs = DataLoader.getDocuments();

    container.innerHTML = `
      <div class="flex flex-col gap-4 text-left text-xs">
        <div>
          <label class="block font-bold text-slate-500 mb-1">समस्या विवरण (Issue / Topic):</label>
          <input type="text" id="form-issue" value="${prob.issue}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" placeholder="e.g. आधार कार्ड में नाम गलत है">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-500 mb-1">संबंधित श्रेणी (Category):</label>
            <select id="form-type" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">
              <option value="document" ${prob.type === 'document' ? 'selected' : ''}>दस्तावेज़ संबंधी</option>
              <option value="scheme" ${prob.type === 'scheme' ? 'selected' : ''}>योजना संबंधी</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">संबंधित आईडी (Target ID):</label>
            <input type="text" id="form-target-id" value="${prob.targetId}" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none" placeholder="e.g. aadhaar">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">संभावित कारण (Possible Reason):</label>
          <textarea id="form-reason" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">${prob.possibleReason}</textarea>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">समाधान मार्गदर्शिका (Official Guidance):</label>
          <textarea id="form-guidance" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none">${prob.officialGuidance}</textarea>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1.5">सम्बन्धित सहायक दस्तावेज़ (Required Documents):</label>
          <div class="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50 max-h-32 overflow-y-auto">
            ${allDocs.map(d => `
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="form-doc-checkbox" value="${d.id}" ${prob.requiredDocuments.includes(d.id) ? 'checked' : ''}>
                <span>${d.name.split(' (')[0]}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    openModal(isNew ? "नई समस्या जोड़ें" : "समस्या विवरण संपादित करें");
  }

  // Save changes from form
  async function saveChanges() {
    if (!currentEditingItem) return;

    const { type, data } = currentEditingItem;

    if (type === 'scheme') {
      data.name = document.getElementById('form-name').value.trim();
      data.governmentType = document.getElementById('form-gov-type').value;
      if (data.governmentType === 'State') {
        data.state = document.getElementById('form-state').value.trim();
      } else {
        data.state = '';
      }
      data.description = document.getElementById('form-desc').value.trim();
      data.benefits = document.getElementById('form-benefits').value.trim();
      data.eligibility.ageMin = parseInt(document.getElementById('form-elig-age-min').value) || 0;
      data.eligibility.ageMax = parseInt(document.getElementById('form-elig-age-max').value) || 100;
      data.eligibility.gender = document.getElementById('form-elig-gender').value;
      const incomeVal = document.getElementById('form-elig-income').value;
      data.eligibility.maxIncome = incomeVal ? parseFloat(incomeVal) : null;
      
      const docCheckboxes = document.querySelectorAll('.form-doc-checkbox:checked');
      data.requiredDocuments = Array.from(docCheckboxes).map(cb => cb.value);
      data.processingTime = document.getElementById('form-proc-time').value.trim();
      data.officialWebsite = document.getElementById('form-website').value.trim();

      if (!data.name || !data.description || !data.benefits) {
        alert("कृपया सभी आवश्यक फ़ील्ड भरें!");
        return;
      }

      await DB.saveScheme(data);

    } else if (type === 'document') {
      data.name = document.getElementById('form-name').value.trim();
      data.type = document.getElementById('form-type').value;
      data.description = document.getElementById('form-desc').value.trim();
      data.actions.new.estimatedTime = document.getElementById('form-time').value.trim();
      data.actions.new.fees = document.getElementById('form-fees').value.trim();
      data.actions.new.whereToApply = document.getElementById('form-where').value.trim();
      
      const depCheckboxes = document.querySelectorAll('.form-dep-checkbox:checked');
      data.dependencies = Array.from(depCheckboxes).map(cb => cb.value);

      if (!data.name || !data.description) {
        alert("कृपया दस्तावेज़ का नाम और विवरण भरें!");
        return;
      }

      await DB.saveDocument(data);

    } else if (type === 'problem') {
      data.issue = document.getElementById('form-issue').value.trim();
      data.type = document.getElementById('form-type').value;
      data.targetId = document.getElementById('form-target-id').value.trim();
      data.possibleReason = document.getElementById('form-reason').value.trim();
      data.officialGuidance = document.getElementById('form-guidance').value.trim();
      data.requiredFix = data.officialGuidance.split('.')[0] || "सहायता केंद्र पर संपर्क करें।";
      
      const docCheckboxes = document.querySelectorAll('.form-doc-checkbox:checked');
      data.requiredDocuments = Array.from(docCheckboxes).map(cb => cb.value);

      // Create a mockup simple default list of next steps if empty
      data.nextSteps = [
        "सहायक दस्तावेज़ों को एकत्रित करें।",
        "आधिकारिक सरकारी पोर्टल या नज़दीकी कियोस्क पर जाएँ।",
        "सुधार फ़ॉर्म सबमिट करके पावती रसीद प्राप्त करें।"
      ];

      if (!data.issue || !data.targetId || !data.officialGuidance) {
        alert("कृपया आवश्यक फ़ील्ड भरें!");
        return;
      }

      await DB.saveProblem(data);
    }

    closeModal();
    // Force reload Cache and update Table
    DataLoader.loadAll().then(() => loadTabContent());
  }

  // Deletion APIs
  async function deleteScheme(id) {
    if (confirm("क्या आप वाकई इस योजना को हटाना चाहते हैं?")) {
      await DB.deleteScheme(id);
      DataLoader.loadAll().then(() => loadTabContent());
    }
  }

  async function deleteDoc(id) {
    if (confirm("क्या आप वाकई इस दस्तावेज़ को हटाना चाहते हैं?")) {
      await DB.deleteDocument(id);
      DataLoader.loadAll().then(() => loadTabContent());
    }
  }

  async function deleteProblem(id) {
    if (confirm("क्या आप वाकई इस समस्या विवरण को हटाना चाहते हैं?")) {
      await DB.deleteProblem(id);
      DataLoader.loadAll().then(() => loadTabContent());
    }
  }

  // Firebase configurations management UI
  function loadFirebaseConfigFields() {
    const config = DB.getFirebaseConfig();
    if (config) {
      document.getElementById('fb-api-key').value = config.apiKey || '';
      document.getElementById('fb-auth-domain').value = config.authDomain || '';
      document.getElementById('fb-db-url').value = config.databaseURL || '';
      document.getElementById('fb-project-id').value = config.projectId || '';
    } else {
      document.getElementById('fb-api-key').value = '';
      document.getElementById('fb-auth-domain').value = '';
      document.getElementById('fb-db-url').value = '';
      document.getElementById('fb-project-id').value = '';
    }
  }

  function saveFirebaseSettings() {
    const apiKey = document.getElementById('fb-api-key').value.trim();
    const authDomain = document.getElementById('fb-auth-domain').value.trim();
    const databaseURL = document.getElementById('fb-db-url').value.trim();
    const projectId = document.getElementById('fb-project-id').value.trim();

    if (!databaseURL) {
      alert("कृपया डेटाबेस URL दर्ज करें!");
      return;
    }

    DB.saveFirebaseConfig({ apiKey, authDomain, databaseURL, projectId });
    alert("फायरबेस क्रेडेंशियल सहेजे गए! अब डेटा क्लाउड से सिंक होगा।");
    loadFirebaseConfigFields();
  }

  function clearFirebaseSettings() {
    DB.clearFirebaseConfig();
    alert("फ़ायरबेस रीसेट! अब स्थानीय (LocalStorage) डेटाबेस सक्रिय है।");
    loadFirebaseConfigFields();
  }

  function init() {
    checkAuth();
    
    const saveBtn = document.getElementById('admin-modal-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);
  }

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    login,
    switchTab,
    openSchemeForm,
    openDocForm,
    openProblemForm,
    toggleStateField,
    closeModal,
    deleteScheme,
    deleteDoc,
    deleteProblem,
    saveFirebaseSettings,
    clearFirebaseSettings
  };
})();
