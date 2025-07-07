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

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  useEffect(() => {
    // Initialize Vapi with your public key
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '');
    setVapi(vapiInstance);

    // Set up event listeners
    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
      setIsLoading(false);
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

    vapiInstance.on('message', (message) => {
      console.log('Message received:', message);
      if (message.type === 'transcript') {
        setTranscript(message.transcript);
      }
    });

    vapiInstance.on('error', (error) => {
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
    mode: string = 'hint',
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
      
      // Get the appropriate system prompt based on mode
      const getSystemPrompt = (mode: string) => {
        switch (mode) {
          case 'generate':
            return 'Generate coding problems. Be brief and focused.';
          case 'hint':
            return 'Give brief, helpful hints without revealing the solution. Be concise and encouraging.';
          case 'review':
            return 'Review code briefly. Focus on correctness, complexity, and quick improvements.';
          case 'solution':
            return 'Provide clean solutions with working code, brief explanation, and complexity analysis.';
          default:
            return 'You are a helpful, concise coding tutor. Give brief, direct answers.';
        }
      };

      const getContextInstructions = (mode: string) => {
        switch (mode) {
          case 'generate':
            return 'Focus on creating appropriate difficulty problems for the user.';
          case 'hint':
            return 'Use the current problem context and chat history to provide relevant hints.';
          case 'review':
            return 'Analyze the provided code in context of the current problem and previous discussion.';
          case 'solution':
            return 'Provide the complete solution considering the previous conversation.';
          default:
            return 'Be helpful and educational, considering our previous conversation.';
        }
      };
      
      // Create chat history summary
      const chatHistorySummary = chatHistory.length > 0 
        ? chatHistory.map(msg => `${msg.type === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`).join('\n\n')
        : 'No previous conversation.';
      
      // Dynamic assistant configuration
      const assistantOverrides = {
        variableValues: {
          tutorMode: mode === 'generate' ? 'Problem Generator' : 'Coding Tutor',
          systemPrompt: getSystemPrompt(mode),
          problemTitle: question?.title || 'No current problem',
          problemDifficulty: question?.difficulty || 'Unknown',
          problemCategory: question?.category || 'General',
          userCode: userCode || 'No code written yet',
          contextInstructions: getContextInstructions(mode),
          chatHistory: chatHistorySummary
        }
      };
      
      await vapi.start(assistantId, assistantOverrides);
      
      // After call starts, inject chat history as context
      if (chatHistory.length > 0) {
        // Small delay to ensure call is fully established
        setTimeout(() => {
          if (vapi && isCallActive) {
            const contextMessage = `Here's our conversation so far:\n\n${chatHistorySummary}\n\nNow let's continue with voice chat.`;
            vapi.send({
              type: "add-message" as const,
              message: {
                role: "user",
                content: contextMessage
              }
            });
          }
        }, 1000);
      }
      
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
  };
};
