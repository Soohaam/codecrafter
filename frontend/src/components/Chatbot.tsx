"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { X, Maximize2, Minimize2, Send, Loader2 } from "lucide-react";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return <div className="text-red-500 p-4">Gemini API key is missing!</div>;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `
      You are a specialized AI assistant focused on autonomous surveillance systems using data fusion from various sensors including cameras, lasers, buried optic fibers, and unmanned ground sensors (UGS). 
      - Provide detailed, technical answers related to sensor fusion, data processing, and surveillance system architecture
      - Explain concepts, algorithms, and technologies relevant to multi-sensor surveillance
      - Offer insights on system design, implementation challenges, and optimization strategies
      - When asked about general topics, politely redirect to your area of expertise
      - Maintain a professional and technical tone
    `
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");
    setLoading(true);

    try {
      // Add context to the prompt to maintain conversation flow
      const conversationHistory = messages
        .map((msg) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const prompt = `
        Context: You are assisting with questions related to autonomous surveillance systems using data fusion from various sensors.
        Previous conversation:
        ${conversationHistory}

        Current user query: ${input}
      `;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      setMessages((prev) => [...prev, { text: responseText, isUser: false }]);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      setMessages((prev) => [...prev, { text: "Error: Could not get response", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  // UI remains the same as in your original code
  if (!isOpen) return null;

  return (
    <div
      className={`fixed bg-white shadow-xl rounded-lg flex flex-col z-50 transition-all duration-300 ${
        isExpanded
          ? "top-4 left-4 right-4 bottom-4 md:top-10 md:left-10 md:right-10 md:bottom-10"
          : "bottom-4 right-4 w-80 h-96 md:w-96 md:h-[28rem]"
      }`}
      role="dialog"
      aria-labelledby="chatbot-title"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
        <h3 id="chatbot-title" className="text-lg font-semibold">
          Surveillance System AI Assistant
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            aria-label={isExpanded ? "Collapse chatbot" : "Expand chatbot"}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            aria-label="Close chatbot"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>How can I assist you today?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 max-w-[85%] ${msg.isUser ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.isUser
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {msg.isUser ? "You" : "Surveillance AI"}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center text-gray-500 mb-4">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span>AI is processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Ask about surveillance systems..."
            disabled={loading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;