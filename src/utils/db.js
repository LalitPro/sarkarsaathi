// Sarkar Saathi Unified Database Helper for React
const KEYS = {
  schemes: 'sarkarsaathi_custom_schemes',
  documents: 'sarkarsaathi_custom_documents',
  problems: 'sarkarsaathi_custom_problems',
  firebase: 'sarkarsaathi_firebase_config',
  ai: 'sarkarsaathi_ai_config',
  deletedSchemes: 'sarkarsaathi_deleted_schemes',
  deletedDocs: 'sarkarsaathi_deleted_documents',
  deletedProblems: 'sarkarsaathi_deleted_problems'
};

export const getFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(KEYS.firebase);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.databaseURL) return parsed;
    }
    
    // Default credentials provided by User
    const defaultConfig = {
      apiKey: "AIzaSyBAFJhrYKNf9YmJ9DWR-hV17wBc3386R6I",
      authDomain: "sarkar-saathi-b38fc.firebaseapp.com",
      projectId: "sarkar-saathi-b38fc",
      databaseURL: "https://sarkar-saathi-b38fc-default-rtdb.firebaseio.com/"
    };
    localStorage.setItem(KEYS.firebase, JSON.stringify(defaultConfig));
    return defaultConfig;
  } catch (e) {
    return null;
  }
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(KEYS.firebase, JSON.stringify(config));
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(KEYS.firebase);
};

export const getAIConfig = () => {
  try {
    const saved = localStorage.getItem(KEYS.ai);
    return saved ? JSON.parse(saved) : { geminiApiKey: '', apiEndpoint: '' };
  } catch (e) {
    return { geminiApiKey: '', apiEndpoint: '' };
  }
};

export const saveAIConfig = (config) => {
  localStorage.setItem(KEYS.ai, JSON.stringify(config));
};

