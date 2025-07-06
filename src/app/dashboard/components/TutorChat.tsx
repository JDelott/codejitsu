'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types/question';

interface Message {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

interface TutorChatProps {
  question?: Question;
  userCode?: string;
  onQuestionGenerated?: (question: Question) => void;
}

export const TutorChat: React.FC<TutorChatProps> = ({ 
  question, 
  userCode, 
  onQuestionGenerated 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'tutor', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (message: string, mode: string = 'hint') => {
    if (!message.trim()) return;

    addMessage('user', message);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: userCode || 'No code written yet',
        difficulty: question.difficulty,
        category: question.category
      } : null;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          mode
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('tutor', data.data);
      } else {
        addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message to tutor:', error);
      addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const generateQuestion = async (prompt: string) => {
    setIsGenerating(true);
    addMessage('user', `Generate a question: ${prompt}`);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          context: null,
          mode: 'generate'
        }),
      });

      const data = await response.json();

      if (data.success && !data.isText) {
        const generatedQuestion: Question = {
          id: Date.now(), // Temporary ID
          ...data.data
        };
        
        onQuestionGenerated?.(generatedQuestion);
        addMessage('tutor', `I've generated a new ${generatedQuestion.difficulty} problem about ${generatedQuestion.category}: "${generatedQuestion.title}". Good luck solving it!`);
      } else {
        addMessage('tutor', data.data);
      }
    } catch (error) {
      console.error('Error generating question:', error);
      addMessage('tutor', 'Sorry, I encountered an error generating the question.');
    } finally {
      setIsGenerating(false);
    }
  };

  const requestSolution = () => {
    if (question) {
      sendMessage('Please provide the complete solution with explanation.', 'solution');
    }
  };

  const reviewCode = () => {
    if (question && userCode) {
      sendMessage('Please review my code and provide feedback.', 'review');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase">
          AI Tutor
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ask for hints, generate problems, or get help with your code
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateQuestion('Generate an easy array problem')}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Easy Problem'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateQuestion('Generate a medium dynamic programming problem')}
            disabled={isGenerating}
          >
            Generate Medium Problem
          </Button>
          {question && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendMessage('Can you give me a hint for this problem?')}
                disabled={isLoading}
              >
                Get Hint
              </Button>
              {userCode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={reviewCode}
                  disabled={isLoading}
                >
                  Review Code
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={requestSolution}
                disabled={isLoading}
              >
                Show Solution
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">👋 Hi! I&apos;m your AI coding tutor.</p>
            <p className="text-sm">Ask me for hints, generate new problems, or get help with your code!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about coding..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}; 
