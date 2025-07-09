'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/question';

interface CodeEditorProps {
  question: Question | null;
  onCodeChange?: (code: string) => void;
  onPseudoCodeChange?: (pseudoCode: string) => void;
  onCodeSubmit?: (code: string) => void;
  isSubmitting?: boolean;
  resetTrigger?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  question, 
  onCodeChange, 
  onPseudoCodeChange,
  resetTrigger
}) => {
  const [pseudoCode, setPseudoCode] = useState('');
  const [pythonCode, setPythonCode] = useState(
    question?.starter || '# Write your Python code here\n\n'
  );

  // Update code when question changes
  useEffect(() => {
    if (question?.starter) {
      setPythonCode(question.starter);
      setPseudoCode(''); // Clear pseudocode for new problem
    }
  }, [question?.id]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger) {
      if (question?.starter) {
        setPythonCode(question.starter);
      } else {
        setPythonCode('# Write your Python code here\n\n');
      }
      setPseudoCode(''); // Clear pseudocode on reset
    }
  }, [resetTrigger, question?.starter]);

  useEffect(() => {
    onCodeChange?.(pythonCode);
  }, [pythonCode, onCodeChange]);

  useEffect(() => {
    onPseudoCodeChange?.(pseudoCode);
  }, [pseudoCode, onPseudoCodeChange]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Enhanced Code Editor with Split View */}
      <div className="flex-1 p-8">
        <div className="h-full max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* Pseudocode Section */}
          <div className="h-2/5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Pseudocode & Planning
              </h3>
              <div className="text-sm text-gray-500">
                Think through your approach
              </div>
            </div>
            <textarea
              value={pseudoCode}
              onChange={(e) => setPseudoCode(e.target.value)}
              className="flex-1 p-4 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm bg-blue-50/30"
              placeholder="Plan your solution here...

Example:
1. Parse the input
2. Initialize variables
3. Loop through elements
4. Apply logic
5. Return result"
              spellCheck={false}
              style={{ fontSize: '14px', lineHeight: '1.6' }}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Implement below
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Python Code Section */}
          <div className="h-3/5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Python Implementation
              </h3>
              <div className="text-sm text-gray-500">
                Translate your plan into code
              </div>
            </div>
            <textarea
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              className="flex-1 p-4 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 shadow-sm bg-green-50/30"
              placeholder="Implement your solution here..."
              spellCheck={false}
              style={{ fontSize: '14px', lineHeight: '1.6' }}
            />
          </div>

          {/* Helper Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPseudoCode('')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <span>Clear Pseudocode</span>
              </button>
              <button
                onClick={() => setPythonCode(question?.starter || '# Write your Python code here\n\n')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <span>Reset Python Code</span>
              </button>
            </div>
            <div className="text-xs text-gray-400">
              {pythonCode.split('\n').length} lines • {pythonCode.length} characters
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}; 
