/* SarkarSaathi AI Government Assistant Chat Logic - Advanced Conversational Version */

document.addEventListener('DOMContentLoaded', async () => {
  // Load databases
  await DataLoader.loadAll();

  const chatLogsEl = document.getElementById('chat-logs');
  const textboxEl = document.getElementById('chat-textbox');
  const sendBtn = document.getElementById('chat-send-btn');
  const suggestionContainer = document.getElementById('chat-suggestions');
  const micBtn = document.getElementById('chat-mic-btn');

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
        const text = chip.textContent.trim().replace(/^💡\s*/, '');
        addUserMessage(text);
        processResponse(text);
      }
    });
  }

  // Initial welcome message tailored to active profile
  const profile = App.getProfile();
  let welcomeMsg = "";
  const currentLang = localStorage.getItem('sarkar_saathi_lang') || 'hi';

  if (currentLang === 'hi') {
    welcomeMsg = `नमस्ते${profile.name ? ' ' + profile.name : ''}! मैं आपका **Sarkar Saathi AI सहायक** हूँ। 😊\n\n`;
    if (profile.state && profile.occupation) {
      const occMap = { 'Farmer': 'किसान', 'Student': 'छात्र/छात्रा', 'Senior Citizen': 'वरिष्ठ नागरिक', 'Unemployed': 'बेरोजगार युवा' };
      const occHindi = occMap[profile.occupation] || profile.occupation;
      welcomeMsg += `मैंने देखा कि आप **${profile.state}** से एक **${occHindi}** हैं।\n`;
    }
    welcomeMsg += `मैं योजनाओं, आवश्यक दस्तावेज़ों (जैसे आधार, पैन कार्ड) और समस्याओं के समाधान में आपकी मदद कर सकता हूँ।\nआप मुझसे कोई भी सवाल पूछ सकते हैं!`;
  } else {
    welcomeMsg = `Hello${profile.name ? ' ' + profile.name : ''}! I am your **Sarkar Saathi AI Assistant**. 😊\n\n`;
    if (profile.state && profile.occupation) {
      welcomeMsg += `I see that you are a **${profile.occupation}** from **${profile.state}**.\n`;
    }
    welcomeMsg += `I can help you find government schemes, guide you through document applications, and resolve application issues.\nAsk me anything!`;
  }

  addBotMessage(welcomeMsg);

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
  function addBotMessage(text) {
    if (!chatLogsEl) return;
    const timeString = getFormattedTime();

    // Parse Markdown bolding and links safely
    let formattedText = parseMarkdownBold(text);
    formattedText = parseMarkdownLinks(formattedText);
    formattedText = formattedText.replace(/\n/g, '<br>');

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

  function parseMarkdownBold(text) {
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function parseMarkdownLinks(text) {
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(mdLinkRegex, '<a href="$2" class="text-brand-primary font-bold hover:underline">$1</a>');
  }

  // ==========================================
  // CONVERSATIONAL RESPONDING ENGINE
  // ==========================================
  async function processResponse(userText) {
    const typingId = showTypingIndicator();
    
    try {
      const botResponse = await getAIResponse(userText);
      
      // Artificial delay to make bot feel natural
      setTimeout(() => {
        removeTypingIndicator(typingId);
        addBotMessage(botResponse);
      }, 750);
      
    } catch (err) {
      console.error("AI Assistant error:", err);
      removeTypingIndicator(typingId);
      addBotMessage("क्षमा करें, तकनीकी कारणों से मैं अभी प्रतिक्रिया नहीं दे पा रहा हूँ। कृपया पुनः प्रयास करें।");
    }
  }

  async function getAIResponse(userText) {
    const text = userText.toLowerCase().trim();
    const profile = App.getProfile();
    const currentLang = localStorage.getItem('sarkar_saathi_lang') || 'hi';

    // 1. GREETINGS & INTRODUCTIONS
    if (text === 'hi' || text === 'hello' || text === 'नमस्ते' || text === 'hey') {
      if (currentLang === 'hi') {
        return `नमस्ते! आशा है आप अच्छे होंगे। मैं आपकी किस प्रकार सहायता कर सकता हूँ?\n\nआप मुझसे अपनी **पात्रता**, किसी **सरकारी योजना**, या **दस्तावेज़ों** के बारे में प्रश्न पूछ सकते हैं।`;
      } else {
        return `Hello! Hope you are doing well. How can I assist you today?\n\nYou can ask me about your **eligibility**, **government schemes**, or **document processes**.`;
      }
    }

    if (text.includes('who are you') || text.includes('तुम्हारा नाम क्या है') || text.includes('तुम कौन हो')) {
      if (currentLang === 'hi') {
        return `मैं **Sarkar Saathi AI सहायक** हूँ। मेरा लक्ष्य देश के नागरिकों को सरकारी योजनाओं और दस्तावेज़ों की सही जानकारी प्रदान करना है।`;
      } else {
        return `I am the **Sarkar Saathi AI Assistant**. My mission is to simplify government schemes, document procedures, and solve application issues for Indian citizens.`;
      }
    }

    // 2. DETECT ELIGIBILITY QUERIES
    if (text.includes('पात्रता') || text.includes('eligibility') || text.includes('eligible') || text.includes('योग्यता') || text.includes('लायक')) {
      const result = Filter.getBoostedEligibility(profile, DataLoader.getSchemes(), profile.documents || []);
      
      if (currentLang === 'hi') {
        let reply = `आपकी वर्तमान प्रोफ़ाइल:\n- राज्य: **${profile.state || 'चयनित नहीं'}**\n- व्यवसाय: **${profile.occupation || 'चयनित नहीं'}**\n- आयु: **${profile.age || '0'} वर्ष**\n- वार्षिक आय: **₹${parseFloat(profile.income || 0).toLocaleString('en-IN')}**\n\n`;
        
        if (result.currentlyEligible.length > 0) {
          reply += `✅ **आप सीधे इन योजनाओं के लिए पात्र हैं:**\n`;
          result.currentlyEligible.slice(0, 3).forEach((scheme) => {
            reply += `- **${scheme.name}** ([विवरण देखें](schemes.html?scheme=${scheme.id}))\n`;
          });
          if (result.currentlyEligible.length > 3) {
            reply += `- ...तथा ${result.currentlyEligible.length - 3} अन्य योजनाएँ।\n`;
          }
        } else {
          reply += `❌ आप अभी किसी योजना की दस्तावेज़ पात्रता पूर्ण नहीं करते हैं।\n`;
        }

        if (result.boosterSchemes.length > 0) {
          reply += `\n💡 **पात्रता बूस्टर (अनलॉक करने योग्य योजनाएँ):**\n`;
          const docKeys = Object.keys(result.missingDocMap).sort((a, b) => result.missingDocMap[b].length - result.missingDocMap[a].length);
          docKeys.slice(0, 2).forEach(docId => {
            const doc = DataLoader.getDocumentById(docId);
            const count = result.missingDocMap[docId].length;
            if (doc) {
              reply += `- **${doc.name}** बनवाकर आप **${count} नई योजनाएँ** (जैसे: *${result.missingDocMap[docId][0].name}*) अनलॉक कर सकते हैं। [बनाने की प्रक्रिया](documents.html?doc=${docId})\n`;
            }
          });
        }
        return reply;
      } else {
        let reply = `Your Active Profile:\n- State: **${profile.state || 'Not Selected'}**\n- Occupation: **${profile.occupation || 'Not Selected'}**\n- Age: **${profile.age || '0'} years**\n- Income: **₹${parseFloat(profile.income || 0).toLocaleString('en-IN')}**\n\n`;
        
        if (result.currentlyEligible.length > 0) {
          reply += `✅ **You are directly eligible for these schemes:**\n`;
          result.currentlyEligible.slice(0, 3).forEach((scheme) => {
            reply += `- **${scheme.name}** ([Details](schemes.html?scheme=${scheme.id}))\n`;
          });
          if (result.currentlyEligible.length > 3) {
            reply += `- ...and ${result.currentlyEligible.length - 3} more schemes.\n`;
          }
        } else {
          reply += `❌ You do not satisfy required document eligibility for any schemes right now.\n`;
        }

        if (result.boosterSchemes.length > 0) {
          reply += `\n💡 **Eligibility Booster Suggestions:**\n`;
          const docKeys = Object.keys(result.missingDocMap).sort((a, b) => result.missingDocMap[b].length - result.missingDocMap[a].length);
          docKeys.slice(0, 2).forEach(docId => {
            const doc = DataLoader.getDocumentById(docId);
            const count = result.missingDocMap[docId].length;
            if (doc) {
              reply += `- Getting **${doc.name}** will unlock **${count} new schemes** (such as: *${result.missingDocMap[docId][0].name}*). [Apply Guide](documents.html?doc=${docId})\n`;
            }
          });
        }
        return reply;
      }
    }

    // 3. CHECK PROBLEMS DATABASE
    const matchedProblems = Search.searchProblems(userText, DataLoader.getProblems());
    if (matchedProblems.length > 0) {
      const prob = matchedProblems[0];
      if (currentLang === 'hi') {
        return `मुझे आपकी समस्या **'${prob.issue}'** से संबंधित जानकारी मिली:\n\n**संभावित कारण:** ${prob.possibleReason}\n\n**निवारण:** ${prob.requiredFix}\n\n**अगले कदम:**\n${prob.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}\n\nविस्तृत प्रक्रिया देखने के लिए यहाँ क्लिक करें: [समस्या समाधान](${'problems.html?prob=' + prob.id})`;
      } else {
        return `I found assistance for your issue **'${prob.issue}'**:\n\n**Potential Cause:** ${prob.possibleReason}\n\n**Resolution:** ${prob.requiredFix}\n\n**Next Steps:**\n${prob.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}\n\nFor more, visit: [Problem Solver](${'problems.html?prob=' + prob.id})`;
      }
    }

    // 4. CHECK DOCUMENTS DATABASE
    const matchedDocs = Search.searchDocuments(userText, DataLoader.getDocuments());
    if (matchedDocs.length > 0) {
      const doc = matchedDocs[0];
      let action = 'new';
      let actionWord = currentLang === 'hi' ? 'बनाने' : 'apply';
      
      if (text.includes('अपडेट') || text.includes('सुधार') || text.includes('change') || text.includes('edit')) {
        action = 'update';
        actionWord = currentLang === 'hi' ? 'अपडेट करने' : 'correction';
      } else if (text.includes('डाउनलोड') || text.includes('download') || text.includes('get')) {
        action = 'download';
        actionWord = currentLang === 'hi' ? 'डाउनलोड करने' : 'download';
      }

      if (currentLang === 'hi') {
        return `मुझे **'${doc.name}'** से संबंधित गाइड मिली।\n\n**विवरण:** ${doc.description}\n\nइस दस्तावेज़ को **${actionWord}** की प्रक्रिया, आवश्यक दस्तावेज़, आवेदन शुल्क और चरण-दर-चरण मार्गदर्शिका देखने के लिए यहाँ क्लिक करें: [दस्तावेज़ सहायक](${'documents.html?doc=' + doc.id + '&action=' + action})`;
      } else {
        return `I found the guide for **'${doc.name}'**.\n\n**Description:** ${doc.description}\n\nTo view details on **${actionWord}**, required documents, fees, and steps, please click here: [Document Sahayak](${'documents.html?doc=' + doc.id + '&action=' + action})`;
      }
    }

    // 5. CHECK SCHEMES DATABASE
    const matchedSchemes = Search.searchSchemes(userText, DataLoader.getSchemes());
    if (matchedSchemes.length > 0) {
      const scheme = matchedSchemes[0];
      const typeLabel = scheme.governmentType === 'Central' ? 'केंद्रीय' : `राज्य (${scheme.state})`;
      if (currentLang === 'hi') {
        return `मुझे **'${scheme.name}'** योजना के बारे में जानकारी मिली:\n\n- **प्रकार:** ${typeLabel}\n- **विवरण:** ${scheme.description}\n- **लाभ:** ${scheme.benefits}\n- **समय सीमा:** ${scheme.processingTime}\n\nयोजना के पात्रता नियम, आवश्यक दस्तावेज़ देखने या सीधे आवेदन करने के लिए, यहाँ क्लिक करें: [सरकारी योजनाएँ](${'schemes.html?scheme=' + scheme.id})`;
      } else {
        return `Here is information on **'${scheme.name}'**:\n\n- **Type:** ${scheme.governmentType} Government\n- **Description:** ${scheme.description}\n- **Benefits:** ${scheme.benefits}\n- **Processing Time:** ${scheme.processingTime}\n\nTo check detailed eligibility rules, required documents, or to apply, visit: [Government Schemes](${'schemes.html?scheme=' + scheme.id})`;
      }
    }

    // 6. DEFAULT FALLBACKS
    if (currentLang === 'hi') {
      return `मैं आपकी बात पूरी तरह समझ नहीं पाया। 🤔\n\nक्या आप नीचे दिए गए **क्विक सजेशन चिप्स** पर क्लिक कर सकते हैं या अपने प्रश्न को किसी सरकारी दस्तावेज़ (जैसे: आधार, पैन कार्ड, राशन कार्ड) या योजना के नाम (जैसे: पीएम किसान, लाडली बहना) के साथ फिर से पूछ सकते हैं?`;
    } else {
      return `I couldn't fully grasp your question. 🤔\n\nPlease try using specific terms like 'Aadhaar', 'PAN Card', 'PM Kisan', 'Scholarship', or click any of the **quick suggestions** below.`;
    }
  }
});
