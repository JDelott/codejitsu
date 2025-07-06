'use client';

import React from 'react';
import { Question } from '@/types/question';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface QuestionSidebarProps {
  questions: Question[];
  categories: string[];
  selectedQuestion: Question;
  selectedCategory: string;
  onQuestionSelect: (question: Question) => void;
  onCategorySelect: (category: string) => void;
}

export const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  categories,
  selectedQuestion,
  selectedCategory,
  onQuestionSelect,
  onCategorySelect
}) => {
  const filteredQuestions = selectedCategory === "All" 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase mb-4">
          Categories
        </h2>
        <div className="space-y-2 mb-6">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onCategorySelect(category)}
              className="w-full justify-start"
            >
              {category}
            </Button>
          ))}
        </div>

        <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase mb-4">
          Questions ({filteredQuestions.length})
        </h2>
        <div className="space-y-3">
          {filteredQuestions.map(question => (
            <Card
              key={question.id}
              onClick={() => onQuestionSelect(question)}
              isSelected={selectedQuestion.id === question.id}
              className="p-4 cursor-pointer"
            >
              <div className="font-medium text-sm mb-2">{question.title}</div>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {question.category}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 
