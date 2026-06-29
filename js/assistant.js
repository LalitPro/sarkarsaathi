/* SarkarSaathi AI Government Assistant Chat Logic */

document.addEventListener('DOMContentLoaded', async () => {
  // Load databases
  await DataLoader.loadAll();

  const chatLogsEl = document.getElementById('chat-logs');
  const textboxEl = document.getElementById('chat-textbox');
  const sendBtn = document.getElementById('chat-send-btn');
  const suggestionContainer = document.getElementById('chat-suggestions');
  const micBtn = document.getElementById('chat-mic-btn');

  // Load rules to read configuration or FAQ questions
  const rules = DataLoader.getRules();

  // Initialize event listeners
  if (sendBtn && textboxEl) {
    sendBtn.addEventListener('click', handleSendMessage);
    textboxEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSendMessage();
    });
  }

  if (suggestionContainer) {
    suggestionContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.suggestion-chip');
      if (chip) {
        const text = chip.textContent.trim();
        addUserMessage(text);
        processResponse(text);
      }
    });
  }

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      alert("वॉयस इनपुट वर्तमान में डेमो मोड में है। कृपया टाइप करके अपना सवाल पूछें।");
    });
  }

  // Initial welcome message
  addBotMessage("नमस्ते! मैं आपका Sarkari Sahayak AI सहायक हूँ। 😊\nमैं सरकारी योजनाओं, आवश्यक दस्तावेज़ों और संबंधित समस्याओं को हल करने में आपकी सहायता कर सकता हूँ।\nआप मुझसे कुछ भी पूछ सकते हैं, जैसे: 'आधार कार्ड अपडेट कैसे करें?' या 'पीएम किसान योजना की पात्रता क्या है?'");

  function handleSendMessage() {
    const text = textboxEl.value.trim();
    if (!text) return;

    addUserMessage(text);
    textboxEl.value = '';
    processResponse(text);
  }

  // UI Renderer: User Bubble
  function addUserMessage(text) {
    if (!chatLogsEl) return;
    const timeString = getFormattedTime();

    chatLogsEl.innerHTML += `
      <div class="msg-row msg-user">
        <div class="msg-bubble">
          ${escapeHtml(text)}
          <span class="msg-meta">${timeString}</span>
        </div>
      </div>
    `;
    scrollToBottom();
  }

  // UI Renderer: Bot Bubble
  function addBotMessage(text, delayMs = 0) {
    if (!chatLogsEl) return;
    const timeString = getFormattedTime();

    // Markdown link regex converter to support clicking in bubbles
    const formattedText = parseMarkdownLinks(text).replace(/\n/g, '<br>');

    chatLogsEl.innerHTML += `
      <div class="msg-row msg-bot">
        <div class="msg-bubble">
          ${formattedText}
          <span class="msg-meta">${timeString}</span>
        </div>
      </div>
    `;
    scrollToBottom();
  }

  // Typing Simulation
  function showTypingIndicator() {
    if (!chatLogsEl) return null;
    const indicatorId = 'typing-' + Date.now();
    
    chatLogsEl.innerHTML += `
      <div class="msg-row msg-bot" id="${indicatorId}">
        <div class="msg-bubble" style="padding: 10px 16px;">
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    `;
    scrollToBottom();
    return indicatorId;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    if (chatLogsEl) {
      chatLogsEl.scrollTop = chatLogsEl.scrollHeight;
    }
  }

  function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Simple Markdown links parser [Link Text](URL)
  function parseMarkdownLinks(text) {
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(mdLinkRegex, '<a href="$2" style="color: var(--primary-color); font-weight: bold; text-decoration: underline;">$1</a>');
  }

  // ==========================================
  // AI RESPONDING ENGINE & API READY ARCHITECTURE
  // ==========================================

  // Primary controller coordinating responses
  async function processResponse(userText) {
    const typingId = showTypingIndicator();
    
    try {
      // 1. Check if external LLM API is integrated
      const botResponse = await getAIResponse(userText);
      
      // Artificial delay to make bot feel alive
      setTimeout(() => {
        removeTypingIndicator(typingId);
        addBotMessage(botResponse);
      }, 1000);
      
    } catch (err) {
      console.error("AI Assistant error:", err);
      removeTypingIndicator(typingId);
      addBotMessage("क्षमा करें, तकनीकी कारणों से मैं अभी प्रतिक्रिया नहीं दे पा रहा हूँ। कृपया पुनः प्रयास करें।");
    }
  }

  /**
   * API CONNECTOR TEMPLATE (LLM Integration Hook)
   * 
   * This function acts as the bridge. By default, it runs an offline simulator.
   * To connect to a live backend (Gemini API, OpenAI, Node.js express server, etc.),
   * replace the simulation block below with a fetch request.
   */
  async function getAIResponse(userText) {
    /* 
    // Example Live API Integration:
    try {
      const response = await fetch('https://your-api-domain.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_BACKEND_TOKEN'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
          temperature: 0.7
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch(err) {
      console.error("API Call failed:", err);
      // fallback to offline match
    }
    */

    // Offline Intelligent Rule-matching Simulation
    return simulateBotReply(userText);
  }

  // Offline matcher: Scans local databases for keyword matches
  function simulateBotReply(text) {
    const cleanedKeywords = Search.getKeywords(text);
    
    if (cleanedKeywords.length === 0) {
      return "मुझे आपका प्रश्न समझने में थोड़ी कठिनाई हो रही है। कृपया कुछ स्पष्ट शब्दों का उपयोग करें, जैसे 'आधार', 'पैन कार्ड' या 'उज्ज्वला योजना'।";
    }

    // 1. Search for Problem Solver matches
    const matchedProblems = Search.searchProblems(text, DataLoader.getProblems());
    if (matchedProblems.length > 0) {
      const prob = matchedProblems[0];
      return `मुझे आपकी समस्या **'${prob.issue}'** से संबंधित जानकारी मिली:\n\n**संभावित कारण:** ${prob.possibleReason}\n\n**समाधान:** ${prob.requiredFix}\n\n**अगले कदम:**\n${prob.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}\n\nअधिक जानकारी और समाधान के लिए आप हमारे [समस्या समाधान](problems.html?prob=${prob.id}) पेज पर जा सकते हैं।`;
    }

    // 2. Search for Document Sahayak matches
    const matchedDocs = Search.searchDocuments(text, DataLoader.getDocuments());
    if (matchedDocs.length > 0) {
      const doc = matchedDocs[0];
      // Check if user is asking to update or download
      let action = 'new';
      let actionWord = 'बनाने';
      
      if (text.includes('अपडेट') || text.includes('सुधार') || text.includes('बदलना')) {
        action = 'update';
        actionWord = 'अपडेट करने';
      } else if (text.includes('डाउनलोड') || text.includes('प्राप्त')) {
        action = 'download';
        actionWord = 'डाउनलोड करने';
      } else if (text.includes('स्थिति') || text.includes('चेक')) {
        action = 'status';
        actionWord = 'स्थिति जांचने';
      }

      return `मुझे **'${doc.name}'** से संबंधित जानकारी मिली।\n${doc.description}\n\nइस दस्तावेज़ को **${actionWord}** के लिए आवश्यक विवरण, शुल्क और चरण-दर-चरण मार्गदर्शिका देखने के लिए कृपया हमारे [दस्तावेज़ सहायक](${window.location.origin.includes('sarkarsaathi') ? '' : '/'}documents.html?doc=${doc.id}&action=${action}) पेज पर जाएँ।`;
    }

    // 3. Search for Scheme Finder matches
    const matchedSchemes = Search.searchSchemes(text, DataLoader.getSchemes());
    if (matchedSchemes.length > 0) {
      const scheme = matchedSchemes[0];
      const typeLabel = scheme.governmentType === 'Central' ? 'केंद्र सरकार (Central Gov)' : `राज्य सरकार (${scheme.state})`;
      return `मुझे **'${scheme.name}'** योजना के बारे में जानकारी मिली:\n\n**प्रकार:** ${typeLabel}\n**विवरण:** ${scheme.description}\n**लाभ:** ${scheme.benefits}\n**समय सीमा:** ${scheme.processingTime}\n\nयोजना के पात्रता नियम, आवश्यक दस्तावेज़ देखने या सीधे आवेदन करने के लिए, कृपया हमारे [सरकारी योजनाएँ](${window.location.origin.includes('sarkarsaathi') ? '' : '/'}schemes.html?scheme=${scheme.id}) पेज पर जाकर विवरण देखें।`;
    }

    // 4. Default Fallback response
    return "मैं आपकी बात पूरी तरह समझ नहीं पाया। क्या आप नीचे दिए गए क्विक सजेशन बटन पर क्लिक कर सकते हैं या अपने प्रश्न को किसी सरकारी दस्तावेज़ (जैसे: आधार, पैन कार्ड, आय प्रमाण पत्र) या योजना के नाम के साथ फिर से पूछ सकते हैं?";
  }
});
