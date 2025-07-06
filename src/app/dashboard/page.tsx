'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { questions } from '@/lib/questions';
import { Question } from '@/types/question';
import { CodeEditor } from './components/CodeEditor';
import { TutorChat } from './components/TutorChat';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(questions[0]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userCode, setUserCode] = useState('');

  const handleQuestionGenerated = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCodeChange = (code: string) => {
    setUserCode(code);
  };

  const handleQuestionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const questionId = parseInt(e.target.value);
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setSelectedQuestion(question);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Compact Header */}
      <nav className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <Link href="/" className="font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-[0.2em] hover:text-gray-600 transition-colors">
          ← CODEJITSU
        </Link>
        
        {/* Problem Info & Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedQuestion.id}
              onChange={handleQuestionSelect}
              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-black text-sm"
            >
              {questions.map(question => (
                <option key={question.id} value={question.id}>
                  {question.title}
                </option>
              ))}
            </select>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
              {selectedQuestion.difficulty}
            </span>
          </div>
          
          <Button
            size="sm"
            variant={isChatOpen ? "primary" : "outline"}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? 'Hide Chat' : 'AI Tutor'}
          </Button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Main Content Area - Maximum Space */}
        <div className="flex-1 flex flex-col">
          {/* Minimal Problem Description */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm">{selectedQuestion.title}</h2>
              <span className="text-xs text-gray-500">
                {selectedQuestion.category}
              </span>
            </div>
          </div>
          
          {/* Code Editor - Takes All Remaining Space */}
          <CodeEditor 
            question={selectedQuestion} 
            onCodeChange={handleCodeChange} 
          />
        </div>

        {/* Collapsible Chat Panel */}
        <div className={`transition-all duration-300 ease-in-out ${
          isChatOpen ? 'w-96' : 'w-0'
        } border-l border-gray-200 overflow-hidden`}>
          {isChatOpen && (
            <div className="w-96 h-full">
              <TutorChat
                question={selectedQuestion}
                userCode={userCode}
                onQuestionGenerated={handleQuestionGenerated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
