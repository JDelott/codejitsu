'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types/question';

interface Message {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  question?: Question;
}

interface TutorChatProps {
  question?: Question | null;
  userCode?: string;
  onQuestionGenerated?: (question: Question) => void;
  onSubmissionStateChange?: (isSubmitting: boolean) => void;
}

export const TutorChat = forwardRef<{ submitCode: (code: string) => void }, TutorChatProps>(({ 
  question, 
  userCode, 
  onQuestionGenerated,
  onSubmissionStateChange
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    submitCode: (code: string) => {
      handleCodeSubmission(code);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    onSubmissionStateChange?.(isLoading);
  }, [isLoading, onSubmissionStateChange]);

  const addMessage = (type: 'user' | 'tutor', content: string, questionData?: Question) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      question: questionData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCodeSubmission = async (code: string) => {
    addMessage('user', `Please review my code:\n\n\`\`\`python\n${code}\n\`\`\``);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: code,
        difficulty: question.difficulty,
        category: question.category
      } : null;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Please review and provide feedback on my code solution for the problem "${question?.title}". Here's my code:\n\n${code}`,
          context,
          mode: 'review'
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('tutor', data.data);
      } else {
        addMessage('tutor', 'Sorry, I encountered an error reviewing your code. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting code to tutor:', error);
      addMessage('tutor', 'Sorry, I encountered an error reviewing your code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string, mode: string = 'hint') => {
    if (!message.trim()) return;

    addMessage('user', message);
    setIsLoading(true);

    try {
      const context = question ? {
        title: question.title,
        description: question.description,
        userCode: userCode || 'No code written yet',
        difficulty: question.difficulty,
        category: question.category
      } : null;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          mode
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('tutor', data.data);
      } else {
        addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message to tutor:', error);
      addMessage('tutor', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const generateQuestion = async (prompt: string) => {
    setIsGenerating(true);
    addMessage('user', `Generate a question: ${prompt}`);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          context: null,
          mode: 'generate'
        }),
      });

      const data = await response.json();

      if (data.success && !data.isText) {
        const generatedQuestion: Question = {
          id: Date.now(), // Temporary ID
          ...data.data
        };
        
        const problemContent = `🎯 **${generatedQuestion.title}** (${generatedQuestion.difficulty})

**Category:** ${generatedQuestion.category}

**Description:**
${generatedQuestion.description}

**Examples:**
${generatedQuestion.examples.map((ex, i) => `
Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
Explanation: ${ex.explanation}`).join('\n')}

**Constraints:**
${generatedQuestion.constraints.map(c => `• ${c}`).join('\n')}

**Hints:**
${generatedQuestion.hints?.map((hint, i) => `${i + 1}. ${hint}`).join('\n') || 'No hints provided.'}`;

        addMessage('tutor', problemContent, generatedQuestion);
      } else {
        addMessage('tutor', data.data);
      }
    } catch (error) {
      console.error('Error generating question:', error);
      addMessage('tutor', 'Sorry, I encountered an error generating the question.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyQuestionToEditor = (questionData: Question) => {
    onQuestionGenerated?.(questionData);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHint = () => {
    if (question) {
      sendMessage(`Can you give me a hint for the problem "${question.title}"? I'm working on a ${question.difficulty} ${question.category} problem.`, 'hint');
    }
  };

  const requestSolution = () => {
    if (question) {
      sendMessage(`Please provide the complete solution with detailed explanation for the problem "${question.title}".`, 'solution');
    }
  };

  const problemGenerators = [
    {
      label: "Array Problem",
      prompt: "Generate a medium-difficulty array manipulation problem similar to Two Sum or Maximum Subarray. Include multiple test cases and focus on time/space complexity optimization.",
      difficulty: "Medium"
    },
    {
      label: "Tree Problem", 
      prompt: "Generate an easy-to-medium binary tree problem involving traversal, searching, or tree modification. Include examples with different tree structures.",
      difficulty: "Easy-Medium"
    },
    {
      label: "Dynamic Programming",
      prompt: "Generate a medium-difficulty dynamic programming problem with overlapping subproblems. Include examples showing the optimal substructure property.",
      difficulty: "Medium"
    },
    {
      label: "Stack Problem",
      prompt: "Generate an easy-to-medium stack-based problem like parentheses matching or expression evaluation. Include edge cases and examples.",
      difficulty: "Easy-Medium"
    },
    {
      label: "Linked List Problem",
      prompt: "Generate a medium-difficulty linked list problem involving manipulation like reversal, cycle detection, or merging. Include visualization examples.",
      difficulty: "Medium"
    },
    {
      label: "String Problem",
      prompt: "Generate a medium-difficulty string manipulation problem involving pattern matching, substring operations, or string transformations.",
      difficulty: "Medium"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.15em] text-gray-500 uppercase">
          AI Tutor
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Get code feedback, hints, and generate coding problems
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          {/* Problem Generation */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Generate Problems</h3>
            <div className="grid grid-cols-2 gap-2">
              {problemGenerators.map((gen, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => generateQuestion(gen.prompt)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {gen.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Current Problem Actions */}
          {question && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Problem</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getHint}
                  disabled={isLoading}
                  className="text-xs"
                >
                  💡 Get Hint
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestSolution}
                  disabled={isLoading}
                  className="text-xs"
                >
                  ✅ Show Solution
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">👋 Hi! I&apos;m your AI coding tutor.</p>
            <p className="text-sm mb-4">I can help you with:</p>
            <ul className="text-sm space-y-1 text-left max-w-xs mx-auto">
              <li>• Generate coding problems by type</li>
              <li>• Review and debug your code</li>
              <li>• Provide hints and explanations</li>
              <li>• Show complete solutions</li>
            </ul>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {message.question && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(message.question.difficulty)}`}>
                      {message.question.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {message.question.category}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applyQuestionToEditor(message.question!)}
                    className="mt-2 w-full"
                  >
                     Apply to Editor
                  </Button>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {(isLoading || isGenerating) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about coding..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
});

TutorChat.displayName = 'TutorChat'; 
