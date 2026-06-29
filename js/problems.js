/* SarkarSaathi Problem Solver Page Logic */

document.addEventListener('DOMContentLoaded', async () => {
  // Load data
  await DataLoader.loadAll();

  const searchInput = document.getElementById('problem-search-input');
  const typeSelect = document.getElementById('select-type');
  const targetSelect = document.getElementById('select-target');
  const issueSelect = document.getElementById('select-issue');
  const problemsListEl = document.getElementById('problems-list');
  const solutionPanelEl = document.getElementById('solution-panel');

  const chips = document.querySelectorAll('.chip[data-target-type]');
  let activeTargetChip = 'all';

  // Initialize targets and issues dropdowns
  if (typeSelect) {
    typeSelect.addEventListener('change', handleTypeChange);
  }
  if (targetSelect) {
    targetSelect.addEventListener('change', handleTargetChange);
  }
  if (issueSelect) {
    issueSelect.addEventListener('change', handleIssueChange);
  }
  if (searchInput) {
    searchInput.addEventListener('input', renderProblems);
  }

  // Chips filters
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeTargetChip = chip.getAttribute('data-target-type');
      
      // Reset dropdown selections
      if (typeSelect) typeSelect.value = '';
      if (targetSelect) {
        targetSelect.innerHTML = '<option value="">पहले श्रेणी चुनें</option>';
        targetSelect.disabled = true;
      }
      if (issueSelect) {
        issueSelect.innerHTML = '<option value="">पहले विषय चुनें</option>';
        issueSelect.disabled = true;
      }
      if (solutionPanelEl) solutionPanelEl.style.display = 'none';
      if (problemsListEl) problemsListEl.style.display = 'flex';

      renderProblems();
    });
  });

  // Check URL parameters for deep-linking (e.g. ?prob=aadhar_wrong_name)
  const urlParams = new URLSearchParams(window.location.search);
  const paramProbId = urlParams.get('prob');
  if (paramProbId) {
    showProblemSolution(paramProbId);
  } else {
    renderProblems();
  }

  // Populate dynamic targets when type changes (Document or Scheme)
  function handleTypeChange() {
    const selectedType = typeSelect.value;
    if (!targetSelect) return;

    if (!selectedType) {
      targetSelect.innerHTML = '<option value="">पहले श्रेणी चुनें</option>';
      targetSelect.disabled = true;
      if (issueSelect) {
        issueSelect.innerHTML = '<option value="">पहले विषय चुनें</option>';
        issueSelect.disabled = true;
      }
      return;
    }

    targetSelect.disabled = false;
    targetSelect.innerHTML = '<option value="">विषय चुनें (Select Item)</option>';

    if (selectedType === 'document') {
      const docs = DataLoader.getDocuments();
      docs.forEach(doc => {
        targetSelect.innerHTML += `<option value="${doc.id}">${doc.name.split(' (')[0]}</option>`;
      });
    } else {
      const schemes = DataLoader.getSchemes();
      schemes.forEach(sch => {
        targetSelect.innerHTML += `<option value="${sch.id}">${sch.name.split(' (')[0]}</option>`;
      });
    }
  }

  // Populate dynamic issues when target changes
  function handleTargetChange() {
    const selectedTarget = targetSelect.value;
    if (!issueSelect) return;

    if (!selectedTarget) {
      issueSelect.innerHTML = '<option value="">पहले विषय चुनें</option>';
      issueSelect.disabled = true;
      return;
    }

    issueSelect.disabled = false;
    issueSelect.innerHTML = '<option value="">समस्या चुनें (Select Issue)</option>';

    const problems = DataLoader.getProblems().filter(p => p.targetId === selectedTarget);
    problems.forEach(p => {
      issueSelect.innerHTML += `<option value="${p.id}">${p.issue}</option>`;
    });
  }

  // Render solutions when issue is selected from dropdowns
  function handleIssueChange() {
    const selectedIssueId = issueSelect.value;
    if (!selectedIssueId) {
      if (solutionPanelEl) solutionPanelEl.style.display = 'none';
      if (problemsListEl) problemsListEl.style.display = 'flex';
      renderProblems();
      return;
    }

    showProblemSolution(selectedIssueId);
  }

  // Render overall list of problem cards
  function renderProblems() {
    if (!problemsListEl) return;

    let problems = DataLoader.getProblems();
    const query = searchInput ? searchInput.value : "";

    // 1. Text Search Filter
    if (query) {
      problems = Search.searchProblems(query, problems);
    }

    // 2. Chip Target-type Filter (Document vs Scheme)
    if (activeTargetChip !== 'all') {
      problems = problems.filter(p => p.type === activeTargetChip);
    }

    if (problems.length === 0) {
      problemsListEl.innerHTML = `
        <div class="card text-center" style="padding: 40px 20px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: var(--text-light); margin-bottom: 12px;"></i>
          <p style="font-size: 14px; color: var(--text-muted);">कोई समस्या नहीं मिली। कृपया कोई अन्य शब्द खोजें।</p>
        </div>
      `;
      return;
    }

    problemsListEl.innerHTML = '';
    problems.forEach(prob => {
      problemsListEl.innerHTML += `
        <div class="card problem-card">
          <div class="problem-card-header">
            <span class="problem-warning-icon"><i class="fas fa-exclamation-triangle"></i></span>
            <h3 class="problem-issue-title">${prob.issue}</h3>
          </div>
          <p class="problem-desc-preview">${prob.possibleReason.substring(0, 80)}...</p>
          <button class="btn btn-problem btn-sm" onclick="ProblemsPage.showProblemSolution('${prob.id}')">समाधान देखें (View Solution)</button>
        </div>
      `;
    });
  }

  // Display details screen for a problem
  function showProblemSolution(probId) {
    const prob = DataLoader.getProblemById(probId);
    if (!prob) return;

    if (problemsListEl) problemsListEl.style.display = 'none';
    if (solutionPanelEl) {
      solutionPanelEl.style.display = 'flex';

      // Map required documents IDs to names
      const docsNamesHTML = prob.requiredDocuments.map(dId => {
        const dObj = DataLoader.getDocumentById(dId);
        return `
          <div class="detector-item available" style="border-color: var(--border-color); background: var(--bg-color);">
            <div class="detector-label">
              <span class="detector-status-icon" style="color: var(--document-color);"><i class="fas fa-file-alt"></i></span>
              <span>${dObj ? dObj.name : dId}</span>
            </div>
            <button class="btn btn-document btn-sm" style="padding: 4px 10px; font-size: 11px;" onclick="ProblemsPage.goToDoc('${dId}')">प्रक्रिया देखें</button>
          </div>
        `;
      }).join('');

      // Build Details View
      solutionPanelEl.innerHTML = `
        <button class="btn btn-secondary btn-sm mb-12" style="width: auto; align-self: flex-start;" onclick="ProblemsPage.backToList()">
          <i class="fas fa-arrow-left"></i> समस्याओं की सूची पर जाएं (Back to List)
        </button>

        <div class="card problem-card" style="border-left-width: 6px;">
          <div class="problem-card-header">
            <span class="problem-warning-icon" style="font-size: 24px;"><i class="fas fa-exclamation-triangle"></i></span>
            <h3 class="problem-issue-title" style="font-size: 18px;">${prob.issue}</h3>
          </div>
        </div>

        <div class="solution-panel">
          <div class="card solution-section-box sol-reason-box">
            <h4>संभावित कारण (Possible Reason)</h4>
            <p>${prob.possibleReason}</p>
          </div>

          <div class="card solution-section-box sol-fix-box">
            <h4>आवश्यक समाधान (Required Fix)</h4>
            <p>${prob.requiredFix}</p>
          </div>

          <div class="card solution-section-box">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--primary-color); margin-bottom: 12px;">
              आवश्यक दस्तावेज़ (Required Documents)
            </h4>
            <div class="detector-list">
              ${docsNamesHTML.length > 0 ? docsNamesHTML : '<p style="font-size: 13px; color: var(--text-muted);">किसी सहायक दस्तावेज़ की आवश्यकता नहीं है।</p>'}
            </div>
          </div>

          <div class="card solution-section-box sol-process-box">
            <h4>आधिकारिक सरकारी प्रक्रिया (Official Process)</h4>
            <p style="font-size: 13.5px; line-height: 1.5; margin-bottom: 16px;">${prob.officialGuidance}</p>
            
            <h4 style="border-top: 1px solid var(--border-color); padding-top: 16px;">अगले कदम (Step-by-step Next Steps)</h4>
            <div class="timeline">
              ${prob.nextSteps.map((step, idx) => `
                <div class="timeline-step">
                  <div class="timeline-num" style="background-color: var(--problem-color);">${idx + 1}</div>
                  <div class="timeline-text">${step}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="mt-24 text-center">
          <a href="${prob.officialWebsite}" target="_blank" class="btn btn-problem">
            आधिकारिक सरकारी लिंक खोलें <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
      `;
    }
  }

  function backToList() {
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Reset dropdown selectors
    if (typeSelect) typeSelect.value = '';
    if (targetSelect) {
      targetSelect.innerHTML = '<option value="">पहले श्रेणी चुनें</option>';
      targetSelect.disabled = true;
    }
    if (issueSelect) {
      issueSelect.innerHTML = '<option value="">पहले विषय चुनें</option>';
      issueSelect.disabled = true;
    }

    if (solutionPanelEl) solutionPanelEl.style.display = 'none';
    if (problemsListEl) problemsListEl.style.display = 'flex';
    renderProblems();
  }

  function goToDoc(docId) {
    App.navigateTo(`documents.html?doc=${docId}&action=new`);
  }

  // Expose functions globally
  window.ProblemsPage = {
    showProblemSolution,
    showSolution: showProblemSolution,
    backToList,
    goToDoc
  };
});
