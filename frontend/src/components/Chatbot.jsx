import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Campus Bridge assistant. I can help you find opportunities, check your applications, and answer questions about the platform. What would you like to know?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setMessages(prev => [...prev, { text: 'Please log in to use the chatbot.', sender: 'bot' }]);
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;
      if (!userId) {
        setMessages(prev => [...prev, { text: 'Please log in again so I can access your profile.', sender: 'bot' }]);
        return;
      }

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userId,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Failed to parse chat response JSON', parseErr);
      }

      if (response.ok) {
        setMessages(prev => [...prev, { text: data?.response || 'I could not get a reply from the server.', sender: 'bot' }]);
      } else {
        const errorText = data?.message || `Server error (${response.status}). Please check backend.`;
        setMessages(prev => [...prev, { text: errorText, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { text: 'Network error or backend not available. Please make sure the server is running on port 5000.', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-black p-4 rounded-full shadow-lg transition-colors z-50"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-sky-500 text-black p-4 rounded-t-lg">
            <h3 className="font-semibold">Campus Bridge Assistant</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-black'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;