'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { questions, categories } from '@/lib/questions';
import { Question } from '@/types/question';
import { QuestionSidebar } from './components/QuestionSidebar';
import { QuestionDetail } from './components/QuestionDetail';
import { CodeEditor } from './components/CodeEditor';
import { TutorChat } from './components/TutorChat';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(questions[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showTutor, setShowTutor] = useState(false);
  const [userCode, setUserCode] = useState('');

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleQuestionGenerated = (question: Question) => {
    setSelectedQuestion(question);
    setShowTutor(false); // Switch back to problem view
  };

  const handleCodeChange = (code: string) => {
    setUserCode(code);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
        <Link href="/" className="font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-[0.2em] hover:text-gray-600 transition-colors">
          ← CODEJITSU
        </Link>
        <div className="flex items-center gap-8">
          <div className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-600">
            PYTHON INTERVIEW PREP
          </div>
          <div className="flex gap-4 text-sm">
            <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
              Progress: 0/5
            </span>
            <span className="px-2 py-1 bg-green-100 rounded text-green-700">
              Streak: 0
            </span>
            <Button
              size="sm"
              variant={showTutor ? "primary" : "outline"}
              onClick={() => setShowTutor(!showTutor)}
            >
              {showTutor ? 'Hide Tutor' : 'AI Tutor'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <QuestionSidebar
          questions={questions}
          categories={categories}
          selectedQuestion={selectedQuestion}
          selectedCategory={selectedCategory}
          onQuestionSelect={handleQuestionSelect}
          onCategorySelect={handleCategorySelect}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Display */}
          <QuestionDetail question={selectedQuestion} />
          
          {/* Code Editor */}
          <CodeEditor question={selectedQuestion} onCodeChange={handleCodeChange} />
        </div>

        {/* Tutor Panel */}
        {showTutor && (
          <div className="w-96 border-l border-gray-200">
            <TutorChat
              question={selectedQuestion}
              userCode={userCode}
              onQuestionGenerated={handleQuestionGenerated}
            />
          </div>
        )}
      </div>
    </div>
  );
} 
