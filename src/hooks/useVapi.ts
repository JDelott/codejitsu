import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Question } from '@/types/question';

// Add interface for message history
interface ChatMessage {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

// Add proper interfaces for VAPI messages
interface VapiMessage {
  type: string;
  transcript?: string;
  conversation?: VapiConversationEntry[];
}

interface VapiConversationEntry {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface VapiError {
  message?: string;
}

// Enhanced conversation message interface
interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

interface UseVapiReturn {
  startCall: (question?: Question | null, userCode?: string, userPseudoCode?: string, chatHistory?: ChatMessage[]) => Promise<void>;
  endCall: () => void;
  pauseCall: () => void;
  resumeCall: () => void;
  injectContext: (contextMessage: string) => void;
  isCallActive: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  transcript: string;
  fullConversation: string;
  conversationMessages: ConversationMessage[];
  pausedHistory: ConversationMessage[];
  isSpeaking: boolean;
  isUserSpeaking: boolean;
}

export const useVapi = (): UseVapiReturn => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [fullConversation, setFullConversation] = useState<string>('');
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [pausedHistory, setPausedHistory] = useState<ConversationMessage[]>([]);

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '');
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
      setIsLoading(false);
      setIsPaused(false);
      // Don't reset conversation if resuming from pause
      if (!isPaused) {
        setFullConversation('');
        setConversationMessages([]);
        setTranscript('');
        setPausedHistory([]);
      }
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setIsLoading(false);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      if (!isPaused) {
        setIsPaused(false);
        setPausedHistory([]);
      }
    });

    vapiInstance.on('speech-start', () => {
      console.log('User started speaking');
      if (!isPaused) {
        setIsUserSpeaking(true);
      }
    });

    vapiInstance.on('speech-end', () => {
      console.log('User stopped speaking');
      setIsUserSpeaking(false);
    });

    vapiInstance.on('message', (message: VapiMessage) => {
      console.log('Message received:', message);
      
      if (message.type === 'transcript' && !isPaused) {
        setTranscript(message.transcript || '');
      }
      
      // Capture full conversation
      if (message.type === 'conversation-update' && Array.isArray(message.conversation)) {
        const conversationText = message.conversation
          .map((msg: VapiConversationEntry) => `${msg.role}: ${msg.content}`)
          .join('\n\n');
        setFullConversation(conversationText);
        
        // Convert to structured messages
        const structuredMessages: ConversationMessage[] = message.conversation.map((msg, index) => ({
          id: `${msg.role}-${index}-${Date.now()}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
          isComplete: true
        }));
        
        setConversationMessages(structuredMessages);
      }
    });

    vapiInstance.on('error', (error: VapiError) => {
      console.error('Vapi error:', error);
      setError(error.message || 'An error occurred');
      setIsLoading(false);
    });

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [isPaused]);

  const startCall = async (
    question?: Question | null, 
    userCode?: string, 
    userPseudoCode?: string,
    chatHistory: ChatMessage[] = []
  ) => {
    if (!vapi) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      
      if (!assistantId) {
        throw new Error('Assistant ID not found.');
      }
      
      // Build comprehensive editor context
      let editorContext = '';
      
      if (userPseudoCode && userCode) {
        editorContext = `Current work in editor:

**Pseudocode/Planning:**
${userPseudoCode}

**Python Implementation:**
\`\`\`python
${userCode}
\`\`\``;
      } else if (userPseudoCode) {
        editorContext = `Current pseudocode in editor:

${userPseudoCode}

Python code section is still empty - ready to implement.`;
      } else if (userCode) {
        editorContext = `Current code in editor:
\`\`\`python
${userCode}
\`\`\`

No pseudocode written yet.`;
      } else {
        editorContext = 'Editor is empty - ready to start fresh';
      }
      
      // Include both regular chat history and paused history
      const allHistory = [...chatHistory];
      if (pausedHistory.length > 0) {
        const pausedText = pausedHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`).join('\n\n');
        allHistory.push({
          id: 'paused-history',
          type: 'tutor',
          content: `Previous conversation context:\n${pausedText}`,
          timestamp: new Date()
        });
      }
      
      const chatHistorySummary = allHistory.length > 0 
        ? allHistory.map(msg => `${msg.type === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`).join('\n\n')
        : 'First conversation - no previous context';
      
      const assistantOverrides = {
        variableValues: {
          userCode: editorContext,
          problemTitle: question?.title || 'No current problem',
          problemDifficulty: question?.difficulty || 'To be determined',
          chatHistory: chatHistorySummary
        }
      };
      
      await vapi.start(assistantId, assistantOverrides);
      
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
    }
  };

  const pauseCall = () => {
    if (vapi && isCallActive && !isPaused) {
      console.log('Pausing call');
      // Store current conversation state
      setPausedHistory(conversationMessages);
      setIsPaused(true);
      
      // Send pause message to assistant
      vapi.send({
        type: "add-message" as const,
        message: {
          role: "user",
          content: "Please pause our conversation. I'll resume shortly and you should remember everything we've discussed."
        }
      });
      
      // Stop the call but keep the paused state
      vapi.stop();
    }
  };

  const resumeCall = async () => {
    if (isPaused && pausedHistory.length > 0) {
      console.log('Resuming call with history');
      
      // Create a summary of the paused conversation
      const pausedConversationSummary = pausedHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');
      
      // Start a new call with the paused history
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        setError('Assistant ID not found.');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const assistantOverrides = {
          variableValues: {
            userCode: 'Resuming previous conversation',
            problemTitle: 'Continuing previous session',
            problemDifficulty: 'Resuming',
            chatHistory: `Resuming paused conversation:\n\n${pausedConversationSummary}\n\nWe're continuing our conversation now.`
          }
        };
        
        if (!vapi) {
          throw new Error('Vapi instance not found');
        }
        
        await vapi.start(assistantId, assistantOverrides);
        
        // Send resume message
        setTimeout(() => {
          if (vapi) {
            vapi.send({
              type: "add-message" as const,
              message: {
                role: "user",
                content: "Hi, I'm back! Please continue our conversation where we left off."
              }
            });
          }
        }, 1000);
        
      } catch (err) {
        console.error('Failed to resume call:', err);
        setError(err instanceof Error ? err.message : 'Failed to resume call');
        setIsLoading(false);
      }
    }
  };

  const injectContext = (contextMessage: string) => {
    if (vapi && isCallActive && !isPaused) {
      vapi.send({
        type: "add-message" as const,
        message: {
          role: "user",
          content: contextMessage
        }
      });
    }
  };

  const endCall = () => {
    if (vapi && (isCallActive || isPaused)) {
      vapi.stop();
      setIsPaused(false);
      setPausedHistory([]);
    }
  };

  return {
    startCall,
    endCall,
    pauseCall,
    resumeCall,
    injectContext,
    isCallActive,
    isPaused,
    isLoading,
    error,
    transcript,
    fullConversation,
    conversationMessages,
    pausedHistory,
    isSpeaking,
    isUserSpeaking,
  };
};
