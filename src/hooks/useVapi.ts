import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

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

  const startCall = async () => {
    if (!vapi) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Since you created an assistant via dashboard, just use the assistant ID
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      
      if (!assistantId) {
        throw new Error('Assistant ID not found. Please check your environment variables.');
      }
      
      await vapi.start(assistantId);
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
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
    isCallActive,
    isLoading,
    error,
    transcript,
  };
};
