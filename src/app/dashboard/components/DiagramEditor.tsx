'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DiagramEditorProps {
  onDiagramChange?: (diagramData: string) => void;
  resetTrigger?: number;
  aiGeneratedDiagram?: string; // New prop for AI-generated diagrams
}

type DrawingMode = 'draw' | 'text' | 'svg' | 'ai'; // Add 'ai' mode

export const DiagramEditor: React.FC<DiagramEditorProps> = ({ 
  onDiagramChange,
  resetTrigger,
  aiGeneratedDiagram
}) => {
  const [mode, setMode] = useState<DrawingMode>('draw');
  const [textContent, setTextContent] = useState('');
  const [svgContent, setSvgContent] = useState('<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n  <!-- Your SVG content here -->\n  <rect x="50" y="50" width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>\n  <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">Example</text>\n</svg>');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDiagramCollapsed, setIsDiagramCollapsed] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = 320;
    canvas.height = 200;

    // Configure drawing context
    context.lineCap = 'round';
    context.strokeStyle = '#374151';
    context.lineWidth = 2;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;
  }, []);

  // Convert canvas to base64
  const getCanvasDataURL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  }, []);

  // Notify parent of diagram changes
  useEffect(() => {
    if (mode === 'draw') {
      const dataURL = getCanvasDataURL();
      if (dataURL) {
        onDiagramChange?.(dataURL);
      }
    } else if (mode === 'text') {
      // For text mode, encode text as base64
      const textData = `data:text/plain;base64,${btoa(textContent)}`;
      onDiagramChange?.(textData);
    } else if (mode === 'svg') {
      // For SVG mode, encode SVG as base64
      const svgData = `data:image/svg+xml;base64,${btoa(svgContent)}`;
      onDiagramChange?.(svgData);
    }
  }, [mode, textContent, svgContent, getCanvasDataURL, onDiagramChange]);

  // Switch to AI mode when AI diagram is generated
  useEffect(() => {
    if (aiGeneratedDiagram && aiGeneratedDiagram.trim()) {
      setMode('ai');
    }
  }, [aiGeneratedDiagram]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Notify parent of cleared canvas
    const dataURL = getCanvasDataURL();
    if (dataURL) {
      onDiagramChange?.(dataURL);
    }
  }, [getCanvasDataURL, onDiagramChange]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      clearCanvas();
      setTextContent('');
      setSvgContent('<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n  <!-- Your SVG content here -->\n  <rect x="50" y="50" width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>\n  <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">Example</text>\n</svg>');
    }
  }, [resetTrigger, clearCanvas]);

  // Helper function to get scaled mouse coordinates
  const getScaledCoordinates = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    return { x, y };
  }, []);

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getScaledCoordinates(event);

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  }, [mode, getScaledCoordinates]);

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'draw') return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const { x, y } = getScaledCoordinates(event);

    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, mode, getScaledCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    const context = contextRef.current;
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
    
    // Notify parent of updated drawing
    const dataURL = getCanvasDataURL();
    if (dataURL) {
      onDiagramChange?.(dataURL);
    }
  }, [isDrawing, getCanvasDataURL, onDiagramChange]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(event.target.value);
  };

  const handleSvgChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgContent(event.target.value);
  };

  const handleClearAll = () => {
    if (mode === 'draw') {
      clearCanvas();
    } else if (mode === 'text') {
      setTextContent('');
    } else if (mode === 'svg') {
      setSvgContent('<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n  <!-- Your SVG content here -->\n  <rect x="50" y="50" width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>\n  <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">Example</text>\n</svg>');
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDiagramCollapsed(!isDiagramCollapsed)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title={isDiagramCollapsed ? 'Expand diagram' : 'Collapse diagram'}
          >
            {isDiagramCollapsed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
          <h3 className="text-md font-semibold text-gray-900">Diagram</h3>
        </div>
        <div className="text-xs text-gray-500">
          {mode === 'ai' ? 'AI-generated diagram' : 'Visualize your solution'}
        </div>
      </div>

      {!isDiagramCollapsed && (
        <div className="space-y-3">
          {/* Mode selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('draw')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                mode === 'draw'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Draw
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                mode === 'text'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setMode('svg')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                mode === 'svg'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎨 SVG
            </button>
            {aiGeneratedDiagram && (
              <button
                onClick={() => setMode('ai')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🤖 AI
              </button>
            )}
          </div>

          {/* Content area */}
          {mode === 'draw' ? (
            <div className="space-y-2">
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border rounded"
                  style={{ 
                    width: '100%', 
                    height: '160px',
                    cursor: 'crosshair'
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Click and drag to draw
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : mode === 'text' ? (
            <div className="space-y-2">
              <textarea
                value={textContent}
                onChange={handleTextChange}
                className="w-full h-40 p-3 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 shadow-sm bg-purple-50/50"
                placeholder="Type your diagram here...

Examples:
- Flow charts: Start → Process → Decision → End
- Data structures: [1] → [2] → [3] → NULL
- Algorithm steps: 1. Initialize, 2. Loop, 3. Check condition
- Tree structures: 
    Root
   /    \
  Left  Right
- Arrays: [a, b, c, d, e]
- Graphs: A--B--C
          |  |  |
          D--E--F"
                spellCheck={false}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {textContent.split('\n').length} lines • {textContent.length} chars
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : mode === 'svg' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">SVG Code</h4>
                  <textarea
                    value={svgContent}
                    onChange={handleSvgChange}
                    className="w-full h-40 p-3 border border-gray-300 rounded-lg font-[family-name:var(--font-geist-mono)] text-xs resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 shadow-sm bg-purple-50/50"
                    placeholder="Enter SVG code here..."
                    spellCheck={false}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                  <div className="w-full h-40 p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-center">
                    <div 
                      className="max-w-full max-h-full"
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {svgContent.split('\n').length} lines • {svgContent.length} chars
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : mode === 'ai' ? (
            <div className="space-y-2">
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI-Generated Diagram</h4>
                <div className="flex justify-center">
                  <div 
                    className="max-w-full"
                    dangerouslySetInnerHTML={{ __html: aiGeneratedDiagram || '' }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Generated by voice assistant
                </div>
                <button
                  onClick={() => setMode('draw')}
                  className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Switch to manual editing
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
