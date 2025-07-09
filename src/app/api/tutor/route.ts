import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract JSON from text response
function extractJSON(text: string): Record<string, unknown> | null {
  // Try to parse the entire text as JSON first
  try {
    return JSON.parse(text);
  } catch {
    // If that fails, try to find JSON in code blocks
    const jsonBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1]);
      } catch {
        // If code block parsing fails, continue to next method
      }
    }
    
    // Try to find JSON object in the text (look for { ... })
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

export async function POST(request: NextRequest) {
  try {
    const { message, context, mode } = await request.json();

    let systemPrompt = '';
    
    switch (mode) {
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
        }`;
        break;
        
      case 'problem_discussion':
        systemPrompt = `You are a concise coding tutor helping users quickly find coding problems to practice.

        IMPORTANT RULES:
        1. Be extremely concise - maximum 2-3 short sentences
        2. Ask 1-2 specific questions to understand what they want to practice
        3. After 1-2 exchanges, suggest a SPECIFIC problem with title, difficulty, and brief description
        4. Always end your problem suggestion with: "Should I create this problem for you?"
        5. NO long explanations - get to the point quickly
        
        Current problem context: ${context ? JSON.stringify(context) : 'No context provided'}`;
        break;
        
      case 'hint':
        systemPrompt = `You are a coding tutor. The user is working on a coding problem and needs guidance. 
        Provide helpful hints and ask guiding questions without giving away the complete solution. 
        Be encouraging and educational. If they're stuck, guide them towards the right approach gradually.
        
        Current problem context: ${context ? JSON.stringify(context) : 'No context provided'}`;
        break;
        
      case 'review':
        systemPrompt = `You are a coding tutor reviewing the user's code. 
        Provide constructive feedback on their solution. Point out:
        - Correctness issues
        - Time/space complexity
        - Code quality and style
        - Alternative approaches
        
        Be encouraging and educational. Don't just say what's wrong, explain why and how to improve.
        
        Current problem context: ${context ? JSON.stringify(context) : 'No context provided'}`;
        break;
        
      case 'solution':
        systemPrompt = `You are a coding tutor. The user has requested the solution to their problem.
        Provide a complete, well-explained solution with:
        - Clean, readable code
        - Step-by-step explanation
        - Time and space complexity analysis
        - Why this approach works
        
        Current problem context: ${context ? JSON.stringify(context) : 'No context provided'}`;
        break;
        
      default:
        systemPrompt = `You are a helpful coding tutor. Assist the user with their coding questions while being encouraging and educational.`;
    }

    const response = await anthropic.messages.create({
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

    const content = response.content[0];
    let responseText = '';
    
    if (content.type === 'text') {
      responseText = content.text;
    }

    // For generate mode, extract and parse JSON
    if (mode === 'generate') {
      const parsedResponse = extractJSON(responseText);
      
      if (parsedResponse) {
        return NextResponse.json({ 
          success: true, 
          data: parsedResponse,
          raw: responseText 
        });
      } else {
        // If JSON extraction fails, return as text with error flag
        return NextResponse.json({ 
          success: true, 
          data: responseText,
          raw: responseText,
          isText: true,
          error: 'Failed to parse JSON from response'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: responseText 
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get response from Claude' },
      { status: 500 }
    );
  }
}
