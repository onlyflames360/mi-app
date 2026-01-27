
import React, { useState, useRef, useEffect } from 'react';
import { generalQuery } from '../services/geminiService';
import { Message } from '../types';

const GeneralAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isComplex, setIsComplex] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await generalQuery(input, isComplex);
      const aiMessage: Message = {
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <i className="fa-solid fa-sparkles"></i>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Multi-Model Assistant</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {isComplex ? 'Gemini 3 Pro (Deep Thinking)' : 'Gemini 3 Flash (Fast & Capable)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setIsComplex(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              !isComplex ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Flash
          </button>
          <button
            onClick={() => setIsComplex(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              isComplex ? 'bg-purple-600 text-white shadow-sm shadow-purple-200' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Pro
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#fafafa]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-comments text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-600">Start a Conversation</h3>
            <p className="text-sm max-w-xs mt-2">Ask questions, analyze code, or just chat. Switch to Pro for complex reasoning tasks.</p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                m.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                <p className={`text-[10px] mt-2 opacity-40 font-medium ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralAssistant;
