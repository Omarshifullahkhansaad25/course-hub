
import React, { useState, useEffect, useRef } from 'react';
import { createChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import Spinner from './Spinner';

type Message = {
  role: 'user' | 'model';
  text: string;
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(createChat(isThinkingMode));
    if (messages.length > 1 || messages[0].text !== 'Hello! How can I help you today?') {
       setMessages(prev => [...prev, { role: 'model', text: `Switched to ${isThinkingMode ? 'Thinking Mode' : 'Standard Mode'}.` }]);
    }
  }, [isThinkingMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const modelResponse: Message = { role: 'model', text: '' };
    setMessages(prev => [...prev, modelResponse]);

    try {
      const responseStream = await chat.sendMessageStream({ message: currentInput });
      let streamedText = '';
      for await (const chunk of responseStream) {
        streamedText += chunk.text;
        setMessages(prev =>
          prev.map((msg, i) =>
            i === prev.length - 1 ? { ...msg, text: streamedText } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error communicating with the chat API:", error);
      const errorText = 'Sorry, something went wrong. Please try again.';
      setMessages(prev =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, text: errorText } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  }

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-brand-blue text-white rounded-full p-4 shadow-lg hover:bg-blue-800 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue z-40"
        aria-label="Toggle Chat"
      >
        <ChatIcon className="h-8 w-8" />
      </button>

      <div className={`fixed bottom-24 right-6 w-full max-w-md bg-white rounded-lg shadow-2xl transition-all duration-300 z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
          <h3 className="font-bold text-gray-800 text-lg">AI Assistant</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BrainCircuitIcon className={`h-5 w-5 ${isThinkingMode ? 'text-brand-blue' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${isThinkingMode ? 'text-brand-blue' : 'text-gray-500'}`}>Thinking Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isThinkingMode} onChange={() => setIsThinkingMode(prev => !prev)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-secondary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
              </label>
            </div>
            <button onClick={toggleChat} className="text-gray-400 hover:text-gray-600" aria-label="Close chat">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 h-96 overflow-y-auto bg-gray-100">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm lg:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-blue text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-white text-gray-800 shadow-sm">
                   <div className="flex items-center space-x-2">
                      <Spinner />
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-3 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-3 bg-brand-blue text-white rounded-md hover:bg-blue-800 disabled:bg-gray-400"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
