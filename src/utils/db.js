// Sarkar Saathi Unified Database Helper for React
const KEYS = {
  schemes: 'sarkarsaathi_custom_schemes',
  documents: 'sarkarsaathi_custom_documents',
  problems: 'sarkarsaathi_custom_problems',
  firebase: 'sarkarsaathi_firebase_config'
};

export const getFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(KEYS.firebase);
    return saved ? JSON.parse(saved) : null;
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

  const url = `${config.databaseURL.replace(/\/$/, '')}/${entityType}/${action === 'delete' ? data.id : data.id}.json`;

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
  saveLocalItems(KEYS.schemes, items);
  await syncWithFirebase('schemes', 'save', scheme);
};

export const deleteScheme = async (schemeId) => {
  let items = getCustomSchemes();
  items = items.filter(s => s.id !== schemeId);
  saveLocalItems(KEYS.schemes, items);
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
  saveLocalItems(KEYS.documents, items);
  await syncWithFirebase('documents', 'save', documentObj);
};

export const deleteDocument = async (docId) => {
  let items = getCustomDocuments();
  items = items.filter(d => d.id !== docId);
  saveLocalItems(KEYS.documents, items);
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
  saveLocalItems(KEYS.problems, items);
  await syncWithFirebase('problems', 'save', problem);
};

export const deleteProblem = async (probId) => {
  let items = getCustomProblems();
  items = items.filter(p => p.id !== probId);
  saveLocalItems(KEYS.problems, items);
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
    return true;
  } catch (e) {
    console.error("Firebase database sync download failed:", e);
    return false;
  }
};
