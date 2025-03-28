import React, { useState, useRef, useEffect, useCallback } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import 'mathquill/build/mathquill.css'; // Import MathQuill CSS
import './MathInput.css'; // Reuse or create a new CSS file

// Ensure MathQuill CSS is added (recommended by react-mathquill)
addStyles();

const MathQuillInput = () => {
  const [latex, setLatex] = useState('');
  const mathFieldRef = useRef(null); // To store the MathQuill instance

  // --- Symbol/Structure Definitions ---
  // Note: 'insert' now often uses LaTeX commands
  // 'type' determines how to insert: 'cmd', 'write', 'keystroke'
  const mathSymbols = [
    // Numbers & Basic Operators (use 'write')
    { display: '7', type: 'write', insert: '7' }, { display: '8', type: 'write', insert: '8' }, { display: '9', type: 'write', insert: '9' }, { display: '/', type: 'cmd', insert: '/' }, // cmd for potential fraction behavior
    { display: '(', type: 'cmd', insert: '(' }, { display: ')', type: 'cmd', insert: ')' },

    { display: '4', type: 'write', insert: '4' }, { display: '5', type: 'write', insert: '5' }, { display: '6', type: 'write', insert: '6' }, { display: '*', type: 'cmd', insert: '*' }, // cmd for times symbol? or use \times
    { display: '^', type: 'cmd', insert: '^' }, // Superscript
    { display: 'π', type: 'cmd', insert: '\\pi' , shortcut: 'Alt+Shift+P' },

    { display: '1', type: 'write', insert: '1' }, { display: '2', type: 'write', insert: '2' }, { display: '3', type: 'write', insert: '3' }, { display: '-', type: 'write', insert: '-' },
    { display: '√', type: 'cmd', insert: '\\sqrt', shortcut: 'Alt+Shift+R' }, // Square root command
    { display: '°', type: 'write', insert: '^{\\circ}'}, // Degree symbol using superscript

    { display: '0', type: 'write', insert: '0' }, { display: '.', type: 'write', insert: '.' }, { display: '=', type: 'write', insert: '=' }, { display: '+', type: 'write', insert: '+' },
    { display: 'frac', type: 'cmd', insert: '\\frac', shortcut: 'Alt+Shift+F' }, // Fraction command
    { display: '≠', type: 'cmd', insert: '\\ne', shortcut: 'Alt+Shift+=' }, // Not equal command

    { display: 'x²', type: 'write', insert: 'x^2', shortcut: 'Alt+Shift+S' }, // shortcut inserts x^2 directly
    { display: '≤', type: 'cmd', insert: '\\le', shortcut: 'Alt+Shift+<' }, // Less than or equal
    { display: '≥', type: 'cmd', insert: '\\ge', shortcut: 'Alt+Shift+>' }, // Greater than or equal
    { display: '<', type: 'write', insert: '<' }, { display: '>', type: 'write', insert: '>' },
    { display: ':', type: 'write', insert: ':' }, // Could represent ratio

    // Greek letters (use 'cmd')
    { display: 'α', type: 'cmd', insert: '\\alpha' }, { display: 'β', type: 'cmd', insert: '\\beta' }, { display: 'θ', type: 'cmd', insert: '\\theta' },

    // Navigation / Control (use 'keystroke')
    { display: '←', type: 'keystroke', insert: 'Left' },
    { display: '→', type: 'keystroke', insert: 'Right' },
    { display: 'Bksp', type: 'keystroke', insert: 'Backspace', style: {gridColumn: 'span 2'} },
    { display: 'Clear', type: 'clear', insert: '', style: {gridColumn: 'span 2'} }, // Custom type for clearing
  ];

  // --- Shortcut Mapping ---
  const shortcutMap = mathSymbols.reduce((acc, symbol) => {
    if (symbol.shortcut) {
      // Store type and insert value for the shortcut action
      acc[symbol.shortcut.toUpperCase()] = { type: symbol.type, insert: symbol.insert };
    }
    return acc;
  }, {});


  // --- Focus & Insertion Logic ---
  const executeMathCommand = useCallback((type, value) => {
    const mq = mathFieldRef.current;
    if (!mq) return;

    mq.focus(); // Ensure the field is focused before acting

    switch (type) {
      case 'cmd':
        mq.cmd(value);
        break;
      case 'write':
        mq.write(value);
        break;
      case 'keystroke':
        mq.keystroke(value);
        break;
      case 'clear':
         setLatex(''); // Directly clear the state
         break;
      default:
        console.warn(`Unknown command type: ${type}`);
    }
    // No need for manual cursor positioning here, MathQuill usually handles it well.
    // Update state if mq.latex() changed indirectly (e.g., via keystroke)
    // This might be slightly delayed compared to direct setLatex, consider if needed
    // setLatex(mq.latex());
  }, []); // No dependencies needed as it only uses refs and state setter


  // --- Event Handlers ---
  const handleButtonClick = (symbol) => {
    executeMathCommand(symbol.type, symbol.insert);
  };

  // Update state and store the MathField instance when it changes
  const handleMathFieldChange = (mathField) => {
    setLatex(mathField.latex());
    mathFieldRef.current = mathField; // Store the instance
  };

  // --- Shortcut Effect Hook ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Build the shortcut string (e.g., "ALT+SHIFT+R")
      let shortcutString = '';
      if (event.altKey) shortcutString += 'ALT+';
      if (event.shiftKey) shortcutString += 'SHIFT+';
      if (event.ctrlKey) shortcutString += 'CTRL+';
      // Check if the key is a character key we might want to use
      // Make sure not to capture simple typing like Alt+Shift for language switching
      if (/^[A-Z0-9=<>/]$/i.test(event.key) || ['<', '>', '='].includes(event.key)) {
         shortcutString += event.key.toUpperCase();
      } else {
        // Don't process shortcuts for keys like 'Shift', 'Alt', 'Control' themselves
         if (!['SHIFT', 'ALT', 'CONTROL', 'OS', 'META'].includes(event.key.toUpperCase())) {
            // console.log("Ignoring key for shortcut:", event.key);
         }
         return; // Ignore if not a typical shortcut key character
      }

      const command = shortcutMap[shortcutString];
      // console.log("Trying shortcut:", shortcutString, "Found:", command); // Debugging

      if (command) {
        event.preventDefault(); // Prevent browser default action
        executeMathCommand(command.type, command.insert);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [executeMathCommand, shortcutMap]); // Depend on the command executor and map


  return (
    <div className="math-keyboard-container">
      <h2>Math Formula Input (Rich Editor)</h2>
      <div className="math-input-field-wrapper">
        <EditableMathField
          latex={latex}
          onChange={handleMathFieldChange}
          // Optionally store the instance on mount too, though onChange is reliable
          // mathquillDidMount={mf => { mathFieldRef.current = mf; }}
          style={{ // Add some basic styling to the field itself
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            fontSize: '1.3em', // Make font larger for math
            minHeight: '50px', // Ensure it has some height
          }}
        />
      </div>
      <div className="virtual-keyboard">
        {mathSymbols.map((symbol, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(symbol)}
            title={symbol.shortcut ? `Shortcut: ${symbol.shortcut}` : ''}
            className="key-button"
            style={symbol.style || {}} // Apply custom styles like grid-column span
          >
            {symbol.display}
          </button>
        ))}
      </div>
      <div className="shortcut-legend">
        <strong>Shortcuts (Windows/Linux):</strong>
        <ul>
          {mathSymbols
            .filter(s => s.shortcut)
            .map(s => <li key={s.shortcut}>{s.display} ({s.insert}): <code>{s.shortcut}</code></li>)
          }
        </ul>
        <small>(Note: Mac users typically use Option instead of Alt)</small>
      </div>
      <div className="output-display">
        <strong>Current LaTeX:</strong>
        <pre><code>{latex}</code></pre>
      </div>
    </div>
  );
};

export default MathQuillInput;