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

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [fullConversation, setFullConversation] = useState<string>('');

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '');
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
      setIsLoading(false);
      setFullConversation(''); // Reset conversation
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setIsLoading(false);
    });

    vapiInstance.on('speech-start', () => {
      console.log('User started speaking');
    });

    vapiInstance.on('speech-end', () => {
      console.log('User stopped speaking');
    });

    vapiInstance.on('message', (message: VapiMessage) => {
      console.log('Message received:', message);
      
      if (message.type === 'transcript') {
        setTranscript(message.transcript || '');
      }
      
      // Capture full conversation
      if (message.type === 'conversation-update' && Array.isArray(message.conversation)) {
        const conversationText = message.conversation
          .map((msg: VapiConversationEntry) => `${msg.role}: ${msg.content}`)
          .join('\n\n');
        setFullConversation(conversationText);
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
  }, []);

  const startCall = async (
    question?: Question | null, 
    userCode?: string, 
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
      
      const editorContext = userCode ? 
        `Current code in editor:\n\`\`\`python\n${userCode}\n\`\`\`` : 
        'Editor is empty - ready to start fresh';
      
      const chatHistorySummary = chatHistory.length > 0 
        ? chatHistory.map(msg => `${msg.type === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`).join('\n\n')
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

  const injectContext = (contextMessage: string) => {
    if (vapi && isCallActive) {
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
    if (vapi && isCallActive) {
      vapi.stop();
    }
  };

  return {
    startCall,
    endCall,
    injectContext,
    isCallActive,
    isLoading,
    error,
    transcript,
    fullConversation,
  };
};
