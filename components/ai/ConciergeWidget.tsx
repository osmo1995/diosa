
import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { conciergeResponse } from '../../services/geminiService';

export const ConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Welcome to Diosa Yorkville. How may I assist your beauty journey today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsTyping(true);
    const aiMsg = await conciergeResponse(userMsg);
    setIsTyping(false);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiMsg }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-white shadow-2xl rounded-lg border border-gray-100 flex flex-col animate-slide-up overflow-hidden h-[500px]">
          {/* Header */}
          <div className="bg-deep-charcoal p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-divine-gold rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-deep-charcoal" />
              </div>
              <span className="font-serif text-white tracking-widest text-lg">Diosa Concierge</span>
            </div>
            <button
              type="button"
              aria-label="Close concierge"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-divine-gold"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-divine-gold text-deep-charcoal rounded-l-lg rounded-tr-lg' 
                  : 'bg-soft-champagne text-deep-charcoal rounded-r-lg rounded-tl-lg'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-soft-champagne p-3 rounded-lg flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-divine-gold rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-divine-gold rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-divine-gold rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex items-center space-x-2">
            <input 
              type="text"
              aria-label="Ask the concierge"
              placeholder="Ask about extensions..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow text-sm p-2 outline-none"
            />
            <button 
              type="button"
              aria-label="Send message"
              onClick={handleSend}
              className="p-2 text-divine-gold hover:text-deep-charcoal transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          aria-label="Open concierge chat"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-divine-gold text-deep-charcoal rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
};
