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
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingProblem, setIsProcessingProblem] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    startCall, 
    endCall, 
    injectContext, 
    isCallActive, 
    isLoading: isVapiLoading, 
    error: vapiError, 
    transcript,
    fullConversation
  } = useVapi();

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

  // Function to manually create problem from conversation
  const createProblemFromConversation = async () => {
    if (!fullConversation) {
      addMessage('tutor', 'No conversation to process yet. Start talking about what problem you want to work on!');
      return;
    }

    setIsProcessingProblem(true);
    addMessage('user', 'Create a problem based on our conversation');

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Based on this voice conversation, create a structured coding problem:\n\n${fullConversation}\n\nGenerate a proper coding problem with examples, constraints, and starter code.`,
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
        
        // Apply to editor
        if (onQuestionGenerated) {
          onQuestionGenerated(generatedQuestion);
        }
        
        addMessage('tutor', `🎯 Perfect! I've created the "${generatedQuestion.title}" problem and set it up in your editor. You can start coding now!`, generatedQuestion);
        
        // Confirm with voice
        if (isCallActive) {
          injectContext(`Great! I've set up the "${generatedQuestion.title}" problem in the editor. You can start coding now!`);
        }
        
      } else {
        addMessage('tutor', 'I had trouble creating a structured problem from our conversation. Let\'s try describing the problem more clearly.');
      }
    } catch (error) {
      console.error('Error creating problem:', error);
      addMessage('tutor', 'Sorry, I encountered an error creating the problem. Please try again.');
    } finally {
      setIsProcessingProblem(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const injectCodeContext = () => {
    if (userCode && isCallActive) {
      injectContext(`Here's my current code in the editor:\n\n\`\`\`python\n${userCode}\n\`\`\`\n\nWhat do you think? Any suggestions?`);
    } else if (isCallActive) {
      injectContext("My editor is currently empty. I'm ready to start coding!");
    }
  };

  const injectProblemContext = () => {
    if (question && isCallActive) {
      injectContext(`Just to remind you, I'm working on: "${question.title}"\n\nDescription: ${question.description}\n\nDifficulty: ${question.difficulty}\n\nAny specific guidance for this problem?`);
    } else if (isCallActive) {
      injectContext("I don't have a specific problem yet. Can you help me find one that matches what I want to practice?");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Simplified Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase">
          Voice Coding Tutor
        </h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600">
            {question ? `Working on: ${question.title}` : 'Ready to start with voice!'}
          </p>
          {question && (
            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Voice-First Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!isCallActive ? (
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎤</div>
            <h3 className="text-xl font-medium mb-4">Let&apos;s Code Together!</h3>
            <p className="text-gray-600 mb-6">
              I&apos;ll help you find the perfect coding problem and guide you through solving it. 
              Just start a voice conversation and tell me what you want to practice!
            </p>
            
            <Button 
              onClick={() => startCall(question, userCode, messages)}
              disabled={isVapiLoading}
              className="bg-blue-600 text-white px-8 py-3 text-lg"
            >
              {isVapiLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                <>🎤 Start Voice Session</>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 mt-4">
              I can see your current code and will help you step by step
            </p>
          </div>
        ) : (
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <h3 className="text-xl font-medium mb-2">Voice Session Active</h3>
            <p className="text-gray-600 mb-6">
              I&apos;m listening and ready to help! Tell me what you&apos;d like to work on.
            </p>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button size="sm" onClick={injectCodeContext} className="flex-1">
                  📝 Share Current Code
                </Button>
                <Button size="sm" onClick={injectProblemContext} className="flex-1">
                  📋 Share Problem
                </Button>
              </div>
              
              {/* Manual Problem Creation Button */}
              <Button 
                size="sm"
                onClick={createProblemFromConversation}
                disabled={isProcessingProblem || !fullConversation}
                className="w-full bg-purple-600 text-white"
              >
                {isProcessingProblem ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Problem...
                  </div>
                ) : (
                  <>🎯 Create Problem from Our Chat</>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={endCall}
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                🔴 End Session
              </Button>
            </div>
            
            {transcript && (
              <div className="mt-4 p-3 bg-gray-50 rounded border text-sm">
                <span className="font-medium">You said:</span> {transcript}
              </div>
            )}
          </div>
        )}
        
        {vapiError && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            ⚠️ {vapiError}
          </div>
        )}
      </div>

      {/* Minimal Text Chat for Reference */}
      <div className="border-t border-gray-200">
        <div className="p-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              <span>💬 Text Chat History ({messages.length} messages)</span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
              {messages.map((message) => (
                <div key={message.id} className={`text-xs p-2 rounded ${
                  message.type === 'user' ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-800'
                }`}>
                  <div className="font-medium">{message.type === 'user' ? 'You' : 'Tutor'}:</div>
                  <div className="mt-1">{message.content.substring(0, 100)}...</div>
                  {message.question && (
                    <Button
                      size="sm"
                      onClick={() => onQuestionGenerated?.(message.question!)}
                      className="mt-1 text-xs"
                    >
                      Apply to Editor
                    </Button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
});

TutorChat.displayName = 'TutorChat'; 
