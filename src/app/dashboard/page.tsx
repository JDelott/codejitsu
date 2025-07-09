'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Question } from '@/types/question';
import { CodeEditor } from './components/CodeEditor';
import { TutorChat } from './components/TutorChat';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [userPseudoCode, setUserPseudoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const chatRef = useRef<{ submitCode: (code: string) => void }>(null);

  const handleQuestionGenerated = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCodeChange = (code: string) => {
    setUserCode(code);
  };

  const handlePseudoCodeChange = (pseudoCode: string) => {
    setUserPseudoCode(pseudoCode);
  };

  const handleCodeSubmit = async (code: string) => {
    // Open chat if not already open
    if (!isChatOpen) {
      setIsChatOpen(true);
      // Wait for chat to render before submitting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Submit code to chat
    chatRef.current?.submitCode(code);
  };

  const handleGetFeedback = () => {
    if (userCode.trim()) {
      handleCodeSubmit(userCode);
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

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header with all controls */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <Link href="/" className="font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-[0.2em] hover:text-gray-600 transition-colors">
          ← CODEJITSU
        </Link>
        
        {/* Center section - Problem info */}
        <div className="flex items-center gap-4">
          {selectedQuestion && (
            <>
              <span className="text-lg font-semibold">{selectedQuestion.title}</span>
              <span className={`px-3 py-1 rounded text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                {selectedQuestion.difficulty}
              </span>
              <span className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700">
                {selectedQuestion.category}
              </span>
            </>
          )}
          {!selectedQuestion && (
            <span className="text-lg font-semibold text-gray-400">No Problem Selected</span>
          )}
        </div>
        
        {/* Right section - Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            {selectedQuestion ? 'Reset' : 'Clear'}
          </Button>
          <Button
            onClick={handleGetFeedback}
            disabled={isSubmitting || !userCode.trim()}
            size="sm"
          >
            {isSubmitting ? 'Submitting...' : 'Get Feedback'}
          </Button>
          <Button
            size="sm"
            variant={isChatOpen ? "primary" : "outline"}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? 'Hide Chat' : 'AI Tutor'}
          </Button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content Area - Centered */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor Container - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-5xl">
              <CodeEditor 
                question={selectedQuestion} 
                onCodeChange={handleCodeChange}
                onPseudoCodeChange={handlePseudoCodeChange}
                isSubmitting={isSubmitting}
                resetTrigger={resetTrigger}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Chat Panel */}
        <div className={`transition-all duration-300 ease-in-out ${
          isChatOpen ? 'w-96' : 'w-0'
        } border-l border-gray-200 overflow-hidden`}>
          {isChatOpen && (
            <div className="w-96 h-full">
              <TutorChat
                ref={chatRef}
                question={selectedQuestion}
                userCode={userCode}
                userPseudoCode={userPseudoCode}
                onQuestionGenerated={handleQuestionGenerated}
                onSubmissionStateChange={setIsSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
