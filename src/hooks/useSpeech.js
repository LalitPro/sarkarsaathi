// React Hook for Speech Recognition (STT) and Synthesis (TTS)
import { useState } from 'react';

export const useSpeech = (lang) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-To-Speech (TTS) Readers
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("TTS audio is not supported in this browser.");
      return;
    }

    // Toggle speaking off if already speaking
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any active speech before starting new ones
    window.speechSynthesis.cancel();

    // Clean text by stripping markdown symbols
    const cleanText = text.replace(/[*#_`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0; // standard speaking rate
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speech-To-Text (STT) listeners
  const startListening = (onResultCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? "आपके ब्राउज़र में आवाज़ इनपुट सुविधा उपलब्ध नहीं है। कृपया क्रोम का उपयोग करें।" : "Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      if (onResultCallback) {
        onResultCallback(resultText);
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return {
    isListening,
    transcript,
    isSpeaking,
    speakText,
    stopSpeaking,
    startListening
  };
};
