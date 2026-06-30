/* Sarkar Saathi Search Utility Module */

const Search = (() => {
  // Set-based stop words mapping for O(1) keyword filtering
  const STOP_WORDS = new Set([
    'कैसे', 'करें', 'क्या', 'है', 'हैं', 'और', 'का', 'की', 'के', 'में', 'पर', 'से', 'को', 'लिए', 'बनाएं',
    'how', 'to', 'apply', 'for', 'the', 'a', 'an', 'in', 'of', 'and', 'my', 'is', 'get', 'need'
  ]);

  // Helper to tokenize and clean query
  function getKeywords(queryText) {
    if (!queryText) return [];
    return queryText
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 1 && !STOP_WORDS.has(word));
  }

  // General text matcher helper
  function matchesText(fields, keywords) {
    if (keywords.length === 0) return true;
    
    // Join fields content into one clean lowercase string
    const targetText = fields.filter(f => f).join(' ').toLowerCase();
    
    // Check if ALL keywords are present in the target string
    return keywords.every(keyword => targetText.includes(keyword));
  }

  function searchSchemes(query, schemesList) {
    const keywords = getKeywords(query);
    if (keywords.length === 0) return schemesList;

    return schemesList.filter(scheme => {
      const searchFields = [
        scheme.name,
        scheme.description,
        scheme.benefits,
        scheme.governmentType,
        scheme.state || ""
      ];
      return matchesText(searchFields, keywords);
    });
  }

  function searchDocuments(query, documentsList) {
    const keywords = getKeywords(query);
    if (keywords.length === 0) return documentsList;

    return documentsList.filter(doc => {
      const searchFields = [
        doc.name,
        doc.description,
        doc.type
      ];
      return matchesText(searchFields, keywords);
    });
  }

  function searchProblems(query, problemsList) {
    const keywords = getKeywords(query);
    if (keywords.length === 0) return problemsList;

    return problemsList.filter(prob => {
      const searchFields = [
        prob.issue,
        prob.possibleReason,
        prob.requiredFix,
        prob.officialGuidance
      ];
      return matchesText(searchFields, keywords);
    });
  }

  return {
    getKeywords,
    searchSchemes,
    searchDocuments,
    searchProblems
  };
})();

// Export for Node.js test environment or expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Search;
} else {
  window.Search = Search;
}
