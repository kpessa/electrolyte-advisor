/**
 * Concept Manager Integration
 * 
 * This file handles the integration of the concept manager into the Electrolyte Advisor
 * without replacing the existing application code.
 */

import ConceptModal from './concept-modal.js';
import testPatientUI from './test-patient-ui.js';
import navbar from './navbar.js';

// Create a class to handle the concept manager integration
class ConceptIntegration {
    constructor() {
        this.conceptModal = new ConceptModal();
        this.initialized = false;
        this.debugMode = false;
    }

    /**
     * Initializes the concept manager integration
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize the concept modal
            await this.conceptModal.initialize();
            
            // Initialize the test patient UI
            await testPatientUI.initialize(this.conceptModal.conceptManager);
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing concept integration:', error);
            throw error;
        }
    }

    /**
     * Adds the navbar to the application
     * @param {string} containerId - The ID of the container element (not used for navbar, but kept for compatibility)
     */
    addSettingsIcon(containerId) {
        // Initialize the navbar with required components
        navbar.initialize(
            this.conceptModal,
            testPatientUI,
            this.toggleDebugMode.bind(this),
            this.debugMode
        );
        
        // For backward compatibility, we'll keep these methods but they won't create visible elements
        // due to the CSS hiding the original containers
        this.conceptModal.createSettingsIcon(containerId);
        this.createDebugButton(containerId);
        testPatientUI.createTestPatientIcon(containerId);
    }

    /**
     * Creates a debug button that toggles debug mode
     * @param {string} containerId - The ID of the container element for the debug button
     */
    createDebugButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container element with ID "${containerId}" not found.`);
            return;
        }
        
        // Create debug button container
        const debugContainer = document.createElement('div');
        debugContainer.className = 'debug-icon-container';
        
        // Create debug button
        const debugButton = document.createElement('button');
        debugButton.className = 'debug-icon';
        debugButton.setAttribute('aria-label', 'Toggle Debug Mode');
        debugButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" fill="currentColor"/></svg>';
        
        // Add active class if debug mode is enabled
        if (this.debugMode) {
            debugButton.classList.add('active');
        }
        
        // Add click event listener
        debugButton.addEventListener('click', () => {
            this.toggleDebugMode();
            
            // Toggle active class
            debugButton.classList.toggle('active');
            
            // Refresh the advisor to show debug information
            if (window.initializeAdvisor) {
                window.initializeAdvisor();
            }
        });
        
        debugContainer.appendChild(debugButton);
        container.appendChild(debugContainer);
    }

    /**
     * Toggles debug mode on/off
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        // Update the navbar debug button
        navbar.updateDebugButton(this.debugMode);
        
        // Dispatch an event to notify the application of the debug mode change
        const event = new CustomEvent('debugModeChanged', { 
            detail: { debugMode: this.debugMode } 
        });
        document.dispatchEvent(event);
        
        console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
        
        // Refresh the advisor to show debug information
        if (window.initializeAdvisor) {
            window.initializeAdvisor();
        }
    }

    /**
     * Checks if debug mode is enabled
     * @returns {boolean} - Whether debug mode is enabled
     */
    isDebugModeEnabled() {
        return this.debugMode;
    }

    /**
     * Evaluates a concept expression
     * @param {string} expression - The concept expression to evaluate
     * @returns {boolean} - Result of the evaluation
     */
    evaluateConceptExpression(expression) {
        if (this.initialized && this.conceptModal && this.conceptModal.conceptManager) {
            return this.conceptModal.conceptManager.evaluateExpression(expression);
        }
        
        // Default to false if not initialized or no concept manager
        return false;
    }

    /**
     * Opens the concept manager modal
     * @returns {Promise} - Promise that resolves when the modal is opened
     */
    async openConceptManager() {
        if (!this.initialized) {
            await this.initialize();
        }
        this.conceptModal.open();
    }
}

// Create and export a singleton instance
const conceptIntegration = new ConceptIntegration();
export default conceptIntegration;

// Also make it available globally for testing
window.conceptIntegration = conceptIntegration; 