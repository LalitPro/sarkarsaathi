// Voice Assistant Module for Sarkar Saathi - Hackathon Winning Feature
// Implements Voice Search (Speech-to-Text) and Scheme Audio Reader (Text-to-Speech)
const VoiceAssistant = (() => {
  // Styles for microphone overlay and speaker button
  const styles = `
    .mic-btn-search {
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      transition: all 0.2s;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mic-btn-search:hover {
      color: #dc2626;
      background-color: #f1f5f9;
      transform: scale(1.1);
    }
    [data-theme="dark"] .mic-btn-search:hover {
      background-color: #334155;
    }
    
    /* Listening pulse wave */
    .voice-pulse-outer {
      width: 5rem;
      height: 5rem;
      background: rgba(220, 38, 38, 0.15);
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: voicePulse 1.5s infinite;
    }
    .voice-pulse-inner {
      width: 3.5rem;
      height: 3.5rem;
      background: #dc2626;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .voice-pulse-inner:hover {
      background: #b91c1c;
    }
    
    @keyframes voicePulse {
      0% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(220, 38, 38, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
      }
    }
    
    /* Speaker float button in details modal */
    .speaker-btn-modal {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: 0.5rem;
    }
    .speaker-btn-modal:hover {
      background-color: #e8f5e9;
      border-color: #a7f3d0;
      color: #0b6623;
      transform: translateY(-1px);
    }
    .speaker-btn-modal.playing {
      background-color: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      animation: speakerPulse 1.2s infinite;
    }
    
    @keyframes speakerPulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    
    [data-theme="dark"] .speaker-btn-modal {
      background-color: #1e293b;
      border-color: #334155;
      color: #cbd5e1;
    }
    [data-theme="dark"] .speaker-btn-modal:hover {
      background-color: rgba(16, 185, 129, 0.15);
      border-color: #047857;
      color: #10b981;
    }
  `;

  let currentUtterance = null;
  let isSpeaking = false;

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
  }

  // Speak text out loud in chosen language
  function speak(text, langCode) {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Stop any previous speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto detect voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // Normalize language codes
    const normalizedCode = langCode === 'hi' ? 'hi-IN' : (langCode === 'en' ? 'en-IN' : langCode);
    
    // Find closest language voice
    selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(normalizedCode.toLowerCase()));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = normalizedCode;
    utterance.rate = 0.95; // Slightly slower for clear rural guidance
    
    utterance.onend = () => {
      resetSpeakerButtons();
    };
    
    utterance.onerror = () => {
      resetSpeakerButtons();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    isSpeaking = true;
    updateSpeakerButtons(true);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    resetSpeakerButtons();
  }

  function resetSpeakerButtons() {
    isSpeaking = false;
    currentUtterance = null;
    document.querySelectorAll('.speaker-btn-modal').forEach(btn => {
      btn.className = 'speaker-btn-modal';
      btn.innerHTML = `<i class="fas fa-volume-up"></i> <span>विवरण सुनें (Listen)</span>`;
    });
  }

  function updateSpeakerButtons(active) {
    document.querySelectorAll('.speaker-btn-modal').forEach(btn => {
      if (active) {
        btn.className = 'speaker-btn-modal playing';
        btn.innerHTML = `<i class="fas fa-volume-mute"></i> <span>बोलना बंद करें (Stop)</span>`;
      } else {
        btn.className = 'speaker-btn-modal';
        btn.innerHTML = `<i class="fas fa-volume-up"></i> <span>विवरण सुनें (Listen)</span>`;
      }
    });
  }

  // Inject listening dialog overlay
  function injectListeningOverlay() {
    if (document.getElementById('voice-listening-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'voice-listening-overlay';
    overlay.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex flex-col items-center justify-center text-white hidden';
    
    overlay.innerHTML = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-6 shadow-2xl relative text-slate-800 dark:text-white text-center">
        <div class="voice-pulse-outer">
          <div class="voice-pulse-inner" id="voice-stop-btn">
            <i class="fas fa-microphone text-xl text-white"></i>
          </div>
        </div>
        <div>
          <h3 class="text-base font-extrabold mb-1">कृपया बोलें (Speak Now)</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500">हम आपकी खोज सुन रहे हैं... (Listening...)</p>
        </div>
        <div class="text-sm font-bold text-brand-primary dark:text-emerald-400 min-h-[2rem] px-4 max-w-xs" id="voice-output-preview">...</div>
        <button class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline focus:outline-none" id="voice-cancel-btn">रद्द करें (Cancel)</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  // Injects microphone icon next to search bars
  function injectMicButtons() {
    const searchInputs = [
      document.getElementById('top-search-input'),
      document.getElementById('scheme-search-input'),
      document.getElementById('document-search-input'),
      document.getElementById('problem-search-input')
    ];

    searchInputs.forEach(input => {
      if (input && !input.parentElement.querySelector('.mic-btn-search')) {
        const micBtn = document.createElement('div');
        micBtn.className = 'mic-btn-search';
        micBtn.innerHTML = `<i class="fas fa-microphone text-sm"></i>`;
        micBtn.title = "आवाज़ से खोजें (Search with voice)";
        
        // Insert before search button or at end of input container
        const searchBtn = input.parentElement.querySelector('button');
        if (searchBtn) {
          input.parentElement.insertBefore(micBtn, searchBtn);
        } else {
          // Put inside top-search input container
          input.parentElement.appendChild(micBtn);
        }

        micBtn.addEventListener('click', () => {
          startVoiceSearch(input);
        });
      }
    });
  }

  // Trigger browser Speech Recognition API
  function startVoiceSearch(inputElement) {
    if (!recognition) {
      alert("आपके ब्राउज़र में आवाज़ पहचान (Voice Search) सुविधा उपलब्ध नहीं है। कृपया गूगल क्रोम या एज का उपयोग करें।");
      return;
    }

    const overlay = document.getElementById('voice-listening-overlay');
    const preview = document.getElementById('voice-output-preview');
    if (!overlay || !preview) return;

    preview.textContent = "...";
    overlay.classList.remove('hidden');

    const currentLang = localStorage.getItem('sarkar_saathi_lang') || 'hi';
    
    // Set appropriate recognition language
    recognition.lang = currentLang === 'hi' ? 'hi-IN' : (currentLang === 'en' ? 'en-IN' : currentLang);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      preview.textContent = transcript;
    };

    recognition.onend = () => {
      const resultText = preview.textContent.trim();
      overlay.classList.add('hidden');
      
      if (resultText && resultText !== "...") {
        inputElement.value = resultText;
        // Trigger input event to make filter updates trigger instantly
        inputElement.dispatchEvent(new Event('input'));
        inputElement.dispatchEvent(new Event('change'));
        
        // Trigger enter key press simulation or direct search click if present
        const searchBtn = inputElement.parentElement.querySelector('button');
        if (searchBtn) {
          searchBtn.click();
        } else {
          // Simulation for top search input on index.html
          if (typeof window.handleTopSearch === 'function') {
            window.handleTopSearch();
          }
        }
      }
    };

    recognition.onerror = (e) => {
      console.error(e);
      overlay.classList.add('hidden');
    };

    recognition.start();

    // Bind cancellation callbacks
    document.getElementById('voice-stop-btn').onclick = () => {
      recognition.stop();
    };
    document.getElementById('voice-cancel-btn').onclick = () => {
      preview.textContent = "...";
      recognition.abort();
    };
  }

  // Listen for details modal load to append Audio Reader controls
  function initModalObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const modalHeader = document.querySelector('.modal h3');
          if (modalHeader && !modalHeader.parentElement.querySelector('.speaker-btn-modal')) {
            // Find scheme name and detail fields
            const schemeName = modalHeader.textContent.trim();
            const descEl = document.querySelector('.modal #tab-desc p');
            const benefitsEl = document.querySelector('.modal #tab-benefits p');
            
            const descriptionText = descEl ? descEl.textContent.trim() : "";
            const benefitsText = benefitsEl ? benefitsEl.textContent.trim() : "";
            
            // Text to speak: Name, description and key benefits
            const textToSpeak = `${schemeName}। योजना के बारे में: ${descriptionText}। लाभ: ${benefitsText}`;

            const speakerBtn = document.createElement('button');
            speakerBtn.className = 'speaker-btn-modal';
            speakerBtn.innerHTML = `<i class="fas fa-volume-up"></i> <span>विवरण सुनें (Listen)</span>`;
            
            // Insert speaker button right after the scheme title
            modalHeader.parentElement.appendChild(speakerBtn);

            speakerBtn.addEventListener('click', () => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                const currentLang = localStorage.getItem('sarkar_saathi_lang') || 'hi';
                speak(textToSpeak, currentLang);
              }
            });
          }
          
          // Stop speaking automatically if modal is closed
          const modalBackdrop = document.getElementById('modal-backdrop');
          if (modalBackdrop && !modalBackdrop.classList.contains('active') && isSpeaking) {
            stopSpeaking();
          }
        }
      });
    });

    // Observe body for modal insertions
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    // Inject Custom Styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    // Inject Search mic buttons & overlay on load
    injectListeningOverlay();
    injectMicButtons();

    // Observe details modal trigger
    initModalObserver();

    // Re-check mic buttons on content updates (ajax/js loads)
    setInterval(injectMicButtons, 1500);
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    speak,
    stopSpeaking
  };
})();