const loadLocalItems = (key) => {
  try {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalItems = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const syncWithFirebase = async (entityType, action, data) => {
  const config = getFirebaseConfig();
  if (!config || !config.databaseURL) return false;

  const url = `${config.databaseURL.replace(/\/$/, '')}/${entityType}/${data.id}.json`;

  try {
    const response = await fetch(url, {
      method: action === 'delete' ? 'DELETE' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'delete' ? null : JSON.stringify(data)
    });
    return response.ok;
  } catch (e) {
    console.warn("Firebase sync failed, falling back to LocalStorage.", e);
    return false;
  }
};

// Deleted Base items getters
export const getDeletedSchemes = () => loadLocalItems(KEYS.deletedSchemes);
export const getDeletedDocs = () => loadLocalItems(KEYS.deletedDocs);
export const getDeletedProblems = () => loadLocalItems(KEYS.deletedProblems);

// Custom Schemes
export const getCustomSchemes = () => loadLocalItems(KEYS.schemes);

export const saveScheme = async (scheme) => {
  const items = getCustomSchemes();
  const idx = items.findIndex(s => s.id === scheme.id);
  if (idx !== -1) {
    items[idx] = scheme;
  } else {
    items.push(scheme);
  }
  
  // Remove from deleted list if it was re-added
  let deleted = getDeletedSchemes();
  if (deleted.includes(scheme.id)) {
    deleted = deleted.filter(id => id !== scheme.id);
    saveLocalItems(KEYS.deletedSchemes, deleted);
    await syncWithFirebase('deletedSchemes', 'delete', { id: scheme.id });
  }

  saveLocalItems(KEYS.schemes, items);
  await syncWithFirebase('schemes', 'save', scheme);
};

export const deleteScheme = async (schemeId) => {
  let items = getCustomSchemes();
  const existsInCustom = items.some(s => s.id === schemeId);

  if (existsInCustom) {
    items = items.filter(s => s.id !== schemeId);
    saveLocalItems(KEYS.schemes, items);
  } else {
    const deleted = getDeletedSchemes();
    if (!deleted.includes(schemeId)) {
      deleted.push(schemeId);
      saveLocalItems(KEYS.deletedSchemes, deleted);
    }
    await syncWithFirebase('deletedSchemes', 'save', { id: schemeId, deleted: true });
  }
  await syncWithFirebase('schemes', 'delete', { id: schemeId });
};

// Custom Documents
export const getCustomDocuments = () => loadLocalItems(KEYS.documents);

export const saveDocument = async (documentObj) => {
  const items = getCustomDocuments();
  const idx = items.findIndex(d => d.id === documentObj.id);
  if (idx !== -1) {
    items[idx] = documentObj;
  } else {
    items.push(documentObj);
  }

  let deleted = getDeletedDocs();
  if (deleted.includes(documentObj.id)) {
    deleted = deleted.filter(id => id !== documentObj.id);
    saveLocalItems(KEYS.deletedDocs, deleted);
    await syncWithFirebase('deletedDocs', 'delete', { id: documentObj.id });
  }

  saveLocalItems(KEYS.documents, items);
  await syncWithFirebase('documents', 'save', documentObj);
};

export const deleteDocument = async (docId) => {
  let items = getCustomDocuments();
  const existsInCustom = items.some(d => d.id === docId);

  if (existsInCustom) {
    items = items.filter(d => d.id !== docId);
    saveLocalItems(KEYS.documents, items);
  } else {
    const deleted = getDeletedDocs();
    if (!deleted.includes(docId)) {
      deleted.push(docId);
      saveLocalItems(KEYS.deletedDocs, deleted);
    }
    await syncWithFirebase('deletedDocs', 'save', { id: docId, deleted: true });
  }
  await syncWithFirebase('documents', 'delete', { id: docId });
};

// Custom Problems
export const getCustomProblems = () => loadLocalItems(KEYS.problems);

export const saveProblem = async (problem) => {
  const items = getCustomProblems();
  const idx = items.findIndex(p => p.id === problem.id);
  if (idx !== -1) {
    items[idx] = problem;
  } else {
    items.push(problem);
  }

  let deleted = getDeletedProblems();
  if (deleted.includes(problem.id)) {
    deleted = deleted.filter(id => id !== problem.id);
    saveLocalItems(KEYS.deletedProblems, deleted);
    await syncWithFirebase('deletedProblems', 'delete', { id: problem.id });
  }

  saveLocalItems(KEYS.problems, items);
  await syncWithFirebase('problems', 'save', problem);
};

export const deleteProblem = async (probId) => {
  let items = getCustomProblems();
  const existsInCustom = items.some(p => p.id === probId);

  if (existsInCustom) {
    items = items.filter(p => p.id !== probId);
    saveLocalItems(KEYS.problems, items);
  } else {
    const deleted = getDeletedProblems();
    if (!deleted.includes(probId)) {
      deleted.push(probId);
      saveLocalItems(KEYS.deletedProblems, deleted);
    }
    await syncWithFirebase('deletedProblems', 'save', { id: probId, deleted: true });
  }
  await syncWithFirebase('problems', 'delete', { id: probId });
};

// Pull all records from Firebase database on demand
export const pullFromFirebase = async () => {
  const config = getFirebaseConfig();
  if (!config || !config.databaseURL) return false;

  const url = `${config.databaseURL.replace(/\/$/, '')}/.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const data = await response.json();
    if (!data) return true; // Empty DB is valid

    if (data.schemes) {
      const schemesList = Object.values(data.schemes);
      saveLocalItems(KEYS.schemes, schemesList);
    }
    if (data.documents) {
      const docsList = Object.values(data.documents);
      saveLocalItems(KEYS.documents, docsList);
    }
    if (data.problems) {
      const probsList = Object.values(data.problems);
      saveLocalItems(KEYS.problems, probsList);
    }
    
    // Pull deleted base items status list
    if (data.deletedSchemes) {
      const deletedList = Object.values(data.deletedSchemes).map(item => item.id);
      saveLocalItems(KEYS.deletedSchemes, deletedList);
    }
    if (data.deletedDocs) {
      const deletedList = Object.values(data.deletedDocs).map(item => item.id);
      saveLocalItems(KEYS.deletedDocs, deletedList);
    }
    if (data.deletedProblems) {
      const deletedList = Object.values(data.deletedProblems).map(item => item.id);
      saveLocalItems(KEYS.deletedProblems, deletedList);
    }
    
    return true;
  } catch (e) {
    console.error("Firebase database sync download failed:", e);
    return false;
  }
};
