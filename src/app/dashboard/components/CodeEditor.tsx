'use client';

import React, { useEffect } from 'react';
import { Question } from '@/types/question';
import { Button } from '@/components/ui/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CodeEditorProps {
  question: Question;
  onCodeChange?: (code: string) => void;
  onCodeSubmit?: (code: string) => void;
  isSubmitting?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  question, 
  onCodeChange, 
  onCodeSubmit,
  isSubmitting = false
}) => {
  const [code, setCode] = useLocalStorage(`code-${question.id}`, question.starter);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  const handleCodeSubmit = () => {
    if (code.trim()) {
      onCodeSubmit?.(code);
    }
  };

  const handleReset = () => {
    setCode(question.starter);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Minimal Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
        <span className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase">
          Python Solution
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            onClick={handleCodeSubmit}
            disabled={isSubmitting || !code.trim()}
            size="sm"
          >
            {isSubmitting ? 'Submitting...' : 'Get Feedback'}
          </Button>
        </div>
      </div>

      {/* Code Editor - Maximum Space */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="absolute inset-0 w-full h-full p-4 border-0 font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none bg-white"
          placeholder="Write your Python solution here..."
          spellCheck={false}
          style={{ fontSize: '14px', lineHeight: '1.5' }}
        />
      </div>
    </div>
  );
}; 
