import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { isDemographicallyEligible, detectMissingDocuments, getBoostedEligibility } from '../utils/filter';

export default function Assistant({ schemes, documents, problems, profile, lang }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatLogsEndRef = useRef(null);

  // Initialize Welcome Message
  useEffect(() => {
    let welcome = "";
    if (lang === 'hi') {
      welcome = `नमस्ते${profile.name ? ' ' + profile.name : ''}! मैं आपका **Sarkar Saathi AI सहायक** हूँ। 😊\n\n`;
      if (profile.state && profile.occupation) {
        const occMap = { 'Farmer': 'किसान', 'Student': 'छात्र/छात्रा', 'Senior Citizen': 'वरिष्ठ नागरिक', 'Unemployed': 'बेरोजगार युवा' };
        welcome += `मैंने देखा कि आप **${profile.state}** से एक **${occMap[profile.occupation] || profile.occupation}** हैं।\n`;
      }
      welcome += `मैं योजनाओं, आवश्यक दस्तावेज़ों (जैसे आधार, पैन कार्ड) और समस्याओं के समाधान में आपकी मदद कर सकता हूँ।\nआप मुझसे कोई भी सवाल पूछ सकते हैं!`;
    } else {
      welcome = `Hello${profile.name ? ' ' + profile.name : ''}! I am your **Sarkar Saathi AI Assistant**. 😊\n\n`;
      if (profile.state && profile.occupation) {
        welcome += `I see that you are a **${profile.occupation}** from **${profile.state}**.\n`;
      }
      welcome += `I can help you find government schemes, guide you through document applications, and resolve application issues.\nAsk me anything!`;
    }

    setMessages([
      { id: 'welcome', type: 'bot', text: welcome, time: getFormattedTime() }
    ]);
  }, [lang, profile]);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    chatLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    // 1. Add User bubble
    const userMsg = { id: `user-${Date.now()}`, type: 'user', text, time: getFormattedTime() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Compute AI Bot response
    setTimeout(() => {
      const responseText = calculateResponse(text);
      const botMsg = { id: `bot-${Date.now()}`, type: 'bot', text: responseText, time: getFormattedTime() };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 750);
  };

  const calculateResponse = (userText) => {
    const text = userText.toLowerCase().trim();

    // A. GREETINGS
    if (text === 'hi' || text === 'hello' || text === 'नमस्ते' || text === 'hey') {
      if (lang === 'hi') {
        return `नमस्ते! आशा है आप अच्छे होंगे। मैं आपकी किस प्रकार सहायता कर सकता हूँ?\n\nआप मुझसे अपनी **पात्रता**, किसी **सरकारी योजना**, या **दस्तावेज़ों** के बारे में प्रश्न पूछ सकते हैं।`;
      } else {
        return `Hello! Hope you are doing well. How can I assist you today?\n\nYou can ask me about your **eligibility**, **government schemes**, or **document processes**.`;
      }
    }

    // B. WHO ARE YOU
    if (text.includes('who are you') || text.includes('तुम्हारा नाम क्या है') || text.includes('तुम कौन हो')) {
      if (lang === 'hi') {
        return `मैं **Sarkar Saathi AI सहायक** हूँ। मेरा लक्ष्य देश के नागरिकों को सरकारी योजनाओं और दस्तावेज़ों की सही जानकारी प्रदान करना है।`;
      } else {
        return `I am the **Sarkar Saathi AI Assistant**. My mission is to simplify government schemes, document procedures, and solve application issues for Indian citizens.`;
      }
    }

    // C. ELIGIBILITY CHECKS
    if (text.includes('पात्रता') || text.includes('eligibility') || text.includes('eligible') || text.includes('योग्यता') || text.includes('लायक')) {
      const result = getBoostedEligibility(profile, schemes, profile.documents || []);
      
      if (lang === 'hi') {
        let reply = `आपकी वर्तमान प्रोफ़ाइल:\n- राज्य: **${profile.state || 'चयनित नहीं'}**\n- व्यवसाय: **${profile.occupation || 'चयनित नहीं'}**\n- आयु: **${profile.age || '0'} वर्ष**\n- वार्षिक आय: **₹${parseFloat(profile.income || 0).toLocaleString('en-IN')}**\n\n`;
        
        if (result.currentlyEligible.length > 0) {
          reply += `✅ **आप सीधे इन योजनाओं के लिए पात्र हैं:**\n`;
          result.currentlyEligible.slice(0, 3).forEach((s) => {
            reply += `- **${s.name}**\n`;
          });
          if (result.currentlyEligible.length > 3) reply += `- ...तथा ${result.currentlyEligible.length - 3} अन्य योजनाएँ।\n`;
        } else {
          reply += `❌ आप अभी किसी योजना की दस्तावेज़ पात्रता पूर्ण नहीं करते हैं।\n`;
        }

        if (result.boosterSchemes.length > 0) {
          reply += `\n💡 **पात्रता बूस्टर (अनलॉक करने योग्य योजनाएँ):**\n`;
          const docKeys = Object.keys(result.missingDocMap).sort((a, b) => result.missingDocMap[b].length - result.missingDocMap[a].length);
          docKeys.slice(0, 2).forEach(docId => {
            const docObj = documents.find(d => d.id === docId);
            const count = result.missingDocMap[docId].length;
            if (docObj) {
              reply += `- **${docObj.name}** बनवाकर आप **${count} नई योजनाएँ** (जैसे: *${result.missingDocMap[docId][0].name}*) अनलॉक कर सकते हैं।\n`;
            }
          });
        }
        return reply;
      } else {
        let reply = `Your Active Profile:\n- State: **${profile.state || 'Not Selected'}**\n- Occupation: **${profile.occupation || 'Not Selected'}**\n- Age: **${profile.age || '0'} years**\n- Income: **₹${parseFloat(profile.income || 0).toLocaleString('en-IN')}**\n\n`;
        
        if (result.currentlyEligible.length > 0) {
          reply += `✅ **You are directly eligible for these schemes:**\n`;
          result.currentlyEligible.slice(0, 3).forEach((s) => {
            reply += `- **${s.name}**\n`;
          });
          if (result.currentlyEligible.length > 3) reply += `- ...and ${result.currentlyEligible.length - 3} more schemes.\n`;
        } else {
          reply += `❌ You do not satisfy required document eligibility for any schemes right now.\n`;
        }

        if (result.boosterSchemes.length > 0) {
          reply += `\n💡 **Eligibility Booster Suggestions:**\n`;
          const docKeys = Object.keys(result.missingDocMap).sort((a, b) => result.missingDocMap[b].length - result.missingDocMap[a].length);
          docKeys.slice(0, 2).forEach(docId => {
            const docObj = documents.find(d => d.id === docId);
            const count = result.missingDocMap[docId].length;
            if (docObj) {
              reply += `- Getting **${docObj.name}** will unlock **${count} new schemes** (such as: *${result.missingDocMap[docId][0].name}*).\n`;
            }
          });
        }
        return reply;
      }
    }

    // D. PROBLEMS LOOKUP
    const matchedProblem = problems.find(p => p.issue.toLowerCase().includes(text));
    if (matchedProblem) {
      if (lang === 'hi') {
        return `मुझे आपकी समस्या **'${matchedProblem.issue}'** से संबंधित जानकारी मिली:\n\n- **संभावित कारण:** ${matchedProblem.possibleReason}\n- **निवारण:** ${matchedProblem.requiredFix}\n- **अगले कदम:**\n${matchedProblem.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
      } else {
        return `I found assistance for your issue **'${matchedProblem.issue}'**:\n\n- **Potential Cause:** ${matchedProblem.possibleReason}\n- **Resolution:** ${matchedProblem.requiredFix}\n- **Next Steps:**\n${matchedProblem.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
      }
    }

    // E. DOCUMENTS LOOKUP
    const matchedDoc = documents.find(d => d.name.toLowerCase().includes(text) || d.id.toLowerCase().includes(text));
    if (matchedDoc) {
      if (lang === 'hi') {
        return `मुझे **'${matchedDoc.name}'** से संबंधित गाइड मिली।\n\n- **विवरण:** ${matchedDoc.description}\n- **शुल्क:** ${matchedDoc.actions.new.fees}\n- **समय:** ${matchedDoc.actions.new.estimatedTime}\n- **कहाँ आवेदन करें:** ${matchedDoc.actions.new.whereToApply}`;
      } else {
        return `I found the guide for **'${matchedDoc.name}'**.\n\n- **Description:** ${matchedDoc.description}\n- **Fees:** ${matchedDoc.actions.new.fees}\n- **Processing Time:** ${matchedDoc.actions.new.estimatedTime}\n- **Where to Apply:** ${matchedDoc.actions.new.whereToApply}`;
      }
    }

    // F. SCHEMES LOOKUP
    const matchedScheme = schemes.find(s => s.name.toLowerCase().includes(text) || s.id.toLowerCase().includes(text));
    if (matchedScheme) {
      const typeLabel = matchedScheme.governmentType === 'Central' ? 'केंद्रीय' : `राज्य (${matchedScheme.state})`;
      if (lang === 'hi') {
        return `मुझे **'${matchedScheme.name}'** योजना के बारे में जानकारी मिली:\n\n- **प्रकार:** ${typeLabel}\n- **विवरण:** ${matchedScheme.description}\n- **लाभ:** ${matchedScheme.benefits}\n- **समय सीमा:** ${matchedScheme.processingTime}`;
      } else {
        return `Here is information on **'${matchedScheme.name}'**:\n\n- **Type:** ${matchedScheme.governmentType} Government\n- **Description:** ${matchedScheme.description}\n- **Benefits:** ${matchedScheme.benefits}\n- **Processing Time:** ${matchedScheme.processingTime}`;
      }
    }

    // G. DEFAULT FALLBACK
    if (lang === 'hi') {
      return `मैं आपकी बात पूरी तरह समझ नहीं पाया। 🤔\n\nकृपया अपने प्रश्न में किसी सरकारी दस्तावेज़ (जैसे: आधार, पैन कार्ड) या योजना के नाम (जैसे: पीएम किसान, लाडली बहना) का उपयोग करें, या फिर 'पात्रता' लिखकर अपना प्रोफाइल स्टेटस जानें।`;
    } else {
      return `I couldn't fully grasp your question. 🤔\n\nPlease try using specific terms like 'Aadhaar', 'PAN Card', 'PM Kisan', or type 'eligibility' to query your profile status.`;
    }
  };

  const parseMessageText = (text) => {
    // Escape markdown bolding: **bold** -> <strong>bold</strong>
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[75vh] transition-colors">
      
      {/* Bot Chat Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>Sarkar Saathi AI Guide</span>
            <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase">Active Assistant</span>
        </div>
      </div>

      {/* Messages Logs Area */}
      <div className="flex-grow overflow-y-auto my-4 pr-2 flex flex-col gap-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.type === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.type === 'user' ? 'bg-brand-primaryLight text-brand-primary' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {m.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`rounded-3xl p-4 flex flex-col gap-1 text-xs relative ${
              m.type === 'user' 
                ? 'bg-brand-primary text-white rounded-tr-none' 
                : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
            }`}>
              {parseMessageText(m.text)}
              <span className={`text-[8px] mt-1.5 self-end ${m.type === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 self-start max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl rounded-tl-none p-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={chatLogsEndRef} />
      </div>

      {/* Input Message Form Box */}
      <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand-primary"
          placeholder={lang === 'hi' ? "योजना या आवश्यक दस्तावेज़ों के बारे में पूछें..." : "Ask about schemes, documents, corrections..."}
        />
        <button 
          onClick={handleSend}
          className="bg-brand-primary hover:bg-brand-primaryDark text-white p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
