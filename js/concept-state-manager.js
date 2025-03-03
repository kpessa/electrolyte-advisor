/**
 * ConceptStateManager
 * 
 * A global state manager for concepts that tracks both values and states.
 * Each concept can have:
 * - value: The actual value of the concept (any type)
 * - state: A state indicator (true, false, or undefined)
 */
class ConceptStateManager {
    constructor() {
        // Initialize the concept state store
        this.conceptStates = {};
        
        // Event listeners for state changes
        this.listeners = [];
        
        console.log('ConceptStateManager initialized');
    }
    
    /**
     * Set a concept's value and state
     * @param {string} conceptName - The name of the concept
     * @param {any} value - The value to set
     * @param {boolean|undefined} state - The state (true, false, or undefined)
     */
    setConceptState(conceptName, value, state) {
        // If state is not provided, determine it based on the value
        if (state === undefined) {
            if (value === true) {
                state = true;
            } else if (value === false) {
                state = false;
            } else if (value === undefined || value === null) {
                state = undefined;
            } else {
                // For non-boolean values, state is true if value exists
                state = value !== undefined && value !== null;
            }
        }
        
        // Store the concept state
        this.conceptStates[conceptName] = {
            value: value,
            state: state
        };
        
        console.log(`Set concept state: ${conceptName} = ${value} (state: ${state})`);
        
        // Notify listeners
        this.notifyListeners(conceptName, value, state);
    }
    
    /**
     * Get a concept's state
     * @param {string} conceptName - The name of the concept
     * @returns {boolean|undefined} - The state (true, false, or undefined)
     */
    getConceptState(conceptName) {
        if (!this.conceptStates[conceptName]) {
            return undefined;
        }
        
        return this.conceptStates[conceptName].state;
    }
    
    /**
     * Get a concept's value
     * @param {string} conceptName - The name of the concept
     * @returns {any} - The value
     */
    getConceptValue(conceptName) {
        if (!this.conceptStates[conceptName]) {
            return undefined;
        }
        
        return this.conceptStates[conceptName].value;
    }
    
    /**
     * Get a concept's full state object
     * @param {string} conceptName - The name of the concept
     * @returns {Object|undefined} - The state object with value and state properties
     */
    getConcept(conceptName) {
        return this.conceptStates[conceptName];
    }
    
    /**
     * Reset a concept to undefined state
     * @param {string} conceptName - The name of the concept
     */
    resetConcept(conceptName) {
        this.setConceptState(conceptName, undefined, undefined);
    }
    
    /**
     * Get all concept names
     * @returns {string[]} - Array of concept names
     */
    getAllConceptNames() {
        return Object.keys(this.conceptStates);
    }
    
    /**
     * Get all concepts with their states
     * @returns {Object} - Object with concept names as keys and state objects as values
     */
    getAllConcepts() {
        return { ...this.conceptStates };
    }
    
    /**
     * Add a listener for state changes
     * @param {Function} listener - Callback function(conceptName, value, state)
     * @returns {number} - Listener ID for removal
     */
    addListener(listener) {
        this.listeners.push(listener);
        return this.listeners.length - 1;
    }
    
    /**
     * Remove a listener
     * @param {number} listenerId - The ID of the listener to remove
     */
    removeListener(listenerId) {
        if (listenerId >= 0 && listenerId < this.listeners.length) {
            this.listeners[listenerId] = null;
        }
    }
    
    /**
     * Notify all listeners of a state change
     * @param {string} conceptName - The name of the concept
     * @param {any} value - The new value
     * @param {boolean|undefined} state - The new state
     */
    notifyListeners(conceptName, value, state) {
        this.listeners.forEach(listener => {
            if (listener) {
                try {
                    listener(conceptName, value, state);
                } catch (error) {
                    console.error('Error in concept state listener:', error);
                }
            }
        });
    }
    
    /**
     * Import concept states from a test case
     * @param {Object} testCase - The test case object with concepts
     */
    importFromTestCase(testCase) {
        if (!testCase || !testCase.concepts) {
            return;
        }
        
        Object.keys(testCase.concepts).forEach(conceptName => {
            const concept = testCase.concepts[conceptName];
            this.setConceptState(conceptName, concept.value);
        });
        
        console.log(`Imported ${Object.keys(testCase.concepts).length} concepts from test case`);
    }
    
    /**
     * Export concept states to a format suitable for a test case
     * @returns {Array} - Array of objects with name and value properties
     */
    exportForTestCase() {
        const concepts = [];
        
        Object.keys(this.conceptStates).forEach(conceptName => {
            const conceptState = this.conceptStates[conceptName];
            
            // Only include concepts with non-undefined values
            if (conceptState.value !== undefined) {
                concepts.push({
                    name: conceptName,
                    value: conceptState.value
                });
            }
        });
        
        return concepts;
    }
    
    /**
     * Clear all concept states
     */
    clearAll() {
        this.conceptStates = {};
        console.log('All concept states cleared');
        
        // Notify listeners of the clear event
        this.notifyListeners('__clear__', undefined, undefined);
    }
}

// Create and export a singleton instance
const conceptStateManager = new ConceptStateManager();
export default conceptStateManager; 