import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    const { conversationContext, diagramRequest, currentProblem } = await request.json();

    console.log('SVG Generation Request:', { diagramRequest, currentProblem });

    // Create a specialized prompt for SVG diagram generation
    const systemPrompt = `You are an expert at creating educational SVG diagrams for coding problems and algorithms.

    CRITICAL: You MUST create an SVG diagram. Do not explain how to create one - CREATE the actual SVG code.

    **SVG Generation Rules:**
    - Always wrap SVG code in \`\`\`svg code blocks
    - Use viewBox="0 0 400 300" for consistent sizing
    - Colors: #2563eb (blue), #dc2626 (red), #16a34a (green), #374151 (gray), #f59e0b (yellow)
    - Font: Arial, sans-serif, 12-14px
    - Clear labels and simple shapes
    - Make it educational and easy to understand

    **Common Algorithm Diagrams:**
    
    **Find Maximum Number:**
    \`\`\`svg
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="20" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">Find Maximum Number</text>
      <rect x="50" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="70" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">3</text>
      <rect x="100" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="120" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">7</text>
      <rect x="150" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="170" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">2</text>
      <rect x="200" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="220" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">9</text>
      <rect x="250" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="270" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">1</text>
      <text x="50" y="110" font-family="Arial" font-size="12" fill="#374151">max = 3 (first element)</text>
      <text x="50" y="130" font-family="Arial" font-size="12" fill="#2563eb">Compare with 7: 7 > 3, so max = 7</text>
      <text x="50" y="150" font-family="Arial" font-size="12" fill="#374151">Compare with 2: 2 < 7, so max = 7</text>
      <text x="50" y="170" font-family="Arial" font-size="12" fill="#2563eb">Compare with 9: 9 > 7, so max = 9</text>
      <text x="50" y="190" font-family="Arial" font-size="12" fill="#374151">Compare with 1: 1 < 9, so max = 9</text>
      <text x="50" y="220" font-family="Arial" font-size="14" fill="#16a34a" font-weight="bold">Result: Maximum is 9</text>
    </svg>
    \`\`\`

    **Array Sum:**
    \`\`\`svg
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="20" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">Array Sum Process</text>
      <rect x="50" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="70" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">1</text>
      <rect x="100" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="120" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">2</text>
      <rect x="150" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="170" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">3</text>
      <rect x="200" y="50" width="40" height="30" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      <text x="220" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">4</text>
      <text x="50" y="110" font-family="Arial" font-size="12" fill="#374151">sum = 0</text>
      <text x="50" y="130" font-family="Arial" font-size="12" fill="#2563eb">+ 1 = 1</text>
      <text x="50" y="150" font-family="Arial" font-size="12" fill="#2563eb">+ 2 = 3</text>
      <text x="50" y="170" font-family="Arial" font-size="12" fill="#2563eb">+ 3 = 6</text>
      <text x="50" y="190" font-family="Arial" font-size="12" fill="#2563eb">+ 4 = 10</text>
      <text x="50" y="220" font-family="Arial" font-size="14" fill="#16a34a" font-weight="bold">Final Sum = 10</text>
    </svg>
    \`\`\`

    Now create an SVG diagram based on the user's request.`;

    // Create the user message based on the context
    const userMessage = `Based on this conversation context:
${conversationContext}

Current problem: ${currentProblem || 'Not specified'}

User is asking for: ${diagramRequest}

Please create an SVG diagram that visualizes this algorithm or concept. Make it educational and clear.`;

    console.log('Sending request to Anthropic for SVG generation...');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
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

    console.log('Anthropic response:', responseText.substring(0, 200) + '...');

    // Extract SVG content
    const svgContent = extractSVG(responseText);
    
    if (svgContent) {
      console.log('SVG extracted successfully');
      return NextResponse.json({ 
        success: true,
        svg: svgContent,
        response: responseText
      });
    } else {
      console.log('No SVG found in response');
      return NextResponse.json({ 
        success: false,
        error: 'No SVG diagram generated',
        response: responseText
      });
    }

  } catch (error: unknown) {
    console.error('SVG Generation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate SVG diagram' },
      { status: 500 }
    );
  }
}
