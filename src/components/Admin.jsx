import React, { useState } from 'react';
import { Lock, Plus, Edit2, Trash2, Database, ShieldCheck, X } from 'lucide-react';
import * as DB from '../utils/db';

export default function Admin({ 
  schemes, 
  documents, 
  problems, 
  onDatabaseReload, 
  lang 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('sarkarsaathi_admin_auth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('schemes'); // 'schemes' | 'documents' | 'problems' | 'firebase'
  
  // Modal editor states
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editType, setEditType] = useState('scheme'); // 'scheme' | 'document' | 'problem'
  const [editItem, setEditItem] = useState(null);
  
  // Firebase configuration state
  const [fbConfig, setFbConfig] = useState(DB.getFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFirebaseSync = async () => {
    setIsSyncing(true);
    const success = await DB.pullFromFirebase();
    if (success) {
      onDatabaseReload();
      alert(lang === 'hi' ? "डेटाबेस क्लाउड से सफलतापूर्वक सिंक हो गया है!" : "Database successfully synced with Firebase!");
    } else {
      alert(lang === 'hi' ? "सिंक्रनाइज़ेशन विफल! कृपया अपने डेटाबेस URL की जाँच करें।" : "Sync failed! Please check your database URL.");
    }
    setIsSyncing(false);
  };

  const [aiConfig, setAiConfig] = useState(DB.getAIConfig() || {
    geminiApiKey: '',
    apiEndpoint: ''
  });

  const saveAISettings = () => {
    DB.saveAIConfig(aiConfig);
    alert(lang === 'hi' ? "एआई (Gemini AI) क्रेडेंशियल सहेजे गए!" : "Gemini AI configurations saved successfully!");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      sessionStorage.setItem('sarkarsaathi_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert(lang === 'hi' ? "गलत पासवर्ड!" : "Incorrect Password!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sarkarsaathi_admin_auth');
    setIsAuthenticated(false);
  };

  // Firebase setup actions
  const saveFirebaseSettings = () => {
    if (!fbConfig.databaseURL) {
      alert("Please enter a valid Database URL!");
      return;
    }
    DB.saveFirebaseConfig(fbConfig);
    alert(lang === 'hi' ? "फायरबेस क्रेडेंशियल सहेजे गए! अब डेटा क्लाउड से सिंक होगा।" : "Firebase credentials saved! Live sync enabled.");
  };

  const clearFirebaseSettings = () => {
    DB.clearFirebaseConfig();
    setFbConfig({ apiKey: '', authDomain: '', databaseURL: '', projectId: '' });
    alert(lang === 'hi' ? "फ़ायरबेस रीसेट! अब स्थानीय (LocalStorage) डेटाबेस सक्रिय है।" : "Firebase config reset. LocalStorage mode active.");
  };

  // Generic deletion triggers
  const handleDeleteScheme = async (id) => {
    if (confirm(lang === 'hi' ? "क्या आप वाकई इस योजना को हटाना चाहते हैं?" : "Are you sure you want to delete this scheme?")) {
      await DB.deleteScheme(id);
      onDatabaseReload();
    }
  };

  const handleDeleteDoc = async (id) => {
    if (confirm(lang === 'hi' ? "क्या आप वाकई इस दस्तावेज़ को हटाना चाहते हैं?" : "Are you sure you want to delete this document?")) {
      await DB.deleteDocument(id);
      onDatabaseReload();
    }
  };

  const handleDeleteProblem = async (id) => {
    if (confirm(lang === 'hi' ? "क्या आप वाकई इस समस्या विवरण को हटाना चाहते हैं?" : "Are you sure you want to delete this problem?")) {
      await DB.deleteProblem(id);
      onDatabaseReload();
    }
  };

  // Edit / Add Modal Controllers
  const openSchemeEditor = (scheme = null) => {
    setEditType('scheme');
    setEditItem(scheme ? JSON.parse(JSON.stringify(scheme)) : {
      id: `scheme_${Date.now()}`,
      name: '',
      governmentType: 'Central',
      state: '',
      description: '',
      benefits: '',
      eligibility: { ageMin: 18, ageMax: 60, gender: 'All', category: ['All'], occupations: ['All'], maxIncome: null, ruralUrban: 'Both', disability: 'Both' },
      requiredDocuments: [],
      processingTime: '15 दिन',
      applyMode: 'Both',
      officialWebsite: 'https://serviceonline.gov.in'
    });
    setEditorModalOpen(true);
  };

  const openDocEditor = (doc = null) => {
    setEditType('document');
    setEditItem(doc ? JSON.parse(JSON.stringify(doc)) : {
      id: `doc_${Date.now()}`,
      name: '',
      type: 'identity',
      description: '',
      dependencies: [],
      actions: {
        new: { requiredDocuments: [], fees: '₹50', estimatedTime: '15 दिन', whereToApply: 'CSC Center', officialWebsite: '', stepByStepGuide: [''], importantNotes: [''] }
      }
    });
    setEditorModalOpen(true);
  };

  const openProblemEditor = (prob = null) => {
    setEditType('problem');
    setEditItem(prob ? JSON.parse(JSON.stringify(prob)) : {
      id: `prob_${Date.now()}`,
      type: 'document',
      targetId: 'aadhaar',
      issue: '',
      possibleReason: '',
      requiredFix: '',
      requiredDocuments: [],
      officialGuidance: '',
      nextSteps: [''],
      officialWebsite: ''
    });
    setEditorModalOpen(true);
  };

  const handleModalSave = async () => {
    if (!editItem) return;

    if (editType === 'scheme') {
      if (!editItem.name || !editItem.description || !editItem.benefits) {
        alert("Please fill all required fields!");
        return;
      }
      await DB.saveScheme(editItem);
    } else if (editType === 'document') {
      if (!editItem.name || !editItem.description) {
        alert("Please enter document name and description!");
        return;
      }
      await DB.saveDocument(editItem);
    } else if (editType === 'problem') {
      if (!editItem.issue || !editItem.officialGuidance) {
        alert("Please enter issue title and guidance!");
        return;
      }
      // Populate required fields
      editItem.requiredFix = editItem.officialGuidance.split('.')[0] || "Contact nearest CSC kiosk.";
      editItem.nextSteps = editItem.nextSteps.filter(s => s.trim() !== '') || ['Visit official website.', 'Apply for correction.'];
      await DB.saveProblem(editItem);
    }

    setEditorModalOpen(false);
    onDatabaseReload();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center mt-12 transition-colors">
        <div className="w-16 h-16 bg-brand-primaryLight dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary text-2xl">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
          {lang === 'hi' ? 'एडमिन लॉगिन (Admin Login)' : 'Admin Login'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {lang === 'hi' ? 'डेटाबेस प्रबंधन के लिए कृपया पासवर्ड दर्ज करें (default: admin123)' : 'Please enter admin password to manage databases'}
        </p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{lang === 'hi' ? 'पासवर्ड' : 'Password'}:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-primary" 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all mt-2">
            {lang === 'hi' ? 'लॉगिन करें' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Admin Profile Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <span>{lang === 'hi' ? 'व्यवस्थापक नियंत्रण केंद्र (Admin Center)' : 'Admin Control Panel'}</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'hi' ? 'डेटाबेस प्रबंधन सक्रिय' : 'Database console active'}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap border-b border-slate-100 dark:border-slate-800 gap-1 pb-1">
        {[
          { id: 'schemes', label: lang === 'hi' ? 'योजनाएँ' : 'Schemes' },
          { id: 'documents', label: lang === 'hi' ? 'दस्तावेज़' : 'Documents' },
          { id: 'problems', label: lang === 'hi' ? 'समस्या समाधान' : 'Problems' },
          { id: 'firebase', label: lang === 'hi' ? 'क्लाउड और AI सेटिंग्स' : 'Cloud & AI Setup' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeSubTab === tab.id 
                ? 'bg-brand-primaryLight dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tabs Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
        
        {/* Schemes Tab */}
        {activeSubTab === 'schemes' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">{lang === 'hi' ? 'सभी योजनाएँ' : 'Schemes List'}</h3>
              <button 
                onClick={() => openSchemeEditor()}
                className="bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'नई योजना जोड़ें' : 'Add Scheme'}</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-black uppercase">
                    <th className="p-4">{lang === 'hi' ? 'योजना का नाम' : 'Scheme Name'}</th>
                    <th className="p-4">{lang === 'hi' ? 'प्रकार' : 'Type'}</th>
                    <th className="p-4">{lang === 'hi' ? 'समय सीमा' : 'Time Limit'}</th>
                    <th className="p-4 text-right">{lang === 'hi' ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {schemes.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="p-4 font-bold text-slate-400 capitalize">{s.governmentType}</td>
                      <td className="p-4 font-bold text-slate-400">{s.processingTime}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        <button onClick={() => openSchemeEditor(s)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteScheme(s.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeSubTab === 'documents' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">{lang === 'hi' ? 'सभी दस्तावेज़' : 'Documents List'}</h3>
              <button 
                onClick={() => openDocEditor()}
                className="bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'नया दस्तावेज़ जोड़ें' : 'Add Document'}</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-black uppercase">
                    <th className="p-4">{lang === 'hi' ? 'दस्तावेज़ का नाम' : 'Document Name'}</th>
                    <th className="p-4">{lang === 'hi' ? 'श्रेणी' : 'Type'}</th>
                    <th className="p-4 text-right">{lang === 'hi' ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{d.name}</td>
                      <td className="p-4 font-bold text-slate-400 capitalize">{d.type}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        <button onClick={() => openDocEditor(d)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteDoc(d.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Problems Tab */}
        {activeSubTab === 'problems' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">{lang === 'hi' ? 'समस्या समाधान डेटाबेस' : 'Problems List'}</h3>
              <button 
                onClick={() => openProblemEditor()}
                className="bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'नई समस्या जोड़ें' : 'Add Problem'}</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-black uppercase">
                    <th className="p-4">{lang === 'hi' ? 'समस्या / त्रुटि' : 'Issue Name'}</th>
                    <th className="p-4">{lang === 'hi' ? 'लक्ष्य दस्तावेज़' : 'Target Doc'}</th>
                    <th className="p-4 text-right">{lang === 'hi' ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{p.issue}</td>
                      <td className="p-4 font-bold text-slate-400 capitalize">{p.targetId}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        <button onClick={() => openProblemEditor(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteProblem(p.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Firebase + AI Settings Tab */}
        {activeSubTab === 'firebase' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            
            {/* 1. Firebase settings Panel */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-4.5 h-4.5 text-brand-primary" />
                <span>{lang === 'hi' ? 'फायरबेस रियलटाइम डेटाबेस सेटिंग्स' : 'Firebase Sync Settings'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' 
                  ? 'डिफ़ॉल्ट रूप से आपका डेटा ब्राउज़र के LocalStorage में रहता है। लाइव सर्वर डेटा सिंक्रोनाइज़ेशन सक्षम करने के लिए, नीचे अपना फ़ायरबेस क्रेडेंशियल सेट करें:'
                  : 'By default data is saved in LocalStorage. Enter database URL to enable live sync.'}
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Database URL (Realtime DB):</label>
                  <input 
                    type="text" 
                    value={fbConfig.databaseURL}
                    onChange={(e) => setFbConfig({ ...fbConfig, databaseURL: e.target.value })}
                    placeholder="https://project.firebaseio.com"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Project ID:</label>
                  <input 
                    type="text" 
                    value={fbConfig.projectId}
                    onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button 
                  onClick={saveFirebaseSettings}
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {lang === 'hi' ? 'सेटिंग्स सहेजें' : 'Save'}
                </button>
                {fbConfig.databaseURL && (
                  <button 
                    onClick={handleFirebaseSync}
                    disabled={isSyncing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {isSyncing 
                      ? (lang === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') 
                      : (lang === 'hi' ? 'सिंक करें (Pull)' : 'Pull (Sync)')}
                  </button>
                )}
                <button 
                  onClick={clearFirebaseSettings}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-350 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  {lang === 'hi' ? 'रीसेट' : 'Reset'}
                </button>
              </div>
            </div>

            {/* 2. Gemini AI Integration Panel */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                <span>{lang === 'hi' ? 'जेमिनी एआई (Gemini AI) एकीकरण' : 'Gemini AI Integration'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' 
                  ? 'चैटबॉट सहायक को वास्तविक एआई मॉडल से जोड़ने के लिए अपना जेमिनी एपीआई की (Gemini API Key) सेट करें। खाली रहने पर यह स्थानीय कीवर्ड मोड पर काम करेगा।'
                  : 'Add your Gemini API Key to route chatbot queries to a real AI model. Falls back to static rules if empty.'}
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Gemini API Key:</label>
                  <input 
                    type="password" 
                    value={aiConfig.geminiApiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">API Custom Endpoint (Optional):</label>
                  <input 
                    type="text" 
                    value={aiConfig.apiEndpoint}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiEndpoint: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 mt-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button 
                  onClick={saveAISettings}
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {lang === 'hi' ? 'सहेजें (Save AI)' : 'Save AI Config'}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Editor Modal for Adding/Editing Database Items */}
      {editorModalOpen && editItem && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
            
            {/* Modal Title */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 capitalize">
                {lang === 'hi' ? 'प्रविष्टि फॉर्म' : `${editType} editor form`}
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl outline-none"
                onClick={() => setEditorModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Fields Container */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-4 text-xs">
              
              {/* SCHEMES FIELDS FORM */}
              {editType === 'scheme' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">योजना का नाम (Scheme Name):</label>
                    <input 
                      type="text" 
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">प्रकार (Government Type):</label>
                      <select 
                        value={editItem.governmentType}
                        onChange={(e) => setEditItem({ ...editItem, governmentType: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                      >
                        <option value="Central">Central</option>
                        <option value="State">State</option>
                      </select>
                    </div>
                    {editItem.governmentType === 'State' && (
                      <div>
                        <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">राज्य (State Name):</label>
                        <input 
                          type="text" 
                          value={editItem.state || ''}
                          onChange={(e) => setEditItem({ ...editItem, state: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                          placeholder="e.g. Madhya Pradesh"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">योजना का विवरण (Description):</label>
                    <textarea 
                      value={editItem.description}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      rows="2"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">योजना के लाभ (Benefits):</label>
                    <textarea 
                      value={editItem.benefits}
                      onChange={(e) => setEditItem({ ...editItem, benefits: e.target.value })}
                      rows="2"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">न्यूनतम आयु (Min Age):</label>
                      <input 
                        type="number" 
                        value={editItem.eligibility.ageMin}
                        onChange={(e) => setEditItem({ ...editItem, eligibility: { ...editItem.eligibility, ageMin: parseInt(e.target.value) || 0 } })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">अधिकतम आयु (Max Age):</label>
                      <input 
                        type="number" 
                        value={editItem.eligibility.ageMax}
                        onChange={(e) => setEditItem({ ...editItem, eligibility: { ...editItem.eligibility, ageMax: parseInt(e.target.value) || 100 } })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">समय सीमा (Processing Time):</label>
                    <input 
                      type="text" 
                      value={editItem.processingTime}
                      onChange={(e) => setEditItem({ ...editItem, processingTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">आधिकारिक वेबसाइट (Website):</label>
                    <input 
                      type="text" 
                      value={editItem.officialWebsite}
                      onChange={(e) => setEditItem({ ...editItem, officialWebsite: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1.5">आवश्यक दस्तावेज़ (Required Documents):</label>
                    <div className="grid grid-cols-2 gap-2 border border-slate-100 dark:border-slate-850 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 max-h-32 overflow-y-auto">
                      {documents.map(d => {
                        const checked = editItem.requiredDocuments.includes(d.id);
                        return (
                          <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                let list = [...editItem.requiredDocuments];
                                if (checked) list = list.filter(id => id !== d.id);
                                else list.push(d.id);
                                setEditItem({ ...editItem, requiredDocuments: list });
                              }}
                              className="rounded text-brand-primary"
                            />
                            <span className="text-slate-700 dark:text-slate-300">{d.name.split(' (')[0]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS FIELDS FORM */}
              {editType === 'document' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">दस्तावेज़ का नाम (Document Name):</label>
                    <input 
                      type="text" 
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">दस्तावेज़ प्रकार (Document Type):</label>
                    <select
                      value={editItem.type}
                      onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    >
                      <option value="identity">Identity</option>
                      <option value="address">Address</option>
                      <option value="income">Financial/Income</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">संक्षिप्त विवरण (Description):</label>
                    <textarea 
                      value={editItem.description}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      rows="2"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">आवेदन शुल्क (Fees):</label>
                      <input 
                        type="text" 
                        value={editItem.actions.new.fees}
                        onChange={(e) => setEditItem({ 
                          ...editItem, 
                          actions: { 
                            ...editItem.actions, 
                            new: { ...editItem.actions.new, fees: e.target.value } 
                          } 
                        })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">अनुमानित समय सीमा (Time):</label>
                      <input 
                        type="text" 
                        value={editItem.actions.new.estimatedTime}
                        onChange={(e) => setEditItem({ 
                          ...editItem, 
                          actions: { 
                            ...editItem.actions, 
                            new: { ...editItem.actions.new, estimatedTime: e.target.value } 
                          } 
                        })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">कहाँ आवेदन करें (Where to Apply):</label>
                    <input 
                      type="text" 
                      value={editItem.actions.new.whereToApply}
                      onChange={(e) => setEditItem({ 
                        ...editItem, 
                        actions: { 
                          ...editItem.actions, 
                          new: { ...editItem.actions.new, whereToApply: e.target.value } 
                        } 
                      })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">आधिकारिक वेबसाइट (Website):</label>
                    <input 
                      type="text" 
                      value={editItem.actions.new.officialWebsite}
                      onChange={(e) => setEditItem({ 
                        ...editItem, 
                        actions: { 
                          ...editItem.actions, 
                          new: { ...editItem.actions.new, officialWebsite: e.target.value } 
                        } 
                      })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* PROBLEMS FIELDS FORM */}
              {editType === 'problem' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">समस्या / त्रुटि (Issue Title):</label>
                    <input 
                      type="text" 
                      value={editItem.issue}
                      onChange={(e) => setEditItem({ ...editItem, issue: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">श्रेणी (Type):</label>
                      <select
                        value={editItem.type}
                        onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                      >
                        <option value="document">Document related</option>
                        <option value="scheme">Scheme related</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">लक्ष्य दस्तावेज़ आईडी (Target ID):</label>
                      <input 
                        type="text" 
                        value={editItem.targetId}
                        onChange={(e) => setEditItem({ ...editItem, targetId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                        placeholder="e.g. aadhaar"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">संभावित कारण (Reason):</label>
                    <textarea 
                      value={editItem.possibleReason}
                      onChange={(e) => setEditItem({ ...editItem, possibleReason: e.target.value })}
                      rows="2"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">मार्गदर्शिका समाधान (Official Guidance):</label>
                    <textarea 
                      value={editItem.officialGuidance}
                      onChange={(e) => setEditItem({ ...editItem, officialGuidance: e.target.value })}
                      rows="3"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Form Action Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button 
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold transition-all" 
                onClick={() => setEditorModalOpen(false)}
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button 
                className="bg-brand-primary hover:bg-brand-primaryDark text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
                onClick={handleModalSave}
              >
                {lang === 'hi' ? 'सहेजें' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
