/**
 * Concept Manager Modal
 * 
 * This component creates a modal dialog for the concept manager
 * that can be opened from a settings icon in the main application.
 */

import ConceptManager from './concept-manager.js';

class ConceptModal {
    constructor() {
        this.conceptManager = new ConceptManager();
        this.modal = null;
        this.modalContent = null;
        this.initialized = false;
    }

    /**
     * Initializes the concept manager modal
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load the configuration
            await this.conceptManager.loadConfig();
            
            // Create the modal elements
            this.createModal();
            
            // Add event listeners
            this.addEventListeners();
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing concept modal:', error);
            throw error;
        }
    }

    /**
     * Creates the modal DOM elements
     */
    createModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'concept-modal';
        this.modal.style.display = 'none';
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        this.modal.appendChild(overlay);
        
        // Create modal content
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'modal-content';
        
        // Create modal header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Concept Manager';
        header.appendChild(title);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close');
        header.appendChild(closeButton);
        
        this.modalContent.appendChild(header);
        
        // Create modal body
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        // Create stats section
        const stats = document.createElement('div');
        stats.className = 'concept-stats';
        
        const conceptCountLabel = document.createElement('span');
        conceptCountLabel.textContent = 'Total Concepts: ';
        stats.appendChild(conceptCountLabel);
        
        const conceptCount = document.createElement('span');
        conceptCount.id = 'concept-count';
        conceptCount.textContent = this.conceptManager.getDistinctConcepts().length;
        stats.appendChild(conceptCount);
        
        stats.appendChild(document.createTextNode(' | '));
        
        const expressionCountLabel = document.createElement('span');
        expressionCountLabel.textContent = 'Total Expressions: ';
        stats.appendChild(expressionCountLabel);
        
        const expressionCount = document.createElement('span');
        expressionCount.id = 'expression-count';
        expressionCount.textContent = this.conceptManager.getConceptExpressions().length;
        stats.appendChild(expressionCount);
        
        body.appendChild(stats);
        
        // Create container for concept UI
        const container = document.createElement('div');
        container.id = 'concept-container';
        body.appendChild(container);
        
        this.modalContent.appendChild(body);
        
        // Create modal footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        const closeModalButton = document.createElement('button');
        closeModalButton.className = 'modal-button';
        closeModalButton.textContent = 'Close';
        footer.appendChild(closeModalButton);
        
        this.modalContent.appendChild(footer);
        
        // Add modal content to modal
        this.modal.appendChild(this.modalContent);
        
        // Add modal to document
        document.body.appendChild(this.modal);
        
        // Initialize the concept UI
        this.conceptManager.createConceptUI('concept-container');
    }

    /**
     * Adds event listeners to modal elements
     */
    addEventListeners() {
        // Close button event listener
        const closeButton = this.modal.querySelector('.modal-close');
        closeButton.addEventListener('click', () => this.close());
        
        // Close modal button event listener
        const closeModalButton = this.modal.querySelector('.modal-button');
        closeModalButton.addEventListener('click', () => this.close());
        
        // Close on overlay click
        const overlay = this.modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                this.close();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    /**
     * Opens the modal
     */
    open() {
        if (!this.initialized) {
            console.error('Concept modal not initialized. Call initialize() first.');
            return;
        }
        
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling of background
    }

    /**
     * Closes the modal
     */
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        
        // Refresh the advisor to reflect any concept changes
        this.refreshAdvisor();
    }

    /**
     * Refreshes the advisor to reflect concept changes
     */
    refreshAdvisor() {
        // Refresh the advisor if the initializeAdvisor function is available
        if (window.initializeAdvisor) {
            window.initializeAdvisor();
        }
    }

    /**
     * Checks if the modal is open
     * @returns {boolean} - Whether the modal is open
     */
    isOpen() {
        return this.modal && this.modal.style.display === 'block';
    }

    /**
     * Creates a settings icon that opens the concept manager modal
     * @param {string} containerId - The ID of the container element for the settings icon
     */
    createSettingsIcon(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container element with ID "${containerId}" not found.`);
            return;
        }
        
        // Create settings icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'settings-icon-container';
        
        // Create settings icon
        const icon = document.createElement('button');
        icon.className = 'settings-icon';
        icon.setAttribute('aria-label', 'Open Concept Manager');
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/></svg>';
        
        // Add click event listener
        icon.addEventListener('click', async () => {
            if (!this.initialized) {
                try {
                    await this.initialize();
                } catch (error) {
                    console.error('Failed to initialize concept modal:', error);
                    return;
                }
            }
            
            this.open();
        });
        
        iconContainer.appendChild(icon);
        container.appendChild(iconContainer);
    }
}

// Export the ConceptModal class
export default ConceptModal; 