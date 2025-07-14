'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Question } from '@/types/question';
import { CodeEditor } from './components/CodeEditor';
import { TutorChat } from './components/TutorChat';
import { Button } from '@/components/ui/Button';

type ActiveTab = 'problem' | 'code' | 'diagram';

export default function Dashboard() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('problem');
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
    setActiveTab('problem');
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
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      const chatContext = tutorChatRef.current?.getChatContext() || '';
      
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
        setActiveTab('diagram');
      } else {
        throw new Error(data.error || 'No diagram generated');
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      alert('Failed to generate diagram. Please try again.');
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  const getTabIcon = (tab: ActiveTab) => {
    switch (tab) {
      case 'problem': return '📋';
      case 'code': return '💻';
      case 'diagram': return '🎨';
      default: return '📋';
    }
  };

  const getTabCount = (tab: ActiveTab) => {
    switch (tab) {
      case 'code': return userCode.length > 20 ? '●' : '';
      case 'diagram': return userDiagram || aiGeneratedDiagram ? '●' : '';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="font-[family-name:var(--font-geist-mono)] text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              CODEJITSU
            </Link>
            
            {/* Problem Info */}
            <div className="flex items-center space-x-4">
              {selectedQuestion ? (
                <>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {selectedQuestion.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {selectedQuestion.category}
                  </span>
                </>
              ) : (
                <span className="text-lg text-gray-500">No Problem Selected</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleGenerateDiagram}
                disabled={!selectedQuestion || isGeneratingDiagram}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-300"
              >
                {isGeneratingDiagram ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>🎨 Generate Diagram</>
                )}
              </Button>
              
              <Button 
                onClick={handleReset} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                🔄 Reset
              </Button>

              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isChatOpen 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isChatOpen ? (
                  <>💬 Close Chat</>
                ) : (
                  <>💬 Open Chat</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {(['problem', 'code', 'diagram'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{getTabIcon(tab)}</span>
                <span className="capitalize">{tab}</span>
                {getTabCount(tab) && (
                  <span className="text-blue-500 ml-1">{getTabCount(tab)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with Side Panel */}
      <main className="flex h-[calc(100vh-160px)]">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 py-8 h-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <CodeEditor
                question={selectedQuestion}
                onCodeChange={handleCodeChange}
                onPseudoCodeChange={handlePseudoCodeChange}
                onDiagramChange={handleDiagramChange}
                resetTrigger={resetTrigger}
                aiGeneratedDiagram={aiGeneratedDiagram}
                activeTab={activeTab}
                onQuestionGenerated={handleQuestionGenerated}
              />
            </div>
          </div>
        </div>

        {/* Side Chat Panel */}
        <div className={`${isChatOpen ? 'w-96' : 'w-0'} transition-all duration-300 bg-white border-l border-gray-200 fixed right-0 top-0 h-full z-40 overflow-hidden`}>
          {isChatOpen && (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Get help with your coding problems
                </p>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <TutorChat
                  ref={tutorChatRef}
                  question={selectedQuestion}
                  userCode={userCode}
                  userPseudoCode={userPseudoCode}
                  userDiagram={userDiagram}
                  onQuestionGenerated={handleQuestionGenerated}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
