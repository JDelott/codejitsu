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
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    onCodeChange?.(code);
  }, [code, onCodeChange]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    setShowOutput(true);
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOutput(`Code executed successfully!\n\nNote: This is a demo. In a real implementation, this would:\n- Execute your Python code\n- Run test cases\n- Provide feedback on correctness and performance\n- Show execution time and memory usage`);
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(question.starter);
    setOutput('');
    setShowOutput(false);
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
            onClick={handleRunCode}
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          {output && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOutput(!showOutput)}
            >
              {showOutput ? 'Hide Output' : 'Show Output'}
            </Button>
          )}
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

      {/* Collapsible Output */}
      {showOutput && output && (
        <div className="border-t border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">Output:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOutput(false)}
              >
                ×
              </Button>
            </div>
            <pre className="font-[family-name:var(--font-geist-mono)] text-sm text-gray-700 whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}; 
