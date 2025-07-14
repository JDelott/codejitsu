'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DiagramEditorProps {
  onDiagramChange?: (diagramData: string) => void;
  resetTrigger?: number;
  aiGeneratedDiagram?: string;
}

type DrawingMode = 'draw' | 'text' | 'svg' | 'ai';

export const DiagramEditor: React.FC<DiagramEditorProps> = ({ 
  onDiagramChange,
  resetTrigger,
  aiGeneratedDiagram
}) => {
  const [mode, setMode] = useState<DrawingMode>('draw');
  const [textContent, setTextContent] = useState('');
  const [svgContent, setSvgContent] = useState('<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n  <!-- Your SVG content here -->\n  <rect x="50" y="50" width="100" height="60" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>\n  <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#374151">Example</text>\n</svg>');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 800;
    canvas.height = 400;

    context.lineCap = 'round';
    context.strokeStyle = '#374151';
    context.lineWidth = 2;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;
  }, []);

  // Switch to AI mode when AI diagram is generated
  useEffect(() => {
    if (aiGeneratedDiagram && aiGeneratedDiagram.trim()) {
      setMode('ai');
    }
  }, [aiGeneratedDiagram]);

  const getCanvasDataURL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
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

  // Notify parent of diagram changes
  useEffect(() => {
    if (mode === 'draw') {
      const dataURL = getCanvasDataURL();
      if (dataURL) {
        onDiagramChange?.(dataURL);
      }
    } else if (mode === 'text') {
      const textData = `data:text/plain;base64,${btoa(textContent)}`;
      onDiagramChange?.(textData);
    } else if (mode === 'svg') {
      const svgData = `data:image/svg+xml;base64,${btoa(svgContent)}`;
      onDiagramChange?.(svgData);
    }
  }, [mode, textContent, svgContent, getCanvasDataURL, onDiagramChange]);

  // Drawing functions
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
    
    const dataURL = getCanvasDataURL();
    if (dataURL) {
      onDiagramChange?.(dataURL);
    }
  }, [isDrawing, getCanvasDataURL, onDiagramChange]);

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
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMode('draw')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'draw'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>✏️</span>
          <span>Draw</span>
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'text'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>📝</span>
          <span>Text</span>
        </button>
        <button
          onClick={() => setMode('svg')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'svg'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>🎨</span>
          <span>SVG</span>
        </button>
        {aiGeneratedDiagram && (
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'ai'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>🤖</span>
            <span>AI Generated</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {mode === 'draw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Drawing Canvas</h3>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear Canvas
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border rounded bg-white cursor-crosshair w-full"
                style={{ height: '400px' }}
              />
            </div>
            <p className="text-sm text-gray-600">Click and drag to draw</p>
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Text Diagram</h3>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear Text
              </button>
            </div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{textContent.split('\n').length} lines</span>
              <span>{textContent.length} characters</span>
            </div>
          </div>
        )}

        {mode === 'svg' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">SVG Diagram</h3>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reset SVG
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">SVG Code</h4>
                <textarea
                  value={svgContent}
                  onChange={(e) => setSvgContent(e.target.value)}
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter SVG code here..."
                  spellCheck={false}
                />
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Preview</h4>
                <div className="w-full h-80 p-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                  <div 
                    className="max-w-full max-h-full"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'ai' && aiGeneratedDiagram && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI-Generated Diagram</h3>
              <button
                onClick={() => setMode('draw')}
                className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
              >
                Edit Manually
              </button>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div 
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: aiGeneratedDiagram }}
              />
            </div>
            <p className="text-sm text-gray-600">
              This diagram was generated by the AI tutor based on your conversation and code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
