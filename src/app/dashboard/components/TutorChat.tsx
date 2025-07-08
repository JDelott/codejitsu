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

// Interface for chat bubble messages
interface ChatBubbleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isFromVoice?: boolean;
}

// Chat bubble component with progressive loading
const ChatBubble = ({ 
  message, 
  isLoading = false, 
  isTyping = false 
}: { 
  message: ChatBubbleMessage; 
  isLoading?: boolean; 
  isTyping?: boolean; 
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  if (isSystem) return null; // Don't render system messages
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slideInUp`}>
      <div className={`max-w-[85%] ${isUser ? 'ml-12' : 'mr-12'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }`}>
            {isUser ? (message.isFromVoice ? 'V' : 'U') : 'AI'}
          </div>
          
          {/* Message content */}
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
            
            {/* Timestamp */}
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clean message input component with microphone and pause
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
        
        {/* Pause Button - only show when voice is active */}
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
        
        {/* Microphone Button */}
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
        
        {/* Send Button */}
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
  onQuestionGenerated,
  onSubmissionStateChange
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingProblem, setIsProcessingProblem] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatBubbleMessage[]>([]);
  const [showActions, setShowActions] = useState(false);
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

  // Merge voice and text messages
  useEffect(() => {
    const voiceMessages = conversationMessages.map(msg => ({
      ...msg,
      isFromVoice: true
    }));
    
    const textMessages = messages.map(msg => ({
      id: msg.id,
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
      timestamp: msg.timestamp,
      isFromVoice: false
    }));

    // Combine and sort by timestamp
    const combined = [...voiceMessages, ...textMessages].sort((a, b) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );

    setAllMessages(combined);
  }, [conversationMessages, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, transcript]);

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

  const handleTextMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    addMessage('user', messageContent);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: userCode || '',
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
          mode: 'hint'
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('tutor', data.data);
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
    startCall(question, userCode, messages);
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

  const createProblemFromConversation = async (usePausedHistory = false) => {
    let conversationText = '';
    
    // Determine which conversation to use
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
    addMessage('user', usePausedHistory ? 'Create a problem based on our paused conversation' : 'Create a problem based on our conversation');

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Based on this voice conversation, create a structured coding problem:\n\n${conversationText}\n\nGenerate a proper coding problem with examples, constraints, and starter code. Make sure the problem is well-structured and complete.`,
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
        
        addMessage('tutor', `Perfect! I've created the "${generatedQuestion.title}" problem and set it up in your editor. You can start coding now!`, generatedQuestion);
        
        // If voice is active, inject context
        if (isCallActive && !isPaused) {
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
      case 'Easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const getVoiceStatus = () => {
    if (isPaused) return 'Voice paused';
    if (isCallActive) return 'Voice active';
    return 'Voice ready';
  };

  const hasConversationForProblem = () => {
    return (pausedHistory.length > 0) || (allMessages.length > 0) || fullConversation;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isPaused ? 'bg-orange-500' : 
              isCallActive ? 'bg-green-500 animate-pulse' : 
              'bg-gray-300'
            }`}></div>
            <div>
              <h2 className="font-medium text-gray-900">AI Coding Tutor</h2>
              <p className="text-sm text-gray-500">
                {getVoiceStatus()}
              </p>
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
            
            {/* Actions Toggle */}
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

      {/* Collapsible Actions */}
      {showActions && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex gap-2 mb-3">
            {(isCallActive || isPaused) && (
              <>
                <Button 
                  size="sm" 
                  onClick={injectCodeContext}
                  disabled={isPaused}
                  className="flex-1 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Share Code
                </Button>
                <Button 
                  size="sm" 
                  onClick={injectProblemContext}
                  disabled={isPaused}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Share Problem
                </Button>
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Regular problem creation */}
            <Button 
              size="sm"
              onClick={() => createProblemFromConversation(false)}
              disabled={isProcessingProblem || !hasConversationForProblem()}
              className="w-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {isProcessingProblem ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Problem...
                </div>
              ) : (
                'Create Problem from Current Chat'
              )}
            </Button>

            {/* Paused transcript problem creation */}
            {isPaused && pausedHistory.length > 0 && (
              <Button 
                size="sm"
                onClick={() => createProblemFromConversation(true)}
                disabled={isProcessingProblem}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isProcessingProblem ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Problem...
                  </div>
                ) : (
                  'Create Problem from Paused Transcript'
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Clean Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">Chat</div>
              <p className="text-lg">Start a conversation to get help with coding!</p>
              <p className="text-sm mt-2">You can type below or click the microphone to start voice chat</p>
            </div>
          </div>
        ) : (
          allMessages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))
        )}
        
        {/* Show typing indicator when assistant is speaking or loading */}
        {(isSpeaking || isLoading) && !isPaused && (
          <ChatBubble 
            message={{
              role: 'assistant',
              content: '',
              timestamp: new Date()
            }}
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Display */}
      {(isCallActive || isPaused) && (transcript || isUserSpeaking) && (
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
                {isPaused ? 'Click resume to continue' : 
                 transcript || 'Listening...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paused History Info */}
      {isPaused && pausedHistory.length > 0 && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="font-medium">Paused Session:</span>
            <span className="text-sm">{pausedHistory.length} messages saved. Use &quot;Create Problem from Paused Transcript&quot; to generate a coding problem.</span>
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

      {/* Message Input with Microphone and Pause */}
      <MessageInput
        onSendMessage={handleTextMessage}
        disabled={isLoading}
        placeholder="Type your message or click the microphone to start voice chat..."
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
