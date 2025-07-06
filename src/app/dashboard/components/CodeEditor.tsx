'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/question';
import { Button } from '@/components/ui/Button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CodeEditorProps {
  question: Question;
  onCodeChange?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ question, onCodeChange }) => {
  const [code, setCode] = useLocalStorage(`code-${question.id}`, question.starter);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOutput(`Code executed successfully!\n\nNote: This is a demo. In a real implementation, this would:\n- Execute your Python code\n- Run test cases\n- Provide feedback on correctness and performance\n- Show execution time and memory usage`);
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(question.starter);
    setOutput('');
  };

  return (
    <div className="flex-1 p-6 border-t border-gray-200">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase">
            Python Solution
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              onClick={handleRunCode}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 border border-gray-300 rounded font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-black"
            placeholder="Write your Python solution here..."
            spellCheck={false}
          />

          {output && (
            <div className="mt-4 p-4 bg-gray-50 rounded border max-h-48 overflow-y-auto">
              <h3 className="font-medium text-sm mb-2">Output:</h3>
              <pre className="font-[family-name:var(--font-geist-mono)] text-sm text-gray-700 whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
