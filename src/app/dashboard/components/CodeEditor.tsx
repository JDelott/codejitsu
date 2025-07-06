'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/question';

interface CodeEditorProps {
  question: Question | null;
  onCodeChange?: (code: string) => void;
  onCodeSubmit?: (code: string) => void;
  isSubmitting?: boolean;
  resetTrigger?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  question, 
  onCodeChange, 
  
  
  resetTrigger
}) => {
  const [code, setCode] = useState(
    question?.starter || '# Write your Python code here\n\n'
  );

  // Update code when question changes
  useEffect(() => {
    if (question?.starter) {
      setCode(question.starter);
    }
  }, [question?.id]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger) {
      if (question?.starter) {
        setCode(question.starter);
      } else {
        setCode('# Write your Python code here\n\n');
      }
    }
  }, [resetTrigger, question?.starter]);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

 

 
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Code Editor - Centered with padding */}
      <div className="flex-1 p-8">
        <div className="h-full max-w-4xl mx-auto">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-6 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm"
            placeholder="Start coding! Open AI Tutor to generate problems or write your own Python code..."
            spellCheck={false}
            style={{ fontSize: '14px', lineHeight: '1.6' }}
          />
        </div>
      </div>
    </div>
  );
}; 
