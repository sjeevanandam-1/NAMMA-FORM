import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.js';

interface VoiceAssistantHook {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  isSupported: boolean;
  voiceError: string | null;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  clearVoiceError: () => void;
}

export function useVoiceAssistant(): VoiceAssistantHook {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please speak clearly into the microphone.');
        } else {
          setVoiceError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0]) {
          const text = event.results[0][0].transcript;
          setTranscript(text);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
  }, [language]);

  const startListening = () => {
    setVoiceError(null);
    if (!isSupported) {
      setVoiceError('Voice input is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn('Speech recognition start failed or already active:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any active utterances

      const cleanText = text.replace(/[*_#`]/g, ''); // strip markdown
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearVoiceError = () => setVoiceError(null);

  return {
    isListening,
    transcript,
    isSpeaking,
    isSupported,
    voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    clearVoiceError,
  };
}
