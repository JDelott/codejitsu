import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract JSON from text response
function extractJSON(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const jsonBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1]);
      } catch {
        // If code block parsing fails, continue to next method
      }
    }
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // If this also fails, return null
      }
    }
    
    return null;
  }
}

// Fallback problem generator when API is overloaded
function generateFallbackProblem(conversationContext: string):unknown {
  // Extract key information from conversation
  const lowerContext = conversationContext.toLowerCase();
  
  let difficulty = 'Medium';
  let category = 'Arrays';
  let title = 'Two Sum';
  let description = 'Given an array of integers and a target sum, find two numbers that add up to the target.';
  let starter = `def two_sum(nums, target):
    """
    Find two numbers in the array that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
    
    Returns:
        List of two indices that add up to target
    """
    # Your code here
    pass`;

  // Simple pattern matching to customize the problem
  if (lowerContext.includes('easy')) {
    difficulty = 'Easy';
    title = 'Find Maximum';
    description = 'Given an array of integers, find the maximum number.';
    starter = `def find_max(nums):
    """
    Find the maximum number in the array.
    
    Args:
        nums: List of integers
    
    Returns:
        The maximum number
    """
    # Your code here
    pass`;
  } else if (lowerContext.includes('hard')) {
    difficulty = 'Hard';
    category = 'Dynamic Programming';
    title = 'Longest Increasing Subsequence';
    description = 'Given an array of integers, find the length of the longest increasing subsequence.';
    starter = `def longest_increasing_subsequence(nums):
    """
    Find the length of the longest increasing subsequence.
    
    Args:
        nums: List of integers
    
    Returns:
        Length of the longest increasing subsequence
    """
    # Your code here
    pass`;
  }

  if (lowerContext.includes('string')) {
    category = 'Strings';
    title = 'Valid Palindrome';
    description = 'Given a string, determine if it is a palindrome.';
    starter = `def is_palindrome(s):
    """
    Check if a string is a palindrome.
    
    Args:
        s: Input string
    
    Returns:
        True if palindrome, False otherwise
    """
    # Your code here
    pass`;
  }

  return {
    title,
    difficulty,
    category,
    description,
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "Only one valid answer exists"
    ],
    starter,
    hints: [
      "Consider using a hash map to store seen numbers",
      "Think about the complement of each number",
      "You can solve this in O(n) time"
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, question, userCode, userPseudoCode, chatHistory, context, mode } = await request.json();

    // Determine the mode based on the message content if not explicitly provided
    let actualMode = mode;
    if (!actualMode) {
      if (message.includes('create a Python coding problem') || message.includes('Based on our conversation')) {
        actualMode = 'generate';
      } else if (message.includes('review this code')) {
        actualMode = 'review';
      } else {
        actualMode = 'problem_discussion';
      }
    }

    // Build context from the provided data
    const contextData = {
      currentQuestion: question,
      userCode,
      userPseudoCode,
      chatHistory: chatHistory || [],
      ...(context || {})
    };

    let systemPrompt = '';
    
    switch (actualMode) {
      case 'generate':
        systemPrompt = `You are a coding interview tutor. Generate a coding problem based on the user's request. 
        
        IMPORTANT: Return ONLY a valid JSON object with no additional text or markdown formatting.
        
        Use this exact structure:
        {
          "title": "Problem Title",
          "difficulty": "Easy" | "Medium" | "Hard",
          "category": "Arrays" | "Stack" | "Trees" | "Linked Lists" | "Dynamic Programming" | "Graphs" | "Strings",
          "description": "Problem description",
          "examples": [
            {
              "input": "example input",
              "output": "example output", 
              "explanation": "explanation of the example"
            }
          ],
          "constraints": ["constraint 1", "constraint 2"],
          "starter": "Python function starter code with docstring",
          "hints": ["hint 1", "hint 2", "hint 3"]
        }
        
        Context: ${JSON.stringify(contextData)}`;
        break;
        
      case 'problem_discussion':
        systemPrompt = `You are a concise coding tutor helping users quickly find coding problems to practice.

        IMPORTANT RULES:
        1. Be extremely concise - maximum 2-3 short sentences
        2. Ask 1-2 specific questions to understand what they want to practice
        3. After 1-2 exchanges, suggest a SPECIFIC problem with title, difficulty, and brief description
        4. Always end your problem suggestion with: "Should I create this problem for you?"
        5. NO long explanations - get to the point quickly
        
        Context: ${JSON.stringify(contextData)}`;
        break;
        
      default:
        systemPrompt = `You are a helpful coding tutor. Assist the user with their coding questions while being encouraging and educational.
        
        Context: ${JSON.stringify(contextData)}`;
    }

    // Add retry logic with exponential backoff
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
        });
        break;
      } catch (error: unknown) {
        console.error(`Claude API Error (attempt ${retryCount + 1}):`, error);
        
        // Type guard to check if error has status property
        if (error && typeof error === 'object' && 'status' in error) {
          const apiError = error as { status: number };
          if (apiError.status === 529 || apiError.status === 503) {
            retryCount++;
            if (retryCount < maxRetries) {
              // Exponential backoff: 3s, 6s, 12s
              await new Promise(resolve => setTimeout(resolve, 3000 * Math.pow(2, retryCount - 1)));
              continue;
            } else {
              // All retries failed, use fallback for generate mode
              if (actualMode === 'generate') {
                console.log('API overloaded, using fallback problem generation');
                const fallbackProblem = generateFallbackProblem(message);
                return NextResponse.json({
                  success: true,
                  response: `I've created a coding problem for you! The AI service is temporarily busy, so I've generated a classic problem.`,
                  question: fallbackProblem,
                  fallback: true
                });
              }
            }
          }
        }
        throw error;
      }
    }

    if (!response) {
      // Final fallback for generate mode
      if (actualMode === 'generate') {
        console.log('No response received, using fallback problem generation');
        const fallbackProblem = generateFallbackProblem(message);
        return NextResponse.json({
          success: true,
          response: `I've created a coding problem for you! The AI service is temporarily busy, so I've generated a classic problem.`,
          question: fallbackProblem,
          fallback: true
        });
      }
      throw new Error('Failed to get response after retries');
    }

    const content = response.content[0];
    let responseText = '';
    
    if (content.type === 'text') {
      responseText = content.text;
    }

    // For generate mode, extract and parse JSON
    if (actualMode === 'generate') {
      const parsedResponse = extractJSON(responseText);
      
      if (parsedResponse) {
        return NextResponse.json({ 
          success: true,
          response: responseText,
          question: parsedResponse
        });
      } else {
        // If JSON extraction fails, use fallback
        console.log('JSON extraction failed, using fallback problem generation');
        const fallbackProblem = generateFallbackProblem(message);
        return NextResponse.json({
          success: true,
          response: `I've created a coding problem for you! Had trouble parsing the AI response, so I've generated a classic problem.`,
          question: fallbackProblem,
          fallback: true
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      response: responseText
    });

  } catch (error: unknown) {
    console.error('Claude API Error:', error);
    
    // Type guard for API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number };
      if (apiError.status === 529) {
        return NextResponse.json(
          { success: false, error: 'AI service is temporarily overloaded. Please try again in a moment.' },
          { status: 503 }
        );
      } else if (apiError.status === 401) {
        return NextResponse.json(
          { success: false, error: 'API authentication failed' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to get response from AI service' },
      { status: 500 }
    );
  }
}
