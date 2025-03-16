
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, AlertTriangle } from "lucide-react";
import { analyzeThreatLevel } from "../utlis/threatAnalyzer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceAnalyzerProps {
  className?: string;
}

const DangerLevelIndicator = ({ level, score }: { level: string; score: number }) => {
  const colors = {
    none: "bg-gray-200",
    low: "bg-danger-low",
    medium: "bg-danger-medium",
    high: "bg-danger-high",
    critical: "bg-danger-critical",
  };
  
  const color = colors[level as keyof typeof colors] || colors.none;
  
  return (
    <div className="w-full mt-6 mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium uppercase tracking-wide">Threat Level: {level}</span>
        <span className="text-xs font-medium">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const WaveformAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className={`waveform-container text-primary transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="waveform-bar animate-waveform-1" />
      <div className="waveform-bar animate-waveform-2" />
      <div className="waveform-bar animate-waveform-3" />
      <div className="waveform-bar animate-waveform-4" />
      <div className="waveform-bar animate-waveform-5" />
      <div className="waveform-bar animate-waveform-4" />
      <div className="waveform-bar animate-waveform-3" />
      <div className="waveform-bar animate-waveform-2" />
      <div className="waveform-bar animate-waveform-1" />
    </div>
  );
};

const VoiceAnalyzer: React.FC<VoiceAnalyzerProps> = ({ className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [threatAnalysis, setThreatAnalysis] = useState({ 
    level: "none" as "none" | "low" | "medium" | "high" | "critical", 
    score: 0,
    keywords: [] as string[]
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setTranscript(prevTranscript => {
            const newTranscript = prevTranscript + finalTranscript;
            // Analyze threat level when transcript updates
            const analysis = analyzeThreatLevel(newTranscript);
            setThreatAnalysis(analysis);
            return newTranscript;
          });
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error("Speech recognition error: " + event.error);
        stopRecording();
      };
    } else {
      toast.error("Speech recognition is not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to access microphone. Please check permissions.");
    }
  };
  
  const stopRecording = () => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    toast.success("Recording stopped");
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const resetAll = () => {
    stopRecording();
    setTranscript("");
    setThreatAnalysis({ level: "none", score: 0, keywords: [] });
    toast.success("Cleared all data");
  };
  
  const renderThreatIndicator = () => {
    if (threatAnalysis.level === "none" || !transcript) {
      return null;
    }
    
    const levelLabels = {
      low: "Low Risk",
      medium: "Medium Risk",
      high: "High Risk",
      critical: "Critical Risk",
    };
    
    const levelColors = {
      low: "text-danger-low border-danger-low",
      medium: "text-danger-medium border-danger-medium",
      high: "text-danger-high border-danger-high",
      critical: "text-danger-critical border-danger-critical",
    };
    
    return (
      <div className={`mt-4 p-3 border rounded-md animate-fade-in ${levelColors[threatAnalysis.level as keyof typeof levelColors]}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">{levelLabels[threatAnalysis.level as keyof typeof levelLabels]}</span>
        </div>
        {threatAnalysis.keywords.length > 0 && (
          <div className="mt-2 text-sm">
            <p>Concerning keywords: {threatAnalysis.keywords.join(", ")}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="glass-morphism rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Voice Threat Analyzer</h2>
          <button
            onClick={resetAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <button
            onClick={toggleRecording}
            className={`relative w-20 h-20 flex items-center justify-center rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-destructive text-white animate-pulse-recording"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {isRecording ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {isRecording ? "Tap to stop recording" : "Tap to start recording"}
            </p>
          </div>
          
          <WaveformAnimation isActive={isRecording} />
        </div>
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Transcript</h3>
            <span className="text-xs text-gray-500">
              {transcript.length} characters
            </span>
          </div>
          
          <div className="min-h-[150px] max-h-[300px] overflow-y-auto p-4 bg-gray-50 rounded-md border border-gray-200">
            {transcript ? (
              <p className="whitespace-pre-wrap">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">
                Your recorded speech will appear here...
              </p>
            )}
          </div>
          
          {renderThreatIndicator()}
          
          {transcript && (
            <DangerLevelIndicator 
              level={threatAnalysis.level} 
              score={threatAnalysis.score} 
            />
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>Privacy note: Audio is processed locally and is not stored or transmitted.</p>
      </div>
    </div>
  );
};

export default VoiceAnalyzer;
