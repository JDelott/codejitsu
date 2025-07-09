'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types/question';
import { useVapi } from '@/hooks/useVapi';

interface Message {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  question?: Question;
  needsConfirmation?: boolean;
}

interface TutorChatProps {
  question?: Question | null;
  userCode?: string;
  userPseudoCode?: string;
  onQuestionGenerated?: (question: Question) => void;
  onSubmissionStateChange?: (isSubmitting: boolean) => void;
}

// Interface for chat bubble messages
interface ChatBubbleMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isFromVoice?: boolean;
  needsConfirmation?: boolean;
}

// Enhanced chat bubble component with confirmation buttons
const ChatBubble = ({ 
  message, 
  isLoading = false, 
  isTyping = false,
  onConfirm,
  onDeny,
  showConfirmation = false
}: { 
  message: ChatBubbleMessage; 
  isLoading?: boolean; 
  isTyping?: boolean;
  onConfirm?: () => void;
  onDeny?: () => void;
  showConfirmation?: boolean;
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  if (isSystem) return null;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slideInUp`}>
      <div className={`max-w-[85%] ${isUser ? 'ml-12' : 'mr-12'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }`}>
            {isUser ? (message.isFromVoice ? 'V' : 'U') : 'AI'}
          </div>
          
          <div className={`relative max-w-full ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-3 rounded-2xl ${
              isUser 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
            } ${isLoading ? 'opacity-70' : ''}`}>
              <div className="text-sm leading-relaxed">
                {isLoading || isTyping ? (
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs ml-2">
                      {isUser ? 'Speaking...' : 'Thinking...'}
                    </span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>
            
            {showConfirmation && !isUser && !isLoading && !isTyping && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={onConfirm}
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm"
                >
                  ✓ Yes, let&apos;s do it!
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDeny}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm"
                >
                  ✗ No, let&apos;s adjust
                </Button>
              </div>
            )}
            
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MessageInput component (keeping the same)
const MessageInput = ({ 
  onSendMessage, 
  disabled, 
  placeholder = "Type your message...",
  onStartVoice,
  onEndVoice,
  onPauseVoice,
  onResumeVoice,
  isVoiceActive,
  isPaused,
  isVoiceLoading,
  isUserSpeaking
}: { 
  onSendMessage: (message: string) => void; 
  disabled?: boolean; 
  placeholder?: string;
  onStartVoice: () => void;
  onEndVoice: () => void;
  onPauseVoice: () => void;
  onResumeVoice: () => void;
  isVoiceActive: boolean;
  isPaused: boolean;
  isVoiceLoading: boolean;
  isUserSpeaking: boolean;
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    if (isPaused) {
      onResumeVoice();
    } else if (isVoiceActive) {
      onEndVoice();
    } else {
      onStartVoice();
    }
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      onResumeVoice();
    } else {
      onPauseVoice();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 bg-white border-t border-gray-200">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pr-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {(isVoiceActive || isPaused) && (
          <button
            type="button"
            onClick={handlePauseToggle}
            disabled={isVoiceLoading}
            className={`absolute right-20 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
              isPaused 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            } ${isVoiceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isPaused ? 'Resume voice session' : 'Pause voice session'}
          >
            {isPaused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>
        )}
        
        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={isVoiceLoading}
          className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
            isPaused
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : isVoiceActive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isVoiceLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
            isUserSpeaking ? 'animate-pulse' : ''
          }`}
          title={
            isPaused ? 'Resume voice session' : 
            isVoiceActive ? 'Stop voice session' : 'Start voice session'
          }
        >
          {isVoiceLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export const TutorChat = forwardRef<{ submitCode: (code: string) => void }, TutorChatProps>(({ 
  question, 
  userCode, 
  userPseudoCode,
  onQuestionGenerated,
  onSubmissionStateChange
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingProblem, setIsProcessingProblem] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatBubbleMessage[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [confirmationMessageId, setConfirmationMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    startCall, 
    endCall, 
    pauseCall,
    resumeCall,
    injectContext, 
    isCallActive, 
    isPaused,
    isLoading: isVapiLoading, 
    error: vapiError, 
    transcript,
    fullConversation,
    conversationMessages,
    pausedHistory,
    isSpeaking,
    isUserSpeaking
  } = useVapi();

  useImperativeHandle(ref, () => ({
    submitCode: (code: string) => {
      handleCodeSubmission(code);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // More specific confirmation detection
  const checkIfNeedsConfirmation = useCallback((content: string): boolean => {
    const confirmationPatterns = [
      /does this sound good/i,
      /should I create this problem for you/i,
      /would you like me to create this problem/i,
      /shall I set up this problem/i,
      /want me to generate this problem/i,
      /ready to work on this problem/i,
      /should I make this problem/i,
      /would you like to try this problem/i,
      /interested in this problem/i,
      /want to tackle this problem/i,
      /sound like a good problem/i,
      /ready to start with/i,
      /shall we work on/i,
      /want to work on/i
    ];
    
    return confirmationPatterns.some(pattern => pattern.test(content));
  }, []);

  // Handle auto-pause when confirmation is detected - separate from message processing
  const handleConfirmationDetected = useCallback((messageId: string) => {
    if (!awaitingConfirmation) {
      console.log('Confirmation detected, setting up UI');
      setAwaitingConfirmation(true);
      setConfirmationMessageId(messageId);
      
      // Auto-pause after a delay to avoid infinite loop
      if (isCallActive && !isPaused) {
        setTimeout(() => {
          console.log('Auto-pausing for confirmation');
          pauseCall();
        }, 1000);
      }
    }
  }, [awaitingConfirmation, isCallActive, isPaused, pauseCall]);

  // Process messages - FIXED dependency array
  useEffect(() => {
    console.log('Processing messages:', { 
      voiceMessages: conversationMessages.length, 
      textMessages: messages.length 
    });

    const voiceMessages = conversationMessages.map((msg, index) => ({
      ...msg,
      id: `voice-${index}-${msg.role}-${msg.content.substring(0, 10)}`,
      isFromVoice: true,
      needsConfirmation: msg.role === 'assistant' ? checkIfNeedsConfirmation(msg.content) : false
    }));
    
    const textMessages = messages.map(msg => ({
      id: msg.id,
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
      timestamp: msg.timestamp,
      isFromVoice: false,
      needsConfirmation: msg.needsConfirmation || false
    }));

    // Combine and sort by timestamp
    const combined = [...voiceMessages, ...textMessages].sort((a, b) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );

    console.log('Combined messages:', combined.length);
    setAllMessages(combined);
    
    // Check for confirmation needs - but don't trigger pause here
    const lastAssistantMessage = combined.filter(msg => msg.role === 'assistant').pop();
    if (lastAssistantMessage && lastAssistantMessage.needsConfirmation) {
      handleConfirmationDetected(lastAssistantMessage.id);
    }
  }, [conversationMessages, messages, checkIfNeedsConfirmation, handleConfirmationDetected]);

  // Separate useEffect for scrolling
  useEffect(() => {
    scrollToBottom();
  }, [allMessages, transcript]);

  useEffect(() => {
    onSubmissionStateChange?.(isLoading);
  }, [isLoading, onSubmissionStateChange]);

  const addMessage = (type: 'user' | 'tutor', content: string, questionData?: Question, needsConfirmation = false) => {
    const newMessage: Message = {
      id: `text-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
      question: questionData,
      needsConfirmation
    };
    console.log('Adding message:', newMessage);
    setMessages(prev => [...prev, newMessage]);
  };

  const handleTextMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    addMessage('user', messageContent);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: userCode || '',
        userPseudoCode: userPseudoCode || '',
        difficulty: question.difficulty,
        category: question.category
      } : null;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          context,
          mode: 'problem_discussion'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const needsConfirmation = checkIfNeedsConfirmation(data.data);
        addMessage('tutor', data.data, undefined, needsConfirmation);
      } else {
        addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmission = async (code: string) => {
    addMessage('user', `Please review my code:\n\n\`\`\`python\n${code}\n\`\`\``);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: code,
        userPseudoCode: userPseudoCode || '',
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

  const handleStartVoice = () => {
    console.log('Starting voice chat');
    setAwaitingConfirmation(false);
    setConfirmationMessageId(null);
    
    startCall(question, userCode, userPseudoCode, messages);
    
    setTimeout(() => {
      if (isCallActive) {
        injectContext("Hi! I need a Python coding problem to practice. What do you suggest? Be concise and suggest something specific.");
      }
    }, 2000);
  };

  const handleEndVoice = () => {
    endCall();
  };

  const handlePauseVoice = () => {
    pauseCall();
  };

  const handleResumeVoice = () => {
    resumeCall();
  };

  const handleConfirmProblem = async () => {
    setAwaitingConfirmation(false);
    setConfirmationMessageId(null);
    
    await createProblemFromConversation();
    
    if (isPaused) {
      setTimeout(() => resumeCall(), 500);
    }
  };

  const handleDenyProblem = () => {
    setAwaitingConfirmation(false);
    setConfirmationMessageId(null);
    
    addMessage('user', 'Let\'s try a different problem. What else do you suggest?');
    
    if (isPaused) {
      setTimeout(() => resumeCall(), 500);
    }
  };

  const createProblemFromConversation = async (usePausedHistory = false) => {
    let conversationText = '';
    
    if (usePausedHistory && pausedHistory.length > 0) {
      conversationText = pausedHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    } else if (fullConversation) {
      conversationText = fullConversation;
    } else if (allMessages.length > 0) {
      conversationText = allMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    }
    
    if (!conversationText) {
      addMessage('tutor', 'No conversation to process yet. Start talking about what problem you want to work on!');
      return;
    }

    setIsProcessingProblem(true);
    addMessage('user', 'Perfect! Create the problem for me.');

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Based on this conversation about creating a Python problem, generate a structured coding problem:\n\n${conversationText}\n\nCreate a complete, well-structured coding problem with examples, constraints, and starter code. The user has confirmed they want to work on this problem.`,
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
        
        if (onQuestionGenerated) {
          onQuestionGenerated(generatedQuestion);
        }
        
        addMessage('tutor', `Excellent! I've created the "${generatedQuestion.title}" problem and set it up in your editor. You can now start working on your pseudocode and implementation!`, generatedQuestion);
        
        if (isCallActive && !isPaused) {
          setTimeout(() => {
            injectContext(`Great! I've set up the "${generatedQuestion.title}" problem in the editor. You can start working on it now!`);
          }, 1000);
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
      case 'Easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVoiceStatus = () => {
    if (awaitingConfirmation) return 'Awaiting your choice';
    if (isPaused) return 'Voice paused';
    if (isCallActive) return 'Voice active';
    return 'Voice ready';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              awaitingConfirmation ? 'bg-yellow-500 animate-pulse' :
              isPaused ? 'bg-orange-500' : 
              isCallActive ? 'bg-green-500 animate-pulse' : 
              'bg-gray-300'
            }`}></div>
            <div>
              <h2 className="font-medium text-gray-900">AI Coding Tutor</h2>
              <p className="text-sm text-gray-500">{getVoiceStatus()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {question && (
              <>
                <span className={`px-3 py-1 rounded text-sm font-medium border ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="text-sm text-gray-600 max-w-32 truncate">
                  {question.title}
                </span>
              </>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowActions(!showActions)}
              className="ml-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Actions
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Alert */}
      {awaitingConfirmation && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="font-medium">⚡ Quick Decision:</span>
            <span className="text-sm">Voice chat paused. Choose Yes or No below to continue.</span>
          </div>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border-b border-gray-200 p-2 text-xs">
          <div>Messages: {allMessages.length} | Voice: {conversationMessages.length} | Text: {messages.length}</div>
          <div>Awaiting: {awaitingConfirmation.toString()} | Confirmation ID: {confirmationMessageId}</div>
          <div>Voice Active: {isCallActive.toString()} | Paused: {isPaused.toString()}</div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <p className="text-lg">Quick Python Problem Generator</p>
              <p className="text-sm mt-2">Click the microphone for a brief, focused chat!</p>
              <p className="text-xs mt-1 text-gray-400">I&apos;ll suggest a problem quickly and pause for your confirmation</p>
            </div>
          </div>
        ) : (
          <>
            {allMessages.map((message) => (
              <ChatBubble 
                key={message.id} 
                message={message} 
                showConfirmation={awaitingConfirmation && confirmationMessageId === message.id}
                onConfirm={handleConfirmProblem}
                onDeny={handleDenyProblem}
              />
            ))}
          </>
        )}
        
        {/* Typing indicator */}
        {(isSpeaking || isLoading) && !isPaused && !awaitingConfirmation && (
          <ChatBubble 
            message={{
              id: 'typing-indicator',
              role: 'assistant',
              content: '',
              timestamp: new Date()
            }}
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status */}
      {(isCallActive || isPaused) && (transcript || isUserSpeaking) && !awaitingConfirmation && (
        <div className={`border-t p-3 ${
          isPaused ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isPaused ? 'bg-orange-500' :
              isUserSpeaking ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1">
              <div className={`text-sm font-medium mb-1 ${
                isPaused ? 'text-orange-700' : 'text-blue-700'
              }`}>
                {isPaused ? 'Voice paused' : 
                 isUserSpeaking ? 'Speaking...' : 'Last said:'}
              </div>
              <div className={`text-sm ${
                isPaused ? 'text-orange-800' : 'text-blue-800'
              }`}>
                {isPaused ? 'Waiting for your choice' : 
                 transcript || 'Listening...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {vapiError && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span className="text-sm">{vapiError}</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleTextMessage}
        disabled={isLoading}
        placeholder="Type your message or click the microphone to discuss what Python problem you'd like to work on..."
        onStartVoice={handleStartVoice}
        onEndVoice={handleEndVoice}
        onPauseVoice={handlePauseVoice}
        onResumeVoice={handleResumeVoice}
        isVoiceActive={isCallActive}
        isPaused={isPaused}
        isVoiceLoading={isVapiLoading}
        isUserSpeaking={isUserSpeaking}
      />
    </div>
  );
});

TutorChat.displayName = 'TutorChat';
