import React, { useState, useEffect, useCallback } from 'react';
import MathQuillInput from './MathQuillInput';
import './MathKeyboardModal.css';

const MAX_HISTORY_SIZE = 15; // Define max number of history items

const MathKeyboardModal = ({ isOpen, onClose, onInsertFormula, initialLatex = '' }) => {
  // State for the *current* editor content within this modal session
  const [currentLatex, setCurrentLatex] = useState(initialLatex);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'history'
  // State for storing history (simple array for this example)
  const [history, setHistory] = useState(() => {
      // Optional: Load initial history from localStorage if desired
      // const savedHistory = localStorage.getItem('mathKeyboardHistory');
      // return savedHistory ? JSON.parse(savedHistory) : [];
      return [];
  });

  // Update internal latex and reset tab if the initialLatex prop changes
  // or when the modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentLatex(initialLatex); // Reset editor content
      setActiveTab('editor'); // Always start on editor tab
    }

    // Add effect for keyboard listener (Esc to close)
    const handleEsc = (event) => {
       if (event.key === 'Escape') {
         onClose();
       }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, initialLatex, onClose]); // Rerun when modal opens or initialLatex changes

  // Save history to localStorage whenever it changes (Optional)
  // useEffect(() => {
  //   localStorage.setItem('mathKeyboardHistory', JSON.stringify(history));
  // }, [history]);


  // --- History Management ---
  const addToHistory = useCallback((latexValue) => {
    if (!latexValue || latexValue.trim() === '') return; // Don't add empty formulas

    setHistory(prevHistory => {
      // Remove existing entry if present (to move it to the top)
      const filteredHistory = prevHistory.filter(item => item !== latexValue);
      // Add the new value to the beginning
      const newHistory = [latexValue, ...filteredHistory];
      // Limit the size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(0, MAX_HISTORY_SIZE);
      }
      return newHistory;
    });
  }, []); // No dependencies needed

  // --- Handlers ---
  const handleInsert = useCallback((latexValue) => {
    addToHistory(latexValue);   // Add to history before closing
    onInsertFormula(latexValue); // Pass the final latex value up
    onClose();                   // Close the modal
  }, [onInsertFormula, onClose, addToHistory]);

  const handleHistoryItemClick = (latexItem) => {
    setCurrentLatex(latexItem); // Load the selected formula into the editor state
    setActiveTab('editor');     // Switch back to the editor tab
  };

  // Prevent clicks inside the modal content from closing the modal (overlay click removed)
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) {
    return null;
  }

  return (
    // --- !!! REMOVED onClick={onClose} from overlay !!! ---
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal-content" onClick={handleContentClick}>
         {/* Modal Header */}
         <div className="modal-header">
            <h4>Math Formula Editor</h4>
            <button className="modal-close-button" onClick={onClose} aria-label="Close">
                ×
            </button>
         </div>

         {/* Modal Tabs */}
         <div className="modal-tabs">
            <button
               className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
               onClick={() => setActiveTab('editor')}
            >
               Editor
            </button>
            <button
               className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
               onClick={() => setActiveTab('history')}
            >
               History ({history.length})
            </button>
         </div>

         {/* Modal Body - Content changes based on tab */}
         <div className="modal-body">
            {activeTab === 'editor' && (
               <MathQuillInput
                  // Use the *internal* state `currentLatex` for the editor
                  initialLatex={currentLatex}
                  onInsert={handleInsert}
                  // Key helps ensure MathQuill resets if `currentLatex` changes
                  // externally (e.g., via history click) before tab switch animation.
                  // Might not be strictly necessary but can help in complex cases.
                  key={currentLatex}
               />
            )}

            {activeTab === 'history' && (
               <div className="history-section">
                  {history.length === 0 ? (
                     <p className="no-history">No formulas saved in history yet.</p>
                  ) : (
                     <ul className="history-list">
                        {history.map((item, index) => (
                           <li
                              key={index} // Using index is okay here if list isn't reordered except at top/bottom
                              className="history-item"
                              onClick={() => handleHistoryItemClick(item)}
                              title="Click to load into editor"
                           >
                              {item}
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            )}
         </div> {/* End modal-body */}
      </div> {/* End modal-content */}
    </div> // End modal-overlay
  );
};

export default MathKeyboardModal;