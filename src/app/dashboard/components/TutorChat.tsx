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
  userDiagram?: string;
  onQuestionGenerated?: (question: Question) => void;
}

interface ChatBubbleMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isFromVoice?: boolean;
  needsConfirmation?: boolean;
}

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
  
  // Function to extract and render SVG from message content
  const renderMessageContent = (content: string) => {
    const svgMatch = content.match(/```svg\s*([\s\S]*?)\s*```/);
    
    if (svgMatch) {
      const svgContent = svgMatch[1].trim();
      const textBefore = content.substring(0, svgMatch.index);
      const textAfter = content.substring(svgMatch.index! + svgMatch[0].length);
      
      return (
        <div>
          {textBefore && <p className="text-sm whitespace-pre-wrap mb-3">{textBefore}</p>}
          <div className="bg-white p-3 rounded border border-gray-200 my-3">
            <div 
              className="flex justify-center"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
          {textAfter && <p className="text-sm whitespace-pre-wrap mt-3">{textAfter}</p>}
        </div>
      );
    }
    
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-white text-gray-800 border border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 mb-1">
          {message.isFromVoice && (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          )}
          <span className={`text-xs font-medium ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {isUser ? 'You' : 'Tutor'}
          </span>
        </div>
        
        {renderMessageContent(message.content)}
        
        {isLoading && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
            <span className="text-xs text-gray-400">Thinking...</span>
          </div>
        )}
        
        {isTyping && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-400">Speaking...</span>
          </div>
        )}
        
        {showConfirmation && (
          <div className="flex space-x-2 mt-3">
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded"
            >
              Yes
            </Button>
            <Button
              onClick={onDeny}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
            >
              No
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
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
    if (isVoiceActive) {
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
    <div className="p-3 space-y-3">
      {/* Status indicators */}
      {(isUserSpeaking || isVoiceActive) && (
        <div className="flex items-center justify-between text-xs">
          {isUserSpeaking && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Listening...</span>
            </div>
          )}
          {isVoiceActive && (
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{isPaused ? 'Voice Paused' : 'Voice Active'}</span>
            </div>
          )}
        </div>
      )}

      {/* Main input area */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Send
          </button>
        </div>

        {/* Voice controls row */}
        <div className="flex items-center justify-center space-x-2">
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isVoiceLoading}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isVoiceActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${isVoiceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{isVoiceLoading ? '⏳' : isVoiceActive ? '🔴' : '🎤'}</span>
            <span>
              {isVoiceLoading ? 'Connecting...' : isVoiceActive ? 'Stop Voice' : 'Start Voice'}
            </span>
          </button>
          
          {isVoiceActive && (
            <button
              type="button"
              onClick={handlePauseToggle}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isPaused 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <span>{isPaused ? '▶️' : '⏸️'}</span>
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export const TutorChat = forwardRef<{ 
  resetChat: () => void;
  getChatContext: () => string;
}, TutorChatProps>(({ 
  question, 
  userCode, 
  userPseudoCode, 
  userDiagram,
  onQuestionGenerated
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatBubbleMessage[]>([]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [confirmationMessageId, setConfirmationMessageId] = useState<string | null>(null);
  const [pausedConversationHistory, setPausedConversationHistory] = useState<ChatBubbleMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    startCall, 
    endCall, 
    pauseCall, 
    resumeCall,
    isCallActive, 
    isPaused, 
    isLoading: isVoiceLoading,
    error: voiceError,
    transcript,
    conversationMessages,
    isSpeaking,
    isUserSpeaking
  } = useVapi();

  const pauseCallRef = useRef(pauseCall);
  useEffect(() => {
    pauseCallRef.current = pauseCall;
  }, [pauseCall]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const handleConfirmationDetected = useCallback((messageId: string) => {
    if (!awaitingConfirmation) {
      setAwaitingConfirmation(true);
      setConfirmationMessageId(messageId);
      
      setPausedConversationHistory(conversationMessages || []);
      
      if (isCallActive && !isPaused) {
        setTimeout(() => {
          pauseCallRef.current();
        }, 1000);
      }
    }
  }, [awaitingConfirmation, isCallActive, isPaused, conversationMessages]);

  // Enhanced chat context for diagram generation
  const getChatContext = useCallback(() => {
    const allConversation = [...allMessages].sort((a, b) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );
    
    // Format conversation with timestamps and better structure
    const formattedConversation = allConversation
      .map(msg => {
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Unknown';
        const speaker = msg.role === 'user' ? 'Student' : 'Tutor';
        const source = msg.isFromVoice ? '🎤' : '💬';
        
        return `[${timestamp}] ${source} ${speaker}: ${msg.content}`;
      })
      .join('\n\n');
    
    // Add summary if conversation is long
    if (formattedConversation.length > 2000) {
      const recentMessages = allConversation.slice(-10);
      const recentFormatted = recentMessages
        .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
        .join('\n\n');
      
      return `**Recent Conversation (last 10 messages):**\n${recentFormatted}\n\n**Total messages in conversation:** ${allConversation.length}`;
    }
    
    return formattedConversation || 'No conversation history available';
  }, [allMessages]);

  // Process and combine messages (simplified - no diagram detection)
  useEffect(() => {
    if (!conversationMessages && !messages.length) return;

    const voiceMessages = conversationMessages?.map((msg, index) => ({
      ...msg,
      id: `voice-${index}-${msg.role}-${msg.content.substring(0, 10)}`,
      isFromVoice: true,
      needsConfirmation: msg.role === 'assistant' ? checkIfNeedsConfirmation(msg.content) : false
    })) || [];
    
    const textMessages = messages.map(msg => ({
      id: msg.id,
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
      timestamp: msg.timestamp,
      isFromVoice: false,
      needsConfirmation: msg.needsConfirmation || false
    }));

    const combined = [...voiceMessages, ...textMessages].sort((a, b) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );

    setAllMessages(combined);
    
    const lastAssistantMessage = combined.filter(msg => msg.role === 'assistant').pop();
    if (lastAssistantMessage && lastAssistantMessage.needsConfirmation) {
      handleConfirmationDetected(lastAssistantMessage.id);
    }
  }, [conversationMessages, messages, checkIfNeedsConfirmation, handleConfirmationDetected]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, transcript]);

  const addMessage = (type: 'user' | 'tutor', content: string, questionData?: Question, needsConfirmation = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      question: questionData,
      needsConfirmation
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const updateLastMessage = (content: string, questionData?: Question) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage) {
        lastMessage.content = content;
        if (questionData) {
          lastMessage.question = questionData;
        }
      }
      return newMessages;
    });
  };

  const handleTextMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    setIsLoading(true);
    addMessage('user', messageContent);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageContent, 
          question: question?.title,
          userCode,
          userPseudoCode,
          userDiagram,
          chatHistory: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // If there's SVG content, embed it in the response
      let responseContent = data.response;
      if (data.svg) {
        responseContent = `${data.response}\n\n\`\`\`svg\n${data.svg}\n\`\`\``;
      }
      
      if (data.question) {
        const needsConfirmation = checkIfNeedsConfirmation(responseContent);
        addMessage('tutor', responseContent, data.question, needsConfirmation);
        onQuestionGenerated?.(data.question);
      } else {
        const needsConfirmation = checkIfNeedsConfirmation(responseContent);
        addMessage('tutor', responseContent, undefined, needsConfirmation);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVoice = () => {
    const chatHistory = messages.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp
    }));
    
    startCall(question, userCode, userPseudoCode, userDiagram, chatHistory);
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
    
    const success = await createProblemFromConversation(true);
    if (success) {
      endCall();
    }
  };

  const handleDenyProblem = () => {
    setAwaitingConfirmation(false);
    setConfirmationMessageId(null);
    
    if (isPaused) {
      resumeCall();
    }
  };

  const createProblemFromConversation = async (usePausedHistory = false) => {
    const messagesToUse = usePausedHistory ? pausedConversationHistory : conversationMessages;
    
    if (!messagesToUse?.length) {
      console.error('No conversation messages available');
      return false;
    }

    addMessage('tutor', 'Creating your coding problem...');

    try {
      const conversationText = messagesToUse
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const contextMessage = usePausedHistory 
        ? `Based on our conversation where we agreed on this problem, please create a Python coding problem. Here's our discussion:\n\n${conversationText}`
        : `Based on our conversation, please create a Python coding problem. Here's our discussion:\n\n${conversationText}`;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextMessage,
          question: question?.title,
          userCode,
          userPseudoCode,
          userDiagram,
          chatHistory: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          mode: 'generate'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.question) {
        onQuestionGenerated?.(data.question);
        
        const successMessage = data.fallback 
          ? `✅ Problem created! (Generated a classic problem while AI service is busy)`
          : `✅ Problem created: ${data.question.title}`;
        
        updateLastMessage(successMessage, data.question);
        return true;
      } else if (data.response) {
        updateLastMessage(data.response);
        return false;
      } else {
        throw new Error('No valid response received');
      }
    } catch (error: unknown) {
      console.error('Error creating problem:', error);
      
      let errorMessage = 'Sorry, I encountered an error creating the problem. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('overloaded')) {
          errorMessage = 'The AI service is temporarily overloaded. Please try again in a moment.';
        } else if (error.message.includes('HTTP 503')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few seconds.';
        }
      }
      
      updateLastMessage(errorMessage);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    resetChat: () => {
      setMessages([]);
      setAllMessages([]);
      setAwaitingConfirmation(false);
      setConfirmationMessageId(null);
      setPausedConversationHistory([]);
      
      if (isCallActive) {
        endCall();
      }
    },
    getChatContext
  }));

  const getVoiceStatus = () => {
    if (isVoiceLoading) return 'Connecting...';
    if (isCallActive && !isPaused) return 'Voice Active';
    if (isPaused) return 'Paused';
    return 'Voice Inactive';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Tutor Chat</h2>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">{getVoiceStatus()}</span>
          </div>
          {voiceError && (
            <span className="text-sm text-red-600">Error: {voiceError}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isLoading={isLoading && message === allMessages[allMessages.length - 1]}
            isTyping={isSpeaking && message.isFromVoice}
            showConfirmation={awaitingConfirmation && message.id === confirmationMessageId}
            onConfirm={handleConfirmProblem}
            onDeny={handleDenyProblem}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-700">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {transcript && isCallActive && (
          <div className="bg-gray-100 p-3 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Live Transcript</span>
            </div>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Redesigned bottom section */}
      <div className="border-t border-gray-200 bg-white rounded-b-lg">
        <MessageInput
          onSendMessage={handleTextMessage}
          disabled={isLoading}
          placeholder={
            awaitingConfirmation
              ? "Please use the Yes/No buttons above to confirm the problem..."
              : "Type your message or use voice..."
          }
          onStartVoice={handleStartVoice}
          onEndVoice={handleEndVoice}
          onPauseVoice={handlePauseVoice}
          onResumeVoice={handleResumeVoice}
          isVoiceActive={isCallActive}
          isPaused={isPaused}
          isVoiceLoading={isVoiceLoading}
          isUserSpeaking={isUserSpeaking}
        />
      </div>
    </div>
  );
});

TutorChat.displayName = 'TutorChat';
