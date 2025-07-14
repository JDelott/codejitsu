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

// Helper function to extract SVG from text response
function extractSVG(text: string): string | null {
  const svgMatch = text.match(/```svg\s*([\s\S]*?)\s*```/);
  if (svgMatch) {
    return svgMatch[1].trim();
  }
  
  // Also try to find SVG without code blocks
  const directSvgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
  if (directSvgMatch) {
    return directSvgMatch[0];
  }
  
  return null;
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
    const { message, question, userCode, userPseudoCode, userDiagram, chatHistory, context, mode } = await request.json();

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
      userDiagram,
      chatHistory: chatHistory || [],
      ...(context || {})
    };

    // Helper function to describe diagram for AI
    const describeDiagramForAI = (diagramData: string) => {
      if (!diagramData) return '';
      
      if (diagramData.startsWith('data:text/plain;base64,')) {
        // Text diagram
        const textContent = atob(diagramData.split(',')[1]);
        return `User's Diagram (Text Format):
${textContent}

This diagram shows the user's visual approach to solving the problem.`;
      } else if (diagramData.startsWith('data:image/png;base64,')) {
        // Drawing diagram
        return `User's Diagram: The user has created a visual diagram/drawing to help solve the problem. While I cannot see the specific details of the drawing, I should acknowledge that they have created a visual representation and ask them to describe it if needed for better assistance.`;
      }
      return '';
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
        
        Context: ${JSON.stringify(contextData)}
        
        ${userDiagram ? describeDiagramForAI(userDiagram) : ''}`;
        break;
        
      case 'problem_discussion':
        systemPrompt = `You are a concise coding tutor helping users quickly find coding problems to practice.

        IMPORTANT RULES:
        1. Be extremely concise - maximum 2-3 short sentences
        2. Ask 1-2 specific questions to understand what they want to practice
        3. After 1-2 exchanges, suggest a SPECIFIC problem with title, difficulty, and brief description
        4. Always end your problem suggestion with: "Should I create this problem for you?"
        5. NO long explanations - get to the point quickly
        6. If the user has created a diagram, acknowledge it and ask them to describe it if it helps understand their approach
        
        Context: ${JSON.stringify(contextData)}
        
        ${userDiagram ? describeDiagramForAI(userDiagram) : ''}`;
        break;
        
      default:
        systemPrompt = `You are a helpful coding tutor. Assist the user with their coding questions while being encouraging and educational.

        CRITICAL: When users ask for diagrams, visual aids, or want you to "draw", "show", or "diagram" something, you MUST create actual SVG diagrams. Do NOT explain how to create them - CREATE them immediately.

        **ALWAYS create SVG diagrams when user says:**
        - "diagram this"
        - "draw this" 
        - "show me visually"
        - "create a visual aid"
        - "I want you to diagram"
        - Any request for visual representation

        **SVG Creation Rules:**
        - Wrap ALL SVG code in \`\`\`svg code blocks
        - Use viewBox="0 0 400 300" 
        - Colors: #2563eb (blue), #dc2626 (red), #16a34a (green), #374151 (gray)
        - Font: Arial, sans-serif, 12-14px
        - Diamond shapes for decisions, rectangles for actions
        - Clear, simple layouts

        **Example FizzBuzz Flowchart:**
        \`\`\`svg
        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <text x="200" y="20" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">FizzBuzz Decision Flow</text>
          <rect x="150" y="40" width="100" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
          <text x="200" y="60" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">Start (i=1 to n)</text>
          <polygon points="170,90 230,90 250,110 230,130 170,130 150,110" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <text x="200" y="115" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">i % 15 == 0?</text>
          <rect x="280" y="95" width="80" height="30" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
          <text x="320" y="115" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">Print "FizzBuzz"</text>
          <polygon points="170,150 230,150 250,170 230,190 170,190 150,170" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <text x="200" y="175" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">i % 3 == 0?</text>
          <rect x="280" y="155" width="60" height="30" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
          <text x="310" y="175" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">Print "Fizz"</text>
          <polygon points="170,210 230,210 250,230 230,250 170,250 150,230" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <text x="200" y="235" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">i % 5 == 0?</text>
          <rect x="280" y="215" width="60" height="30" fill="#fecaca" stroke="#dc2626" stroke-width="2"/>
          <text x="310" y="235" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">Print "Buzz"</text>
          <rect x="50" y="215" width="60" height="30" fill="#f3f4f6" stroke="#374151" stroke-width="2"/>
          <text x="80" y="235" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">Print i</text>
          <line x1="250" y1="110" x2="280" y2="110" stroke="#374151" stroke-width="1"/>
          <text x="265" y="108" font-family="Arial" font-size="10" fill="#16a34a">Yes</text>
          <line x1="200" y1="130" x2="200" y2="150" stroke="#374151" stroke-width="1"/>
          <text x="205" y="145" font-family="Arial" font-size="10" fill="#dc2626">No</text>
          <line x1="250" y1="170" x2="280" y2="170" stroke="#374151" stroke-width="1"/>
          <text x="265" y="168" font-family="Arial" font-size="10" fill="#2563eb">Yes</text>
          <line x1="200" y1="190" x2="200" y2="210" stroke="#374151" stroke-width="1"/>
          <text x="205" y="205" font-family="Arial" font-size="10" fill="#dc2626">No</text>
          <line x1="250" y1="230" x2="280" y2="230" stroke="#374151" stroke-width="1"/>
          <text x="265" y="228" font-family="Arial" font-size="10" fill="#dc2626">Yes</text>
          <line x1="150" y1="230" x2="110" y2="230" stroke="#374151" stroke-width="1"/>
          <text x="120" y="228" font-family="Arial" font-size="10" fill="#374151">No</text>
        </svg>
        \`\`\`

        Context: ${JSON.stringify(contextData)}
        
        ${userDiagram ? describeDiagramForAI(userDiagram) : ''}`;
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

    // Extract SVG content if present
    const svgContent = extractSVG(responseText);

    return NextResponse.json({ 
      success: true,
      response: responseText,
      svg: svgContent
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
