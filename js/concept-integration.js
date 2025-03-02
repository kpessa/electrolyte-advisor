/**
 * Concept Manager Integration
 * 
 * This file handles the integration of the concept manager into the Electrolyte Advisor
 * without replacing the existing application code.
 */

import ConceptModal from './concept-modal.js';

// Create a class to handle the concept manager integration
class ConceptIntegration {
    constructor() {
        this.conceptModal = new ConceptModal();
        this.initialized = false;
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
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing concept integration:', error);
            throw error;
        }
    }

    /**
     * Adds the settings icon to the specified container
     * @param {string} containerId - The ID of the container element for the settings icon
     */
    addSettingsIcon(containerId) {
        this.conceptModal.createSettingsIcon(containerId);
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