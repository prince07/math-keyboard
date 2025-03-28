import React, { useState, useRef, useMemo } from 'react';
import MathKeyboardModal from './components/MathKeyboardModal';
import './App.css';

// --- Import KaTeX ---
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { InlineMath, BlockMath } from 'react-katex';

// --- Helper Function to Parse Text for LaTeX ---
// This is a simple parser using regex. It looks for $$...$$ (block) or $...$ (inline).
// It returns an array of objects: { type: 'text' | 'block' | 'inline', content: string }
const parseTextWithLatex = (text) => {
  if (!text) return [];
  // Regex to find $$...$$ or $...$
  // It captures the content inside the delimiters
  const regex = /(\$\$[\s\S]*?\$\$)|(\$[^\$\n]*?\$)/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding text segment
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    // Add the matched LaTeX segment
    if (match[1]) { // Block math $$...$$
      segments.push({ type: 'block', content: match[1].slice(2, -2) }); // Remove $$
    } else if (match[2]) { // Inline math $...$
      segments.push({ type: 'inline', content: match[2].slice(1, -1) }); // Remove $
    }
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return segments;
};


function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answerText, setAnswerText] = useState('Example: The formula is $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$ and some inline math like $E=mc^2$.'); // State for the textarea
  const answerTextAreaRef = useRef(null);

  const openMathKeyboard = () => setIsModalOpen(true);
  const closeMathKeyboard = () => setIsModalOpen(false);

  // --- MODIFIED: Insert Formula with Delimiters ---
  const insertFormula = (latex) => {
    const textarea = answerTextAreaRef.current;
    if (!textarea || !latex) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // --- Wrap inserted LaTeX with $$...$$ for block display ---
    // Add spaces for better separation. Adjust if inline ($...$) is needed by default.
    const textToInsert = ` $$${latex.trim()}$$ `;

    const newValue = text.substring(0, start) + textToInsert + text.substring(end);
    setAnswerText(newValue);

    setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + textToInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // --- Memoize the parsed segments to avoid re-parsing on every render ---
  const renderedSegments = useMemo(() => parseTextWithLatex(answerText), [answerText]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Student Answer Section</h1>
      </header>
      <main>
        <div className="answer-area">
          <label htmlFor="studentAnswer">Type Your Answer (Waht is the area of a circle with radius r=10 ?):</label>
          <div className="input-wrapper"> {/* Wrapper for positioning */}
            <textarea
              id="studentAnswer"
              ref={answerTextAreaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows="8"
              placeholder="Type your answer here. Use $inline math$ or $$display math$$. Click f(x) to insert formulas..."
            />
            <button
              onClick={openMathKeyboard}
              className="open-keyboard-btn"
              title="Open Math Keyboard"
              aria-label="Open Math Keyboard"
            >
              f(x)
            </button>
          </div>

          {/* --- NEW: Rendered Output Display --- */}
          <div className="rendered-answer-display">
            <label>Rendered Preview:</label>
            <div className="rendered-content">
              {renderedSegments.map((segment, index) => {
                if (segment.type === 'block') {
                  // Use BlockMath for $$...$$
                  // Add try-catch for invalid LaTeX
                  try {
                    return <BlockMath key={index} math={segment.content} />;
                  } catch (error) {
                      console.error("KaTeX Error (Block):", error, "Content:", segment.content);
                      return <span key={index} style={{color: 'red', display: 'block'}}> $$[Invalid LaTeX: {segment.content}]$$ </span>;
                  }
                } else if (segment.type === 'inline') {
                  // Use InlineMath for $...$
                   try {
                       return <InlineMath key={index} math={segment.content} />;
                   } catch (error) {
                       console.error("KaTeX Error (Inline):", error, "Content:", segment.content);
                       return <span key={index} style={{color: 'red'}}> $[Invalid LaTeX: {segment.content}]$ </span>;
                   }
                } else {
                  // Render plain text segments, preserve whitespace like newlines
                  return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{segment.content}</span>;
                }
              })}
            </div>
          </div>
          {/* --- End Rendered Output Display --- */}

        </div>

        <MathKeyboardModal
          isOpen={isModalOpen}
          onClose={closeMathKeyboard}
          onInsertFormula={insertFormula}
        />
      </main>
    </div>
  );
}

export default App; 