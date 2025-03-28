import React, { useState, useRef, useEffect, useCallback } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import 'mathquill/build/mathquill.css';
import './MathQuillInput.css';

addStyles();

const getShortcutKeyDisplay = (shortcut) => {
  if (!shortcut) return '';
  const parts = shortcut.split('+');
  return parts[parts.length - 1] || '';
};

const MathQuillInput = ({ initialLatex = '', onInsert }) => {
  const [latex, setLatex] = useState(initialLatex);
  const mathFieldRef = useRef(null); // Ref to MathQuill instance

  // Effect to sync internal state when initialLatex prop changes (e.g., from history)
  useEffect(() => {
    console.log("Effect running: initialLatex =", initialLatex, "current latex =", latex);
    if (initialLatex !== latex) {
      console.log("Prop differs from state, updating state and MathQuill");
      setLatex(initialLatex);
      if (mathFieldRef.current) {
        // Use timeout to ensure DOM is ready if called immediately on mount/prop change
        setTimeout(() => {
            if (mathFieldRef.current) { // Check ref again inside timeout
                 console.log("Setting MathQuill latex via ref:", initialLatex);
                 mathFieldRef.current.latex(initialLatex);
                 // Optionally refocus after setting latex externally
                 // mathFieldRef.current.focus();
            }
        }, 0);
      }
    }
  }, [initialLatex]); // Rerun ONLY when initialLatex prop changes


  // --- Symbol Definitions (Keep as before) ---
  const mathSymbols = [ /* ... Your symbols ... */
    { display: '7', type: 'write', insert: '7' }, { display: '8', type: 'write', insert: '8' }, { display: '9', type: 'write', insert: '9' }, { display: '/', type: 'cmd', insert: '/' },
    { display: '(', type: 'cmd', insert: '(' }, { display: ')', type: 'cmd', insert: ')' },

    { display: '4', type: 'write', insert: '4' }, { display: '5', type: 'write', insert: '5' }, { display: '6', type: 'write', insert: '6' }, { display: '*', type: 'cmd', insert: '\\cdot', shortcut: 'Alt+Shift+8' },
    { display: '^', type: 'cmd', insert: '^', shortcut: 'Alt+Shift+6' },
    { display: 'π', type: 'cmd', insert: '\\pi' , shortcut: 'Alt+Shift+P' },

    { display: '1', type: 'write', insert: '1' }, { display: '2', type: 'write', insert: '2' }, { display: '3', type: 'write', insert: '3' }, { display: '-', type: 'write', insert: '-' },
    { display: '√', type: 'cmd', insert: '\\sqrt', shortcut: 'Alt+Shift+R' },
    { display: '°', type: 'write', insert: '^{\\circ}'},

    { display: '0', type: 'write', insert: '0' }, { display: '.', type: 'write', insert: '.' }, { display: '=', type: 'write', insert: '=' }, { display: '+', type: 'write', insert: '+', shortcut: 'Alt+Shift+='},
    { display: 'frac', type: 'cmd', insert: '\\frac', shortcut: 'Alt+Shift+F' },
    { display: '≠', type: 'cmd', insert: '\\ne' },

    { display: 'x²', type: 'write', insert: 'x^2', shortcut: 'Alt+Shift+S' },
    { display: '≤', type: 'cmd', insert: '\\le', shortcut: 'Alt+Shift+<' },
    { display: '≥', type: 'cmd', insert: '\\ge', shortcut: 'Alt+Shift+>' },
    { display: '<', type: 'write', insert: '<' }, { display: '>', type: 'write', insert: '>' },
    { display: ':', type: 'write', insert: ':' },

    { display: 'α', type: 'cmd', insert: '\\alpha', shortcut: 'Alt+Shift+A' },
    { display: 'β', type: 'cmd', insert: '\\beta', shortcut: 'Alt+Shift+B' },
    { display: 'θ', type: 'cmd', insert: '\\theta', shortcut: 'Alt+Shift+T' },

    { display: '←', type: 'keystroke', insert: 'Left' },
    { display: '→', type: 'keystroke', insert: 'Right' },
    { display: 'Bksp', type: 'keystroke', insert: 'Backspace', style: {gridColumn: 'span 2'} },
    { display: 'Clear', type: 'clear', insert: '', style: {gridColumn: 'span 2'} },
  ];

  // --- Shortcut Map (Keep as before) ---
  const shortcutMap = mathSymbols.reduce((acc, symbol) => { /* ... */
     if (symbol.shortcut) {
      acc[symbol.shortcut.toUpperCase()] = { type: symbol.type, insert: symbol.insert };
    }
    return acc;
  }, {});

  // --- Focus & Insertion Logic (REVISED) ---
  const executeMathCommand = useCallback((type, value) => {
    const mq = mathFieldRef.current;
    if (!mq) {
        console.error("executeMathCommand: MathQuill instance (mathFieldRef.current) not found!");
        return;
    }
    console.log(`Executing command: ${type}, Value: ${value}`);
    mq.focus(); // Ensure field is focused

    try {
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
            // Clear MathQuill directly. If this triggers onChange, great.
            // If not, we might need to manually set state too.
            mq.latex('');
            // Explicitly clear React state as well for 'clear'
            setLatex('');
            break;
          default:
            console.warn(`Unknown command type: ${type}`);
            return; // Don't proceed if type is unknown
        }

        // --- REMOVED the manual setLatex(mq.latex()) here ---
        // Let's rely on the 'onChange' handler to update the state,
        // assuming mq.cmd/write/keystroke trigger it. Add logging in onChange.

    } catch (error) {
        console.error("Error executing MathQuill command:", error);
    }

  }, []); // Dependency array is empty as it only uses refs and args

  // --- Event Handlers ---
  const handleButtonClick = (symbol) => {
    console.log("Button clicked:", symbol.display);
    executeMathCommand(symbol.type, symbol.insert);
  };

  // Called by EditableMathField when its content changes (user typing OR programmatically?)
  const handleMathFieldChange = (mathField) => {
    const newLatex = mathField.latex();
    console.log("onChange detected. New LaTeX:", newLatex);
    // Update the React state. This should trigger re-render if value changed.
    setLatex(newLatex);
    // Keep ref updated (though it should be the same instance)
    mathFieldRef.current = mathField;
  };

  // Called when user clicks "Insert Formula"
  const handleInsertClick = useCallback(() => {
    console.log("Insert clicked. LaTeX to insert:", latex);
    if (onInsert) {
      onInsert(latex);
    }
  }, [latex, onInsert]);

  // --- Shortcut Effect Hook (Keep as before) ---
  useEffect(() => {
     const handleKeyDown = (event) => { /* ... shortcut logic ... */
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? 'OPTION+' : 'ALT+';
        let shortcutString = '';
        if ((event.altKey || event.metaKey) && event.shiftKey) {
            shortcutString += modifier + 'SHIFT+';
        } else { return; }
        if (/^[A-Z0-9=<>+\-*/]$/i.test(event.key)) {
            shortcutString += event.key.toUpperCase();
        } else { return; }
        const lookupKey = `ALT+SHIFT+${event.key.toUpperCase()}`;
        const command = shortcutMap[lookupKey];
        if (command) {
            if (mathFieldRef.current && mathFieldRef.current.el().contains(event.target)) {
                event.preventDefault();
                console.log("Shortcut triggered:", command);
                executeMathCommand(command.type, command.insert);
            }
        }
     };
     document.addEventListener('keydown', handleKeyDown);
     return () => document.removeEventListener('keydown', handleKeyDown);
   }, [executeMathCommand, shortcutMap]); // Added shortcutMap


  console.log("Rendering MathQuillInput. Current latex state:", latex);

  // --- Render Logic ---
  return (
    <div className="math-keyboard-input-content">
      <p className="shortcut-instructions">
         {/* ... kbd tags ... */}
         Use <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>KEY</kbd> (Win/Linux) or <kbd>Option</kbd>+<kbd>Shift</kbd>+<kbd>KEY</kbd> (Mac) for <span className="shortcut-indicator-example">KEY</span> shortcuts.
      </p>
      <div className="math-input-field-wrapper">
        <EditableMathField
          latex={latex} // Controlled by the 'latex' state
          onChange={handleMathFieldChange} // Updates 'latex' state
          mathquillDidMount={(mathField) => {
            console.log("MathQuill DID MOUNT."); // Log mount
            mathFieldRef.current = mathField; // Set the ref
          }}
          style={{
            width: '100%', padding: '10px', border: '1px solid #ccc',
            fontSize: '1.3em', minHeight: '50px',
          }}
        />
      </div>

      <div className="action-button-container">
          <button onClick={handleInsertClick} className="insert-button" disabled={!latex.trim()}>
              Insert Formula
          </button>
      </div>

      <div className="virtual-keyboard">
        {mathSymbols.map((symbol, index) => {
          const shortcutKey = getShortcutKeyDisplay(symbol.shortcut);
          return (
            <button
              key={index}
              onClick={() => handleButtonClick(symbol)} // Pass symbol to handler
              title={symbol.shortcut ? `Shortcut: ${symbol.shortcut.replace('ALT', 'Alt/Option')}` : ''}
              className="key-button"
              style={symbol.style || {}}
            >
              {shortcutKey && (<span className="shortcut-indicator">{shortcutKey}</span>)}
              {symbol.display}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MathQuillInput;