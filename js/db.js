// Sarkar Saathi Unified Database and Firebase Sync Handler
const DB = (() => {
  // Key names for local storage updates
  const KEYS = {
    schemes: 'sarkarsaathi_custom_schemes',
    documents: 'sarkarsaathi_custom_documents',
    problems: 'sarkarsaathi_custom_problems',
    firebase: 'sarkarsaathi_firebase_config'
  };

  // Get saved Firebase configuration settings
  function getFirebaseConfig() {
    try {
      const saved = localStorage.getItem(KEYS.firebase);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveFirebaseConfig(config) {
    localStorage.setItem(KEYS.firebase, JSON.stringify(config));
  }

  function clearFirebaseConfig() {
    localStorage.removeItem(KEYS.firebase);
  }

  // Generic local store load helper
  function loadLocalItems(key) {
    try {
      const items = localStorage.getItem(key);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      return [];
    }
  }

  // Generic local store save helper
  function saveLocalItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Firebase Live Sync handler (optional/lazy integration)
  async function syncWithFirebase(entityType, action, data) {
    const config = getFirebaseConfig();
    if (!config || !config.databaseURL) return false;

    // Dynamically build endpoint URL based on Firebase Realtime DB REST API
    const url = `${config.databaseURL.replace(/\/$/, '')}/${entityType}/${action === 'delete' ? data.id : data.id}.json`;

    try {
      const response = await fetch(url, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: action === 'delete' ? null : JSON.stringify(data)
      });
      return response.ok;
    } catch (e) {
      console.warn("Firebase sync failed, falling back to offline LocalStorage mode.", e);
      return false;
    }
  }

  // Schemes DB Methods
  function getCustomSchemes() {
    return loadLocalItems(KEYS.schemes);
  }

  async function saveScheme(scheme) {
    const items = getCustomSchemes();
    const idx = items.findIndex(s => s.id === scheme.id);
    if (idx !== -1) {
      items[idx] = scheme;
    } else {
      items.push(scheme);
    }
    saveLocalItems(KEYS.schemes, items);
    
    // Trigger Firebase sync in background
    await syncWithFirebase('schemes', 'save', scheme);
  }

  async function deleteScheme(schemeId) {
    let items = getCustomSchemes();
    items = items.filter(s => s.id !== schemeId);
    saveLocalItems(KEYS.schemes, items);

    // Trigger Firebase sync in background
    await syncWithFirebase('schemes', 'delete', { id: schemeId });
  }

  // Documents DB Methods
  function getCustomDocuments() {
    return loadLocalItems(KEYS.documents);
  }

  async function saveDocument(documentObj) {
    const items = getCustomDocuments();
    const idx = items.findIndex(d => d.id === documentObj.id);
    if (idx !== -1) {
      items[idx] = documentObj;
    } else {
      items.push(documentObj);
    }
    saveLocalItems(KEYS.documents, items);

    await syncWithFirebase('documents', 'save', documentObj);
  }

  async function deleteDocument(docId) {
    let items = getCustomDocuments();
    items = items.filter(d => d.id !== docId);
    saveLocalItems(KEYS.documents, items);

    await syncWithFirebase('documents', 'delete', { id: docId });
  }

  // Problems DB Methods
  function getCustomProblems() {
    return loadLocalItems(KEYS.problems);
  }

  async function saveProblem(problem) {
    const items = getCustomProblems();
    const idx = items.findIndex(p => p.id === problem.id);
    if (idx !== -1) {
      items[idx] = problem;
    } else {
      items.push(problem);
    }
    saveLocalItems(KEYS.problems, items);

    await syncWithFirebase('problems', 'save', problem);
  }

  async function deleteProblem(probId) {
    let items = getCustomProblems();
    items = items.filter(p => p.id !== probId);
    saveLocalItems(KEYS.problems, items);

    await syncWithFirebase('problems', 'delete', { id: probId });
  }

  return {
    getFirebaseConfig,
    saveFirebaseConfig,
    clearFirebaseConfig,
    getCustomSchemes,
    saveScheme,
    deleteScheme,
    getCustomDocuments,
    saveDocument,
    deleteDocument,
    getCustomProblems,
    saveProblem,
    deleteProblem
  };
})();
