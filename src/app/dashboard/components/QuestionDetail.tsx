'use client';

import React, { useState } from 'react';
import { Question } from '@/types/question';
import { Button } from '@/components/ui/Button';

interface QuestionDetailProps {
  question: Question;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question }) => {
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{question.title}</h1>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
          <div className="flex gap-2">
            {question.hints && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </Button>
            )}
            {question.solution && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {question.description}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Examples:</h3>
          {question.examples.map((example, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded mb-3">
              <div className="font-[family-name:var(--font-geist-mono)] text-sm space-y-1">
                <div><strong>Input:</strong> {example.input}</div>
                <div><strong>Output:</strong> {example.output}</div>
                <div><strong>Explanation:</strong> {example.explanation}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Constraints:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {question.constraints.map((constraint, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>

        {showHints && question.hints && (
          <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-medium mb-3 text-blue-900">Hints:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              {question.hints.map((hint, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showSolution && question.solution && (
          <div className="mb-6 p-4 bg-green-50 rounded border border-green-200">
            <h3 className="font-medium mb-3 text-green-900">Solution:</h3>
            <pre className="font-[family-name:var(--font-geist-mono)] text-sm text-green-800 whitespace-pre-wrap">
              {question.solution}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}; 
