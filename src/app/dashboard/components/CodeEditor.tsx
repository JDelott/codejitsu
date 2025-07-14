'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/question';
import { DiagramEditor } from './DiagramEditor';

interface CodeEditorProps {
  question: Question | null;
  onCodeChange?: (code: string) => void;
  onPseudoCodeChange?: (pseudoCode: string) => void;
  onDiagramChange?: (diagram: string) => void;
  resetTrigger?: number;
  aiGeneratedDiagram?: string;
  activeTab: 'problem' | 'code' | 'diagram';
  onQuestionGenerated?: (question: Question) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  question, 
  onCodeChange, 
  onPseudoCodeChange,
  onDiagramChange,
  resetTrigger,
  aiGeneratedDiagram,
  activeTab,
  
}) => {
  const [pseudoCode, setPseudoCode] = useState('');
  const [pythonCode, setPythonCode] = useState('# Write your Python code here\n\n');
  const [diagram, setDiagram] = useState('');

  // Update code when question changes
  useEffect(() => {
    if (question?.starter) {
      setPythonCode(question.starter);
    } else {
      setPythonCode('# Write your Python code here\n\n');
    }
    setPseudoCode('');
    setDiagram('');
  }, [question?.id, question?.starter]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setPseudoCode('');
      setDiagram('');
      if (question?.starter) {
        setPythonCode(question.starter);
      } else {
        setPythonCode('# Write your Python code here\n\n');
      }
    }
  }, [resetTrigger, question?.starter]);

  useEffect(() => {
    onCodeChange?.(pythonCode);
  }, [pythonCode, onCodeChange]);

  useEffect(() => {
    onPseudoCodeChange?.(pseudoCode);
  }, [pseudoCode, onPseudoCodeChange]);

  useEffect(() => {
    onDiagramChange?.(diagram);
  }, [diagram, onDiagramChange]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDiagramChange = (diagramData: string) => {
    setDiagram(diagramData);
  };

  if (activeTab === 'problem') {
    return (
      <div className="p-8 h-full overflow-y-auto">
        {question ? (
          <div className="max-w-4xl mx-auto">
            {/* Problem Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {question.category}
                </span>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mb-8">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{question.description}</p>
              </div>
            </div>

            {/* Examples */}
            {question.examples && question.examples.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Examples</h2>
                <div className="space-y-6">
                  {question.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="font-semibold text-gray-900 mb-3">Example {index + 1}</div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <span className="font-medium text-gray-700 w-20">Input:</span>
                          <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">{example.input}</code>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="font-medium text-gray-700 w-20">Output:</span>
                          <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">{example.output}</code>
                        </div>
                        {example.explanation && (
                          <div className="flex items-start space-x-3">
                            <span className="font-medium text-gray-700 w-20">Explanation:</span>
                            <p className="text-gray-600 flex-1">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {question.constraints && question.constraints.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Constraints</h2>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <ul className="space-y-2">
                    {question.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-gray-400 mt-1">•</span>
                        <span className="text-gray-700">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Hints */}
            {question.hints && question.hints.length > 0 && (
              <div className="mb-8">
                <details className="group">
                  <summary className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                    <span className="group-open:rotate-90 inline-block transition-transform mr-2">▶</span>
                    Hints ({question.hints.length})
                  </summary>
                  <div className="mt-4 space-y-4">
                    {question.hints.map((hint, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start space-x-3">
                          <span className="text-blue-600 font-semibold">💡 Hint {index + 1}:</span>
                          <span className="text-gray-700">{hint}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* AI Generated Diagram Preview */}
            {aiGeneratedDiagram && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI-Generated Diagram</h2>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div 
                    className="flex justify-center"
                    dangerouslySetInnerHTML={{ __html: aiGeneratedDiagram }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Problem Selected</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Start a conversation with the AI tutor to generate a coding problem, or browse existing problems.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'code') {
    return (
      <div className="p-8 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pseudocode Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-3">
                  <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                  <span>Pseudocode & Planning</span>
                </h2>
                <button
                  onClick={() => setPseudoCode('')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
              <p className="text-gray-600 mb-4">Plan your approach before coding</p>
              <textarea
                value={pseudoCode}
                onChange={(e) => setPseudoCode(e.target.value)}
                className="w-full h-96 p-6 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50/30"
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
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{pseudoCode.split('\n').length} lines</span>
                <span>{pseudoCode.length} characters</span>
              </div>
            </div>

            {/* Python Code Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-3">
                  <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                  <span>Python Implementation</span>
                </h2>
                <button
                  onClick={() => setPythonCode(question?.starter || '# Write your Python code here\n\n')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>
              <p className="text-gray-600 mb-4">Implement your solution</p>
              <textarea
                value={pythonCode}
                onChange={(e) => setPythonCode(e.target.value)}
                className="w-full h-96 p-6 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50/30"
                placeholder="Implement your solution here..."
                spellCheck={false}
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{pythonCode.split('\n').length} lines</span>
                <span>{pythonCode.length} characters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'diagram') {
    return (
      <div className="p-8 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Visual Diagram</h2>
            <p className="text-gray-600">Create visual representations of your solution</p>
          </div>
          
          <DiagramEditor
            onDiagramChange={handleDiagramChange}
            resetTrigger={resetTrigger}
            aiGeneratedDiagram={aiGeneratedDiagram}
          />
        </div>
      </div>
    );
  }

  return null;
}; 
