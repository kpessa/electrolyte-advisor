/**
 * Navbar Component
 * 
 * This file handles the creation and management of the top navigation bar
 * with buttons for test patients, debug, and concept manager.
 */

class Navbar {
    constructor() {
        this.navbar = null;
        this.conceptModal = null;
        this.testPatientUI = null;
        this.debugMode = false;
    }

    /**
     * Initializes the navbar with the required dependencies
     * @param {Object} conceptModal - The concept modal instance
     * @param {Object} testPatientUI - The test patient UI instance
     * @param {Function} toggleDebugMode - Function to toggle debug mode
     * @param {Boolean} initialDebugMode - Initial debug mode state
     */
    initialize(conceptModal, testPatientUI, toggleDebugMode, initialDebugMode = false) {
        this.conceptModal = conceptModal;
        this.testPatientUI = testPatientUI;
        this.toggleDebugMode = toggleDebugMode;
        this.debugMode = initialDebugMode;
        
        this.createNavbar();
    }

    /**
     * Creates the navbar and adds it to the document
     */
    createNavbar() {
        // Create navbar element
        this.navbar = document.createElement('div');
        this.navbar.className = 'navbar';
        
        // Create brand/title
        const brand = document.createElement('div');
        brand.className = 'navbar-brand';
        brand.textContent = 'Electrolyte Advisor';
        this.navbar.appendChild(brand);
        
        // Create controls container
        const controls = document.createElement('div');
        controls.className = 'navbar-controls';
        this.navbar.appendChild(controls);
        
        // Add Test Patient button
        const testPatientButton = this.createNavbarButton(
            '👤 Test Patients',
            'Manage test patients',
            () => {
                if (this.testPatientUI) {
                    this.testPatientUI.showTestPatientManager();
                }
            }
        );
        controls.appendChild(testPatientButton);
        
        // Add Debug button
        const debugButton = this.createNavbarButton(
            '🐞 Debug',
            'Toggle debug mode',
            () => {
                if (this.toggleDebugMode) {
                    this.toggleDebugMode();
                    debugButton.classList.toggle('active', !debugButton.classList.contains('active'));
                }
            }
        );
        if (this.debugMode) {
            debugButton.classList.add('active');
        }
        controls.appendChild(debugButton);
        
        // Add Concept Manager button
        const conceptButton = this.createNavbarButton(
            '⚙️ Concepts',
            'Open concept manager',
            () => {
                if (this.conceptModal) {
                    this.conceptModal.open();
                }
            }
        );
        controls.appendChild(conceptButton);
        
        // Add navbar to document
        document.body.insertBefore(this.navbar, document.body.firstChild);
        
        console.log('Navbar created and added to document');
    }

    /**
     * Creates a navbar button
     * @param {String} text - Button text
     * @param {String} title - Button tooltip
     * @param {Function} onClick - Click event handler
     * @returns {HTMLElement} - The created button
     */
    createNavbarButton(text, title, onClick) {
        const button = document.createElement('button');
        button.className = 'navbar-button';
        button.title = title;
        button.innerHTML = text;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    /**
     * Updates the debug button state
     * @param {Boolean} isActive - Whether debug mode is active
     */
    updateDebugButton(isActive) {
        const debugButton = this.navbar.querySelector('.navbar-button[title="Toggle debug mode"]');
        if (debugButton) {
            debugButton.classList.toggle('active', isActive);
        }
    }
}

// Create and export a singleton instance
const navbar = new Navbar();
export default navbar; 