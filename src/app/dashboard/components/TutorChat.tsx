'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types/question';
import { useVapi } from '@/hooks/useVapi';

interface Message {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  question?: Question;
}

interface TutorChatProps {
  question?: Question | null;
  userCode?: string;
  onQuestionGenerated?: (question: Question) => void;
  onSubmissionStateChange?: (isSubmitting: boolean) => void;
}

export const TutorChat = forwardRef<{ submitCode: (code: string) => void }, TutorChatProps>(({ 
  question, 
  userCode, 
  onQuestionGenerated,
  onSubmissionStateChange
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { startCall, endCall, injectContext, isCallActive, isLoading: isVapiLoading, error: vapiError, transcript } = useVapi();

  // Add state to track the conversation flow
  const [conversationState, setConversationState] = useState<'welcome' | 'discovery' | 'skill-assessment' | 'problem-working'>('welcome');

  useImperativeHandle(ref, () => ({
    submitCode: (code: string) => {
      handleCodeSubmission(code);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    onSubmissionStateChange?.(isLoading);
  }, [isLoading, onSubmissionStateChange]);

  const addMessage = (type: 'user' | 'tutor', content: string, questionData?: Question) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      question: questionData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCodeSubmission = async (code: string) => {
    addMessage('user', `Please review my code:\n\n\`\`\`python\n${code}\n\`\`\``);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: code,
        difficulty: question.difficulty,
        category: question.category
      } : null;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Please review and provide feedback on my code solution for the problem "${question?.title}". Here's my code:\n\n${code}`,
          context,
          mode: 'review'
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('tutor', data.data);
      } else {
        addMessage('tutor', 'Sorry, I encountered an error reviewing your code. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting code to tutor:', error);
      addMessage('tutor', 'Sorry, I encountered an error reviewing your code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the functions to actually be used
  const startProblemDiscovery = () => {
    setConversationState('discovery');
    addMessage('tutor', `👋 Hi! I'm here to help you practice coding. Let's find the perfect problem for you!

What would you like to work on today?
• **Interview prep** - Classic problems like Two Sum, Binary Search
• **Algorithms** - Sorting, searching, graph problems  
• **Data structures** - Arrays, trees, linked lists
• **Specific topic** - Tell me what you want to practice

Just tell me what interests you or what you're preparing for!`);
  };

  // Make assessSkillLevel actually get called
  const handleTopicSelection = (message: string) => {
    if (conversationState === 'discovery') {
      setConversationState('skill-assessment');
      assessSkillLevel(message);
    }
  };

  const assessSkillLevel = (topic: string) => {
    addMessage('tutor', `Great choice on ${topic}! 

To give you the right challenge, how comfortable are you with this topic?
• **Beginner** - New to this, need fundamentals
• **Intermediate** - Know basics, want to practice
• **Advanced** - Looking for challenging problems

Or describe your experience level in your own words!`);
  };

  // Update generateQuestion to use presentProblem
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
          id: Date.now(),
          ...data.data
        };
        
        // Use presentProblem instead of the old format
        presentProblem(generatedQuestion);
        setConversationState('problem-working');
        
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

  const presentProblem = (question: Question) => {
    const problemIntro = `🎯 **${question.title}** (${question.difficulty})

Let's break this down together:

**What we're trying to solve:**
${question.description}

**Example to get us started:**
${question.examples[0] ? `
Input: ${question.examples[0].input}
Output: ${question.examples[0].output}
Why: ${question.examples[0].explanation}
` : ''}

**Before we code, let's think:**
1. What's the core problem we're solving?
2. What approach comes to mind first?
3. Are there any edge cases to consider?

Take your time to understand it, then tell me your initial thoughts!`;

    addMessage('tutor', problemIntro, question);
  };

  // Update sendMessage to handle conversation states
  const sendMessage = async (message: string, mode: string = 'hint') => {
    if (!message.trim()) return;

    addMessage('user', message);
    
    // Handle conversation flow
    if (conversationState === 'discovery') {
      handleTopicSelection(message);
      return;
    }
    
    if (conversationState === 'skill-assessment') {
      // Generate appropriate problem based on skill level
      const skillLevel = message.toLowerCase();
      let difficulty = 'Medium';
      if (skillLevel.includes('beginner') || skillLevel.includes('new')) {
        difficulty = 'Easy';
      } else if (skillLevel.includes('advanced') || skillLevel.includes('expert')) {
        difficulty = 'Hard';
      }
      
      const prompt = `Generate a ${difficulty} difficulty coding problem for someone with ${message} experience level.`;
      generateQuestion(prompt);
      return;
    }

    // Continue with existing sendMessage logic for problem-working state
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

  const applyQuestionToEditor = (questionData: Question) => {
    onQuestionGenerated?.(questionData);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHint = () => {
    if (question) {
      sendMessage(`Can you give me a hint for the problem "${question.title}"? I'm working on a ${question.difficulty} ${question.category} problem.`, 'hint');
    }
  };

  const requestSolution = () => {
    if (question) {
      sendMessage(`Please provide the complete solution with detailed explanation for the problem "${question.title}".`, 'solution');
    }
  };

  // Enhanced call handlers for different modes
  const handleStartHintCall = () => {
    startCall(question, userCode, 'hint');
  };

  const handleStartReviewCall = () => {
    startCall(question, userCode, 'review');
  };

  const handleStartSolutionCall = () => {
    startCall(question, userCode, 'solution');
  };

  // Inject code context during call
  const injectCodeContext = () => {
    if (userCode && isCallActive) {
      injectContext(`Here's my current code:\n\n\`\`\`python\n${userCode}\n\`\`\``);
    }
  };

  // Inject problem context during call
  const injectProblemContext = () => {
    if (question && isCallActive) {
      injectContext(`I'm working on: ${question.title}\n\nDescription: ${question.description}`);
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
          Get code feedback, hints, and generate coding problems
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          {/* Problem Generation */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Generate Problems</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startProblemDiscovery}
                disabled={isGenerating}
                className="text-xs"
              >
                👋 Start Problem Discovery
              </Button>
            </div>
          </div>

          {/* Current Problem Actions */}
          {question && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Problem</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getHint}
                  disabled={isLoading}
                  className="text-xs"
                >
                  💡 Get Hint
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestSolution}
                  disabled={isLoading}
                  className="text-xs"
                >
                  ✅ Show Solution
                </Button>
              </div>
            </div>
          )}

          {/* Voice Chat Section */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Voice Tutor</h3>
            <div className="space-y-2">
              {!isCallActive ? (
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    onClick={handleStartHintCall} 
                    className="w-full"
                    disabled={isVapiLoading}
                  >
                    {isVapiLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting...
                      </div>
                    ) : (
                      <>🎤 Get Hints</>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleStartReviewCall} 
                    className="w-full"
                    disabled={isVapiLoading}
                  >
                    🎤 Review Code
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleStartSolutionCall} 
                    className="w-full"
                    disabled={isVapiLoading}
                  >
                    🎤 Get Solution
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-sm text-green-700">Voice Chat Active</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={injectCodeContext} className="flex-1">
                      📝 Share Code
                    </Button>
                    <Button size="sm" onClick={injectProblemContext} className="flex-1">
                      📋 Share Problem
                    </Button>
                  </div>
                  
                  <Button size="sm" variant="outline" onClick={endCall} className="w-full">
                    🔴 End Call
                  </Button>
                </div>
              )}
              
              {/* Show transcript when available */}
              {transcript && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                  <span className="font-medium">You said:</span> {transcript}
                </div>
              )}
              
              {vapiError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  ⚠️ {vapiError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-lg font-medium mb-2">Ready to level up your coding?</p>
            <p className="text-sm mb-4">I&apos;ll help you practice with personalized problems and guidance</p>
            <Button onClick={startProblemDiscovery} className="bg-blue-600 text-white">
              Let&apos;s Get Started!
            </Button>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {message.question && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(message.question.difficulty)}`}>
                      {message.question.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {message.question.category}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applyQuestionToEditor(message.question!)}
                    className="mt-2 w-full"
                  >
                     Apply to Editor
                  </Button>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {(isLoading || isGenerating) && (
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
});

TutorChat.displayName = 'TutorChat'; 
