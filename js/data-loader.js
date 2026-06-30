/* Sarkar Saathi Data Loader Module */

const DataLoader = (() => {
  const DATA_PATHS = {
    schemes: 'data/schemes.json',
    documents: 'data/documents.json',
    problems: 'data/problems.json',
    rules: 'data/rules.json'
  };

  let cache = {
    schemes: null,
    documents: null,
    problems: null,
    rules: null,
    schemesMap: {},
    documentsMap: {},
    problemsMap: {}
  };

  // Helper function to fetch JSON
  async function fetchJson(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.error(`Failed to load data from ${url}:`, e);
      return [];
    }
  }

  // Load all data concurrently
  async function loadAll() {
    if (cache.schemes && cache.documents && cache.problems && cache.rules) {
      return cache;
    }

    try {
      const [schemes, documents, problems, rules] = await Promise.all([
        fetchJson(DATA_PATHS.schemes),
        fetchJson(DATA_PATHS.documents),
        fetchJson(DATA_PATHS.problems),
        fetchJson(DATA_PATHS.rules)
      ]);

      cache.schemes = schemes;
      cache.documents = documents;
      cache.problems = problems;
      cache.rules = rules;

      // Build Fast Lookup O(1) Maps to replace linear array searches
      cache.schemesMap = schemes.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
      cache.documentsMap = documents.reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
      cache.problemsMap = problems.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

      // Expose to window for easy debugging
      window.SarkarSaathiData = cache;
      return cache;
    } catch (err) {
      console.error("Critical error loading system databases:", err);
      throw err;
    }
  }

  // Getter APIs
  function getSchemes() {
    return cache.schemes || [];
  }

  function getDocuments() {
    return cache.documents || [];
  }

  function getProblems() {
    return cache.problems || [];
  }

  function getRules() {
    return cache.rules || {};
  }

  // O(1) Key-value Lookups
  function getSchemeById(id) {
    return cache.schemesMap[id] || null;
  }

  function getDocumentById(id) {
    return cache.documentsMap[id] || null;
  }

  function getProblemById(id) {
    return cache.problemsMap[id] || null;
  }

  return {
    loadAll,
    getSchemes,
    getDocuments,
    getProblems,
    getRules,
    getSchemeById,
    getDocumentById,
    getProblemById
  };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
} else {
  window.DataLoader = DataLoader;
}
