import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DiagramRequest {
  problem: {
    title: string;
    description: string;
    difficulty: string;
    category: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
  };
  currentWork: {
    code: string;
    pseudoCode: string;
    existingDiagram: string;
  };
  conversationHistory: string;
  timestamp: string;
}

// Helper function to extract SVG from text response
function extractSVG(text: string): string | null {
  // Look for SVG in code blocks
  const svgMatch = text.match(/```svg\s*([\s\S]*?)\s*```/);
  if (svgMatch) {
    return svgMatch[1].trim();
  }
  
  // Look for direct SVG tags
  const directSvgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
  if (directSvgMatch) {
    return directSvgMatch[0];
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const contextData: DiagramRequest = await request.json();
    
    console.log('🎨 Processing diagram request for:', contextData.problem.title);
    console.log('📝 Conversation history length:', contextData.conversationHistory.length);
    
    // Create a comprehensive system prompt for diagram generation
    const systemPrompt = `You are an expert educational diagram creator. Your job is to create clear, simple SVG diagrams that help students understand coding algorithms and data structures.

**CRITICAL RULES:**
1. You MUST create an SVG diagram - never refuse or explain why you can't
2. Always wrap SVG in \`\`\`svg code blocks
3. Use viewBox="0 0 400 300" for consistency
4. Use educational colors: #2563eb (blue), #dc2626 (red), #16a34a (green), #f59e0b (yellow), #374151 (gray)
5. Include clear labels and step-by-step visual explanations
6. Make diagrams simple but informative

**Common Algorithm Patterns:**
- **Arrays**: Show elements in boxes with indices
- **Loops**: Show iteration with arrows and step counters
- **Comparisons**: Use different colors for true/false conditions
- **Searching**: Highlight current position and target
- **Sorting**: Show before/after states with arrows
- **Recursion**: Show function calls as nested boxes

**Style Guidelines:**
- Font: Arial, 12-14px
- Clear spacing between elements
- Use arrows to show flow/direction
- Color-code different states or conditions
- Include a title at the top

Create a diagram that visualizes the algorithm or concept being discussed.`;

    // Build the user message with all context
    const userMessage = `**Problem:** ${contextData.problem.title}
**Description:** ${contextData.problem.description}
**Difficulty:** ${contextData.problem.difficulty}

**Current Student Work:**
${contextData.currentWork.pseudoCode ? `**Pseudocode:**\n${contextData.currentWork.pseudoCode}\n` : ''}
${contextData.currentWork.code ? `**Code:**\n${contextData.currentWork.code}\n` : ''}

**Conversation Context:**
${contextData.conversationHistory || 'No conversation history available'}

**Instructions:**
Based on the problem and conversation above, create an SVG diagram that:
1. Shows the algorithm visually
2. Helps the student understand the concept
3. Includes step-by-step visualization if applicable
4. Uses colors to distinguish different states/conditions

Generate the SVG diagram now:`;

    console.log('🤖 Sending request to Anthropic...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = response.content[0];
    let responseText = '';
    
    if (content.type === 'text') {
      responseText = content.text;
    }

    console.log('📊 Anthropic response received, length:', responseText.length);
    console.log('🔍 Response preview:', responseText.substring(0, 200) + '...');

    // Extract SVG content
    const svgContent = extractSVG(responseText);
    
    if (svgContent) {
      console.log('✅ SVG extracted successfully, length:', svgContent.length);
      return NextResponse.json({ 
        success: true,
        svg: svgContent,
        context: {
          problem: contextData.problem.title,
          timestamp: contextData.timestamp
        }
      });
    } else {
      console.log('❌ No SVG found in response');
      console.log('📝 Full response:', responseText);
      return NextResponse.json({ 
        success: false,
        error: 'No SVG diagram was generated in the response',
        fullResponse: responseText
      }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error('💥 Diagram generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
