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
  const [userDiagram, setUserDiagram] = useState('');
  const [aiGeneratedDiagram, setAiGeneratedDiagram] = useState('');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  
  const tutorChatRef = useRef<{ resetChat: () => void; getChatContext: () => string } | null>(null);

  const handleQuestionGenerated = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCodeChange = (code: string) => {
    setUserCode(code);
  };

  const handlePseudoCodeChange = (pseudoCode: string) => {
    setUserPseudoCode(pseudoCode);
  };

  const handleDiagramChange = (diagram: string) => {
    setUserDiagram(diagram);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
  };

  const handleGenerateDiagram = async () => {
    if (!selectedQuestion) {
      alert('Please select a problem first');
      return;
    }

    setIsGeneratingDiagram(true);
    
    try {
      // Get comprehensive context from chat
      const chatContext = tutorChatRef.current?.getChatContext() || '';
      
      // Build comprehensive context for better diagram generation
      const requestData = {
        problem: {
          title: selectedQuestion.title,
          description: selectedQuestion.description,
          difficulty: selectedQuestion.difficulty,
          category: selectedQuestion.category,
          examples: selectedQuestion.examples || []
        },
        currentWork: {
          code: userCode,
          pseudoCode: userPseudoCode,
          existingDiagram: userDiagram
        },
        conversationHistory: chatContext,
        timestamp: new Date().toISOString()
      };

      console.log('Generating diagram with context:', requestData);

      const response = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.svg) {
        setAiGeneratedDiagram(data.svg);
        console.log('✅ Diagram generated successfully');
      } else {
        console.error('❌ Diagram generation failed:', data.error);
        throw new Error(data.error || 'No diagram generated');
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      alert('Failed to generate diagram. Please try again.');
    } finally {
      setIsGeneratingDiagram(false);
    }
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
          {/* Generate Diagram Button */}
          <Button
            onClick={handleGenerateDiagram}
            disabled={!selectedQuestion || isGeneratingDiagram}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGeneratingDiagram ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                🎨 Generate Diagram
              </>
            )}
          </Button>

          <Button onClick={handleReset} className="bg-gray-500 hover:bg-gray-600 text-white">
            Reset
          </Button>
          
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`${isChatOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </Button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Code Editor */}
        <div className="flex-1">
          <CodeEditor
            question={selectedQuestion}
            onCodeChange={handleCodeChange}
            onPseudoCodeChange={handlePseudoCodeChange}
            onDiagramChange={handleDiagramChange}
            resetTrigger={resetTrigger}
            aiGeneratedDiagram={aiGeneratedDiagram}
          />
        </div>

        {/* Chat Panel */}
        <div className={`${isChatOpen ? 'w-1/3' : 'w-0'} transition-all duration-300 border-l border-gray-200`}>
          {isChatOpen && (
            <TutorChat
              ref={tutorChatRef}
              question={selectedQuestion}
              userCode={userCode}
              userPseudoCode={userPseudoCode}
              userDiagram={userDiagram}
              onQuestionGenerated={handleQuestionGenerated}
            />
          )}
        </div>
      </div>
    </div>
  );
} 
