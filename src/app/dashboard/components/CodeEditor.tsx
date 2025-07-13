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
  const [isProblemCollapsed, setIsProblemCollapsed] = useState(false);

  // Update code when question changes
  useEffect(() => {
    if (question?.starter) {
      setPythonCode(question.starter);
      setPseudoCode(''); // Clear pseudocode for new problem
    }
  }, [question?.id, question?.starter]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Left Sidebar - Problem Description */}
      {question && (
        <div className={`${isProblemCollapsed ? 'w-12' : 'w-96'} border-r border-gray-200 bg-white flex flex-col transition-all duration-300`}>
          {/* Collapse/Expand Button */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            {!isProblemCollapsed && (
              <h2 className="text-lg font-semibold text-gray-800">Problem</h2>
            )}
            <button
              onClick={() => setIsProblemCollapsed(!isProblemCollapsed)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              title={isProblemCollapsed ? 'Expand problem' : 'Collapse problem'}
            >
              {isProblemCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>

          {/* Problem Content */}
          {!isProblemCollapsed && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Problem Header */}
              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{question.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {question.category}
                  </span>
                </div>
              </div>

              {/* Problem Description */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed text-sm">{question.description}</p>
              </div>

              {/* Examples */}
              {question.examples && question.examples.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Examples</h3>
                  <div className="space-y-3">
                    {question.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="font-medium text-gray-900 mb-1 text-sm">Example {index + 1}:</div>
                        <div className="space-y-1 text-xs">
                          <div><strong>Input:</strong> <code className="bg-white px-1 py-0.5 rounded text-xs">{example.input}</code></div>
                          <div><strong>Output:</strong> <code className="bg-white px-1 py-0.5 rounded text-xs">{example.output}</code></div>
                          {example.explanation && (
                            <div className="text-gray-600"><strong>Explanation:</strong> {example.explanation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {question.constraints && question.constraints.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-sm">
                    {question.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints */}
              {question.hints && question.hints.length > 0 && (
                <details className="mb-4">
                  <summary className="text-md font-semibold text-gray-900 cursor-pointer hover:text-blue-600">
                    Hints ({question.hints.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {question.hints.map((hint, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                        <span className="font-medium text-blue-900 text-sm">Hint {index + 1}:</span> 
                        <span className="text-sm text-gray-700 ml-1">{hint}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right Side - Code Editor */}
      <div className="flex-1 flex flex-col h-full">
        {/* No Problem Selected State */}
        {!question && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Problem Selected</h3>
              <p className="text-gray-600 mb-4">Use the voice chat to generate a coding problem or select one from the sidebar.</p>
            </div>
          </div>
        )}

        {/* Code Editor Areas */}
        {question && (
          <div className="flex-1 flex flex-col p-6 bg-gray-50">
            <div className="flex-1 flex gap-6 max-w-none">
              
              {/* Pseudocode Section - Left Half */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Pseudocode & Planning
                  </h3>
                  <div className="text-sm text-gray-500">
                    Think through your approach
                  </div>
                </div>
                <textarea
                  value={pseudoCode}
                  onChange={(e) => setPseudoCode(e.target.value)}
                  className="flex-1 p-4 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm bg-blue-50/50 min-h-0"
                  placeholder="Plan your solution here...

Example:
1. Parse the input and understand the problem
2. Initialize necessary variables
3. Loop through elements or use appropriate algorithm
4. Apply core logic step by step
5. Handle edge cases
6. Return the final result

Tips:
- Break down complex problems into smaller parts
- Think about time and space complexity
- Consider different approaches (brute force vs optimized)"
                  spellCheck={false}
                  style={{ fontSize: '14px', lineHeight: '1.6' }}
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setPseudoCode('')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                  <div className="text-xs text-gray-400">
                    {pseudoCode.split('\n').length} lines
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px bg-gray-300"></div>

              {/* Python Code Section - Right Half */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Python Implementation
                  </h3>
                  <div className="text-sm text-gray-500">
                    Translate your plan into code
                  </div>
                </div>
                <textarea
                  value={pythonCode}
                  onChange={(e) => setPythonCode(e.target.value)}
                  className="flex-1 p-4 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 shadow-sm bg-green-50/50 min-h-0"
                  placeholder="Implement your solution here..."
                  spellCheck={false}
                  style={{ fontSize: '14px', lineHeight: '1.6' }}
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setPythonCode(question?.starter || '# Write your Python code here\n\n')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reset
                  </button>
                  <div className="text-xs text-gray-400">
                    {pythonCode.split('\n').length} lines • {pythonCode.length} chars
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
